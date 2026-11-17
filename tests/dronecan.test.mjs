/* tests/dronecan.test.mjs - DroneCAN (poe-svelte-ui-lib/dronecan): сигнатуры типов против официальных значений libcanard, упаковка полей, TAO, передачи по кадрам; запуск `npm run Test` */
import { test } from "node:test"
import assert from "node:assert/strict"
import * as m from "../dist/protocols/dronecan/index.js"
import { createSlcanReader, encodeSlcanExtFrame } from "../dist/protocols/index.js"

const hex = (bytes) => Buffer.from(bytes).toString("hex")
const sig = (name) => m.droneCanType(name)?.signature

test("сигнатуры типов (CRC-64-WE по нормализованному DSDL): как в libcanard и ArduPilot", () => {
  assert.equal(sig("uavcan.protocol.NodeStatus"), 0x0f0868d0c1a7c6f1n)
  assert.equal(sig("uavcan.protocol.GetNodeInfo"), 0xee468a8121c46a9en)
  assert.equal(sig("uavcan.protocol.param.GetSet"), 0xa7b622f939d1a4d5n)
  assert.equal(sig("uavcan.protocol.param.ExecuteOpcode"), 0x3b131ac5eb69d2cdn)
  assert.equal(sig("uavcan.protocol.RestartNode"), 0x569e05394a3017f0n)
  assert.equal(sig("uavcan.protocol.dynamic_node_id.Allocation"), 0x0b2a812620a11d40n)
  assert.equal(sig("uavcan.equipment.esc.RawCommand"), 0x217f5c87d7ec951dn)
  assert.equal(sig("uavcan.equipment.gnss.Fix2"), 0xca41e7000f37435fn)
  assert.equal(sig("uavcan.equipment.power.BatteryInfo"), 0x249c26548a711966n)
  assert.equal(m.droneCanMessage(341)?.name, "uavcan.protocol.NodeStatus")
  assert.equal(m.droneCanService(11)?.name, "uavcan.protocol.param.GetSet")
})

test("NodeStatus: uint32 младшим вперёд, затем 2+3+3 бита от старшего, uint16", () => {
  const s = m.droneCanStruct(m.droneCanType("uavcan.protocol.NodeStatus"))
  const value = { uptime_sec: 0x01020304, health: 2, mode: 1, sub_mode: 0, vendor_specific_status_code: 0x1234 }
  const bytes = m.encodeDroneCan(s, value)
  assert.equal(hex(bytes), "0403020188" + "3412")
  assert.deepEqual(m.decodeDroneCan(s, bytes), value)
})

test("float16 и числа не по границе байта", () => {
  assert.equal(m.floatToFloat16(1), 0x3c00)
  assert.equal(m.floatToFloat16(-2), 0xc000)
  assert.equal(m.floatToFloat16(65504), 0x7bff)
  assert.equal(m.floatToFloat16(1e6), 0x7c00)
  assert.equal(m.float16ToFloat(0x3c00), 1)
  assert.equal(m.float16ToFloat(0xc000), -2)
  const buf = new Uint8Array(4)
  m.encodeScalar(buf, 3, 12, -5n)
  assert.equal(m.decodeScalar(buf, 3, 12, true), -5n)
  m.encodeScalar(buf, 17, 7, 100n)
  assert.equal(m.decodeScalar(buf, 17, 7, false), 100n)
  assert.equal(m.decodeScalar(buf, 3, 12, true), -5n)
})

test("param.GetSet: union с тегом и хвостовой массив без длины (TAO)", () => {
  const def = m.droneCanType("uavcan.protocol.param.GetSet")
  const req = m.droneCanStruct(def, "req")
  const bytes = m.encodeDroneCan(req, { index: 0, value: { empty: {} }, name: "FOO" })
  assert.equal(hex(bytes), "0000464f4f")
  assert.deepEqual(m.decodeDroneCan(req, bytes), { index: 0, value: { empty: {} }, name: "FOO" })
  /* Union не задан - первый вариант (empty): запрос параметра по номеру одним полем index */
  assert.equal(hex(m.encodeDroneCan(req, { index: 2 })), "0200")
  assert.throws(() => m.encodeDroneCan(req, { value: { wrong: 1 } }), /union/)
  const withInt = m.encodeDroneCan(req, { index: 3, value: { integer_value: -1 }, name: "X" })
  assert.deepEqual(m.decodeDroneCan(req, withInt), { index: 3, value: { integer_value: -1 }, name: "X" })
  const res = m.droneCanStruct(def, "res")
  const answer = { value: { real_value: 1.5 }, default_value: { real_value: 2 }, max_value: { empty: {} }, min_value: { empty: {} }, name: "GAIN" }
  assert.deepEqual(m.decodeDroneCan(res, m.encodeDroneCan(res, answer)), answer)
})

