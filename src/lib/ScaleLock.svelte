<!-- $lib/ScaleLock.svelte - кнопка-замок шкалы графиков (Graph, PeriodChart): закрытый замок - шкала зафиксирована, открытый - подстраивается под данные -->
<script lang="ts">
  import { T } from "./locales/i18n"

  let { locked, onToggle, class: className = "" }: { locked: boolean; onToggle: () => void; class?: string } = $props()
</script>

<button
  type="button"
  class="flex size-8 cursor-pointer items-center justify-center rounded-lg border border-(--hairline-color) bg-(--back-color) transition-colors duration-150 {locked
    ? 'text-(--accent-color)'
    : 'text-(--muted-color) hover:text-(--font-color)'} {className}"
  title={$T(locked ? "ui.scale.locked" : "ui.scale.auto")}
  aria-label={$T(locked ? "ui.scale.locked" : "ui.scale.auto")}
  aria-pressed={locked}
  onclick={onToggle}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="size-(--icon-size)"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <rect x="5" y="11" width="14" height="10" rx="2" />
    {#if locked}
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    {:else}
      <path d="M8 11V7a4 4 0 0 1 7.5-2" />
    {/if}
  </svg>
</button>
