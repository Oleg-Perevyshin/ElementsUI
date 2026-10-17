<script lang="ts">
  import { type UIComponent } from "$lib"
  import ComponentExample from "../../ComponentExample.svelte"
  import { updateComponent, type IWidgetMapData, type IWidgetMapProps } from "$lib/types"
  import WidgetMap from "$lib/WidgetMap/WidgetMap.svelte"
  import WidgetMapProps from "$lib/WidgetMap/WidgetMapProps.svelte"
  import { formatObjectToString, RenderMarkdown } from "../../common"
  import readmeRaw from "$lib/WidgetMap/README.md?raw"
  import { createFlightSim } from "../flightSim"

  let readmeHtml = $state("")
  $effect(() => {
    RenderMarkdown(readmeRaw).then((html) => (readmeHtml = html))
  })

  /* Два борта по маршруту над Минском (модель MavlinkTelemetry_Simulate прошивки 20.00.000-01), второй стартует с другой точки */
  const simMav = createFlightSim()
  const simGnss = createFlightSim(3)
  const pick = ({ Lat, Lon, Alt, Heading, Sat }: IWidgetMapData) => ({ Lat, Lon, Alt, Heading, Sat })
  let boards: Record<string, IWidgetMapData> = $state({ MAV: pick(simMav(0)), GNSS: pick(simGnss(0)) })
  $effect(() => {
    const timer = setInterval(() => (boards = { MAV: pick(simMav(0.5)), GNSS: pick(simGnss(0.5)) }), 500)
    return () => clearInterval(timer)
  })

  let mapComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: "WidgetMap",
    access: "full",
    properties: {
      label: { name: "Карта" },
      groups: ["MAV", "GNSS"],
      componentClass: "",
      height: 400,
      trackEnabled: true,
    },
    eventHandler: { Header: "GET", Argument: "ModCfg", Variables: [] },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: "",
  })
  let forConstructor = $state(false)

  let codeText = $derived(`
<UI.WidgetMap
${formatObjectToString(mapComponent.properties as IWidgetMapProps)}
value={{ MAV: mav, GNSS: gnss }}
/>`)
</script>

<ComponentExample {codeText} {readmeHtml} bind:forConstructor>
  {#snippet component()}
    <div class="m-auto w-full max-w-4xl">
      <WidgetMap {...mapComponent.properties as IWidgetMapProps} value={boards} />
    </div>
  {/snippet}
  {#snippet componentProps()}
    <WidgetMapProps
      component={mapComponent as UIComponent & { properties: Partial<IWidgetMapProps> }}
      onPropertyChange={(updates) => (mapComponent = updateComponent(mapComponent, updates as object))}
    />
  {/snippet}
  {#snippet examples()}
    <div class="m-auto flex w-full max-w-4xl flex-col gap-6 p-2">
      <WidgetMap label={{ name: "Один борт, без данных" }} groups={["GPS"]} height={250} componentClass="bg-red" />
    </div>
  {/snippet}
</ComponentExample>
