<script lang="ts">
  import { Language } from "#lib/locales/i18n.ts"
  import { localizeDeep } from "#lib/locales/localize.ts"
  import { type IDividerProps, type UIComponent } from "#lib"
  import { applyPropertyChange } from "#lib/propsEditor.ts"
  import ComponentExample from "../../ComponentExample.svelte"
  import Divider from "#lib/Divider/Divider.svelte"
  import DividerProps from "#lib/Divider/DividerProps.svelte"
  import { formatObjectToString, RenderMarkdown } from "../../common"
  import readmeRaw from "#lib/Divider/README.md?raw"

  let readmeHtml = $state("")
  $effect(() => {
    RenderMarkdown(readmeRaw).then((html) => (readmeHtml = html))
  })

  let dividerComponent: UIComponent<"Divider"> = $state({
    id: crypto.randomUUID(),
    type: "Divider",
    access: "full",
    properties: {
      id: crypto.randomUUID(),
      wrapperClass: "",
      type: "line",
      width: 2,
      anchor: "center",
    },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: "",
  })

  let codeText = $derived(`
<UI.Divider
${formatObjectToString(dividerComponent.properties as IDividerProps)}
/>`)
</script>

<ComponentExample {codeText} {readmeHtml}>
  {#snippet component()}
    <div class="h-24 w-full border border-dashed border-gray-500">
      <Divider {...localizeDeep(dividerComponent.properties, $Language) as IDividerProps} />
    </div>
  {/snippet}
  {#snippet componentProps()}
    <DividerProps component={dividerComponent} onPropertyChange={(updates) => (dividerComponent = applyPropertyChange(dividerComponent, updates))} />
  {/snippet}
  {#snippet examples()}
    <div class="flex flex-col gap-2">
      <div class="h-16 w-full border border-dashed border-gray-500">
        <Divider type="line" width={2} anchor="top" />
      </div>
      <div class="h-16 w-full border border-dashed border-gray-500">
        <Divider type="line" width={2} accent="blue" anchor="center" />
      </div>
      <div class="h-16 w-full border border-dashed border-gray-500">
        <Divider type="line" width={4} accent="red" anchor="bottom" />
      </div>
      <div class="h-16 w-full border border-dashed border-gray-500">
        <Divider type="empty" />
      </div>
    </div>
  {/snippet}
</ComponentExample>
