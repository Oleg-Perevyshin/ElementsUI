<!-- $lib/CopiedChip.svelte — единая всплывающая метка "Скопировано" после клика
     на кнопку копирования. Раньше в каждом месте (Input, Table, Map,
     ComponentExample) была своя версия: где-то текст, где-то просто "✓",
     разные цвета (--green-color вместо --green-soft) и радиусы, а в
     ComponentExample — опечатка в классе позиционирования (right-1..5,
     невалидный Tailwind-класс, физически ничего не позиционировал). -->
<script lang="ts">
  import { fade } from "svelte/transition"

  let { show = false, class: className = "" }: { show?: boolean; class?: string } = $props()
</script>

{#if show}
  <span
    class="{className} absolute flex items-center gap-1 rounded-lg bg-(--green-soft) px-2 py-1 text-[11px] font-bold whitespace-nowrap text-(--green-color)"
    transition:fade={{ duration: 150 }}
  >
    Скопировано
  </span>
{/if}
