/* tests/gui.test.mjs - чистые правила GUIRenderer: поля смарт-виджетов, битовые поля, пакеты кнопки и таблицы, слияние ответа устройства */
import { test } from "node:test"
import assert from "node:assert/strict"
import * as gui from "../dist/gui.js"

const store = (entries) => {
  const map = new Map(Object.entries(entries))
  return { map, get: (key) => map.get(key) }
}

test("поля виджета: ключи с префиксом и переопределением, пустые пропускаются; пакет только сохраняемых полей", () => {
  const { get } = store({ "CFG.StaSSID": "home", "CFG.Mode": 3, "CFG.StaPSK": "" })
  const value = gui.readWidgetFields(get, "CFG", gui.WIDGET_FIELDS.WidgetWiFi, { WiFiMode: "Mode" })
  assert.deepEqual(value, { WiFiMode: 3, StaSSID: "home", StaPSK: "" })
  assert.equal(gui.widgetKey("", "StackInfo"), "StackInfo")
  const packet = gui.widgetPacket("CFG", gui.WIDGET_SAVE_FIELDS.WidgetDeviceInfo, { DevName: "Hub", DevSN: "X", HostName: "hub" }, { DevName: "Name" })
  assert.deepEqual(packet, { "CFG.Name": "Hub", "CFG.HostName": "hub", "CFG.WebUser": undefined, "CFG.WebPsw": undefined })
  assert.deepEqual(gui.widgetPrefixes("WidgetMap", {}), ["MAV"])
  assert.deepEqual(gui.widgetPrefixes("WidgetRGBStrip", { id: "" }), ["LST"])
  assert.deepEqual(gui.widgetPrefixes("WidgetStackInfo", { id: "CFG" }), [""])
})

test("битовые поля: Input bitMode и Select bitMode читают и пишут диапазон слова", () => {
  const input = { type: "Input", properties: { type: "bitMode", range: { start: 6, end: 7 } } }
  const select = { type: "Select", properties: { bitMode: true, range: { start: 31, end: 31 } } }
  assert.equal(gui.readBits(input, 4188261681), 0)
  assert.equal(gui.writeBits(input, 4188261681, 1), 4188261745)
  assert.equal(gui.readBits(select, 4188261681), 1)
  assert.equal(gui.writeBits(select, undefined, 1), 2 ** 31)
  /* Без range и обычный компонент - значение как есть */
  assert.equal(gui.readBits({ type: "Input", properties: { type: "bitMode" } }, 7), 7)
  assert.equal(gui.writeBits({ type: "Select", properties: {} }, 5, "x"), "x")
})

test("пакет кнопки: Value - готовый Payload; Variables - значения, группа-поле вложенно, изменённая переменная - новое значение", () => {
  const { get } = store({ "CFG.A": 1, "LST-Speed": 4, "LST-Count": 10 })
  assert.deepEqual(gui.commandPacket({ Header: "SET", Argument: "Restart", Value: '{"Now":true}' }, get), {
    header: "SET",
    argument: "Restart",
    payload: { Now: true },
    writes: [],
    send: true,
  })
  assert.equal(gui.commandPacket({ Header: "SET", Argument: "X", Value: "[1]" }, get), null)
  assert.equal(gui.commandPacket({ Header: "SET", Argument: "X", Value: "{" }, get), null)
  assert.equal(gui.commandPacket({ Argument: "X" }, get), null)
  const packet = gui.commandPacket({ Header: "SET", Argument: "ModCfg", Variables: ["CFG.A", "LST-Speed", "LST-Count"] }, get, ["LST-Speed", 7])
  assert.deepEqual(packet.payload, { "CFG.A": 1, LST: { Speed: 7, Count: 10 } })
  assert.deepEqual(packet.writes, [
    ["CFG.A", 1],
    ["LST-Speed", 7],
    ["LST-Count", 10],
  ])
  assert.equal(gui.commandPacket({ Header: "SET", Argument: "NoSend", Variables: [] }, get).send, false)
})

test("пакет кнопки таблицы: значения Variables из строки, у списка - поле без -S", () => {
  const row = { id: 3, "mode-S": [{ value: 1 }], mode: 2, other: "x" }
  assert.deepEqual(gui.tablePacket({ Header: "SET", Argument: "Row", Variables: ["id", "mode-S"] }, row), {
    header: "SET",
    argument: "Row",
    payload: { id: 3, mode: 2 },
    writes: [],
    send: true,
  })
  assert.equal(gui.tablePacket(undefined, row), null)
})

test("слияние ответа: объект целиком и по полям, ход закачки поверх снимка, служебные поля FS пропускаются", () => {
  const map = new Map()
  gui.mergeDevicePayload(map, "M|", "FS", { "CFG.FS": { Total: 10, List: [] }, Op: "Delete", "CFG.A": 1 })
  assert.deepEqual(map.get("M|CFG.FS"), { Total: 10, List: [] })
  assert.equal(map.get("M|CFG.FS-Total"), 10)
  assert.equal(map.has("M|Op"), false)
  gui.mergeDevicePayload(map, "M|", "FS", { "CFG.FS": { Upload: { Progress: 5 } } })
  assert.deepEqual(map.get("M|CFG.FS"), { Total: 10, List: [], Upload: { Progress: 5 } })
  gui.mergeDevicePayload(map, "M|", "ModCfg", { Op: "x" })
  assert.equal(map.get("M|Op"), "x")
  gui.mergeDevicePayload(map, "M|", "ModCfg", [1, 2])
  assert.equal(map.size, 6)
})

test("сетка: аккордеон и смарт-виджеты - одна строка", () => {
  assert.equal(gui.spanRows({ type: "WidgetMap", position: { height: 5 } }), 1)
  assert.equal(gui.spanRows({ type: "Widget", position: { height: 3 } }), 3)
  assert.equal(gui.isWidgetType("Widget"), false)
})
