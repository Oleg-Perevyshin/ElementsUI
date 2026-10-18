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

/* Байт для CRC от позиции pos по правилу прошивки (common.c, utf8_seq_byte): целая UTF-8-последовательность даёт младший байт
   своего code point, иначе байт как есть — так прошивка считает CRC и по тексту с эмодзи, и по сырому CBOR */
const utf8SeqByte = (bytes: Uint8Array, pos: number): { data: number; length: number } => {
  const first = bytes[pos]
  const cont = (offset: number) => (bytes[pos + offset] & 0xc0) === 0x80
  if ((first & 0x80) === 0) return { data: first, length: 1 }
  if ((first & 0xe0) === 0xc0 && pos + 1 < bytes.length && cont(1)) return { data: (((first & 0x1f) << 6) | (bytes[pos + 1] & 0x3f)) & 0xff, length: 2 }
  if ((first & 0xf0) === 0xe0 && pos + 2 < bytes.length && cont(1) && cont(2))
    return { data: (((first & 0x0f) << 12) | ((bytes[pos + 1] & 0x3f) << 6) | (bytes[pos + 2] & 0x3f)) & 0xff, length: 3 }
  if ((first & 0xf8) === 0xf0 && pos + 3 < bytes.length && cont(1) && cont(2) && cont(3))
    return { data: (((bytes[pos + 1] & 0x3f) << 12) | ((bytes[pos + 2] & 0x3f) << 6) | (bytes[pos + 3] & 0x3f)) & 0xff, length: 4 }
  return { data: first, length: 1 }
}

/* CRC-8/ROHC по правилу прошивки для UTF-8 (crc8_rohc в common.c) — рамка POESerial: HEADER, ARGUMENT, VALUE */
export const crc8RohcUtf8 = (crc: number, bytes: Uint8Array): number => {
  for (let pos = 0; pos < bytes.length;) {
    const { data, length } = utf8SeqByte(bytes, pos)
    crc = crc8Rohc(crc, [data])
    pos += length
  }
  return crc
}
