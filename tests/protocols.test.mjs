/* tests/protocols.test.mjs — ядро протоколов (poe-svelte-ui-lib/protocols) против эталонных байт прошивки: запуск `npm run TestProtocols` */
import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import * as m from "../dist/protocols/index.js"

/* Эталон — пакеты, собранные настоящим poe_cbor_pkt.c прошивки (ProdFactory-ESP, CBOR_PACK + CBOR_PktEncFinish), сырые поля — байтовой строкой:
   one   — 0x42 ← 0x01, HAR 0x1234, h'010203'
   multi — 0xFFFF ← 0xABCD, HAR 0xC123, float 1.5, -2.25 | 0x1234 ← 0x0017, HAR 0x4001, 300 байт (i & 0xFF) | 0x0005 ← 0x0006, HAR 0x0007, h'010203'
   empty — 0x0005 ← 0x0006, HAR 0x0007, CBOR_PACK без полей — h'' */
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

test("сборка пакета — байты как у прошивки", () => {
  assert.equal(hex(m.encodePacket([{ trgBusID: 0x42, srcBusID: 0x01, har: 0x1234, payload: m.encodePacketBytesPayload(Uint8Array.of(1, 2, 3)) }])), REF.one)
  assert.equal(hex(m.encodePacket(MULTI_OBJECTS)), REF.multi)
  assert.equal(hex(m.encodePacket([{ trgBusID: 5, srcBusID: 6, har: 7, payload: m.encodePacketBytesPayload(new Uint8Array()) }])), REF.empty)
  /* пустой Payload — null, как CBOR_PktEncAddRaw без данных; при разборе — снова пустой */
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
  assert.deepEqual([...parsed.objects[2].payload], [0x43, 1, 2, 3]) /* Payload — CBOR item, сырые поля байтовой строкой */
  /* Те же числа, что HAR/HAR_NR из api_har.h прошивки */
  assert.equal(m.makeHar(1, 36), 0x4049)
  assert.equal(m.makeHar(2, 37, false), 0x804a)
  assert.equal(m.makeHar(3, 8191), 0xffff)
  assert.deepEqual(m.splitHar(0x804a), { header: 2, argument: 37, reply: false })
})

test("поток: обрывок — incomplete, мусор — garbage, два пакета подряд", () => {
  const multi = bytes(REF.multi)
  for (let n = 0; n < multi.length; n++) assert.equal(m.decodePacket(multi.subarray(0, n)).status, "incomplete", `обрывок ${n} байт`)
  assert.equal(m.decodePacket(Uint8Array.of(0x41, 0x42)).status, "garbage")
  assert.equal(m.decodePacket(Uint8Array.of(0xbf, 0xff)).status, "garbage") /* прежний формат — Map */
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
  ) /* одному адресату — оба, по порядку */
})

test("CBOR: значение и JSON-текст", () => {
  const value = { Header: "GET", Argument: "ModInfo", Value: { a: 1, bin: Uint8Array.of(1, 2) } }
  assert.deepEqual(m.cborToValue(m.valueToCbor(value)), value)
  assert.deepEqual(m.cborToValue(m.jsonToCbor({ ...value, Value: { a: 1, bin: "AQI=" } })), value) /* строка base64 под ключом с "bin" — байты */
})

/* CRC-16/KERMIT побайтно — эталон из common.c прошивки (вырезан и собран на компьютере): эмодзи, кириллица, сырой CBOR, все байты */
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
      ? { type: item.type, header: item.header, argument: item.argument, reply: item.reply, value: item.value, crcOk: item.crcOk, freeHeap: item.freeHeap }
      : item
  for (let cut = 0; cut <= stream.length; cut++) {
    const parser = m.createXPoeDebugParser()
    const items = [...parser.push(stream.subarray(0, cut)), ...parser.push(stream.subarray(cut))]
    assert.deepEqual(items.map(pick), expected, `разрез на ${cut} байте`)
  }
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
  assert.equal(m.createXPoeDebugParser().push(empty)[0].value, "")
  const two = m.encodePacket([
    { trgBusID: 0, srcBusID: 1, har: m.xPoeDebugHar("OK!", "ModCfg", false), payload: value },
    { trgBusID: 0, srcBusID: 1, har: m.xPoeDebugHar("OK!", "DebugPlot", false), payload: m.valueToCbor({ A: 1 }) },
  ])
  assert.deepEqual(
    m
      .createXPoeDebugParser()
      .push(two)
      .map((item) => item.argument),
    ["ModCfg", "DebugPlot"],
  ) /* строка таблицы — общая для облака и терминала */
  assert.deepEqual(m.xPoeDebugRow(parsed), {
    trgId: "0x0000",
    srcId: "0x0000",
    har: parsed.har.toString(16).toUpperCase().padStart(4, "0"),
    header: "SET",
    argument: "ModCfg",
    value: toHex(value),
    crc: parsed.crc,
    freeHeap: "",
  })
  assert.equal(m.xPoeDebugRow(bad).header, "⚠️")
  assert.equal(m.xPoeDebugRow({ type: "raw", text: "boot" }).header, "RAW")
  assert.deepEqual([m.parseBusId("00FF"), m.parseBusId(""), m.parseBusId("XYZ", 7), m.parseBusId("10000", 7), m.formatBusId(0xab)], [255, 0, 7, 7, "0x00AB"])
  /* таблица: DebugLog — уровень · тег · текст, FHS в отдельной колонке */
  assert.equal(m.formatXPoeDebugValue(toHex(m.valueToCbor([2, "Net", "Нет связи", 1000]))), '<span class="font-semibold">🟡</span> · Net · Нет связи')
  /* модалка: развёрнутый вид — карта с отступами, float32 кратко, DebugLog по строкам, дамп по 16 байт */
  const float32Map = "A16154FA3DF5C28F" /* {"T": float32 0.12} */
  assert.equal(m.formatXPoeDebugValue(float32Map), "{&quot;T&quot;:0.12}")
  assert.equal(m.formatXPoeDebugPretty(toHex(m.valueToCbor({ Mode: 1, List: [1, 2] }))), '{\n  "Mode": 1,\n  "List": [\n    1,\n    2\n  ]\n}')
  assert.equal(m.formatXPoeDebugPretty(toHex(m.valueToCbor([3, "API", "Запуск", 2048]))), "🟢 API\nЗапуск\nFHS: 2048")
  assert.deepEqual(
    m
      .formatXPoeDebugPretty(toHex(m.valueToCbor([4, "RX", new Uint8Array(17).fill(0xab), 1])))
      .split("\n")
      .slice(1),
    ["bytes(17):", "AB AB AB AB AB AB AB AB AB AB AB AB AB AB AB AB", "AB", "FHS: 1"],
  )
  assert.equal(m.formatXPoeDebugPretty("XYZ"), null)
  const modal = m.formatXPoeDebugModal(`x\nHEX\n${float32Map}`)
  assert.ok(modal.includes("{\n  &quot;T&quot;: 0.12\n}") && modal.includes("A1 61 54 FA 3D F5 C2 8F"))
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

