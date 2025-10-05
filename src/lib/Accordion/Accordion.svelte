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
    class="flex p-4 w-full cursor-pointer items-center justify-between transition-shadow duration-250
    {props.type === 'sub' ? 'border-b border-[var(--border-color)]' : ''}"
    onclick={toggle}
  >
    <div class="flex items-center w-full">
      <span class={`flex items-center justify-center w-8 h-8 shrink-0 overflow-visible [&_svg]:w-full [&_svg]:h-full [&_svg]:max-w-full [&_svg]:max-h-full`}>
        {#if props.icon?.svg}
          {@html props.icon.svg}
        {:else if props.icon?.component}
          {@const IconComponent = props.icon?.component}
          <IconComponent />
        {/if}
      </span>
      <h4
        class="{props.label?.class}
        {props.label?.align === 'center' ? 'text-center flex-1' : props.label?.align === 'right' ? 'text-right flex-1 mr-2' : 'text-left flex-1 ml-2'}"
      >
        {props.label?.name}
      </h4>
    </div>

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
      class="flex w-full flex-wrap items-start justify-around p-2 {props.type === 'sub' ? '' : 'border-t border-[var(--border-color)]'}"
      transition:slide={{ duration: 250 }}
      style={props.image ? `background-image: url('${props.image}'); background-size: cover;` : ''}
    >
      {@render props.children?.()}
    </div>
  {/if}
</div>
