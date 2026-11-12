/* Общий пакет poe_cbor_pkt всех шин и консоли: indefinite ARRAY записей [TrgBusID, SrcBusID, HAR, Payload, CRC16]. Payload - ровно одно CBOR item (сырые данные - байтовая строка), пустой - null. CRC-16/KERMIT - по CBOR-байтам записи от её заголовка до конца Payload */
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

export interface PacketObject {
  trgBusID: number
  srcBusID: number
  har: number
  /* CBOR item Payload; пустой массив - пустой Payload (null) */
  payload: Uint8Array
}

export interface DecodedPacketObject extends PacketObject {
  /* Части HAR: заголовок (биты 14-15), аргумент (биты 1-13), нужен ли ответ (бит 0) */
  header: number
  argument: number
  reply: boolean
  crc: number
  /* Неверный CRC - устройство такой объект отбросит, показываем отметкой, а не прячем */
  crcOk: boolean
}

const isUint = (value: number, max: number) => Number.isInteger(value) && value >= 0 && value <= max

/* HAR = заголовок (0..3) в битах 14-15, аргумент (0..8191) в битах 1-13, флаг ответа в бите 0 - как HAR/HAR_NR в api_har.h прошивки; вне диапазона - ошибка */
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

export const packetObjectCrc = (encodedRecordPrefix: Uint8Array): number => crc16Kermit(0, encodedRecordPrefix)

/* Сырые байты одним CBOR item Payload - байтовой строкой, как CBOR_PACK прошивки */
export const encodePacketBytesPayload = (bytes: Uint8Array): Uint8Array => {
  const encoder = new CborEncoder()
  encoder.encodeBytes(bytes)
  return encoder.getResult()
}

/* Пакет из одного или нескольких объектов - те же байты, что CBOR_PktEncAddRaw/CBOR_PktEncFinish прошивки; BusID и HAR вне uint16 - ошибка */
export const encodePacket = (objects: PacketObject[]): Uint8Array => {
  const encoder = new CborEncoder()
  encoder.encodeArrayStart(null)
  for (const { trgBusID, srcBusID, har, payload } of objects) {
    if (![trgBusID, srcBusID, har].every((value) => isUint(value, 0xffff))) throw new RangeError("TrgBusID, SrcBusID и HAR должны быть uint16")
    const item = payload.length ? payload : NULL_PAYLOAD
    const payloadDecoder = new CborDecoder(item)
    if (!payloadDecoder.skipValue() || payloadDecoder.offset !== item.length) throw new Error("Payload должен содержать ровно одно CBOR item")
    const recordStart = encoder.getResult().length
    encoder.encodeArrayStart(5)
    encoder.encodeUnsigned(trgBusID)
    encoder.encodeUnsigned(srcBusID)
    encoder.encodeUnsigned(har)
    encoder.encodeRaw(item)
    const prefix = encoder.getResult().slice(recordStart)
    encoder.encodeUnsigned(packetObjectCrc(prefix))
  }
  encoder.encodeBreak()
  return encoder.getResult()
}

/* Результат разбора начала буфера: пакет целиком (length - сколько байт занял), данных пока не хватает, или это не пакет */
export type PacketParse = { status: "complete"; length: number; objects: DecodedPacketObject[] } | { status: "incomplete" } | { status: "garbage" }

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

