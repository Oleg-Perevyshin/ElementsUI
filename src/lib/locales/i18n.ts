import { derived, type Readable } from "svelte/store"
import { writable } from "svelte/store"
import translations from "./translations"
import FlagZh from "./FlagZh.svelte"
import FlagRu from "./FlagRu.svelte"
import FlagEn from "./FlagEn.svelte"

/* Язык по умолчанию */
let initialLanguage = "ru"

/* Проверяем, доступен ли localStorage */
if (typeof window !== "undefined") {
  initialLanguage = localStorage.getItem("AppLanguage") || navigator.language?.split("-")[0]?.toLowerCase() || "ru"
  const supported = ["ru", "en", "zh"]
  if (!supported.includes(initialLanguage)) {
    initialLanguage = "ru"
  }
}

/* Создаем хранилище с начальным значением языка */
export const Language = writable(initialLanguage)

/* Функция для изменения языка */
export function setLanguage(newLang: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("AppLanguage", newLang)
  }
  Language.set(newLang)
}

/* Поддерживаемые языки (код, название языка, флаг) */
export const LOCALES = [
  { id: "app-language-ru", name: "Русский", value: "ru", component: FlagRu },
  { id: "app-language-en", name: "English", value: "en", component: FlagEn },
  { id: "app-language-zh", name: "中国人", value: "zh", component: FlagZh },
]

/* Функция для перевода для текущего языка */
function translate(locale: string, key: string): string {
  return translations[locale]?.[key] || key
}

export const t: Readable<(key: string) => string> = derived(Language, ($lang) => (key: string) => translate($lang, key))
