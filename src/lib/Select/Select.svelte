<!-- $lib/ElementUI/Select.svelte -->
<script lang="ts" generics="T = unknown">
  import { slide } from "svelte/transition"
  import { onMount } from "svelte"
  import type { IOption, ISelectProps } from "../types"
  import { twMerge } from "tailwind-merge"
  import { t } from "$lib/locales/i18n"

  let isDropdownOpen = $state(false)
  let dropdownElement: HTMLDivElement

  let {
    id = crypto.randomUUID(),
    wrapperClass = "",
    disabled = false,
    label = { name: "", class: "" },
    multiSelect = false,
    listHeight = "",
    type = "select",
    value = $bindable(),
    options = [],
    onUpdate,
  }: ISelectProps<T> = $props()

  let searchValue: any = $derived(
    (() => {
      if (type === "input" && !Array.isArray(value)) return value?.name ?? ""
    })(),
  )

  let filteredOptions = $derived<IOption<T>[]>(
    (() => {
      const firstOptions = options.filter((option) => {
        const optionName = option.name?.toString() || ""
        return optionName.toLowerCase().includes(searchValue.toLowerCase())
      })

      return [
        ...firstOptions,
        ...options.filter((option) => {
          return !firstOptions.some((filtered) => filtered.id === option.id)
        }),
      ]
    })(),
  )

  /* Закрытие при клике вне компонента */
  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
      isDropdownOpen = false
    }
  }

  onMount(() => {
    if (type === "select" || type === "input") document.addEventListener("click", handleClickOutside)
    return () => {
      if (type === "select" || type === "input") document.removeEventListener("click", handleClickOutside)
    }
  })

  const toggleDropdown = (event: MouseEvent) => {
    event.stopPropagation()
    if (!disabled) isDropdownOpen = !isDropdownOpen
  }

  const isSelected = (option: IOption<any>) => {
    if (type === "buttons" && multiSelect && Array.isArray(value)) return value.find((v) => v.value === option.value)
    else return option.value === (value as IOption)?.value
  }

  const selectOption = (option: IOption<T>, event: MouseEvent) => {
    event.stopPropagation()

    if (type === "buttons" && multiSelect && value) {
      if (!Array.isArray(value)) value = [value]

      if (value.find((v) => v.value === option.value)) value = value.filter((op) => op.value !== option.value)
      else value.push(option)
    } else {
      value = option
    }

    if (type === "input") {
      handleSearch()
      searchValue = option.name?.toString() ?? ""
    }
    isDropdownOpen = false
    onUpdate?.(value)
  }

  const handleSearch = () => {
    const selectedOption = options.find((option) => option.name?.toString() === searchValue) || {
      id: `input-${Date.now()}`,
      name: searchValue,
      value:
        typeof options[0]?.value == "number" ? ((Number(searchValue) as T) == undefined ? (Number(searchValue) as T) : (searchValue as T)) : (searchValue as T),
    }
    value = selectedOption
    onUpdate?.(selectedOption)
  }
</script>

