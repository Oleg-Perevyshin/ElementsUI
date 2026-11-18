/* Пакет устройств: записи [TrgBusID, HAR, Payload] в indefinite-массиве 0x9F ... 0xFF - одни на всех проводах, Payload - ровно одно CBOR item (сырые данные - байтовая строка), пустой - null. Отправитель и целостность - у канала: CAN - 29-битный ID (can.ts), RS485, UART-консоль и LoRa - рамка [SrcBusID, записи, CRC16] (здесь), как poe_cbor_pkt.c прошивки */
import { CborDecoder } from "./cbor/decoder.js"
import { CborEncoder } from "./cbor/encoder.js"
import { CborEndOfDataError } from "./cbor/types.js"
import { crc16Kermit } from "./crc.js"
import { createFramer, type FramerOptions } from "./framer.js"

/* BusID в полях ввода - HEX без "0x", 1-4 знака (uint16) */
export const BUS_ID_REGEXP = /^[0-9A-Fa-f]{1,4}$/
/* HEX-поле BusID → число; пусто или не HEX - fallback */
export const parseBusId = (text: string | undefined, fallback = 0): number => (text && BUS_ID_REGEXP.test(text) ? parseInt(text, 16) : fallback)
/* BusID для таблиц - 0x0000 */
export const formatBusId = (id: number): string => `0x${id.toString(16).toUpperCase().padStart(4, "0")}`

export interface PacketRecord {
  trgBusID: number
  har: number
  /* CBOR item Payload; пустой массив - пустой Payload (null) */
  payload: Uint8Array
}

export interface DecodedPacketRecord extends PacketRecord {
  /* Части HAR: заголовок (биты 14-15), аргумент (биты 1-13), нужен ли ответ (бит 0) */
  header: number
  argument: number
  reply: boolean
}

/* Рамка RS485, UART-консоли и LoRa: отправитель и записи; CRC16 проверена при разборе */
export interface PacketFrame {
  srcBusID: number
  records: DecodedPacketRecord[]
}

const isUint = (value: number, max: number) => Number.isInteger(value) && value >= 0 && value <= max

/* HAR = заголовок (0..3) в битах 14-15, аргумент (0..8191) в битах 1-13, флаг ответа в бите 0 - как HAR/HAR_NR в poe_cmd.h прошивки; вне диапазона - ошибка */
export const makeHar = (header: number, argument: number, reply = true): number => {
  if (!isUint(header, 0x03) || !isUint(argument, 0x1fff)) throw new RangeError(`HAR: заголовок 0..3, аргумент 0..8191, получено ${header} ${argument}`)
  return (header << 14) | (argument << 1) | (reply ? 1 : 0)
}
export const splitHar = (har: number): { header: number; argument: number; reply: boolean } => ({
  header: (har >> 14) & 0x03,
  argument: (har >> 1) & 0x1fff,
  reply: (har & 1) === 1,
})

const NULL_PAYLOAD = Uint8Array.of(0xf6)
const RECORDS_START = 0x9f
const BREAK = 0xff
/* Рамка: 0x83 0x19 Src_hi Src_lo, записи, 0x19 CRC_hi CRC_lo - SrcBusID и CRC16 всегда тремя байтами */
const FRAME_ARRAY = 0x83
const FRAME_UINT16 = 0x19
export const FRAME_HEAD = 4
export const FRAME_TAIL = 3

/* Сырые байты одним CBOR item Payload - байтовой строкой, как CBOR_PACK прошивки */
export const encodePacketBytesPayload = (bytes: Uint8Array): Uint8Array => {
  const encoder = new CborEncoder()
  encoder.encodeBytes(bytes)
  return encoder.getResult()
}

