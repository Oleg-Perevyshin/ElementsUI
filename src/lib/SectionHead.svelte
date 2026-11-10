<!-- $lib/SectionHead.svelte - заголовок сворачиваемого раздела внутри виджета: название, под ним сводка, справа значок раскрытия; вся строка кликабельна и подсвечивается при наведении. onToggle - если открытость считает родитель -->
<script lang="ts">
  import ExpandIcon from "./ExpandIcon.svelte"

  let { title, summary = "", open = $bindable(false), onToggle }: { title: string; summary?: string; open?: boolean; onToggle?: () => void } = $props()
</script>

<button
  type="button"
  class="group -m-1.5 flex w-[calc(100%+0.75rem)] cursor-pointer items-center gap-3 rounded-lg border-none bg-transparent p-1.5 text-left transition-colors duration-150 hover:bg-(--container-color)"
  aria-expanded={open}
  onclick={() => (onToggle ? onToggle() : (open = !open))}
>
  <span class="flex min-w-0 flex-1 flex-col gap-0.5">
    <span class="text-[13px] font-semibold text-(--font-color)">{title}</span>
    {#if summary}
      <span class="text-[12px] text-(--muted-color) tabular-nums {open ? '' : 'line-clamp-2'}">{summary}</span>
    {/if}
  </span>
  <ExpandIcon {open} />
</button>
