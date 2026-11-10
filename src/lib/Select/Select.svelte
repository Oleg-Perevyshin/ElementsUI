<!-- $lib/Select/Select.svelte - радиус 10, высота 32, список - единственный элемент с тенью и вынесен в body; группа type="buttons" без разрывов. Значение - option.value, клавиатура: стрелки, Enter, Escape -->
<script lang="ts" generics="T = unknown, M extends boolean = false">
  import { sanitizeHtml } from "../html"
  import { slide } from "svelte/transition"
  import type { IOption, ISelectProps, SelectValue } from "../types"
  import { twMerge } from "tailwind-merge"
  import { accentStyle } from "../accent"
  import { T as Tr } from "../locales/i18n"
  import Tooltip from "../Tooltip.svelte"
  import FieldLabel from "../FieldLabel.svelte"

  let {
    wrapperClass = "",
    componentClass = "",
    disabled = false,
    label,
    multiSelect,
    fitContent = false,
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

  const selectedValues = $derived(multiSelect ? (Array.isArray(value) ? (value as T[]) : []) : [value as T])
  const isSelected = (option: IOption<T>) => selectedValues.includes(option.value)
  const current = $derived(multiSelect ? undefined : options.find((option) => option.value === value))
  const valueText = $derived(current?.name ?? (value == null || Array.isArray(value) ? "" : String(value)))
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
      style: `${position} left: ${anchorRect.left}px; width: ${anchorRect.width}px;`,
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

  const moveActive = (step: number) => {
    const count = visibleOptions.length
    for (let n = 0, i = activeIndex; n < count; n++) {
      i = (i + step + count) % count
      if (!visibleOptions[i].disabled) return (activeIndex = i)
    }
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

  /* Общая база поля - та же, что у Input */
  const fieldBase = `h-8 w-full rounded-[10px] border border-(--border-color) bg-(--field-color) px-3 text-left text-[14px]
    transition-[border-color,box-shadow] duration-150 outline-none
    focus:border-(--accent-text) focus:shadow-(--focus-shadow-color)`
  const fieldState = $derived(
    disabled ? "cursor-not-allowed border-(--hairline-color) bg-(--container-color) text-(--faint-color)" : "hover:border-(--faint-color)",
  )
</script>

<div class={twMerge(`flex w-full flex-col gap-1`, wrapperClass)}>
  <div class="relative flex w-full flex-col gap-1" bind:this={anchorElement}>
    <FieldLabel {label} for={type === "buttons" ? undefined : uid} id={`${uid}-label`} />

    {#if type === "select"}
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
        <span class="min-w-0 flex-1 truncate {valueText ? '' : 'text-(--faint-color)'} {componentClass}">{valueText || $Tr("common.select_tag")}</span>
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
    {:else if type === "input"}
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
              class="flex h-8 w-full min-w-0 items-center justify-center px-3 py-2 text-[13px] font-semibold transition-colors duration-150
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
              aria-label={option.icon ? option.name : undefined}
              onmouseenter={() => (hoveredIndex = option.icon && option.name ? index : -1)}
              onmouseleave={() => (hoveredIndex = -1)}
            >
              {#if option.icon}
                <span class="flex h-[18px] min-w-[18px] items-center justify-center leading-none [&_svg]:h-full [&_svg]:w-full"
                  >{@html sanitizeHtml(option.icon)}</span
                >
              {:else if option.name}
                <span class="block truncate">{option.name}</span>
              {/if}
            </button>
            {#if option.icon && option.name}
              <Tooltip show={hoveredIndex === index} text={option.name} side="top" />
            {/if}
          </div>
        {/each}
      </div>
    {/if}

    {#if isOpen && type !== "buttons"}
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
              <span class="min-w-0 truncate">{option.name ?? String(option.value)}</span>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>
