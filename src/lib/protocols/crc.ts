/* $lib/protocols/crc.ts */
/* Контрольные суммы протоколов устройств — побайтные, как в прошивках (ProdFactory-ESP/STM) */

/* CRC-16/KERMIT: poly 0x1021 reflected (0x8408), init 0x0000, xorout 0x0000, check("123456789") = 0x2189 — объекты пакета poe_cbor_pkt */
export const crc16Kermit = (crc: number, bytes: Uint8Array | number[]): number => {
  for (const byte of bytes) {
    crc ^= byte & 0xff
    for (let bit = 0; bit < 8; bit++) crc = crc & 1 ? (crc >>> 1) ^ 0x8408 : crc >>> 1
  }
  return crc & 0xffff
}

/* CRC-8/ROHC: poly 0x07 reflected (0xE0), init 0xFF, xorout 0x00, check("123456789") = 0xD0 — рамка POESerial (system_console) */
export const crc8Rohc = (crc: number, bytes: Uint8Array | number[]): number => {
  for (const byte of bytes) {
    crc ^= byte & 0xff
    for (let bit = 0; bit < 8; bit++) crc = crc & 1 ? (crc >>> 1) ^ 0xe0 : crc >>> 1
  }
  return crc & 0xff
}
