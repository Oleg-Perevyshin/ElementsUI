<!-- $lib/ElementsUI/DividerProps.svelte -->
<script lang="ts">
  import { T } from "$lib/locales/i18n"
  import { updateProperty, type IDividerProps, type IUIComponentHandler, type UIComponent } from "../types"
  import * as UI from "$lib"
  import { optionsStore } from "../options"
  import CommonSnippets from "$lib/CommonSnippets.svelte"

  const {
    component,
    onPropertyChange,
    forConstructor = true,
  } = $props<{
    component: UIComponent & { properties: Partial<IDividerProps> }
    onPropertyChange: (updates: Partial<{ properties?: string | object; name?: string; access?: string; eventHandler?: IUIComponentHandler }>) => void
    forConstructor?: boolean
  }>()

  let currentType = $derived($optionsStore.DIVIDER_TYPE_OPTIONS.find((t) => t.value === component.properties.type))
  let currentAnchor = $derived($optionsStore.DIVIDER_ANCHOR_OPTIONS.find((a) => a.value === component.properties.anchor))
</script>

{#snippet DividerType()}
  <UI.Select
    label={{ name: $T("constructor.props.divider.type") }}
    type="buttons"
    value={currentType}
    options={$optionsStore.DIVIDER_TYPE_OPTIONS}
    onUpdate={(item) => updateProperty("type", (item as UI.IOption).value as string, component, onPropertyChange)}
  />
{/snippet}

{#snippet DividerAnchor()}
  <UI.Select
    label={{ name: $T("constructor.props.divider.anchor") }}
    type="buttons"
    value={currentAnchor}
    options={$optionsStore.DIVIDER_ANCHOR_OPTIONS}
    onUpdate={(item) => updateProperty("anchor", (item as UI.IOption).value as string, component, onPropertyChange)}
  />
{/snippet}

{#snippet DividerSize()}
  <UI.Input
    label={{ name: $T("constructor.props.size") }}
    value={component.properties.size}
    onUpdate={(value) => updateProperty("size", value as number, component, onPropertyChange)}
    number={{ minNum: 0, maxNum: 200, step: 1 }}
    type="number"
  />
{/snippet}

{#if forConstructor}
  <div class="flex items-start justify-center gap-8">
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Access" {component} {onPropertyChange} />
    </div>
    <div class="flex w-1/3 flex-col px-2">
      {@render DividerType()}
      {@render DividerAnchor()}
    </div>
    <div class="flex w-1/3 flex-col px-2">
      {@render DividerSize()}
    </div>
  </div>
{:else}
  <div class="flex items-start justify-center gap-8">
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Identificator" {component} {onPropertyChange} />
      <CommonSnippets snippet="Access" {component} {onPropertyChange} />
      <CommonSnippets snippet="WrapperClass" {component} {onPropertyChange} />
    </div>
    <div class="flex w-1/3 flex-col px-2">
      {@render DividerType()}
      {@render DividerAnchor()}
    </div>
    <div class="flex w-1/3 flex-col px-2">
      {@render DividerSize()}
    </div>
  </div>
{/if}
