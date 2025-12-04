<!-- src/routes/+page.svelte -->
<script lang="ts">
  import * as UI from '$lib'
  import { fade } from 'svelte/transition'
  import Settings from '../appIcons/Settings.svelte'
  import Palette from '../appIcons/Palette.svelte'

  let isCopied = $state(false)
  const cssStyle = `@import 'tailwindcss';
@source '../node_modules/poe-svelte-ui-lib/dist';
@custom-variant dark (&:where(.dark, .dark *));

:root {
  font-family:
    'Montserrat',
    -apple-system,
    BlinkMacSystemFont,
    segoe ui,
    Roboto,
    helvetica neue,
    Arial,
    noto sans,
    sans-serif,
    apple color emoji,
    segoe ui emoji,
    segoe ui symbol,
    noto color emoji;
  font-optical-sizing: auto;
  font-weight: 450;
  font-style: normal;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  min-width: 640px;
  text-align: center;
  font-size: 13px;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  font-weight: bold;
}
h1 {
  font-size: 1.8rem;
}
h2 {
  font-size: 1.6rem;
}
h3 {
  font-size: 1.4rem;
}
h4 {
  font-size: 1.2rem;
}
h5 {
  font-size: 1rem;
}
h6 {
  font-size: 0.8rem;
}

p {
  margin: 0;
}

label {
  margin: 0;
  font-weight: bold;
}

hr {
  margin: 0.25rem 0;
}

ul,
ol {
  padding-left: 1rem;
  margin: 0.25rem 0;
}
ul {
  list-style: disc;
}
ol {
  list-style: decimal;
}

li {
  margin: 0.25rem 0;
}

blockquote {
  margin: 1rem 0;
  padding-left: 1rem;
  border-left: 4px solid #ccc;
  font-style: italic;
}

pre {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  text-align: left;
  background-color: var(--container-color);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  white-space: pre;
}

code {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  text-align: left;
  background-color: var(--container-color);
  border-radius: 0.5rem;
  white-space: pre;
  font-family: monospace;
}

/* Устранение стилей для ссылок */
a {
  text-decoration: none;
  color: var(--font-color);
}

a:hover {
  text-decoration: underline;
}

input::placeholder {
  opacity: 0.5;
}

/* Стили полосы прокрутки */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background-color: var(--blue-color);
  border-radius: 8px;
  cursor: pointer;
}

/* Цветовая гамма */
.light {
  --back-color: #ffffff; /* Белый */
  --border-color: #b2bbca; /* Светлые серо-голубые границы */
  --container-color: #f3f4f6; /* gray-100 */
  --field-color: #ecf2fa; /*цвет маленьких полей, например полей ввода*/
  --shadow-color: #34343a;

  --gray-color: #d1d5db; /* gray-300 */
  --red-color: #fca5a5; /* red-300 */
  --orange-color: #fdba74; /* orange-300 */
  --yellow-color: #fde047; /* yellow-300 */
  --green-color: #86efac; /* green-300 */
  --cyan-color: #67e8f9; /* cyan-300 */
  --blue-color: #93c5fd; /* blue-300 */
  --purple-color: #d8b4fe; /* purple-300 */
  --pink-color: #f9a8d4; /* pink-300 */
}

.dark {
  --back-color: #111827; /* gray-900 */
  --border-color: #585c63; /* Границы - темный серо-синий */
  --container-color: #1f2937; /* gray-800 */
  --field-color: #2d3748; /*цвет маленьких полей, например полей ввода*/
  --shadow-color: #d4d4d8;

  --gray-color: #374151; /* gray-700 */
  --red-color: #991b1b; /* red-800 */
  --orange-color: #c2410c; /* orange-700 */
  --yellow-color: #a16207; /* yellow-600 */
  --green-color: #15803d; /* green-700 */
  --cyan-color: #0e7490; /* cyan-700 */
  --blue-color: #1d4ed8; /* blue-600 */
  --purple-color: #7e22ce; /* purple-700 */
  --pink-color: #be185d; /* pink-700 */
}

.bg-max {
  --bg-color: var(--back-color);
}
.bg-gray {
  --bg-color: var(--gray-color);
}
.bg-red {
  --bg-color: var(--red-color);
}
.bg-orange {
  --bg-color: var(--orange-color);
}
.bg-yellow {
  --bg-color: var(--yellow-color);
}
.bg-green {
  --bg-color: var(--green-color);
}
.bg-cyan {
  --bg-color: var(--cyan-color);
}
.bg-blue {
  --bg-color: var(--blue-color);
}
.bg-purple {
  --bg-color: var(--purple-color);
}
.bg-pink {
  --bg-color: var(--pink-color);
}

.border-max {
  --border-color: var(--back-color);
}
.border-gray {
  --border-color: var(--gray-color);
}
.border-white {
  --border-color: var(--white-color);
}
.border-red {
  --border-color: var(--red-color);
}
.border-orange {
  --border-color: var(--orange-color);
}
.border-yellow {
  --border-color: var(--yellow-color);
}
.border-green {
  --border-color: var(--green-color);
}
.border-cyan {
  --border-color: var(--cyan-color);
}
.border-blue {
  --border-color: var(--blue-color);
}
.border-purple {
  --border-color: var(--purple-color);
}
.border-pink {
  --border-color: var(--pink-color);
}`
  const palette = [
    { name: '--back-color', lightColor: '#ffffff', darkColor: '#111827' },
    { name: '--border-color', lightColor: '#b2bbca', darkColor: '#585c63' },
    { name: '--container-color', lightColor: '#f3f4f6', darkColor: '#1f2937' },
    { name: '--field-color', lightColor: '#ecf2fa', darkColor: '#2d3748' },
    { name: '--shadow-color', lightColor: '#34343a', darkColor: '#d4d4d8' },
    { name: '--gray-color', lightColor: '#d1d5db', darkColor: '#374151' },
    { name: '--red-color', lightColor: '#fca5a5', darkColor: '#991b1b' },
    { name: '--orange-color', lightColor: '#fdba74', darkColor: '#c2410c' },
    { name: '--yellow-color', lightColor: '#fde047', darkColor: '#a16207' },
    { name: '--green-color', lightColor: '#86efac', darkColor: '#15803d' },
    { name: '--cyan-color', lightColor: '#67e8f9', darkColor: '#0e7490' },
    { name: '--blue-color', lightColor: '#93c5fd', darkColor: '#1d4ed8' },
    { name: '--purple-color', lightColor: '#d8b4fe', darkColor: '#7e22ce' },
    { name: '--pink-color', lightColor: '#f9a8d4', darkColor: '#be185d' },
  ]
