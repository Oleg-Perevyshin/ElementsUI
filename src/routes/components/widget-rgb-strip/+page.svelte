<script lang="ts">
  import { type UIComponent } from "$lib"
  import ComponentExample from "../../ComponentExample.svelte"
  import { updateComponent, type IWidgetRGBStripConfig, type IWidgetRGBStripProps } from "$lib/types"
  import WidgetRGBStrip from "$lib/WidgetRGBStrip/WidgetRGBStrip.svelte"
  import WidgetRGBStripProps from "$lib/WidgetRGBStrip/WidgetRGBStripProps.svelte"
  import { formatObjectToString, RenderMarkdown } from "../../common"
  import readmeRaw from "$lib/WidgetRGBStrip/README.md?raw"

  let readmeHtml = $state("")
  $effect(() => {
    RenderMarkdown(readmeRaw).then((html) => (readmeHtml = html))
  })

  /* Имитация устройства: поля группы LST как их отдаёт RGB_Strip */
  let strip: IWidgetRGBStripConfig = $state({ Color: [255, 120, 0, 0], Effect: 0, Speed: 3, Count: 64, Model: 0, Order: 0, MaxCount: 64 })

  let stripComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: "WidgetRGBStrip",
    access: "full",
    properties: { id: "LST", label: { name: "Светодиодная лента" }, componentClass: "" },
    eventHandler: { Header: "SET", Argument: "ModCfg", Variables: [] },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: "",
  })
  let forConstructor = $state(false)

  let codeText = $derived(`
<UI.WidgetRGBStrip
${formatObjectToString(stripComponent.properties as IWidgetRGBStripProps)}
value={strip}
onChange={(field, value) => send({ [\`LST.\${field}\`]: value })}
onSave={(hardware) => send({ "LST.Count": hardware.Count, "LST.Model": hardware.Model, "LST.Order": hardware.Order })}
/>`)
</script>

<ComponentExample {codeText} {readmeHtml} bind:forConstructor>
  {#snippet component()}
    <div class="m-auto w-full max-w-xl">
      <WidgetRGBStrip
        {...stripComponent.properties as IWidgetRGBStripProps}
        value={strip}
        onChange={(field, value) => (strip = { ...strip, [field]: value })}
        onSave={(hardware) => (strip = { ...strip, ...hardware })}
      />
    </div>
  {/snippet}
  {#snippet componentProps()}
    <WidgetRGBStripProps
      component={stripComponent as UIComponent & { properties: Partial<IWidgetRGBStripProps> }}
      onPropertyChange={(updates) => (stripComponent = updateComponent(stripComponent, updates as object))}
    />
  {/snippet}
  {#snippet examples()}
    <div class="m-auto flex w-full max-w-xl flex-col gap-6 p-2">
      <WidgetRGBStrip
        componentClass="bg-purple"
        label={{ name: "SK6812 с белым каналом" }}
        value={{ Color: [0, 80, 255, 120], Effect: 4, Speed: 5, Count: 30, Model: 1, Order: 0, MaxCount: 60 }}
        onChange={() => {}}
        onSave={() => {}}
      />
    </div>
  {/snippet}
</ComponentExample>
