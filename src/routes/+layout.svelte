<script lang="ts">
  import { onMount } from 'svelte'
  import '../app.css'
  import * as UI from '$lib/index'
  import Menu from '../appIcons/Menu.svelte'
  import IconLightDark from '../appIcons/IconLightDark.svelte'
  import GitHub from '../appIcons/GitHub.svelte'
  import { goto } from '$app/navigation'

  let { children } = $props()
  let currentTheme: boolean = $state(true)
  let sidebarOpen: boolean = $state(false)

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
  function toggleTheme() {
    currentTheme = !currentTheme
    document.body.classList.toggle('dark-theme', !currentTheme)
    document.body.classList.toggle('light-theme', currentTheme)
    localStorage.setItem('AppTheme', currentTheme ? 'light' : 'dark')
  }

  /* Видимость меню */
  const toggleSideBar = () => {
    sidebarOpen = !sidebarOpen
  }

  onMount(() => {
    const savedTheme = localStorage.getItem('AppTheme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark-theme' : 'light-theme')
    document.body.classList.toggle('dark-theme', savedTheme === 'dark')
    document.body.classList.toggle('light-theme', savedTheme === 'light')
    currentTheme = savedTheme === 'light'
  })
</script>

<div class="mx-auto h-screen max-w-[1400px]">
  <header
    class={`${currentTheme ? 'bg-[#cbcec7]' : 'bg-[#181d13]'} border rounded-3xl m-2 border-[var(--border-color)] p-4 flex items-center justify-between sticky top-0 z-50`}
  >
    <div class="flex items-center gap-2">
      <UI.Button onClick={toggleSideBar} wrapperClass="!w-10" icon={{ component: Menu }} componentClass="border-none bg-stone-400/50 md:hidden" />
      <h1 class="text-xl font-bold">POE-Svelte-UI-Lib</h1>
    </div>
    <div class="flex items-center gap-4">
      <UI.Button wrapperClass="!w-12" icon={{ component: IconLightDark }} componentClass=" border-none " onClick={toggleTheme} />
      <UI.Button
        wrapperClass="!w-auto"
        icon={{ component: GitHub }}
        componentClass=" border-none "
        onClick={() => window.open('https://github.com/Oleg-Perevyshin/ElementsUI', '_blank')}
      />
    </div>
  </header>

  <div class="flex">
    <aside
      class={`${currentTheme ? 'bg-[#cbcec7]' : 'bg-[#181d13]'} text-[var(--font-color)] w-64 min-h-[calc(100vh-4rem)] fixed md:static z-40 transform 
      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 border rounded-3xl m-2 border-[var(--border-color)]`}
    >
      <nav class="flex flex-col items-start mt-3 gap-2">
        <ul>
          {#each menuItems as item}
            <UI.Button
              wrapperClass="!w-auto"
              name={item.name}
              componentClass=" border-none text-left text-lg"
              onClick={() => goto(`components/${item.page}`)}
            />
          {/each}
        </ul>
      </nav>
    </aside>
    <div class="w-full m-2">
      {@render children()}
    </div>
  </div>
</div>

<style>
  /* Стили для светлой темы */
  :global(body.light-theme) {
    color: #333; /* Цвет текста для светлой темы */
    background: #d8dbd4;
  }

  /* Стили для темной темы */
  :global(body.dark-theme) {
    color: #e2e3e7; /* Цвет текста для темной темы */
    background: #1d2218;
  }
</style>
