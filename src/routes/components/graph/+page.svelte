<script lang="ts">
  import { Language } from "#lib/locales/i18n.ts"
  import { localizeDeep } from "#lib/locales/localize.ts"
  import { type IGraphProps, type UIComponent } from "#lib"
  import { applyPropertyChange } from "#lib/propsEditor.ts"
  import ComponentExample from "../../ComponentExample.svelte"
  import Graph from "#lib/Graph/Graph.svelte"
  import GraphProps from "#lib/Graph/GraphProps.svelte"
  import { formatObjectToString, L, RenderMarkdown } from "../../common"
  import readmeRaw from "#lib/Graph/README.md?raw"

  let readmeHtml = $state("")
  $effect(() => {
    RenderMarkdown(readmeRaw).then((html) => (readmeHtml = html))
  })

  const dataForGraph = [
    { name: "Roll", value: 0 },
    { name: "Pitch", value: 0 },
    { name: "Yaw", value: 0 },
  ]

  /* Пример статического режима: исторический ряд с реальными timestamp (например, электроэнергия за сутки по часам) */
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

  let graphComponent: UIComponent<"Graph"> = $state({
    id: crypto.randomUUID(),
    type: "Graph",
    access: "full",
    properties: {
      id: crypto.randomUUID(),
      wrapperClass: "",
      label: { name: "Label", class: "text-center" },
      help: { info: L("Значения переменной устройства во времени", "Device variable values over time", "设备变量随时间变化的值") },
      streamingData: { data: dataForGraph },
      isTest: true,
    },
    eventHandler: { Header: "SET", Argument: "ModCfg", Variables: [] },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: "",
  })

  let codeText = $derived(`
<UI.Graph
${formatObjectToString(graphComponent.properties as IGraphProps)}
/>`)
</script>

<ComponentExample {codeText} {readmeHtml}>
  {#snippet component()}
    <Graph {...localizeDeep(graphComponent.properties, $Language) as IGraphProps} />
  {/snippet}
  {#snippet componentProps()}
    <GraphProps component={graphComponent} onPropertyChange={(updates) => (graphComponent = applyPropertyChange(graphComponent, updates))} />
  {/snippet}
  {#snippet examples()}
    <Graph label={{ name: "Пример компонента график" }} streamingData={{ data: dataForGraph }} isTest={true} />
    <Graph label={{ name: "Статический режим - наведите курсор на график" }} historyData={historyExample} />
  {/snippet}
</ComponentExample>
