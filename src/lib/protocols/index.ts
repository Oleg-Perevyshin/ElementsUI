/* $lib/protocols/index.ts */
/* Общее ядро протоколов обмена с устройствами для DevCloud, WebApp и SYP-DevTerminal — без Svelte, точка входа "poe-svelte-ui-lib/protocols"
   (условие default: работает и в браузере, и под Node без Vite); импорты с расширением .js, чтобы их разрешал сам Node */
export * from "./cbor/types.js"
export { bytesToBase64, base64ToBytes } from "./cbor/base64.js"
/* Значение ↔ CBOR: двоичные данные — Uint8Array как есть (WebSocket, хранилище, телеметрия) */
export { cborToValue, valueToCbor } from "./cbor/value.js"
/* JSON-значение → CBOR: строки base64 под ключами с "BIN" кодируются байтами (поля ввода терминала и отладки) */
export { jsonToCbor } from "./cbor/json.js"
/* Контрольная сумма и пакет poe_cbor_pkt [[TrgBusID, SrcBusID, HAR, Payload, CRC16], …] — все шины и консоль */
export { crc16Kermit } from "./crc.js"
export {
  BUS_ID_REGEXP,
  parseBusId,
  formatBusId,
  makeHar,
  splitHar,
  packetObjectCrc,
  encodePacketBytesPayload,
  encodePacket,
  decodePacket,
  createPacketStreamParser,
  type PacketObject,
  type DecodedPacketObject,
  type PacketParse,
} from "./packet.js"
/* Графики отладки: пакет OK! DebugPlot (LOG_PLOT прошивки) — значения из CBOR-карты, график на группу, серии в порядке устройства */
export { createPlotGroups, debugPlotValues, DEBUG_PLOT_ARGUMENT, type PlotPoint } from "./plotGroups.js"
/* xPOE-Debug — UART-консоль как шина: пакеты вперемешку с текстом загрузчика, логи OK! DebugLog */
export {
  encodeXPoeDebugFrame,
  createXPoeDebugParser,
  xPoeDebugHar,
  xPoeDebugValueFromText,
  xPoeDebugRow,
  DEBUG_LOG_ARGUMENT,
  type XPoeDebugItem,
  type XPoeDebugRow,
} from "./xPoeDebug.js"
/* Отображение Value xPOE-Debug в таблице/модалке и копирование Value/HEX */
export { formatXPoeDebugValue, formatXPoeDebugValueForTable, formatXPoeDebugModal, bindXPoeDebugCopyButtons } from "./xPoeDebugView.js"
/* CAN/CAN FD через slcan-адаптер: нарезка пакета на кадры как в can_service прошивки, кадры slcan, потоковый разбор со сборкой фрагментов */
export {
  CAN_FINAL_BIT,
  CAN_PACKET_ID_MASK,
  canFragments,
  encodeSlcanFrame,
  encodeCanPacket,
  createCanParser,
  slcanOpenCommands,
  type CanFrame,
  type CanMessage,
} from "./can.js"
/* Словарь заголовков и аргументов HAR — по умолчанию из мастер-словаря dictionary.yaml библиотеки, разбор файла словаря */
export { HEADER_CODES, DEFAULT_ARGUMENT_CODES, parseArgumentDictionary, nameByCode } from "./dictionary.js"
