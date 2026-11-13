<!-- $lib/Table/CopyButton.svelte - кнопка копирования текста в буфер с меткой «Скопировано» -->
<script lang="ts">
  import { T } from "../locales/i18n"
  import CopiedChip from "../CopiedChip.svelte"
  import CopyIcon from "../libIcons/CopyIcon.svelte"
  import { copyText } from "../clipboard"

  let { text, class: className = "" }: { text: () => string; class?: string } = $props()

  let copied = $state(false)
  const copy = async (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    copied = await copyText(text())
    setTimeout(() => (copied = false), 1000)
  }
</script>

<button
  type="button"
  class="relative flex size-5 shrink-0 cursor-pointer items-center justify-center rounded border-none bg-transparent text-(--faint-color) transition-colors duration-150 hover:bg-(--container-color) hover:text-(--font-color) {className}"
  onclick={copy}
  aria-label={$T("ui.copy_text")}
>
  <span class="flex size-(--icon-size-sm) [&_svg]:size-full" aria-hidden="true"><CopyIcon /></span>
  <CopiedChip show={copied} class="top-1/2 right-full z-10 mr-1 -translate-y-1/2" />
</button>
