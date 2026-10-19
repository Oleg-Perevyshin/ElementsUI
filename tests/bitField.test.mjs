/* tests/bitField.test.mjs — битовые поля слова конфигурации (Select/Input с bitMode) против эталона на BigInt, включая бит 31 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { bitFieldGet, bitFieldSet } from "../dist/bitField.js"

const B = (w) => BigInt(w >>> 0)
const refGet = (w, s, e) => Number((B(w) >> BigInt(s)) & ((1n << BigInt(e - s + 1)) - 1n))
const refSet = (w, s, e, v) => {
  const m = ((1n << BigInt(e - s + 1)) - 1n) << BigInt(s)
  return Number((B(w) & ~m & 0xffffffffn) | ((BigInt(v) << BigInt(s)) & m))
}

test("битовые поля: любые диапазоны 0..31, отрицательное представление слова", () => {
  for (let i = 0; i < 20000; i++) {
    const w = Math.floor(Math.random() * 2 ** 32) - (i % 3 === 0 ? 2 ** 32 : 0)
    const s = Math.floor(Math.random() * 32)
    const e = s + Math.floor(Math.random() * (32 - s))
    const v = Math.floor(Math.random() * 2 ** (e - s + 1))
    assert.equal(bitFieldGet(w, s, e), refGet(w, s, e))
    const r = bitFieldSet(w, s, e, v)
    assert.equal(r, refSet(w, s, e, v))
    assert.ok(r >= 0 && r < 2 ** 32)
  }
  /* GUI 20.00.000-01: температура IMU (бит 31) включена, меняется диапазон ±g (биты 6-7) */
  assert.equal(bitFieldSet(4188261681, 6, 7, 1), 4188261745)
  assert.equal(bitFieldGet(4188261681, 31, 31), 1)
  assert.equal(bitFieldGet(-106705551, 6, 7), 1)
  assert.equal(bitFieldSet(0, 0, 31, 0xffffffff), 0xffffffff)
})
