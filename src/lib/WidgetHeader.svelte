<!-- $lib/WidgetHeader.svelte — общая шапка смарт-виджетов конструктора: значок + заголовок
     сворачивают/разворачивают тело виджета по клику (как аккордеон), справа — снипет с любым
     содержимым шапки конкретного виджета (переключатель режима, кнопка "Перезагрузить" и т.п.),
     клик по нему сворачивание не триггерит. -->
<script lang="ts">
  import type { Component, Snippet } from "svelte"
  import ArrowIcon from "./libIcons/ArrowIcon.svelte"

  let {
    icon,
    label,
    collapsed = $bindable(false),
    right,
  }: {
    icon: Component
    label: string
    collapsed?: boolean
    right?: Snippet
  } = $props()

  const Icon = $derived(icon)
</script>

<div class="flex flex-wrap items-center justify-between gap-3">
  <button
    type="button"
    class="flex min-w-0 cursor-pointer items-center gap-2 border-none bg-transparent p-0 text-left"
    onclick={() => (collapsed = !collapsed)}
    aria-expanded={!collapsed}
  >
    <span class="flex size-8 shrink-0 items-center justify-center rounded-xl bg-(--accent-soft) text-(--accent-color)">
      <Icon />
    </span>
    <h3 class="min-w-0 truncate">{label}</h3>
    <span
      class="flex size-4 shrink-0 items-center justify-center text-(--faint-color) transition-transform duration-150 [&_svg]:h-full [&_svg]:w-full"
      style="transform: rotate({collapsed ? 0 : 90}deg)"
    >
      <ArrowIcon />
    </span>
  </button>
  {#if right}
    {@render right()}
  {/if}
</div>
