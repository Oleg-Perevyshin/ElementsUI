<!-- $lib/Tooltip.svelte — общая всплывающая подсказка (рамка + стрелка).
     Выделена из Button/Switch/Input, где после редизайна разметка стала
     побитово одинаковой (rounded-lg border-(--hairline-color) bg-(--back-color)
     shadow-(--elevation-2)) и отличалась только позицией и наличием стрелки.
     align="start" — для триггеров, чей позиционирующий предок шире самого
     триггера (например маленькая info-иконка внутри поля Input во всю ширину):
     центрирование в этом случае привязалось бы к полю, а не к иконке. -->
<script lang="ts">
  import { fly } from "svelte/transition"

  let {
    show = false,
    text = "",
    side = "top",
    align = "center",
  }: {
    show?: boolean
    text?: string
    side?: "top" | "bottom" | "left" | "right"
    align?: "center" | "start"
  } = $props()

  type Variant = { pos: string; tr: string; arr: string; off: { x?: number; y?: number } }

  const CONFIG: Record<"top" | "bottom" | "left" | "right", Partial<Record<"center" | "start", Variant>>> = {
    top: {
      center: {
        pos: "bottom-full left-1/2 mb-2",
        tr: "translateX(-50%)",
        arr: "top-full left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45",
        off: { y: -10 },
      },
      start: { pos: "bottom-full left-0 mb-2", tr: "", arr: "top-full left-3 -translate-x-1/2 -translate-y-1/2 rotate-45", off: { y: -10 } },
    },
    bottom: {
      center: { pos: "top-full left-1/2 mt-2", tr: "translateX(-50%)", arr: "bottom-full left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45", off: { y: 10 } },
      start: { pos: "top-full left-0 mt-2", tr: "", arr: "bottom-full left-3 -translate-x-1/2 translate-y-1/2 rotate-45", off: { y: 10 } },
    },
    left: {
      center: { pos: "top-1/2 right-full mr-2", tr: "translateY(-50%)", arr: "top-1/2 -right-2 -translate-x-1/2 -translate-y-1/2 rotate-45", off: { x: -10 } },
    },
    right: {
      center: { pos: "top-1/2 left-full ml-2", tr: "translateY(-50%)", arr: "top-1/2 -left-2 translate-x-1/2 -translate-y-1/2 rotate-45", off: { x: 10 } },
    },
  }

  const config = $derived(CONFIG[side][align] ?? CONFIG[side].center!)
</script>

{#if show && text}
  <div
    transition:fly={config.off}
    class={`absolute z-50 w-max max-w-xs rounded-lg border border-(--hairline-color) bg-(--back-color) px-2.5 py-1.5 text-[12px] font-medium text-(--font-color) shadow-(--elevation-2) ${config.pos}`}
    style={config.tr ? `transform: ${config.tr};` : undefined}
  >
    {text}
    <div class={`absolute ${config.arr} h-2 w-2 border-r border-b border-(--hairline-color) bg-(--back-color)`}></div>
  </div>
{/if}
