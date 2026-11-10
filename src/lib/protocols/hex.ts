/* HEX байтов заглавными, по умолчанию сплошной строкой */
export const bytesToHex = (bytes: Uint8Array, separator = ""): string =>
  Array.from(bytes, (byte) => byte.toString(16).toUpperCase().padStart(2, "0")).join(separator)

/* HEX-строка в байты, пробелы допускаются; не HEX или нечётная длина - null */
export const hexToBytes = (hex: string): Uint8Array | null => {
  const clean = hex.replace(/\s/g, "")
  if (clean.length % 2 || !/^[0-9A-Fa-f]*$/.test(clean)) return null
  return Uint8Array.from(clean.match(/../g) ?? [], (pair) => parseInt(pair, 16))
}
