<!-- $lib/Select/Select.svelte - радиус 10, высота 32, список - единственный элемент с тенью и вынесен в body; группа type="buttons" без разрывов, type="radio" - радиокнопки в строку. Значение - option.value, клавиатура: стрелки, Enter, Escape -->
<script lang="ts" generics="T = unknown, M extends boolean = false">
  import { slide } from "svelte/transition"
  import type { IOption, ISelectProps, SelectValue } from "../types"
  import { twMerge } from "tailwind-merge"
  import { accentStyle } from "../accent"
  import { T as Tr } from "../locales/i18n"
  import Tooltip from "../Tooltip.svelte"
  import FieldLabel from "../FieldLabel.svelte"
  import Icon from "../Icon.svelte"
  import { isHoverPointer, nextEnabled } from "../popup"

  let {
    wrapperClass = "",
    componentClass = "",
    disabled = false,
    label,
    help,
    multiSelect,
    fitContent = false,
    showNames = false,
    listHeight = "16rem",
    type = "select",
    value = $bindable(),
    options = [],
    onUpdate,
    onInput,
  }: ISelectProps<T, M> = $props()

  const uid = $props.id()
  const listId = `${uid}-list`
  const optionId = (index: number) => `${uid}-option-${index}`

  let isOpen = $state(false)
  /* Вариант под клавиатурой в открытом списке */
  let activeIndex = $state(-1)
  /* Текст type="input", пока пользователь печатает; null - показывается текущее значение */
  let draft = $state<string | null>(null)
  /* Вариант-иконка под курсором в type="buttons": его name показывается подсказкой */
  let hoveredIndex = $state(-1)
  let anchorElement: HTMLDivElement | undefined = $state()
  let portalElement: HTMLDivElement | undefined = $state()
  let anchorRect: DOMRect | null = $state(null)

  /* type="buttons" на узком месте: сначала сжимаются отступы кнопок, и только если подписи не помещаются и так - группа показывается выпадающим списком */
  let measureElement: HTMLDivElement | undefined = $state()
  let anchorWidth = $state(Infinity)
  let buttonsNeed = $state(0)
  let compactNeed = $state(0)
  $effect(() => {
    const element = measureElement
    if (type !== "buttons" || fitContent || !element) return
    void options
    let alive = true
    const measure = () => {
      if (!alive) return
      const widest = Math.max(0, ...[...element.children].map((child) => child.getBoundingClientRect().width))
      /* сегменты равной ширины: самый широкий текст + отступы 2×12 (сжатые - 2×4), разделители и рамка */
      buttonsNeed = options.length * (widest + 24) + options.length + 1
      compactNeed = options.length * (widest + 8) + options.length + 1
    }
    measure()
    /* Шрифты могут догрузиться после замера; к тому времени компонент может быть уже убран */
    void document.fonts?.ready.then(measure)
    return () => (alive = false)
  })
  /* fitContent: ширину задают сами кнопки, сворачивать нечего */
  const shownType = $derived(type === "buttons" && !fitContent && anchorWidth < compactNeed ? "select" : type)
  /* Кнопки с узкими отступами: обычные не помещаются, сжатые - да */
  const compactButtons = $derived(type === "buttons" && !fitContent && anchorWidth < buttonsNeed)

  const selectedValues = $derived(multiSelect ? (Array.isArray(value) ? (value as T[]) : []) : [value as T])
  const isSelected = (option: IOption<T>) => selectedValues.includes(option.value)
  const current = $derived(multiSelect ? undefined : options.find((option) => option.value === value))
  const valueText = $derived(
    multiSelect
      ? options
          .filter(isSelected)
          .map((option) => option.name ?? String(option.value))
          .join(", ")
      : (current?.name ?? (value == null || Array.isArray(value) ? "" : String(value))),
  )
  const visibleOptions = $derived(
    type === "input" && draft ? options.filter((option) => (option.name ?? "").toLowerCase().includes(draft!.toLowerCase())) : options,
  )

  /* Список выносится в body, чтобы его не обрезал overflow предка (панель свойств); data-ui-portal - Modal не считает клик по нему кликом снаружи */
  const portal = (node: HTMLElement) => {
    document.body.appendChild(node)
    return { destroy: () => node.remove() }
  }

  /* Список открывается вниз, а если снизу места меньше, чем ему нужно, и сверху больше - вверх; высота не больше свободного места */
  const GAP = 4
  const MARGIN = 8
  const listMaxPx = $derived.by(() => {
    const size = parseFloat(listHeight)
    if (listHeight.endsWith("rem")) return size * parseFloat(getComputedStyle(document.documentElement).fontSize || "16")
    return listHeight.endsWith("px") && size > 0 ? size : 256
  })
  const listPlacement = $derived.by(() => {
    if (!anchorRect) return { style: "", maxHeight: listHeight }
    const needed = Math.min(listMaxPx, visibleOptions.length * 36 + 10)
    const below = window.innerHeight - anchorRect.bottom - GAP - MARGIN
    const above = anchorRect.top - GAP - MARGIN
    const openUp = below < needed && above > below
    const position = openUp ? `bottom: ${window.innerHeight - anchorRect.top + GAP}px;` : `top: ${anchorRect.bottom + GAP}px;`
    return {
      style: `${position} left: ${anchorRect.left}px; min-width: ${anchorRect.width}px; max-width: ${Math.max(anchorRect.width, window.innerWidth - anchorRect.left - MARGIN)}px;`,
      maxHeight: `${Math.min(listMaxPx, Math.max(openUp ? above : below, 72))}px`,
    }
  })

  /* Пока список открыт: позиция следует за полем, клик вне поля и списка закрывает */
  $effect(() => {
    if (!isOpen) return
    const place = () => (anchorRect = anchorElement?.getBoundingClientRect() ?? null)
    const outside = (event: PointerEvent) => {
      const target = event.target as Node
      if (!anchorElement?.contains(target) && !portalElement?.contains(target)) close()
    }
    place()
    window.addEventListener("scroll", place, true)
    window.addEventListener("resize", place)
    document.addEventListener("pointerdown", outside)
    return () => {
      window.removeEventListener("scroll", place, true)
      window.removeEventListener("resize", place)
      document.removeEventListener("pointerdown", outside)
    }
  })

  const open = () => {
    if (disabled || isOpen) return
    isOpen = true
    activeIndex = visibleOptions.findIndex(isSelected)
  }
  const close = () => {
    isOpen = false
    activeIndex = -1
  }

  const commit = (next: SelectValue<T, M>) => {
    value = next
    onUpdate?.(next)
  }

  const pick = (option: IOption<T>) => {
    if (disabled || option.disabled) return
    if (multiSelect) {
      const list = selectedValues
      commit((list.includes(option.value) ? list.filter((v) => v !== option.value) : [...list, option.value]) as SelectValue<T, M>)
    } else commit(option.value as SelectValue<T, M>)
    draft = null
    close()
  }

  /* type="input": введённый текст - вариант с таким именем, иначе сам текст (числом, если варианты числовые) */
  const commitDraft = () => {
    if (draft === null) return
    const text = draft
    draft = null
    const match = options.find((option) => option.name === text)
    if (match) return pick(match)
    const numeric = typeof options[0]?.value === "number" && text.trim() !== "" && Number.isFinite(Number(text))
    commit((numeric ? Number(text) : text) as SelectValue<T, M>)
  }

  const moveActive = (step: 1 | -1) => {
    const next = nextEnabled(visibleOptions.length, activeIndex, step, (index) => !!visibleOptions[index].disabled)
    if (next >= 0) activeIndex = next
  }

  const onKeydown = (event: KeyboardEvent) => {
    if (disabled) return
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault()
      if (isOpen) moveActive(event.key === "ArrowDown" ? 1 : -1)
      else open()
    } else if (event.key === "Enter") {
      if (isOpen && visibleOptions[activeIndex]) {
        event.preventDefault()
        pick(visibleOptions[activeIndex])
      } else if (type === "input") {
        commitDraft()
        close()
      }
    } else if (event.key === "Escape" && isOpen) {
      /* Escape закрывает только список, не модальное окно вокруг */
      event.preventDefault()
      event.stopPropagation()
      draft = null
      close()
    }
  }

  /* Значок варианта: SVG, компонент или короткая метка ("S", "XL") */
  /* Размер значка задан явно: SVG без width и height Safari растягивает до 300 px */
  const OPTION_ICON = "flex size-[18px] shrink-0 items-center justify-center leading-none [&_svg]:size-full"

  /* type="radio": фокус стоит на выбранном варианте (или первом доступном), стрелки выбирают соседний доступный */
  let radioElements: HTMLButtonElement[] = $state([])
  const radioFocusIndex = $derived.by(() => {
    const selected = options.findIndex((option) => isSelected(option) && !option.disabled)
    return selected >= 0 ? selected : options.findIndex((option) => !option.disabled)
  })
  const onRadioKeydown = (event: KeyboardEvent) => {
    if (disabled) return
    const step = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0
    if (step === 0) return
    event.preventDefault()
    const index = nextEnabled(options.length, radioFocusIndex, step, (i) => !!options[i].disabled)
    if (index < 0) return
    pick(options[index])
    radioElements[index]?.focus()
  }

  /* Общая база поля - та же, что у Input */
  const fieldBase = `h-8 w-full rounded-[10px] border border-(--border-color) bg-(--field-color) px-3 text-left text-[14px]
    transition-[border-color,box-shadow] duration-150 outline-none
    focus:border-(--accent-text) focus:shadow-(--focus-shadow-color)`
  const fieldState = $derived(
    disabled ? "cursor-not-allowed border-(--hairline-color) bg-(--container-color) text-(--faint-color)" : "hover:border-(--faint-color)",
  )
