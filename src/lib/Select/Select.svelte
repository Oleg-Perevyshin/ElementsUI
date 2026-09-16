<!-- $lib/Select/Select.svelte — радиус 10, высота 36, выравнивание по левому краю,
     список — единственный элемент с тенью, группа type="buttons" без разрывов.
     Логика (filteredOptions, selectOption, handleSearch, клик вне) не тронута. -->
<script lang="ts" generics="T = unknown">
  import { slide } from "svelte/transition"
  import { onMount } from "svelte"
  import type { IOption, ISelectProps } from "../types"
  import { twMerge } from "tailwind-merge"
  import { T } from "$lib/locales/i18n"

  let isDropdownOpen = $state(false)
  let dropdownElement: HTMLDivElement
  let portalElement: HTMLDivElement | undefined = $state()
  let anchorRect: { top: number; bottom: number; left: number; width: number } | null = $state(null)

  /* Список вариантов выносится в document.body (портал), чтобы его не обрезал
     overflow-hidden/overflow-auto ближайшего скроллящегося предка (например,
     панель свойств конструктора). Позиция считается от dropdownElement и
     обновляется, пока список открыт, при скролле/резайзе где угодно на странице.
     Атрибут data-ui-portal на контейнере — чтобы Modal.svelte не принимал клик по
     опции (физически лежащей вне [data-modal]) за клик "снаружи" и не закрывался. */
  function portal(node: HTMLElement) {
    document.body.appendChild(node)
    return {
      destroy() {
        node.remove()
      },
    }
  }

  function updateAnchorRect() {
    if (!dropdownElement) return
    const rect = dropdownElement.getBoundingClientRect()
    anchorRect = { top: rect.top, bottom: rect.bottom, left: rect.left, width: rect.width }
  }

  $effect(() => {
    if (!isDropdownOpen) return
    updateAnchorRect()
    window.addEventListener("scroll", updateAnchorRect, true)
    window.addEventListener("resize", updateAnchorRect)
    return () => {
      window.removeEventListener("scroll", updateAnchorRect, true)
      window.removeEventListener("resize", updateAnchorRect)
    }
  })

  let {
    id = crypto.randomUUID(),
    wrapperClass = "",
    componentClass = "",
    disabled = false,
    label = { name: "", class: "" },
    multiSelect = false,
    listHeight = "16rem",
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
      return [...firstOptions, ...options.filter((option) => !firstOptions.some((filtered) => filtered.id === option.id))]
    })(),
  )

  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Node
    const insideAnchor = !!dropdownElement?.contains(target)
    const insidePortal = !!portalElement?.contains(target)
    if (!insideAnchor && !insidePortal) isDropdownOpen = false
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

  /* Общая база поля — та же, что у Input */
  const fieldBase = `h-8 w-full rounded-[10px] border border-(--border-color) bg-(--field-color) px-3 text-left text-[14px]
    transition-[border-color,box-shadow] duration-150 outline-none
    focus:border-(--accent-color) focus:shadow-(--focus-shadow-color)`

  const listBase = `overflow-y-auto rounded-[10px] border border-(--hairline-color) bg-(--back-color) p-1 shadow-(--elevation-2)`

  const optionBase = `flex h-8 w-full items-center rounded-md px-2.5 text-left text-[14px] transition-colors duration-150`
</script>

