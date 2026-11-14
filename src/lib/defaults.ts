/* $lib/defaults.ts - новые компоненты конструктора: свойства и размер по умолчанию, создание компонента. Тексты пустые - задаются в «Тексты и переводы», заголовок смарт-виджета - его название на всех языках */
import { GUI_GRID, isWidgetType } from "./gui"
import { widgetTitle } from "./locales/i18n"
import type { UIComponent, UIComponentPropsMap, UIType } from "./types"
import { LORA_PRESETS } from "./WidgetLoRa/lora"

const label = { name: "", class: "text-center" }
/* Новый виджет на холсте свёрнут: холст не растягивается, автор раскрывает нужный */
const widget = (type: UIType) => ({ label: { name: widgetTitle(type) as unknown as string }, collapsed: true })

/* Свойства по умолчанию; у смарт-виджета id - группа полей устройства */
export const COMPONENT_DEFAULTS: { [K in UIType]: Partial<UIComponentPropsMap[K]> } = {
  WidgetWiFi: { ...widget("WidgetWiFi"), id: "CFG", allowedModes: [1, 2, 3], confirmOnAP: true },
  WidgetDeviceInfo: { ...widget("WidgetDeviceInfo"), id: "CFG" },
  WidgetLoRa: { ...widget("WidgetLoRa"), id: "LORA", preset: "HT_CT62", params: structuredClone(LORA_PRESETS.HT_CT62.params) },
  WidgetFileSystem: { ...widget("WidgetFileSystem"), id: "CFG", accept: "*/*", maxNameLength: 31 },
  WidgetStackInfo: { ...widget("WidgetStackInfo"), warnBytes: 512, period: 0 },
  WidgetRGBStrip: { ...widget("WidgetRGBStrip"), id: "LST" },
  WidgetPFD: { ...widget("WidgetPFD"), id: "MAV", limits: { staleMs: 2000 } },
  WidgetMap: { ...widget("WidgetMap"), groups: ["MAV"], height: 400, trackEnabled: false, trackLength: 1000 },
  Accordion: { label: { name: "", class: "text-left", icon: null }, isOpen: true, image: "", stripe: false, outline: true },
  Tabs: {
    activeTab: 0,
    orientation: "horizontal",
    items: [
      { name: "", class: "flex-row" },
      { name: "", class: "flex-row" },
    ],
  },
  Button: { content: { name: "" }, variant: "primary", accent: "blue", componentClass: "p-1", disabled: false },
  Input: {
    label,
    type: "text",
    disabled: false,
    readonly: false,
    range: { start: 0, end: 1 },
    maxlength: 32,
    number: { minNum: 0, maxNum: 10, step: 1 },
    placeholder: "",
    textareaRows: 2,
    help: { info: "", copyButton: false },
  },
  Select: { label, help: { info: "" }, type: "select", disabled: false, bitMode: false, range: { start: 0, end: 2 }, options: [{ value: "1", name: "" }] },
  Switch: { label: { name: "", captionLeft: "", captionRight: "" }, help: { info: "" }, type: "horizontal", accent: "blue", value: 0, disabled: false },
  Slider: { label, help: { info: "" }, accent: "blue", value: 5, number: { minNum: 0, maxNum: 10, step: 1 }, disabled: false },
  TextField: { content: { name: "", class: "text-center", size: "base" } },
  ProgressBar: {
    label: { name: "", class: "" },
    help: { info: "" },
    accent: "blue",
    items: [{ name: "" }],
    value: [{ Name: "Label", Value: 40 }],
    number: { minNum: 0, maxNum: 100, units: "" },
    type: "horizontal",
  },
  Graph: { label, help: { info: "" }, streamingData: { data: [] }, refreshRate: 0 },
  PeriodChart: { label, help: { info: "" }, accent: "blue", levels: Array.from({ length: 4 }, () => ({ name: "", variable: "", data: [] })), unit: "" },
  Table: {
    label,
    help: { info: "" },
    accent: "blue",
    header: [
      { label: { name: "" }, width: "40%", align: "left", content: [{ type: "text", data: { key: "id", sortable: true } }] },
      { label: { name: "" }, width: "60%", align: "left", content: [{ type: "text", data: { key: "device" } }] },
    ],
    body: [{ id: "Value of id", device: "Value of device" }],
    dataBuffer: { stashData: false, bufferSize: 100, visibleRows: 10 },
  },
  FileAttach: { label, accept: "*/*" },
  Joystick: { label, help: { info: "" }, axes: Array.from({ length: 3 }, () => ({ name: "", minNum: -100, maxNum: 100 })) },
  Widget: { label, accent: "blue", settings: { label: "", type: "slider", number: { minNum: 0, maxNum: 100, step: 1, units: "" } } },
  VideoViewer: { label, help: { info: "" }, showSelect: true },
  Divider: { type: "line", orientation: "horizontal", width: 2, anchor: "center" },
}

