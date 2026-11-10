<!-- $lib/VideoViewer/VideoViewerProps.svelte - панель свойств конструктора для VideoViewer -->
<script lang="ts">
  import { T } from "../locales/i18n"
  import type { UIComponent, IVideoViewerProps } from "../types"
  import { createPropsEditor, type PropertyChange } from "../propsEditor"
  import * as UI from ".."
  import CommonSnippets from "../CommonSnippets.svelte"
  import PropsGroup from "../PropsGroup.svelte"

  const {
    component,
    onPropertyChange,
  }: {
    component: UIComponent<"VideoViewer">
    onPropertyChange: (change: PropertyChange<IVideoViewerProps>) => void
  } = $props()

  const edit = $derived(createPropsEditor(component, onPropertyChange))
</script>

<div class="flex flex-col gap-2">
  <PropsGroup label={$T("constructor.props.group.general")}>
    <CommonSnippets snippet="Access" {component} {onPropertyChange} />
  </PropsGroup>
  <PropsGroup label={$T("constructor.props.group.content")}>
    <CommonSnippets snippet="Label" {component} {onPropertyChange} />
    <UI.Switch
      label={{
        name: $T("constructor.props.video.viewer.source"),
        captionLeft: $T("constructor.props.video.viewer.source.camera"),
        captionRight: $T("constructor.props.video.viewer.source.remote"),
      }}
      value={component.properties.source === "remote" ? 1 : 0}
      onUpdate={(value) => edit.set("source", value === 1 ? "remote" : "camera")}
    />
  </PropsGroup>
  <PropsGroup label={$T("constructor.props.group.appearance")}>
    <UI.Switch
      label={{ name: $T("constructor.props.showSelect") }}
      value={component.properties.showSelect ? 1 : 0}
      onUpdate={(value) => edit.set("showSelect", value === 1)}
    />
    {#if component.properties.source === "remote"}
      <UI.Input
        label={{ name: $T("constructor.props.video.viewer.stream.key") }}
        value={component.properties.streamKey ?? ""}
        onUpdate={(value) => edit.set("streamKey", String(value))}
      />
    {/if}
    <CommonSnippets snippet="Accent" {component} {onPropertyChange} />
  </PropsGroup>
</div>
