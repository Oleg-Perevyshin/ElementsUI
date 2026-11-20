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
  let home: Partial<IWidgetHomingData> = $state({
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
  })
  let target: number[] = []
  const timer = setInterval(() => {
    if (!target.length) return
    const pos = Number(home.Pos)
    const step = (Number(home.Speed) || 20) * 0.1 * 4
    const next = Math.abs(target[0] - pos) <= step ? target.shift()! : pos + Math.sign(target[0] - pos) * step
    home = { ...home, Pos: next }
    if (!target.length) home = { ...home, St: 2, Found: 1, Lo: STOPS[0], Hi: STOPS[1] }
  }, 100)
  onDestroy(() => clearInterval(timer))
  const center = () => (STOPS[0] + STOPS[1]) / 2 + (Number(home.Off) || 0)

  let homeComponent: UIComponent<"WidgetHoming"> = $state({
    id: crypto.randomUUID(),
    type: "WidgetHoming",
    access: "full",
    properties: { id: "HOME", label: { name: "" }, searchMs: 60000 },
    eventHandler: { Header: "SET", Argument: "ModuleConfig", Variables: [] },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: "",
  })

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
    <div class="m-auto w-full max-w-3xl">
      <WidgetHoming
        {...localizeDeep(homeComponent.properties, $Language) as IWidgetHomingProps}
        value={home}
        onSearch={() => {
          home = { ...home, St: 1, Err: 0 }
          target = [STOPS[0], STOPS[1], center()]
        }}
        onHome={() => (target = [home.Found ? center() : Number(home.Off) || 0])}
        onSave={(values) => (home = { ...home, ...values })}
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
