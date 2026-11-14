<!-- $lib/Tooltip.svelte - общая всплывающая подсказка (рамка + стрелка) у кнопок, переключателей, вариантов списка и значков: позиция side относительно триггера по центру -->
<script lang="ts">
  import { fly } from "svelte/transition"

  let { show = false, text = "", side = "top" }: { show?: boolean; text?: string; side?: "top" | "bottom" | "left" | "right" } = $props()

  type Variant = { pos: string; tr: string; arr: string; off: { x?: number; y?: number } }

  const CONFIG: Record<"top" | "bottom" | "left" | "right", Variant> = {
    top: { pos: "bottom-full left-1/2 mb-2", tr: "translateX(-50%)", arr: "top-full left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45", off: { y: -10 } },
    bottom: { pos: "top-full left-1/2 mt-2", tr: "translateX(-50%)", arr: "bottom-full left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45", off: { y: 10 } },
    left: { pos: "top-1/2 right-full mr-2", tr: "translateY(-50%)", arr: "top-1/2 -right-2 -translate-x-1/2 -translate-y-1/2 rotate-45", off: { x: -10 } },
    right: { pos: "top-1/2 left-full ml-2", tr: "translateY(-50%)", arr: "top-1/2 -left-2 translate-x-1/2 -translate-y-1/2 rotate-45", off: { x: 10 } },
  }

  const config = $derived(CONFIG[side])
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
