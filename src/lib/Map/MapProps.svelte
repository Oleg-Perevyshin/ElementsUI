<script lang="ts">
  import { T } from "$lib/locales/i18n"
  import { type UIComponent, type IMapProps, updateProperty, type IUIComponentHandler } from "../types"
  import { ICONS } from "$lib/icons"
  import { optionsStore } from "$lib/options"
  import { getContext } from "svelte"
  import CommonSnippets from "$lib/CommonSnippets.svelte"
  import { Switch, Select } from "$lib"

  const TRACK_LENGTH_OPTIONS = [100, 500, 1000, 5000, 10000, 50000].map((value) => ({ id: crypto.randomUUID(), value, name: String(value) }))

  const {
    component,
    onPropertyChange,
    forConstructor = true,
  } = $props<{
    component: UIComponent & { properties: Partial<IMapProps> }
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

{#if forConstructor}
  <div class="relative flex flex-row items-start justify-center">
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Access" {component} {onPropertyChange} />
      <CommonSnippets snippet="Variable" {VARIABLE_OPTIONS} {component} {onPropertyChange} />
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Label" {component} {onPropertyChange} />
      <CommonSnippets snippet="LabelAlign" initialValue={initialAlign} {component} {onPropertyChange} />
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets
        snippet="IconsLib"
        initialValue={{
          name: $T("constructor.props.markerIcon"),
          icon: component.properties.markerIcon,
          updateProperty: (icon: string) => updateProperty("markerIcon", icon as string, component, onPropertyChange),
          icons: { array: ICONS },
        }}
        {component}
        {onPropertyChange}
      />
      <Switch
        label={{ name: $T("constructor.props.map.track") }}
        value={component.properties.trackEnabled ? 1 : 0}
        options={[{ id: crypto.randomUUID(), value: 0, class: "" }]}
        onChange={(value) => updateProperty("trackEnabled", Boolean(value), component, onPropertyChange)}
      />
      {#if component.properties.trackEnabled}
        <Select
          label={{ name: $T("constructor.props.map.trackLength") }}
          type="input"
          options={TRACK_LENGTH_OPTIONS}
          value={TRACK_LENGTH_OPTIONS.find((opt) => opt.value === (component.properties.trackLength ?? 1000))}
          onUpdate={(option) => updateProperty("trackLength", (option as { value: number }).value, component, onPropertyChange)}
        />
      {/if}
    </div>
  </div>
{:else}
  <div class="relative mb-2 flex flex-row items-start justify-center">
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Access" {component} {onPropertyChange} />
      <CommonSnippets snippet="Identificator" {component} {onPropertyChange} />
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Label" {component} {onPropertyChange} />
      <CommonSnippets snippet="LabelClass" {component} {onPropertyChange} />
    </div>

    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets
        snippet="IconsLib"
        initialValue={{
          name: $T("constructor.props.markerIcon"),
          icon: component.properties.markerIcon,
          updateProperty: (icon: string) => updateProperty("markerIcon", icon as string, component, onPropertyChange),
          icons: { array: ICONS },
        }}
        {component}
        {onPropertyChange}
      />
      <Switch
        label={{ name: $T("constructor.props.map.track") }}
        value={component.properties.trackEnabled ? 1 : 0}
        options={[{ id: crypto.randomUUID(), value: 0, class: "" }]}
        onChange={(value) => updateProperty("trackEnabled", Boolean(value), component, onPropertyChange)}
      />
      {#if component.properties.trackEnabled}
        <Select
          label={{ name: $T("constructor.props.map.trackLength") }}
          type="input"
          options={TRACK_LENGTH_OPTIONS}
          value={TRACK_LENGTH_OPTIONS.find((opt) => opt.value === (component.properties.trackLength ?? 1000))}
          onUpdate={(option) => updateProperty("trackLength", (option as { value: number }).value, component, onPropertyChange)}
        />
      {/if}
    </div>
  </div>
{/if}
