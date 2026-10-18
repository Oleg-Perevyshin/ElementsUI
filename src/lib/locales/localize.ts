/* $lib/locales/localize.ts */
/* Многоязычные тексты, введённые в конструкторе: строка (один язык) или объект { ru, en, zh }; ru — основной и запасной */
import { LANGUAGE_CODES, type LanguageCode } from "./languages"

export type LocalizedText = string | Partial<Record<LanguageCode, string>>

/* Поля свойств, которые считаются текстом для пользователя — их показывает и правит окно «Тексты и переводы» (TextsEditor) */
const TEXT_KEYS = new Set([
  "name",
  "label",
  "labels",
  "placeholder",
  "text",
  "info",
  "title",
  "captionLeft",
  "captionRight",
  "units",
  "unit",
  "footer",
  "hiddenInfo",
  "alt",
])

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && Object.getPrototypeOf(value) === Object.prototype

export const isLocalizedText = (value: unknown): value is Partial<Record<LanguageCode, string>> => {
  if (!isPlainObject(value)) return false
  const keys = Object.keys(value)
  return keys.length > 0 && keys.every((key) => LANGUAGE_CODES.includes(key as LanguageCode) && typeof value[key] === "string")
}

/* Текст на нужном языке: сам язык → ru → первый непустой */
export const localizeText = (value: LocalizedText | undefined, lang: string): string => {
  if (value === undefined || typeof value === "string") return value ?? ""
  return value[lang as LanguageCode] || value.ru || Object.values(value).find(Boolean) || ""
}

/* Копия структуры, где каждый многоязычный текст заменён строкой на языке lang; функции, компоненты и бинарные данные — как есть */
export function localizeDeep<T>(value: T, lang: string): T {
  if (isLocalizedText(value)) return localizeText(value, lang) as T
  if (Array.isArray(value)) return value.map((item) => localizeDeep(item, lang)) as T
  if (!isPlainObject(value)) return value
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, localizeDeep(item, lang)])) as T
}

/* Поля с данными устройства/рантайма — тексты в них не ищутся */
const SKIP_KEYS = new Set(["id", "streamingData", "historyData", "body", "value", "keys", "eventHandler", "class", "icon"])

export type TextPath = (string | number)[]

/* Все тексты свойств компонента (поля TEXT_KEYS со строкой или { ru, en, zh }) с путями — для окна «Тексты и переводы» */
export function collectTexts(value: unknown, path: TextPath = [], key = ""): { path: TextPath; text: LocalizedText }[] {
  if (TEXT_KEYS.has(key) && (typeof value === "string" || isLocalizedText(value))) return [{ path, text: value }]
  if (Array.isArray(value)) return value.flatMap((item, i) => collectTexts(item, [...path, i], key === "labels" ? key : ""))
  if (!isPlainObject(value)) return []
  return Object.entries(value).flatMap(([k, item]) => (SKIP_KEYS.has(k) ? [] : collectTexts(item, [...path, k], k)))
}

/* Копия объекта с новым значением по пути (промежуточные объекты/массивы копируются) */
export function setAtPath<T>(target: T, path: TextPath, value: unknown): T {
  if (!path.length) return value as T
  const [head, ...rest] = path
  const copy = (Array.isArray(target) ? [...target] : { ...(target as object) }) as Record<string | number, unknown>
  copy[head] = setAtPath(copy[head], rest, value)
  return copy as T
}

/* Текст из трёх полей окна переводов: пусто — "", только ru — строка, иначе объект из непустых языков */
export const packLocalized = (values: Partial<Record<LanguageCode, string>>): LocalizedText => {
  const filled = Object.fromEntries(LANGUAGE_CODES.filter((lang) => values[lang]?.trim()).map((lang) => [lang, values[lang]!.trim()]))
  const langs = Object.keys(filled)
  if (!langs.length) return ""
  return langs.length === 1 && langs[0] === "ru" ? filled.ru : filled
}
