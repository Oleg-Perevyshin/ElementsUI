<script lang="ts">
  import { Language } from "#lib/locales/i18n.ts"
  import { localizeDeep } from "#lib/locales/localize.ts"
  import { type UIComponent } from "#lib"
  import { applyPropertyChange } from "#lib/propsEditor.ts"
  import ComponentExample from "../../ComponentExample.svelte"
  import { type IWidgetLoRaProps } from "#lib/types.ts"
  import WidgetLoRa from "#lib/WidgetLoRa/WidgetLoRa.svelte"
  import WidgetLoRaProps from "#lib/WidgetLoRa/WidgetLoRaProps.svelte"
  import { LORA_PRESETS } from "#lib/WidgetLoRa/lora.ts"
  import { formatObjectToString, RenderMarkdown } from "../../common"
  import readmeRaw from "#lib/WidgetLoRa/README.md?raw"

  let readmeHtml = $state("")
  $effect(() => {
    RenderMarkdown(readmeRaw).then((html) => (readmeHtml = html))
  })

  /* Слово HT-CT62: 868 МГц, 10 дБм, 250 кГц, SF7, CR 4/5, CRC, преамбула 8 */
  let mockValue: Record<string, unknown> = $state({ Cfg: 1820660393 })

  let loraComponent: UIComponent<"WidgetLoRa"> = $state({
    id: crypto.randomUUID(),
    type: "WidgetLoRa",
    access: "full",
    properties: { label: { name: "" }, id: "LORA", preset: "HT_CT62", params: structuredClone(LORA_PRESETS.HT_CT62.params) },
    eventHandler: { Header: "SET", Argument: "ModCfg", Variables: [] },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: "",
  })

  let codeText = $derived(`
<UI.WidgetLoRa
${formatObjectToString(loraComponent.properties as IWidgetLoRaProps)}
value={{ Cfg: word }}
onSave={handleSave}
/>`)
</script>

<ComponentExample {codeText} {readmeHtml}>
  {#snippet component()}
    <div class="m-auto w-full max-w-3xl">
      <WidgetLoRa
        {...localizeDeep(loraComponent.properties, $Language) as IWidgetLoRaProps}
        value={mockValue}
        onSave={(values) => {
          console.log("SET LORA (mock):", values)
          mockValue = { ...mockValue, ...values }
        }}
      />
    </div>
  {/snippet}
  {#snippet componentProps()}
    <WidgetLoRaProps component={loraComponent} onPropertyChange={(updates) => (loraComponent = applyPropertyChange(loraComponent, updates))} />
  {/snippet}
  {#snippet examples()}
    <div class="flex flex-col gap-6 p-2">
      <!-- Свой формат: частота в Гц отдельным ключом, мощность в битах 0-5 -->
      <WidgetLoRa
        params={{ Freq: { key: "Freq", scale: 1000000, step: 0.1 }, TxP: { key: "Cfg", bits: { start: 0, end: 5 }, min: 0, max: 22 } }}
        value={{ Cfg: 14, Freq: 868100000 }}
        accent="green"
      />
    </div>
  {/snippet}
</ComponentExample>
