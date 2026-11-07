/* $lib/html.ts */
const HTML_ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }

/* Текст для вставки в HTML: спецсимволы заменяются сущностями */
export const escapeHtml = (value: unknown): string => String(value ?? "").replace(/[&<>"']/g, (char) => HTML_ESCAPES[char])

/* Видимый текст HTML-строки: DOMParser создаёт неактивный документ, скрипты и обработчики в нём не запускаются */
export const htmlToText = (html: string): string => {
  if (typeof DOMParser === "undefined") return html.replace(/<[^>]*>?/g, "")
  return new DOMParser().parseFromString(html, "text/html").body.textContent ?? ""
}
