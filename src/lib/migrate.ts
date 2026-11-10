/* $lib/migrate.ts - перевод сохранённого GUI 1.x в формат 2.0: цвет из классов (bg-*, text-*) в accent, Select хранит значение варианта, Switch - число. Чистые функции, повторный вызов ничего не меняет */
import { isAccentColor, type AccentColor } from "./accent.js"
import { isWidgetType } from "./gui.js"
import type { UIComponent } from "./types"

type Props = Record<string, any>

/* Цвет текста 1.x: токен темы text-(color:--red-text) или палитра Tailwind text-red-500, text-[#333] */
const TEXT_COLOR = /^(?:dark:)?text-(?:\(color:--(\w+)-text\)|(\w+)-\d{3}|\[#(?:333|e2e3e7)\])$/
/* Заливка 1.x: роль bg-red, мягкий вариант bg-red-soft, без роли - bg-max, bg-accent */
const BG_COLOR = /^bg-(\w+?)(?:-soft)?$/
const BG_NEUTRAL = ["max", "accent"]

/* Убирает из строки классов цветовые классы вида kind, возвращает остаток и роль */
const takeColor = (classes: unknown, kind: "bg" | "text"): { rest: string; accent?: AccentColor; found?: string } => {
  if (typeof classes !== "string") return { rest: "" }
  let accent: AccentColor | undefined
  let found: string | undefined
  const rest = classes
    .split(/\s+/)
    .filter((cls) => {
      const match = cls.match(kind === "bg" ? BG_COLOR : TEXT_COLOR)
      const role = match?.[1] ?? match?.[2]
      if (!match || (kind === "bg" && !isAccentColor(role) && !BG_NEUTRAL.includes(role!))) return true
      if (isAccentColor(role)) accent = role
      found = cls
      return false
    })
    .join(" ")
  return { rest, accent, found }
}

/* Переносит цвет из props[key] в accent (если accent ещё не задан); пустой класс удаляется */
const moveColor = (props: Props, key: string, kind: "bg" | "text" = "bg") => {
  if (typeof props[key] !== "string") return
  const { rest, accent } = takeColor(props[key], kind)
  if (accent && !props.accent) props.accent = accent
  if (rest) props[key] = rest
  else delete props[key]
}

/* Вариант 1.x: цвет в class -> accent */
const migrateOption = (option: Props): Props => {
  if (!option || typeof option !== "object" || !("class" in option)) return option
  const { class: classes, ...rest } = option
  const { accent } = takeColor(classes, "bg")
  return accent && !rest.accent ? { ...rest, accent } : rest
}

const isOptionObject = (value: unknown): value is { value: unknown } => !!value && typeof value === "object" && !Array.isArray(value) && "value" in value

const WRAPPER_ACCENT = ["Slider", "Switch", "Joystick", "PeriodChart", "Tabs", "VideoViewer", "ProgressBar", "Table"]

export const migrateProperties = <C extends UIComponent>(component: C): C => {
  if (!component?.properties || typeof component.properties !== "object") return component
  const props: Props = structuredClone(component.properties)
  const type = component.type

  if (type === "Accordion" || type === "Input" || isWidgetType(type)) moveColor(props, "componentClass")
  if (WRAPPER_ACCENT.includes(type)) moveColor(props, "wrapperClass")

  switch (type) {
    case "Button": {
      if (typeof props.componentClass !== "string") break
      /* bg-max, bg-gray, мягкие - secondary; прочие роли - primary своего цвета; bg-transparent и без заливки - plain */
      const { rest, accent, found } = takeColor(props.componentClass, "bg")
      if (found && !props.variant) props.variant = found === "bg-max" || found === "bg-gray" || found.endsWith("-soft") ? "secondary" : "primary"
      if (accent && props.variant === "primary" && !props.accent) props.accent = accent
      props.componentClass = rest.replace(/(?:^|\s)bg-transparent(?=\s|$)/, "").trim()
      if (!props.componentClass) delete props.componentClass
      break
    }
    case "Select":
      if (Array.isArray(props.value)) props.value = props.value.map((v: unknown) => (isOptionObject(v) ? v.value : v))
      else if (isOptionObject(props.value)) props.value = props.value.value
      if (Array.isArray(props.options)) props.options = props.options.map(migrateOption)
      break
    case "Switch":
      if (typeof props.value === "boolean") props.value = Number(props.value)
      if (Array.isArray(props.options)) {
        const options = props.options.map(migrateOption)
        if (props.bitMode) props.options = options
        else {
          if (options[0]?.accent && !props.accent) props.accent = options[0].accent
          if (options[0]?.disabled && props.disabled === undefined) props.disabled = true
          delete props.options
        }
      }
      break
    case "ProgressBar":
      if (Array.isArray(props.items)) props.items = props.items.map(migrateOption)
      break
    case "Divider":
      if (typeof props.color === "string") {
        const { accent } = takeColor(props.color, "bg")
        if (accent && !props.accent) props.accent = accent
        delete props.color
      }
      break
    case "TextField":
      moveColor(props, "wrapperClass", "text")
      if (typeof props.content?.class === "string") {
        const { rest, accent } = takeColor(props.content.class, "text")
        if (accent && !props.accent) props.accent = accent
        props.content.class = rest
      }
      break
    case "Tabs":
      /* Цвет текста вкладок теперь от accent */
      if (Array.isArray(props.items))
        props.items = props.items.map((item: Props) => (typeof item?.class === "string" ? { ...item, class: takeColor(item.class, "text").rest } : item))
      break
    case "Widget":
      if (props.settings && typeof props.settings === "object") {
        const { accent } = takeColor(props.settings.class, "bg")
        if (accent && !props.accent) props.accent = accent
        delete props.settings.class
      }
      if (props.icons && typeof props.icons === "object") delete props.icons.class
      break
    case "Input":
      delete props.isValid
      break
  }
  return { ...component, properties: props }
}

/* Весь GUI (массив компонентов) */
export const migrateGUI = <C extends UIComponent>(components: C[]): C[] => (Array.isArray(components) ? components.map(migrateProperties) : components)