test("словарь, поле Value xPOE-Debug, команды slcan-адаптера", () => {
  /* DEFAULT_ARGUMENT_CODES — ровно мастер-словарь dictionary.yaml (сгенерирован npm run Dictionary, файл поставляется в пакете) */
  assert.deepEqual(m.DEFAULT_ARGUMENT_CODES, m.parseArgumentDictionary(readFileSync(new URL("../dist/protocols/dictionary.yaml", import.meta.url), "utf8")))
  assert.equal(
    Object.keys(m.DEFAULT_ARGUMENT_CODES).length,
    Number(readFileSync(new URL("../dist/protocols/dictionary.yaml", import.meta.url), "utf8").match(/^- \[/gm).length),
  )
  assert.equal(m.DEFAULT_ARGUMENT_CODES.DebugLog, 11)
  assert.equal(m.DEFAULT_ARGUMENT_CODES.DebugPlot, 12)
  assert.equal(m.DEFAULT_ARGUMENT_CODES.DataStream, 15)
  assert.equal(m.DEFAULT_ARGUMENT_CODES.FDwS, undefined)
  assert.deepEqual(m.parseArgumentDictionary("# комментарий\n- [ModCfg, A_MOD_CONFIG, 36]   # хвост\n- [OrData, A_OR_DATA, 211]\n"), {
    ModCfg: 36,
    OrData: 211,
  })
  assert.equal(m.nameByCode(m.HEADER_CODES, 2), "OK!")
  assert.equal(m.nameByCode(m.DEFAULT_ARGUMENT_CODES, 9999), "9999")
  assert.deepEqual([...m.xPoeDebugValueFromText("")], [])
  assert.deepEqual([...m.xPoeDebugValueFromText("A1 61 61 01")], [0xa1, 0x61, 0x61, 0x01])
  assert.deepEqual([...m.xPoeDebugValueFromText('{"a":1}')], [...m.valueToCbor({ a: 1 })])
  assert.throws(() => m.xPoeDebugValueFromText("не json"))
  assert.deepEqual(m.slcanOpenCommands("S6"), ["C\r", "S6\r", "M0\r", "A0\r", "O\r"])
  assert.deepEqual(m.slcanOpenCommands("S6", "Y2"), ["C\r", "S6\r", "Y2\r", "M0\r", "A0\r", "O\r"])
})

/* Пакет LOG_PLOT прошивки: OK! DebugPlot, Payload — CBOR-карта, собранная poe_cbor (CBOR_EncodeMapStart/String/Float) */
const DEBUG_PLOT_HEX =
  "AC694C494748542E434C52FA3E80000068535045432E393130FA3F00000068535045432E363830FA3FC0000068535045432E363330FA4000000068535045432E353930FA4020000068535045432E353535FA4040000068535045432E353135FA4060000068535045432E343830FA4080000068535045432E343435FA4090000068535045432E343135FA40A00000694C494748542E495252FA3E0000006A4C494748542E50504644FA3EC00000"

test("графики: пакет DebugPlot — значения и порядок серий из CBOR-карты устройства", () => {
  const parser = m.createXPoeDebugParser()
  const [frame] = parser.push(deviceFrame("OK!", m.DEBUG_PLOT_ARGUMENT, m.xPoeDebugValueFromText(DEBUG_PLOT_HEX)))
  assert.equal(frame.type, "frame")
  assert.ok(frame.crcOk)
  const values = m.debugPlotValues(frame.value)
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
  /* кадр только с частью серий группы — они впереди в порядке кадра, остальные сохраняются следом */
  plots.update([["SPEC.415", 9]])
  assert.deepEqual(
    plots
      .data("SPEC")
      .map((p) => p.name)
      .slice(0, 2),
    ["415", "910"],
  )
  assert.deepEqual(m.debugPlotValues("не cbor"), [])
  plots.clear()
  assert.deepEqual(plots.data("SPEC"), [])
})
