<script lang="ts">
  import { type UIComponent } from "$lib"
  import ComponentExample from "$lib/ComponentExample.svelte"
  import { updateComponent, type IWidgetStackInfo, type IWidgetStackInfoProps } from "$lib/types"
  import WidgetStackInfo from "$lib/WidgetStackInfo/WidgetStackInfo.svelte"
  import WidgetStackInfoProps from "$lib/WidgetStackInfo/WidgetStackInfoProps.svelte"
  import { formatObjectToString, RenderMarkdown } from "../../common"
  import readmeRaw from "$lib/WidgetStackInfo/README.md?raw"

  let readmeHtml = $state("")
  $effect(() => {
    RenderMarkdown(readmeRaw).then((html) => (readmeHtml = html))
  })

  /* Имитация устройства: StackInfo как его отдаёт API_GetStackInfo (ESP), на каждый опрос куча слегка «гуляет» */
  const makeInfo = (): IWidgetStackInfo => {
    const jitter = Math.round(Math.random() * 20000)
    return {
      Heap: [
        { Name: "Internal", Total: 327680, Free: 118000 - jitter, MinFree: 92000 },
        { Name: "Default", Total: 4521984, Free: 4100000 - jitter, MinFree: 4040000 },
      ],
      Tasks: [
        { Name: "api_task", FreeMin: 1240, Prio: 5, Core: 1, State: 2 },
        { Name: "IDLE0", FreeMin: 620, Prio: 0, Core: 0, State: 1 },
        { Name: "IDLE1", FreeMin: 640, Prio: 0, Core: 1, State: 0 },
        { Name: "Tmr Svc", FreeMin: 1580, Prio: 1, Core: 0, State: 2 },
        { Name: "WSC Monitor", FreeMin: 410, Prio: 5, Core: -1, State: 2 },
        { Name: "httpd", FreeMin: 2876, Prio: 5, Core: -1, State: 2 },
        { Name: "UDP", FreeMin: 980, Prio: 8, Core: -1, State: 2 },
        { Name: "esp_timer", FreeMin: 3220, Prio: 22, Core: 0, State: 2 },
        { Name: "wifi", FreeMin: 1712, Prio: 23, Core: 0, State: 2 },
        { Name: "sys_evt", FreeMin: 772, Prio: 20, Core: 0, State: 3 },
        { Name: "<b>tcpip</b>", FreeMin: 1904, Prio: 18, Core: -1, State: 2 },
      ],
    }
  }
  let stackInfo: IWidgetStackInfo | undefined = $state(makeInfo())

  let stackComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: "WidgetStackInfo",
    access: "full",
    properties: {
      label: { name: "Память и задачи" },
      componentClass: "",
      warnBytes: 512,
    },
    eventHandler: { Header: "GET", Argument: "StackInfo", Variables: [] },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: "",
  })
  let forConstructor = $state(false)

  let codeText = $derived(`
<UI.WidgetStackInfo
${formatObjectToString(stackComponent.properties as IWidgetStackInfoProps)}
value={stackInfo}
onRefresh={handleRefresh}
/>`)
</script>

<ComponentExample {codeText} {readmeHtml} bind:forConstructor>
  {#snippet component()}
    <div class="m-auto w-full max-w-3xl">
      <WidgetStackInfo {...stackComponent.properties as IWidgetStackInfoProps} value={stackInfo} onRefresh={() => (stackInfo = makeInfo())} />
    </div>
  {/snippet}
  {#snippet componentProps()}
    <WidgetStackInfoProps
      component={stackComponent as UIComponent & { properties: Partial<IWidgetStackInfoProps> }}
      onPropertyChange={(updates) => (stackComponent = updateComponent(stackComponent, updates as object))}
    />
  {/snippet}
  {#snippet examples()}
    <div class="flex flex-col gap-6 p-2">
      <WidgetStackInfo
        componentClass="bg-green"
        label={{ name: "STM32: одна куча, без ядра" }}
        value={{
          Heap: [{ Name: "Heap", Total: 65536, Free: 12800, MinFree: 6200 }],
          Tasks: [
            { Name: "IDLE", FreeMin: 312, Prio: 0, State: 1 },
            { Name: "api_task", FreeMin: 1096, Prio: 3, State: 2 },
            { Name: "can_rx", FreeMin: 704, Prio: 4, State: 2 },
          ],
        }}
      />
      <WidgetStackInfo componentClass="bg-blue" label={{ name: "Нет данных" }} onRefresh={() => {}} />
    </div>
  {/snippet}
</ComponentExample>
