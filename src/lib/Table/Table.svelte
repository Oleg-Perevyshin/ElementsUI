<!-- $lib/Table/Table.svelte - таблица: обычная (строки в body) или журнал (строки добавляет push() через bind:this, хранятся в кольцевом буфере) -->
<script lang="ts" generics="Row extends object">
  import FieldLabel from "../FieldLabel.svelte"
  import { columnId, defaultHiddenColumns } from "./columns"
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
  import Dropdown from "../Dropdown/Dropdown.svelte"
  import MoreIcon from "../libIcons/MoreIcon.svelte"
  import ArrowIcon from "../libIcons/ArrowIcon.svelte"
  import { htmlToText, sanitizeHtml } from "../html"
  import { createRing } from "../ring"
  import { copyText } from "../clipboard"
  import { isHoverPointer } from "../popup"

  let {
    wrapperClass = "",
    accent,
    label = { name: "", class: "" },
    help,
    body = [],
    header = [],
    hiddenColumns,
    footer = "",
    dataBuffer = {},
    outline = false,
    cursor = null,
    loader,
    autoscroll = false,
    getData = () => {},
    onClick,
    group,
    groupBy,
  }: ITableProps<Row> = $props()

  const stash = $derived(!!dataBuffer.stashData)
  const bufferSize = $derived(dataBuffer.bufferSize ?? 10)

  /* ********************************************************** */
  /* Журнал: кольцевой буфер вне реактивности, наружу - снимок строк в кадре отрисовки и не чаще FLUSH_MS: каждый снимок - раскладка всех строк таблицы, и при сотнях строк в секунду перерисовка на каждом кадре занимала главный поток целиком */
  const FLUSH_MS = 100
  type Entry = { key: number; row: Row }
  const ring = createRing<Entry>(untrack(() => bufferSize))
  let seq = 0
  let stream = $state.raw<Entry[]>([])
  let frame = 0
  let timer: ReturnType<typeof setTimeout> | undefined
  let flushedAt = 0
  const flush = () => {
    if (frame) cancelAnimationFrame(frame)
    clearTimeout(timer)
    frame = 0
    timer = undefined
    flushedAt = performance.now()
    const entries = ring.toArray()
    stream = dataBuffer.logger ? entries.reverse() : entries
  }

  /* Добавляет строки в журнал (dataBuffer.stashData); старые вытесняются за bufferSize; одиночная строка видна в ближайшем кадре, поток - снимками раз в FLUSH_MS */
  export const push = (rows: Row | Row[]) => {
    for (const row of Array.isArray(rows) ? rows : [rows]) ring.push({ key: ++seq, row })
    if (frame || timer) return
    const wait = flushedAt + FLUSH_MS - performance.now()
    if (wait <= 0) frame = requestAnimationFrame(flush)
    else timer = setTimeout(() => (frame = requestAnimationFrame(flush)), wait)
  }

  /* Очищает журнал */
  export const clear = () => {
    ring.clear()
    stream = []
    tableHeight = 0
    resetFit()
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

  /* Группа строки: функция приложения или groupBy из конструктора («*» - все остальные строки, без совпадения - пустая подпись) */
  const groupOf = $derived.by((): ((row: Row) => string) | undefined => {
    if (group) return group
    const by = groupBy
    if (!by?.key || !by.groups?.length) return undefined
    return (row) => {
      const value = String((row as Record<string, unknown>)[by.key] ?? "")
      return (by.groups.find((g) => g.value === value) ?? by.groups.find((g) => g.value === "*"))?.name ?? ""
    }
  })

  let entries: Entry[] = $derived.by(() => {
    if (stash) return stream.slice(-bufferSize)
    const rows = (body ?? []).filter((row) => Object.keys(row).length)
    const { key, direction } = sortState
    /* С группами порядок групп - как в groupBy (без группы - в конце) или как в body, сортировка - внутри группы */
    const order = new Map<string, number>()
    if (!group && groupOf) for (const g of groupBy!.groups) if (!order.has(g.name)) order.set(g.name, order.size)
    if (groupOf) for (const row of rows) if (!order.has(groupOf(row))) order.set(groupOf(row), groupOf(row) || group ? order.size : Infinity)
    const byGroup = (a: Row, b: Row) => (groupOf ? order.get(groupOf(a))! - order.get(groupOf(b))! || 0 : 0)
    if (key !== null || groupOf) rows.sort((a, b) => byGroup(a, b) || (key !== null ? direction * compare(a[key], b[key]) : 0))
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
  /* Узкая таблица: уже 640 px (как везде в библиотеке) или колонки с wide не помещаются - колонки wide уходят в подробности; ширина - места таблицы, а не окна */
  const NARROW_WIDTH = 640
  let rootWidth = $state(0)
  /* Ширина, которая была нужна таблице с колонками wide, когда они не поместились: шире - они возвращаются */
  let wideNeed = $state(0)
  const narrow = $derived(rootWidth > 0 && (rootWidth < NARROW_WIDTH || rootWidth < wideNeed))
  /* Столбец в строке таблицы: не скрыт шириной 0%, не только в подробностях и не wide на узкой таблице */
  /* Скрытые выбором колонок: заданные или по умолчанию (hidden) */
  const hiddenSet = $derived(new Set(hiddenColumns ?? defaultHiddenColumns(header)))
  const isHidden = (column: ITableHeader<Row>) => hiddenSet.has(columnId(column))
  const inTable = (column: ITableHeader<Row>) =>
    column.width !== "0%" && !isHidden(column) && column.place !== "details" && !(column.place === "wide" && narrow)
  /* Столбцы окна подробностей строки; есть хоть один - в конце строки кнопка «Подробнее» */
  const detailColumns = $derived(
    header
      .map((column, index) => ({ column, index }))
      .filter(({ column }) => !isHidden(column) && (column.place === "details" || column.place === "both" || (column.place === "wide" && narrow))),
  )
  const hasDetails = $derived(detailColumns.length > 0)
  const extraColumns = $derived([...(hasDetails ? [ACTIONS_COLUMN] : []), ...(dataBuffer.clearButton ? [ACTIONS_COLUMN] : [])])
  /* Колонка по содержимому: width "fit" или без width с одними кнопками */
  /* fill - тоже по содержимому, но делит свободную ширину с такими же колонками */
  const isFit = (column: ITableHeader<Row>) =>
    column.width === "fit" ||
    column.width === "fill" ||
    (!column.width && Array.isArray(column.content) && column.content.length > 0 && column.content.every((c) => c.type === "button" || c.type === "menu"))
  /* Ширины колонок по содержимому в px (замер после отрисовки), ключ - номер колонки в header */
  let fitWidths = $state<Record<number, number>>({})
  /* Ширина подписи шапки в одну строку (с кнопкой сортировки, отступами и рамкой), px: колонка не бывает уже, шапка не переносится */
  let headWidths = $state<Record<number, number>>({})
  const hasFit = $derived(header.some((c) => inTable(c) && isFit(c)))
  /* Рядом с колонкой по содержимому или служебной (кнопка подробностей, очистка журнала) проценты становятся долями остатка: "20%" - 20fr, иначе служебная колонка уходит за край */
  const shareRest = $derived(hasFit || hasDetails || !!dataBuffer.clearButton)
  const trackWidth = (column: ITableHeader<Row>, index: number) => {
    if (column.width === "fill") return `minmax(${fitWidths[index] ? `${fitWidths[index]}px` : "max-content"}, 1fr)`
    if (isFit(column)) return fitWidths[index] ? `${fitWidths[index]}px` : "max-content"
    const head = `${headWidths[index] ?? 0}px`
    if (!column.width) return `minmax(${head}, 1fr)`
    if (shareRest && column.width.endsWith("%")) return `minmax(${head}, ${parseFloat(column.width) || 1}fr)`
    return `minmax(${head}, ${column.width})`
  }
  const minWidth = (column: ITableHeader<Row>, index: number) => {
    if (isFit(column)) return fitWidths[index] ? `${fitWidths[index]}px` : "2.5rem"
    const head = `${headWidths[index] ?? 0}px`
    if (!column.width || column.width.includes("fr") || (shareRest && column.width.endsWith("%"))) return `max(5rem, ${head})`
    return `max(${column.width}, ${head})`
  }
  const visibleColumns = $derived(header.map((column, index) => ({ column, index })).filter(({ column }) => inTable(column)))
  let gridTemplate = $derived([...visibleColumns.map(({ column, index }) => trackWidth(column, index)), ...extraColumns].join(" "))
  /* Наименьшая ширина таблицы: заданные ширины колонок и по 5rem на гибкие; уже - прокрутка вбок, а не обрезка */
  let minTableWidth = $derived(`calc(${[...visibleColumns.map(({ column, index }) => minWidth(column, index)), ...extraColumns].join(" + ")})`)
  const columnContent = (column: ITableHeader<Row>, row: Row) => (typeof column.content === "function" ? column.content(row) : (column.content ?? []))
  /* Ключ сортировки - текст с sortable; содержимое по строке берётся у первой строки */
  const sortKey = (column: ITableHeader<Row>) => {
    const contents = typeof column.content === "function" ? (body[0] ? column.content(body[0]) : []) : (column.content ?? [])
    return contents.find((c): c is { type: "text"; data: ITableText<Row> } => c.type === "text" && !!c.data.sortable)?.data.key
  }

  let container: HTMLElement | null = $state(null)
  let rowsEl: HTMLElement | null = $state(null)
  let scrollbarWidth = $state(0)
  let tableHeight = $state(0)
  let isAutoscroll = true

  /* Высота журнала - по первым visibleRows строкам; ширина полосы прокрутки - сдвиг шапки */
  const measure = () => {
    measureHeads()
    measureFit()
    measureWide()
    if (!container) return
    scrollbarWidth = container.offsetWidth - container.clientWidth
    if (!stash || !dataBuffer.visibleRows || !rowsEl) return
    let height = 0
    for (const row of [...rowsEl.children].slice(0, dataBuffer.visibleRows)) height += (row as HTMLElement).offsetHeight
    tableHeight = height
  }

  /* Колонки wide не помещаются (таблица шире своего места) - запоминается нужная ширина, и они уходят в подробности, пока места не станет больше */
  const measureWide = () => {
    if (!tableEl || narrow || !header.some((column) => column.place === "wide" && inTable(column))) return
    const need = tableEl.scrollWidth
    if (need > rootWidth + 1) wideNeed = need
  }

  /* Подпись шапки в одну строку: ширины её элементов (подпись не сжимается - nowrap) с промежутками, отступами и рамкой ячейки */
  const measureHeads = () => {
    if (!tableEl) return
    const widths: Record<number, number> = {}
    for (const cell of tableEl.querySelectorAll<HTMLElement>("[data-head]")) {
      const items = [...cell.children] as HTMLElement[]
      const style = getComputedStyle(cell)
      const gap = parseFloat(style.columnGap) || 0
      const content = items.reduce((sum, el) => sum + el.offsetWidth, 0) + gap * Math.max(0, items.length - 1)
      widths[Number(cell.dataset.head)] = Math.ceil(
        content + parseFloat(style.paddingLeft) + parseFloat(style.paddingRight) + parseFloat(style.borderLeftWidth),
      )
    }
    if (Object.keys(widths).some((key) => widths[+key] !== headWidths[+key]) || Object.keys(widths).length !== Object.keys(headWidths).length)
      headWidths = widths
  }

  /* Ширина колонки по содержимому: от левого края первого до правого края последнего элемента ячейки плюс отступы и рамка ячейки; берётся наибольшая по шапке и строкам */
  /* Журнал (stashData) меряет только новые ячейки и держит наибольшую ширину: полный замер всех строк на каждом кадре пересчитывал раскладку всей таблицы и при сотнях строк в секунду занимал главный поток */
  let tableEl: HTMLElement | null = $state(null)
  let fitMeasured = new WeakSet<HTMLElement>()
  const resetFit = () => {
    fitMeasured = new WeakSet()
    fitWidths = {}
  }
  $effect(() => {
    void header
    void hiddenColumns
    untrack(resetFit)
  })
  const measureFit = () => {
    if (!tableEl || !hasFit) return
    const widths: Record<number, number> = stash ? { ...fitWidths } : {}
    for (const cell of tableEl.querySelectorAll<HTMLElement>("[data-fit]")) {
      if (stash && fitMeasured.has(cell)) continue
      if (stash) fitMeasured.add(cell)
      const items = [...cell.children] as HTMLElement[]
      if (!items.length) continue
      /* Текст в колонке по содержимому не переносится: его ширина - по самому тексту, а не по блоку ячейки */
      const origin = cell.getBoundingClientRect().left + cell.clientLeft
      const box = (el: HTMLElement) => {
        if (!("text" in el.dataset)) return { left: el.offsetLeft, right: el.offsetLeft + el.offsetWidth }
        /* Края текста внутри: блоки ячейки растянуты на всю ширину и не в счёт */
        const rects: DOMRect[] = []
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
          if (!node.textContent?.trim()) continue
          const range = document.createRange()
          range.selectNodeContents(node)
          rects.push(range.getBoundingClientRect())
        }
        /* Блоки по содержимому (подложка значка, кнопка-текст) - целиком, с их отступами */
        for (const fitted of el.querySelectorAll<HTMLElement>(".w-fit")) rects.push(fitted.getBoundingClientRect())
        /* Кнопки-значки (копирование) - своей шириной с отступами: при узкой колонке они наезжают на текст, и их края не годятся */
        const buttons = [...el.querySelectorAll("button")].filter((button) => !button.textContent?.trim())
        const extra = buttons.reduce((sum, button) => {
          const style = getComputedStyle(button)
          return sum + button.offsetWidth + parseFloat(style.marginLeft) + parseFloat(style.marginRight)
        }, 0)
        if (!rects.length) return { left: el.offsetLeft, right: el.offsetLeft + extra }
        const left = Math.min(...rects.map((r) => r.left)) - origin
        return { left, right: Math.max(...rects.map((r) => r.right)) - origin + extra }
      }
      const boxes = items.map(box)
      const style = getComputedStyle(cell)
      /* Элементы в ряд (бейджи счётчиков) в узкой колонке наезжают друг на друга: ширина - сумма их собственных ширин с промежутками, столбиком - самый широкий */
      const inRow = items.length > 1 && !style.flexDirection.startsWith("column")
      const span = inRow
        ? boxes.reduce((sum, b) => sum + (b.right - b.left), 0) + (parseFloat(style.columnGap) || 0) * (items.length - 1)
        : Math.max(...boxes.map((b) => b.right)) - Math.min(...boxes.map((b) => b.left))
      const width = Math.ceil(span + parseFloat(style.paddingLeft) + parseFloat(style.paddingRight) + parseFloat(style.borderLeftWidth))
      const index = Number(cell.dataset.fit)
      widths[index] = Math.max(widths[index] ?? 0, width)
    }
    if (Object.keys(widths).some((key) => widths[+key] !== fitWidths[+key]) || Object.keys(widths).length !== Object.keys(fitWidths).length) fitWidths = widths
  }

  /* Следующая порция, когда низ таблицы виден: при прокрутке и если строки ещё не заполнили высоту таблицы */
  const loadMore = () => {
    if (!container || cursor === null || !loader || loader()) return
    const { scrollTop, clientHeight, scrollHeight } = container
    if (scrollTop + clientHeight >= scrollHeight - 50) getData()
  }

  $effect(() => {
    void entries
    void header
    tick().then(() => {
      measure()
      if (autoscroll && isAutoscroll && !dataBuffer.logger && container) container.scrollTop = container.scrollHeight
      loadMore()
    })
  })

  $effect(() => {
    if (!container) return
    const observer = new ResizeObserver(() => {
      measure()
      loadMore()
    })
    observer.observe(container)
    return () => observer.disconnect()
  })

  const handleScroll = () => {
    if (!container) return
    const { scrollTop, clientHeight, scrollHeight } = container
    isAutoscroll = scrollHeight - scrollTop <= clientHeight + 50
    loadMore()
  }

  /* ********************************************************** */
  /* Кнопки, списки, ячейки текста */

  const buttonClick = (row: Row, button: ITableButton<Row>) => (button.onClick ? button.onClick(row) : onClick?.(row, button))
  const resolve = <V,>(value: V | ((row: Row) => V), row: Row): V => (typeof value === "function" ? (value as (row: Row) => V)(row) : value)

  /* Кнопка без своего фона (bg-*) - прозрачная с акцентным текстом, с фоном - текст на акценте */
  const buttonClass = (button: ITableButton<Row>, row: Row, fit: boolean) => {
    const cls = resolve(button.class, row) ?? ""
    const classes = cls.split(" ")
    const transparent = classes.includes("bg-transparent") || !classes.some((c) => c.startsWith("bg-"))
    return twMerge(
      "flex h-7 w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold transition-[color,background-color,filter,scale] duration-150 outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-text) active:scale-[0.97] active:brightness-85",
      transparent
        ? "bg-transparent text-(--accent-text) hover:bg-(--accent-soft)"
        : "border border-transparent text-(--on-accent) hover:brightness-90 dark:hover:brightness-115",
      fit && "w-auto shrink-0",
      /* Кнопка-значок без подписи - квадрат по высоте строки */
      button.icon && !resolve(button.name, row) && "aspect-square w-7 shrink-0 px-0",
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

  /* Окно подробностей: ключ строки, а не сама строка - содержимое обновляется вместе с таблицей */
  let detailsOpen = $state(false)
  let detailsKey = $state<number | null>(null)
  const detailsEntry = $derived(detailsKey === null ? null : (entries.find((e) => e.key === detailsKey) ?? null))
  const detailsIndex = $derived(detailsEntry ? entries.indexOf(detailsEntry) : -1)

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
      cancelAnimationFrame(frame)
      clearTimeout(timer)
    }
  })
</script>

<div class={twMerge(`flex h-full w-full flex-col overflow-hidden`, wrapperClass)} style={accentStyle(accent)} bind:clientWidth={rootWidth}>
  <FieldLabel {label} info={help?.info ? $T(help.info) : undefined} class="w-full pb-2" />

  <div class="relative flex h-full w-full flex-col overflow-x-auto overflow-y-hidden rounded-[14px] border border-(--hairline-color) bg-(--back-color)">
    <div class="flex min-h-0 w-full flex-1 flex-col" style="min-width: {minTableWidth};" bind:this={tableEl}>
      <!-- Шапка -->
      <div
        class="grid border-b border-(--hairline-color) bg-[var(--table-header-color,var(--accent-soft))] text-[12px] font-semibold text-[color-mix(in_srgb,var(--accent-color)_35%,var(--font-color))]"
        style={`grid-template-columns: ${gridTemplate}; padding-right: ${scrollbarWidth}px;`}
      >
        {#each header as column, index (column)}
          {#if inTable(column)}
            {@const key = sortKey(column)}
            <div
              data-fit={isFit(column) ? index : undefined}
              data-head={index}
              class={twMerge(
                `flex items-center gap-1 px-3 py-2 whitespace-nowrap ${index !== 0 ? "border-l" : ""} ${outline ? "border-(--hairline-color)" : "border-transparent"}
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
        {#if hasDetails}<div></div>{/if}
        {#if dataBuffer.clearButton}
          <div class="flex items-center justify-center">
            <Button
              componentClass={twMerge("size-7 text-(--red-text) hover:bg-(--red-color)/10", dataBuffer.clearClass)}
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
              {#if groupOf && !stash && groupOf(entry.row) && (i === 0 || groupOf(entries[i - 1].row) !== groupOf(entry.row))}
                <!-- Подпись группы во всю ширину строки -->
                <div
                  class="border-t border-(--hairline-color) bg-(--container-color) px-3 py-1.5 text-[12px] font-semibold text-[color-mix(in_srgb,var(--accent-color)_35%,var(--font-color))] {i ===
                  0
                    ? 'border-t-0'
                    : ''}"
                >
                  {$T(groupOf(entry.row))}
                </div>
              {/if}
              <div
                class="grid border-t border-(--hairline-color) transition-colors duration-150 hover:bg-(--accent-soft)"
                style={`grid-template-columns: ${gridTemplate};`}
              >
                {#each header as column, j (column)}
                  {#if inTable(column)}
                    {@const contents = columnContent(column, row) as ITableContent<Row>[]}
                    <!-- Одни бейджи - вплотную с переносом; stack - столбиком; иначе - в ряд равными долями -->
                    {@const badges = contents.length > 1 && contents.every((c) => c.type === "text" && c.data.badge)}
                    {@const fit = isFit(column)}
                    {@const fitStack = fit && column.stack}
                    <!-- Колонка по содержимому: элементы своей ширины без переноса - в ряд, со stack столбиком -->
                    <div
                      data-fit={fit ? j : undefined}
                      class="relative {fitStack
                        ? 'flex flex-col justify-center whitespace-nowrap'
                        : fit
                          ? 'flex items-center gap-2 whitespace-nowrap'
                          : badges
                            ? 'flex flex-wrap items-center gap-1'
                            : 'grid items-center gap-x-2'} min-h-7 w-full min-w-0 px-3 py-1 text-[length:var(--table-font-size,13px)] wrap-break-word
                    {column.align === 'center'
                        ? `${fitStack ? 'items-center' : 'justify-center justify-items-center'} text-center`
                        : column.align === 'right'
                          ? `${fitStack ? 'items-end' : 'justify-end justify-items-end'} text-right tabular-nums`
                          : `${fitStack ? 'items-start' : 'justify-start justify-items-start'} text-left`}
                    {j !== 0 ? 'border-l' : ''} {outline ? 'border-(--hairline-color)' : 'border-transparent'} {column.disableSelect
                        ? 'select-none'
                        : 'select-all'}"
                      style={badges || fit
                        ? undefined
                        : `grid-template-columns: ${column.stack ? "minmax(0, 1fr)" : `repeat(${contents.length}, minmax(0, 1fr))`};`}
                    >
                      {@render items(row, entry.row, contents, fit, i, j)}
                    </div>
                  {/if}
                {/each}
                {#if hasDetails}
                  <div class="flex items-center justify-center">
                    <Button
                      componentClass="size-7 text-(--accent-text) hover:bg-(--accent-soft)"
                      content={{ icon: ArrowIcon, info: { text: $T("common.table.details"), side: "left" } }}
                      onClick={() => {
                        detailsKey = entry.key
                        detailsOpen = true
                      }}
                    />
                  </div>
                {/if}
                {#if dataBuffer.clearButton}<div></div>{/if}
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>

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
      <div class="sticky left-0 flex h-8 shrink-0 items-center justify-center border-t border-(--hairline-color) bg-(--container-color)">
        <span class="text-[12px] font-semibold text-(--muted-color)">{footer}</span>
      </div>
    {/if}
  </div>
</div>

<!-- Содержимое ячейки - общее для строки таблицы и окна подробностей; entryRow - исходная строка (ключ выбранных значений списков), i и j - строка и столбец выпадающего списка -->
{#snippet items(row: Row, entryRow: Row, contents: ITableContent<Row>[], fit: boolean, i: number, j: number)}
  {#each contents as content, index}
    {#if content.type === "button"}
      {@const button = resolve(content.data, row)}
      {@const title = resolve(button.title, row)}
      {#if (!button.hideIf?.key || String((row as Record<string, unknown>)[button.hideIf.key] ?? "") !== String(button.hideIf.value ?? "")) && (!button.showIf?.key || String((row as Record<string, unknown>)[button.showIf.key] ?? "") === String(button.showIf.value ?? ""))}
        <button
          class="{buttonClass(button, row, fit)} bg-(--bg-color)"
          style={accentStyle(resolve(button.accent, row))}
          onclick={() => buttonClick(row, button)}
          {title}
          aria-label={title}
        >
          {#if button.icon}
            <span class="flex size-(--icon-size) shrink-0 items-center justify-center overflow-visible [&_svg]:size-full">
              {#if typeof button.icon === "string"}
                {@html sanitizeHtml(button.icon)}
              {:else}
                <button.icon />
              {/if}
            </span>
          {/if}
          {$T(resolve(button.name, row) ?? "")}
        </button>
      {/if}
    {:else if content.type === "menu"}
      <Dropdown
        align="end"
        button={{
          variant: "plain",
          wrapperClass: "w-fit shrink-0",
          componentClass: "aspect-auto h-7 w-auto rounded-lg px-2 py-0",
          content: {
            icon: content.data.icon ?? MoreIcon,
            info: content.data.title ? { text: $T(content.data.title), side: "left" } : undefined,
          },
        }}
        items={content.data.items(row)}
      />
    {:else if content.type === "select"}
      {@const select = content.data}
      {@const options = (Array.isArray(row[select.key]) ? row[select.key] : []) as IOption<string | number>[]}
      {@const current = (row as Record<string, unknown>)[valueKey(select.key)]}
      {@const open = dropdown?.row === i && dropdown.col === j && dropdown.index === index ? dropdown : null}
      <div class="cell-select relative w-full select-none">
        <button
          class="h-7 w-full cursor-pointer rounded-lg border border-(--border-color) bg-(--field-color) px-2 text-left text-[13px] transition-[border-color,box-shadow] duration-150 outline-none hover:border-(--faint-color) focus:border-(--accent-text) focus:shadow-(--focus-shadow-color)"
          onclick={(e) => toggleDropdown(e, i, j, index)}
        >
          {options.find((o) => o.value === current)?.name ?? $T("common.select_tag")}
        </button>
        {#if open}
          <div
            class="fixed z-[300] max-h-[40vh] overflow-y-auto rounded-[10px] border border-(--hairline-color) bg-(--back-color) p-1 shadow-(--elevation-2)"
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
                onclick={(e) => selectOption(e, entryRow, select.key, option)}
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
      {@const accent = text.accent?.(row)}
      <!-- w-full + min-w-0: при justify-items-start ячейка иначе берёт ширину по содержимому и truncate не даёт «…»; 
 в тексте - перенос строки -->
      {@const nowrap = fit && i >= 0}
      <div class="flex w-full min-w-0 items-center" data-text>
        <div
          class="max-w-full min-w-0 wrap-break-word {nowrap ? 'whitespace-pre' : text.truncated ? 'truncate' : 'whitespace-pre-line'} {accent
            ? 'text-(--accent-text)'
            : ''} {accent && text.badge ? 'w-fit rounded-md bg-(--accent-soft) px-1.5 text-[12px] font-medium' : 'w-full'}"
          style={accentStyle(accent)}
          onpointerenter={text.tooltip
            ? (e) => {
                if (!isHoverPointer(e)) return
                const tip = typeof text.tooltip === "function" ? text.tooltip(row) : cellText(row, text)
                if (tip) tooltip = { show: true, text: tip, x: e.clientX, y: e.clientY }
              }
            : undefined}
          onpointerleave={text.tooltip ? () => (tooltip.show = false) : undefined}
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
          {:else if text.onClick}
            <button
              class="cursor-pointer text-left hover:underline {text.truncated ? 'block w-full max-w-full truncate' : ''}"
              onclick={(e) => {
                e.stopPropagation()
                text.onClick?.(row)
              }}
            >
              {value}
            </button>
          {:else if text.href}
            <a class="underline" href={text.href(row)}>{value}</a>
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
{/snippet}

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

<Modal bind:isOpen={detailsOpen} title={$T("common.table.details")} width="min(36rem, 92vw)">
  {#snippet main()}
    {#if detailsEntry}
      {@const row = withPicks(detailsEntry.row)}
      <!-- Строки разделены чертой, название жирным и отделено вертикальной чертой; на узком окне название над значением -->
      <div class="@container flex flex-col divide-y divide-(--border-color) text-left">
        {#each detailColumns as { column, index } (index)}
          <div class="group grid @sm:grid-cols-[9rem_minmax(0,1fr)]">
            <div class="flex items-center pt-3 text-[13px] font-bold group-first:pt-0 @sm:py-3 @sm:pr-4 @sm:group-last:pb-0">
              {$T(column.label?.name ?? "")}
            </div>
            <!-- Выпадающие списки окна - со своими номерами строк, чтобы не открывался список той же ячейки в таблице -->
            <!-- Список и кнопки в одну строку: список забирает остаток ширины, на перенос уходит только при ширине меньше 10rem -->
            <div
              class="flex min-w-0 flex-wrap items-center gap-2 pt-1.5 pb-3 text-[13px] group-last:pb-0 @sm:border-l @sm:border-(--border-color) @sm:py-3 @sm:pl-4 @sm:group-first:pt-0 [&>*]:min-w-0 [&>.cell-select]:w-auto [&>.cell-select]:flex-1 [&>.cell-select]:basis-40"
            >
              {@render items(row, detailsEntry.row, columnContent(column, row) as ITableContent<Row>[], true, -1 - detailsIndex, index)}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  {/snippet}
</Modal>
