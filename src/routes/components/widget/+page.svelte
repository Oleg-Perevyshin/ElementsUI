<script lang="ts">
  import { Table, type ITextFieldProps, type UIComponent } from "$lib"
  import ComponentExample from "$lib/ComponentExample.svelte"
  import { ICONS_ARRAY } from "$lib/icons"
  import { updateComponent, type IWidgetProps } from "$lib/types"
  import Widget from "$lib/Widget/Widget.svelte"
  import WidgetProps from "$lib/Widget/WidgetProps.svelte"
  import { formatObjectToString, TableColumns } from "../../common"

  let widgetComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: "Widget",
    access: "full",
    properties: {
      id: crypto.randomUUID(),
      label: { name: "Пропеллер" },
      icons: { array: ICONS_ARRAY[2][1], mode: "cycling", class: "text-[#333] dark:text-[#e2e3e7]" },
      settings: {
        label: "Скорость",
        class: "bg-blue",
        type: "slider",
        number: {
          minNum: 0,
          maxNum: 100,
          step: 1,
          units: "м/с",
        },
        switch: {
          // captionLeft: "Off",
          // captionRight: "On",
        },
      },
    },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: "",
  })
  let forConstructor = $state(false)

  let codeText = $derived(`
<UI.TextField
${formatObjectToString(widgetComponent.properties as ITextFieldProps)} 
/>`)

  const rows = [
    {
      name: "id",
      type: "string",
      default: "crypto.randomUUID()",
      description: "Уникальный идентификатор компонента",
    },
    {
      name: "wrapperClass",
      type: "string",
      default: '""',
      description: "Дополнительные CSS-классы для внешней обёртки компонента",
    },
    {
      name: "label",
      type: "{ name?: string; class?: string }",
      default: '{ name: "", class: "" }',
      description: "Настройки подписи: `name` — текст заголовка, `class` — CSS-классы для стилизации",
    },
    {
      name: "readonly",
      type: "boolean",
      default: "false",
      description: "Режим только для чтения: блокирует изменение значения через элементы управления (кнопки, инпут, слайдер, переключатель)",
    },
    {
      name: "settings",
      type: "{ type?: 'input' | 'switch' | 'slider'; label?: string; number?: { minNum?: number; maxNum?: number; step?: number; units?: string }; switch?: { captionLeft?: string; captionRight?: string }; class?: string }",
      default: '{ label: "", number: { minNum: 0, maxNum: 1000, step: 1 } }',
      description:
        "Конфигурация виджета: `type` — тип элемента управления, `label` — заголовок над элементом, `number` — параметры диапазона и единицы измерения, `switch` — подписи для переключателя, `class` — дополнительные стили контейнера управления",
    },
    {
      name: "value",
      type: "number",
      default: "0",
      description: "Текущее значение виджета: для `input`/`slider` — число в заданном диапазоне, для `switch` — 0 (Off) или 1 (On)",
    },
    {
      name: "icons",
      type: "{ array?: string[]; cycling?: boolean; class?: string }",
      default: "{ array: [], cycling: true }",
      description:
        "Настройки иконки: `array` — массив SVG/HTML для отображения, `cycling` — режим анимации (при `true` иконки циклически меняются со скоростью, обратно пропорциональной `value`; при `false` выбирается конкретная иконка, соответствующая текущему значению), `class` — стили контейнера иконки",
    },
    {
      name: "onUpdate",
      type: "(value: number) => void",
      default: "() => {}",
      description: "Callback-функция, вызываемая при изменении значения; передаёт новое число",
    },
  ]
</script>

<ComponentExample {codeText} bind:forConstructor>
  {#snippet component()}
    <div class="m-auto size-70">
      <Widget {...widgetComponent.properties as IWidgetProps} />
    </div>
  {/snippet}
  {#snippet componentProps()}
    <WidgetProps
      component={widgetComponent as UIComponent & { properties: Partial<IWidgetProps> }}
      onPropertyChange={(updates) => (widgetComponent = updateComponent(widgetComponent, updates as object))}
      {forConstructor}
    />
  {/snippet}
  {#snippet examples()}
    <div class="flex">
      <Widget
        wrapperClass="m-auto size-70"
        label={{ name: "Пропеллер" }}
        icons={{ array: ICONS_ARRAY[2][1], cycling: true }}
        settings={{ label: "Скорость", number: { minNum: 0, maxNum: 10, step: 1, units: "м/с" }, type: "input" }}
      />
      <Widget
        wrapperClass="m-auto size-70"
        label={{ name: "Заряд" }}
        icons={{ array: ICONS_ARRAY[0][1], cycling: false }}
        settings={{ number: { minNum: 0, maxNum: 100, step: 1, units: "%" }, type: "slider" }}
      />
      <Widget wrapperClass="m-auto size-70" label={{ name: "Лампочка" }} icons={{ array: ICONS_ARRAY[1][1], cycling: false }} settings={{ type: "switch" }} />
    </div>
  {/snippet}
  {#snippet props()}
    <Table header={TableColumns} body={rows} outline />
  {/snippet}
</ComponentExample>
