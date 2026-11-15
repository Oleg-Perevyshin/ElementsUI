<!-- src/routes/guide/gui/+page.svelte - витрина «GUI устройства»: GUIRenderer рисует пример или свой файл GUI (YAML, .yaml.gz из каталога DevCloud), команды уходят в имитацию устройства и видны в журнале -->
<script lang="ts">
  import { SvelteMap } from "svelte/reactivity"
  import { load } from "js-yaml"
  import { Button, GUI_VIEWS, GUIRenderer, T, type DeviceLink, type UIComponent, type UIType } from "#lib"
  import { createComponent } from "#lib/constructor.ts"
  import { decodeHar } from "#lib/protocols/index.ts"
  import { RenderMarkdown } from "../../common"
  import readmeRaw from "../../../../README.md?raw"

  /* Пример: по одному компоненту каждого вида в сетке 23 колонки, значения отвечает имитация устройства */
  const sample = (): UIComponent[] => {
    const list: UIComponent[] = []
    let row = 1
    const add = <K extends UIType>(type: K, col: number, patch: Record<string, unknown>, newRow = false, width = 7) => {
      const c = createComponent(type, { col, row })
      Object.assign(c.properties as Record<string, unknown>, patch)
      c.position.width = width
      /* Команда как из конструктора: SET ModCfg со своей переменной */
      const id = (c.properties as { id?: string }).id
      if (id?.includes(".")) c.eventHandler = { Header: "SET", Argument: "ModCfg", Variables: [id] }
      list.push(c as UIComponent)
      if (newRow) row += c.position.height
    }
    add("TextField", 1, { content: { name: $T("library.gui_sample_title"), class: "text-center", size: "large" }, background: true }, true, 23)
    add("Input", 1, { id: "CFG.DevName", label: { name: $T("library.gui_sample_name") } })
    add("Select", 9, {
      id: "APP.Mode",
      label: { name: $T("library.gui_sample_mode") },
      type: "buttons",
      options: [0, 1, 2].map((v) => ({ id: String(v), value: v, name: `${$T("library.gui_sample_mode")} ${v}` })),
    })
    add("Switch", 17, { id: "APP.Relay", label: { name: $T("library.gui_sample_relay") } }, true)
    add("Slider", 1, { id: "APP.Level", label: { name: $T("library.gui_sample_level") }, number: { minNum: 0, maxNum: 100, step: 5 } }, false, 15)
    add("Button", 17, { content: { name: $T("library.gui_sample_restart") } }, true)
    list[list.length - 1].eventHandler = { Header: "SET", Argument: "Restart", Variables: [] }
    add("WidgetDeviceInfo", 1, { collapsed: false }, true, 23)
    return list
  }

  let components: UIComponent[] = $state(sample())
  let source = $state("")
  let error = $state("")

  /* Имитация устройства: значения переменных, SET записывает Payload и отвечает OK! */
  const values = new SvelteMap<string, unknown>([
    ["CFG.DevSN", "0001-000000000000000000000001:5A3C"],
    ["CFG.DevName", "Demo"],
    ["CFG.DevFW", 101],
    ["CFG.RunCnt", 42],
    ["APP.Mode", 1],
    ["APP.Relay", 0],
    ["APP.Level", 30],
  ])
  let journal: string[] = $state([])
  const flatten = (prefix: string, value: unknown, out: [string, unknown][]) => {
    if (value && typeof value === "object" && !Array.isArray(value)) for (const [k, v] of Object.entries(value)) flatten(prefix ? `${prefix}.${k}` : k, v, out)
    else out.push([prefix, value])
    return out
  }
  const link: DeviceLink = {
    get: (key) => values.get(key),
    set: (key, value) => values.set(key, value),
    send: (har, payload) => {
      const { header, argument } = decodeHar(har)
      journal = [`${header} ${argument} ${JSON.stringify(payload)}`, ...journal].slice(0, 30)
      if (header === "SET") for (const [k, v] of flatten("", payload, [])) values.set(k, v)
    },
    waitFor: async () => null,
  }

  /* Свой файл: YAML { metadata, components } как сохраняет конструктор, сжатый gzip или нет */
  const open = async (file: File) => {
    error = ""
    try {
      let bytes = new Uint8Array(await file.arrayBuffer())
      if (bytes[0] === 0x1f && bytes[1] === 0x8b)
        bytes = new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"))).arrayBuffer())
      const data = load(new TextDecoder().decode(bytes)) as { components?: UIComponent[] } | null
      if (!data || !Array.isArray(data.components)) throw new Error($T("library.gui_not_gui"))
      components = data.components
      source = file.name
    } catch (e) {
      error = e instanceof Error ? e.message : String(e)
    }
  }
  let fileInput: HTMLInputElement | undefined = $state()

  /* Описание - раздел «GUI устройства» README библиотеки */
  let docHtml = $state("")
  $effect(() => {
    const start = readmeRaw.indexOf("## 🖥️ GUI устройства")
    const end = readmeRaw.indexOf("\n## ", start + 4)
    RenderMarkdown(start < 0 ? "" : readmeRaw.slice(start, end < 0 ? undefined : end)).then((html) => (docHtml = html))
  })
</script>

<div class="mx-auto flex w-full max-w-6xl flex-col gap-4">
  <div class="flex flex-wrap items-center gap-3">
    <Button wrapperClass="w-auto" variant="secondary" content={{ name: $T("library.gui_open") }} onClick={() => fileInput?.click()} />
    <Button
      wrapperClass="w-auto"
      variant="plain"
      content={{ name: $T("library.gui_sample") }}
      onClick={() => {
        components = sample()
        source = ""
        error = ""
      }}
    />
    <span class="text-sm text-(--muted-color)">{source || $T("library.gui_sample")} · {$T("library.gui_hint")}</span>
    <input
      bind:this={fileInput}
      type="file"
      accept=".yaml,.yml,.gz"
      class="hidden"
      onchange={(e) => {
        const f = (e.currentTarget as HTMLInputElement).files?.[0]
        if (f) open(f)
        ;(e.currentTarget as HTMLInputElement).value = ""
      }}
    />
  </div>
  {#if error}<p class="text-sm text-(--red-color)">{error}</p>{/if}

  <div class="grid gap-4 lg:grid-cols-[1fr_18rem]">
    <div class="rounded-2xl border border-(--hairline-color) p-3">
      {#key components}
        <GUIRenderer {components} {link} views={GUI_VIEWS} onError={(text) => (error = text)} />
      {/key}
    </div>
    <div class="flex flex-col gap-2 rounded-2xl border border-(--hairline-color) p-3">
      <h3 class="text-sm font-semibold">{$T("library.gui_journal")}</h3>
      {#each journal as line, i (i)}
        <code class="text-xs break-all">{line}</code>
      {:else}
        <span class="text-sm text-(--muted-color)">{$T("library.gui_journal_empty")}</span>
      {/each}
    </div>
  </div>

  <div class="markdown-content text-left text-[15px]">{@html docHtml}</div>
</div>
