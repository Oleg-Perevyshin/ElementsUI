/* $lib/protocols/index.ts */
/* Общее ядро протоколов обмена с устройствами для DevCloud, WebApp и SYP-DevTerminal — без Svelte, точка входа "poe-svelte-ui-lib/protocols"
   (условие default: работает и в браузере, и под Node без Vite); импорты с расширением .js, чтобы их разрешал сам Node */
export * from "./cbor/types.js"
export { CborDecoder, decodeCbor } from "./cbor/decoder.js"
export { CborEncoder, encodeCbor } from "./cbor/encoder.js"
export { bytesToBase64, base64ToBytes } from "./cbor/base64.js"
/* Значение ↔ CBOR: двоичные данные — Uint8Array как есть (WebSocket, хранилище, телеметрия) */
export { CborToValue, ValueToCbor, cborToValue, valueToCbor } from "./cbor/value.js"
/* JSON-текст ↔ CBOR: двоичные данные — base64, ключи с "BIN" кодируются байтами (поля ввода терминала и отладки) */
export { CborToJson, JsonToCbor, cborToJson, jsonToCbor } from "./cbor/json.js"
/* Контрольные суммы и пакет poe_cbor_pkt [[TrgBusID, SrcBusID, Cmd, Payload, CRC16], …] (CAN, RS485) */
export { crc16Kermit, crc8Rohc } from "./crc.js"
export {
  BROADCAST_BUS_ID,
  makeCmd,
  splitCmd,
  EXTERNAL_BUS_ID,
  packetObjectCrc,
  encodePacket,
  decodePacket,
  objectsFor,
  createPacketStreamParser,
  type PacketObject,
  type DecodedPacketObject,
  type PacketParse,
} from "./packet.js"
/* Графики отладки: кадр OK! DebPlot (SC_PLOT прошивки) — значения из CBOR-карты, график на группу, серии в порядке устройства */
export { createPlotGroups, debPlotValues, DEB_PLOT_ARGUMENT, type PlotPoint } from "./plotGroups.js"
/* System Console over UART: CBOR [SrcID, HdrArg, Value, FHS, CRC16], plus stream parsing */
export { encodeXPoeDebugFrame, createXPoeDebugParser, xPoeDebugCmd, xPoeDebugValueFromText, type XPoeDebugItem } from "./xPoeDebug.js"
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
/* Словарь заголовков и аргументов Cmd — по умолчанию из мастер-словаря dictionary.yaml библиотеки, разбор файла словаря */
export { HEADER_CODES, DEFAULT_ARGUMENT_CODES, parseArgumentDictionary, nameByCode } from "./dictionary.js"
