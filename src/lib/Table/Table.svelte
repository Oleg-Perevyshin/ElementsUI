<!-- $lib/Table/Table.svelte - таблица: обычная (строки в body) или журнал (строки добавляет push() через bind:this, хранятся в кольцевом буфере) -->
<script lang="ts" generics="Row extends object">
  import { roundToClean } from "../number"
  import type { IOption, ITableButton, ITableContent, ITableHeader, ITableProps, ITableText } from "../types"
  import { fly, slide } from "svelte/transition"
  import { twMerge } from "tailwind-merge"
  import { accentStyle } from "../accent"
  import { onMount, tick, untrack, type Snippet } from "svelte"
  import { SvelteMap } from "svelte/reactivity"
  import ButtonClear from "../libIcons/ButtonClear.svelte"
  import { T } from "../locales/i18n"
  import Button from "../Button/Button.svelte"
  import Modal from "../Modal.svelte"
  import CopyButton from "./CopyButton.svelte"
  import { htmlToText, sanitizeHtml } from "../html"
  import { createRing } from "../ring"
  import { copyText } from "../clipboard"

  let {
    wrapperClass = "",
    accent,
    label = { name: "", class: "" },
    body = [],
    header = [],
    footer = "",
    dataBuffer = {},
    outline = false,
    cursor = null,
    loader,
    autoscroll = false,
    getData = () => {},
    onClick,
  }: ITableProps<Row> = $props()

  const stash = $derived(!!dataBuffer.stashData)
  const bufferSize = $derived(dataBuffer.bufferSize ?? 10)

  /* ********************************************************** */
  /* Журнал: кольцевой буфер вне реактивности, наружу - снимок строк один раз на пачку push() */
  type Entry = { key: number; row: Row }
  const ring = createRing<Entry>(untrack(() => bufferSize))
  let seq = 0
  let stream = $state.raw<Entry[]>([])
  let queued = false
  const flush = () => {
    queued = false
    const entries = ring.toArray()
    stream = dataBuffer.logger ? entries.reverse() : entries
  }

  /* Добавляет строки в журнал (dataBuffer.stashData); старые вытесняются за bufferSize */
  export const push = (rows: Row | Row[]) => {
    for (const row of Array.isArray(rows) ? rows : [rows]) ring.push({ key: ++seq, row })
    if (!queued) {
      queued = true
      queueMicrotask(flush)
    }
  }

  /* Очищает журнал */
  export const clear = () => {
    ring.clear()
    stream = []
    tableHeight = 0
  }

  $effect(() => {
    ring.resize(bufferSize)
    void dataBuffer.logger
    untrack(flush)
  })

  /* ********************************************************** */
  /* Обычная таблица: сортировка копии body, выбранные в списках значения - поверх строк до следующего body */
  let sortState = $state<{ key: keyof Row | null; direction: 1 | -1 }>({ key: null, direction: 1 })
  const picks = new SvelteMap<Row, Record<string, unknown>>()
  $effect.pre(() => {
    void body
    untrack(() => picks.clear())
  })

  const compare = (a: unknown, b: unknown): number => {
    if (typeof a === "number" && typeof b === "number") return a - b
    if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime()
    const strA = String(a).toLowerCase()
    const strB = String(b).toLowerCase()
    const numA = strA.match(/\d+/)?.[0]
    const numB = strB.match(/\d+/)?.[0]
    if (numA && numB && numA !== numB) return parseInt(numA, 10) - parseInt(numB, 10)
    return strA.localeCompare(strB)
  }

  const sortBy = (key: keyof Row) => (sortState = { key, direction: sortState.key === key ? (-sortState.direction as 1 | -1) : 1 })

  let entries: Entry[] = $derived.by(() => {
    if (stash) return stream.slice(-bufferSize)
    const rows = (body ?? []).filter((row) => Object.keys(row).length)
    const { key, direction } = sortState
    if (key !== null) rows.sort((a, b) => direction * compare(a[key], b[key]))
    return rows.map((row, i) => ({ key: i, row }))
  })

  /* Строка с выбранными значениями списков - её получают отрисовка и onClick */
  const withPicks = (row: Row): Row => {
    const picked = picks.get(row)
    return picked ? { ...row, ...picked } : row
  }

  /* Ключ выбранного значения списка: ключ вариантов без суффикса -S */
  const valueKey = (key: keyof Row) => String(key).replace(/-S$/, "")

  /* ********************************************************** */
  /* Разметка: шаблон колонок общий для шапки и строк; кнопка очистки - отдельная узкая колонка */
  const ACTIONS_COLUMN = "2.5rem"
  let gridTemplate = $derived(
    [...header.filter((c) => c.width !== "0%").map((c) => c.width || "minmax(0, 1fr)"), ...(dataBuffer.clearButton ? [ACTIONS_COLUMN] : [])].join(" "),
  )
  const columnContent = (column: ITableHeader<Row>, row: Row) => (typeof column.content === "function" ? column.content(row) : (column.content ?? []))
  const sortKey = (column: ITableHeader<Row>) =>
    typeof column.content === "function"
      ? undefined
      : column.content?.find((c): c is { type: "text"; data: ITableText<Row> } => c.type === "text" && !!c.data.sortable)?.data.key

  let container: HTMLElement | null = $state(null)
  let rowsEl: HTMLElement | null = $state(null)
  let scrollbarWidth = $state(0)
  let tableHeight = $state(0)
  let isAutoscroll = true

  /* Высота журнала - по первым visibleRows строкам; ширина полосы прокрутки - сдвиг шапки */
  const measure = () => {
    if (!container) return
    scrollbarWidth = container.offsetWidth - container.clientWidth
    if (!stash || !dataBuffer.visibleRows || !rowsEl) return
    let height = 0
    for (const row of [...rowsEl.children].slice(0, dataBuffer.visibleRows)) height += (row as HTMLElement).offsetHeight
    tableHeight = height
  }

  $effect(() => {
    void entries
    tick().then(() => {
      measure()
      if (autoscroll && isAutoscroll && !dataBuffer.logger && container) container.scrollTop = container.scrollHeight
    })
  })

  $effect(() => {
    if (!container) return
    const observer = new ResizeObserver(measure)
    observer.observe(container)
    return () => observer.disconnect()
  })

  const handleScroll = () => {
    if (!container) return
    const { scrollTop, clientHeight, scrollHeight } = container
    isAutoscroll = scrollHeight - scrollTop <= clientHeight + 50
    if (scrollTop + clientHeight >= scrollHeight - 50 && cursor !== null && loader && !loader()) getData()
  }

  /* ********************************************************** */
  /* Кнопки, списки, ячейки текста */

  const buttonClick = (row: Row, button: ITableButton<Row>) => (button.onClick ? button.onClick(row) : onClick?.(row, button))
  const resolve = <V,>(value: V | ((row: Row) => V), row: Row): V => (typeof value === "function" ? (value as (row: Row) => V)(row) : value)

  /* Кнопка без своего фона (bg-*) - прозрачная с акцентным текстом, с фоном - текст на акценте */
  const buttonClass = (button: ITableButton<Row>, row: Row) => {
    const cls = resolve(button.class, row) ?? ""
    const classes = cls.split(" ")
    const transparent = classes.includes("bg-transparent") || !classes.some((c) => c.startsWith("bg-"))
    return twMerge(
      "flex h-7 w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold transition-colors duration-150 outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-text)",
      transparent
        ? "bg-transparent text-(--accent-text) hover:bg-(--accent-soft)"
        : "border border-transparent text-(--on-accent) hover:brightness-90 dark:hover:brightness-115",
      cls,
    )
  }

  let dropdown: { row: number; col: number; index: number; rect: DOMRect } | null = $state(null)
  let slideDuration = $state(250)
  const toggleDropdown = (e: MouseEvent, row: number, col: number, index: number) =>
    (dropdown =
      dropdown?.row === row && dropdown.col === col && dropdown.index === index
        ? null
        : { row, col, index, rect: (e.currentTarget as HTMLElement).getBoundingClientRect() })

  const selectOption = (e: MouseEvent, row: Row, key: keyof Row, option: IOption<string | number>) => {
    e.stopPropagation()
    dropdown = null
    const field = valueKey(key)
    setTimeout(() => picks.set(row, { ...picks.get(row), [field]: option.value }), 250)
  }

  /* Содержимое ячейки: render или значение по key (варианты списка - их имена, объект - JSON) */
  const cellContent = (row: Row, text: ITableText<Row>): string => {
    if (text.render) return text.render(row)
    const value = row[text.key] as unknown
    if (Array.isArray(value) && value[0] && typeof value[0] === "object" && "value" in value[0]) return value.map((item: IOption) => item.name).join(", ")
    return value !== null && typeof value === "object" ? JSON.stringify(value) : String(value ?? "")
  }
  /* Видимый текст ячейки - для подсказки и копирования */
  const cellText = (row: Row, text: ITableText<Row>) => (text.html ? htmlToText(cellContent(row, text)) : cellContent(row, text))

  let tooltip = $state({ show: false, text: "", x: 0, y: 0 })

  /* Окно полного вида: сниппет столбца или содержимое ячейки целиком */
  let modalOpen = $state(false)
  let modal = $state.raw<{ row: Row; text: ITableText<Row> } | null>(null)
  const modalSnippet = $derived(typeof modal?.text.modal === "function" ? (modal.text.modal as Snippet<[Row]>) : null)

  const progressPercent = (value: number, min = 0, max = 100) =>
    value != null && !isNaN(value) ? ((Math.min(Math.max(value, min), max) - min) / (max - min)) * 100 : 0

  onMount(() => {
    /* Прокрутка страницы закрывает выпадающий список мгновенно, без анимации */
    const closeDropdown = () => {
      dropdown = null
      slideDuration = 0
      setTimeout(() => (slideDuration = 250), 10)
    }
    window.addEventListener("scroll", closeDropdown, true)
    window.addEventListener("resize", closeDropdown, true)
    return () => {
      window.removeEventListener("scroll", closeDropdown, true)
      window.removeEventListener("resize", closeDropdown, true)
    }
  })
