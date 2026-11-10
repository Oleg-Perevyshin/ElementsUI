/* Копирование текста в буфер обмена; false - браузер не дал доступа (нет HTTPS или разрешения) */
export const copyText = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
