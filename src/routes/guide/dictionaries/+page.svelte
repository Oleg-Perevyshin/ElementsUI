<!-- src/routes/guide/dictionaries/+page.svelte - витрина «Словари»: события устройств по группам на текущем языке, команды и типы компонентов GUI с поиском, ниже README словарей -->
<script lang="ts">
  import { Input, Language, Select, T, type IOption } from "#lib"
  import { DEVICE_MESSAGES, MESSAGE_GROUPS } from "#lib/protocols/index.ts"
  import { RenderMarkdown } from "../../common"
  import commandsRaw from "#lib/dictionaries/poe_cmd.yaml?raw"
  import componentsRaw from "#lib/dictionaries/poe_gui.yaml?raw"
  import readmeRaw from "#lib/dictionaries/README.md?raw"

  type Lang = "ru" | "en" | "zh"
  const lang = $derived(($Language === "en" || $Language === "zh" ? $Language : "ru") as Lang)

  let view = $state("messages")
  const views: IOption<string>[] = $derived([
    { id: "messages", value: "messages", name: $T("library.dict_messages") },
    { id: "commands", value: "commands", name: $T("library.dict_commands") },
    { id: "components", value: "components", name: $T("library.dict_components") },
  ])
  let query = $state("")
  const q = $derived(query.trim().toLowerCase())

  /* Команды: строки «- [Строка, Enum, Код] # описание» мастер-словаря, описание - комментарий справа */
  const commands = commandsRaw
    .split("\n")
    .map((line) => /^- \[(\w+),\s*(\w+),\s*(\d+)\]\s*(?:#\s*(.*))?$/.exec(line.trim()))
    .filter((m): m is RegExpExecArray => !!m)
    .map((m) => ({ name: m[1], c: m[2], code: Number(m[3]), note: m[4] ?? "" }))
  /* Компоненты GUI: «- [Тип, обмен] # описание» */
  const components = componentsRaw
    .split("\n")
    .map((line) => /^- \[(\w+),\s*(\w+)\]\s*(?:#\s*(.*))?$/.exec(line.trim()))
    .filter((m): m is RegExpExecArray => !!m)
    .map((m) => ({ type: m[1], io: m[2], note: m[3] ?? "" }))

  const levelClass = { info: "text-(--green-color)", warn: "text-(--yellow-color)", error: "text-(--red-color)" }
  const groups = $derived(
    Object.entries(MESSAGE_GROUPS)
      .map(([group, g]) => ({
        group,
        title: `${group} ${g.from}-${g.to}: ${g[lang]}`,
        rows: Object.entries(DEVICE_MESSAGES)
          .filter(([, m]) => m.group === group)
          .map(([code, m]) => ({ code: Number(code), name: `MSG_${m.name}`, level: m.level, text: m[lang] || m.en }))
          .filter((r) => !q || `${r.code} ${r.name} ${r.text}`.toLowerCase().includes(q)),
      }))
      .filter((g) => g.rows.length),
  )
  const commandRows = $derived(commands.filter((r) => !q || `${r.code} ${r.name} ${r.c} ${r.note}`.toLowerCase().includes(q)))
  const componentRows = $derived(components.filter((r) => !q || `${r.type} ${r.io} ${r.note}`.toLowerCase().includes(q)))
  const total = $derived(view === "messages" ? groups.reduce((n, g) => n + g.rows.length, 0) : view === "commands" ? commandRows.length : componentRows.length)

  let readmeHtml = $state("")
  $effect(() => {
    RenderMarkdown(readmeRaw).then((html) => (readmeHtml = html))
  })
</script>

<div class="mx-auto flex w-full max-w-6xl flex-col gap-4">
  <div class="flex flex-wrap items-end gap-3">
    <Select wrapperClass="w-full max-w-md" type="buttons" options={views} value={view} onUpdate={(v) => (view = v)} />
    <Input wrapperClass="w-72" bind:value={query} placeholder={$T("library.dict_search")} maxlength={40} />
    <span class="pb-2 text-sm text-(--muted-color)">{$T("library.dict_count", { n: total })}</span>
  </div>

  <!-- Код, имя и константа в одну строку, переносится только текст; не влезает - таблица прокручивается вбок -->
  <div class="markdown-content dict-tables overflow-x-auto text-left text-[14px]">
    {#if view === "messages"}
      {#each groups as g (g.group)}
        <h3>{g.title}</h3>
        <table class="fixed-cols">
          <colgroup><col class="w-20" /><col class="w-96" /><col /></colgroup>
          <thead><tr><th>{$T("library.dict_code")}</th><th>{$T("library.dict_name")}</th><th>{$T("library.dict_text")}</th></tr></thead>
          <tbody>
            {#each g.rows as r (r.code)}
              <tr><td class="nowrap">{r.code}</td><td class="nowrap"><code>{r.name}</code></td><td class={levelClass[r.level]}>{r.text}</td></tr>
            {/each}
          </tbody>
        </table>
      {/each}
    {:else if view === "commands"}
      <table class="fixed-cols">
        <colgroup><col class="w-20" /><col class="w-48" /><col class="w-80" /><col /></colgroup>
        <thead><tr><th>{$T("library.dict_code")}</th><th>{$T("library.dict_name")}</th><th>C</th><th>{$T("library.dict_note")}</th></tr></thead>
        <tbody>
          {#each commandRows as r (r.code)}
            <tr><td class="nowrap">{r.code}</td><td class="nowrap"><code>{r.name}</code></td><td class="nowrap"><code>{r.c}</code></td><td>{r.note}</td></tr>
          {/each}
        </tbody>
      </table>
    {:else}
      <table class="fixed-cols">
        <colgroup><col class="w-48" /><col class="w-32" /><col /></colgroup>
        <thead><tr><th>{$T("library.dict_type")}</th><th>{$T("library.dict_io")}</th><th>{$T("library.dict_note")}</th></tr></thead>
        <tbody>
          {#each componentRows as r (r.type)}
            <tr><td class="nowrap"><code>{r.type}</code></td><td class="nowrap">{r.io}</td><td>{r.note}</td></tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </div>

  <div class="markdown-content text-left text-[15px]">{@html readmeHtml}</div>
</div>

<style>
  /* Одинаковые колонки во всех таблицах: ширины из colgroup, а не по содержимому каждой группы */
  .dict-tables :global(table.fixed-cols) {
    table-layout: fixed;
    width: 100%;
    min-width: 48rem;
  }
  .dict-tables :global(td.nowrap),
  .dict-tables :global(th) {
    white-space: nowrap;
  }
  .dict-tables :global(td.nowrap code) {
    white-space: nowrap;
    word-break: normal;
  }
</style>
