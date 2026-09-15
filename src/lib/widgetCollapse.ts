/* $lib/widgetCollapse.ts — запоминание свёрнутости смарт-виджетов в localStorage браузера
   (Accordion этого не делает — isOpen у него только начальное значение из сохранённого GUI,
   без переживания перезагрузки; виджеты сделаны надёжнее). typeof window-проверка вместо
   $app/environment — библиотека не должна знать про SvelteKit. */
const STORAGE_PREFIX = "widget-collapsed:"

export const readPersistedCollapsed = (persistKey: string | undefined, defaultValue = false): boolean => {
  if (!persistKey || typeof window === "undefined") return defaultValue
  try {
    const saved = window.localStorage.getItem(STORAGE_PREFIX + persistKey)
    return saved === null ? defaultValue : saved === "1"
  } catch {
    return defaultValue
  }
}

export const writePersistedCollapsed = (persistKey: string | undefined, collapsed: boolean): void => {
  if (!persistKey || typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_PREFIX + persistKey, collapsed ? "1" : "0")
  } catch {
    /* приватный режим/заблокировано — молча игнорируем, просто не запомнится */
  }
}
