/* Simple Serial - текст порта построчно: разбор потока байтов на строки и строка для таблицы журнала; без Svelte, общий для DevTerminal и отладки DevCloud */
import { escapeHtml } from "../html.js"

/* Строки из сырых байтов порта: конец строки \r или \n, пустые пропускаются, хвост без конца строки уходит после паузы idleMs; UTF-8 по кускам не рвётся */
export const createSimpleSerialParser = (onLines: (lines: string[]) => void, idleMs = 300) => {
  const decoder = new TextDecoder()
  let tail = ""
  let timer: ReturnType<typeof setTimeout> | undefined

  const flushTail = () => {
    timer = undefined
    tail += decoder.decode()
    if (tail) onLines([tail])
    tail = ""
  }

  return {
    push(bytes: Uint8Array) {
      clearTimeout(timer)
      const parts = (tail + decoder.decode(bytes, { stream: true })).split(/\r|\n/)
      tail = parts.pop() ?? ""
      const lines = parts.filter((line) => line !== "")
      if (lines.length) onLines(lines)
      if (tail) timer = setTimeout(flushTail, idleMs)
    },
    reset() {
      clearTimeout(timer)
      timer = undefined
      tail = ""
      decoder.decode()
    },
  }
}

/* Строка журнала в HTML: управляющие символы (C0, DEL, C1) - кодом [0xNN] красным, остальное, включая кириллицу, - экранированным текстом */
export const simpleSerialHtml = (text: string): string => {
  let html = ""
  for (const char of text) {
    const code = char.charCodeAt(0)
    html +=
      code < 32 || (code >= 127 && code <= 159)
        ? `<span class="text-(--red-text)">[0x${code.toString(16).padStart(2, "0").toUpperCase()}]</span>`
        : escapeHtml(char)
  }
  return html
}