test("многокадровая передача: CRC с сигнатурой, toggle, сборка", () => {
  const value = {
    status: { uptime_sec: 77, health: 0, mode: 0, sub_mode: 0, vendor_specific_status_code: 0 },
    software_version: { major: 4, minor: 5, optional_field_flags: 0, vcs_commit: 0, image_crc: 0 },
    hardware_version: { major: 1, minor: 0, unique_id: Array.from({ length: 16 }, (_, i) => i), certificate_of_authenticity: "" },
    name: "org.ardupilot.test",
  }
  const out = m.encodeDroneCanTransfer({
    typeName: "uavcan.protocol.GetNodeInfo",
    type: "res",
    value,
    source: 10,
    destination: 127,
    priority: 30,
    transferId: 5,
  })
  assert.ok(out.frames.length > 1)
  assert.equal(out.frames[0].at(-1), 0x80 | 5)
  assert.equal(out.frames[1].at(-1), 0x20 | 5)
  assert.equal(out.frames.at(-1).at(-1) & 0x40, 0x40)
  const id = m.parseDroneCanId(out.canId)
  assert.deepEqual(id, { priority: 30, type: "res", dataTypeId: 1, source: 10, destination: 127 })
  const rx = m.createDroneCanTransferReceiver()
  let got
  for (const frame of out.frames) got = rx.push(out.canId, frame, 1000) ?? got
  assert.ok(got?.crcOk)
  const decoded = m.decodeDroneCanTransfer(got)
  assert.equal(decoded.typeName, "uavcan.protocol.GetNodeInfo")
  assert.deepEqual(decoded.value, value)
  const broken = out.frames.map((f) => f.slice())
  broken[1][0] ^= 0xff
  let bad
  for (const frame of broken) bad = rx.push(out.canId, frame, 2000) ?? bad
  assert.equal(bad?.crcOk, false)
})

test("реальная передача батареи ArduPilot: BatteryInfo, пустое имя модели - пустая строка", () => {
  const bytes = Uint8Array.from(
    "A95C4252004DD263845F84630000011FFF8001000000 00"
      .replace(/\s/g, "")
      .match(/../g)
      .map((h) => parseInt(h, 16)),
  )
  const value = m.decodeDroneCan(m.droneCanStruct(m.droneCanType("uavcan.equipment.power.BatteryInfo")), bytes)
  assert.equal(value.voltage, 50.0625)
  assert.equal(value.current, 20)
  assert.equal(value.battery_id, 1)
  assert.equal(value.model_name, "")
})

test("одиночный кадр: ID сообщения, хвостовой байт", () => {
  const out = m.encodeDroneCanTransfer({
    typeName: "uavcan.protocol.NodeStatus",
    type: "msg",
    value: { uptime_sec: 1, health: 0, mode: 0, sub_mode: 0, vendor_specific_status_code: 0 },
    source: 127,
    transferId: 33,
  })
  assert.equal(out.canId, (16 << 24) | (341 << 8) | 127)
  assert.equal(out.frames.length, 1)
  assert.equal(hex(out.frames[0]), "0100000000000000".slice(0, 14) + "c1")
})

test("slcan: расширенный кадр туда и обратно", () => {
  const text = encodeSlcanExtFrame(0x1015557f, Uint8Array.from([1, 2, 3, 0xc0]))
  assert.equal(text, "T1015557F401020 3C0\r".replace(" ", ""))
  const reader = createSlcanReader()
  const [frame] = reader.push(new TextEncoder().encode(`\r${text}`), 5)
  assert.equal(frame.canId, 0x1015557f)
  assert.equal(frame.ext, true)
  assert.equal(hex(frame.data), "010203c0")
})

