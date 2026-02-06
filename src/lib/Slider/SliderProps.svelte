<script lang="ts">
  import { getContext } from "svelte"
  import { t } from "$lib/locales/i18n"
  import { type UIComponent, type ISliderProps, updateProperty, type IUIComponentHandler } from "../types"
  import * as UI from "$lib"
  import { optionsStore } from "../options"
  import { twMerge } from "tailwind-merge"
  import CommonSnippets from "$lib/CommonSnippets.svelte"

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
    label={{ name: $t("constructor.props.type") }}
    type="buttons"
    value={$optionsStore.SLIDER_TYPE_OPTIONS.find((opt) => opt.value === (component.properties.type || "single"))}
    options={$optionsStore.SLIDER_TYPE_OPTIONS}
    onUpdate={(type) => {
      updateProperty("value", (type as UI.ISelectOption).value === "single" ? 5 : [2, 7], component, onPropertyChange)
      updateProperty("type", (type as UI.ISelectOption).value as string, component, onPropertyChange)
    }}
  />
{/snippet}

{#snippet SliderMinMax()}
  <UI.Input
    label={{ name: $t("constructor.props.minnum") }}
    value={component.properties.number.minNum as number}
    type="number"
    onUpdate={(value) => updateProperty("number.minNum", Number(value), component, onPropertyChange)}
  />
  <UI.Input
    label={{ name: $t("constructor.props.maxnum") }}
    value={component.properties.number.maxNum as number}
    type="number"
    onUpdate={(value) => updateProperty("number.maxNum", Number(value), component, onPropertyChange)}
  />
  <UI.Input
    label={{ name: $t("constructor.props.step") }}
    value={component.properties.number.step as number}
    type="number"
    onUpdate={(value) => updateProperty("number.step", Number(value), component, onPropertyChange)}
  />
{/snippet}

{#snippet SliderValue()}
  <UI.Input
    label={{ name: $t("constructor.props.value") }}
    value={component.properties.value}
    onUpdate={(value) => updateProperty("value", value as string, component, onPropertyChange)}
  />
{/snippet}

{#if forConstructor}
  <div class="relative flex flex-row items-start justify-center">
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Variable" {VARIABLE_OPTIONS} {component} {onPropertyChange} />
      <CommonSnippets snippet="EventHandlerArgument" {component} {onPropertyChange} />
      <CommonSnippets snippet="Access" {component} {onPropertyChange} />
      {@render SliderType()}
    </div>
    <div class="flex w-1/3 flex-col px-2">
      {@render SliderMinMax()}
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Label" {component} {onPropertyChange} />
      <CommonSnippets snippet="LabelAlign" initialValue={initialAlign} {component} {onPropertyChange} />
      <CommonSnippets snippet="Colors" initialValue={initialColor} {component} {onPropertyChange} />
    </div>
  </div>
{:else}
  <div class="relative flex flex-row items-start justify-center">
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Identificator" {component} {onPropertyChange} />
      <CommonSnippets snippet="WrapperClass" {component} {onPropertyChange} />
      <CommonSnippets snippet="Colors" initialValue={initialColor} {component} {onPropertyChange} />
      <CommonSnippets snippet="Disabled" {component} {onPropertyChange} />
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Access" {component} {onPropertyChange} />
      <CommonSnippets snippet="Label" {component} {onPropertyChange} />
      <CommonSnippets snippet="LabelClass" {component} {onPropertyChange} />
      {@render SliderValue()}
    </div>
    <div class="flex w-1/3 flex-col px-2">
      {@render SliderType()}
      {@render SliderMinMax()}
    </div>
  </div>
{/if}
