/* Реэкспорт всех UI компонентов для удобного импорта */
export { default as Accordion } from "./Accordion/Accordion.svelte"
export { default as Button } from "./Button/Button.svelte"
export { default as Carousel } from "./Carousel/Carousel.svelte"
export { default as Divider } from "./Divider/Divider.svelte"
export { default as Dragging } from "./Dragging.svelte"
export { default as FileAttach } from "./FileAttach/FileAttach.svelte"
export { default as Graph } from "./Graph/Graph.svelte"
export { default as Input } from "./Input/Input.svelte"
export { default as Joystick } from "./Joystick/Joystick.svelte"
export { default as Modal } from "./Modal.svelte"
export { default as PeriodChart } from "./PeriodChart/PeriodChart.svelte"
export { default as ProgressBar } from "./ProgressBar/ProgressBar.svelte"
export { default as Select } from "./Select/Select.svelte"
export { default as Slider } from "./Slider/Slider.svelte"
export { default as Switch } from "./Switch/Switch.svelte"
export { default as Table } from "./Table/Table.svelte"
export { tableMonoWidth } from "./Table/columnWidth"
export { xPoeDebugTableColumns } from "./Table/xPoeDebugColumns"
export { bitFieldGet, bitFieldSet } from "./bitField"
export { default as Tabs } from "./Tabs/Tabs.svelte"
export { default as TextField } from "./TextField/TextField.svelte"
export { default as VideoViewer } from "./VideoViewer/VideoViewer.svelte"
export { default as Widget } from "./Widget/Widget.svelte"
export { default as WidgetWiFi } from "./WidgetWiFi/WidgetWiFi.svelte"
export { default as WidgetDeviceInfo } from "./WidgetDeviceInfo/WidgetDeviceInfo.svelte"
export { default as WidgetFileSystem } from "./WidgetFileSystem/WidgetFileSystem.svelte"
export { default as WidgetStackInfo } from "./WidgetStackInfo/WidgetStackInfo.svelte"
export { default as WidgetRGBStrip } from "./WidgetRGBStrip/WidgetRGBStrip.svelte"
export { default as WidgetPFD } from "./WidgetPFD/WidgetPFD.svelte"
export { default as WidgetMap } from "./WidgetMap/WidgetMap.svelte"
export { DEFAULT_MISSION_PLAN, type IMissionPlan, type IMissionField } from "./WidgetMap/mission/plan"
export { DEFAULT_ROUTE_PLAN, type IRoutePlan, type IRouteWaypoint } from "./WidgetMap/mission/route"
export { type LngLat, type SprayControl } from "./WidgetMap/mission/coverage"
export { configureMapLibre, type MapLibreSource } from "./WidgetMap/mapWrapper/utils"

export * from "./locales/i18n"
export * from "./locales/languages"
export { localizeDeep, type LocalizedText } from "./locales/localize"
export { widgetAccentStyle } from "./widgetAccent"
export { escapeHtml, htmlToText, sanitizeHtml } from "./html"
export { hintsSetting, hint, type HintParams } from "./hints"
export { applyDragGhost, clearDragGhost, createDropPlaceholder } from "./dragStyle"

export {
  type UIComponent,
  type Position,
  type IUIComponentHandler,
  type IButtonProps,
  type IAccordionProps,
  type IInputProps,
  type ISelectProps,
  type IOption,
  type ISwitchProps,
  type IDividerProps,
  type ISliderProps,
  type ITextFieldProps,
  type IProgressBarProps,
  type IWidgetProps,
  type IWidgetWiFiProps,
  type IWidgetWiFiConfig,
  type IWidgetDeviceInfoProps,
  type IWidgetDeviceInfoConfig,
  type IWidgetFileSystemProps,
  type IWidgetFileSystemInfo,
  type IWidgetFileSystemFile,
  type IWidgetFileSystemUpload,
  type IWidgetStackInfoProps,
  type IWidgetStackInfo,
  type IWidgetStackInfoHeap,
  type IWidgetStackInfoTask,
  type IWidgetRGBStripProps,
  type IWidgetRGBStripConfig,
  type IWidgetPFDProps,
  type IWidgetPFDData,
  type IWidgetPFDLimits,
  type IWidgetMapProps,
  type IWidgetMapData,
  type IGraphProps,
  type IGraphDataObject,
  type IGraphHistoryPoint,
  type IGraphHistorySeries,
  type ITableHeader,
  type ITableText,
  type ITableSelect,
  type ITableButton,
  type ITableProgressBar,
  type ITableImage,
  type ITableContent,
  type ITableProps,
  type ITabsProps,
  type IJoystickProps,
  type IFileAttachProps,
  type ICarouselProps,
  type IReceivingDataObject,
  type IVideoViewerProps,
  type IPeriodChartProps,
  type IPeriodChartLevel,
} from "./types"
export { ICONS, ICON_NAMES, ICONS_ARRAY } from "./icons"
