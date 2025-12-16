<script lang="ts">
  import { onMount, type Snippet } from 'svelte'
  import { fade, scale } from 'svelte/transition'
  import { twMerge } from 'tailwind-merge'
  import CrossIcon from './libIcons/CrossIcon.svelte'

  let {
    isOpen = $bindable(false),
    title,
    wrapperClass = '',
    mainClass = '',
    main,
    footer,
    onCancel = () => (isOpen = false),
  }: {
    isOpen?: boolean
    title?: string
    wrapperClass?: string
    mainClass?: string
    main: Snippet
    footer?: Snippet
    onCancel?: () => void
  } = $props()

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      isOpen = false
      onCancel()
    }
  }

  onMount(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  })
</script>

{#if isOpen}
  <div class="fixed inset-0 z-100 flex items-center justify-center bg-black/50" transition:fade={{ duration: 200 }}>
    <div
      class={twMerge(`flex w-300 flex-col overflow-hidden rounded-2xl bg-(--back-color) text-center`, wrapperClass)}
      transition:scale={{ duration: 250, start: 0.8 }}
    >
      <div class="flex items-end justify-between bg-(--field-color) px-6 py-3">
        <h4>{title}</h4>
        <button class="h-6 w-6 cursor-pointer" onclick={onCancel}> <CrossIcon /> </button>
      </div>

      <div class={twMerge('flex h-full w-full flex-col overflow-auto p-2', mainClass)}>
        {@render main?.()}
      </div>
      {#if footer}
        <div class="flex flex-row-reverse justify-between bg-(--field-color) p-1.5">
          {@render footer?.()}
        </div>
      {/if}
    </div>
  </div>
{/if}
