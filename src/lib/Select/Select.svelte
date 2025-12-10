<!-- $lib/ElementUI/Select.svelte -->
<script lang="ts" generics="T = unknown">
  import { slide } from 'svelte/transition'
  import { onMount } from 'svelte'
  import type { ISelectOption, ISelectProps } from '../types'
  import { twMerge } from 'tailwind-merge'
  import { t } from '$lib/locales/i18n'

  let isDropdownOpen = $state(false)
  let dropdownElement: HTMLDivElement

  let {
    id = crypto.randomUUID(),
    wrapperClass = '',
    disabled = false,
    label = { name: '', class: '' },
    type = 'select',
    value = $bindable(),
    options = [],
    onUpdate,
  }: ISelectProps<T> = $props()

  let searchValue: any = $state('')
  let filteredOptions = $state<ISelectOption<T>[]>([])

  /* Закрытие при клике вне компонента */
  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
      isDropdownOpen = false
    }
  }

  $effect(() => {
    if (value?.name) {
      searchValue = value?.name
    } else if (value == undefined) {
      const newOption: ISelectOption<T> = {
        id: `input-${searchValue}`,
        name: searchValue,
        value: searchValue as T,
      }
      searchValue = newOption.value
    }
  })

  onMount(() => {
    if (type === 'select' || type === 'input') document.addEventListener('click', handleClickOutside)
    if (type === 'input') searchValue = value?.name ?? ''
    return () => {
      if (type === 'select' || type === 'input') document.removeEventListener('click', handleClickOutside)
    }
  })

  const toggleDropdown = (event: MouseEvent) => {
    event.stopPropagation()
    if (!disabled) {
      isDropdownOpen = !isDropdownOpen
      filteredOptions = []
    }
  }

  const selectOption = (option: ISelectOption<T>, event: MouseEvent) => {
    event.stopPropagation()
    if (!disabled) {
      value = option
      isDropdownOpen = false
      searchValue = option.name?.toString() ?? ''
      filteredOptions = []
      onUpdate?.(value)
    }
  }

  const handleSearch = (inputValue: string) => {
    searchValue = inputValue

    if (inputValue.trim() === '') {
      isDropdownOpen = false
      filteredOptions = []
    } else {
      filteredOptions = options.filter((option) => {
        const optionName = option.name?.toString() || ''
        return optionName.toLowerCase().includes(inputValue.toLowerCase())
      })
      isDropdownOpen = filteredOptions.length > 0

      const selectedFromList = options.find((option) => option.name?.toString() === searchValue)

      if (!selectedFromList) {
        const newOption: ISelectOption<T> = {
          id: `input-${searchValue}`,
          name: searchValue,
          value: searchValue as T,
        }

        value = newOption
        onUpdate?.(newOption)
      } else {
        value = selectedFromList
        onUpdate?.(selectedFromList)
      }
    }
  }
</script>

