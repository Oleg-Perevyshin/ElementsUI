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

/* CRC-8/ROHC и CRC-16/KERMIT побайтно — эталон из common.c прошивки (вырезан и собран на компьютере): эмодзи, кириллица, сырой CBOR, все байты */
const CRC_REF = {
  emoji: [[...new TextEncoder().encode("🔵")], 0x30, 0x288e],
  cyr: [[...new TextEncoder().encode("Объект 1")], 0x11, 0x766e],
  bin: [[0xa2, 0x63, 0x4b, 0x65, 0x79, 0x6c, 0xd0, 0x9e, 0xd0, 0xb1, 0xff, 0xc3, 0x28, 0xe2, 0x82, 0xac, 0xf0, 0x9f, 0x94, 0xb5, 0xe2, 0x82], 0xb0, 0xb48f],
  all: [Array.from({ length: 256 }, (_, i) => i), 0x8e, 0xd841],
}

test("CRC побайтно, как в common.c прошивки", () => {
  for (const [name, [data, crc8, crc16]] of Object.entries(CRC_REF)) {
    assert.equal(m.crc8Rohc(0xff, data), crc8, `crc8 ${name}`)
    assert.equal(m.crc16Kermit(0, data), crc16, `crc16 ${name}`)
  }
})

/* Кадр устройства как его собирает SC_Log: [SOH]HDR[US]ARG[STX]VAL[ETX]CRC[US]FHS[EOT]\n */
const deviceFrame = (header, argument, value, crcOverride) => {
  const enc = (text) => [...new TextEncoder().encode(text)]
  const crc = m.crc8Rohc(m.crc8Rohc(m.crc8Rohc(0xff, enc(header)), enc(argument)), enc(value))
  const crcText = crcOverride ?? crc.toString(16).toUpperCase().padStart(2, "0")
  return [0x01, ...enc(header), 0x1f, ...enc(argument), 0x02, ...enc(value), 0x03, ...enc(crcText), 0x1f, ...enc("123456"), 0x04, 0x0a]
}

test("POESerial: разбор потока в любом месте разреза", () => {
  const stream = Uint8Array.from([
    ...new TextEncoder().encode("ESP-ROM boot\n>Temp:21.5\n>XY:1:2\n"),
    ...deviceFrame("🔵", "ModCfg", "A2646E616D65"),
    ...deviceFrame("🟢", "HTTP", "Сервер запущен"),
    ...new TextEncoder().encode("tail line\n"),
  ])
  const expected = [
    { type: "raw", text: "ESP-ROM boot" },
    { type: "plot", name: "Temp", value: "21.5" },
    { type: "plot", name: "XY", value: "1:2" },
    { type: "frame", header: "🔵", argument: "ModCfg", value: "A2646E616D65", crcOk: true, freeHeap: "123456" },
    { type: "frame", header: "🟢", argument: "HTTP", value: "Сервер запущен", crcOk: true, freeHeap: "123456" },
    { type: "raw", text: "tail line" },
  ]
  const pick = (item) =>
    item.type === "frame"
      ? { type: item.type, header: item.header, argument: item.argument, value: item.value, crcOk: item.crcOk, freeHeap: item.freeHeap }
      : item
  for (let cut = 0; cut <= stream.length; cut++) {
    const parser = m.createPoeSerialParser()
    const items = [...parser.push(stream.subarray(0, cut)), ...parser.push(stream.subarray(cut))]
    assert.deepEqual(items.map(pick), expected, `разрез на ${cut} байте`)
  }
})

test("POESerial: неверный CRC, команда устройству", () => {
  const [bad] = m.createPoeSerialParser().push(Uint8Array.from(deviceFrame("OK!", "ModCfg", "A0", "00")))
  assert.equal(bad.crcOk, false)
  const value = m.valueToCbor({ Payload: { DevName: "Объект 1" } })
  const frame = m.encodePoeSerialFrame("SET", "ModCfg", value)
  assert.deepEqual([...frame.subarray(0, 5)], [0x01, 0x53, 0x45, 0x54, 0x1f])
  const [parsed] = m.createPoeSerialParser().push(frame)
  assert.equal(parsed.crcOk, true)
  assert.deepEqual([...parsed.valueBytes], [...value])
})

/* CAN/CAN FD через slcan */
test("CAN: нарезка на кадры как в can_service прошивки", () => {
  const ids = (frames) => frames.map((frame) => [frame.canId, frame.data.length])
  assert.deepEqual(ids(m.canFragments(new Uint8Array(8), false, 0x123)), [[0x523, 8]])
  assert.deepEqual(ids(m.canFragments(new Uint8Array(20), false, 0x123)), [
    [0x123, 8],
    [0x123, 8],
    [0x523, 4],
  ])
  assert.deepEqual(ids(m.canFragments(new Uint8Array(16), false, 0x7)), [
    [0x007, 8],
    [0x407, 8],
  ])
  assert.deepEqual(ids(m.canFragments(new Uint8Array(70), true, 0x3ff)), [
    [0x3ff, 64],
    [0x7ff, 6],
  ])
  for (let i = 0; i < 50; i++) {
    const id = m.canFragments(new Uint8Array(1), false)[0].canId & m.CAN_PACKET_ID_MASK
    assert.ok(id >= 1 && id <= 0x3ff)
  }
})

