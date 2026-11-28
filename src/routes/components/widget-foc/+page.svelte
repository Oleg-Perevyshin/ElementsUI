<script lang="ts">
  import { onDestroy } from "svelte"
  import { Language } from "#lib/locales/i18n.ts"
  import { localizeDeep } from "#lib/locales/localize.ts"
  import { type UIComponent } from "#lib"
  import { applyPropertyChange } from "#lib/propsEditor.ts"
  import ComponentExample from "../../ComponentExample.svelte"
  import { type IWidgetFOCData, type IWidgetFOCProps } from "#lib/types.ts"
  import WidgetFOC from "#lib/WidgetFOC/WidgetFOC.svelte"
  import WidgetFOCProps from "#lib/WidgetFOC/WidgetFOCProps.svelte"
  import { formatObjectToString, RenderMarkdown } from "../../common"
  import readmeRaw from "#lib/WidgetFOC/README.md?raw"

  let readmeHtml = $state("")
  $effect(() => {
    RenderMarkdown(readmeRaw).then((html) => (readmeHtml = html))
  })

  /* Имитация привода подвеса 491-03: мотор DC-3514C, держит угол около 164° */
  const FACTORY: Partial<IWidgetFOCData> = {
    M_Type: 0,
    M_PP: 7,
    M_R: 2.6,
    M_L: 0.0026,
    M_KV: 200,
    M_Dir: 1,
    ZEA: 61.2,
    M_VL: 4,
    M_CL: 0.15,
    M_VLL: 1432.4,
    M_CTO: 200,
    M_Torq: 0,
    M_Mod: 0,
    C_Kp: 1.634,
    C_Ki: 1633.6,
    C_Kd: 0,
    C_Lim: 4,
    C_Ramp: 0,
    V_Kp: 0.00236,
    V_Ki: 0.0733,
    V_Kd: 0,
    V_Lim: 4,
    V_Ramp: 800,
    A_Kp: 42,
    A_Lim: 1432.4,
    A_Ramp: 0,
    S_Gain: -0.0543,
    S_OffA: 1.246,
    S_OffB: 1.247,
    S_OffC: 1.244,
    S_VTf: 0.005,
    S_CTf: 0.00032,
    TuneHz: 40,
    Run: 0,
  }
  let foc: Partial<IWidgetFOCData> = $state({ ...FACTORY, Ang: 164.3, Vel: 0, Iq: -0.004, Uq: 0.03, Flg: 0x11 })
  const timer = setInterval(() => {
    const on = (Number(foc.Flg) & 1) === 1
    foc = {
      ...foc,
      Ang: 164.3 + (Math.random() - 0.5) * 0.1,
      Vel: on ? (Math.random() - 0.5) * 0.4 : 0,
      Iq: on ? -0.004 + (Math.random() - 0.5) * 0.01 : 0,
      Uq: on ? 0.03 : 0,
    }
  }, 1000)
  onDestroy(() => clearInterval(timer))
  const pulse = (bit: number, ms: number) => {
    foc = { ...foc, Flg: Number(foc.Flg) | bit }
    setTimeout(() => (foc = { ...foc, Flg: Number(foc.Flg) & ~bit }), ms)
  }

  let focComponent: UIComponent<"WidgetFOC"> = $state({
    id: crypto.randomUUID(),
    type: "WidgetFOC",
    access: "full",
    properties: { id: "FOC", label: { name: "" }, refreshMs: 1000 },
    eventHandler: { Header: "SET", Argument: "ModuleConfig", Variables: [] },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: "",
  })

  let codeText = $derived(`
<UI.WidgetFOC
${formatObjectToString(focComponent.properties as IWidgetFOCProps)}
value={foc}
onEnable={(on) => send("SET", "MotionEnable", { On: on ? 1 : 0 })}
onZero={() => send("SET", "MotionCalibrate", {})}
onTune={(hz) => send("SET", "ModuleConfig", { "FOC.TuneHz": hz, "FOC.Run": 1 })}
onSave={(values) => send("SET", "ModuleConfig", values)}
onDefaults={() => send("SET", "SystemDefaultConfig", { CfgGroup: "FOC" })}
onRefresh={() => send("GET", "ModuleConfig", { CfgGroup: "FOC" })}
/>`)
</script>

<ComponentExample {codeText} {readmeHtml}>
  {#snippet component()}
    <div class="m-auto w-full max-w-3xl">
      <WidgetFOC
        {...localizeDeep(focComponent.properties, $Language) as IWidgetFOCProps}
        value={foc}
        onEnable={(on) => (foc = { ...foc, Flg: on ? Number(foc.Flg) | 1 : Number(foc.Flg) & ~1 })}
        onZero={() => pulse(0x04, 1300)}
        onTune={(hz) => {
          foc = { ...foc, TuneHz: hz }
          pulse(0x20, 1000)
        }}
        onSave={(values) => {
          const next = { ...foc, ...values }
          foc = { ...next, C_Lim: next.M_VL, V_Lim: next.M_Torq === 0 ? next.M_VL : next.M_CL }
        }}
        onDefaults={() => (foc = { ...foc, ...FACTORY })}
        onRefresh={() => {}}
      />
    </div>
  {/snippet}
  {#snippet componentProps()}
    <WidgetFOCProps component={focComponent} onPropertyChange={(updates) => (focComponent = applyPropertyChange(focComponent, updates))} />
  {/snippet}
  {#snippet examples()}
    <div class="m-auto flex w-full max-w-md flex-col gap-6 p-2">
      <WidgetFOC
        accent="orange"
        label={{ name: "Выключен, ноль не найден (только просмотр)" }}
        value={{ ...FACTORY, Ang: 12.5, Vel: 0, Iq: 0, Uq: 0, Flg: 0 }}
      />
    </div>
  {/snippet}
</ComponentExample>
