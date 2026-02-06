<script lang="ts">
  import { getContext } from "svelte"
  import { t } from "$lib/locales/i18n"
  import { type UIComponent, type IProgressBarProps, updateProperty, type IUIComponentHandler } from "../types"
  import * as UI from "$lib"
  import { optionsStore } from "../options"
  import { twMerge } from "tailwind-merge"
  import CommonSnippets from "$lib/CommonSnippets.svelte"

  const {
    component,
    onPropertyChange,
    forConstructor = true,
  } = $props<{
    component: UIComponent & { properties: Partial<IProgressBarProps> }
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

{#snippet ProgressBarType()}
  <UI.Select
    wrapperClass="!h-14"
    label={{ name: $t("constructor.props.type") }}
    disabled={component.properties.bitMode}
    type="buttons"
    options={$optionsStore.SWITCH_OPTIONS.filter((o) => o.value !== "checkbox")}
    value={$optionsStore.SWITCH_OPTIONS.find((option) => option.value == component.properties.type)}
    onUpdate={(option) => updateProperty("type", (option as UI.ISelectOption).value as string, component, onPropertyChange)}
  />
{/snippet}

{#snippet ProgressBarMinMax()}
  <UI.Input
    label={{ name: $t("constructor.props.min") }}
    value={component.properties.number.minNum as number}
    type="number"
    onUpdate={(value) => {
      updateProperty("number.minNum", Number(value), component, onPropertyChange)
      updateProperty(
        "value",
        component.properties.number.minNum + (component.properties.number.maxNum - component.properties.number.minNum) / 3,
        component,
        onPropertyChange,
      )
    }}
  />
  <UI.Input
    label={{ name: $t("constructor.props.max") }}
    value={component.properties.number.maxNum as number}
    type="number"
    onUpdate={(value) => {
      updateProperty("number.maxNum", Number(value), component, onPropertyChange)
      updateProperty(
        "value",
        component.properties.number.minNum + (component.properties.number.maxNum - component.properties.number.minNum) / 3,
        component,
        onPropertyChange,
      )
    }}
  />
  <UI.Input
    label={{ name: $t("constructor.props.units") }}
    value={component.properties.number.units}
    onUpdate={(value) => updateProperty("number.units", value, component, onPropertyChange)}
  />
{/snippet}

{#snippet ProgressBarValue()}
  <UI.Input
    label={{ name: $t("constructor.props.value") }}
    type="number"
    number={{ minNum: component.properties.number.minNum, maxNum: component.properties.number.maxNum, step: 1 }}
    value={component.properties.value}
    onUpdate={(value) => updateProperty("value", value as string, component, onPropertyChange)}
  />
{/snippet}

{#if forConstructor}
  <div class="relative flex flex-row items-start justify-center">
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Variable" {VARIABLE_OPTIONS} {component} {onPropertyChange} />
      {@render ProgressBarType()}
    </div>
    <div class="flex w-1/3 flex-col px-2">
      {@render ProgressBarMinMax()}
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
      {@render ProgressBarType()}
      <CommonSnippets snippet="WrapperClass" {component} {onPropertyChange} />
      <CommonSnippets snippet="Colors" initialValue={initialColor} {component} {onPropertyChange} />
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Label" {component} {onPropertyChange} />
      <CommonSnippets snippet="LabelClass" {component} {onPropertyChange} />
      {@render ProgressBarValue()}
    </div>
    <div class="flex w-1/3 flex-col px-2">
      {@render ProgressBarMinMax()}
    </div>
  </div>
{/if}
