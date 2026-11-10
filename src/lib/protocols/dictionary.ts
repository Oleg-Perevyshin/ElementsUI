/* Словарь заголовков и аргументов протокола - заголовок и аргумент поля HAR пакета (makeHar/splitHar). Аргументы по умолчанию - из мастер-словаря dictionary.yaml рядом (единственный источник; .framework/Dictionary.yaml прошивок - его справочные копии), DEFAULT_ARGUMENT_CODES генерируется из него (dictionaryCodes.ts, npm run Dictionary); у устройства словарь может быть свой - его загружают из файла (parseArgumentDictionary) и передают в createDictionary, своих копий словаря в приложениях не держим */
import { DEFAULT_ARGUMENT_CODES } from "./dictionaryCodes.js"
import { makeHar } from "./packet.js"

export { DEFAULT_ARGUMENT_CODES }

export const HEADER_CODES: Record<string, number> = {
  GET: 0,
  SET: 1,
  "OK!": 2,
  "ER!": 3,
}
const HEADER_NAMES = Object.keys(HEADER_CODES)

/* Аргументы из текста Dictionary.yaml (или его фрагмента): строки «- [Строка, Enum, Число]», комментарии и прочее пропускаются */
export const parseArgumentDictionary = (text: string): Record<string, number> =>
  Object.fromEntries([...text.matchAll(/^\s*-\s*\[\s*([^,\]]+?)\s*,\s*[^,\]]+?\s*,\s*(\d+)\s*\]/gm)].map(([, name, code]) => [name, Number(code)]))

export interface Dictionary {
  /* Код аргумента по имени; неизвестное имя - undefined */
  code(name: string): number | undefined
  /* Имя аргумента по коду; неизвестный код - числом */
  name(code: number): string
  /* Имя заголовка по коду; неизвестный код - числом */
  header(code: number): string
  /* HAR по строкам словаря; неизвестные заголовок или аргумент - ошибка */
  har(header: string, argument: string, reply?: boolean): number
}

/* Словарь аргументов устройства с обратным поиском; при повторе кода имя берётся первое */
export const createDictionary = (codes: Record<string, number>): Dictionary => {
  const byName = new Map(Object.entries(codes))
  const byCode = new Map<number, string>()
  for (const [name, code] of byName) if (!byCode.has(code)) byCode.set(code, name)
  return {
    code: (name) => byName.get(name),
    name: (code) => byCode.get(code) ?? String(code),
    header: (code) => HEADER_NAMES[code] ?? String(code),
    har(header, argument, reply = true) {
      const hdr = HEADER_NAMES.indexOf(header)
      const arg = byName.get(argument)
      if (hdr < 0 || arg === undefined) throw new Error(`Hdr/Arg отсутствует в словаре: ${header} ${argument}`)
      return makeHar(hdr, arg, reply)
    },
  }
}

/* Встроенный словарь - по умолчанию для xPOE-Debug */
export const DEFAULT_DICTIONARY = createDictionary(DEFAULT_ARGUMENT_CODES)
