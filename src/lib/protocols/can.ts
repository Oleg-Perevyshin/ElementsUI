/* Пакеты по CAN/CAN FD через slcan-адаптер (can_service прошивки): стандартный 11-битный ID - бит 10 «последний/единственный фрагмент», биты 0..9 - packet_id, одинаковый у всех фрагментов пакета; DATA - чистый payload без служебных байт. Адаптер говорит ASCII-кадрами slcan: [t|d|b|r]III L DD..DD\r (стандартный ID, 3 hex), [T|D|B|R]IIIIIIII L DD..\r (расширенный, 8 hex); t/T - CAN, d/D, b/B - CAN FD (b - с BRS) */
import { createFramer } from "./framer.js"
import { bytesToHex, hexToBytes } from "./hex.js"
import { decodePacket } from "./packet.js"

export const CAN_FINAL_BIT = 0x400
export const CAN_PACKET_ID_MASK = 0x3ff
const CAN_CLASSIC_PAYLOAD = 8
const CAN_FD_PAYLOAD = 64
/* Длины данных CAN FD по коду DLC 9..15 */
const FD_SIZES = [12, 16, 20, 24, 32, 48, 64]

export interface CanFrame {
  canId: number
  data: Uint8Array
}

/* Нарезка пакета на кадры - как CAN_Send прошивки: один кадр с битом «последний», иначе куски по 8 (CAN FD - 64) байт, бит только у последнего */
export const canFragments = (payload: Uint8Array, fd: boolean, packetId = 1 + Math.floor(Math.random() * CAN_PACKET_ID_MASK)): CanFrame[] => {
  const max = fd ? CAN_FD_PAYLOAD : CAN_CLASSIC_PAYLOAD
  const id = packetId & CAN_PACKET_ID_MASK
  if (payload.length <= max) return [{ canId: CAN_FINAL_BIT | id, data: payload }]
  const frames: CanFrame[] = []
  for (let offset = 0; offset < payload.length; offset += max) {
    const isLast = offset + max >= payload.length
    frames.push({ canId: isLast ? CAN_FINAL_BIT | id : id, data: payload.subarray(offset, offset + max) })
  }
  return frames
}

/* Кадр данных slcan (стандартный ID): CAN - «t», CAN FD - «b» (с BRS); данные CAN FD дополняются нулями до ближайшей допустимой длины */
export const encodeSlcanFrame = ({ canId, data }: CanFrame, fd: boolean): string => {
  const id = (canId & 0x7ff).toString(16).toUpperCase().padStart(3, "0")
  if (!fd) return `t${id}${Math.min(data.length, 8).toString(16).toUpperCase()}${bytesToHex(data.subarray(0, 8))}\r`
  const code = data.length <= 8 ? data.length : 9 + FD_SIZES.findIndex((size) => size >= data.length)
  const size = code <= 8 ? code : FD_SIZES[code - 9]
  const padded = new Uint8Array(size)
  padded.set(data.subarray(0, size))
  return `b${id}${code.toString(16).toUpperCase()}${bytesToHex(padded)}\r`
}

/* Пакет целиком в строку кадров slcan для отправки в адаптер */
export const encodeCanPacket = (payload: Uint8Array, fd: boolean, packetId?: number): string =>
  canFragments(payload, fd, packetId)
    .map((frame) => encodeSlcanFrame(frame, fd))
    .join("")

export interface CanMessage {
  /* ID последнего кадра (с битом «последний») и packet_id */
  canId: number
  packetId: number
  /* Собранные данные всех фрагментов; у CAN FD паддинг последнего кадра обрезан по длине пакета */
  data: Uint8Array
  remote: boolean
  timestamp: number
}

/* Строка slcan до \r; мусор перед кадром пропускается */
const SLCAN_FRAME = /([tdbr])([0-9A-Fa-f]{3})([0-9A-Fa-f])([0-9A-Fa-f]*)$|([TDBR])([0-9A-Fa-f]{8})([0-9A-Fa-f])([0-9A-Fa-f]*)$/
const CR = 0x0d

