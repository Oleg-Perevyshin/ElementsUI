<script lang="ts">
  import type { ITabsProps } from '$lib/types'
  import { onMount } from 'svelte'
  import { twMerge } from 'tailwind-merge'

  let {
    id = crypto.randomUUID(),
    wrapperClass = '',
    size = { width: 12, height: 6 },
    activeTab = 0,
    items = [
      {
        name: 'tab 1',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"\r\n  ><path\r\n    fill="none"\r\n    stroke="currentColor"\r\n    stroke-linecap="round"\r\n    stroke-linejoin="round"\r\n    stroke-width="1.5"\r\n    d="M14.44 5.78L4.198 16.02a2 2 0 0 0-.565 1.125l-.553 3.774l3.775-.553A2 2 0 0 0 7.98 19.8L18.22 9.56m-3.78-3.78l2.229-2.23a1.6 1.6 0 0 1 2.263 0l1.518 1.518a1.6 1.6 0 0 1 0 2.263l-2.23 2.23M14.44 5.78l3.78 3.78"\r\n  /></svg\r\n>\r\n',
        class: '',
      },
      { name: 'tab 2', icon: '', class: 'bg-red' },
    ],
    apiArray = [],
    Components,
  }: ITabsProps = $props()

  const isCol = $derived(!!items.find((item) => item.class?.startsWith('flex-col')))

  let currentTabIndex: number = $state(activeTab)
</script>

<div {id} class="w-full rounded-2xl bg-(--back-color)">
  <!-- Вкладки -->
  <div
    class="{twMerge('bg-blue sticky top-0 z-50 flex h-fit items-center overflow-x-auto rounded-t-2xl px-1', wrapperClass)} 
     bg-(--bg-color)"
  >
    {#each items as item, index}
      <button
        class={twMerge(
          `tab mt-1 flex min-w-fit cursor-pointer items-center justify-center gap-0 self-end rounded-t-2xl px-5 py-2.5 ${isCol && items.find((item) => item.icon) ? 'h-20' : 'gap-2'}`,
          item.class,
          index === currentTabIndex ? twMerge('bg-(--back-color) text-blue-500', item.class) : 'bg-(--bg-color) text-gray-500',
        )}
        onclick={() => (currentTabIndex = index)}
      >
        {#if item?.icon}
          <span class="flex h-7 w-7 items-center justify-center overflow-visible [&_svg]:h-full [&_svg]:max-h-full [&_svg]:w-full [&_svg]:max-w-full">
            {@html item.icon}
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
          : 'border-(--bg-color)'}"
      ></span>
    {/each}
  </div>

  <!-- Контент вкладки -->
  <div
    class="grid w-full gap-2 rounded-2xl bg-(--back-color) p-4"
    style="grid-template-columns: repeat({size.width || 1}, minmax(0, 1fr)); grid-template-rows: repeat({size.height || 1}, auto);"
  >
    {#if Components}
      {#each (apiArray ?? []).filter((c) => c.id.endsWith(`${currentTabIndex}`)) as comp}
        {@render Components(comp, false)}
      {/each}
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
    background-color: color-mix(in srgb, var(--bg-color), var(--back-color) 20%);
    border-radius: 8px;
    cursor: pointer;
  }
</style>
