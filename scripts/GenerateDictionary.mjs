/* scripts/GenerateDictionary.mjs - генерирует из мастер-словарей src/lib/dictionaries: generated/poe_cmd.ts из poe_cmd.yaml (строки «- [Строка, Enum, Число]», тот же разбор, что parseArgumentDictionary), generated/poe_msg.ts из poe_msg.yaml (группы с диапазонами и сообщения), generated/poe_gui.ts из poe_gui.yaml (типы компонентов GUI и обмен), заголовки прошивок firmware/poe_cmd.h и firmware/poe_msg.h (перечисления выровнены целиком, внутри clang-format off); запускается npm run Generate и перед упаковкой (prepack) */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"

const root = new URL("../src/lib/dictionaries/", import.meta.url)
const generated = new URL("generated/", root)
const firmware = new URL("firmware/", root)
mkdirSync(generated, { recursive: true })
mkdirSync(firmware, { recursive: true })

/* ********************************************************** */
/* Перечисление C выровнено целиком: "=" по самому длинному имени, комментарии в одну колонку; enum в clang-format off - Format его не меняет */
const INDENT = "  "
const cComment = (text) => text.replace(/\*\//g, "* /").trim()
/* Ширина в столбцах: символ - 1 столбец, широкие CJK - 2 */
const isWide = (c) =>
  (c >= 0x1100 && c <= 0x115f) ||
  (c >= 0x2e80 && c <= 0xa4cf) ||
  (c >= 0xac00 && c <= 0xd7a3) ||
  (c >= 0xf900 && c <= 0xfaff) ||
  (c >= 0xfe30 && c <= 0xfe4f) ||
  (c >= 0xff00 && c <= 0xff60) ||
  (c >= 0xffe0 && c <= 0xffe6) ||
  (c >= 0x20000 && c <= 0x3fffd)
const columns = (text) => [...text].reduce((width, ch) => width + (isWide(ch.codePointAt(0)) ? 2 : 1), 0)

/* typedef enum с именем type; строки тела: { section } - комментарий на своей строке, { blank } - пустая строка, { name, value, comment? } - элемент */
const formatEnum = (items, type) => {
  const entries = items.filter((item) => item.name)
  const eq = Math.max(...entries.map((entry) => columns(`${INDENT}${entry.name} `)))
  const code = (entry) => `${INDENT}${entry.name}${" ".repeat(eq - columns(`${INDENT}${entry.name}`))}= ${entry.value},`
  const commentColumn = Math.max(...entries.map((entry) => columns(code(entry)) + 1))
  const body = items.map((item) => {
    if (item.blank) return ""
    if (item.section !== undefined) return `${INDENT}/* ${item.section} */`
    const line = code(item)
    return item.comment ? `${line}${" ".repeat(commentColumn - columns(line))}/* ${item.comment} */` : line
  })
  return ["/* clang-format off */", "typedef enum {", ...body, `} ${type};`, "/* clang-format on */"].join("\n")
}

/* Элементы enum из yaml: комментарии разделов («# ...» перед строками) - строки-комментарии, пустая строка перед разделом; шапка файла (комментарии до первой пустой строки) не идёт */
const enumItems = (yaml, parse, items = []) => {
  let headerSkipped = false
  let pending = []
  for (const line of yaml.split(/\r?\n/)) {
    const entry = parse(line)
    if (entry) {
      if (pending.length) items.push(...(items.length ? [{ blank: true }] : []), ...pending.map((text) => ({ section: cComment(text) })))
      pending = []
      items.push(entry)
    } else if (/^\s*#/.test(line)) {
      if (headerSkipped) pending.push(line.replace(/^\s*#\s?/, ""))
    } else if (!line.trim()) headerSkipped = true
  }
  return items
}

/* ********************************************************** */
/* Словарь команд poe_cmd.yaml -> DEFAULT_ARGUMENT_CODES и poe_cmd.h */
const commandsYaml = readFileSync(new URL("poe_cmd.yaml", root), "utf8")
const commands = [...commandsYaml.matchAll(/^\s*-\s*\[\s*([^,\]]+?)\s*,\s*[^,\]]+?\s*,\s*(\d+)\s*\]/gm)].map(([, name, code]) => [name, Number(code)])

const names = new Set()
const codes = new Set()
for (const [name, code] of commands) {
  if (names.has(name) || codes.has(code)) throw new Error(`poe_cmd.yaml: повтор имени или кода - ${name} = ${code}`)
  if (code > 0x1fff) throw new Error(`poe_cmd.yaml: код ${name} = ${code} не помещается в 13 бит аргумента Cmd`)
  names.add(name)
  codes.add(code)
}

writeFileSync(
  new URL("poe_cmd.ts", generated),
  `/* $lib/dictionaries/generated/poe_cmd.ts - СГЕНЕРИРОВАНО из poe_cmd.yaml (npm run Generate), руками не править */\n\nexport const DEFAULT_ARGUMENT_CODES: Record<string, number> = {\n${commands
    .map(([name, code]) => `  ${/^[A-Za-z_$][\w$]*$/.test(name) ? name : JSON.stringify(name)}: ${code},`)
    .join("\n")}\n}\n`,
)

/* poe_cmd.h: har_t, макросы HAR/HAR_NR, api_header_t и enum api_argument_t (A_* = код) с комментариями разделов и строк */
const harItems = enumItems(commandsYaml, (line) => {
  const entry = line.match(/^\s*-\s*\[\s*[^,\]]+?\s*,\s*([^,\]]+?)\s*,\s*(\d+)\s*\](?:\s*#\s*(.*))?/)
  return entry && { name: entry[1], value: Number(entry[2]), comment: entry[3] && cComment(entry[3]) }
})
writeFileSync(
  new URL("poe_cmd.h", firmware),
  `/* poe_cmd.h - СГЕНЕРИРОВАНО из poe_cmd.yaml библиотеки poe-svelte-ui-lib (npm run Generate), вручную не править */\n` +
    `#pragma once\n#include <stdint.h>\n\n` +
    `/* ********************************************************** */\n` +
    `/* Команда пакета: заголовок, аргумент и признак «нужен ответ» в одном 16-битном слове */\n` +
    `typedef union {\n  struct {\n    uint16_t reply : 1;  /* Бит 0: 1 - получатель отвечает */\n    uint16_t arg   : 13; /* Биты 1-13: аргумент (0..8191) */\n    uint16_t hdr   : 2;  /* Биты 14-15: заголовок (GET SET OK! ER!) */\n  };\n  uint16_t word;\n} har_t;\n\n` +
    `/* Готовое слово HAR: HAR - с ответом, HAR_NR - без ответа */\n` +
    `#define HAR(_h, _a)    (((har_t) {.hdr = (_h), .arg = (_a), .reply = 1}).word)\n` +
    `#define HAR_NR(_h, _a) (((har_t) {.hdr = (_h), .arg = (_a), .reply = 0}).word)\n\n` +
    `/* Коды заголовков */\ntypedef enum { H_GET = 0, H_SET = 1, H_OK = 2, H_ER = 3 } api_header_t;\n\n` +
    `/* Словарь аргументов - единый для всех устройств и обоих фреймворков (.framework/poe_cmd.yaml), 0 = отсутствие аргумента; имён в прошивке нет, только коды */\n` +
    `${formatEnum(harItems, "api_argument_t")}\n`,
)
console.log(`generated/poe_cmd.ts, firmware/poe_cmd.h: ${commands.length} аргументов`)

/* ********************************************************** */
/* Словарь сообщений poe_msg.yaml: раздел groups («ИМЯ: { range: [от, до], ru, en, zh }») и раздел messages (строки «- { code, group, name, level, ru, en, zh }») -> MESSAGE_GROUPS, DEVICE_MESSAGES, MESSAGE_CODES и poe_msg.h (enum MSG_* с разделами по группам) */
const LEVELS = new Set(["info", "warn", "error"])
const TEXT_LANGS = ["ru", "en", "zh"]
const GROUP_LINE = /^\s+(\w+):\s*\{(.*)\}\s*(?:#.*)?$/
const MESSAGE_LINE = /^\s*-\s*\{(.*)\}\s*(?:#\s*(.*))?$/
/* Поля «{ ключ: значение, ключ: "текст" }»; range: [от, до] разбирается отдельно */
const parseFields = (body) =>
  Object.fromEntries(
    [...body.replace(/range:\s*\[[^\]]*\]/, "").matchAll(/(\w+):\s*("(?:[^"\\]|\\.)*"|[^,}\s]+)/g)].map(([, key, value]) => [
      key,
      value.startsWith('"') ? JSON.parse(value) : value,
    ]),
  )
const params = (text) => [...new Set([...text.matchAll(/\{(\d+)\}/g)].map((m) => m[1]))].sort().join(",")

const parseGroup = (line, groups) => {
  const [, name, body] = line.match(GROUP_LINE) ?? []
  if (!name) throw new Error(`poe_msg.yaml: строка группы не «ИМЯ: { range: [от, до], ru, en, zh }» - ${line.trim()}`)
  const range = body.match(/range:\s*\[\s*(\d+)\s*,\s*(\d+)\s*\]/)
  const fields = parseFields(body)
  const group = { name, from: Number(range?.[1]), to: Number(range?.[2]), ru: fields.ru, en: fields.en, zh: fields.zh }
  if (!/^[A-Z][A-Z0-9]*$/.test(name)) throw new Error(`poe_msg.yaml: имя группы не UPPER без _ - ${line.trim()}`)
  if (!range || group.from < 1 || group.to > 0xffff || group.from > group.to)
    throw new Error(`poe_msg.yaml: диапазон группы не внутри 1..65535 - ${line.trim()}`)
  for (const lang of TEXT_LANGS) if (!group[lang]) throw new Error(`poe_msg.yaml: нет названия группы на ${lang} - ${line.trim()}`)
  for (const other of groups) {
    if (other.name === name) throw new Error(`poe_msg.yaml: повтор группы ${name}`)
    if (group.from <= other.to && other.from <= group.to) throw new Error(`poe_msg.yaml: диапазоны групп ${other.name} и ${name} пересекаются`)
  }
  return group
}

const parseMessage = (line, groups, messages) => {
  const [, body, note] = line.match(MESSAGE_LINE) ?? []
  if (body === undefined) throw new Error(`poe_msg.yaml: строка сообщения не «- { code, group, name, level, ru, en, zh }» - ${line.trim()}`)
  const fields = parseFields(body)
  const message = {
    code: Number(fields.code),
    group: fields.group,
    name: fields.name,
    level: fields.level,
    ru: fields.ru,
    en: fields.en,
    zh: fields.zh,
    note: note?.trim(),
  }
  const group = groups.find(({ name }) => name === message.group)
  if (!group) throw new Error(`poe_msg.yaml: группы ${message.group} нет в разделе groups - ${line.trim()}`)
  if (!Number.isInteger(message.code) || message.code < group.from || message.code > group.to)
    throw new Error(`poe_msg.yaml: код вне диапазона группы ${group.name} (${group.from}..${group.to}) - ${line.trim()}`)
  if (!/^[A-Z][A-Z0-9_]*$/.test(message.name ?? "")) throw new Error(`poe_msg.yaml: имя не UPPER_SNAKE - ${line.trim()}`)
  if (!message.name.startsWith(`${group.name}_`) || message.name.length === group.name.length + 1)
    throw new Error(`poe_msg.yaml: имя не начинается с приставки группы ${group.name}_ - ${line.trim()}`)
  if (!LEVELS.has(message.level)) throw new Error(`poe_msg.yaml: level не info|warn|error - ${line.trim()}`)
  for (const lang of TEXT_LANGS) {
    if (!message[lang]) throw new Error(`poe_msg.yaml: нет текста ${lang} - ${line.trim()}`)
    if (params(message[lang]) !== params(message.en)) throw new Error(`poe_msg.yaml: параметры ${lang} не совпадают с en - ${line.trim()}`)
  }
  if (messages.some(({ name, code }) => name === message.name || code === message.code))
    throw new Error(`poe_msg.yaml: повтор имени или кода - ${message.name} = ${message.code}`)
  return message
}

const messagesYaml = readFileSync(new URL("poe_msg.yaml", root), "utf8")
const groups = []
const messages = []
let block = ""
for (const line of messagesYaml.split(/\r?\n/)) {
  const top = line.match(/^(\w+):\s*$/)
  if (top) block = top[1]
  else if (!line.trim() || /^\s*#/.test(line)) continue
  else if (block === "groups") groups.push(parseGroup(line, groups))
  else if (block === "messages") messages.push(parseMessage(line, groups, messages))
  else throw new Error(`poe_msg.yaml: строка вне разделов groups и messages - ${line.trim()}`)
}
if (!groups.length || !messages.length) throw new Error("poe_msg.yaml: нет раздела groups или messages")

/* Сообщения по группам (порядок групп - как в groups), внутри группы - по коду */
const byGroup = groups.map((group) => ({ group, list: messages.filter((message) => message.group === group.name).sort((a, b) => a.code - b.code) }))
const ordered = byGroup.flatMap(({ list }) => list)
/* Свободные диапазоны 1..65535 между группами */
const reserve = []
let next = 1
for (const { from, to } of [...groups].sort((a, b) => a.from - b.from)) {
  if (from > next) reserve.push(`${next}-${from - 1}`)
  next = to + 1
}
if (next <= 0xffff) reserve.push(`${next}-65535`)

const tsObject = (value) =>
  JSON.stringify(value)
    .replace(/"(\w+)":/g, "$1: ")
    .replace(/,(?=\w+: )/g, ", ")
    .replace(/^\{/, "{ ")
    .replace(/\}$/, " }")

writeFileSync(
  new URL("poe_msg.ts", generated),
  `/* $lib/dictionaries/generated/poe_msg.ts - СГЕНЕРИРОВАНО из poe_msg.yaml (npm run Generate), руками не править */\n\n` +
    `export type DeviceMessageLevel = "info" | "warn" | "error"\n` +
    `export type DeviceMessageEntry = { group: string; name: string; level: DeviceMessageLevel; ru: string; en: string; zh: string }\n` +
    `export type DeviceMessageGroup = { from: number; to: number; ru: string; en: string; zh: string }\n\n` +
    `/* Группы сообщений: имя (приставка имён сообщений) -> диапазон кодов и название на языках; резерв: ${reserve.join(", ")} */\n` +
    `export const MESSAGE_GROUPS: Record<string, DeviceMessageGroup> = {\n${groups
      .map(({ name, from, to, ru, en, zh }) => `  ${name}: ${tsObject({ from, to, ru, en, zh })},`)
      .join("\n")}\n}\n\n` +
    `export const DEVICE_MESSAGES: Record<number, DeviceMessageEntry> = {\n${ordered
      .map(({ code, group, name, level, ru, en, zh }) => `  ${code}: ${tsObject({ group, name, level, ru, en, zh })},`)
      .join("\n")}\n}\n\n` +
    `export const MESSAGE_CODES: Record<string, number> = {\n${ordered.map(({ name, code }) => `  ${name}: ${code},`).join("\n")}\n}\n`,
)

/* Комментарий элемента poe_msg.h - по-русски: уровень и текст сообщения */
const LEVEL_RU = { info: "событие", warn: "предупреждение", error: "ошибка" }
const msgItems = [{ name: "MSG_NONE", value: 0 }]
for (const { group, list } of byGroup) {
  if (!list.length) continue
  msgItems.push({ blank: true }, { section: cComment(`${group.name} ${group.from}-${group.to}: ${group.ru}`) })
  for (const message of list)
    msgItems.push({
      name: `MSG_${message.name}`,
      value: message.code,
      comment: cComment(`${LEVEL_RU[message.level]}: ${message.ru}${message.note ? `; ${message.note}` : ""}`),
    })
}
writeFileSync(
  new URL("poe_msg.h", firmware),
  `/* poe_msg.h - СГЕНЕРИРОВАНО из poe_msg.yaml библиотеки poe-svelte-ui-lib (npm run Generate), вручную не править */\n` +
    `/* Код сообщения - поле Message в VAL ответа и push и в Payload ER! модуля (0 - сообщения нет), параметры шаблона {0}, {1}... - массив Args */\n` +
    `/* Группы: ${groups.map(({ name, from, to }) => `${name} ${from}-${to}`).join(", ")}; резерв: ${reserve.join(", ")} */\n` +
    `#pragma once\n\n#include <stdint.h>\n\n${formatEnum(msgItems, "api_msg_t")}\n`,
)
console.log(`generated/poe_msg.ts, firmware/poe_msg.h: ${messages.length} сообщений в ${groups.length} группах`)

/* ********************************************************** */
/* Список компонентов GUI poe_gui.yaml (строки «- [Тип, обмен]») -> COMPONENT_TYPES и COMPONENT_IO; componentMeta.ts при компиляции сверяет список с UIType в обе стороны */
const IO_KINDS = new Set(["none", "read", "write", "readWrite", "widget"])
const componentsYaml = readFileSync(new URL("poe_gui.yaml", root), "utf8")
const components = [...componentsYaml.matchAll(/^\s*-\s*\[\s*([^,\]]+?)\s*,\s*([^,\]]+?)\s*\]/gm)].map(([, type, io]) => ({ type, io }))
const componentTypes = new Set()
for (const { type, io } of components) {
  if (!/^[A-Z][A-Za-z0-9]*$/.test(type)) throw new Error(`poe_gui.yaml: тип не PascalCase - ${type}`)
  if (componentTypes.has(type)) throw new Error(`poe_gui.yaml: повтор типа ${type}`)
  if (!IO_KINDS.has(io)) throw new Error(`poe_gui.yaml: обмен ${type} = ${io} не из ${[...IO_KINDS].join(", ")}`)
  componentTypes.add(type)
}
writeFileSync(
  new URL("poe_gui.ts", generated),
  `/* $lib/dictionaries/generated/poe_gui.ts - СГЕНЕРИРОВАНО из poe_gui.yaml (npm run Generate), руками не править */\n\n` +
    `export const COMPONENT_TYPES = [${components.map(({ type }) => JSON.stringify(type)).join(", ")}] as const\n\n` +
    `export const COMPONENT_IO = {\n${components.map(({ type, io }) => `  ${type}: ${JSON.stringify(io)},`).join("\n")}\n} as const\n`,
)
console.log(`generated/poe_gui.ts: ${components.length} компонентов`)
