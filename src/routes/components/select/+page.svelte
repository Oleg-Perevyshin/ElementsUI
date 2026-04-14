<script lang="ts">
  import { type ISelectProps, type UIComponent } from "$lib"
  import ComponentExample from "$lib/ComponentExample.svelte"
  import * as UI from "$lib"
  import { updateComponent, type IOption } from "$lib/types"
  import { formatObjectToString, TableColumns } from "../../common"

  let selectComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: "Select",
    access: "full",
    properties: {
      id: crypto.randomUUID(),
      wrapperClass: "bg-max",
      disabled: false,
      label: { name: "Label", class: "text-center" },
      type: "buttons",
      multiSelect: true,
      bitMode: false,
      range: { start: 0, end: 1 },
      options: [
        { id: "select-option-1", value: "1", name: "Option 1", class: "bg-max" },
        { id: "select-option-2", value: "2", name: "Option 2", class: "bg-max" },
        { id: "select-option-3", value: "3", name: "3", class: "bg-max" },
        { id: "select-option-4", value: "4", name: "4", class: "bg-max" },
      ],
      value: [{ id: "select-option-1", value: "1", name: "Option 1", class: "bg-max" }],
    },
    eventHandler: { Header: "SET", Argument: "", Variables: [] },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: "",
  })

  let forConstructor = $state(false)

  let codeText = $derived(`
<UI.Select
${formatObjectToString(selectComponent.properties as ISelectProps)} 
  onUpdate={() => {}}
/>`)

  const componentMap = {
    Accordion: { component: UI.Accordion },
    Button: { component: UI.Button },
    ColorPicker: { component: UI.ColorPicker },
    FileAttach: { component: UI.FileAttach },
    Graph: { component: UI.Graph },
    Input: { component: UI.Input },
    Joystick: { component: UI.Joystick },
    Map: { component: UI.Map },
    ProgressBar: { component: UI.ProgressBar },
    Select: { component: UI.Select },
    Slider: { component: UI.Slider },
    Switch: { component: UI.Switch },
    Table: { component: UI.Table },
    Tabs: { component: UI.Tabs },
    TextField: { component: UI.TextField },
  }

  const bitModeOptions = [
    { id: crypto.randomUUID(), value: 0, name: "0000", class: "bg-max" },
    { id: crypto.randomUUID(), value: 1, name: "0001", class: "bg-max" },
    { id: crypto.randomUUID(), value: 2, name: "0010", class: "bg-max" },
    { id: crypto.randomUUID(), value: 3, name: "0011", class: "bg-max" },
    { id: crypto.randomUUID(), value: 4, name: "0100", class: "bg-max" },
    { id: crypto.randomUUID(), value: 5, name: "0101", class: "bg-max" },
    { id: crypto.randomUUID(), value: 6, name: "0110", class: "bg-max" },
    { id: crypto.randomUUID(), value: 7, name: "0111", class: "bg-max" },
    { id: crypto.randomUUID(), value: 8, name: "1000", class: "bg-max" },
    { id: crypto.randomUUID(), value: 9, name: "1001", class: "bg-max" },
    { id: crypto.randomUUID(), value: 10, name: "1010", class: "bg-max" },
    { id: crypto.randomUUID(), value: 11, name: "1011", class: "bg-max" },
    { id: crypto.randomUUID(), value: 12, name: "1100", class: "bg-max" },
    { id: crypto.randomUUID(), value: 13, name: "1101", class: "bg-max" },
    { id: crypto.randomUUID(), value: 14, name: "1110", class: "bg-max" },
    { id: crypto.randomUUID(), value: 15, name: "1111", class: "bg-max" },
  ]

  let selectOption: IOption = $state({ id: "Map", name: "Map", value: "Map" })
  let COMPONENT_OPTIONS = Object.keys(componentMap).map((name) => ({ id: name, name: name, value: name }))
  let fullSwitchValue = $state(10)

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
      name: "disabled",
      type: "boolean",
      default: "false",
      description: "Отключает взаимодействие с компонентом: блокирует клики, добавляет визуальные стили неактивности",
    },
    {
      name: "label",
      type: "{ name?: string; class?: string }",
      default: '{ name: "", class: "" }',
      description: "Настройки подписи: `name` — текст заголовка, `class` — CSS-классы для стилизации",
    },
    {
      name: "multiSelect",
      type: "boolean",
      default: "false",
      description:
        'Режим множественного выбора: работает только с `type: "buttons"`; при `true` позволяет выбирать несколько опций, значение передаётся как массив',
    },
    {
      name: "type",
      type: '"select" | "buttons" | "input"',
      default: '"select"',
      description:
        "Тип отображения: `select` — выпадающий список с кнопкой, `buttons` — горизонтальный ряд кнопок, `input` — поле ввода с автодополнением и поиском",
    },
    {
      name: "value",
      type: "T | T[] | IOption<T> | IOption<T>[]",
      default: "undefined",
      description:
        "Текущее выбранное значение: для `select`/`input` — объект `IOption` или примитив, для `buttons` с `multiSelect` — массив значений; поддерживает двустороннее связывание (`$bindable`)",
    },
    {
      name: "options",
      type: "IOption<T>[]",
      default: "[]",
      description:
        "Массив доступных опций: каждый элемент содержит `id` (уникальный ключ), `name` (отображаемый текст), `value` (возвращаемое значение), `class` (доп. стили), `disabled` (блокировка отдельной опции)",
    },
    {
      name: "onUpdate",
      type: "(value: T | T[] | IOption<T> | IOption<T>[]) => void",
      default: "undefined",
      description: "Callback-функция, вызываемая при изменении выбора; передаёт новое значение (одиночное или массив в зависимости от `multiSelect`)",
    },
  ]
</script>

<ComponentExample {codeText} bind:forConstructor>
  {#snippet component()}
    <UI.Select
      {...selectComponent.properties as ISelectProps}
      onUpdate={(value) => {
        updateComponent(selectComponent, {
          properties: { value: value },
        })
      }}
    />
  {/snippet}
  {#snippet componentProps()}
    <UI.SelectProps
      component={selectComponent as UIComponent & { properties: Partial<ISelectProps> }}
      onPropertyChange={(updates) => (selectComponent = updateComponent(selectComponent, updates as object))}
      {forConstructor}
    />
  {/snippet}
  {#snippet examples()}
    <p>{JSON.stringify(selectOption)}</p>
    <UI.Select
      type="input"
      label={{ name: "Компоненты" }}
      options={COMPONENT_OPTIONS}
      value={selectOption}
      onUpdate={(option) => (selectOption = option as IOption)}
    />
    <UI.Select label={{ name: "Компоненты" }} options={COMPONENT_OPTIONS} value={selectOption} onUpdate={(option) => (selectOption = option as IOption)} />
    <UI.Select
      type="buttons"
      label={{ name: "Компоненты" }}
      options={COMPONENT_OPTIONS}
      value={selectOption}
      onUpdate={(option) => (selectOption = option as IOption)}
    />
    <div class="mt-4 flex items-end">
      <UI.Select
        label={{ name: "Битовый режим", class: "text-center" }}
        bitMode={true}
        range={{ start: 0, end: 3 }}
        value={bitModeOptions.find((o) => o.value === fullSwitchValue)}
        options={bitModeOptions}
        onUpdate={() => {}}
      />
      <span>Выбранное значение: {fullSwitchValue}</span>
    </div>
  {/snippet}
  {#snippet props()}
    <UI.Table header={TableColumns} body={rows} outline />
  {/snippet}</ComponentExample
>
