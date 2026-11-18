/* Пакеты по CAN/CAN FD через slcan-адаптер (can_service прошивки): расширенный 29-битный ID - важность (биты 28-27), SrcBusID (26-11), «последний кадр» (10), номер кадра по кругу (9-3), счётчик пакетов отправителя (2-0); DATA - записи пакета 0x9F ... 0xFF подряд, без служебных байт. Адаптер говорит ASCII-кадрами slcan: [t|d|b|r]III L DD..DD\r (стандартный ID, 3 hex), [T|D|B|R]IIIIIIII L DD..\r (расширенный, 8 hex); t/T - CAN, d/D, b/B - CAN FD (b - с BRS) */
import { createFramer } from "./framer.js"
import { bytesToHex, hexToBytes } from "./hex.js"
import { decodeRecords } from "./packet.js"

const CAN_CLASSIC_PAYLOAD = 8
const CAN_FD_PAYLOAD = 64
/* Длины данных CAN FD по коду DLC 9..15 */
const FD_SIZES = [12, 16, 20, 24, 32, 48, 64]

/* Поля 29-битного ID кадра пакета */
export interface CanIdFields {
  /* 0 - самый важный, 3 - фон */
  priority: number
  srcBusID: number
  /* Последний (или единственный) кадр пакета */
  last: boolean
  /* Номер кадра в пакете по кругу 0..127 */
  frame: number
  /* Счётчик пакетов отправителя по кругу 0..7 */
  counter: number
}

export const makeCanId = ({ priority, srcBusID, last, frame, counter }: CanIdFields): number =>
  (((priority & 3) << 27) | ((srcBusID & 0xffff) << 11) | (last ? 1 << 10 : 0) | ((frame & 0x7f) << 3) | (counter & 7)) >>> 0
export const splitCanId = (canId: number): CanIdFields => ({
  priority: (canId >>> 27) & 3,
  srcBusID: (canId >>> 11) & 0xffff,
  last: ((canId >>> 10) & 1) === 1,
  frame: (canId >>> 3) & 0x7f,
  counter: canId & 7,
})

export interface CanFrame {
  canId: number
  data: Uint8Array
}

/* Отправитель пакета на шине: важность, свой BusID и счётчик пакетов (по умолчанию - следующий по кругу) */
export interface CanSender {
  priority: number
  srcBusID: number
  counter?: number
}

let nextCounter = 0

/* Нарезка записей пакета на кадры - как CAN_Send прошивки: куски по 8 (CAN FD - 64) байт с номерами по кругу, «последний» - только у последнего */
export const canFragments = (records: Uint8Array, fd: boolean, { priority, srcBusID, counter = nextCounter++ & 7 }: CanSender): CanFrame[] => {
  const max = fd ? CAN_FD_PAYLOAD : CAN_CLASSIC_PAYLOAD
  const frames: CanFrame[] = []
  for (let offset = 0, frame = 0; offset < records.length || frame === 0; offset += max, frame++) {
    const last = offset + max >= records.length
    frames.push({ canId: makeCanId({ priority, srcBusID, last, frame, counter }), data: records.subarray(offset, offset + max) })
  }
  return frames
}

/* Кадр данных slcan с расширенным ID: CAN - «T», CAN FD - «B» (с BRS); данные CAN FD дополняются нулями до ближайшей допустимой длины */
export const encodeSlcanFrame = ({ canId, data }: CanFrame, fd: boolean): string => {
  const id = (canId & 0x1fffffff).toString(16).toUpperCase().padStart(8, "0")
  if (!fd) return `T${id}${Math.min(data.length, 8).toString(16).toUpperCase()}${bytesToHex(data.subarray(0, 8))}\r`
  const code = data.length <= 8 ? data.length : 9 + FD_SIZES.findIndex((size) => size >= data.length)
  const size = code <= 8 ? code : FD_SIZES[code - 9]
  const padded = new Uint8Array(size)
  padded.set(data.subarray(0, size))
  return `B${id}${code.toString(16).toUpperCase()}${bytesToHex(padded)}\r`
}

/* Записи пакета целиком в строку кадров slcan для отправки в адаптер */
export const encodeCanPacket = (records: Uint8Array, fd: boolean, sender: CanSender): string =>
  canFragments(records, fd, sender)
    .map((frame) => encodeSlcanFrame(frame, fd))
    .join("")

export interface CanMessage {
  /* ID последнего кадра и его поля */
  canId: number
  priority: number
  srcBusID: number
  counter: number
  /* Записи пакета; у CAN FD добивка последнего кадра обрезана по концу записей */
  data: Uint8Array
  timestamp: number
}

/* Строка slcan до \r; мусор перед кадром пропускается */
const SLCAN_FRAME = /([tdbr])([0-9A-Fa-f]{3})([0-9A-Fa-f])([0-9A-Fa-f]*)$|([TDBR])([0-9A-Fa-f]{8})([0-9A-Fa-f])([0-9A-Fa-f]*)$/
const CR = 0x0d

const fdLength = (code: number) => (code <= 8 ? code : (FD_SIZES[code - 9] ?? 0))

const joinBytes = (parts: Uint8Array[], size: number): Uint8Array => {
  const out = new Uint8Array(size)
  let offset = 0
  for (const part of parts) {
    out.set(part, offset)
    offset += part.length
  }
  return out
}

const decoder = new TextDecoder()

