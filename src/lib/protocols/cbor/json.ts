/* JSON-совместимое значение → CBOR (поля ввода терминала и отладки): строки base64 под ключами с "BIN" — байты */

import { type CborValue } from "./types.js"
import { encodeCbor } from "./encoder.js"
import { base64ToBytes } from "./base64.js"

/* Класс для конвертации JSON в CBOR */
class JsonToCbor {
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

/* Закодировать JSON в CBOR */
export function jsonToCbor(value: unknown): Uint8Array {
  return JsonToCbor.encode(value)
}