/* Размер нового компонента в клетках сетки: компактный, автор растягивает по месту; каркас (разделитель, аккордеон, вкладки) - во всю ширину */
export const COMPONENT_SIZES: Record<UIType, { width: number; height: number }> = {
  WidgetWiFi: { width: 7, height: 1 },
  WidgetDeviceInfo: { width: 7, height: 1 },
  WidgetLoRa: { width: 7, height: 1 },
  WidgetFileSystem: { width: 7, height: 1 },
  WidgetStackInfo: { width: 7, height: 1 },
  WidgetRGBStrip: { width: 7, height: 1 },
  WidgetPFD: { width: 7, height: 1 },
  WidgetMap: { width: 7, height: 1 },
  Accordion: { width: GUI_GRID.columns, height: 1 },
  Tabs: { width: GUI_GRID.columns, height: 4 },
  Input: { width: 3, height: 1 },
  Select: { width: 3, height: 1 },
  Slider: { width: 8, height: 1 },
  Switch: { width: 2, height: 1 },
  FileAttach: { width: 7, height: 1 },
  Joystick: { width: 6, height: 3 },
  Button: { width: 2, height: 1 },
  Table: { width: 11, height: 2 },
  ProgressBar: { width: 3, height: 1 },
  TextField: { width: 3, height: 1 },
  Graph: { width: 8, height: 3 },
  PeriodChart: { width: 7, height: 4 },
  Widget: { width: 3, height: 3 },
  VideoViewer: { width: 6, height: 3 },
  Divider: { width: GUI_GRID.columns, height: 1 },
}

/* Наименьшая ширина: смарт-виджет не уже 7 клеток (треть сетки), иначе шапка и поля не помещаются */
export const minComponentWidth = (type: string) => (isWidgetType(type) ? 7 : 1)

/* Новый компонент в клетке (col, row) области шириной areaWidth; tab - номер вкладки родителя Tabs (последний знак id). Не помещающийся компонент сужается, но не меньше minComponentWidth - тогда сдвигается влево */
export const createComponent = <K extends UIType>(
  type: K,
  { col = 1, row = 1 }: { col?: number; row?: number } = {},
  parentId = "",
  { tab, areaWidth = GUI_GRID.columns }: { tab?: number; areaWidth?: number } = {},
): UIComponent<K> => {
  const uuid = crypto.randomUUID() as string
  const id = tab === undefined ? uuid : `${uuid.slice(1)}${tab}`
  let { width, height } = COMPONENT_SIZES[type]
  if (col + width - 1 > areaWidth) {
    const min = Math.min(minComponentWidth(type), areaWidth)
    if (areaWidth - col + 1 < min) col = areaWidth - min + 1
    width = areaWidth - col + 1
  }
  const properties: Record<string, unknown> = structuredClone(COMPONENT_DEFAULTS[type] as Record<string, unknown>)
  if (!isWidgetType(type)) properties.id = id
  if (type === "Accordion") properties.size = { width, height }
  if (type === "Tabs") {
    properties.size = { width, height: height - 1 }
    properties.items = (properties.items as object[]).map((item) => ({ ...item, id: crypto.randomUUID() }))
  }
  return {
    id,
    type,
    properties,
    position: { col, row, width, height },
    parentId,
    access: "full",
    eventHandler: { Header: "SET", Argument: type === "Input" ? "NoSend" : "ModCfg", Variables: [] },
  } as unknown as UIComponent<K>
}
