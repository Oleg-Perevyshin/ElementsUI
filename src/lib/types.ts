// $lib/ElementsUI/types.ts
import type { Snippet } from "svelte"
import type { Writable } from "svelte/store"

export const updateProperty = (
  path: string,
  value: string | number | boolean | object | string[],
  component: UIComponent & { properties: Partial<UIComponent["properties"]> },
  onPropertyChange: (updates: Partial<{ properties?: string | object; name?: string; access?: string; eventHandler?: IUIComponentHandler }>) => void,
) => {
  const newProperties = JSON.parse(JSON.stringify(component.properties))
  const parts = path.split(".")
  let obj = newProperties
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]
    if (!obj[part]) obj[part] = {}
    obj = obj[part]
  }
  obj[parts[parts.length - 1]] = value
  onPropertyChange({ properties: newProperties })
}

export const updateComponent = (
  component: UIComponent,
  updates: Partial<{
    name: string
    access: "full" | "viewOnly" | "hidden"
    properties: Partial<UIComponent["properties"]>
    eventHandler: IUIComponentHandler
  }>,
) => {
  return {
    ...component,
    access: updates.access ?? component.access,
    name: updates.name ?? component.name,
    properties: updates.properties ? { ...component.properties, ...updates.properties } : component.properties,
    eventHandler: updates.eventHandler ? { ...component.eventHandler, ...updates.eventHandler } : component.eventHandler,
  }
}

/* Интерфейс полного компонента */
export interface UIComponent {
  id: string
  name?: string
  access?: "full" | "viewOnly" | "hidden"
  type:
    | "Accordion"
    | "Button"
    | "ColorPicker"
    | "FileAttach"
    | "Graph"
    | "Input"
    | "Joystick"
    | "Map"
    | "ProgressBar"
    | "Select"
    | "Slider"
    | "Switch"
    | "Table"
    | "Tabs"
    | "TextField"
    | "Widget"

  properties:
    | IAccordionProps
    | IButtonProps
    | IColorPickerProps
    | IFileAttachProps
    | IGraphProps
    | IInputProps
    | IJoystickProps
    | IMapProps
    | IProgressBarProps
    | ISelectProps
    | ISliderProps
    | ISwitchProps
    | ITableProps<object>
    | ITabsProps
    | ITextFieldProps
    | IWidgetProps

  position: Required<Position>
  parentId: string
  eventHandler?: IUIComponentHandler
}

/* Координаты и размер компонента */
export interface Position {
  row?: number
  col?: number
  width?: number
  height?: number
}

/* Интерфейс обработчика для UI компонента */
export interface IUIComponentHandler {
  Header?: string
  Argument?: string
  Value?: string
  Variables?: string[]
}

/* Интерфейс обработчика для UI компонента */
export interface IReceivingDataObject {
  Name?: string
  Timestamp?: string
  Value?: number | string | boolean
  Info?: string
}

/* ********************************************************** */
/* Интерфейс аккордиона */
export interface IAccordionProps {
  id?: string
  isOpen?: boolean
  wrapperClass?: string
  size?: {
    height?: number
    width?: number
  }
  label?: {
    name?: string
    class?: string
    icon?: ConstructorOfATypedSvelteComponent | string | null
  }
  children?: Snippet
  image?: string
}

/* ********************************************************** */
/* Интерфейс кнопки */
export interface IButtonProps {
  id?: string
  wrapperClass?: string
  componentClass?: string
  disabled?: boolean
  content?: {
    name?: string
    info?: { text: string; side: "top" | "bottom" | "left" | "right" }
    icon?: ConstructorOfATypedSvelteComponent | string | null
  }
  keyBind?: {
    showHint?: boolean
    key?: string
    ctrlKey?: boolean
    shiftKey?: boolean
    altKey?: boolean
    metaKey?: boolean /* Поддержка Meta (Cmd на Mac) */
  }
  onClick?: () => void
}

/* ********************************************************** */
/* Интерфейс карусели */
export interface ICarouselProps {
  id?: string
  wrapperClass?: string
  label?: { name?: string; class?: string }
  scrollValue?: number
  children?: Snippet
}

