/* $lib/protocols/packet.ts */
/* Пакет poe_cbor_pkt (README poe_cbor прошивки, ProdFactory-ESP/STM): indefinite MAP { TrgBusID : [RetBusID, HA_Code, Payload, CRC16] },
   объектов в пакете сколько угодно (в том числе с одинаковым TrgBusID), у каждого свой CRC-16/KERMIT по TrgBusID|RetBusID|HA_Code (по 2 байта
   big-endian) и Payload — не зависит от того, как числа записаны в CBOR. Общая точка сборки и разбора для терминала (CAN, RS485) и облака */
import { CborDecoder } from "./cbor/decoder.js"
import { CborEncoder } from "./cbor/encoder.js"
import { CborEndOfDataError } from "./cbor/types.js"
import { crc16Kermit } from "./crc.js"

/* Адрес «всем устройствам шины» */
export const BROADCAST_BUS_ID = 0xffff

export interface PacketObject {
  trgBusID: number
  retBusID: number
  haCode: number
  payload: Uint8Array
}

export interface DecodedPacketObject extends PacketObject {
  /* Заголовок (2 старших бита HA_Code) и аргумент (14 младших) */
  header: number
  argument: number
  crc: number
  /* Неверный CRC — устройство такой объект отбросит, показываем отметкой, а не прячем */
  crcOk: boolean
}

/* HA_Code = заголовок (0..3) в старших 2 битах и аргумент (0..0x3FFF) */
export const makeHaCode = (header: number, argument: number): number => ((header & 0x03) << 14) | (argument & 0x3fff)
export const splitHaCode = (haCode: number): { header: number; argument: number } => ({ header: (haCode >> 14) & 0x03, argument: haCode & 0x3fff })

/* CRC объекта: TrgBusID | RetBusID | HA_Code по 2 байта big-endian, затем Payload */
export const packetObjectCrc = (trgBusID: number, retBusID: number, haCode: number, payload: Uint8Array): number => {
  const head = [trgBusID >> 8, trgBusID, retBusID >> 8, retBusID, haCode >> 8, haCode].map((byte) => byte & 0xff)
  return crc16Kermit(crc16Kermit(0, head), payload)
}

/* Пакет из одного или нескольких объектов — те же байты, что CBOR_PACK/CBOR_PktEncFinish прошивки */
export const encodePacket = (objects: PacketObject[]): Uint8Array => {
  const encoder = new CborEncoder()
  encoder.encodeMapStart(null)
  for (const { trgBusID, retBusID, haCode, payload } of objects) {
    encoder.encodeUnsigned(trgBusID)
    encoder.encodeArrayStart(4)
    encoder.encodeUnsigned(retBusID)
    encoder.encodeUnsigned(haCode)
    encoder.encodeBytes(payload)
    encoder.encodeUnsigned(packetObjectCrc(trgBusID, retBusID, haCode, payload))
  }
  encoder.encodeBreak()
  return encoder.getResult()
}

/* Результат разбора начала буфера: пакет целиком (length — сколько байт занял), данных пока не хватает, или это не пакет */
export type PacketParse = { status: "complete"; length: number; objects: DecodedPacketObject[] } | { status: "incomplete" } | { status: "garbage" }

/* Одно CBOR-значение с позиции offset: значение и сколько байт заняло; null — данных не хватает */
const readValue = (bytes: Uint8Array, offset: number): { value: unknown; length: number } | null => {
  const decoder = new CborDecoder(bytes.subarray(offset))
  try {
    const value = decoder.decode()
    return { value, length: decoder.offset }
  } catch (error) {
    if (error instanceof CborEndOfDataError) return null
    throw error
  }
}

const toNumber = (value: unknown): number | null => (typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 0xffff ? value : null)

