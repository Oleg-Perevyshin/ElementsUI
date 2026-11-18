/* xPOE-Debug - UART-консоль как ещё одна шина: рамки [SrcBusID, записи [TrgBusID, HAR, Payload], CRC16] вперемешку с текстом загрузчика. Логи - OK! DebugLog, Payload [уровень, тег, текст|байты, FHS]; графики - OK! DebugPlot, Payload {"Группа.Имя": float32} */
import { cborToValue } from "./cbor/value.js"
import { DEFAULT_DICTIONARY, type Dictionary } from "./dictionary.js"
import { DEFAULT_LANGUAGE, type LanguageCode } from "../locales/languages.js"
import { createFramer, type FramerOptions } from "./framer.js"
import { hexToBytes } from "./hex.js"
import { formatXPoeDebugValue, xPoeDebugMessage } from "./xPoeDebugView.js"
import { yamlFlowToCbor } from "./xPoeYaml.js"
import type { DeviceMessageLevel } from "./messages.js"
import { decodeFrame, encodeFrame, formatBusId, FRAME_HEAD, frameStart, laterFrame, type DecodedPacketRecord } from "./packet.js"

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
      freeHeap: string /* FHS из DebugLog, у остальных пакетов - "" */
    }
  | { type: "raw"; text: string }

/* Команда терминала - рамка из одной записи; value - CBOR item Payload, пустой - null */
export const encodeXPoeDebugFrame = (
  header: string,
  argument: string,
  value: Uint8Array,
  srcId = 0,
  trgId = 0,
  reply = true,
  dictionary: Dictionary = DEFAULT_DICTIONARY,
): Uint8Array => encodeFrame(srcId, [{ trgBusID: trgId, har: dictionary.har(header, argument, reply), payload: value }])

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

const frameItem = (record: DecodedPacketRecord, srcId: number, dictionary: Dictionary): XPoeDebugItem => {
  const argument = dictionary.name(record.argument)
  const payload = decodePayload(record.payload)
  return {
    type: "frame",
    trgId: record.trgBusID,
    srcId,
    har: record.har,
    header: dictionary.header(record.header),
    argument,
    reply: record.reply,
    valueBytes: record.payload.slice(),
    payload,
    /* FHS - четвёртый элемент Payload DebugLog */
    freeHeap: argument === DEBUG_LOG_ARGUMENT && Array.isArray(payload) && typeof payload[3] === "number" ? String(payload[3]) : "",
  }
}

/* Строка таблицы xPOE-Debug - общая для облака и терминала, текст вне рамок - RAW */
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
  freeHeap: string
  message?: string /* Сообщение устройства на языке: карта {Message, Args} в Payload (ER!) или DebugLog "MSG <код> ..."; приложение может дописать свои пояснения. В value не входит */
  level?: DeviceMessageLevel /* Уровень сообщения - цвет его текста */
  time?: string /* Время приёма или отправки, пишет приложение (необязательная колонка Время) */
  dir?: "rx" | "tx" /* Принято или отправлено, пишет приложение (необязательная колонка Направление) */
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
      freeHeap: "",
    }
  const message = xPoeDebugMessage(item.payload, lang)
  return {
    trgId: formatBusId(item.trgId),
    srcId: formatBusId(item.srcId),
    har: item.har.toString(16).toUpperCase().padStart(4, "0"),
    header: item.header,
    argument: item.argument,
    reply: item.reply,
    value: formatXPoeDebugValue(item.payload, item.valueBytes),
    valueBytes: item.valueBytes,
    payload: item.payload,
    freeHeap: item.freeHeap,
    ...(message && { message: message.text, level: message.level }),
  }
}

/* Потоковый разбор: рамки в любом месте разреза, текст - построчно, мусор и рамка с неверной CRC сдвигаются по байту; пауза дольше gapMs обрывает недособранную рамку, а недописанную строку текста выдаёт как есть. Имена аргументов - из dictionary (по умолчанию встроенного) */
export const createXPoeDebugParser = ({ dictionary = DEFAULT_DICTIONARY, ...options }: FramerOptions & { dictionary?: Dictionary } = {}) => {
  const framer = createFramer(options)
  return {
    push(chunk: Uint8Array, now = Date.now()): XPoeDebugItem[] {
      const items: XPoeDebugItem[] = []
      framer.push(
        chunk,
        now,
        (bytes) => {
          const start = frameStart(bytes)
          /* Возможное начало рамки в хвосте куска - ждать продолжения: 0x83 бывает и вторым байтом буквы UTF-8 */
          if (start > 0 && bytes.length - start <= FRAME_HEAD) return 0
          if (start !== 0) {
            const cut = start > 0 ? start : bytes.length > MAX_TEXT_TAIL ? bytes.length : bytes.lastIndexOf(0x0a) + 1
            items.push(...textItems(bytes.subarray(0, cut)))
            return cut
          }
          const parsed = decodeFrame(bytes, framer.maxBytes)
          if (parsed.status === "incomplete") return Math.max(laterFrame(bytes, framer.maxBytes), 0)
          if (parsed.status === "garbage" || !parsed.frame.records.length) return 1
          items.push(...parsed.frame.records.map((record) => frameItem(record, parsed.frame.srcBusID, dictionary)))
          return parsed.length
        },
        (bytes) => {
          /* Текст до начала рамки выдаётся строкой, обрывок самой рамки отбрасывается */
          const start = frameStart(bytes)
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

/* Поле Value: 0x.. - готовые байты Payload как есть; поток YAML, как в строке VALUE: «A: 1, B: [1, 2]» (корневая карта без скобок), h'0A1B' - байтовая строка, «12» - число, "12" - строка; пусто - пустой Payload */
export const xPoeDebugValueFromText = (text: string | undefined): Uint8Array => {
  const trimmed = (text ?? "").trim()
  if (!trimmed) return new Uint8Array()
  const raw = RAW_VALUE.exec(trimmed)
  if (raw) {
    const bytes = hexToBytes(raw[1])
    if (!bytes?.length) throw new Error(`Value: после 0x нужны HEX-цифры парами: ${trimmed}`)
    return bytes
  }
  try {
    return yamlFlowToCbor(trimmed)
  } catch (err) {
    throw new Error(`Value не разобран (YAML или 0x..): ${err instanceof Error ? err.message : err}: ${trimmed}`)
  }
}