/* Потоковый разбор ответа slcan-адаптера: push(байты порта, время) → собранные пакеты. Берутся только кадры данных с расширенным ID; пакет собирается по паре «отправитель + счётчик», номера кадров должны идти подряд (пропуск - сборка выбрасывается), кадр с номером 0 начинает сборку заново, если это не переход номера через 127. Незавершённая сессия живёт sessionTimeoutMs от последнего кадра, обрывок строки - столько же, сессия длиннее maxPacketBytes сбрасывается. Выдаются только целые записи 0x9F ... 0xFF */
export const createCanParser = ({ sessionTimeoutMs = 2000, maxPacketBytes = 8192 } = {}) => {
  const framer = createFramer({ gapMs: sessionTimeoutMs })
  const sessions = new Map<number, { parts: Uint8Array[]; size: number; next: number; timestamp: number; last: number }>()
  return {
    push(chunk: Uint8Array, now = Date.now()): CanMessage[] {
      for (const [key, session] of sessions) if (now - session.last > sessionTimeoutMs) sessions.delete(key)
      const messages: CanMessage[] = []
      framer.push(chunk, now, (bytes) => {
        const end = bytes.indexOf(CR)
        if (end < 0) return bytes.length > framer.maxBytes ? bytes.length : 0
        const match = SLCAN_FRAME.exec(decoder.decode(bytes.subarray(0, end)))
        if (!match?.[5] || match[5] === "R") return end + 1
        const [type, idHex, dlcHex, dataHex] = match.slice(5, 9)
        const canId = parseInt(idHex, 16)
        const id = splitCanId(canId)
        const dlc = parseInt(dlcHex, 16)
        const size = Math.min(type === "T" ? Math.min(dlc, 8) : fdLength(dlc), dataHex.length >> 1)
        const data = hexToBytes(dataHex.slice(0, size * 2))!
        const key = (id.srcBusID << 3) | id.counter
        let session = sessions.get(key)
        if (id.frame === 0 && session?.next !== 0) session = undefined /* кадр 0 - новый пакет, если это не переход номера через 127 */
        if (session ? id.frame !== session.next : id.frame !== 0) {
          sessions.delete(key)
          return end + 1
        }
        session ??= { parts: [], size: 0, next: 0, timestamp: now, last: now }
        session.parts.push(data)
        session.size += data.length
        session.next = (session.next + 1) & 0x7f
        session.last = now
        if (session.size > maxPacketBytes) {
          sessions.delete(key)
          return end + 1
        }
        if (!id.last) {
          sessions.set(key, session)
          return end + 1
        }
        sessions.delete(key)
        const whole = joinBytes(session.parts, session.size)
        const parsed = decodeRecords(whole)
        if (parsed.status === "complete")
          messages.push({
            canId,
            priority: id.priority,
            srcBusID: id.srcBusID,
            counter: id.counter,
            data: whole.subarray(0, parsed.length),
            timestamp: session.timestamp,
          })
        return end + 1
      })
      return messages
    },
    reset() {
      framer.reset()
      sessions.clear()
    },
  }
}

/* Сырой кадр slcan без сборки пакетов: ext - расширенный 29-битный ID (DroneCAN), fd - кадр CAN FD */
export interface SlcanFrame {
  canId: number
  ext: boolean
  fd: boolean
  data: Uint8Array
  remote: boolean
  timestamp: number
}

/* Потоковый разбор ответа slcan-адаптера по кадрам: каждая строка кадра - SlcanFrame как есть; ответы на команды (\r, \x07) и мусор пропускаются */
export const createSlcanReader = ({ gapMs = 2000 } = {}) => {
  const framer = createFramer({ gapMs })
  return {
    push(chunk: Uint8Array, now = Date.now()): SlcanFrame[] {
      const frames: SlcanFrame[] = []
      framer.push(chunk, now, (bytes) => {
        const end = bytes.indexOf(CR)
        if (end < 0) return bytes.length > framer.maxBytes ? bytes.length : 0
        const match = SLCAN_FRAME.exec(decoder.decode(bytes.subarray(0, end)))
        if (!match) return end + 1
        const [type, idHex, dlcHex, dataHex] = match[1] ? match.slice(1, 5) : match.slice(5, 9)
        const lower = type.toLowerCase()
        const dlc = parseInt(dlcHex, 16)
        const size = lower === "r" ? 0 : Math.min(lower === "t" ? Math.min(dlc, 8) : fdLength(dlc), dataHex.length >> 1)
        frames.push({
          canId: parseInt(idHex, 16),
          ext: !match[1],
          fd: lower === "d" || lower === "b",
          data: hexToBytes(dataHex.slice(0, size * 2)) ?? new Uint8Array(),
          remote: lower === "r",
          timestamp: now,
        })
        return end + 1
      })
      return frames
    },
    reset() {
      framer.reset()
    },
  }
}

/* Команды открытия slcan-адаптера (CANable и совместимые): закрыть канал, скорость арбитража (S0..S8, SA..SD), для CAN FD - скорость данных (Y1..Y5), нормальный режим, без автоповтора, открыть канал - каждая строка заканчивается \r */
export const slcanOpenCommands = (bitrate: string, dataBitrate?: string): string[] =>
  ["C", bitrate, ...(dataBitrate ? [dataBitrate] : []), "M0", "A0", "O"].map((command) => `${command}\r`)
