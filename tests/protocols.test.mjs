/* tests/protocols.test.mjs - ядро протоколов (poe-svelte-ui-lib/protocols) против эталонных байт прошивки: запуск `npm run Test` */
import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import * as m from "../dist/protocols/index.js"

/* Эталон - пакеты, собранные настоящим poe_cbor_pkt.c прошивки (ProdFactory-ESP, CBOR_PACK + CBOR_PktEncFinish), сырые поля - байтовой строкой: one - 0x42 ← 0x01, HAR 0x1234, h'010203' multi - 0xFFFF ← 0xABCD, HAR 0xC123, float 1.5, -2.25 | 0x1234 ← 0x0017, HAR 0x4001, 300 байт (i & 0xFF) | 0x0005 ← 0x0006, HAR 0x0007, h'010203' empty - 0x0005 ← 0x0006, HAR 0x0007, CBOR_PACK без полей - h'' */
const REF = {
  one: "9f851842011912344301020319f1d8ff",
  multi:
    "9f8519ffff19abcd19c123480000c03f000010c019a4aa851912341719400159012c000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e6f707172737475767778797a7b7c7d7e7f808182838485868788898a8b8c8d8e8f909192939495969798999a9b9c9d9e9fa0a1a2a3a4a5a6a7a8a9aaabacadaeafb0b1b2b3b4b5b6b7b8b9babbbcbdbebfc0c1c2c3c4c5c6c7c8c9cacbcccdcecfd0d1d2d3d4d5d6d7d8d9dadbdcdddedfe0e1e2e3e4e5e6e7e8e9eaebecedeeeff0f1f2f3f4f5f6f7f8f9fafbfcfdfeff000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b19c11f850506074301020319ec8bff",
  empty: "9f8505060740191b83ff",
}
const bytes = (hex) => Uint8Array.from(Buffer.from(hex, "hex"))
const hex = (data) => Buffer.from(data).toString("hex")
const f32 = (...values) => new Uint8Array(new Float32Array(values).buffer)
const ascii = [..."123456789"].map((c) => c.charCodeAt(0))
const MULTI_OBJECTS = [
  { trgBusID: 0xffff, srcBusID: 0xabcd, har: 0xc123, payload: m.encodePacketBytesPayload(f32(1.5, -2.25)) },
  { trgBusID: 0x1234, srcBusID: 0x0017, har: 0x4001, payload: m.encodePacketBytesPayload(Uint8Array.from({ length: 300 }, (_, i) => i & 0xff)) },
  { trgBusID: 5, srcBusID: 6, har: 7, payload: m.encodePacketBytesPayload(Uint8Array.of(1, 2, 3)) },
]

test("контрольные значения CRC", () => {
  assert.equal(m.crc16Kermit(0, ascii), 0x2189)
})

test("сборка пакета - байты как у прошивки", () => {
  assert.equal(hex(m.encodePacket([{ trgBusID: 0x42, srcBusID: 0x01, har: 0x1234, payload: m.encodePacketBytesPayload(Uint8Array.of(1, 2, 3)) }])), REF.one)
  assert.equal(hex(m.encodePacket(MULTI_OBJECTS)), REF.multi)
  assert.equal(hex(m.encodePacket([{ trgBusID: 5, srcBusID: 6, har: 7, payload: m.encodePacketBytesPayload(new Uint8Array()) }])), REF.empty)
  /* пустой Payload - null, как CBOR_PktEncAddRaw без данных; при разборе - снова пустой */
  const nullPacket = m.encodePacket([{ trgBusID: 5, srcBusID: 6, har: 7, payload: new Uint8Array() }])
  assert.equal(nullPacket[5], 0xf6)
  assert.equal(m.decodePacket(nullPacket).objects[0].payload.length, 0)
  assert.throws(() => m.encodePacket([{ trgBusID: 5, srcBusID: 6, har: 7, payload: Uint8Array.of(1, 2) }])) /* не одно CBOR item */
})

