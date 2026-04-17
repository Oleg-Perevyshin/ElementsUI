<script lang="ts">
  import { getContext } from "svelte"
  import { t } from "$lib/locales/i18n"
  import { type UIComponent, type ITableProps, type ITableHeader, updateProperty, type IUIComponentHandler, type ITableContent } from "../types"
  import * as UI from "$lib"
  import ButtonDelete from "$lib/libIcons/ButtonDelete.svelte"
  import ButtonAdd from "$lib/libIcons/ButtonAdd.svelte"
  import { optionsStore } from "../options"
  import { ICONS } from "$lib/icons"
  import CommonSnippets from "$lib/CommonSnippets.svelte"
  import { slide } from "svelte/transition"
  import Dragging from "$lib/Dragging.svelte"

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

  let settingsContainer: HTMLDivElement[] = $state([])
  let columnContainer: HTMLDivElement | null = $state(null)
  const defaultColors = [
    "bg-[#fca5a559] dark:bg-[#991b1b59]",
    "bg-[#86efac59] dark:bg-[#15803d59]",
    "bg-[#93c5fd59] dark:bg-[#1d4ed859]",
    "bg-[#fdba7459] dark:bg-[#c2410c59]",
    "bg-[#67e8f959] dark:bg-[#0e749059]",
    "bg-[#d8b4fe59] dark:bg-[#7e22ce59]",
  ]

  const changeColumnSettings = (settings: UI.IOption<string> | UI.IOption<string>[], columnIndex: number, index: number) => {
    const currentActiveValues = $optionsStore.TABLE_TEXT_SETTING_OPTIONS.filter(
      (opt) => component.properties.header[columnIndex].content[index].data[opt.value] === true,
    ).map((opt) => opt.value)

    if (Array.isArray(settings)) {
      settings.forEach((opt) => {
        if (opt?.value) component.properties.header[columnIndex].content[index].data[opt.value] = true
      })

      currentActiveValues.forEach((activeValue) => {
        if (!settings.some((opt) => opt?.value === activeValue)) component.properties.header[columnIndex].content[index].data[activeValue] = false
      })
    }
  }

  const addContent = (option: UI.IOption, event: MouseEvent, columnIndex: number) => {
    event.stopPropagation()
    let header = component.properties.header
    header[columnIndex].content.push({
      type: option.value,
      data:
        option.value === "button"
          ? {
              name: `button`,
              class: "bg-blue",
              eventHandler: { Header: "SET", Argument: "Save", Variables: [] },
              onClick: () => {},
            }
          : {},
    })

    updateProperty("header", header, component, onPropertyChange)
    isDropdownOpen = -1
  }

  const updateTableHeader = (index: number, field: string, value: any) => {
    const headers = [...component.properties.header]
    headers[index] = { ...headers[index], [field]: value }
    updateProperty("header", headers, component, onPropertyChange)
  }

  const updateContentProperty = (columnIndex: number, index: number, field: string, value: any) => {
    const headers = [...component.properties.header]
    headers[columnIndex].content[index].data = { ...headers[columnIndex].content[index].data, [field]: value }
    updateProperty("header", headers, component, onPropertyChange)
  }
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
  <div class="flex flex-col gap-2" bind:this={columnContainer}>
    <div class="flex items-center justify-center gap-2">
      <h4>{$t("constructor.props.table.columns")}</h4>
      <UI.Button
        wrapperClass="w-8"
        componentClass="bg-transparent"
        content={{ icon: ButtonAdd }}
        onClick={() => {
          const newColumn: ITableHeader<any> = {
            label: { name: `Column ${(component.properties.header?.length || 0) + 1}`, class: "" },
            width: "10%",
            content: [{ type: "text", data: { key: "" } }],
          }
          const headers = [...(component.properties.header || []), newColumn]
          updateProperty("header", headers, component, onPropertyChange)
          // updateTableBody()
        }}
      />
    </div>

    {#each component.properties.header as column, columnIndex (columnIndex)}
      <div
        id="column-{columnIndex}"
        class="relative flex flex-col p-2 border rounded-2xl border-(--border-color)/50 {defaultColors[columnIndex % defaultColors.length]}"
      >
        <Dragging
          wrapperClass="absolute top-10"
          container={columnContainer}
          array={component.properties.header}
          elementsId="column"
          elementIndex={columnIndex}
          onUpdate={(updatedArray) => {
            if (Array.isArray(updatedArray) && updatedArray.every((item) => typeof item === "object" && "content" in item)) {
              updateProperty("header", updatedArray, component, onPropertyChange)
            }
          }}
        />
        <div class="py-2 pl-9 grid grid-cols-[1fr_minmax(5rem,10rem)_minmax(10rem,21rem)_2rem_2rem] items-end gap-2">
          <UI.Input
            label={{ name: $t("constructor.props.table.columns.label") }}
            value={column.label?.name}
            onUpdate={(value) => updateTableHeader(columnIndex, "label", { ["name"]: value })}
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
            onmouseleave={() => (isDropdownOpen = -1)}
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
          <UI.Button
            wrapperClass="w-8"
            componentClass="bg-transparent"
            content={{ icon: ButtonDelete }}
            onClick={() => {
              const headers = [...(component.properties.header || [])]
              headers.splice(columnIndex, 1)
              updateProperty("header", headers, component, onPropertyChange)
            }}
          />
        </div>
        <div class="flex flex-col gap-2" bind:this={settingsContainer[columnIndex]}>
          {#if typeof column.content !== "function"}
            {#each column.content as content, index}
              <div id={`item-${index}-${columnIndex}`} class="relative bg-(--container-color)/50 rounded-2xl p-2">
                {#if content.type == "text"}
                  {@const text = content.data}
                  <div class="flex gap-2 mx-auto items-end" style="width: {forConstructor ? '65%' : '90%'}; ">
                    <UI.Input
                      wrapperClass="w-1/4"
                      label={{ name: $t("constructor.props.table.text.key") }}
                      value={text.key}
                      help={{ regExp: /^[0-9a-zA-Z_.-]{0,16}$/ }}
                      onUpdate={(value) => {
                        updateTableHeader(
                          columnIndex,
                          "content",
                          column.content.map((textItem: any, i: number) => (i == index ? { ...textItem, data: { ...textItem.data, key: value } } : textItem)),
                        )
                      }}
                    />
                    <UI.Select
                      label={{ name: $t("constructor.props.tablecolumn.settings") }}
                      type="buttons"
                      multiSelect={true}
                      value={$optionsStore.TABLE_TEXT_SETTING_OPTIONS.slice(0, forConstructor ? 3 : 5).filter((opt) => {
                        if (column.content[index].data[opt.value]) return opt
                      })}
                      options={$optionsStore.TABLE_TEXT_SETTING_OPTIONS.slice(0, forConstructor ? 3 : 5)}
                      onUpdate={(value) => changeColumnSettings(value, columnIndex, index)}
                    />
                  </div>
                {:else if content.type == "select"}
                  {@const select = content.data}
                  <div class="flex w-1/3 mx-auto gap-2">
                    <UI.Input
                      wrapperClass="w-1/2"
                      label={{ name: $t("constructor.props.table.select.key") }}
                      value={select.key}
                      help={{ regExp: /^[0-9a-zA-Z_.-]{0,16}$/ }}
                      onUpdate={(value) => {
                        updateTableHeader(
                          columnIndex,
                          "content",
                          column.content.map((textItem: any, i: number) => (i == index ? { ...textItem, data: { ...textItem.data, key: value } } : textItem)),
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
                        headers[columnIndex].content[index].data = { ...headers[columnIndex].content[index].data, keyCol: value }
                        updateProperty("header", headers, component, onPropertyChange)
                      }}
                    />
                  </div>
                {:else if content.type == "button"}
                  {@const button = content.data}
                  <div class="flex w-[95%] mx-auto items-end justify-between gap-2">
                    <UI.Input
                      label={{ name: $t("constructor.props.name") }}
                      wrapperClass="w-2/10"
                      value={button.name}
                      onUpdate={(value) => updateContentProperty(columnIndex, index, "name", value)}
                    />

                    <UI.Select
                      wrapperClass="w-80 h-14.5"
                      label={{ name: $t("constructor.props.colors") }}
                      type="buttons"
                      options={$optionsStore.COLOR_OPTIONS.filter((option) => option.value !== "bg-max")}
                      value={$optionsStore.COLOR_OPTIONS.find((c) =>
                        (c.value as string).includes(
                          (button.class ?? component.properties.wrapperClass).split(" ").find((cls: string) => cls.startsWith("bg-")),
                        ),
                      )}
                      onUpdate={(value) => updateContentProperty(columnIndex, index, "class", (value as UI.IOption).value)}
                    />

                    <div class="relative mt-6 flex w-1/4 gap-2">
                      <CommonSnippets
                        snippet="IconsLib"
                        initialValue={{
                          name: $t("constructor.props.table.type.icon"),
                          icon: column.content[index].data.icon,
                          updateProperty: (icon: string) => updateContentProperty(columnIndex, index, "icon", icon),
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
                        updateContentProperty(columnIndex, index, "eventHandler", handler)
                      }}
                    />
                    <UI.Input
                      wrapperClass="w-2/10"
                      label={{ name: $t("constructor.props.argument") }}
                      value={button.eventHandler?.Argument}
                      onUpdate={(value) => {
                        const handler = button.eventHandler
                        handler.Argument = value as string
                        updateContentProperty(columnIndex, index, "eventHandler", handler)
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
                        updateContentProperty(columnIndex, index, "eventHandler", handler)
                      }}
                    />
                  </div>
                {:else if content.type == "progressBar"}
                  {@const progressBar = content.data}
                  <div class="w-3/5 flex mx-auto items-end gap-2">
                    <UI.Input
                      label={{ name: $t("constructor.props.table.progressBar.key") }}
                      value={progressBar.key}
                      help={{ regExp: /^[0-9a-zA-Z_.-]{0,16}$/ }}
                      onUpdate={(value) => {
                        updateTableHeader(
                          columnIndex,
                          "content",
                          column.content.map((textItem: any, i: number) => (i == index ? { ...textItem, data: { ...textItem.data, key: value } } : textItem)),
                        )
                        // updateTableBody()
                      }}
                    />
                    <UI.Input
                      wrapperClass="w-1/2"
                      label={{ name: $t("constructor.props.min") }}
                      value={(progressBar?.minNum as number) ?? 0}
                      type="number"
                      onUpdate={(value) => updateContentProperty(columnIndex, index, "minNum", value as string)}
                    />
                    <UI.Input
                      wrapperClass="w-1/2"
                      label={{ name: $t("constructor.props.max") }}
                      value={(progressBar?.maxNum as number) ?? 100}
                      type="number"
                      onUpdate={(value) => updateContentProperty(columnIndex, index, "maxNum", value as string)}
                    />
                    <UI.Input
                      label={{ name: $t("constructor.props.units") }}
                      value={progressBar?.units}
                      onUpdate={(value) => updateContentProperty(columnIndex, index, "units", value as string)}
                    />
                  </div>
                {:else if !forConstructor && content.type == "image"}
                  {@const image = content.data}
                  <div class="flex items-end gap-2 w-[80%] mx-auto">
                    <CommonSnippets
                      snippet="IconsLib"
                      initialValue={{
                        name: $t("constructor.props.table.columns.defaultIcon"),
                        icon: image?.defaultIcon ?? "",
                        updateProperty: (icon: string) => {
                          updateContentProperty(columnIndex, index, "defaultIcon", icon)
                          if (!image?.width || image?.width === "0rem") updateContentProperty(columnIndex, index, "width", "1rem")
                          if (!image?.width || image?.height === "0rem") updateContentProperty(columnIndex, index, "height", "1rem")
                        },
                        icons: { array: ICONS },
                      }}
                      {component}
                      {onPropertyChange}
                    />

                    <UI.Input
                      label={{ name: $t("constructor.props.table.columns.class") }}
                      value={image?.class}
                      onUpdate={(value) => updateContentProperty(columnIndex, index, "class", value)}
                    />
                    <UI.Input
                      wrapperClass="w-4/10"
                      label={{ name: $t("constructor.props.table.columns.image.width"), class: "px-0" }}
                      type="number"
                      number={{ minNum: 0, maxNum: 1000, step: 1 }}
                      value={Number(image?.width?.replace("rem", "") ?? 0)}
                      onUpdate={(value) => updateContentProperty(columnIndex, index, "width", `${value ?? 0}rem`)}
                    />
                    <UI.Input
                      wrapperClass="w-4/10"
                      label={{ name: $t("constructor.props.table.columns.image.height"), class: "px-0" }}
                      type="number"
                      number={{ minNum: 0, maxNum: 1000, step: 1 }}
                      value={Number(image?.height?.replace("rem", "") ?? 0)}
                      onUpdate={(value) => updateContentProperty(columnIndex, index, "height", `${value ?? 0}rem`)}
                    />
                  </div>
                {/if}
                <Dragging
                  wrapperClass="absolute left-2 bottom-2"
                  container={settingsContainer[columnIndex]}
                  array={column.content}
                  elementIndex={index}
                  containerIndex={columnIndex}
                  onUpdate={(updatedArray, index) => {
                    if (index === columnIndex) {
                      const headers = [...component.properties.header]
                      headers[columnIndex].content = updatedArray
                      updateProperty("header", headers, component, onPropertyChange)
                    }
                  }}
                />

                <UI.Button
                  wrapperClass="absolute right-2 bottom-2 w-8"
                  componentClass="bg-transparent"
                  content={{ icon: ButtonDelete }}
                  onClick={() => {
                    const headers = [...(component.properties.header || [])]
                    ;((headers as ITableHeader<object>[])[columnIndex].content as ITableContent<object>[]).splice(index, 1)
                    updateProperty("header", headers, component, onPropertyChange)
                  }}
                />
              </div>
            {/each}
          {/if}
        </div>
        <div id={`item-${column.content.length}-${columnIndex}`} class="min-h-2"></div>
      </div>
    {/each}
    <div id={`column-${component.properties.header.length}`} class="min-h-4"></div>
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
    onChange={(value) => updateProperty("dataBuffer.clearButton", value, component, onPropertyChange)}
  />
{/snippet}

{#snippet TableLogger()}
  <UI.Switch
    label={{ name: $t("constructor.props.table.logger"), captionLeft: $t("constructor.props.info.bottom"), captionRight: $t("constructor.props.info.top") }}
    value={component.properties.dataBuffer.logger}
    options={[{ id: crypto.randomUUID(), value: 0, class: "", disabled: !component.properties.dataBuffer.stashData }]}
    onChange={(value) => updateProperty("dataBuffer.logger", value, component, onPropertyChange)}
  />
{/snippet}

{#if forConstructor}
  <div class="relative flex flex-row items-start justify-center pb-4">
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Access" {component} {onPropertyChange} />
      <CommonSnippets snippet="Variable" {VARIABLE_OPTIONS} {component} {onPropertyChange} />
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
