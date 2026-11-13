/* $lib/componentMeta.ts - метаданные типов GUI без самих компонентов: обмен с устройством и поля смарт-виджетов. GUIRenderer берёт их отсюда, а не из registry.ts, иначе в сборку приложения попали бы все виджеты */
import { WIDGET_FIELDS, widgetKey, widgetPrefixes, type WidgetFieldsType } from "./gui"
import type { UIType } from "./types"
import { COMPONENT_IO, COMPONENT_TYPES } from "./dictionaries/generated/components"

/* Обмен с устройством: none - оформление; read - показывает переменную properties.id; write - только отправляет команду; readWrite - показывает и меняет; widget - набор полей группы properties.id (fields) */
export type ComponentIO = "none" | "read" | "write" | "readWrite" | "widget"

export interface ComponentMeta {
  io: ComponentIO
  /* Поля смарт-виджета: имя - тип значения (WIDGET_FIELDS) */
  fields?: object
}

/* Типы и обмен - из списка компонентов dictionaries/components.yaml: присваивания ниже не скомпилируются, если список и UIType разошлись в любую сторону */
const LISTED_TYPES: readonly UIType[] = COMPONENT_TYPES
const LISTED_IO: Record<UIType, ComponentIO> = COMPONENT_IO

/* Поля смарт-виджетов (io: widget) - из WIDGET_FIELDS */
const WIDGET_TYPE_FIELDS: Partial<Record<UIType, object>> = WIDGET_FIELDS

export const COMPONENT_META = Object.fromEntries(
  LISTED_TYPES.map((type) => [type, LISTED_IO[type] === "widget" ? { io: LISTED_IO[type], fields: WIDGET_TYPE_FIELDS[type] } : { io: LISTED_IO[type] }]),
) as Record<UIType, ComponentMeta>

/* Переменные устройства компонента (без префикса модуля): поля смарт-виджета, properties.id компонента с данными, переменные уровней PeriodChart */
export const componentVariables = (component: { type: UIType; properties: object }): string[] => {
  const entry = COMPONENT_META[component.type]
  const props = component.properties as { id?: string; groups?: string[]; keys?: Record<string, string>; levels?: { variable?: string }[] }
  if (entry.io === "widget")
    return widgetPrefixes(component.type as WidgetFieldsType, props).flatMap((prefix) =>
      Object.keys(entry.fields ?? {}).map((field) => widgetKey(prefix, field, props.keys)),
    )
  if (entry.io === "none" || entry.io === "write" || !props.id) return []
  return [props.id, ...(props.levels ?? []).flatMap((level) => (level.variable ? [level.variable] : []))]
}
