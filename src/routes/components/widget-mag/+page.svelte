<script lang="ts">
  import { onDestroy } from "svelte"
  import { Language } from "#lib/locales/i18n.ts"
  import { localizeDeep } from "#lib/locales/localize.ts"
  import { type UIComponent } from "#lib"
  import { applyPropertyChange } from "#lib/propsEditor.ts"
  import ComponentExample from "../../ComponentExample.svelte"
  import { type IWidgetMagData, type IWidgetMagProps } from "#lib/types.ts"
  import WidgetMag from "#lib/WidgetMag/WidgetMag.svelte"
  import WidgetMagProps from "#lib/WidgetMag/WidgetMagProps.svelte"
  import { formatObjectToString, RenderMarkdown } from "../../common"
  import readmeRaw from "#lib/WidgetMag/README.md?raw"

  let readmeHtml = $state("")
  $effect(() => {
    RenderMarkdown(readmeRaw).then((html) => (readmeHtml = html))
  })

  /* Имитация RM3100: Cfg заводской (режим 1), поле Земли около 50 мкТл */
  const FACTORY_CFG = 238997
  let mag: Partial<IWidgetMagData> = $state({ Cfg: FACTORY_CFG, CQ: 84, MR: 0, MP: 0, MY: 0 })
  const noise = (scale: number) => (Math.random() - 0.5) * scale
  const timer = setInterval(() => {
    mag = { ...mag, CX: 18.2 + noise(0.4), CY: -4.1 + noise(0.4), CZ: 46.7 + noise(0.4) }
  }, 200)
  onDestroy(() => clearInterval(timer))

  let magComponent: UIComponent<"WidgetMag"> = $state({
    id: crypto.randomUUID(),
    type: "WidgetMag",
    access: "full",
    properties: { id: "MAGF", label: { name: "" }, calibrateMs: 5000, chip: "RM3100" },
    eventHandler: { Header: "SET", Argument: "ModuleConfig", Variables: [] },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: "",
  })

  let codeText = $derived(`
<UI.WidgetMag
${formatObjectToString(magComponent.properties as IWidgetMagProps)}
value={mag}
onCalibrate={(cfg) => send({ "MAGF.Cfg": cfg })}
onSaveMount={(mount) => send(mount)}
onRefresh={() => send("GET", "ModuleConfig", { CfgGroup: "MAGF" })}
/>`)
</script>

<ComponentExample {codeText} {readmeHtml}>
  {#snippet component()}
    <div class="m-auto w-full max-w-3xl">
      <WidgetMag
        {...localizeDeep(magComponent.properties, $Language) as IWidgetMagProps}
        value={mag}
        onCalibrate={(cfg) => (mag = { ...mag, Cfg: cfg })}
        onSaveCfg={(cfg) => (mag = { ...mag, Cfg: cfg })}
        onSaveMount={(mount) => (mag = { ...mag, ...mount })}
        onRefresh={() => (mag = { ...mag, Cfg: FACTORY_CFG, CQ: 96 })}
      />
    </div>
  {/snippet}
  {#snippet componentProps()}
    <WidgetMagProps component={magComponent} onPropertyChange={(updates) => (magComponent = applyPropertyChange(magComponent, updates))} />
  {/snippet}
  {#snippet examples()}
    <div class="m-auto flex w-full max-w-md flex-col gap-6 p-2">
      <WidgetMag accent="orange" label={{ name: "Плохая калибровка (только просмотр)" }} value={{ Cfg: 238997, CX: 80, CY: -12, CZ: 95, CQ: 52 }} />
    </div>
  {/snippet}
</ComponentExample>
