<script lang="ts">
  import { slide } from 'svelte/transition'
  import type { IAccordionProps } from '../types'
  import { twMerge } from 'tailwind-merge'

  let {
    id = crypto.randomUUID(),
    isOpen = false,
    wrapperClass = '',
    size = { width: 1, height: 1 },
    label = { name: '', class: 'text-left', icon: null },
    children,
    image = '',
  }: IAccordionProps = $props()

  const toggle = () => (isOpen = !isOpen)
</script>

<div
  id={`${id}-${crypto.randomUUID().slice(0, 6)}`}
  class={twMerge(
    `w-full rounded-xl bg-(--container-color) p-0
     shadow-sm transition-shadow duration-250 hover:shadow-md`,
    wrapperClass,
  )}
  transition:slide={{ duration: 250 }}
>
  <button class="flex w-full cursor-pointer items-center justify-between p-4 py-3.5 transition-shadow duration-250" onclick={toggle}>
    <div class="flex w-full items-center">
      <span
        class={`flex h-7 w-7 shrink-0 items-center justify-center overflow-visible [&_svg]:h-full [&_svg]:max-h-full [&_svg]:w-full [&_svg]:max-w-full`}
      >
        {#if label?.icon}
          {#if typeof label?.icon === 'string'}
            {@html label.icon}
          {:else}
            {@const IconComponent = label?.icon}
            <IconComponent />
          {/if}
        {/if}
      </span>

      <div
        class="{twMerge(
          'flex w-full justify-start ',
          label.class?.split(' ').find((cls: string) => cls.startsWith('justify-')),
        )} "
      >
        <span
          class="{twMerge(
            `m-0 origin-top-left cursor-pointer justify-end px-3 font-semibold transition duration-200 ${isOpen ? 'scale-110' : ''}`,
            label.class,
          )} text-lg"
        >
          {label?.name}
        </span>
      </div>
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
      class="grid w-full p-4 sm:p-3 {image ? 'gap-x-2' : 'gap-2'} inset-shadow-[0_10px_10px_-15px_rgb(0_0_0_/0.5)]"
      transition:slide={{ duration: 250 }}
      style="grid-template-columns: repeat({size.width || 10}, minmax(0, 1fr)); 
          grid-template-rows: repeat({size.height || 2}, {image ? 'minmax(6.5rem, auto)' : 'auto'});
          {image ? `background-image: url(${image}); background-size: cover; background-position: center;` : ''}"
    >
      {@render children?.()}
    </div>
  {/if}
</div>
