<script lang="ts">
  import { Language } from "#lib/locales/i18n.ts"
  import { localizeDeep } from "#lib/locales/localize.ts"
  import { type UIComponent } from "#lib"
  import { applyPropertyChange } from "#lib/propsEditor.ts"
  import ComponentExample from "../../ComponentExample.svelte"
  import { type IWidgetDeviceInfoProps } from "#lib/types.ts"
  import WidgetDeviceInfo from "#lib/WidgetDeviceInfo/WidgetDeviceInfo.svelte"
  import WidgetDeviceInfoProps from "#lib/WidgetDeviceInfo/WidgetDeviceInfoProps.svelte"
  import { formatObjectToString, RenderMarkdown } from "../../common"
  import readmeRaw from "#lib/WidgetDeviceInfo/README.md?raw"

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

  let deviceInfoComponent: UIComponent<"WidgetDeviceInfo"> = $state({
    id: crypto.randomUUID(),
    type: "WidgetDeviceInfo",
    access: "full",
    properties: {
      label: { name: "" },
    },
    eventHandler: { Header: "SET", Argument: "ModCfg", Variables: [] },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: "",
  })

  let codeText = $derived(`
<UI.WidgetDeviceInfo
${formatObjectToString(deviceInfoComponent.properties as IWidgetDeviceInfoProps)}
value={deviceInfo}
onSave={handleSave}
onRestart={handleRestart}
onFactoryReset={handleFactoryReset}
/>`)
</script>

<ComponentExample {codeText} {readmeHtml}>
  {#snippet component()}
    <div class="m-auto w-full max-w-3xl">
      <WidgetDeviceInfo
        {...localizeDeep(deviceInfoComponent.properties, $Language) as IWidgetDeviceInfoProps}
        value={mockValue}
        onSave={(info) => console.log("SET CFG (mock):", info)}
        onRestart={() => console.log("RESTART (mock)")}
        onFactoryReset={() => console.log("FACTORY RESET (mock)")}
      />
    </div>
  {/snippet}
  {#snippet componentProps()}
    <WidgetDeviceInfoProps
      component={deviceInfoComponent}
      onPropertyChange={(updates) => (deviceInfoComponent = applyPropertyChange(deviceInfoComponent, updates))}
    />
  {/snippet}
  {#snippet examples()}
    <div class="flex flex-col gap-6 p-2">
      <WidgetDeviceInfo
        value={mockValue}
        accent="green"
        onSave={(info) => console.log("SET CFG (mock):", info)}
        onRestart={() => console.log("RESTART (mock)")}
        onFactoryReset={() => console.log("FACTORY RESET (mock)")}
      />
    </div>
  {/snippet}
</ComponentExample>
