<script lang="ts">
  import { onDestroy } from "svelte"
  import { Language } from "#lib/locales/i18n.ts"
  import { localizeDeep } from "#lib/locales/localize.ts"
  import { type UIComponent } from "#lib"
  import { applyPropertyChange } from "#lib/propsEditor.ts"
  import ComponentExample from "../../ComponentExample.svelte"
  import { type IWidgetAHRSData, type IWidgetAHRSProps } from "#lib/types.ts"
  import WidgetAHRS from "#lib/WidgetAHRS/WidgetAHRS.svelte"
  import WidgetAHRSProps from "#lib/WidgetAHRS/WidgetAHRSProps.svelte"
  import { formatObjectToString, RenderMarkdown } from "../../common"
  import readmeRaw from "#lib/WidgetAHRS/README.md?raw"

  let readmeHtml = $state("")
  $effect(() => {
    RenderMarkdown(readmeRaw).then((html) => (readmeHtml = html))
  })

  /* Имитация устройства: настройки ahrs_gimbal по умолчанию и покачивание подвеса */
  let filter: Partial<IWidgetAHRSData> = $state({
    Mode: 0,
    MU: 0,
    TA: 3,
    TM: 9,
    GN: 0.005,
    GB: 0.005,
    AN: 0.03,
    AG: 0.25,
    MN: 10,
    KP: 0.2,
    KI: 0.002,
    KB: 0.02,
    KM: 0.005,
    BX: -0.189,
    BY: -0.506,
    BZ: 0.421,
  })
  let t = 0
  const timer = setInterval(() => {
    t += 0.1
    filter = { ...filter, R: 12 * Math.sin(t / 3), P: 6 * Math.sin(t / 5), Y: (360 + 20 * Math.sin(t / 7)) % 360, SR: 0.4, SP: 0.4, SY: 2.1 }
  }, 100)
  onDestroy(() => clearInterval(timer))

  let ahrsComponent: UIComponent<"WidgetAHRS"> = $state({
    id: crypto.randomUUID(),
    type: "WidgetAHRS",
    access: "full",
    properties: { id: "AHRF", label: { name: "" } },
    eventHandler: { Header: "SET", Argument: "ModuleConfig", Variables: [] },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: "",
  })

  let codeText = $derived(`
<UI.WidgetAHRS
${formatObjectToString(ahrsComponent.properties as IWidgetAHRSProps)}
value={filter}
onSave={(values) => send(Object.fromEntries(Object.entries(values).map(([key, value]) => [\`AHRF.\${key}\`, value])))}
/>`)
</script>

<ComponentExample {codeText} {readmeHtml}>
  {#snippet component()}
    <div class="m-auto w-full max-w-3xl">
      <WidgetAHRS
        {...localizeDeep(ahrsComponent.properties, $Language) as IWidgetAHRSProps}
        value={filter}
        onSave={(values) => (filter = { ...filter, ...values })}
      />
    </div>
  {/snippet}
  {#snippet componentProps()}
    <WidgetAHRSProps component={ahrsComponent} onPropertyChange={(updates) => (ahrsComponent = applyPropertyChange(ahrsComponent, updates))} />
  {/snippet}
  {#snippet examples()}
    <div class="m-auto flex w-full max-w-md flex-col gap-6 p-2">
      <WidgetAHRS accent="green" label={{ name: "Только просмотр" }} value={{ Mode: 1, MU: 1, R: 3.2, P: -1.4, Y: 87.5, BX: 0.01, BY: 0.02, BZ: -0.01 }} />
    </div>
  {/snippet}
</ComponentExample>
