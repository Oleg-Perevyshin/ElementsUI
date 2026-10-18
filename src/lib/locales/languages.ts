/* $lib/locales/languages.ts */
/* Единственный источник списка языков для библиотеки и всех приложений на ней (DevCloud, WebApp, терминал); без Svelte-зависимостей — годится и для серверного кода */
export const LANGUAGES = [
  { value: "ru", name: "Русский" },
  { value: "en", name: "English" },
  { value: "zh", name: "中文" },
] as const

export type LanguageCode = (typeof LANGUAGES)[number]["value"]

/* Коды в порядке LANGUAGES — он же порядок переводов в строке словаря */
export const LANGUAGE_CODES: LanguageCode[] = LANGUAGES.map((language) => language.value)

/* Строка словаря: по переводу на каждый язык в порядке LANGUAGES — TypeScript не даст пропустить язык */
type StringPerItem<T extends readonly unknown[]> = { -readonly [K in keyof T]: string }
export type Translation = StringPerItem<typeof LANGUAGES>

/* Словарь приложения или библиотеки: ключ → переводы */
export type Translations = Record<string, Translation>

export const DEFAULT_LANGUAGE: LanguageCode = "ru"

export const isLanguageCode = (value: unknown): value is LanguageCode => LANGUAGE_CODES.includes(value as LanguageCode)