test("разбор пакета прошивки", () => {
  const parsed = m.decodePacket(bytes(REF.multi))
  assert.equal(parsed.status, "complete")
  assert.equal(parsed.length, REF.multi.length / 2)
  assert.equal(parsed.objects.length, 3)
  assert.ok(parsed.objects.every((object) => object.crcOk))
  assert.deepEqual([parsed.objects[0].header, parsed.objects[0].argument, parsed.objects[0].reply], [3, 0x0091, true])
  assert.deepEqual([...parsed.objects[2].payload], [0x43, 1, 2, 3]) /* Payload - CBOR item, сырые поля байтовой строкой */
  /* Те же числа, что HAR/HAR_NR из api_har.h прошивки */
  assert.equal(m.makeHar(1, 36), 0x4049)
  assert.equal(m.makeHar(2, 37, false), 0x804a)
  assert.equal(m.makeHar(3, 8191), 0xffff)
  for (const [h, a] of [
    [4, 0],
    [0, 8192],
    [-1, 0],
    [0, 1.5],
  ])
    assert.throws(() => m.makeHar(h, a), RangeError)
  assert.throws(() => m.encodePacket([{ trgBusID: 0x10000, srcBusID: 0, har: 0, payload: new Uint8Array() }]), RangeError)
  assert.throws(() => m.encodeXPoeDebugFrame("GET", "ModInfo", new Uint8Array(), -1), RangeError)
  assert.deepEqual(m.splitHar(0x804a), { header: 2, argument: 37, reply: false })
})

test("поток: обрывок - incomplete, мусор - garbage, два пакета подряд", () => {
  const multi = bytes(REF.multi)
  for (let n = 0; n < multi.length; n++) assert.equal(m.decodePacket(multi.subarray(0, n)).status, "incomplete", `обрывок ${n} байт`)
  assert.equal(m.decodePacket(Uint8Array.of(0x41, 0x42)).status, "garbage")
  assert.equal(m.decodePacket(Uint8Array.of(0xbf, 0xff)).status, "garbage") /* Map вместо массива - не пакет */
  /* Заявленная длина больше предела - мусор, а не вечное ожидание */
  const huge = Uint8Array.of(0x9f, 0x85, 0x00, 0x00, 0x00, 0x5a, 0xff, 0xff, 0xff, 0xff)
  assert.equal(m.decodePacket(huge).status, "incomplete")
  assert.equal(m.decodePacket(huge, 4096).status, "garbage")
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
    { trgBusID: 9, srcBusID: 1, har: 2, payload: Uint8Array.of(1) },
    { trgBusID: 9, srcBusID: 1, har: 3, payload: Uint8Array.of(2) },
  ])
  assert.deepEqual(
    m.decodePacket(twins).objects.map((object) => object.har),
    [2, 3],
  ) /* одному адресату - оба, по порядку */
})

test("CBOR: значение и JSON-текст", () => {
  const value = { Header: "GET", Argument: "ModInfo", Value: { a: 1, bin: Uint8Array.of(1, 2) } }
  assert.deepEqual(m.cborToValue(m.valueToCbor(value)), value)
  assert.deepEqual(m.cborToValue(m.jsonToCbor({ ...value, Value: { a: 1, bin: "AQI=" } })), value) /* строка base64 под ключом с "bin" - байты */
})

test("CBOR: большие байтовые строки, предел uint64, ключи bin", () => {
  /* 300 КБ кодируются без переполнения стека */
  const big = new Uint8Array(300 * 1024).map((_, i) => i & 0xff)
  assert.deepEqual(m.cborToValue(m.valueToCbor({ data: big })).data, big)
  /* Целое больше uint64 - ошибка, а не обрезанное значение */
  assert.throws(() => m.valueToCbor(2n ** 64n))
  assert.equal(hex(m.valueToCbor(2n ** 64n - 1n)), "1bffffffffffffffff")
  /* Большое целое double (не safe integer) кодируется как float64, а не падает на пределе uint64 */
  assert.equal(m.cborToValue(m.valueToCbor(1e20)), 1e20)
  assert.equal(hex(m.valueToCbor(2 ** 53)), "fa5a000000")
  /* uint64 вне safe integer приходит строкой без потери точности, в пределах - числом */
  assert.equal(m.cborToValue(m.valueToCbor(2n ** 53n + 1n)), "9007199254740993")
  assert.equal(m.cborToValue(m.valueToCbor(-(2n ** 64n))), "-18446744073709551616")
  assert.equal(m.cborToValue(m.valueToCbor(2n ** 53n - 1n)), Number.MAX_SAFE_INTEGER)
  /* Base64 разбирается только под ключом, оканчивающимся на bin */
  assert.deepEqual(m.cborToValue(m.jsonToCbor({ FileBin: "AQI=" })), { FileBin: Uint8Array.of(1, 2) })
  assert.deepEqual(m.cborToValue(m.jsonToCbor({ Cabinet: "AQI=" })), { Cabinet: "AQI=" })
})

