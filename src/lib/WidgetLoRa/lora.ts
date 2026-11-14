/* $lib/WidgetLoRa/lora.ts - параметры LoRa для WidgetLoRa: где лежит каждый параметр в прошивке (ключ группы, биты слова, масштаб, таблица кодов), шаблоны драйверов, чтение и сборка слов. Без Svelte - проверяется тестами против dist */
import { bitFieldGet, bitFieldSet } from "../bitField.js"

/* Параметры радио, общие для микросхем LoRa (SX126x, SX127x, LLCC68, STM32WL) */
export const LORA_PARAMS = ["Freq", "TxP", "BW", "SF", "CR", "Preamble", "CRC", "InvIQ"] as const
export type LoRaParam = (typeof LORA_PARAMS)[number]

/* Переключатели: код 0 или 1 */
export const LORA_SWITCHES: readonly LoRaParam[] = ["CRC", "InvIQ"]

export interface ILoRaOption {
  name: string
  value: number /* код в прошивке */
}

/* Где параметр в прошивке: ключ группы и биты слова; число - код = round(значение * scale) + offset, список - имя и код */
export interface ILoRaParamConfig {
  key: string /* ключ в группе, например "Cfg" - на устройстве "{префикс}.{key}" */
  bits?: { start: number; end: number } /* биты поля в слове; нет - значение ключа целиком */
  scale?: number /* по умолчанию 1: частота в Гц при показе в МГц - 1000000 */
  offset?: number /* по умолчанию 0: SF, хранимый минус 5, - offset -5 */
  min?: number /* пределы и шаг числа в единицах показа */
  max?: number
  step?: number
  options?: ILoRaOption[] /* есть - параметр выбирается из списка */
}

export type LoRaParams = Partial<Record<LoRaParam, ILoRaParamConfig>>

/* Значения в единицах показа: частота МГц, мощность дБм, у списков - код, у переключателей - 0/1 */
export type LoRaValues = Partial<Record<LoRaParam, number>>

const opts = (pairs: [string, number][]): ILoRaOption[] => pairs.map(([name, value]) => ({ name, value }))
const SF_NAMES = (from: number, codeFrom: number, count: number) => opts(Array.from({ length: count }, (_, i) => [String(from + i), codeFrom + i]))

/* Шаблоны драйверов: заполняют params разом, дальше любое поле правится в конструкторе */
export const LORA_PRESETS: Record<string, { name: string; params: LoRaParams }> = {
  /* Общее слово LORA.Cfg: драйвер HT_CT62 ProdFactory-ESP и lora_service ProdFactory-STM (STM32WL) */
  HT_CT62: {
    name: "HT-CT62 / STM32WL",
    params: {
      Freq: { key: "Cfg", bits: { start: 21, end: 30 }, min: 150, max: 960, step: 1 },
      TxP: { key: "Cfg", bits: { start: 2, end: 6 }, min: 0, max: 22, step: 1 },
      BW: {
        key: "Cfg",
        bits: { start: 7, end: 10 },
        options: opts([
          ["125", 4],
          ["250", 5],
          ["500", 6],
        ]),
      },
      SF: { key: "Cfg", bits: { start: 11, end: 13 }, options: SF_NAMES(7, 2, 6) },
      CR: {
        key: "Cfg",
        bits: { start: 14, end: 15 },
        options: opts([
          ["4/5", 0],
          ["4/6", 1],
          ["4/7", 2],
          ["4/8", 3],
        ]),
      },
      Preamble: {
        key: "Cfg",
        bits: { start: 18, end: 20 },
        options: opts([
          ["6", 0],
          ["8", 1],
          ["10", 2],
          ["12", 3],
          ["16", 4],
          ["20", 5],
          ["24", 6],
          ["32", 7],
        ]),
      },
      CRC: { key: "Cfg", bits: { start: 16, end: 16 } },
      InvIQ: { key: "Cfg", bits: { start: 17, end: 17 } },
    },
  },
}

/* Ключи группы, которые нужны параметрам, без повторов */
export const loraKeys = (params: LoRaParams): string[] => [...new Set(Object.values(params).flatMap((p) => (p?.key ? [p.key] : [])))]

/* Код параметра из значений ключей устройства; нет значения ключа - undefined */
const readCode = (raw: Record<string, unknown>, p: ILoRaParamConfig): number | undefined => {
  const word = Number(raw[p.key])
  if (raw[p.key] === undefined || raw[p.key] === null || !Number.isFinite(word)) return undefined
  return p.bits ? bitFieldGet(word, p.bits.start, p.bits.end) : word
}

/* Значения для показа из значений ключей устройства */
export const loraDecode = (params: LoRaParams, raw: Record<string, unknown>): LoRaValues => {
  const values: LoRaValues = {}
  for (const name of LORA_PARAMS) {
    const p = params[name]
    const code = p ? readCode(raw, p) : undefined
    if (p && code !== undefined) values[name] = p.options || LORA_SWITCHES.includes(name) ? code : (code - (p.offset ?? 0)) / (p.scale || 1)
  }
  return values
}

/* Значения ключей для SET: параметры пишутся в свои биты поверх текущих слов, остальные биты слова не меняются */
export const loraEncode = (params: LoRaParams, raw: Record<string, unknown>, values: LoRaValues): Record<string, number> => {
  const out: Record<string, number> = {}
  for (const name of LORA_PARAMS) {
    const p = params[name]
    const value = values[name]
    if (!p?.key || value === undefined || !Number.isFinite(value)) continue
    const code = p.options || LORA_SWITCHES.includes(name) ? Math.trunc(value) : Math.round(value * (p.scale || 1)) + (p.offset ?? 0)
    const word = out[p.key] ?? (Number(raw[p.key]) || 0)
    out[p.key] = p.bits ? bitFieldSet(word, p.bits.start, p.bits.end, code) : code
  }
  return out
}
