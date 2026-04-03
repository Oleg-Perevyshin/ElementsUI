<script lang="ts">
  import { t } from "$lib/locales/i18n"
  import { updateProperty, type IUIComponentHandler, type UIComponent } from "../types"
  import * as UI from "$lib"
  import { optionsStore } from "../options"
  import { ICONS_ARRAY } from "../icons"
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

{#snippet WidgetSettingsColor()}
  <UI.Select
    wrapperClass="!h-14"
    label={{ name: $t("constructor.props.componentcolor") }}
    type="buttons"
    options={$optionsStore.COLOR_OPTIONS}
    value={initialColor}
    onUpdate={(option) => {
      updateProperty("settings.class", twMerge(component.properties.settings.class, (option as UI.IOption<string>).value), component, onPropertyChange)
    }}
  />
{/snippet}

{#snippet WidgetIconColor()}
  <UI.Select
    wrapperClass="!h-14"
    label={{ name: $t("constructor.props.iconcolor") }}
    type="buttons"
    options={$optionsStore.TEXT_COLOR_OPTIONS}
    value={$optionsStore.TEXT_COLOR_OPTIONS.find((c) =>
      (c.value as string).includes(component.properties.icons.class?.split(" ").find((cls: string) => cls.startsWith("text-"))),
    )}
    onUpdate={(option) => {
      updateProperty("icons.class", twMerge(component.properties.icons.class, (option as UI.IOption<string>).value), component, onPropertyChange)
      console.log(component.properties)
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
      updateProperty("settings.type", (option as UI.IOption).value as string, component, onPropertyChange)
    }}
  />
{/snippet}

{#snippet WidgetSwitchCaptions()}
  <UI.Input
    label={{ name: $t("constructor.props.caption.left") }}
    value={component.properties.settings.switch.captionLeft}
    onUpdate={(value) => updateProperty("settings.switch.captionLeft", value as string, component, onPropertyChange)}
  />
  <UI.Input
    label={{ name: $t("constructor.props.caption.right") }}
    value={component.properties.settings.switch.captionRight}
    onUpdate={(value) => updateProperty("settings.switch.captionRight", value as string, component, onPropertyChange)}
  />
{/snippet}

{#snippet WidgetUnits()}
  <UI.Input
    label={{ name: $t("constructor.props.units") }}
    value={component.properties.settings.number.units as string}
    onUpdate={(value) => updateProperty("settings.number.units", value, component, onPropertyChange)}
  />
{/snippet}

{#snippet WidgetSwitchingMode()}
  <UI.Switch
    label={{ name: $t("constructor.props.widget.mode") }}
    value={component.properties.icons.cycling}
    options={[{ id: crypto.randomUUID(), value: 0, class: "" }]}
    onChange={(value) => updateProperty("icons.cycling", value, component, onPropertyChange)}
  />
{/snippet}

{#snippet WidgetIcons()}
  <CommonSnippets
    snippet="IconsLib"
    initialValue={{
      name: $t("constructor.props.labelicon"),
      icon: component.properties.icons.array,
      updateProperty: (icons: string[]) => updateProperty("icons.array", icons as string[], component, onPropertyChange),
      icons: { array: ICONS_ARRAY, selectArray: true },
    }}
    {component}
    {onPropertyChange}
  />

  <!-- <UI.Button content={{ name: $t("constructor.props.labelicon") }} onClick={() => (showIconLib = true)} />
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
    {/if} -->
{/snippet}

{#if forConstructor}
  <div class="flex mb-4 items-start justify-center gap-8">
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Variable" {VARIABLE_OPTIONS} {component} {onPropertyChange} />
      <CommonSnippets snippet="EventHandlerArgument" {component} {onPropertyChange} />
      <CommonSnippets snippet="Access" {component} {onPropertyChange} />
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Label" {component} {onPropertyChange} />
      {@render WidgetUnits()}
      {@render WidgetIcons()}
      {@render WidgetIconColor()}
      {@render WidgetSwitchingMode()}
    </div>
    <div class="flex w-1/3 flex-col px-2">
      {@render WidgetSettingsLabel()}
      {@render WidgetSettingsColor()}
      {@render WidgetType()}
      {#if component.properties.settings.type == "input" || component.properties.settings.type == "slider"}
        <CommonSnippets
          snippet="MinMaxStep"
          initialValue={{
            number: component.properties.settings.number,
            bitMode: component.properties.bitMode,
            updateProperty: (value: number, property: string) => {
              updateProperty(`settings.${property}`, Number(value), component, onPropertyChange)
            },
          }}
          {component}
          {onPropertyChange}
        />
      {:else if component.properties.settings.type == "switch"}
        {@render WidgetSwitchCaptions()}
      {/if}
    </div>
  </div>
{:else}
  <div class="flex items-center mb-4 justify-center gap-8">
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Identificator" {component} {onPropertyChange} />
      <CommonSnippets snippet="Access" {component} {onPropertyChange} />
      <CommonSnippets snippet="Label" {component} {onPropertyChange} />
      {@render WidgetUnits()}
      <CommonSnippets snippet="Readonly" {component} {onPropertyChange} />
    </div>
    <div class="flex w-1/3 flex-col px-2">
      {@render WidgetSettingsLabel()}
      {@render WidgetIcons()}
      {@render WidgetIconColor()}
      {@render WidgetSwitchingMode()}
    </div>
    <div class="flex w-1/3 flex-col px-2">
      {@render WidgetSettingsColor()}
      {@render WidgetType()}
      {#if component.properties.settings.type == "input" || component.properties.settings.type == "slider"}
        <CommonSnippets
          snippet="MinMaxStep"
          initialValue={{
            number: component.properties.settings.number,
            bitMode: component.properties.bitMode,
            updateProperty: (value: number, property: string) => {
              updateProperty(`settings.${property}`, Number(value), component, onPropertyChange)
            },
          }}
          {component}
          {onPropertyChange}
        />
      {:else if component.properties.settings.type == "switch"}
        {@render WidgetSwitchCaptions()}
      {/if}
    </div>
  </div>
{/if}
