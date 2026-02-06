<!-- $lib/ElementsUI/Table.svelte -->
<script lang="ts">
  import { get } from "svelte/store"
  import type { ISelectOption, ITableHeader, ITableProps } from "../types"
  import { fade, fly, slide } from "svelte/transition"
  import { twMerge } from "tailwind-merge"
  import { onMount, tick } from "svelte"
  import ButtonClear from "../libIcons/ButtonClear.svelte"
  import { t } from "$lib/locales/i18n"

  let {
    id = crypto.randomUUID(),
    wrapperClass = "",
    label = { name: "", class: "" },
    body = $bindable(),
    header = [],
    footer = "",
    dataBuffer = { stashData: false, rowsAmmount: 10, clearButton: false, clearClass: "" },
    type = "table",
    outline = false,
    cursor = null,
    loader,
    autoscroll = false,
    getData = () => {},
    modalData = $bindable(),
    onClick,
  }: ITableProps<any> = $props()

  /* Сортировка */
  let sortState: { key: string | null; direction: "asc" | "desc" | null } = { key: null, direction: null }
  let isAutoscroll = $state(false)
  let container: HTMLElement | null = $state(null)
  let buffer: any[] = $state([])
  const loggerHeader = [
    { key: "color", label: { name: "Type" }, width: "3.5rem" } as ITableHeader<any>,
    { key: "data", label: { name: "Data" }, width: "1fr" } as ITableHeader<any>,
  ]
  const logTypeOptions = [
    { id: crypto.randomUUID(), name: "Error", value: "error", color: "bg-(--red-color)" },
    { id: crypto.randomUUID(), name: "Warning", value: "warning", color: "bg-(--yellow-color)" },
    { id: crypto.randomUUID(), name: "Info", value: "info", color: "bg-(--gray-color)" },
  ]

  let logType = $state(["error", "warning"])
  let isDropdownOpen: { x: number; y: number } | null = $state(null)
  let copiedCell: { x: number; y: number } | null = $state(null)
  let tooltip = $state({ show: false, text: "", x: 0, y: 0 })
  let isScrollable: boolean = $derived(container ? (container as HTMLElement).scrollHeight > (container as HTMLElement).clientHeight : false)

  export const clearBuffer = async () => {
    buffer = []
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
    isAutoscroll = !(container.scrollHeight - container.scrollTop <= container.clientHeight + 50)
  }
  const scrollToBottom = () => {
    if (!isAutoscroll && container) container.scrollTop = container.scrollHeight
  }

  $effect(() => {
    if (autoscroll && buffer && buffer.length > 0) scrollToBottom()
  })

  const buttonClick = (row: any, button: any) => {
    if (button.onClick) button.onClick(row)
    else if (button.eventHandler && onClick) {
      let value: Record<string, boolean | string | number | number[] | object | null> = {}
      button.eventHandler.Variables.forEach((v: string) => {
        if (header.some((h) => h.key === v && h.type === "select")) value[v] = row[v][0]
        else value[v] = row[v]
      })
      button.eventHandler.Value = JSON.stringify(value)
      onClick(button.eventHandler)
    }
  }

  const selectOption = async (index: number, key: any, option: ISelectOption<string | number>, event: MouseEvent) => {
    event.stopPropagation()

    let existingItem = body[index][key]
    isDropdownOpen = null

    setTimeout(() => {
      if (existingItem)
        body = [...body].map((row, i) => (i === index ? { ...row, [key]: [option, ...existingItem.filter((opt: ISelectOption) => opt !== option)] } : row))
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

  const hideTooltip = () => {
    tooltip.show = false
  }

  /* Для работы этой проверки в описании столбцов таблицы нужно явно указать что строка будет пустая при отсутствии иконки в БД -
     src: (row) => (row.icon ? `data:image/png;base64,${row.icon}` : '') */
  const hasImage = (column: ITableHeader<any>, row: any): boolean => {
    const src = typeof column.image?.src === "function" ? column.image.src(row) : column.image?.src
    return !!src
  }

  $effect(() => {
    ;(async () => {
      const currentType = type
      if (currentType === "logger") {
        header = loggerHeader
      }

      await tick()
      isScrollable = container ? container.scrollHeight > container.clientHeight : false
      return () => (buffer = [])
    })()
  })

  $effect(() => {
    ;(async () => {
      if (body && type == "logger") {
        if (Array.isArray(body)) {
          for (let i = 0; i < body.length; i++) {
            buffer = [
              ...buffer,
              {
                type: Object.entries(body[i])[0][1] as string,
                color: `<div class='size-6 rounded-full ${logTypeOptions.find((o) => o.value == Object.entries(body[i])[0][1])?.color}'></div>`,
                data: Object.entries(body[i])[1][1] as string,
              },
            ]
          }
        } else {
          buffer = [
            ...buffer,
            {
              type: Object.entries(body)[0][1] as string,
              color: `<div class='size-6 rounded-full ${logTypeOptions.find((o) => o.value == Object.entries(body)[0][1])?.color}'></div>`,
              data: Object.entries(body)[1][1] as string,
            },
          ]
        }

        if (dataBuffer && buffer.length > (dataBuffer.rowsAmmount ?? 10)) {
          buffer = buffer.slice(-(dataBuffer.rowsAmmount ?? 10))
        }

        body = null

        await tick()
        isScrollable = container ? container.scrollHeight > container.clientHeight : false
      }
    })()
  })

  $effect(() => {
    ;(async () => {
      if (body && dataBuffer.stashData && type == "table") {
        if (Array.isArray(body)) {
          for (let i = 0; i < body.length; i++) {
            buffer = [...buffer, body[i]]
          }
        } else buffer = [...buffer, body]
        if (buffer.length > (dataBuffer.rowsAmmount ?? 10)) {
          buffer = buffer.slice(-(dataBuffer.rowsAmmount ?? 10))
        }

        body = null

        await tick()
        isScrollable = container ? container.scrollHeight > container.clientHeight : false
      }
    })()
  })

  onMount(() => {
    if (autoscroll) {
      container?.addEventListener("scroll", handleAutoScroll)
      scrollToBottom()
    }
    isScrollable = container ? container.scrollHeight > container.clientHeight : false

    if (type === "logger") {
      header = loggerHeader
    }

    return () => {
      if (autoscroll) container?.removeEventListener("scroll", handleAutoScroll)
    }
  })
</script>

<div
  id={`${id}-${crypto.randomUUID().slice(0, 6)}`}
  class={twMerge(`bg-blue flex h-full w-full items-center ${type == "logger" ? "gap-2" : ""} flex-col overflow-hidden rounded-xl p-0.5`, wrapperClass)}
>
  {#if label.name}
    <h5 class={twMerge(`w-full px-4 text-center`, label.class)}>{label.name}</h5>
  {/if}

  {#if type == "logger"}
    <div id={`${id}-${crypto.randomUUID().slice(0, 6)}`} class="flex w-[50%] justify-center rounded-full">
      {#each logTypeOptions as option, index}
        <button
          id={crypto.randomUUID()}
          class={twMerge(`m-0 inline-block min-w-0 flex-1 cursor-pointer items-center px-2 py-1 font-semibold shadow-sm transition-all duration-300
            select-none hover:shadow-md
            ${
              logType.includes(option.value) && logType !== null
                ? "z-10 py-1 shadow-[0_0_10px_var(--shadow-color)] hover:shadow-[0_0_15px_var(--shadow-color)]"
                : ""
            }  
            ${logTypeOptions.length > 0 && index === 0 ? "rounded-l-2xl" : ""} ${index === logTypeOptions.length - 1 ? "rounded-r-2xl" : ""} ${option.color}`)}
          onclick={() => {
            if (logType.includes(option.value)) {
              logType = logType.filter((type) => type !== option.value)
            } else {
              logType.push(option.value)
            }
          }}
        >
          <span class="flex flex-row items-center justify-center gap-4">
            {#if option}
              <div class="flex-1">
                {option.name}
              </div>
            {/if}
          </span>
        </button>
      {/each}
    </div>
  {/if}

  <div
    class="relative flex h-full w-full flex-col overflow-hidden rounded-xl transition-shadow duration-250
     shadow-[0_0_3px_rgb(0_0_0_/0.25)] hover:shadow-[0_0_6px_rgb(0_0_0_/0.25)]
    {outline ? 'border border-(--border-color)' : ''} "
  >
    <!-- Table Header -->
    <div
      class="grid font-semibold {isScrollable ? 'border-r-8 border-(--bg-color)' : ''}"
      style={`grid-template-columns: ${header.map((c) => c.width || "minmax(0, 1fr)").join(" ")};`}
    >
      {#each header as column, index (column)}
        <div
          class={twMerge(
            `items-center justify-center flex border-l ${outline && index !== 0 ? " border-(--border-color)" : "border-transparent"} 
            ${column.align === "center" ? "justify-center text-center" : column.align === "right" ? "justify-end text-right" : "justify-start text-left"} gap-1 bg-(--bg-color) p-2 text-left`,
            column.label?.class,
          )}
        >
          <span>{column.label?.name}</span>
          {#if column.type === "text" && column.sortable}
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
      {@const rows =
        type == "logger"
          ? buffer.filter((str) => logType.includes(str.type)).slice(-(dataBuffer.rowsAmmount ?? 10))
          : dataBuffer.stashData
            ? buffer.slice(-(dataBuffer.rowsAmmount ?? 10))
            : body.filter((row: any) => Object.entries(row).length != 0)}
      <!-- Table Body с прокруткой -->
      <div class="flex-1 overflow-y-auto bg-(--container-color)/50 relative" bind:this={container} onscroll={handleScroll}>
        <div class="grid min-w-0" style={`grid-template-columns: ${header.map((c) => c.width || "minmax(0, 1fr)").join(" ")};`}>
          {#each rows as row, i (row)}
            {#each header as column, j (column)}
              <div
                class="relative flex w-full min-w-0 items-center px-2 py-1 wrap-break-word
              {i % 2 ? 'bg-(--back-color)/40' : 'bg-[#edeef3] dark:bg-[#1f2a3a]'}
              {column.align === 'center' ? 'justify-center text-center' : column.align === 'right' ? 'justify-end text-right' : 'justify-start text-left'}
              border-t {j !== 0 ? ' border-l ' : ''} {outline ? 'border-(--border-color)' : 'border-transparent'}"
              >
                {#if column.type == "buttons" && column.buttons}
                  {@const buttons = typeof column.buttons === "function" ? column.buttons(row) : column.buttons}
                  <div class="flex w-full flex-wrap gap-1">
                    {#each buttons as button (button)}
                      <button
                        class="{twMerge(`flex items-center justify-center gap-2 cursor-pointer rounded-full w-full
                           px-4 py-1 font-semibold shadow-sm transition-shadow duration-200 outline-none select-none hover:shadow-md
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
                    {/each}
                  </div>
                {:else if column.type == "select" && column.select}
                  {@const options = Array.isArray(row[column.key]) ? row[column.key] : []}

                  <div class="relative w-full">
                    <button
                      class="w-full rounded-2xl border border-(--blue-color) bg-(--back-color) p-1 text-center shadow-[0_0_3px_rgb(0_0_0_/0.25)] transition duration-200
        cursor-pointer hover:shadow-[0_0_6px_rgb(0_0_0_/0.25)]"
                      onclick={() => (isDropdownOpen = isDropdownOpen?.x === j && isDropdownOpen.y === i ? null : { x: j, y: i })}
                    >
                      {options[0]?.name || $t("common.select_tag")}
                    </button>

                    {#if isDropdownOpen?.x === j && isDropdownOpen.y === i}
                      <div
                        class="absolute top-full left-1/2 z-50 -translate-x-1/2 rounded-b-2xl shadow-[0_0_3px_rgb(0_0_0_/0.25)]"
                        style="width: calc(100% - 1.8rem);"
                        transition:slide={{ duration: 250 }}
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
                            onclick={(e) => selectOption(i, column.key, option, e)}
                          >
                            {option.name}
                          </button>
                        {/each}
                      </div>
                    {/if}
                  </div>
                {:else if column.type == "image" && column.image}
                  <div
                    class="flex items-center justify-center [&_svg]:h-full [&_svg]:max-h-full [&_svg]:w-full [&_svg]:max-w-full"
                    style={`width: ${column.image.width || "5rem"}; height: ${column.image.height || "5rem"}; `}
                  >
                    {#if hasImage(column, row)}
                      <img
                        src={typeof column.image?.src === "function" ? column.image.src(row) : column.image?.src || ""}
                        alt={column.image.alt ?? "Image"}
                        class={twMerge(`h-full w-full object-cover ${column.image.class || ""}`)}
                        loading="lazy"
                      />
                    {:else if column.image.defaultIcon}
                      {#if typeof column.image.defaultIcon === "string"}
                        {@html column.image.defaultIcon}
                      {:else}
                        <column.image.defaultIcon />
                      {/if}
                    {/if}
                  </div>
                {:else}
                  {@const text =
                    Array.isArray(row[column.key]) && row[column.key][0] && "value" in row[column.key][0]
                      ? row[column.key].map((item: ISelectOption) => item.name)
                      : typeof row[column.key] == "object"
                        ? JSON.stringify(row[column.key])
                        : row[column.key]}
                  <div
                    class=" w-full max-w-full wrap-break-word {column.text?.truncated ? 'truncate' : ' whitespace-normal'}"
                    onmouseenter={column.text?.truncated ? (e) => showTooltip(e, row[column.key], column.text?.formatting) : undefined}
                    onmouseleave={column.text?.truncated ? hideTooltip : undefined}
                    onmousemove={column.text?.truncated
                      ? (e) => {
                          tooltip.x = e.clientX
                          tooltip.y = e.clientY
                        }
                      : undefined}
                    role="columnheader"
                    tabindex={null}
                  >
                    {#if column.text?.modal}
                      <button
                        class="w-full cursor-pointer overflow-hidden text-left text-ellipsis whitespace-nowrap"
                        onclick={(e) => {
                          e.stopPropagation()
                          showModal(text, column.text?.formatting)
                        }}
                      >
                        {@html text}
                      </button>
                    {:else}
                      {@html text}
                    {/if}
                  </div>

                  {#if column.text?.copy}
                    <button
                      class="mx-2 flex cursor-pointer border-none bg-transparent text-2xl"
                      onclick={(e) => {
                        e.preventDefault()
                        navigator.clipboard.writeText(row[column.key])
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
                {/if}
              </div>
            {/each}
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
