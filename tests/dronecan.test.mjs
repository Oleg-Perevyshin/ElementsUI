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
    hardware_version: { major: 1, minor: 0, unique_id: Array.from({ length: 16 }, (_, i) => i), certificate_of_authenticity: [] },
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
