<script lang="ts">
  import { getContext } from "svelte"
  import { T } from "../locales/i18n"
  import { type UIComponent, type ISliderProps, updateProperty, findOptionByClass, type IUIComponentHandler } from "../types"
  import * as UI from ".."
  import { optionsStore, findColorOption } from "../options"
  import CommonSnippets from "../CommonSnippets.svelte"
  import PropsGroup from "../PropsGroup.svelte"

  const {
    component,
    onPropertyChange,
    forConstructor = true,
  }: {
    component: UIComponent & { properties: Partial<ISliderProps> }
    onPropertyChange: (updates: Partial<{ properties?: string | object; name?: string; access?: string; eventHandler?: IUIComponentHandler }>) => void
    forConstructor?: boolean
  } = $props()

  const DeviceVariables = getContext<{ id: string; value: string; name: string }[]>("DeviceVariables")
  let VARIABLE_OPTIONS = $derived(DeviceVariables && Array.isArray(DeviceVariables) ? DeviceVariables : [])

  const initialAlign = $derived(findOptionByClass($optionsStore.TEXT_ALIGN_OPTIONS, component.properties.label?.class, "text-"))

  const initialColor = $derived(findColorOption($optionsStore.COLOR_OPTIONS, component.properties.wrapperClass))
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
    value={Array.isArray(component.properties.value) ? component.properties.value.join(",") : component.properties.value}
    onUpdate={(value) => updateProperty("value", value as string, component, onPropertyChange)}
  />
{/snippet}

{#if forConstructor}
  <div class="flex flex-col gap-2">
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
  <div class="flex flex-col gap-2">
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
