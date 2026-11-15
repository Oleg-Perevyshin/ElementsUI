<!-- $lib/Splitter/Splitter.svelte - разделитель на краю панели: тянуть мышью - ширина панели, двойной клик - ширина по умолчанию, стрелки клавиатуры - шагами. value - px или % ширины контейнера (unit) -->
<script lang="ts">
  import { twMerge } from "tailwind-merge"

  let {
    value = $bindable(),
    defaultValue,
    min,
    max,
    side,
    unit = "px",
    containerWidth = 0,
    label,
    wrapperClass = "",
  }: {
    value: number
    defaultValue: number
    min: number
    max: number
    /* Край панели, где стоит разделитель: right - тянуть вправо шире, left - тянуть влево шире */
    side: "left" | "right"
    unit?: "px" | "%"
    /* Ширина контейнера в px - для unit "%" */
    containerWidth?: number
    label: string
    /* Классы полосы: сдвиг под зазор между панелями, например -right-2 при gap-2 */
    wrapperClass?: string
  } = $props()

  let dragging = $state(false)
  let startX = 0
  let startValue = 0

  const clamp = (next: number) => Math.min(max, Math.max(min, Math.round(next * 10) / 10))
  /* Сдвиг мыши в единицы ширины: px как есть, % - доля контейнера */
  const toUnits = (dx: number) => (unit === "%" ? (containerWidth > 0 ? (dx / containerWidth) * 100 : 0) : dx)

  const onDown = (event: PointerEvent) => {
    if (event.button !== 0) return
    dragging = true
    startX = event.clientX
    startValue = value
    ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
    event.preventDefault()
  }
  const onMove = (event: PointerEvent) => {
    if (!dragging) return
    const dx = event.clientX - startX
    value = clamp(startValue + toUnits(side === "right" ? dx : -dx))
  }
  const onUp = (event: PointerEvent) => {
    dragging = false
    ;(event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId)
  }
  const onKey = (event: KeyboardEvent) => {
    const step = unit === "%" ? 2 : 16
    const grow = side === "right" ? "ArrowRight" : "ArrowLeft"
    const shrink = side === "right" ? "ArrowLeft" : "ArrowRight"
    if (event.key === grow) value = clamp(value + step)
    else if (event.key === shrink) value = clamp(value - step)
    else return
    event.preventDefault()
  }
</script>

<!-- Разделитель с фокусом (role separator) по ARIA - элемент управления: тянется мышью и стрелками -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
<div
  role="separator"
  aria-orientation="vertical"
  aria-label={label}
  aria-valuenow={value}
  aria-valuemin={min}
  aria-valuemax={max}
  tabindex="0"
  title={label}
  class={twMerge(
    "group absolute top-0 bottom-0 z-10 flex w-2 cursor-col-resize touch-none justify-center outline-none",
    side === "right" ? "-right-1" : "-left-1",
    wrapperClass,
  )}
  onpointerdown={onDown}
  onpointermove={onMove}
  onpointerup={onUp}
  onpointercancel={onUp}
  ondblclick={() => (value = defaultValue)}
  onkeydown={onKey}
>
  <span
    class="h-full w-0.5 rounded-full transition-colors duration-150 {dragging
      ? 'bg-(--accent-color)'
      : 'bg-transparent group-hover:bg-(--faint-color) group-focus-visible:bg-(--accent-color)'}"
  ></span>
</div>
