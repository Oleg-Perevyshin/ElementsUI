/* src/lib/protocols/dronecan/bits.ts - побитовая упаковка чисел DroneCAN, перенос canardEncodeScalar, canardDecodeScalar, copyBitArray и преобразований float16 из libcanard (canard.c) */

/* Копия src_len бит из src (с бита src_offset) в dst (с бита dst_offset); биты внутри байта идут от старшего к младшему */
export const copyBitArray = (src: Uint8Array, srcOffset: number, srcLen: number, dst: Uint8Array, dstOffset: number): void => {
  let s = srcOffset
  let d = dstOffset
  const last = srcOffset + srcLen
  while (last - s > 0) {
    const sBit = s % 8
    const dBit = d % 8
    const copy = Math.min(last - s, 8 - Math.max(sBit, dBit))
    const writeMask = ((0xff00 >> copy) & 0xff) >> dBit
    const srcData = (((src[s >> 3] ?? 0) << sBit) & 0xff) >> dBit
    dst[d >> 3] = (dst[d >> 3] & ~writeMask & 0xff) | (srcData & writeMask)
    s += copy
    d += copy
  }
}

/* Число в bit_length бит: младшие байты вперёд, неполный последний байт сдвинут к старшим битам, затем побитовая копия */
export const encodeScalar = (dst: Uint8Array, bitOffset: number, bitLength: number, value: bigint): void => {
  const storage = new Uint8Array(8)
  let v = BigInt.asUintN(64, value)
  for (let i = 0; i < 8; i++, v >>= 8n) storage[i] = Number(v & 0xffn)
  if (bitLength % 8) storage[bitLength >> 3] = (storage[bitLength >> 3] << (8 - (bitLength % 8))) & 0xff
  copyBitArray(storage, 0, bitLength, dst, bitOffset)
}

/* Обратное: bit_length бит с bit_offset; биты за концом данных читаются нулями; signed - расширение знака */
export const decodeScalar = (src: Uint8Array, bitOffset: number, bitLength: number, signed: boolean): bigint => {
  const storage = new Uint8Array(8)
  const available = Math.max(0, Math.min(bitLength, src.length * 8 - bitOffset))
  if (available > 0) copyBitArray(src, bitOffset, available, storage, 0)
  if (bitLength % 8) storage[bitLength >> 3] = storage[bitLength >> 3] >> (8 - (bitLength % 8))
  let v = 0n
  for (let i = 7; i >= 0; i--) v = (v << 8n) | BigInt(storage[i])
  v = BigInt.asUintN(bitLength, v)
  return signed ? BigInt.asIntN(bitLength, v) : v
}

const f32 = new Float32Array(1)
const u32 = new Uint32Array(f32.buffer)
const asFloat = (bits: number) => ((u32[0] = bits >>> 0), f32[0])
const asBits = (value: number) => ((f32[0] = value), u32[0])

/* float32 -> float16 (canardConvertNativeFloatToFloat16): округление, переполнение - бесконечность, NaN - 0x7FFF */
export const floatToFloat16 = (value: number): number => {
  const F32_INF = 255 << 23
  const F16_INF = 31 << 23
  const MAGIC = asFloat(15 << 23)
  const ROUND_MASK = 0xfffff000
  let bits = asBits(value)
  const sign = bits & 0x80000000
  bits = (bits ^ sign) >>> 0
  let out: number
  if (bits >= F32_INF) out = bits > F32_INF ? 0x7fff : 0x7c00
  else {
    bits = (bits & ROUND_MASK) >>> 0
    bits = asBits(asFloat(bits) * MAGIC)
    bits = (bits - ROUND_MASK) >>> 0
    if (bits > F16_INF) bits = F16_INF
    out = bits >>> 13
  }
  return (out | (sign >>> 16)) & 0xffff
}

/* float16 -> float32 (canardConvertFloat16ToNativeFloat) */
export const float16ToFloat = (value: number): number => {
  const MAGIC = asFloat((254 - 15) << 23)
  const WAS_INF_NAN = asFloat((127 + 16) << 23)
  let bits = (value & 0x7fff) << 13
  let f = asFloat(bits) * MAGIC
  bits = asBits(f)
  if (f >= WAS_INF_NAN) bits = (bits | (255 << 23)) >>> 0
  bits = (bits | ((value & 0x8000) << 16)) >>> 0
  f = asFloat(bits)
  return f
}
