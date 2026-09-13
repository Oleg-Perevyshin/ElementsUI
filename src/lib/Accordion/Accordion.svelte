<!-- $lib/Accordion/Accordion.svelte — заголовок больше не увеличивается при раскрытии,
     тень на hover заменена фоном, радиус 14. Логика toggle не тронута. -->
<script lang="ts">
  import { slide } from "svelte/transition"
  import type { IAccordionProps } from "../types"
  import { twMerge } from "tailwind-merge"

  let {
    id = crypto.randomUUID(),
    isOpen = false,
    wrapperClass = "",
    size = { width: 1, height: 1 },
    label = { name: "", class: "text-left", icon: null },
    children,
    image = "",
  }: IAccordionProps = $props()

  const toggle = () => (isOpen = !isOpen)
</script>

<div id={`${id}-${crypto.randomUUID().slice(0, 6)}`} class={twMerge(`w-full`, wrapperClass)} transition:slide={{ duration: 200 }}>
  <div class="overflow-hidden rounded-[14px] border border-(--hairline-color) bg-(--back-color)">
    <!-- Заголовок темнее контента (--container-color), а не наоборот: так он читается
         как отдельная кликабельная полоса, а раскрытое содержимое остаётся на чистом
         светлом фоне (--back-color) — там часто лежат вложенные карточки/поля. -->
    <button
      class="flex w-full cursor-pointer items-center justify-between gap-3 bg-(--container-color) px-4 py-3 text-left transition-colors duration-150 hover:bg-(--border-color)"
      onclick={toggle}
    >
      <div class="flex min-w-0 flex-1 items-center gap-3">
        {#if label?.icon}
          <span class="flex h-[18px] w-[18px] shrink-0 items-center justify-center text-(--muted-color) [&_svg]:h-full [&_svg]:w-full">
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
        class="h-[14px] w-[14px] shrink-0 text-(--faint-color) transition-transform duration-200"
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
