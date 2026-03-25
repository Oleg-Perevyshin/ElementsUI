<script lang="ts">
  import { getContext, tick } from "svelte"
  import { t } from "$lib/locales/i18n"
  import { type UIComponent, type ITableProps, type ITableHeader, updateProperty, type IUIComponentHandler } from "../types"
  import * as UI from "$lib"
  import ButtonDelete from "$lib/libIcons/ButtonDelete.svelte"
  import ButtonAdd from "$lib/libIcons/ButtonAdd.svelte"
  import { optionsStore } from "../options"
  import { ICONS } from "$lib/icons"
  import CommonSnippets from "$lib/CommonSnippets.svelte"
  import { slide } from "svelte/transition"
  import MoveVerticalIcon from "$lib/libIcons/MoveVerticalIcon.svelte"

  const {
    component,
    onPropertyChange,
    forConstructor = true,
  } = $props<{
    component: UIComponent & { properties: Partial<ITableProps<object>> }
    onPropertyChange: (updates: Partial<{ properties?: string | object; name?: string; access?: string; eventHandler?: IUIComponentHandler }>) => void
    forConstructor?: boolean
  }>()

  const DeviceVariables = getContext<{ id: string; value: string; name: string }[]>("DeviceVariables")
  let VARIABLE_OPTIONS = $derived(DeviceVariables && Array.isArray(DeviceVariables) ? DeviceVariables : [])

  let isDropdownOpen = $state(-1)

  const initialColor = $derived(
    $optionsStore.COLOR_OPTIONS.find((c) =>
      (c.value as string).includes(component.properties.wrapperClass?.split(" ").find((cls: string) => cls.startsWith("bg-"))),
    ),
  )

  const initialAlign = $derived(
    $optionsStore.TEXT_ALIGN_OPTIONS.find((a) =>
      (a.value as string).includes(component.properties.label?.class?.split(" ").find((cls: string) => cls.startsWith("text-"))),
    ),
  )

  const changeColumnSettings = (settings: UI.IOption<string> | UI.IOption<string>[], columnIndex: number, textIndex: number) => {
    const currentActiveValues = $optionsStore.TABLE_TEXT_SETTING_OPTIONS.filter(
      (opt) => component.properties.header[columnIndex].text[textIndex][opt.value] === true,
    ).map((opt) => opt.value)

    if (Array.isArray(settings)) {
      settings.forEach((opt) => {
        if (opt?.value) component.properties.header[columnIndex].text[textIndex][opt.value] = true
      })

      currentActiveValues.forEach((activeValue) => {
        if (!settings.some((opt) => opt?.value === activeValue)) component.properties.header[columnIndex].text[textIndex][activeValue] = false
      })
    }
  }

  const addContent = (option: UI.IOption, event: MouseEvent, columnIndex: number) => {
    event.stopPropagation()
    let newHeader = component.properties.header

    if (option.value === "buttons")
      (newHeader[columnIndex].buttons ||= [
        { name: `button1`, class: "bg-blue grow", eventHandler: { Header: "SET", Argument: "Save", Variables: [] }, onClick: () => {} },
      ]).push({
        name: `button${newHeader[columnIndex].buttons.length + 1}`,
        class: "bg-blue grow",
        eventHandler: { Header: "SET", Argument: "Save", Variables: [] },
        onClick: () => {},
      })
    else (newHeader[columnIndex][option.value as string] ||= [{}]).push({})

    updateProperty("header", newHeader, component, onPropertyChange)

    isDropdownOpen = -1
  }

  const updateTableHeader = (index: number, field: string, value: any) => {
    const headers = [...component.properties.header]
    headers[index] = { ...headers[index], [field]: value }
    updateProperty("header", headers, component, onPropertyChange)
  }

  // const updateTableBody = () => {
  //   let newBody = component.properties.body.map((row: object) => {
  //     const newRow: Partial<object> = {}
  //     component.properties.header.forEach((col: ITableHeader<any>) => {
  //       if (col.text) {
  //         const key = col.text.key as keyof object
  //         newRow[key] = row[key] ?? `Value of ${key}`
  //       }
  //     })
  //     return newRow
  //   })
  //   updateProperty("body", newBody, component, onPropertyChange)
  // }

  const updateButtonProperty = (columnIndex: number, buttonIndex: number, field: string, value: any) => {
    const headers = [...component.properties.header]
    console.log(headers)

    const buttons = [...headers[columnIndex].buttons]

    buttons[buttonIndex] = { ...buttons[buttonIndex], [field]: value }
    headers[columnIndex].buttons = buttons
    updateProperty("header", headers, component, onPropertyChange)
  }

  const updateProgressBarProperty = (columnIndex: number, field: string, value: any, progressBarIndex: number) => {
    const headers = [...component.properties.header]
    headers[columnIndex].progressBar[progressBarIndex] = { ...headers[columnIndex].progressBar[progressBarIndex], [field]: value }
    updateProperty("header", headers, component, onPropertyChange)
  }

  const updateImageProperty = (columnIndex: number, field: string, value: any, imageIndex: number) => {
    const headers = [...component.properties.header]
    headers[columnIndex].image[imageIndex] = { ...headers[columnIndex].image[imageIndex], [field]: value }
    updateProperty("header", headers, component, onPropertyChange)
  }

  const removeButtonFromColumn = (columnIndex: number, buttonIndex: number) => {
    const headers = [...component.properties.header]
    const buttons = [...headers[columnIndex].buttons]

    buttons.splice(buttonIndex, 1)
    headers[columnIndex].buttons = buttons.length ? buttons : undefined
    updateProperty("header", headers, component, onPropertyChange)
  }

  // let dragState: {
  //   isDragging: boolean
  //   command: Command | null
  //   startX: number
  //   startY: number
  //   offsetY: number
  //   ghostElement: HTMLElement | null
  //   placeholderElement: HTMLElement | null
  //   dropIndex: number | null
  //   categoryName: keyof SavedCommands | null
  // } = $state({
  //   isDragging: false,
  //   command: null,
  //   startX: 0,
  //   startY: 0,
  //   offsetY: 0,
  //   ghostElement: null,
  //   placeholderElement: null,
  //   dropIndex: null,
  //   categoryName: null,
  // })

  // /* Перетаскивание с MouseEvent */
  // const startDrag = async (e: MouseEvent, index: number, categoryName: keyof SavedCommands) => {
  //   const movedElement = document.getElementById(`item-${index}`) as HTMLElement
  //   if (!movedElement) return

  //   const element = movedElement.cloneNode(true) as HTMLElement
  //   const rect = movedElement.getBoundingClientRect()

  //   /* Создаем визуальный эффект перетаскивания */
  //   element.id = "drag-element"
  //   element.style.position = "fixed"
  //   element.style.zIndex = "9999"
  //   element.style.minHeight = `${rect.height}px`
  //   element.style.pointerEvents = "none"
  //   element.style.width = `${rect.width}px`
  //   element.style.background = "var(--field-color)"
  //   element.style.padding = "0.25rem"
  //   element.style.borderRadius = "1rem"
  //   element.style.top = `${rect.top}px`
  //   movedElement.parentNode?.appendChild(element)

  //   const placeholder = document.createElement("div")
  //   placeholder.style.minHeight = `${rect.height}px`
  //   placeholder.style.width = "100%"
  //   placeholder.style.border = "2px dashed var(--blue-color)"
  //   placeholder.style.borderRadius = "1rem"
  //   element.parentNode?.insertBefore(placeholder, movedElement)

  //   const [movedItem] = commands[categoryName].splice(index, 1)
  //   await tick()

  //   dragState = {
  //     isDragging: true,
  //     command: movedItem,
  //     startX: e.clientX,
  //     startY: e.clientY,
  //     offsetY: e.clientY - rect.top,
  //     ghostElement: element,
  //     placeholderElement: placeholder,
  //     dropIndex: index,
  //     categoryName,
  //   }
  //   commandItems = Array.from(commandContainer?.querySelectorAll('[id^="item-"]') || [])

  //   e.preventDefault()
  //   e.stopPropagation()
  // }

  // const processDrag = (e: MouseEvent) => {
  //   if (!dragState.isDragging || !dragState.ghostElement || !dragState.placeholderElement) return
  //   const ghost = dragState.ghostElement
  //   ghost.style.top = `${e.clientY - dragState.offsetY}px`

  //   const allElements = document.elementsFromPoint(dragState.startX, e.clientY)
  //   const cell = allElements.find((el) => el.classList.contains("saved-command")) as HTMLElement
  //   const newIndex = cell ? Number(cell.id.slice(5)) : null

  //   /* Находим целевой элемент перед которым нужно вставить placeholder */
  //   if (newIndex === null) return
  //   dragState.dropIndex = newIndex

  //   const placeholder = dragState.placeholderElement
  //   const targetElement = commandItems[dragState.dropIndex]

  //   if (targetElement && targetElement.parentNode) {
  //     const nextSibling = placeholder.nextSibling
  //     if (nextSibling !== targetElement) targetElement.parentNode.insertBefore(placeholder, targetElement)
  //   }
  // }

  // const endDrag = () => {
  //   if (!dragState.isDragging || !dragState.ghostElement || !dragState.categoryName) return

  //   /* Определение целевой ячейки под курсором */
  //   if (dragState.command !== null && dragState.dropIndex !== null) {
  //     const currentCommands = [...commands[dragState.categoryName]]
  //     currentCommands.splice(dragState.dropIndex, 0, dragState.command)
  //     commands = { ...commands, [dragState.categoryName]: currentCommands }
  //   }

  //   if (dragState.placeholderElement) dragState.placeholderElement.remove()
  //   if (dragState.ghostElement) dragState.ghostElement.remove()

  //   dragState = {
  //     isDragging: false,
  //     command: null,
  //     startX: 0,
  //     startY: 0,
  //     offsetY: 0,
  //     ghostElement: null,
  //     placeholderElement: null,
  //     dropIndex: null,
  //     categoryName: null,
  //   }
  // }

  // /* Глобальные обработчики для mouse events */
  // $effect(() => {
  //   if (dragState.isDragging) {
  //     window.addEventListener("mousemove", processDrag)
  //     window.addEventListener("mouseup", endDrag)
  //     return () => {
  //       window.removeEventListener("mousemove", processDrag)
  //       window.removeEventListener("mouseup", endDrag)
  //     }
  //   }
  // })
