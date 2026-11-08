/* $lib/widgetCollapse.ts - свёрнутость смарт-виджетов в localStorage браузера: хранится только выбор пользователя, отличный от значения в GUI, вместе с этим значением; поменяли GUI - старый выбор больше не действует. typeof window-проверка вместо $app/environment - библиотека не должна знать про SvelteKit. */
const STORAGE_PREFIX = "widget-collapsed:"

/* Запись "<выбор><значение GUI>", например "10" - свернули виджет, который в GUI открыт */
const encode = (collapsed: boolean, guiDefault: boolean) => `${collapsed ? 1 : 0}${guiDefault ? 1 : 0}`

export const readPersistedCollapsed = (persistKey: string | undefined, guiDefault = false): boolean => {
  if (!persistKey || typeof window === "undefined") return guiDefault
  try {
    const saved = window.localStorage.getItem(STORAGE_PREFIX + persistKey)
    return saved?.length === 2 && saved[1] === (guiDefault ? "1" : "0") ? saved[0] === "1" : guiDefault
  } catch {
    return guiDefault
  }
}

export const writePersistedCollapsed = (persistKey: string | undefined, collapsed: boolean, guiDefault = false): void => {
  if (!persistKey || typeof window === "undefined") return
  try {
    if (collapsed === guiDefault) window.localStorage.removeItem(STORAGE_PREFIX + persistKey)
    else window.localStorage.setItem(STORAGE_PREFIX + persistKey, encode(collapsed, guiDefault))
  } catch {
    /* приватный режим/заблокировано - молча игнорируем, просто не запомнится */
  }
}
