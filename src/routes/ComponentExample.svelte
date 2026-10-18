<script lang="ts">
  import { Button, Modal, Select, Switch, T, type IOption } from "$lib"
  import { page } from "$app/state"
  import InfoIcon from "$lib/libIcons/InfoIcon.svelte"
  import { RenderMarkdown } from "./common"
  import type { Snippet } from "svelte"
  import { fade } from "svelte/transition"
  import CopiedChip from "$lib/CopiedChip.svelte"

  let {
    component,
    componentProps,
    examples,
    readmeHtml,
    codeText,
    forConstructor = $bindable(),
  }: { component: Snippet; componentProps: Snippet; examples?: Snippet; readmeHtml: string; codeText: string; forConstructor: boolean } = $props()

  let isCopied = $state(false)
  let snippetOptions = $derived([
    { id: "overview", value: "overview", name: $T("library.overview") },
    { id: "examples", value: "examples", name: $T("library.examples") },
    { id: "info", value: "info", name: $T("library.info") },
  ])

  let mainSnippet: string | undefined = $state("overview")

  /* Справка (i) — тот же текст component.info.<Тип>, что открывает конструктор DevCloud; тип — из адреса страницы */
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

<!-- Раскладка как в конструкторе DevCloud: слева контент вкладки, справа всегда сайдбар свойств 24rem с p-2,
     чтобы переполнения подписей было видно здесь так же, как в облаке -->
<div class="grid h-full w-full grid-cols-[1fr_24rem] gap-2">
  <div class="flex min-h-0 min-w-0 flex-col gap-2">
    <Select
      wrapperClass="w-full max-w-md mx-auto shrink-0"
      type="buttons"
      options={snippetOptions}
      value={snippetOptions.find((o) => o.value == mainSnippet)}
      onUpdate={(value) => (mainSnippet = (value as IOption<string>).value)}
    />
    {#key mainSnippet}
      {#if mainSnippet === "examples" && examples}
        <div class="min-h-0 flex-1 overflow-y-auto">
          {@render examples()}
        </div>
      {:else if mainSnippet === "info"}
        <div class="markdown-content min-h-0 flex-1 overflow-y-auto text-left">
          {@html readmeHtml}
        </div>
      {:else}
        <!-- Компонент занимает свободное место и прокручивается сам, код всегда прижат к низу -->
        <div class="min-h-40 flex-1 overflow-y-auto">
          {@render component()}
        </div>
        <div class="relative max-h-[45%] shrink-0 overflow-y-auto">
          <button
            class="absolute top-2 right-3 flex cursor-pointer border-none bg-transparent"
            onclick={(e) => {
              e.preventDefault()
              navigator.clipboard.writeText(codeText)
              isCopied = true
              setTimeout(() => (isCopied = false), 1000)
            }}
            aria-label="Копировать текст"
          >
            <div class="size-6 text-sm [&_svg]:h-full [&_svg]:max-h-full [&_svg]:w-full [&_svg]:max-w-full">
              {#if !isCopied}
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                  <g fill="none" stroke="currentColor" stroke-width="1.5">
                    <path
                      d="M6 11c0-2.828 0-4.243.879-5.121C7.757 5 9.172 5 12 5h3c2.828 0 4.243 0 5.121.879C21 6.757 21 8.172 21 11v5c0 2.828 0 4.243-.879 5.121C19.243 22 17.828 22 15 22h-3c-2.828 0-4.243 0-5.121-.879C6 20.243 6 18.828 6 16z"
                    />
                    <path d="M6 19a3 3 0 0 1-3-3v-6c0-3.771 0-5.657 1.172-6.828S7.229 2 11 2h4a3 3 0 0 1 3 3" />
                  </g>
                </svg>
              {/if}
              <CopiedChip show={isCopied} class="right-1.5 top-1/2 -translate-y-1/2" />
            </div>
          </button>
          <pre class="overflow-x-auto">{codeText}</pre>
        </div>
      {/if}
    {/key}
  </div>

  <div class="flex min-h-0 w-full flex-col overflow-hidden rounded-2xl bg-(--back-color)/50">
    <div class="flex shrink-0 items-start justify-between gap-2 p-2">
      <Switch
        wrapperClass="w-auto"
        label={{ name: $T("library.for_constructor") }}
        value={forConstructor ? 1 : 0}
        options={[{ id: crypto.randomUUID(), value: 0 }]}
        onChange={(value) => (forConstructor = value == 0 ? false : true)}
      />
      {#if hasInfo}
        <Button wrapperClass="w-6 h-6 shrink-0" componentClass="bg-transparent p-0" content={{ icon: InfoIcon }} onClick={openInfo} />
      {/if}
    </div>
    <div class="min-h-0 flex-1 overflow-auto p-2" transition:fade={{ duration: 200 }}>
      {@render componentProps()}
    </div>
  </div>
</div>
