/* CBOR декодер - реализует декодирование бинарного формата CBOR (RFC 8949) */

import {
  CborMajorType,
  CborAdditionalInfo,
  CborSimpleValue,
  type CborValue,
  CborTag,
  type CborParserState,
  type CborHeader,
  CBOR_BREAK,
  CBOR_MAX_DEPTH,
  CborError,
  CborEndOfDataError,
  CborDepthLimitError,
} from "./types.js"

/* Класс декодера CBOR */
export class CborDecoder {
  private state: CborParserState

  constructor(buffer: ArrayBuffer | Uint8Array) {
    const uint8Array = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)

    this.state = {
      buffer: new DataView(uint8Array.buffer, uint8Array.byteOffset, uint8Array.byteLength),
      offset: 0,
      length: uint8Array.byteLength,
      depth: 0,
    }
  }

  /* Сколько байт уже прочитано — граница значения при разборе потока по одному значению */
  public get offset(): number {
    return this.state.offset
  }

  /* Основной метод декодирования - декодирует одно значение CBOR */
  public decode(): CborValue {
    this.state.depth++

    if (this.state.depth > CBOR_MAX_DEPTH) {
      this.state.depth--
      throw new CborDepthLimitError()
    }

    try {
      const header = this.readHeader()
      const value = this.decodeByType(header)
      this.state.depth--
      return value
    } catch (error) {
      this.state.depth--
      throw error
    }
  }

  /* Пропустить текущее значение CBOR */
  public skipValue(): boolean {
    this.state.depth++

    if (this.state.depth > CBOR_MAX_DEPTH) {
      this.state.depth--
      return false
    }

    try {
      const header = this.readHeader()
      const result = this.skipByType(header)
      this.state.depth--
      return result
    } catch {
      this.state.depth--
      return false
    }
  }

  /* Декодировать байтовую строку (в т.ч. indefinite-length, через чанки) */
  public decodeBytes(): { value: Uint8Array; length: number } | null {
    const savedOffset = this.state.offset
    try {
      const header = this.readHeader()

      if (header.majorType !== CborMajorType.ByteString) {
        this.state.offset = savedOffset
        return null
      }

      const result = header.value === BigInt(-1) ? this.readIndefiniteBytes() : this.decodeBytesWithLength(Number(header.value))

      if (!result) {
        this.state.offset = savedOffset
        return null
      }
      return result
    } catch {
      this.state.offset = savedOffset
      return null
    }
  }

  /* Читает чанки indefinite-length байтовой строки до BREAK и склеивает их (заголовок уже прочитан вызывающим) */
  private readIndefiniteBytes(): { value: Uint8Array; length: number } | null {
    const chunks: Uint8Array[] = []
    let totalLength = 0

    while (this.state.offset < this.state.length) {
      if (this.peekUint8() === CBOR_BREAK) {
        this.readUint8()
        break
      }

      const chunk = this.decodeBytes()
      if (!chunk) return null

      chunks.push(chunk.value)
      totalLength += chunk.length
    }

    const result = new Uint8Array(totalLength)
    let offset = 0
    for (const chunk of chunks) {
      result.set(chunk, offset)
      offset += chunk.length
    }

    return { value: result, length: totalLength }
  }

  /* Читает чанки indefinite-length текстовой строки до BREAK и склеивает их (заголовок уже прочитан вызывающим) */
  private readIndefiniteString(): { value: string; length: number } | null {
    let value = ""
    let totalLength = 0

    while (this.state.offset < this.state.length) {
      if (this.peekUint8() === CBOR_BREAK) {
        this.readUint8()
        break
      }

      const chunkHeader = this.readHeader()
      if (chunkHeader.majorType !== CborMajorType.Utf8String || chunkHeader.value === BigInt(-1)) return null

      const chunk = this.decodeStringWithLength(Number(chunkHeader.value))
      if (!chunk) return null

      value += chunk.value
      totalLength += chunk.length
    }

    return { value, length: totalLength }
  }

  /* Декодировать строку с известной длиной (внутренний метод) */
  private decodeStringWithLength(length: number): { value: string; length: number } | null {
    try {
      if (!this.hasBytes(length)) {
        return null
      }

      const bytes = new Uint8Array(this.state.buffer.buffer, this.state.buffer.byteOffset + this.state.offset, length)
      const value = new TextDecoder().decode(bytes)
      this.state.offset += length

      return { value, length }
    } catch {
      return null
    }
  }

  /* Декодировать байтовую строку с известной длиной (внутренний метод) */
  private decodeBytesWithLength(length: number): { value: Uint8Array; length: number } | null {
    try {
      if (!this.hasBytes(length)) {
        return null
      }

      const value = new Uint8Array(this.state.buffer.buffer, this.state.buffer.byteOffset + this.state.offset, length)
      this.state.offset += length

      return { value, length }
    } catch {
      return null
    }
  }

  /* Прочитать заголовок CBOR (первый байт) */
  private readHeader(): CborHeader {
    const first = this.readUint8()
    const majorType = first >> 5
    const additional = first & 0x1f

    let value: bigint

    if (additional < CborAdditionalInfo.NumByte) {
      /* Значение в дополнительных битах */
      value = BigInt(additional)
    } else if (additional === CborAdditionalInfo.Indefinite) {
      value = BigInt(-1)
    } else if (additional === CborAdditionalInfo.NumByte) {
      value = BigInt(this.readUint8())
    } else if (additional === CborAdditionalInfo.Float16) {
      value = BigInt(this.readUint16())
    } else if (additional === CborAdditionalInfo.Float32) {
      value = BigInt(this.readUint32())
    } else if (additional === CborAdditionalInfo.Float64) {
      value = this.readUint64()
    } else {
      throw new CborError(`Unknown additional info: ${additional}`)
    }

    return { majorType: majorType as CborMajorType, additional, value }
  }

  /* Декодировать значение по типу заголовка */
  private decodeByType(header: CborHeader): CborValue {
    switch (header.majorType) {
      case CborMajorType.UnsignedInteger:
        return Number(header.value)

      case CborMajorType.NegativeInteger:
        return -1 - Number(header.value)

      case CborMajorType.ByteString: {
        const bytesValue = header.value === BigInt(-1) ? this.readIndefiniteBytes() : this.decodeBytesWithLength(Number(header.value))
        /* Не хватило байт — конец данных (в потоке это «ждать ещё»), а не испорченный CBOR */
        if (!bytesValue) throw new CborEndOfDataError()
        return bytesValue.value
      }

      case CborMajorType.Utf8String: {
        const stringValue = header.value === BigInt(-1) ? this.readIndefiniteString() : this.decodeStringWithLength(Number(header.value))
        if (!stringValue) throw new CborEndOfDataError()
        return stringValue.value
      }

      case CborMajorType.Array:
        return this.decodeArray(header)

      case CborMajorType.Map:
        return this.decodeMap(header)

      case CborMajorType.Tag:
        return this.decodeTag(header)

      case CborMajorType.Simple:
        return this.decodeSimple(header)

      default:
        throw new CborError(`Unknown major type: ${header.majorType}`)
    }
  }

  /* Пропустить значение по типу */
  private skipByType(header: CborHeader): boolean {
    switch (header.majorType) {
      case CborMajorType.UnsignedInteger:
      case CborMajorType.NegativeInteger:
        return true

      case CborMajorType.ByteString:
      case CborMajorType.Utf8String:
        if (header.value === BigInt(-1)) {
          /* Indefinite length - пропускаем до break */
          while (this.state.offset < this.state.length) {
            if (this.peekUint8() === CBOR_BREAK) {
              this.readUint8()
              return true
            }
            if (!this.skipValue()) return false
          }
          return false
        }
        return this.hasBytes(Number(header.value)) ? ((this.state.offset += Number(header.value)), true) : false

      case CborMajorType.Array:
        if (header.value === BigInt(-1)) {
          while (this.state.offset < this.state.length) {
            if (this.peekUint8() === CBOR_BREAK) {
              this.readUint8()
              return true
            }
            if (!this.skipValue()) return false
          }
          return false
        }
        for (let i = 0; i < Number(header.value); i++) {
          if (!this.skipValue()) return false
        }
        return true

      case CborMajorType.Map:
        if (header.value === BigInt(-1)) {
          while (this.state.offset < this.state.length) {
            if (this.peekUint8() === CBOR_BREAK) {
              this.readUint8()
              return true
            }
            if (!this.skipValue()) return false
            if (!this.skipValue()) return false
          }
          return false
        }
        for (let i = 0; i < Number(header.value); i++) {
          if (!this.skipValue()) return false
          if (!this.skipValue()) return false
        }
        return true

      case CborMajorType.Tag:
        return this.skipValue()

      case CborMajorType.Simple:
        if (header.value >= BigInt(24) && header.value <= BigInt(27)) {
          const bytes = [2, 4, 8][Number(header.value) - 24]
          return this.hasBytes(bytes) ? ((this.state.offset += bytes), true) : false
        }
        return true

      default:
        return false
    }
  }

  /* Декодировать массив */
  private decodeArray(header: CborHeader): CborValue[] {
    if (header.value === BigInt(-1)) {
      /* Indefinite length */
      const result: CborValue[] = []
      while (this.state.offset < this.state.length) {
        if (this.peekUint8() === CBOR_BREAK) {
          this.readUint8()
          break
        }
        result.push(this.decode())
      }
      return result
    }

    const count = Number(header.value)
    const result: CborValue[] = []
    for (let i = 0; i < count; i++) {
      result.push(this.decode())
    }
    return result
  }

  /* Декодировать словарь (map) */
  private decodeMap(header: CborHeader): Map<CborValue, CborValue> {
    if (header.value === BigInt(-1)) {
      /* Indefinite length */
      const result = new Map<CborValue, CborValue>()
      while (this.state.offset < this.state.length) {
        if (this.peekUint8() === CBOR_BREAK) {
          this.readUint8()
          break
        }
        const key = this.decode()
        const value = this.decode()
        result.set(key, value)
      }
      return result
    }

    const count = Number(header.value)
    const result = new Map<CborValue, CborValue>()
    for (let i = 0; i < count; i++) {
      const key = this.decode()
      const value = this.decode()
      result.set(key, value)
    }
    return result
  }

  /* Декодировать тег */
  private decodeTag(header: CborHeader): CborTag {
    const tagValue = header.value
    const taggedValue = this.decode()
    return new CborTag(Number(tagValue), taggedValue)
  }

  /* Декодировать простое значение */
  private decodeSimple(header: CborHeader): CborValue {
    const additional = header.additional
    const value = header.value

    if (additional === CborSimpleValue.False) return false
    if (additional === CborSimpleValue.True) return true
    if (additional === CborSimpleValue.Null) return null
    if (additional === CborSimpleValue.Undefined) return null as CborValue

    /* Float types - используем value из заголовка (оно уже содержит биты float) */
    if (additional === CborAdditionalInfo.Float16) {
      /* value содержит биты float16 */
      return this.bitsToFloat16(Number(value))
    }

    if (additional === CborAdditionalInfo.Float32) {
      /* value содержит биты float32 */
      return this.bitsToFloat32(Number(value))
    }

    if (additional === CborAdditionalInfo.Float64) {
      /* value содержит биты float64 */
      return this.bitsToFloat64(value)
    }

    /* Simple value (0-19, 24-27) */
    if (additional < 24) {
      return Number(value)
    }

    return Number(value)
  }

  /* Вспомогательные методы чтения */

  /* Прочитать 1 байт */
  private readUint8(): number {
    if (this.state.offset >= this.state.length) {
      throw new CborEndOfDataError()
    }
    return this.state.buffer.getUint8(this.state.offset++)
  }

  /* Подсмотреть 1 байт без продвижения */
  private peekUint8(): number {
    if (this.state.offset >= this.state.length) {
      throw new CborEndOfDataError()
    }
    return this.state.buffer.getUint8(this.state.offset)
  }

  /* Прочитать 2 байта (big-endian) */
  private readUint16(): number {
    if (this.state.offset + 2 > this.state.length) {
      throw new CborEndOfDataError()
    }
    const value = this.state.buffer.getUint16(this.state.offset, false)
    this.state.offset += 2
    return value
  }

  /* Прочитать 4 байта (big-endian) */
  private readUint32(): number {
    if (this.state.offset + 4 > this.state.length) {
      throw new CborEndOfDataError()
    }
    const value = this.state.buffer.getUint32(this.state.offset, false)
    this.state.offset += 4
    return value
  }

  /* Прочитать 8 байт (big-endian) */
  private readUint64(): bigint {
    if (this.state.offset + 8 > this.state.length) {
      throw new CborEndOfDataError()
    }
    const value = this.state.buffer.getBigUint64(this.state.offset, false)
    this.state.offset += 8
    return value
  }

  /* Проверить есть ли n байт в буфере */
  private hasBytes(n: number): boolean {
    return this.state.offset + n <= this.state.length
  }

  /* Преобразовать биты в float16 */
  private bitsToFloat16(bits: number): number {
    const sign = (bits >> 15) & 0x1
    const exp = (bits >> 10) & 0x1f
    const mant = bits & 0x3ff

    if (exp === 0) {
      return Math.pow(-1, sign) * Math.pow(2, -24) * mant
    }

    if (exp === 31) {
      if (mant === 0) {
        return sign ? -Infinity : Infinity
      }
      return NaN
    }

    return Math.pow(-1, sign) * Math.pow(2, exp - 25) * (mant | 0x400)
  }

  /* Преобразовать биты в float32 */
  private bitsToFloat32(bits: number): number {
    const buffer = new ArrayBuffer(4)
    const view = new DataView(buffer)
    view.setUint32(0, bits, false)
    return view.getFloat32(0, false)
  }

  /* Преобразовать биты в float64 */
  private bitsToFloat64(bits: bigint): number {
    const buffer = new ArrayBuffer(8)
    const view = new DataView(buffer)
    view.setBigUint64(0, bits, false)
    return view.getFloat64(0, false)
  }
}

/* Утилита для декодирования CBOR из буфера */
export function decodeCbor(buffer: ArrayBuffer | Uint8Array): CborValue {
  const decoder = new CborDecoder(buffer)
  return decoder.decode()
}
