/* tests/protocols.test.mjs — ядро протоколов (poe-svelte-ui-lib/protocols) против эталонных байт прошивки: запуск `npm run TestProtocols` */
import { test } from "node:test"
import assert from "node:assert/strict"
import * as m from "../dist/protocols/index.js"

/* Эталон — пакеты, собранные настоящим poe_cbor_pkt.c прошивки (ProdFactory-ESP, CBOR_PACK + CBOR_PktEncFinish):
   one   — 0x42 ← 0x01, HA 0x1234, payload 01 02 03
   multi — 0xFFFF ← 0xABCD, HA 0xC123, float 1.5, -2.25 | 0x1234 ← 0x0017, HA 0x4001, 300 байт (i & 0xFF) | 0x0005 ← 0x0006, HA 0x0007, 01 02 03
   empty — 0x0005 ← 0x0006, HA 0x0007, пустой payload */
const REF = {
  one: "bf184284011912344301020319ad94ff",
  multi:
    "bf19ffff8419abcd19c123480000c03f000010c019a2c0191234841719400159012c000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e6f707172737475767778797a7b7c7d7e7f808182838485868788898a8b8c8d8e8f909192939495969798999a9b9c9d9e9fa0a1a2a3a4a5a6a7a8a9aaabacadaeafb0b1b2b3b4b5b6b7b8b9babbbcbdbebfc0c1c2c3c4c5c6c7c8c9cacbcccdcecfd0d1d2d3d4d5d6d7d8d9dadbdcdddedfe0e1e2e3e4e5e6e7e8e9eaebecedeeeff0f1f2f3f4f5f6f7f8f9fafbfcfdfeff000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b19275e058406074301020319834dff",
  empty: "bf0584060740198432ff",
}
const bytes = (hex) => Uint8Array.from(Buffer.from(hex, "hex"))
const hex = (data) => Buffer.from(data).toString("hex")
const f32 = (...values) => new Uint8Array(new Float32Array(values).buffer)
const ascii = [..."123456789"].map((c) => c.charCodeAt(0))
const MULTI_OBJECTS = [
  { trgBusID: 0xffff, retBusID: 0xabcd, haCode: 0xc123, payload: f32(1.5, -2.25) },
  { trgBusID: 0x1234, retBusID: 0x0017, haCode: 0x4001, payload: Uint8Array.from({ length: 300 }, (_, i) => i & 0xff) },
  { trgBusID: 5, retBusID: 6, haCode: 7, payload: Uint8Array.of(1, 2, 3) },
]

test("контрольные значения CRC", () => {
  assert.equal(m.crc16Kermit(0, ascii), 0x2189)
  assert.equal(m.crc8Rohc(0xff, ascii), 0xd0)
})

test("сборка пакета — байты как у прошивки", () => {
  assert.equal(hex(m.encodePacket([{ trgBusID: 0x42, retBusID: 0x01, haCode: 0x1234, payload: Uint8Array.of(1, 2, 3) }])), REF.one)
  assert.equal(hex(m.encodePacket(MULTI_OBJECTS)), REF.multi)
  assert.equal(hex(m.encodePacket([{ trgBusID: 5, retBusID: 6, haCode: 7, payload: new Uint8Array() }])), REF.empty)
})

test("разбор пакета прошивки", () => {
  const parsed = m.decodePacket(bytes(REF.multi))
  assert.equal(parsed.status, "complete")
  assert.equal(parsed.length, REF.multi.length / 2)
  assert.equal(parsed.objects.length, 3)
  assert.ok(parsed.objects.every((object) => object.crcOk))
  assert.deepEqual([parsed.objects[0].header, parsed.objects[0].argument], [3, 0x0123])
  assert.equal(m.makeHaCode(3, 0x0123), 0xc123)
  assert.deepEqual(
    m.objectsFor(parsed.objects, 0x77).map((object) => object.trgBusID),
    [0xffff],
  )
})

test("поток: обрывок — incomplete, мусор — garbage, два пакета подряд", () => {
  const multi = bytes(REF.multi)
  for (let n = 0; n < multi.length; n++) assert.equal(m.decodePacket(multi.subarray(0, n)).status, "incomplete", `обрывок ${n} байт`)
  assert.equal(m.decodePacket(Uint8Array.of(0x41, 0x42)).status, "garbage")
  const stream = new Uint8Array([...bytes(REF.one), ...bytes(REF.empty)])
  const first = m.decodePacket(stream)
  assert.equal(first.status, "complete")
  assert.equal(m.decodePacket(stream.subarray(first.length)).objects[0].trgBusID, 5)
})

test("порча и одинаковые адреса", () => {
  const damaged = bytes(REF.multi)
  damaged[damaged.length - 3] ^= 0x01
  const parsed = m.decodePacket(damaged)
  assert.equal(parsed.objects.length, 3)
  assert.equal(parsed.objects.filter((object) => !object.crcOk).length, 1)
  const twins = m.encodePacket([
    { trgBusID: 9, retBusID: 1, haCode: 2, payload: Uint8Array.of(1) },
    { trgBusID: 9, retBusID: 1, haCode: 3, payload: Uint8Array.of(2) },
  ])
  assert.equal(m.decodePacket(twins).objects.length, 2)
})

test("CBOR: значение и JSON-текст", () => {
  const value = { Header: "GET", Argument: "ModInfo", Value: { a: 1, bin: Uint8Array.of(1, 2) } }
  assert.deepEqual(m.cborToValue(m.valueToCbor(value)), value)
  assert.deepEqual(m.cborToJson(m.valueToCbor(value)), { ...value, Value: { a: 1, bin: "AQI=" } })
})
