import { cborToValue } from "./cbor/value.js"

const LOG_LEVELS: Record<number, string> = { 1: "🔴", 2: "🟡", 3: "🟢", 4: "🔵" }
const HTML_ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }
const escapeHtml = (value: string): string => value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char])
const bytesToHex = (bytes: Uint8Array): string => Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0").toUpperCase()).join(" ")

const normalizeCborValue = (value: unknown): unknown => {
  if (value instanceof Uint8Array) return `h'${bytesToHex(value)}'`
  if (Array.isArray(value)) return value.map(normalizeCborValue)
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, normalizeCborValue(item)]))
  return value
}

const compactCborValue = (value: unknown): string => {
  if (typeof value === "string") return escapeHtml(value)
  if (value instanceof Uint8Array) return `bytes(${value.length}): ${escapeHtml(bytesToHex(value))}`
  return escapeHtml(JSON.stringify(normalizeCborValue(value)) ?? String(value))
}

/* Декодирует CBOR Value для таблицы; системный лог имеет вид [уровень, тег, текст]. */
export function formatXPoeDebugValue(rawValue: string): string {
  const hex = rawValue.trim().replace(/\s/g, "")
  if (!hex || hex.length % 2 !== 0 || !/^[0-9A-Fa-f]+$/.test(hex)) return escapeHtml(rawValue)

  try {
    const value = cborToValue(Uint8Array.from(hex.match(/.{2}/g)!, (byte) => parseInt(byte, 16)))
    if (
      Array.isArray(value) &&
      value.length === 3 &&
      typeof value[0] === "number" &&
      LOG_LEVELS[value[0]] &&
      typeof value[1] === "string" &&
      (typeof value[2] === "string" || value[2] instanceof Uint8Array)
    ) {
      const level = LOG_LEVELS[value[0]]
      const detail = compactCborValue(value[2])
      return `<span class="font-semibold">${level}</span> · ${escapeHtml(value[1])}${detail ? ` · ${detail}` : ""}`
    }
    return compactCborValue(value)
  } catch {
    return escapeHtml(rawValue)
  }
}

/* Сохраняет исходный HEX скрытым до раскрытия строки в общей таблице. */
export function formatXPoeDebugValueForTable(rawValue: string, isCbor = true): string {
  if (!isCbor) return escapeHtml(rawValue)
  const formatted = formatXPoeDebugValue(rawValue)
  return formatted === escapeHtml(rawValue) ? formatted : `${formatted}<span class="hidden">\nHEX\n${escapeHtml(rawValue)}</span>`
}

const COPY_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 11c0-2.828 0-4.243.879-5.121C7.757 5 9.172 5 12 5h3c2.828 0 4.243 0 5.121.879C21 6.757 21 8.172 21 11v5c0 2.828 0 4.243-.879 5.121C19.243 22 17.828 22 15 22h-3c-2.828 0-4.243 0-5.121-.879C6 20.243 6 18.828 6 16z"/><path d="M6 19a3 3 0 0 1-3-3v-6c0-3.771 0-5.657 1.172-6.828S7.229 2 11 2h4a3 3 0 0 1 3 3"/></g></svg>`
const COPIED_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`

let copyBindings = 0
let copyObserver: MutationObserver | null = null

const removeXPoeDebugModalFooters = () => {
  document.querySelectorAll<HTMLElement>("[data-modal]").forEach((modal) => {
    if (!modal.querySelector("[data-xpoe-debug-modal]")) return
    const footer = modal.lastElementChild as HTMLElement | null
    if (!footer || modal.children.length < 3) return
    footer.remove()
  })
}

const handleCopyClick = (event: MouseEvent) => {
  if (!(event.target instanceof Element)) return
  const button = event.target.closest<HTMLButtonElement>("button[data-xpoe-copy]")
  if (!button) return

  event.preventDefault()
  event.stopPropagation()
  const value = button.closest("section")?.querySelector("pre")?.textContent ?? ""
  const label = button.getAttribute("aria-label") ?? "Копировать"
  navigator.clipboard
    .writeText(value)
    .then(() => {
      button.innerHTML = COPIED_ICON
      button.setAttribute("aria-label", "Скопировано")
      window.setTimeout(() => {
        button.innerHTML = COPY_ICON
        button.setAttribute("aria-label", label)
      }, 1300)
    })
    .catch(() => {
      button.setAttribute("aria-label", "Не удалось скопировать")
      window.setTimeout(() => button.setAttribute("aria-label", label), 1300)
    })
}

/* Делегированный обработчик кнопок модального окна; возвращённую функцию вызывают при уничтожении страницы. */
export function bindXPoeDebugCopyButtons(): () => void {
  if (copyBindings++ === 0) {
    document.addEventListener("click", handleCopyClick)
    removeXPoeDebugModalFooters()
    copyObserver = new MutationObserver(removeXPoeDebugModalFooters)
    copyObserver.observe(document.documentElement, { childList: true, subtree: true })
  }
  let isBound = true
  return () => {
    if (!isBound) return
    isBound = false
    if (--copyBindings === 0) {
      document.removeEventListener("click", handleCopyClick)
      copyObserver?.disconnect()
      copyObserver = null
    }
  }
}

/* Две прокручиваемые секции модалки; HEX-раздел появляется, если форматтер таблицы добавил исходные байты. */
export function formatXPoeDebugModal(text: string): string {
  const separator = "\nHEX\n"
  const hexIndex = text.lastIndexOf(separator)
  const decoded = hexIndex < 0 ? text : text.slice(0, hexIndex)
  const hex = hexIndex < 0 ? "" : text.slice(hexIndex + separator.length)
  const modalStyle = "display:flex;flex-direction:column;gap:.75rem;max-height:80vh;min-width:0;overflow-y:auto;overflow-x:hidden"
  const sectionStyle = "min-width:0;padding:.25rem 0 .75rem"
  const headingStyle = "display:flex;align-items:center;justify-content:space-between;gap:.75rem;margin:0 0 .5rem;font-weight:600"
  const buttonStyle =
    "display:flex;flex:0 0 28px;align-items:center;justify-content:center;width:28px;height:28px;padding:0;border:0;border-radius:.5rem;background:transparent;color:var(--faint-color);cursor:pointer"
  const buttonClass =
    "flex size-7 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-(--faint-color) transition-colors duration-150 hover:bg-(--container-color) hover:text-(--font-color)"
  const textStyle = "display:block;min-width:0;max-width:100%;margin:0;white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-word;font:inherit"
  const pane = (title: string, target: string, value: string) =>
    `<section style="${sectionStyle}"><div style="${headingStyle}"><span>${title}</span><button type="button" class="${buttonClass}" data-xpoe-copy="${target}" aria-label="Копировать ${title}" style="${buttonStyle}">${COPY_ICON}</button></div><pre style="${textStyle}">${value}</pre></section>`
  return `<div data-xpoe-debug-modal style="${modalStyle}">${pane("Value", "value", decoded)}${hexIndex < 0 ? "" : pane("HEX", "hex", hex)}</div>`
}
