/* tests/maplibre.test.mjs - версия MapLibre на CDN совпадает с установленной devDependency maplibre-gl (по ней проверяются типы) */
import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)

test("MAPLIBRE_VERSION в WidgetMap равна установленной maplibre-gl", () => {
  const installed = require("maplibre-gl/package.json").version
  const source = readFileSync(new URL("../dist/WidgetMap/mapWrapper/utils.js", import.meta.url), "utf8")
  const cdn = source.match(/MAPLIBRE_VERSION = "([^"]+)"/)?.[1]
  assert.equal(cdn, installed, "поднимите MAPLIBRE_VERSION в src/lib/WidgetMap/mapWrapper/utils.ts до установленной версии maplibre-gl")
})