test("CBOR: строгий разбор", () => {
  /* Неопределённая длина только у строк, массивов и карт, чанки строк только определённой длины */
  assert.deepEqual(m.cborToValue(bytes("5f4101420203ff")), Uint8Array.of(1, 2, 3))
  assert.equal(m.cborToValue(bytes("7f61616162ff")), "ab")
  assert.deepEqual(m.cborToValue(bytes("bf616101ff")), { a: 1 })
  for (const bad of ["1f", "3f", "df", "ff", "5f5f4101ffff", "7f7f6161ffff", "5f6161ff", "9f01", "bf616101", "5f4101", "7f6161"]) {
    assert.throws(() => m.cborToValue(bytes(bad)), undefined, bad)
  }
  /* Ключ "__proto__" - обычное поле, прототип не подменяется */
  const obj = m.cborToValue(bytes("a1695f5f70726f746f5f5fa1617801"))
  assert.equal(Object.getPrototypeOf(obj), Object.prototype)
  assert.deepEqual(Object.keys(obj), ["__proto__"])
  assert.equal(obj.x, undefined)
})

/* CRC-16/KERMIT побайтно - эталон из common.c прошивки (вырезан и собран на компьютере): эмодзи, кириллица, сырой CBOR, все байты */
const CRC_REF = {
  emoji: [[...new TextEncoder().encode("🔵")], 0x288e],
  cyr: [[...new TextEncoder().encode("Объект 1")], 0x766e],
  bin: [[0xa2, 0x63, 0x4b, 0x65, 0x79, 0x6c, 0xd0, 0x9e, 0xd0, 0xb1, 0xff, 0xc3, 0x28, 0xe2, 0x82, 0xac, 0xf0, 0x9f, 0x94, 0xb5, 0xe2, 0x82], 0xb48f],
  all: [Array.from({ length: 256 }, (_, i) => i), 0xd841],
}

test("CRC побайтно, как в common.c прошивки", () => {
  for (const [name, [data, crc16]] of Object.entries(CRC_REF)) {
    assert.equal(m.crc16Kermit(0, data), crc16, `crc16 ${name}`)
  }
})

/* Пакет устройства в консоль: [TrgBusID 0, SrcBusID, HAR без флага ответа, Payload, CRC16] */
const deviceFrame = (header, argument, value, srcId = 0xf47f) => m.encodeXPoeDebugFrame(header, argument, value, srcId, 0, false)
const toHex = (data) => Array.from(data, (b) => b.toString(16).padStart(2, "0").toUpperCase()).join("")

test("xPOE-Debug: разбор потока в любом месте разреза", () => {
  const log = m.valueToCbor([3, "Net", "Сервер запущен", 123456])
  const plot = m.valueToCbor({ "SPEC.910": 1.5 })
  const stream = Uint8Array.from([
    ...new TextEncoder().encode("ESP-ROM boot 🟢 Я\n>Temp:21.5\n"),
    ...deviceFrame("OK!", "DebugLog", log),
    ...deviceFrame("OK!", "DebugPlot", plot),
    ...new TextEncoder().encode("tail line\n"),
  ])
  const expected = [
    { type: "raw", text: "ESP-ROM boot 🟢 Я" },
    { type: "raw", text: ">Temp:21.5" },
    { type: "frame", header: "OK!", argument: "DebugLog", reply: false, value: toHex(log), crcOk: true, freeHeap: "123456" },
    { type: "frame", header: "OK!", argument: "DebugPlot", reply: false, value: toHex(plot), crcOk: true, freeHeap: "" },
    { type: "raw", text: "tail line" },
  ]
  const pick = (item) =>
    item.type === "frame"
      ? {
          type: item.type,
          header: item.header,
          argument: item.argument,
          reply: item.reply,
          value: toHex(item.valueBytes),
          crcOk: item.crcOk,
          freeHeap: item.freeHeap,
        }
      : item
  for (let cut = 0; cut <= stream.length; cut++) {
    const parser = m.createXPoeDebugParser()
    const items = [...parser.push(stream.subarray(0, cut)), ...parser.push(stream.subarray(cut))]
    assert.deepEqual(items.map(pick), expected, `разрез на ${cut} байте`)
  }
})

