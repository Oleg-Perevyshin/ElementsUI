/* xPOE-Debug - UART-консоль как ещё одна шина: пакеты poe_cbor_pkt [[TrgBusID, SrcBusID, HAR, Payload, CRC16], …] вперемешку с текстом загрузчика. Логи - OK! DebugLog, Payload [уровень, тег, текст|байты, FHS]; графики - OK! DebugPlot, Payload {"Группа.Имя": float32} */
import { cborToValue } from "./cbor/value.js"
import { jsonToCbor } from "./cbor/json.js"
import { DEFAULT_DICTIONARY, type Dictionary } from "./dictionary.js"
import { createFramer, type FramerOptions } from "./framer.js"
import { bytesToHex, hexToBytes } from "./hex.js"
import { decodePacket, encodePacket, formatBusId, type DecodedPacketObject } from "./packet.js"

export const DEBUG_LOG_ARGUMENT = "DebugLog"
const MAX_TEXT_TAIL = 4096
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
      value: string /* HEX CBOR item Payload, пустой Payload - "" */
      valueBytes: Uint8Array
      crc: string
      crcOk: boolean
      freeHeap: string /* FHS из DebugLog, у остальных пакетов - "" */
    }
  | { type: "raw"; text: string }

/* HAR по строкам словаря (по умолчанию встроенного); неизвестные заголовок или аргумент - ошибка */
export const xPoeDebugHar = (header: string, argument: string, reply = true, dictionary: Dictionary = DEFAULT_DICTIONARY): number =>
  dictionary.har(header, argument, reply)

/* Команда терминала - пакет из одной записи; value - CBOR item Payload, пустой - null */
export const encodeXPoeDebugFrame = (
  header: string,
  argument: string,
  value: Uint8Array,
  srcId = 0,
  trgId = 0,
  reply = true,
  dictionary: Dictionary = DEFAULT_DICTIONARY,
): Uint8Array => encodePacket([{ trgBusID: trgId, srcBusID: srcId, har: dictionary.har(header, argument, reply), payload: value }])

const textItems = (bytes: Uint8Array) =>
  decoder
    .decode(bytes)
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && ![...line].some((char) => char.charCodeAt(0) < 0x20 && char !== "\t"))
    .map((text) => ({ type: "raw" as const, text }))

/* FHS - четвёртый элемент Payload DebugLog */
const freeHeapOf = (argument: string, payload: Uint8Array): string => {
  if (argument !== DEBUG_LOG_ARGUMENT || !payload.length) return ""
  try {
    const value = cborToValue(payload)
    return Array.isArray(value) && typeof value[3] === "number" ? String(value[3]) : ""
  } catch {
    return ""
  }
}

const frameItem = (object: DecodedPacketObject, dictionary: Dictionary): XPoeDebugItem => {
  const argument = dictionary.name(object.argument)
  return {
    type: "frame",
    trgId: object.trgBusID,
    srcId: object.srcBusID,
    har: object.har,
    header: dictionary.header(object.header),
    argument,
    reply: object.reply,
    value: bytesToHex(object.payload),
    valueBytes: object.payload.slice(),
    crc: object.crc.toString(16).toUpperCase().padStart(4, "0"),
    crcOk: object.crcOk,
    freeHeap: freeHeapOf(argument, object.payload),
  }
}

/* Строка таблицы xPOE-Debug - общая для облака и терминала: пакет с неверным CRC - ⚠️ вместо заголовка (аргумент и значение обычно целы), текст вне пакетов - RAW */
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

/* Начало пакета - 0x9F 0x85, 0x9F последним байтом - возможное начало */
const packetStart = (bytes: Uint8Array): number => {
  for (let i = bytes.indexOf(PACKET_START); i >= 0; i = bytes.indexOf(PACKET_START, i + 1)) if (i + 1 >= bytes.length || bytes[i + 1] === RECORD) return i
  return -1
}

/* Потоковый разбор: пакеты в любом месте разреза, текст - построчно, мусор сдвигается по байту; пауза дольше gapMs обрывает недособранный пакет, а недописанную строку текста выдаёт как есть. Имена аргументов - из dictionary (по умолчанию встроенного) */
export const createXPoeDebugParser = ({ dictionary = DEFAULT_DICTIONARY, ...options }: FramerOptions & { dictionary?: Dictionary } = {}) => {
  const framer = createFramer(options)
  return {
    push(chunk: Uint8Array, now = Date.now()): XPoeDebugItem[] {
      const items: XPoeDebugItem[] = []
      framer.push(
        chunk,
        now,
        (bytes) => {
          const start = packetStart(bytes)
          if (start === bytes.length - 1) return 0
          if (start !== 0) {
            const cut = start > 0 ? start : bytes.length > MAX_TEXT_TAIL ? bytes.length : bytes.lastIndexOf(0x0a) + 1
            items.push(...textItems(bytes.subarray(0, cut)))
            return cut
          }
          const parsed = decodePacket(bytes, framer.maxBytes)
          if (parsed.status === "incomplete") return 0
          if (parsed.status === "garbage" || !parsed.objects.length) return 1
          items.push(...parsed.objects.map((object) => frameItem(object, dictionary)))
          return parsed.length
        },
        (bytes) => {
          /* Текст до начала пакета выдаётся строкой, обрывок самого пакета отбрасывается */
          const start = packetStart(bytes)
          items.push(...textItems(start < 0 ? bytes : bytes.subarray(0, start)))
        },
      )
      return items
    },
    reset: framer.reset,
  }
}

/* Поле Value: готовый HEX CBOR проходит как есть, JSON кодируется в CBOR, пусто - пустой Payload */
export const xPoeDebugValueFromText = (text: string | undefined): Uint8Array => {
  const trimmed = (text ?? "").trim()
  if (!trimmed) return new Uint8Array()
  if (/^([0-9A-Fa-f]{2}\s?)+$/.test(trimmed)) return hexToBytes(trimmed)!
  let parsed: unknown
  try {
    parsed = JSON.parse(trimmed)
  } catch {
    throw new Error(`Value не является ни hex, ни JSON: ${trimmed}`)
  }
  return jsonToCbor(parsed)
}