<div class={twMerge(`bg-max relative flex w-full flex-col items-center px-1`, wrapperClass)} bind:this={dropdownElement}>
  {#if label.name}
    <h5 class={twMerge(`w-full px-4`, label.class)}>{label.name}</h5>
  {/if}
  {#if type === "select" && !Array.isArray(value)}
    <button
      id={`${id}-${crypto.randomUUID().slice(0, 6)}`}
      value={value?.value ? String(value.value) : ""}
      class={twMerge(
        `w-full rounded-2xl border border-(--bg-color) p-1 text-center shadow-[0_0_3px_rgb(0_0_0_/0.25)] transition duration-200
        ${disabled ? "opacity-50" : "cursor-pointer hover:shadow-[0_0_6px_rgb(0_0_0_/0.25)]"}`,
        value?.class,
      )}
      style="background: color-mix(in srgb, var(--bg-color), var(--back-color) 70%); "
      onclick={toggleDropdown}
      aria-haspopup="true"
      aria-expanded={isDropdownOpen}
      {disabled}
    >
      {value?.name || $t("common.select_tag")}
    </button>

    {#if isDropdownOpen}
      <div
        class="absolute top-full left-1/2 z-50 -translate-x-1/2 rounded-b-xl shadow-[0_0_3px_rgb(0_0_0_/0.25)]"
        style="width: calc(100% - 1.8rem);"
        transition:slide={{ duration: 250 }}
      >
        <div class="overflow-y-auto bg-(--back-color)" style="max-height: {listHeight};">
          {#each options as option, index (option.id)}
            <button
              id={option.id}
              value={option?.value ? String(option.value) : ""}
              class={twMerge(
                `flex h-full w-full cursor-pointer items-center justify-center p-1 inset-shadow-[0_10px_10px_-15px_rgb(0_0_0_/0.5)] duration-250 hover:bg-(--field-color)
            ${index === options.length - 1 ? "rounded-b-xl" : ""}`,
                option.class,
              )}
              onclick={(e) => selectOption(option, e)}
              {disabled}
              style="background: color-mix(in srgb, var(--bg-color), var(--back-color) 70%);"
            >
              {option.name}
            </button>
          {/each}
        </div>
      </div>
    {/if}
  {:else if type === "buttons"}
    <div id={`${id}-${crypto.randomUUID().slice(0, 6)}`} class="flex h-full w-full flex-row justify-center rounded-full">
      {#each options as option, index (option.id)}
        <button
          id={option.id}
          class="{twMerge(
            `m-0 inline-block min-w-0 flex-1 items-center px-2 py-1 font-semibold shadow-[0_0_3px_rgb(0_0_0_/0.25)] transition duration-300 select-none border border-(--bg-color)
            ${option.disabled || disabled ? 'opacity-50' : 'cursor-pointer hover:shadow-[0_0_6px_rgb(0_0_0_/0.25)]'}
            ${value !== null && isSelected(option) ? 'z-10 py-1 shadow-[0_0_10px_var(--shadow-color)] hover:shadow-[0_0_15px_var(--shadow-color)]' : ''}  
            ${options.length > 0 && index === 0 ? 'rounded-l-2xl' : ''} ${index === options.length - 1 ? 'rounded-r-2xl' : ''}`,
            option.class,
          )} bg-(--bg-color)"
          onclick={(e) => selectOption(option, e)}
          disabled={option.disabled || disabled}
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
  {:else if type === "input"}
    <input
      bind:value={searchValue}
      class="w-full appearance-none rounded-2xl border px-4 py-1 text-center shadow-[0_0_3px_rgb(0_0_0_/0.25)]
          transition duration-200 outline-none focus:shadow-[0_0_6px_var(--blue-color)]
          [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden
          {disabled ? 'cursor-not-allowed opacity-50' : 'cursor-text'} border-(--bg-color) focus:border-(--blue-color) hover:shadow-[0_0_6px_rgb(0_0_0_/0.25)]"
      style="background: color-mix(in srgb, var(--bg-color), var(--back-color) 70%);"
      id={`${id}-${crypto.randomUUID().slice(0, 6)}`}
      {disabled}
      oninput={handleSearch}
      onclick={(e) => {
        toggleDropdown(e)
      }}
    />

    {#if isDropdownOpen}
      <div
        class="absolute select-none top-full left-1/2 z-50 -translate-x-1/2 rounded-b-xl border border-t-0 border-(--bg-color) shadow-[0_0_3px_rgb(0_0_0_/0.25)]"
        style="width: calc(100% - 1.8rem); "
        transition:slide={{ duration: 250 }}
      >
        <div class="overflow-y-auto bg-(--back-color)" style="max-height: {listHeight};">
          {#each filteredOptions as option, index (option.id)}
            <button
              id={option.id}
              value={option?.value ? String(option.value) : ""}
              class={twMerge(
                `flex h-full w-full cursor-pointer items-center justify-center p-1 inset-shadow-[0_10px_10px_-15px_rgb(0_0_0_/0.5)] duration-250 hover:bg-(--field-color)!
              ${index === filteredOptions.length - 1 ? "rounded-b-xl" : ""}`,
                option.class,
              )}
              onclick={(e) => selectOption(option, e)}
              {disabled}
              style="background: color-mix(in srgb, var(--bg-color), var(--back-color) 70%);"
            >
              {option.name}
            </button>
          {/each}
        </div>
      </div>
    {/if}
  {/if}
</div>
