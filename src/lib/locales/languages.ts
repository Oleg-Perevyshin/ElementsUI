/* $lib/locales/languages.ts */
/*
  Единственный источник списка языков для библиотеки и всех приложений на ней (DevCloud, WebApp, терминал); без Svelte — годится и для
  серверного кода. Новый язык — одна запись здесь (код, название, флаг SVG): переключатели языка, окно «Тексты и переводы» и многоязычные
  тексты GUI подхватят его сами, а пока в словарях нет перевода — показывается текст языка по умолчанию.
*/
export const LANGUAGES = [
  {
    value: "ru",
    name: "Русский",
    flag: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 512 512" ><mask id="circleFlagsRu0"><circle cx="256" cy="256" r="256" fill="#fff" /></mask><g mask="url(#circleFlagsRu0)" ><path fill="#0052b4" d="M512 170v172l-256 32L0 342V170l256-32z" /><path fill="#eee" d="M512 0v170H0V0Z" /><path fill="#d80027" d="M512 342v170H0V342Z" /></g ></svg >`,
  },
  {
    value: "en",
    name: "English",
    flag: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 512 512" ><clipPath id="svgIDa"><circle cx="256" cy="256" r="256" /></clipPath><g clip-path="url(#svgIDa)" ><path fill="#eee" d="m0 0l8 16l-8 15v16l32 65l-32 64v32l32 48l-32 48v32l32 64l-32 65v47l16-8l15 8h16l65-32l64 32h32l48-32l48 32h32l64-32l65 32h47l-8-15l8-16v-16l-32-65l32-64v-32l-32-48l32-48v-32l-32-64l32-65V0l-15 8l-16-8h-16l-65 32l-64-32h-32l-48 32l-48-32h-32l-64 32L47 0H0z" /><path fill="#0052b4" d="m47 0l129 129V0Zm289 0v129L465 0ZM0 47v129h129Zm512 0L383 176h129ZM0 336v129l129-129Zm383 0l129 129V336Zm-47 47v129h129zm-160 0L47 512h129Z" /><path fill="#d80027" d="M208 0v208H0v96h208v208h96V304h208v-96H304V0h-96z" /><path fill="#d80027" d="m336 336l176 176v-31L367 336Zm0-160L512 0h-31L336 145Zm-160 0L0 0v31l145 145zm0 160L0 512h31l145-145Z" /></g ></svg >`,
  },
  {
    value: "zh",
    name: "中文",
    flag: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 512 512" ><mask id="circleFlagsCn0"><circle cx="256" cy="256" r="256" fill="#fff" /></mask><g mask="url(#circleFlagsCn0)" ><path fill="#d80027" d="M0 0h512v512H0z" /><path fill="#ffda44" d="m140.1 155.8l22.1 68h71.5l-57.8 42.1l22.1 68l-57.9-42l-57.9 42l22.2-68l-57.9-42.1H118zm163.4 240.7l-16.9-20.8l-25 9.7l14.5-22.5l-16.9-20.9l25.9 6.9l14.6-22.5l1.4 26.8l26 6.9l-25.1 9.6zm33.6-61l8-25.6l-21.9-15.5l26.8-.4l7.9-25.6l8.7 25.4l26.8-.3l-21.5 16l8.6 25.4l-21.9-15.5zm45.3-147.6L370.6 212l19.2 18.7l-26.5-3.8l-11.8 24l-4.6-26.4l-26.6-3.8l23.8-12.5l-4.6-26.5l19.2 18.7zm-78.2-73l-2 26.7l24.9 10.1l-26.1 6.4l-1.9 26.8l-14.1-22.8l-26.1 6.4l17.3-20.5l-14.2-22.7l24.9 10.1z" /></g ></svg >`,
  },
] as const

export type LanguageCode = (typeof LANGUAGES)[number]["value"]

/* Язык по умолчанию: обязателен в каждой строке словаря и в многоязычных текстах, им заменяется отсутствующий перевод */
export const DEFAULT_LANGUAGE = "ru" satisfies LanguageCode

/* Коды в порядке LANGUAGES — порядок показа в переключателях и колонках переводов */
export const LANGUAGE_CODES: LanguageCode[] = LANGUAGES.map((language) => language.value)

/* Строка словаря: перевод по коду языка, обязателен только язык по умолчанию — порядок не важен, новый язык ничего не ломает */
export type Translation = Record<typeof DEFAULT_LANGUAGE, string> & Partial<Record<LanguageCode, string>>

/* Словарь приложения или библиотеки: ключ → переводы */
export type Translations = Record<string, Translation>

export const isLanguageCode = (value: unknown): value is LanguageCode => LANGUAGE_CODES.includes(value as LanguageCode)

/* Код языка из произвольного значения (код, заголовок Accept-Language «en-US,en;q=0.9», язык браузера); неизвестный — язык по умолчанию */
export const resolveLanguage = (value: string | null | undefined): LanguageCode => {
  const code = value?.split(/[,;]/)[0]?.trim().split("-")[0]?.toLowerCase()
  return isLanguageCode(code) ? code : DEFAULT_LANGUAGE
}

/* Ключи словаря без перевода на какой-либо язык — для проверки полноты словаря при добавлении языка */
export const findMissingTranslations = (dictionary: Translations): { key: string; languages: LanguageCode[] }[] =>
  Object.entries(dictionary)
    .map(([key, row]) => ({ key, languages: LANGUAGE_CODES.filter((code) => !row[code]) }))
    .filter((entry) => entry.languages.length > 0)
