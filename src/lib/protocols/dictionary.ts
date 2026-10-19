/* $lib/protocols/dictionary.ts */
/* Словарь заголовков и аргументов протокола HA_Code — заголовок в 2 старших битах, аргумент в 14 младших (makeHaCode). Аргументы по умолчанию —
   из мастер-словаря dictionary.yaml рядом (единственный источник; .framework/Dictionary.yaml прошивок — его справочные копии), DEFAULT_ARGUMENT_CODES
   генерируется из него (dictionaryCodes.ts, npm run Dictionary); у устройства словарь может быть свой — его загружают из файла
   (parseArgumentDictionary), своих копий словаря в приложениях не держим */

export const HEADER_CODES: Record<string, number> = {
  GET: 0,
  SET: 1,
  "OK!": 2,
  "ER!": 3,
}

export { DEFAULT_ARGUMENT_CODES } from "./dictionaryCodes.js"

/* Аргументы из текста Dictionary.yaml (или его фрагмента): строки «- [Строка, Enum, Число]», комментарии и прочее пропускаются */
export const parseArgumentDictionary = (text: string): Record<string, number> =>
  Object.fromEntries([...text.matchAll(/^\s*-\s*\[\s*([^,\]]+?)\s*,\s*[^,\]]+?\s*,\s*(\d+)\s*\]/gm)].map(([, name, code]) => [name, Number(code)]))

/* Имя по коду (обратный поиск) — для показа принятых пакетов; неизвестный код — числом */
export const nameByCode = (codes: Record<string, number>, code: number): string =>
  Object.entries(codes).find(([, value]) => value === code)?.[0] ?? String(code)
