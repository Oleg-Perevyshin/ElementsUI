import { derived, writable, type Readable } from "svelte/store"
import translations from "./translations"
import FlagZh from "./FlagZh.svelte"
import FlagRu from "./FlagRu.svelte"
import FlagEn from "./FlagEn.svelte"
import { DEFAULT_LANGUAGE, LANGUAGES, isLanguageCode, type LanguageCode, type Translations } from "./languages"

/* Язык и механизм перевода — общие для библиотеки и приложений: приложение берёт отсюда Language/setLanguage/LOCALES и строит свой $T
   из своего словаря через createTranslator (см. README «Языки»); переключение языка одним setLanguage меняет и компоненты, и приложение */

/* Стартовый язык: сохранённый → язык браузера → по умолчанию */
let initialLanguage: LanguageCode = DEFAULT_LANGUAGE
if (typeof window !== "undefined") {
  let saved: string | null = null
  try {
    saved = localStorage.getItem("AppLanguage")
  } catch {
    /* хранилище недоступно */
  }
  const candidate = saved || navigator.language?.split("-")[0]?.toLowerCase()
  if (isLanguageCode(candidate)) initialLanguage = candidate
}

/* Текущий язык */
export const Language = writable<string>(initialLanguage)

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

/* Языки для переключателей: список из languages.ts + флаг */
const FLAGS: Record<LanguageCode, ConstructorOfATypedSvelteComponent> = { ru: FlagRu, en: FlagEn, zh: FlagZh }
export const LOCALES: { id: string; name: string; value: LanguageCode; component: ConstructorOfATypedSvelteComponent }[] = LANGUAGES.map((language) => ({
  id: `app-language-${language.value}`,
  name: language.name,
  value: language.value,
  component: FLAGS[language.value],
}))

/* Индекс языка в строке словаря — порядок LANGUAGES */
const LANGUAGE_INDEX: Record<string, number> = Object.fromEntries(LANGUAGES.map((language, index) => [language.value, index]))

/* Параметры перевода: {name} в строке заменяется значением params.name */
export type TranslateParams = Record<string, string | number>

export type Translator = (key: string, params?: TranslateParams) => string

/* Перевод по словарю: текущий язык → русский → сам ключ */
const translate = (dictionary: Translations, locale: string, key: string, params?: TranslateParams): string => {
  const row = dictionary[key]
  const text = row?.[LANGUAGE_INDEX[locale] ?? 0] || row?.[0] || key
  return params ? text.replace(/\{(\w+)\}/g, (match, name) => (name in params ? String(params[name]) : match)) : text
}

/* $T приложения из его собственного словаря — поверх общего языка */
export const createTranslator = (dictionary: Translations): Readable<Translator> =>
  derived(Language, ($lang) => (key: string, params?: TranslateParams) => translate(dictionary, $lang, key, params))

/* $T самой библиотеки */
export const T: Readable<Translator> = createTranslator(translations)
