/* Вид Payload xPOE-Debug: кратко в строку таблицы и развёрнуто для окна как пришёл, сообщение устройства - отдельно (xPoeDebugMessage); Payload декодирован один раз при разборе (xPoeDebugRow) */
import { escapeHtml } from "../html.js"
import { DEFAULT_LANGUAGE, type LanguageCode } from "../locales/languages.js"
import { decodeCbor } from "./cbor/decoder.js"
import { bytesToHex } from "./hex.js"
import { formatYamlBlock, formatYamlFlow, type YamlKind, type YamlPaint } from "./xPoeYaml.js"
import { formatDeviceMessage, parseDebugLogMessage, type FormattedDeviceMessage } from "./messages.js"

const LOG_LEVELS: Record<number, string> = { 1: "🔴", 2: "🟡", 3: "🟢", 4: "🔵" }

/* Payload для вида - как на проводе (порядок пар, ключи-числа, uint64), из исходных байт; без байт - декодированный payload */
const wireValue = (payload: unknown, bytes?: Uint8Array): unknown => {
  if (!bytes?.length) return payload
  try {
    return decodeCbor(bytes)
  } catch {
    return payload
  }
}

/* Байты DebugLog - с длиной, HEX через пробел */
const logBytes = (bytes: Uint8Array): string => `bytes(${bytes.length}): ${bytesToHex(bytes, " ")}`

const isDebugLog = (value: unknown): value is [number, string, string | Uint8Array, number?] =>
  Array.isArray(value) &&
  value.length === 4 &&
  typeof value[0] === "number" &&
  !!LOG_LEVELS[value[0]] &&
  typeof value[1] === "string" &&
  (typeof value[2] === "string" || value[2] instanceof Uint8Array)

/* Поле карты Payload (CBOR-карта приходит Map или объектом) */
const mapField = (value: unknown, key: string): unknown =>
  value instanceof Map ? value.get(key) : value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>)[key] : undefined

/* Сообщение устройства в Payload на языке lang: DebugLog с текстом "MSG <код> ..." или карта {Message, Args} (ответ ER!); нет - null. В строку VALUE не входит */
export const xPoeDebugMessage = (payload: unknown, lang: LanguageCode = DEFAULT_LANGUAGE): FormattedDeviceMessage | null => {
  if (isDebugLog(payload)) {
    const message = typeof payload[2] === "string" ? parseDebugLogMessage(payload[2]) : null
    return message && formatDeviceMessage(message.Message, message.Args, lang)
  }
  const code = mapField(payload, "Message")
  if (typeof code !== "number") return null
  const args = mapField(payload, "Args")
  return formatDeviceMessage(code, Array.isArray(args) ? args.filter((a): a is string | number => typeof a === "string" || typeof a === "number") : [], lang)
}

/* Payload в строку таблицы как пришёл: DebugLog [уровень, тег, текст|байты, FHS] - уровень · тег · текст, CBOR - поток YAML (корневая карта без скобок: «A: 1, B: [1, 2]»; читается обратно полем Value), не CBOR - HEX байт */
export const formatXPoeDebugValue = (payload: unknown, bytes: Uint8Array): string => {
  if (payload === undefined) return bytesToHex(bytes, " ")
  if (!isDebugLog(payload)) return formatYamlFlow(wireValue(payload, bytes))
  const detail = typeof payload[2] === "string" ? payload[2] : logBytes(payload[2])
  return `${LOG_LEVELS[payload[0]]} · ${payload[1]}${detail ? ` · ${detail}` : ""}`
}

/* Цвета развёрнутого вида - палитра темы: ключи, строки, числа, логические, null, байты */
const PRETTY_COLORS: Record<YamlKind, string> = {
  key: "--blue-text",
  string: "--purple-text",
  number: "--red-text",
  boolean: "--orange-text",
  null: "--cyan-text",
  bytes: "--green-text",
}
const plain: YamlPaint = (_kind, text) => text
const colored: YamlPaint = (kind, text) => `<span style="color:var(${PRETTY_COLORS[kind]})">${escapeHtml(text)}</span>`

/* Байты строками по 16 - для дампа DebugLog */
const hexRows = (bytes: Uint8Array): string => (bytesToHex(bytes, " ").match(/.{1,48}/g) ?? []).map((row) => row.trim()).join("\n")

/* Payload развёрнуто: блочный YAML с отступом 2 (скаляр - как в строке таблицы), DebugLog - уровень и тег, ниже текст как пришёл или дамп по 16 байт и FHS; html - готовый HTML в цветах темы (данные экранированы); bytes - исходные байты Payload (порядок пар как на проводе); не CBOR - null */
export const formatXPoeDebugPretty = (payload: unknown, html = false, bytes?: Uint8Array): string | null => {
  if (payload === undefined) return null
  const paint = html ? colored : plain
  const raw = (text: string) => (html ? escapeHtml(text) : text)
  if (!isDebugLog(payload)) return formatYamlBlock(wireValue(payload, bytes), paint)
  const [level, tag, detail, fhs] = payload
  const body = detail instanceof Uint8Array ? `${raw(`bytes(${detail.length}):`)}\n${paint("bytes", hexRows(detail))}` : raw(detail)
  return [`${LOG_LEVELS[level]} ${paint("key", tag)}`, body, typeof fhs === "number" ? `FHS: ${paint("number", String(fhs))}` : ""].filter(Boolean).join("\n")
}
