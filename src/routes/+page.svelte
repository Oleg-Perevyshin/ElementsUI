<!-- src/routes/+page.svelte -->
<script lang="ts">
  import * as UI from "$lib"
  import { t } from "$lib/locales/i18n"
  import { fade } from "svelte/transition"
  import Settings from "../appIcons/Settings.svelte"
  import Palette from "../appIcons/Palette.svelte"
  import Library from "$lib/libIcons/Library.svelte"
  import { RenderMarkdown } from "./common"
  import { onMount } from "svelte"

  let isCopied = $state(false)
  const palette = [
    { name: "--back-color", lightColor: "#ffffff", darkColor: "#111827" },
    { name: "--border-color", lightColor: "#b2bbca", darkColor: "#585c63" },
    { name: "--container-color", lightColor: "#f3f4f6", darkColor: "#1f2937" },
    { name: "--field-color", lightColor: "#ecf2fa", darkColor: "#2d3748" },
    { name: "--shadow-color", lightColor: "#34343a", darkColor: "#d4d4d8" },
    { name: "--gray-color", lightColor: "#d1d5db", darkColor: "#374151" },
    { name: "--red-color", lightColor: "#fca5a5", darkColor: "#991b1b" },
    { name: "--orange-color", lightColor: "#fdba74", darkColor: "#c2410c" },
    { name: "--yellow-color", lightColor: "#fde047", darkColor: "#a16207" },
    { name: "--green-color", lightColor: "#86efac", darkColor: "#15803d" },
    { name: "--cyan-color", lightColor: "#67e8f9", darkColor: "#0e7490" },
    { name: "--blue-color", lightColor: "#93c5fd", darkColor: "#1d4ed8" },
    { name: "--purple-color", lightColor: "#d8b4fe", darkColor: "#7e22ce" },
    { name: "--pink-color", lightColor: "#f9a8d4", darkColor: "#be185d" },
  ]

  let renderedContents: string[] = $state([])
  const INFO_FILES = ["info/StyleCSS.txt", "info/ExchangeRules.md", "info/RegExp.md"]

  const renderAllFiles = async () => {
    try {
      renderedContents = await Promise.all(
        INFO_FILES.map(async (filePath) => {
          console.log(filePath)

          const response = await fetch(`/ElementsUI/${filePath}`)
          console.log(response)

          if (!response.ok) throw new Error(`Не удалось загрузить ${filePath}`)
          const textData = await response.text()
          if (filePath.slice(-3) === ".md") {
            return await RenderMarkdown(textData)
          } else return textData
        }),
      )
    } catch (error) {
      console.error("Ошибка при рендеринге Markdown-файлов:", error)
      renderedContents = INFO_FILES.map(() => "<p>Ошибка при рендеринге содержимого.</p>")
    }
  }

  onMount(() => {
    renderAllFiles()
  })
</script>

<h1>Добро пожаловать</h1>
<p>Это библиотека UI компонентов и примитивов для Svelte</p>
<p>
  Посетите тестовый ресурс <a href="https://cloud-dev.poe-gw.keenetic.pro/" target="_blank">PAS Cloud</a> для просмотра компонентов в использовании
</p>

<UI.Accordion wrapperClass="mt-10" label={{ name: $t("library.setting"), icon: Settings }}
  ><p class="text-left">
    Для корректного отображения компонентов и использования встроенной цветовой палитры, добавьте следующие переменные в ваш файл app.css или в глобальный файл
    стилей вашего приложения:
  </p>
  <div class="relative h-100">
    <pre class=" h-full overflow-y-auto bg-(--blue-color)/10!">
{@html renderedContents[0]}</pre>
    <button
      class="absolute top-2 right-3 flex cursor-pointer border-none bg-transparent"
      onclick={(e) => {
        e.preventDefault()
        navigator.clipboard.writeText(renderedContents[0])
        isCopied = true
        setTimeout(() => (isCopied = false), 1000)
      }}
      aria-label="Копировать текст"
    >
      <div class=" size-6 text-sm [&_svg]:h-full [&_svg]:max-h-full [&_svg]:w-full [&_svg]:max-w-full">
        {#if isCopied}
          <div
            class="right-1..5 absolute top-1/2 -translate-y-1/2 transform rounded-md bg-(--green-color) px-1.5 py-1 shadow-lg"
            transition:fade={{ duration: 200 }}
          >
            ✓
          </div>
        {:else}
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
            <g fill="none" stroke="currentColor" stroke-width="1.5">
              <path
                d="M6 11c0-2.828 0-4.243.879-5.121C7.757 5 9.172 5 12 5h3c2.828 0 4.243 0 5.121.879C21 6.757 21 8.172 21 11v5c0 2.828 0 4.243-.879 5.121C19.243 22 17.828 22 15 22h-3c-2.828 0-4.243 0-5.121-.879C6 20.243 6 18.828 6 16z"
              />
              <path d="M6 19a3 3 0 0 1-3-3v-6c0-3.771 0-5.657 1.172-6.828S7.229 2 11 2h4a3 3 0 0 1 3 3" />
            </g>
          </svg>
        {/if}
      </div>
    </button>
  </div>
</UI.Accordion>

<UI.Accordion wrapperClass="mt-2" label={{ name: $t("library.palette"), icon: Palette }} isOpen={false}>
  <div class="grid grid-cols-5 justify-center">
    <!-- Заголовки -->
    <div class="col-span-2 col-start-2 border-l border-(--border-color) font-semibold">Светлая тема</div>
    <div class="col-span-2 border-l border-(--border-color) font-semibold">Темная тема</div>

    {#each palette as color}
      <div class="border-t border-(--border-color) py-2">{color.name}</div>

      <div class="border-x border-t border-(--border-color)" style="background-color: {color.lightColor};"></div>
      <div class="border-t border-(--border-color) py-2">{color.lightColor}</div>

      <div class="border-x border-t border-(--border-color)" style="background-color: {color.darkColor};"></div>
      <div class="border-t border-(--border-color) py-2">{color.darkColor}</div>
    {/each}
  </div>
</UI.Accordion>

<UI.Accordion wrapperClass="mt-2" label={{ name: $t("library.regexp"), icon: Library }} isOpen={false}>
  <div class="text-left justify-center">{@html renderedContents[2]}</div>
</UI.Accordion>
