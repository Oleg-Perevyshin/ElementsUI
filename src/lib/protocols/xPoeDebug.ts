/* $lib/protocols/xPoeDebug.ts */
/* xPOE-Debug — UART-консоль как ещё одна шина: пакеты poe_cbor_pkt [[TrgBusID, SrcBusID, HAR, Payload, CRC16], …] вперемешку с текстом загрузчика.
   Логи — OK! DebugLog, Payload [уровень, тег, текст|байты, FHS]; графики — OK! DebugPlot, Payload {"Группа.Имя": float32} */
import { cborToValue } from "./cbor/value.js"
import { jsonToCbor } from "./cbor/json.js"
import { DEFAULT_ARGUMENT_CODES, HEADER_CODES, nameByCode } from "./dictionary.js"
import { decodePacket, encodePacket, formatBusId, makeHar, type DecodedPacketObject } from "./packet.js"

export const DEBUG_LOG_ARGUMENT = "DebugLog"
const MAX_TEXT_TAIL = 4096
const MAX_PACKET = 8192
const PACKET_START = 0x9f
const RECORD = 0x85
const decoder = new TextDecoder()

export type XPoeDebugItem =
  | {
      type: "frame"
      trgId: number
      srcId: number
      har: number
      header: string
      argument: string
      reply: boolean
      value: string /* HEX CBOR item Payload, пустой Payload — "" */
      valueBytes: Uint8Array
      crc: string
      crcOk: boolean
      freeHeap: string /* FHS из DebugLog, у остальных пакетов — "" */
    }
  | { type: "raw"; text: string }

const toHex = (bytes: Uint8Array) => Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0").toUpperCase()).join("")

/* HAR по строкам словаря; неизвестные заголовок или аргумент — ошибка */
export const xPoeDebugHar = (header: string, argument: string, reply = true): number => {
  const hdr = HEADER_CODES[header]
  const arg = DEFAULT_ARGUMENT_CODES[argument]
  if (hdr === undefined || arg === undefined) throw new Error(`Hdr/Arg отсутствует в общем словаре: ${header} ${argument}`)
  return makeHar(hdr, arg, reply)
}

/* Команда терминала — пакет из одной записи; value — CBOR item Payload, пустой — null */
export const encodeXPoeDebugFrame = (header: string, argument: string, value: Uint8Array, srcId = 0, trgId = 0, reply = true): Uint8Array => {
  if (![srcId, trgId].every((n) => Number.isInteger(n) && n >= 0 && n <= 0xffff)) throw new Error("TrgBusID и SrcBusID должны быть uint16")
  return encodePacket([{ trgBusID: trgId, srcBusID: srcId, har: xPoeDebugHar(header, argument, reply), payload: value }])
}

const textItems = (bytes: Uint8Array) =>
  decoder
    .decode(bytes)
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && ![...line].some((char) => char.charCodeAt(0) < 0x20 && char !== "\t"))
    .map((text) => ({ type: "raw" as const, text }))

/* FHS — четвёртый элемент Payload DebugLog */
const freeHeapOf = (argument: string, payload: Uint8Array): string => {
  if (argument !== DEBUG_LOG_ARGUMENT || !payload.length) return ""
  try {
    const value = cborToValue(payload)
    return Array.isArray(value) && typeof value[3] === "number" ? String(value[3]) : ""
  } catch {
    return ""
  }
}

const frameItem = (object: DecodedPacketObject): XPoeDebugItem => {
  const argument = nameByCode(DEFAULT_ARGUMENT_CODES, object.argument)
  return {
    type: "frame",
    trgId: object.trgBusID,
    srcId: object.srcBusID,
    har: object.har,
    header: nameByCode(HEADER_CODES, object.header),
    argument,
    reply: object.reply,
    value: toHex(object.payload),
    valueBytes: object.payload.slice(),
    crc: object.crc.toString(16).toUpperCase().padStart(4, "0"),
    crcOk: object.crcOk,
    freeHeap: freeHeapOf(argument, object.payload),
  }
}

