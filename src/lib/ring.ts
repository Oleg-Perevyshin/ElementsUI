/* Кольцевой буфер фиксированной ёмкости: добавление O(1) без копий, снимок toArray - от старых к новым; для потоков строк таблицы, точек графика и трека карты */
export interface Ring<T> {
  readonly length: number
  push(...items: T[]): void
  toArray(): T[]
  last(): T | undefined
  resize(capacity: number): void
  clear(): void
}

export const createRing = <T>(capacity: number): Ring<T> => {
  let items: T[] = []
  let head = 0
  let size = Math.max(1, Math.floor(capacity))
  const toArray = () => (head ? [...items.slice(head), ...items.slice(0, head)] : items.slice())
  return {
    get length() {
      return items.length
    },
    push(...values: T[]) {
      for (const value of values) {
        if (items.length < size) items.push(value)
        else {
          items[head] = value
          head = (head + 1) % size
        }
      }
    },
    toArray,
    last: () => (items.length ? items[(head || items.length) - 1] : undefined),
    resize(next: number) {
      next = Math.max(1, Math.floor(next))
      if (next === size) return
      items = toArray().slice(-next)
      head = 0
      size = next
    },
    clear() {
      items = []
      head = 0
    },
  }
}
