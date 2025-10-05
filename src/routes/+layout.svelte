<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import { onMount } from 'svelte'
  import '../app.css'
  import * as UI from '$lib/index'
  import IconLightDark from '../appIcons/IconLightDark.svelte'
  import GitHub from '../appIcons/GitHub.svelte'
  import { goto } from '$app/navigation'

  let { children } = $props()
  let currentTheme: boolean = $state(true)

  /* Список всех компонентов */
  const menuItems = [
    { page: 'accordion', name: 'Accordion' },
    { page: 'button', name: 'Button' },
    { page: 'color-picker', name: 'ColorPicker' },
    { page: 'file-attach', name: 'FileAttach' },
    { page: 'graph', name: 'Graph' },
    { page: 'input', name: 'Input' },
    { page: 'progress-bar', name: 'ProgressBar' },
    { page: 'select', name: 'Select' },
    { page: 'slider', name: 'Slider' },
    { page: 'switch', name: 'Switch' },
    { page: 'table', name: 'Table' },
    { page: 'text-field', name: 'TextField' },
  ]

  /* Переключение темы */
  const switchTheme = () => {
    currentTheme = !currentTheme
    document.body.classList.toggle('dark-theme', !currentTheme)
    document.body.classList.toggle('light-theme', currentTheme)
    localStorage.setItem('AppTheme', currentTheme ? 'light' : 'dark')
  }

  onMount(() => {
    const savedTheme = localStorage.getItem('AppTheme') || 'light'
    localStorage.setItem('AppTheme', `${savedTheme}`)
    document.body.classList.toggle('dark-theme', savedTheme === 'dark')
    document.body.classList.toggle('light-theme', savedTheme === 'light')
    currentTheme = savedTheme === 'light'
  })
</script>

<div class="flex flex-col mx-auto h-screen max-w-[1400px]">
  <!-- Верхняя панель -->
  <header class={'bg-[var(--back-color)]/50 rounded-xl m-1 mt-2 p-4 border border-[var(--border-color)] flex items-center justify-between sticky top-0 z-50'}>
    <div class="flex items-center gap-2">
      <a href="/ElementsUI/" class="!no-underline ml-2 hover:scale-101 transition"><h1>POE-Svelte-UI-Lib</h1></a>
    </div>
    <div class="flex items-center gap-4">
      <UI.Button wrapperClass="!w-12" icon={{ component: IconLightDark }} componentClass=" border-none " onClick={switchTheme} />
      <UI.Button
        wrapperClass="!w-auto"
        icon={{ component: GitHub }}
        componentClass=" border-none "
        onClick={() => window.open('https://github.com/Oleg-Perevyshin/ElementsUI', '_blank')}
      />
    </div>
  </header>

  <div class="flex flex-1 overflow-hidden mb-2">
    <!-- Панель навигации -->
    <nav class="flex flex-col items-start gap-2 m-1 p-4 bg-[var(--back-color)]/50 w-64 overflow-y-auto rounded-xl border border-[var(--border-color)]">
      <UI.Button name="ALL in ONE" componentClass="h-10 text-left" onClick={() => goto(`/ElementsUI/components/all`)} />
      {#each menuItems as item}
        <UI.Button name={item.name} componentClass="h-10 bg-gray text-left" onClick={() => goto(`/ElementsUI/components/${item.page}`)} />
      {/each}
    </nav>
    <!-- Панель контента -->
    <div class="flex-1 m-1 p-4 bg-[var(--back-color)]/50 overflow-y-auto border rounded-xl border-[var(--border-color)]">
      {@render children()}
    </div>
  </div>
</div>

<style>
  /* Стили для светлой темы */
  :global(body.light-theme) {
    color: #333; /* Цвет текста для светлой темы */
    background: radial-gradient(circle, rgba(255, 221, 192, 1) 0%, rgba(215, 204, 208, 1) 67%, rgba(130, 205, 224, 1) 100%);
  }

  /* Стили для темной темы */
  :global(body.dark-theme) {
    color: #e2e3e7; /* Цвет текста для темной темы */
    background: radial-gradient(circle, rgba(43, 88, 118, 1) 0%, rgba(53, 56, 110, 1) 71%, rgba(78, 67, 118, 1) 100%);
  }
</style>
