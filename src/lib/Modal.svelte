<script lang="ts">
  import { type Snippet } from "svelte"
  import { fade, scale } from "svelte/transition"
  import { twMerge } from "tailwind-merge"
  import CrossIcon from "./libIcons/CrossIcon.svelte"
  import { ModalStack } from "./ModalStackStore"

  let {
    isOpen = $bindable(false),
    title,
    wrapperClass = "",
    mainClass = "",
    width = "",
    main,
    footer,
    onCancel = () => (isOpen = false),
  }: {
    isOpen?: boolean
    title?: string
    wrapperClass?: string
    mainClass?: string
    width?: string
    main: Snippet
    footer?: Snippet
    onCancel?: () => void
  } = $props()

  let modalId = $state(crypto.randomUUID())

  let zIndex = $derived.by(() => {
    const stack = $ModalStack
    const indexInStack = stack.indexOf(modalId)
    return indexInStack !== -1 ? 100 + indexInStack : 100
  })

  let isTopmost = $derived($ModalStack.at(-1) === modalId)

  // Открытие/закрытие модалки + Escape
  $effect(() => {
    if (isOpen) {
      ModalStack.open(modalId)
    } else {
      ModalStack.close(modalId)
    }
  })

  $effect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isTopmost) {
        isOpen = false
        onCancel()
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (isTopmost && !target.closest("[data-modal]")) {
        isOpen = false
        onCancel()
      }
    }

    if (!isOpen) return

    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  })
</script>

{#if isOpen}
  <div
    class="fixed inset-0 flex items-center justify-center bg-black/50"
    data-modal-backdrop
    transition:fade={{ duration: 200 }}
    style="z-index: {zIndex - 1};"
  >
    <div
      data-modal
      class={twMerge("flex w-300 flex-col overflow-hidden rounded-2xl bg-(--back-color) text-center", wrapperClass)}
      style="width: {width}; z-index: {zIndex};"
      transition:scale={{ duration: 250, start: 0.8 }}
    >
      <div class="flex items-end justify-between bg-(--field-color) px-6 py-3">
        <h4>{title}</h4>
        <button class="h-6 w-6 cursor-pointer" onclick={onCancel}>
          <CrossIcon />
        </button>
      </div>

      <div class={twMerge("flex h-full w-full flex-col overflow-auto p-2", mainClass)}>
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
