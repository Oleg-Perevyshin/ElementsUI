<!-- $lib/WidgetHeader.svelte - шапка смарт-виджетов: значок 18px и заголовок сворачивают тело по клику, справа сниппет виджета (клик по нему не сворачивает), своего фона и отступов нет -->
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
    /* Правая часть; narrow - шапка узкая: кнопки только значком, списки сжаты, чтобы всё стояло в одной строке */
    right?: Snippet<[boolean]>
    /* Настройка подсказок этого виджета (hintsSetting) - показывает кнопку «?», переключающую только его подсказки */
    hints?: Writable<boolean>
  } = $props()

  const Icon = $derived(icon)

  /* Уже NARROW_PX шапка сжимает правую часть; если и сжатая не помещается рядом с заголовком (место под значок, заголовок и «?»), она уходит второй строкой */
  const NARROW_PX = 640
  const TITLE_MIN_PX = 120
  let headerWidth = $state(0)
  let rightWidth = $state(0)
  let narrow = $derived(headerWidth > 0 && headerWidth < NARROW_PX)
  let wrapped = $derived(!!right && headerWidth > 0 && rightWidth + TITLE_MIN_PX + (hints ? 34 : 0) > headerWidth)
</script>

<!-- Первая строка фиксированной высоты 32 px - свёрнутые виджеты одной высоты; «?» - в правом краю. Правая часть стоит в первой строке, а если не помещается - второй строкой под заголовком (выравнивание вправо) -->
<div class="flex flex-col gap-2" bind:clientWidth={headerWidth}>
  <div class="flex h-[32px] items-center justify-between gap-3">
    <button
      type="button"
      class="flex min-w-0 flex-1 cursor-pointer items-center gap-2 border-none bg-transparent p-0 text-left"
      onclick={() => (collapsed = !collapsed)}
      aria-expanded={!collapsed}
    >
      <span class="flex size-(--icon-size) shrink-0 items-center justify-center text-(--accent-text) [&_svg]:h-full [&_svg]:w-full">
        <Icon />
      </span>
      <span class="min-w-0 truncate text-[14px] font-semibold">{label}</span>
      <span
        class="flex size-(--icon-size-sm) shrink-0 items-center justify-center text-(--faint-color) transition-transform duration-150 [&_svg]:h-full [&_svg]:w-full"
        style="transform: rotate({collapsed ? 0 : 90}deg)"
      >
        <ArrowIcon />
      </span>
    </button>
    {#if right && !wrapped}
      <div class="flex w-max shrink-0 items-center justify-end" bind:clientWidth={rightWidth}>
        {@render right(narrow)}
      </div>
    {/if}
    {#if hints}
      <button
        type="button"
        class="flex size-[22px] shrink-0 cursor-pointer items-center justify-center rounded-full border text-[12px] font-bold transition-colors duration-150
        {$hints
          ? 'border-(--accent-text) bg-(--accent-soft) text-(--accent-text)'
          : 'border-(--hairline-color) bg-transparent text-(--faint-color) hover:text-(--muted-color)'}"
        title={$hints ? $T("widget.hints.on") : $T("widget.hints.off")}
        aria-pressed={$hints}
        onclick={() => hints.update((on) => !on)}>?</button
      >
    {/if}
  </div>
  {#if right && wrapped}
    <!-- Во второй строке элементы могут переноситься; ширина замеряется и здесь - сжатая часть возвращается в первую строку -->
    <div class="flex w-max max-w-full flex-wrap items-center justify-end gap-2 self-end" bind:clientWidth={rightWidth}>
      {@render right(narrow)}
    </div>
  {/if}
</div>
