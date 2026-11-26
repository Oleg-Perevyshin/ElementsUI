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
export { default as Splitter } from "./Splitter/Splitter.svelte"
export { default as Switch } from "./Switch/Switch.svelte"
export { default as Table } from "./Table/Table.svelte"
export { tableMonoWidth } from "./Table/columnWidth"
export { default as TableColumns } from "./Table/TableColumns.svelte"
export { columnId, defaultHiddenColumns } from "./Table/columns"
export { simpleSerialTableColumns, type SimpleSerialRow } from "./Table/simpleSerialColumns"
export { xPoeDebugTableColumns, xPoeDebugTableHelp } from "./Table/xPoeDebugColumns"
export { bitFieldGet, bitFieldSet } from "./bitField"
export { default as Tabs } from "./Tabs/Tabs.svelte"
export { default as TextField } from "./TextField/TextField.svelte"
export { default as VideoViewer } from "./VideoViewer/VideoViewer.svelte"
export { default as Widget } from "./Widget/Widget.svelte"
export { default as WidgetWiFi } from "./WidgetWiFi/WidgetWiFi.svelte"
export { default as WidgetDeviceInfo } from "./WidgetDeviceInfo/WidgetDeviceInfo.svelte"
export { default as WidgetLoRa } from "./WidgetLoRa/WidgetLoRa.svelte"
export { LORA_PARAMS, LORA_PRESETS, loraDecode, loraEncode, loraKeys } from "./WidgetLoRa/lora"
export { default as WidgetFileSystem } from "./WidgetFileSystem/WidgetFileSystem.svelte"
export { default as WidgetStackInfo } from "./WidgetStackInfo/WidgetStackInfo.svelte"
export { default as WidgetFirmware } from "./WidgetFirmware/WidgetFirmware.svelte"
export { updateViaHub, type FirmwareTarget, type HubUpdateOptions } from "./WidgetFirmware/firmware"
export { default as WidgetRGBStrip } from "./WidgetRGBStrip/WidgetRGBStrip.svelte"
export { default as WidgetPFD } from "./WidgetPFD/WidgetPFD.svelte"
export { default as WidgetMap } from "./WidgetMap/WidgetMap.svelte"
export { default as WidgetAHRS } from "./WidgetAHRS/WidgetAHRS.svelte"
export { default as WidgetIMU } from "./WidgetIMU/WidgetIMU.svelte"
export { default as WidgetMag } from "./WidgetMag/WidgetMag.svelte"
export { default as WidgetEncoder } from "./WidgetEncoder/WidgetEncoder.svelte"
export { default as WidgetHoming } from "./WidgetHoming/WidgetHoming.svelte"
export { default as WidgetFOC } from "./WidgetFOC/WidgetFOC.svelte"
export { AHRS_ALGORITHMS, AHRS_PARAM_RANGES, ahrsAlgorithm } from "./WidgetAHRS/ahrs"
export { DEFAULT_MISSION_PLAN, type IMissionPlan, type IMissionField } from "./WidgetMap/mission/plan"
export { DEFAULT_ROUTE_PLAN, type IRoutePlan, type IRouteWaypoint } from "./WidgetMap/mission/route"
export { type LngLat, type SprayControl } from "./WidgetMap/mission/coverage"
export { configureMapLibre, type MapLibreSource } from "./WidgetMap/mapWrapper/utils"

