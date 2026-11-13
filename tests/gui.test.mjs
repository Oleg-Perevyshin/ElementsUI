/* tests/gui.test.mjs - чистые правила GUIRenderer: поля смарт-виджетов, битовые поля, пакеты кнопки и таблицы, слияние ответа устройства, раскладка по группам */
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
  assert.deepEqual(packet, { "CFG.Name": "Hub", "CFG.HostName": "hub", "CFG.WebUser": undefined, "CFG.WebPsw": undefined, "CFG.SCLL": undefined })
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

/* Блок сетки: тип, строка, колонка, ширина */
const block = (id, type, row, col, width, extra = {}) => ({ id, type, properties: extra, position: { row, col, width, height: 1 } })
/* Дерево раскладки в строку: leaf - id, узлы - kind(...) */
const shape = (node) => (node.kind === "leaf" ? node.component.id : `${node.kind}(${node.items.map(shape).join(" ")})`)

test("раскладка: группы рядом через пустую колонку, внутри группы - строки формы", () => {
  /* Два мотора по 5 колонок: заголовок, затем «Напряжение | Ток» */
  const list = [
    block("roll", "TextField", 1, 1, 5),
    block("u1", "Input", 2, 1, 3),
    block("i1", "Input", 2, 4, 2),
    block("pitch", "TextField", 1, 7, 5),
    block("u2", "Input", 2, 7, 3),
    block("i2", "Input", 2, 10, 2),
  ]
  assert.equal(shape(gui.layoutFlow(list)), "groups(stack(roll line(u1 i1)) stack(pitch line(u2 i2)))")
})

test("раскладка: пустая строка и блок во всю ширину делят на разделы, каналы вплотную по строкам не перемешиваются", () => {
  const list = [
    block("title", "TextField", 1, 1, 23),
    block("a1", "Input", 2, 1, 2),
    block("a2", "Switch", 3, 1, 2),
    block("b1", "Input", 2, 4, 2),
    block("b2", "Switch", 3, 4, 2),
    block("line", "Divider", 4, 1, 23),
    block("graph", "Graph", 6, 1, 23),
  ]
  assert.equal(shape(gui.layoutFlow(list)), "stack(stack(title groups(stack(a1 a2) stack(b1 b2)) line) graph)")
})

test("раскладка: ширина на телефоне и колонки сетки компьютера", () => {
  const channel = gui.layoutFlow([block("x", "Input", 1, 1, 2), block("y", "Select", 2, 1, 2, { type: "buttons", options: [1, 2, 3] })])
  assert.equal(gui.flowMinWidth(channel), 132)
  assert.equal(gui.flowMinWidth(gui.layoutFlow([block("g", "Graph", 1, 1, 23)])), Infinity)
  /* Внутренняя пустая колонка - узкая полоса, крайние пустые остаются полными */
  const fr = "minmax(0, 1fr)"
  assert.equal(gui.layoutColumns([block("l", "Input", 1, 1, 2), block("r", "Input", 1, 4, 2)], 6), [fr, fr, "0.75rem", fr, fr, fr].join(" "))
})
