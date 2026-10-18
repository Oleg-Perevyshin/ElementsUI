/* Конвертация между CBOR и JSON-совместимыми значениями: двоичные данные — base64, строки под ключами с "BIN" — байты */

import { type CborValue, CborTag } from "./types.js"
import { decodeCbor } from "./decoder.js"
import { encodeCbor } from "./encoder.js"
import { base64ToBytes, bytesToBase64 } from "./base64.js"

/* Класс для конвертации CBOR в JSON */
export class CborToJson {
  /* Преобразовать CBOR значение в JSON-совместимый объект */
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

    /* Uint8Array -> Base64 строка */
    if (value instanceof Uint8Array) return bytesToBase64(value)

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

  /* CBOR -> JSON объект */
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

/* Класс для конвертации JSON в CBOR */
export class JsonToCbor {
  /* Преобразовать JSON-совместимое значение в CBOR */
  public static convert(value: unknown, parentKey?: string): CborValue {
    /* null */
    if (value === null) return null

    /* undefined (не является валидным JSON, но обрабатываем) */
    if (value === undefined) return null as CborValue

    /* boolean */
    if (typeof value === "boolean") return value

    /* number */
    if (typeof value === "number") return value

    /* array */
    if (Array.isArray(value)) return value.map((item) => this.convert(item))

    /* bigint (если передан) */
    if (typeof value === "bigint") return value

    /* string */
    if (typeof value === "string") {
      /* Ключ с "BIN"/"bin" — строка на самом деле Base64 бинарных данных */
      if (parentKey && (parentKey.includes("BIN") || parentKey.includes("bin"))) {
        const bytes = base64ToBytes(value)
        return bytes
      }
      return value
    }

    /* object */
    if (typeof value === "object") {
      const map = new Map<CborValue, CborValue>()
      const obj = value as Record<string, unknown>

      for (const key of Object.keys(obj)) {
        /* Передаем ключ в рекурсивный вызов для проверки */
        map.set(key, this.convert(obj[key], key))
      }

      return map
    }

    return null
  }

  /* Преобразовать JSON объект в CBOR буфер */
  public static encode(value: unknown): Uint8Array {
    const cborValue = this.convert(value)
    return encodeCbor(cborValue)
  }
}

/* Упрощённые функции для быстрого использования */

/* Декодировать CBOR в JSON объект */
export function cborToJson(buffer: ArrayBuffer | Uint8Array): unknown {
  return CborToJson.decode(buffer)
}

/* Закодировать JSON в CBOR */
export function jsonToCbor(value: unknown): Uint8Array {
  return JsonToCbor.encode(value)
}
