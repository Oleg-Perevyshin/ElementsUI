<!-- $lib/ElementsUI/ButtonProps.svelte -->
<script lang="ts">
  import { t } from "$lib/locales/i18n"
  import { type UIComponent, type IColorPickerProps, updateProperty, type IUIComponentHandler } from "../types"
  import * as UI from "$lib"
  import { getContext } from "svelte"
  import { optionsStore } from "../options"
  import CommonSnippets from "$lib/CommonSnippets.svelte"

  const {
    component,
    onPropertyChange,
    forConstructor = true,
  } = $props<{
    component: UIComponent & { properties: Partial<IColorPickerProps> }
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
</script>

{#snippet ColorPickerDefaultColor()}
  <UI.TextField content={{ name: $t("constructor.props.defaultcolor"), class: "font-bold" }} />
  <div class="flex items-center gap-3">
    <UI.TextField wrapperClass="w-4" content={{ name: "R", class: "font-bold" }} />
    <UI.Input
      value={component.properties.value[0]}
      type="number"
      number={{ minNum: 0, maxNum: 255, step: 1 }}
      onUpdate={(value) =>
        updateProperty("value", [value as number, component.properties.value[1], component.properties.value[2]], component, onPropertyChange)}
    />
    <UI.TextField wrapperClass="w-4" content={{ name: "G", class: "font-bold" }} />
    <UI.Input
      value={component.properties.value[1]}
      type="number"
      number={{ minNum: 0, maxNum: 255, step: 1 }}
      onUpdate={(value) =>
        updateProperty("value", [component.properties.value[0], value as number, component.properties.value[2]], component, onPropertyChange)}
    />
    <UI.TextField wrapperClass="w-4" content={{ name: "B", class: "font-bold" }} />
    <UI.Input
      value={component.properties.value[2]}
      type="number"
      number={{ minNum: 0, maxNum: 255, step: 1 }}
      onUpdate={(value) =>
        updateProperty("value", [component.properties.value[0], component.properties.value[1], value as number], component, onPropertyChange)}
    />
  </div>
{/snippet}

{#if forConstructor}
  <div class="relative flex flex-row items-start justify-center">
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Variable" {VARIABLE_OPTIONS} {component} {onPropertyChange} />
      <CommonSnippets snippet="EventHandlerArgument" {component} {onPropertyChange} />
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Access" {component} {onPropertyChange} />
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Label" {component} {onPropertyChange} />
      <CommonSnippets snippet="LabelAlign" initialValue={initialAlign} {component} {onPropertyChange} />
    </div>
  </div>
{:else}
  <div class="relative flex flex-row items-start justify-center">
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Identificator" {component} {onPropertyChange} />
      <CommonSnippets snippet="Access" {component} {onPropertyChange} />
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Label" {component} {onPropertyChange} />
      <CommonSnippets snippet="LabelClass" initialValue={initialAlign} {component} {onPropertyChange} />
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="WrapperClass" {component} {onPropertyChange} />
      {@render ColorPickerDefaultColor()}
    </div>
  </div>
{/if}
