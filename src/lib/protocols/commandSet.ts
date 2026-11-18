/* Набор команд отладки: формат SC-Preset.yaml каталога прошивок, файла команд DevCloud и DevTerminal - { metadata, commands: { SimpleSerial, xPOE-Debug, POECanable } }; без Svelte */
import type { AccentColor } from "../accent.js"

interface ICommandBase {
  name: string
  isShown: boolean
  color: AccentColor
}

/* Строка текстом и конец строки */
export interface ISimpleSerial extends ICommandBase {
  data: string
  endPackage: string
}

/* Пакет консоли xPOE-Debug: заголовок и аргумент именами, Payload в виде поля Value (YAML, h'..', 0x..) */
export interface IXPoeDebug extends ICommandBase {
  header: string
  argument: string
  /* Адресат (HEX): 0000 - модуль консоли, иначе BusID модуля изделия */
  TrgBusID: string
  /* Отправитель (HEX), на него придёт ответ: 0000 - внешний клиент */
  SrcBusID: string
  /* Флаг ответа в HAR: false - команда без ответа */
  Reply: boolean
  value: string
}

/* Пакет шины CAN, CAN FD или RS485: заголовок и аргумент кодами строкой, данные - HEX байтами */
export interface IPOECanable extends ICommandBase {
  header: string
  argument: string
  /* Адресат (HEX): FFFF - всем */
  TrgBusID: string
  SrcBusID: string
  Reply: boolean
  data: string
}

export interface ISavedCommands {
  SimpleSerial: ISimpleSerial[]
  "xPOE-Debug": IXPoeDebug[]
  POECanable: IPOECanable[]
}

export const COMMAND_SET_PROTOCOLS = ["SimpleSerial", "xPOE-Debug", "POECanable"] as const

/* Адреса по умолчанию: консоль - модуль консоли (0000), шины - всем (FFFF); отправитель 0000 - внешний клиент */
const DEFAULT_TRG: Record<string, string> = { "xPOE-Debug": "FFFF", POECanable: "FFFF" }

const isRecord = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value)

const isCommand = (value: unknown): value is Record<string, unknown> => isRecord(value) && typeof value.name === "string"

/* Команды набора с заполненными адресами и флагом ответа; не набор (нет любого из трёх списков или команда без имени) - null */
export const normalizeSavedCommands = (data: unknown): ISavedCommands | null => {
  if (!isRecord(data) || !COMMAND_SET_PROTOCOLS.every((protocol) => Array.isArray(data[protocol]) && data[protocol].every(isCommand))) return null
  const fill = (protocol: string) =>
    (data[protocol] as Record<string, unknown>[]).map((command) =>
      protocol in DEFAULT_TRG
        ? { ...command, TrgBusID: command.TrgBusID ?? DEFAULT_TRG[protocol], SrcBusID: command.SrcBusID ?? "0000", Reply: command.Reply ?? true }
        : command,
    )
  return { SimpleSerial: fill("SimpleSerial"), "xPOE-Debug": fill("xPOE-Debug"), POECanable: fill("POECanable") } as unknown as ISavedCommands
}