</script>

{#snippet TableOutline()}
  <UI.Switch
    label={{ name: $t("constructor.props.outline") }}
    value={component.properties.outline}
    options={[{ id: crypto.randomUUID(), value: 0, class: "" }]}
    onChange={(value) => updateProperty("outline", value, component, onPropertyChange)}
  />
{/snippet}

{#snippet TableBufferSize()}
  <UI.Select
    label={{ name: $t("constructor.props.table.buffersize") }}
    type="buttons"
    options={$optionsStore.BUFFER_SIZE_OPTIONS}
    value={$optionsStore.BUFFER_SIZE_OPTIONS.find((o) => o.value === component.properties.dataBuffer.bufferSize)}
    onUpdate={(value) => updateProperty("dataBuffer.bufferSize", (value as UI.IOption<number>).value as number, component, onPropertyChange)}
  />
{/snippet}

{#snippet TableVisibleRows()}
  <UI.Select
    label={{ name: $t("constructor.props.table.visibleRows") }}
    type="buttons"
    options={$optionsStore.VISIBLE_ROWS_OPTIONS}
    value={$optionsStore.VISIBLE_ROWS_OPTIONS.find((o) => o.value === component.properties.dataBuffer.visibleRows)}
    onUpdate={(value) => updateProperty("dataBuffer.visibleRows", (value as UI.IOption<number>).value as number, component, onPropertyChange)}
  />
{/snippet}

{#snippet TableColumnSettings(forConstructor: boolean)}
  <hr class="border-(--border-color)" />

  <!-- Настройки столбцов таблицы -->
  <div>
    <div class=" flex items-center justify-center gap-2">
      <h4>{$t("constructor.props.table.columns")}</h4>
      <UI.Button
        wrapperClass="w-8"
        content={{ icon: ButtonAdd }}
        onClick={() => {
          const newColumn: ITableHeader<any> = {
            label: { name: `Column ${(component.properties.header?.length || 0) + 1}`, class: "" },
            width: "10%",
            text: [{ key: `column${(component.properties.header?.length || 0) + 1}` }],
          }
          const headers = [...(component.properties.header || []), newColumn]
          updateProperty("header", headers, component, onPropertyChange)
          // updateTableBody()
        }}
      />
    </div>

    {#each component.properties.header as column, columnIndex (columnIndex)}
      <div class="flex flex-col pb-3 {columnIndex !== component.properties.header.length - 1 ? 'border-b border-(--border-color)/50 ' : ''}">
        <div class="p-2 pr-0 grid grid-cols-[1fr_minmax(5rem,10rem)_minmax(10rem,21rem)_2rem_2rem] items-end gap-2">
          <UI.Input
            label={{ name: $t("constructor.props.table.columns.label") }}
            value={column.label?.name}
            onUpdate={(value) => {
              updateTableHeader(columnIndex, "label", { ["name"]: value })
            }}
          />
          <UI.Input
            label={{ name: $t("constructor.props.table.columns.width"), class: "px-0" }}
            type="number"
            isValid={component.properties.header.reduce((width: number, h: ITableHeader<object>) => Number(h.width?.replace("%", "")) + width, 0) == 100}
            value={Number(column.width.replace("%", ""))}
            onUpdate={(value) => updateTableHeader(columnIndex, "width", `${value}%`)}
          />
          <UI.Select
            label={{ name: $t("constructor.props.align.content") }}
            type="buttons"
            value={$optionsStore.ALIGN_OPTIONS.find((a) => (a.value as string).includes(column.align ?? "left"))}
            options={$optionsStore.ALIGN_OPTIONS}
            onUpdate={(option) => updateTableHeader(columnIndex, "align", (option as UI.IOption).value)}
          />
          <div
            class="relative flex items-end"
            role="button"
            tabindex="0"
            onmouseenter={() => (isDropdownOpen = columnIndex)}
            onmouseleave={() => {
              isDropdownOpen = -1
            }}
          >
            <button class="size-8 [&_svg]:h-full [&_svg]:max-h-full [&_svg]:w-full [&_svg]:max-w-full cursor-pointer">
              <ButtonAdd />
            </button>
            {#if isDropdownOpen == columnIndex}
              <div
                class="absolute top-full left-1/2 z-50 -translate-x-1/2 rounded-b-xl shadow-[0_0_3px_rgb(0_0_0_/0.25)] w-25"
                transition:slide={{ duration: 250 }}
              >
                {#each $optionsStore.TABLE_CONTENT_TYPE_OPTIONS.slice(0, forConstructor ? 4 : 5) as option, index (option.id)}
                  <button
                    id={option.id}
                    value={option?.value ? String(option.value) : ""}
                    class={`flex h-full w-full cursor-pointer items-center justify-center p-1  duration-250 hover:bg-(--field-color)
              ${index === $optionsStore.TABLE_CONTENT_TYPE_OPTIONS.slice(0, forConstructor ? 4 : 5).length - 1 ? "rounded-b-xl" : ""} ${index === 0 ? "rounded-t-xl" : "inset-shadow-[0_10px_10px_-15px_rgb(0_0_0_/0.5)]"}`}
                    onclick={(e) => addContent(option, e, columnIndex)}
                    style="background: color-mix(in srgb, var(--back-color), var(--back-color) 70%);"
                  >
                    {option.name}
                  </button>
                {/each}
              </div>
            {/if}
          </div>
          <!-- <UI.Select
            label={{ name: $t("constructor.props.table.content.type") }}
            type="buttons"
            multiSelect
            options={forConstructor ? $optionsStore.TABLE_CONTENT_TYPE_OPTIONS.slice(0, 4) : $optionsStore.TABLE_CONTENT_TYPE_OPTIONS}
            value={$optionsStore.TABLE_CONTENT_TYPE_OPTIONS.filter((opt) => Object.hasOwn(component.properties.header[columnIndex], opt.value))}
            // value={$optionsStore.TABLE_CONTENT_TYPE_OPTIONS.find((h) => h.value === column.type) || $optionsStore.TABLE_CONTENT_TYPE_OPTIONS[0]}
            onUpdate={(value) => {
              // column.type = (value as UI.IOption).value
              // if ((value as UI.IOption).value == "buttons" && (!column.buttons || column.buttons.length == 0)) addNewButton(columnIndex)
              // if ((value as UI.IOption).value == "progressBar" && !column.progressBar) column.progressBar = {}

              changeColumnType(value, columnIndex)
              // if ((value as UI.IOption).value == "buttons" && (!column.buttons || column.buttons.length == 0)) addNewButton(columnIndex)
              // if ((value as UI.IOption).value == "progressBar" && !column.progressBar) column.progressBar = {}
            }}
          /> -->
          <UI.Button
            wrapperClass="w-8"
            content={{ icon: ButtonDelete }}
            onClick={() => {
              const headers = [...(component.properties.header || [])]
              headers.splice(columnIndex, 1)
              updateProperty("header", headers, component, onPropertyChange)
            }}
          />
        </div>
        <div class="flex flex-col gap-2">
          {#if column.text}
            {#each column.text as text, textIndex}
              <div class="relative bg-(--container-color)/50 rounded-2xl p-2">
                <div class="flex gap-2 mx-auto items-end" style="width: {forConstructor ? '65%' : '90%'}; ">
                  <UI.Input
                    wrapperClass="w-1/4"
                    label={{ name: $t("constructor.props.table.text.key") }}
                    value={text.key}
                    help={{ regExp: /^[0-9a-zA-Z_.-]{0,16}$/ }}
                    onUpdate={(value) => {
                      updateTableHeader(
                        columnIndex,
                        "text",
                        column.text.map((textItem: any, i: number) => (i == textIndex ? { ...textItem, key: value } : textItem)),
                      )

                      // updateTableBody()
                    }}
                  />
                  <UI.Select
                    label={{ name: $t("constructor.props.tablecolumn.settings") }}
                    type="buttons"
                    multiSelect={true}
                    value={$optionsStore.TABLE_TEXT_SETTING_OPTIONS.slice(0, forConstructor ? 3 : 5).filter((opt) => {
                      if (component.properties.header[columnIndex].text[textIndex][opt.value]) return opt
                    })}
                    options={$optionsStore.TABLE_TEXT_SETTING_OPTIONS.slice(0, forConstructor ? 3 : 5)}
                    onUpdate={(value) => changeColumnSettings(value, columnIndex, textIndex)}
                  />
                </div>

                <!-- <div
                  class="cursor-move absolute left-2 bottom-2 size-8 [&_svg]:h-full [&_svg]:max-h-full [&_svg]:w-full [&_svg]:max-w-full"
                  role="button"
                  tabindex={0}
                  onkeydown={null}
                  onmousedown={(e) => startDrag(e, textIndex, column.text)}
                >
                  <MoveVerticalIcon />
                </div> -->

                <UI.Button
                  wrapperClass="absolute right-2 bottom-2 w-8"
                  content={{ icon: ButtonDelete }}
                  onClick={() => {
                    const headers = [...(component.properties.header || [])]
                    ;(headers as ITableHeader<object>[])[columnIndex].text?.splice(textIndex, 1)
                    if (!headers[columnIndex].text.length)
                      headers[columnIndex] = Object.fromEntries(Object.entries(headers[columnIndex]).filter((h) => h[0] !== "text"))
                    updateProperty("header", headers, component, onPropertyChange)
                  }}
                />
              </div>
            {/each}
          {/if}
          {#if column.select}
            {#each column.select as select, selectIndex}
              <div class="relative bg-(--container-color)/50 rounded-2xl p-2">
                <div class="flex w-1/3 mx-auto gap-2">
                  <UI.Input
                    wrapperClass="w-1/2"
                    label={{ name: $t("constructor.props.table.select.key") }}
                    value={select.key}
                    help={{ regExp: /^[0-9a-zA-Z_.-]{0,16}$/ }}
                    onUpdate={(value) => {
                      updateTableHeader(
                        columnIndex,
                        "select",
                        column.select.map((selectItem: any, i: number) => (i == selectIndex ? { ...selectItem, key: value } : selectItem)),
                      )
                      // updateTableBody()
                    }}
                  />
                  <UI.Input
                    wrapperClass="w-1/2"
                    label={{ name: $t("constructor.props.table.select.keys") }}
                    value={select?.keyCol ?? ""}
                    maxlength={500}
                    help={{ info: $t("constructor.props.table.select.keys.info"), regExp: /^[a-zA-Z0-9\-_ ]{0,500}$/ }}
                    onUpdate={(value) => {
                      const headers = [...component.properties.header]
                      headers[columnIndex].select[selectIndex] = { ...headers[columnIndex].select[selectIndex], keyCol: value }
                      updateProperty("header", headers, component, onPropertyChange)
                    }}
                  />
                </div>

                <UI.Button
                  wrapperClass="absolute right-2 bottom-2 w-8"
                  content={{ icon: ButtonDelete }}
                  onClick={() => {
                    const headers = [...(component.properties.header || [])]
                    ;(headers as ITableHeader<object>[])[columnIndex].select?.splice(selectIndex, 1)
                    if (!headers[columnIndex].select.length)
                      headers[columnIndex] = Object.fromEntries(Object.entries(headers[columnIndex]).filter((h) => h[0] !== "select"))
                    updateProperty("header", headers, component, onPropertyChange)
                  }}
                />
              </div>
            {/each}
          {/if}
          {#if column.buttons}
            <div class="w-full bg-(--container-color)/50 rounded-2xl p-2">
              {#each column.buttons as button, buttonIndex (buttonIndex)}
                <div class="flex items-end justify-between gap-2">
                  <UI.Input
                    label={{ name: $t("constructor.props.name") }}
                    wrapperClass="w-2/10"
                    value={button.name}
                    onUpdate={(value) => updateButtonProperty(columnIndex, buttonIndex, "name", value)}
                  />

                  <UI.Select
                    wrapperClass="w-80 h-14.5"
                    label={{ name: $t("constructor.props.colors") }}
                    type="buttons"
                    options={$optionsStore.COLOR_OPTIONS.filter((option) => option.value !== "bg-max")}
                    value={$optionsStore.COLOR_OPTIONS.find((c) =>
                      (c.value as string).includes((button.class ?? component.properties.wrapperClass).split(" ").find((cls: string) => cls.startsWith("bg-"))),
                    )}
                    onUpdate={(value) => {
                      updateButtonProperty(columnIndex, buttonIndex, "class", (value as UI.IOption).value)
                    }}
                  />

                  <div class="relative mt-6 flex w-1/4 gap-2">
                    <CommonSnippets
                      snippet="IconsLib"
                      initialValue={{
                        name: $t("constructor.props.table.type.icon"),
                        icon: column.buttons[buttonIndex].icon,
                        updateProperty: (icon: string) => updateButtonProperty(columnIndex, buttonIndex, "icon", icon),
                        icons: { array: ICONS },
                      }}
                      {component}
                      {onPropertyChange}
                    />
                  </div>

                  <UI.Select
                    wrapperClass="w-1/4"
                    label={{ name: $t("constructor.props.header") }}
                    type="buttons"
                    value={$optionsStore.HEADER_OPTIONS.find((h) => h.value === button.eventHandler?.Header)}
                    options={$optionsStore.HEADER_OPTIONS}
                    onUpdate={(option) => {
                      const handler = button.eventHandler
                      handler.Header = (option as UI.IOption).value as string
                      updateButtonProperty(columnIndex, buttonIndex, "eventHandler", handler)
                    }}
                  />
                  <UI.Input
                    wrapperClass="w-2/10"
                    label={{ name: $t("constructor.props.argument") }}
                    value={button.eventHandler?.Argument}
                    onUpdate={(value) => {
                      const handler = button.eventHandler
                      handler.Argument = value as string
                      updateButtonProperty(columnIndex, buttonIndex, "eventHandler", handler)
                    }}
                  />
                  <UI.Input
                    wrapperClass="w-2/10"
                    label={{ name: $t("constructor.props.table.keys") }}
                    value={button.eventHandler?.Variables.join(" ")}
                    maxlength={500}
                    help={{ info: $t("constructor.props.table.keys.info"), regExp: /^[a-zA-Z0-9\-._ ]{0,500}$/ }}
                    onUpdate={(value) => {
                      const handler = { ...button.eventHandler }
                      handler.Variables = (value as string).trim().split(/\s+/)
                      updateButtonProperty(columnIndex, buttonIndex, "eventHandler", handler)
                    }}
                  />
                  <UI.Button wrapperClass="w-8" content={{ icon: ButtonDelete }} onClick={() => removeButtonFromColumn(columnIndex, buttonIndex)} />
                </div>
              {/each}
            </div>
          {/if}
          {#if column.progressBar}
            {#each column.progressBar as progressBar, progressBarIndex}
              <div class="relative bg-(--container-color)/50 rounded-2xl p-2">
                <div class="w-3/5 flex mx-auto items-end gap-2">
                  <UI.Input
                    label={{ name: $t("constructor.props.table.progressBar.key") }}
                    value={progressBar.key}
                    help={{ regExp: /^[0-9a-zA-Z_.-]{0,16}$/ }}
                    onUpdate={(value) => {
                      updateTableHeader(
                        columnIndex,
                        "progressBar",
                        column.progressBar.map((progressBarItem: any, i: number) =>
                          i == progressBarIndex ? { ...progressBarItem, key: value } : progressBarItem,
                        ),
                      )
                      // updateTableBody()
                    }}
                  />
                  <UI.Input
                    wrapperClass="w-1/2"
                    label={{ name: $t("constructor.props.min") }}
                    value={(progressBar?.minNum as number) ?? 0}
                    type="number"
                    onUpdate={(value) => updateProgressBarProperty(columnIndex, "minNum", value as string, progressBarIndex)}
                  />
                  <UI.Input
                    wrapperClass="w-1/2"
                    label={{ name: $t("constructor.props.max") }}
                    value={(progressBar?.maxNum as number) ?? 100}
                    type="number"
                    onUpdate={(value) => updateProgressBarProperty(columnIndex, "maxNum", value as string, progressBarIndex)}
                  />
                  <UI.Input
                    label={{ name: $t("constructor.props.units") }}
                    value={progressBar?.units}
                    onUpdate={(value) => updateProgressBarProperty(columnIndex, "units", value as string, progressBarIndex)}
                  />
                </div>
                <UI.Button
                  wrapperClass="absolute right-2 bottom-2 w-8"
                  content={{ icon: ButtonDelete }}
                  onClick={() => {
                    const headers = [...(component.properties.header || [])]
                    ;(headers as ITableHeader<object>[])[columnIndex].progressBar?.splice(progressBarIndex, 1)
                    if (!headers[columnIndex].progressBar.length)
                      headers[columnIndex] = Object.fromEntries(Object.entries(headers[columnIndex]).filter((h) => h[0] !== "progressBar"))
                    updateProperty("header", headers, component, onPropertyChange)
                  }}
                />
              </div>
            {/each}
          {/if}
          {#if !forConstructor && column.image}
            {#each column.image as image, imageIndex}
              <div class="relative bg-(--container-color)/50 rounded-2xl p-2">
                <div class="flex items-end gap-2 w-[80%] mx-auto">
                  <CommonSnippets
                    snippet="IconsLib"
                    initialValue={{
                      name: $t("constructor.props.table.columns.defaultIcon"),
                      icon: image?.defaultIcon ?? "",
                      updateProperty: (icon: string) => {
                        updateImageProperty(columnIndex, "defaultIcon", icon, imageIndex)
                        console.log(image)

                        if (!image?.width || image?.width === "0rem") updateImageProperty(columnIndex, "width", "1rem", imageIndex)
                        if (!image?.width || image?.height === "0rem") updateImageProperty(columnIndex, "height", "1rem", imageIndex)
                      },
                      icons: { array: ICONS },
                    }}
                    {component}
                    {onPropertyChange}
                  />

                  <UI.Input
                    label={{ name: $t("constructor.props.table.columns.class") }}
                    value={image?.class}
                    onUpdate={(value) => updateImageProperty(columnIndex, "class", value, imageIndex)}
                  />
                  <UI.Input
                    wrapperClass="w-4/10"
                    label={{ name: $t("constructor.props.table.columns.image.width"), class: "px-0" }}
                    type="number"
                    number={{ minNum: 0, maxNum: 1000, step: 1 }}
                    value={Number(image?.width?.replace("rem", "") ?? 0)}
                    onUpdate={(value) => updateImageProperty(columnIndex, "width", `${value ?? 0}rem`, imageIndex)}
                  />
                  <UI.Input
                    wrapperClass="w-4/10"
                    label={{ name: $t("constructor.props.table.columns.image.height"), class: "px-0" }}
                    type="number"
                    number={{ minNum: 0, maxNum: 1000, step: 1 }}
                    value={Number(image?.height?.replace("rem", "") ?? 0)}
                    onUpdate={(value) => updateImageProperty(columnIndex, "height", `${value ?? 0}rem`, imageIndex)}
                  />
                </div>
                <UI.Button
                  wrapperClass="absolute right-2 bottom-2 w-8"
                  content={{ icon: ButtonDelete }}
                  onClick={() => {
                    const headers = [...(component.properties.header || [])]
                    ;(headers as ITableHeader<object>[])[columnIndex].image?.splice(imageIndex, 1)
                    if (!headers[columnIndex].image.length)
                      headers[columnIndex] = Object.fromEntries(Object.entries(headers[columnIndex]).filter((h) => h[0] !== "image"))
                    updateProperty("header", headers, component, onPropertyChange)
                  }}
                />
              </div>
            {/each}
          {/if}
        </div>
      </div>
    {/each}
  </div>
{/snippet}

{#snippet TableFooter()}
  <UI.Input
    label={{ name: $t("constructor.props.footer") }}
    value={component.properties.footer}
    onUpdate={(value) => updateProperty("footer", value as string, component, onPropertyChange)}
  />
{/snippet}

{#snippet TableStashData()}
  <UI.Switch
    label={{ name: $t("constructor.props.table.stashData") }}
    value={component.properties.dataBuffer.stashData}
    options={[{ id: crypto.randomUUID(), value: 0, class: "" }]}
    onChange={(value) => {
      updateProperty("dataBuffer.stashData", value, component, onPropertyChange)
      if (value == 0) {
        updateProperty("dataBuffer.clearButton", 0, component, onPropertyChange)
        updateProperty("dataBuffer.logger", 0, component, onPropertyChange)
      }
    }}
  />
{/snippet}

{#snippet TableClearButton()}
  <UI.Switch
    label={{
      name: $t("constructor.props.table.clearButton"),
    }}
    value={component.properties.dataBuffer.clearButton}
    options={[{ id: crypto.randomUUID(), value: 0, class: "", disabled: !component.properties.dataBuffer.stashData }]}
    onChange={(value) => {
      updateProperty("dataBuffer.clearButton", value, component, onPropertyChange)
    }}
  />
{/snippet}

{#snippet TableLogger()}
  <UI.Switch
    label={{ name: $t("constructor.props.table.logger"), captionLeft: $t("constructor.props.info.bottom"), captionRight: $t("constructor.props.info.top") }}
    value={component.properties.dataBuffer.logger}
    options={[{ id: crypto.randomUUID(), value: 0, class: "", disabled: !component.properties.dataBuffer.stashData }]}
    onChange={(value) => {
      updateProperty("dataBuffer.logger", value, component, onPropertyChange)
    }}
  />
{/snippet}

{#if forConstructor}
  <div class="relative flex flex-row items-start justify-center pb-4">
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Variable" {VARIABLE_OPTIONS} {component} {onPropertyChange} />
      <CommonSnippets snippet="Access" {component} {onPropertyChange} />
      {@render TableStashData()}
      {#if component.properties.dataBuffer.stashData}
        <div class="flex items-end">
          {@render TableClearButton()}
          {@render TableLogger()}
        </div>
      {/if}
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Colors" initialValue={{ color: initialColor }} {component} {onPropertyChange} />
      {@render TableOutline()}
      {#if component.properties.dataBuffer.stashData}
        {@render TableBufferSize()}
      {/if}
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Label" {component} {onPropertyChange} />
      <CommonSnippets snippet="LabelAlign" initialValue={initialAlign} {component} {onPropertyChange} />
      {#if component.properties.dataBuffer.stashData}
        {@render TableVisibleRows()}
      {/if}
    </div>
  </div>
  {@render TableColumnSettings(forConstructor)}
{:else}
  <div class="relative flex flex-row items-start justify-center pb-4">
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Identificator" {component} {onPropertyChange} />
      <CommonSnippets snippet="WrapperClass" {component} {onPropertyChange} />
      <CommonSnippets snippet="Colors" initialValue={{ color: initialColor }} {component} {onPropertyChange} />
      {@render TableOutline()}
    </div>

    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Access" {component} {onPropertyChange} />
      <CommonSnippets snippet="Label" {component} {onPropertyChange} />
      <CommonSnippets snippet="LabelClass" {component} {onPropertyChange} />
    </div>

    <div class="flex w-1/3 flex-col px-2">
      {@render TableFooter()}
      <div class="flex items-end">
        {@render TableStashData()}
        {@render TableClearButton()}
        {@render TableLogger()}
      </div>

      {#if component.properties.dataBuffer.stashData}
        {@render TableBufferSize()}
        {@render TableVisibleRows()}
      {/if}
    </div>
  </div>
  {@render TableColumnSettings(forConstructor)}
{/if}
