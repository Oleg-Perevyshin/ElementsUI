/* CBOR энкодер - реализует кодирование данных в бинарный формат CBOR (RFC 8949) */

import { CborMajorType, CborAdditionalInfo, CborSimpleValue, type CborValue, CborTag, CBOR_BREAK, CborError } from "./types.js"

/* Класс энкодера CBOR */
export class CborEncoder {
  private buffer: number[]

  constructor(initialCapacity: number = 256) {
    this.buffer = []
    /* Pre-allocate buffer */
    this.buffer.length = initialCapacity
    this.buffer.length = 0
  }

  /* Получить закодированные данные как Uint8Array */
  public getResult(): Uint8Array {
    return new Uint8Array(this.buffer)
  }

  /* Публичные методы кодирования */

  /* Закодировать null */
  public encodeNull(): this {
    this.writeHeader(CborMajorType.Simple, BigInt(CborSimpleValue.Null))
    return this
  }

  /* Закодировать boolean */
  public encodeBoolean(value: boolean): this {
    this.writeHeader(CborMajorType.Simple, BigInt(value ? CborSimpleValue.True : CborSimpleValue.False))
    return this
  }

  /* Закодировать unsigned integer */
  public encodeUnsigned(value: number | bigint): this {
    const bigValue = typeof value === "bigint" ? value : BigInt(value)
    if (bigValue < 0) {
      throw new CborError("Value must be non-negative")
    }
    this.writeHeader(CborMajorType.UnsignedInteger, bigValue)
    return this
  }

  /* Закодировать signed integer */
  public encodeInt(value: number | bigint): this {
    if (value >= 0) {
      return this.encodeUnsigned(value)
    }

    /* Negative integers: encode as -1 - value */
    const bigValue = typeof value === "bigint" ? value : BigInt(value)
    const encodedValue = -(bigValue + BigInt(1))
    this.writeHeader(CborMajorType.NegativeInteger, encodedValue)
    return this
  }

  /* Закодировать float32 */
  public encodeFloat32(value: number): this {
    /* Float32: header = (7 << 5) | 26 = 0xFA */
    this.buffer.push((CborMajorType.Simple << 5) | CborAdditionalInfo.Float32)

    /* Convert float to bits and write as big-endian */
    const buffer = new ArrayBuffer(4)
    const view = new DataView(buffer)
    view.setFloat32(0, value, false)
    const bits = view.getUint32(0, false)

    this.buffer.push((bits >> 24) & 0xff)
    this.buffer.push((bits >> 16) & 0xff)
    this.buffer.push((bits >> 8) & 0xff)
    this.buffer.push(bits & 0xff)

    return this
  }

  /* Закодировать float64 (double) */
  public encodeFloat64(value: number): this {
    /* Float64: header = (7 << 5) | 27 = 0xFB */
    this.buffer.push((CborMajorType.Simple << 5) | CborAdditionalInfo.Float64)

    /* Convert double to bits and write as big-endian */
    const buffer = new ArrayBuffer(8)
    const view = new DataView(buffer)
    view.setFloat64(0, value, false)
    const bits = view.getBigUint64(0, false)

    /* Write as big-endian (8 bytes) */
    const high = Number((bits >> BigInt(32)) & BigInt(0xffffffff))
    const low = Number(bits & BigInt(0xffffffff))

    this.buffer.push((high >> 24) & 0xff)
    this.buffer.push((high >> 16) & 0xff)
    this.buffer.push((high >> 8) & 0xff)
    this.buffer.push(high & 0xff)
    this.buffer.push((low >> 24) & 0xff)
    this.buffer.push((low >> 16) & 0xff)
    this.buffer.push((low >> 8) & 0xff)
    this.buffer.push(low & 0xff)

    return this
  }

  /* Закодировать число с плавающей точкой - автоматически выбирает между float16/float32/float64 */
  public encodeNumber(value: number): this {
    /* Проверяем special значения */
    if (!Number.isFinite(value)) {
      /* NaN или Infinity -> encode as null или special */
      if (Number.isNaN(value)) {
        return this.encodeNull()
      }
      return value > 0 ? this.encodeFloat64(Infinity) : this.encodeFloat64(-Infinity)
    }

    /* Проверяем можно ли сохранить как integer */
    if (Number.isInteger(value)) {
      return this.encodeInt(value)
    }

    /* Проверяем, можем ли мы представить значение точно как float16 (диапазон ≈ ±65504) */
    const canBeFloat16 = this.canBeFloat16(value)
    if (canBeFloat16) {
      return this.encodeFloat16(value)
    }

    /* Проверяем, можем ли мы представить значение точно как float32, через Math.fround() */
    const asFloat32 = Math.fround(value)
    if (asFloat32 === value && isFinite(asFloat32)) {
      return this.encodeFloat32(asFloat32)
    }

    /* Иначе используем float64 */
    return this.encodeFloat64(value)
  }

