/* xPOE-Debug - UART-консоль как ещё одна шина: пакеты poe_cbor_pkt [[TrgBusID, SrcBusID, HAR, Payload, CRC16], …] вперемешку с текстом загрузчика. Логи - OK! DebugLog, Payload [уровень, тег, текст|байты, FHS]; графики - OK! DebugPlot, Payload {"Группа.Имя": float32} */
import { cborToValue } from "./cbor/value.js"
import { DEFAULT_DICTIONARY, type Dictionary } from "./dictionary.js"
import { DEFAULT_LANGUAGE, type LanguageCode } from "../locales/languages.js"
import { createFramer, type FramerOptions } from "./framer.js"
import { hexToBytes } from "./hex.js"
import { formatXPoeDebugValue, xPoeDebugMessage } from "./xPoeDebugView.js"
import { yamlFlowToCbor } from "./xPoeYaml.js"
import type { DeviceMessageLevel } from "./messages.js"
import { decodePacket, encodePacket, formatBusId, packetStart, type DecodedPacketObject } from "./packet.js"

export const DEBUG_LOG_ARGUMENT = "DebugLog"
const MAX_TEXT_TAIL = 4096
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
      valueBytes: Uint8Array /* Payload - CBOR item, пустой - нет байт */
      payload: unknown /* Payload, декодированный при разборе; пустой или не CBOR - undefined */
      crc: string
      crcOk: boolean
      freeHeap: string /* FHS из DebugLog, у остальных пакетов - "" */
    }
  | { type: "raw"; text: string }

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

const decodePayload = (bytes: Uint8Array): unknown => {
  if (!bytes.length) return undefined
  try {
    return cborToValue(bytes)
  } catch {
    return undefined
  }
}

const frameItem = (object: DecodedPacketObject, dictionary: Dictionary): XPoeDebugItem => {
  const argument = dictionary.name(object.argument)
  const payload = decodePayload(object.payload)
  return {
    type: "frame",
    trgId: object.trgBusID,
    srcId: object.srcBusID,
    har: object.har,
    header: dictionary.header(object.header),
    argument,
    reply: object.reply,
    valueBytes: object.payload.slice(),
    payload,
    crc: object.crc.toString(16).toUpperCase().padStart(4, "0"),
    crcOk: object.crcOk,
    /* FHS - четвёртый элемент Payload DebugLog */
    freeHeap: argument === DEBUG_LOG_ARGUMENT && Array.isArray(payload) && typeof payload[3] === "number" ? String(payload[3]) : "",
  }
}

/* Строка таблицы xPOE-Debug - общая для облака и терминала: пакет с неверным CRC - ⚠️ вместо заголовка (аргумент и значение обычно целы), текст вне пакетов - RAW */
export interface XPoeDebugRow {
  trgId: string
  srcId: string
  har: string /* HAR в HEX без 0x, у RAW - "" */
  header: string
  argument: string
  reply: boolean /* Флаг ответа в HAR: получатель должен ответить */
  value: string /* Payload кратко, как пришёл: DebugLog - уровень · тег · текст, CBOR - поток YAML (вставляется в поле Value как есть), не CBOR - HEX, RAW - сам текст */
  valueBytes: Uint8Array /* Исходные байты Payload, у RAW - пусто */
  payload: unknown /* Payload, декодированный при разборе */
  crc: string
  freeHeap: string
  message?: string /* Сообщение устройства на языке: карта {Message, Args} в Payload (ER!) или DebugLog "MSG <код> ..."; приложение может дописать свои пояснения. В value не входит */
  level?: DeviceMessageLevel /* Уровень сообщения - цвет его текста */
}

/* lang - язык сообщений устройства (приложение передаёт getLanguage()) */
export const xPoeDebugRow = (item: XPoeDebugItem, lang: LanguageCode = DEFAULT_LANGUAGE): XPoeDebugRow => {
  if (item.type === "raw")
    return {
      trgId: "",
      srcId: "",
      har: "",
      header: "RAW",
      argument: "",
      reply: false,
      value: item.text,
      valueBytes: new Uint8Array(),
      payload: undefined,
      crc: "",
      freeHeap: "",
    }
  const message = xPoeDebugMessage(item.payload, lang)
  return {
    trgId: formatBusId(item.trgId),
    srcId: formatBusId(item.srcId),
    har: item.har.toString(16).toUpperCase().padStart(4, "0"),
    header: item.crcOk ? item.header : "⚠️",
    argument: item.argument,
    reply: item.reply,
    value: formatXPoeDebugValue(item.payload, item.valueBytes),
    valueBytes: item.valueBytes,
    payload: item.payload,
    crc: item.crc,
    freeHeap: item.freeHeap,
    ...(message && { message: message.text, level: message.level }),
  }
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

/* Готовые байты Payload (CBOR как есть) - только 0x0A1B */
const RAW_VALUE = /^0[xX]([0-9A-Fa-f]*)$/

/* Поле Value: 0x.. - готовые байты Payload как есть; поток YAML, как в строке VALUE, и JSON как его часть (в JSON строки Base64 под ключами на BIN - байты): «A: 1, B: [1, 2]» (корневая карта без скобок), h'0A1B' - байтовая строка, «12» - число, "12" - строка; пусто - пустой Payload */
export const xPoeDebugValueFromText = (text: string | undefined): Uint8Array => {
  const trimmed = (text ?? "").trim()
  if (!trimmed) return new Uint8Array()
  const raw = RAW_VALUE.exec(trimmed)
  if (raw) {
    const bytes = hexToBytes(raw[1])
    if (!bytes?.length) throw new Error(`Value: после 0x нужны HEX-цифры парами: ${trimmed}`)
    return bytes
  }
  let json = true
  try {
    JSON.parse(trimmed)
  } catch {
    json = false
  }
  try {
    return yamlFlowToCbor(trimmed, json)
  } catch (err) {
    throw new Error(`Value не разобран (YAML, JSON или 0x..): ${err instanceof Error ? err.message : err}: ${trimmed}`)
  }
}
