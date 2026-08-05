<!-- $lib/ElementsUI/Divider.svelte -->
<script lang="ts">
  import { twMerge } from "tailwind-merge"
  import type { IDividerProps } from "../types"

  let { id = crypto.randomUUID(), wrapperClass = "", type = "line", width = 2, color = "bg-max", anchor = "center" }: IDividerProps = $props()

  const anchorClass = { top: "justify-start", center: "justify-center", bottom: "justify-end" } as const
</script>

<div id={`${id}-${crypto.randomUUID().slice(0, 6)}`} class={twMerge(`flex h-full w-full flex-col ${anchorClass[anchor]}`, wrapperClass)}>
  {#if type === "line"}
    <div class="{twMerge('w-full rounded-full', color)} bg-(--bg-color)" style="height: {width}px;"></div>
  {/if}
</div>
