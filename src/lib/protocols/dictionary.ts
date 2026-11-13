/* Словарь заголовков и аргументов протокола - заголовок и аргумент поля HAR (makeHar/splitHar) на шине и в WebSocket-конверте {HAR, VAL}. Аргументы по умолчанию - из мастер-словаря команд src/lib/dictionaries/commands.yaml (единственный источник; .framework/Dictionary.yaml прошивок - его справочные копии), DEFAULT_ARGUMENT_CODES генерируется из него (dictionaries/generated/commands.ts, npm run Dictionary): прошивки собираются с его копией, поэтому приложения берут только встроенный словарь; аргумент, которого в словаре нет, задаётся числом (кодом) */
import { DEFAULT_ARGUMENT_CODES } from "../dictionaries/generated/commands.js"
import { makeHar, splitHar } from "./packet.js"

export { DEFAULT_ARGUMENT_CODES }

export const HEADER_CODES: Record<string, number> = {
  GET: 0,
  SET: 1,
  "OK!": 2,
  "ER!": 3,
}
const HEADER_NAMES = Object.keys(HEADER_CODES)

/* Аргумент числом, если его нет в словаре: десятичный «4097» или HEX «0x1001»; иначе undefined */
const numericArgument = (text: string): number | undefined =>
  /^\d+$/.test(text) ? Number(text) : /^0[xX][0-9A-Fa-f]+$/.test(text) ? parseInt(text, 16) : undefined

export interface Dictionary {
  /* Код аргумента по имени или числу («4097», «0x1001»); неизвестное имя - undefined */
  code(name: string): number | undefined
  /* Имя аргумента по коду; неизвестный код - строкой из числа ("4097") */
  name(code: number): string
  /* Имя заголовка по коду; неизвестный код - строкой из числа */
  header(code: number): string
  /* HAR из имени заголовка и аргумента (имя, код 0..8191 или его запись строкой «4097»/«0x1001»); неизвестные заголовок или имя аргумента, код вне диапазона - ошибка */
  har(header: string, argument: string | number, reply?: boolean): number
}

/* Словарь аргументов устройства с обратным поиском; при повторе кода имя берётся первое */
export const createDictionary = (codes: Record<string, number>): Dictionary => {
  const byName = new Map(Object.entries(codes))
  const byCode = new Map<number, string>()
  for (const [name, code] of byName) if (!byCode.has(code)) byCode.set(code, name)
  return {
    code: (name) => byName.get(name) ?? numericArgument(name.trim()),
    name: (code) => byCode.get(code) ?? String(code),
    header: (code) => HEADER_NAMES[code] ?? String(code),
    har(header, argument, reply = true) {
      const hdr = HEADER_NAMES.indexOf(header)
      const arg = typeof argument === "number" ? argument : (byName.get(argument) ?? numericArgument(argument.trim()))
      if (hdr < 0 || arg === undefined) throw new Error(`Hdr/Arg отсутствует в словаре: ${header} ${argument}`)
      return makeHar(hdr, arg, reply)
    },
  }
}

/* Встроенный словарь - по умолчанию для шины, xPOE-Debug и WebSocket */
export const DEFAULT_DICTIONARY = createDictionary(DEFAULT_ARGUMENT_CODES)

/* Части HAR словами: header - "GET"/"SET"/"OK!"/"ER!", argument - имя по словарю (неизвестный код - строкой из числа), code - код аргумента, reply - флаг ответа */
export interface HarParts {
  header: string
  argument: string
  code: number
  reply: boolean
}

/* HAR из заголовка и аргумента (имя или код) через словарь; неизвестное имя или значение вне диапазона - ошибка */
export const encodeHar = (header: string, argument: string | number, reply = true, dictionary: Dictionary = DEFAULT_DICTIONARY): number =>
  dictionary.har(header, argument, reply)

/* HAR в слова по словарю: для таблиц, журналов и разбора конверта */
export const decodeHar = (har: number, dictionary: Dictionary = DEFAULT_DICTIONARY): HarParts => {
  const { header, argument, reply } = splitHar(har)
  return { header: dictionary.header(header), argument: dictionary.name(argument), code: argument, reply }
}