/* Записи пакета - те же байты, что CBOR_PktEncAddRaw/CBOR_PktEncFinish прошивки; TrgBusID и HAR вне uint16 или Payload не одно CBOR item - ошибка */
export const encodeRecords = (records: PacketRecord[]): Uint8Array => {
  const encoder = new CborEncoder()
  encoder.encodeArrayStart(null)
  for (const { trgBusID, har, payload } of records) {
    if (![trgBusID, har].every((value) => isUint(value, 0xffff))) throw new RangeError("TrgBusID и HAR должны быть uint16")
    const item = payload.length ? payload : NULL_PAYLOAD
    const payloadDecoder = new CborDecoder(item)
    if (!payloadDecoder.skipValue() || payloadDecoder.offset !== item.length) throw new Error("Payload должен содержать ровно одно CBOR item")
    encoder.encodeArrayStart(3)
    encoder.encodeUnsigned(trgBusID)
    encoder.encodeUnsigned(har)
    encoder.encodeRaw(item)
  }
  encoder.encodeBreak()
  return encoder.getResult()
}

/* Рамка RS485, UART-консоли и LoRa: [SrcBusID, записи, CRC16] - как CBOR_PktEncInitFrame/CBOR_PktEncFinish прошивки */
export const encodeFrame = (srcBusID: number, records: PacketRecord[]): Uint8Array => {
  if (!isUint(srcBusID, 0xffff)) throw new RangeError("SrcBusID должен быть uint16")
  const body = encodeRecords(records)
  const frame = new Uint8Array(FRAME_HEAD + body.length + FRAME_TAIL)
  frame.set([FRAME_ARRAY, FRAME_UINT16, srcBusID >> 8, srcBusID & 0xff])
  frame.set(body, FRAME_HEAD)
  const crc = crc16Kermit(0, frame.subarray(0, FRAME_HEAD + body.length))
  frame.set([FRAME_UINT16, crc >> 8, crc & 0xff], FRAME_HEAD + body.length)
  return frame
}

/* Результат разбора начала буфера: целиком (length - сколько байт заняло), данных пока не хватает, или это не они */
export type RecordsParse = { status: "complete"; length: number; records: DecodedPacketRecord[] } | { status: "incomplete" } | { status: "garbage" }
export type FrameParse = { status: "complete"; length: number; frame: PacketFrame } | { status: "incomplete" } | { status: "garbage" }

/* Одно CBOR-значение с позиции offset: значение и сколько байт заняло; null - данных не хватает */
const readValue = (bytes: Uint8Array, offset: number, maxItemBytes: number): { value: unknown; length: number } | null => {
  const decoder = new CborDecoder(bytes.subarray(offset), maxItemBytes)
  try {
    const value = decoder.decode()
    return { value, length: decoder.offset }
  } catch (error) {
    if (error instanceof CborEndOfDataError) return null
    throw error
  }
}

const toNumber = (value: unknown): number | null => (typeof value === "number" && isUint(value, 0xffff) ? value : null)

/* Запись пакета; не по формату (не 3 элемента, не те типы) - null, как CBOR_PktDecNext прошивки её пропускает */
const toRecord = (value: unknown, rawRecord: Uint8Array): DecodedPacketRecord | null => {
  if (!Array.isArray(value) || value.length !== 3) return null
  const [trgBusID, har] = [toNumber(value[0]), toNumber(value[1])]
  if (trgBusID === null || har === null) return null
  const fields = new CborDecoder(rawRecord.subarray(1))
  if (!fields.skipValue() || !fields.skipValue()) return null
  const item = rawRecord.subarray(1 + fields.offset)
  const payload = item.length === 1 && item[0] === 0xf6 ? new Uint8Array() : item
  return { trgBusID, har, payload, ...splitHar(har) }
}

/* Разбор записей с начала буфера - и для собранного пакета CAN, и внутри рамки; заявленная длина больше maxItemBytes - мусор, а не ожидание. Записи - только indefinite-массив 0x9F ... 0xFF, как CBOR_PktDecInit прошивки */
export const decodeRecords = (bytes: Uint8Array, maxItemBytes = Infinity): RecordsParse => {
  if (bytes.length === 0) return { status: "incomplete" }
  if (bytes[0] !== RECORDS_START) return { status: "garbage" }
  let offset = 1
  const records: DecodedPacketRecord[] = []
  try {
    for (;;) {
      if (offset >= bytes.length) return { status: "incomplete" }
      if (bytes[offset] === BREAK) return { status: "complete", length: offset + 1, records }
      const value = readValue(bytes, offset, maxItemBytes)
      if (!value) return { status: "incomplete" }
      const record = toRecord(value.value, bytes.subarray(offset, offset + value.length))
      offset += value.length
      if (record) records.push(record)
    }
  } catch {
    return { status: "garbage" }
  }
}

