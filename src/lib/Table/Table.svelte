<!-- $lib/ElementsUI/Table.svelte -->
<script lang="ts">
  import { get } from "svelte/store"
  import type { IOption, ITableButton, ITableContent, ITableHeader, ITableImage, ITableProgressBar, ITableProps, ITableText } from "../types"
  import { fade, fly, slide } from "svelte/transition"
  import { twMerge } from "tailwind-merge"
  import { onMount, tick } from "svelte"
  import ButtonClear from "../libIcons/ButtonClear.svelte"
  import { t } from "$lib/locales/i18n"
  import { Button, Modal } from "$lib"

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
    if (scrollTop + clientHeight >= scrollHeight - 50 && cursor !== null && loader && !get(loader)) {
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
      button.eventHandler.Variables.forEach((v: string) => {
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

    let existingItem = body[index][key]
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

  /* Для работы этой проверки в описании столбцов таблицы нужно явно указать что строка будет пустая при отсутствии иконки в БД -
     src: (row) => (row.icon ? `data:image/png;base64,${row.icon}` : '') */
  const hasImage = (column: ITableHeader<any>, row: any, index: number): boolean => {
    let content = (column.content as ITableContent<any>[])?.[index]
    const src = content?.type === "image" && typeof content.data.src === "function" ? content.data.src(row) : (content?.data as ITableImage<object>).src
    return !!src
  }

  const progressPercent = (content: ITableContent<any>, value: number) => {
    let progressBar = content.data as ITableProgressBar<object>

    let min = progressBar?.minNum ?? 0
    let max = progressBar?.maxNum ?? 100
    if (value) return (((Math.min(Math.max(value, min), max) - min) / (max - min)) * 100) as number
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

<div
  id={`${id}-${crypto.randomUUID().slice(0, 6)}`}
  class={twMerge(`bg-blue flex h-full w-full items-center flex-col overflow-hidden rounded-xl p-1`, wrapperClass)}
>
  {#if label.name}
    <h5 class={twMerge(`w-full px-4 text-center`, label.class)}>{label.name}</h5>
  {/if}

  <div
    class="relative flex h-full w-full flex-col overflow-hidden rounded-xl transition-shadow duration-250
     shadow-[0_0_3px_rgb(0_0_0_/0.25)]"
  >
    <!-- Table Header -->
    <div
      class="grid font-semibold bg-(--bg-color) {isScrollable ? 'border-r-8 border-(--bg-color)' : ''}"
      style={`grid-template-columns: ${(header || [])
        .filter((c) => c.width !== "0%")
        .map((c) => c.width || "minmax(0, 1fr)")
        .join(" ")};`}
    >
      {#each header as column, index (column)}
        {#if column.width !== "0%"}
          <div
            class={twMerge(
              `items-center justify-center flex border-l ${outline && index !== 0 ? " border-(--border-color)" : "border-transparent"}
            ${column.align === "center" ? "justify-center text-center" : column.align === "right" ? "justify-end text-right" : "justify-start text-left"} gap-1  p-2 text-left`,
              column.label?.class,
            )}
          >
            <span>{column.label?.name}</span>

            {#if typeof column.content !== "function" && (column.content as ITableContent<any>[])?.some((c) => c.type === "text" && c.data.sortable)}
              <button
                class="inline-block cursor-pointer font-bold transition-transform duration-75 hover:scale-110 active:scale-95"
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
          "absolute right-2 bg-(--back-color) rounded-full p-1 cursor-pointer [&_svg]:h-full [&_svg]:max-h-full [&_svg]:w-full [&_svg]:max-w-full",
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
      <div class="flex-1 overflow-y-auto bg-(--container-color)/50 relative" bind:this={container} onscroll={handleScroll}>
        <div class="min-w-0" style={`height: ${dataBuffer.visibleRows && tableHeight && rows.length > dataBuffer.visibleRows ? `${tableHeight}px` : ""};`}>
          {#each rows as row, i (row.__rowId ?? row)}
            <div
              class="grid {!outline && i % 2
                ? 'bg-[#f2f2f2] dark:bg-[#2a3545]'
                : 'bg-[#fbfbfb] dark:bg-[#1d2635]'} hover:bg-(--bg-color)/20 transition-colors duration-250"
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
                    class="relative grid w-full min-w-0 items-center gap-x-2 px-2 py-1 wrap-break-word border-t
              {column.align === 'center' ? 'justify-center text-center' : column.align === 'right' ? 'justify-end text-right' : 'justify-start text-left'}
               {j !== 0 ? ' border-l ' : ''} {outline ? 'border-(--border-color)' : 'border-transparent'} {column.disableSelect ? 'select-none' : 'select-all'}"
                    style=" grid-template-columns: repeat({contentArray?.length}, minmax(0, 1fr));"
                  >
                    {#each contentArray as content, index}
                      {#if content.type === "button"}
                        {@const button = typeof content.data === "function" ? content.data(row) : content.data}

                        <button
                          class="{twMerge(`flex w-full items-center justify-center gap-2 cursor-pointer rounded-full 
                           px-4 py-1 font-semibold duration-200 outline-none select-none
                           ${
                             ((content.data as ITableButton<object>).class as string).split(' ').find((cl: string) => cl === 'bg-transparent') ||
                             !((content.data as ITableButton<object>).class as string).split(' ').find((cl: string) => cl.startsWith('bg-'))
                               ? 'underline '
                               : 'border border-(--bg-color) shadow-sm hover:shadow-md'
                           }
                          ${typeof button.class === 'function' ? button.class(row) : button.class}`)} bg-(--bg-color)"
                          onclick={() => buttonClick(row, button)}
                        >
                          {#if button?.icon}
                            <span
                              class={`flex items-center justify-center overflow-visible h-7 w-7 [&_svg]:h-full [&_svg]:max-h-full [&_svg]:w-full [&_svg]:max-w-full`}
                            >
                              {#if typeof button?.icon === "string"}
                                {@html button.icon}
                              {:else}
                                {@const IconComponent = button?.icon}
                                <IconComponent />
                              {/if}
                            </span>
                          {/if}
                          {typeof button.name === "function" ? button.name(row) : button.name}
                        </button>
                      {:else if content.type === "select"}
                        {@const select = content.data}
                        {@const options = Array.isArray(row[select.key]) ? row[select.key] : []}
                        <div class="relative w-full select-none">
                          <button
                            id="select{i}-{j}-{index}"
                            class="w-full rounded-2xl border border-(--blue-color) bg-(--back-color) p-1 text-center shadow-[0_0_3px_rgb(0_0_0_/0.25)] transition duration-200
        cursor-pointer hover:shadow-[0_0_6px_rgb(0_0_0_/0.25)]"
                            onclick={() =>
                              (isDropdownOpen =
                                isDropdownOpen?.x === j && isDropdownOpen?.y === i && isDropdownOpen?.index === index ? null : { x: j, y: i, index })}
                          >
                            {options.some((o: IOption) => o.value === row[(select?.key as string).slice(0, -2)])
                              ? row[select?.key].find((o: IOption) => o.value === row[(select?.key as string).slice(0, -2)]).name
                              : $t("common.select_tag")}
                          </button>

                          {#if isDropdownOpen?.x === j && isDropdownOpen.y === i && isDropdownOpen.index === index}
                            {@const cords = document.getElementById(`select${i}-${j}-${index}`)?.getBoundingClientRect()}
                            <div
                              class="fixed z-50 rounded-b-2xl shadow-[0_0_3px_rgb(0_0_0_/0.25)]"
                              style="top: {cords?.bottom}px; left: calc({cords?.left}px + 0.9rem) ; width: calc({cords?.width}px - 1.8rem);"
                              transition:slide={{ duration: selectSlideDuration }}
                            >
                              {#each options as option, option_index (option.id)}
                                <button
                                  id={option.id}
                                  value={option?.value ? String(option.value) : ""}
                                  class={twMerge(
                                    `flex h-full w-full cursor-pointer items-center justify-center p-1 inset-shadow-[0_10px_10px_-15px_rgb(0_0_0_/0.5)] duration-250 hover:bg-(--field-color)! bg-(--back-color)
              ${option_index === options.length - 1 ? "rounded-b-2xl" : ""}`,
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
                          style={`width: ${image.width || "5rem"}; height: ${image.height || "5rem"}; `}
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
                        <div class="grid grid-cols-[3.5rem_1fr] h-7 w-full px-2 items-center gap-2 rounded-full shadow-sm bg-(--bg-color)">
                          <span class="m-auto font-semibold">{roundToClean(Number(row[progressBar.key] ?? 0))}{progressBar?.units}</span>
                          <div class="relative my-auto h-3.5 rounded-full bg-(--back-color)/40">
                            <div
                              class="absolute top-0 left-0 flex h-full rounded-full bg-(--field-color)"
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
                                  showModal(data, text?.formatting)
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
                              class="mx-2 flex cursor-pointer border-none bg-transparent text-2xl"
                              onclick={(e) => {
                                e.preventDefault()
                                navigator.clipboard.writeText(row[text?.key ?? ""])
                                copiedCell = { x: j, y: i }
                                setTimeout(() => (copiedCell = null), 1000)
                              }}
                              aria-label="Копировать текст"
                            >
                              <div class="size-5 text-sm [&_svg]:h-full [&_svg]:max-h-full [&_svg]:w-full [&_svg]:max-w-full">
                                {#if copiedCell?.y === i && copiedCell.x === j}
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
        class="fixed z-50 w-max max-w-[30%] break-all rounded-md px-2 py-1 text-left text-sm whitespace-pre-wrap shadow-lg"
        style="background: color-mix(in srgb, var(--yellow-color) 30%, var(--back-color)); transform: translateX(-50%); 
        left: {tooltip.x + 10}px; top: {tooltip.y + 10}px;"
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

<Modal isOpen={modalData.isOpen} title={$t("constructor.props.table.fulldata")} wrapperClass="max-h-[80%]" width="{0.8 * (container?.offsetWidth ?? 0)}px">
  {#snippet main()}
    <div class="text-left whitespace-pre">
      {@html modalData.formattedData}
    </div>
  {/snippet}
  {#snippet footer()}
    <Button
      content={{ name: $t("constructor.props.copy") }}
      wrapperClass="w-50"
      onClick={() => {
        navigator.clipboard.writeText(modalData.rawData ?? "")
        modalData.isOpen = false
      }}
    />
  {/snippet}
</Modal>
