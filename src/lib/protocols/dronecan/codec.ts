/* src/lib/protocols/dronecan/codec.ts - сериализация структур DroneCAN по описаниям DSDL: порядок полей, union с тегом, массивы с длиной и оптимизация хвостового массива (TAO) - как в кодеках dronecan_dsdlc (templates/msg.h.em) */
import { decodeScalar, encodeScalar, float16ToFloat, floatToFloat16 } from "./bits.js"
import { DRONECAN_TYPES } from "./generated/types.js"
import type { DroneCanField, DroneCanStruct, DroneCanTypeDef } from "./types.js"

export type DroneCanValue = number | bigint | boolean | string | DroneCanValue[] | { [key: string]: DroneCanValue }

/* Реестр: по имени; по ID отдельно сообщения и сервисы. При совпадении ID у разных производителей побеждает стандартное пространство uavcan, затем dronecan, ardupilot */
const RANK = ["uavcan.", "dronecan.", "ardupilot."]
const rank = (name: string) => {
  const i = RANK.findIndex((prefix) => name.startsWith(prefix))
  return i < 0 ? RANK.length : i
}
const byName = new Map<string, DroneCanTypeDef>()
const messages = new Map<number, DroneCanTypeDef>()
const services = new Map<number, DroneCanTypeDef>()
for (const def of DRONECAN_TYPES) {
  byName.set(def.name, def)
  if (def.id === null) continue
  const map = def.kind === "msg" ? messages : services
  const current = map.get(def.id)
  if (!current || rank(def.name) < rank(current.name)) map.set(def.id, def)
}

export const droneCanType = (name: string): DroneCanTypeDef | undefined => byName.get(name)
export const droneCanMessage = (id: number): DroneCanTypeDef | undefined => messages.get(id)
export const droneCanService = (id: number): DroneCanTypeDef | undefined => services.get(id)
export const droneCanTypes = (): readonly DroneCanTypeDef[] => DRONECAN_TYPES

/* Структура типа: у сообщения одна, у сервиса - запрос или ответ */
export const droneCanStruct = (def: DroneCanTypeDef, part: "msg" | "req" | "res" = "msg"): DroneCanStruct => {
  if (def.kind === "msg") return def.msg
  return part === "res" ? def.res : def.req
}

const nested = (name: string): DroneCanStruct => {
  const def = byName.get(name)
  if (!def || def.kind !== "msg") throw new Error(`DroneCAN: нет вложенного типа ${name}`)
  return def.msg
}
const bitLength = (n: number) => (n <= 0 ? 0 : 32 - Math.clz32(n))
const minBits = (t: DroneCanField): number => (t.k === "a" ? (t.dyn ? 0 : t.max * minBits(t.of)) : t.k === "c" ? nested(t.name).min : t.bits)
const unionTagBits = (s: DroneCanStruct) => bitLength(Math.max(s.fields.length - 1, 1))
/* Хвостовой динамический массив без поля длины: последний в структуре и элемент не короче байта */
const isTaoArray = (t: DroneCanField, isLast: boolean) => t.k === "a" && !!t.dyn && isLast && minBits(t.of) >= 8

/* Массив байт из 8-битных чисел печатных ASCII - строка (имена, единицы), пустой - пустая строка; иначе список чисел */
const isText = (t: DroneCanField) => t.k === "a" && !!t.dyn && t.of.k === "p" && t.of.kind === "u" && t.of.bits === 8
const toText = (bytes: number[]): DroneCanValue => (bytes.every((b) => b >= 0x20 && b <= 0x7e) ? String.fromCharCode(...bytes) : bytes)

/* ---------- Разбор ---------- */

class Reader {
  bit = 0
  constructor(readonly data: Uint8Array) {}
  get left() {
    return this.data.length * 8 - this.bit
  }
  read(bits: number, signed: boolean) {
    const v = decodeScalar(this.data, this.bit, bits, signed)
    this.bit += bits
    return v
  }
}

