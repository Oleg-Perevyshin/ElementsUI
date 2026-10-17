<script lang="ts">
  import { type UIComponent } from "$lib"
  import ComponentExample from "../../ComponentExample.svelte"
  import { updateComponent, type IWidgetPFDData, type IWidgetPFDProps } from "$lib/types"
  import WidgetPFD from "$lib/WidgetPFD/WidgetPFD.svelte"
  import WidgetPFDProps from "$lib/WidgetPFD/WidgetPFDProps.svelte"
  import { formatObjectToString, RenderMarkdown } from "../../common"
  import readmeRaw from "$lib/WidgetPFD/README.md?raw"

  let readmeHtml = $state("")
  $effect(() => {
    RenderMarkdown(readmeRaw).then((html) => (readmeHtml = html))
  })

  /* Имитация полёта — та же модель, что MavlinkTelemetry_Simulate в прошивке 20.00.000-01: круг 150 м за 60 с вокруг дома */
  const HOME = { lat: 55.7558, lon: 37.6173 }
  const simulate = (t: number): IWidgetPFDData => {
    const angle = (2 * Math.PI * t) / 60
    const gs = (2 * Math.PI * 150) / 60 + 0.8 * Math.sin(t * 0.7)
    const track = ((angle * 180) / Math.PI + 90) % 360
    const alt = 120 + 10 * Math.sin(t * 0.1)
    return {
      Roll: 25 + 3 * Math.sin(t * 1.3),
      Pitch: 3 * Math.sin(t * 0.5),
      Heading: (track - 6 + 360) % 360,
      GSpeed: gs,
      ASpeed: gs + 2 + 0.5 * Math.sin(t * 0.3),
      Climb: Math.cos(t * 0.1),
      Alt: alt,
      AltMSL: alt + 156,
      Lat: HOME.lat + (150 * Math.cos(angle)) / 111320,
      Lon: HOME.lon + (150 * Math.sin(angle)) / (111320 * Math.cos((HOME.lat * Math.PI) / 180)),
      Vx: gs * Math.cos((track * Math.PI) / 180),
      Vy: gs * Math.sin((track * Math.PI) / 180),
      Fix: 3,
      Sat: 14,
      BV: 16.4 - t * 0.0015,
      BC: 12 + 2 * Math.sin(t * 0.9),
      BRem: 95 - (Math.floor(t / 20) % 90),
      Mode: 12,
      VType: 1,
      Armed: 1,
      HomeLat: HOME.lat,
      HomeLon: HOME.lon,
      Press: 1013 - alt * 0.12,
      Temp: 21,
    }
  }
  let flight: IWidgetPFDData = $state(simulate(0))
  $effect(() => {
    const start = performance.now()
    const timer = setInterval(() => (flight = simulate((performance.now() - start) / 1000)), 50)
    return () => clearInterval(timer)
  })

  let pfdComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: "WidgetPFD",
    access: "full",
    properties: {
      id: "MAV",
      label: { name: "Пилотажный дисплей" },
      componentClass: "",
      limits: { speedMin: 8, speedMax: 25, bankMax: 30, altMax: 150, battLow: 20 },
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
      <WidgetPFD {...pfdComponent.properties as IWidgetPFDProps} value={flight} />
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
