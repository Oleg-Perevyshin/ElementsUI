import { derived, get, writable, type Readable } from "svelte/store"
import translations from "./translations"
import { DEFAULT_LANGUAGE, LANGUAGES, isLanguageCode, resolveLanguage, type LanguageCode, type Translations } from "./languages"

/* Язык и механизм перевода — общие для библиотеки и приложений: приложение берёт отсюда Language/setLanguage/LOCALES и строит свой $T
   из своего словаря через createTranslator (см. README «Языки»); переключение языка одним setLanguage меняет и компоненты, и приложение */

/*
  Текущий язык. Стартует всегда с языка по умолчанию — серверный рендер и гидратация совпадают (Svelte 5 не перерисовывает текст при
  гидратации); сохранённый выбор применяет restoreLanguage(): в SSR-приложениях — в onMount корневого layout, в SPA — при старте
*/
export const Language = writable<string>(DEFAULT_LANGUAGE)

/* Текущий язык — для заголовков запросов (Accept-Language) и прочего кода вне компонентов */
export const getLanguage = (): LanguageCode => resolveLanguage(get(Language))

/* Сохранённый язык → язык браузера; неизвестный код не применяется */
export function restoreLanguage() {
  if (typeof window === "undefined") return
  let saved: string | null = null
  try {
    saved = localStorage.getItem("AppLanguage")
  } catch {
    /* хранилище недоступно */
  }
  const candidate = saved || navigator.language?.split("-")[0]?.toLowerCase()
  if (isLanguageCode(candidate)) setLanguage(candidate)
}

/* Смена языка с сохранением выбора */
export function setLanguage(newLang: string) {
  if (!isLanguageCode(newLang)) return
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("AppLanguage", newLang)
    } catch {
      /* хранилище недоступно — выбор действует до перезагрузки */
    }
  }
  Language.set(newLang)
}

/* Языки для переключателей: список из languages.ts; flag — SVG-разметка (иконка кнопки или {@html}) */
export const LOCALES: { id: string; name: string; value: LanguageCode; flag: string }[] = LANGUAGES.map((language) => ({
  id: `app-language-${language.value}`,
  name: language.name,
  value: language.value,
  flag: language.flag,
}))

/* Параметры перевода: {name} в строке заменяется значением params.name */
export type TranslateParams = Record<string, string | number>

export type Translator = (key: string, params?: TranslateParams) => string

/* Перевод по словарю на заданный язык: язык → язык по умолчанию → сам ключ; без хранилища — для серверного кода (язык запроса) */
export const translate = (dictionary: Translations, locale: string, key: string, params?: TranslateParams): string => {
  const row = dictionary[key]
  const text = (row && (row[locale as LanguageCode] || row[DEFAULT_LANGUAGE])) || key
  return params ? text.replace(/\{(\w+)\}/g, (match, name) => (name in params ? String(params[name]) : match)) : text
}

/* $T приложения из его собственного словаря — поверх общего языка */
export const createTranslator = (dictionary: Translations): Readable<Translator> =>
  derived(Language, ($lang) => (key: string, params?: TranslateParams) => translate(dictionary, $lang, key, params))

/* $T самой библиотеки */
export const T: Readable<Translator> = createTranslator(translations)
