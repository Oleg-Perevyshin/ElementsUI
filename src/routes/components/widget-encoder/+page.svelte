<script lang="ts">
  import { onDestroy } from "svelte"
  import { Language } from "#lib/locales/i18n.ts"
  import { localizeDeep } from "#lib/locales/localize.ts"
  import { type UIComponent } from "#lib"
  import { applyPropertyChange } from "#lib/propsEditor.ts"
  import ComponentExample from "../../ComponentExample.svelte"
  import { type IWidgetEncoderData, type IWidgetEncoderProps } from "#lib/types.ts"
  import WidgetEncoder from "#lib/WidgetEncoder/WidgetEncoder.svelte"
  import WidgetEncoderProps from "#lib/WidgetEncoder/WidgetEncoderProps.svelte"
  import { formatObjectToString, RenderMarkdown } from "../../common"
  import readmeRaw from "#lib/WidgetEncoder/README.md?raw"

  let readmeHtml = $state("")
  $effect(() => {
    RenderMarkdown(readmeRaw).then((html) => (readmeHtml = html))
  })

  /* Имитация MT6835: Cfg заводской (режим 1, 1 кГц), вал вращается 120 об/мин */
  const FACTORY_CFG = 13
  const VEL = (120 * 2 * Math.PI) / 60
  let enc: Partial<IWidgetEncoderData> = $state({ Cfg: FACTORY_CFG, A: 0, Vel: VEL, ST: 0, CS: 0 })
  const timer = setInterval(() => {
    enc = { ...enc, A: ((Number(enc.A) || 0) + (VEL * 0.2 * 180) / Math.PI) % 360, Vel: VEL + (Math.random() - 0.5) * 0.05 }
  }, 200)
  onDestroy(() => clearInterval(timer))

  let encComponent: UIComponent<"WidgetEncoder"> = $state({
    id: crypto.randomUUID(),
    type: "WidgetEncoder",
    access: "full",
    properties: { id: "ENC", label: { name: "" }, calibrateMs: 5000, chip: "MT6835" },
    eventHandler: { Header: "SET", Argument: "ModuleConfig", Variables: [] },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: "",
  })

  /* Режим 3 (ноль здесь): ноль - текущий угол, режим обратно 1 */
  const apply = (cfg: number) => {
    if ((cfg & 3) === 3) {
      const zero = (Math.round(((Number(enc.A) || 0) * 4096) / 360) & 0xfff) << 15
      enc = { ...enc, Cfg: ((cfg & ~(0xfff << 15) & ~3) | zero | 1) >>> 0, A: 0 }
    } else enc = { ...enc, Cfg: cfg, CS: (cfg & 3) === 2 ? 1 : enc.CS }
  }

  let codeText = $derived(`
<UI.WidgetEncoder
${formatObjectToString(encComponent.properties as IWidgetEncoderProps)}
value={enc}
onCalibrate={(cfg) => send({ "ENC.Cfg": cfg })}
onSaveCfg={(cfg) => send({ "ENC.Cfg": cfg })}
onRefresh={() => send("GET", "ModuleConfig", { CfgGroup: "ENC" })}
/>`)
</script>

<ComponentExample {codeText} {readmeHtml}>
  {#snippet component()}
    <div class="m-auto w-full max-w-3xl">
      <WidgetEncoder
        {...localizeDeep(encComponent.properties, $Language) as IWidgetEncoderProps}
        value={enc}
        onCalibrate={apply}
        onSaveCfg={(cfg) => (enc = { ...enc, Cfg: cfg })}
        onRefresh={() => (enc = { ...enc, Cfg: ((Number(enc.Cfg) & ~3) | 1) >>> 0, CS: enc.CS === 1 ? 3 : enc.CS })}
      />
    </div>
  {/snippet}
  {#snippet componentProps()}
    <WidgetEncoderProps component={encComponent} onPropertyChange={(updates) => (encComponent = applyPropertyChange(encComponent, updates))} />
  {/snippet}
  {#snippet examples()}
    <div class="m-auto flex w-full max-w-md flex-col gap-6 p-2">
      <WidgetEncoder accent="orange" label={{ name: "Слабое поле (только просмотр)" }} value={{ Cfg: 13, A: 187.4, Vel: 0, ST: 2, CS: 2 }} />
    </div>
  {/snippet}
</ComponentExample>
