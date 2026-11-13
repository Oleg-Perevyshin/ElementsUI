/* $lib/componentMeta.ts - метаданные типов GUI без самих компонентов: обмен с устройством и поля смарт-виджетов. GUIRenderer берёт их отсюда, а не из registry.ts, иначе в сборку приложения попали бы все виджеты */
import { WIDGET_FIELDS, widgetKey, widgetPrefixes, type WidgetFieldsType } from "./gui"
import type { UIType } from "./types"

/* Обмен с устройством: none - оформление; read - показывает переменную properties.id; write - только отправляет команду; readWrite - показывает и меняет; widget - набор полей группы properties.id (fields) */
export type ComponentIO = "none" | "read" | "write" | "readWrite" | "widget"

export interface ComponentMeta {
  io: ComponentIO
  /* Поля смарт-виджета: имя - тип значения (WIDGET_FIELDS) */
  fields?: object
}

export const COMPONENT_META: Record<UIType, ComponentMeta> = {
  Accordion: { io: "none" },
  Tabs: { io: "none" },
  TextField: { io: "none" },
  Divider: { io: "none" },
  Button: { io: "write" },
  FileAttach: { io: "write" },
  Input: { io: "readWrite" },
  Select: { io: "readWrite" },
  Switch: { io: "readWrite" },
  Slider: { io: "readWrite" },
  Joystick: { io: "readWrite" },
  Widget: { io: "readWrite" },
  ProgressBar: { io: "read" },
  Graph: { io: "read" },
  PeriodChart: { io: "read" },
  Table: { io: "read" },
  VideoViewer: { io: "none" },
  WidgetWiFi: { io: "widget", fields: WIDGET_FIELDS.WidgetWiFi },
  WidgetDeviceInfo: { io: "widget", fields: WIDGET_FIELDS.WidgetDeviceInfo },
  WidgetFileSystem: { io: "widget", fields: WIDGET_FIELDS.WidgetFileSystem },
  WidgetStackInfo: { io: "widget", fields: WIDGET_FIELDS.WidgetStackInfo },
  WidgetRGBStrip: { io: "widget", fields: WIDGET_FIELDS.WidgetRGBStrip },
  WidgetPFD: { io: "widget", fields: WIDGET_FIELDS.WidgetPFD },
  WidgetMap: { io: "widget", fields: WIDGET_FIELDS.WidgetMap },
}

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
