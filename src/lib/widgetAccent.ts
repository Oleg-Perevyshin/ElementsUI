/* $lib/widgetAccent.ts — общий "мастер-цвет" для смарт-виджетов конструктора (WidgetWiFi,
   WidgetDeviceInfo и далее). Роль вида "bg-red" (см. optionsStore.COLOR_OPTIONS — та же палитра,
   что и во всех примитивах) разворачивается в переопределение --accent-color/--accent-soft на
   корне виджета: весь внутренний UI (сегмент-контролы, фокус у полей и т.п.) уже читает именно
   эти переменные, поэтому виджет перекрашивается целиком одним источником истины. */

/* componentClass — значение вида "bg-red" из optionsStore.COLOR_OPTIONS (или "" — без роли,
   обычный акцент темы). Возвращает inline-style для корня виджета; пустая строка ничего не переопределяет. */
export const widgetAccentStyle = (componentClass: string): string => {
  if (!componentClass) return ""
  const role = componentClass.replace(/^bg-/, "")
  if (role === "max") return ""
  return (
    `--accent-color: var(--${role}-color); --accent-soft: var(--${role}-soft); --accent-hover: var(--${role}-color);` +
    `--focus-shadow-color: 0 0 0 3px color-mix(in srgb, var(--${role}-color) 18%, transparent);`
  )
}
