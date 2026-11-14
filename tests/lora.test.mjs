/* tests/lora.test.mjs - WidgetLoRa: чтение и сборка слов LORA.Cfg по шаблонам */
import { test } from "node:test"
import assert from "node:assert/strict"
import { LORA_PRESETS, loraDecode, loraEncode, loraKeys } from "../dist/WidgetLoRa/lora.js"

const HT = LORA_PRESETS.HT_CT62.params
const WORD = 1820660393 /* 868 МГц, 10 дБм, 250 кГц, SF7, CR 4/5, CRC, преамбула 8, режим 1 */

test("слово HT-CT62 разбирается в значения", () => {
  assert.deepEqual(loraDecode(HT, { Cfg: WORD }), { Freq: 868, TxP: 10, BW: 5, SF: 2, CR: 0, Preamble: 1, CRC: 1, InvIQ: 0 })
})

test("сборка меняет только свои биты, режим остаётся", () => {
  const out = loraEncode(HT, { Cfg: WORD }, { ...loraDecode(HT, { Cfg: WORD }), TxP: 14 })
  assert.equal(out.Cfg & 3, WORD & 3)
  assert.equal(loraDecode(HT, out).TxP, 14)
  assert.equal(loraDecode(HT, out).Freq, 868)
})

test("частота в Гц отдельным ключом", () => {
  const p = { Freq: { key: "Freq", scale: 1000000 }, TxP: { key: "Cfg", bits: { start: 0, end: 5 } } }
  assert.deepEqual(loraKeys(p), ["Freq", "Cfg"])
  assert.equal(loraDecode(p, { Freq: 868100000, Cfg: 0 }).Freq, 868.1)
  assert.equal(loraEncode(p, { Freq: 0, Cfg: 0 }, { Freq: 868.3 }).Freq, 868300000)
})