const fdLength = (code: number) => (code <= 8 ? code : (FD_SIZES[code - 9] ?? 0))

/* CAN FD добивает последний кадр до допустимой длины - лишние байты после пакета poe_cbor_pkt (или нулевой хвост) отрезаем */
const trimFdPadding = (data: Uint8Array): Uint8Array => {
  const parsed = decodePacket(data)
  if (parsed.status === "complete") return data.subarray(0, parsed.length)
  let end = data.length
  while (end > 0 && data[end - 1] === 0) end--
  return data.subarray(0, end)
}

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

/* Потоковый разбор ответа slcan-адаптера: push(байты порта, время) → собранные пакеты; незавершённая сессия живёт sessionTimeoutMs от последнего фрагмента, обрывок строки - столько же, сессия длиннее maxPacketBytes сбрасывается. Собранное выдаётся, только если это целый пакет 0x9F ... 0xFF: при потерянном или истёкшем начале обрывок отбрасывается */
export const createCanParser = ({ sessionTimeoutMs = 2000, maxPacketBytes = 8192 } = {}) => {
  const framer = createFramer({ gapMs: sessionTimeoutMs })
  const sessions = new Map<number, { parts: Uint8Array[]; size: number; timestamp: number; last: number }>()
  return {
    push(chunk: Uint8Array, now = Date.now()): CanMessage[] {
      for (const [id, session] of sessions) if (now - session.last > sessionTimeoutMs) sessions.delete(id)
      const messages: CanMessage[] = []
      framer.push(chunk, now, (bytes) => {
        const end = bytes.indexOf(CR)
        if (end < 0) return bytes.length > framer.maxBytes ? bytes.length : 0
        const match = SLCAN_FRAME.exec(decoder.decode(bytes.subarray(0, end)))
        if (!match) return end + 1
        const [type, idHex, dlcHex, dataHex] = match[1] ? match.slice(1, 5) : match.slice(5, 9)
        const lower = type.toLowerCase()
        const canId = parseInt(idHex, 16)
        const packetId = canId & CAN_PACKET_ID_MASK
        if (lower === "r") {
          messages.push({ canId, packetId, data: new Uint8Array(), remote: true, timestamp: now })
          return end + 1
        }
        const dlc = parseInt(dlcHex, 16)
        const size = Math.min(lower === "t" ? Math.min(dlc, 8) : fdLength(dlc), dataHex.length >> 1)
        const data = hexToBytes(dataHex.slice(0, size * 2))!
        const session = sessions.get(packetId)
        if (!(canId & CAN_FINAL_BIT)) {
          /* Промежуточный фрагмент: копим; потерян последний и пакет разросся - сбрасываем */
          if (!session) sessions.set(packetId, { parts: [data], size: data.length, timestamp: now, last: now })
          else if (session.size + data.length > maxPacketBytes) sessions.delete(packetId)
          else {
            session.parts.push(data)
            session.size += data.length
            session.last = now
          }
          return end + 1
        }
        sessions.delete(packetId)
        const whole = session ? joinBytes([...session.parts, data], session.size + data.length) : data
        /* Начало потеряно или истекло - обрывок пакетом не выдаётся */
        if (decodePacket(whole).status !== "complete") return end + 1
        messages.push({ canId, packetId, data: lower === "t" ? whole : trimFdPadding(whole), remote: false, timestamp: session?.timestamp ?? now })
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

/* Команды открытия slcan-адаптера (CANable и совместимые): закрыть канал, скорость арбитража (S0..S8, SA..SD), для CAN FD - скорость данных (Y1..Y5), нормальный режим, без автоповтора, открыть канал - каждая строка заканчивается \r */
export const slcanOpenCommands = (bitrate: string, dataBitrate?: string): string[] =>
  ["C", bitrate, ...(dataBitrate ? [dataBitrate] : []), "M0", "A0", "O"].map((command) => `${command}\r`)