  /* Проверить, может ли значение быть точно представлено как float16 */
  private canBeFloat16(value: number): boolean {
    /* Диапазон float16: ±65504 (максимум), субнормали от ±6e-8 */
    if (value !== 0 && (Math.abs(value) < 0.00006103515625 || Math.abs(value) > 65504)) {
      return false
    }

    /* Convert to float16 representation */
    const float16Bits = this.float32ToFloat16(value)

    /* Convert back to float32 */
    const backToFloat32 = this.float16ToFloat32(float16Bits)

    return backToFloat32 === value
  }

  /* Преобразовать float32 в биты float16 */
  private float32ToFloat16(value: number): number {
    const buffer = new ArrayBuffer(4)
    const view = new DataView(buffer)
    view.setFloat32(0, value, false)
    const float32Bits = view.getUint32(0, false)

    const sign = (float32Bits >> 31) & 0x1
    const exponent = (float32Bits >> 23) & 0xff
    const mantissa = float32Bits & 0x7fffff

    /* Float16: 1 sign + 5 экспонента + 10 мантиссы, Float32: 1 sign + 8 экспонента + 23 мантиссы */

    /* Subnormal/zero и Infinity/NaN для простоты не конвертируем, считаем что нужен float32 */
    if (exponent === 0) {
      return 0
    }

    if (exponent === 0xff) {
      return 0
    }

    /* Переводим экспоненту из смещения float32 (127) в смещение float16 (15) */
    const float16Exponent = exponent - 127 + 15

    /* Экспонента вне диапазона float16 */
    if (float16Exponent < 0 || float16Exponent > 30) {
      return 0
    }

    /* Младшие 13 бит мантиссы потеряются при конвертации в float16 - точность не сохранится */
    if ((mantissa & 0x1fff) !== 0) {
      return 0
    }

    const float16Mantissa = mantissa >> 13
    const float16Bits = (sign << 15) | (float16Exponent << 10) | float16Mantissa

    return float16Bits
  }

  /* Преобразовать биты float16 обратно в float32 */
  private float16ToFloat32(float16Bits: number): number {
    const sign = (float16Bits >> 15) & 0x1
    const exponent = (float16Bits >> 10) & 0x1f
    const mantissa = float16Bits & 0x3ff

    let float32Bits: number

    if (exponent === 0) {
      /* Subnormal or zero */
      if (mantissa === 0) {
        float32Bits = sign << 31
      } else {
        /* Subnormal float16 to subnormal float32 */
        const float32Mantissa = mantissa << 13
        float32Bits = (sign << 31) | (float32Mantissa & 0x7fffff)
      }
    } else if (exponent === 31) {
      /* Infinity or NaN */
      const float32Exponent = 0xff
      const float32Mantissa = mantissa << 13
      float32Bits = (sign << 31) | (float32Exponent << 23) | float32Mantissa
    } else {
      /* Normal number */
      const float32Exponent = exponent - 15 + 127
      const float32Mantissa = mantissa << 13
      float32Bits = (sign << 31) | (float32Exponent << 23) | float32Mantissa
    }

    const buffer = new ArrayBuffer(4)
    const view = new DataView(buffer)
    view.setUint32(0, float32Bits, false)
    return view.getFloat32(0, false)
  }

  /* Закодировать float16 (half precision) */
  public encodeFloat16(value: number): this {
    /* Float16: header = (7 << 5) | 25 = 0xF9 */
    this.buffer.push((CborMajorType.Simple << 5) | CborAdditionalInfo.Float16)

    /* Convert float32 to float16 bits */
    const float16Bits = this.float32ToFloat16(value)

    /* Write as big-endian (2 bytes) */
    this.buffer.push((float16Bits >> 8) & 0xff)
    this.buffer.push(float16Bits & 0xff)

    return this
  }

  /* Закодировать UTF-8 строку */
  public encodeString(value: string): this {
    const encoder = new TextEncoder()
    const bytes = encoder.encode(value)
    this.writeHeader(CborMajorType.Utf8String, BigInt(bytes.length))
    this.writeBytes(Array.from(bytes))
    return this
  }

  /* Закодировать байтовую строку */
  public encodeBytes(value: Uint8Array | number[]): this {
    const bytes = value instanceof Uint8Array ? Array.from(value) : value
    this.writeHeader(CborMajorType.ByteString, BigInt(bytes.length))
    this.writeBytes(bytes)
    return this
  }