test("xPOE-Debug: обрыв пакета - пауза сбрасывает, мусорная длина не держит поток", () => {
  const frame = deviceFrame("OK!", "DebugLog", m.valueToCbor([3, "Net", "x", 1]))
  const parser = m.createXPoeDebugParser({ gapMs: 100 })
  assert.deepEqual(parser.push(frame.subarray(0, 10), 0), [])
  assert.equal(parser.push(frame, 1000)[0].argument, "DebugLog")
  const huge = Uint8Array.of(0x9f, 0x85, 0x00, 0x00, 0x00, 0x5a, 0xff, 0xff, 0xff, 0xff)
  const items = m.createXPoeDebugParser().push(Uint8Array.from([...huge, ...new TextEncoder().encode("ok\n"), ...frame]))
  assert.deepEqual(
    items.filter((item) => item.type === "frame").map((item) => item.argument),
    ["DebugLog"],
  )
})

test("xPOE-Debug: недописанная строка после паузы выдаётся текстом, обрывок пакета - нет", () => {
  const parser = m.createXPoeDebugParser({ gapMs: 100 })
  assert.deepEqual(parser.push(new TextEncoder().encode("boot wait"), 0), [])
  const frame = deviceFrame("OK!", "DebugLog", m.valueToCbor([3, "Net", "x", 1]))
  const items = parser.push(frame, 1000)
  assert.deepEqual(
    items.map((item) => (item.type === "raw" ? item.text : item.argument)),
    ["boot wait", "DebugLog"],
  )
  assert.deepEqual(parser.push(frame.subarray(0, 10), 2000), [])
  assert.deepEqual(
    parser.push(new TextEncoder().encode("x\n"), 3000).map((item) => item.text),
    ["x"],
  )
})

