<script lang="ts">
  import { getContext } from "svelte"
  import { t } from "$lib/locales/i18n"
  import { type UIComponent, type IGraphProps, updateProperty, type IUIComponentHandler } from "../types"
  import * as UI from "$lib"
  import { optionsStore } from "$lib/options"
  import { twMerge } from "tailwind-merge"
  import CommonSnippets from "$lib/CommonSnippets.svelte"

  const {
    component,
    onPropertyChange,
    forConstructor = true,
  } = $props<{
    component: UIComponent & { properties: Partial<IGraphProps> }
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

{#snippet GraphIsTest()}
  <UI.Switch
    wrapperClass="bg-blue"
    label={{ name: $t("constructor.props.istest") }}
    value={component.properties.isTest}
    options={[{ id: crypto.randomUUID(), value: 0, class: "" }]}
    onChange={(value) => updateProperty("isTest", value, component, onPropertyChange)}
  />
{/snippet}

{#if forConstructor}
  <div class="relative flex flex-row items-start justify-center">
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Variable" {VARIABLE_OPTIONS} {component} {onPropertyChange} />
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Label" {component} {onPropertyChange} />
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="LabelAlign" initialValue={initialAlign} {component} {onPropertyChange} />
    </div>
  </div>
{:else}
  <div class="relative mb-2 flex flex-row items-start justify-center">
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Identificator" {component} {onPropertyChange} />
      <CommonSnippets snippet="WrapperClass" {component} {onPropertyChange} />
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Label" {component} {onPropertyChange} />
      <CommonSnippets snippet="LabelClass" initialValue={initialAlign} {component} {onPropertyChange} />
    </div>
    <div class="flex w-1/3 flex-col px-2">
      {@render GraphIsTest()}
    </div>
  </div>
{/if}