const readPrimitive = (r: Reader, t: Extract<DroneCanField, { k: "p" }>): DroneCanValue => {
  if (t.kind === "b") return r.read(1, false) === 1n
  if (t.kind === "f") {
    const raw = r.read(t.bits, false)
    if (t.bits === 16) return float16ToFloat(Number(raw))
    const view = new DataView(new ArrayBuffer(8))
    if (t.bits === 32) {
      view.setUint32(0, Number(raw))
      return view.getFloat32(0)
    }
    view.setBigUint64(0, raw)
    return view.getFloat64(0)
  }
  const v = r.read(t.bits, t.kind === "i")
  return v >= BigInt(Number.MIN_SAFE_INTEGER) && v <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(v) : v
}

const readField = (r: Reader, t: DroneCanField, tao: boolean, isLast: boolean): DroneCanValue | undefined => {
  if (t.k === "v") {
    r.bit += t.bits
    return undefined
  }
  if (t.k === "p") return readPrimitive(r, t)
  if (t.k === "c") return readStruct(r, nested(t.name), tao)
  const items: DroneCanValue[] = []
  if (!t.dyn) {
    for (let i = 0; i < t.max; i++) items.push(readField(r, t.of, false, false)!)
    return items
  }
  if (tao && isTaoArray(t, isLast)) {
    if (t.of.k === "p") {
      const count = Math.floor(r.left / t.of.bits)
      if (count > t.max) throw new Error("DroneCAN: массив длиннее допустимого")
      for (let i = 0; i < count; i++) items.push(readPrimitive(r, t.of))
    } else {
      /* Элементы TAO не короче байта - читаем, пока осталось больше 7 бит */
      while (r.left > 7) {
        if (items.length >= t.max) throw new Error("DroneCAN: массив длиннее допустимого")
        items.push(readField(r, t.of, false, false)!)
      }
    }
  } else {
    const count = Number(r.read(bitLength(t.max), false))
    if (count > t.max) throw new Error("DroneCAN: длина массива больше допустимой")
    for (let i = 0; i < count; i++) items.push(readField(r, t.of, false, false)!)
  }
  return isText(t) ? toText(items as number[]) : items
}

const readStruct = (r: Reader, s: DroneCanStruct, tao: boolean): { [key: string]: DroneCanValue } => {
  const out: { [key: string]: DroneCanValue } = {}
  if (s.union) {
    const tag = Number(r.read(unionTagBits(s), false))
    const field = s.fields[tag]
    if (!field) throw new Error("DroneCAN: неверный тег union")
    out[field.name!] = readField(r, field.type, tao, tag === s.fields.length - 1)!
    return out
  }
  s.fields.forEach((field, i) => {
    const isLast = i === s.fields.length - 1
    const value = readField(r, field.type, field.type.k === "c" ? tao && isLast : tao, isLast)
    if (field.name && value !== undefined) out[field.name] = value
  })
  return out
}

/* Разбор полезной нагрузки передачи; tao - классический CAN (у CAN FD хвостовой массив передаётся с длиной). Длина должна сойтись байт в байт, как в libcanard */
export const decodeDroneCan = (s: DroneCanStruct, payload: Uint8Array, tao = true): { [key: string]: DroneCanValue } => {
  const r = new Reader(payload)
  const value = readStruct(r, s, tao)
  const used = Math.ceil(r.bit / 8)
  if (tao ? used !== payload.length : used > payload.length) throw new Error(`DroneCAN: длина ${payload.length} байт, по описанию ${used}`)
  return value
}

/* ---------- Сборка ---------- */

class Writer {
  bit = 0
  data: Uint8Array
  constructor(maxBits: number) {
    this.data = new Uint8Array(Math.ceil(maxBits / 8) + 8)
  }
  write(bits: number, value: bigint) {
    encodeScalar(this.data, this.bit, bits, value)
    this.bit += bits
  }
}

const toNumber = (value: unknown, name: string): number => {
  const n = typeof value === "boolean" ? Number(value) : typeof value === "bigint" ? Number(value) : Number(value ?? 0)
  if (!Number.isFinite(n)) throw new Error(`DroneCAN: «${name}» - не число`)
  return n
}

