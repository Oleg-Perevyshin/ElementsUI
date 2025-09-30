// $lib/ElementsUI/types.ts
import type { Component, Snippet } from 'svelte'
import type { Writable } from 'svelte/store'

/* Интерфейс полного компонента */
export interface UIComponent {
  id: string
  type: 'Button' | 'Accordion' | 'Input' | 'Select' | 'Switch' | 'ColorPicker' | 'Slider' | 'TextField' | 'ProgressBar' | 'Graph' | 'Table'
  component:
    | Component<IButtonProps>
    | Component<IInputProps>
    | Component<ISelectProps>
    | Component<ISwitchProps>
    | Component<IColorPickerProps>
    | Component<ISliderProps>
    | Component<ITextFieldProps>
    | Component<IProgressBarProps>
    | Component<IGraphProps>
    | Component<ITableProps<object>>
    | null
  properties:
    | IAccordionProps
    | IButtonProps
    | IInputProps
    | ISelectProps
    | ISwitchProps
    | IColorPickerProps
    | ISliderProps
    | ITextFieldProps
    | IProgressBarProps
    | IGraphProps
    | ITableProps<object>
  position: Position
  parentId: string
}

/* Координаты и размер компонента */
export interface Position {
  row: number
  col: number
  width: number
  height: number
}

/* Интерфейс обработчика для UI компонента */
export interface IUIComponentHandler {
  Header?: string
  Argument?: string
  Value?: string
  Variables?: string[]
}

/* ********************************************************** */
/* Интерфейс кнопки */
export interface IButtonProps {
  id?: { value?: string; name?: string }
  wrapperClass?: string
  label?: { name?: string; class?: string }
  componentClass?: string
  name?: string
  icon?: {
    component?: ConstructorOfATypedSvelteComponent | null
    properties?: Record<string, unknown>
  }
  info?: string
  keyBind?: {
    key?: string
    ctrlKey?: boolean
    shiftKey?: boolean
    altKey?: boolean
    metaKey?: boolean /* Поддержка Meta (Cmd на Mac) */
  }
  disabled?: boolean
  eventHandler?: IUIComponentHandler
  onClick?: () => void
}

/* ********************************************************** */
/* Интерфейс аккордиона */
export interface IAccordionProps {
  id?: { value?: string; name?: string }
  label?: { name?: string; class?: string }
  isOpen: boolean
  componentClass?: string
  type?: 'main' | 'sub'
  components?: UIComponent[]
  image?: string
  children?: Snippet
}

/* ********************************************************** */
/* Интерфейс поля ввода */
export interface IInputProps {
  id?: { value?: string; name?: string }
  wrapperClass?: string
  label?: { name?: string; class?: string }
  disabled?: boolean
  readonly?: boolean
  value?: string | number
  type?: 'text' | 'password' | 'number' | 'text-area'
  autocomplete?:
    | 'on'
    | 'off'
    | 'given-name'
    | 'family-name'
    | 'name'
    | 'email'
    | 'username'
    | 'new-password'
    | 'current-password'
    | 'tel'
    | 'country-name'
    | 'address-level1'
    | 'address-level2'
    | 'street-address'
    | 'postal-code'
    | null
  componentClass?: string
  maxlength?: number
  number?: { minNum?: number; maxNum?: number; step?: number }
  textareaRows?: number
  regExp?: string | RegExp
  help?: { placeholder?: string; info?: string }
  copyButton?: boolean
  eventHandler?: IUIComponentHandler
  onUpdate?: (value: string | number) => void
}

/* ********************************************************** */
/* Интерфейс элемента выбора и его опций */
export interface ISelectProps<T = unknown> {
  id?: { value?: string; name?: string }
  wrapperClass?: string
  disabled?: boolean
  label?: { name?: string; class?: string }
  type?: 'select' | 'buttons' | 'input'
  value?: ISelectOption<T> | null
  options?: ISelectOption<T>[]
  eventHandler?: IUIComponentHandler
  onUpdate?: (value: ISelectOption<T>) => void
}
export interface ISelectOption<T = unknown> {
  id: string
  value?: T
  name?: string
  class?: string
  icon?: {
    component?: ConstructorOfATypedSvelteComponent | null
    properties?: Record<string, unknown>
  }
  disabled?: boolean
}

/* ********************************************************** */
/* Интерфейс переключателя */
export interface ISwitchProps {
  id?: { value?: string; name?: string }
  wrapperClass?: string
  disabled?: boolean
  label?: {
    name?: string
    captionLeft?: string
    captionRight?: string
    class?: string
  }
  height?: string
  value?: number
  eventHandler?: IUIComponentHandler
  onChange?: (value: number) => void
}

/* ********************************************************** */
export interface IColorPickerProps {
  id?: { name?: string; value?: string }
  wrapperClass?: string
  label?: { name?: string; class?: string }
  value?: number[]
  eventHandler?: IUIComponentHandler
  onChange?: (value: number[]) => void
}

/* ********************************************************** */
export interface ISliderProps {
  id?: { name?: string; value?: string }
  wrapperClass?: string
  label?: { name?: string; class?: string }
  value?: number | [number, number]
  type?: 'single' | 'range'
  number?: { minNum: number; maxNum: number; step: number }
  disabled?: boolean
  eventHandler?: IUIComponentHandler
  onUpdate?: (value: number | [number, number]) => void
}
/* ********************************************************** */
export interface ITextFieldProps {
  id?: { name?: string; value?: string }
  wrapperClass?: string
  label?: { name?: string; class?: string }
  type?: 'small' | 'medium' | 'xlarge'
  bold?: boolean
  italic?: boolean
}
/* ********************************************************** */
export interface IProgressBarProps {
  id?: { name?: string; value?: string }
  label?: { name?: string; class?: string }
  value?: boolean | string | number | number[] | object | null
  range?: {
    min?: number
    max?: number
    units?: string
  }
  wrapperClass?: string
}
/* ********************************************************** */
export interface IGraphDataObject {
  name: string
  value: number
  timeshamp?: Date
  color?: string
}
export interface IGraphProps {
  id?: { value: string; name?: string }
  wrapperClass?: string
  label?: { name?: string; class?: string }
  streamingData?: { data: IGraphDataObject[] | string | null; timestamp?: number }
  isTest?: boolean
}
/* ********************************************************** */

export interface ITableHeader<T extends object> {
  wrapperClass?: string
  label?: string
  key: keyof T
  width?: string
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
  cellClass?: string
  overflow?: {
    truncated?: boolean
    formatting?: (text: string) => string
    copy?: boolean
    modal?: boolean
  }
  buttons?: {
    name: string | ((row: T) => string)
    class?: string | ((row: T) => string)
    eventHandler?: IUIComponentHandler
    onClick?: (row: T) => void
  }[]
  image?: {
    src: string | ((row: T) => string)
    alt?: string
    class?: string
    width?: number | string
    height?: number | string
    defaultIcon?: ConstructorOfATypedSvelteComponent
  }
}

export interface ITableProps<T extends object> {
  id?: { value?: string; name?: string }
  wrapperClass?: string
  label?: { name?: string; class?: string }
  tableHeader: ITableHeader<T>[]
  tableBody: T[]
  showInfo?: boolean
  cursor?: string | null
  loader?: Writable<boolean>
  getData?: () => void
      modalData?: { isOpen?: boolean; rawData?: string; formattedData?: string }
  onClick?: (eventHandler: IUIComponentHandler) => void

}
