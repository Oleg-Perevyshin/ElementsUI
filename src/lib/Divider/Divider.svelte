<!-- $lib/ElementsUI/Divider.svelte -->
<script lang="ts">
  import { twMerge } from "tailwind-merge"
  import type { IDividerProps } from "../types"

  let { id = crypto.randomUUID(), wrapperClass = "", type = "line", size = 16, anchor = "center" }: IDividerProps = $props()

  const anchorClass = { top: "justify-start", center: "justify-center", bottom: "justify-end" } as const
</script>

<div id={`${id}-${crypto.randomUUID().slice(0, 6)}`} class={twMerge(`flex h-full w-full flex-col ${anchorClass[anchor]}`, wrapperClass)}>
  <div class="flex w-full items-center" style="height: {size}px;">
    {#if type === "line"}
      <div class="w-full border-t border-(--bg-color)"></div>
    {/if}
  </div>
</div>
