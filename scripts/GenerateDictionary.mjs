/* scripts/GenerateDictionary.mjs - генерирует из мастер-словарей src/lib/dictionaries: generated/commands.ts из commands.yaml (строки «- [Строка, Enum, Число]», тот же разбор, что parseArgumentDictionary), generated/messages.ts из messages.yaml (группы с диапазонами и сообщения), generated/components.ts из components.yaml (типы компонентов GUI и обмен), заголовки прошивок firmware/api_har.h и firmware/api_msg.h сразу в стиле .clang-format прошивок; запускается npm run Dictionary и перед упаковкой (prepack) */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"

const root = new URL("../src/lib/dictionaries/", import.meta.url)
const generated = new URL("generated/", root)
const firmware = new URL("firmware/", root)
mkdirSync(generated, { recursive: true })
mkdirSync(firmware, { recursive: true })

/* ********************************************************** */
/* Перечисление C в стиле .clang-format прошивок (ColumnLimit 150, AlignConsecutiveAssignments и AlignTrailingComments через пустые строки и комментарии) - команда Format его не меняет */
const COLUMN_LIMIT = 150
const INDENT = "  "
const cComment = (text) => text.replace(/\*\//g, "* /").trim()
/* Ширина в столбцах как у clang-format: символ - 1 столбец, широкие CJK - 2 */
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

/* Строки тела enum: { section } - комментарий на своей строке, { blank } - пустая строка, { name, value, comment? } - элемент */
const formatEnum = (items) => {
  const entries = items.filter((item) => item.name)
  /* "=": последовательность выравнивается по самому длинному имени, пока все строки помещаются в ColumnLimit; не помещается - новая последовательность */
  let sequence = []
  let min = 0
  let max = Infinity
  const alignAssignments = () => sequence.forEach((entry) => (entry.eq = min))
  for (const entry of entries) {
    const low = INDENT.length + entry.name.length + 1
    const high = COLUMN_LIMIT - columns(`= ${entry.value},${entry.comment ? ` /* ${entry.comment} */` : ""}`)
    if (sequence.length && (low > max || high < min)) {
      alignAssignments()
      sequence = []
    }
    min = sequence.length ? Math.max(min, low) : low
    max = sequence.length ? Math.min(max, high) : high
    sequence.push(entry)
  }
  alignAssignments()

  /* Комментарии в конце строк: выравниваются внутри раздела (комментарий на своей строке, разрыв больше 3 строк или выход за ColumnLimit начинают новую последовательность) */
  sequence = []
  let breakNext = true
  let lastLine = 0
  const alignComments = () => sequence.forEach((entry) => (entry.commentColumn = min))
  items.forEach((item, line) => {
    if (item.section !== undefined) {
      breakNext = true
      lastLine = line
    }
    if (!item.comment) return
    const low = item.eq + columns(`= ${item.value},`) + 1
    const high = COLUMN_LIMIT - columns(`/* ${item.comment} */`)
    if (breakNext || line - lastLine > 3 || low > max || high < min) {
      alignComments()
      sequence = []
    }
    min = sequence.length ? Math.max(min, low) : low
    max = sequence.length ? Math.min(max, high) : high
    sequence.push(item)
    breakNext = false
    lastLine = line
  })
  alignComments()

  return items
    .map((item) => {
      if (item.blank) return ""
      if (item.section !== undefined) return `${INDENT}/* ${item.section} */`
      const head = `${INDENT}${item.name}`
      const code = `${head}${" ".repeat(item.eq - columns(head))}= ${item.value},`
      return item.comment ? `${code}${" ".repeat(item.commentColumn - columns(code))}/* ${item.comment} */` : code
    })
    .join("\n")
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
/* Словарь команд commands.yaml -> DEFAULT_ARGUMENT_CODES и api_har.h */
const commandsYaml = readFileSync(new URL("commands.yaml", root), "utf8")
const commands = [...commandsYaml.matchAll(/^\s*-\s*\[\s*([^,\]]+?)\s*,\s*[^,\]]+?\s*,\s*(\d+)\s*\]/gm)].map(([, name, code]) => [name, Number(code)])

const names = new Set()
const codes = new Set()
for (const [name, code] of commands) {
  if (names.has(name) || codes.has(code)) throw new Error(`commands.yaml: повтор имени или кода - ${name} = ${code}`)
  if (code > 0x1fff) throw new Error(`commands.yaml: код ${name} = ${code} не помещается в 13 бит аргумента Cmd`)
  names.add(name)
  codes.add(code)
}

writeFileSync(
  new URL("commands.ts", generated),
  `/* $lib/dictionaries/generated/commands.ts - СГЕНЕРИРОВАНО из commands.yaml (npm run Dictionary), руками не править */\n\nexport const DEFAULT_ARGUMENT_CODES: Record<string, number> = {\n${commands
    .map(([name, code]) => `  ${/^[A-Za-z_$][\w$]*$/.test(name) ? name : JSON.stringify(name)}: ${code},`)
    .join("\n")}\n}\n`,
)

