<!-- $lib/Table/CopyButton.svelte - кнопка копирования текста в буфер с меткой «Скопировано» -->
<script lang="ts">
  import { T } from "../locales/i18n"
  import CopiedChip from "../CopiedChip.svelte"

  let { text, class: className = "" }: { text: () => string; class?: string } = $props()

  let copied = $state(false)
  const copy = async (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await navigator.clipboard.writeText(text())
    copied = true
    setTimeout(() => (copied = false), 1000)
  }
</script>

<button
  type="button"
  class="relative flex size-5 shrink-0 cursor-pointer items-center justify-center rounded border-none bg-transparent text-(--faint-color) transition-colors duration-150 hover:bg-(--container-color) hover:text-(--font-color) {className}"
  onclick={copy}
  aria-label={$T("ui.copy_text")}
>
  <svg class="size-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
    <g fill="none" stroke="currentColor" stroke-width="1.5">
      <path
        d="M6 11c0-2.828 0-4.243.879-5.121C7.757 5 9.172 5 12 5h3c2.828 0 4.243 0 5.121.879C21 6.757 21 8.172 21 11v5c0 2.828 0 4.243-.879 5.121C19.243 22 17.828 22 15 22h-3c-2.828 0-4.243 0-5.121-.879C6 20.243 6 18.828 6 16z"
      />
      <path d="M6 19a3 3 0 0 1-3-3v-6c0-3.771 0-5.657 1.172-6.828S7.229 2 11 2h4a3 3 0 0 1 3 3" />
    </g>
  </svg>
  <CopiedChip show={copied} class="top-1/2 right-full z-10 mr-1 -translate-y-1/2" />
</button>
