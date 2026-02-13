<script lang="ts">
  import { t } from "$lib/locales/i18n"
  import { updateProperty, type IUIComponentHandler, type UIComponent } from "../types"
  import * as UI from "$lib"
  import { optionsStore } from "../options"
  import { ICONS, ICONS_ARRAY } from "../icons"
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

  let showIconLib = $state(false)

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

{#snippet WidgetSwitchingMode()}
  <UI.Select
    label={{ name: $t("constructor.props.widget.mode") }}
    type="buttons"
    options={$optionsStore.WIDGET_MODE_OPTIONS}
    value={$optionsStore.WIDGET_MODE_OPTIONS.find((o) => o.value == component.properties.icons.mode)}
    onUpdate={(option) => {
      updateProperty("icons.mode", (option as UI.ISelectOption).value as string, component, onPropertyChange)
    }}
  />
{/snippet}

{#snippet WidgetIcons()}
  <div class="relative mt-6 flex w-full gap-2">
    <UI.Button content={{ name: $t("constructor.props.labelicon") }} onClick={() => (showIconLib = true)} />
    {#if showIconLib}
      <Modal bind:isOpen={showIconLib} wrapperClass="w-130">
        {#snippet main()}
          <div class="grid grid-cols-1">
            {#each ICONS_ARRAY as name}
              <button
                class="relative m-1.5 rounded-xl border-2 border-(--border-color) p-3 cursor-pointer"
                onclick={() => {
                  updateProperty("icons.array", name[1] as string[], component, onPropertyChange)
                }}
              >
                <div class="absolute -top-3.5 bg-(--back-color) px-1">{$t(`constructor.props.icon.${name[0]}`)}</div>
                <div class="grid grid-cols-9 place-items-center gap-2">
                  {#each name[1] as icon}
                    <div class="h-8 w-8 [&_svg]:h-full [&_svg]:max-h-full [&_svg]:w-full [&_svg]:max-w-full">
                      {@html icon}
                    </div>
                  {/each}
                </div>
              </button>
            {/each}
          </div>
        {/snippet}
      </Modal>
    {/if}
    {#if component.properties.icons.array}
      <Button
        wrapperClass="w-8.5 "
        componentClass="p-0.5 bg-red"
        content={{ icon: CrossIcon }}
        onClick={() => {
          updateProperty("icons.array", "", component, onPropertyChange)
        }}
      />
    {/if}
  </div>
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
      {@render WidgetIcons()}
      {@render WidgetSwitchingMode()}
    </div>
    <div class="flex w-1/3 flex-col px-2">
      {@render WidgetType()}
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
      <CommonSnippets snippet="Access" {component} {onPropertyChange} />
      <CommonSnippets snippet="Label" {component} {onPropertyChange} />
    </div>
    <div class="flex w-1/3 flex-col px-2">
      {@render WidgetSettingsLabel()}
      {@render WidgetClass()}
      {@render WidgetIcons()}
      {@render WidgetSwitchingMode()}
    </div>
    <div class="flex w-1/3 flex-col px-2">
      {@render WidgetType()}
      {#if component.properties.settings.type == "input" || component.properties.settings.type == "slider"}
        {@render WidgetMinMax()}
      {:else if component.properties.settings.type == "toggle"}
        {@render WidgetToggleCaptions()}
      {/if}
    </div>
  </div>
{/if}