/* Объект пакета; не по формату (не 5 элементов, не те типы) - null, как CBOR_PktDecNext прошивки его пропускает */
const toObject = (value: unknown, rawRecord: Uint8Array): DecodedPacketObject | null => {
  if (!Array.isArray(value) || value.length !== 5) return null
  const [trgBusID, srcBusID, har, crc] = [toNumber(value[0]), toNumber(value[1]), toNumber(value[2]), toNumber(value[4])]
  if (trgBusID === null || srcBusID === null || har === null || crc === null) return null
  const info = rawRecord[0] & 0x1f
  const headerLength = info < 24 ? 1 : info === 24 ? 2 : info === 25 ? 3 : info === 26 ? 5 : info === 27 ? 9 : 0
  if (rawRecord[0] >> 5 !== 4 || headerLength === 0) return null
  const fields = new CborDecoder(rawRecord.subarray(headerLength))
  for (let i = 0; i < 3; i++) if (!fields.skipValue()) return null
  const payloadStart = headerLength + fields.offset
  if (!fields.skipValue()) return null
  const payloadEnd = headerLength + fields.offset
  const prefix = rawRecord.subarray(0, payloadEnd)
  const item = rawRecord.subarray(payloadStart, payloadEnd)
  const payload = item.length === 1 && item[0] === 0xf6 ? new Uint8Array() : item
  return { trgBusID, srcBusID, har, payload, crc, crcOk: packetObjectCrc(prefix) === crc, ...splitHar(har) }
}

/* Начало пакета - indefinite-массив 0x9F, за ним запись-массив из 5 полей 0x85 (как CBOR_PktStreamPush прошивки) */
const PACKET_START = 0x9f
const PACKET_RECORD = 0x85

/* Позиция начала пакета 0x9F 0x85 в буфере; 0x9F последним байтом - возможное начало; -1 - начала нет */
export const packetStart = (bytes: Uint8Array): number => {
  for (let i = bytes.indexOf(PACKET_START); i >= 0; i = bytes.indexOf(PACKET_START, i + 1))
    if (i + 1 >= bytes.length || bytes[i + 1] === PACKET_RECORD) return i
  return -1
}

/* Разбор пакета с начала буфера - и для целого кадра (CAN), и для потока (RS485: «incomplete» - ждать ещё байт, «garbage» - сдвинуться на байт); заявленная длина больше maxItemBytes - мусор, а не ожидание. Пакет - только indefinite-массив 0x9F ... 0xFF: definite-массивы прошивка (CBOR_PktDecInit) отвергает */
export const decodePacket = (bytes: Uint8Array, maxItemBytes = Infinity): PacketParse => {
  if (bytes.length === 0) return { status: "incomplete" }
  if (bytes[0] !== PACKET_START) return { status: "garbage" }

  let offset = 1
  const objects: DecodedPacketObject[] = []
  try {
    for (;;) {
      if (offset >= bytes.length) return { status: "incomplete" }
      if (bytes[offset] === 0xff) return { status: "complete", length: offset + 1, objects }
      const value = readValue(bytes, offset, maxItemBytes)
      if (!value) return { status: "incomplete" }
      offset += value.length
      const object = toObject(value.value, bytes.subarray(offset - value.length, offset))
      if (object) objects.push(object)
    }
  } catch {
    return { status: "garbage" }
  }
}

/* Потоковый разбор пакетов из сырого потока (RS485): пакет ищется по метке 0x9F 0x85, байты до неё - мусор; пакет без записей - тоже мусор (сдвиг на байт); пауза дольше gapMs обрывает недособранный пакет */
export const createPacketStreamParser = (options: FramerOptions = {}) => {
  const framer = createFramer(options)
  return {
    push(chunk: Uint8Array, now = Date.now()): { bytes: Uint8Array; objects: DecodedPacketObject[] }[] {
      const packets: { bytes: Uint8Array; objects: DecodedPacketObject[] }[] = []
      framer.push(chunk, now, (bytes) => {
        const start = packetStart(bytes)
        if (start < 0) return bytes.length
        if (start > 0) return start
        const parsed = decodePacket(bytes, framer.maxBytes)
        if (parsed.status === "incomplete") return 0
        if (parsed.status === "garbage" || !parsed.objects.length) return 1
        packets.push({ bytes: bytes.slice(0, parsed.length), objects: parsed.objects })
        return parsed.length
      })
      return packets
    },
    reset: framer.reset,
  }
}
