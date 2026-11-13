/* tests/xPoeDebugValue.test.mjs - VALUE xPOE-Debug в стиле YAML: строка таблицы, окно, поле Value и round-trip VALUE -> поле -> тот же CBOR */
import { test } from "node:test"
import assert from "node:assert/strict"
import * as m from "../dist/protocols/index.js"
import { encodeCbor } from "../dist/protocols/cbor/encoder.js"

const flow = (value) => m.formatXPoeDebugValue(value, new Uint8Array())
const hex = (data) => Buffer.from(data).toString("hex")
const map = (entries) => new Map(entries)

test("VALUE: корневая карта без скобок, вложенные - в скобках, массивы", () => {
  assert.equal(
    flow({ "CFG.DevName": "ESP32-Pico-1", "CFG.WiFiMode": 1, "CFG.StaSSID": "Home 5G" }),
    "CFG.DevName: ESP32-Pico-1, CFG.WiFiMode: 1, CFG.StaSSID: Home 5G",
  )
  assert.equal(flow({ Message: 100, Args: ["CFG.DevSN"] }), "Message: 100, Args: [CFG.DevSN]")
  assert.equal(flow({ a: { b: 1, c: [1, 2] }, d: {}, e: [] }), "a: {b: 1, c: [1, 2]}, d: {}, e: []")
  assert.deepEqual([flow({}), flow([]), flow([1, [2, 3]]), flow(42), flow(null), flow(true)], ["{}", "[]", "[1, [2, 3]]", "42", "null", "true"])
})

test("VALUE: кавычки только где строка иначе прочиталась бы не так", () => {
  const cases = {
    Home: "Home",
    "Home 5G": "Home 5G",
    "Привет 🌍": "Привет 🌍",
    "it's": "it's",
    123: '"123"',
    "-1.5": '"-1.5"',
    "0x10": '"0x10"',
    true: '"true"',
    False: '"False"',
    null: '"null"',
    "": '""',
    "a, b": '"a, b"',
    "a:b": '"a:b"',
    "[x]": '"[x]"',
    "{x}": '"{x}"',
    "#tag": '"#tag"',
    " x": '" x"',
    "x ": '"x "',
    "a\nb": '"a\\nb"',
    '"q"': '"\\"q\\""',
    "'q'": "\"'q'\"",
    "h'01'": "\"h'01'\"",
  }
  for (const [text, shown] of Object.entries(cases)) assert.equal(flow(text), shown, text)
  assert.equal(flow({ 1: 2, "": 3, "a b": 4 }), '"1": 2, "": 3, a b: 4')
})

test("VALUE: байты h'..', float32 кратко, большие и особые числа", () => {
  assert.equal(flow(Uint8Array.of(0x0c, 0x73)), "h'0C73'")
  assert.equal(flow({ Data: Uint8Array.of(1, 0xff), Empty: new Uint8Array() }), "Data: h'01FF', Empty: h''")
  const float32 = m.cborToValue(Uint8Array.from(Buffer.from("A16154FA4144CCCD", "hex"))) /* {"T": float32 12.3} */
  assert.equal(flow(float32), "T: 12.3")
  assert.equal(flow([0.1, 1e21, -0.5]), "[0.1, 1e+21, -0.5]")
  assert.equal(flow([Infinity, -Infinity, NaN]), "[.inf, -.inf, .nan]")
  /* с исходными байтами - как на проводе: uint64 числом, ключи-числа без кавычек, порядок пар */
  const wire = (hexText) => {
    const bytes = Uint8Array.from(Buffer.from(hexText, "hex"))
    return m.formatXPoeDebugValue(m.cborToValue(bytes), bytes)
  }
  assert.equal(wire("1BFFFFFFFFFFFFFFFF"), "18446744073709551615")
  assert.equal(wire("A26162010102"), "b: 1, 1: 2")
  assert.equal(wire("A1613101"), '"1": 1')
})

test("окно: блочный YAML с отступом 2", () => {
  assert.equal(
    m.formatXPoeDebugPretty({ Mode: 1, Net: { SSID: "Home 5G", Ch: [1, 6] }, List: [{ a: 1, b: "x" }, [1, 2], []], Raw: Uint8Array.of(1) }),
    ["Mode: 1", "Net:", "  SSID: Home 5G", "  Ch:", "    - 1", "    - 6", "List:", "  - a: 1", "    b: x", "  - - 1", "    - 2", "  - []", "Raw: h'01'"].join(
      "\n",
    ),
  )
  assert.deepEqual([m.formatXPoeDebugPretty({}), m.formatXPoeDebugPretty("123"), m.formatXPoeDebugPretty(Uint8Array.of(0xab))], ["{}", '"123"', "h'AB'"])
})

