/* $lib/registry.ts - реестр компонентов GUI для конструктора: компонент отрисовки и метаданные типа (componentMeta.ts). GUIRenderer его не импортирует - иначе в сборку попали бы все виджеты */
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
import { COMPONENT_META, type ComponentMeta } from "./componentMeta"
import type { UIType } from "./types"

export interface ComponentEntry extends ComponentMeta {
  view: Component<any, any, any>
}

/* Компонент каждого типа - для конструктора: тянет в сборку все виджеты, поэтому GUIRenderer его не импортирует (метаданные - componentMeta.ts) */
const VIEWS: Record<UIType, Component<any, any, any>> = {
  Accordion,
  Button,
  Divider,
  FileAttach,
  Graph,
  Input,
  Joystick,
  PeriodChart,
  ProgressBar,
  Select,
  Slider,
  Switch,
  Table,
  Tabs,
  TextField,
  VideoViewer,
  Widget,
  WidgetWiFi,
  WidgetDeviceInfo,
  WidgetFileSystem,
  WidgetStackInfo,
  WidgetRGBStrip,
  WidgetPFD,
  WidgetMap,
}

export const COMPONENTS = Object.fromEntries(
  (Object.keys(COMPONENT_META) as UIType[]).map((type) => [type, { ...COMPONENT_META[type], view: VIEWS[type] }]),
) as Record<UIType, ComponentEntry>
