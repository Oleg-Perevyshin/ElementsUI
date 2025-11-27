<!-- $lib/ElementsUI/Table.svelte -->
<script lang="ts">
  import { get } from 'svelte/store'
  import type { ITableHeader, ITableProps } from '../types'
  import { fade, fly } from 'svelte/transition'
  import { twMerge } from 'tailwind-merge'
  import { onMount } from 'svelte'

  let {
    id = crypto.randomUUID(),
    wrapperClass = '',
    label = { name: '', class: '' },
    body = [],
    header = [],
    footer = '',
    outline = false,
    cursor = null,
    loader,
    autoscroll = false,
    getData = () => {},
    modalData = $bindable(),
    onClick,
  }: ITableProps<any> = $props()

  /* Сортировка */
  let sortState: {
    key: string | null
    direction: 'asc' | 'desc' | null
  } = {
    key: null,
    direction: null,
  }

  let isAutoscroll = $state(false)

  /* Сортировка столбцов */
  const sortRows = (key: string) => {
    if (sortState.key === key) {
      sortState.direction = sortState.direction === 'asc' ? 'desc' : 'asc'
    } else {
      sortState.key = key
      sortState.direction = 'asc'
    }

    body = [...body].sort((a, b) => {
      const aValue = a[key]
      const bValue = b[key]
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortState.direction === 'asc' ? aValue - bValue : bValue - aValue
      }
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortState.direction === 'asc' ? aValue.getTime() - bValue.getTime() : bValue.getTime() - aValue.getTime()
      }
      const strA = String(aValue).toLowerCase()
      const strB = String(bValue).toLowerCase()
      const numA = strA.match(/\d+/g)?.[0] || ''
      const numB = strB.match(/\d+/g)?.[0] || ''
      if (numA && numB) {
        const numCompare = parseInt(numA, 10) - parseInt(numB, 10)
        if (numCompare !== 0) {
          return sortState.direction === 'asc' ? numCompare : -numCompare
        }
      }
      const stringCompare = strA.localeCompare(strB)
      return sortState.direction === 'asc' ? stringCompare : -stringCompare
    })
  }

  /* Запрос данных, если в конце списка */
  let container: HTMLElement | null = $state(null)
  function handleScroll() {
    if (!container) return
    const { scrollTop, clientHeight, scrollHeight } = container
    if (scrollTop + clientHeight >= scrollHeight - 50 && cursor !== null && loader && !get(loader)) {
      getData()
    }
  }

  /* Обработчик автоскролла */
  const handleAutoScroll = () => {
    if (!container) return

    isAutoscroll = !(container.scrollHeight - container.scrollTop <= container.clientHeight + 50)
  }
  const scrollToBottom = () => {
    if (!isAutoscroll && container) {
      container.scrollTop = container.scrollHeight
    }
  }
  $effect(() => {
    if (body.length > 0) {
      scrollToBottom()
    }
  })

  function buttonClick(row: any, button: any) {
    if (button.onClick) button.onClick(row)
    else if (button.eventHandler && onClick) {
      let value: Record<string, boolean | string | number | number[] | object | null> = {}
      button.eventHandler.Variables.forEach((v: string) => {
        value[v] = row[v]
      })
      button.eventHandler.Value = JSON.stringify(value)
      onClick(button.eventHandler)
    }
  }

  let copiedCell = $state({ x: '', y: -1 })
  let tooltip = $state({
    show: false,
    text: '',
    x: 0,
    y: 0,
  })

  const showModal = async (text: string, formatting?: (text: string) => string) => {
    modalData = {
      isOpen: true,
      rawData: text,
      formattedData: formatting ? formatting(text) : (text ?? ''),
    }
  }

  const showTooltip = (event: MouseEvent, text: string, formatting?: (text: string) => string) => {
    tooltip = {
      show: true,
      text: formatting ? formatting(text) : (text ?? ''),
      x: event.clientX,
      y: event.clientY,
    }
  }

  const hideTooltip = () => {
    tooltip.show = false
  }

  /* Для работы этой проверки в описании столбцов таблицы нужно явно указать что строка будет пустая при отсутствии иконки в БД -
     src: (row) => (row.icon ? `data:image/png;base64,${row.icon}` : '') */
  const hasImage = (column: ITableHeader<any>, row: any): boolean => {
    const src = typeof column.image?.src === 'function' ? column.image.src(row) : column.image?.src
    return !!src
  }

  onMount(() => {
    if (autoscroll) {
      container?.addEventListener('scroll', handleAutoScroll)
      scrollToBottom()
    }

    return () => {
      if (autoscroll) {
        container?.removeEventListener('scroll', handleAutoScroll)
      }
    }
  })
