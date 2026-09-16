<script lang="ts">
  import { T } from "$lib/locales/i18n"
  import { updateProperty, type IUIComponentHandler, type UIComponent } from "../types"
  import * as UI from "$lib"
  import { optionsStore } from "../options"
  import { ICONS_ARRAY } from "../icons"
  import { twMerge } from "tailwind-merge"
  import CommonSnippets from "$lib/CommonSnippets.svelte"
  import PropsGroup from "$lib/PropsGroup.svelte"
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

  /* Один мастер-цвет вместо двух независимых пикеров: цвет иконки больше не выбирается отдельно,
     а выводится из того же bg-* (COLOR_OPTIONS и TEXT_COLOR_OPTIONS — одна и та же ролевая палитра
     red/yellow/green/blue/purple/gray, см. options.ts). */
  const deriveIconColorClass = (bgClass: string): string => {
    const role = bgClass.match(/bg-(\w+)/)?.[1]
    const match = role && role !== "max" ? $optionsStore.TEXT_COLOR_OPTIONS.find((c) => c.id === `TEXT_COLOR_${role.toUpperCase()}`) : null
    return (match ?? $optionsStore.TEXT_COLOR_OPTIONS[0]).value as string
  }
</script>

{#snippet WidgetSettingsLabel()}
  <UI.Input
    label={{ name: $T("constructor.props.settings.label") }}
    value={component.properties.settings.label as string}
    onUpdate={(value) => updateProperty("settings.label", value, component, onPropertyChange)}
  />
{/snippet}

{#snippet WidgetSettingsColor()}
  <UI.Select
    wrapperClass="!h-14"
    label={{ name: $T("constructor.props.componentcolor") }}
    type="buttons"
    options={$optionsStore.COLOR_OPTIONS}
    value={initialColor}
    onUpdate={(option) => {
      const bgClass = (option as UI.IOption<string>).value as string
      updateProperty("settings.class", twMerge(component.properties.settings.class, bgClass), component, onPropertyChange)
      updateProperty("icons.class", twMerge(component.properties.icons.class, deriveIconColorClass(bgClass)), component, onPropertyChange)
    }}
  />
{/snippet}

{#snippet WidgetType()}
  <UI.Select
    label={{ name: $T("constructor.props.settings.type") }}
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
    label={{ name: $T("constructor.props.caption.left") }}
    value={component.properties.settings.switch.captionLeft}
    onUpdate={(value) => updateProperty("settings.switch.captionLeft", value as string, component, onPropertyChange)}
  />
  <UI.Input
    label={{ name: $T("constructor.props.caption.right") }}
    value={component.properties.settings.switch.captionRight}
    onUpdate={(value) => updateProperty("settings.switch.captionRight", value as string, component, onPropertyChange)}
  />
{/snippet}

{#snippet WidgetUnits()}
  <UI.Input
    label={{ name: $T("constructor.props.units") }}
    value={component.properties.settings.number.units as string}
    onUpdate={(value) => updateProperty("settings.number.units", value, component, onPropertyChange)}
  />
{/snippet}

{#snippet WidgetSwitchingMode()}
  <UI.Switch
    label={{ name: $T("constructor.props.widget.mode") }}
    value={component.properties.icons.cycling}
    options={[{ id: crypto.randomUUID(), value: 0, class: "" }]}
    onChange={(value) => updateProperty("icons.cycling", value, component, onPropertyChange)}
  />
{/snippet}

{#snippet WidgetIcons()}
  <CommonSnippets
    snippet="IconsLib"
    initialValue={{
      name: $T("constructor.props.labelicon"),
      icon: component.properties.icons.array,
      updateProperty: (icons: string[]) => updateProperty("icons.array", icons as string[], component, onPropertyChange),
      icons: { array: ICONS_ARRAY, selectArray: true },
    }}
    {component}
    {onPropertyChange}
  />
{/snippet}

{#if forConstructor}
  <div class="flex flex-col gap-2">
    <PropsGroup label={$T("constructor.props.group.general")}>
      <CommonSnippets snippet="Access" {component} {onPropertyChange} />
      <CommonSnippets snippet="Variable" {VARIABLE_OPTIONS} {component} {onPropertyChange} />
      <CommonSnippets snippet="EventHandlerArgument" {component} {onPropertyChange} />
    </PropsGroup>
    <PropsGroup label={$T("constructor.props.group.content")}>
      <CommonSnippets snippet="Label" {component} {onPropertyChange} />
      {@render WidgetUnits()}
      {@render WidgetIcons()}
      {@render WidgetSwitchingMode()}
    </PropsGroup>
    <PropsGroup label={$T("constructor.props.group.appearance")}>
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
    </PropsGroup>
  </div>
{:else}
  <div class="flex flex-col gap-2">
    <PropsGroup label={$T("constructor.props.group.general")}>
      <CommonSnippets snippet="Identificator" {component} {onPropertyChange} />
      <CommonSnippets snippet="Access" {component} {onPropertyChange} />
      <CommonSnippets snippet="Label" {component} {onPropertyChange} />
      {@render WidgetUnits()}
      <CommonSnippets snippet="Readonly" {component} {onPropertyChange} />
    </PropsGroup>
    <PropsGroup label={$T("constructor.props.group.content")}>
      {@render WidgetSettingsLabel()}
      {@render WidgetIcons()}
      {@render WidgetSwitchingMode()}
    </PropsGroup>
    <PropsGroup label={$T("constructor.props.group.appearance")}>
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
    </PropsGroup>
  </div>
{/if}