</script>

<div class={twMerge(`flex w-full flex-col gap-1`, wrapperClass)}>
  <div class="relative flex w-full flex-col gap-1" bind:this={anchorElement} bind:clientWidth={anchorWidth}>
    <FieldLabel {label} info={help?.info} for={shownType === "buttons" || shownType === "radio" ? undefined : uid} id={`${uid}-label`} />

    {#if type === "buttons" && !fitContent}
      <!-- Невидимые подписи вариантов: по их ширине решается, помещается ли группа кнопок -->
      <div bind:this={measureElement} class="pointer-events-none invisible absolute top-0 left-0 flex h-0 w-max overflow-hidden" aria-hidden="true">
        {#each options as option, index (option.id ?? index)}
          <span class="flex gap-1.5 text-[13px] font-semibold whitespace-nowrap"
            >{#if option.icon}<span class="w-[18px]"></span>{/if}{option.icon && !showNames ? "" : option.name}</span
          >
        {/each}
      </div>
    {/if}

    {#if shownType === "select"}
      <button
        id={uid}
        class={twMerge(`${fieldBase} flex items-center justify-between gap-2 ${fieldState}`, disabled ? "" : "cursor-pointer")}
        onclick={() => (isOpen ? close() : open())}
        onkeydown={onKeydown}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-activedescendant={isOpen && activeIndex >= 0 ? optionId(activeIndex) : undefined}
        {disabled}
      >
        <span class="flex min-w-0 flex-1 items-center gap-2 {valueText ? '' : 'text-(--faint-color)'} {componentClass}">
          <Icon icon={current?.icon} class={OPTION_ICON} />
          <span class="min-w-0 truncate">{valueText || $Tr("common.select_tag")}</span>
        </span>
        <svg
          class="size-3.5 shrink-0 text-(--faint-color) transition-transform duration-150"
          style="transform: rotate({isOpen ? 180 : 0}deg)"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"><path d="M6 9l6 6 6-6" /></svg
        >
      </button>
    {:else if shownType === "input"}
      <input
        id={uid}
        value={draft ?? valueText}
        class={twMerge(fieldBase, fieldState, disabled ? "" : "cursor-text", componentClass)}
        autocomplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-activedescendant={isOpen && activeIndex >= 0 ? optionId(activeIndex) : undefined}
        {disabled}
        oninput={(event) => {
          draft = event.currentTarget.value
          activeIndex = -1
          isOpen = true
          onInput?.(draft)
        }}
        onclick={open}
        onkeydown={onKeydown}
        onblur={() => {
          commitDraft()
          close()
        }}
      />
    {:else if shownType === "radio"}
      <!-- Радиокнопки в строку (переносятся, если не помещаются): одна точка табуляции на группу, стрелки выбирают соседний вариант -->
      <div
        class="flex w-full flex-wrap items-center gap-x-4 gap-y-1.5 {componentClass}"
        role="radiogroup"
        aria-labelledby={label?.name ? `${uid}-label` : undefined}
        aria-disabled={disabled || undefined}
      >
        {#each options as option, index (option.id ?? index)}
          {@const selected = isSelected(option)}
          {@const off = disabled || option.disabled}
          <button
            bind:this={radioElements[index]}
            type="button"
            class="flex min-h-6 items-center gap-2 border-none bg-transparent p-0 text-left text-[14px] {off
              ? 'cursor-not-allowed text-(--faint-color)'
              : 'cursor-pointer text-(--font-color)'} focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-text)"
            style={accentStyle(option.accent)}
            role="radio"
            aria-checked={selected}
            aria-disabled={off || undefined}
            tabindex={index === radioFocusIndex ? 0 : -1}
            onclick={() => pick(option)}
            onkeydown={onRadioKeydown}
          >
            <!-- Кружок 18 и точка 10 по центру сетки: контур - inset-ring (не border), он не сдвигает содержимое; разница размеров чётная, без полупикселей -->
            <span
              class="grid size-[18px] shrink-0 place-items-center rounded-full bg-(--field-color) inset-ring transition-colors duration-150 {selected
                ? 'inset-ring-(--accent-color)'
                : 'inset-ring-(--border-color)'} {off ? 'opacity-45' : ''}"
            >
              {#if selected}<span class="size-[10px] rounded-full bg-(--accent-color)"></span>{/if}
            </span>
            <Icon icon={option.icon} class={OPTION_ICON} />
            {#if option.name}<span class="min-w-0">{option.name}</span>{/if}
          </button>
        {/each}
      </div>
    {:else}
      <!-- Сплошная группа: общий контур, разделители внутри, без зазоров и теней -->
      <div
        class="{fitContent ? 'grid w-max auto-cols-fr grid-flow-col' : 'flex w-full'} rounded-[10px] border border-(--border-color) {disabled
          ? 'opacity-45'
          : ''}"
        role="group"
        aria-labelledby={label?.name ? `${uid}-label` : undefined}
      >
        {#each options as option, index (option.id ?? index)}
          {@const selected = isSelected(option)}
          <!-- Вариант со своим цветом залит им всегда и отмечается рамкой, обычный сегмент заливает только выбранный пункт -->
          <!-- Обёртка - позиционирующий предок подсказки; без overflow-hidden у группы, чтобы подсказка не обрезалась -->
          <div class="relative flex {fitContent ? '' : 'min-w-0 flex-1'}" style={accentStyle(option.accent)}>
            <button
              class="flex h-8 w-full min-w-0 items-center justify-center {compactButtons
                ? 'px-1'
                : 'px-3'} py-2 text-[13px] font-semibold transition-colors duration-150
               {index === 0 ? 'rounded-l-[9px]' : ''} {index === options.length - 1 ? 'rounded-r-[9px]' : ''}
               {index > 0 ? 'border-l border-(--border-color)' : ''}
               {option.accent
                ? `bg-(--accent-color) text-(--on-accent) ${selected ? 'ring-2 ring-(--font-color) ring-inset' : ''}`
                : selected
                  ? 'bg-(--accent-color) text-(--on-accent)'
                  : 'bg-(--back-color) text-(--font-color) hover:bg-(--container-color)'}
               {option.disabled || disabled ? 'cursor-not-allowed text-(--faint-color)' : 'cursor-pointer'}
               {fitContent ? 'whitespace-nowrap' : ''}"
              onclick={() => pick(option)}
              disabled={option.disabled || disabled}
              aria-pressed={selected}
              aria-label={option.icon && !showNames ? option.name : undefined}
              onpointerenter={(event) => (hoveredIndex = option.icon && option.name && !showNames && isHoverPointer(event) ? index : -1)}
              onpointerleave={() => (hoveredIndex = -1)}
            >
              <!-- Значок вместо подписи (подпись - в подсказке), с showNames - значок и подпись рядом -->
              <span class="flex min-w-0 items-center justify-center gap-1.5">
                <Icon icon={option.icon} class={OPTION_ICON} />
                {#if option.name && (!option.icon || showNames)}
                  <span class="block truncate">{option.name}</span>
                {/if}
              </span>
            </button>
            {#if option.icon && option.name && !showNames}
              <Tooltip show={hoveredIndex === index} text={option.name} side="top" />
            {/if}
          </div>
        {/each}
      </div>
    {/if}

    {#if isOpen && (shownType === "select" || shownType === "input")}
      <div
        use:portal
        bind:this={portalElement}
        data-ui-portal
        class="fixed z-[9999] select-none"
        style={listPlacement.style}
        transition:slide={{ duration: 150 }}
        role="presentation"
        onpointerdown={(event) => event.preventDefault()}
      >
        <div
          id={listId}
          class="overflow-y-auto rounded-[10px] border border-(--hairline-color) bg-(--back-color) p-1 shadow-(--elevation-2)"
          style="max-height: {listPlacement.maxHeight};"
          role="listbox"
        >
          {#each visibleOptions as option, index (option.id ?? index)}
            <div
              id={optionId(index)}
              class="flex h-8 w-full items-center rounded-md px-2.5 text-left text-[14px] transition-colors duration-150
                {isSelected(option)
                ? 'bg-(--accent-soft) font-semibold text-(--accent-text)'
                : index === activeIndex
                  ? 'bg-(--container-color)'
                  : 'hover:bg-(--container-color)'}
                {option.disabled ? 'cursor-not-allowed text-(--faint-color)' : 'cursor-pointer'}"
              style={accentStyle(option.accent)}
              role="option"
              tabindex="-1"
              aria-selected={isSelected(option)}
              aria-disabled={option.disabled}
              onclick={() => pick(option)}
              onkeydown={onKeydown}
              onmouseenter={() => (activeIndex = index)}
            >
              <Icon icon={option.icon} class="mr-2 {OPTION_ICON}" />
              <span class="min-w-0 truncate">{option.name ?? String(option.value)}</span>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>
