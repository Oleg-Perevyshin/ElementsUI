/* Вид CBOR в стиле YAML для xPOE-Debug: строка VALUE - поток (корневая карта без скобок), окно - блок с отступом 2; разбор поля Value - поток YAML или JSON */
import { base64ToBytes } from "./cbor/base64.js"
import { encodeCbor } from "./cbor/encoder.js"
import type { CborValue } from "./cbor/types.js"
import { bytesToHex, hexToBytes } from "./hex.js"

/* Части вида: ключ, строка, число, логическое, null, байты; скобки и запятые - без раскраски */
export type YamlKind = "key" | "string" | "number" | "boolean" | "null" | "bytes"
export type YamlPaint = (kind: YamlKind, text: string) => string
const plain: YamlPaint = (_kind, text) => text

/* float32 с провода - кратчайшая запись, дающая то же float32 (0.12, а не 0.12000000476837158); double и целые - как есть */
export const shortNumber = (value: number): number => {
  if (Number.isInteger(value) || !Number.isFinite(value) || Math.fround(value) !== value) return value
  for (let digits = 1; digits <= 9; digits++) {
    const short = Number(value.toPrecision(digits))
    if (Math.fround(short) === value) return short
  }
  return value
}

const NUMBER = /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][-+]?\d+)?$/
const SPECIAL = /^(?:null|Null|NULL|~|true|True|TRUE|false|False|FALSE|[-+]?\.(?:inf|Inf|INF)|\.(?:nan|NaN|NAN))$/

