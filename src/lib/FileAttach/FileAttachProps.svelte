<!-- $lib/ElementsUI/ButtonProps.svelte -->
<script lang="ts">
  import { t } from "$lib/locales/i18n"
  import { type IFileAttachProps, type IUIComponentHandler, type UIComponent, updateProperty } from "../types"
  import * as UI from "$lib"
  import { optionsStore } from "../options"
  import { getContext } from "svelte"
  import { twMerge } from "tailwind-merge"
  import CommonSnippets from "$lib/CommonSnippets.svelte"

  const {
    component,
    onPropertyChange,
    forConstructor = true,
  } = $props<{
    component: UIComponent & { properties: Partial<IFileAttachProps> }
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

{#snippet FileAccept()}
  <UI.Input
    label={{ name: $t("constructor.props.file.accept") }}
    value={component.properties.accept}
    onUpdate={(value) => updateProperty("accept", value as string, component, onPropertyChange)}
  />
{/snippet}

{#snippet FileType()}
  <UI.Select
    label={{ name: $t("constructor.props.type") }}
    type="buttons"
    value={$optionsStore.FILE_ATTACH_TYPE_OPTIONS.find((c) => (c.value as string).includes(component.properties.type))}
    options={$optionsStore.FILE_ATTACH_TYPE_OPTIONS}
    onUpdate={(option) => updateProperty("type", (option as UI.ISelectOption).value as string, component, onPropertyChange)}
  />

  {#if component.properties.type === "image"}
    <div class="flex gap-4">
      <UI.Input
        label={{ name: $t("constructor.props.imageSize.height") }}
        type="number"
        value={component.properties.imageSize.height.replace("rem", "")}
        onUpdate={(value) => updateProperty("imageSize.height", `${value as string}rem`, component, onPropertyChange)}
      />
      <UI.Input
        label={{ name: $t("constructor.props.imageSize.width") }}
        type="number"
        value={component.properties.imageSize.width.replace("rem", "")}
        onUpdate={(value) => updateProperty("imageSize.width", `${value as string}rem`, component, onPropertyChange)}
      />
    </div>
    <div class="flex gap-4">
      <UI.Select
        label={{ name: $t("constructor.props.fitmode") }}
        type="buttons"
        value={$optionsStore.FITMODE_OPTIONS.find((c) => (c.value as string).includes(component.properties.imageSize.fitMode))}
        options={$optionsStore.FITMODE_OPTIONS}
        onUpdate={(option) => updateProperty("imageSize.fitMode", (option as UI.ISelectOption).value as string, component, onPropertyChange)}
      />
      <UI.Select
        label={{ name: $t("constructor.props.form") }}
        type="buttons"
        value={$optionsStore.FORM_OPTIONS.find((c) => (c.value as string).includes(component.properties.imageSize.form))}
        options={$optionsStore.FORM_OPTIONS}
        onUpdate={(option) => updateProperty("imageSize.form", (option as UI.ISelectOption).value as string, component, onPropertyChange)}
      />
    </div>
  {/if}
{/snippet}

{#if forConstructor}
  <div class="relative flex flex-row items-start justify-center">
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Access" {component} {onPropertyChange} />
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Label" {component} {onPropertyChange} />
      <CommonSnippets snippet="LabelAlign" initialValue={initialAlign} {component} {onPropertyChange} />
    </div>
    <div class="flex w-1/3 flex-col px-2">
      {@render FileAccept()}
    </div>
  </div>
{:else}
  <div class="relative flex flex-row items-start justify-center">
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Identificator" {component} {onPropertyChange} />
      <CommonSnippets snippet="Access" {component} {onPropertyChange} />
      <CommonSnippets snippet="WrapperClass" {component} {onPropertyChange} />
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Label" {component} {onPropertyChange} />
      <CommonSnippets snippet="LabelClass" initialValue={initialAlign} {component} {onPropertyChange} />
      <CommonSnippets snippet="Disabled" {component} {onPropertyChange} />
    </div>
    <div class="flex w-1/3 flex-col px-2">
      {@render FileAccept()}
      {@render FileType()}
    </div>
  </div>
{/if}
