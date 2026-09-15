<script lang="ts">
  import { getContext } from "svelte"
  import { T } from "$lib/locales/i18n"
  import { type UIComponent, type ISliderProps, updateProperty, type IUIComponentHandler } from "../types"
  import * as UI from "$lib"
  import { optionsStore } from "../options"
  import CommonSnippets from "$lib/CommonSnippets.svelte"
  import PropsGroup from "$lib/PropsGroup.svelte"

  const {
    component,
    onPropertyChange,
    forConstructor = true,
  } = $props<{
    component: UIComponent & { properties: Partial<ISliderProps> }
    onPropertyChange: (updates: Partial<{ properties?: string | object; name?: string; access?: string; eventHandler?: IUIComponentHandler }>) => void
    forConstructor?: boolean
  }>()

  const DeviceVariables = getContext<{ id: string; value: string; name: string }[]>("DeviceVariables")
  let VARIABLE_OPTIONS = $derived(DeviceVariables && Array.isArray(DeviceVariables) ? DeviceVariables : [])

  const initialAlign = $derived(
    $optionsStore.TEXT_ALIGN_OPTIONS.find((a) =>
      (a.value as string).includes(component.properties.label?.class?.split(" ").find((cls: string) => cls.startsWith("text-"))),
    ),
  )

  const initialColor = $derived(
    $optionsStore.COLOR_OPTIONS.find((c) =>
      (c.value as string).includes(component.properties.wrapperClass?.split(" ").find((cls: string) => cls.startsWith("bg-"))),
    ),
  )
</script>

{#snippet SliderType()}
  <UI.Select
    label={{ name: $T("constructor.props.type") }}
    type="buttons"
    value={$optionsStore.SLIDER_TYPE_OPTIONS.find((opt) => opt.value === (component.properties.type || "single"))}
    options={$optionsStore.SLIDER_TYPE_OPTIONS}
    onUpdate={(type) => {
      updateProperty("value", (type as UI.IOption).value === "single" ? 5 : [2, 7], component, onPropertyChange)
      updateProperty("type", (type as UI.IOption).value as string, component, onPropertyChange)
    }}
  />
{/snippet}

{#snippet SliderValue()}
  <UI.Input
    label={{ name: $T("constructor.props.value") }}
    value={component.properties.value}
    onUpdate={(value) => updateProperty("value", value as string, component, onPropertyChange)}
  />
{/snippet}

{#if forConstructor}
  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
    <PropsGroup label={$T("constructor.props.group.general")}>
      <CommonSnippets snippet="Access" {component} {onPropertyChange} />
      <CommonSnippets snippet="Variable" {VARIABLE_OPTIONS} {component} {onPropertyChange} />
      <CommonSnippets snippet="EventHandlerArgument" {component} {onPropertyChange} />
    </PropsGroup>
    <PropsGroup label={$T("constructor.props.group.value")}>
      {@render SliderType()}
      <CommonSnippets
        snippet="MinMaxStep"
        initialValue={{
          number: component.properties.number,
          bitMode: component.properties.bitMode,
          updateProperty: (value: number, property: string) => {
            updateProperty(property, Number(value), component, onPropertyChange)
          },
        }}
        {component}
        {onPropertyChange}
      />
    </PropsGroup>
    <PropsGroup label={$T("constructor.props.group.appearance")}>
      <CommonSnippets snippet="Label" {component} {onPropertyChange} />
      <CommonSnippets snippet="LabelAlign" initialValue={initialAlign} {component} {onPropertyChange} />
      <CommonSnippets snippet="Colors" initialValue={{ color: initialColor, uselessColors: ["bg-gray"] }} {component} {onPropertyChange} />
    </PropsGroup>
  </div>
{:else}
  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
    <PropsGroup label={$T("constructor.props.group.general")}>
      <CommonSnippets snippet="Identificator" {component} {onPropertyChange} />
      <CommonSnippets snippet="WrapperClass" {component} {onPropertyChange} />
      <CommonSnippets snippet="Colors" initialValue={{ color: initialColor, uselessColors: ["bg-gray"] }} {component} {onPropertyChange} />
      <CommonSnippets snippet="Disabled" {component} {onPropertyChange} />
    </PropsGroup>
    <PropsGroup label={$T("constructor.props.group.content")}>
      <CommonSnippets snippet="Access" {component} {onPropertyChange} />
      <CommonSnippets snippet="Label" {component} {onPropertyChange} />
      <CommonSnippets snippet="LabelClass" {component} {onPropertyChange} />
      {@render SliderValue()}
    </PropsGroup>
    <PropsGroup label={$T("constructor.props.group.value")}>
      {@render SliderType()}
      <CommonSnippets
        snippet="MinMaxStep"
        initialValue={{
          number: component.properties.number,
          bitMode: component.properties.bitMode,
          updateProperty: (value: number, property: string) => {
            updateProperty(property, Number(value), component, onPropertyChange)
          },
        }}
        {component}
        {onPropertyChange}
      />
    </PropsGroup>
  </div>
{/if}
