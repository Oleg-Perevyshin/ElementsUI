/* src/lib/protocols/dronecan/transfer.ts - передачи DroneCAN поверх кадров CAN с 29-битным ID: разбор и сборка ID, хвостовой байт (начало, конец, toggle, transfer_id), CRC-16 многокадровой передачи с сигнатурой типа - перенос canardHandleRxFrame, enqueueTxFrames и calculateCRC из libcanard (canard.c) */

export type DroneCanTransferType = "msg" | "req" | "res"

/* Поля 29-битного ID: приоритет 24..28; сообщение - ID типа 8..23 (у анонимного - 2 бита и дискриминатор), сервис - ID 16..23, запрос/ответ - бит 15, получатель 8..14, бит 7 - сервис; отправитель 0..6 */
export interface DroneCanId {
  priority: number
  type: DroneCanTransferType
  dataTypeId: number
  source: number
  destination: number
}

export const parseDroneCanId = (canId: number): DroneCanId => {
  const priority = (canId >>> 24) & 0x1f
  const source = canId & 0x7f
  if (!((canId >>> 7) & 1)) {
    let dataTypeId = (canId >>> 8) & 0xffff
    if (source === 0) dataTypeId &= 0x3
    return { priority, type: "msg", dataTypeId, source, destination: 0 }
  }
  return {
    priority,
    type: (canId >>> 15) & 1 ? "req" : "res",
    dataTypeId: (canId >>> 16) & 0xff,
    source,
    destination: (canId >>> 8) & 0x7f,
  }
}

export const makeDroneCanId = (id: DroneCanId): number => {
  const head = ((id.priority & 0x1f) << 24) >>> 0
  if (id.type === "msg") return (head | ((id.dataTypeId & 0xffff) << 8) | (id.source & 0x7f)) >>> 0
  return (head | ((id.dataTypeId & 0xff) << 16) | ((id.type === "req" ? 1 : 0) << 15) | ((id.destination & 0x7f) << 8) | 0x80 | (id.source & 0x7f)) >>> 0
}

/* CRC-16-CCITT (0x1021, начальное 0xFFFF): сначала 8 байт сигнатуры младшим вперёд, затем данные */
const crcAddByte = (crc: number, byte: number) => {
  crc ^= byte << 8
  for (let j = 0; j < 8; j++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff
  return crc
}
const crcAdd = (crc: number, bytes: Uint8Array) => bytes.reduce(crcAddByte, crc)
const crcAddSignature = (crc: number, signature: bigint) => {
  for (let shift = 0n; shift < 64n; shift += 8n) crc = crcAddByte(crc, Number((signature >> shift) & 0xffn))
  return crc
}
export const droneCanCrc = (signature: bigint, payload: Uint8Array) => crcAdd(crcAddSignature(0xffff, signature), payload)

const TAIL_START = 0x80
const TAIL_END = 0x40
const TAIL_TOGGLE = 0x20

/* Передача в кадры CAN (данные до 8 байт): до 7 байт - один кадр, иначе CRC в первых двух байтах и куски по 7 байт; последний байт кадра - хвостовой */
export const droneCanFrames = (canId: number, payload: Uint8Array, transferId: number, signature: bigint): Uint8Array[] => {
  const tid = transferId & 0x1f
  if (payload.length < 8) {
    const frame = new Uint8Array(payload.length + 1)
    frame.set(payload)
    frame[payload.length] = TAIL_START | TAIL_END | tid
    return [frame]
  }
  const crc = droneCanCrc(signature, payload)
  const stream = new Uint8Array(payload.length + 2)
  stream[0] = crc & 0xff
  stream[1] = crc >> 8
  stream.set(payload, 2)
  const frames: Uint8Array[] = []
  for (let offset = 0, toggle = 0; offset < stream.length; offset += 7, toggle ^= 1) {
    const chunk = stream.subarray(offset, offset + 7)
    const frame = new Uint8Array(chunk.length + 1)
    frame.set(chunk)
    const flags = (offset === 0 ? TAIL_START : 0) | (offset + 7 >= stream.length ? TAIL_END : 0)
    frame[chunk.length] = flags | (toggle ? TAIL_TOGGLE : 0) | tid
    frames.push(frame)
  }
  return frames
}

export interface DroneCanTransfer extends DroneCanId {
  transferId: number
  payload: Uint8Array
  timestamp: number
  /* Многокадровая передача: CRC совпала */
  crcOk: boolean
  frames: number
}

/* Сборщик передач: по ключу (тип, вид, отправитель, получатель) копит кадры с проверкой toggle и transfer_id; незавершённое старше timeoutMs сбрасывается. signatureOf - сигнатура типа для CRC; неизвестный тип многокадровой передачи выдаётся с crcOk = false. В отличие от libcanard принимает передачи всем узлам - терминал видит всю шину */
export const createDroneCanReceiver = ({ timeoutMs = 2000, signatureOf }: { timeoutMs?: number; signatureOf: (id: DroneCanId) => bigint | undefined }) => {
  /* crc -1 - сигнатура типа неизвестна, проверить нельзя; expected - CRC из первого кадра */
  type State = {
    tid: number
    toggle: number
    parts: Uint8Array[]
    size: number
    crc: number
    expected: number
    timestamp: number
    last: number
    frames: number
  }
  const states = new Map<string, State>()
  return {
    push(canId: number, data: Uint8Array, now = Date.now()): DroneCanTransfer | undefined {
      if (data.length < 1) return undefined
      const id = parseDroneCanId(canId)
      const tail = data[data.length - 1]
      const tid = tail & 0x1f
      const start = !!(tail & TAIL_START)
      const end = !!(tail & TAIL_END)
      const body = data.subarray(0, data.length - 1)
      if (start && end) return { ...id, transferId: tid, payload: body.slice(), timestamp: now, crcOk: true, frames: 1 }
      const key = `${id.type}:${id.dataTypeId}:${id.source}:${id.destination}`
      for (const [k, s] of states) if (now - s.last > timeoutMs) states.delete(k)
      if (start) {
        if (body.length < 2) return undefined
        const signature = signatureOf(id)
        states.set(key, {
          tid,
          toggle: 1,
          parts: [body.subarray(2).slice()],
          size: body.length - 2,
          crc: signature === undefined ? -1 : crcAdd(crcAddSignature(0xffff, signature), body.subarray(2)),
          expected: body[0] | (body[1] << 8),
          timestamp: now,
          last: now,
          frames: 1,
        })
        return undefined
      }
      const state = states.get(key)
      if (!state || state.tid !== tid || !!(tail & TAIL_TOGGLE) !== !!state.toggle) {
        states.delete(key)
        return undefined
      }
      state.parts.push(body.slice())
      state.size += body.length
      state.toggle ^= 1
      state.last = now
      state.frames++
      if (state.crc >= 0) state.crc = crcAdd(state.crc, body)
      if (!end) return undefined
      states.delete(key)
      const payload = new Uint8Array(state.size)
      let offset = 0
      for (const part of state.parts) {
        payload.set(part, offset)
        offset += part.length
      }
      return { ...id, transferId: tid, payload, timestamp: state.timestamp, crcOk: state.crc === state.expected, frames: state.frames }
    },
    reset() {
      states.clear()
    },
  }
}