  /* Начать кодирование массива - count элементов или null для неопределённой длины */
  public encodeArrayStart(count: number | null): this {
    if (count === null) this.writeIndefiniteHeader(CborMajorType.Array)
    else this.writeHeader(CborMajorType.Array, BigInt(count))
    return this
  }

  /* Начать кодирование словаря (map) - count пар ключ-значение или null для неопределённой длины */
  public encodeMapStart(count: number | null): this {
    if (count === null) this.writeIndefiniteHeader(CborMajorType.Map)
    else this.writeHeader(CborMajorType.Map, BigInt(count))
    return this
  }

  /* Записать break-символ для неопределённой длины */
  public encodeBreak(): this {
    this.buffer.push(CBOR_BREAK)
    return this
  }

  /* Закодировать тег */
  public encodeTag(tag: number | bigint): this {
    const bigTag = typeof tag === "bigint" ? tag : BigInt(tag)
    this.writeHeader(CborMajorType.Tag, bigTag)
    return this
  }

  /* Закодировать CBOR значение */
  public encode(value: CborValue): this {
    /* null */
    if (value === null) return this.encodeNull()

    /* undefined */
    if (value === undefined) {
      this.writeHeader(CborMajorType.Simple, BigInt(CborSimpleValue.Undefined))
      return this
    }

    /* boolean */
    if (typeof value === "boolean") return this.encodeBoolean(value)

    /* number */
    if (typeof value === "number") return this.encodeNumber(value)

    /* bigint */
    if (typeof value === "bigint") return this.encodeInt(value)

    /* string */
    if (typeof value === "string") return this.encodeString(value)

    /* Uint8Array */
    if (value instanceof Uint8Array) return this.encodeBytes(value)

    /* Array */
    if (Array.isArray(value)) {
      this.encodeArrayStart(value.length)
      for (const item of value) {
        this.encode(item)
      }
      return this
    }

    /* Map */
    if (value instanceof Map) {
      this.encodeMapStart(value.size)
      for (const [key, val] of value) {
        this.encode(key)
        this.encode(val)
      }
      return this
    }

    /* CborTag */
    if (value instanceof CborTag) {
      this.encodeTag(value.tag)
      this.encode(value.value)
      return this
    }

    throw new CborError(`Unsupported value type: ${typeof value}`)
  }

  /* Приватные методы */

  /* Записать заголовок indefinite-length контейнера (значение 31 умещается в самом первом байте, доп. байты не нужны — writeHeader трактовал бы 31 как обычное число и ошибочно дописывал бы ещё один байт) */
  private writeIndefiniteHeader(majorType: CborMajorType): void {
    this.buffer.push((majorType << 5) | CborAdditionalInfo.Indefinite)
  }

  /* Записать заголовок CBOR */
  private writeHeader(majorType: CborMajorType, value: bigint): void {
    const major = majorType
    let additional: number
    let size: number

    if (value < BigInt(24)) {
      /* 0-23: directly in additional bits */
      additional = Number(value)
      size = 1
    } else if (value <= BigInt(0xff)) {
      /* 24: 1 byte */
      additional = CborAdditionalInfo.NumByte
      size = 2
    } else if (value <= BigInt(0xffff)) {
      /* 25: 2 bytes */
      additional = CborAdditionalInfo.Float16
      size = 3
    } else if (value <= BigInt(0xffffffff)) {
      /* 26: 4 bytes */
      additional = CborAdditionalInfo.Float32
      size = 5
    } else {
      /* 27: 8 bytes */
      additional = CborAdditionalInfo.Float64
      size = 9
    }

    /* Write first byte */
    this.buffer.push((major << 5) | additional)

    /* Write additional bytes if needed */
    if (size > 1) {
      const bytes = this.bigIntToBytes(value, size - 1)
      this.writeBytes(bytes)
    }
  }

  /* Преобразовать bigint в массив байтов (big-endian) */
  private bigIntToBytes(value: bigint, byteCount: number): number[] {
    const bytes: number[] = []
    let remaining = value

    for (let i = byteCount - 1; i >= 0; i--) {
      const shift = BigInt(i * 8)
      bytes.push(Number((remaining >> shift) & BigInt(0xff)))
    }

    return bytes
  }

  /* Записать массив байтов в буфер */
  private writeBytes(bytes: number[]): void {
    this.buffer.push(...bytes)
  }
}

/* Статическая функция для быстрого кодирования значения */
export function encodeCbor(value: CborValue): Uint8Array {
  const encoder = new CborEncoder()
  encoder.encode(value)
  return encoder.getResult()
}
