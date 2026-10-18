/* $lib/dragStyle.ts — единый вид перетаскивания для библиотеки и приложений (списки Dragging, холст конструктора DevCloud):
   перетаскиваемый элемент — фон с заметным оттенком акцента, рамка акцентом и тень; место вставки — заливка мягким акцентом со штриховой рамкой */

const GHOST_STYLE = {
  background: "color-mix(in srgb, var(--accent-color) 30%, var(--back-color))",
  outline: "2px solid var(--accent-color)",
  outlineOffset: "-2px",
  boxShadow: "var(--elevation-3)",
  borderRadius: "12px",
  opacity: "1",
} as const

/* Оформить перетаскиваемый элемент; курсор «захват» — на всё время перетаскивания */
export const applyDragGhost = (element: HTMLElement) => {
  Object.assign(element.style, GHOST_STYLE)
  document.body.style.cursor = "grabbing"
}

/* Снять оформление перетаскивания с элемента (если он остаётся на странице) и вернуть курсор */
export const clearDragGhost = (element?: HTMLElement | null) => {
  if (element) for (const key of Object.keys(GHOST_STYLE)) element.style[key as keyof typeof GHOST_STYLE] = ""
  document.body.style.cursor = ""
}

/* Место вставки: заливка мягким акцентом и штриховая рамка акцентом */
export const createDropPlaceholder = (height: number): HTMLElement => {
  const placeholder = document.createElement("div")
  Object.assign(placeholder.style, {
    minHeight: `${height}px`,
    width: "100%",
    background: "var(--accent-soft)",
    border: "2px dashed var(--accent-color)",
    borderRadius: "12px",
    boxSizing: "border-box",
  })
  return placeholder
}
