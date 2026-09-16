<!-- $lib/WidgetHeader.svelte — общая шапка смарт-виджетов конструктора: значок + заголовок
     сворачивают/разворачивают тело виджета по клику (как аккордеон), справа — снипет с любым
     содержимым шапки конкретного виджета (переключатель режима, кнопка "Перезагрузить" и т.п.),
     клик по нему сворачивание не триггерит. Мелкая 18px иконка без подложки (как у Accordion)
     вместо прежнего тяжёлого 32px значка-бейджа. Без своего фона/паддинга — виджет уже даёт
     отступы через собственный p-4, добавлять сюда ещё одну bg-container полосу с px/py поверх
     означало бы двойной отступ и лишнюю высоту. -->
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
    class="flex min-w-0 flex-1 cursor-pointer items-center gap-2 border-none bg-transparent p-0 text-left"
    onclick={() => (collapsed = !collapsed)}
    aria-expanded={!collapsed}
  >
    <span class="flex h-[18px] w-[18px] shrink-0 items-center justify-center text-(--accent-color) [&_svg]:h-full [&_svg]:w-full">
      <Icon />
    </span>
    <span class="min-w-0 truncate text-[14px] font-semibold">{label}</span>
    <span
      class="flex h-[14px] w-[14px] shrink-0 items-center justify-center text-(--faint-color) transition-transform duration-150 [&_svg]:h-full [&_svg]:w-full"
      style="transform: rotate({collapsed ? 0 : 90}deg)"
    >
      <ArrowIcon />
    </span>
  </button>
  {#if right}
    {@render right()}
  {/if}
</div>