/* ********************************************************** */
/* Интерфейс палитры */
export interface IColorPickerProps {
  id?: string
  wrapperClass?: string
  label?: { name?: string; class?: string }
  value?: number[]
  readonly?: boolean
  onChange?: (value: number[]) => void
}

/* ********************************************************** */
/* Интерфейс прикрепления файлов */
export interface IFileAttachProps {
  id?: string
  wrapperClass?: string
  label?: { name?: string; class?: string }
  type?: "file" | "image"
  accept?: string
  imageSize?: { height?: string; width?: string; fitMode?: "cover" | "contain"; form?: "square" | "circle" }
  disabled?: boolean
  currentImage?: string | null
  onChange?: (event: Event, file: File | null) => void
}

/* ********************************************************** */
/* Интерфейсы графика */
export interface IGraphDataObject {
  name: string
  value: number
  timestamp?: Date
}
export interface IGraphProps {
  id?: string
  wrapperClass?: string
  label?: { name?: string; class?: string }
  streamingData?: { data: IGraphDataObject[] | null; timestamp?: number }
  isTest?: boolean
}

/* ********************************************************** */
/* Интерфейс поля ввода */
export interface IInputProps {
  id?: string
  type?: "text" | "password" | "number" | "text-area"
  wrapperClass?: string
  label?: { name?: string; class?: string }
  componentClass?: string
  disabled?: boolean
  readonly?: boolean
  value?: string | number
  bitMode?: boolean
  range?: { start: number; end: number }
  maxlength?: number
  textareaRows?: number
  placeholder?: string
  isValid?: boolean
  number?: { minNum?: number; maxNum?: number; step?: number }
  help?: {
    info?: string
    copyButton?: boolean
    regExp?: string | RegExp
    autocomplete?:
      | "on"
      | "off"
      | "given-name"
      | "family-name"
      | "nickname"
      | "username"
      | "new-password"
      | "current-password"
      | "organization-title"
      | "country-name"
      | "address-level1"
      | "address-level2"
      | "street-address"
      | "postal-code"
      | "email"
      | "tel"
      | null
  }
  onUpdate?: (value: string | number) => void
}

/* ********************************************************** */
/* Интерфейс джойстика */
export interface IJoystickProps {
  id?: string
  wrapperClass?: string
  label?: { name?: string; class?: string }
  value?: number[]
  readonly?: boolean
  axes?: { name: string; minNum?: number; maxNum?: number }[]
  buttonIcon?: ConstructorOfATypedSvelteComponent | string
  onUpdate?: (value: number[]) => void
}

/* ********************************************************** */
/* Интерфейс карты */
export interface IDeviceGNSS {
  NavLat: number
  NavLon: number
  NavAlt: number
  DevName: string
  DevSN: string
  NavHeading: number
  NavSatUse: number
}
export interface IMapProps {
  id?: string
  wrapperClass?: string
  label?: { name?: string; class?: string }
  data: IDeviceGNSS | null
  markerIcon?: ConstructorOfATypedSvelteComponent | string
}

/* ********************************************************** */
/* Интерфейс индикатора прогресса */
export interface IProgressBarProps {
  id?: string
  items?: { name?: string; class?: string }[] | null
  value?: IReceivingDataObject[]
  number?: {
    minNum?: number
    maxNum?: number
    units?: string
  }
  type?: "horizontal" | "vertical"
  wrapperClass?: string
}

/* ********************************************************** */
/* Интерфейс элемента выбора и его опций */
export interface ISelectProps<T = unknown> {
  id?: string
  wrapperClass?: string
  disabled?: boolean
  label?: { name?: string; class?: string }
  type?: "select" | "buttons" | "input"
  multiSelect?: boolean
  value?: IOption<T> | IOption<T>[] | null
  options?: IOption<T>[]
  bitMode?: boolean
  range?: { start: number; end: number }
  onUpdate?: (value: IOption<T> | IOption<T>[]) => void
}

export interface IOption<T = unknown> {
  id: string
  value?: T
  name?: string
  class?: string
  disabled?: boolean
}

