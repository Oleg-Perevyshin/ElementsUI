<script lang="ts">
  import { onDestroy } from "svelte"
  import { Language } from "#lib/locales/i18n.ts"
  import { localizeDeep } from "#lib/locales/localize.ts"
  import { type UIComponent } from "#lib"
  import { applyPropertyChange } from "#lib/propsEditor.ts"
  import ComponentExample from "../../ComponentExample.svelte"
  import { type IWidgetHomingData, type IWidgetHomingProps } from "#lib/types.ts"
  import WidgetHoming from "#lib/WidgetHoming/WidgetHoming.svelte"
  import WidgetHomingProps from "#lib/WidgetHoming/WidgetHomingProps.svelte"
  import { formatObjectToString, RenderMarkdown } from "../../common"
  import readmeRaw from "#lib/WidgetHoming/README.md?raw"

  let readmeHtml = $state("")
  $effect(() => {
    RenderMarkdown(readmeRaw).then((html) => (readmeHtml = html))
  })

  /* Имитация привода с механическими упорами 108.7° и 219.6°: поиск - вал к нижнему упору, к верхнему и домой */
  const STOPS = [108.7, 219.6]
  const initialHome: Partial<IWidgetHomingData> = {
    Type: 1,
    St: 0,
    Err: 0,
    Found: 0,
    Lo: 0,
    Hi: 0,
    Pos: 167.7,
    Off: 0,
    Speed: 20,
    Marg: 2,
    Force: 100,
    Lag: 1.5,
  }
  let home = $state({ ...initialHome })
  let target: number[] = []
  let passes: { pos: number; phase: number }[] = []

  let linearPos = $state(35)
  let linearSettings = $state({ Dir: -1, Speed: 10, Backoff: 2, FineSpeed: 1 })
  let searchFailed = $state(false)
  let homeComponent: UIComponent<"WidgetHoming"> = $state({
    id: crypto.randomUUID(),
    type: "WidgetHoming",
    access: "full",
    properties: { id: "HOME", label: { name: "" }, searchMs: 60000 },
    eventHandler: { Header: "SET", Argument: "ModuleConfig", Variables: [] },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: "",
  })

  const demoMode = $derived(homeComponent.properties.mode ?? "rotary")
  const singleSensor = $derived(demoMode === "linear" || demoMode === "rotarySensor")
  const stops = $derived(demoMode === "linearSensors" ? [-50, 450] : STOPS)
  const sensorPos = -5
  const displayPos = (v: number) => (demoMode === "rotarySensor" ? ((v % 360) + 360) % 360 : v)
  $effect(() => {
    const selected = demoMode
    linearPos = 35
    linearTarget = undefined
    referenced = false
    searchFailed = false
    phase = 0
    passes = []
    target = []
    home = { ...initialHome, ...(selected === "linearSensors" ? { Pos: 35, Dir: -1, Backoff: 2, FineSpeed: 1 } : {}) }
  })
  let linearTarget = $state<number>()
  let phase = $state(0)
  const referencing = $derived(phase !== 0)
  let referenced = $state(false)
  const timer = setInterval(() => {
    if (singleSensor) {
      if (linearTarget === undefined) return
      const left = linearTarget - linearPos
      const speed = phase === 3 ? linearSettings.FineSpeed : referencing ? linearSettings.Speed : 10
      linearPos = Math.abs(left) <= speed * 0.1 ? linearTarget : linearPos + Math.sign(left) * speed * 0.1
      if (linearPos === linearTarget) {
        if (phase === 1 && linearPos === sensorPos) {
          phase = 2
          linearTarget = sensorPos - linearSettings.Dir * linearSettings.Backoff
          return
        }
        if (phase === 2 && linearPos !== sensorPos) {
          phase = 3
          linearTarget = sensorPos
          return
        }
        if (referencing) {
          searchFailed = phase !== 3 || linearPos !== sensorPos
          referenced = !searchFailed
        }
        phase = 0
        linearTarget = undefined
      }
      return
    }
    if (passes.length) {
      const pass = passes[0]
      const pos = Number(home.Pos)
      const step = Number(pass.phase === 3 ? home.FineSpeed : home.Speed) * 0.1
      const left = pass.pos - pos
      const next = Math.abs(left) <= step ? pass.pos : pos + Math.sign(left) * step
      home = { ...home, Pos: next, Phase: pass.phase }
      if (next === pass.pos) {
        passes.shift()
        if (pass.phase === 3) {
          if (pass.pos === stops[0]) home.Lo = next
          else home.Hi = next
        }
        if (!passes.length) home = { ...home, St: 2, Found: 1, Phase: 0 }
      }
      return
    }
    if (!target.length) return
    const pos = Number(home.Pos)
    const step = (Number(home.Speed) || 20) * 0.1 * 4
    const next = Math.abs(target[0] - pos) <= step ? target.shift()! : pos + Math.sign(target[0] - pos) * step
    home = { ...home, Pos: next }
    if (!target.length) home = { ...home, St: 2, Found: 1, Lo: stops[0], Hi: stops[1] }
  }, 100)
  onDestroy(() => clearInterval(timer))
  const center = () => (stops[0] + stops[1]) / 2 + (Number(home.Off) || 0)

  let codeText = $derived(`
<UI.WidgetHoming
${formatObjectToString(homeComponent.properties as IWidgetHomingProps)}
value={home}
onSearch={() => send("SET", "MotionHome", { Search: 1 })}
onHome={() => send("SET", "MotionHome", {})}
onSave={(values) => send("SET", "ModuleConfig", values)}
onRefresh={() => send("GET", "ModuleConfig", { CfgGroup: "HOME" })}
/>`)
</script>

