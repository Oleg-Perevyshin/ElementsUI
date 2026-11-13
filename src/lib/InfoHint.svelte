<!-- $lib/InfoHint.svelte - значок ⓘ рядом с подписью поля, при наведении или фокусе всплывает пояснение (help.info у Select и Switch). Пояснение позиционируется от окна (fixed), поэтому его не обрезают блоки с overflow и прокрутка; сверху, если там хватает места, иначе снизу -->
<script lang="ts">
  import { fly } from "svelte/transition"
  import InfoIcon from "./libIcons/InfoIcon.svelte"
  import { isKeyboardFocus } from "./popup"

  let { text }: { text: string } = $props()

  const WIDTH = 288
  const MARGIN = 8
  /* Места сверху меньше этого - пояснение уходит вниз */
  const MIN_TOP_SPACE = 120

  let anchor: HTMLButtonElement | null = $state(null)
  /* Позиция остаётся после ухода мыши: по ней доигрывает анимация исчезновения */
  let place = $state({ left: 0, top: 0, above: true })
  let show = $state(false)

  function open() {
    if (!anchor) return
    const rect = anchor.getBoundingClientRect()
    const above = rect.top > MIN_TOP_SPACE
    const left = Math.max(MARGIN, Math.min(rect.left + rect.width / 2 - WIDTH / 2, window.innerWidth - WIDTH - MARGIN))
    place = { left, top: above ? rect.top - MARGIN : rect.bottom + MARGIN, above }
    show = true
  }
</script>

<!-- Щелчок по значку внутри <label> не переводит фокус на поле и не открывает список -->
<button
  bind:this={anchor}
  type="button"
  class="inline-flex size-4 shrink-0 cursor-help items-center justify-center border-none bg-transparent p-0 text-(--faint-color) hover:text-(--accent-text) [&_svg]:size-full"
  aria-label={text}
  onclick={(event) => event.preventDefault()}
  onmouseenter={open}
  onmouseleave={() => (show = false)}
  onfocus={(event) => isKeyboardFocus(event) && open()}
  onblur={() => (show = false)}
>
  <InfoIcon />
</button>

{#if show}
  <!-- Ширина 288, текст по центру над значком; у края окна сдвигается внутрь -->
  <div
    class="pointer-events-none fixed z-50 flex justify-center"
    style="left: {place.left}px; top: {place.top}px; width: {WIDTH}px; transform: translateY({place.above ? '-100%' : '0'});"
    transition:fly={{ y: place.above ? -6 : 6, duration: 150 }}
  >
    <span
      class="w-max max-w-full rounded-lg border border-(--hairline-color) bg-(--back-color) px-2.5 py-1.5 text-left text-[12px] font-medium whitespace-normal text-(--font-color) normal-case shadow-(--elevation-2)"
      >{text}</span
    >
  </div>
{/if}
