/* $lib/protocols/dictionary.ts */
/* Словарь заголовков и аргументов протокола HA_Code — заголовок в 2 старших битах, аргумент в 14 младших (makeHaCode). Аргументы по умолчанию —
   из .framework/Dictionary.yaml прошивок (ProdFactory-ESP и ProdFactory-STM, одинаковые); у устройства словарь может быть свой — его загружают
   из файла (parseArgumentDictionary), своих копий словаря в приложениях не держим */

export const HEADER_CODES: Record<string, number> = {
  GET: 0,
  SET: 1,
  "OK!": 2,
  "ER!": 3,
}

export const DEFAULT_ARGUMENT_CODES: Record<string, number> = {
  Unknown: 0,
  Restart: 1,
  DefCfg: 2,
  DlFW: 3,
  RstNVS: 5,
  LocTime: 6,
  Update: 7,
  StackInfo: 8,
  BackUp: 9,
  BindMKey: 10,
  DataStream: 15,
  APsList: 21,
  FS: 22,
  JoinDev: 23,
  JoinUser: 24,
  LeaveUser: 25,
  ModFind: 31,
  ModList: 32,
  ModCap: 33,
  ModInfo: 34,
  ModMode: 35,
  ModCfg: 36,
  ModT1: 37,
  ModT2: 38,
  ModT3: 39,
  ModT4: 40,
  ModT5: 41,
  ModS1: 42,
  ModS2: 43,
  ModS3: 44,
  ModS4: 45,
  ModS5: 46,
  FwUpgS: 51,
  FwUpgP: 52,
  FwUpgD: 53,
  FwUpgE: 54,
  FDwS: 65,
  FDwP: 66,
  FDwD: 67,
  FDwE: 68,
  TestReq: 91,
  MotInit: 111,
  MotMode: 112,
  MotPos: 113,
  MotPID: 114,
  MotInfo: 115,
  MotCfg: 116,
  MotCal: 117,
  OrData: 141,
  OrOfs: 142,
  OrAccCal: 143,
  OrMagCal: 144,
}

/* Аргументы из текста Dictionary.yaml (или его фрагмента): строки «- [Строка, Enum, Число]», комментарии и прочее пропускаются */
export const parseArgumentDictionary = (text: string): Record<string, number> =>
  Object.fromEntries([...text.matchAll(/^\s*-\s*\[\s*([^,\]]+?)\s*,\s*[^,\]]+?\s*,\s*(\d+)\s*\]/gm)].map(([, name, code]) => [name, Number(code)]))

/* Имя по коду (обратный поиск) — для показа принятых пакетов; неизвестный код — числом */
export const nameByCode = (codes: Record<string, number>, code: number): string =>
  Object.entries(codes).find(([, value]) => value === code)?.[0] ?? String(code)
