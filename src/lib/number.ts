/* Число без хвоста плавающей точки (0.1 + 0.2 → 0.3): кратчайшая запись до maxDigits знаков после запятой, иначе округление до maxDigits */
export const roundToClean = (num: number, maxDigits = 2): number => {
  if (Number.isInteger(num)) return num
  for (let digits = 1; digits < maxDigits; digits++) {
    const rounded = Number(num.toFixed(digits))
    if (Math.abs(rounded - num) < 1e-10) return rounded
  }
  return Number(num.toFixed(maxDigits))
}
