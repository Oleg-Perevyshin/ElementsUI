<!-- $lib/FileAttach/FileAttachProps.svelte - панель свойств конструктора для FileAttach -->
<script lang="ts">
  import { T } from "../locales/i18n"
  import type { IFileAttachProps, UIComponent } from "../types"
  import { createPropsEditor, type PropertyChange } from "../propsEditor"
  import * as UI from ".."
  import CommonSnippets from "../CommonSnippets.svelte"
  import PropsGroup from "../PropsGroup.svelte"

  const {
    component,
    onPropertyChange,
  }: {
    component: UIComponent & { properties: Partial<IFileAttachProps> }
    onPropertyChange: (change: PropertyChange<IFileAttachProps>) => void
  } = $props()

  const edit = $derived(createPropsEditor(component, onPropertyChange))
</script>

<div class="flex flex-col gap-2">
  <PropsGroup label={$T("constructor.props.group.general")}>
    <CommonSnippets snippet="Access" {component} {onPropertyChange} />
  </PropsGroup>
  <PropsGroup label={$T("constructor.props.group.appearance")}>
    <CommonSnippets snippet="Label" {component} {onPropertyChange} />
    <CommonSnippets snippet="LabelAlign" {component} {onPropertyChange} />
  </PropsGroup>
  <PropsGroup label={$T("constructor.props.group.content")}>
    <UI.Input
      label={{ name: $T("constructor.props.file.accept") }}
      value={component.properties.accept}
      help={{ info: $T("constructor.props.file.accept.help") }}
      onUpdate={(value) => edit.set("accept", String(value))}
    />
  </PropsGroup>
</div>
