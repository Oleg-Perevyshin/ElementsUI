<script lang="ts">
  import { T } from "$lib/locales/i18n"
  import { updateProperty, type IUIComponentHandler, type UIComponent } from "../types"
  import * as UI from "$lib"
  import CommonSnippets from "$lib/CommonSnippets.svelte"
  import PropsGroup from "$lib/PropsGroup.svelte"
  import { optionsStore } from "$lib/options"

  const {
    component,
    onPropertyChange,
    forConstructor = true,
  } = $props<{
    component: UIComponent & { properties: Partial<UI.IVideoViewerProps> }
    onPropertyChange: (updates: Partial<{ properties?: string | object; name?: string; access?: string; eventHandler?: IUIComponentHandler }>) => void
    forConstructor?: boolean
  }>()

  const initialColor = $derived(
    $optionsStore.COLOR_OPTIONS.find((c) =>
      (c.value as string).includes(component.properties.wrapperClass?.split(" ").find((cls: string) => cls.startsWith("bg-"))),
    ),
  )
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
    label={{
      name: $T("constructor.props.video.viewer.source"),
      captionLeft: $T("constructor.props.video.viewer.source.camera"),
      captionRight: $T("constructor.props.video.viewer.source.remote"),
    }}
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
  <div class="flex flex-col gap-2">
    <PropsGroup label={$T("constructor.props.group.general")}>
      <CommonSnippets snippet="Access" {component} {onPropertyChange} />
    </PropsGroup>
    <PropsGroup label={$T("constructor.props.group.content")}>
      <CommonSnippets snippet="Label" {component} {onPropertyChange} />
      {@render VideoViewerSource()}
    </PropsGroup>
    <PropsGroup label={$T("constructor.props.group.appearance")}>
      {@render VideoViewershowSelect()}
      {#if component.properties?.source === "remote"}
        {@render VideoViewerStreamKey()}
      {/if}
      <CommonSnippets snippet="Colors" initialValue={{ color: initialColor }} {component} {onPropertyChange} />
    </PropsGroup>
  </div>
{:else}
  <div class="flex flex-col gap-2">
    <PropsGroup label={$T("constructor.props.group.general")}>
      <CommonSnippets snippet="Identificator" {component} {onPropertyChange} />
      <CommonSnippets snippet="Access" {component} {onPropertyChange} />
    </PropsGroup>
    <PropsGroup label={$T("constructor.props.group.content")}>
      <CommonSnippets snippet="WrapperClass" {component} {onPropertyChange} />
      <CommonSnippets snippet="Label" {component} {onPropertyChange} />
      {@render VideoViewerSource()}
    </PropsGroup>
    <PropsGroup label={$T("constructor.props.group.appearance")}>
      {@render VideoViewershowSelect()}
      {#if component.properties?.source === "remote"}
        {@render VideoViewerStreamKey()}
      {/if}
      <CommonSnippets snippet="Colors" initialValue={{ color: initialColor }} {component} {onPropertyChange} />
    </PropsGroup>
  </div>
{/if}
