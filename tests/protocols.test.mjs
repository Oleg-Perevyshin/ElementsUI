/* tests/protocols.test.mjs - ядро протоколов (poe-svelte-ui-lib/protocols) против эталонных байт прошивки: запуск `npm run Test` */
import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import * as m from "../dist/protocols/index.js"

/* Эталон - байты настоящего poe_cbor_pkt.c прошивки (ProdFactory-STM tests, CBOR_PktEncInitFrame/CBOR_PktEncInit + CBOR_PACK + CBOR_PktEncFinish), сырые поля - байтовой строкой. one - рамка 0x0001: [0x42, HAR 0x1234, h'010203']; multi - рамка 0xABCD: [0xFFFF, HAR 0xC123, float 1.5, -2.25] [0x1234, HAR 0x4001, 300 байт (i & 0xFF)] [5, HAR 7, h'010203'], multiRecords - те же записи без рамки (данные пакета CAN); console - рамка терминала 0x0000: [0xFFFF, GET ModuleConfig, {}] из PROTOCOL.md */
const REF = {
  one: "831900019f83184219123443010203ff196b8b",
  multi:
    "8319abcd9f8319ffff19c123480000c03f000010c08319123419400159012c000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e6f707172737475767778797a7b7c7d7e7f808182838485868788898a8b8c8d8e8f909192939495969798999a9b9c9d9e9fa0a1a2a3a4a5a6a7a8a9aaabacadaeafb0b1b2b3b4b5b6b7b8b9babbbcbdbebfc0c1c2c3c4c5c6c7c8c9cacbcccdcecfd0d1d2d3d4d5d6d7d8d9dadbdcdddedfe0e1e2e3e4e5e6e7e8e9eaebecedeeeff0f1f2f3f4f5f6f7f8f9fafbfcfdfeff000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b83050743010203ff1938ff",
  multiRecords:
    "9f8319ffff19c123480000c03f000010c08319123419400159012c000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e6f707172737475767778797a7b7c7d7e7f808182838485868788898a8b8c8d8e8f909192939495969798999a9b9c9d9e9fa0a1a2a3a4a5a6a7a8a9aaabacadaeafb0b1b2b3b4b5b6b7b8b9babbbcbdbebfc0c1c2c3c4c5c6c7c8c9cacbcccdcecfd0d1d2d3d4d5d6d7d8d9dadbdcdddedfe0e1e2e3e4e5e6e7e8e9eaebecedeeeff0f1f2f3f4f5f6f7f8f9fafbfcfdfeff000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b83050743010203ff",
  console: "831900009f8319ffff1849a0ff195e7b",
  records: "9f83184219123443010203ff",
  nullRecords: "9f830507f6ff",
}
const bytes = (hex) => Uint8Array.from(Buffer.from(hex, "hex"))
const hex = (data) => Buffer.from(data).toString("hex")
const f32 = (...values) => new Uint8Array(new Float32Array(values).buffer)
const ascii = [..."123456789"].map((c) => c.charCodeAt(0))
const MULTI_RECORDS = [
  { trgBusID: 0xffff, har: 0xc123, payload: m.encodePacketBytesPayload(f32(1.5, -2.25)) },
  { trgBusID: 0x1234, har: 0x4001, payload: m.encodePacketBytesPayload(Uint8Array.from({ length: 300 }, (_, i) => i & 0xff)) },
  { trgBusID: 5, har: 7, payload: m.encodePacketBytesPayload(Uint8Array.of(1, 2, 3)) },
]

test("контрольные значения CRC", () => {
  assert.equal(m.crc16Kermit(0, ascii), 0x2189)
})