/* Имитация устройства узла 100: NodeStatus, ответы на GetNodeInfo, param.GetSet (2 параметра), ExecuteOpcode; RestartNode - без ответа */
/* Уникальный ID тестового узла 100 в ответе GetNodeInfo */
const DEVICE_UID = Array.from({ length: 16 }, (_, i) => 0xa0 + i)

const makeBus = () => {
  const params = [
    { name: "battery.id", value: { integer_value: 1 } },
    { name: "GPS_RATE", value: { real_value: 5 } },
  ]
  const devRx = m.createDroneCanTransferReceiver()
  const meRx = m.createDroneCanTransferReceiver()
  const sent = []
  let me
  const deliver = (out) => {
    let t
    for (const f of out.frames) t = meRx.push(out.canId, f) ?? t
    me.handle(t)
  }
  const device = (canId, frames) => {
    let t
    for (const f of frames) t = devRx.push(canId, f) ?? t
    sent.push(m.decodeDroneCanTransfer(t))
    if (!t || t.type !== "req" || t.destination !== 100) return
    const d = m.decodeDroneCanTransfer(t)
    let value
    if (d.typeName === "uavcan.protocol.GetNodeInfo")
      value = { status: {}, software_version: { major: 4, minor: 1 }, hardware_version: { unique_id: DEVICE_UID }, name: "com.cubepilot.here3" }
    if (d.typeName === "uavcan.protocol.param.GetSet") {
      const p = d.value.name ? params.find((x) => x.name === d.value.name) : params[d.value.index]
      if (p && d.value.name && !("empty" in d.value.value)) p.value = d.value.value
      const empty = { empty: {} }
      value = p
        ? { value: p.value, default_value: p.value, max_value: empty, min_value: empty, name: p.name }
        : { value: empty, default_value: empty, max_value: empty, min_value: empty, name: "" }
    }
    if (d.typeName === "uavcan.protocol.param.ExecuteOpcode") value = { argument: 0, ok: 1 }
    if (!value) return
    const out = m.encodeDroneCanTransfer({ typeName: d.typeName, type: "res", value, source: 100, destination: t.source, transferId: t.transferId })
    setTimeout(() => deliver(out), 2)
  }
  return {
    sent,
    deliver,
    create: (options = {}) => (me = m.createDroneCanNode({ nodeId: 127, write: async (id, frames) => device(id, frames), ...options })),
  }
}

test("узел: опрос нового узла, параметры, запись, сохранение, тайм-аут", async () => {
  const bus = makeBus()
  let nodes = []
  const me = bus.create({ onNodes: (list) => (nodes = list), requestTimeoutMs: 100 })
  try {
    bus.deliver(m.encodeDroneCanTransfer({ typeName: "uavcan.protocol.NodeStatus", type: "msg", value: { uptime_sec: 50 }, source: 100, transferId: 0 }))
    await new Promise((r) => setTimeout(r, 50))
    assert.equal(nodes[0]?.id, 100)
    assert.equal(nodes[0]?.info?.name, "com.cubepilot.here3")
    assert.deepEqual(
      me.messages(100).map((x) => x.typeName),
      ["uavcan.protocol.NodeStatus"],
    )
    const list = await me.listParams(100)
    assert.deepEqual(
      list.map((p) => [p.name, p.kind, p.value]),
      [
        ["battery.id", "integer", 1],
        ["GPS_RATE", "real", 5],
      ],
    )
    assert.equal((await me.setParam(100, "GPS_RATE", "real", 10)).value, 10)
    assert.equal(await me.executeOpcode(100, m.DRONECAN_OPCODE_SAVE), true)
    await assert.rejects(
      me.request("uavcan.protocol.RestartNode", 100, { magic_number: m.DRONECAN_RESTART_MAGIC }, { timeoutMs: 30, retries: 1 }),
      /не ответил/,
    )
  } finally {
    me.dispose()
  }
})

