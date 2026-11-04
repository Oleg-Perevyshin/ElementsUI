<!-- $lib/CopiedChip.svelte — общая всплывающая метка «Скопировано» после клика на кнопку копирования -->
<script lang="ts">
  import { T } from "./locales/i18n"
  import { fade } from "svelte/transition"

  let { show = false, class: className = "" }: { show?: boolean; class?: string } = $props()
</script>

{#if show}
  <span
    class="{className} absolute flex items-center gap-1 rounded-lg bg-(--green-soft) px-2 py-1 text-[11px] font-bold whitespace-nowrap text-(--green-color)"
    transition:fade={{ duration: 150 }}
  >
    {$T("ui.copied")}
  </span>
{/if}
