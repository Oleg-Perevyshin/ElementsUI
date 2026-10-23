/* Конвертация между CBOR и обычными JS-значениями (объекты/массивы/примитивы) — никакого JSON-текста нигде не участвует */

import { type CborValue, CborTag } from "./types.js"
import { decodeCbor } from "./decoder.js"
import { encodeCbor } from "./encoder.js"

/* Класс для конвертации CBOR в обычное JS-значение */
class CborToValue {
  /* Преобразовать CBOR значение в обычный JS-объект/значение */
  public static convert(value: CborValue): unknown {
    /* null */
    if (value === null) return null

    /* undefined */
    if (value === undefined) return null

    /* boolean */
    if (typeof value === "boolean") return value

    /* number */
    if (typeof value === "number") return value

    /* string */
    if (typeof value === "string") return value

    /* Uint8Array — нативные бинарные данные, отдаём как есть, без base64 */
    if (value instanceof Uint8Array) return value

    /* Array */
    if (Array.isArray(value)) return value.map((item) => this.convert(item))

    /* bigint */
    if (typeof value === "bigint") {
      /* Если в пределах safe integer - возвращаем как число */
      if (value >= BigInt(Number.MIN_SAFE_INTEGER) && value <= BigInt(Number.MAX_SAFE_INTEGER)) {
        return Number(value)
      }
      /* Иначе возвращаем как строку */
      return value.toString()
    }

    /* Map -> Object (check native Map) */
    if (value instanceof globalThis.Map) {
      const obj: Record<string, unknown> = {}
      for (const [key, val] of value) {
        /* Ключи приводим к строкам */
        const keyStr = this.keyToString(key as CborValue)
        obj[keyStr] = this.convert(val as CborValue)
      }
      return obj
    }

    /* CborTag - распаковываем в объект с полем _tag */
    if (value instanceof CborTag) return { _tag: Number(value.tag), value: this.convert(value.value) }

    return null
  }

  /* CBOR -> обычный JS-объект */
  public static decode(buffer: ArrayBuffer | Uint8Array): unknown {
    const value = decodeCbor(buffer)
    return this.convert(value)
  }

  /* Преобразовать ключ в строку */
  private static keyToString(key: CborValue): string {
    if (typeof key === "string") return key
    if (typeof key === "number") return key.toString()
    if (typeof key === "bigint") return key.toString()
    if (typeof key === "boolean") return key.toString()
    return JSON.stringify(key)
  }
}

/* Класс для конвертации обычного JS-значения в CBOR */
class ValueToCbor {
  /* Преобразовать обычное JS-значение в CBOR */
  public static convert(value: unknown): CborValue {
    /* null */
    if (value === null) return null

    /* undefined (не сериализуется как отдельный тип, приводим к null) */
    if (value === undefined) return null as CborValue

    /* boolean */
    if (typeof value === "boolean") return value

    /* number */
    if (typeof value === "number") return value

    /* array */
    if (Array.isArray(value)) return value.map((item) => this.convert(item))

    /* bigint (если передан) */
    if (typeof value === "bigint") return value

    /* Uint8Array — нативные бинарные данные, сразу CBOR byte string (до typeof === "object", иначе уйдёт в Map по числовым индексам) */
    if (value instanceof Uint8Array) return value

    /* string — всегда текстовая CBOR-строка, бинарные данные передаются через Uint8Array напрямую, не через base64 */
    if (typeof value === "string") return value

    /* object */
    if (typeof value === "object") {
      const map = new Map<CborValue, CborValue>()
      const obj = value as Record<string, unknown>

      for (const key of Object.keys(obj)) {
        map.set(key, this.convert(obj[key]))
      }

      return map
    }

    return null
  }

  /* Преобразовать JS-значение в CBOR буфер */
  public static encode(value: unknown): Uint8Array {
    const cborValue = this.convert(value)
    return encodeCbor(cborValue)
  }
}

/* Упрощённые функции для быстрого использования */

/* Декодировать CBOR в обычное JS-значение */
export function cborToValue(buffer: ArrayBuffer | Uint8Array): unknown {
  return CborToValue.decode(buffer)
}

/* Закодировать обычное JS-значение в CBOR */
export function valueToCbor(value: unknown): Uint8Array {
  return ValueToCbor.encode(value)
}
