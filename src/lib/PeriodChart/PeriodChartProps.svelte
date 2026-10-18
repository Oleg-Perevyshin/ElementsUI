<script lang="ts">
  import { getContext } from "svelte"
  import { Language, T } from "$lib/locales/i18n"
  import { localizeText } from "$lib/locales/localize"
  import { updateProperty, type IOption, type IPeriodChartLevel, type IPeriodChartProps, type IUIComponentHandler, type UIComponent } from "../types"
  import * as UI from "$lib"
  import { optionsStore, findColorOption } from "../options"
  import ButtonAdd from "$lib/libIcons/ButtonAdd.svelte"
  import ButtonDelete from "$lib/libIcons/ButtonDelete.svelte"
  import CommonSnippets from "$lib/CommonSnippets.svelte"
  import PropsGroup from "$lib/PropsGroup.svelte"
  import PropsListHeader from "$lib/PropsListHeader.svelte"
  import PropsListModal from "$lib/PropsListModal.svelte"

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
  /* Колонки строки уровня: ручка, номер и текст, переменная, данные, подписи, удаление */
  const LEVEL_GRID = "grid-cols-[2rem_minmax(6rem,auto)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_2rem]"

  const initialColor = $derived(findColorOption($optionsStore.COLOR_OPTIONS, component.properties.wrapperClass))

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

{#snippet PeriodChartLevels()}
  <PropsListModal label={$T("constructor.props.periodchart.title")} count={component.properties.levels?.length ?? 0} wrapperClass="w-250 h-[70%]">
    {#snippet main()}
      <PropsGroup>
        {#snippet headerActions()}
          <UI.Button
            wrapperClass="w-8"
            content={{ icon: ButtonAdd }}
            onClick={() => {
              const newLevel: IPeriodChartLevel = { name: "", data: [] }
              const levels = [...(component.properties?.levels || []), newLevel]
              updateLevels(levels)
            }}
          />
        {/snippet}

        <div bind:this={itemsContainer} class="flex flex-col gap-2">
          {#if component.properties.levels?.length}
            <PropsListHeader
              gridClass={LEVEL_GRID}
              captions={[
                "",
                $T("constructor.props.item"),
                $T("constructor.props.variable"),
                $T("constructor.props.periodchart.data"),
                $T("constructor.props.periodchart.labels"),
                "",
              ]}
            />
          {/if}
          {#each component.properties.levels || [] as level, index}
            <div
              id="item-{index}"
              class="grid {LEVEL_GRID} items-center gap-3 rounded-lg border border-(--hairline-color) bg-(--container-color)/60 px-2 py-1.5"
            >
              <UI.Dragging
                container={itemsContainer}
                array={component.properties.levels}
                elementIndex={index}
                onUpdate={(updatedArray) => updateLevels(updatedArray)}
              />
              <div class="flex min-w-0 flex-col text-[13px]">
                <span class="font-semibold">{$T("constructor.props.periodchart.item", { n: index + 1 })}</span>
                <span class="truncate text-(--muted-color)">{localizeText(level.name, $Language) || $T("constructor.props.tabs.untitled")}</span>
              </div>
              <UI.Select
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
                value={formatNumbers(level.data)}
                onUpdate={(value) => {
                  const levels = [...(component.properties?.levels || [])]
                  levels[index] = { ...levels[index], data: parseNumbers(value as string) }
                  updateLevels(levels)
                }}
              />
              <UI.Input
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
              {:else}
                <span></span>
              {/if}
            </div>
          {/each}
          <div id="item-{component.properties.levels?.length ?? 0}" class="min-h-4"></div>
        </div>
      </PropsGroup>
    {/snippet}
  </PropsListModal>
{/snippet}

{#if forConstructor}
  <div class="flex flex-col gap-2">
    <PropsGroup label={$T("constructor.props.group.general")}>
      <CommonSnippets snippet="Access" {component} {onPropertyChange} />
      <CommonSnippets snippet="Colors" initialValue={{ color: initialColor, uselessColors: ["bg-max"] }} {component} {onPropertyChange} />
      <CommonSnippets snippet="Label" {component} {onPropertyChange} />
    </PropsGroup>
  </div>
  <PropsGroup>
    {@render PeriodChartLevels()}
  </PropsGroup>
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
    </PropsGroup>
  </div>
  <PropsGroup>
    {@render PeriodChartLevels()}
  </PropsGroup>
{/if}
