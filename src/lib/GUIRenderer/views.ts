/* src/lib/GUIRenderer/views.ts - компоненты отрисовки GUI по типу. GUIRenderer сам ничего не импортирует: приложение передаёт в views только нужные типы, остальные не попадают в его сборку и рисуются заглушкой */
import type { Component } from "svelte"
import type { UIType } from "../types"
import Accordion from "../Accordion/Accordion.svelte"
import Button from "../Button/Button.svelte"
import Divider from "../Divider/Divider.svelte"
import FileAttach from "../FileAttach/FileAttach.svelte"
import Graph from "../Graph/Graph.svelte"
import Input from "../Input/Input.svelte"
import Joystick from "../Joystick/Joystick.svelte"
import PeriodChart from "../PeriodChart/PeriodChart.svelte"
import ProgressBar from "../ProgressBar/ProgressBar.svelte"
import Select from "../Select/Select.svelte"
import Slider from "../Slider/Slider.svelte"
import Switch from "../Switch/Switch.svelte"
import Table from "../Table/Table.svelte"
import Tabs from "../Tabs/Tabs.svelte"
import TextField from "../TextField/TextField.svelte"
import VideoViewer from "../VideoViewer/VideoViewer.svelte"
import Widget from "../Widget/Widget.svelte"
import WidgetWiFi from "../WidgetWiFi/WidgetWiFi.svelte"
import WidgetDeviceInfo from "../WidgetDeviceInfo/WidgetDeviceInfo.svelte"
import WidgetFileSystem from "../WidgetFileSystem/WidgetFileSystem.svelte"
import WidgetStackInfo from "../WidgetStackInfo/WidgetStackInfo.svelte"
import WidgetRGBStrip from "../WidgetRGBStrip/WidgetRGBStrip.svelte"
import WidgetPFD from "../WidgetPFD/WidgetPFD.svelte"
import WidgetMap from "../WidgetMap/WidgetMap.svelte"

/* Все типы - для облака, терминала и конструктора; приложению с ограниченной памятью - свой набор из отдельных компонентов */
export const GUI_VIEWS = {
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
} satisfies Record<UIType, Component<any, any, any>>

export type GuiViews = Partial<typeof GUI_VIEWS>
