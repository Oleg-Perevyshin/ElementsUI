<!-- $lib/Accordion/Accordion.svelte — заголовок не увеличивается при раскрытии, радиус 14.
     Мастер-цвет (componentClass) — как у смарт-виджетов: иконка и текст заголовка цветом, фон заголовка — его мягким оттенком. -->
<script lang="ts">
  import { slide } from "svelte/transition"
  import type { IAccordionProps } from "../types"
  import { twMerge } from "tailwind-merge"
  import { widgetAccentStyle } from "../widgetAccent"

  let {
    id = crypto.randomUUID(),
    isOpen = $bindable(false),
    wrapperClass = "",
    componentClass = "",
    size = { width: 1, height: 1 },
    label = { name: "", class: "text-left", icon: null },
    children,
    image = "",
  }: IAccordionProps = $props()

  const toggle = () => (isOpen = !isOpen)
</script>

<div
  id={`${id}-${crypto.randomUUID().slice(0, 6)}`}
  class={twMerge(`w-full`, wrapperClass)}
  style={widgetAccentStyle(componentClass)}
  transition:slide={{ duration: 200 }}
>
  <div class="overflow-hidden rounded-[14px] border border-(--hairline-color) bg-(--back-color)">
    <!-- Фон заголовка — мягкий оттенок мастер-цвета (светлый в светлой теме, тёмный в тёмной), текст — мастер-цвет с цветом шрифта 60/40,
         раскрытое содержимое остаётся на чистом фоне (--back-color). -->
    <button
      class="flex w-full cursor-pointer items-center justify-between gap-3 bg-(--accent-soft) px-4 py-3 text-left text-[color-mix(in_srgb,var(--accent-color)_60%,var(--font-color))] transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--accent-color)_12%,var(--accent-soft))]"
      onclick={toggle}
    >
      <div class="flex min-w-0 flex-1 items-center gap-3">
        {#if label?.icon}
          <span
            class="flex h-[18px] w-[18px] shrink-0 items-center justify-center text-[color-mix(in_srgb,var(--accent-color)_60%,var(--font-color))] [&_svg]:h-full [&_svg]:w-full"
          >
            {#if typeof label?.icon === "string"}
              {@html label.icon}
            {:else}
              {@const IconComponent = label?.icon}
              <IconComponent />
            {/if}
          </span>
        {/if}
        <span class={twMerge(`min-w-0 truncate text-[14px] font-semibold`, label.class)}>{label?.name}</span>
      </div>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-[14px] w-[14px] shrink-0 text-[color-mix(in_srgb,var(--accent-color)_60%,var(--font-color))] transition-transform duration-200"
        style="transform: rotate({isOpen ? 180 : 0}deg)"
        viewBox="0 0 24 24"
      >
        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 9l6 6 6-6" />
      </svg>
    </button>

    {#if isOpen}
      <div
        class="grid w-full gap-3 border-t border-(--hairline-color) bg-(--back-color) p-4"
        transition:slide={{ duration: 200 }}
        style="grid-template-columns: repeat({size.width || 1}, minmax(0, 1fr));
          grid-template-rows: repeat({size.height || 1}, {image ? 'minmax(6.5rem, auto)' : 'auto'});
          {image ? `background-image: url(${image}); background-size: cover; background-position: center;` : ''}"
      >
        {@render children?.()}
      </div>
    {/if}
  </div>
</div>