test("сервер DNA: номер по уникальному ID из трёх частей, тот же номер при повторе", async () => {
  const bus = makeBus()
  const assigned = []
  const me = bus.create({ onAllocate: (id) => assigned.push(id) })
  const uid = Array.from({ length: 16 }, (_, i) => i + 1)
  const anon = (value) => {
    const payload = m.encodeDroneCan(m.droneCanStruct(m.droneCanType("uavcan.protocol.dynamic_node_id.Allocation")), value)
    const canId = m.makeDroneCanId({ priority: 30, type: "msg", dataTypeId: 1, source: 0, destination: 0 })
    me.handle({ ...m.parseDroneCanId(canId), transferId: 0, payload, timestamp: 0, crcOk: true, frames: 1 })
  }
  try {
    for (let round = 0; round < 2; round++) {
      anon({ node_id: 0, first_part_of_unique_id: 1, unique_id: uid.slice(0, 6) })
      anon({ node_id: 0, first_part_of_unique_id: 0, unique_id: uid.slice(6, 12) })
      anon({ node_id: 0, first_part_of_unique_id: 0, unique_id: uid.slice(12) })
    }
    await new Promise((r) => setTimeout(r, 10))
    assert.deepEqual(assigned, [125, 125])
    const last = bus.sent.filter((d) => d.typeName === "uavcan.protocol.dynamic_node_id.Allocation").at(-1)
    assert.equal(last.value.node_id, 125)
    assert.deepEqual(last.value.unique_id, uid)
  } finally {
    me.dispose()
  }
})

test("сервер DNA: узел после перезагрузки получает прежний номер по уникальному ID из GetNodeInfo", async () => {
  const bus = makeBus()
  const assigned = []
  const me = bus.create({ onAllocate: (id) => assigned.push(id) })
  const anon = (value) => {
    const payload = m.encodeDroneCan(m.droneCanStruct(m.droneCanType("uavcan.protocol.dynamic_node_id.Allocation")), value)
    const canId = m.makeDroneCanId({ priority: 30, type: "msg", dataTypeId: 1, source: 0, destination: 0 })
    me.handle({ ...m.parseDroneCanId(canId), transferId: 0, payload, timestamp: 0, crcOk: true, frames: 1 })
  }
  try {
    bus.deliver(m.encodeDroneCanTransfer({ typeName: "uavcan.protocol.NodeStatus", type: "msg", value: { uptime_sec: 50 }, source: 100, transferId: 0 }))
    await new Promise((r) => setTimeout(r, 50))
    anon({ node_id: 0, first_part_of_unique_id: 1, unique_id: DEVICE_UID.slice(0, 6) })
    anon({ node_id: 0, first_part_of_unique_id: 0, unique_id: DEVICE_UID.slice(6, 12) })
    anon({ node_id: 0, first_part_of_unique_id: 0, unique_id: DEVICE_UID.slice(12) })
    await new Promise((r) => setTimeout(r, 10))
    assert.deepEqual(assigned, [100])
  } finally {
    me.dispose()
  }
})

test("автографики: числа и векторы, без состояний, меток времени и счётчиков", () => {
  assert.deepEqual(m.droneCanPlotFields("uavcan.equipment.ahrs.MagneticFieldStrength", { magnetic_field_ga: [0.1, 0.2, 0.3], magnetic_field_covariance: [] }), [
    ["magnetic_field_ga[0]", 0.1],
    ["magnetic_field_ga[1]", 0.2],
    ["magnetic_field_ga[2]", 0.3],
  ])
  assert.deepEqual(m.droneCanPlotFields("uavcan.protocol.NodeStatus", { uptime_sec: 5, health: 0, mode: 0, sub_mode: 0, vendor_specific_status_code: 1 }), [])
  assert.deepEqual(m.droneCanNumericFields({ a: 1, b: [2, { c: 3 }] }), [
    ["a", 1],
    ["b[0]", 2],
    ["b[1].c", 3],
  ])
})

