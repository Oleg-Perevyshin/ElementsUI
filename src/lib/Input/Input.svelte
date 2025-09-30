<!-- $lib/ElementsUI/Input.svelte -->
<script lang="ts">
  import { onMount } from 'svelte'
  import { fly } from 'svelte/transition'
  import type { IInputProps } from '../types'
  import { t } from '../locales/i18n'

  let {
    id = { name: '', value: crypto.randomUUID() },
    wrapperClass = '',
    label = { name: '', class: '' },
    disabled = false,
    readonly = false,
    value = $bindable(),
    type = 'text',
    autocomplete = 'off',
    componentClass = '',
    maxlength = 100,
    number = { minNum: -1000000, maxNum: 1000000, step: 1 },
    textareaRows = 3,
    copyButton = false,
    regExp = '^[\\s\\S]*$',
    help = { placeholder: '', info: '' },
    onUpdate = () => {},
  }: IInputProps = $props()

  let showPassword = $state(false)
  let showInfo = $state(false)
  let isCopied = $state(false)

  /* Закрытие INFO при клике вне компонента */
  onMount(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.info-container') && !target.closest('.button-info')) {
        showInfo = false
      }
    }
    window.addEventListener('click', handleClickOutside)
    return () => {
      window.removeEventListener('click', handleClickOutside)
    }
  })

  $effect(() => {
    if (type === 'number') {
      if (value === undefined || value === null || value === '') value = number.minNum
    }
  })

  /* Обработка регулярного выражения */
  const parseRegExp = (pattern: string | RegExp): RegExp => {
    if (pattern instanceof RegExp) return pattern
    const match = pattern.match(/^\/(.*)\/([gimsuy]*)$/)
    return match ? new RegExp(match[1], match[2]) : new RegExp(pattern)
  }
  let RegExpObj = $derived(() => parseRegExp(regExp))
  let isValid = $derived(RegExpObj().test(typeof value === 'string' ? value : String(value)))

  const handleInputChange = (value: string | number) => {
    if (type === 'number') {
      const numValue = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : Number(value)
      if (!isNaN(numValue)) onUpdate?.(numValue)
      else onUpdate?.(value as string)
    } else {
      onUpdate?.(value as string)
    }
  }
</script>

