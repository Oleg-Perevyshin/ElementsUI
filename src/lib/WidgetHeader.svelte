<!-- $lib/WidgetHeader.svelte — общая шапка смарт-виджетов конструктора: значок + заголовок
     сворачивают/разворачивают тело виджета по клику (как аккордеон), справа — снипет с любым
     содержимым шапки конкретного виджета (переключатель режима, кнопка "Перезагрузить" и т.п.),
     клик по нему сворачивание не триггерит. Мелкая 18px иконка без подложки (как у Accordion)
     вместо прежнего тяжёлого 32px значка-бейджа. Без своего фона/паддинга — виджет уже даёт
     отступы через собственный p-4, добавлять сюда ещё одну bg-container полосу с px/py поверх
     означало бы двойной отступ и лишнюю высоту. -->
<script lang="ts">
  import type { Component, Snippet } from "svelte"
  import type { Writable } from "svelte/store"
  import ArrowIcon from "./libIcons/ArrowIcon.svelte"
  import { T } from "./locales/i18n"

  let {
    icon,
    label,
    collapsed = $bindable(false),
    right,
    hints,
  }: {
    icon: Component
    label: string
    collapsed?: boolean
    right?: Snippet
    /* Настройка подсказок этого виджета (hintsSetting) — показывает кнопку «?», переключающую только его подсказки */
    hints?: Writable<boolean>
  } = $props()

  const Icon = $derived(icon)

  /* Правая часть уходит второй строкой, если не помещается рядом с заголовком (место под значок, заголовок и «?») */
  const TITLE_MIN_PX = 180
  let headerWidth = $state(0)
  let rightWidth = $state(0)
  let wrapped = $derived(!!right && headerWidth > 0 && rightWidth + TITLE_MIN_PX + (hints ? 34 : 0) > headerWidth)
</script>

<!-- Первая строка фиксированной высоты 32 px — свёрнутые виджеты одной высоты; «?» — в правом краю.
     Правая часть стоит в первой строке, а если не помещается — второй строкой под заголовком (выравнивание вправо) -->
<div class="flex flex-col gap-2" bind:clientWidth={headerWidth}>
  <div class="flex h-[32px] items-center justify-between gap-3">
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
    {#if right && !wrapped}
      <div class="flex w-max shrink-0 items-center justify-end" bind:clientWidth={rightWidth}>
        {@render right()}
      </div>
    {/if}
    {#if hints}
      <button
        type="button"
        class="flex size-[22px] shrink-0 cursor-pointer items-center justify-center rounded-full border text-[12px] font-bold transition-colors duration-150
        {$hints
          ? 'border-(--accent-color) bg-(--accent-soft) text-(--accent-color)'
          : 'border-(--hairline-color) bg-transparent text-(--faint-color) hover:text-(--muted-color)'}"
        title={$hints ? $T("widget.hints.on") : $T("widget.hints.off")}
        aria-pressed={$hints}
        onclick={() => hints.update((on) => !on)}>?</button
      >
    {/if}
  </div>
  {#if right && wrapped}
    <!-- Во второй строке элементы могут переноситься; естественная ширина правой части — из первой строки -->
    <div class="flex max-w-full flex-wrap items-center justify-end gap-2">
      {@render right()}
    </div>
  {/if}
</div>
