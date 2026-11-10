/* $lib/registry.ts - реестр компонентов GUI: компонент отрисовки, обмен с устройством и поля смарт-виджетов по типу. Тип UIComponent и реестр сверяются по UIComponentPropsMap */
import type { Component } from "svelte"
import Accordion from "./Accordion/Accordion.svelte"
import Button from "./Button/Button.svelte"
import Divider from "./Divider/Divider.svelte"
import FileAttach from "./FileAttach/FileAttach.svelte"
import Graph from "./Graph/Graph.svelte"
import Input from "./Input/Input.svelte"
import Joystick from "./Joystick/Joystick.svelte"
import PeriodChart from "./PeriodChart/PeriodChart.svelte"
import ProgressBar from "./ProgressBar/ProgressBar.svelte"
import Select from "./Select/Select.svelte"
import Slider from "./Slider/Slider.svelte"
import Switch from "./Switch/Switch.svelte"
import Table from "./Table/Table.svelte"
import Tabs from "./Tabs/Tabs.svelte"
import TextField from "./TextField/TextField.svelte"
import VideoViewer from "./VideoViewer/VideoViewer.svelte"
import Widget from "./Widget/Widget.svelte"
import WidgetWiFi from "./WidgetWiFi/WidgetWiFi.svelte"
import WidgetDeviceInfo from "./WidgetDeviceInfo/WidgetDeviceInfo.svelte"
import WidgetFileSystem from "./WidgetFileSystem/WidgetFileSystem.svelte"
import WidgetStackInfo from "./WidgetStackInfo/WidgetStackInfo.svelte"
import WidgetRGBStrip from "./WidgetRGBStrip/WidgetRGBStrip.svelte"
import WidgetPFD from "./WidgetPFD/WidgetPFD.svelte"
import WidgetMap from "./WidgetMap/WidgetMap.svelte"
import { WIDGET_FIELDS, widgetKey, widgetPrefixes, type WidgetFieldsType } from "./gui"
import type { UIType } from "./types"

/* Обмен с устройством: none - оформление; read - показывает переменную properties.id; write - только отправляет команду; readWrite - показывает и меняет; widget - набор полей группы properties.id (fields) */
export type ComponentIO = "none" | "read" | "write" | "readWrite" | "widget"

export interface ComponentEntry {
  view: Component<any, any, any>
  io: ComponentIO
  /* Поля смарт-виджета: имя - тип значения (WIDGET_FIELDS) */
  fields?: object
}

export const COMPONENTS: Record<UIType, ComponentEntry> = {
  Accordion: { view: Accordion, io: "none" },
  Tabs: { view: Tabs, io: "none" },
  TextField: { view: TextField, io: "none" },
  Divider: { view: Divider, io: "none" },
  Button: { view: Button, io: "write" },
  FileAttach: { view: FileAttach, io: "write" },
  Input: { view: Input, io: "readWrite" },
  Select: { view: Select, io: "readWrite" },
  Switch: { view: Switch, io: "readWrite" },
  Slider: { view: Slider, io: "readWrite" },
  Joystick: { view: Joystick, io: "readWrite" },
  Widget: { view: Widget, io: "readWrite" },
  ProgressBar: { view: ProgressBar, io: "read" },
  Graph: { view: Graph, io: "read" },
  PeriodChart: { view: PeriodChart, io: "read" },
  Table: { view: Table, io: "read" },
  VideoViewer: { view: VideoViewer, io: "none" },
  WidgetWiFi: { view: WidgetWiFi, io: "widget", fields: WIDGET_FIELDS.WidgetWiFi },
  WidgetDeviceInfo: { view: WidgetDeviceInfo, io: "widget", fields: WIDGET_FIELDS.WidgetDeviceInfo },
  WidgetFileSystem: { view: WidgetFileSystem, io: "widget", fields: WIDGET_FIELDS.WidgetFileSystem },
  WidgetStackInfo: { view: WidgetStackInfo, io: "widget", fields: WIDGET_FIELDS.WidgetStackInfo },
  WidgetRGBStrip: { view: WidgetRGBStrip, io: "widget", fields: WIDGET_FIELDS.WidgetRGBStrip },
  WidgetPFD: { view: WidgetPFD, io: "widget", fields: WIDGET_FIELDS.WidgetPFD },
  WidgetMap: { view: WidgetMap, io: "widget", fields: WIDGET_FIELDS.WidgetMap },
}

/* Переменные устройства компонента (без префикса модуля): поля смарт-виджета, properties.id компонента с данными, переменные уровней PeriodChart */
export const componentVariables = (component: { type: UIType; properties: object }): string[] => {
  const entry = COMPONENTS[component.type]
  const props = component.properties as { id?: string; groups?: string[]; keys?: Record<string, string>; levels?: { variable?: string }[] }
  if (entry.io === "widget")
    return widgetPrefixes(component.type as WidgetFieldsType, props).flatMap((prefix) =>
      Object.keys(entry.fields ?? {}).map((field) => widgetKey(prefix, field, props.keys)),
    )
  if (entry.io === "none" || entry.io === "write" || !props.id) return []
  return [props.id, ...(props.levels ?? []).flatMap((level) => (level.variable ? [level.variable] : []))]
}