/* Разбор рамки с начала буфера: «incomplete» - ждать ещё байт, «garbage» - не рамка или CRC не совпала (поток сдвигается на байт) */
export const decodeFrame = (bytes: Uint8Array, maxItemBytes = Infinity): FrameParse => {
  if (bytes.length < FRAME_HEAD + 1) return !bytes.length || frameStart(bytes) === 0 ? { status: "incomplete" } : { status: "garbage" }
  if (bytes[0] !== FRAME_ARRAY || bytes[1] !== FRAME_UINT16 || bytes[FRAME_HEAD] !== RECORDS_START) return { status: "garbage" }
  const body = decodeRecords(bytes.subarray(FRAME_HEAD), maxItemBytes)
  if (body.status !== "complete") return body
  const end = FRAME_HEAD + body.length
  if (bytes.length < end + FRAME_TAIL) return { status: "incomplete" }
  const crc = (bytes[end + 1] << 8) | bytes[end + 2]
  if (bytes[end] !== FRAME_UINT16 || crc16Kermit(0, bytes.subarray(0, end)) !== crc) return { status: "garbage" }
  return { status: "complete", length: end + FRAME_TAIL, frame: { srcBusID: (bytes[2] << 8) | bytes[3], records: body.records } }
}

/* Позиция возможного начала рамки 0x83 0x19 ?? ?? 0x9F; обрыв в конце буфера - тоже возможное начало; -1 - начала нет */
export const frameStart = (bytes: Uint8Array): number => {
  for (let i = bytes.indexOf(FRAME_ARRAY); i >= 0; i = bytes.indexOf(FRAME_ARRAY, i + 1))
    if ((i + 1 >= bytes.length || bytes[i + 1] === FRAME_UINT16) && (i + FRAME_HEAD >= bytes.length || bytes[i + FRAME_HEAD] === RECORDS_START)) return i
  return -1
}

/* Ложное начало, которое ещё ждёт байт, не держит поток: позиция следующей целой рамки с верной CRC дальше в буфере, -1 - её нет (как CBOR_PktStreamPush прошивки) */
export const laterFrame = (bytes: Uint8Array, maxItemBytes = Infinity): number => {
  for (let i = 1; i < bytes.length; i++) {
    const start = frameStart(bytes.subarray(i))
    if (start < 0) return -1
    i += start
    if (decodeFrame(bytes.subarray(i), maxItemBytes).status === "complete") return i
  }
  return -1
}

/* Потоковый разбор рамок (RS485): байты до начала рамки - мусор, рамка без записей или с неверной CRC - тоже (сдвиг на байт); пауза дольше gapMs обрывает недособранную рамку */
export const createFrameStreamParser = (options: FramerOptions = {}) => {
  const framer = createFramer(options)
  return {
    push(chunk: Uint8Array, now = Date.now()): { bytes: Uint8Array; frame: PacketFrame }[] {
      const frames: { bytes: Uint8Array; frame: PacketFrame }[] = []
      framer.push(chunk, now, (bytes) => {
        const start = frameStart(bytes)
        if (start < 0) return bytes.length
        if (start > 0) return start
        const parsed = decodeFrame(bytes, framer.maxBytes)
        if (parsed.status === "incomplete") return Math.max(laterFrame(bytes, framer.maxBytes), 0)
        if (parsed.status === "garbage" || !parsed.frame.records.length) return 1
        frames.push({ bytes: bytes.slice(0, parsed.length), frame: parsed.frame })
        return parsed.length
      })
      return frames
    },
    reset: framer.reset,
  }
}
