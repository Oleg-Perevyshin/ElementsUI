/* $lib/protocols/crc.ts */
/* Контрольные суммы протоколов устройств — строго побайтные, как crc8_rohc/crc16_kermit в common.c прошивок (ProdFactory-ESP/STM) */

/* CRC-16/KERMIT: poly 0x1021 reflected (0x8408), init 0x0000, xorout 0x0000, check("123456789") = 0x2189 — объекты пакета poe_cbor_pkt */
export const crc16Kermit = (crc: number, bytes: Uint8Array | number[]): number => {
  for (const byte of bytes) {
    crc ^= byte & 0xff
    for (let bit = 0; bit < 8; bit++) crc = crc & 1 ? (crc >>> 1) ^ 0x8408 : crc >>> 1
  }
  return crc & 0xffff
}

/* CRC-8/ROHC remains available for legacy consumers. System Console frames use CRC-16/KERMIT over CBOR bytes. */
export const crc8Rohc = (crc: number, bytes: Uint8Array | number[]): number => {
  for (const byte of bytes) {
    crc ^= byte & 0xff
    for (let bit = 0; bit < 8; bit++) crc = crc & 1 ? (crc >>> 1) ^ 0xe0 : crc >>> 1
  }
  return crc & 0xff
}
