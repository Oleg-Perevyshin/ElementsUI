/* $lib/widgetAccent.ts - общий "мастер-цвет" для смарт-виджетов конструктора (WidgetWiFi, WidgetDeviceInfo и далее). Роль вида "bg-red" (см. optionsStore.COLOR_OPTIONS - та же палитра, что и во всех примитивах) разворачивается в переопределение --accent-color/--accent-soft на корне виджета: весь внутренний UI (сегмент-контролы, фокус у полей и т.п.) уже читает именно эти переменные, поэтому виджет перекрашивается целиком одним источником истины. */

/* componentClass - значение вида "bg-red" из optionsStore.COLOR_OPTIONS (или "" - без роли, обычный акцент темы). Возвращает inline-style для корня виджета; пустая строка ничего не переопределяет. */
export const widgetAccentStyle = (componentClass: string): string => {
  /* --bg-color = акцент: кнопки виджета с маркером "bg-accent" (класса в теме нет - только роль "залитая") заливаются им по наследованию, поэтому "Сохранить"/"Удалить" перекрашиваются вместе со всем виджетом */
  /* --table-header-color - шапка таблиц внутри виджета (Table) в мягком оттенке мастер-цвета */
  const fill = "--bg-color: var(--accent-color); --table-header-color: var(--accent-soft);"
  const role = componentClass.match(/(?:^|\s)bg-(\w+)/)?.[1]
  if (!role || role === "max") return fill
  return (
    `--accent-color: var(--${role}-color); --accent-soft: var(--${role}-soft); --accent-hover: var(--${role}-color); --on-accent: var(--on-${role}, #ffffff);` +
    `--focus-shadow-color: 0 0 0 3px color-mix(in srgb, var(--${role}-color) 18%, transparent);` +
    fill
  )
}

/* Цвета для слоёв карты: MapLibre не понимает CSS-переменные, поэтому берём готовые значения с элемента виджета */
export interface IMapColors {
  accent: string
  onAccent: string
  green: string
  red: string
  orange: string
}

export const readMapColors = (el: Element | undefined): IMapColors => {
  const style = el ? getComputedStyle(el) : null
  const read = (name: string, fallback: string) => style?.getPropertyValue(name).trim() || fallback
  return {
    accent: read("--accent-color", "#0070eb"),
    onAccent: read("--on-accent", "#ffffff"),
    green: read("--green-mark", "#34c759"),
    red: read("--red-mark", "#ff3b30"),
    orange: read("--orange-mark", "#ff9500"),
  }
}
