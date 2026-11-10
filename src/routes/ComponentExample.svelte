<script lang="ts">
  import { Button, Modal, Select, T, copyText } from "#lib"
  import { page } from "$app/state"
  import InfoIcon from "#lib/libIcons/InfoIcon.svelte"
  import { RenderMarkdown } from "./common"
  import type { Snippet } from "svelte"
  import { fade } from "svelte/transition"
  import CopiedChip from "#lib/CopiedChip.svelte"
  import CopyIcon from "#lib/libIcons/CopyIcon.svelte"

  let {
    component,
    componentProps,
    examples,
    readmeHtml,
    codeText,
  }: { component: Snippet; componentProps: Snippet; examples?: Snippet; readmeHtml: string; codeText: string } = $props()

  let isCopied = $state(false)
  let snippetOptions = $derived([
    { id: "overview", value: "overview", name: $T("library.overview") },
    { id: "examples", value: "examples", name: $T("library.examples") },
    { id: "info", value: "info", name: $T("library.info") },
  ])

  let mainSnippet = $state("overview")

  /* Предпросмотр шириной телефона (375px): компонент проверяется на узком экране прямо в витрине; выбор помнится в браузере */
  const PHONE_KEY = "LibraryPhonePreview"
  let phone = $state(false)
  $effect(() => {
    try {
      phone = localStorage.getItem(PHONE_KEY) === "1"
    } catch {
      /* хранилище недоступно - режим не запоминается */
    }
  })
  const togglePhone = () => {
    phone = !phone
    try {
      localStorage.setItem(PHONE_KEY, phone ? "1" : "0")
    } catch {
      /* хранилище недоступно */
    }
  }
  const frame = $derived(phone ? "mx-auto w-[375px] max-w-full rounded-[1.75rem] border-4 border-(--border-color) p-2" : "")

  /* Справка (i) - тот же текст component.info.<Тип>, что открывает конструктор DevCloud; тип - из адреса страницы */
  const TYPE_OVERRIDES: Record<string, string> = { WidgetWifi: "WidgetWiFi", WidgetRgbStrip: "WidgetRGBStrip", WidgetPfd: "WidgetPFD" }
  let componentType = $derived.by(() => {
    const slug = page.url.pathname.split("/").filter(Boolean).pop() ?? ""
    const pascal = slug.replace(/(^|-)(\w)/g, (_m, _d, c: string) => c.toUpperCase())
    return TYPE_OVERRIDES[pascal] ?? pascal
  })
  let infoKey = $derived(`component.info.${componentType}`)
  let hasInfo = $derived($T(infoKey) !== infoKey)
  let showInfo = $state(false)
  let infoHtml = $state("")
  const openInfo = async () => {
    infoHtml = await RenderMarkdown($T(infoKey))
    showInfo = true
  }
</script>

{#if showInfo}
  <Modal title={componentType} bind:isOpen={showInfo} wrapperClass="w-200">
    {#snippet main()}
      <div class="markdown-content text-left">{@html infoHtml}</div>
    {/snippet}
  </Modal>
{/if}

<!-- Раскладка как в конструкторе DevCloud: слева контент вкладки, справа всегда сайдбар свойств 24rem с p-2, чтобы переполнения подписей было видно здесь так же, как в облаке -->
<div class="grid h-full w-full grid-cols-[1fr_24rem] gap-2">
  <div class="flex min-h-0 min-w-0 flex-col gap-2">
    <div class="mx-auto flex w-full max-w-xl shrink-0 items-center gap-2">
      <Select wrapperClass="flex-1" type="buttons" options={snippetOptions} value={mainSnippet} onUpdate={(value) => (mainSnippet = value)} />
      <Button wrapperClass="w-auto shrink-0" variant={phone ? "primary" : "secondary"} content={{ name: $T("library.phone") }} onClick={togglePhone} />
    </div>
    {#key mainSnippet}
      {#if mainSnippet === "examples" && examples}
        <div class="min-h-0 flex-1 overflow-y-auto">
          <div class={frame}>{@render examples()}</div>
        </div>
      {:else if mainSnippet === "info"}
        <div class="markdown-content min-h-0 flex-1 overflow-y-auto text-left">
          {@html readmeHtml}
        </div>
      {:else}
        <!-- Компонент занимает свободное место и прокручивается сам, код всегда прижат к низу -->
        <div class="min-h-40 flex-1 overflow-y-auto">
          <div class={frame}>{@render component()}</div>
        </div>
        <div class="relative max-h-[45%] shrink-0 overflow-y-auto">
          <button
            class="absolute top-2 right-3 flex cursor-pointer border-none bg-transparent"
            onclick={async () => {
              isCopied = await copyText(codeText)
              setTimeout(() => (isCopied = false), 1000)
            }}
            aria-label="Копировать текст"
          >
            <div class="size-6 text-sm [&_svg]:h-full [&_svg]:max-h-full [&_svg]:w-full [&_svg]:max-w-full">
              {#if !isCopied}<CopyIcon />{/if}
              <CopiedChip show={isCopied} class="right-1.5 top-1/2 -translate-y-1/2" />
            </div>
          </button>
          <pre class="overflow-x-auto">{codeText}</pre>
        </div>
      {/if}
    {/key}
  </div>

  <div class="flex min-h-0 w-full flex-col overflow-hidden rounded-2xl bg-(--back-color)/50">
    <div class="flex shrink-0 items-start justify-end gap-2 p-2">
      {#if hasInfo}
        <Button wrapperClass="w-6 h-6 shrink-0" componentClass="p-0" content={{ icon: InfoIcon }} onClick={openInfo} />
      {/if}
    </div>
    <div class="min-h-0 flex-1 overflow-auto p-2" transition:fade={{ duration: 200 }}>
      {@render componentProps()}
    </div>
  </div>
</div>
