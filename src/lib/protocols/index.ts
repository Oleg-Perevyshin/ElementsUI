/* Общее ядро протоколов обмена с устройствами для DevCloud, WebApp и DevTerminal - без Svelte, точка входа "poe-svelte-ui-lib/protocols" (условие default: работает и в браузере, и под Node без Vite); импорты с расширением .js, чтобы их разрешал сам Node */
export * from "./cbor/types.js"
export { bytesToBase64, base64ToBytes } from "./cbor/base64.js"
/* Значение ↔ CBOR: двоичные данные - Uint8Array как есть (WebSocket, хранилище, телеметрия) */
export { cborToValue, valueToCbor } from "./cbor/value.js"
/* Контрольная сумма; пакет - записи [TrgBusID, HAR, Payload] на всех проводах, рамка [SrcBusID, записи, CRC16] - RS485, UART-консоль и LoRa */
export { crc16Kermit, crc32 } from "./crc.js"
/* Список модулей изделия: соседи по SSDP в состав не входят */
export { MOD_IFACE_NEIGHBOR, isNeighborModule } from "./modList.js"
export {
  BUS_ID_REGEXP,
  parseBusId,
  formatBusId,
  makeHar,
  splitHar,
  encodePacketBytesPayload,
  encodeRecords,
  decodeRecords,
  encodeFrame,
  decodeFrame,
  frameStart,
  laterFrame,
  createFrameStreamParser,
  FRAME_HEAD,
  FRAME_TAIL,
  type PacketRecord,
  type DecodedPacketRecord,
  type PacketFrame,
  type RecordsParse,
  type FrameParse,
} from "./packet.js"
/* Графики отладки: пакет OK! DebugPlot (LOG_PLOT прошивки) - значения из CBOR-карты, график на группу, серии в порядке устройства */
export { createPlotGroups, debugPlotValues, DEBUG_PLOT_ARGUMENT, type PlotPoint } from "./plotGroups.js"
/* xPOE-Debug - UART-консоль как шина: пакеты вперемешку с текстом загрузчика, логи OK! DebugLog */
export {
  encodeXPoeDebugFrame,
  createXPoeDebugParser,
  xPoeDebugValueFromText,
  xPoeDebugRow,
  DEBUG_LOG_ARGUMENT,
  type XPoeDebugItem,
  type XPoeDebugRow,
} from "./xPoeDebug.js"
/* Вид Payload xPOE-Debug: кратко для строки таблицы и развёрнуто для окна */
export { formatXPoeDebugValue, formatXPoeDebugPretty, xPoeDebugMessage } from "./xPoeDebugView.js"
/* CAN/CAN FD через slcan-адаптер: 29-битный ID (важность, отправитель, номер кадра), нарезка записей на кадры как в can_service прошивки, кадры slcan, потоковый разбор со сборкой */
export {
  makeCanId,
  splitCanId,
  canFragments,
  encodeSlcanFrame,
  encodeCanPacket,
  createCanParser,
  slcanOpenCommands,
  createSlcanReader,
  type CanIdFields,
  type CanSender,
  type CanFrame,
  type CanMessage,
  type SlcanFrame,
} from "./can.js"
/* Словарь заголовков и аргументов HAR - по умолчанию из мастер-словаря команд dictionaries/poe_cmd.yaml библиотеки (устройства и облако), разбор файла словаря, словарь устройства с обратным поиском; HAR из слов и обратно */
export {
  HEADER_CODES,
  DEFAULT_ARGUMENT_CODES,
  ARGUMENT_PRIORITIES,
  PRIORITY_DEFAULT,
  packetPriority,
  DEFAULT_DICTIONARY,
  createDictionary,
  encodeHar,
  decodeHar,
  type Dictionary,
  type HarParts,
} from "./dictionary.js"
/* Конверт WebSocket {HAR, VAL} на всех соединениях: сборка из заголовка и аргумента (имя или код), разбор в слова по словарю */
export { encodeWsEnvelope, decodeWsEnvelope, type WsEnvelope, type WsMessage } from "./wsEnvelope.js"
/* Сообщения устройств: Message - код из мастер-словаря dictionaries/poe_msg.yaml (коды по группам MESSAGE_GROUPS), Args - параметры; текст на языке, уровень и группа */
export {
  formatDeviceMessage,
  parseDebugLogMessage,
  DEVICE_MESSAGES,
  MESSAGE_CODES,
  MESSAGE_GROUPS,
  type DeviceMessage,
  type DeviceMessageEntry,
  type DeviceMessageGroup,
  type DeviceMessageLevel,
  type FormattedDeviceMessage,
} from "./messages.js"
/* Simple Serial: текст порта построчно и строка журнала с кодами управляющих символов */
export { createSimpleSerialParser, simpleSerialHtml } from "./simpleSerial.js"
/* Набор команд отладки (SC-Preset.yaml, файлы команд DevCloud и DevTerminal): типы и заполнение адресов по умолчанию */
export { COMMAND_SET_PROTOCOLS, normalizeSavedCommands, type ISavedCommands, type ISimpleSerial, type IXPoeDebug, type IPOECanable } from "./commandSet.js"
