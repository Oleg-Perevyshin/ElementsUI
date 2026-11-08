/* $lib/themeWatch.ts - тема для виджетов, которые рисуют цветами из JS (карта, графики): тёмная ли она у элемента и уведомление о смене. Классы .dark/.light у html и body отслеживаются напрямую, событие ThemeChange тоже учитывается - приложению не обязательно его слать */

/* Тёмная ли тема у элемента: по ближайшему предку .dark/.light, иначе по сохранённой теме, по умолчанию светлая */
export const isDarkTheme = (el?: Element | null): boolean => {
  const scope = el?.closest(".dark, .light")
  if (scope) return scope.classList.contains("dark")
  try {
    return localStorage.getItem("AppTheme") === "dark"
  } catch {
    return false
  }
}

/* Вызывает onChange при смене темы страницы; возвращает отписку */
export const watchTheme = (onChange: () => void): (() => void) => {
  if (typeof window === "undefined") return () => {}
  const observer = new MutationObserver(onChange)
  for (const node of [document.documentElement, document.body]) observer.observe(node, { attributes: true, attributeFilter: ["class"] })
  window.addEventListener("ThemeChange", onChange)
  return () => {
    observer.disconnect()
    window.removeEventListener("ThemeChange", onChange)
  }
}
