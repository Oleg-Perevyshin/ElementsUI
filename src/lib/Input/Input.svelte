<!-- $lib/ElementsUI/Input.svelte -->
<script lang="ts">
  import { onMount } from 'svelte'
  import { fly } from 'svelte/transition'
  import type { IInputProps } from '../types'
  import { twMerge } from 'tailwind-merge'

  let {
    id = crypto.randomUUID(),
    wrapperClass = '',
    label = { name: '', class: '' },
    disabled = false,
    readonly = false,
    value = $bindable(),
    type = 'text',
    placeholder = '',
    componentClass = '',
    maxlength = 100,
    textareaRows = 3,
    number = { minNum: -1000000, maxNum: Infinity, step: 1 },
    help = { info: '', autocomplete: 'off', copyButton: false, regExp: '^[\\s\\S]*$' },
    onUpdate = () => {},
  }: IInputProps = $props()

  let showPassword = $state(false)
  let showInfo = $state(false)
  let isCopied = $state(false)

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
  let RegExpObj = $derived(() => parseRegExp(help.regExp ?? ''))
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

<div class={twMerge(`bg-max ${type === 'text-area' ? 'h-full' : ''} relative flex w-full flex-col items-center`, wrapperClass)}>
  {#if label.name}
    <h5 class={twMerge(`w-full px-4 text-center`, label.class)}>{label.name}</h5>
  {/if}

  <div class="relative flex w-full items-center {type === 'text-area' ? 'h-full' : ''}">
    {#if type === 'text' || type === 'password' || type === 'number'}
      <input
        bind:value
        class={twMerge(
          `w-full rounded-2xl border px-4 py-1 text-center transition-all duration-300 outline-none focus:border-blue-400
              [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden
              ${isValid ? 'border-[var(--border-color)]' : '!border-red-400 shadow-[0_0_6px_var(--red-color)]'}
              ${disabled ? 'opacity-50' : 'hover:shadow-md'} 
              ${readonly ? '' : 'hover:shadow-md'}
              ${help?.info ? 'pl-8' : ''} 
              ${help.copyButton || type === 'password' || (type === 'number' && !readonly) ? 'pr-8' : ''}`,
          componentClass,
        )}
        style="background: color-mix(in srgb, var(--bg-color), var(--back-color) 70%);"
        {id}
        {placeholder}
        {disabled}
        autocomplete={help?.autocomplete}
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
        class={twMerge(
          `h-full w-full resize-y rounded-2xl border border-[var(--border-color)] px-2 py-1 text-center font-mono transition-all duration-300 outline-none focus:border-blue-400
            ${isValid ? 'border-[var(--border-color)]' : '!border-red-400 shadow-[0_0_6px_var(--red-color)]'}
            ${disabled ? 'opacity-50' : 'hover:shadow-md'} 
            ${readonly ? '' : 'hover:shadow-md'}
            ${help?.info ? 'pl-8' : ''}
            ${help.copyButton ? 'pr-8' : ''}`,
          componentClass,
        )}
        style="background: color-mix(in srgb, var(--bg-color), var(--back-color) 70%);"
        {id}
        {disabled}
        {maxlength}
        rows={textareaRows}
        {placeholder}
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
          <svg xmlns="http://www.w3.org/2000/svg" width="1.5rem" height="1.5rem" viewBox="0 0 24 24"
            ><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              ><path d="M15 12a3 3 0 1 1-6 0a3 3 0 0 1 6 0" /><path
                d="M2 12c1.6-4.097 5.336-7 10-7s8.4 2.903 10 7c-1.6 4.097-5.336 7-10 7s-8.4-2.903-10-7"
              /></g
            ></svg
          >
        {:else}
          <svg xmlns="http://www.w3.org/2000/svg" width="1.5rem" height="1.5rem" viewBox="0 0 24 24"
            ><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              ><path
                stroke-linejoin="round"
                d="M10.73 5.073A11 11 0 0 1 12 5c4.664 0 8.4 2.903 10 7a11.6 11.6 0 0 1-1.555 2.788M6.52 6.519C4.48 7.764 2.9 9.693 2 12c1.6 4.097 5.336 7 10 7a10.44 10.44 0 0 0 5.48-1.52m-7.6-7.6a3 3 0 1 0 4.243 4.243"
              /><path d="m4 4l16 16" /></g
            ></svg
          >
        {/if}
      </button>
    {/if}

    {#if help.copyButton && (type === 'text' || type === 'text-area')}
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
          ✓
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
        class="button-info absolute left-2 flex border-none bg-transparent {type === 'text-area' ? 'top-2' : ''} {disabled
          ? 'opacity-50'
          : 'cursor-pointer'}"
        onmouseenter={() => (showInfo = true)}
        onmouseleave={() => (showInfo = false)}
        aria-label={showInfo ? 'Скрыть инфо' : 'Показать инфо'}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="1.5rem" height="1.5rem" viewBox="0 0 24 24"
          ><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
            ><circle cx="12" cy="12" r="10" stroke-width="1.3" /><path stroke-width="1.5" d="M12 16v-4.5" /><path
              stroke-width="1.8"
              d="M12 8.012v-.01"
            /></g
          ></svg
        >
      </button>

      {#if showInfo}
        <div
          transition:fly={{ x: -15, duration: 250 }}
          class="absolute top-1/2 left-10 z-50 w-auto -translate-y-1/2 rounded bg-[var(--container-color)] px-2 py-1 shadow-lg"
        >
          {help?.info}
        </div>
      {/if}
    {/if}
  </div>
</div>