/* api_har.h: har_t, макросы HAR/HAR_NR, api_header_t и enum api_argument_t (A_* = код) с комментариями разделов и строк */
const harItems = enumItems(commandsYaml, (line) => {
  const entry = line.match(/^\s*-\s*\[\s*[^,\]]+?\s*,\s*([^,\]]+?)\s*,\s*(\d+)\s*\](?:\s*#\s*(.*))?/)
  return entry && { name: entry[1], value: Number(entry[2]), comment: entry[3] && cComment(entry[3]) }
})
writeFileSync(
  new URL("api_har.h", firmware),
  `/* api_har.h - СГЕНЕРИРОВАНО из commands.yaml библиотеки poe-svelte-ui-lib (npm run Dictionary), вручную не править */\n` +
    `#pragma once\n#include <stdint.h>\n\n` +
    `/* ********************************************************** */\n` +
    `/* Команда пакета: заголовок, аргумент и признак «нужен ответ» в одном 16-битном слове */\n` +
    `typedef union {\n  struct {\n    uint16_t reply : 1;  /* Бит 0: 1 - получатель отвечает */\n    uint16_t arg   : 13; /* Биты 1-13: аргумент (0..8191) */\n    uint16_t hdr   : 2;  /* Биты 14-15: заголовок (GET SET OK! ER!) */\n  };\n  uint16_t word;\n} har_t;\n\n` +
    `/* Готовое слово HAR: HAR - с ответом, HAR_NR - без ответа */\n` +
    `#define HAR(_h, _a)    (((har_t) {.hdr = (_h), .arg = (_a), .reply = 1}).word)\n` +
    `#define HAR_NR(_h, _a) (((har_t) {.hdr = (_h), .arg = (_a), .reply = 0}).word)\n\n` +
    `/* Коды заголовков */\ntypedef enum { H_GET = 0, H_SET = 1, H_OK = 2, H_ER = 3 } api_header_t;\n\n` +
    `/* Словарь аргументов - единый для всех устройств и обоих фреймворков (.framework/Dictionary.yaml), 0 = отсутствие аргумента; имён в прошивке нет, только коды */\n` +
    `typedef enum {\n${formatEnum(harItems)}\n} api_argument_t;\n`,
)
console.log(`generated/commands.ts, firmware/api_har.h: ${commands.length} аргументов`)

/* ********************************************************** */
/* Словарь сообщений messages.yaml: раздел groups («ИМЯ: { range: [от, до], ru, en, zh }») и раздел messages (строки «- { code, group, name, level, ru, en, zh }») -> MESSAGE_GROUPS, DEVICE_MESSAGES, MESSAGE_CODES и api_msg.h (enum MSG_* с разделами по группам) */
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
  if (!name) throw new Error(`messages.yaml: строка группы не «ИМЯ: { range: [от, до], ru, en, zh }» - ${line.trim()}`)
  const range = body.match(/range:\s*\[\s*(\d+)\s*,\s*(\d+)\s*\]/)
  const fields = parseFields(body)
  const group = { name, from: Number(range?.[1]), to: Number(range?.[2]), ru: fields.ru, en: fields.en, zh: fields.zh }
  if (!/^[A-Z][A-Z0-9]*$/.test(name)) throw new Error(`messages.yaml: имя группы не UPPER без _ - ${line.trim()}`)
  if (!range || group.from < 1 || group.to > 0xffff || group.from > group.to)
    throw new Error(`messages.yaml: диапазон группы не внутри 1..65535 - ${line.trim()}`)
  for (const lang of TEXT_LANGS) if (!group[lang]) throw new Error(`messages.yaml: нет названия группы на ${lang} - ${line.trim()}`)
  for (const other of groups) {
    if (other.name === name) throw new Error(`messages.yaml: повтор группы ${name}`)
    if (group.from <= other.to && other.from <= group.to) throw new Error(`messages.yaml: диапазоны групп ${other.name} и ${name} пересекаются`)
  }
  return group
}

