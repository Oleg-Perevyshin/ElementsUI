/* scripts/GenerateDictionary.mjs — генерирует src/lib/protocols/dictionaryCodes.ts из мастер-словаря src/lib/protocols/dictionary.yaml
   (строки «- [Строка, Enum, Число]», тот же разбор, что parseArgumentDictionary); запускается npm run Dictionary и перед упаковкой (prepack) */
import { readFileSync, writeFileSync } from "node:fs"

const root = new URL("../src/lib/protocols/", import.meta.url)
const yaml = readFileSync(new URL("dictionary.yaml", root), "utf8")
const entries = [...yaml.matchAll(/^\s*-\s*\[\s*([^,\]]+?)\s*,\s*[^,\]]+?\s*,\s*(\d+)\s*\]/gm)].map(([, name, code]) => [name, Number(code)])

const names = new Set()
const codes = new Set()
for (const [name, code] of entries) {
  if (names.has(name) || codes.has(code)) throw new Error(`dictionary.yaml: повтор имени или кода — ${name} = ${code}`)
  if (code > 0x1fff) throw new Error(`dictionary.yaml: код ${name} = ${code} не помещается в 13 бит аргумента Cmd`)
  names.add(name)
  codes.add(code)
}

const body = entries.map(([name, code]) => `  ${/^[A-Za-z_$][\w$]*$/.test(name) ? name : JSON.stringify(name)}: ${code},`).join("\n")
writeFileSync(
  new URL("dictionaryCodes.ts", root),
  `/* $lib/protocols/dictionaryCodes.ts — СГЕНЕРИРОВАНО из dictionary.yaml (npm run Dictionary), руками не править */\n\nexport const DEFAULT_ARGUMENT_CODES: Record<string, number> = {\n${body}\n}\n`,
)
console.log(`dictionaryCodes.ts: ${entries.length} аргументов`)