<div class="bg-max relative flex w-full flex-col items-center {type === 'text-area' ? 'h-full' : ''} {wrapperClass}">
  {#if label.name}
    <h5 class={`w-full px-4 text-center ${label.class}`}>{label.name}</h5>
  {/if}

  <div class="relative flex w-full items-center {type === 'text-area' ? 'h-full' : ''}">
    {#if type === 'text' || type === 'password' || type === 'number'}
      <input
        bind:value
        class="w-full rounded-2xl border px-4 py-1 text-center transition-all duration-300 outline-none focus:border-blue-400
              [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden
              {isValid ? 'border-[var(--border-color)]' : '!border-red-400 shadow-[0_0_6px_var(--red-color)]'}
              {disabled ? 'opacity-50' : 'hover:shadow-md'} 
              {readonly ? '' : 'hover:shadow-md'}
              {help?.info ? 'pl-8' : ''} 
              {copyButton || type === 'password' || type === 'number' ? 'pr-8' : ''}
              {componentClass}"
        style="background: color-mix(in srgb, var(--bg-color), var(--back-color) 70%);"
        id={id.value}
        placeholder={help?.placeholder}
        {disabled}
        {autocomplete}
        oninput={(e) => handleInputChange((e.currentTarget as HTMLInputElement).value)}
        type={type === 'password' ? (showPassword ? 'text' : 'password') : type === 'number' ? 'number' : 'text'}
        {maxlength}
        min={number?.minNum}
        max={number?.maxNum}
        step={number?.step}
        {readonly}
      />
    {:else if type === 'text-area'}
      <textarea
        bind:value
        class="h-full w-full resize-y rounded-2xl border border-[var(--border-color)] px-2 py-1 text-center font-mono transition-all duration-300 outline-none focus:border-blue-400
            {isValid ? 'border-[var(--border-color)]' : '!border-red-400 shadow-[0_0_6px_var(--red-color)]'}
            {disabled ? 'opacity-50' : 'hover:shadow-md'} 
            {readonly ? '' : 'hover:shadow-md'}
            {help?.info ? 'pl-8' : ''}
            {copyButton ? 'pr-8' : ''}
            {componentClass}"
        style="background: color-mix(in srgb, var(--bg-color), var(--back-color) 70%);"
        id={id.value}
        {disabled}
        {maxlength}
        rows={textareaRows}
        placeholder={help?.placeholder}
        {readonly}
        oninput={(e) => handleInputChange((e.currentTarget as HTMLTextAreaElement).value)}
      ></textarea>
    {/if}

    {#if type === 'password' && !disabled}
      <button
        type="button"
        class="absolute right-2 flex cursor-pointer border-none bg-transparent"
        onclick={() => (showPassword = !showPassword)}
        aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
      >
        {#if showPassword}
          <svg xmlns="http://www.w3.org/2000/svg" width="1.5rem" height="1.5rem" viewBox="0 0 24 24">
            <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
              <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0-4 0" />
              <path d="M21 12q-3.6 6-9 6t-9-6q3.6-6 9-6t9 6" />
            </g>
          </svg>
        {:else}
          <svg xmlns="http://www.w3.org/2000/svg" width="1.5rem" height="1.5rem" viewBox="0 0 24 24">
            <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
              <path d="M10.585 10.587a2 2 0 0 0 2.829 2.828" />
              <path d="M16.681 16.673A8.7 8.7 0 0 1 12 18q-5.4 0-9-6q1.908-3.18 4.32-4.674m2.86-1.146A9 9 0 0 1 12 6q5.4 0 9 6q-1 1.665-2.138 2.87M3 3l18 18" />
            </g>
          </svg>
        {/if}
      </button>
    {/if}

    {#if copyButton && (type === 'text' || type === 'text-area')}
      <button
        type="button"
        class="absolute right-2 flex cursor-pointer border-none bg-transparent {type === 'text-area' ? 'top-2' : ''}"
        onclick={(e) => {
          e.preventDefault()
          navigator.clipboard.writeText(value as string)
          isCopied = true
          setTimeout(() => (isCopied = false), 1000)
        }}
        aria-label="Копировать текст"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="1.3em" height="1.3em" viewBox="0 0 24 24">
          <g fill="none" stroke="currentColor" stroke-width="1.5">
            <path
              d="M6 11c0-2.828 0-4.243.879-5.121C7.757 5 9.172 5 12 5h3c2.828 0 4.243 0 5.121.879C21 6.757 21 8.172 21 11v5c0 2.828 0 4.243-.879 5.121C19.243 22 17.828 22 15 22h-3c-2.828 0-4.243 0-5.121-.879C6 20.243 6 18.828 6 16z"
            />
            <path d="M6 19a3 3 0 0 1-3-3v-6c0-3.771 0-5.657 1.172-6.828S7.229 2 11 2h4a3 3 0 0 1 3 3" />
          </g>
        </svg>
      </button>

      {#if isCopied}
        <div
          class="absolute top-1/2 right-10 -translate-y-1/2 transform rounded-md bg-[var(--green-color)] px-2 py-1 text-sm shadow-lg"
          transition:fly={{ x: 10, duration: 200 }}
        >
          {$t('component.input.copy')}
        </div>
      {/if}
    {/if}

    {#if type === 'number' && !readonly && !disabled}
      <div class="absolute right-0 flex h-full w-8 flex-col items-center justify-center rounded-r-2xl border-l border-[var(--border-color)]">
        <button
          class="flex h-1/2 w-full items-center rounded-tr-2xl border-b border-[var(--border-color)] pl-2 transition-colors duration-150 hover:bg-[var(--gray-color)]/30 active:bg-[var(--gray-color)]/10"
          onclick={() => {
            if (!number.maxNum || !number.step) return
            if (Number(value) + number.step >= number.maxNum) {
              value = number.maxNum
              onUpdate?.(value as number)
              return
            }
            value = Number(value) + (number.step ?? 1)
            onUpdate?.(value as number)
          }}
          aria-label="Увеличить">+</button
        >

        <button
          class="flex h-1/2 w-full items-center rounded-br-2xl pl-2 transition-colors duration-150 hover:bg-[var(--gray-color)]/30 active:bg-[var(--gray-color)]/10"
          onclick={() => {
            if (number.minNum === null || number.minNum === undefined || !number.step) return
            if (Number(value) - number.step <= number.minNum) {
              value = number.minNum
              onUpdate?.(value as number)
              return
            }
            value = Number(value) - (number.step ?? 1)
            onUpdate?.(value as number)
          }}
          aria-label="Уменьшить">−</button
        >
      </div>
    {/if}

    {#if help.info}
      <button
        type="button"
        class="button-info absolute left-2 flex border-none bg-transparent {type === 'text-area' ? 'top-2' : ''} {disabled ? 'opacity-50' : 'cursor-pointer'}"
        onclick={() => (showInfo = !showInfo)}
        aria-label={showInfo ? 'Скрыть инфо' : 'Показать инфо'}
      >
        <svg xmlns="http://www.w3.org/2000/svg" height="1.5rem" width="1.5rem" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M12 16.5q.214 0 .357-.144T12.5 16v-4.5q0-.213-.144-.356T11.999 11t-.356.144t-.143.356V16q0 .213.144.356t.357.144M12 9.577q.262 0 .439-.177t.176-.438t-.177-.439T12 8.346t-.438.177t-.177.439t.177.438t.438.177M12.003 21q-1.867 0-3.51-.708q-1.643-.709-2.859-1.924t-1.925-2.856T3 12.003t.709-3.51Q4.417 6.85 5.63 5.634t2.857-1.925T11.997 3t3.51.709q1.643.708 2.859 1.922t1.925 2.857t.709 3.509t-.708 3.51t-1.924 2.859t-2.856 1.925t-3.509.709M12 20q3.35 0 5.675-2.325T20 12t-2.325-5.675T12 4T6.325 6.325T4 12t2.325 5.675T12 20m0-8"
          />
        </svg>
      </button>

      {#if showInfo}
        <div
          transition:fly={{ x: -15, duration: 250 }}
          class="info-container absolute z-50 w-auto rounded px-2 py-1 shadow-lg"
          style="left: 2.5rem; top: 50%; transform: translateY(-50%); background: color-mix(in srgb, var(--yellow-color) 20%, var(--back-color));"
        >
          {help?.info}
        </div>
      {/if}
    {/if}
  </div>
</div>
