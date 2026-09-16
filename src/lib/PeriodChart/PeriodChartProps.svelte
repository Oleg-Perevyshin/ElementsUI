<script lang="ts">
  import { getContext } from "svelte"
  import { T } from "$lib/locales/i18n"
  import { updateProperty, type IOption, type IPeriodChartLevel, type IPeriodChartProps, type IUIComponentHandler, type UIComponent } from "../types"
  import * as UI from "$lib"
  import { optionsStore } from "../options"
  import ButtonAdd from "$lib/libIcons/ButtonAdd.svelte"
  import ButtonDelete from "$lib/libIcons/ButtonDelete.svelte"
  import CommonSnippets from "$lib/CommonSnippets.svelte"
  import PropsGroup from "$lib/PropsGroup.svelte"

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
  <PropsGroup label={$T("constructor.props.periodchart.title")} wrapperClass="mt-3">
    {#snippet headerActions()}
      <UI.Button
        wrapperClass="w-8"
        content={{ icon: ButtonAdd }}
        onClick={() => {
          const newLevel: IPeriodChartLevel = { name: `Level ${(component.properties?.levels?.length ?? 0) + 1}`, data: [] }
          const levels = [...(component.properties?.levels || []), newLevel]
          updateLevels(levels)
        }}
      />
    {/snippet}

    <div bind:this={itemsContainer} class="flex flex-col gap-2">
      {#each component.properties.levels || [] as level, index}
        <div id="item-{index}" class="flex flex-col gap-2 rounded-lg border border-(--hairline-color) bg-(--container-color)/60 p-2">
          <div class="flex items-center gap-2">
            <UI.Dragging
              wrapperClass="shrink-0"
              container={itemsContainer}
              array={component.properties.levels}
              elementIndex={index}
              onUpdate={(updatedArray) => updateLevels(updatedArray)}
            />
            <span class="flex-1"></span>
            {#if (component.properties.levels?.length ?? 0) > 1}
              <UI.Button
                wrapperClass="w-8 shrink-0"
                content={{ icon: ButtonDelete }}
                onClick={() => {
                  const levels = [...(component.properties?.levels || [])]
                  levels.splice(index, 1)
                  updateLevels(levels)
                }}
              />
            {/if}
          </div>
          <div class="flex flex-wrap items-end gap-2">
            <UI.Input
              label={{ name: $T("constructor.props.optionname") }}
              wrapperClass="min-w-28 flex-1"
              value={level.name}
              onUpdate={(value) => {
                const levels = [...(component.properties?.levels || [])]
                levels[index] = { ...levels[index], name: value as string }
                updateLevels(levels)
              }}
            />
            <UI.Select
              label={{ name: $T("constructor.props.variable") }}
              wrapperClass="min-w-32 flex-1"
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
              wrapperClass="min-w-32 flex-1"
              value={formatNumbers(level.data)}
              onUpdate={(value) => {
                const levels = [...(component.properties?.levels || [])]
                levels[index] = { ...levels[index], data: parseNumbers(value as string) }
                updateLevels(levels)
              }}
            />
            <UI.Input
              label={{ name: $T("constructor.props.periodchart.labels") }}
              wrapperClass="min-w-32 flex-1"
              value={formatStrings(level.labels)}
              onUpdate={(value) => {
                const levels = [...(component.properties?.levels || [])]
                levels[index] = { ...levels[index], labels: parseStrings(value as string) }
                updateLevels(levels)
              }}
            />
          </div>
        </div>
      {/each}
      <div id="item-{component.properties.levels?.length ?? 0}" class="min-h-4"></div>
    </div>
  </PropsGroup>
{/snippet}

{#if forConstructor}
  <div class="flex flex-col gap-2">
    <PropsGroup label={$T("constructor.props.group.general")}>
      <CommonSnippets snippet="Access" {component} {onPropertyChange} />
      <CommonSnippets snippet="Colors" initialValue={{ color: initialColor, uselessColors: ["bg-max"] }} {component} {onPropertyChange} />
      <CommonSnippets snippet="Label" {component} {onPropertyChange} />
    </PropsGroup>
    <PropsGroup label={$T("constructor.props.group.value")}>
      {@render PeriodChartUnit()}
    </PropsGroup>
  </div>
  {@render PeriodChartLevels()}
{:else}
  <div class="flex flex-col gap-2">
    <PropsGroup label={$T("constructor.props.group.general")}>
      <CommonSnippets snippet="Identificator" {component} {onPropertyChange} />
      <CommonSnippets snippet="Access" {component} {onPropertyChange} />
      <CommonSnippets snippet="Label" {component} {onPropertyChange} />
    </PropsGroup>
    <PropsGroup label={$T("constructor.props.group.value")}>
      <CommonSnippets snippet="WrapperClass" {component} {onPropertyChange} />
      <CommonSnippets snippet="Colors" initialValue={{ color: initialColor, uselessColors: ["bg-max"] }} {component} {onPropertyChange} />
      {@render PeriodChartUnit()}
    </PropsGroup>
  </div>
  {@render PeriodChartLevels()}
{/if}
