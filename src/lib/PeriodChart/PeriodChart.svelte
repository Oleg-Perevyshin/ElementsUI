<!-- $lib/PeriodChart/PeriodChart.svelte - столбики за период и сегментированный переключатель периода, акцент только у выбранного -->
<script module lang="ts">
  import type { IPeriodChartLevel } from "../types"

  const randomLevelData = (n: number) => Array.from({ length: n }, () => Math.round(Math.random() * 100))

  /* Демо-уровни, когда levels не заданы; name - ключ перевода */
  export const DEFAULT_LEVELS: IPeriodChartLevel[] = [
    { name: "ui.period.year", data: randomLevelData(12) },
    { name: "ui.period.month", data: randomLevelData(31) },
    { name: "ui.period.day", data: randomLevelData(24) },
    { name: "ui.period.hour", data: randomLevelData(6) },
  ]
</script>

<script lang="ts">
  import FieldLabel from "../FieldLabel.svelte"
  import { T } from "../locales/i18n"
  import { twMerge } from "tailwind-merge"
  import { accentStyle } from "../accent"
  import type { IPeriodChartProps } from "../types"
  import ScaleControls from "../ScaleControls.svelte"

  let {
    accent,
    /* Панель без заливки, цвет можно передать явно через bg-* */
    wrapperClass = "",
    label = { name: "", class: "" },
    help,
    levels: levelsProp,
    unit = "",
    onLevelChange = () => {},
  }: IPeriodChartProps = $props()

  let currentLevelIndex = $state(0)
  let hoveredIndex: number | null = $state(null)

  $effect(() => {
    if (currentLevelIndex >= levels.length) currentLevelIndex = 0
  })

  /* Уровень без имени подписывается стандартным периодом по своему месту: год, месяц, день, час */
  const levels = $derived(
    levelsProp
      ? levelsProp.map((level, i) => ({ ...level, name: level.name || $T(DEFAULT_LEVELS[i]?.name ?? "") }))
      : DEFAULT_LEVELS.map((level) => ({ ...level, name: $T(level.name) })),
  )
  const currentLevel = $derived<IPeriodChartLevel | undefined>(levels[currentLevelIndex])
  const values = $derived(currentLevel?.data ?? [])

  /* Пределы шкалы у каждой вкладки свои, их задаёт пользователь в окне кнопки настроек; без них шкала подстраивается под данные.
     Заданы оба (min < max) - шкала фиксируется на них, кнопка-замок отпускает её и возвращает */
  type Limits = { min?: number; max?: number }
  let userLimits = $state<Record<number, Limits>>({})
  const limits = $derived<Limits>(userLimits[currentLevelIndex] ?? {})
  const bounds = $derived(limits.min !== undefined && limits.max !== undefined && limits.max > limits.min ? { min: limits.min, max: limits.max } : null)
  let unlocked = $state(false)
  const locked = $derived(!!bounds && !unlocked)
  const setLimits = (next: Limits) => {
    userLimits[currentLevelIndex] = next
    unlocked = false
  }
  /* Диапазон данных всегда включает 0: столбики растут от нуля вверх или вниз */
  const dataRange = $derived(values.reduce((r, v) => (Number.isFinite(v) ? { min: Math.min(r.min, v), max: Math.max(r.max, v) } : r), { min: 0, max: 0 }))
  const toggleLock = () => (unlocked = !unlocked)

  /* Шкала Y: шаг 1/2/2.5/5·10ⁿ, ~4 деления, верх и низ округляются наружу до шага, 0 всегда на шкале */
  const AXIS_DIVISIONS = 4
  const axis = $derived.by(() => {
    const fixed = locked ? bounds : null
    const lo = fixed ? fixed.min : Math.min(dataRange.min, 0)
    const hi = fixed ? fixed.max : Math.max(dataRange.max, 0)
    if (hi - lo <= 0) return { step: 0.25, top: 1, bottom: 0, ticks: [1, 0.75, 0.5, 0.25, 0] }
    const raw = (hi - lo) / AXIS_DIVISIONS
    const mag = 10 ** Math.floor(Math.log10(raw))
    const step = ([1, 2, 2.5, 5, 10].find((m) => m * mag >= raw * (1 - 1e-9)) ?? 10) * mag
    /* Зафиксированная шкала - ровно заданные границы, деления на круглых значениях между ними; иначе границы округляются наружу до шага */
    const top = fixed ? hi : step * Math.ceil(hi / step - 1e-9)
    const bottom = fixed ? lo : step * Math.floor(lo / step + 1e-9)
    const ticks: number[] = []
    for (let v = step * Math.ceil(bottom / step - 1e-9); v <= top + step * 1e-9; v += step) ticks.push(Math.abs(v) < step * 1e-9 ? 0 : v)
    /* Границы подписываются всегда; круглое деление, вплотную к границе, не подписывается */
    const near = (a: number, b: number) => Math.abs(a - b) < step * 0.4
    const inner = ticks.filter((v) => !near(v, top) && !near(v, bottom))
    return { step, top, bottom, ticks: [top, ...inner.reverse(), bottom] }
  })
  const span = $derived(axis.top - axis.bottom || 1)
  /* Положение значения по высоте шкалы, % снизу */
  const pct = (v: number) => ((Math.min(Math.max(v, axis.bottom), axis.top) - axis.bottom) / span) * 100

  /* Подпись деления: k/M для больших значений, число знаков после запятой - по величине шага */
  const formatTick = (v: number) => {
    const big = Math.max(Math.abs(axis.top), Math.abs(axis.bottom))
    const [div, suffix] = big >= 1e6 ? [1e6, "M"] : big >= 1e4 ? [1e3, "k"] : [1, ""]
    /* Знаков - сколько нужно шагу, а у заданной границы (360, 0.37) - и ей самой, не больше 4 */
    const decimalsOf = (x: number) => {
      let d = 0
      while (d < 4 && Math.abs(Math.round(x * 10 ** d) - x * 10 ** d) > 1e-6) d++
      return d
    }
    return (v / div).toFixed(Math.max(decimalsOf(axis.step / div), decimalsOf(v / div))) + suffix
  }

  /* Значение во всплывающей подсказке: 4 значащие цифры, без потери малых величин вроде 0.0734 */
  const formatValue = (v: number) => (Number.isInteger(v) ? String(v) : String(Number(v.toPrecision(4))))

  const selectLevel = (index: number) => {
    if (index === currentLevelIndex) return
    currentLevelIndex = index
    onLevelChange(index, levels[index])
  }

  const barLabel = (i: number) => currentLevel?.labels?.[i] ?? String(i + 1)
  /* Столбик от нуля до значения: снизу - нижний край, высота не меньше 2% у ненулевого */
  const bar = (value: number) => {
    const zero = pct(0)
    const end = pct(value)
    const height = Math.max(Math.abs(end - zero), value !== 0 ? 2 : 0)
    return { bottom: value >= 0 ? zero : Math.max(zero - height, 0), height }
  }
  /* Столбик за зафиксированной шкалой упирается в её край и помечается красной полосой */
  const isOut = (value: number) => locked && (value > axis.top || value < axis.bottom)

  /* Подписи по оси прореживаются: при 31 значении все они не читаются */
  const labelStep = $derived(Math.ceil(values.length / 12) || 1)
