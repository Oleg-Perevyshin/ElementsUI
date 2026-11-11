/* .knowledgebase/build.mjs - сборка справочника KnowledgeBase-<Проект>.md для ИИ: обзор Overview.md + вся документация проекта из git. Одинаковый во всех проектах стека */
/* Запуск из корня проекта: node .knowledgebase/build.mjs - пересобрать; node .knowledgebase/build.mjs --check - только сверить (CI), код 1 если устарел */
import { execFileSync } from "node:child_process"
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const config = JSON.parse(readFileSync(join(ROOT, ".knowledgebase/config.json"), "utf8"))
const OUTPUT = `KnowledgeBase-${config.project}.md`

/* Шаблон пути: ** - любые папки, * - любые символы без «/» */
const toRegExp = (glob) =>
  new RegExp(
    "^" +
      glob
        .split("**/")
        .map((part) =>
          part
            .replace(/[.+^${}()|[\]\\]/g, "\\$&")
            .replace(/\*/g, "[^/]*")
            .replace(/\?/g, "[^/]"),
        )
        .join("(?:.*/)?") +
      "$",
  )
const include = config.include.map(toRegExp)
const exclude = (config.exclude ?? []).map(toRegExp)

/* Только файлы под git: без node_modules, сборок и скачанных SDK */
const tracked = execFileSync("git", ["ls-files", "-z"], { cwd: ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 })
  .split("\0")
  .filter(Boolean)
const sources = tracked.filter(
  (path) => path !== OUTPUT && !path.startsWith(".knowledgebase/") && include.some((re) => re.test(path)) && !exclude.some((re) => re.test(path)),
)
/* Порядок: README.md корня, затем по пути (папка раньше вложенных) */
sources.sort((a, b) => (a === "README.md" ? -1 : b === "README.md" ? 1 : a.localeCompare(b, "en")))

/* Заголовки документа ниже на `shift` уровней, вне блоков кода; уровень не глубже 6 */
const shiftHeadings = (text, shift) => {
  let fence = null
  return text
    .split("\n")
    .map((line) => {
      const marker = line.match(/^\s*(```+|~~~+)/)?.[1]
      if (marker) fence = fence === null ? marker[0] : marker[0] === fence ? null : fence
      if (fence !== null || marker) return line
      const heading = line.match(/^(#{1,6})(\s.*)$/)
      return heading ? "#".repeat(Math.min(6, heading[1].length + shift)) + heading[2] : line
    })
    .join("\n")
}

const read = (path) => readFileSync(join(ROOT, path), "utf8").replace(/\r\n/g, "\n").replace(/^﻿/, "").trim()

const overviewPath = ".knowledgebase/Overview.md"
if (!existsSync(join(ROOT, overviewPath))) throw new Error(`Нет ${overviewPath}`)

const parts = [
  `<!-- Файл собирает node .knowledgebase/build.mjs из ${overviewPath} и документации проекта (${sources.length} файлов). Вручную не править: правь источники и пересобери -->`,
  `# База знаний ${config.project}`,
  read(overviewPath),
  "# Документация из репозитория",
  "Ниже - каждый файл документации проекта целиком, заголовки сдвинуты на два уровня. Пути - от корня репозитория.",
  sources.map((path) => `- \`${path}\``).join("\n"),
  ...sources.map((path) => `## Файл \`${path}\`\n\n${shiftHeadings(read(path), 2)}`),
]
const content = parts.join("\n\n") + "\n"

const target = join(ROOT, OUTPUT)
const current = existsSync(target) ? readFileSync(target, "utf8").replace(/\r\n/g, "\n") : ""
if (process.argv.includes("--check")) {
  if (current === content) console.log(`${OUTPUT}: актуален`)
  else {
    console.error(`${OUTPUT} устарел: запусти node .knowledgebase/build.mjs и закоммить результат`)
    process.exit(1)
  }
} else if (current === content) console.log(`${OUTPUT}: без изменений`)
else {
  writeFileSync(target, content)
  console.log(`${OUTPUT}: собран (${sources.length} файлов, ${Math.round(content.length / 1024)} КБ)`)
}
