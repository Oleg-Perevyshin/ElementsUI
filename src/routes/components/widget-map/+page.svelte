<script lang="ts">
  import { Language } from "#lib/locales/i18n.ts"
  import { localizeDeep } from "#lib/locales/localize.ts"
  import { type UIComponent } from "#lib"
  import ComponentExample from "../../ComponentExample.svelte"
  import { updateComponent, type IWidgetMapProps } from "#lib/types.ts"
  import WidgetMap from "#lib/WidgetMap/WidgetMap.svelte"
  import WidgetMapProps from "#lib/WidgetMap/WidgetMapProps.svelte"
  import { formatObjectToString, RenderMarkdown } from "../../common"
  import readmeRaw from "#lib/WidgetMap/README.md?raw"
  import { DEFAULT_MISSION_PLAN, type IMissionPlan } from "#lib/WidgetMap/mission/plan.ts"
  import { DEFAULT_ROUTE_PLAN, type IRoutePlan } from "#lib/WidgetMap/mission/route.ts"

  let readmeHtml = $state("")
  $effect(() => {
    RenderMarkdown(readmeRaw).then((html) => (readmeHtml = html))
  })

  let mapComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: "WidgetMap",
    access: "full",
    properties: {
      label: { name: "" },
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

  /* Режим «Агро»: план сохраняется в браузере, отправка только имитируется - миссия выводится в консоль */
  const PLAN_KEY = "WidgetMapAgroDemoPlan13"
  const loadPlan = (): IMissionPlan => {
    try {
      const raw = localStorage.getItem(PLAN_KEY)
      if (raw) return { ...DEFAULT_MISSION_PLAN, ...JSON.parse(raw) }
    } catch {}
    return structuredClone(DEFAULT_MISSION_PLAN)
  }
  let plan: IMissionPlan = $state(loadPlan())
  $effect(() => {
    try {
      localStorage.setItem(PLAN_KEY, JSON.stringify(plan))
    } catch {}
  })
  /* Режим «Маршрут»: точки сохраняются в браузере */
  const ROUTE_KEY = "WidgetMapRouteDemoPlan2"
  const loadRoute = (): IRoutePlan => {
    try {
      const raw = localStorage.getItem(ROUTE_KEY)
      if (raw) return { ...DEFAULT_ROUTE_PLAN, ...JSON.parse(raw) }
    } catch {}
    return structuredClone(DEFAULT_ROUTE_PLAN)
  }
  let route: IRoutePlan = $state(loadRoute())
  $effect(() => {
    try {
      localStorage.setItem(ROUTE_KEY, JSON.stringify(route))
    } catch {}
  })
  const send = async (mission: string) => {
    await new Promise((r) => setTimeout(r, 600))
    console.log(mission)
  }
  let mapMode = $derived((mapComponent.properties as IWidgetMapProps).mode ?? "objects")

  let codeText = $derived(`
<UI.WidgetMap
${formatObjectToString(mapComponent.properties as IWidgetMapProps)}${mapMode === "agro" ? "\nbind:plan\nonSend={(mission) => sendToDevice(mission)}" : mapMode === "route" ? "\nbind:route\nonSend={(mission) => sendToDevice(mission)}" : ""}
/>`)
</script>

<ComponentExample {codeText} {readmeHtml} bind:forConstructor>
  {#snippet component()}
    <div class="m-auto w-full max-w-4xl">
      <WidgetMap {...localizeDeep(mapComponent.properties, $Language) as IWidgetMapProps} bind:plan bind:route onSend={send} />
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
      <WidgetMap label={{ name: "Один объект, без данных" }} groups={["GPS"]} height={250} componentClass="bg-red" />
      <!-- Без переданного плана, как в конструкторе DevCloud: виджет берёт демо-поле и демо-маршрут -->
      <WidgetMap mode="agro" height={520} isTest />
      <WidgetMap mode="route" height={520} isTest />
    </div>
  {/snippet}
</ComponentExample>