/* Объект пакета из пары ключ/значение; не по формату (не 4 элемента, не те типы, старый формат без CRC) — null, как CBOR_PktDecGet его пропускает */
const toObject = (key: unknown, value: unknown): DecodedPacketObject | null => {
  const trgBusID = toNumber(key)
  if (trgBusID === null || !Array.isArray(value) || value.length !== 4) return null
  const [retBusID, haCode, payload, crc] = [toNumber(value[0]), toNumber(value[1]), value[2], toNumber(value[3])]
  if (retBusID === null || haCode === null || !(payload instanceof Uint8Array) || crc === null) return null
  return { trgBusID, retBusID, haCode, payload, crc, crcOk: packetObjectCrc(trgBusID, retBusID, haCode, payload) === crc, ...splitHaCode(haCode) }
}

/* Разбор пакета с начала буфера — и для целого кадра (CAN), и для потока (RS485: «incomplete» — ждать ещё байт, «garbage» — сдвинуться на байт) */
export const decodePacket = (bytes: Uint8Array): PacketParse => {
  if (bytes.length === 0) return { status: "incomplete" }
  const first = bytes[0]
  if (first >> 5 !== 5) return { status: "garbage" }

  /* Число записей: indefinite (0xBF, до BREAK) или definite — прямо в байте либо в следующих 1/2 байтах */
  let offset = 1
  let count: number | null = null
  const info = first & 0x1f
  if (info < 24) count = info
  else if (info === 24 || info === 25) {
    const size = info === 24 ? 1 : 2
    if (bytes.length < 1 + size) return { status: "incomplete" }
    count = size === 1 ? bytes[1] : (bytes[1] << 8) | bytes[2]
    offset += size
  } else if (info !== 31) return { status: "garbage" }

  const objects: DecodedPacketObject[] = []
  try {
    for (let index = 0; count === null || index < count; index++) {
      if (offset >= bytes.length) return { status: "incomplete" }
      if (count === null && bytes[offset] === 0xff) return { status: "complete", length: offset + 1, objects }
      const key = readValue(bytes, offset)
      if (!key) return { status: "incomplete" }
      const value = readValue(bytes, offset + key.length)
      if (!value) return { status: "incomplete" }
      offset += key.length + value.length
      const object = toObject(key.value, value.value)
      if (object) objects.push(object)
    }
  } catch {
    return { status: "garbage" }
  }
  return { status: "complete", length: offset, objects }
}

/* Объекты пакета для своего адреса (и broadcast) с верным CRC — как CBOR_PktDecGet прошивки, только все, а не первый */
export const objectsFor = (objects: DecodedPacketObject[], busID: number): DecodedPacketObject[] =>
  objects.filter((object) => object.crcOk && (object.trgBusID === busID || object.trgBusID === BROADCAST_BUS_ID))

/* Потоковый разбор пакетов из сырого потока (RS485): пауза дольше gapMs обрывает недособранный пакет, мусор сдвигается по байту,
   без единого целого пакета буфер не растёт дальше maxBytes */
export const createPacketStreamParser = ({ gapMs = 100, maxBytes = 4096 } = {}) => {
  let buffer = new Uint8Array()
  let last = 0
  return {
    push(chunk: Uint8Array, now = Date.now()): { bytes: Uint8Array; objects: DecodedPacketObject[] }[] {
      if (buffer.length && now - last > gapMs) buffer = new Uint8Array()
      last = now
      const merged = new Uint8Array(buffer.length + chunk.length)
      merged.set(buffer)
      merged.set(chunk, buffer.length)
      buffer = merged

      const packets: { bytes: Uint8Array; objects: DecodedPacketObject[] }[] = []
      while (buffer.length) {
        const parsed = decodePacket(buffer)
        if (parsed.status === "incomplete") break
        if (parsed.status === "garbage") {
          buffer = buffer.slice(1)
          continue
        }
        packets.push({ bytes: buffer.slice(0, parsed.length), objects: parsed.objects })
        buffer = buffer.slice(parsed.length)
      }
      if (buffer.length > maxBytes) buffer = new Uint8Array()
      return packets
    },
    reset() {
      buffer = new Uint8Array()
    },
  }
}
