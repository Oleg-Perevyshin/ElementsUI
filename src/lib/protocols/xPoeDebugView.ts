/* Вид Payload xPOE-Debug: кратко в строку таблицы и развёрнуто для окна; Payload декодирован один раз при разборе (xPoeDebugRow) */
import { escapeHtml } from "../html.js"
import { bytesToHex } from "./hex.js"

const LOG_LEVELS: Record<number, string> = { 1: "🔴", 2: "🟡", 3: "🟢", 4: "🔵" }

/* float32 с провода - кратчайшая запись, дающая то же float32 (0.12, а не 0.12000000476837158); double и целые - как есть */
const shortNumber = (value: number): number => {
  if (Number.isInteger(value) || !Number.isFinite(value) || Math.fround(value) !== value) return value
  for (let digits = 1; digits <= 9; digits++) {
    const short = Number(value.toPrecision(digits))
    if (Math.fround(short) === value) return short
  }
  return value
}

const normalizeCborValue = (value: unknown): unknown => {
  if (typeof value === "number") return shortNumber(value)
  if (typeof value === "bigint") return String(value)
  if (value instanceof Uint8Array) return `h'${bytesToHex(value, " ")}'`
  if (Array.isArray(value)) return value.map(normalizeCborValue)
  if (value instanceof Map) return Object.fromEntries([...value].map(([key, item]) => [String(key), normalizeCborValue(item)]))
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, normalizeCborValue(item)]))
  return value
}

const compactValue = (value: unknown): string => {
  if (typeof value === "string") return value
  if (value instanceof Uint8Array) return `bytes(${value.length}): ${bytesToHex(value, " ")}`
  return JSON.stringify(normalizeCborValue(value)) ?? String(value)
}

const isDebugLog = (value: unknown): value is [number, string, string | Uint8Array, number?] =>
  Array.isArray(value) &&
  value.length === 4 &&
  typeof value[0] === "number" &&
  !!LOG_LEVELS[value[0]] &&
  typeof value[1] === "string" &&
  (typeof value[2] === "string" || value[2] instanceof Uint8Array)

/* Payload в строку таблицы: DebugLog [уровень, тег, текст|байты, FHS] - уровень · тег · текст, CBOR - JSON, не CBOR - HEX байт */
export const formatXPoeDebugValue = (payload: unknown, bytes: Uint8Array): string => {
  if (payload === undefined) return bytesToHex(bytes, " ")
  if (!isDebugLog(payload)) return compactValue(payload)
  const detail = compactValue(payload[2])
  return `${LOG_LEVELS[payload[0]]} · ${payload[1]}${detail ? ` · ${detail}` : ""}`
}

/* Цвета развёрнутого вида - палитра темы: ключи, строки, числа, логические, null, байты */
type PrettyKind = "key" | "string" | "number" | "boolean" | "null" | "bytes"
const PRETTY_COLORS: Record<PrettyKind, string> = {
  key: "--blue-text",
  string: "--purple-text",
  number: "--red-text",
  boolean: "--orange-text",
  null: "--cyan-text",
  bytes: "--green-text",
}
type Paint = (kind: PrettyKind, text: string) => string
const plain: Paint = (_kind, text) => text
const colored: Paint = (kind, text) => `<span style="color:var(${PRETTY_COLORS[kind]})">${escapeHtml(text)}</span>`

/* Байты строками по 16 - для дампа DebugLog */
const hexRows = (bytes: Uint8Array): string => (bytesToHex(bytes, " ").match(/.{1,48}/g) ?? []).map((row) => row.trim()).join("\n")

/* Карты и массивы с отступом 2, по одному элементу на строку; скобки и запятые - без цвета */
const prettyValue = (value: unknown, paint: Paint, indent = ""): string => {
  if (value === null || value === undefined) return paint("null", "null")
  if (typeof value === "string") return paint("string", JSON.stringify(value))
  if (typeof value === "number") return paint("number", String(shortNumber(value)))
  if (typeof value === "bigint") return paint("number", String(value))
  if (typeof value === "boolean") return paint("boolean", String(value))
  if (value instanceof Uint8Array) return paint("bytes", `h'${bytesToHex(value, " ")}'`)
  const inner = `${indent}  `
  if (Array.isArray(value)) {
    if (!value.length) return "[]"
    return `[\n${value.map((item) => inner + prettyValue(item, paint, inner)).join(",\n")}\n${indent}]`
  }
  const entries = value instanceof Map ? [...value.entries()] : Object.entries(value as object)
  if (!entries.length) return "{}"
  return `{\n${entries.map(([key, item]) => `${inner}${paint("key", `${JSON.stringify(String(key))}:`)} ${prettyValue(item, paint, inner)}`).join(",\n")}\n${indent}}`
}

/* Payload развёрнуто: карты и массивы с отступами, DebugLog - уровень и тег, ниже текст или дамп по 16 байт и FHS; html - готовый HTML в цветах темы (данные экранированы); не CBOR - null */
export const formatXPoeDebugPretty = (payload: unknown, html = false): string | null => {
  if (payload === undefined) return null
  const paint = html ? colored : plain
  const raw = (text: string) => (html ? escapeHtml(text) : text)
  if (typeof payload === "string") return raw(payload)
  if (!isDebugLog(payload)) return prettyValue(payload, paint)
  const [level, tag, detail, fhs] = payload
  const body = detail instanceof Uint8Array ? `${raw(`bytes(${detail.length}):`)}\n${paint("bytes", hexRows(detail))}` : raw(detail)
  return [`${LOG_LEVELS[level]} ${paint("key", tag)}`, body, typeof fhs === "number" ? `FHS: ${paint("number", String(fhs))}` : ""].filter(Boolean).join("\n")
}
