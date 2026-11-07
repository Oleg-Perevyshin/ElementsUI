<!-- $lib/Divider/Divider.svelte - волосяная линия вместо скруглённой полосы 2px. -->
<script lang="ts">
  import { twMerge } from "tailwind-merge"
  import { itemAccentStyle } from "../widgetAccent"
  import type { IDividerProps } from "../types"

  let { id = crypto.randomUUID(), wrapperClass = "", type = "line", width = 1, color = "", anchor = "center" }: IDividerProps = $props()

  const anchorClass = { top: "justify-start", center: "justify-center", bottom: "justify-end" } as const
</script>

<div id={`${id}-${crypto.randomUUID().slice(0, 6)}`} class={twMerge(`flex h-full w-full flex-col ${anchorClass[anchor]}`, wrapperClass)}>
  {#if type === "line"}
    <!-- Без bg-* класса берём --hairline-color; явный bg-* - мастер-цвет, как у остальных компонентов -->
    <div class={twMerge("w-full", color)} style="height: {width}px; {itemAccentStyle(color) ?? ''} background: {color ? 'var(--accent-color)' : 'var(--hairline-color)'};"></div>
  {/if}
</div>
