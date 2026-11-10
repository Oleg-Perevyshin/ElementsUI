<!-- $lib/ExpandIcon.svelte - значок раскрытия области: круглая кнопка со стрелкой вниз (можно раскрыть) или вверх (свернуть); рамка подсвечивается при наведении на предка с классом group -->
<script lang="ts">
  import { twMerge } from "tailwind-merge"
  import ArrowIcon from "./libIcons/ArrowIcon.svelte"

  let { open = false, class: className = "" }: { open?: boolean; class?: string } = $props()
</script>

<span
  class={twMerge(
    "flex size-7 shrink-0 items-center justify-center rounded-full border border-(--border-color) text-(--accent-text) transition-colors duration-150 group-hover:border-(--accent-text)",
    className,
  )}
  aria-hidden="true"
>
  <span class="flex size-3.5 transition-transform duration-150 [&_svg]:h-full [&_svg]:w-full" style="transform: rotate({open ? -90 : 90}deg)">
    <ArrowIcon />
  </span>
</span>