<div class={twMerge(`bg-max relative flex w-full flex-col items-center px-1`, wrapperClass)} bind:this={dropdownElement}>
  {#if label.name}
    <h5 class={twMerge(`w-full px-4`, label.class)}>{label.name}</h5>
  {/if}
  {#if type === 'select'}
    <button
      id={`${id}-${crypto.randomUUID().slice(0, 6)}`}
      value={value?.value ? String(value.value) : ''}
      class={twMerge(
        `w-full rounded-2xl border border-(--bg-color) p-1 text-center shadow-[0_0_3px_rgb(0_0_0_/0.25)] transition duration-200
        ${disabled ? 'opacity-50' : 'cursor-pointer hover:shadow-[0_0_6px_rgb(0_0_0_/0.25)]'}`,
        value?.class,
      )}
      style="background: color-mix(in srgb, var(--bg-color), var(--back-color) 70%); "
      onclick={toggleDropdown}
      aria-haspopup="true"
      aria-expanded={isDropdownOpen}
      {disabled}
    >
      {value?.name || $t('common.select_tag')}
    </button>

    {#if isDropdownOpen}
      <div
        class="absolute top-full left-1/2 z-50 -translate-x-1/2 rounded-b-2xl shadow-[0_0_3px_rgb(0_0_0_/0.25)]"
        style="width: calc(100% - 1.8rem);"
        transition:slide={{ duration: 250 }}
      >
        {#each options as option, index (option.id)}
          <button
            id={option.id}
            value={option?.value ? String(option.value) : ''}
            class={twMerge(
              `flex h-full w-full cursor-pointer items-center justify-center p-1 inset-shadow-[0_10px_10px_-15px_rgb(0_0_0_/0.5)] duration-250 hover:bg-(--field-color)!
              ${index === options.length - 1 ? 'rounded-b-2xl' : ''} `,
              option.class,
            )}
            onclick={(e) => selectOption(option, e)}
            {disabled}
            style="background: color-mix(in srgb, var(--bg-color), var(--back-color) 70%); 
            "
          >
            {option.name}
          </button>
        {/each}
      </div>
    {/if}
  {:else if type === 'buttons'}
    <div id={`${id}-${crypto.randomUUID().slice(0, 6)}`} class="flex h-full w-full flex-row justify-center rounded-full">
      {#each options as option, index (option.id)}
        <button
          id={option.id}
          class="{twMerge(
            `m-0 inline-block min-w-0 flex-1 items-center px-2 py-1 font-semibold shadow-[0_0_3px_rgb(0_0_0_/0.25)] transition duration-300 select-none border border-(--bg-color)
            ${option.disabled || disabled ? 'opacity-50' : 'cursor-pointer hover:shadow-[0_0_6px_rgb(0_0_0_/0.25)]'}
            ${option.value === value?.value && value !== null ? 'z-10 py-1 shadow-[0_0_10px_var(--shadow-color)] hover:shadow-[0_0_15px_var(--shadow-color)]' : ''}  
            ${options.length > 0 && index === 0 ? 'rounded-l-2xl' : ''} ${index === options.length - 1 ? 'rounded-r-2xl' : ''}`,
            option.class,
          )} bg-(--bg-color)"
          onclick={(e) => selectOption(option, e)}
          disabled={option.disabled}
        >
          <span class="flex flex-row items-center justify-center gap-4">
            {#if option.name}
              <div class="flex-1">
                {option.name}
              </div>
            {/if}
          </span>
        </button>
      {/each}
    </div>
  {:else if type === 'input'}
    <input
      bind:value={searchValue}
      class="w-full appearance-none rounded-2xl border px-4 py-1 text-center shadow-[0_0_3px_rgb(0_0_0_/0.25)]
          transition duration-200 outline-none focus:shadow-[0_0_6px_var(--blue-color)]
          [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden
          {disabled
        ? 'cursor-not-allowed opacity-50'
        : 'cursor-text'} border-(--bg-color) focus:border-(--blue-color) hover:shadow-[0_0_6px_rgb(0_0_0_/0.25)]"
      style="background: color-mix(in srgb, var(--bg-color), var(--back-color) 70%);"
      id={`${id}-${crypto.randomUUID().slice(0, 6)}`}
      {disabled}
      oninput={(e) => handleSearch((e.currentTarget as HTMLInputElement).value)}
      onclick={(e) => {
        if (searchValue == '') {
          filteredOptions = options
          isDropdownOpen = true
        }
      }}
    />

    {#if isDropdownOpen}
      <div
        class="absolute top-full left-1/2 z-50 -translate-x-1/2 rounded-b-2xl border border-t-0 border-(--bg-color) shadow-[0_0_3px_rgb(0_0_0_/0.25)]"
        style="width: calc(100% - 1.8rem);"
        transition:slide={{ duration: 250 }}
      >
        {#each filteredOptions as option, index (option.id)}
          <button
            id={option.id}
            value={option?.value ? String(option.value) : ''}
            class={twMerge(
              `flex h-full w-full cursor-pointer items-center justify-center p-1 inset-shadow-[0_10px_10px_-15px_rgb(0_0_0_/0.5)] duration-250 hover:bg-(--field-color)!
              ${index === filteredOptions.length - 1 ? 'rounded-b-2xl' : ''} `,
              option.class,
            )}
            onclick={(e) => selectOption(option, e)}
            {disabled}
            style="background: color-mix(in srgb, var(--bg-color), var(--back-color) 70%); 
            "
          >
            {option.name}
          </button>
        {/each}
      </div>
    {/if}
  {/if}
</div>
