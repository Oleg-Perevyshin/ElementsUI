<!-- $lib/Accordion/Accordion.svelte - заголовок не увеличивается при раскрытии, радиус 14. Цвет accent: иконка и текст заголовка его цветом текста, фон заголовка - 22% цвета поверх фона. stripe - полоса 6px слева цветом метки (радиус 15), outline=false - без рамки и скругления, fill - раскрытый блок занимает всю высоту родителя-колонки -->
<script lang="ts">
  import { slide } from "svelte/transition"
  import type { IAccordionProps } from "../types"
  import { twMerge } from "tailwind-merge"
  import { accentStyle } from "../accent"
  import Icon from "../Icon.svelte"

  let {
    isOpen = $bindable(false),
    wrapperClass = "",
    componentClass = "",
    accent,
    stripe = false,
    outline = true,
    fill = false,
    size = { width: 1, height: 1 },
    label = { name: "", class: "text-left", icon: null },
    chevron = true,
    children,
    actions,
    image = "",
  }: IAccordionProps = $props()

  const uid = $props.id()

  /* Рамка блока: обычная, с цветной полосой слева или никакой */
  const frameClass = $derived(
    stripe
      ? "rounded-[15px] border border-l-[6px] border-(--hairline-color)"
      : outline
        ? "rounded-[14px] border border-(--hairline-color)"
        : "rounded-none border-0",
  )
</script>

<!-- fill: обёртка, рамка и содержимое - колонки, содержимое забирает остаток высоты; свёрнутый блок не растягивается -->
<div
  class={twMerge(`w-full ${fill ? `flex min-h-0 flex-col ${isOpen ? "flex-1" : "shrink-0"}` : ""}`, wrapperClass)}
  style={accentStyle(accent)}
  transition:slide={{ duration: 200 }}
>
  <div
    class={twMerge(`overflow-hidden bg-(--back-color) ${frameClass} ${fill && isOpen ? "flex min-h-0 flex-1 flex-col" : ""}`, componentClass)}
    style={stripe ? `border-left-color: ${accent ? `var(--${accent}-mark)` : "var(--accent-color)"};` : undefined}
  >
    <!-- Фон заголовка - мастер-цвет 22% поверх фона, чтобы свёрнутый раздел не сливался с панелью; текст - цвет текста мастер-цвета 70% с цветом шрифта; раскрытое содержимое на чистом фоне (--back-color). -->
    <!-- Заголовок: кнопка сворачивания на всю ширину и необязательные кнопки справа (actions) - вне неё, чтобы не сворачивать блок -->
    <div
      class="flex w-full shrink-0 items-center bg-[color-mix(in_srgb,var(--accent-color)_22%,var(--back-color))] transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--accent-color)_30%,var(--back-color))]"
    >
      <button
        class="flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left text-[color-mix(in_srgb,var(--accent-text)_70%,var(--font-color))]"
        onclick={() => (isOpen = !isOpen)}
        aria-expanded={isOpen}
        aria-controls={`${uid}-content`}
      >
        <div class="flex min-w-0 flex-1 items-center gap-3">
          <Icon
            icon={label?.icon}
            class="flex size-(--icon-size) shrink-0 items-center justify-center text-[color-mix(in_srgb,var(--accent-text)_70%,var(--font-color))] [&_svg]:h-full [&_svg]:w-full"
          />
          <span class={twMerge(`min-w-0 text-[15px] leading-snug font-semibold wrap-break-word`, label.class)}>{label?.name}</span>
        </div>

        {#if chevron}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="size-(--icon-size-sm) shrink-0 text-[color-mix(in_srgb,var(--accent-text)_70%,var(--font-color))] transition-transform duration-200"
            style="transform: rotate({isOpen ? 180 : 0}deg)"
            viewBox="0 0 24 24"
          >
            <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 9l6 6 6-6" />
          </svg>
        {/if}
      </button>
      {#if actions}
        <div class="flex shrink-0 items-center gap-1 pr-3">{@render actions()}</div>
      {/if}
    </div>

    {#if isOpen}
      <div
        id={`${uid}-content`}
        class="grid w-full gap-3 border-t border-(--hairline-color) bg-(--back-color) p-4 {fill ? 'min-h-0 flex-1' : ''}"
        transition:slide={{ duration: 200 }}
        style="grid-template-columns: repeat({size.width || 1}, minmax(0, 1fr));
          grid-template-rows: {fill ? 'minmax(0, 1fr)' : `repeat(${size.height || 1}, ${image ? 'minmax(6.5rem, auto)' : 'auto'})`};
          {image ? `background-image: url(${image}); background-size: cover; background-position: center;` : ''}"
      >
        {@render children?.()}
      </div>
    {/if}
  </div>
</div>
