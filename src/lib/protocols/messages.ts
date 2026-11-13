/* Сообщения устройств: в VAL ответа и push поле Message - код из мастер-словаря src/lib/dictionaries/messages.yaml (0 или нет поля - сообщения нет), Args - параметры шаблона {0}, {1}... Коды разбиты на группы с диапазонами (MESSAGE_GROUPS). Текст на языке интерфейса, уровень и группу собирает formatDeviceMessage; DEVICE_MESSAGES, MESSAGE_GROUPS и MESSAGE_CODES генерируются из словаря (dictionaries/generated/messages.ts, npm run Dictionary) */
import { DEFAULT_LANGUAGE, type LanguageCode } from "../locales/languages.js"
import { DEVICE_MESSAGES, MESSAGE_GROUPS, type DeviceMessageEntry, type DeviceMessageLevel } from "../dictionaries/generated/messages.js"

export {
  DEVICE_MESSAGES,
  MESSAGE_CODES,
  MESSAGE_GROUPS,
  type DeviceMessageEntry,
  type DeviceMessageGroup,
  type DeviceMessageLevel,
} from "../dictionaries/generated/messages.js"

/* Сообщение в VAL пакета устройства */
export type DeviceMessage = { Message: number; Args?: (string | number)[] }

/* Сообщение для показа: текст и название группы на языке, уровень, группа (SYS, FS...; код вне групп - null) */
export type FormattedDeviceMessage = { text: string; level: DeviceMessageLevel; group: string | null; groupName: string | null }

/* Текст на языке lang, нет перевода - английский */
const translate = (entry: { en: string } & Partial<Record<LanguageCode, string>>, lang: LanguageCode): string => entry[lang] || entry.en

/* Текст сообщения на языке lang (по умолчанию - DEFAULT_LANGUAGE; приложение передаёт getLanguage()), уровень и группа. 0, нет кода, не число - null. Неизвестный код - "#код: параметры" с уровнем info, группа - по диапазону кода */
export const formatDeviceMessage = (
  code: number | null | undefined,
  args: readonly (string | number)[] = [],
  lang: LanguageCode = DEFAULT_LANGUAGE,
): FormattedDeviceMessage | null => {
  if (typeof code !== "number" || !Number.isInteger(code) || code <= 0) return null
  const list = Array.isArray(args) ? args : []
  const entry: DeviceMessageEntry | undefined = DEVICE_MESSAGES[code]
  const group = entry?.group ?? Object.keys(MESSAGE_GROUPS).find((name) => code >= MESSAGE_GROUPS[name].from && code <= MESSAGE_GROUPS[name].to) ?? null
  const groupName = group && MESSAGE_GROUPS[group] ? translate(MESSAGE_GROUPS[group], lang) : null
  if (!entry) return { text: list.length ? `#${code}: ${list.join(", ")}` : `#${code}`, level: "info", group, groupName }
  /* Параметра нет в Args - "?", чтобы нехватка была видна */
  return {
    text: translate(entry, lang).replace(/\{(\d+)\}/g, (_, index: string) => (list[Number(index)] === undefined ? "?" : String(list[Number(index)]))),
    level: entry.level,
    group,
    groupName,
  }
}

/* Сообщение в тексте DebugLog консоли xPOE-Debug: "MSG <код>[ <арг1>[<TAB><арг2>...]]" - пробел после кода, TAB между параметрами (в SSID бывают пробелы); другой текст - null */
export const parseDebugLogMessage = (text: string): DeviceMessage | null => {
  const match = /^MSG (\d+)(?: ([\s\S]*))?$/.exec(text)
  if (!match) return null
  return match[2] === undefined ? { Message: Number(match[1]) } : { Message: Number(match[1]), Args: match[2].split("\t") }
}
