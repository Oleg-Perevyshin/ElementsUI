<script lang="ts">
  import { Language } from "$lib/locales/i18n"
  import { localizeDeep } from "$lib/locales/localize"
  import { type UIComponent } from "$lib"
  import ComponentExample from "../../ComponentExample.svelte"
  import { updateComponent, type IWidgetPFDData, type IWidgetPFDProps } from "$lib/types"
  import WidgetPFD from "$lib/WidgetPFD/WidgetPFD.svelte"
  import WidgetPFDProps from "$lib/WidgetPFD/WidgetPFDProps.svelte"
  import { formatObjectToString, RenderMarkdown } from "../../common"
  import readmeRaw from "$lib/WidgetPFD/README.md?raw"
  import { createFlightSim } from "../flightSim"

  let readmeHtml = $state("")
  $effect(() => {
    RenderMarkdown(readmeRaw).then((html) => (readmeHtml = html))
  })

  /* Имитация полёта — та же модель, что MavlinkTelemetry_Simulate в прошивке 20.00.000-01 (маршрут над Минском) */
  const sim = createFlightSim()
  let flight: IWidgetPFDData = $state(sim(0))
  $effect(() => {
    const timer = setInterval(() => (flight = sim(0.05)), 50)
    return () => clearInterval(timer)
  })

  let pfdComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: "WidgetPFD",
    access: "full",
    properties: {
      id: "MAV",
      label: { name: "" },
      componentClass: "",
      limits: { speedMin: 8, speedMax: 25, bankMax: 30, altMax: 170, battLow: 20 },
    },
    eventHandler: { Header: "GET", Argument: "ModCfg", Variables: [] },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: "",
  })
  let forConstructor = $state(false)

  let codeText = $derived(`
<UI.WidgetPFD
${formatObjectToString(pfdComponent.properties as IWidgetPFDProps)}
value={mav}
/>`)
</script>

<ComponentExample {codeText} {readmeHtml} bind:forConstructor>
  {#snippet component()}
    <div class="m-auto w-full max-w-3xl">
      <WidgetPFD {...localizeDeep(pfdComponent.properties, $Language) as IWidgetPFDProps} value={flight} />
    </div>
  {/snippet}
  {#snippet componentProps()}
    <WidgetPFDProps
      component={pfdComponent as UIComponent & { properties: Partial<IWidgetPFDProps> }}
      onPropertyChange={(updates) => (pfdComponent = updateComponent(pfdComponent, updates as object))}
    />
  {/snippet}
  {#snippet examples()}
    <div class="m-auto flex w-full max-w-3xl flex-col gap-6 p-2">
      <div class="w-80"><WidgetPFD label={{ name: "Узкая ячейка" }} value={flight} componentClass="bg-blue" /></div>
      <WidgetPFD label={{ name: "Нет данных" }} componentClass="bg-red" />
    </div>
  {/snippet}
</ComponentExample>
