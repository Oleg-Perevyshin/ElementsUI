<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import { onMount } from 'svelte'
  import '../app.css'
  import * as UI from '$lib/index'
  import IconLightDark from '../appIcons/IconLightDark.svelte'
  import GitHub from '../appIcons/GitHub.svelte'
  import { goto } from '$app/navigation'
  import { page } from '$app/state'

  let { children } = $props()
  let currentTheme: boolean = $state(true)

  let activePage = $derived(page.url.pathname)

  /* Список всех компонентов */
  const menuItems = [
    { page: 'all', name: 'ALL in ONE' },
    { page: 'accordion', name: 'Accordion' },
    { page: 'button', name: 'Button' },
    { page: 'color-picker', name: 'ColorPicker' },
    { page: 'file-attach', name: 'FileAttach' },
    { page: 'graph', name: 'Graph' },
    { page: 'input', name: 'Input' },
    { page: 'joystick', name: 'Joystick' },
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
    document.body.classList.toggle('dark', !currentTheme)
    document.body.classList.toggle('light', currentTheme)
    localStorage.setItem('AppTheme', currentTheme ? 'light' : 'dark')
  }

  onMount(() => {
    const savedTheme = localStorage.getItem('AppTheme') || 'light'
    localStorage.setItem('AppTheme', `${savedTheme}`)
    document.body.classList.toggle('dark', savedTheme === 'dark')
    document.body.classList.toggle('light', savedTheme === 'light')
    currentTheme = savedTheme === 'light'
  })
</script>

<div class="mx-auto flex h-screen max-w-[1400px] flex-col">
  <!-- Верхняя панель -->
  <header class={'sticky top-0 z-50 m-1 mt-2 flex items-center justify-between rounded-xl border border-(--border-color) bg-(--back-color)/50 p-4'}>
    <div class="flex items-center gap-2">
      <a href="/ElementsUI/" class="ml-2 no-underline! transition hover:scale-101"><h1>POE-Svelte-UI-Lib</h1></a>
    </div>
    <div class="flex items-center gap-6">
      <UI.Button componentClass="w-8" content={{ icon: IconLightDark }} onClick={switchTheme} />
      <UI.Button
        componentClass="w-8"
        content={{ icon: GitHub }}
        onClick={() => window.open('https://github.com/Oleg-Perevyshin/ElementsUI', '_blank')}
      />
    </div>
  </header>

  <div class="mb-2 flex flex-1 overflow-hidden">
    <!-- Панель навигации -->
    <nav class="m-1 flex w-64 flex-col items-start gap-2 overflow-y-auto rounded-xl border border-(--border-color) bg-(--back-color)/50 p-4">
      {#each menuItems as item}
        <div class="flex w-full">
          <UI.Button
            content={{ name: item.name }}
            componentClass="h-10  text-left {item.page === 'all' ? '' : 'bg-gray'}"
            onClick={() => goto(`/ElementsUI/components/${item.page}`)}
          />
          {#if activePage.startsWith(`/ElementsUI/components/${item.page}`)}
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
    <div class="m-1 flex-1 overflow-y-auto rounded-xl border border-(--border-color) bg-(--back-color)/50 p-4">
      {@render children()}
    </div>
  </div>
</div>

<style>
  /* Стили для светлой темы */
  :global(body.light) {
    color: #333; /* Цвет текста для светлой темы */
    background: radial-gradient(circle, rgba(255, 221, 192, 1) 0%, rgba(215, 204, 208, 1) 67%, rgba(130, 205, 224, 1) 100%);
  }

  /* Стили для темной темы */
  :global(body.dark) {
    color: #e2e3e7; /* Цвет текста для темной темы */
    background: radial-gradient(circle, rgba(43, 88, 118, 1) 0%, rgba(53, 56, 110, 1) 71%, rgba(78, 67, 118, 1) 100%);
  }
</style>
