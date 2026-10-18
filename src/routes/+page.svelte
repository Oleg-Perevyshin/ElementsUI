<!-- src/routes/+page.svelte — главная витрины: вкладки «Обзор» (README библиотеки — тот же текст, что на npm и в репозитории),
     «Тема» (предпросмотр theme.css на типовом интерфейсе облака) и «Регулярные выражения» (справочник для проверки полей ввода) -->
<script lang="ts">
  import { Select, T, type IOption } from "$lib"
  import { RenderMarkdown } from "./common"
  import ThemePreview from "./ThemePreview.svelte"
  import readmeRaw from "../../README.md?raw"
  import regexpRaw from "./RegExp.md?raw"

  let tabs: IOption<string>[] = $derived([
    { id: "overview", value: "overview", name: $T("library.overview") },
    { id: "theme", value: "theme", name: $T("library.theme") },
    { id: "regexp", value: "regexp", name: $T("library.regexp") },
  ])
  let tab = $state("overview")

  let readmeHtml = $state("")
  let regexpHtml = $state("")
  $effect(() => {
    RenderMarkdown(readmeRaw).then((html) => (readmeHtml = html))
    RenderMarkdown(regexpRaw).then((html) => (regexpHtml = html))
  })
</script>

<div class="flex h-full flex-col gap-3">
  <Select
    wrapperClass="w-full max-w-2xl mx-auto shrink-0"
    type="buttons"
    options={tabs}
    value={tabs.find((o) => o.value === tab)}
    onUpdate={(value) => (tab = (value as IOption<string>).value ?? "overview")}
  />
  <div class="min-h-0 flex-1 overflow-y-auto">
    {#if tab === "theme"}
      <ThemePreview />
    {:else}
      <!-- Главная читается как документ: крупнее компактного масштаба .markdown-content (14px), заголовки пропорционально -->
      <div class="markdown-content text-left text-[16px] [&_h1]:text-[1.7rem] [&_h2]:text-[1.35rem] [&_h3]:text-[1.15rem] [&_table]:text-[14px]">
        {@html tab === "regexp" ? regexpHtml : readmeHtml}
      </div>
    {/if}
  </div>
</div>
