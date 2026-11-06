<script lang="ts">
  import { getContext } from "svelte"
  import { T } from "../locales/i18n"
  import { type UIComponent, type IGraphProps, type IOption, updateProperty, findOptionByClass, type IUIComponentHandler } from "../types"
  import * as UI from ".."
  import { optionsStore } from "../options"
  import { twMerge } from "tailwind-merge"
  import CommonSnippets from "../CommonSnippets.svelte"
  import PropsGroup from "../PropsGroup.svelte"
  import { REFRESH_OPTIONS } from "./Graph.svelte"

  const {
    component,
    onPropertyChange,
    forConstructor = true,
  }: {
    component: UIComponent & { properties: Partial<IGraphProps> }
    onPropertyChange: (updates: Partial<{ properties?: string | object; name?: string; access?: string; eventHandler?: IUIComponentHandler }>) => void
    forConstructor?: boolean
  } = $props()

  const DeviceVariables = getContext<{ id: string; value: string; name: string }[]>("DeviceVariables")
  let VARIABLE_OPTIONS = $derived(DeviceVariables && Array.isArray(DeviceVariables) ? DeviceVariables : [])

  const initialAlign = $derived(findOptionByClass($optionsStore.TEXT_ALIGN_OPTIONS, component.properties.label?.class, "text-"))
</script>

{#snippet GraphIsTest()}
  <UI.Switch
    label={{ name: $T("constructor.props.simulation") }}
    value={component.properties.isTest ? 1 : 0}
    options={[{ id: crypto.randomUUID(), value: 0, class: "" }]}
    onChange={(value) => updateProperty("isTest", value === 1, component, onPropertyChange)}
  />
{/snippet}

{#snippet GraphSettings()}
  <UI.Select
    label={{ name: $T("constructor.props.refreshrate") }}
    options={REFRESH_OPTIONS}
    value={REFRESH_OPTIONS.find((o) => o.value == (component.properties.refreshRate ?? 0))}
    onUpdate={(value) => updateProperty("refreshRate", (value as IOption).value as number, component, onPropertyChange)}
  />
{/snippet}

<div class="flex flex-col gap-2">
  <PropsGroup>
    {@render GraphIsTest()}
  </PropsGroup>
  <!-- В режиме имитации остальные свойства не учитываются, поэтому вся панель бледная и недоступна -->
  <div class={twMerge("flex flex-col gap-2 transition-opacity", component.properties.isTest && "opacity-40 grayscale")} inert={component.properties.isTest}>
    {#if forConstructor}
      <PropsGroup label={$T("constructor.props.group.general")}>
        <CommonSnippets snippet="Access" {component} {onPropertyChange} />
        <CommonSnippets snippet="Variable" {VARIABLE_OPTIONS} {component} {onPropertyChange} />
      </PropsGroup>
      <PropsGroup label={$T("constructor.props.group.appearance")}>
        <CommonSnippets snippet="Label" {component} {onPropertyChange} />
        <CommonSnippets snippet="LabelAlign" initialValue={initialAlign} {component} {onPropertyChange} />
      </PropsGroup>
      <PropsGroup label={$T("constructor.props.group.behavior")}>
        {@render GraphSettings()}
      </PropsGroup>
    {:else}
      <PropsGroup label={$T("constructor.props.group.general")}>
        <CommonSnippets snippet="Identificator" {component} {onPropertyChange} />
        <CommonSnippets snippet="Access" {component} {onPropertyChange} />
      </PropsGroup>
      <PropsGroup label={$T("constructor.props.group.appearance")}>
        <CommonSnippets snippet="Label" {component} {onPropertyChange} />
        <CommonSnippets snippet="LabelClass" initialValue={initialAlign} {component} {onPropertyChange} />
      </PropsGroup>
      <PropsGroup label={$T("constructor.props.group.behavior")}>
        <CommonSnippets snippet="WrapperClass" {component} {onPropertyChange} />
        {@render GraphSettings()}
      </PropsGroup>
    {/if}
  </div>
</div>
