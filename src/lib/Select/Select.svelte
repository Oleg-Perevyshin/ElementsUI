<!-- $lib/ElementUI/Select.svelte -->
<script lang="ts" generics="T = unknown">
  import { slide } from 'svelte/transition'
  import { onMount } from 'svelte'
  import type { ISelectOption, ISelectProps } from '../types'

  let isDropdownOpen = $state(false)
  let dropdownElement: HTMLDivElement

  let searchValue = $state('')
  let filteredOptions = $state<ISelectOption<T>[]>([])

  let {
    id = { name: '', value: crypto.randomUUID() },
    wrapperClass = 'bg-max',
    disabled = false,
    label = { name: '', class: '' },
    type = 'select',
    value = $bindable(),
    options = [],
    placeholder= '---', 
    onUpdate,
  }: ISelectProps<T> = $props()

  /* Закрытие при клике вне компонента */
  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
      isDropdownOpen = false
    }
  }

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

      const selectedFromList = options.some((option) => option.name?.toString() === searchValue)
      console.log(selectedFromList)

      if (!selectedFromList) {
        const newOption: ISelectOption<T> = {
          id: `input-${searchValue}`,
          name: searchValue,
          value: searchValue as T,
        }

        value = newOption
        onUpdate?.(newOption)
      }
    }
  }
</script>

<div class={`bg-max relative flex w-full flex-col items-center ${wrapperClass}`} bind:this={dropdownElement}>
  {#if label.name}
    <h5 class={`w-full px-4 ${label.class}`}>{label.name}</h5>
  {/if}
  {#if type === 'select'}
    <button
      id={id.value}
      value={value?.value ? String(value.value) : ''}
      class="w-full rounded-2xl border border-[var(--border-color)] p-1 text-center duration-250
      {value?.class} {disabled ? 'opacity-50' : 'cursor-pointer hover:shadow-lg'}"
      style="background: color-mix(in srgb, var(--bg-color), var(--back-color) 70%);"
      onclick={toggleDropdown}
      aria-haspopup="true"
      aria-expanded={isDropdownOpen}
      {disabled}
    >
      {value?.name || placeholder}
    </button>

    {#if isDropdownOpen}
      <div
        class="absolute top-full left-1/2 z-50 -translate-x-1/2 rounded-b-2xl border border-t-0 border-[var(--border-color)]"
        style="width: calc(100% - 1.8rem);"
        transition:slide={{ duration: 250 }}
      >
        {#each options as option, index (option.id)}
          <button
            id={option.id}
            value={option?.value ? String(option.value) : ''}
            class="flex h-full w-full cursor-pointer items-center justify-center p-1 duration-250 hover:!bg-[var(--field-color)]
            {option.class} {index === options.length - 1 ? 'rounded-b-2xl' : ''} "
            onclick={(e) => selectOption(option, e)}
            {disabled}
            style="background: color-mix(in srgb, var(--bg-color), var(--back-color) 70%);"
          >
            {option.name}
          </button>
        {/each}
      </div>
    {/if}
  {:else if type === 'buttons'}
    <div id={id.value} class="flex h-full w-full flex-row justify-center">
      {#each options as option, index (option.id)}
        <button
          id={option.id}
           class="m-0 inline-block min-w-0 flex-1 items-center bg-[var(--bg-color)] px-2 py-1 font-semibold shadow-sm transition-all duration-200 select-none
      {option.disabled || disabled ? 'opacity-50' : 'cursor-pointer hover:shadow-md'}
      {option.value === value?.value && value !== null ? 'z-10 !border-[var(--blue-color)] text-cyan-500 ring-3 ring-[var(--blue-color)]' : ''}  
      {option.class} {options.length > 0 && index === 0 ? 'rounded-l-2xl' : ''} {index === options.length - 1 ? 'rounded-r-2xl' : ''}"
          onclick={(e) => selectOption(option, e)}
          disabled={option.disabled}
        >
          <span class="flex flex-row items-center justify-center gap-4">
            {#if option.icon?.component}
              {@const IconComponent = option.icon?.component}
              <IconComponent {...option.icon?.properties} />
            {/if}
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
      class="w-full appearance-none rounded-2xl border px-4 py-1 text-center transition-shadow
          outline-none hover:shadow-md focus:border-blue-400
          [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden
          {disabled ? 'cursor-not-allowed opacity-50' : 'cursor-text'} border-[var(--border-color)]"
      style="background: color-mix(in srgb, var(--bg-color), var(--back-color) 70%);"
      id={id.value}
      {disabled}
      oninput={(e) => handleSearch((e.currentTarget as HTMLInputElement).value)}
    />

    {#if isDropdownOpen}
      <div
        class="absolute top-full left-1/2 z-50 -translate-x-1/2 rounded-b-2xl border border-t-0 border-[var(--border-color)]"
        style="width: calc(100% - 1.8rem);"
        transition:slide={{ duration: 250 }}
      >
        {#each filteredOptions as option, index (option.id)}
          <button
            id={option.id}
            value={option?.value ? String(option.value) : ''}
            class="flex h-full w-full cursor-pointer items-center justify-center p-1 duration-250 hover:!bg-[var(--field-color)]
            {option.class} {index === filteredOptions.length - 1 ? 'rounded-b-2xl' : ''} "
            onclick={(e) => selectOption(option, e)}
            {disabled}
            style="background: color-mix(in srgb, var(--bg-color), var(--back-color) 70%);"
          >
            {option.name}
          </button>
        {/each}
      </div>
    {/if}
  {/if}
</div>
