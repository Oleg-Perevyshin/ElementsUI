/* Общий буфер потоковых разборщиков (xPOE-Debug, RS485, CAN): чанки дописываются в запас без пересборки, разобранное снимается сдвигом курсора. Пауза дольше gapMs сбрасывает недособранное, застрявшее начало длиннее maxBytes сдвигается на байт - поиск следующего кадра. Выданные наружу байты не перезаписываются: при нехватке места буфер выделяется заново */

/* Шаг разбора: получает несъеденные байты, возвращает, сколько съел; 0 - ждать следующий чанк */
export type FrameStep = (bytes: Uint8Array) => number

export interface FramerOptions {
  maxBytes?: number
  gapMs?: number
}

export const createFramer = ({ maxBytes = 8192, gapMs = 100 }: FramerOptions = {}) => {
  let buffer = new Uint8Array(0)
  let start = 0
  let end = 0
  let last = 0
  return {
    maxBytes,
    /* stale получает недособранное перед сбросом по паузе - например, недописанную строку текста */
    push(chunk: Uint8Array, now: number, step: FrameStep, stale?: (bytes: Uint8Array) => void): void {
      if (end > start && now - last > gapMs) {
        stale?.(buffer.subarray(start, end))
        start = end
      }
      last = now
      if (end + chunk.length > buffer.length) {
        const next = new Uint8Array(Math.max(1024, 2 * (end - start + chunk.length)))
        next.set(buffer.subarray(start, end))
        end -= start
        start = 0
        buffer = next
      }
      buffer.set(chunk, end)
      end += chunk.length
      while (start < end) {
        const used = step(buffer.subarray(start, end))
        if (used > 0) start += used
        else if (end - start > maxBytes) start++
        else break
      }
    },
    reset() {
      start = end
    },
  }
}
