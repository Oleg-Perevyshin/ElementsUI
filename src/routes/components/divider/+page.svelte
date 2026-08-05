<script lang="ts">
  import { type IDividerProps, type UIComponent } from "$lib"
  import ComponentExample from "$lib/ComponentExample.svelte"
  import Divider from "$lib/Divider/Divider.svelte"
  import DividerProps from "$lib/Divider/DividerProps.svelte"
  import { updateComponent } from "$lib/types"
  import { formatObjectToString, RenderMarkdown } from "../../common"
  import readmeRaw from "$lib/Divider/README.md?raw"

  let readmeHtml = $state("")
  $effect(() => {
    RenderMarkdown(readmeRaw).then((html) => (readmeHtml = html))
  })

  let dividerComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: "Divider",
    access: "full",
    properties: {
      id: crypto.randomUUID(),
      wrapperClass: "",
      type: "line",
      width: 2,
      color: "bg-max",
      anchor: "center",
    },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: "",
  })

  let forConstructor = $state(false)

  let codeText = $derived(`
<UI.Divider
${formatObjectToString(dividerComponent.properties as IDividerProps)}
/>`)
</script>

<ComponentExample {codeText} {readmeHtml} bind:forConstructor>
  {#snippet component()}
    <div class="h-24 w-full border border-dashed border-gray-500">
      <Divider {...dividerComponent.properties as IDividerProps} />
    </div>
  {/snippet}
  {#snippet componentProps()}
    <DividerProps
      component={dividerComponent as UIComponent & { properties: Partial<IDividerProps> }}
      onPropertyChange={(updates) => (dividerComponent = updateComponent(dividerComponent, updates as object))}
      {forConstructor}
    />
  {/snippet}
  {#snippet examples()}
    <div class="flex flex-col gap-2">
      <div class="h-16 w-full border border-dashed border-gray-500">
        <Divider type="line" width={2} color="bg-max" anchor="top" />
      </div>
      <div class="h-16 w-full border border-dashed border-gray-500">
        <Divider type="line" width={2} color="bg-blue" anchor="center" />
      </div>
      <div class="h-16 w-full border border-dashed border-gray-500">
        <Divider type="line" width={4} color="bg-red" anchor="bottom" />
      </div>
      <div class="h-16 w-full border border-dashed border-gray-500">
        <Divider type="empty" />
      </div>
    </div>
  {/snippet}
</ComponentExample>