test("xPOE-Debug: неверный CRC, команда устройству, несколько записей в пакете", () => {
  const invalidFrame = deviceFrame("OK!", "DebugLog", m.valueToCbor([3, "test", "message", 1]))
  invalidFrame[invalidFrame.length - 2] ^= 1
  const [bad] = m.createXPoeDebugParser().push(invalidFrame)
  assert.equal(bad.crcOk, false)
  const value = m.valueToCbor({ DevName: "Объект 1" })
  const frame = m.encodeXPoeDebugFrame("SET", "ModCfg", value)
  assert.deepEqual([frame[0], frame[1]], [0x9f, 0x85])
  const [parsed] = m.createXPoeDebugParser().push(frame)
  assert.equal(parsed.crcOk, true)
  assert.equal(parsed.srcId, 0)
  assert.equal(parsed.reply, true)
  assert.equal(parsed.freeHeap, "")
  assert.deepEqual([...parsed.valueBytes], [...value])
  const empty = m.encodeXPoeDebugFrame("GET", "ModInfo", m.xPoeDebugValueFromText(""))
  assert.equal(m.createXPoeDebugParser().push(empty)[0].valueBytes.length, 0)
  assert.deepEqual(parsed.payload, { DevName: "Объект 1" })
  const two = m.encodePacket([
    { trgBusID: 0, srcBusID: 1, har: m.encodeHar("OK!", "ModCfg", false), payload: value },
    { trgBusID: 0, srcBusID: 1, har: m.encodeHar("OK!", "DebugPlot", false), payload: m.valueToCbor({ A: 1 }) },
  ])
  assert.deepEqual(
    m
      .createXPoeDebugParser()
      .push(two)
      .map((item) => item.argument),
    ["ModCfg", "DebugPlot"],
  ) /* строка таблицы - общая для облака и терминала */
  assert.deepEqual(m.xPoeDebugRow(parsed), {
    trgId: "0x0000",
    srcId: "0x0000",
    har: parsed.har.toString(16).toUpperCase().padStart(4, "0"),
    header: "SET",
    argument: "ModCfg",
    reply: true,
    value: "DevName: Объект 1",
    valueBytes: parsed.valueBytes,
    payload: parsed.payload,
    crc: parsed.crc,
    freeHeap: "",
  })
  assert.equal(m.xPoeDebugRow(bad).header, "⚠️")
  assert.equal(m.xPoeDebugRow({ type: "raw", text: "boot" }).header, "RAW")
  /* сообщение устройства - в message и level, VALUE - как пришёл */
  const [error] = m.createXPoeDebugParser().push(deviceFrame("ER!", "ModCfg", m.valueToCbor({ Message: 404, Args: ["Home"] })))
  const errorRow = m.xPoeDebugRow(error, "en")
  assert.deepEqual(
    [errorRow.value, errorRow.message, errorRow.level, errorRow.reply],
    ["Message: 404, Args: [Home]", "Could not connect to Wi-Fi Home, previous network restored", "warn", false],
  )
  const [log] = m.createXPoeDebugParser().push(deviceFrame("OK!", "DebugLog", m.valueToCbor([2, "HAR 0xC048", "MSG 404 Home 5G", 1000])))
  const logRow = m.xPoeDebugRow(log, "en")
  assert.deepEqual(
    [logRow.value, logRow.message, logRow.freeHeap],
    ["🟡 · HAR 0xC048 · MSG 404 Home 5G", "Could not connect to Wi-Fi Home 5G, previous network restored", "1000"],
  )
  assert.equal("message" in m.xPoeDebugRow(parsed), false)
  assert.deepEqual([m.parseBusId("00FF"), m.parseBusId(""), m.parseBusId("XYZ", 7), m.parseBusId("10000", 7), m.formatBusId(0xab)], [255, 0, 7, 7, "0x00AB"])
  /* таблица: DebugLog - уровень · тег · текст, FHS в отдельной колонке; не CBOR - HEX */
  assert.equal(m.formatXPoeDebugValue([2, "Net", "Нет связи", 1000], new Uint8Array()), "🟡 · Net · Нет связи")
  assert.equal(m.formatXPoeDebugValue(undefined, Uint8Array.of(0xab, 0xcd)), "AB CD")
  /* окно: развёрнутый вид - карта с отступами, float32 кратко, DebugLog по строкам, дамп по 16 байт */
  const float32Map = m.cborToValue(Uint8Array.from(Buffer.from("A16154FA3DF5C28F", "hex"))) /* {"T": float32 0.12} */
  assert.equal(m.formatXPoeDebugValue(float32Map, new Uint8Array()), "T: 0.12")
  assert.equal(m.formatXPoeDebugPretty({ Mode: 1, List: [1, 2] }), "Mode: 1\nList:\n  - 1\n  - 2")
  assert.equal(m.formatXPoeDebugPretty([3, "API", "Запуск", 2048]), "🟢 API\nЗапуск\nFHS: 2048")
  assert.deepEqual(
    m
      .formatXPoeDebugPretty([4, "RX", new Uint8Array(17).fill(0xab), 1])
      .split("\n")
      .slice(1),
    ["bytes(17):", "AB AB AB AB AB AB AB AB AB AB AB AB AB AB AB AB", "AB", "FHS: 1"],
  )
  assert.equal(m.formatXPoeDebugPretty(undefined), null)
  assert.ok(
    m.formatXPoeDebugPretty(float32Map, true).includes('<span style="color:var(--blue-text)">T:</span> <span style="color:var(--red-text)">0.12</span>'),
  )
  assert.equal(m.formatXPoeDebugPretty("<b>", true), '<span style="color:var(--purple-text)">&lt;b&gt;</span>')
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
  /* Начало истекло - обрезанный хвост не выдаётся пакетом */
  assert.deepEqual(late, [])
  /* Медленный, но непрерывный поток: таймаут считается от последнего фрагмента */
  const slow = m.createCanParser({ sessionTimeoutMs: 2000 })
  const received = a.flatMap((frame, index) => slow.push(new TextEncoder().encode(m.encodeSlcanFrame(frame, false)), index * 500))
  assert.equal(received.length, 1)
  assert.deepEqual([...received[0].data], [...bytes(REF.multi)])
  assert.equal(received[0].timestamp, 0)
  /* Поток без CR не копится: после мусора кадры разбираются */
  const noise = m.createCanParser()
  assert.deepEqual(noise.push(new TextEncoder().encode("x".repeat(20000)), 0), [])
  assert.equal(noise.push(new TextEncoder().encode("\r" + m.encodeCanPacket(bytes(REF.one), false, 0x33)), 1)[0].packetId, 0x33)
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
  /* Шум 0x80/0x81/0x83 (definite-массивы) перед пакетом: ни пустых пакетов, ни проглоченного настоящего */
  for (const noise of [[0x80], [0x81], [0x83, 1, 2, 3], [0x80, 0x41, 0x83, 1, 2, 3, 0x81]]) {
    const packets = m.createPacketStreamParser().push(Uint8Array.from([...noise, ...one]), 0)
    assert.deepEqual(
      packets.map((packet) => [hex(packet.bytes), packet.objects.length]),
      [[REF.one, 1]],
      `шум ${hex(Uint8Array.from(noise))}`,
    )
  }
  assert.equal(m.decodePacket(Uint8Array.of(0x83, 1, 2, 3)).status, "garbage")
  assert.equal(m.decodePacket(Uint8Array.of(0x81, ...one)).status, "garbage")
  /* Пакет без записей (0x9F 0xFF) - мусор для потока */
  assert.deepEqual(m.createPacketStreamParser().push(Uint8Array.of(0x9f, 0xff, ...one), 0).length, 1)
  const parser = m.createPacketStreamParser({ gapMs: 100 })
  assert.equal(parser.push(multi.subarray(0, 10), 0).length, 0)
  assert.deepEqual(
    parser.push(one, 500).map((packet) => hex(packet.bytes)),
    [REF.one],
  )
})

