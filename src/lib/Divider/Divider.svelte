<!-- $lib/Divider/Divider.svelte - волосяная линия вместо скруглённой полосы 2px. -->
<script lang="ts">
  import { twMerge } from "tailwind-merge"
  import { accentStyle } from "../accent"
  import type { IDividerProps } from "../types"

  let { wrapperClass = "", type = "line", width = 1, accent, anchor = "center" }: IDividerProps = $props()

  const anchorClass = { top: "justify-start", center: "justify-center", bottom: "justify-end" } as const
</script>

<div class={twMerge(`flex h-full w-full flex-col ${anchorClass[anchor]}`, wrapperClass)}>
  {#if type === "line"}
    <!-- Без accent - волосяная линия темы -->
    <div
      class="w-full"
      role="separator"
      style="height: {width}px; {accentStyle(accent)} background: {accent ? 'var(--accent-color)' : 'var(--hairline-color)'};"
    ></div>
  {/if}
</div>
