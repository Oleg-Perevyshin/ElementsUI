/* System Console: CBOR array [SrcID, HdrArg, Value, FHS, CRC16]. CRC-16/KERMIT covers the encoded
   first four array items, including the array header. UART is a stream; the definite array is self-delimiting. */
import { CborDecoder } from "./cbor/decoder.js"
import { CborEndOfDataError } from "./cbor/types.js"
import { crc16Kermit } from "./crc.js"
import { jsonToCbor } from "./cbor/json.js"
import { DEFAULT_ARGUMENT_CODES, HEADER_CODES, nameByCode } from "./dictionary.js"
import { makeCmd, splitCmd } from "./packet.js"

const MAX_TEXT_TAIL = 4096
const MAX_FRAME = 8192
const ARRAY5 = 0x85
const decoder = new TextDecoder()

export type XPoeDebugItem =
  | { type: "frame"; srcId: number; cmd: number; header: string; argument: string; value: string; valueBytes: Uint8Array; crc: string; crcOk: boolean; freeHeap: string }
  | { type: "raw"; text: string }

const encodeUInt = (input: number): number[] => {
  const value = BigInt(input)
  if (value < 24n) return [Number(value)]
  if (value <= 0xffn) return [0x18, Number(value)]
  if (value <= 0xffffn) return [0x19, Number(value >> 8n), Number(value & 0xffn)]
  if (value <= 0xffffffffn) return [0x1a, Number(value >> 24n), Number(value >> 16n & 0xffn), Number(value >> 8n & 0xffn), Number(value & 0xffn)]
  throw new Error("xPOE-Debug integer is out of range")
}

export const xPoeDebugCmd = (header: string, argument: string): number => {
  const hdr = HEADER_CODES[header]
  const arg = DEFAULT_ARGUMENT_CODES[argument]
  if (hdr === undefined || arg === undefined) throw new Error(`Hdr/Arg отсутствует в общем словаре: ${header} ${argument}`)
  return makeCmd(hdr, arg)
}

/* Команда терминала: CRC считается по тем CBOR-байтам, которые реально отправляются. */
export const encodeXPoeDebugFrame = (header: string, argument: string, value: Uint8Array, srcId = 0, freeHeap: number | null = null): Uint8Array => {
  const cmd = xPoeDebugCmd(header, argument)
  if (!Number.isInteger(srcId) || srcId < 0 || srcId > 0xffff || !Number.isInteger(cmd) || cmd < 0 || cmd > 0xffff)
    throw new Error("SrcID и HdrArg должны быть uint16")
  const valueParser = new CborDecoder(value)
  if (!valueParser.skipValue() || valueParser.offset !== value.length) throw new Error("Value должен содержать ровно один CBOR item")
  const prefix = new Uint8Array([ARRAY5, ...encodeUInt(srcId), ...encodeUInt(cmd), ...value, ...(freeHeap === null ? [0xf6] : encodeUInt(freeHeap))])
  const crc = crc16Kermit(0, prefix)
  return new Uint8Array([...prefix, ...encodeUInt(crc)])
}

const textItems = (bytes: Uint8Array) =>
  decoder.decode(bytes).split("\n").map((line) => line.trim()).filter((line) => line && ![...line].some((char) => char.charCodeAt(0) < 0x20 && char !== "\t")).map((text) => ({ type: "raw" as const, text }))

const readUInt = (value: unknown): number | null => typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 0xffff ? value : null

