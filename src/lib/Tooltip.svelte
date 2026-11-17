<!-- $lib/Tooltip.svelte - общая всплывающая подсказка (рамка + стрелка) у кнопок, переключателей, вариантов списка и значков: место по side относительно триггера (ближайшего позиционированного предка), позиция от окна (fixed) - её не обрезают блоки с overflow; у края окна подсказка сдвигается внутрь, стрелка остаётся над триггером, нет места со стороны side - уходит на противоположную -->
<script lang="ts">
  import { fade } from "svelte/transition"

  type Side = "top" | "bottom" | "left" | "right"
  let { show = false, text = "", side = "top" }: { show?: boolean; text?: string; side?: Side } = $props()

  const MARGIN = 8
  const GAP = 8
  const OPPOSITE: Record<Side, Side> = { top: "bottom", bottom: "top", left: "right", right: "left" }

  /* Невидимая метка внутри триггера: место подсказки считается по ближайшему позиционированному предку (как у прежней абсолютной позиции) */
  let marker: HTMLSpanElement | null = $state(null)
  let box: HTMLDivElement | null = $state(null)
  /* Место от окна и сдвиг стрелки вдоль подсказки; measured - размеры подсказки уже известны, до этого она невидима */
  let place = $state({ left: 0, top: 0, side: "top" as Side, arrow: 0 })
  let measured = $state(false)

  $effect(() => {
    if (!show || !text || !marker || !box) return
    const anchor = (marker.offsetParent ?? marker.parentElement)?.getBoundingClientRect()
    if (!anchor) return
    const width = box.offsetWidth
    const height = box.offsetHeight
    const vw = window.innerWidth
    const vh = window.innerHeight
    const fits: Record<Side, boolean> = {
      top: anchor.top - GAP - height >= MARGIN,
      bottom: anchor.bottom + GAP + height <= vh - MARGIN,
      left: anchor.left - GAP - width >= MARGIN,
      right: anchor.right + GAP + width <= vw - MARGIN,
    }
    const chosen = fits[side] || !fits[OPPOSITE[side]] ? side : OPPOSITE[side]
    const clamp = (value: number, max: number) => Math.max(MARGIN, Math.min(value, max - MARGIN))
    if (chosen === "top" || chosen === "bottom") {
      const left = clamp(anchor.left + anchor.width / 2 - width / 2, vw - width)
      const top = chosen === "top" ? anchor.top - GAP - height : anchor.bottom + GAP
      place = { left, top, side: chosen, arrow: Math.max(10, Math.min(anchor.left + anchor.width / 2 - left, width - 10)) }
    } else {
      const top = clamp(anchor.top + anchor.height / 2 - height / 2, vh - height)
      const left = chosen === "left" ? anchor.left - GAP - width : anchor.right + GAP
      place = { left, top, side: chosen, arrow: Math.max(10, Math.min(anchor.top + anchor.height / 2 - top, height - 10)) }
    }
    measured = true
  })
  $effect(() => {
    if (!show) measured = false
  })

  /* Стрелка - повёрнутый квадрат на стороне, обращённой к триггеру */
  const ARROW: Record<Side, string> = {
    top: "top-full -translate-x-1/2 -translate-y-1/2 border-r border-b",
    bottom: "bottom-full -translate-x-1/2 translate-y-1/2 border-l border-t",
    left: "left-full -translate-x-1/2 -translate-y-1/2 border-t border-r",
    right: "right-full translate-x-1/2 -translate-y-1/2 border-b border-l",
  }
</script>

<span bind:this={marker} class="pointer-events-none absolute size-0" aria-hidden="true"></span>
{#if show && text}
  <div
    bind:this={box}
    transition:fade={{ duration: 120 }}
    class="pointer-events-none fixed z-50 w-max max-w-xs rounded-lg border border-(--hairline-color) bg-(--back-color) px-2.5 py-1.5 text-[12px] font-medium text-(--font-color) shadow-(--elevation-2)"
    style="left: {place.left}px; top: {place.top}px; visibility: {measured ? 'visible' : 'hidden'};"
  >
    {text}
    <div
      class="absolute h-2 w-2 rotate-45 border-(--hairline-color) bg-(--back-color) {ARROW[place.side]}"
      style={place.side === "top" || place.side === "bottom" ? `left: ${place.arrow}px` : `top: ${place.arrow}px`}
    ></div>
  </div>
{/if}
