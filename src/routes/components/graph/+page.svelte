<script lang="ts">
  import { Table, type IGraphProps, type UIComponent } from "$lib"
  import ComponentExample from "$lib/ComponentExample.svelte"
  import Graph from "$lib/Graph/Graph.svelte"
  import GraphProps from "$lib/Graph/GraphProps.svelte"
  import { updateComponent } from "$lib/types"
  import { formatObjectToString, TableColumns } from "../../common"

  const dataForGraph = [
    { name: "Roll", value: 0 },
    { name: "Pitch", value: 0 },
    { name: "Yaw", value: 0 },
  ]

  /* Пример статического режима: готовый исторический ряд с реальными timestamp (Unix-эпоха, мс) —
     например, потребление электроэнергии за сутки с шагом в час */
  const now = Date.now()
  const hourMs = 60 * 60 * 1000
  const historyExample = [
    {
      name: "P, кВт·ч",
      points: Array.from({ length: 24 }, (_, i) => ({
        timestamp: now - (23 - i) * hourMs,
        value: 30 + Math.round(Math.sin(i / 3) * 20 + Math.random() * 10),
      })),
    },
  ]

  let graphComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: "Graph",
    access: "full",
    properties: {
      id: crypto.randomUUID(),
      wrapperClass: "",
      label: { name: "Label", class: "text-center" },
      streamingData: { data: dataForGraph },
      isTest: true,
    },
    eventHandler: { Header: "SET", Argument: "Save", Variables: [] },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: "",
  })

  let forConstructor = $state(false)

  let codeText = $derived(`
<UI.Graph
${formatObjectToString(graphComponent.properties as IGraphProps)} 
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
      name: "streamingData",
      type: "{ data: { name: string; value: number }[] | null } | string",
      default: "{ data: [] }",
      description: "Потоковые данные для живого режима: `data` — массив текущих значений именованных серий; поддерживает строку JSON для парсинга",
    },
    {
      name: "isTest",
      type: "boolean",
      default: "false",
      description: "Режим тестирования: при `true` генерирует случайные значения вместо использования входящих данных, форсирует refreshRate = 50мс",
    },
    {
      name: "refreshRate",
      type: "number",
      default: "0",
      description: "Интервал отрисовки точки в живом режиме, мс. `0` = AUTO — точка рисуется, когда значения реально изменились (без таймера)",
    },
    {
      name: "historyData",
      type: "{ name: string; points: { value: number; timestamp: number }[] }[]",
      default: "[]",
      description:
        "Готовый исторический ряд — если задан (непустой), компонент переходит в статический режим: рисует весь массив разом по реальным timestamp (Unix-эпоха, мс), streamingData/refreshRate игнорируются",
    },
  ]
</script>

<ComponentExample {codeText} bind:forConstructor>
  {#snippet component()}
    <Graph {...graphComponent.properties as IGraphProps} />
  {/snippet}
  {#snippet componentProps()}
    <GraphProps
      component={graphComponent as UIComponent & { properties: Partial<IGraphProps> }}
      onPropertyChange={(updates) => (graphComponent = updateComponent(graphComponent, updates as object))}
      {forConstructor}
    />
  {/snippet}
  {#snippet examples()}
    <Graph label={{ name: "Пример компонента график" }} streamingData={{ data: dataForGraph }} isTest={true} />
    <Graph label={{ name: "Статический режим — наведите курсор на график" }} historyData={historyExample} />
  {/snippet}
  {#snippet props()}
    <Table header={TableColumns} body={rows} outline />
  {/snippet}</ComponentExample
>