<ComponentExample {codeText} {readmeHtml}>
  {#snippet component()}
    <div class="m-auto flex w-full max-w-3xl flex-col gap-3">
      <WidgetHoming
        {...localizeDeep(homeComponent.properties, $Language) as IWidgetHomingProps}
        value={singleSensor
          ? {
              ...linearSettings,
              Phase: phase,
              St: referencing ? 1 : searchFailed ? 3 : referenced ? 2 : 0,
              Found: Number(referenced),
              Pos: displayPos(linearPos),
              SensorPos: displayPos(sensorPos),
              Sensor: Number(linearPos === sensorPos),
            }
          : home}
        onSearch={() => {
          if (singleSensor) {
            referenced = false
            phase = linearPos === sensorPos ? 2 : 1
            searchFailed = false
            linearTarget =
              phase === 2
                ? sensorPos - linearSettings.Dir * linearSettings.Backoff
                : (sensorPos - linearPos) * linearSettings.Dir >= 0
                  ? sensorPos
                  : linearSettings.Dir > 0
                    ? demoMode === "rotarySensor"
                      ? 45
                      : 50
                    : demoMode === "rotarySensor"
                      ? -310
                      : -50
            return
          }
          home = { ...home, St: 1, Err: 0 }
          if (demoMode === "linearSensors") {
            target = []
            const ends = home.Dir === 1 ? [stops[1], stops[0]] : stops
            passes = ends.flatMap((pos) => [
              { pos, phase: 1 },
              { pos: pos + (pos === stops[0] ? 1 : -1) * Number(home.Backoff), phase: 2 },
              { pos, phase: 3 },
            ])
            passes.push({ pos: center(), phase: 4 })
          } else target = [stops[0], stops[1], center()]
        }}
        onHome={() => {
          if (singleSensor) linearTarget = 0
          else target = [home.Found ? center() : Number(home.Off) || 0]
        }}
        onSave={(values) => {
          if (singleSensor)
            linearSettings = {
              Dir: values.Dir ?? linearSettings.Dir,
              Speed: values.Speed ?? linearSettings.Speed,
              Backoff: values.Backoff ?? linearSettings.Backoff,
              FineSpeed: values.FineSpeed ?? linearSettings.FineSpeed,
            }
          else home = { ...home, ...values }
        }}
        onRefresh={() => {}}
      />
    </div>
  {/snippet}
  {#snippet componentProps()}
    <WidgetHomingProps component={homeComponent} onPropertyChange={(updates) => (homeComponent = applyPropertyChange(homeComponent, updates))} />
  {/snippet}
  {#snippet examples()}
    <div class="m-auto flex w-full max-w-md flex-col gap-6 p-2">
      <WidgetHoming
        accent="orange"
        label={{ name: "Отказ поиска (только просмотр)" }}
        value={{ Type: 1, St: 3, Err: 2070, Found: 1, Lo: 108.7, Hi: 219.6, Pos: 230.1, Off: 0, Speed: 20, Marg: 2, Force: 100, Lag: 1.5 }}
      />
      <WidgetHoming label={{ name: "Базы нет" }} value={{ Type: 0, St: 0, Off: 90, Speed: 20, Marg: 2 }} onHome={() => {}} />
    </div>
  {/snippet}
</ComponentExample>
