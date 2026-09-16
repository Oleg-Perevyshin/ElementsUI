<script lang="ts">
  import { type UIComponent } from "$lib"
  import ComponentExample from "$lib/ComponentExample.svelte"
  import { updateComponent, type IWidgetDeviceInfoProps } from "$lib/types"
  import WidgetDeviceInfo from "$lib/WidgetDeviceInfo/WidgetDeviceInfo.svelte"
  import WidgetDeviceInfoProps from "$lib/WidgetDeviceInfo/WidgetDeviceInfoProps.svelte"
  import { formatObjectToString, RenderMarkdown } from "../../common"
  import readmeRaw from "$lib/WidgetDeviceInfo/README.md?raw"

  let readmeHtml = $state("")
  $effect(() => {
    RenderMarkdown(readmeRaw).then((html) => (readmeHtml = html))
  })

  const mockValue = {
    DevSN: "00.00.000-00_0000AC670000B22B00007428:DBC5",
    DevID: "20.00.000-01",
    DevFW: 1.4,
    RunCnt: 128,
    DevName: "SYP-Device-01",
    HostName: "syp-device-01",
    WebUser: "admin",
    WebPsw: "",
    StaIP: "192.168.1.42",
    ApIP: "192.168.4.1",
  }

  let deviceInfoComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: "WidgetDeviceInfo",
    access: "full",
    properties: {
      label: { name: "Информация об устройстве" },
      componentClass: "",
    },
    eventHandler: { Header: "SET", Argument: "ModCfg", Variables: [] },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: "",
  })
  let forConstructor = $state(false)

  let codeText = $derived(`
<UI.WidgetDeviceInfo
${formatObjectToString(deviceInfoComponent.properties as IWidgetDeviceInfoProps)}
value={deviceInfo}
onSave={handleSave}
onRestart={handleRestart}
/>`)
</script>

<ComponentExample {codeText} {readmeHtml} bind:forConstructor>
  {#snippet component()}
    <div class="m-auto w-full max-w-3xl">
      <WidgetDeviceInfo
        {...deviceInfoComponent.properties as IWidgetDeviceInfoProps}
        value={mockValue}
        onSave={(info) => console.log("SET CFG (mock):", info)}
        onRestart={() => console.log("RESTART (mock)")}
      />
    </div>
  {/snippet}
  {#snippet componentProps()}
    <WidgetDeviceInfoProps
      component={deviceInfoComponent as UIComponent & { properties: Partial<IWidgetDeviceInfoProps> }}
      onPropertyChange={(updates) => (deviceInfoComponent = updateComponent(deviceInfoComponent, updates as object))}
    />
  {/snippet}
  {#snippet examples()}
    <div class="flex flex-col gap-6 p-2">
      <WidgetDeviceInfo
        value={mockValue}
        componentClass="bg-green"
        onSave={(info) => console.log("SET CFG (mock):", info)}
        onRestart={() => console.log("RESTART (mock)")}
      />
    </div>
  {/snippet}
</ComponentExample>
