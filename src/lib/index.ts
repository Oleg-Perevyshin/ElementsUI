/* Реэкспорт всех UI компонентов для удобного импорта */
export { default as Accordion } from "./Accordion/Accordion.svelte"
export { default as AccordionProps } from "./Accordion/AccordionProps.svelte"
export { default as Button } from "./Button/Button.svelte"
export { default as ButtonProps } from "./Button/ButtonProps.svelte"
export { default as Carousel } from "./Carousel/Carousel.svelte"
export { default as ColorPicker } from "./ColorPicker/ColorPicker.svelte"
export { default as ColorPickerProps } from "./ColorPicker/ColorPickerProps.svelte"
export { default as FileAttach } from "./FileAttach/FileAttach.svelte"
export { default as FileAttachProps } from "./FileAttach/FileAttachProps.svelte"
export { default as Graph } from "./Graph/Graph.svelte"
export { default as GraphProps } from "./Graph/GraphProps.svelte"
export { default as Input } from "./Input/Input.svelte"
export { default as InputProps } from "./Input/InputProps.svelte"
export { default as Joystick } from "./Joystick/Joystick.svelte"
export { default as JoystickProps } from "./Joystick/JoystickProps.svelte"
export { default as Modal } from "./Modal.svelte"
// export { default as Map } from "./Map/Map.svelte"
// export { default as MapProps } from "./Map/MapProps.svelte"
export { default as ProgressBar } from "./ProgressBar/ProgressBar.svelte"
export { default as ProgressBarProps } from "./ProgressBar/ProgressBarProps.svelte"
export { default as Select } from "./Select/Select.svelte"
export { default as SelectProps } from "./Select/SelectProps.svelte"
export { default as Slider } from "./Slider/Slider.svelte"
export { default as SliderProps } from "./Slider/SliderProps.svelte"
export { default as Switch } from "./Switch/Switch.svelte"
export { default as SwitchProps } from "./Switch/SwitchProps.svelte"
export { default as Table } from "./Table/Table.svelte"
export { default as TableProps } from "./Table/TableProps.svelte"
export { default as Tabs } from "./Tabs/Tabs.svelte"
export { default as TabsProps } from "./Tabs/TabsProps.svelte"
export { default as TextField } from "./TextField/TextField.svelte"
export { default as TextFieldProps } from "./TextField/TextFieldProps.svelte"

export * from "./locales/i18n"
export * from "./locales/translations"

export {
  type UIComponent,
  type Position,
  type IUIComponentHandler,
  type IButtonProps,
  type IAccordionProps,
  type IInputProps,
  type ISelectProps,
  type ISelectOption,
  type ISwitchProps,
  type IColorPickerProps,
  type ISliderProps,
  type ITextFieldProps,
  type IMapProps,
  type IProgressBarProps,
  type IGraphProps,
  type IGraphDataObject,
  type ITableHeader,
  type ITableProps,
  type ITabsProps,
  type IJoystickProps,
  type IFileAttachProps,
  type IDeviceGNSS,
  type ICarouselProps,
} from "./types"