const parseMessage = (line, groups, messages) => {
  const [, body, note] = line.match(MESSAGE_LINE) ?? []
  if (body === undefined) throw new Error(`messages.yaml: строка сообщения не «- { code, group, name, level, ru, en, zh }» - ${line.trim()}`)
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
  if (!group) throw new Error(`messages.yaml: группы ${message.group} нет в разделе groups - ${line.trim()}`)
  if (!Number.isInteger(message.code) || message.code < group.from || message.code > group.to)
    throw new Error(`messages.yaml: код вне диапазона группы ${group.name} (${group.from}..${group.to}) - ${line.trim()}`)
  if (!/^[A-Z][A-Z0-9_]*$/.test(message.name ?? "")) throw new Error(`messages.yaml: имя не UPPER_SNAKE - ${line.trim()}`)
  if (!message.name.startsWith(`${group.name}_`) || message.name.length === group.name.length + 1)
    throw new Error(`messages.yaml: имя не начинается с приставки группы ${group.name}_ - ${line.trim()}`)
  if (!LEVELS.has(message.level)) throw new Error(`messages.yaml: level не info|warn|error - ${line.trim()}`)
  for (const lang of TEXT_LANGS) {
    if (!message[lang]) throw new Error(`messages.yaml: нет текста ${lang} - ${line.trim()}`)
    if (params(message[lang]) !== params(message.en)) throw new Error(`messages.yaml: параметры ${lang} не совпадают с en - ${line.trim()}`)
  }
  if (messages.some(({ name, code }) => name === message.name || code === message.code))
    throw new Error(`messages.yaml: повтор имени или кода - ${message.name} = ${message.code}`)
  return message
}

const messagesYaml = readFileSync(new URL("messages.yaml", root), "utf8")
const groups = []
const messages = []
let block = ""
for (const line of messagesYaml.split(/\r?\n/)) {
  const top = line.match(/^(\w+):\s*$/)
  if (top) block = top[1]
  else if (!line.trim() || /^\s*#/.test(line)) continue
  else if (block === "groups") groups.push(parseGroup(line, groups))
  else if (block === "messages") messages.push(parseMessage(line, groups, messages))
  else throw new Error(`messages.yaml: строка вне разделов groups и messages - ${line.trim()}`)
}
if (!groups.length || !messages.length) throw new Error("messages.yaml: нет раздела groups или messages")

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
  new URL("messages.ts", generated),
  `/* $lib/dictionaries/generated/messages.ts - СГЕНЕРИРОВАНО из messages.yaml (npm run Dictionary), руками не править */\n\n` +
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

const msgItems = [{ name: "MSG_NONE", value: 0 }]
for (const { group, list } of byGroup) {
  if (!list.length) continue
  msgItems.push({ blank: true }, { section: cComment(`${group.name} ${group.from}-${group.to}: ${group.ru}`) })
  for (const message of list)
    msgItems.push({
      name: `MSG_${message.name}`,
      value: message.code,
      comment: cComment(`${message.level}: ${message.en}${message.note ? `; ${message.note}` : ""}`),
    })
}
writeFileSync(
  new URL("api_msg.h", firmware),
  `/* api_msg.h - СГЕНЕРИРОВАНО из messages.yaml библиотеки poe-svelte-ui-lib (npm run Dictionary), вручную не править */\n` +
    `/* Код сообщения - поле Message в VAL ответа и push и в Payload ER! модуля (0 - сообщения нет), параметры шаблона {0}, {1}... - массив Args */\n` +
    `/* Группы: ${groups.map(({ name, from, to }) => `${name} ${from}-${to}`).join(", ")}; резерв: ${reserve.join(", ")} */\n` +
    `#pragma once\n\n#include <stdint.h>\n\ntypedef enum {\n${formatEnum(msgItems)}\n} api_msg_t;\n`,
)
console.log(`generated/messages.ts, firmware/api_msg.h: ${messages.length} сообщений в ${groups.length} группах`)

/* ********************************************************** */
/* Список компонентов GUI components.yaml (строки «- [Тип, обмен]») -> COMPONENT_TYPES и COMPONENT_IO; componentMeta.ts при компиляции сверяет список с UIType в обе стороны */
const IO_KINDS = new Set(["none", "read", "write", "readWrite", "widget"])
const componentsYaml = readFileSync(new URL("components.yaml", root), "utf8")
const components = [...componentsYaml.matchAll(/^\s*-\s*\[\s*([^,\]]+?)\s*,\s*([^,\]]+?)\s*\]/gm)].map(([, type, io]) => ({ type, io }))
const componentTypes = new Set()
for (const { type, io } of components) {
  if (!/^[A-Z][A-Za-z0-9]*$/.test(type)) throw new Error(`components.yaml: тип не PascalCase - ${type}`)
  if (componentTypes.has(type)) throw new Error(`components.yaml: повтор типа ${type}`)
  if (!IO_KINDS.has(io)) throw new Error(`components.yaml: обмен ${type} = ${io} не из ${[...IO_KINDS].join(", ")}`)
  componentTypes.add(type)
}
writeFileSync(
  new URL("components.ts", generated),
  `/* $lib/dictionaries/generated/components.ts - СГЕНЕРИРОВАНО из components.yaml (npm run Dictionary), руками не править */\n\n` +
    `export const COMPONENT_TYPES = [${components.map(({ type }) => JSON.stringify(type)).join(", ")}] as const\n\n` +
    `export const COMPONENT_IO = {\n${components.map(({ type, io }) => `  ${type}: ${JSON.stringify(io)},`).join("\n")}\n} as const\n`,
)
console.log(`generated/components.ts: ${components.length} компонентов`)
