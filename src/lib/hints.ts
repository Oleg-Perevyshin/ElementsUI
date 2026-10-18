/* $lib/hints.ts */
/* Подсказки смарт-виджетов: у каждого виджета своя кнопка «?» в шапке, выбор запоминается в браузере для виджетов этого типа
   (hintsSetting("WidgetPFD") — общий для всех PFD); элемент получает подсказку действием use:hint={{ text, enabled }} —
   всплывающее окно над ним в стиле темы */
import { writable, type Writable } from "svelte/store"

/* Прежние ключи хранения — выбор оператора переносится */
const LEGACY_KEYS: Record<string, string> = { WidgetPFD: "WidgetPFD.tips" }

const settings = new Map<string, Writable<boolean>>()

/* Настройка подсказок виджета: включены по умолчанию, одна на тип виджета */
export const hintsSetting = (widget: string): Writable<boolean> => {
  const cached = settings.get(widget)
  if (cached) return cached
  const storageKey = `Hints.${widget}`
  let initial = true
  try {
    const saved = typeof localStorage === "undefined" ? null : (localStorage.getItem(storageKey) ?? localStorage.getItem(LEGACY_KEYS[widget] ?? ""))
    if (saved !== null) initial = saved !== "0"
  } catch {
    /* хранилище недоступно — подсказки включены */
  }
  const store = writable(initial)
  store.subscribe((on) => {
    if (!on) hideHint()
    try {
      if (typeof localStorage !== "undefined") localStorage.setItem(storageKey, on ? "1" : "0")
    } catch {
      /* хранилище недоступно — выбор действует до перезагрузки */
    }
  })
  settings.set(widget, store)
  return store
}

/* Одно всплывающее окно на страницу: создаётся при первом показе, позиционируется над элементом (или под ним, если сверху нет места) */
let popup: HTMLDivElement | null = null

const ensurePopup = () => {
  if (popup) return popup
  popup = document.createElement("div")
  Object.assign(popup.style, {
    position: "fixed",
    zIndex: "1000",
    maxWidth: "20rem",
    padding: "6px 10px",
    borderRadius: "8px",
    border: "1px solid var(--hairline-color)",
    background: "var(--back-color)",
    color: "var(--font-color)",
    boxShadow: "var(--elevation-2)",
    fontSize: "12px",
    fontWeight: "500",
    lineHeight: "1.45",
    whiteSpace: "pre-line",
    pointerEvents: "none",
    opacity: "0",
    transition: "opacity 120ms ease",
  })
  popup.setAttribute("role", "tooltip")
  document.body.appendChild(popup)
  return popup
}

const showHint = (node: HTMLElement, text: string) => {
  const el = ensurePopup()
  el.textContent = text
  el.style.opacity = "1"
  const rect = node.getBoundingClientRect()
  const box = el.getBoundingClientRect()
  const gap = 8
  const top = rect.top - box.height - gap >= 4 ? rect.top - box.height - gap : rect.bottom + gap
  const left = Math.min(Math.max(4, rect.left + rect.width / 2 - box.width / 2), window.innerWidth - box.width - 4)
  el.style.top = `${top}px`
  el.style.left = `${left}px`
}

export function hideHint() {
  if (popup) popup.style.opacity = "0"
}

export type HintParams = { text?: string; enabled: boolean }

/* Действие для элемента виджета: use:hint={{ text: $T("…"), enabled: $hints }}; пустой текст или выключенные подсказки — ничего */
export const hint = (node: HTMLElement, params: HintParams) => {
  let current = params
  const enter = () => current.enabled && current.text && showHint(node, current.text)
  node.addEventListener("pointerenter", enter)
  node.addEventListener("pointerleave", hideHint)
  return {
    update: (next: HintParams) => {
      current = next
      if (!next.enabled) hideHint()
    },
    destroy: () => {
      node.removeEventListener("pointerenter", enter)
      node.removeEventListener("pointerleave", hideHint)
      hideHint()
    },
  }
}
