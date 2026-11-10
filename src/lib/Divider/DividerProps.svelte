<!-- $lib/Divider/DividerProps.svelte - панель свойств конструктора для Divider -->
<script lang="ts">
  import { T } from "../locales/i18n"
  import type { IDividerProps, UIComponent } from "../types"
  import { createPropsEditor, type PropertyChange } from "../propsEditor"
  import * as UI from ".."
  import { optionsStore } from "../options"
  import CommonSnippets from "../CommonSnippets.svelte"
  import PropsGroup from "../PropsGroup.svelte"

  const {
    component,
    onPropertyChange,
  }: {
    component: UIComponent & { properties: Partial<IDividerProps> }
    onPropertyChange: (change: PropertyChange<IDividerProps>) => void
  } = $props()

  const edit = $derived(createPropsEditor(component, onPropertyChange))
</script>

<div class="flex flex-col gap-2">
  <PropsGroup label={$T("constructor.props.group.general")}>
    <CommonSnippets snippet="Access" {component} {onPropertyChange} />
    <UI.Select
      label={{ name: $T("constructor.props.divider.type") }}
      type="buttons"
      value={component.properties.type}
      options={$optionsStore.DIVIDER_TYPE_OPTIONS}
      onUpdate={(type) => edit.set("type", type)}
    />
  </PropsGroup>
  <PropsGroup label={$T("constructor.props.group.layout")}>
    <UI.Select
      label={{ name: $T("constructor.props.divider.anchor") }}
      type="buttons"
      value={component.properties.anchor}
      options={$optionsStore.DIVIDER_ANCHOR_OPTIONS}
      onUpdate={(anchor) => edit.set("anchor", anchor)}
    />
    <UI.Input
      label={{ name: $T("constructor.props.divider.width") }}
      value={component.properties.width}
      onUpdate={(value) => edit.set("width", Number(value))}
      number={{ minNum: 1, maxNum: 20, step: 1 }}
      type="number"
    />
  </PropsGroup>
  <PropsGroup label={$T("constructor.props.group.appearance")}>
    <CommonSnippets snippet="Accent" {component} {onPropertyChange} />
  </PropsGroup>
</div>
