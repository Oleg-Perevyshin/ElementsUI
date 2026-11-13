<!-- $lib/Modal.svelte - модальное окно: радиус 20, шапка и подвал через линии, подложка 40% с размытием, стек окон, закрытие по Escape и клику вне окна, фокус не выходит из окна -->
<script lang="ts">
  import { T } from "./locales/i18n"
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

  const modalId = $props.id()

  let zIndex = $derived.by(() => {
    const stack = $ModalStack
    const indexInStack = stack.indexOf(modalId)
    return indexInStack !== -1 ? 100 + indexInStack : 100
  })

  let isTopmost = $derived($ModalStack.at(-1) === modalId)

  /* При открытии фокус в первое поле ввода окна (можно сразу печатать), иначе на само окно; при закрытии - туда, где был */
  let dialogElement: HTMLDivElement | undefined = $state()
  let mainElement: HTMLDivElement | undefined = $state()
  $effect(() => {
    if (!isOpen || !dialogElement || !mainElement) return
    const previous = document.activeElement as HTMLElement | null
    const field = mainElement.querySelector<HTMLElement>(
      "input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=range]):not([disabled]):not([readonly]), textarea:not([disabled]):not([readonly])",
    )
    ;(field ?? dialogElement).focus({ preventScroll: true })
    return () => previous?.focus({ preventScroll: true })
  })

  /* Ловушка фокуса: Tab с последнего элемента окна - на первый, Shift+Tab с первого - на последний */
  const FOCUSABLE =
    "a[href], button:not([disabled]), input:not([disabled]):not([type=hidden]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])"
  const trapFocus = (event: KeyboardEvent) => {
    if (event.key !== "Tab" || !dialogElement) return
    const items = [...dialogElement.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null)
    if (!items.length) return event.preventDefault()
    const first = items[0]
    const last = items[items.length - 1]
    if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogElement)) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  $effect(() => {
    if (isOpen) ModalStack.open(modalId)
    else ModalStack.close(modalId)
    return () => ModalStack.close(modalId)
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
      /* [data-ui-portal]: выпадающие списки вынесены в body, клик по ним внутри модалки не считается кликом снаружи */
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
      bind:this={dialogElement}
      data-modal
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? `${modalId}-title` : undefined}
      tabindex="-1"
      onkeydown={trapFocus}
      class={twMerge(
        "flex max-h-[90vh] w-300 flex-col overflow-hidden rounded-[20px] border border-(--hairline-color) bg-(--back-color) shadow-(--elevation-3) outline-none",
        wrapperClass,
      )}
      style="width: {width}; z-index: {zIndex};"
      transition:scale={{ duration: 200, start: 0.96 }}
    >
      <div class="flex items-center justify-between gap-4 border-b border-(--hairline-color) px-5 py-4">
        <h4 id="{modalId}-title" class="min-w-0 truncate text-[17px] font-semibold">{title}</h4>
        <button
          class="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-(--faint-color) transition-colors duration-150 hover:bg-(--container-color) hover:text-(--font-color) [&_svg]:size-(--icon-size)"
          onclick={onCancel}
          aria-label={$T("ui.close")}
        >
          <CrossIcon />
        </button>
      </div>

      <div bind:this={mainElement} class={twMerge("flex h-full w-full min-h-0 flex-col overflow-x-hidden overflow-y-auto p-5", mainClass)}>
        {@render main?.()}
      </div>

      {#if footer}
        <!-- Кнопки по центру и одной ширины во всех окнах; row-reverse - подтверждающее действие первым в разметке, справа на экране -->
        <div
          class="flex flex-row-reverse flex-wrap items-center justify-center gap-2 border-t border-(--hairline-color) bg-(--container-color) px-5 py-3 [&>*]:w-44!"
        >
          {@render footer?.()}
        </div>
      {/if}
    </div>
  </div>
{/if}
