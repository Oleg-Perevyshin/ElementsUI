<script lang="ts">
  import { getContext } from "svelte"
  import { T } from "$lib/locales/i18n"
  import { updateProperty, type IOption, type IPeriodChartLevel, type IPeriodChartProps, type IUIComponentHandler, type UIComponent } from "../types"
  import * as UI from "$lib"
  import { optionsStore } from "../options"
  import ButtonAdd from "$lib/libIcons/ButtonAdd.svelte"
  import ButtonDelete from "$lib/libIcons/ButtonDelete.svelte"
  import CommonSnippets from "$lib/CommonSnippets.svelte"

  const {
    component,
    onPropertyChange,
    forConstructor = true,
  } = $props<{
    component: UIComponent & { properties: Partial<IPeriodChartProps> }
    onPropertyChange: (updates: Partial<{ properties?: string | object; name?: string; access?: string; eventHandler?: IUIComponentHandler }>) => void
    forConstructor?: boolean
  }>()

  const DeviceVariables = getContext<{ id: string; value: string; name: string }[]>("DeviceVariables")
  let VARIABLE_OPTIONS = $derived(DeviceVariables && Array.isArray(DeviceVariables) ? DeviceVariables : [])

  let itemsContainer: HTMLDivElement | null = $state(null)

  const initialColor = $derived(
    $optionsStore.COLOR_OPTIONS.find((c) =>
      (c.value as string).includes(component.properties.wrapperClass?.split(" ").find((cls: string) => cls.startsWith("bg-"))),
    ),
  )

  /* levels[].data/labels хранятся как number[]/string[], редактируются одной строкой через запятую (fallback для литеральных демо-данных) */
  const parseNumbers = (text: string): number[] =>
    text
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map(Number)
      .filter((n) => !Number.isNaN(n))
  const formatNumbers = (arr: number[] | undefined): string => (arr || []).join(", ")
  const parseStrings = (text: string): string[] =>
    text
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
  const formatStrings = (arr: string[] | undefined): string => (arr || []).join(", ")

  /* eventHandler.Variables — список всех PWR.*-переменных со всех уровней, чтобы рантайм подписался на них разом */
  const updateLevels = (levels: IPeriodChartLevel[]) => {
    updateProperty("levels", levels, component, onPropertyChange)
    onPropertyChange({ eventHandler: { Variables: levels.map((l) => l.variable).filter((v): v is string => !!v) } })
  }
</script>

{#snippet PeriodChartUnit()}
  <UI.Input
    label={{ name: $T("constructor.props.units") }}
    value={component.properties.unit}
    onUpdate={(value) => updateProperty("unit", value, component, onPropertyChange)}
  />
{/snippet}

{#snippet PeriodChartLevels()}
  <hr class="border-gray-400" />

  <div class="space-y-4" bind:this={itemsContainer}>
    <div class="m-0 flex items-center justify-center gap-2">
      <h4>{$T("constructor.props.periodchart.title")}</h4>
      <UI.Button
        wrapperClass="w-8"
        content={{ icon: ButtonAdd }}
        onClick={() => {
          const newLevel: IPeriodChartLevel = { name: `Level ${(component.properties?.levels?.length ?? 0) + 1}`, data: [] }
          const levels = [...(component.properties?.levels || []), newLevel]
          updateLevels(levels)
        }}
      />
    </div>

    {#each component.properties.levels || [] as level, index}
      <div id="item-{index}" class="m-0 flex items-end justify-around gap-2 border-gray-400">
        <UI.Dragging
          wrapperClass="w-9"
          container={itemsContainer}
          array={component.properties.levels}
          elementIndex={index}
          onUpdate={(updatedArray) => updateLevels(updatedArray)}
        />
        <UI.Input
          label={{ name: $T("constructor.props.optionname") }}
          wrapperClass="w-1/5"
          value={level.name}
          onUpdate={(value) => {
            const levels = [...(component.properties?.levels || [])]
            levels[index] = { ...levels[index], name: value as string }
            updateLevels(levels)
          }}
        />
        <UI.Select
          label={{ name: $T("constructor.props.variable") }}
          wrapperClass="w-1/5"
          type="input"
          options={VARIABLE_OPTIONS}
          value={VARIABLE_OPTIONS.find((opt) => opt.value === level.variable)}
          onUpdate={(value) => {
            const levels = [...(component.properties?.levels || [])]
            levels[index] = { ...levels[index], variable: (value as IOption).value as string }
            updateLevels(levels)
          }}
        />
        <UI.Input
          label={{ name: $T("constructor.props.periodchart.data") }}
          wrapperClass="w-1/5"
          value={formatNumbers(level.data)}
          onUpdate={(value) => {
            const levels = [...(component.properties?.levels || [])]
            levels[index] = { ...levels[index], data: parseNumbers(value as string) }
            updateLevels(levels)
          }}
        />
        <UI.Input
          label={{ name: $T("constructor.props.periodchart.labels") }}
          wrapperClass="w-1/5"
          value={formatStrings(level.labels)}
          onUpdate={(value) => {
            const levels = [...(component.properties?.levels || [])]
            levels[index] = { ...levels[index], labels: parseStrings(value as string) }
            updateLevels(levels)
          }}
        />

        {#if (component.properties.levels?.length ?? 0) > 1}
          <UI.Button
            wrapperClass="w-8"
            content={{ icon: ButtonDelete }}
            onClick={() => {
              const levels = [...(component.properties?.levels || [])]
              levels.splice(index, 1)
              updateLevels(levels)
            }}
          />
        {/if}
      </div>
    {/each}
    <div id="item-{component.properties.levels?.length ?? 0}" class="min-h-4"></div>
  </div>
{/snippet}

{#if forConstructor}
  <div class="relative mb-4 flex flex-row items-start justify-center">
    <div class="flex w-1/2 flex-col px-2">
      <CommonSnippets snippet="Access" {component} {onPropertyChange} />
      <CommonSnippets snippet="Colors" initialValue={{ color: initialColor, uselessColors: ["bg-max"] }} {component} {onPropertyChange} />
      <CommonSnippets snippet="Label" {component} {onPropertyChange} />
    </div>
    <div class="flex w-1/2 flex-col px-2">
      {@render PeriodChartUnit()}
    </div>
  </div>
  {@render PeriodChartLevels()}
{:else}
  <div class="relative mb-4 flex flex-row items-start justify-center">
    <div class="flex w-1/2 flex-col px-2">
      <CommonSnippets snippet="Identificator" {component} {onPropertyChange} />
      <CommonSnippets snippet="Access" {component} {onPropertyChange} />
      <CommonSnippets snippet="Label" {component} {onPropertyChange} />
    </div>
    <div class="flex w-1/2 flex-col px-2">
      <CommonSnippets snippet="WrapperClass" {component} {onPropertyChange} />
      <CommonSnippets snippet="Colors" initialValue={{ color: initialColor, uselessColors: ["bg-max"] }} {component} {onPropertyChange} />
      {@render PeriodChartUnit()}
    </div>
  </div>
  {@render PeriodChartLevels()}
{/if}
