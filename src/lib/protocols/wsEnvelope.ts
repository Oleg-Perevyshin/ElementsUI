/* Конверт WebSocket {HDR, ARG, VAL}: HDR - имя заголовка, ARG - имя аргумента или его код из словаря (число 0..8191, те же биты 13-1 HAR без заголовка и флага ответа). Команда модулю за хабом (ModSN не равен DevSN) уходит с кодом - хаб пересылает его модулю без перевода; входящий числовой ARG переводится в имя до разбора */
import { DEFAULT_DICTIONARY, type Dictionary } from "./dictionary.js"

export type WsArgument = string | number

export interface WsEnvelope<V = Record<string, unknown>> {
  HDR: string
  ARG: WsArgument
  VAL: V
}

/* Адресат - модуль за хабом: ModSN задан и не равен DevSN */
export const isModuleTarget = (val: unknown): boolean => {
  if (!val || typeof val !== "object") return false
  const { DevSN, ModSN } = val as { DevSN?: unknown; ModSN?: unknown }
  return typeof ModSN === "string" && ModSN !== "" && ModSN !== DevSN
}

/* Имя → код по словарю; неизвестное имя остаётся строкой */
export const wsArgumentCode = (argument: WsArgument, dictionary: Dictionary = DEFAULT_DICTIONARY): WsArgument =>
  typeof argument === "number" ? argument : (dictionary.code(argument) ?? argument)

/* Код → имя по словарю; неизвестный код - строкой из числа ("4097"), имя - как есть */
export const wsArgumentName = (argument: WsArgument, dictionary: Dictionary = DEFAULT_DICTIONARY): string =>
  typeof argument === "number" ? dictionary.name(argument) : argument

/* Исходящий конверт: модулю за хабом ARG - код из словаря, хабу и облаку - имя */
export const wsEnvelope = <V extends object>(header: string, argument: string, val: V, dictionary: Dictionary = DEFAULT_DICTIONARY): WsEnvelope<V> => ({
  HDR: header,
  ARG: isModuleTarget(val) ? wsArgumentCode(argument, dictionary) : argument,
  VAL: val,
})

/* Входящий конверт с ARG-именем: числовой ARG переводится по словарю, остальное как есть */
export const readWsEnvelope = <P extends { ARG: WsArgument }>(packet: P, dictionary: Dictionary = DEFAULT_DICTIONARY): P & { ARG: string } => ({
  ...packet,
  ARG: wsArgumentName(packet.ARG, dictionary),
})
