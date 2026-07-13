<script lang="ts">
  import { T } from "$lib/locales/i18n"
  import { updateProperty, type IUIComponentHandler, type UIComponent } from "../types"
  import * as UI from "$lib"
  import CommonSnippets from "$lib/CommonSnippets.svelte"

  const {
    component,
    onPropertyChange,
    forConstructor = true,
  } = $props<{
    component: UIComponent & { properties: Partial<UI.IVideoViewerProps> }
    onPropertyChange: (updates: Partial<{ properties?: string | object; name?: string; access?: string; eventHandler?: IUIComponentHandler }>) => void
    forConstructor?: boolean
  }>()
</script>

{#snippet VideoViewershowSelect()}
  <UI.Switch
    label={{ name: $T("constructor.props.showSelect") }}
    value={component.properties?.showSelect ? 1 : 0}
    options={[{ id: crypto.randomUUID(), value: 0, class: "" }]}
    onChange={(value) => updateProperty("showSelect", value, component, onPropertyChange)}
  />
{/snippet}

{#snippet VideoViewerSource()}
  <UI.Switch
    label={{ name: $T("constructor.props.video.viewer.source"), captionLeft: $T("constructor.props.video.viewer.source.camera"), captionRight: $T("constructor.props.video.viewer.source.remote") }}
    value={component.properties?.source === "remote" ? 1 : 0}
    options={[{ id: crypto.randomUUID(), value: 0, class: "" }]}
    onChange={(value) => updateProperty("source", value === 1 ? "remote" : "camera", component, onPropertyChange)}
  />
{/snippet}

{#snippet VideoViewerStreamKey()}
  <UI.Input
    label={{ name: $T("constructor.props.video.viewer.stream.key") }}
    value={component.properties?.streamKey ?? ""}
    onUpdate={(value) => updateProperty("streamKey", value, component, onPropertyChange)}
  />
{/snippet}

{#if forConstructor}
  <div class="flex mb-4 justify-center gap-8">
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Access" {component} {onPropertyChange} />
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Label" {component} {onPropertyChange} />
      {@render VideoViewerSource()}
    </div>
    <div class="flex w-1/3 flex-col px-2">
      {@render VideoViewershowSelect()}
      {#if component.properties?.source === "remote"}
        {@render VideoViewerStreamKey()}
      {/if}
    </div>
  </div>
{:else}
  <div class="flex mb-4 justify-center gap-8">
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Identificator" {component} {onPropertyChange} />
      <CommonSnippets snippet="Access" {component} {onPropertyChange} />
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="WrapperClass" {component} {onPropertyChange} />
      <CommonSnippets snippet="Label" {component} {onPropertyChange} />
      {@render VideoViewerSource()}
    </div>
    <div class="flex w-1/3 flex-col px-2">
      {@render VideoViewershowSelect()}
      {#if component.properties?.source === "remote"}
        {@render VideoViewerStreamKey()}
      {/if}
    </div>
  </div>
{/if}
