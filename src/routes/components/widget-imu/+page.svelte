<script lang="ts">
  import { onDestroy } from "svelte"
  import { Language } from "#lib/locales/i18n.ts"
  import { localizeDeep } from "#lib/locales/localize.ts"
  import { type UIComponent } from "#lib"
  import { applyPropertyChange } from "#lib/propsEditor.ts"
  import ComponentExample from "../../ComponentExample.svelte"
  import { type IWidgetIMUData, type IWidgetIMUProps } from "#lib/types.ts"
  import WidgetIMU from "#lib/WidgetIMU/WidgetIMU.svelte"
  import WidgetIMUProps from "#lib/WidgetIMU/WidgetIMUProps.svelte"
  import { formatObjectToString, RenderMarkdown } from "../../common"
  import readmeRaw from "#lib/WidgetIMU/README.md?raw"

  let readmeHtml = $state("")
  $effect(() => {
    RenderMarkdown(readmeRaw).then((html) => (readmeHtml = html))
  })

  /* Имитация ICM42688 в покое: Cfg заводской (режим 1), шум отсчётов */
  const FACTORY_CFG = 2384345337
  let imu: Partial<IWidgetIMUData> = $state({ Cfg: FACTORY_CFG })
  const noise = (scale: number) => (Math.random() - 0.5) * scale
  const timer = setInterval(() => {
    imu = {
      ...imu,
      AX: -0.022 + noise(0.004),
      AY: 0.004 + noise(0.004),
      AZ: 1.011 + noise(0.004),
      GX: -0.18 + noise(0.1),
      GY: -0.49 + noise(0.1),
      GZ: 0.4 + noise(0.1),
      T: 30.4 + noise(0.1),
    }
  }, 200)
  onDestroy(() => clearInterval(timer))

  let imuComponent: UIComponent<"WidgetIMU"> = $state({
    id: crypto.randomUUID(),
    type: "WidgetIMU",
    access: "full",
    properties: { id: "IMUF", label: { name: "" }, chip: "ICM42688" },
    eventHandler: { Header: "SET", Argument: "ModuleConfig", Variables: [] },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: "",
  })

  let codeText = $derived(`
<UI.WidgetIMU
${formatObjectToString(imuComponent.properties as IWidgetIMUProps)}
value={imu}
onCalibrate={(cfg) => send({ "IMUF.Cfg": cfg })}
onRefresh={() => send("GET", "ModuleConfig", { CfgGroup: "IMUF" })}
/>`)
</script>

<ComponentExample {codeText} {readmeHtml}>
  {#snippet component()}
    <div class="m-auto w-full max-w-3xl">
      <WidgetIMU
        {...localizeDeep(imuComponent.properties, $Language) as IWidgetIMUProps}
        value={imu}
        onCalibrate={(cfg) => (imu = { ...imu, Cfg: cfg })}
        onSaveCfg={(cfg) => (imu = { ...imu, Cfg: cfg })}
        onRefresh={() => (imu = { ...imu, Cfg: FACTORY_CFG })}
      />
    </div>
  {/snippet}
  {#snippet componentProps()}
    <WidgetIMUProps component={imuComponent} onPropertyChange={(updates) => (imuComponent = applyPropertyChange(imuComponent, updates))} />
  {/snippet}
  {#snippet examples()}
    <div class="m-auto flex w-full max-w-md flex-col gap-6 p-2">
      <WidgetIMU accent="purple" label={{ name: "Без калибровки (только просмотр)" }} value={{ Cfg: 0, AX: 0, AY: 0, AZ: 0 }} />
    </div>
  {/snippet}
</ComponentExample>