/* Строка без кавычек только если читается обратно той же строкой: не похожа на число, true/false/null, не пустая, без «:,[]{}#», управляющих символов и крайних пробелов, не начинается с кавычки, h' или знака YAML */
const needsQuotes = (text: string): boolean =>
  !text ||
  text !== text.trim() ||
  /[:,[\]{}#\x00-\x1f\x7f]/.test(text) ||
  /^(?:["'!&*|>%@`]|h'|- |\? )/.test(text) ||
  /^[-+.]?\d/.test(text) ||
  /^0[xX]/.test(text) ||
  SPECIAL.test(text) ||
  SPECIAL.test(text.toLowerCase())

const quote = (text: string): string => (needsQuotes(text) ? JSON.stringify(text) : text)

const formatNumber = (value: number): string =>
  Number.isNaN(value) ? ".nan" : value === Infinity ? ".inf" : value === -Infinity ? "-.inf" : String(shortNumber(value))

const scalar = (value: unknown, paint: YamlPaint): string | null => {
  if (value === null || value === undefined) return paint("null", "null")
  if (typeof value === "boolean") return paint("boolean", String(value))
  if (typeof value === "number") return paint("number", formatNumber(value))
  if (typeof value === "bigint") return paint("number", String(value))
  if (typeof value === "string") return paint("string", quote(value))
  if (value instanceof Uint8Array) return paint("bytes", `h'${bytesToHex(value)}'`)
  return null
}

/* Пары карты: CBOR-карта приходит Map (ключи любого типа, порядок как на проводе) или объектом */
const entriesOf = (value: unknown): [unknown, unknown][] | null => {
  if (value instanceof Map) return [...value]
  if (value && typeof value === "object" && !Array.isArray(value) && !(value instanceof Uint8Array)) return Object.entries(value)
  return null
}

const flow = (value: unknown, paint: YamlPaint): string => {
  const simple = scalar(value, paint)
  if (simple !== null) return simple
  if (Array.isArray(value)) return `[${value.map((item) => flow(item, paint)).join(", ")}]`
  const entries = entriesOf(value) ?? []
  return `{${flowEntries(entries, paint)}}`
}

/* Ключ-строка - по правилам кавычек («"1"» - строка), ключ-число и прочие - как значение («1» - число) */
const keyText = (key: unknown, paint: YamlPaint): string => paint("key", `${typeof key === "string" ? quote(key) : flow(key, plain)}:`)

const flowEntries = (entries: [unknown, unknown][], paint: YamlPaint): string =>
  entries.map(([key, item]) => `${keyText(key, paint)} ${flow(item, paint)}`).join(", ")

/* Одна строка: корневая карта без внешних скобок («A: 1, B: [1, 2]»), пустая - {}; остальное - значение потока */
export const formatYamlFlow = (value: unknown, paint: YamlPaint = plain): string => {
  const entries = Array.isArray(value) ? null : entriesOf(value)
  return entries?.length ? flowEntries(entries, paint) : flow(value, paint)
}

/* Непустая карта или массив - блоком с новой строки */
const isBlock = (value: unknown): boolean => (Array.isArray(value) ? value.length > 0 : !!entriesOf(value)?.length)

const blockLines = (value: unknown, paint: YamlPaint, indent: string): string[] => {
  if (Array.isArray(value))
    return value.map((item) => {
      if (!isBlock(item)) return `${indent}- ${flow(item, paint)}`
      /* Вложенное - компактно: первая строка после «- », остальные с отступом +2 */
      const [first, ...rest] = blockLines(item, paint, `${indent}  `)
      return [`${indent}- ${first.slice(indent.length + 2)}`, ...rest].join("\n")
    })
  return (entriesOf(value) ?? []).map(([key, item]) => {
    const head = `${indent}${keyText(key, paint)}`
    return isBlock(item) ? [head, ...blockLines(item, paint, `${indent}  `)].join("\n") : `${head} ${flow(item, paint)}`
  })
}

/* Несколько строк: блочный YAML с отступом 2; скаляр, пустые {} и [] - как в потоке */
export const formatYamlBlock = (value: unknown, paint: YamlPaint = plain): string =>
  isBlock(value) ? blockLines(value, paint, "").join("\n") : flow(value, paint)

/* Разбор потока YAML (и JSON как его подмножества) в значение CBOR: h'..' - байтовая строка, корневая карта может быть без скобок */
class FlowParser {
  private pos = 0
  constructor(
    private readonly text: string,
    private readonly binBase64: boolean,
  ) {}

  private fail(reason: string): never {
    throw new Error(`${reason} (позиция ${this.pos + 1})`)
  }

  private skip() {
    while (this.pos < this.text.length && /\s/.test(this.text[this.pos])) this.pos++
  }

  private peek = () => this.text[this.pos]

  root(): CborValue {
    this.skip()
    const start = this.pos
    const first = this.peek()
    /* Корень без скобок - карта, если начинается с «ключ: » */
    if (first !== "{" && first !== "[" && this.tryKey(true) !== undefined) {
      this.pos = start
      const map = this.entries(null)
      return map
    }
    this.pos = start
    const value = this.value()
    this.skip()
    if (this.pos < this.text.length) this.fail(`лишний текст «${this.text.slice(this.pos, this.pos + 20)}»`)
    return value
  }

  /* Пары до закрывающей скобки или конца текста */
  private entries(close: "}" | null): Map<CborValue, CborValue> {
    const map = new Map<CborValue, CborValue>()
    for (;;) {
      this.skip()
      if (close && this.peek() === close) break
      if (this.pos >= this.text.length) {
        if (close) this.fail(`ожидалась «${close}»`)
        break
      }
      const key = this.tryKey(!close)
      if (key === undefined) this.fail("ожидалась пара «ключ: значение»")
      this.skip()
      /* «ключ:» без значения - null */
      const empty = this.pos >= this.text.length || this.peek() === "," || this.peek() === close
      const value = empty ? null : this.value()
      /* JSON: строка под ключом на BIN (FileBin, DataBIN) - Base64 байтов */
      map.set(key, this.binBase64 && typeof value === "string" && typeof key === "string" && /bin$/i.test(key) ? base64ToBytes(value) : value)
      this.skip()
      if (this.peek() === ",") {
        this.pos++
        continue
      }
      if (close ? this.peek() !== close : this.pos < this.text.length) this.fail(close ? "ожидалась «,» или «}»" : "ожидалась «,»")
    }
    if (close) this.pos++
    return map
  }

  /* Ключ с двоеточием после него; нет - undefined (позиция не восстанавливается). В кавычках - строка, без - по виду («1» - число). В корне простой ключ требует пробел после «:» */
  private tryKey(atRoot: boolean): CborValue | undefined {
    this.skip()
    const char = this.peek()
    let key: CborValue
    if (char === '"' || char === "'") {
      try {
        key = this.quoted()
      } catch {
        return undefined
      }
      this.skip()
    } else {
      const start = this.pos
      while (this.pos < this.text.length && !/[:,[\]{}]/.test(this.peek())) this.pos++
      const token = this.text.slice(start, this.pos).trim()
      if (!token || token.startsWith("h'")) return undefined
      if (atRoot && this.peek() === ":" && this.pos + 1 < this.text.length && !/[\s,]/.test(this.text[this.pos + 1])) return undefined
      key = resolvePlain(token)
    }
    if (this.peek() !== ":") return undefined
    this.pos++
    return key
  }

  private value(): CborValue {
    this.skip()
    const char = this.peek()
    if (char === undefined) this.fail("нет значения")
    if (char === "{") {
      this.pos++
      return this.entries("}")
    }
    if (char === "[") {
      this.pos++
      const list: CborValue[] = []
      for (;;) {
        this.skip()
        if (this.peek() === "]") break
        list.push(this.value())
        this.skip()
        if (this.peek() === ",") {
          this.pos++
          continue
        }
        if (this.peek() !== "]") this.fail("ожидалась «,» или «]»")
      }
      this.pos++
      return list
    }
    if (char === '"' || char === "'") return this.quoted()
    if (char === "h" && this.text[this.pos + 1] === "'") {
      const end = this.text.indexOf("'", this.pos + 2)
      if (end < 0) this.fail("не закрыта h'..'")
      const bytes = hexToBytes(this.text.slice(this.pos + 2, end))
      if (!bytes) this.fail(`h'..': нужны HEX-цифры парами`)
      this.pos = end + 1
      return bytes
    }
    if (char === "}" || char === "]" || char === ",") this.fail(`неожиданный «${char}»`)
    return this.plainScalar()
  }

  /* "..." - экранирование как в JSON, '...' - кавычка удваивается */
  private quoted(): string {
    const open = this.peek()
    const start = this.pos
    this.pos++
    if (open === "'") {
      let out = ""
      for (;;) {
        if (this.pos >= this.text.length) this.fail("не закрыта строка в кавычках")
        const char = this.text[this.pos++]
        if (char !== "'") out += char
        else if (this.peek() === "'") {
          out += "'"
          this.pos++
        } else return out
      }
    }
    while (this.pos < this.text.length && this.peek() !== '"') this.pos += this.peek() === "\\" ? 2 : 1
    if (this.pos >= this.text.length) {
      this.pos = start
      this.fail("не закрыта строка в кавычках")
    }
    this.pos++
    try {
      return JSON.parse(this.text.slice(start, this.pos)) as string
    } catch {
      this.pos = start
      return this.fail("неверное экранирование в строке")
    }
  }

  /* Простое значение до «,» или скобки */
  private plainScalar(): CborValue {
    const start = this.pos
    while (this.pos < this.text.length && !/[,[\]{}]/.test(this.peek())) this.pos++
    return resolvePlain(this.text.slice(start, this.pos).trim())
  }
}

/* Простое значение по виду: число, true/false, null, .inf/.nan, остальное - строка */
const resolvePlain = (token: string): CborValue => {
  if (/^(?:null|Null|NULL|~)$/.test(token)) return null
  if (/^(?:true|True|TRUE)$/.test(token)) return true
  if (/^(?:false|False|FALSE)$/.test(token)) return false
  if (/^[-+]?\.(?:inf|Inf|INF)$/.test(token)) return token.startsWith("-") ? -Infinity : Infinity
  if (/^\.(?:nan|NaN|NAN)$/.test(token)) return NaN
  if (NUMBER.test(token)) {
    /* Целое вне safe integer - bigint (uint64 устройства) */
    if (/^[-+]?\d+$/.test(token) && !Number.isSafeInteger(Number(token))) return BigInt(token)
    return Number(token)
  }
  return token
}

/* Поток YAML в байты CBOR; binBase64 - строки под ключами на BIN как Base64 байтов (так читается JSON); ошибка - с причиной и позицией */
export const yamlFlowToCbor = (text: string, binBase64 = false): Uint8Array => encodeCbor(new FlowParser(text, binBase64).root())
