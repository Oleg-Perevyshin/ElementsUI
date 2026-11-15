<!-- src/routes/guide/protocol/+page.svelte - витрина «Протокол»: песочница пакета poe_cbor_pkt (сборка из команды и данных, разбор hex обратно) и PROTOCOL.md -->
<script lang="ts">
  import { Input, Select, Switch, T, type IOption } from "#lib"
  import {
    BUS_ID_REGEXP,
    HEADER_CODES,
    cborToValue,
    decodeHar,
    decodePacket,
    encodeHar,
    encodePacket,
    formatBusId,
    formatXPoeDebugPretty,
    parseBusId,
    xPoeDebugValueFromText,
  } from "#lib/protocols/index.ts"
  import { RenderMarkdown } from "../../common"
  import protocolRaw from "#lib/protocols/PROTOCOL.md?raw"

  const headers: IOption<string>[] = Object.keys(HEADER_CODES).map((name) => ({ id: name, value: name, name }))
  let header = $state("GET")
  let argument = $state("ModCfg")
  let reply = $state(true)
  let trg = $state("0000")
  let src = $state("0000")
  let payloadText = $state("{}")

  const hex = (bytes: Uint8Array) => Array.from(bytes, (b) => b.toString(16).padStart(2, "0").toUpperCase()).join(" ")
  const fromHex = (text: string) => {
    const clean = text.replace(/0x/gi, "").replace(/[^0-9a-f]/gi, "")
    if (clean.length % 2) throw new Error($T("library.proto_hex_odd"))
    return Uint8Array.from(clean.match(/../g) ?? [], (pair) => parseInt(pair, 16))
  }

  /* Сборка: HAR по словарю, Payload из того же вида, что поле Value консоли (YAML/JSON, h'..', 0x.. - готовый CBOR) */
  const built = $derived.by(() => {
    try {
      if (!BUS_ID_REGEXP.test(trg) || !BUS_ID_REGEXP.test(src)) throw new Error($T("library.proto_bad_busid"))
      const trgBusID = parseBusId(trg)
      const srcBusID = parseBusId(src)
      const har = encodeHar(header, /^\d+$/.test(argument.trim()) ? Number(argument) : argument.trim(), reply)
      const payload = xPoeDebugValueFromText(payloadText)
      return { har, payload, packet: encodePacket([{ trgBusID, srcBusID, har, payload }]) }
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) }
    }
  })

  let parseText = $state("")
  $effect(() => {
    if (!parseText && built.packet) parseText = hex(built.packet)
  })
  const parsed = $derived.by(() => {
    try {
      const result = decodePacket(fromHex(parseText))
      if (result.status !== "complete") return { error: $T(`library.proto_status_${result.status}`) }
      return {
        objects: result.objects.map((o) => {
          const har = decodeHar(o.har)
          const value = o.payload.length ? formatXPoeDebugPretty(cborToValue(o.payload)) : "null"
          return { ...o, harText: `${har.header} ${har.argument}${o.reply ? "" : " (NR)"}`, value }
        }),
      }
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) }
    }
  })

  let docHtml = $state("")
  $effect(() => {
    RenderMarkdown(protocolRaw).then((html) => (docHtml = html))
  })
</script>

<div class="mx-auto flex w-full max-w-6xl flex-col gap-4">
  <section class="flex flex-col gap-3 rounded-2xl border border-(--hairline-color) p-4">
    <h2 class="text-lg font-semibold">{$T("library.proto_build")}</h2>
    <div class="flex flex-wrap items-start gap-3">
      <Select wrapperClass="w-56" label={{ name: $T("library.proto_header") }} type="buttons" options={headers} value={header} onUpdate={(v) => (header = v)} />
      <Input wrapperClass="w-44" label={{ name: $T("library.proto_argument") }} bind:value={argument} maxlength={31} />
      <Switch wrapperClass="w-32" label={{ name: $T("library.proto_reply") }} value={reply ? 1 : 0} onUpdate={(v) => (reply = !!v)} />
      <Input wrapperClass="w-28" label={{ name: "TrgBusID" }} bind:value={trg} maxlength={6} />
      <Input wrapperClass="w-28" label={{ name: "SrcBusID" }} bind:value={src} maxlength={6} />
    </div>
    <Input type="text-area" textareaRows={3} label={{ name: "Payload" }} bind:value={payloadText} help={{ info: $T("library.proto_payload_hint") }} />
    {#if built.error}
      <p class="text-sm text-(--red-color)">{built.error}</p>
    {:else if built.packet}
      <dl class="grid grid-cols-[8rem_1fr] gap-x-3 gap-y-1 font-mono text-sm break-all">
        <dt class="text-(--muted-color)">HAR</dt>
        <dd>0x{built.har.toString(16).padStart(4, "0").toUpperCase()}</dd>
        <dt class="text-(--muted-color)">Payload</dt>
        <dd>{hex(built.payload) || "F6 (null)"}</dd>
        <dt class="text-(--muted-color)">{$T("library.proto_packet")}</dt>
        <dd>{hex(built.packet)}</dd>
      </dl>
    {/if}
  </section>

  <section class="flex flex-col gap-3 rounded-2xl border border-(--hairline-color) p-4">
    <h2 class="text-lg font-semibold">{$T("library.proto_parse")}</h2>
    <Input type="text-area" textareaRows={3} label={{ name: $T("library.proto_hex") }} bind:value={parseText} />
    {#if parsed.error}
      <p class="text-sm text-(--red-color)">{parsed.error}</p>
    {:else}
      {#each parsed.objects ?? [] as o, i (i)}
        <dl class="grid grid-cols-[8rem_1fr] gap-x-3 gap-y-1 font-mono text-sm break-all">
          <dt class="text-(--muted-color)">TrgBusID</dt>
          <dd>{formatBusId(o.trgBusID)}</dd>
          <dt class="text-(--muted-color)">SrcBusID</dt>
          <dd>{formatBusId(o.srcBusID)}</dd>
          <dt class="text-(--muted-color)">HAR</dt>
          <dd>{o.harText}</dd>
          <dt class="text-(--muted-color)">Payload</dt>
          <dd class="whitespace-pre-wrap">{o.value}</dd>
          <dt class="text-(--muted-color)">CRC16</dt>
          <dd class={o.crcOk ? "" : "text-(--red-color)"}>{formatBusId(o.crc)} {o.crcOk ? "✓" : "✗"}</dd>
        </dl>
      {/each}
    {/if}
  </section>

  <div class="markdown-content text-left text-[15px]">{@html docHtml}</div>
</div>