test("обновление прошивки: узел читает файл с нашего узла по 256 байт и возвращается в работу", async () => {
  const image = Uint8Array.from({ length: 1000 }, (_, i) => (i * 7) & 0xff)
  const meRx = m.createDroneCanTransferReceiver()
  const devRx = m.createDroneCanTransferReceiver()
  const got = []
  let me
  let tid = 0
  const toMe = (out) => {
    let t
    for (const f of out.frames) t = meRx.push(out.canId, f) ?? t
    me.handle(t)
  }
  /* Загрузчик узла 100: после BeginFirmwareUpdate читает файл, в конце - NodeStatus в рабочем режиме */
  const readNext = (offset, source, path) =>
    toMe(
      m.encodeDroneCanTransfer({
        typeName: "uavcan.protocol.file.Read",
        type: "req",
        value: { offset, path: { path } },
        source: 100,
        destination: source,
        transferId: tid++ & 31,
      }),
    )
  const device = (canId, frames) => {
    let t
    for (const f of frames) t = devRx.push(canId, f) ?? t
    if (!t || t.destination !== 100) return
    const d = m.decodeDroneCanTransfer(t)
    if (d.typeName === "uavcan.protocol.file.BeginFirmwareUpdate" && t.type === "req") {
      const path = d.value.image_file_remote_path.path
      const ok = m.encodeDroneCanTransfer({
        typeName: d.typeName,
        type: "res",
        value: { error: 0 },
        source: 100,
        destination: t.source,
        transferId: t.transferId,
      })
      setTimeout(() => {
        toMe(ok)
        readNext(0, d.value.source_node_id, path)
      }, 2)
    }
    if (d.typeName === "uavcan.protocol.file.Read" && t.type === "res") {
      const chunk = typeof d.value.data === "string" ? Array.from(d.value.data, (c) => c.charCodeAt(0)) : d.value.data
      got.push(...chunk)
      if (chunk.length === 256) setTimeout(() => readNext(got.length, 127, "fw/100.bin"), 1)
      else
        setTimeout(
          () =>
            toMe(
              m.encodeDroneCanTransfer({ typeName: "uavcan.protocol.NodeStatus", type: "msg", value: { uptime_sec: 1, mode: 0 }, source: 100, transferId: 1 }),
            ),
          5,
        )
    }
  }
  me = m.createDroneCanNode({ nodeId: 127, write: async (id, frames) => device(id, frames) })
  const phases = []
  try {
    await me.updateFirmware(100, image, { onProgress: (p) => phases.push(p.phase) })
    assert.deepEqual(Uint8Array.from(got), image)
    assert.equal(phases[0], "start")
    assert.ok(phases.includes("read"))
    assert.equal(phases.at(-1), "done")
  } finally {
    me.dispose()
  }
})

test("обновление прошивки: отказ узла - ошибка с кодом и текстом", async () => {
  const rx = m.createDroneCanTransferReceiver()
  let me
  const device = (canId, frames) => {
    let t
    for (const f of frames) t = rx.push(canId, f) ?? t
    if (!t || t.type !== "req") return
    const out = m.encodeDroneCanTransfer({
      typeName: "uavcan.protocol.file.BeginFirmwareUpdate",
      type: "res",
      value: { error: 1, optional_error_message: "armed" },
      source: 100,
      destination: 127,
      transferId: t.transferId,
    })
    const meRx = m.createDroneCanTransferReceiver()
    setTimeout(() => {
      let r
      for (const f of out.frames) r = meRx.push(out.canId, f) ?? r
      me.handle(r)
    }, 2)
  }
  me = m.createDroneCanNode({ nodeId: 127, write: async (id, frames) => device(id, frames) })
  try {
    await assert.rejects(me.updateFirmware(100, new Uint8Array(10)), /отказал.*код 1, armed/)
  } finally {
    me.dispose()
  }
})

test("CAN FD: одиночный кадр с дополнением нулями, хвостовой массив с длиной", () => {
  /* GetSet запрос {index: 0, name: "GPS"} без TAO: 13 бит index, 3 бита тега, 7 бит длины имени, имя */
  const s = m.droneCanStruct(m.droneCanType("uavcan.protocol.param.GetSet"), "req")
  const body = m.encodeDroneCan(s, { index: 0, value: { empty: {} }, name: "GPS" }, false)
  const padded = new Uint8Array(12)
  padded.set(body)
  padded[11] = 0xc0
  const rx = m.createDroneCanTransferReceiver()
  const canId = m.makeDroneCanId({ priority: 24, type: "req", dataTypeId: 11, source: 125, destination: 127 })
  const t = rx.push(canId, padded, 0, true)
  assert.equal(t.fd, true)
  assert.deepEqual(m.decodeDroneCanTransfer(t).value, { index: 0, value: { empty: {} }, name: "GPS" })
})
