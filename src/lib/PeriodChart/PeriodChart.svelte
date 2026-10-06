<!-- $lib/PeriodChart/PeriodChart.svelte — сегментированный переключатель,
     числа внутри столбиков убраны, акцент только у выбранного. Логика не тронута. -->
<script module lang="ts">
  import type { IPeriodChartLevel } from "../types"

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
    /* Было "bg-blue" — декоративная заливка панели. Теперь нейтрально;
       вызовы, которым нужен цвет, по-прежнему могут передать bg-* явно. */
    wrapperClass = "",
    label = { name: "", class: "" },
    levels = DEFAULT_LEVELS,
    unit = "",
    onLevelChange = () => {},
  }: IPeriodChartProps = $props()

  let currentLevelIndex = $state(0)
  let hoveredIndex: number | null = $state(null)

  $effect(() => {
    if (currentLevelIndex >= levels.length) currentLevelIndex = 0
  })

  const currentLevel = $derived<IPeriodChartLevel | undefined>(levels[currentLevelIndex])
  const values = $derived(currentLevel?.data ?? [])

  /* Шкала Y: шаг 1/2/2.5/5·10ⁿ, ~4 деления, верх округляется вверх до шага, низ всегда 0 */
  const AXIS_DIVISIONS = 4
  const axis = $derived.by(() => {
    const max = values.reduce((m, v) => (Number.isFinite(v) && v > m ? v : m), 0)
    if (max <= 0) return { step: 0.25, top: 1, ticks: [1, 0.75, 0.5, 0.25, 0] }
    const raw = max / AXIS_DIVISIONS
    const mag = 10 ** Math.floor(Math.log10(raw))
    const step = ([1, 2, 2.5, 5, 10].find((m) => m * mag >= raw * (1 - 1e-9)) ?? 10) * mag
    const count = Math.max(1, Math.ceil(max / step - 1e-9))
    return { step, top: step * count, ticks: Array.from({ length: count + 1 }, (_, i) => step * (count - i)) }
  })

  /* Подпись деления: k/M для больших значений, число знаков после запятой — по величине шага */
  const formatTick = (v: number) => {
    const [div, suffix] = axis.top >= 1e6 ? [1e6, "M"] : axis.top >= 1e4 ? [1e3, "k"] : [1, ""]
    const step = axis.step / div
    let decimals = 0
    while (decimals < 10 && Math.abs(Math.round(step * 10 ** decimals) - step * 10 ** decimals) > 1e-6) decimals++
    return (v / div).toFixed(decimals) + suffix
  }

  /* Значение во всплывающей подсказке: 4 значащие цифры, без потери малых величин вроде 0.0734 */
  const formatValue = (v: number) => (Number.isInteger(v) ? String(v) : String(Number(v.toPrecision(4))))

  const selectLevel = (index: number) => {
    if (index === currentLevelIndex) return
    currentLevelIndex = index
    onLevelChange(index, levels[index])
  }

  const barLabel = (i: number) => currentLevel?.labels?.[i] ?? String(i + 1)
  const barHeightPercent = (value: number) => Math.max((value / axis.top) * 100, value > 0 ? 2 : 0)

  /* Подписи по оси прореживаются: при 31 значении все они не читаются */
  const labelStep = $derived(Math.ceil(values.length / 12) || 1)
</script>

<div id={`${id}-${crypto.randomUUID().slice(0, 6)}`} class={twMerge("relative flex w-full flex-col gap-3", wrapperClass)}>
  {#if label.name}
    <h5 class={twMerge("w-full text-[13px] font-semibold text-(--muted-color)", label.class)}>{label.name}</h5>
  {/if}

  <!-- Сегментированный переключатель уровней: при одном уровне переключать нечего -->
  {#if levels.length > 1}
    <div class="flex w-full items-center gap-0.5 rounded-[10px] bg-(--container-color) p-[3px]">
      {#each levels as level, index (level.name)}
        <button
          type="button"
          class={twMerge(
            "flex-1 cursor-pointer rounded-[7px] px-3 py-1.5 text-[13px] transition-colors duration-150",
            index === currentLevelIndex
              ? "bg-(--back-color) font-semibold text-(--font-color) shadow-(--elevation-1)"
              : "font-medium text-(--muted-color) hover:text-(--font-color)",
          )}
          onclick={() => selectLevel(index)}
        >
          {level.name}
        </button>
      {/each}
    </div>
  {/if}

  <!-- Столбчатый график -->
  <div class="relative flex w-full flex-col gap-1.5 rounded-[12px] border border-(--hairline-color) bg-(--back-color) p-3.5">
    {#if values.length === 0}
      <div class="flex h-40 w-full items-center justify-center text-[13px] text-(--faint-color)">Нет данных</div>
    {:else}
      <div class="flex w-full gap-2">
        <!-- Шкала Y: подписи нулевой высоты, центр каждой ровно на своей линии сетки -->
        <div class="flex h-40 shrink-0 flex-col justify-between">
          {#each axis.ticks as tick}
            <div class="flex h-0 items-center justify-end text-[10px] font-medium text-(--faint-color) tabular-nums">
              {formatTick(tick)}
            </div>
          {/each}
        </div>

        <div class="flex min-w-0 flex-1 flex-col gap-1.5">
          <div class="relative flex h-40 w-full items-end gap-1">
            {#each axis.ticks as tick}
              <div
                class="pointer-events-none absolute inset-x-0 border-t {tick === 0
                  ? 'border-(--hairline-color)'
                  : 'border-dashed border-(--hairline-color)/60'}"
                style="bottom: {(tick / axis.top) * 100}%"
              ></div>
            {/each}

            {#each values as value, i}
              <div
                class="relative flex h-full flex-1 flex-col items-center justify-end"
                role="img"
                aria-label={`${barLabel(i)}: ${value}${unit}`}
                onmouseenter={() => (hoveredIndex = i)}
                onmouseleave={() => (hoveredIndex = null)}
              >
                {#if hoveredIndex === i}
                  <span
                    class="pointer-events-none absolute -top-1 z-10 -translate-y-full rounded-lg border border-(--hairline-color) bg-(--back-color) px-2 py-1 text-[12px] font-semibold tabular-nums whitespace-nowrap shadow-(--elevation-2)"
                  >
                    {barLabel(i)}: {formatValue(value)}{unit}
                  </span>
                {/if}
                <div
                  class="w-full rounded-t-[3px] transition-[height,background-color] duration-150 {hoveredIndex === i
                    ? 'bg-(--accent-color)'
                    : 'bg-(--accent-color)/35'}"
                  style="height: {barHeightPercent(value)}%"
                ></div>
              </div>
            {/each}
          </div>

          <div class="flex w-full gap-1">
            {#each values as _, i}
              <div class="flex-1 truncate text-center text-[10px] font-bold text-(--faint-color)">
                {i % labelStep === 0 ? barLabel(i) : ""}
              </div>
            {/each}
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
