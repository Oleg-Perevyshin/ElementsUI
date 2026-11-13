/* $lib/popup.ts - общие правила списков и всплывающих панелей (Select, Dropdown): переход к соседнему доступному варианту и место панели у триггера, позиция от окна (fixed) */

/* Номер соседнего доступного варианта по кругу; from < 0 - ещё ничего не выбрано (вперёд - первый, назад - последний). Все недоступны - -1 */
export const nextEnabled = (count: number, from: number, step: 1 | -1, isDisabled: (index: number) => boolean = () => false): number => {
  const start = from < 0 || from >= count ? (step === 1 ? -1 : count) : from
  for (let n = 1; n <= count; n++) {
    const index = (((start + step * n) % count) + count) % count
    if (!isDisabled(index)) return index
  }
  return -1
}

export interface PopupRect {
  top: number
  bottom: number
  left: number
  right: number
  width: number
}

export interface PopupPlace {
  /* Панель над триггером */
  openUp: boolean
  /* Отступ от верха окна (вниз) или от низа окна (вверх) */
  top?: number
  bottom?: number
  /* Отступ от левого (align start) или правого (align end) края окна */
  left?: number
  right?: number
  /* Свободная высота для панели */
  space: number
}

/* Вниз, если снизу хватает minBelow или там места больше, чем сверху; по левому или правому краю триггера, но не за край окна */
export const popupPlace = (
  anchor: PopupRect,
  viewport: { width: number; height: number },
  align: "start" | "end" = "start",
  { gap = 4, margin = 8, minBelow = 160, minWidth = 160 }: { gap?: number; margin?: number; minBelow?: number; minWidth?: number } = {},
): PopupPlace => {
  const below = viewport.height - anchor.bottom - gap - margin
  const above = anchor.top - gap - margin
  const openUp = below < minBelow && above > below
  const vertical = openUp ? { bottom: viewport.height - anchor.top + gap } : { top: anchor.bottom + gap }
  const horizontal =
    align === "end"
      ? { right: Math.max(margin, viewport.width - anchor.right) }
      : { left: Math.max(margin, Math.min(anchor.left, viewport.width - margin - minWidth)) }
  return { openUp, ...vertical, ...horizontal, space: Math.max(openUp ? above : below, 96) }
}

/* Фокус с клавиатуры (:focus-visible): подсказка по фокусу показывается только при нём, а не когда фокус вернулся на кнопку после закрытия окна или меню */
export const isKeyboardFocus = (event: FocusEvent): boolean => {
  const target = event.currentTarget
  if (!(target instanceof Element)) return false
  try {
    return target.matches(":focus-visible")
  } catch {
    return false
  }
}
