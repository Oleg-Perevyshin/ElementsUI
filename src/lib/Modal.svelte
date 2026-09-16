<!-- $lib/Modal.svelte — радиус 20, шапка и подвал через линии,
     подложка 40% + blur. Логика стека, Escape и клика вне окна не тронута. -->
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

  $effect(() => {
    if (isOpen) ModalStack.open(modalId)
    else ModalStack.close(modalId)
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
      /* [data-ui-portal] — элементы вроде выпадающего списка Select физически вынесены в
         document.body (портал, чтобы их не обрезал overflow родителя), т.е. DOM-предок у них —
         не [data-modal], а <body>. Без этой проверки клик по такому элементу внутри модалки
         считался бы кликом "снаружи" и сразу закрывал бы её. */
      if (isTopmost && !target.closest("[data-modal]") && !target.closest("[data-ui-portal]")) {
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
    class="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
    data-modal-backdrop
    transition:fade={{ duration: 150 }}
    style="z-index: {zIndex - 1};"
  >
    <div
      data-modal
      class={twMerge(
        "flex w-300 flex-col overflow-hidden rounded-[20px] border border-(--hairline-color) bg-(--back-color) shadow-(--elevation-3)",
        wrapperClass,
      )}
      style="width: {width}; z-index: {zIndex};"
      transition:scale={{ duration: 200, start: 0.96 }}
    >
      <div class="flex items-center justify-between gap-4 border-b border-(--hairline-color) px-5 py-4">
        <h4 class="min-w-0 truncate text-[17px] font-semibold">{title}</h4>
        <button
          class="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-(--faint-color) transition-colors duration-150 hover:bg-(--container-color) hover:text-(--font-color) [&_svg]:size-4"
          onclick={onCancel}
          aria-label="Закрыть"
        >
          <CrossIcon />
        </button>
      </div>

      <div class={twMerge("flex h-full w-full min-h-0 flex-col overflow-x-hidden overflow-y-auto p-5", mainClass)}>
        {@render main?.()}
      </div>

      {#if footer}
        <!-- Подтверждающее действие — крайнее справа; row-reverse сохранён,
             поэтому порядок сниппетов в вызовах менять не нужно -->
        <div class="flex flex-row-reverse items-center justify-start gap-2 border-t border-(--hairline-color) bg-(--container-color) px-5 py-3">
          {@render footer?.()}
        </div>
      {/if}
    </div>
  </div>
{/if}
