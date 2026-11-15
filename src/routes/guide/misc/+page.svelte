<!-- src/routes/guide/misc/+page.svelte - витрина «Окна и уведомления»: Modal, уведомления Toasts с сообщениями устройств, Loader, подпись поля с пояснением, значок раскрытия и значки библиотеки; ниже README Modal и Loader -->
<script lang="ts">
  import * as UI from "#lib"
  import { formatDeviceMessage, MESSAGE_CODES } from "#lib/protocols/index.ts"
  import { RenderMarkdown } from "../../common"
  import modalRaw from "#lib/Modal.README.md?raw"
  import loaderRaw from "#lib/Loader/README.md?raw"

  const T = UI.T
  let isOpen = $state(false)
  let expanded = $state(false)

  /* Уведомление как от устройства: код события и параметры, текст на текущем языке */
  const toast = (name: string, args?: (string | number)[]) => {
    const shown = formatDeviceMessage(MESSAGE_CODES[name], args, UI.getLanguage())
    if (shown) UI.addToast(shown.text, "Demo", shown.level)
  }

  const icons = [
    ["IconArrow", UI.IconArrow],
    ["IconCross", UI.IconCross],
    ["IconClear", UI.IconClear],
    ["IconDelete", UI.IconDelete],
    ["IconAdd", UI.IconAdd],
    ["IconDownload", UI.IconDownload],
    ["IconCopy", UI.IconCopy],
    ["IconInfo", UI.IconInfo],
    ["IconError", UI.IconError],
    ["IconLibrary", UI.IconLibrary],
    ["IconMoveVertical", UI.IconMoveVertical],
    ["IconGripVerticalDual", UI.IconGripVerticalDual],
  ] as const

  let docHtml = $state("")
  $effect(() => {
    Promise.all([RenderMarkdown(modalRaw), RenderMarkdown(loaderRaw)]).then((parts) => (docHtml = parts.join("<hr />")))
  })
</script>

<div class="mx-auto flex w-full max-w-6xl flex-col gap-4">
  <section class="flex flex-wrap items-center gap-3 rounded-2xl border border-(--hairline-color) p-4">
    <h2 class="w-full text-lg font-semibold">Modal · Toasts</h2>
    <UI.Button wrapperClass="w-auto" variant="primary" content={{ name: $T("library.misc_modal") }} onClick={() => (isOpen = true)} />
    <UI.Button wrapperClass="w-auto" variant="secondary" content={{ name: "info" }} onClick={() => toast("FW_UPGRADED")} />
    <UI.Button wrapperClass="w-auto" variant="secondary" content={{ name: "warn" }} onClick={() => toast("WIFI_CONNECT_FAILED", ["Home 5G"])} />
    <UI.Button wrapperClass="w-auto" variant="secondary" content={{ name: "error" }} onClick={() => toast("FS_NO_SPACE")} />
    <span class="w-full text-sm text-(--muted-color)">{$T("library.misc_toast_hint")}</span>
  </section>

  <section class="flex flex-wrap items-center gap-3 rounded-2xl border border-(--hairline-color) p-4">
    <h2 class="w-full text-lg font-semibold">Loader · FieldLabel · InfoHint · ExpandIcon</h2>
    <UI.Loader />
    <UI.Loader size="2rem" label={$T("library.misc_loading")} class="text-(--accent-text)" />
    <div class="w-56"><UI.FieldLabel label={{ name: $T("library.misc_label") }} info={$T("library.misc_label_info")} /></div>
    <button type="button" class="group" onclick={() => (expanded = !expanded)}><UI.ExpandIcon open={expanded} /></button>
    <button type="button" class="group" onclick={() => (expanded = !expanded)}><UI.ExpandIcon open={expanded} direction="right" /></button>
  </section>

  <section class="flex flex-wrap items-center gap-3 rounded-2xl border border-(--hairline-color) p-4">
    <h2 class="w-full text-lg font-semibold">{$T("library.misc_icons")}</h2>
    {#each icons as [name, Icon] (name)}
      <div class="flex w-36 items-center gap-2 text-sm"><span class="[&_svg]:size-5"><Icon /></span><code>{name}</code></div>
    {/each}
  </section>

  <div class="markdown-content text-left text-[15px]">{@html docHtml}</div>
</div>

<UI.Modal bind:isOpen title={$T("library.misc_modal")}>
  {#snippet main()}
    <p class="p-2">{$T("library.misc_modal_text")}</p>
  {/snippet}
  {#snippet footer()}
    <UI.Button wrapperClass="w-auto" variant="primary" content={{ name: "OK" }} onClick={() => (isOpen = false)} />
  {/snippet}
</UI.Modal>
<UI.Toasts />
