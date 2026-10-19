/* $lib/bitField.ts */
/* Битовое поле [start..end] 32-битного слова конфигурации (Select/Input с bitMode): обычная арифметика вместо знаковых 32-битных операций JS —
   бит 31 и поля любой ширины разбираются и собираются без отрицательных значений; слово на входе может прийти и отрицательным (то же 32-битное представление) */
const span = (start: number, end: number) => 2 ** (end - start + 1)

export const bitFieldGet = (word: number, start: number, end: number): number => Math.floor((word >>> 0) / 2 ** start) % span(start, end)

export const bitFieldSet = (word: number, start: number, end: number, value: number): number => {
  const w = word >>> 0
  const size = span(start, end)
  const field = ((Math.trunc(value) % size) + size) % size
  return w - bitFieldGet(w, start, end) * 2 ** start + field * 2 ** start
}
