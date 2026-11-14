<!-- $lib/Graph/GraphProps.svelte - панель свойств конструктора для Graph -->
<script lang="ts">
  import { getContext } from "svelte"
  import { T } from "../locales/i18n"
  import type { UIComponent, IGraphProps } from "../types"
  import { createPropsEditor, type PropertyChange } from "../propsEditor"
  import * as UI from ".."
  import { twMerge } from "tailwind-merge"
  import CommonSnippets from "../CommonSnippets.svelte"
  import PropsGroup from "../PropsGroup.svelte"
  import { REFRESH_OPTIONS } from "./Graph.svelte"

  const {
    component,
    onPropertyChange,
  }: {
    component: UIComponent<"Graph">
    onPropertyChange: (change: PropertyChange<IGraphProps>) => void
  } = $props()

  const edit = $derived(createPropsEditor(component, onPropertyChange))
  const VARIABLE_OPTIONS = getContext<{ id: string; value: string; name: string }[] | undefined>("DeviceVariables") ?? []
</script>

<div class="flex flex-col gap-2">
  <PropsGroup>
    <UI.Switch
      label={{ name: $T("constructor.props.simulation") }}
      help={{ info: $T("constructor.props.graph.simulation.info") }}
      value={component.properties.isTest ? 1 : 0}
      onUpdate={(value) => edit.set("isTest", value === 1)}
    />
  </PropsGroup>
  <!-- В режиме имитации остальные свойства не учитываются, поэтому вся панель бледная и недоступна -->
  <div class={twMerge("flex flex-col gap-2 transition-opacity", component.properties.isTest && "opacity-40 grayscale")} inert={component.properties.isTest}>
    <PropsGroup label={$T("constructor.props.group.general")}>
      <CommonSnippets snippet="Access" {component} {onPropertyChange} />
      <CommonSnippets snippet="Variable" {VARIABLE_OPTIONS} {component} {onPropertyChange} />
    </PropsGroup>
    <PropsGroup label={$T("constructor.props.group.appearance")}>
      <CommonSnippets snippet="Label" {component} {onPropertyChange} />
      <CommonSnippets snippet="LabelAlign" {component} {onPropertyChange} />
    </PropsGroup>
    <PropsGroup label={$T("constructor.props.group.behavior")}>
      <UI.Select
        label={{ name: $T("constructor.props.refreshrate") }}
        help={{ info: $T("constructor.props.graph.refreshrate.info") }}
        options={REFRESH_OPTIONS}
        value={component.properties.refreshRate ?? 0}
        onUpdate={(refreshRate) => edit.set("refreshRate", refreshRate)}
      />
    </PropsGroup>
  </div>
</div>