export * from "./locales/i18n"
export * from "./locales/languages"
export { localizeDeep, type LocalizedText } from "./locales/localize"
export { accentStyle, ACCENT_COLORS, type AccentColor } from "./accent"
export { default as GUIRenderer } from "./GUIRenderer/GUIRenderer.svelte"
export { default as Toasts } from "./Toasts/Toasts.svelte"
export { addToast, removeToast, toasts, TOAST_LIFETIME_MS, type IToast } from "./Toasts/toasts"
export { createBusBridge, busIdFromSN, type BusBridge, type BusBridgeOptions, type BusChannel, type BusModule, type BusPacket } from "./busBridge"
export { GUI_VIEWS, type GuiViews } from "./guiViews"
export { COMPONENTS, type ComponentEntry } from "./registry"
export { COMPONENT_META, componentVariables, type ComponentMeta, type ComponentIO } from "./componentMeta"
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
  toGuiFile,
  guiMetadataError,
  DEVICE_INFO_COMMON_FIELDS,
  type GuiFile,
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
  type DeviceRequest,
  type DeviceAnswer,
  type DevicePayload,
  type FsTransfer,
  type FsTransferOptions,
  type FsProgress,
} from "./fsTransfer"
export {
  updateModuleFirmware,
  FirmwareUpdateError,
  type FirmwareErrorCode,
  type FirmwareStage,
  type FirmwareProgress,
  type FirmwareUpdateOptions,
} from "./firmwareUpdate"
export { copyText } from "./clipboard"
export { default as Icon } from "./Icon.svelte"
/* Значки библиотеки: контур currentColor, размер задаёт родитель ([&_svg]:size-*) */
export { default as IconArrow } from "./libIcons/ArrowIcon.svelte"
export { default as IconCross } from "./libIcons/CrossIcon.svelte"
export { default as IconClear } from "./libIcons/ButtonClear.svelte"
export { default as IconDelete } from "./libIcons/ButtonDelete.svelte"
export { default as IconAdd } from "./libIcons/ButtonAdd.svelte"
export { default as IconDownload } from "./libIcons/ButtonDownload.svelte"
export { default as IconCloudDownload } from "./libIcons/CloudDownloadIcon.svelte"
export { default as IconCloudUpload } from "./libIcons/CloudUploadIcon.svelte"
export { default as IconCopy } from "./libIcons/CopyIcon.svelte"
export { default as IconColumns } from "./libIcons/ColumnsIcon.svelte"
export { default as IconMore } from "./libIcons/MoreIcon.svelte"
export { default as IconInfo } from "./libIcons/InfoIcon.svelte"
export { default as IconError } from "./libIcons/Error.svelte"
export { default as IconLibrary } from "./libIcons/Library.svelte"
export { default as IconMoveVertical } from "./libIcons/MoveVerticalIcon.svelte"
export { default as IconCommandList } from "./libIcons/CommandListIcon.svelte"
export { default as IconRestart } from "./libIcons/RestartIcon.svelte"
export { default as IconTheme } from "./libIcons/ThemeIcon.svelte"
export { default as IconEye } from "./libIcons/EyeIcon.svelte"
export { default as IconEyeSlash } from "./libIcons/EyeSlashIcon.svelte"
export { default as IconPlug } from "./libIcons/PlugIcon.svelte"
export { default as IconUnplug } from "./libIcons/UnplugIcon.svelte"
export { default as IconSend } from "./libIcons/SendIcon.svelte"
export { default as IconGraph } from "./libIcons/GraphIcon.svelte"
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
  type IWidgetLoRaProps,
  type LoRaParams,
  type ILoRaParamConfig,
  type IWidgetFileSystemProps,
  type IWidgetFileSystemInfo,
  type IWidgetFileSystemFile,
  type IWidgetFileSystemUpload,
  type IWidgetStackInfoProps,
  type IWidgetFirmwareProps,
  type WidgetFirmwareStage,
  type WidgetFirmwareSource,
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
  type IWidgetAHRSProps,
  type IWidgetAHRSData,
  type IWidgetIMUProps,
  type IWidgetIMUData,
  type IWidgetMagProps,
  type IWidgetMagData,
  type IWidgetEncoderProps,
  type IWidgetEncoderData,
  type IWidgetHomingProps,
  type IWidgetHomingData,
  type IWidgetFOCProps,
  type IWidgetFOCData,
  type AHRSParam,
  type IAHRSAlgorithm,
  type IGraphProps,
  type IGraphDataObject,
  type IGraphHistoryPoint,
  type IGraphHistorySeries,
  type IGraphSettings,
  type IChartScale,
  type ITableHeader,
  type ITableText,
  type ITableSelect,
  type ITableButton,
  type ITableMenu,
  type ITableProgressBar,
  type ITableImage,
  type ITableContent,
  type ITableProps,
  type ITableGroupBy,
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