/* Строка таблицы xPOE-Debug — общая для облака и терминала: пакет с неверным CRC — ⚠️ вместо заголовка (аргумент и значение обычно целы),
   текст вне пакетов — RAW */
export interface XPoeDebugRow {
  trgId: string
  srcId: string
  har: string
  header: string
  argument: string
  value: string
  crc: string
  freeHeap: string
}

export const xPoeDebugRow = (item: XPoeDebugItem): XPoeDebugRow =>
  item.type === "raw"
    ? { trgId: "", srcId: "", har: "", header: "RAW", argument: "", value: item.text, crc: "", freeHeap: "" }
    : {
        trgId: formatBusId(item.trgId),
        srcId: formatBusId(item.srcId),
        har: item.har.toString(16).toUpperCase().padStart(4, "0"),
        header: item.crcOk ? item.header : "⚠️",
        argument: item.argument,
        value: item.value,
        crc: item.crc,
        freeHeap: item.freeHeap,
      }

/* Начало пакета — 0x9F 0x85 (0x9F последним байтом буфера — возможное начало) */
const packetStart = (buffer: Uint8Array): number => {
  for (let i = buffer.indexOf(PACKET_START); i >= 0; i = buffer.indexOf(PACKET_START, i + 1)) if (i + 1 >= buffer.length || buffer[i + 1] === RECORD) return i
  return -1
}

const concat = (a: Uint8Array, b: Uint8Array) => {
  const out = new Uint8Array(a.length + b.length)
  out.set(a)
  out.set(b, a.length)
  return out
}

/* Потоковый разбор: пакеты в любом месте разреза, текст — построчно, мусор сдвигается по байту */
export const createXPoeDebugParser = () => {
  let buffer = new Uint8Array()
  return {
    push(chunk: Uint8Array): XPoeDebugItem[] {
      buffer = concat(buffer, chunk)
      const items: XPoeDebugItem[] = []
      while (buffer.length) {
        const start = packetStart(buffer)
        if (start < 0) {
          const cut = buffer.length > MAX_TEXT_TAIL ? buffer.length : buffer.lastIndexOf(0x0a)
          if (cut >= 0) {
            items.push(...textItems(buffer.subarray(0, cut)))
            buffer = buffer.slice(Math.min(cut + 1, buffer.length))
          }
          break
        }
        if (start + 1 >= buffer.length) break /* 0x9F последним байтом — ждём следующий */
        if (start > 0) {
          items.push(...textItems(buffer.subarray(0, start)))
          buffer = buffer.slice(start)
          continue
        }
        const parsed = decodePacket(buffer)
        if (parsed.status === "incomplete" && buffer.length <= MAX_PACKET) break
        if (parsed.status !== "complete" || !parsed.objects.length) {
          buffer = buffer.slice(1)
          continue
        }
        items.push(...parsed.objects.map(frameItem))
        buffer = buffer.slice(parsed.length)
      }
      return items
    },
    reset() {
      buffer = new Uint8Array()
    },
  }
}

/* Поле Value: готовый HEX CBOR проходит как есть, JSON кодируется в CBOR, пусто — пустой Payload */
export const xPoeDebugValueFromText = (text: string | undefined): Uint8Array => {
  const trimmed = (text ?? "").trim()
  if (!trimmed) return new Uint8Array()
  if (/^([0-9A-Fa-f]{2}\s?)+$/.test(trimmed)) return Uint8Array.from(trimmed.replace(/\s/g, "").match(/../g) ?? [], (pair) => parseInt(pair, 16))
  let parsed: unknown
  try {
    parsed = JSON.parse(trimmed)
  } catch {
    throw new Error(`Value не является ни hex, ни JSON: ${trimmed}`)
  }
  return jsonToCbor(parsed)
}