</script>

<div class={twMerge(`flex h-full w-full flex-col overflow-hidden`, wrapperClass)} style={accentStyle(accent)}>
  {#if label.name}
    <span class={twMerge(`w-full pb-2 text-[12px] font-semibold text-(--muted-color)`, label.class)}>{label.name}</span>
  {/if}

  <div class="relative flex h-full w-full flex-col overflow-hidden rounded-[14px] border border-(--hairline-color) bg-(--back-color)">
    <!-- Шапка -->
    <div
      class="grid border-b border-(--hairline-color) bg-[var(--table-header-color,var(--accent-soft))] text-[11px] font-bold tracking-[0.06em] text-[color-mix(in_srgb,var(--accent-color)_35%,var(--font-color))] uppercase"
      style={`grid-template-columns: ${gridTemplate}; padding-right: ${scrollbarWidth}px;`}
    >
      {#each header as column, index (column)}
        {#if column.width !== "0%"}
          {@const key = sortKey(column)}
          <div
            class={twMerge(
              `flex items-center gap-1 border-l px-3 py-2 ${outline && index !== 0 ? "border-(--hairline-color)" : "border-transparent"}
            ${column.align === "center" ? "justify-center text-center" : column.align === "right" ? "justify-end text-right" : "justify-start text-left"}`,
              column.label?.class,
            )}
          >
            <span>{$T(column.label?.name ?? "")}</span>
            {#if key !== undefined && !stash}
              <button
                class="inline-flex cursor-pointer items-center rounded px-1 text-(--muted-color) transition-colors duration-150 hover:bg-(--back-color) hover:text-(--font-color)"
                onclick={() => sortBy(key)}
              >
                ↑↓
              </button>
            {/if}
          </div>
        {/if}
      {/each}
      {#if dataBuffer.clearButton}
        <div class="flex items-center justify-center tracking-normal normal-case">
          <Button
            componentClass={twMerge("size-7 p-1.5 text-(--muted-color) hover:text-(--red-text)", dataBuffer.clearClass)}
            content={{ icon: ButtonClear, info: { text: $T("common.table.clear"), side: "left" } }}
            onClick={clear}
          />
        </div>
      {/if}
    </div>

    {#if entries.length > 0}
      <!-- Тело с прокруткой -->
      <div class="relative flex-1 overflow-y-auto bg-(--back-color)" bind:this={container} onscroll={handleScroll}>
        <div
          class="min-w-0"
          bind:this={rowsEl}
          style={dataBuffer.visibleRows && tableHeight && entries.length > dataBuffer.visibleRows ? `height: ${tableHeight}px;` : ""}
        >
          {#each entries as entry, i (entry.key)}
            {@const row = withPicks(entry.row)}
            <div
              class="grid border-t border-(--hairline-color) transition-colors duration-150 hover:bg-(--accent-soft)"
              style={`grid-template-columns: ${gridTemplate};`}
            >
              {#each header as column, j (column)}
                {#if column.width !== "0%"}
                  {@const contents = columnContent(column, row) as ITableContent<Row>[]}
                  <div
                    class="relative grid min-h-7 w-full min-w-0 items-center gap-x-2 px-3 py-1 text-[length:var(--table-font-size,13px)] wrap-break-word
                    {column.align === 'center'
                      ? 'justify-center justify-items-center text-center'
                      : column.align === 'right'
                        ? 'justify-end justify-items-end text-right tabular-nums'
                        : 'justify-start justify-items-start text-left'}
                    {j !== 0 ? 'border-l' : ''} {outline ? 'border-(--hairline-color)' : 'border-transparent'} {column.disableSelect
                      ? 'select-none'
                      : 'select-all'}"
                    style="grid-template-columns: repeat({contents.length}, minmax(0, 1fr));"
                  >
                    {#each contents as content, index}
                      {#if content.type === "button"}
                        {@const button = resolve(content.data, row)}
                        {@const title = resolve(button.title, row)}
                        <button class="{buttonClass(button, row)} bg-(--bg-color)" onclick={() => buttonClick(row, button)} {title} aria-label={title}>
                          {#if button.icon}
                            <span class="flex size-4 shrink-0 items-center justify-center overflow-visible [&_svg]:h-full [&_svg]:w-full">
                              {#if typeof button.icon === "string"}
                                {@html sanitizeHtml(button.icon)}
                              {:else}
                                <button.icon />
                              {/if}
                            </span>
                          {/if}
                          {$T(resolve(button.name, row) ?? "")}
                        </button>
                      {:else if content.type === "select"}
                        {@const select = content.data}
                        {@const options = (Array.isArray(row[select.key]) ? row[select.key] : []) as IOption<string | number>[]}
                        {@const current = (row as Record<string, unknown>)[valueKey(select.key)]}
                        {@const open = dropdown?.row === i && dropdown.col === j && dropdown.index === index ? dropdown : null}
                        <div class="relative w-full select-none">
                          <button
                            class="h-7 w-full cursor-pointer rounded-lg border border-(--border-color) bg-(--field-color) px-2 text-left text-[13px] transition-[border-color,box-shadow] duration-150 outline-none hover:border-(--faint-color) focus:border-(--accent-text) focus:shadow-(--focus-shadow-color)"
                            onclick={(e) => toggleDropdown(e, i, j, index)}
                          >
                            {options.find((o) => o.value === current)?.name ?? $T("common.select_tag")}
                          </button>
                          {#if open}
                            <div
                              class="fixed z-50 max-h-[40vh] overflow-y-auto rounded-[10px] border border-(--hairline-color) bg-(--back-color) p-1 shadow-(--elevation-2)"
                              style="top: {open.rect.bottom + 4}px; left: {open.rect.left}px; width: {open.rect.width}px;"
                              transition:slide={{ duration: slideDuration }}
                            >
                              {#each options as option (option.id ?? option.value)}
                                <button
                                  class={twMerge(
                                    "flex h-8 w-full cursor-pointer items-center rounded-md px-2.5 text-left text-[13px] transition-colors duration-150 hover:bg-(--container-color)",
                                    option.accent && "text-(--accent-text)",
                                  )}
                                  style={accentStyle(option.accent)}
                                  onclick={(e) => selectOption(e, entry.row, select.key, option)}
                                >
                                  {option.name}
                                </button>
                              {/each}
                            </div>
                          {/if}
                        </div>
                      {:else if content.type === "image"}
                        {@const image = content.data}
                        {@const src = resolve(image.src, row)}
                        <div
                          class="flex items-center justify-center [&_svg]:h-full [&_svg]:max-h-full [&_svg]:w-full [&_svg]:max-w-full"
                          style={`width: ${image.width || "2rem"}; height: ${image.height || "2rem"};`}
                        >
                          {#if src}
                            <img {src} alt={image.alt ?? "Image"} class={twMerge("h-full w-full object-cover", image.class)} loading="lazy" />
                          {:else if typeof image.defaultIcon === "string"}
                            {@html sanitizeHtml(image.defaultIcon)}
                          {:else if image.defaultIcon}
                            <image.defaultIcon />
                          {/if}
                        </div>
                      {:else if content.type === "progressBar"}
                        {@const bar = content.data}
                        <div class="grid h-7 w-full grid-cols-[3.5rem_1fr] items-center gap-2">
                          <span class="text-right text-[12px] font-semibold tabular-nums">{roundToClean(Number(row[bar.key] ?? 0))}{bar.units}</span>
                          <div class="relative my-auto h-1.5 overflow-hidden rounded-full bg-(--container-color)">
                            <div
                              class="absolute top-0 left-0 flex h-full rounded-full bg-(--bg-color,var(--accent-color))"
                              style="width: {progressPercent(row[bar.key] as number, bar.minNum, bar.maxNum)}%;"
                            ></div>
                          </div>
                        </div>
                      {:else if content.type === "text"}
                        {@const text = content.data}
                        {@const value = cellContent(row, text)}
                        <!-- w-full + min-w-0: при justify-items-start ячейка иначе берёт ширину по содержимому и truncate не даёт «…» -->
                        <div class="flex w-full min-w-0 items-center">
                          <div
                            class="w-full max-w-full min-w-0 wrap-break-word {text.truncated ? 'truncate' : 'whitespace-normal'}"
                            onmouseenter={text.tooltip ? (e) => (tooltip = { show: true, text: cellText(row, text), x: e.clientX, y: e.clientY }) : undefined}
                            onmouseleave={text.tooltip ? () => (tooltip.show = false) : undefined}
                            onmousemove={text.tooltip ? (e) => ((tooltip.x = e.clientX), (tooltip.y = e.clientY)) : undefined}
                            role="presentation"
                          >
                            {#if text.modal}
                              <button
                                class="cursor-pointer text-left {text.truncated ? 'block w-full max-w-full truncate' : 'w-fit'}"
                                onclick={(e) => {
                                  e.stopPropagation()
                                  modal = { row, text }
                                  modalOpen = true
                                }}
                              >
                                {#if text.html}{@html sanitizeHtml(value)}{:else}{value}{/if}
                              </button>
                            {:else if text.html}
                              {@html sanitizeHtml(value)}
                            {:else}
                              {value}
                            {/if}
                          </div>
                          {#if text.copy}
                            <CopyButton class="ml-1.5" text={() => cellText(row, text)} />
                          {/if}
                        </div>
                      {/if}
                    {/each}
                  </div>
                {/if}
              {/each}
              {#if dataBuffer.clearButton}<div></div>{/if}
            </div>
          {/each}
        </div>
      </div>
    {/if}

    {#if tooltip.show}
      <div
        class="fixed z-50 w-max max-w-[30%] rounded-lg border border-(--hairline-color) bg-(--back-color) px-2.5 py-1.5 text-left text-[12px] font-medium wrap-break-word whitespace-pre-wrap shadow-(--elevation-2)"
        style="transform: translateX(-50%); left: {tooltip.x + 10}px; top: {tooltip.y + 10}px;"
        transition:fly={{ y: 8, duration: 200 }}
        role="tooltip"
      >
        {tooltip.text}
      </div>
    {/if}
    <!-- Нижнее поле для сводной информации -->
    {#if footer}
      <div class="flex h-8 items-center justify-center border-t border-(--hairline-color) bg-(--container-color)">
        <span class="text-[12px] font-semibold text-(--muted-color)">{footer}</span>
      </div>
    {/if}
  </div>
</div>

{#snippet copyFooter()}
  <Button
    content={{ name: $T("ui.copy_text") }}
    variant="primary"
    onClick={() => {
      if (modal) copyText(cellText(modal.row, modal.text))
      modalOpen = false
    }}
  />
{/snippet}

<Modal
  bind:isOpen={modalOpen}
  title={$T("common.table.fulldata")}
  wrapperClass="max-h-[80%]"
  width="{0.8 * (container?.offsetWidth ?? 0)}px"
  footer={modalSnippet ? undefined : copyFooter}
>
  {#snippet main()}
    {#if modal && modalSnippet}
      {@render modalSnippet(modal.row)}
    {:else if modal}
      <!-- Длинные строки переносятся, отступы сохраняются - содержимое видно целиком -->
      <div class="text-left whitespace-pre-wrap [overflow-wrap:anywhere]">
        {#if modal.text.html}{@html sanitizeHtml(cellContent(modal.row, modal.text))}{:else}{cellContent(modal.row, modal.text)}{/if}
      </div>
    {/if}
  {/snippet}
</Modal>
