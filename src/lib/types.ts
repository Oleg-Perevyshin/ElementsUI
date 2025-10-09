// $lib/ElementsUI/types.ts
import type { Component, Snippet } from 'svelte'
import type { Writable } from 'svelte/store'

export const updateProperty = (
  path: string,
  value: string | number | boolean | object | string[],
  component: UIComponent & { properties: Partial<UIComponent['properties']> },
  onPropertyChange: (value: string | object) => void,
) => {
  const newProperties = JSON.parse(JSON.stringify(component.properties))
  const parts = path.split('.')
  let obj = newProperties
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]
    if (!obj[part]) obj[part] = {}
    obj = obj[part]
  }
  obj[parts[parts.length - 1]] = value
  onPropertyChange(newProperties)
}

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
  id?: string
  wrapperClass?: string
  componentClass?: string
  disabled?: boolean
  content?: {
    name?: string
    info?: string
    icon?: ConstructorOfATypedSvelteComponent | null
  }
  keyBind?: {
    key?: string
    ctrlKey?: boolean
    shiftKey?: boolean
    altKey?: boolean
    metaKey?: boolean /* Поддержка Meta (Cmd на Mac) */
  }
  eventHandler?: IUIComponentHandler
  onClick?: () => void
}

/* ********************************************************** */
/* Интерфейс аккордиона */
export interface IAccordionProps {
  id?: string
  isOpen: boolean
  outline?: boolean
  wrapperClass?: string
  size?: {
    height?: number
    width?: number
  }
  label?: {
    name?: string
    class?: string
    icon?: ConstructorOfATypedSvelteComponent | null
  }
  children?: Snippet
  image?: string
}

/* ********************************************************** */
/* Интерфейс поля ввода */
export interface IInputProps {
  id?: string
  type?: 'text' | 'password' | 'number' | 'text-area'
  wrapperClass?: string
  label?: { name?: string; class?: string }
  componentClass?: string
  disabled?: boolean
  readonly?: boolean
  value?: string | number
  maxlength?: number
  textareaRows?: number
  placeholder?: string
  number?: { minNum?: number; maxNum?: number; step?: number }
  help?: {
    info?: string
    copyButton?: boolean
    regExp?: string | RegExp
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
  }
  eventHandler?: IUIComponentHandler
  onUpdate?: (value: string | number) => void
}

/* ********************************************************** */
/* Интерфейс элемента выбора и его опций */
export interface ISelectProps<T = unknown> {
  id?: string
  wrapperClass?: string
  disabled?: boolean
  label?: { name?: string; class?: string }
  componentClass?: string
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
  disabled?: boolean
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
    captionLeft?: string
    captionRight?: string
  }
  value?: number
  eventHandler?: IUIComponentHandler
  onChange?: (value: number) => void
}

/* ********************************************************** */
export interface IColorPickerProps {
  id?: string
  wrapperClass?: string
  label?: { name?: string; class?: string }
  value?: number[]
  eventHandler?: IUIComponentHandler
  onChange?: (value: number[]) => void
}

/* ********************************************************** */
export interface ISliderProps {
  id?: string
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
  id?: string
  wrapperClass?: string
  background?: boolean
  content?: {
    name?: string
    class?: string
    size?: 'small' | 'base' | 'large' | 'huge' | 'massive'
  }
}
/* ********************************************************** */
export interface IProgressBarProps {
  id?: string
  label?: { name?: string; class?: string }
  value?: number | null
  number?: {
    minNum?: number
    maxNum?: number
    units?: string
  }
  wrapperClass?: string
}

/* ********************************************************** */
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

export interface ITableHeader<T extends object> {
  label?: { name?: string; class?: string }
  key: keyof T
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
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
  id?: string
  wrapperClass?: string
  label?: { name?: string; class?: string }
  header: ITableHeader<T>[]
  body: T[]
  footer?: string
  cursor?: string | null
  loader?: Writable<boolean>
  getData?: () => void
  modalData?: { isOpen?: boolean; rawData?: string; formattedData?: string }
  onClick?: (eventHandler: IUIComponentHandler) => void
}
