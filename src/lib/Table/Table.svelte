<!-- $lib/ElementsUI/Table.svelte -->
<script lang="ts">
  import type { IOption, ITableButton, ITableContent, ITableHeader, ITableImage, ITableProgressBar, ITableProps, ITableText } from "../types"
  import { fly, slide } from "svelte/transition"
  import { twMerge } from "tailwind-merge"
  import { onMount, tick } from "svelte"
  import ButtonClear from "../libIcons/ButtonClear.svelte"
  import { T } from "$lib/locales/i18n"
  import { Button, Modal } from "$lib"
  import CopiedChip from "../CopiedChip.svelte"

  let {
    id = crypto.randomUUID(),
    wrapperClass = "",
    label = { name: "", class: "" },
    body = $bindable(),
    header = [],
    footer = "",
    dataBuffer = { stashData: false, bufferSize: 10, clearButton: false, clearClass: "", logger: false, visibleRows: 5 },
    outline = false,
    cursor = null,
    loader,
    autoscroll = false,
    getData = () => {},
    onClick,
  }: ITableProps<any> = $props()

  /* Сортировка */
  let sortState: { key: string | null; direction: "asc" | "desc" | null } = { key: null, direction: null }
  let isAutoscroll = $state(true)
  let container: HTMLElement | null = $state(null)
  let buffer: any[] = $state([])

  let isDropdownOpen: { x: number; y: number; index: number } | null = $state(null)
  let selectSlideDuration: number = $state(250)
  let copiedCell: { x: number; y: number } | null = $state(null)
  let tooltip = $state({ show: false, text: "", x: 0, y: 0 })
  let isScrollable: boolean = $derived(container ? (container as HTMLElement).scrollHeight > (container as HTMLElement).clientHeight : false)
  let tableHeight = $state(0)
  let modalData: { isOpen: boolean; rawData?: string; formattedData?: string } = $state({ isOpen: false, rawData: "", formattedData: "" })

  export const clearBuffer = async () => {
    buffer = []
    tableHeight = 0
  }

  /* Сортировка столбцов */
  const sortRows = (key: string) => {
    if (sortState.key === key) {
      sortState.direction = sortState.direction === "asc" ? "desc" : "asc"
    } else {
      sortState.key = key
      sortState.direction = "asc"
    }

    body = [...body].sort((a, b) => {
      const aValue = a[key]
      const bValue = b[key]
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortState.direction === "asc" ? aValue - bValue : bValue - aValue
      }
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortState.direction === "asc" ? aValue.getTime() - bValue.getTime() : bValue.getTime() - aValue.getTime()
      }
      const strA = String(aValue).toLowerCase()
      const strB = String(bValue).toLowerCase()
      const numA = strA.match(/\d+/g)?.[0] || ""
      const numB = strB.match(/\d+/g)?.[0] || ""
      if (numA && numB) {
        const numCompare = parseInt(numA, 10) - parseInt(numB, 10)
        if (numCompare !== 0) return sortState.direction === "asc" ? numCompare : -numCompare
      }
      const stringCompare = strA.localeCompare(strB)
      return sortState.direction === "asc" ? stringCompare : -stringCompare
    })
  }

  const handleScroll = () => {
    if (!container) return
    const { scrollTop, clientHeight, scrollHeight } = container
    if (scrollTop + clientHeight >= scrollHeight - 50 && cursor !== null && loader && !loader()) {
      getData()
    }
  }

  /* Обработчик автоскролла */
  const handleAutoScroll = () => {
    if (!container) return
    isAutoscroll = container.scrollHeight - container.scrollTop <= container.clientHeight + 50
  }

  const scrollToBottom = () => {
    if (isAutoscroll && container) {
      container.scrollTop = container.scrollHeight
    }
  }

  $effect(() => {
    if (autoscroll && buffer && buffer.length > 0 && !dataBuffer.logger) {
      scrollToBottom()
    }
  })

  const buttonClick = (row: any, button: any) => {
    if (button.onClick) button.onClick(row)
    else if (button.eventHandler && onClick) {
      let value: Record<string, boolean | string | number | number[] | object | null> = {}
      ;(button.eventHandler.Variables ?? []).forEach((v: string) => {
        if (
          header.some(
            (h) =>
              (h.content as ITableContent<any>[])?.some((c) => c.type == "select") &&
              (h.content as ITableContent<any>[]).some((c) => c.type == "select" && c.data.key === v),
          )
        )
          value[v.slice(0, -2)] = row[v.slice(0, -2)]
        else value[v] = row[v]
      })
      button.eventHandler.Value = JSON.stringify(value)
      onClick(button.eventHandler)
    }
  }

  const selectOption = async (index: number, key: any, selectIndex: number, option: IOption<string | number>, event: MouseEvent) => {
    event.stopPropagation()

    let existingItem = body[index][key.slice(0, -2)]
    isDropdownOpen = null

    setTimeout(() => {
      if (existingItem) {
        body = [...body].map((row, i) => (i === index ? { ...row, [key.slice(0, -2)]: option.value } : row))
      }
    }, 250)
  }

  const showModal = async (text: string, formatting?: (text: string) => string) => {
    modalData = {
      isOpen: true,
      rawData: text,
      formattedData: formatting ? formatting(text) : (text ?? ""),
    }
  }

  const showTooltip = (event: MouseEvent, text: string, formatting?: (text: string) => string) => {
    tooltip = {
      show: true,
      text: formatting ? formatting(text) : (text ?? ""),
      x: event.clientX,
      y: event.clientY,
    }
  }

  /* Требует явного src: (row) => row.icon ? `data:image/png;base64,${row.icon}` : '' в описании столбца */
  const hasImage = (column: ITableHeader<any>, row: any, index: number): boolean => {
    let content = (column.content as ITableContent<any>[])?.[index]
    const src = content?.type === "image" && typeof content.data.src === "function" ? content.data.src(row) : (content?.data as ITableImage<object>).src
    return !!src
  }

  const progressPercent = (content: ITableContent<any>, value: number) => {
    let progressBar = content.data as ITableProgressBar<object>

    let min = progressBar?.minNum ?? 0
    let max = progressBar?.maxNum ?? 100
    if (value != null && !isNaN(value)) return (((Math.min(Math.max(value, min), max) - min) / (max - min)) * 100) as number
  }

  const roundToClean = (num: number): number => {
    if (Number.isInteger(num)) return num

    const rounded1 = Number(num.toFixed(1))
    if (Math.abs(rounded1 - num) < 1e-10) return rounded1

    const rounded2 = Number(num.toFixed(2))
    if (Math.abs(rounded2 - num) < 1e-10) return rounded2

    return rounded2
  }

  $effect(() => {
    isScrollable = container ? container.scrollHeight > container.clientHeight : false
    return () => (buffer = [])
  })

  $effect(() => {
    ;(async () => {
      if (body && dataBuffer.stashData) {
        if (Array.isArray(body)) {
          for (let i = 0; i < body.length; i++) {
            let item = { ...(dataBuffer.logger ? body.toReversed()[i] : body[i]), __rowId: crypto.randomUUID() }
            dataBuffer.logger ? (buffer = [item, ...buffer]) : (buffer = [...buffer, item])
          }
        } else dataBuffer.logger ? (buffer = [body, ...buffer]) : (buffer = [...buffer, body])
        if (buffer.length > (dataBuffer.bufferSize ?? 10)) {
          dataBuffer.logger ? (buffer = buffer.slice(0, dataBuffer.bufferSize ?? 10)) : (buffer = buffer.slice(-(dataBuffer.bufferSize ?? 10)))
        }

        body = null
        await tick()
        if (document && dataBuffer.visibleRows) {
          for (let i = 0; i < (dataBuffer.visibleRows ?? 5); i++) {
            const rowHeight = document.getElementById(`rowDiv${i}-0`)?.offsetHeight ?? 0
            tableHeight = i == 0 ? 0 + rowHeight : tableHeight + rowHeight
          }
        }
        isScrollable = container ? container.scrollHeight > container.clientHeight : false
      }
    })()
  })

  onMount(() => {
    if (autoscroll) {
      container?.addEventListener("scroll", handleAutoScroll)
      scrollToBottom()
    }

    const handlePageScroll = () => {
      isDropdownOpen = null
      selectSlideDuration = 0
      setTimeout(() => {
        selectSlideDuration = 250
      }, 10)
    }

    window.addEventListener("scroll", handlePageScroll, true)
    window.addEventListener("resize", handlePageScroll, true)

    isScrollable = container ? container.scrollHeight > container.clientHeight : false

    return () => {
      container?.removeEventListener("scroll", handleAutoScroll)
      window.removeEventListener("scroll", handlePageScroll, true)
      window.removeEventListener("resize", handlePageScroll, true)
    }
  })
