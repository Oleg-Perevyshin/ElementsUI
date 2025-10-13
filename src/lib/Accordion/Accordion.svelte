<script lang="ts">
  import { slide } from 'svelte/transition'
  import type { IAccordionProps } from '../types'
  import { twMerge } from 'tailwind-merge'

  let {
    id = crypto.randomUUID(),
    isOpen = false,
    outline = false,
    wrapperClass = '',
    size = { width: 1, height: 1 },
    label = { name: '', class: 'text-left', icon: null },
    children,
    image,
  }: IAccordionProps = $props()

  const toggle = () => (isOpen = !isOpen)
</script>

<div
  {id}
  class={twMerge(
    `${outline ? 'border-none' : 'rounded-xl hover:shadow-md'} w-full
    border border-[var(--border-color)] bg-[var(--container-color)] p-0 transition-shadow duration-250`,
    wrapperClass,
  )}
  transition:slide={{ duration: 250 }}
>
  <button
    class="flex w-full cursor-pointer items-center justify-between p-4 transition-shadow duration-250
    {outline ? 'border-b border-[var(--border-color)]' : ''}"
    onclick={toggle}
  >
    <div class="flex w-full items-center">
      <span
        class={`flex h-8 w-8 shrink-0 items-center justify-center overflow-visible [&_svg]:h-full [&_svg]:max-h-full [&_svg]:w-full [&_svg]:max-w-full`}
      >
        {#if label?.icon}
          {@html label.icon}
        {/if}
      </span>
      <span class="{twMerge('m-0 w-full cursor-pointer text-left font-semibold', label.class)} text-lg">
        {label?.name}
      </span>
    </div>

    <div class="w-10 pl-4">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-[1.1rem] w-[1.1rem] transition-transform duration-250"
        style="transform: rotate({isOpen ? 180 : 0}deg)"
        viewBox="0 0 24 24"
      >
        <path
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M18 12.5s-4.419 6-6 6s-6-6-6-6m12-7s-4.419 6-6 6s-6-6-6-6"
          color="currentColor"
        />
      </svg>
    </div>
  </button>

  {#if isOpen}
    <div
      class="grid w-full p-4 sm:p-3 {image ? 'gap-x-2' : 'gap-2'} {outline ? '' : 'border-t border-[var(--border-color)]'}"
      transition:slide={{ duration: 250 }}
      style="grid-template-columns: repeat({size.width || 10}, minmax(0, 1fr)); 
          grid-template-rows: repeat({size.height || 2}, {image ? 'minmax(6.5rem, auto)' : 'auto'});
          {image ? `background-image: url(${image}); background-size: cover; background-position: center;` : ''}"
    >
      {@render children?.()}
    </div>
  {/if}
</div>