const writePrimitive = (w: Writer, t: Extract<DroneCanField, { k: "p" }>, value: unknown, name: string) => {
  if (t.kind === "b") return w.write(1, value === true || value === 1 || value === "true" ? 1n : 0n)
  if (t.kind === "f") {
    const n = toNumber(value, name)
    if (t.bits === 16) return w.write(16, BigInt(floatToFloat16(n)))
    const view = new DataView(new ArrayBuffer(8))
    if (t.bits === 32) {
      view.setFloat32(0, n)
      return w.write(32, BigInt(view.getUint32(0)))
    }
    view.setFloat64(0, n)
    return w.write(64, view.getBigUint64(0))
  }
  let v = typeof value === "bigint" ? value : BigInt(Math.trunc(toNumber(value, name)))
  /* saturated - значение вне диапазона прижимается к краю, truncated - лишние старшие биты отбрасываются */
  if (!t.trunc) {
    const min = t.kind === "i" ? -(1n << BigInt(t.bits - 1)) : 0n
    const max = t.kind === "i" ? (1n << BigInt(t.bits - 1)) - 1n : (1n << BigInt(t.bits)) - 1n
    v = v < min ? min : v > max ? max : v
  }
  w.write(t.bits, v)
}

const asItems = (value: unknown): unknown[] => {
  if (value === undefined || value === null) return []
  if (typeof value === "string") return Array.from(new TextEncoder().encode(value))
  if (value instanceof Uint8Array) return Array.from(value)
  if (Array.isArray(value)) return value
  throw new Error("DroneCAN: ожидался массив")
}

const writeField = (w: Writer, t: DroneCanField, value: unknown, name: string, tao: boolean, isLast: boolean): void => {
  if (t.k === "v") {
    w.bit += t.bits
    return
  }
  if (t.k === "p") return writePrimitive(w, t, value, name)
  if (t.k === "c") return writeStruct(w, nested(t.name), (value ?? {}) as Record<string, unknown>, tao)
  const items = asItems(value)
  if (!t.dyn) {
    for (let i = 0; i < t.max; i++) writeField(w, t.of, items[i] ?? 0, name, false, false)
    return
  }
  const count = Math.min(items.length, t.max)
  if (!(tao && isTaoArray(t, isLast))) w.write(bitLength(t.max), BigInt(count))
  for (let i = 0; i < count; i++) writeField(w, t.of, items[i], name, false, false)
}

const writeStruct = (w: Writer, s: DroneCanStruct, value: Record<string, unknown>, tao: boolean): void => {
  if (s.union) {
    /* Union не задан (нет ключей) - первый вариант по умолчанию, как недостающие поля; ключи есть, но ни одного варианта - ошибка */
    const found = s.fields.findIndex((f) => f.name !== null && f.name in value)
    const tag = found < 0 && !Object.keys(value).length ? 0 : found
    if (tag < 0) throw new Error(`DroneCAN: в union нужно одно из полей: ${s.fields.map((f) => f.name).join(", ")}`)
    w.write(unionTagBits(s), BigInt(tag))
    return writeField(w, s.fields[tag].type, value[s.fields[tag].name!], s.fields[tag].name!, tao, tag === s.fields.length - 1)
  }
  s.fields.forEach((field, i) => {
    const isLast = i === s.fields.length - 1
    writeField(w, field.type, field.name ? value[field.name] : undefined, field.name ?? "", field.type.k === "c" ? tao && isLast : tao, isLast)
  })
}

/* Полезная нагрузка передачи из значения; недостающие поля - нули, пустые строки и массивы */
export const encodeDroneCan = (s: DroneCanStruct, value: Record<string, unknown>, tao = true): Uint8Array => {
  const w = new Writer(s.max)
  writeStruct(w, s, value, tao)
  return w.data.slice(0, Math.ceil(w.bit / 8))
}