/* ********************************************************** */
/* Интерфейс ползунка */
export interface ISliderProps {
  id?: string
  wrapperClass?: string
  label?: { name?: string; class?: string }
  value?: number | [number, number]
  type?: "single" | "range"
  number?: { minNum: number; maxNum: number; step: number }
  disabled?: boolean
  onUpdate?: (value: number | [number, number]) => void
}

/* ********************************************************** */
/* Интерфейс переключателя */
export interface ISwitchProps {
  id?: string
  height?: string
  wrapperClass?: string
  disabled?: boolean
  label?: {
    name?: string
    class?: string
    captionLeft?: string
    captionRight?: string
  }
  hiddenInfo?: string
  options?: IOption<number>[]
  bitMode?: boolean
  type?: "horizontal" | "vertical" | "checkbox"
  value?: number
  onChange?: (value: number) => void
}

/* ********************************************************** */
/* Интерфейсы таблицы */

export interface ITableText<T extends object> {
  key: keyof T
  sortable?: boolean
  truncated?: boolean
  tooltip?: boolean
  formatting?: (text: string) => string
  copy?: boolean
  modal?: boolean
}
export interface ITableSelect<T extends object> {
  key: keyof T
  keyCol: string
  onChange?: () => void
}
export interface ITableButtons<T extends object> {
  name?: string | ((row: T) => string)
  icon?: ConstructorOfATypedSvelteComponent | string
  class?: string | ((row: T) => string)
  eventHandler?: IUIComponentHandler
  onClick?: (row: T) => void
}
export interface ITableProgressBar<T extends object> {
  key: keyof T
  minNum?: number
  maxNum?: number
  units?: string
}
export interface ITableImage<T extends object> {
  src?: string | ((row: T) => string)
  alt?: string
  class?: string
  width?: string
  height?: string
  defaultIcon?: ConstructorOfATypedSvelteComponent | string
}

export interface ITableHeader<T extends object> {
  label?: { name?: string; class?: string }
  width?: string
  align?: "left" | "center" | "right"
  disableSelect?: boolean
  content?: (
    | { type: "text"; data: ITableText<T> }
    | { type: "select"; data: ITableSelect<T> }
    | { type: "button"; data: ITableButtons<T> | ((row: T) => ITableButtons<T>) }
    | { type: "progressBar"; data: ITableProgressBar<T> }
    | { type: "image"; data: ITableImage<T> }
  )[]
}

export interface ITableProps<T extends object> {
  id?: string
  wrapperClass?: string
  label?: { name?: string; class?: string }
  header?: ITableHeader<T>[]
  body: T[] | T | null
  footer?: string
  dataBuffer?: { stashData?: boolean; bufferSize?: number; visibleRows?: number; clearButton?: boolean; clearClass?: string; logger?: boolean }
  outline?: boolean
  cursor?: string | null
  loader?: Writable<boolean>
  autoscroll?: boolean
  getData?: () => void
  onClick?: (eventHandler: IUIComponentHandler) => void
}

/* ********************************************************** */
/* Интерфейс меню */
export interface ITabsProps {
  id?: string
  wrapperClass?: string
  size?: {
    height?: number
    width?: number
  }
  activeTab?: number
  items: { name?: string; icon?: ConstructorOfATypedSvelteComponent | string; class?: string; children?: Snippet; onClick?: () => {}; disabled?: boolean }[]
  children?: Snippet<[any]>
  apiArray?: UIComponent[]
  Components?: Snippet<[component: UIComponent, fixedHeight: boolean]>
}

/* ********************************************************** */
/* Интерфейс текста */
export interface ITextFieldProps {
  id?: string
  wrapperClass?: string
  background?: boolean
  content?: {
    name?: string
    class?: string
    size?: "small" | "base" | "large" | "huge" | "massive"
  }
}

/* ********************************************************** */
/* Интерфейс виджета */
export interface IWidgetProps {
  id?: string
  wrapperClass?: string
  label?: { name?: string; class?: string }
  value?: number
  readonly?: boolean
  settings?: {
    label?: string
    class?: string
    type?: "input" | "switch" | "slider"
    number?: { minNum?: number; maxNum?: number; step?: number; units?: string }
    switch?: { captionLeft?: string; captionRight?: string }
  }
  icons?: { array: string[]; cycling?: boolean; class?: string }
  onUpdate?: (value: number) => void
}
