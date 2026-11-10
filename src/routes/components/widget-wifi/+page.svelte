<script lang="ts">
  import { Language } from "#lib/locales/i18n.ts"
  import { localizeDeep } from "#lib/locales/localize.ts"
  import { type UIComponent } from "#lib"
  import { applyPropertyChange } from "#lib/propsEditor.ts"
  import ComponentExample from "../../ComponentExample.svelte"
  import { type IWidgetWiFiProps } from "#lib/types.ts"
  import WidgetWiFi from "#lib/WidgetWiFi/WidgetWiFi.svelte"
  import WidgetWiFiProps from "#lib/WidgetWiFi/WidgetWiFiProps.svelte"
  import { formatObjectToString, RenderMarkdown } from "../../common"
  import readmeRaw from "#lib/WidgetWiFi/README.md?raw"

  let readmeHtml = $state("")
  $effect(() => {
    RenderMarkdown(readmeRaw).then((html) => (readmeHtml = html))
  })

  const mockScan = async () => {
    await new Promise((r) => setTimeout(r, 600))
    return [
      { id: "n1", name: "POE-Net (-48 dBm, ch 11)", value: "POE-Net" },
      { id: "n2", name: "Home-5G (-63 dBm, ch 36)", value: "Home-5G" },
      { id: "n3", name: "Office-Guest (-81 dBm, ch 6)", value: "Office-Guest" },
    ]
  }

  let wifiComponent: UIComponent<"WidgetWiFi"> = $state({
    id: crypto.randomUUID(),
    type: "WidgetWiFi",
    access: "full",
    properties: {
      label: { name: "WiFi" },
      allowedModes: [1, 2, 3],
      confirmOnAP: true,
    },
    eventHandler: { Header: "SET", Argument: "ModCfg", Variables: [] },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: "",
  })

  let codeText = $derived(`
<UI.WidgetWiFi
${formatObjectToString(wifiComponent.properties as IWidgetWiFiProps)}
onScan={handleScan}
onSave={handleSave}
/>`)
</script>

<ComponentExample {codeText} {readmeHtml}>
  {#snippet component()}
    <div class="m-auto w-full max-w-3xl">
      <WidgetWiFi
        {...localizeDeep(wifiComponent.properties, $Language) as IWidgetWiFiProps}
        onScan={mockScan}
        onSave={(cfg) => console.log("SET CFG (mock):", cfg)}
      />
    </div>
  {/snippet}
  {#snippet componentProps()}
    <WidgetWiFiProps component={wifiComponent} onPropertyChange={(updates) => (wifiComponent = applyPropertyChange(wifiComponent, updates))} />
  {/snippet}
  {#snippet examples()}
    <div class="flex flex-col gap-6 p-2">
      <WidgetWiFi label={{ name: "WiFi" }} accent="blue" onScan={mockScan} onSave={(cfg) => console.log("SET CFG (mock):", cfg)} />
      <WidgetWiFi
        label={{ name: "Только клиент" }}
        allowedModes={[1]}
        accent="purple"
        onScan={mockScan}
        onSave={(cfg) => console.log("SET CFG (mock):", cfg)}
      />
    </div>
  {/snippet}
</ComponentExample>