test("CAN: кадры slcan, допустимые длины CAN FD", () => {
  assert.equal(m.encodeSlcanFrame({ canId: 0x523, data: Uint8Array.of(1, 2, 0xab) }, false), "t5233" + "0102AB\r")
  assert.equal(m.encodeSlcanFrame({ canId: 0x400, data: new Uint8Array() }, true), "b4000\r")
  const fd13 = m.encodeSlcanFrame({ canId: 0x401, data: new Uint8Array(13).fill(1) }, true)
  assert.equal(fd13, "b401A" + "01".repeat(13) + "00".repeat(3) + "\r")
  assert.equal(m.encodeSlcanFrame({ canId: 0x401, data: new Uint8Array(20) }, true).slice(0, 5), "b401B")
})

test("CAN: сборка пакета из потока slcan в любом месте разреза", () => {
  for (const fd of [false, true]) {
    const packet = bytes(REF.multi)
    const other = bytes(REF.one)
    const stream = new TextEncoder().encode(m.encodeCanPacket(packet, fd, 0x0aa) + m.encodeCanPacket(other, fd, 0x0bb))
    for (let cut = 0; cut <= stream.length; cut += 7) {
      const parser = m.createCanParser()
      const messages = [...parser.push(stream.subarray(0, cut), 0), ...parser.push(stream.subarray(cut), 1)]
      assert.equal(messages.length, 2, `fd=${fd} разрез ${cut}`)
      assert.deepEqual([...messages[0].data], [...packet])
      assert.deepEqual([...messages[1].data], [...other])
      assert.deepEqual([messages[0].packetId, messages[1].packetId], [0x0aa, 0x0bb])
    }
  }
})

test("CAN: чередование пакетов, remote-кадр, таймаут незавершённой сессии", () => {
  const a = m.canFragments(bytes(REF.multi), false, 0x11)
  const b = m.canFragments(bytes(REF.one), false, 0x22)
  const interleaved = [a[0], b[0], ...a.slice(1), ...b.slice(1)].map((frame) => m.encodeSlcanFrame(frame, false)).join("")
  const parser = m.createCanParser()
  const messages = parser.push(new TextEncoder().encode(interleaved + "r5550\r"), 0)
  assert.deepEqual(
    messages.map((message) => [message.packetId, message.remote]),
    [
      [0x11, false],
      [0x22, false],
      [0x155, true],
    ],
  )
  const stale = m.createCanParser({ sessionTimeoutMs: 100 })
  stale.push(new TextEncoder().encode(m.encodeSlcanFrame(a[0], false)), 0)
  const late = stale.push(
    new TextEncoder().encode(
      a
        .slice(1)
        .map((frame) => m.encodeSlcanFrame(frame, false))
        .join(""),
    ),
    500,
  )
  assert.ok(late.length === 0 || late[0].data.length < bytes(REF.multi).length)
})

test("RS485: пакеты из сырого потока, мусор, пауза", () => {
  const one = bytes(REF.one)
  const multi = bytes(REF.multi)
  const stream = new Uint8Array([0x41, 0x42, ...one, ...multi])
  for (let cut = 0; cut <= stream.length; cut++) {
    const parser = m.createPacketStreamParser()
    const packets = [...parser.push(stream.subarray(0, cut), 0), ...parser.push(stream.subarray(cut), 10)]
    assert.deepEqual(
      packets.map((packet) => hex(packet.bytes)),
      [REF.one, REF.multi],
      `разрез ${cut}`,
    )
  }
  const parser = m.createPacketStreamParser({ gapMs: 100 })
  assert.equal(parser.push(multi.subarray(0, 10), 0).length, 0)
  assert.deepEqual(
    parser.push(one, 500).map((packet) => hex(packet.bytes)),
    [REF.one],
  )
})

test("словарь, поле Value POESerial, команды slcan-адаптера", () => {
  assert.equal(Object.keys(m.DEFAULT_ARGUMENT_CODES).length, 52)
  assert.equal(m.DEFAULT_ARGUMENT_CODES.DataStream, 15)
  assert.deepEqual(m.parseArgumentDictionary("# комментарий\n- [ModCfg, A_MOD_CONFIG, 36]   # хвост\n- [OrData, A_OR_DATA, 211]\n"), {
    ModCfg: 36,
    OrData: 211,
  })
  assert.equal(m.nameByCode(m.HEADER_CODES, 2), "OK!")
  assert.equal(m.nameByCode(m.DEFAULT_ARGUMENT_CODES, 9999), "9999")
  assert.deepEqual([...m.poeSerialValueFromText("")], [])
  assert.deepEqual([...m.poeSerialValueFromText("A1 61 61 01")], [0xa1, 0x61, 0x61, 0x01])
  assert.deepEqual([...m.poeSerialValueFromText('{"a":1}')], [...m.valueToCbor({ a: 1 })])
  assert.throws(() => m.poeSerialValueFromText("не json"))
  assert.deepEqual(m.slcanOpenCommands("S6"), ["C\r", "S6\r", "M0\r", "A0\r", "O\r"])
  assert.deepEqual(m.slcanOpenCommands("S6", "Y2"), ["C\r", "S6\r", "Y2\r", "M0\r", "A0\r", "O\r"])
})
