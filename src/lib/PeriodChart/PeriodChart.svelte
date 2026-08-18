<!-- $lib/ElementsUI/PeriodChart.svelte -->
<script module lang="ts">
  import type { IPeriodChartLevel } from "../types"

  /* Демо-данные по умолчанию — компонент выглядит осмысленно уже без пропсов, как у Tabs/Switch */
  const randomLevelData = (n: number) => Array.from({ length: n }, () => Math.round(Math.random() * 100))

  export const DEFAULT_LEVELS: IPeriodChartLevel[] = [
    { name: "Год", data: randomLevelData(12) },
    { name: "Месяц", data: randomLevelData(31) },
    { name: "Сутки", data: randomLevelData(24) },
    { name: "Час", data: randomLevelData(6) },
  ]
</script>

<script lang="ts">
  import { twMerge } from "tailwind-merge"
  import type { IPeriodChartProps } from "../types"

  let {
    id = crypto.randomUUID(),
    wrapperClass = "bg-blue",
    label = { name: "", class: "" },
    levels = DEFAULT_LEVELS,
    unit = "",
    onLevelChange = () => {},
  }: IPeriodChartProps = $props()

  let currentLevelIndex = $state(0)
  $effect(() => {
    if (currentLevelIndex >= levels.length) currentLevelIndex = 0
  })

  const currentLevel = $derived<IPeriodChartLevel | undefined>(levels[currentLevelIndex])
  const values = $derived(currentLevel?.data ?? [])
  const maxValue = $derived(values.length ? Math.max(...values, 0) * 1.1 || 1 : 1)

  const selectLevel = (index: number) => {
    if (index === currentLevelIndex) return
    currentLevelIndex = index
    onLevelChange(index, levels[index])
  }

  const barLabel = (i: number) => currentLevel?.labels?.[i] ?? String(i + 1)
  const barHeightPercent = (value: number) => Math.max((value / maxValue) * 100, value > 0 ? 2 : 0)

  /* Высота зоны столбиков — h-40 (10rem = 160px по умолчанию), должна совпадать с классом ниже.
   * Если бар ниже этого порога, число физически не влезает внутрь (обрежется overflow-hidden) —
   * рисуем его НАД столбиком вместо "внутри". */
  const BAR_ZONE_PX = 160
  const MIN_LABEL_PX = 18
  const isSmallBar = (value: number) => (barHeightPercent(value) / 100) * BAR_ZONE_PX < MIN_LABEL_PX
</script>

<div id={`${id}-${crypto.randomUUID().slice(0, 6)}`} class={twMerge("relative flex w-full flex-col items-center justify-center gap-2", wrapperClass)}>
  {#if label.name}
    <h5 class={twMerge("w-full px-4 text-center", label.class)}>{label.name}</h5>
  {/if}

  <!-- Переключатель уровней детализации -->
  <div class="flex w-full items-center justify-center gap-1 rounded-xl bg-(--bg-color) p-1">
    {#each levels as level, index (level.name)}
      <button
        type="button"
        class={twMerge(
          "flex-1 cursor-pointer rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors duration-150",
          index === currentLevelIndex ? "bg-(--back-color) shadow-sm" : "text-(--shadow-color)/75 hover:text-(--shadow-color)",
        )}
        onclick={() => selectLevel(index)}
      >
        {level.name}
      </button>
    {/each}
  </div>

  <!-- Столбчатый график текущего уровня -->
  <div class="relative flex w-full flex-col rounded-xl border border-(--border-color) bg-(--back-color) p-3">
    {#if values.length === 0}
      <div class="flex h-48 w-full items-center justify-center text-(--shadow-color)/60">Нет данных</div>
    {:else}
      <div class="flex h-40 w-full items-end gap-1">
        {#each values as value, i}
          <div class="relative flex h-full flex-1 flex-col items-center justify-end" role="img" aria-label={`${barLabel(i)}: ${value}${unit}`}>
            {#if isSmallBar(value)}
              <span class="mb-0.5 text-xs font-semibold text-(--shadow-color)">{Math.round(value)}</span>
            {/if}
            <div
              class="flex w-full items-center justify-center overflow-hidden rounded-t-sm bg-(--bg-color) transition-[height] duration-150"
              style="height: {barHeightPercent(value)}%"
            >
              {#if !isSmallBar(value)}
                <span class="px-0.5 text-xs font-semibold text-white">{Math.round(value)}</span>
              {/if}
            </div>
          </div>
        {/each}
      </div>

      <!-- Подписи по оси X — всегда видны, без наведения -->
      <div class="mt-1 flex w-full gap-1">
        {#each values as _, i}
          <div class="flex-1 truncate text-center text-[10px] font-bold text-(--shadow-color)/75">{barLabel(i)}</div>
        {/each}
      </div>
    {/if}
  </div>
</div>