</script>

<h1>Добро пожаловать</h1>
<p>Это библиотека UI компонентов и примитивов для Svelte</p>
<p>
  Посетите тестовый ресурс <a href="https://cloud-dev.poe-gw.keenetic.pro/" target="_blank">PAS Cloud</a> для просмотра компонентов в использовании
</p>

<UI.Accordion wrapperClass="mt-10" label={{ name: 'Настройка', icon: Settings }}
  ><p>
    Для корректного отображения компонентов и использования встроенной цветовой палитры, добавьте следующие переменные в ваш файл app.css или в
    глобальный файл стилей вашего приложения:
  </p>
  <div class="relative h-100">
    <pre class=" h-full overflow-y-auto bg-(--blue-color)/10!">
{cssStyle}</pre>
    <button
      class="absolute top-2 right-3 flex cursor-pointer border-none bg-transparent"
      onclick={(e) => {
        e.preventDefault()
        navigator.clipboard.writeText(cssStyle)
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

<UI.Accordion wrapperClass="mt-2" label={{ name: 'Палитра', icon: Palette }} isOpen={false}>
  <div class="grid grid-cols-5 justify-center">
    <!-- Заголовки -->
    <div class="col-span-2 col-start-2 border-l border-(--border-color) font-semibold">Светлая тема</div>
    <div class="col-span-2 border-l border-(--border-color) font-semibold">Темная тема</div>

    {#each palette as color}
      <div class="border-t border-(--border-color) py-2">{color.name}</div>

      <div class="bg-[{color.lightColor}] border-x border-t border-(--border-color)"></div>
      <div class="border-t border-(--border-color) py-2">{color.lightColor}</div>

      <div class="bg-[{color.darkColor}] border-x border-t border-(--border-color)"></div>
      <div class="border-t border-(--border-color) py-2">{color.darkColor}</div>
    {/each}
  </div>
</UI.Accordion>