</script>

<div id={`${id}-${crypto.randomUUID().slice(0, 6)}`} class={twMerge(`flex h-full w-full flex-col overflow-hidden`, wrapperClass)}>
  {#if label.name}
    <span class={twMerge(`w-full pb-2 text-[12px] font-semibold text-(--muted-color)`, label.class)}>{label.name}</span>
  {/if}

  <div class="relative flex h-full w-full flex-col overflow-hidden rounded-[14px] border border-(--hairline-color) bg-(--back-color)">
    <!-- Table Header -->
    <div
      class="grid border-b border-(--hairline-color) bg-(--container-color) text-[11px] font-bold tracking-[0.06em] text-(--muted-color) uppercase {isScrollable
        ? 'border-r-8 border-r-(--container-color)'
        : ''}"
      style={`grid-template-columns: ${(header || [])
        .filter((c) => c.width !== "0%")
        .map((c) => c.width || "minmax(0, 1fr)")
        .join(" ")};`}
    >
      {#each header as column, index (column)}
        {#if column.width !== "0%"}
          <div
            class={twMerge(
              `flex items-center border-l ${outline && index !== 0 ? " border-(--hairline-color)" : "border-transparent"}
            ${column.align === "center" ? "justify-center text-center" : column.align === "right" ? "justify-end text-right" : "justify-start text-left"} gap-1 px-3 py-2`,
              column.label?.class,
            )}
          >
            <span>{$T(column.label?.name ?? "")}</span>

            {#if typeof column.content !== "function" && (column.content as ITableContent<any>[])?.some((c) => c.type === "text" && c.data.sortable)}
              <button
                class="inline-flex cursor-pointer items-center rounded px-1 text-(--faint-color) transition-colors duration-150 hover:bg-(--back-color) hover:text-(--font-color)"
                onclick={() =>
                  sortRows(
                    ((column.content as ITableContent<any>[])?.find((c) => c.type === "text" && c.data.sortable)?.data as ITableText<object>).key as string,
                  )}
              >
                ↑↓
              </button>
            {/if}
          </div>
        {/if}
      {/each}
    </div>
    {#if dataBuffer.clearButton}
      <button
        class={twMerge(
          "absolute top-1 right-2 flex size-7 cursor-pointer items-center justify-center rounded-lg bg-(--back-color) p-1.5 text-(--muted-color) transition-colors duration-150 hover:bg-(--container-color) hover:text-(--font-color) [&_svg]:h-full [&_svg]:w-full",
          dataBuffer.clearClass,
        )}
        onclick={clearBuffer}
      >
        <ButtonClear />
      </button>
    {/if}

    {#if body || buffer}
      {@const rows = dataBuffer.stashData ? buffer.slice(-(dataBuffer.bufferSize ?? 10)) : body.filter((row: any) => Object.entries(row).length != 0)}
      <!-- Table Body с прокруткой -->
      <div class="relative flex-1 overflow-y-auto bg-(--back-color)" bind:this={container} onscroll={handleScroll}>
        <div class="min-w-0" style={`height: ${dataBuffer.visibleRows && tableHeight && rows.length > dataBuffer.visibleRows ? `${tableHeight}px` : ""};`}>
          {#each rows as row, i (row.__rowId ?? row)}
            <div
              class="grid border-t border-(--hairline-color) transition-colors duration-150 hover:bg-(--accent-soft)"
              style={`grid-template-columns: ${(header || [])
                .filter((c) => c.width !== "0%")
                .map((c) => c.width || "minmax(0, 1fr)")
                .join(" ")};`}
            >
              {#each header as column, j (column)}
                {#if column.width !== "0%"}
                  {@const contentArray = typeof column.content === "function" ? column.content(row) : column.content}
                  <div
                    id="rowDiv{i}-{j}"
                    class="relative grid min-h-7 w-full min-w-0 items-center gap-x-2 px-3 py-1 text-[13px] wrap-break-word
              {column.align === 'center'
                      ? 'justify-center justify-items-center text-center'
                      : column.align === 'right'
                        ? 'justify-end justify-items-end text-right tabular-nums'
                        : 'justify-start justify-items-start text-left'}
               {j !== 0 ? ' border-l ' : ''} {outline ? 'border-(--hairline-color)' : 'border-transparent'} {column.disableSelect
                      ? 'select-none'
                      : 'select-all'}"
                    style=" grid-template-columns: repeat({contentArray?.length}, minmax(0, 1fr));"
                  >
                    {#each contentArray as content, index}
                      {#if content.type === "button"}
                        {@const button = typeof content.data === "function" ? content.data(row) : content.data}

                        <button
                          class="{twMerge(`flex h-7 w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg
                           px-3 text-[13px] font-semibold transition-colors duration-150 outline-none select-none
                           focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-color)
                           ${
                             ((button as ITableButton<object>).class as string)?.split(' ').find((cl: string) => cl === 'bg-transparent') ||
                             !((button as ITableButton<object>).class as string)?.split(' ').find((cl: string) => cl.startsWith('bg-'))
                               ? 'bg-transparent text-(--accent-color) hover:bg-(--accent-soft)'
                               : 'border border-transparent text-(--on-accent) hover:brightness-90 dark:hover:brightness-115'
                           }
                          ${typeof button.class === 'function' ? button.class(row) : button.class}`)} bg-(--bg-color)"
                          onclick={() => buttonClick(row, button)}
                        >
                          {#if button?.icon}
                            <span class={`flex size-4 shrink-0 items-center justify-center overflow-visible [&_svg]:h-full [&_svg]:w-full`}>
                              {#if typeof button?.icon === "string"}
                                {@html button.icon}
                              {:else}
                                {@const IconComponent = button?.icon}
                                <IconComponent />
                              {/if}
                            </span>
                          {/if}
                          {typeof button.name === "function" ? $T(button.name(row)) : $T(button.name ?? "")}
                        </button>
                      {:else if content.type === "select"}
                        {@const select = content.data}
                        {@const options = Array.isArray(row[select.key]) ? row[select.key] : []}
                        <div class="relative w-full select-none">
                          <button
                            id="select{i}-{j}-{index}"
                            class="h-7 w-full cursor-pointer rounded-lg border border-(--border-color) bg-(--field-color) px-2 text-left text-[13px]
        transition-[border-color,box-shadow] duration-150 outline-none hover:border-(--faint-color)
        focus:border-(--accent-color) focus:shadow-(--focus-shadow-color)"
                            onclick={() =>
                              (isDropdownOpen =
                                isDropdownOpen?.x === j && isDropdownOpen?.y === i && isDropdownOpen?.index === index ? null : { x: j, y: i, index })}
                          >
                            {options.some((o: IOption) => o.value === row[(select?.key as string).slice(0, -2)])
                              ? row[select?.key].find((o: IOption) => o.value === row[(select?.key as string).slice(0, -2)]).name
                              : $T("common.select_tag")}
                          </button>

                          {#if isDropdownOpen?.x === j && isDropdownOpen.y === i && isDropdownOpen.index === index}
                            {@const cords = document.getElementById(`select${i}-${j}-${index}`)?.getBoundingClientRect()}
                            <div
                              class="fixed z-50 overflow-hidden rounded-[10px] border border-(--hairline-color) bg-(--back-color) p-1 shadow-(--elevation-2)"
                              style="top: calc({cords?.bottom}px + 4px); left: {cords?.left}px; width: {cords?.width}px;"
                              transition:slide={{ duration: selectSlideDuration }}
                            >
                              {#each options as option, option_index (option.id)}
                                <button
                                  id={option.id}
                                  value={option?.value ? String(option.value) : ""}
                                  class={twMerge(
                                    `flex h-8 w-full cursor-pointer items-center rounded-md px-2.5 text-left text-[13px] transition-colors duration-150 hover:bg-(--container-color)`,
                                    option.class,
                                  )}
                                  onclick={(e) => selectOption(i, select?.key, index, option, e)}
                                >
                                  {option.name}
                                </button>
                              {/each}
                            </div>
                          {/if}
                        </div>
                      {:else if content.type === "image"}
                        {@const image = content.data}
                        <div
                          class="flex items-center justify-center [&_svg]:h-full [&_svg]:max-h-full [&_svg]:w-full [&_svg]:max-w-full"
                          style={`width: ${image.width || "2rem"}; height: ${image.height || "2rem"}; `}
                        >
                          {#if hasImage(column, row, index)}
                            <img
                              src={typeof image?.src === "function" ? image.src(row) : image?.src || ""}
                              alt={image.alt ?? "Image"}
                              class={twMerge(`h-full w-full object-cover ${image.class || ""}`)}
                              loading="lazy"
                            />
                          {:else if image.defaultIcon}
                            {#if typeof image.defaultIcon === "string"}
                              {@html image.defaultIcon}
                            {:else}
                              <image.defaultIcon />
                            {/if}
                          {/if}
                        </div>
                      {:else if content.type === "progressBar"}
                        {@const progressBar = content.data}
                        <div class="grid h-7 w-full grid-cols-[3.5rem_1fr] items-center gap-2">
                          <span class="text-right text-[12px] font-semibold tabular-nums"
                            >{roundToClean(Number(row[progressBar.key] ?? 0))}{progressBar?.units}</span
                          >
                          <div class="relative my-auto h-1.5 overflow-hidden rounded-full bg-(--container-color)">
                            <div
                              class="absolute top-0 left-0 flex h-full rounded-full bg-(--bg-color,var(--accent-color))"
                              style="width: {progressPercent(content, row[progressBar.key] as number)}%;"
                            ></div>
                          </div>
                        </div>
                      {:else if content.type === "text"}
                        {@const text = content.data}
                        {@const data =
                          Array.isArray(row[text.key]) && row[text.key][0] && "value" in row[text.key][0]
                            ? row[text.key].map((item: IOption) => item.name)
                            : typeof row[text.key] == "object"
                              ? JSON.stringify(row[text.key])
                              : row[text.key]}
                        <div class="flex items-center">
                          <div
                            class="w-full max-w-full wrap-break-word {text?.truncated ? 'truncate' : ' whitespace-normal'}"
                            onmouseenter={text?.tooltip ? (e) => showTooltip(e, row[text?.key ?? ""], text?.formatting) : undefined}
                            onmouseleave={() => (text?.tooltip ? (tooltip.show = false) : undefined)}
                            onmousemove={text?.tooltip
                              ? (e) => {
                                  tooltip.x = e.clientX
                                  tooltip.y = e.clientY
                                }
                              : undefined}
                            role="columnheader"
                            tabindex={null}
                          >
                            {#if text?.modal}
                              <button
                                class="w-fit cursor-pointer text-left"
                                onclick={(e) => {
                                  e.stopPropagation()
                                  showModal(data.replace(/<[^>]*>/g, ""), text?.formatting)
                                }}
                              >
                                {@html data}
                              </button>
                            {:else}
                              {@html data}
                            {/if}
                          </div>

                          {#if text?.copy}
                            <button
                              class="ml-1.5 flex size-5 shrink-0 cursor-pointer items-center justify-center rounded border-none bg-transparent text-(--faint-color) transition-colors duration-150 hover:bg-(--container-color) hover:text-(--font-color)"
                              onclick={(e) => {
                                e.preventDefault()
                                navigator.clipboard.writeText(row[text?.key ?? ""].replace(/<[^>]*>/g, ""))
                                copiedCell = { x: j, y: i }
                                setTimeout(() => (copiedCell = null), 1000)
                              }}
                              aria-label="Копировать текст"
                            >
                              <div class="size-3.5 [&_svg]:h-full [&_svg]:w-full">
                                {#if !(copiedCell?.y === i && copiedCell.x === j)}
                                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                                    <g fill="none" stroke="currentColor" stroke-width="1.5">
                                      <path
                                        d="M6 11c0-2.828 0-4.243.879-5.121C7.757 5 9.172 5 12 5h3c2.828 0 4.243 0 5.121.879C21 6.757 21 8.172 21 11v5c0 2.828 0 4.243-.879 5.121C19.243 22 17.828 22 15 22h-3c-2.828 0-4.243 0-5.121-.879C6 20.243 6 18.828 6 16z"
                                      />
                                      <path d="M6 19a3 3 0 0 1-3-3v-6c0-3.771 0-5.657 1.172-6.828S7.229 2 11 2h4a3 3 0 0 1 3 3" />
                                    </g>
                                  </svg>
                                {/if}
                                <CopiedChip show={copiedCell?.y === i && copiedCell.x === j} class="top-1/2 right-3 z-10 -translate-y-1/2" />
                              </div>
                            </button>
                          {/if}
                        </div>
                      {/if}
                    {/each}
                  </div>
                {/if}
              {/each}
            </div>
          {/each}
        </div>
      </div>
    {/if}

    {#if tooltip.show}
      <div
        class="fixed z-50 w-max max-w-[30%] rounded-lg border border-(--hairline-color) bg-(--back-color) px-2.5 py-1.5 text-left text-[12px] font-medium break-all whitespace-pre-wrap shadow-(--elevation-2)"
        style="transform: translateX(-50%); left: {tooltip.x + 10}px; top: {tooltip.y + 10}px;"
        transition:fly={{ y: 8, duration: 200 }}
        role="tooltip"
      >
        {@html tooltip.text.replace(/<[^>]*>/g, "")}
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

<Modal isOpen={modalData.isOpen} title={$T("constructor.props.table.fulldata")} wrapperClass="max-h-[80%]" width="{0.8 * (container?.offsetWidth ?? 0)}px">
  {#snippet main()}
    <div class="text-left whitespace-pre">
      {@html modalData.formattedData}
    </div>
  {/snippet}
  {#snippet footer()}
    <Button
      content={{ name: $T("constructor.props.copy") }}
      wrapperClass="w-50"
      componentClass="bg-blue"
      onClick={() => {
        navigator.clipboard.writeText(modalData.rawData ?? "")
        modalData.isOpen = false
      }}
    />
  {/snippet}
</Modal>