test("словарь, поле Value xPOE-Debug, команды slcan-адаптера", () => {
  /* DEFAULT_ARGUMENT_CODES - ровно мастер-словарь команд dictionaries/commands.yaml (сгенерирован npm run Generate, файл поставляется в пакете) */
  const commandsYaml = readFileSync(new URL("../dist/dictionaries/commands.yaml", import.meta.url), "utf8")
  assert.deepEqual(
    m.DEFAULT_ARGUMENT_CODES,
    Object.fromEntries([...commandsYaml.matchAll(/^- \[\s*([^,\]]+?)\s*,\s*[^,\]]+?\s*,\s*(\d+)\s*\]/gm)].map(([, name, code]) => [name, Number(code)])),
  )
  assert.equal(
    Object.keys(m.DEFAULT_ARGUMENT_CODES).length,
    Number(readFileSync(new URL("../dist/dictionaries/commands.yaml", import.meta.url), "utf8").match(/^- \[/gm).length),
  )
  assert.equal(m.DEFAULT_ARGUMENT_CODES.DebugLog, 11)
  assert.equal(m.DEFAULT_ARGUMENT_CODES.DebugPlot, 12)
  assert.equal(m.DEFAULT_ARGUMENT_CODES.DataStream, 15)
  assert.equal(m.DEFAULT_ARGUMENT_CODES.FDwS, undefined)
  /* Команда, которой нет в словаре, - кодом, десятичным или HEX, туда и обратно через name() */
  assert.deepEqual(
    [m.DEFAULT_DICTIONARY.code("4097"), m.DEFAULT_DICTIONARY.code("0x1001"), m.DEFAULT_DICTIONARY.code("0x"), m.DEFAULT_DICTIONARY.name(4097)],
    [4097, 4097, undefined, "4097"],
  )
  assert.equal(m.encodeHar("SET", "4097"), m.encodeHar("SET", 4097))
  assert.equal(m.encodeHar("SET", "0x1001"), m.encodeHar("SET", 4097))
  assert.throws(() => m.encodeHar("SET", "9000")) /* больше 8191 */
  const custom = m.createDictionary({ ...m.DEFAULT_ARGUMENT_CODES, MyCmd: 300 })
  assert.deepEqual(
    [custom.header(2), custom.name(300), custom.name(9999), custom.code("MyCmd"), custom.code("constructor")],
    ["OK!", "MyCmd", "9999", 300, undefined],
  )
  assert.throws(() => m.encodeHar("SET", "MyCmd")) /* во встроенном словаре нет */
  const mine = m.encodeXPoeDebugFrame("SET", "MyCmd", new Uint8Array(), 0, 0, true, custom)
  assert.equal(m.createXPoeDebugParser({ dictionary: custom }).push(mine)[0].argument, "MyCmd")
  assert.equal(m.createXPoeDebugParser().push(mine)[0].argument, "300")
  assert.deepEqual([...m.xPoeDebugValueFromText("")], [])
  assert.deepEqual([...m.xPoeDebugValueFromText("h'A1 61 61 01'")], [0x44, 0xa1, 0x61, 0x61, 0x01]) /* h'..' - байтовая строка CBOR */
  assert.deepEqual([...m.xPoeDebugValueFromText("0xA1616101")], [0xa1, 0x61, 0x61, 0x01])
  /* Число из цифр - JSON, а не HEX: «12» - CBOR 12 (0x0C), «1234» - 0x19 0x04 0xD2 */
  assert.deepEqual([...m.xPoeDebugValueFromText("12")], [0x0c])
  assert.deepEqual([...m.xPoeDebugValueFromText("1234")], [0x19, 0x04, 0xd2])
  assert.deepEqual([...m.xPoeDebugValueFromText("A1 61")], [...m.valueToCbor("A1 61")]) /* HEX без h'..' или 0x - строка */
  assert.throws(() => m.xPoeDebugValueFromText("0xABC"))
  assert.deepEqual([...m.xPoeDebugValueFromText('{"a":1}')], [...m.valueToCbor({ a: 1 })])
  assert.throws(() => m.xPoeDebugValueFromText("{a: 1"), /Value не разобран/)
  assert.deepEqual(m.slcanOpenCommands("S6"), ["C\r", "S6\r", "M0\r", "A0\r", "O\r"])
  assert.deepEqual(m.slcanOpenCommands("S6", "Y2"), ["C\r", "S6\r", "Y2\r", "M0\r", "A0\r", "O\r"])
})