/* Декодирует одну definite array из начала буфера; null означает неполный или невалидный кадр. */
const frameItem = (buffer: Uint8Array): { status: "complete"; item: XPoeDebugItem; length: number } | { status: "incomplete" | "garbage" } => {
  if (buffer[0] !== ARRAY5) return { status: "garbage" }
  try {
    const cbor = new CborDecoder(buffer)
    cbor.decode() /* Проверка структуры и границы всего массива */
    const length = cbor.offset
    const fields = new CborDecoder(buffer.subarray(1, length))
    const srcId = readUInt(fields.decode())
    const cmd = readUInt(fields.decode())
    if (srcId === null || cmd === null) return { status: "garbage" }
    const valueStart = 1 + fields.offset
    if (!fields.skipValue()) return { status: "garbage" }
    const valueEnd = 1 + fields.offset
    const freeHeapValue = fields.decode()
    const crcStart = 1 + fields.offset
    const crc = readUInt(fields.decode())
    if (fields.offset !== length - 1 || crc === null || (freeHeapValue !== null && (typeof freeHeapValue !== "number" || !Number.isInteger(freeHeapValue) || freeHeapValue < 0))) return { status: "garbage" }
    const valueBytes = buffer.slice(valueStart, valueEnd)
    const { header, argument } = splitCmd(cmd)
    return {
      status: "complete",
      length,
      item: { type: "frame", srcId, cmd, header: Object.entries(HEADER_CODES).find(([, code]) => code === header)?.[0] ?? String(header), argument: nameByCode(DEFAULT_ARGUMENT_CODES, argument), value: Array.from(valueBytes, (byte) => byte.toString(16).padStart(2, "0").toUpperCase()).join(""), valueBytes, crc: crc.toString(16).toUpperCase().padStart(4, "0"), crcOk: crc16Kermit(0, buffer.subarray(0, crcStart)) === crc, freeHeap: typeof freeHeapValue === "number" ? String(freeHeapValue) : "" },
    }
  } catch (error) {
    if (error instanceof CborEndOfDataError) return { status: "incomplete" }
    return { status: "garbage" }
  }
}

const concat = (a: Uint8Array, b: Uint8Array) => {
  const out = new Uint8Array(a.length + b.length)
  out.set(a)
  out.set(b, a.length)
  return out
}

export const createXPoeDebugParser = () => {
  let buffer = new Uint8Array()
  return {
    push(chunk: Uint8Array): XPoeDebugItem[] {
      buffer = concat(buffer, chunk)
      const items: XPoeDebugItem[] = []
      while (buffer.length) {
        const start = buffer.indexOf(ARRAY5)
        if (start < 0) {
          const cut = buffer.length > MAX_TEXT_TAIL ? buffer.length : buffer.lastIndexOf(0x0a)
          if (cut >= 0) {
            items.push(...textItems(buffer.subarray(0, cut)))
            buffer = buffer.slice(Math.min(cut + 1, buffer.length))
          } else if (buffer.length > MAX_TEXT_TAIL) buffer = new Uint8Array()
          break
        }
        if (start > 0) {
          items.push(...textItems(buffer.subarray(0, start)))
          buffer = buffer.slice(start)
          continue
        }
        const parsed = frameItem(buffer)
        if (parsed.status === "incomplete") {
          if (buffer.length <= MAX_FRAME) break
          buffer = buffer.slice(1)
          continue
        }
        if (parsed.status === "garbage") { buffer = buffer.slice(1); continue }
        items.push(parsed.item)
        buffer = buffer.slice(parsed.length)
      }
      return items
    },
    reset() { buffer = new Uint8Array() },
  }
}

/* Value form input: ready CBOR hex passes through; JSON is converted to CBOR. */
export const xPoeDebugValueFromText = (text: string | undefined): Uint8Array => {
  const trimmed = (text ?? "").trim()
  if (!trimmed) return new Uint8Array([0xf6])
  if (/^([0-9A-Fa-f]{2}\s?)+$/.test(trimmed)) return Uint8Array.from(trimmed.replace(/\s/g, "").match(/../g) ?? [], (pair) => parseInt(pair, 16))
  let parsed: unknown
  try { parsed = JSON.parse(trimmed) } catch { throw new Error(`Value не является ни hex, ни JSON: ${trimmed}`) }
  return jsonToCbor(parsed)
}
