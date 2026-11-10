/* tests/migrate.test.mjs - перевод сохранённого GUI 1.x в формат 2.0 (migrateProperties, migrateGUI): цвет из классов в accent, значения Select и Switch, повторный вызов ничего не меняет */
import { test } from "node:test"
import assert from "node:assert/strict"
import { migrateProperties, migrateGUI } from "../dist/migrate.js"

const component = (type, properties) => ({ id: "c1", type, properties, position: { row: 0, col: 0, width: 1, height: 1 }, parentId: "" })
const props = (type, properties) => migrateProperties(component(type, properties)).properties

test("Button: заливка bg-* -> variant и accent, bg-max -> secondary, bg-transparent -> plain", () => {
  assert.deepEqual(props("Button", { componentClass: "bg-red px-1 py-1" }), { variant: "primary", accent: "red", componentClass: "px-1 py-1" })
  assert.deepEqual(props("Button", { componentClass: "bg-blue" }), { variant: "primary", accent: "blue" })
  assert.deepEqual(props("Button", { componentClass: "w-full bg-max" }), { variant: "secondary", componentClass: "w-full" })
  assert.deepEqual(props("Button", { componentClass: "bg-transparent p-1" }), { componentClass: "p-1" })
  assert.deepEqual(props("Button", { componentClass: "bg-(--container-color) p-1" }), { componentClass: "bg-(--container-color) p-1" })
})

test("Select: вариант -> его значение, массив вариантов -> массив значений, class вариантов -> accent", () => {
  const options = [
    { id: "a", value: 0, name: "Ноль", class: "bg-green" },
    { id: "b", value: 1, name: "Один", class: "bg-max" },
  ]
  const single = props("Select", { value: { id: "a", value: 0, name: "Ноль" }, options })
  assert.equal(single.value, 0)
  assert.deepEqual(single.options, [
    { id: "a", value: 0, name: "Ноль", accent: "green" },
    { id: "b", value: 1, name: "Один" },
  ])
  assert.deepEqual(
    props("Select", {
      value: [
        { id: "a", value: "x" },
        { id: "b", value: "y" },
      ],
    }).value,
    ["x", "y"],
  )
  assert.equal(props("Select", { value: "" }).value, "")
})

test("Switch: цвет и disabled единственного варианта -> свойства, bitMode сохраняет биты, boolean -> число", () => {
  assert.deepEqual(props("Switch", { value: true, options: [{ id: "s", value: 0, class: "bg-purple", disabled: true }] }), {
    value: 1,
    accent: "purple",
    disabled: true,
  })
  assert.deepEqual(props("Switch", { bitMode: true, wrapperClass: "bg-yellow w-1/3", options: [{ id: "b", value: 3, name: "A", class: "bg-red" }] }), {
    bitMode: true,
    accent: "yellow",
    wrapperClass: "w-1/3",
    options: [{ id: "b", value: 3, name: "A", accent: "red" }],
  })
})

test("Мастер-цвет: componentClass, wrapperClass, settings.class, color, цвет текста", () => {
  assert.deepEqual(props("Accordion", { componentClass: "bg-cyan" }), { accent: "cyan" })
  assert.deepEqual(props("WidgetWiFi", { componentClass: "bg-max" }), {})
  assert.deepEqual(props("Slider", { wrapperClass: "bg-orange" }), { accent: "orange" })
  assert.deepEqual(props("Input", { componentClass: "bg-red text-center", isValid: false }), { accent: "red", componentClass: "text-center" })
  assert.deepEqual(props("Widget", { settings: { class: "bg-green", type: "slider" }, icons: { array: [], class: "text-(color:--green-text)" } }), {
    accent: "green",
    settings: { type: "slider" },
    icons: { array: [] },
  })
  assert.deepEqual(props("Divider", { color: "bg-purple", width: 2 }), { accent: "purple", width: 2 })
  assert.deepEqual(props("TextField", { wrapperClass: "text-(color:--red-text) w-full", content: { class: "text-red-500 font-bold" } }), {
    accent: "red",
    wrapperClass: "w-full",
    content: { class: "font-bold" },
  })
  assert.deepEqual(props("ProgressBar", { items: [{ name: "CPU", class: "bg-blue" }] }), { items: [{ name: "CPU", accent: "blue" }] })
  assert.deepEqual(props("Tabs", { wrapperClass: "bg-red", items: [{ name: "A", class: "text-(color:--red-text) flex-1" }] }), {
    accent: "red",
    items: [{ name: "A", class: "flex-1" }],
  })
})

test("Явный accent не перезаписывается, исходный объект не меняется, повторный вызов ничего не меняет", () => {
  assert.equal(props("Slider", { accent: "green", wrapperClass: "bg-red" }).accent, "green")
  const source = component("Button", { componentClass: "bg-green" })
  const frozen = JSON.stringify(source)
  const once = migrateProperties(source)
  assert.equal(JSON.stringify(source), frozen)
  assert.deepEqual(migrateProperties(once), once)
})

test("migrateGUI: весь массив, повторно - то же самое; не массив возвращается как есть", () => {
  const gui = [component("Select", { value: { id: "a", value: 5 } }), component("Switch", { options: [{ id: "s", value: 0, class: "bg-red" }] })]
  const migrated = migrateGUI(gui)
  assert.equal(migrated[0].properties.value, 5)
  assert.equal(migrated[1].properties.accent, "red")
  assert.deepEqual(migrateGUI(migrated), migrated)
  assert.equal(migrateGUI(null), null)
})
