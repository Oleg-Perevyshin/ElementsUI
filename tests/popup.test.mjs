/* tests/popup.test.mjs - правила списков и панелей (Select, Dropdown): соседний доступный вариант по кругу, место панели у триггера */
import { test } from "node:test"
import assert from "node:assert/strict"
import { nextEnabled, popupPlace } from "../dist/popup.js"

test("соседний доступный вариант: по кругу, мимо недоступных, с пустого выбора", () => {
  const off = (index) => index === 1
  assert.equal(nextEnabled(4, 0, 1, off), 2)
  assert.equal(nextEnabled(4, 2, -1, off), 0)
  assert.equal(nextEnabled(4, 3, 1, off), 0)
  assert.equal(nextEnabled(4, 0, -1, off), 3)
  assert.equal(nextEnabled(4, -1, 1), 0)
  assert.equal(nextEnabled(4, -1, -1), 3)
  assert.equal(
    nextEnabled(3, 0, 1, () => true),
    -1,
  )
  assert.equal(nextEnabled(0, -1, 1), -1)
})

test("панель у триггера: вниз или вверх по месту, край окна не переходит", () => {
  const viewport = { width: 1000, height: 800 }
  const low = popupPlace({ top: 100, bottom: 132, left: 50, right: 150, width: 100 }, viewport)
  assert.deepEqual(low, { openUp: false, top: 136, left: 50, space: 800 - 132 - 12 })
  const high = popupPlace({ top: 740, bottom: 772, left: 950, right: 990, width: 40 }, viewport)
  assert.equal(high.openUp, true)
  assert.equal(high.bottom, 800 - 740 + 4)
  assert.equal(high.left, 1000 - 8 - 160)
  const end = popupPlace({ top: 100, bottom: 132, left: 900, right: 995, width: 95 }, viewport, "end")
  assert.equal(end.right, 8)
  assert.equal(end.left, undefined)
})
