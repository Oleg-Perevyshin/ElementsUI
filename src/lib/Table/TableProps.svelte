<script lang="ts">
  import { getContext } from "svelte"
  import { T } from "../locales/i18n"
  import type { UIComponent, ITableProps, ITableHeader, ITableContent } from "../types"
  import { createPropsEditor, type PropertyChange } from "../propsEditor"
  import * as UI from ".."
  import ButtonDelete from "../libIcons/ButtonDelete.svelte"
  import ButtonAdd from "../libIcons/ButtonAdd.svelte"
  import { ARGUMENT_MAX_LENGTH, ARGUMENT_REGEXP, optionsStore } from "../options"
  import { isAccentColor, type AccentColor } from "../accent"
  import { ICONS } from "../icons"
  import CommonSnippets from "../CommonSnippets.svelte"
  import PropsGroup from "../PropsGroup.svelte"
  import PropsListModal from "../PropsListModal.svelte"
  import { slide } from "svelte/transition"
  import Dragging from "../Dragging.svelte"
  import InfoIcon from "../libIcons/InfoIcon.svelte"

  const {
    component,
    onPropertyChange,
  }: {
    component: UIComponent<"Table">
    onPropertyChange: (change: PropertyChange<ITableProps<Record<string, unknown>>>) => void
  } = $props()

  const edit = $derived(createPropsEditor(component, onPropertyChange))

  const DeviceVariables = getContext<{ id: string; value: string; name: string }[]>("DeviceVariables")
  let VARIABLE_OPTIONS = $derived(DeviceVariables && Array.isArray(DeviceVariables) ? DeviceVariables : [])

  let isDropdownOpen = $state(-1)

  /* Цвет кнопки ячейки - роль bg-* в её class */
  /* Цвет кнопки по классу bg-*: без него - цвет таблицы, bg-transparent - без цвета */
  const roleOf = (classes: string | undefined, fallback?: AccentColor): AccentColor | undefined => {
    const role = classes?.match(/(?:^|\s)bg-(\w+)/)?.[1]
    return role === undefined ? fallback : isAccentColor(role) ? role : undefined
  }

  let settingsContainer: HTMLDivElement[] = $state([])
  let columnContainer: HTMLDivElement | null = $state(null)
  /* Акцентная левая полоса столбца (вместо сплошной цветной заливки) - та же семантическая палитра ролей, что и в остальной дизайн-системе (app.css), уже тема-зависимая */
  const columnAccentColors = [
    "border-l-(--red-color)",
    "border-l-(--green-color)",
    "border-l-(--blue-color)",
    "border-l-(--orange-color)",
    "border-l-(--cyan-color)",
    "border-l-(--purple-color)",
  ]

  /* В конструкторе содержимое столбца - сохранённые данные: массив, а не функция (row) => ... из кода приложений; data элемента правится как обычный объект полей */
  const columnContent = (column: ITableHeader<Record<string, unknown>> | undefined): ITableContent<Record<string, unknown>>[] =>
    Array.isArray(column?.content) ? column.content : []
  const contentData = (columnIndex: number, index: number) =>
    (columnContent(component.properties.header?.[columnIndex])[index]?.data ?? {}) as Record<string, unknown>

  const changeColumnSettings = (settings: string[], columnIndex: number, index: number) =>
    updateContentData(
      columnIndex,
      index,
      Object.fromEntries($optionsStore.TABLE_TEXT_SETTING_OPTIONS.map((option) => [option.value, settings.includes(option.value)])),
    )

  const addContent = (option: UI.IOption, event: MouseEvent, columnIndex: number) => {
    event.stopPropagation()
    const header = component.properties.header ?? []
    const column = header[columnIndex]
    if (!column) return
    const content = [
      ...columnContent(column),
      {
        type: option.value,
        data:
          option.value === "button"
            ? {
                name: `button`,
                class: "bg-blue",
                eventHandler: { Header: "SET", Argument: "ModCfg", Variables: [] },
                onClick: () => {},
              }
            : {},
      } as ITableContent<Record<string, unknown>>,
    ]

    edit.set(
      "header",
      header.map((col, i) => (i === columnIndex ? { ...col, content } : col)),
    )
    isDropdownOpen = -1
  }

  const updateTableHeader = (index: number, field: string, value: any) => {
    const headers = [...(component.properties.header ?? [])]
    headers[index] = { ...headers[index], [field]: value }
    edit.set("header", headers)
  }

  const updateContentProperty = (columnIndex: number, index: number, field: string, value: any) => updateContentData(columnIndex, index, { [field]: value })
  const updateContentData = (columnIndex: number, index: number, data: Record<string, unknown>) => {
    const headers = [...(component.properties.header ?? [])]
    const content = columnContent(headers[columnIndex])
    if (!content[index]) return
    headers[columnIndex] = {
      ...headers[columnIndex],
      content: content.map((item, i) => (i === index ? ({ ...item, data: { ...item.data, ...data } } as ITableContent<Record<string, unknown>>) : item)),
    }
    edit.set("header", headers)
  }
