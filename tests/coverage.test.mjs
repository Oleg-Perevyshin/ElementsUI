/* tests/coverage.test.mjs - расчёт облёта поля WidgetMap (агро): площадь и число проходов на прямоугольном поле */
import { test } from "node:test"
import assert from "node:assert/strict"
import { fieldArea, planCoverage } from "../dist/WidgetMap/mission/coverage.js"

const LAT = 55
const LON = 37
const M_LAT = 1 / 111320
const M_LON = 1 / (111320 * Math.cos((LAT * Math.PI) / 180))
/* Прямоугольник w×h метров со смещением от опорной точки */
const rect = (w, h, dx = 0, dy = 0) => [
  [LON + dx * M_LON, LAT + dy * M_LAT],
  [LON + (dx + w) * M_LON, LAT + dy * M_LAT],
  [LON + (dx + w) * M_LON, LAT + (dy + h) * M_LAT],
  [LON + dx * M_LON, LAT + (dy + h) * M_LAT],
]
const near = (actual, expected, tolerance, message) => assert.ok(Math.abs(actual - expected) <= tolerance, `${message}: ${actual} вместо ${expected}`)

test("площадь прямоугольного поля, с зоной и без", () => {
  near(fieldArea(rect(100, 50), []), 5000, 25, "без зон")
  near(fieldArea(rect(100, 50), [rect(20, 20, 40, 15)]), 4600, 25, "зона 20×20")
  assert.equal(fieldArea(rect(100, 50).slice(0, 2), []), 0)
})

test("проходы поперёк и вдоль поля 100×50 м с шагом 10 м", () => {
  const field = rect(100, 50)
  const across = planCoverage({ field, holes: [], angle: 0, spacing: 10, margin: 0 })
  assert.deepEqual([across.passes, across.cells, across.turns, across.unreachable], [9, 1, 8, 0])
  near(across.sprayLength, 450, 0.5, "длина проходов поперёк")
  near(across.area, 5000, 25, "площадь в результате")
  const along = planCoverage({ field, holes: [], angle: 90, spacing: 10, margin: 0 })
  assert.deepEqual([along.passes, along.cells, along.unreachable], [4, 1, 0])
  near(along.sprayLength, 400, 0.5, "длина проходов вдоль")
  assert.equal(planCoverage({ field, holes: [], angle: 0, spacing: 0, margin: 0 }), null)
})

test("зона внутри поля делит его на ячейки и обходится", () => {
  const res = planCoverage({ field: rect(100, 50), holes: [rect(20, 20, 40, 15)], angle: 0, spacing: 10, margin: 0 })
  assert.equal(res.unreachable, 0)
  assert.ok(res.cells > 1)
  assert.ok(res.waypoints.length > 0)
})
