/* $lib/widgetAccent.ts - общий "мастер-цвет" для смарт-виджетов конструктора (WidgetWiFi, WidgetDeviceInfo и далее). Роль вида "bg-red" (см. optionsStore.COLOR_OPTIONS - та же палитра, что и во всех примитивах) разворачивается в переопределение --accent-color/--accent-soft на корне виджета: весь внутренний UI (сегмент-контролы, фокус у полей и т.п.) уже читает именно эти переменные, поэтому виджет перекрашивается целиком одним источником истины. */

/* componentClass - значение вида "bg-red" из optionsStore.COLOR_OPTIONS (или "" - без роли, обычный акцент темы). Возвращает inline-style для корня виджета; пустая строка ничего не переопределяет. */
export const widgetAccentStyle = (componentClass: string): string => {
  /* --bg-color = акцент: кнопки виджета с маркером "bg-accent" (класса в теме нет - только роль "залитая") заливаются им по наследованию, поэтому "Сохранить"/"Удалить" перекрашиваются вместе со всем виджетом */
  /* --table-header-color - шапка таблиц внутри виджета (Table) в мягком оттенке мастер-цвета */
  const fill = "--bg-color: var(--accent-color); --table-header-color: var(--accent-soft);"
  const role = componentClass.match(/(?:^|\s)bg-(\w+)/)?.[1]
  if (!role || role === "max") return fill
  return (
    `--accent-color: var(--${role}-accent, var(--${role}-color)); --accent-text: var(--${role}-text); --accent-soft: var(--${role}-soft); --accent-hover: var(--${role}-accent, var(--${role}-color)); --on-accent: var(--on-${role}, #ffffff);` +
    `--focus-shadow-color: 0 0 0 3px color-mix(in srgb, var(--${role}-accent, var(--${role}-color)) 18%, transparent);` +
    fill
  )
}

/* Цвета для слоёв карты: MapLibre не понимает CSS-переменные, поэтому берём готовые значения с элемента виджета */
export interface IMapColors {
  accent: string
  /* Линии маршрута и следа: заметны на подложке своей темы (в тёмной заливка акцента темна для тонкой линии) */
  line: string
  onAccent: string
  green: string
  red: string
  orange: string
}

export const readMapColors = (el: Element | undefined): IMapColors => {
  const style = el ? getComputedStyle(el) : null
  const read = (name: string, fallback: string) => style?.getPropertyValue(name).trim() || fallback
  return {
    accent: read("--accent-color", "#256bf7"),
    line: read("--accent-text", "#0046c8"),
    onAccent: read("--on-accent", "#ffffff"),
    green: read("--green-mark", "#00cc5f"),
    red: read("--red-mark", "#ff252a"),
    orange: read("--orange-mark", "#fb8900"),
  }
}

/* Мастер-цвет отдельного элемента (столбец прогресса, переключатель, пункт выбора): только если в классах есть роль bg-*, иначе элемент берёт цвет родителя */
export const itemAccentStyle = (classString: string | undefined): string | undefined => {
  const role = classString?.match(/(?:^|\s)bg-(\w+)/)?.[1]
  return role && role !== "max" ? widgetAccentStyle(classString as string) : undefined
}
