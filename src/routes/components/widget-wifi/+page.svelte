<script lang="ts">
  import { type UIComponent } from "$lib"
  import ComponentExample from "$lib/ComponentExample.svelte"
  import { updateComponent, type IWidgetWiFiProps } from "$lib/types"
  import WidgetWiFi from "$lib/WidgetWiFi/WidgetWiFi.svelte"
  import WidgetWiFiProps from "$lib/WidgetWiFi/WidgetWiFiProps.svelte"
  import { formatObjectToString, RenderMarkdown } from "../../common"
  import readmeRaw from "$lib/WidgetWiFi/README.md?raw"

  let readmeHtml = $state("")
  $effect(() => {
    RenderMarkdown(readmeRaw).then((html) => (readmeHtml = html))
  })

  const mockScan = async () => {
    await new Promise((r) => setTimeout(r, 600))
    return [
      { id: "n1", name: "POE-Net", value: "POE-Net" },
      { id: "n2", name: "Home-5G", value: "Home-5G" },
      { id: "n3", name: "Office-Guest", value: "Office-Guest" },
    ]
  }

  let wifiComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: "WidgetWiFi",
    access: "full",
    properties: {
      label: { name: "WiFi" },
      allowedModes: [1, 2, 3],
      confirmOnAP: true,
      componentClass: "",
    },
    eventHandler: { Header: "SET", Argument: "ModCfg", Variables: [] },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: "",
  })
  let forConstructor = $state(false)

  let codeText = $derived(`
<UI.WidgetWiFi
${formatObjectToString(wifiComponent.properties as IWidgetWiFiProps)}
onScan={handleScan}
onSave={handleSave}
/>`)
</script>

<ComponentExample {codeText} {readmeHtml} bind:forConstructor>
  {#snippet component()}
    <div class="m-auto w-full max-w-3xl">
      <WidgetWiFi {...wifiComponent.properties as IWidgetWiFiProps} onScan={mockScan} onSave={(cfg) => console.log("SET CFG (mock):", cfg)} />
    </div>
  {/snippet}
  {#snippet componentProps()}
    <WidgetWiFiProps
      component={wifiComponent as UIComponent & { properties: Partial<IWidgetWiFiProps> }}
      onPropertyChange={(updates) => (wifiComponent = updateComponent(wifiComponent, updates as object))}
    />
  {/snippet}
  {#snippet examples()}
    <div class="flex flex-col gap-6 p-2">
      <WidgetWiFi label={{ name: "WiFi" }} componentClass="bg-blue" onScan={mockScan} onSave={(cfg) => console.log("SET CFG (mock):", cfg)} />
      <WidgetWiFi label={{ name: "Только клиент" }} allowedModes={[1]} componentClass="bg-purple" onScan={mockScan} onSave={(cfg) => console.log("SET CFG (mock):", cfg)} />
    </div>
  {/snippet}
</ComponentExample>
