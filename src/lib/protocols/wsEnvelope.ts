/* Конверт WebSocket {HAR, VAL} - на всех соединениях (браузер - облако, облако - устройство, WebApp - устройство): HAR - то же 16-битное число, что на шине (заголовок, код аргумента из словаря, флаг ответа), VAL - объект данных. Имена заголовка и аргумента по проводу не ходят, только для справки (интерфейсы, журналы) */
import { DEFAULT_DICTIONARY, decodeHar, encodeHar, type Dictionary, type HarParts } from "./dictionary.js"

export interface WsEnvelope<V = Record<string, unknown>> {
  HAR: number
  VAL: V
}

/* Разобранный конверт: части HAR словами и VAL как есть */
export interface WsMessage<V = Record<string, unknown>> extends HarParts {
  VAL: V
}

/* Флаг ответа по умолчанию: запросы GET и SET ждут ответа, ответы OK! и ER! - без флага */
const defaultReply = (header: string) => header === "GET" || header === "SET"

/* Исходящий конверт: аргумент - имя или код из словаря; неизвестное имя или значение вне диапазона - ошибка */
export const encodeWsEnvelope = <V>(
  header: string,
  argument: string | number,
  VAL: V,
  reply = defaultReply(header),
  dictionary: Dictionary = DEFAULT_DICTIONARY,
): WsEnvelope<V> => ({ HAR: encodeHar(header, argument, reply, dictionary), VAL })

/* Входящий конверт: HAR - целое 0..65535, VAL - объект; иначе null (не конверт) */
export const decodeWsEnvelope = <V extends object = Record<string, unknown>>(
  packet: unknown,
  dictionary: Dictionary = DEFAULT_DICTIONARY,
): WsMessage<V> | null => {
  if (!packet || typeof packet !== "object") return null
  const { HAR, VAL } = packet as { HAR?: unknown; VAL?: unknown }
  if (typeof HAR !== "number" || !Number.isInteger(HAR) || HAR < 0 || HAR > 0xffff) return null
  if (!VAL || typeof VAL !== "object" || Array.isArray(VAL)) return null
  return { ...decodeHar(HAR, dictionary), VAL: VAL as V }
}
