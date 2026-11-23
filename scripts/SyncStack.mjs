/* scripts/SyncStack.mjs - словари и библиотека в соседние проекты стека без выпуска в npm (npm run Sync): копии словарей и заголовков в ProdFactory-STM и ProdFactory-ESP (те же файлы, что кнопки Dict их расширений), собранная библиотека в node_modules DevTerminal и DevCloud для отладочных сборок; проекта рядом нет - пропускается */
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { execSync } from "node:child_process"
import path from "node:path"
import { fileURLToPath } from "node:url"

const LIB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const STACK = path.dirname(LIB)
const DICTIONARIES = path.join(LIB, "src", "lib", "dictionaries")

/* Файл словарей библиотеки -> копия во фреймворке; ESP ещё берёт словарь GUI */
const FIRMWARE = [
  ["poe_cmd.yaml", ".framework/poe_cmd.yaml"],
  ["poe_msg.yaml", ".framework/poe_msg.yaml"],
  ["firmware/poe_cmd.h", "components/core/common/poe_cmd.h"],
  ["firmware/poe_msg.h", "components/core/common/poe_msg.h"],
]
const FRAMEWORKS = {
  "ProdFactory-STM": FIRMWARE,
  "ProdFactory-ESP": [...FIRMWARE, ["poe_gui.yaml", ".framework/poe_gui.yaml"]],
}
/* Приложения на библиотеке: dist кладётся в их node_modules, npm install потом вернёт опубликованную версию */
const APPS = ["DevTerminal", "DevCloud"]

/* Как файл называть человеку: по этим строкам он видит, что именно копируется */
const NAMES = {
  "poe_cmd.yaml": "словарь команд",
  "poe_msg.yaml": "словарь сообщений",
  "poe_gui.yaml": "список компонентов GUI",
  "firmware/poe_cmd.h": "заголовок команд",
  "firmware/poe_msg.h": "заголовок сообщений",
}

const run = (command) => execSync(command, { cwd: LIB, stdio: "inherit" })
/* 1 файл, 2 файла, 5 файлов, 11 файлов */
const plural = (count, forms) => {
  const tail = count % 100
  if (tail >= 11 && tail <= 14) return forms[2]
  const last = count % 10
  if (last === 1) return forms[0]
  if (last >= 2 && last <= 4) return forms[1]
  return forms[2]
}

console.log("Синхронизация стека: словари, заголовки и библиотека из ElementsUI\n")

console.log("Шаг 1. Собираю словари и заголовки из yaml")
try {
  run("npm run Generate")
} catch {
  console.error("\nСборка словарей не прошла. Копии в проектах не тронуты: исправьте ошибку выше и запустите снова.")
  process.exit(1)
}

console.log("\nШаг 2. Кладу копии в проекты фреймворков")
let updated = 0
let same = 0
const missingProjects = []
for (const [project, files] of Object.entries(FRAMEWORKS)) {
  console.log(`\n  ${project}`)
  const root = path.join(STACK, project)
  if (!existsSync(root)) {
    console.log("    папки нет рядом с ElementsUI, проект пропущен")
    missingProjects.push(project)
    continue
  }
  const width = Math.max(...files.map(([from]) => `${NAMES[from]} (${path.basename(from)})`.length))
  for (const [from, to] of files) {
    const label = `${NAMES[from]} (${path.basename(from)})`.padEnd(width)
    const source = path.join(DICTIONARIES, from)
    if (!existsSync(source)) {
      console.log(`    ${label}  нет в ElementsUI, пропущен`)
      continue
    }
    const data = readFileSync(source)
    const target = path.join(root, to)
    if (existsSync(target) && readFileSync(target).equals(data)) {
      console.log(`    ${label}  без изменений`)
      same++
      continue
    }
    mkdirSync(path.dirname(target), { recursive: true })
    writeFileSync(target, data)
    console.log(`    ${label}  обновлён`)
    updated++
  }
}

console.log("\nШаг 3. Собираю библиотеку и кладу её приложениям")
const apps = APPS.filter((app) => {
  const target = path.join(STACK, app, "node_modules", "poe-svelte-ui-lib")
  if (existsSync(target)) return true
  console.log(`  ${app}: пакет не установлен, шаг пропущен (сначала npm install в приложении)`)
  return false
})
if (apps.length) {
  console.log("  Собираю пакет библиотеки (svelte-package: исходники src/lib, готовый пакет dist):")
  run("npx svelte-kit sync && npx svelte-package")
  for (const app of apps) {
    const target = path.join(STACK, app, "node_modules", "poe-svelte-ui-lib")
    rmSync(path.join(target, "dist"), { recursive: true, force: true })
    cpSync(path.join(LIB, "dist"), path.join(target, "dist"), { recursive: true })
    console.log(`  ${app}: библиотека собрана из исходников и положена в node_modules`)
  }
  console.log("  Так отладочные сборки видят свежий код: npm install в приложении вернёт версию из npm.")
}

if (updated === 0) {
  console.log("\nИтог: все копии уже совпадали с ElementsUI, менять ничего не пришлось.")
} else {
  const rest = same === 0 ? "" : same === 1 ? ", ещё 1 файл не менялся" : `, остальные ${same} ${plural(same, ["файл", "файла", "файлов"])} не менялись`
  console.log(`\nИтог: обновлено ${updated} ${plural(updated, ["файл", "файла", "файлов"])}${rest}.`)
}
if (missingProjects.length) {
  console.log(`Проектов рядом нет: ${missingProjects.join(", ")}.`)
}
