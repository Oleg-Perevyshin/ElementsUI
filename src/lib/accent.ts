/* $lib/accent.ts - цвет роли темы (accent): переопределяет --accent-* на корне компонента, внутренний UI (заливки, фокус, сегменты) читает эти переменные */
export const ACCENT_COLORS = ["gray", "red", "orange", "yellow", "green", "cyan", "blue", "purple"] as const
export type AccentColor = (typeof ACCENT_COLORS)[number]

export const isAccentColor = (value: unknown): value is AccentColor => ACCENT_COLORS.includes(value as AccentColor)

/* Inline-style корня компонента; без accent - пустая строка, компонент берёт акцент родителя или темы */
export const accentStyle = (accent?: AccentColor | null): string => {
  if (!isAccentColor(accent)) return ""
  const fill = `var(--${accent}-accent, var(--${accent}-color))`
  return (
    `--accent-color: ${fill}; --accent-text: var(--${accent}-text); --accent-soft: var(--${accent}-soft); --on-accent: var(--on-${accent}, #ffffff);` +
    ` --focus-shadow-color: 0 0 0 3px color-mix(in srgb, ${fill} 18%, transparent); --table-header-color: var(--${accent}-soft);`
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
