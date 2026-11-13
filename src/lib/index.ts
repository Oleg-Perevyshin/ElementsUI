/* Реэкспорт всех UI компонентов для удобного импорта */
export { default as Accordion } from "./Accordion/Accordion.svelte"
export { default as ExpandIcon } from "./ExpandIcon.svelte"
export { default as SectionHead } from "./SectionHead.svelte"
export { default as FieldLabel } from "./FieldLabel.svelte"
export { default as InfoHint } from "./InfoHint.svelte"
export { default as Button } from "./Button/Button.svelte"
export { default as Carousel } from "./Carousel/Carousel.svelte"
export { default as Divider } from "./Divider/Divider.svelte"
export { default as Dropdown } from "./Dropdown/Dropdown.svelte"
export { default as Loader } from "./Loader/Loader.svelte"
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
export { accentStyle, ACCENT_COLORS, type AccentColor } from "./accent"
export { default as GUIRenderer } from "./GUIRenderer/GUIRenderer.svelte"
export { COMPONENTS, componentVariables, type ComponentEntry, type ComponentIO } from "./registry"
export {
  GUI_GRID,
  isWidgetType,
  spanRows,
  WIDGET_FIELDS,
  WIDGET_SAVE_FIELDS,
  widgetKey,
  widgetPrefixes,
  readWidgetFields,
  widgetPacket,
  bitRange,
  readBits,
  writeBits,
  commandPacket,
  tablePacket,
  mergeDevicePayload,
  type WidgetFieldsType,
  type DeviceLink,
  type DevicePacket,
} from "./gui"
export {
  createFsTransfer,
  sendCommand,
  argumentCode,
  FsTransferError,
  FsNameError,
  type FsErrorCode,
  type DeviceReply,
  type DeviceTransport,
  type FsTransfer,
  type FsTransferOptions,
  type FsProgress,
} from "./fsTransfer"
export { copyText } from "./clipboard"
export { default as Icon } from "./Icon.svelte"
/* Значки библиотеки: контур currentColor, размер задаёт родитель ([&_svg]:size-*) */
export { default as IconArrow } from "./libIcons/ArrowIcon.svelte"
export { default as IconCross } from "./libIcons/CrossIcon.svelte"
export { default as IconClear } from "./libIcons/ButtonClear.svelte"
export { default as IconDelete } from "./libIcons/ButtonDelete.svelte"
export { default as IconAdd } from "./libIcons/ButtonAdd.svelte"
export { default as IconDownload } from "./libIcons/ButtonDownload.svelte"
export { default as IconCopy } from "./libIcons/CopyIcon.svelte"
export { default as IconMore } from "./libIcons/MoreIcon.svelte"
export { default as IconInfo } from "./libIcons/InfoIcon.svelte"
export { default as IconError } from "./libIcons/Error.svelte"
export { default as IconLibrary } from "./libIcons/Library.svelte"
export { default as IconMoveVertical } from "./libIcons/MoveVerticalIcon.svelte"
export { default as IconGripVerticalDual } from "./libIcons/IconGripVerticalDual.svelte"
export { default as IconGripVerticalLeft } from "./libIcons/IconGripVerticalLeft.svelte"
export { default as IconGripVerticalRight } from "./libIcons/IconGripVerticalRight.svelte"
export { escapeHtml, htmlToText, sanitizeHtml } from "./html"
export { hintsSetting, hint, type HintParams } from "./hints"
export { applyDragGhost, clearDragGhost, createDropPlaceholder } from "./dragStyle"

export {
  type UIComponent,
  type UIComponentPropsMap,
  type UIType,
  type Position,
  type IUIComponentHandler,
  type IButtonProps,
  type IAccordionProps,
  type IInputProps,
  type ISelectProps,
  type IOption,
  type SelectValue,
  type IconSource,
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
  type ITableMenu,
  type ITableProgressBar,
  type ITableImage,
  type ITableContent,
  type ITableProps,
  type ITabsProps,
  type IJoystickProps,
  type IFileAttachProps,
  type FileAttachValue,
  type IDropdownProps,
  type IDropdownItem,
  type IDropdownTriggerProps,
  type ICarouselProps,
  type IReceivingDataObject,
  type IVideoViewerProps,
  type IPeriodChartProps,
  type IPeriodChartLevel,
} from "./types"
export { ICONS, ICON_NAMES, ICONS_ARRAY } from "./icons"
