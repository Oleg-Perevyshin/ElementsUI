/* tests/busBridge.test.mjs - мост шины в режиме discover: модули по ответам GET ModuleInfo, адрес команд - BusID модуля */
import { test } from "node:test"
import assert from "node:assert/strict"
import { createBusBridge } from "../dist/busBridge.js"

const fakeChannel = () => {
  const handlers = new Set()
  const sent = []
  return {
    sent,
    channel: {
      send: (trgId, har, payload) => sent.push({ trgId, har, payload }),
      listen: (handler) => (handlers.add(handler), () => handlers.delete(handler)),
    },
    receive: (packet) => handlers.forEach((h) => h({ trgId: 0, code: 69, header: "OK!", ...packet })),
  }
}

test("Шина: модули по ModuleInfo, по адресу, повтор не зовёт onModules, команды по BusID", () => {
  const { channel, sent, receive } = fakeChannel()
  const calls = []
  const bridge = createBusBridge(channel, { values: new Map(), discover: true, onModules: (list) => calls.push(list.map((m) => m.ModSN)) })
  const info = (sn, VerFW = 1) => ({
    srcId: parseInt(sn.split(":")[1], 16),
    argument: "ModuleInfo",
    payload: { ModSN: sn, ModName: sn.slice(0, 12), VerFW, ModBindKey: "MOT.Roll" },
  })
  receive(info("00.00.491-03_A:F63F"))
  receive(info("00.00.491-10_B:1234"))
  receive(info("00.00.491-03_A:F63F"))
  assert.deepEqual(calls, [["00.00.491-03_A:F63F"], ["00.00.491-10_B:1234", "00.00.491-03_A:F63F"]])
  assert.equal(bridge.self(), "")
  const motor = bridge.modules().find((m) => m.BusID === 0xf63f)
  assert.equal(motor.ModBindKey, "MOT.Roll")
  assert.equal(motor.self, false)
  /* Новая версия - список обновляется */
  receive(info("00.00.491-03_A:F63F", 2))
  assert.equal(bridge.modules().find((m) => m.BusID === 0xf63f).VerFW, 2)
  /* Команда модулю - на его BusID, "" - всем */
  bridge.link("00.00.491-10_B:1234").send(0x1234, null)
  bridge.link("").send(0x1234, null)
  assert.deepEqual(
    sent.map((s) => s.trgId),
    [0x1234, 0xffff],
  )
  /* CFG.ModList в режиме шины не меняет список */
  receive({
    srcId: 0x1234,
    argument: "ModuleConfig",
    payload: { "CFG.ModList": [{ ModSN: "00.00.491-10_B:1234", ModName: "x", VerFW: 1 }, { ModSN: "Z:0001" }] },
  })
  assert.equal(bridge.modules().length, 2)
  bridge.dispose()
})