test("записи и рамка - байты как у прошивки", () => {
  const three = m.encodePacketBytesPayload(Uint8Array.of(1, 2, 3))
  assert.equal(hex(m.encodeRecords([{ trgBusID: 0x42, har: 0x1234, payload: three }])), REF.records)
  assert.equal(hex(m.encodeFrame(1, [{ trgBusID: 0x42, har: 0x1234, payload: three }])), REF.one)
  assert.equal(hex(m.encodeFrame(0xabcd, MULTI_RECORDS)), REF.multi)
  assert.equal(hex(m.encodeRecords(MULTI_RECORDS)), REF.multiRecords)
  assert.equal(hex(m.encodeFrame(0, [{ trgBusID: 0xffff, har: m.encodeHar("GET", "ModuleConfig"), payload: m.valueToCbor({}) }])), REF.console)
  /* пустой Payload - null, как CBOR_PktEncAddRaw без данных; при разборе - снова пустой */
  const nullRecords = m.encodeRecords([{ trgBusID: 5, har: 7, payload: new Uint8Array() }])
  assert.equal(hex(nullRecords), REF.nullRecords)
  assert.equal(m.decodeRecords(nullRecords).records[0].payload.length, 0)
  assert.throws(() => m.encodeRecords([{ trgBusID: 5, har: 7, payload: Uint8Array.of(1, 2) }])) /* не одно CBOR item */
  assert.throws(() => m.encodeRecords([{ trgBusID: 0x10000, har: 0, payload: new Uint8Array() }]), RangeError)
  assert.throws(() => m.encodeFrame(-1, MULTI_RECORDS), RangeError)
})

test("разбор рамки прошивки", () => {
  const parsed = m.decodeFrame(bytes(REF.multi))
  assert.equal(parsed.status, "complete")
  assert.equal(parsed.length, REF.multi.length / 2)
  assert.equal(parsed.frame.srcBusID, 0xabcd)
  assert.equal(parsed.frame.records.length, 3)
  assert.deepEqual([parsed.frame.records[0].header, parsed.frame.records[0].argument, parsed.frame.records[0].reply], [3, 0x0091, true])
  assert.deepEqual([...parsed.frame.records[2].payload], [0x43, 1, 2, 3]) /* Payload - CBOR item, сырые поля байтовой строкой */
  const records = m.decodeRecords(bytes(REF.multiRecords))
  assert.deepEqual(
    records.records.map((record) => record.trgBusID),
    [0xffff, 0x1234, 5],
  )
  /* Те же числа, что HAR/HAR_NR из poe_cmd.h прошивки */
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
  assert.throws(() => m.encodeXPoeDebugFrame("GET", "ModuleInfo", new Uint8Array(), -1), RangeError)
  assert.deepEqual(m.splitHar(0x804a), { header: 2, argument: 37, reply: false })
})

test("поток: обрывок - incomplete, мусор и неверная CRC - garbage, две рамки подряд", () => {
  const multi = bytes(REF.multi)
  for (let n = 0; n < multi.length; n++) assert.equal(m.decodeFrame(multi.subarray(0, n)).status, "incomplete", `обрывок ${n} байт`)
  assert.equal(m.decodeFrame(Uint8Array.of(0x41, 0x42)).status, "garbage")
  assert.equal(m.decodeFrame(bytes(REF.multiRecords)).status, "garbage") /* записи без рамки */
  assert.equal(m.decodeRecords(Uint8Array.of(0xbf, 0xff)).status, "garbage") /* Map вместо массива - не записи */
  /* Заявленная длина больше предела - мусор, а не вечное ожидание */
  const huge = Uint8Array.of(0x83, 0x19, 0, 0, 0x9f, 0x83, 0x00, 0x00, 0x5a, 0xff, 0xff, 0xff, 0xff)
  assert.equal(m.decodeFrame(huge).status, "incomplete")
  assert.equal(m.decodeFrame(huge, 4096).status, "garbage")
  /* Любой испорченный байт рамки - garbage: CRC защищает и отправителя, и записи */
  for (let i = 0; i < multi.length; i++) {
    const damaged = multi.slice()
    damaged[i] ^= 0x01
    assert.notEqual(m.decodeFrame(damaged).status, "complete", `байт ${i}`)
  }
  const stream = new Uint8Array([...bytes(REF.one), ...bytes(REF.console)])
  const first = m.decodeFrame(stream)
  assert.equal(first.status, "complete")
  assert.equal(m.decodeFrame(stream.subarray(first.length)).frame.records[0].trgBusID, 0xffff)
  /* запись другого размера пропускается, одному адресату - все записи по порядку */
  const mixed = Uint8Array.from([0x9f, 0x85, 1, 2, 3, 0xf6, 4, ...bytes(REF.nullRecords).subarray(1)])
  assert.deepEqual(
    m.decodeRecords(mixed).records.map((record) => record.har),
    [7],
  )
  const twins = m.encodeRecords([
    { trgBusID: 9, har: 2, payload: Uint8Array.of(1) },
    { trgBusID: 9, har: 3, payload: Uint8Array.of(2) },
  ])
  assert.deepEqual(
    m.decodeRecords(twins).records.map((record) => record.har),
    [2, 3],
  )
})

