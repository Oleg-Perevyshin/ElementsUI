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

const run = (command) => execSync(command, { cwd: LIB, stdio: "inherit" })

run("npm run Generate")

for (const [project, files] of Object.entries(FRAMEWORKS)) {
  const root = path.join(STACK, project)
  if (!existsSync(root)) {
    console.log(`- ${project}: нет рядом, пропущен`)
    continue
  }
  const changed = []
  for (const [from, to] of files) {
    const data = readFileSync(path.join(DICTIONARIES, from))
    const target = path.join(root, to)
    if (existsSync(target) && readFileSync(target).equals(data)) continue
    mkdirSync(path.dirname(target), { recursive: true })
    writeFileSync(target, data)
    changed.push(to)
  }
  console.log(`- ${project}: ${changed.length ? `обновлены ${changed.join(", ")}` : "словари совпадают"}`)
}

const apps = APPS.map((app) => [app, path.join(STACK, app, "node_modules", "poe-svelte-ui-lib")]).filter(([app, target]) => {
  if (existsSync(target)) return true
  console.log(`- ${app}: нет node_modules/poe-svelte-ui-lib, пропущен`)
  return false
})
if (apps.length) {
  run("npx svelte-kit sync && npx svelte-package")
  for (const [app, target] of apps) {
    rmSync(path.join(target, "dist"), { recursive: true, force: true })
    cpSync(path.join(LIB, "dist"), path.join(target, "dist"), { recursive: true })
    console.log(`- ${app}: библиотека из исходников в node_modules (до npm install)`)
  }
}
