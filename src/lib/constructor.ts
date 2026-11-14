/* Точка входа "poe-svelte-ui-lib/constructor": панели свойств конструктора, их общие части и словарь конструктора (описания компонентов component.info.*, тексты панелей); импорт подключает словарь к $T библиотеки. Приложениям без конструктора (WebApp прошивки) не нужен - в их бандл не попадает */
import { extendTranslations } from "./locales/i18n"
import constructorTranslations from "./locales/constructor"
import type { Component } from "svelte"
import type { UIType } from "./types"
import AccordionProps from "./Accordion/AccordionProps.svelte"
import ButtonProps from "./Button/ButtonProps.svelte"
import DividerProps from "./Divider/DividerProps.svelte"
import FileAttachProps from "./FileAttach/FileAttachProps.svelte"
import GraphProps from "./Graph/GraphProps.svelte"
import InputProps from "./Input/InputProps.svelte"
import JoystickProps from "./Joystick/JoystickProps.svelte"
import PeriodChartProps from "./PeriodChart/PeriodChartProps.svelte"
import ProgressBarProps from "./ProgressBar/ProgressBarProps.svelte"
import SelectProps from "./Select/SelectProps.svelte"
import SliderProps from "./Slider/SliderProps.svelte"
import SwitchProps from "./Switch/SwitchProps.svelte"
import TableProps from "./Table/TableProps.svelte"
import TabsProps from "./Tabs/TabsProps.svelte"
import TextFieldProps from "./TextField/TextFieldProps.svelte"
import VideoViewerProps from "./VideoViewer/VideoViewerProps.svelte"
import WidgetProps from "./Widget/WidgetProps.svelte"
import WidgetWiFiProps from "./WidgetWiFi/WidgetWiFiProps.svelte"
import WidgetDeviceInfoProps from "./WidgetDeviceInfo/WidgetDeviceInfoProps.svelte"
import WidgetLoRaProps from "./WidgetLoRa/WidgetLoRaProps.svelte"
import WidgetFileSystemProps from "./WidgetFileSystem/WidgetFileSystemProps.svelte"
import WidgetStackInfoProps from "./WidgetStackInfo/WidgetStackInfoProps.svelte"
import WidgetRGBStripProps from "./WidgetRGBStrip/WidgetRGBStripProps.svelte"
import WidgetPFDProps from "./WidgetPFD/WidgetPFDProps.svelte"
import WidgetMapProps from "./WidgetMap/WidgetMapProps.svelte"

extendTranslations(constructorTranslations)

export { constructorTranslations }
export { optionsStore } from "./options"
export { createPropsEditor, applyPropertyChange, type PropertyChange } from "./propsEditor"
export { default as CommonSnippets } from "./CommonSnippets.svelte"
export { COMPONENT_DEFAULTS, COMPONENT_SIZES, minComponentWidth, createComponent } from "./defaults"
export {
  AccordionProps,
  ButtonProps,
  DividerProps,
  FileAttachProps,
  GraphProps,
  InputProps,
  JoystickProps,
  PeriodChartProps,
  ProgressBarProps,
  SelectProps,
  SliderProps,
  SwitchProps,
  TableProps,
  TabsProps,
  TextFieldProps,
  VideoViewerProps,
  WidgetProps,
  WidgetWiFiProps,
  WidgetDeviceInfoProps,
  WidgetLoRaProps,
  WidgetFileSystemProps,
  WidgetStackInfoProps,
  WidgetRGBStripProps,
  WidgetPFDProps,
  WidgetMapProps,
}

/* Панель свойств по типу: <Panel component={c} onPropertyChange={...} /> вместо ветвления по типам */
export const PANELS: Record<UIType, Component<any>> = {
  Accordion: AccordionProps,
  Button: ButtonProps,
  Divider: DividerProps,
  FileAttach: FileAttachProps,
  Graph: GraphProps,
  Input: InputProps,
  Joystick: JoystickProps,
  PeriodChart: PeriodChartProps,
  ProgressBar: ProgressBarProps,
  Select: SelectProps,
  Slider: SliderProps,
  Switch: SwitchProps,
  Table: TableProps,
  Tabs: TabsProps,
  TextField: TextFieldProps,
  VideoViewer: VideoViewerProps,
  Widget: WidgetProps,
  WidgetWiFi: WidgetWiFiProps,
  WidgetDeviceInfo: WidgetDeviceInfoProps,
  WidgetLoRa: WidgetLoRaProps,
  WidgetFileSystem: WidgetFileSystemProps,
  WidgetStackInfo: WidgetStackInfoProps,
  WidgetRGBStrip: WidgetRGBStripProps,
  WidgetPFD: WidgetPFDProps,
  WidgetMap: WidgetMapProps,
}
export { default as TextsEditor } from "./TextsEditor.svelte"
