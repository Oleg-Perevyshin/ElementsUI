<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import { onMount, setContext } from "svelte"
  import "../app.css"
  import * as UI from "$lib/index"
  import IconLightDark from "../appIcons/IconLightDark.svelte"
  import GitHub from "../appIcons/GitHub.svelte"
  import { goto } from "$app/navigation"
  import { page } from "$app/state"
  import { fade } from "svelte/transition"
  import { get } from "svelte/store"
  import { Language, LOCALES, restoreLanguage, setLanguage } from "../lib/locales/i18n"

  let { children } = $props()
  let currentTheme: boolean = $state(true)
  let showLanguageModal = $state(false)
  let currentLanguage = $state(LOCALES.find((lang) => lang.value === get(Language)) ?? LOCALES[0])

  /* Сегмент страницы компонента — точное сравнение, иначе "widget" совпадал бы с "widget-file-system" */
  let activePage = $derived(page.url.pathname.split("/").filter(Boolean)[2] ?? "")

  /* Список всех компонентов — смарт-виджеты идут первыми (тот же принцип, что и в DevCloud'овской палитре конструктора) */
  const menuItems = [
    { page: "widget-wifi", name: "WidgetWiFi" },
    { page: "widget-device-info", name: "WidgetDeviceInfo" },
    { page: "widget-file-system", name: "WidgetFileSystem" },
    { page: "widget-stack-info", name: "WidgetStackInfo" },
    { page: "widget-rgb-strip", name: "WidgetRGBStrip" },
    { page: "widget-pfd", name: "WidgetPFD" },
    { page: "widget-map", name: "WidgetMap" },
    { page: "accordion", name: "Accordion" },
    { page: "button", name: "Button" },
    { page: "carousel", name: "Carousel" },
    { page: "divider", name: "Divider" },
    { page: "file-attach", name: "FileAttach" },
    { page: "graph", name: "Graph" },
    { page: "input", name: "Input" },
    { page: "joystick", name: "Joystick" },
    { page: "period-chart", name: "PeriodChart" },
    { page: "progress-bar", name: "ProgressBar" },
    { page: "select", name: "Select" },
    { page: "slider", name: "Slider" },
    { page: "switch", name: "Switch" },
    { page: "table", name: "Table" },
    { page: "tabs", name: "Tabs" },
    { page: "text-field", name: "TextField" },
    { page: "video-viewer", name: "VideoViewer" },
    { page: "widget", name: "Widget" },
  ]

  /* Переключение темы */
  const switchTheme = () => {
    currentTheme = !currentTheme
    document.body.classList.toggle("dark", !currentTheme)
    document.body.classList.toggle("light", currentTheme)
    localStorage.setItem("AppTheme", currentTheme ? "light" : "dark")
    window.dispatchEvent(new CustomEvent("ThemeChange", { detail: { currentTheme } }))
  }

  /* Переключение языка */
  const switchLanguage = (value: string) => {
    const lang = LOCALES.find((lang) => lang.value === value)
    if (lang) {
      setLanguage(lang.value)
      currentLanguage = lang
      showLanguageModal = false
    }
  }

  /* Закрытие выпадающего списка языков при клике вне его */
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement
    const isClickOutsideLang = !target.closest(".lang-button")
    if (isClickOutsideLang && showLanguageModal) showLanguageModal = false
  }

  let DeviceVariables = $state<{ id: string; value: string; name: string; class: string }[]>([
    { id: crypto.randomUUID(), value: "DevSN", name: "DevSN — Серийный номер устройства", class: "justify-start" },
    { id: crypto.randomUUID(), value: "DevName", name: "DevName — Название устройства", class: "justify-start" },
    { id: crypto.randomUUID(), value: "DevFW", name: "DevFW — Версия прошивки", class: "justify-start" },
  ])

  setContext("DeviceVariables", DeviceVariables)

  onMount(() => {
    const savedTheme = localStorage.getItem("AppTheme") || "light"
    localStorage.setItem("AppTheme", `${savedTheme}`)
    document.body.classList.toggle("dark", savedTheme === "dark")
    document.body.classList.toggle("light", savedTheme === "light")
    currentTheme = savedTheme === "light"

    /* Сохранённый язык — после гидратации (пререндер всегда на языке по умолчанию) */
    restoreLanguage()
    currentLanguage = LOCALES.find((lang) => lang.value === get(Language)) ?? LOCALES[0]

    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  })
</script>

<div class="mx-auto flex h-screen max-w-450 flex-col">
  <!-- Верхняя панель -->
  <header class={"sticky top-0 z-50 m-1 mt-2 flex h-14 items-center justify-between rounded-2xl border border-(--hairline-color) bg-(--back-color) p-4"}>
    <div class="flex items-center gap-2">
      <a href="/ElementsUI/" class="ml-2 no-underline! transition hover:scale-101"><h1>POE-Svelte-UI-Lib</h1></a>
    </div>
    <div class="flex items-center gap-4">
      <div class="relative mx-1 flex h-full items-center" role="button" tabindex="0">
        <UI.Button
          wrapperClass="lang-button w-9"
          componentClass="p-1"
          content={{ icon: currentLanguage.flag }}
          onClick={() => (showLanguageModal = !showLanguageModal)}
        />
        {#if showLanguageModal}
          <div
            class="absolute top-full left-full z-50 w-44 -translate-x-1/2 transform rounded-2xl bg-(--container-color) px-2 shadow-lg"
            transition:fade={{ duration: 250 }}
          >
            {#each LOCALES as lang (lang.value)}
              <UI.Button
                content={{ name: lang.name, icon: lang.flag }}
                componentClass="h-12 border-0 text-center no-underline !shadow-none hover:translate-x-1 hover:shadow-none"
                onClick={() => switchLanguage(lang.value)}
              />
            {/each}
          </div>
        {/if}
      </div>
      <UI.Button componentClass="w-8" content={{ icon: IconLightDark }} onClick={switchTheme} />
      <UI.Button componentClass="w-8" content={{ icon: GitHub }} onClick={() => window.open("https://github.com/Oleg-Perevyshin/ElementsUI", "_blank")} />
    </div>
  </header>

  <div class="mb-2 flex flex-1 overflow-hidden">
    <!-- Панель навигации -->
    <nav class="m-1 flex w-64 flex-col items-start gap-2 overflow-y-auto rounded-2xl border border-(--hairline-color) bg-(--back-color) p-4">
      {#each menuItems as item}
        <div class="flex w-full">
          <UI.Button content={{ name: item.name }} componentClass="h-10  text-left bg-gray" onClick={() => goto(`/ElementsUI/components/${item.page}`)} />
          {#if activePage === item.page}
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"
              ><path
                fill="currentColor"
                d="M12.6 12L8.7 8.1q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l4.6 4.6q.15.15.213.325t.062.375t-.062.375t-.213.325l-4.6 4.6q-.275.275-.7.275t-.7-.275t-.275-.7t.275-.7z"
              /></svg
            >
          {/if}
        </div>
      {/each}
    </nav>
    <!-- Панель контента -->
    <div class="m-1 flex-1 overflow-y-auto rounded-2xl border border-(--hairline-color) bg-(--back-color) p-4">
      {@render children()}
    </div>
  </div>
</div>