</script>

<div id={`${id}-${crypto.randomUUID().slice(0, 6)}`} class={twMerge(`bg-blue flex h-full w-full flex-col overflow-hidden`, wrapperClass)}>
  {#if label.name}
    <h5 class={twMerge(`w-full px-4 text-center`, label.class)}>{label.name}</h5>
  {/if}

  <div
    class="flex h-full flex-col overflow-hidden rounded-xl border shadow-sm transition duration-200 hover:shadow-md {outline
      ? ' border-(--border-color)'
      : 'border-transparent'} "
  >
    <!-- Table Header -->
    <div class="grid font-semibold" style={`grid-template-columns: ${header.map((c) => c.width || 'minmax(0, 1fr)').join(' ')};`}>
      {#each header as column, index (column)}
        <div
          class={twMerge(
            `items-center justify-center border-l ${outline && index !== 0 ? ' border-(--border-color)' : 'border-transparent'} ${
              column.align?.header === 'center'
                ? 'flex justify-center text-center'
                : column.align?.header === 'right'
                  ? 'flex justify-end text-right'
                  : 'flex justify-start text-left'
            } gap-1 bg-(--bg-color) p-2 text-left`,
            column.label?.class,
          )}
        >
          <span>{column.label?.name}</span>
          {#if column.sortable}
            <button
              class="inline-block cursor-pointer font-bold transition-transform duration-75 hover:scale-110 active:scale-95"
              onclick={() => sortRows(column.key as string)}
            >
              ↑↓
            </button>
          {/if}
        </div>
      {/each}
    </div>

    <!-- Table Body с прокруткой -->
    <div class="flex-1 overflow-y-auto bg-(--container-color)/50" bind:this={container} onscroll={handleScroll}>
      <div class="grid min-w-0" style={`grid-template-columns: ${header.map((c) => c.width || 'minmax(0, 1fr)').join(' ')};`}>
        {#each body as row, index (row)}
          {#each header as column, j (column)}
            <div
              class="relative flex w-full min-w-0 items-center px-2 py-1 wrap-break-word
              {index % 2 ? 'bg-(--back-color)/40' : 'bg-[#edeef3] dark:bg-[#1f2a3a]'}
              {column.align?.content === 'center'
                ? 'flex justify-center text-center'
                : column.align?.content === 'right'
                  ? 'flex justify-end text-right'
                  : 'flex justify-start text-left'}
              border-t
              {j !== 0 ? ' border-l ' : ''}
              {outline ? 'border-(--border-color)' : 'border-transparent'}  "
            >
              {#if column.buttons}
                <div class="flex w-full flex-col gap-1">
                  {#each column.buttons as button (button)}
                    <button
                      class="{twMerge(`cursor-pointer rounded-full 
                           px-4 py-1 font-medium shadow-sm transition-shadow duration-200 outline-none select-none hover:shadow-md
                          ${typeof button.class === 'function' ? button.class(row) : button.class}`)} bg-(--bg-color)"
                      onclick={() => buttonClick(row, button)}
                    >
                      {typeof button.name === 'function' ? button.name(row) : button.name}
                    </button>
                  {/each}
                </div>
              {:else if column.image?.src || column.image?.defaultIcon}
                <div
                  class="flex items-center justify-center"
                  style={`width: ${column.image.width || '5rem'}; height: ${column.image.height || '5rem'};`}
                >
                  {#if hasImage(column, row)}
                    <img
                      src={typeof column.image?.src === 'function' ? column.image.src(row) : column.image?.src || ''}
                      alt={column.image.alt ?? 'Image'}
                      class={twMerge(`h-full w-full object-cover ${column.image.class || ''}`)}
                      loading="lazy"
                    />
                  {:else if column.image.defaultIcon}
                    {#if typeof column.image.defaultIcon === 'string'}
                      {@html column.image.defaultIcon}
                    {:else}
                      <column.image.defaultIcon />
                    {/if}
                  {/if}
                </div>
              {:else}
                <div
                  class=" w-full max-w-full wrap-break-word {column.overflow?.truncated ? 'truncate' : ' whitespace-normal'}"
                  onmouseenter={column.overflow?.truncated ? (e) => showTooltip(e, row[column.key], column.overflow?.formatting) : undefined}
                  onmouseleave={column.overflow?.truncated ? hideTooltip : undefined}
                  onmousemove={column.overflow?.truncated
                    ? (e) => {
                        tooltip.x = e.clientX
                        tooltip.y = e.clientY
                      }
                    : undefined}
                  role="columnheader"
                  tabindex={null}
                >
                  {#if column.overflow?.modal}
                    <button
                      class="w-full cursor-pointer overflow-hidden text-left text-ellipsis whitespace-nowrap"
                      onclick={(e) => {
                        e.stopPropagation()
                        showModal(row[column.key], column.overflow?.formatting)
                      }}
                    >
                      {@html row[column.key]}
                    </button>
                  {:else}
                    {@html row[column.key]}
                  {/if}
                </div>
                <!-- {#if column.overflow?.truncated}
                  <div class="whitespace-nowrap">{row[column.key].slice(-5)}</div>
                {/if} -->

                {#if column.overflow?.copy}
                  <button
                    class="mx-2 flex cursor-pointer border-none bg-transparent text-2xl"
                    onclick={(e) => {
                      e.preventDefault()
                      navigator.clipboard.writeText(row[column.key])
                      copiedCell = { x: column.key as string, y: index }
                      setTimeout(() => (copiedCell = { x: '', y: -1 }), 1000)
                    }}
                    aria-label="Копировать текст"
                  >
                    <div class=" size-5 text-sm [&_svg]:h-full [&_svg]:max-h-full [&_svg]:w-full [&_svg]:max-w-full">
                      {#if copiedCell.y === index && copiedCell.x === column.key}
                        <div
                          class="absolute top-1/2 right-3.5 -translate-y-1/2 transform rounded-md bg-(--green-color) px-1.5 py-1 shadow-lg"
                          transition:fade={{ duration: 200 }}
                        >
                          ✓
                        </div>
                      {:else}
                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                          <g fill="none" stroke="currentColor" stroke-width="1.5">
                            <path
                              d="M6 11c0-2.828 0-4.243.879-5.121C7.757 5 9.172 5 12 5h3c2.828 0 4.243 0 5.121.879C21 6.757 21 8.172 21 11v5c0 2.828 0 4.243-.879 5.121C19.243 22 17.828 22 15 22h-3c-2.828 0-4.243 0-5.121-.879C6 20.243 6 18.828 6 16z"
                            />
                            <path d="M6 19a3 3 0 0 1-3-3v-6c0-3.771 0-5.657 1.172-6.828S7.229 2 11 2h4a3 3 0 0 1 3 3" />
                          </g>
                        </svg>
                      {/if}
                    </div>
                  </button>
                {/if}
              {/if}
            </div>
          {/each}
        {/each}
      </div>
    </div>

    {#if tooltip.show}
      <div
        class="fixed z-50 w-max max-w-[30%] rounded-md px-2 py-1 text-left text-sm whitespace-pre-wrap shadow-lg"
        style="background: color-mix(in srgb, var(--yellow-color) 30%, var(--back-color)); transform: translateX(-50%); left: {tooltip.x +
          10}px; top: {tooltip.y + 10}px;"
        transition:fly={{ y: 10, duration: 200 }}
        role="tooltip"
      >
        {@html tooltip.text}
      </div>
    {/if}

    <!-- Нижнее поле для сводной информации -->
    {#if footer}
      <div class="flex h-8 items-center justify-center bg-(--bg-color)">
        <h5>{footer}</h5>
      </div>
    {/if}
  </div>
</div>
