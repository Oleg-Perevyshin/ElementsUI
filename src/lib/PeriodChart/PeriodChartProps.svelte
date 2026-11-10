<!-- $lib/PeriodChart/PeriodChartProps.svelte - панель свойств конструктора для PeriodChart -->
<script lang="ts">
  import { getContext } from "svelte"
  import { Language, T } from "../locales/i18n"
  import { localizeText } from "../locales/localize"
  import type { IPeriodChartLevel, IPeriodChartProps, UIComponent } from "../types"
  import type { PropertyChange } from "../propsEditor"
  import * as UI from ".."
  import ButtonAdd from "../libIcons/ButtonAdd.svelte"
  import ButtonDelete from "../libIcons/ButtonDelete.svelte"
  import CommonSnippets from "../CommonSnippets.svelte"
  import PropsGroup from "../PropsGroup.svelte"
  import PropsListHeader from "../PropsListHeader.svelte"
  import PropsListModal from "../PropsListModal.svelte"

  const {
    component,
    onPropertyChange,
  }: {
    component: UIComponent & { properties: Partial<IPeriodChartProps> }
    onPropertyChange: (change: PropertyChange<IPeriodChartProps>) => void
  } = $props()

  const VARIABLE_OPTIONS = getContext<{ id: string; value: string; name: string }[] | undefined>("DeviceVariables") ?? []

  let itemsContainer: HTMLDivElement | null = $state(null)
  /* Колонки строки уровня: ручка, номер и текст, переменная, данные, подписи, удаление */
  const LEVEL_GRID = "grid-cols-[2rem_minmax(6rem,auto)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_2rem]"
  const levels = $derived(component.properties.levels ?? [])

  /* levels[].data/labels - массивы, редактируются одной строкой через запятую */
  const parseList = (text: string) =>
    text
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  const parseNumbers = (text: string) => parseList(text).map(Number).filter(Number.isFinite)

  /* eventHandler.Variables - все переменные уровней, чтобы приложение подписалось на них разом */
  const setLevels = (next: IPeriodChartLevel[]) =>
    onPropertyChange({ properties: { levels: next }, eventHandler: { Variables: next.map((l) => l.variable).filter((v): v is string => !!v) } })
  const updateLevel = (index: number, value: Partial<IPeriodChartLevel>) => setLevels(levels.map((level, i) => (i === index ? { ...level, ...value } : level)))
</script>

<div class="flex flex-col gap-2">
  <PropsGroup label={$T("constructor.props.group.general")}>
    <CommonSnippets snippet="Access" {component} {onPropertyChange} />
    <CommonSnippets snippet="Accent" {component} {onPropertyChange} />
    <CommonSnippets snippet="Label" {component} {onPropertyChange} />
  </PropsGroup>
</div>
<PropsGroup>
  <PropsListModal label={$T("constructor.props.periodchart.title")} count={levels.length} wrapperClass="w-250 h-[70%]">
    {#snippet main()}
      <PropsGroup>
        {#snippet headerActions()}
          <UI.Button wrapperClass="w-8" content={{ icon: ButtonAdd }} onClick={() => setLevels([...levels, { name: "", data: [] }])} />
        {/snippet}

        <div bind:this={itemsContainer} class="flex flex-col gap-2">
          {#if levels.length}
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
          {#each levels as level, index (index)}
            <div
              id="item-{index}"
              class="grid {LEVEL_GRID} items-center gap-3 rounded-lg border border-(--hairline-color) bg-(--container-color)/60 px-2 py-1.5"
            >
              <UI.Dragging container={itemsContainer} array={levels} elementIndex={index} onUpdate={setLevels} />
              <div class="flex min-w-0 flex-col text-[13px]">
                <span class="font-semibold">{$T("constructor.props.periodchart.item", { n: index + 1 })}</span>
                <span class="truncate text-(--muted-color)">{localizeText(level.name, $Language) || $T("constructor.props.tabs.untitled")}</span>
              </div>
              <UI.Select type="input" options={VARIABLE_OPTIONS} value={level.variable} onUpdate={(variable) => updateLevel(index, { variable })} />
              <UI.Input value={level.data.join(", ")} onUpdate={(value) => updateLevel(index, { data: parseNumbers(String(value)) })} />
              <UI.Input value={(level.labels ?? []).join(", ")} onUpdate={(value) => updateLevel(index, { labels: parseList(String(value)) })} />
              {#if levels.length > 1}
                <UI.Button wrapperClass="w-8" content={{ icon: ButtonDelete }} onClick={() => setLevels(levels.filter((_, i) => i !== index))} />
              {:else}
                <span></span>
              {/if}
            </div>
          {/each}
          <div id="item-{levels.length}" class="min-h-4"></div>
        </div>
      </PropsGroup>
    {/snippet}
  </PropsListModal>
</PropsGroup>
