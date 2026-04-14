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
    eventHandler: { Header: "SET", Argument: "NoSave", Variables: [] },
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
      type: "{ data: { name: string; value: number }[]; timestamp: number } | string",
      default: "{ data: [], timestamp: Date.now() }",
      description:
        "Потоковые данные для отрисовки графика: `data` — массив объектов с именем и значением, `timestamp` — метка времени обновления; поддерживает строку JSON для парсинга",
    },
    {
      name: "isTest",
      type: "boolean",
      default: "false",
      description: "Режим тестирования: при `true` генерирует случайные значения вместо использования входящих данных",
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
  {/snippet}
  {#snippet props()}
    <Table header={TableColumns} body={rows} outline />
  {/snippet}</ComponentExample
>
