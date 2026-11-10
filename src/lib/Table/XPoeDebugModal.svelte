<!-- $lib/Table/XPoeDebugModal.svelte - окно полного вида строки xPOE-Debug: Payload развёрнуто в цветах темы и исходные байты HEX, у каждого раздела кнопка копирования -->
<script module lang="ts">
  import { escapeHtml } from "../html"
  import { bytesToHex } from "../protocols/hex.js"
  import { formatXPoeDebugPretty } from "../protocols/xPoeDebugView.js"
  import type { XPoeDebugRow } from "../protocols/xPoeDebug.js"
  import CopyButton from "./CopyButton.svelte"

  export { xPoeDebugModal }
</script>

{#snippet pane(title: string, copy: () => string, html: string)}
  <section class="min-w-0 pb-3">
    <div class="mb-2 flex items-center justify-between gap-3 font-semibold">
      <span>{title}</span>
      <CopyButton class="size-7" text={copy} />
    </div>
    <pre class="m-0 min-w-0 font-[inherit] whitespace-pre-wrap [overflow-wrap:anywhere]">{@html html}</pre>
  </section>
{/snippet}

{#snippet xPoeDebugModal(row: XPoeDebugRow)}
  {@const pretty = formatXPoeDebugPretty(row.payload, true)}
  {@const hex = bytesToHex(row.valueBytes)}
  <div class="flex min-w-0 flex-col gap-3 text-left">
    <!-- Развёрнутый вид собран из экранированных данных (formatXPoeDebugPretty), HEX - только цифры -->
    {@render pane("Value", () => formatXPoeDebugPretty(row.payload) ?? row.value, pretty ?? escapeHtml(row.value))}
    {#if hex}
      {@render pane("HEX", () => hex, hex)}
    {/if}
  </div>
{/snippet}