test("поле Value: поток YAML, корневая карта без скобок, h'..' - байтовая строка, 0x.. - готовый CBOR", () => {
  const cbor = (text) => hex(m.xPoeDebugValueFromText(text))
  assert.equal(cbor("CFG.WiFiMode: 1, CFG.StaSSID: Home 5G"), hex(m.valueToCbor({ "CFG.WiFiMode": 1, "CFG.StaSSID": "Home 5G" })))
  assert.equal(cbor("{a: 1, b: [1, x]}"), hex(m.valueToCbor({ a: 1, b: [1, "x"] })))
  assert.equal(cbor("a:"), hex(m.valueToCbor({ a: null })))
  assert.equal(cbor("Home 5G"), hex(m.valueToCbor("Home 5G")))
  assert.equal(cbor("http://x"), hex(m.valueToCbor("http://x")))
  assert.equal(cbor("'it''s'"), hex(m.valueToCbor("it's")))
  assert.equal(cbor("h'0C 73'"), "420c73")
  assert.equal(cbor("0x420C73"), "420c73")
  assert.equal(cbor("18446744073709551615"), "1bffffffffffffffff")
  assert.equal(cbor("[.inf, null, True, ~]"), hex(m.valueToCbor([Infinity, null, true, null])))
  assert.equal(m.xPoeDebugValueFromText("  ").length, 0)
  for (const bad of ["{a: 1", "[1, 2", "h'ABC'", '"abc', "a: 1, b", "[1] x", "0x", "0xABC"]) assert.throws(() => m.xPoeDebugValueFromText(bad), /Value/, bad)
  assert.throws(() => m.xPoeDebugValueFromText("[1, 2"), /позиция 6/)
})

test("поле Value: прежний JSON разбирается как раньше, включая base64 под ключами BIN", () => {
  const json = (text, value) => assert.equal(hex(m.xPoeDebugValueFromText(text)), hex(m.valueToCbor(value)), text)
  json("{}", {})
  json('{"CfgGroup":"CFG"}', { CfgGroup: "CFG" })
  json('{"LST.Color":[255,0,0]}', { "LST.Color": [255, 0, 0] })
  json('"12"', "12")
  json("12", 12)
  json("null", null)
  assert.equal(hex(m.xPoeDebugValueFromText('{"FileBin":"AQI="}')), hex(m.valueToCbor({ FileBin: Uint8Array.of(1, 2) })))
})

test("round-trip: VALUE вставляется в поле Value и даёт тот же CBOR", () => {
  const values = [
    map([
      ["CFG.DevName", "ESP32-Pico-1"],
      ["CFG.WiFiMode", 1],
      ["CFG.StaSSID", "Home 5G"],
    ]),
    map([
      ["Message", 100],
      ["Args", ["CFG.DevSN"]],
    ]),
    map([
      ["s", "123"],
      ["t", "a, b"],
      ["u", "true"],
      ["e", ""],
      ["z", "Юникод 中文 🌍"],
      ["q", "h'01'"],
      ["n", "a\n\tb"],
    ]),
    map([
      ["Nested", map([["List", [1, -2, 0.5, map([["x", null]]), [], map()]]])],
      ["Bytes", Uint8Array.of(0x0c, 0x73)],
      ["Empty", new Uint8Array()],
      ["1", true],
      ["", false],
      ["k: v", "#"],
    ]),
    map(),
    [],
    [1, [2, "3"], map([["a", "b"]])],
    "123",
    "a, b",
    "true",
    "",
    "Привет",
    Uint8Array.of(1, 0xff),
    map([
      [1, "int key"],
      ["1", "str key"],
      ["big", 18446744073709551615n],
      ["neg", -5],
    ]),
    42,
    -7,
    12.25,
    null,
    false,
  ]
  for (const value of values) {
    const bytes = encodeCbor(value)
    const shown = m.formatXPoeDebugValue(m.cborToValue(bytes), bytes)
    assert.equal(hex(m.xPoeDebugValueFromText(shown)), hex(bytes), shown)
  }
  /* float32 с провода: значение в поле то же, ширину выбирает кодер */
  const float32 = Uint8Array.from(Buffer.from("A16154FA4144CCCD", "hex"))
  const back = m.cborToValue(m.xPoeDebugValueFromText(flow(m.cborToValue(float32))))
  assert.equal(Math.fround(back.T), m.cborToValue(float32).T)
})
