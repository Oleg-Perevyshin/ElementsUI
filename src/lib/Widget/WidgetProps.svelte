<script lang="ts">
  import { t } from "$lib/locales/i18n"
  import { updateProperty, type IUIComponentHandler, type UIComponent } from "../types"
  import * as UI from "$lib"
  import { optionsStore } from "../options"
  import { ICONS } from "../icons"
  import Modal from "$lib/Modal.svelte"
  import Button from "$lib/Button/Button.svelte"
  import CrossIcon from "$lib/libIcons/CrossIcon.svelte"
  import ButtonAdd from "$lib/libIcons/ButtonAdd.svelte"
  import ButtonDelete from "$lib/libIcons/ButtonDelete.svelte"
  import { twMerge } from "tailwind-merge"
  import CommonSnippets from "$lib/CommonSnippets.svelte"
  import { getContext } from "svelte"

  const {
    component,
    onPropertyChange,
    forConstructor = true,
  } = $props<{
    component: UIComponent & { properties: Partial<UI.IWidgetProps> }
    onPropertyChange: (updates: Partial<{ properties?: string | object; name?: string; access?: string; eventHandler?: IUIComponentHandler }>) => void
    forConstructor?: boolean
  }>()

  let tabIcon = $state({ index: 0, isModalOpen: false })

  const DeviceVariables = getContext<{ id: string; value: string; name: string }[]>("DeviceVariables")
  let VARIABLE_OPTIONS = $derived(DeviceVariables && Array.isArray(DeviceVariables) ? DeviceVariables : [])

  const initialColor = $derived(
    $optionsStore.COLOR_OPTIONS.find((c) =>
      (c.value as string).includes(component.properties.settings.class?.split(" ").find((cls: string) => cls.startsWith("bg-"))),
    ),
  )
</script>

{#snippet WidgetSettingsLabel()}
  <UI.Input
    label={{ name: $t("constructor.props.settings.label") }}
    value={component.properties.settings.label as string}
    onUpdate={(value) => updateProperty("settings.label", value, component, onPropertyChange)}
  />
{/snippet}

{#snippet WidgetClass()}
  <UI.Select
    wrapperClass="!h-14"
    label={{ name: $t("constructor.props.componentcolor") }}
    type="buttons"
    options={$optionsStore.COLOR_OPTIONS}
    value={initialColor}
    onUpdate={(option) => {
      updateProperty("settings.class", twMerge(component.properties.settings.class, (option as UI.ISelectOption<string>).value), component, onPropertyChange)
    }}
  />
{/snippet}

{#snippet WidgetType()}
  <UI.Select
    label={{ name: $t("constructor.props.settings.type") }}
    type="buttons"
    options={$optionsStore.WIDGET_TYPE_OPTIONS}
    value={$optionsStore.WIDGET_TYPE_OPTIONS.find((o) => o.value == component.properties.settings.type)}
    onUpdate={(option) => {
      updateProperty("settings.type", (option as UI.ISelectOption).value as string, component, onPropertyChange)
    }}
  />
{/snippet}

{#snippet WidgetMinMax()}
  <UI.Input
    label={{ name: $t("constructor.props.minnum") }}
    value={component.properties.settings.number.minNum as number}
    type="number"
    onUpdate={(value) => updateProperty("settings.number.minNum", Number(value), component, onPropertyChange)}
  />
  <UI.Input
    label={{ name: $t("constructor.props.maxnum") }}
    value={component.properties.settings.number.maxNum as number}
    type="number"
    onUpdate={(value) => updateProperty("settings.number.maxNum", Number(value), component, onPropertyChange)}
  />
  <UI.Input
    label={{ name: $t("constructor.props.step") }}
    value={component.properties.settings.number.step as number}
    type="number"
    onUpdate={(value) => updateProperty("settings.number.step", Number(value), component, onPropertyChange)}
  />
{/snippet}

{#snippet WidgetToggleCaptions()}
  <UI.Input
    label={{ name: $t("constructor.props.caption.left") }}
    value={component.properties.settings.toggle.captionLeft}
    onUpdate={(value) => updateProperty("settings.toggle.captionLeft", value as string, component, onPropertyChange)}
  />
  <UI.Input
    label={{ name: $t("constructor.props.caption.right") }}
    value={component.properties.settings.toggle.captionRight}
    onUpdate={(value) => updateProperty("settings.toggle.captionRight", value as string, component, onPropertyChange)}
  />
{/snippet}

{#if forConstructor}
  <div class="flex mb-4 items-start justify-center gap-8">
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Variable" {VARIABLE_OPTIONS} {component} {onPropertyChange} />
      <CommonSnippets snippet="Access" {component} {onPropertyChange} />
      <CommonSnippets snippet="Label" {component} {onPropertyChange} />
    </div>
    <div class="flex w-1/3 flex-col px-2">
      {@render WidgetSettingsLabel()}
      {@render WidgetClass()}
      {@render WidgetType()}
    </div>
    <div class="flex w-1/3 flex-col px-2">
      {#if component.properties.settings.type == "input" || component.properties.settings.type == "slider"}
        {@render WidgetMinMax()}
      {:else if component.properties.settings.type == "toggle"}
        {@render WidgetToggleCaptions()}
      {/if}
    </div>
  </div>
{:else}
  <div class="flex items-center mb-4 justify-center gap-8">
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Identificator" {component} {onPropertyChange} />
      <CommonSnippets snippet="WrapperClass" {component} {onPropertyChange} />
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Access" {component} {onPropertyChange} />
      <CommonSnippets snippet="Colors" initialValue={initialColor} {component} {onPropertyChange} />
    </div>

    <div class="flex w-1/3 flex-col px-2"></div>
  </div>
{/if}