</script>

<div class={twMerge("@container relative flex w-full flex-col gap-3", wrapperClass)} style={accentStyle(accent)}>
  <FieldLabel {label} info={help?.info} class="w-full" />

  <!-- Сегментированный переключатель уровней: при одном уровне переключать нечего; без ключа - имена уровней могут быть пустыми и совпадать -->
  <div class="flex w-full items-center gap-2">
    {#if levels.length > 1}
      <div class="flex min-w-0 flex-1 items-center gap-0.5 rounded-[10px] bg-(--container-color) p-[3px]">
        {#each levels as level, index}
          <button
            type="button"
            class={twMerge(
              /* на узком месте отступы меньше, длинное имя уровня переносится, а не выходит за край */
              "min-w-0 flex-1 cursor-pointer rounded-[7px] px-1.5 py-1.5 text-[13px] leading-tight wrap-break-word transition-colors duration-150 @md:px-3",
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
  </div>

  <!-- Столбчатый график -->
  <div class="relative flex w-full flex-col gap-1.5 rounded-[12px] border border-(--hairline-color) bg-(--back-color) p-3.5">
    <!-- Кнопки поверх графика в правом верхнем углу, как у Graph: настройки (пределы шкалы вкладки) и замок - когда заданы оба предела -->
    {#if values.length}
      <ScaleControls class="absolute top-2 right-2 z-10" {limits} {locked} hasBounds={!!bounds} onChange={setLimits} onToggle={toggleLock} />
    {/if}
    {#if values.length === 0}
      <div class="flex h-40 w-full items-center justify-center text-[13px] text-(--faint-color)">{$T("ui.no_data")}</div>
    {:else}
      <div class="flex w-full gap-2">
        <!-- Шкала Y: подписи нулевой высоты, центр каждой ровно на своей линии сетки; ширину колонке задаёт невидимая самая длинная подпись -->
        <div class="relative flex h-40 shrink-0 flex-col">
          {#each axis.ticks as tick}
            <div class="invisible h-0 overflow-hidden text-[11px] font-medium tabular-nums">{formatTick(tick)}</div>
            <div
              class="absolute right-0 flex h-0 items-center justify-end text-[11px] font-medium text-(--faint-color) tabular-nums"
              style="bottom: {pct(tick)}%"
            >
              {formatTick(tick)}
            </div>
          {/each}
        </div>

        <div class="flex min-w-0 flex-1 flex-col gap-1.5">
          <div class="relative flex h-40 w-full items-end gap-1">
            {#each axis.ticks as tick}
              <div
                class="pointer-events-none absolute inset-x-0 border-t {tick === 0 ? 'border-(--faint-color)/60' : 'border-dashed border-(--faint-color)/40'}"
                style="bottom: {pct(tick)}%"
              ></div>
            {/each}

            {#each values as value, i}
              <div
                class="relative flex h-full flex-1 flex-col items-center"
                role="img"
                aria-label={`${barLabel(i)}: ${value}${unit}`}
                onmouseenter={() => (hoveredIndex = i)}
                onmouseleave={() => (hoveredIndex = null)}
              >
                {#if hoveredIndex === i}
                  <span
                    class="pointer-events-none absolute -top-1 z-10 -translate-y-full rounded-lg border border-(--hairline-color) bg-(--back-color) px-2 py-1 text-[12px] font-semibold tabular-nums whitespace-nowrap shadow-(--elevation-2)"
                  >
                    {barLabel(i)}: {formatValue(value)}{unit}{isOut(value) ? ` - ${$T("ui.scale.out")}` : ""}
                  </span>
                {/if}
                <!-- Столбик от нуля: вверх - скругление сверху, вниз - снизу; за шкалой - красная полоса у её края -->
                <div
                  class="absolute inset-x-0 flex flex-col transition-[height,bottom,background-color] duration-150 {value < 0
                    ? 'justify-end rounded-b-[3px]'
                    : 'rounded-t-[3px]'} {hoveredIndex === i ? 'bg-(--accent-color)' : 'bg-(--accent-color)/35'}"
                  style="bottom: {bar(value).bottom}%; height: {bar(value).height}%"
                >
                  {#if isOut(value)}<div class="h-[3px] w-full bg-(--red-mark) {value < 0 ? 'rounded-b-[3px]' : 'rounded-t-[3px]'}"></div>{/if}
                </div>
              </div>
            {/each}
          </div>

          <div class="flex w-full gap-1">
            {#each values as _, i}
              <div class="flex-1 truncate text-center text-[11px] font-bold text-(--faint-color)">
                {i % labelStep === 0 ? barLabel(i) : ""}
              </div>
            {/each}
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
