<!-- $lib/Divider/Divider.svelte - волосяная линия вместо скруглённой полосы 2px. orientation="vertical" - линия сверху вниз на всю высоту места, anchor - слева, по центру или справа; в строке (flex-row) занимает только толщину линии, в колонке и ячейке сетки - всю ширину -->
<script lang="ts">
  import { twMerge } from "tailwind-merge"
  import { accentStyle } from "../accent"
  import type { IDividerProps } from "../types"

  let { wrapperClass = "", type = "line", orientation = "horizontal", width = 1, accent, anchor = "center" }: IDividerProps = $props()

  const anchorClass = { top: "justify-start", center: "justify-center", bottom: "justify-end" } as const
  const vertical = $derived(orientation === "vertical")
</script>

<div class={twMerge(`flex h-full ${vertical ? "flex-row self-stretch" : "w-full flex-col"} ${anchorClass[anchor]}`, wrapperClass)}>
  {#if type === "line"}
    <!-- Без accent - волосяная линия темы -->
    <div
      class={vertical ? "h-full shrink-0" : "w-full"}
      role="separator"
      aria-orientation={vertical ? "vertical" : undefined}
      style="{vertical ? 'width' : 'height'}: {width}px; {accentStyle(accent)} background: {accent ? 'var(--accent-color)' : 'var(--hairline-color)'};"
    ></div>
  {/if}
</div>
