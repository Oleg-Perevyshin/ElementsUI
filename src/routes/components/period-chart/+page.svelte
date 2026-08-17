<script lang="ts">
  import { type IPeriodChartProps, type IPeriodChartLevel, type UIComponent } from "$lib"
  import ComponentExample from "$lib/ComponentExample.svelte"
  import PeriodChart from "$lib/PeriodChart/PeriodChart.svelte"
  import PeriodChartProps from "$lib/PeriodChart/PeriodChartProps.svelte"
  import { updateComponent } from "$lib/types"
  import { formatObjectToString, RenderMarkdown } from "../../common"
  import readmeRaw from "$lib/PeriodChart/README.md?raw"

  let readmeHtml = $state("")
  $effect(() => {
    RenderMarkdown(readmeRaw).then((html) => (readmeHtml = html))
  })

  const randomLevelData = (n: number) => Array.from({ length: n }, () => Math.round(Math.random() * 100))

  /* Пример на данных, похожих на реальные (BL0910 PWR.EYear/EMonth/EDay/EHour, см. ProdFactory-ESP) */
  const energyLevels: IPeriodChartLevel[] = [
    {
      name: "Год",
      variable: "PWR.EYear",
      data: randomLevelData(12),
      labels: ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"],
    },
    { name: "Месяц", variable: "PWR.EMonth", data: randomLevelData(31) },
    { name: "Сутки", variable: "PWR.EDay", data: randomLevelData(24) },
    { name: "Час", variable: "PWR.EHour", data: randomLevelData(6), labels: ["0-10", "10-20", "20-30", "30-40", "40-50", "50-60"] },
  ]

  let periodChartComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: "PeriodChart",
    access: "full",
    properties: {
      id: crypto.randomUUID(),
      wrapperClass: "bg-blue",
      label: { name: "Расход энергии", class: "text-center" },
      levels: energyLevels,
      unit: " Вт·ч",
    },
    eventHandler: { Header: "SET", Argument: "ModCfg", Variables: [] },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: "",
  })

  let forConstructor = $state(false)

  let codeText = $derived(`
<UI.PeriodChart
${formatObjectToString(periodChartComponent.properties as IPeriodChartProps)}
/>`)
</script>

<ComponentExample {codeText} {readmeHtml} bind:forConstructor>
  {#snippet component()}
    <PeriodChart {...periodChartComponent.properties as IPeriodChartProps} />
  {/snippet}
  {#snippet componentProps()}
    <PeriodChartProps
      component={periodChartComponent as UIComponent & { properties: Partial<IPeriodChartProps> }}
      onPropertyChange={(updates) => (periodChartComponent = updateComponent(periodChartComponent, updates as object))}
      {forConstructor}
    />
  {/snippet}
  {#snippet examples()}
    <PeriodChart label={{ name: "Расход энергии" }} levels={energyLevels} unit=" Вт·ч" onLevelChange={(_, level) => console.log("Переключились на", level.name)} />
    <PeriodChart label={{ name: "Другая палитра" }} wrapperClass="bg-green" levels={energyLevels} unit=" Вт·ч" />
    <PeriodChart label={{ name: "Без данных" }} levels={[{ name: "Час", data: [] }]} />
  {/snippet}
</ComponentExample>