/* Пакет LOG_PLOT прошивки: OK! DebugPlot, Payload - CBOR-карта, собранная poe_cbor (CBOR_EncodeMapStart/String/Float) */
const DEBUG_PLOT_HEX =
  "AC694C494748542E434C52FA3E80000068535045432E393130FA3F00000068535045432E363830FA3FC0000068535045432E363330FA4000000068535045432E353930FA4020000068535045432E353535FA4040000068535045432E353135FA4060000068535045432E343830FA4080000068535045432E343435FA4090000068535045432E343135FA40A00000694C494748542E495252FA3E0000006A4C494748542E50504644FA3EC00000"

test("графики: пакет DebugPlot - значения и порядок серий из CBOR-карты устройства", () => {
  const parser = m.createXPoeDebugParser()
  const [frame] = parser.push(deviceFrame("OK!", m.DEBUG_PLOT_ARGUMENT, m.xPoeDebugValueFromText(`0x${DEBUG_PLOT_HEX}`)))
  assert.equal(frame.type, "frame")
  assert.ok(frame.crcOk)
  const values = m.debugPlotValues(frame.payload)
  assert.equal(values.length, 12)
  const plots = m.createPlotGroups()
  assert.deepEqual(plots.update(values), ["LIGHT", "SPEC"])
  assert.deepEqual(
    plots.data("SPEC").map((p) => p.name),
    ["910", "680", "630", "590", "555", "515", "480", "445", "415"],
  )
  assert.deepEqual(
    plots.data("LIGHT").map((p) => [p.name, p.value]),
    [
      ["CLR", 0.25],
      ["IRR", 0.125],
      ["PPFD", 0.375],
    ],
  )
  /* кадр только с частью серий группы - они впереди в порядке кадра, остальные сохраняются следом */
  plots.update([["SPEC.415", 9]])
  assert.deepEqual(
    plots
      .data("SPEC")
      .map((p) => p.name)
      .slice(0, 2),
    ["415", "910"],
  )
  assert.deepEqual(m.debugPlotValues(undefined), [])
  assert.deepEqual(m.debugPlotValues([1, 2]), [])
  plots.clear()
  assert.deepEqual(plots.data("SPEC"), [])
})

