<!-- src/routes/guide/protocol/+page.svelte - витрина «Протокол»: песочница пакета poe_cbor_pkt - сборка из нескольких записей (кнопки + и -), вид пакета в YAML, разбор hex обратно и PROTOCOL.md -->
<script lang="ts">
  import { Button, IconAdd, IconDelete, Input, Select, Switch, T, type IOption } from "#lib"
  import {
    BUS_ID_REGEXP,
    HEADER_CODES,
    cborToValue,
    decodeHar,
    decodePacket,
    encodeHar,
    encodePacket,
    formatBusId,
    formatXPoeDebugValue,
    parseBusId,
    xPoeDebugValueFromText,
  } from "#lib/protocols/index.ts"
  import { RenderMarkdown } from "../../common"
  import protocolRaw from "#lib/protocols/PROTOCOL.md?raw"

  const headers: IOption<string>[] = Object.keys(HEADER_CODES).map((name) => ({ id: name, value: name, name }))

  /* Запись пакета: получатель, отправитель, команда и Payload в YAML, как поле Value консоли */
  type Draft = { id: number; header: string; argument: string; reply: boolean; trg: string; src: string; payload: string }
  let nextId = 3
  let drafts = $state<Draft[]>([
    { id: 1, header: "GET", argument: "ModCfg", reply: true, trg: "0001", src: "0000", payload: "CfgGroup: CFG" },
    { id: 2, header: "SET", argument: "ModCfg", reply: false, trg: "0002", src: "0000", payload: 'CFG.DevName: "Pump-2", CFG.Power: [255, 0, 0]' },
  ])
  /* Примеры Payload для подсказки: текст поля и ключ пояснения */
  const PAYLOAD_FORMATS = [
    { text: "CFG.Mode: 3", key: "library.proto_fmt_map" },
    { text: 'CFG.Mode: 3, CFG.DevName: "Pump-2"', key: "library.proto_fmt_map_many" },
    { text: '{"CFG.Mode": 3}', key: "library.proto_fmt_map_braces" },
    { text: "CFG.Color: [255, 0, 0]", key: "library.proto_fmt_array" },
    { text: "12", key: "library.proto_fmt_number" },
    { text: '"12"', key: "library.proto_fmt_string" },
    { text: "true", key: "library.proto_fmt_bool" },
    { text: "Data: h'0A1B'", key: "library.proto_fmt_bytes" },
    { text: "0xA1616101", key: "library.proto_fmt_raw" },
    { text: "", key: "library.proto_fmt_empty" },
  ]

  const addDraft = () => {
    const last = drafts.at(-1)
    drafts.push({
      id: nextId++,
      header: last?.header ?? "GET",
      argument: last?.argument ?? "ModInfo",
      reply: true,
      trg: last?.trg ?? "0001",
      src: last?.src ?? "0000",
      payload: "",
    })
  }
  const removeDraft = (id: number) => (drafts = drafts.filter((d) => d.id !== id))

  /* Колонки строки записи: номер, заголовок, аргумент, ответ, получатель, отправитель, Payload, кнопка */
  const ROW_GRID = "grid-cols-[1.5rem_6rem_10rem_3rem_5.5rem_5.5rem_minmax(0,1fr)_2rem]"

  const hex = (bytes: Uint8Array) => Array.from(bytes, (b) => b.toString(16).padStart(2, "0").toUpperCase()).join(" ")
  const fromHex = (text: string) => {
    const clean = text.replace(/0x/gi, "").replace(/[^0-9a-f]/gi, "")
    if (clean.length % 2) throw new Error($T("library.proto_hex_odd"))
    return Uint8Array.from(clean.match(/../g) ?? [], (pair) => parseInt(pair, 16))
  }
  const message = (error: unknown) => (error instanceof Error ? error.message : String(error))

  /* Payload в YAML: блок с отступом под ключом Payload, скаляр - в той же строке */
  /* Payload одной строкой - поток YAML, как строка VALUE консоли; карта - в фигурных скобках, раз она вложена в запись */
  const payloadYaml = (bytes: Uint8Array) => {
    if (!bytes.length) return "null"
    const text = formatXPoeDebugValue(cborToValue(bytes), bytes)
    return /^[^"'[{].*: /.test(text) ? `{${text}}` : text
  }
  /* Одна запись пакета в YAML - элемент списка */
  const recordYaml = (o: { trgBusID: number; srcBusID: number; har: number; payload: Uint8Array }, extra = "") => {
    const har = decodeHar(o.har)
    return [
      `- TrgBusID: ${formatBusId(o.trgBusID)}`,
      `  SrcBusID: ${formatBusId(o.srcBusID)}`,
      `  HAR: ${har.header} ${har.argument}${har.reply ? "" : " (NR)"}`,
      `  Payload: ${payloadYaml(o.payload)}`,
      extra,
    ]
      .filter(Boolean)
      .join("\n")
  }

  /* Сборка: каждая запись отдельно (ошибка - у своей записи), пакет - из всех записей без ошибок */
  const records = $derived(
    drafts.map((d) => {
      try {
        if (!BUS_ID_REGEXP.test(d.trg) || !BUS_ID_REGEXP.test(d.src)) throw new Error($T("library.proto_bad_busid"))
        const har = encodeHar(d.header, /^\d+$/.test(d.argument.trim()) ? Number(d.argument) : d.argument.trim(), d.reply)
        return { id: d.id, object: { trgBusID: parseBusId(d.trg), srcBusID: parseBusId(d.src), har, payload: xPoeDebugValueFromText(d.payload) } }
      } catch (error) {
        return { id: d.id, error: message(error) }
      }
    }),
  )
  const built = $derived.by(() => {
    if (records.some((r) => r.error)) return null
    try {
      const objects = records.map((r) => r.object!)
      return { packet: encodePacket(objects), yaml: objects.map((o) => recordYaml(o)).join("\n") }
    } catch (error) {
      return { error: message(error) }
    }
  })

  /* Разбор: hex пакета - записи в YAML с проверкой CRC16 */
  let parseText = $state("")
  let parseTouched = false
  $effect(() => {
    if (!parseTouched && built && "packet" in built && built.packet) parseText = hex(built.packet)
  })
  const parsed = $derived.by(() => {
    try {
      const bytes = fromHex(parseText)
      const result = decodePacket(bytes)
      /* Нет начала пакета 0x9F - возможно, это отдельный Payload (например, из столбца консоли): показать его значение */
      if (result.status === "garbage" && bytes.length) {
        try {
          return { title: $T("library.proto_payload_only"), yaml: `Payload: ${payloadYaml(bytes)}`, bad: false }
        } catch {
          return { error: $T("library.proto_status_garbage") }
        }
      }
      if (result.status !== "complete") return { error: $T(`library.proto_status_${result.status}`) }
      return {
        count: result.objects.length,
        yaml: result.objects.map((o) => recordYaml(o, `  CRC16: ${formatBusId(o.crc)}  # ${o.crcOk ? "✓" : $T("library.proto_crc_bad")}`)).join("\n"),
        bad: result.objects.some((o) => !o.crcOk),
      }
    } catch (error) {
      return { error: message(error) }
    }
  })

  let docHtml = $state("")
  $effect(() => {
    RenderMarkdown(protocolRaw).then((html) => (docHtml = html))
  })
</script>

<div class="mx-auto flex w-full max-w-6xl flex-col gap-4">
  <section class="flex flex-col gap-3 rounded-2xl border border-(--hairline-color) p-4">
    <div class="flex items-center gap-3">
      <h2 class="text-lg font-semibold">{$T("library.proto_build")}</h2>
      <span class="text-[13px] text-(--muted-color)">{$T("library.proto_records_hint")}</span>
    </div>

    <!-- Записи таблицей: одна запись - одна строка, подписи колонок один раз; + добавляет запись, корзина убирает -->
    <div class="overflow-x-auto">
      <div class="grid min-w-[52rem] {ROW_GRID} items-center gap-x-2 gap-y-1.5">
        <span class="text-[11px] font-semibold text-(--muted-color)">#</span>
        <span class="text-[11px] font-semibold text-(--muted-color)">{$T("library.proto_header")}</span>
        <span class="text-[11px] font-semibold text-(--muted-color)">{$T("library.proto_argument")}</span>
        <span class="text-center text-[11px] font-semibold text-(--muted-color)" title={$T("library.proto_reply")}>R</span>
        <span class="text-[11px] font-semibold text-(--muted-color)">TrgBusID</span>
        <span class="text-[11px] font-semibold text-(--muted-color)">SrcBusID</span>
        <span class="text-[11px] font-semibold text-(--muted-color)" title={$T("library.proto_payload_hint")}>Payload (YAML)</span>
        <Button wrapperClass="w-8" content={{ icon: IconAdd, info: { text: $T("library.proto_add"), side: "left" } }} onClick={addDraft} />

        {#each drafts as draft, i (draft.id)}
          {@const record = records[i]}
          <span class="text-center text-[13px] font-semibold text-(--muted-color) tabular-nums">{i + 1}</span>
          <Select options={headers} value={draft.header} onUpdate={(v) => (draft.header = v)} />
          <Input bind:value={draft.argument} maxlength={31} />
          <Switch wrapperClass="w-fit justify-self-center" value={draft.reply ? 1 : 0} onUpdate={(v) => (draft.reply = !!v)} />
          <Input bind:value={draft.trg} maxlength={6} />
          <Input bind:value={draft.src} maxlength={6} />
          <Input bind:value={draft.payload} maxlength={8192} />
          {#if drafts.length > 1}
            <Button
              wrapperClass="w-8"
              variant="primary"
              accent="red"
              content={{ icon: IconDelete, info: { text: $T("library.proto_remove"), side: "left" } }}
              onClick={() => removeDraft(draft.id)}
            />
          {:else}
            <span></span>
          {/if}
          {#if record?.error}
            <p class="col-span-full -mt-1 pl-8 text-[12px] text-(--red-text)">{record.error}</p>
          {/if}
        {/each}
      </div>
    </div>

    <!-- Подсказка по Payload: примеры форматов с пояснениями -->
    <details class="rounded-xl border border-(--hairline-color) px-3 py-2 text-[13px]">
      <summary class="cursor-pointer font-semibold text-(--muted-color)">{$T("library.proto_fmt_title")}</summary>
      <div class="mt-2 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-1">
        {#each PAYLOAD_FORMATS as format (format.text)}
          <code class="w-fit rounded-md bg-(--container-color) px-2 py-0.5 font-mono whitespace-pre select-all">{format.text || "‹›"}</code>
          <span class="text-(--muted-color)">{$T(format.key)}</span>
        {/each}
      </div>
      <p class="mt-2 text-(--orange-text)">⚠ {$T("library.proto_fmt_space")}</p>
    </details>

    {#if built && "error" in built}
      <p class="text-sm text-(--red-text)">{built.error}</p>
    {:else if built}
      <!-- «Что внутри» шире: YAML длиннее строки байтов, пакету хватает четверти -->
      <div class="grid gap-3 lg:grid-cols-[minmax(0,3fr)_minmax(0,1fr)]">
        <div class="flex flex-col gap-1">
          <span class="text-[12px] font-semibold text-(--muted-color)">{$T("library.proto_yaml")}</span>
          <pre class="overflow-x-auto rounded-xl border border-(--hairline-color) bg-(--back-color) p-3 font-mono text-[13px] whitespace-pre">{built.yaml}</pre>
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-[12px] font-semibold text-(--muted-color)">{$T("library.proto_packet")} · {built.packet.length} B</span>
          <pre class="rounded-xl border border-(--hairline-color) bg-(--back-color) p-3 font-mono text-[13px] break-all whitespace-pre-wrap">{hex(
              built.packet,
            )}</pre>
        </div>
      </div>
    {/if}
  </section>

  <section class="flex flex-col gap-3 rounded-2xl border border-(--hairline-color) p-4">
    <h2 class="text-lg font-semibold">{$T("library.proto_parse")}</h2>
    <Input
      type="text-area"
      textareaRows={3}
      maxlength={8192}
      label={{ name: $T("library.proto_hex") }}
      bind:value={parseText}
      onInput={() => (parseTouched = true)}
    />
    {#if parsed.error}
      <p class="text-sm text-(--red-text)">{parsed.error}</p>
    {:else}
      <span class="text-[12px] font-semibold text-(--muted-color)">{parsed.title ?? $T("library.proto_parsed", { n: parsed.count ?? 0 })}</span>
      <pre
        class="overflow-x-auto rounded-xl border border-(--hairline-color) bg-(--back-color) p-3 font-mono text-[13px] whitespace-pre {parsed.bad
          ? 'text-(--red-text)'
          : ''}">{parsed.yaml}</pre>
    {/if}
  </section>

  <div class="markdown-content text-left text-[15px]">{@html docHtml}</div>
</div>
