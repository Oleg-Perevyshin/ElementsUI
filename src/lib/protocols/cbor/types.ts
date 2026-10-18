/* Типы и перечисления для CBOR библиотеки - соответствует RFC 8949 */

/* Основные типы данных CBOR (Major Types) */
export enum CborMajorType {
  UnsignedInteger = 0 /* Целые неотрицательные числа */,
  NegativeInteger = 1 /* Отрицательные целые числа */,
  ByteString = 2 /* Байтовые строки */,
  Utf8String = 3 /* UTF-8 строки */,
  Array = 4 /* Массивы */,
  Map = 5 /* Словари (ключ-значение) */,
  Tag = 6 /* Семантические теги */,
  Simple = 7 /* Простые значения */,
}

/* Дополнительные коды CBOR */
export enum CborAdditionalInfo {
  NumByte = 24 /* 1 байт данных */,
  Float16 = 25 /* Half-precision float (2 байта) */,
  Float32 = 26 /* Single precision float (4 байта) */,
  Float64 = 27 /* Double precision float (8 байт) */,
  Indefinite = 31 /* Неопределённая длина */,
}

/* Простые значения CBOR */
export enum CborSimpleValue {
  False = 20,
  True = 21,
  Null = 22,
  Undefined = 23,
}

/* Константы CBOR */
export const CBOR_BREAK = 0xff
export const CBOR_MAX_DEPTH = 128

/* Тип для представления декодированного значения CBOR */
export type CborValue = bigint | number | boolean | null | string | Uint8Array | CborValue[] | Map<CborValue, CborValue> | CborTag

/* Класс для представления тега CBOR */
export class CborTag {
  public tag: bigint | number
  public value: CborValue

  constructor(tag: bigint | number, value: CborValue) {
    this.tag = tag
    this.value = value
  }
}

/* Состояние парсера CBOR */
export interface CborParserState {
  buffer: DataView
  offset: number
  length: number
  depth: number
}

/* Результат декодирования заголовка CBOR */
export interface CborHeader {
  majorType: CborMajorType
  additional: number
  value: bigint
}

/* Ошибки CBOR */
export class CborError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "CborError"
  }
}

export class CborEndOfDataError extends CborError {
  constructor() {
    super("Unexpected end of data")
    this.name = "CborEndOfDataError"
  }
}

export class CborTypeMismatchError extends CborError {
  constructor(expected: string, got: CborMajorType) {
    super(`Expected ${expected}, got major type ${got}`)
    this.name = "CborTypeMismatchError"
  }
}

export class CborDepthLimitError extends CborError {
  constructor() {
    super("Maximum nesting depth exceeded")
    this.name = "CborDepthLimitError"
  }
}

/* Типы для JSON совместимости */
export interface JsonPrimitive {
  type: "null" | "boolean" | "number" | "string"
  value: unknown
}

export interface JsonObject {
  [key: string]: JsonValue
}

export type JsonValue = JsonPrimitive | JsonObject | JsonValue[]
