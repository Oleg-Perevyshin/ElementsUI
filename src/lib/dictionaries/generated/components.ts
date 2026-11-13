/* $lib/dictionaries/generated/components.ts - СГЕНЕРИРОВАНО из components.yaml (npm run Dictionary), руками не править */

export const COMPONENT_TYPES = ["Accordion", "Tabs", "TextField", "Divider", "Button", "FileAttach", "Input", "Select", "Switch", "Slider", "Joystick", "Widget", "ProgressBar", "Graph", "PeriodChart", "Table", "VideoViewer", "WidgetWiFi", "WidgetDeviceInfo", "WidgetFileSystem", "WidgetStackInfo", "WidgetRGBStrip", "WidgetPFD", "WidgetMap"] as const

export const COMPONENT_IO = {
  Accordion: "none",
  Tabs: "none",
  TextField: "none",
  Divider: "none",
  Button: "write",
  FileAttach: "write",
  Input: "readWrite",
  Select: "readWrite",
  Switch: "readWrite",
  Slider: "readWrite",
  Joystick: "readWrite",
  Widget: "readWrite",
  ProgressBar: "read",
  Graph: "read",
  PeriodChart: "read",
  Table: "read",
  VideoViewer: "none",
  WidgetWiFi: "widget",
  WidgetDeviceInfo: "widget",
  WidgetFileSystem: "widget",
  WidgetStackInfo: "widget",
  WidgetRGBStrip: "widget",
  WidgetPFD: "widget",
  WidgetMap: "widget",
} as const
