/* tests/localize.test.mjs - localizeDeep: многоязычный текст переводится только под ключами текстов, данные остаются как есть */
import { test } from "node:test"
import assert from "node:assert/strict"
import { localizeDeep } from "../dist/locales/localize.js"

test("данные колонки и картинки не принимаются за перевод, текст под name переводится", () => {
  const props = {
    label: { name: { ru: "Устройства", en: "Devices" } },
    header: [{ label: { name: { ru: "Имя", en: "Name" } }, content: [{ type: "text", data: { key: "device" } }] }],
    image: { src: "a.png", alt: "x" },
    labels: [{ ru: "Один", en: "One" }, "Два"],
    options: [{ value: { ru: "1", en: "2" }, name: { ru: "Да", en: "Yes", zh: "是" } }],
  }
  const out = localizeDeep(props, "en")
  assert.equal(out.label.name, "Devices")
  assert.equal(out.header[0].label.name, "Name")
  assert.deepEqual(out.header[0].content[0].data, { key: "device" })
  assert.deepEqual(out.image, { src: "a.png", alt: "x" })
  assert.deepEqual(out.labels, ["One", "Два"])
  assert.deepEqual(out.options[0], { value: { ru: "1", en: "2" }, name: "Yes" })
  /* Под name, но ключи не коды языков из LANGUAGES - не перевод */
  assert.deepEqual(localizeDeep({ name: { key: "x", src: "y" } }, "en"), { name: { key: "x", src: "y" } })
  /* Языка нет - язык по умолчанию */
  assert.equal(localizeDeep({ name: { ru: "Привет" } }, "zh").name, "Привет")
})
