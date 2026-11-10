/* $lib/propsEditor.ts - неизменяемая правка свойств компонента из панелей конструктора: каждое изменение уходит наружу одним PropertyChange с новыми объектами верхнего уровня */
import type { IUIComponentHandler, UIComponent } from "./types"

/* Изменение компонента от панели свойств; приложение сливает его с компонентом (properties и eventHandler - по ключам верхнего уровня) */
export interface PropertyChange<P extends object = UIComponent["properties"]> {
  properties?: Partial<P>
  name?: string
  access?: UIComponent["access"]
  eventHandler?: Partial<IUIComponentHandler>
}

type Item<V> = V extends readonly (infer I)[] ? I : never
type ArrayKey<P> = { [K in keyof P]-?: NonNullable<P[K]> extends readonly unknown[] ? K : never }[keyof P]
type ObjectKey<P> = { [K in keyof P]-?: NonNullable<P[K]> extends readonly unknown[] ? never : NonNullable<P[K]> extends object ? K : never }[keyof P]

export const createPropsEditor = <P extends object>(component: { properties: Partial<P> }, onPropertyChange: (change: PropertyChange<P>) => void) => {
  const set = <K extends keyof P>(key: K, value: P[K]) => onPropertyChange({ properties: { [key]: value } as unknown as Partial<P> })
  const list = <K extends ArrayKey<P>>(key: K) => (component.properties[key] ?? []) as Item<NonNullable<P[K]>>[]

  return {
    set,
    /* Слияние во вложенный объект: patch("label", { class: "text-center" }) */
    patch: <K extends ObjectKey<P>>(key: K, value: Partial<NonNullable<P[K]>>) => set(key, { ...(component.properties[key] as object), ...value } as P[K]),
    addItem: <K extends ArrayKey<P>>(key: K, item: Item<NonNullable<P[K]>>) => set(key, [...list(key), item] as P[K]),
    updateItem: <K extends ArrayKey<P>>(key: K, index: number, value: Partial<Item<NonNullable<P[K]>>>) =>
      set(key, list(key).map((item, i) => (i === index ? { ...(item as object), ...value } : item)) as P[K]),
    removeItem: <K extends ArrayKey<P>>(key: K, index: number) => set(key, list(key).filter((_, i) => i !== index) as P[K]),
  }
}

/* Вариант панели, чьё значение (класс Tailwind: text-center, py-2...) есть в строке классов компонента */
export const optionByClass = <O extends { value?: unknown }>(options: O[], classes: string | undefined): O | undefined => {
  const list = classes?.split(/\s+/) ?? []
  return options.find((option) => list.includes(String(option.value)))
}
