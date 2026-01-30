<script lang="ts">
  import type { ITabsProps } from "$lib/types"
  import { twMerge } from "tailwind-merge"

  let {
    id = crypto.randomUUID(),
    wrapperClass = "bg-blue",
    size = { width: 12, height: 6 },
    activeTab = 0,
    items = [
      {
        name: "tab 1",
        icon: "",
        class: "",
      },
      { name: "tab 2", icon: "", class: "" },
    ],
    children,
    apiArray = [],
    Components,
  }: ITabsProps = $props()

  const isCol = $derived(!!items.find((item) => item.class?.startsWith("flex-col")))

  let currentTabIndex: number = $derived(activeTab)
</script>

<div id={`${id}-${crypto.randomUUID().slice(0, 6)}`} class="w-full h-full flex flex-col rounded-xl bg-(--back-color) overflow-hidden">
  <!-- Вкладки -->
  <div
    class="{twMerge(`z-40 flex h-fit items-center rounded-t-2xl overflow-x-auto px-1`, wrapperClass)} 
     bg-(--bg-color)"
  >
    {#each items as item, index}
      <button
        class={twMerge(
          `tab mt-1 flex min-w-fit cursor-pointer items-center justify-center gap-0 self-end rounded-t-2xl px-5 py-2.5 ${isCol && items.find((item) => item.icon) ? "h-20" : "gap-2"}`,
          item.class,
          index === currentTabIndex
            ? twMerge(
                "bg-(--back-color) text-blue-500",
                `text-${
                  wrapperClass
                    ?.split(" ")
                    .find((cls: string) => cls.startsWith("bg-"))
                    ?.slice(3)
                    .split("-")[0]
                }-500`,
              )
            : "bg-(--bg-color) text-gray-500",
        )}
        style="width: {item.class
          ?.split(' ')
          .find((cls: string) => cls.startsWith('w-'))
          ?.replace('w-[', '')
          .slice(0, -1)};"
        onclick={() => (currentTabIndex = index)}
      >
        {#if item?.icon}
          <span class="flex h-7 w-7 items-center justify-center overflow-visible [&_svg]:h-full [&_svg]:max-h-full [&_svg]:w-full [&_svg]:max-w-full">
            {#if typeof item.icon === "string"}
              {@html item.icon}
            {:else}
              {@const IconComponent = item.icon}
              <IconComponent />
            {/if}
          </span>
        {/if}
        {#if item?.name}
          <span class="text-lg font-semibold">{item.name}</span>
        {/if}
      </button>
      <span
        class="{isCol && items.find((item) => item.icon) ? 'h-9' : 'h-4'} w-0 border border-l {index !== items.length - 1 &&
        index !== currentTabIndex &&
        index !== currentTabIndex - 1
          ? 'border-gray-500'
          : 'opacity-0'}"
      ></span>
    {/each}
  </div>

  <!-- Контент вкладки -->
  <div
    class="grid flex-1 overflow-y-scroll w-full gap-2 rounded-2xl bg-(--back-color) p-4"
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

<style>
  ::-webkit-scrollbar-track {
    background: var(--back-color);
  }
  ::-webkit-scrollbar-thumb {
    background-color: color-mix(in srgb, var(--blue-color), white);
    border-radius: 8px;
    cursor: pointer;
  }
</style>