</script>

{#snippet TableOutline()}
  <UI.Switch
    label={{ name: $T("constructor.props.outline") }}
    value={component.properties.outline ? 1 : 0}
    onUpdate={(value) => edit.set("outline", value === 1)}
  />
{/snippet}

{#snippet TableBufferSize()}
  <UI.Select
    label={{ name: $T("constructor.props.table.buffersize") }}
    type="buttons"
    options={$optionsStore.BUFFER_SIZE_OPTIONS as UI.IOption<number>[]}
    value={component.properties.dataBuffer?.bufferSize}
    onUpdate={(value) => edit.patch("dataBuffer", { bufferSize: value })}
  />
{/snippet}

{#snippet TableVisibleRows()}
  <UI.Select
    label={{ name: $T("constructor.props.table.visibleRows") }}
    type="buttons"
    options={$optionsStore.VISIBLE_ROWS_OPTIONS as UI.IOption<number>[]}
    value={component.properties.dataBuffer?.visibleRows}
    onUpdate={(value) => edit.patch("dataBuffer", { visibleRows: value })}
  />
{/snippet}

{#snippet TableColumnSettings()}
  <PropsListModal label={$T("constructor.props.table.columns")} count={component.properties.header?.length ?? 0} wrapperClass="w-300 h-[85%]">
    {#snippet main()}
      <PropsGroup>
        {#snippet headerActions()}
          <UI.Button
            wrapperClass="w-8"
            content={{ icon: ButtonAdd }}
            onClick={() => {
              const newColumn: ITableHeader<any> = {
                label: { name: `Column ${(component.properties.header?.length || 0) + 1}`, class: "" },
                width: "10%",
                content: [{ type: "text", data: { key: "" } }],
              }
              const headers = [...(component.properties.header || []), newColumn]
              edit.set("header", headers)
            }}
          />
        {/snippet}

        <div bind:this={columnContainer} class="flex flex-col gap-2">
          {#each component.properties.header ?? [] as column, columnIndex (columnIndex)}
            <div
              id="column-{columnIndex}"
              class="relative flex flex-col rounded-[10px] border border-(--hairline-color) border-l-2 bg-(--container-color)/40 p-1.5 {columnAccentColors[
                columnIndex % columnAccentColors.length
              ]}"
            >
              <Dragging
                wrapperClass="absolute top-10"
                container={columnContainer}
                array={component.properties.header ?? []}
                elementsId="column"
                elementIndex={columnIndex}
                onUpdate={(updatedArray) => {
                  if (Array.isArray(updatedArray) && updatedArray.every((item) => typeof item === "object" && "content" in item)) {
                    edit.set("header", updatedArray)
                  }
                }}
              />
              <div class="py-1.5 pl-9 grid grid-cols-[minmax(5rem,7rem)_minmax(18rem,22rem)_2rem_2rem_1fr] items-end gap-1.5">
                <UI.Input
                  label={{ name: $T("constructor.props.table.columns.width"), class: "px-0" }}
                  type="number"
                  accent={(component.properties.header ?? []).some((h: ITableHeader<Record<string, unknown>>) => h.width === "fit") ||
                  (component.properties.header ?? []).reduce(
                    (width: number, h: ITableHeader<Record<string, unknown>>) => (h.width?.endsWith("%") ? parseFloat(h.width) || 0 : 0) + width,
                    0,
                  ) == 100
                    ? undefined
                    : "red"}
                  value={column.width?.endsWith("%") ? parseFloat(column.width) : undefined}
                  onUpdate={(value) => updateTableHeader(columnIndex, "width", `${value}%`)}
                />
                <UI.Select
                  label={{ name: $T("constructor.props.align.content") }}
                  type="buttons"
                  value={column.align ?? "left"}
                  options={$optionsStore.ALIGN_OPTIONS}
                  onUpdate={(option) => updateTableHeader(columnIndex, "align", option)}
                />
                <div
                  class="relative flex items-end"
                  role="button"
                  tabindex="0"
                  onmouseenter={() => (isDropdownOpen = columnIndex)}
                  onmouseleave={() => (isDropdownOpen = -1)}
                >
                  <button class="size-8 [&_svg]:h-full [&_svg]:max-h-full [&_svg]:w-full [&_svg]:max-w-full cursor-pointer">
                    <ButtonAdd />
                  </button>
                  {#if isDropdownOpen == columnIndex}
                    <div
                      class="absolute top-full left-1/2 z-50 -translate-x-1/2 rounded-b-xl shadow-(--border-shadow-color) w-25"
                      transition:slide={{ duration: 250 }}
                    >
                      {#each $optionsStore.TABLE_CONTENT_TYPE_OPTIONS as option, index (option.id)}
                        <button
                          id={option.id}
                          value={option?.value ? String(option.value) : ""}
                          class={`flex h-full w-full cursor-pointer items-center justify-center p-1  duration-250 hover:bg-(--field-color)
              ${index === $optionsStore.TABLE_CONTENT_TYPE_OPTIONS.length - 1 ? "rounded-b-xl" : ""} ${index === 0 ? "rounded-t-xl" : "inset-shadow-[0_10px_10px_-15px_rgb(0_0_0_/0.5)] dark:inset-shadow-[0_10px_10px_-15px_rgb(0_0_0_/0.5)]"}`}
                          onclick={(e) => addContent(option, e, columnIndex)}
                          style="background: color-mix(in srgb, var(--back-color), var(--back-color) 70%);"
                        >
                          {option.name}
                        </button>
                      {/each}
                    </div>
                  {/if}
                </div>
                <UI.Button
                  wrapperClass="w-8"
                  content={{ icon: ButtonDelete }}
                  onClick={() => {
                    const headers = [...(component.properties.header || [])]
                    headers.splice(columnIndex, 1)
                    edit.set("header", headers)
                  }}
                />
              </div>
              <div class="flex flex-col gap-2" bind:this={settingsContainer[columnIndex]}>
                {#if typeof column.content !== "function"}
                  {@const contentItems = column.content ?? []}
                  {#each contentItems as content, index}
                    <div
                      id={`item-${index}-${columnIndex}`}
                      class="grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-lg border border-(--hairline-color) bg-(--back-color)/60 p-2"
                    >
                      <Dragging
                        wrapperClass="shrink-0"
                        container={settingsContainer[columnIndex]}
                        array={contentItems}
                        elementIndex={index}
                        containerIndex={columnIndex}
                        onUpdate={(updatedArray, index) => {
                          if (index === columnIndex) {
                            const headers = [...(component.properties.header ?? [])]
                            headers[columnIndex].content = updatedArray
                            edit.set("header", headers)
                          }
                        }}
                      />
                      <div class="flex min-w-0 flex-col gap-2">
                        {#if content.type == "text"}
                          {@const text = content.data}
                          <div class="flex flex-wrap items-end gap-2">
                            <UI.Input
                              wrapperClass="min-w-32 flex-1"
                              label={{ name: $T("constructor.props.table.text.key") }}
                              value={text.key}
                              help={{ regExp: /^[0-9a-zA-Z_.-]{0,16}$/ }}
                              onUpdate={(value) => {
                                updateTableHeader(
                                  columnIndex,
                                  "content",
                                  contentItems.map((textItem: any, i: number) =>
                                    i == index ? { ...textItem, data: { ...textItem.data, key: value } } : textItem,
                                  ),
                                )
                              }}
                            />
                            <UI.Select
                              wrapperClass="min-w-60 flex-[2]"
                              label={{ name: $T("constructor.props.tablecolumn.settings") }}
                              type="buttons"
                              multiSelect={true}
                              value={$optionsStore.TABLE_TEXT_SETTING_OPTIONS.map((option) => option.value).filter(
                                (key) => contentData(columnIndex, index)[key],
                              )}
                              options={$optionsStore.TABLE_TEXT_SETTING_OPTIONS}
                              onUpdate={(value) => changeColumnSettings(value, columnIndex, index)}
                            />
                          </div>
                        {:else if content.type == "select"}
                          {@const select = content.data}
                          <div class="flex flex-wrap items-end gap-2">
                            <UI.Input
                              wrapperClass="min-w-32 flex-1"
                              label={{ name: $T("constructor.props.table.select.key") }}
                              value={select.key}
                              help={{ regExp: /^[0-9a-zA-Z_.-]{0,16}$/ }}
                              onUpdate={(value) => {
                                updateTableHeader(
                                  columnIndex,
                                  "content",
                                  contentItems.map((textItem: any, i: number) =>
                                    i == index ? { ...textItem, data: { ...textItem.data, key: value } } : textItem,
                                  ),
                                )
                              }}
                            />
                            <UI.Input
                              wrapperClass="min-w-40 flex-1"
                              label={{ name: $T("constructor.props.table.select.keys") }}
                              value={select?.keyCol ?? ""}
                              maxlength={500}
                              help={{ info: $T("constructor.props.table.select.keys.info"), regExp: /^[a-zA-Z0-9\-_ ]{0,500}$/ }}
                              onUpdate={(value) => updateContentProperty(columnIndex, index, "keyCol", value)}
                            />
                          </div>
                        {:else if content.type == "button"}
                          {@const button = typeof content.data === "function" ? {} : content.data}
                          <!-- Строка 1 - как выглядит кнопка, строка 2 - какую команду она шлёт -->
                          <div class="flex flex-wrap items-end gap-2">
                            <div class="relative min-w-32 flex-1">
                              <CommonSnippets
                                snippet="IconsLib"
                                initialValue={{
                                  name: $T("constructor.props.table.type.icon"),
                                  icon: button.icon,
                                  onUpdate: (icon: string) => updateContentProperty(columnIndex, index, "icon", icon),
                                  icons: { array: ICONS },
                                }}
                                {component}
                                {onPropertyChange}
                              />
                            </div>
                            <div class="flex min-w-72 flex-[2] items-end gap-1">
                              <UI.Button
                                wrapperClass="w-8 shrink-0"
                                content={{ icon: InfoIcon, info: { text: $T("constructor.props.button.colors.hint"), side: "right" } }}
                              />
                              <UI.Select
                                wrapperClass="min-w-0 flex-1"
                                label={{ name: $T("constructor.props.colors") }}
                                type="buttons"
                                options={$optionsStore.ACCENT_OPTIONS}
                                value={roleOf(button.class as string, component.properties.accent)}
                                onUpdate={(accent) =>
                                  updateContentProperty(
                                    columnIndex,
                                    index,
                                    "class",
                                    roleOf(button.class as string) === accent ? "bg-transparent" : `bg-${accent}`,
                                  )}
                              />
                            </div>
                          </div>
                          <div class="flex flex-wrap items-end gap-2">
                            <UI.Select
                              wrapperClass="min-w-56 flex-1"
                              label={{ name: $T("constructor.props.header") }}
                              type="buttons"
                              value={button.eventHandler?.Header}
                              options={$optionsStore.HEADER_OPTIONS}
                              onUpdate={(option) => {
                                const handler = { ...button.eventHandler, Header: option }
                                updateContentProperty(columnIndex, index, "eventHandler", handler)
                              }}
                            />
                            <UI.Input
                              wrapperClass="min-w-28 flex-1"
                              label={{ name: $T("constructor.props.argument") }}
                              value={button.eventHandler?.Argument}
                              maxlength={ARGUMENT_MAX_LENGTH}
                              help={{ info: $T("constructor.props.argument.info"), regExp: ARGUMENT_REGEXP }}
                              onUpdate={(value) => {
                                const handler = { ...button.eventHandler, Argument: value as string }
                                updateContentProperty(columnIndex, index, "eventHandler", handler)
                              }}
                            />
                            <UI.Input
                              wrapperClass="min-w-40 flex-[2]"
                              label={{ name: $T("constructor.props.table.keys") }}
                              value={button.eventHandler?.Variables?.join(" ")}
                              maxlength={500}
                              help={{ info: $T("constructor.props.table.keys.info"), regExp: /^[a-zA-Z0-9\-._ ]{0,500}$/ }}
                              onUpdate={(value) => {
                                const handler = { ...button.eventHandler }
                                handler.Variables = (value as string).trim().split(/\s+/)
                                updateContentProperty(columnIndex, index, "eventHandler", handler)
                              }}
                            />
                          </div>
                        {:else if content.type == "progressBar"}
                          {@const progressBar = content.data}
                          <div class="flex flex-wrap items-end gap-2">
                            <UI.Input
                              wrapperClass="min-w-28 flex-1"
                              label={{ name: $T("constructor.props.table.progressBar.key") }}
                              value={progressBar.key}
                              help={{ regExp: /^[0-9a-zA-Z_.-]{0,16}$/ }}
                              onUpdate={(value) => {
                                updateTableHeader(
                                  columnIndex,
                                  "content",
                                  contentItems.map((textItem: any, i: number) =>
                                    i == index ? { ...textItem, data: { ...textItem.data, key: value } } : textItem,
                                  ),
                                )
                              }}
                            />
                            <UI.Input
                              wrapperClass="min-w-20 flex-1"
                              label={{ name: $T("constructor.props.min") }}
                              value={(progressBar?.minNum as number) ?? 0}
                              type="number"
                              onUpdate={(value) => updateContentProperty(columnIndex, index, "minNum", value as string)}
                            />
                            <UI.Input
                              wrapperClass="min-w-20 flex-1"
                              label={{ name: $T("constructor.props.max") }}
                              value={(progressBar?.maxNum as number) ?? 100}
                              type="number"
                              onUpdate={(value) => updateContentProperty(columnIndex, index, "maxNum", value as string)}
                            />
                            <UI.Input
                              wrapperClass="min-w-24 flex-1"
                              label={{ name: $T("constructor.props.units") }}
                              value={progressBar?.units}
                              onUpdate={(value) => updateContentProperty(columnIndex, index, "units", value as string)}
                            />
                          </div>
                        {:else if content.type == "image"}
                          {@const image = content.data}
                          <div class="flex flex-wrap items-end gap-2">
                            <div class="relative min-w-32">
                              <CommonSnippets
                                snippet="IconsLib"
                                initialValue={{
                                  name: $T("constructor.props.table.columns.defaultIcon"),
                                  icon: image?.defaultIcon ?? "",
                                  onUpdate: (icon: string) => {
                                    updateContentProperty(columnIndex, index, "defaultIcon", icon)
                                    if (!image?.width || image?.width === "0rem") updateContentProperty(columnIndex, index, "width", "1rem")
                                    if (!image?.width || image?.height === "0rem") updateContentProperty(columnIndex, index, "height", "1rem")
                                  },
                                  icons: { array: ICONS },
                                }}
                                {component}
                                {onPropertyChange}
                              />
                            </div>
                            <UI.Input
                              wrapperClass="min-w-32 flex-1"
                              label={{ name: $T("constructor.props.table.columns.class") }}
                              value={image?.class}
                              onUpdate={(value) => updateContentProperty(columnIndex, index, "class", value)}
                            />
                            <UI.Input
                              wrapperClass="min-w-20 flex-1"
                              label={{ name: $T("constructor.props.table.columns.image.width"), class: "px-0" }}
                              type="number"
                              number={{ minNum: 0, maxNum: 1000, step: 1 }}
                              value={Number(image?.width?.replace("rem", "") ?? 0)}
                              onUpdate={(value) => updateContentProperty(columnIndex, index, "width", `${value ?? 0}rem`)}
                            />
                            <UI.Input
                              wrapperClass="min-w-20 flex-1"
                              label={{ name: $T("constructor.props.table.columns.image.height"), class: "px-0" }}
                              type="number"
                              number={{ minNum: 0, maxNum: 1000, step: 1 }}
                              value={Number(image?.height?.replace("rem", "") ?? 0)}
                              onUpdate={(value) => updateContentProperty(columnIndex, index, "height", `${value ?? 0}rem`)}
                            />
                          </div>
                        {/if}
                      </div>
                      <UI.Button
                        wrapperClass="w-8 shrink-0"
                        content={{ icon: ButtonDelete }}
                        onClick={() => {
                          const headers = [...(component.properties.header || [])]
                          ;((headers as ITableHeader<Record<string, unknown>>[])[columnIndex].content as ITableContent<Record<string, unknown>>[]).splice(
                            index,
                            1,
                          )
                          edit.set("header", headers)
                        }}
                      />
                    </div>
                  {/each}
                {/if}
              </div>
              <div id={`item-${columnContent(column).length}-${columnIndex}`} class="min-h-2"></div>
            </div>
          {/each}
          <div id={`column-${component.properties.header?.length ?? 0}`} class="min-h-4"></div>
        </div>
      </PropsGroup>
    {/snippet}
  </PropsListModal>
{/snippet}

{#snippet TableStashData()}
  <UI.Switch
    label={{ name: $T("constructor.props.table.stashData") }}
    value={component.properties.dataBuffer?.stashData ? 1 : 0}
    onUpdate={(value) => edit.patch("dataBuffer", value === 1 ? { stashData: true } : { stashData: false, clearButton: false, logger: false })}
  />
{/snippet}

{#snippet TableClearButton()}
  <UI.Switch
    label={{
      name: $T("constructor.props.table.clearButton"),
    }}
    value={component.properties.dataBuffer?.clearButton ? 1 : 0}
    disabled={!component.properties.dataBuffer?.stashData}
    onUpdate={(value) => edit.patch("dataBuffer", { clearButton: value === 1 })}
  />
{/snippet}

{#snippet TableLogger()}
  <UI.Switch
    label={{ name: $T("constructor.props.table.logger"), captionLeft: $T("constructor.props.info.bottom"), captionRight: $T("constructor.props.info.top") }}
    value={component.properties.dataBuffer?.logger ? 1 : 0}
    disabled={!component.properties.dataBuffer?.stashData}
    onUpdate={(value) => edit.patch("dataBuffer", { logger: value === 1 })}
  />
{/snippet}

<div class="flex flex-col gap-2">
  <PropsGroup label={$T("constructor.props.group.general")}>
    <CommonSnippets snippet="Access" {component} {onPropertyChange} />
    <CommonSnippets snippet="Variable" {VARIABLE_OPTIONS} {component} {onPropertyChange} />
    {@render TableStashData()}
    {#if component.properties.dataBuffer?.stashData}
      <div class="flex items-end">
        {@render TableClearButton()}
        {@render TableLogger()}
      </div>
    {/if}
  </PropsGroup>
  <PropsGroup label={$T("constructor.props.group.appearance")}>
    <CommonSnippets snippet="Accent" {component} {onPropertyChange} />
    {@render TableOutline()}
    {#if component.properties.dataBuffer?.stashData}
      {@render TableBufferSize()}
    {/if}
  </PropsGroup>
  <PropsGroup label={$T("constructor.props.group.content")}>
    <CommonSnippets snippet="Label" {component} {onPropertyChange} />
    <CommonSnippets snippet="LabelAlign" {component} {onPropertyChange} />
    {#if component.properties.dataBuffer?.stashData}
      {@render TableVisibleRows()}
    {/if}
  </PropsGroup>
</div>
{@render TableColumnSettings()}
