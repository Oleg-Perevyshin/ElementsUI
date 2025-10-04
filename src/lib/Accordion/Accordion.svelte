<script lang="ts">
  import { slide } from 'svelte/transition'
  import type { IAccordionProps } from '../types'

  const props: IAccordionProps = $props()
  let isOpen = $state(props.isOpen)

  const toggle = () => (isOpen = !isOpen)
</script>

<div
  id={props.id?.value}
  class="border-[var(--border-color)] p-0 transition-shadow duration-250 {props.type === 'sub'
    ? 'border-none'
    : 'rounded-xl border bg-[var(--conteiner-color)] hover:shadow-md'}
    {props.componentClass}"
  transition:slide={{ duration: 250 }}
>
  <button
    class="flex w-full cursor-pointer items-center justify-between transition-shadow duration-250 sm:p-4 sm:px-6
    {props.type === 'sub' ? 'border-b border-[var(--border-color)]' : ''}"
    onclick={toggle}
  >
    <span class="toggle m-0 cursor-pointer text-lg flex items-center gap-2 font-semibold {props.label?.class}">
      {#if props.icon?.component}
        {@const IconComponent = props.icon?.component}
        <IconComponent {...props.icon?.properties} />
      {/if}
      {props.label?.name}
    </span>
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
  </button>

  {#if isOpen}
    <div
      class="flex w-full flex-wrap items-start justify-around p-4 sm:p-3 {props.type === 'sub' ? '' : 'border-t border-[var(--border-color)]'}"
      transition:slide={{ duration: 250 }}
    >
      {@render props.children?.()}
    </div>
  {/if}
</div>