<div class={twMerge(`flex w-full flex-col gap-1`, wrapperClass)}>
  <div class="relative flex w-full flex-col gap-1" bind:this={dropdownElement}>
    {#if label.name}
      <span class={twMerge(`text-[12px] font-semibold text-(--muted-color)`, label.class)}>{label.name}</span>
    {/if}

    {#if type === "select" && !Array.isArray(value)}
      <button
        id={`${id}-${crypto.randomUUID().slice(0, 6)}`}
        value={value?.value ? String(value.value) : ""}
        class={twMerge(
          `${fieldBase} flex items-center justify-between gap-2
           ${disabled ? "cursor-not-allowed border-(--hairline-color) bg-(--container-color) text-(--faint-color)" : "cursor-pointer hover:border-(--faint-color)"}`,
          value?.class,
        )}
        onclick={toggleDropdown}
        aria-haspopup="listbox"
        aria-expanded={isDropdownOpen}
        {disabled}
      >
        <span class="min-w-0 flex-1 truncate {value?.name ? '' : 'text-(--faint-color)'} {componentClass}">{value?.name || $T("common.select_tag")}</span>
        <svg
          class="size-3.5 shrink-0 text-(--faint-color) transition-transform duration-150"
          style="transform: rotate({isDropdownOpen ? 180 : 0}deg)"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"><path d="M6 9l6 6 6-6" /></svg
        >
      </button>

      {#if isDropdownOpen}
        <div
          use:portal
          bind:this={portalElement}
          data-ui-portal
          class="fixed z-[9999] mt-1"
          style="top: {anchorRect?.bottom ?? 0}px; left: {anchorRect?.left ?? 0}px; width: {anchorRect?.width ?? 0}px;"
          transition:slide={{ duration: 150 }}
        >
          <div class={listBase} style="max-height: {listHeight};" role="listbox">
            {#each options as option (option.id)}
              <button
                id={option.id}
                value={option?.value ? String(option.value) : ""}
                class={twMerge(
                  `${optionBase}
                   ${isSelected(option) ? "bg-(--accent-soft) font-semibold text-(--accent-color)" : "hover:bg-(--container-color)"}
                   ${option.disabled ? "cursor-not-allowed text-(--faint-color)" : "cursor-pointer"}`,
                  option.class,
                )}
                onclick={(e) => selectOption(option, e)}
                disabled={option.disabled}
              >
                <span class="min-w-0 truncate">{option.name}</span>
              </button>
            {/each}
          </div>
        </div>
      {/if}
    {:else if type === "buttons"}
      <!-- Сплошная группа: общий контур, разделители внутри, без зазоров и теней -->
      <div
        id={`${id}-${crypto.randomUUID().slice(0, 6)}`}
        class="flex w-full overflow-hidden rounded-[10px] border border-(--border-color) {disabled ? 'opacity-45' : ''}"
        role="group"
      >
        {#each options as option, index (option.id)}
          {@const selected = value !== null && isSelected(option)}
          {@const hasOwnColor = !!option.class?.split(/\s+/).find((c) => c.startsWith("bg-"))}
          <!-- Заливка приклеена вне twMerge: иначе она конфликтует с explicit bg-* из option.class
               в одной merge-группе и вырезается (та же ловушка, что и в Button.svelte).
               Опции со своим цветом (COLOR_OPTIONS и любой другой свотч-пикер, использующий
               этот же type="buttons") обязаны показывать этот цвет ВСЕГДА, а не только когда
               выбраны — иначе, например, палитра цветов в CommonSnippets.Colors превращается
               в ряд одинаковых белых кнопок. Выбор у таких опций отмечается рамкой, а не заливкой;
               для обычного сегмент-контрола без своего цвета (Access, Header и т.п.) поведение
               прежнее — акцентная заливка только у выбранного пункта. -->
          <button
            id={option.id}
            class="{twMerge(
              `h-8 min-w-0 flex-1 px-3 py-2 text-[13px] font-semibold transition-colors duration-150
               ${index === 0 ? 'rounded-l-[9px]' : ''} ${index === options.length - 1 ? 'rounded-r-[9px]' : ''}
               ${index > 0 ? 'border-l border-(--border-color)' : ''}
               ${
                 hasOwnColor
                   ? selected
                     ? 'ring-2 ring-inset ring-(--font-color)'
                     : ''
                   : selected
                     ? 'text-(--on-accent)'
                     : 'text-(--font-color) hover:bg-(--container-color)'
               }
               ${option.disabled || disabled ? 'cursor-not-allowed text-(--faint-color)' : 'cursor-pointer'}`,
              option.class,
            )} {hasOwnColor ? 'bg-(--bg-color)' : selected ? 'bg-(--bg-color,var(--accent-color))' : 'bg-(--back-color)'}"
            onclick={(e) => selectOption(option, e)}
            disabled={option.disabled || disabled}
            aria-pressed={!!isSelected(option)}
          >
            {#if option.name}
              <span class="block truncate">{option.name}</span>
            {/if}
          </button>
        {/each}
      </div>
    {:else if type === "input"}
      <input
        bind:value={searchValue}
        class={twMerge(
          fieldBase,
          disabled ? "cursor-not-allowed border-(--hairline-color) bg-(--container-color) text-(--faint-color)" : "cursor-text hover:border-(--faint-color)",
          componentClass,
        )}
        id={`${id}-${crypto.randomUUID().slice(0, 6)}`}
        {disabled}
        oninput={handleSearch}
        onclick={(e) => toggleDropdown(e)}
      />

      {#if isDropdownOpen}
        <div
          use:portal
          bind:this={portalElement}
          data-ui-portal
          class="fixed z-[9999] mt-1 select-none"
          style="top: {anchorRect?.bottom ?? 0}px; left: {anchorRect?.left ?? 0}px; width: {anchorRect?.width ?? 0}px;"
          transition:slide={{ duration: 150 }}
        >
          <div class={listBase} style="max-height: {listHeight};" role="listbox">
            {#each filteredOptions as option (option.id)}
              <button
                id={option.id}
                value={option?.value ? String(option.value) : ""}
                class={twMerge(
                  `${optionBase}
                   ${isSelected(option) ? "bg-(--accent-soft) font-semibold text-(--accent-color)" : "hover:bg-(--container-color)"}
                   ${option.disabled ? "cursor-not-allowed text-(--faint-color)" : "cursor-pointer"}`,
                  option.class,
                )}
                onclick={(e) => selectOption(option, e)}
                disabled={option.disabled}
              >
                <span class="min-w-0 truncate">{option.name}</span>
              </button>
            {/each}
          </div>
        </div>
      {/if}
    {/if}
  </div>
</div>