test("конверт WebSocket {HAR, VAL}: сборка и разбор, HAR как на шине", () => {
  /* HAR из слов и обратно - те же биты, что makeHar/splitHar */
  assert.equal(m.encodeHar("GET", "ModCfg"), 0x0049)
  assert.equal(m.encodeHar("GET", 36), m.makeHar(0, 36, true))
  assert.equal(m.encodeHar("OK!", "ModCfg", false), 0x8048)
  assert.deepEqual(m.decodeHar(0x0049), { header: "GET", argument: "ModCfg", code: 36, reply: true })
  assert.throws(() => m.encodeHar("GET", "NoSuchArg"), /NoSuchArg/)
  assert.throws(() => m.encodeHar("PUT", "ModCfg"))
  assert.throws(() => m.encodeHar("GET", 8192), RangeError)
  /* Запрос туда: GET и SET по умолчанию с флагом ответа, имя и код дают одно и то же */
  const VAL = { DevSN: "HUB", ModSN: "MOD", Payload: {} }
  assert.deepEqual(m.encodeWsEnvelope("GET", "ModCfg", VAL), { HAR: 0x0049, VAL })
  assert.deepEqual(m.encodeWsEnvelope("GET", 36, VAL), m.encodeWsEnvelope("GET", "ModCfg", VAL))
  assert.equal(m.encodeWsEnvelope("SET", "ModCfg", VAL).HAR & 1, 1)
  /* Ответ обратно: OK! и ER! по умолчанию без флага, флаг можно задать явно */
  const answer = m.encodeWsEnvelope("OK!", "ModCfg", { DevSN: "HUB", ModSN: "MOD", Message: "", Payload: { A: 1 } })
  assert.equal(answer.HAR, 0x8048)
  assert.equal(m.encodeWsEnvelope("GET", "ModCfg", VAL, false).HAR, 0x0048)
  /* Разбор: части HAR словами, VAL как есть; через CBOR туда и обратно */
  assert.deepEqual(m.decodeWsEnvelope(m.cborToValue(m.valueToCbor(answer))), {
    header: "OK!",
    argument: "ModCfg",
    code: 36,
    reply: false,
    VAL: { DevSN: "HUB", ModSN: "MOD", Message: "", Payload: { A: 1 } },
  })
  /* Не конверт - null */
  for (const bad of [
    null,
    5,
    {},
    { HAR: "GET", VAL: {} },
    { HAR: -1, VAL: {} },
    { HAR: 0x10000, VAL: {} },
    { HAR: 1.5, VAL: {} },
    { HAR: 73 },
    { HAR: 73, VAL: [] },
  ])
    assert.equal(m.decodeWsEnvelope(bad), null)
})

test("словарь: коды облака DevCloud, неизвестный код и свой словарь", () => {
  /* Команды облака - диапазон 7000..7999, устройства - ниже 4096 */
  const cloud = {
    ChatMessage: 7000,
    ChatMessages: 7001,
    SystemMessage: 7002,
    EditMessage: 7003,
    DeleteMessage: 7004,
    UpdateLastRead: 7005,
    JoinChat: 7006,
    UserConnected: 7007,
    ChatUnread: 7008,
    ChatPins: 7009,
    EditChatGroup: 7010,
    RemoveFromChat: 7011,
    DeviceMessages: 7100,
    DeviceConnection: 7101,
    LeaveGroup: 7102,
    LeaveGroups: 7103,
    ResetDevToken: 7104,
  }
  for (const [name, code] of Object.entries(cloud)) assert.equal(m.DEFAULT_ARGUMENT_CODES[name], code, name)
  for (const [name, code] of Object.entries(m.DEFAULT_ARGUMENT_CODES)) assert.ok(name in cloud ? code >= 7000 && code <= 7999 : code < 4096, name)
  /* Команды устройств, которыми пользуется и облако, - со своими кодами */
  assert.deepEqual(
    ["JoinDev", "JoinUser", "LeaveUser", "FS", "Update", "DataStream"].map((name) => m.DEFAULT_ARGUMENT_CODES[name]),
    [23, 24, 25, 22, 7, 15],
  )
  assert.deepEqual(m.decodeWsEnvelope(m.encodeWsEnvelope("SET", "ChatMessage", { ChatID: "c", Message: "hi" })), {
    header: "SET",
    argument: "ChatMessage",
    code: 7000,
    reply: true,
    VAL: { ChatID: "c", Message: "hi" },
  })
  assert.equal(m.encodeWsEnvelope("OK!", "DeviceConnection", {}).HAR, (2 << 14) | (7101 << 1))
  /* Неизвестный код - строкой из числа, код сохраняется */
  assert.deepEqual(m.decodeWsEnvelope({ HAR: m.makeHar(2, 4097, false), VAL: {} }), { header: "OK!", argument: "4097", code: 4097, reply: false, VAL: {} })
  assert.deepEqual(m.decodeHar(m.makeHar(3, 8191, true)), { header: "ER!", argument: "8191", code: 8191, reply: true })
  /* Свой словарь устройства */
  const own = m.createDictionary({ MyCmd: 4000 })
  assert.equal(m.encodeWsEnvelope("SET", "MyCmd", {}, true, own).HAR, m.makeHar(1, 4000, true))
  assert.equal(m.decodeWsEnvelope({ HAR: m.makeHar(2, 4000, false), VAL: {} }, own).argument, "MyCmd")
})
