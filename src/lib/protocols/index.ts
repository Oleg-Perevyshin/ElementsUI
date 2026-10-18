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
/* Контрольные суммы и пакет poe_cbor_pkt { TrgBusID : [RetBusID, HA_Code, Payload, CRC16] } (CAN, RS485) */
export { crc16Kermit, crc8Rohc, crc8RohcUtf8 } from "./crc.js"
export {
  BROADCAST_BUS_ID,
  makeHaCode,
  splitHaCode,
  packetObjectCrc,
  encodePacket,
  decodePacket,
  objectsFor,
  type PacketObject,
  type DecodedPacketObject,
  type PacketParse,
} from "./packet.js"
/* Рамка POESerial (UART-консоль system_console): сборка команды и потоковый разбор кадров, строк Teleplot и текста */
export { encodePoeSerialFrame, createPoeSerialParser, type PoeSerialItem } from "./poeSerial.js"
