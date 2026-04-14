<script lang="ts">
  import { Button, ProgressBar, Table, type IProgressBarProps, type UIComponent } from "$lib"
  import ComponentExample from "$lib/ComponentExample.svelte"
  import ProgressBarProps from "$lib/ProgressBar/ProgressBarProps.svelte"
  import { updateComponent, type IReceivingDataObject } from "$lib/types"
  import { formatObjectToString, TableColumns } from "../../common"

  let progressBarComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: "ProgressBar",
    access: "full",
    properties: {
      id: crypto.randomUUID(),
      type: "horizontal",
      items: [
        { name: "Label 1", class: "bg-blue" },
        { name: "Label 2", class: "bg-blue" },
        { name: "Label 3", class: "bg-blue" },
      ],
      value: [{ Value: 50 }, { Value: 50 }, { Value: 50 }],
      number: { minNum: 0, maxNum: 100, units: "%" },
    },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: "",
  })

  let forConstructor = $state(false)

  let codeText = $derived(`
<UI.ProgressBar
${formatObjectToString(progressBarComponent.properties as IProgressBarProps)} 
/>`)
  let progressBarValue: IReceivingDataObject[] = $state([{ Name: "progress", Value: 66 }])

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
      name: "items",
      type: "{ name: string; class?: string }[]",
      default: '[{ name: "Label", class: "" }]',
      description: "Массив элементов прогресс-бара: `name` — название для отображения, `class` — CSS-классы для стилизации контейнера элемента",
    },
    {
      name: "value",
      type: "number | IReceivingDataObject[]",
      default: "undefined",
      description:
        "Значение прогресса: число для одиночного бара или массив объектов `{ Name, Value, Info }` для нескольких элементов; `Value` — текущее значение, `Info` — дополнительная подсказка под баром",
    },
    {
      name: "type",
      type: '"horizontal" | "vertical"',
      default: '"horizontal"',
      description:
        "Ориентация прогресс-бара: `horizontal` — горизонтальное заполнение слева направо, `vertical` — вертикальное заполнение снизу вверх с центрированным расположением элементов",
    },
    {
      name: "number",
      type: "{ minNum?: number; maxNum?: number; units?: string }",
      default: '{ minNum: 0, maxNum: 100, units: "%" }',
      description:
        "Настройки диапазона значений: `minNum`/`maxNum` — границы шкалы прогресса, `units` — суффикс для отображения числового значения (например, `%`)",
    },
  ]
</script>

<ComponentExample {codeText} bind:forConstructor>
  {#snippet component()}
    <ProgressBar {...progressBarComponent.properties as IProgressBarProps} />
  {/snippet}
  {#snippet componentProps()}
    <ProgressBarProps
      component={progressBarComponent as UIComponent & { properties: Partial<IProgressBarProps> }}
      onPropertyChange={(updates) => (progressBarComponent = updateComponent(progressBarComponent, updates as object))}
      {forConstructor}
    />
  {/snippet}
  {#snippet examples()}
    <ProgressBar value={progressBarValue} wrapperClass="bg-red" />
    <div class="flex justify-center">
      <Button
        wrapperClass="m-2 !w-10"
        content={{ name: "-" }}
        componentClass="h-10 rounded-full bg-purple"
        onClick={() => {
          if (progressBarValue[0] && typeof progressBarValue[0].Value === "number") progressBarValue[0].Value -= 5
        }}
      />
      <Button
        wrapperClass="m-2 !w-10"
        content={{ name: "+" }}
        componentClass="h-10 rounded-full bg-purple"
        onClick={() => {
          if (progressBarValue[0] && typeof progressBarValue[0].Value === "number") progressBarValue[0].Value += 5
        }}
      />
    </div>
  {/snippet}
  {#snippet props()}
    <Table header={TableColumns} body={rows} outline />
  {/snippet}</ComponentExample
>