test("CBOR: значение с байтами", () => {
  const value = { Header: "GET", Argument: "ModuleInfo", Value: { a: 1, bin: Uint8Array.of(1, 2) } }
  assert.deepEqual(m.cborToValue(m.valueToCbor(value)), value)
})

test("CBOR: большие байтовые строки, предел uint64", () => {
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

/* Рамка устройства в консоль: [SrcBusID, [TrgBusID 0, HAR без флага ответа, Payload], CRC16] */
const deviceFrame = (header, argument, value, srcId = 0xf47f) => m.encodeXPoeDebugFrame(header, argument, value, srcId, 0, false)
const toHex = (data) => Array.from(data, (b) => b.toString(16).padStart(2, "0").toUpperCase()).join("")

test("xPOE-Debug: разбор потока в любом месте разреза", () => {
  const log = m.valueToCbor([3, "Net", "Сервер запущен", 123456])
  const plot = m.valueToCbor({ "SPEC.910": 1.5 })
  const stream = Uint8Array.from([
    ...new TextEncoder().encode("ESP-ROM boot 🟢 Я у\n>Temp:21.5\n"),
    ...deviceFrame("OK!", "DebugLog", log),
    ...deviceFrame("OK!", "DebugPlot", plot),
    ...new TextEncoder().encode("tail line\n"),
  ])
  const expected = [
    { type: "raw", text: "ESP-ROM boot 🟢 Я у" },
    { type: "raw", text: ">Temp:21.5" },
    { type: "frame", srcId: 0xf47f, header: "OK!", argument: "DebugLog", reply: false, value: toHex(log), freeHeap: "123456" },
    { type: "frame", srcId: 0xf47f, header: "OK!", argument: "DebugPlot", reply: false, value: toHex(plot), freeHeap: "" },
    { type: "raw", text: "tail line" },
  ]
  const pick = (item) =>
    item.type === "frame"
      ? {
          type: item.type,
          srcId: item.srcId,
          header: item.header,
          argument: item.argument,
          reply: item.reply,
          value: toHex(item.valueBytes),
          freeHeap: item.freeHeap,
        }
      : item
  for (let cut = 0; cut <= stream.length; cut++) {
    const parser = m.createXPoeDebugParser()
    const items = [...parser.push(stream.subarray(0, cut)), ...parser.push(stream.subarray(cut))]
    assert.deepEqual(items.map(pick), expected, `разрез на ${cut} байте`)
  }
})

test("xPOE-Debug: обрыв рамки - пауза сбрасывает, мусорная длина не держит поток", () => {
  const frame = deviceFrame("OK!", "DebugLog", m.valueToCbor([3, "Net", "x", 1]))
  const parser = m.createXPoeDebugParser({ gapMs: 100 })
  assert.deepEqual(parser.push(frame.subarray(0, 10), 0), [])
  assert.equal(parser.push(frame, 1000)[0].argument, "DebugLog")
  const huge = Uint8Array.of(0x83, 0x19, 0, 0, 0x9f, 0x83, 0x00, 0x00, 0x5a, 0xff, 0xff, 0xff, 0xff)
  const items = m.createXPoeDebugParser().push(Uint8Array.from([...huge, ...new TextEncoder().encode("ok\n"), ...frame]))
  assert.deepEqual(
    items.filter((item) => item.type === "frame").map((item) => item.argument),
    ["DebugLog"],
  )
})

test("xPOE-Debug: недописанная строка после паузы выдаётся текстом, обрывок рамки - нет", () => {
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

test("xPOE-Debug: неверная CRC, команда устройству, несколько записей в рамке", () => {
  const invalidFrame = deviceFrame("OK!", "DebugLog", m.valueToCbor([3, "test", "message", 1]))
  invalidFrame[invalidFrame.length - 2] ^= 1
  assert.deepEqual(
    m
      .createXPoeDebugParser()
      .push(invalidFrame)
      .filter((item) => item.type === "frame"),
    [],
  ) /* рамка с неверной CRC отбрасывается, как в прошивке */
  const value = m.valueToCbor({ DevName: "Объект 1" })
  const frame = m.encodeXPoeDebugFrame("SET", "ModuleConfig", value)
  assert.deepEqual([frame[0], frame[1], frame[4], frame[5]], [0x83, 0x19, 0x9f, 0x83])
  const [parsed] = m.createXPoeDebugParser().push(frame)
  assert.equal(parsed.srcId, 0)
  assert.equal(parsed.reply, true)
  assert.equal(parsed.freeHeap, "")
  assert.deepEqual([...parsed.valueBytes], [...value])
  const empty = m.encodeXPoeDebugFrame("GET", "ModuleInfo", m.xPoeDebugValueFromText(""))
  assert.equal(m.createXPoeDebugParser().push(empty)[0].valueBytes.length, 0)
  assert.deepEqual(parsed.payload, { DevName: "Объект 1" })
  const two = m.encodeFrame(1, [
    { trgBusID: 0, har: m.encodeHar("OK!", "ModuleConfig", false), payload: value },
    { trgBusID: 0, har: m.encodeHar("OK!", "DebugPlot", false), payload: m.valueToCbor({ A: 1 }) },
  ])
  assert.deepEqual(
    m
      .createXPoeDebugParser()
      .push(two)
      .map((item) => [item.argument, item.srcId]),
    [
      ["ModuleConfig", 1],
      ["DebugPlot", 1],
    ],
  ) /* строка таблицы - общая для облака и терминала */
  assert.deepEqual(m.xPoeDebugRow(parsed), {
    trgId: "0x0000",
    srcId: "0x0000",
    har: parsed.har.toString(16).toUpperCase().padStart(4, "0"),
    header: "SET",
    argument: "ModuleConfig",
    reply: true,
    value: 'DevName: "Объект 1"',
    valueBytes: parsed.valueBytes,
    payload: parsed.payload,
    freeHeap: "",
  })
  assert.equal(m.xPoeDebugRow({ type: "raw", text: "boot" }).header, "RAW")
  /* сообщение устройства - в message и level, VALUE - как пришёл */
  const [error] = m.createXPoeDebugParser().push(deviceFrame("ER!", "ModuleConfig", m.valueToCbor({ Message: 404, Args: ["Home"] })))
  const errorRow = m.xPoeDebugRow(error, "en")
  assert.deepEqual(
    [errorRow.value, errorRow.message, errorRow.level, errorRow.reply],
    ['Message: 404, Args: ["Home"]', "Could not connect to Wi-Fi Home, previous network restored", "warn", false],
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
  assert.equal(m.formatXPoeDebugPretty("<b>", true), '<span style="color:var(--purple-text)">&quot;&lt;b&gt;&quot;</span>')
})

/* CAN/CAN FD через slcan: 29-битный ID - важность, отправитель, последний кадр, номер кадра, счётчик */
const SENDER = { priority: 2, srcBusID: 0xabcd, counter: 5 }
const ids = (frames) => frames.map((frame) => [m.splitCanId(frame.canId), frame.data.length])
const idOf = (last, frame, sender = SENDER) => ({ priority: sender.priority, srcBusID: sender.srcBusID, last, frame, counter: sender.counter })

test("CAN: ID кадра и нарезка на кадры как в can_service прошивки", () => {
  /* Пример из PROTOCOL.md: важность 2, Src 0xABCD, последний, кадр 0, счётчик 5 */
  assert.equal(m.makeCanId(idOf(true, 0)), 0x155e6c05)
  assert.deepEqual(m.splitCanId(0x155e6c05), idOf(true, 0))
  assert.deepEqual(m.splitCanId(m.makeCanId({ priority: 3, srcBusID: 0xffff, last: false, frame: 127, counter: 7 })), {
    priority: 3,
    srcBusID: 0xffff,
    last: false,
    frame: 127,
    counter: 7,
  })
  assert.deepEqual(ids(m.canFragments(new Uint8Array(8), false, SENDER)), [[idOf(true, 0), 8]])
  assert.deepEqual(ids(m.canFragments(new Uint8Array(20), false, SENDER)), [
    [idOf(false, 0), 8],
    [idOf(false, 1), 8],
    [idOf(true, 2), 4],
  ])
  assert.deepEqual(ids(m.canFragments(new Uint8Array(70), true, SENDER)), [
    [idOf(false, 0), 64],
    [idOf(true, 1), 6],
  ])
  /* номер кадра идёт по кругу через 127 */
  const long = m.canFragments(new Uint8Array(130 * 8), false, SENDER)
  assert.deepEqual([m.splitCanId(long[127].canId).frame, m.splitCanId(long[128].canId).frame, m.splitCanId(long[129].canId).last], [127, 0, true])
  /* счётчик по умолчанию - следующий по кругу 0..7 */
  const counters = Array.from({ length: 9 }, () => m.splitCanId(m.canFragments(new Uint8Array(1), false, { priority: 0, srcBusID: 1 })[0].canId).counter)
  assert.ok(counters.every((c) => c >= 0 && c <= 7))
  assert.equal(counters[8], counters[0])
})

test("CAN: кадры slcan с расширенным ID, допустимые длины CAN FD", () => {
  assert.equal(m.encodeSlcanFrame({ canId: 0x155e6c05, data: Uint8Array.of(1, 2, 0xab) }, false), "T155E6C053" + "0102AB\r")
  assert.equal(m.encodeSlcanFrame({ canId: 0x400, data: new Uint8Array() }, true), "B000004000\r")
  const fd13 = m.encodeSlcanFrame({ canId: 0x401, data: new Uint8Array(13).fill(1) }, true)
  assert.equal(fd13, "B00000401A" + "01".repeat(13) + "00".repeat(3) + "\r")
  assert.equal(m.encodeSlcanFrame({ canId: 0x401, data: new Uint8Array(20) }, true).slice(0, 10), "B00000401B")
})

test("CAN: сборка пакета из потока slcan в любом месте разреза", () => {
  for (const fd of [false, true]) {
    const packet = bytes(REF.multiRecords)
    const other = bytes(REF.records)
    const stream = new TextEncoder().encode(m.encodeCanPacket(packet, fd, SENDER) + m.encodeCanPacket(other, fd, { priority: 0, srcBusID: 0x1234, counter: 1 }))
    for (let cut = 0; cut <= stream.length; cut += 7) {
      const parser = m.createCanParser()
      const messages = [...parser.push(stream.subarray(0, cut), 0), ...parser.push(stream.subarray(cut), 1)]
      assert.equal(messages.length, 2, `fd=${fd} разрез ${cut}`)
      assert.deepEqual([...messages[0].data], [...packet])
      assert.deepEqual([...messages[1].data], [...other])
      assert.deepEqual(
        messages.map((message) => [message.priority, message.srcBusID, message.counter]),
        [
          [2, 0xabcd, 5],
          [0, 0x1234, 1],
        ],
      )
    }
  }
})

test("CAN: чередование пакетов, пропуск кадра, стандартный ID и remote, таймаут сессии", () => {
  const a = m.canFragments(bytes(REF.multiRecords), false, SENDER)
  const b = m.canFragments(bytes(REF.records), false, { priority: 1, srcBusID: 0xabcd, counter: 6 })
  const interleaved = [a[0], b[0], ...a.slice(1), ...b.slice(1)].map((frame) => m.encodeSlcanFrame(frame, false)).join("")
  const parser = m.createCanParser()
  const messages = parser.push(new TextEncoder().encode(interleaved + "t5232010203\r" + "R155E6C050\r"), 0)
  assert.deepEqual(
    messages.map((message) => message.counter),
    [5, 6],
  ) /* стандартный ID и remote-кадр пакетом не считаются */
  /* пропуск кадра в середине - пакет не выдаётся (кадр подтвердил другой узел, а этот приёмник не принял) */
  const gap = [a[0], a[1], ...a.slice(3)].map((frame) => m.encodeSlcanFrame(frame, false)).join("")
  assert.deepEqual(m.createCanParser().push(new TextEncoder().encode(gap), 0), [])
  /* кадр 0 начинает пакет заново: повтор пакета после обрыва собирается */
  const retry = [a[0], a[1], ...a].map((frame) => m.encodeSlcanFrame(frame, false)).join("")
  assert.equal(m.createCanParser().push(new TextEncoder().encode(retry), 0).length, 1)
  /* длинный пакет - номер кадра переходит через 127 и сборка продолжается */
  const longRecords = m.encodeRecords([{ trgBusID: 1, har: 2, payload: m.encodePacketBytesPayload(new Uint8Array(1100)) }])
  const longFrames = m.canFragments(longRecords, false, SENDER)
  assert.ok(longFrames.length > 128)
  const longMessages = m.createCanParser().push(new TextEncoder().encode(longFrames.map((frame) => m.encodeSlcanFrame(frame, false)).join("")), 0)
  assert.deepEqual([...longMessages[0].data], [...longRecords])
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
  /* Медленный, но непрерывный поток: таймаут считается от последнего кадра */
  const slow = m.createCanParser({ sessionTimeoutMs: 2000 })
  const received = a.flatMap((frame, index) => slow.push(new TextEncoder().encode(m.encodeSlcanFrame(frame, false)), index * 500))
  assert.equal(received.length, 1)
  assert.deepEqual([...received[0].data], [...bytes(REF.multiRecords)])
  assert.equal(received[0].timestamp, 0)
  /* Поток без CR не копится: после мусора кадры разбираются */
  const noise = m.createCanParser()
  assert.deepEqual(noise.push(new TextEncoder().encode("x".repeat(20000)), 0), [])
  assert.equal(noise.push(new TextEncoder().encode("\r" + m.encodeCanPacket(bytes(REF.records), false, { priority: 2, srcBusID: 0x33 })), 1)[0].srcBusID, 0x33)
})

test("RS485: рамки из сырого потока, мусор, пауза", () => {
  const one = bytes(REF.one)
  const multi = bytes(REF.multi)
  const stream = new Uint8Array([0x41, 0x42, ...one, ...multi])
  for (let cut = 0; cut <= stream.length; cut++) {
    const parser = m.createFrameStreamParser()
    const frames = [...parser.push(stream.subarray(0, cut), 0), ...parser.push(stream.subarray(cut), 10)]
    assert.deepEqual(
      frames.map((frame) => [hex(frame.bytes), frame.frame.srcBusID]),
      [
        [REF.one, 1],
        [REF.multi, 0xabcd],
      ],
      `разрез ${cut}`,
    )
  }
  /* Шум, похожий на начало рамки, и рамка с неверной CRC перед настоящей: ни лишних рамок, ни проглоченной настоящей */
  const badCrc = one.slice()
  badCrc[badCrc.length - 1] ^= 1
  for (const noise of [[0x83], [0x83, 0x19], [0x83, 0x19, 0, 0, 0x9f], [0x9f, 0x83, 1, 2, 3, 0xff], [...badCrc]]) {
    const frames = m.createFrameStreamParser().push(Uint8Array.from([...noise, ...one]), 0)
    assert.deepEqual(
      frames.map((frame) => [hex(frame.bytes), frame.frame.records.length]),
      [[REF.one, 1]],
      `шум ${hex(Uint8Array.from(noise))}`,
    )
  }
  /* Рамка без записей - мусор для потока */
  assert.deepEqual(m.createFrameStreamParser().push(Uint8Array.from([...m.encodeFrame(1, []), ...one]), 0).length, 1)
  const parser = m.createFrameStreamParser({ gapMs: 100 })
  assert.equal(parser.push(multi.subarray(0, 10), 0).length, 0)
  assert.deepEqual(
    parser.push(one, 500).map((frame) => hex(frame.bytes)),
    [REF.one],
  )
})

test("важность пакета на CAN: из словаря команд, самая важная из записей", () => {
  const har = (header, argument) => m.encodeHar(header, argument)
  assert.equal(m.DEFAULT_DICTIONARY.priority(m.DEFAULT_ARGUMENT_CODES.MotionVelocity), 0)
  assert.equal(m.DEFAULT_DICTIONARY.priority(m.DEFAULT_ARGUMENT_CODES.OrientationData), 1)
  assert.equal(m.DEFAULT_DICTIONARY.priority(m.DEFAULT_ARGUMENT_CODES.ModuleConfig), m.PRIORITY_DEFAULT)
  assert.equal(m.DEFAULT_DICTIONARY.priority(m.DEFAULT_ARGUMENT_CODES.FirmwareUpgradeChunk), 3)
  assert.equal(m.packetPriority([har("SET", "MotionVelocity"), har("GET", "ModuleConfig")]), 0)
  assert.equal(m.packetPriority([har("OK!", "DebugLog")]), 3)
  assert.equal(m.packetPriority([]), m.PRIORITY_DEFAULT)
  assert.equal(m.createDictionary({ MyCmd: 300 }, { 300: 1 }).priority(300), 1)
})

test("словарь, поле Value xPOE-Debug, команды slcan-адаптера", () => {
  /* DEFAULT_ARGUMENT_CODES - ровно мастер-словарь команд dictionaries/poe_cmd.yaml (сгенерирован npm run Generate, файл поставляется в пакете) */
  const commandsYaml = readFileSync(new URL("../dist/dictionaries/poe_cmd.yaml", import.meta.url), "utf8")
  assert.deepEqual(
    m.DEFAULT_ARGUMENT_CODES,
    Object.fromEntries(
      [...commandsYaml.matchAll(/^- \[\s*([^,\]]+?)\s*,\s*[^,\]]+?\s*,\s*(\d+)\s*(?:,\s*\d+\s*)?\]/gm)].map(([, name, code]) => [name, Number(code)]),
    ),
  )
  assert.equal(
    Object.keys(m.DEFAULT_ARGUMENT_CODES).length,
    Number(readFileSync(new URL("../dist/dictionaries/poe_cmd.yaml", import.meta.url), "utf8").match(/^- \[/gm).length),
  )
  assert.equal(m.DEFAULT_ARGUMENT_CODES.DebugLog, 11)
  assert.equal(m.DEFAULT_ARGUMENT_CODES.DebugPlot, 12)
  assert.equal(m.DEFAULT_ARGUMENT_CODES.SystemDataStream, 15)
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
  /* Число из цифр - число, а не HEX: «12» - CBOR 12 (0x0C), «1234» - 0x19 0x04 0xD2 */
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
  assert.equal(m.encodeHar("GET", "ModuleConfig"), 0x0049)
  assert.equal(m.encodeHar("GET", 36), m.makeHar(0, 36, true))
  assert.equal(m.encodeHar("OK!", "ModuleConfig", false), 0x8048)
  assert.deepEqual(m.decodeHar(0x0049), { header: "GET", argument: "ModuleConfig", code: 36, reply: true })
  assert.throws(() => m.encodeHar("GET", "NoSuchArg"), /NoSuchArg/)
  assert.throws(() => m.encodeHar("PUT", "ModuleConfig"))
  assert.throws(() => m.encodeHar("GET", 8192), RangeError)
  /* Запрос туда: GET и SET по умолчанию с флагом ответа, имя и код дают одно и то же */
  const VAL = { DevSN: "HUB", ModSN: "MOD", Payload: {} }
  assert.deepEqual(m.encodeWsEnvelope("GET", "ModuleConfig", VAL), { HAR: 0x0049, VAL })
  assert.deepEqual(m.encodeWsEnvelope("GET", 36, VAL), m.encodeWsEnvelope("GET", "ModuleConfig", VAL))
  assert.equal(m.encodeWsEnvelope("SET", "ModuleConfig", VAL).HAR & 1, 1)
  /* Ответ обратно: OK! и ER! по умолчанию без флага, флаг можно задать явно */
  const answer = m.encodeWsEnvelope("OK!", "ModuleConfig", { DevSN: "HUB", ModSN: "MOD", Message: "", Payload: { A: 1 } })
  assert.equal(answer.HAR, 0x8048)
  assert.equal(m.encodeWsEnvelope("GET", "ModuleConfig", VAL, false).HAR, 0x0048)
  /* Разбор: части HAR словами, VAL как есть; через CBOR туда и обратно */
  assert.deepEqual(m.decodeWsEnvelope(m.cborToValue(m.valueToCbor(answer))), {
    header: "OK!",
    argument: "ModuleConfig",
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
    ChatSystemMessage: 7002,
    ChatEditMessage: 7003,
    ChatDeleteMessage: 7004,
    ChatLastRead: 7005,
    ChatJoin: 7006,
    ChatUserConnected: 7007,
    ChatUnread: 7008,
    ChatPins: 7009,
    ChatEditGroup: 7010,
    ChatRemoveUser: 7011,
    DeviceMessages: 7100,
    DeviceConnection: 7101,
    DeviceLeaveGroup: 7102,
    DeviceLeaveGroups: 7103,
    DeviceResetToken: 7104,
  }
  for (const [name, code] of Object.entries(cloud)) assert.equal(m.DEFAULT_ARGUMENT_CODES[name], code, name)
  for (const [name, code] of Object.entries(m.DEFAULT_ARGUMENT_CODES)) assert.ok(name in cloud ? code >= 7000 && code <= 7999 : code < 4096, name)
  /* Команды устройств, которыми пользуется и облако, - со своими кодами */
  assert.deepEqual(
    ["CloudJoinDevice", "CloudJoinUser", "CloudLeaveUser", "SystemFileSystem", "SystemDataUpdate", "SystemDataStream"].map(
      (name) => m.DEFAULT_ARGUMENT_CODES[name],
    ),
    [23, 24, 25, 4, 7, 15],
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

test("Simple Serial: строки по CR/LF, кириллица через границу куска, хвост после паузы, пустые строки пропускаются", async () => {
  const lines = []
  const parser = m.createSimpleSerialParser((got) => lines.push(...got), 20)
  const text = new TextEncoder().encode("Привет\r\n\nok\r\n>")
  parser.push(text.subarray(0, 3))
  parser.push(text.subarray(3))
  assert.deepEqual(lines, ["Привет", "ok"])
  await new Promise((resolve) => setTimeout(resolve, 40))
  assert.deepEqual(lines, ["Привет", "ok", ">"])
  parser.push(new TextEncoder().encode("x"))
  parser.reset()
  await new Promise((resolve) => setTimeout(resolve, 40))
  assert.deepEqual(lines, ["Привет", "ok", ">"])
})

test("Simple Serial: управляющие символы кодом, кириллица и спецсимволы HTML текстом", () => {
  assert.equal(m.simpleSerialHtml("a\tб<"), 'a<span class="text-(--red-text)">[0x09]</span>б&lt;')
  assert.equal(m.simpleSerialHtml("\x7f"), '<span class="text-(--red-text)">[0x7F]</span>')
})

test("Набор команд: адреса и флаг ответа по умолчанию, не набор - null", () => {
  const set = m.normalizeSavedCommands({
    SimpleSerial: [{ name: "s", data: "AT", endPackage: "\r\n" }],
    "xPOE-Debug": [{ name: "x", header: "GET", argument: "ModuleConfig", value: "{}" }],
    POECanable: [{ name: "c", header: "0", argument: "6", data: "", TrgBusID: "1234", Reply: false }],
  })
  assert.equal(set["xPOE-Debug"][0].TrgBusID, "FFFF")
  assert.equal(set["xPOE-Debug"][0].SrcBusID, "0000")
  assert.equal(set["xPOE-Debug"][0].Reply, true)
  assert.equal(set.POECanable[0].TrgBusID, "1234")
  assert.equal(set.POECanable[0].Reply, false)
  assert.equal(set.SimpleSerial[0].TrgBusID, undefined)
  assert.equal(m.normalizeSavedCommands({ SimpleSerial: [] }), null)
  assert.equal(m.normalizeSavedCommands({ SimpleSerial: [{ data: "AT" }], "xPOE-Debug": [], POECanable: [] }), null)
  assert.equal(m.normalizeSavedCommands(null), null)
})
