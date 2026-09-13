<!-- $lib/Tabs/Tabs.svelte — выбранная вкладка отмечается линией 2px акцентом
     вместо цветной «крышки». Логика выбора вкладки и рендера контента не тронута.

     ⚠ ВНИМАНИЕ ПРИ ВНЕДРЕНИИ: значение по умолчанию wrapperClass изменено
     с "bg-blue" на "". Вызовы, которые передают wrapperClass явно (например
     "justify-center bg-blue" в Top.svelte), продолжат красить панель —
     из них класс bg-* нужно убрать вручную. -->
<script lang="ts">
  import type { ITabsProps } from "$lib/types"
  import { twMerge } from "tailwind-merge"

  let {
    id = crypto.randomUUID(),
    wrapperClass = "",
    size = { width: 12, height: 6 },
    activeTab = 0,
    items = [
      { name: "tab 1", icon: "", class: "" },
      { name: "tab 2", icon: "", class: "" },
    ],
    children,
    apiArray = [],
    Components,
  }: ITabsProps = $props()

  const isCol = $derived(!!items.find((item) => item.class?.startsWith("flex-col")))

  let currentTabIndex: number = $derived(activeTab)
</script>

<div id={`${id}-${crypto.randomUUID().slice(0, 6)}`} class="h-full w-full">
  <div class="flex h-full w-full flex-col overflow-hidden rounded-[14px] border border-(--hairline-color) bg-(--back-color)">
    <!-- Полоса вкладок -->
    <div class={twMerge(`sticky top-0 z-40 flex h-fit items-center gap-6 overflow-x-auto border-b border-(--hairline-color) px-4`, wrapperClass)}>
      {#each items as item, index}
        <button
          class={twMerge(
            `tab relative flex min-w-fit shrink-0 items-center gap-2 border-0 bg-transparent py-3 text-[14px]
             transition-colors duration-150 ${isCol && items.find((item) => item.icon) ? "h-20 flex-col justify-center" : ""}
             ${
               index === currentTabIndex
                 ? "cursor-pointer font-semibold text-(--font-color) shadow-[inset_0_-2px_0_var(--accent-color)]"
                 : item.disabled
                   ? "cursor-not-allowed font-medium text-(--faint-color)"
                   : "cursor-pointer font-medium text-(--muted-color) hover:text-(--font-color)"
             }`,
            item.class,
          )}
          disabled={item.disabled}
          style="width: {item.class
            ?.split(' ')
            .find((cls: string) => cls.startsWith('w-'))
            ?.replace('w-[', '')
            .slice(0, -1)};"
          onclick={() => {
            currentTabIndex = index
            if (item.onClick) item.onClick()
          }}
          aria-selected={index === currentTabIndex}
          role="tab"
        >
          {#if item?.icon}
            <span class="flex size-[18px] items-center justify-center overflow-visible [&_svg]:h-full [&_svg]:w-full">
              {#if typeof item.icon === "string"}
                {@html item.icon}
              {:else}
                {@const IconComponent = item.icon}
                <IconComponent />
              {/if}
            </span>
          {/if}
          {#if item?.name}
            <span class="whitespace-nowrap">{item.name}</span>
          {/if}
        </button>
      {/each}
    </div>

    <!-- Контент вкладки -->
    <div
      class="grid w-full flex-1 gap-3 overflow-y-auto bg-(--back-color) p-4"
      style="grid-template-columns: repeat({size.width || 1}, minmax(0, 1fr)); grid-template-rows: repeat({size.height || 1}, auto);"
    >
      {#if Components}
        {#each (apiArray ?? []).filter((c) => c.id.endsWith(`${currentTabIndex}`)) as comp}
          {@render Components(comp, false)}
        {/each}
      {:else if children}
        {@render children(items[currentTabIndex])}
      {:else}
        {@render items[currentTabIndex]?.children?.()}
      {/if}
    </div>
  </div>
</div>
