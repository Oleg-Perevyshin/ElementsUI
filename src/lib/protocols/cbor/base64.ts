/* Преобразование массива байт в строку base64 */
export function bytesToBase64(data: Uint8Array): string {
  let binary = ""
  const len = data.length
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(data[i])
  }
  return btoa(binary)
}

/* Преобразование строки base64 в массив байт Uint8Array */
export function base64ToBytes(data: string): Uint8Array {
  const binaryString = atob(data)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes
}
