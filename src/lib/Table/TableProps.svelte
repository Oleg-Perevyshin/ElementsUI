<script lang="ts">
  import { getContext } from "svelte"
  import { t } from "$lib/locales/i18n"
  import { type UIComponent, type ITableProps, type ITableHeader, updateProperty, type IUIComponentHandler } from "../types"
  import * as UI from "$lib"
  import ButtonDelete from "$lib/libIcons/ButtonDelete.svelte"
  import ButtonAdd from "$lib/libIcons/ButtonAdd.svelte"
  import { optionsStore } from "../options"
  import Modal from "$lib/Modal.svelte"
  import { ICONS } from "$lib/icons"
  import CrossIcon from "$lib/libIcons/CrossIcon.svelte"
  import CommonSnippets from "$lib/CommonSnippets.svelte"

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

  let defaultIcon: { isModalOpen: boolean; columnIndex: number; column: ITableHeader<any> } | null = $state(null)
  let buttonIcon = $state({ buttonIndex: 0, isModalOpen: false, columnIndex: 0 })

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

  const changeColumnSettings = (settings: UI.ISelectOption<string> | UI.ISelectOption<string>[], columnIndex: number) => {
    const currentActiveValues = $optionsStore.TABLE_COLUMN_SETTING_OPTIONS.filter((opt) => {
      if (!opt?.value) return false
      const currentValue = opt.value.split(".").reduce((o, key) => o?.[key], component.properties.header[columnIndex])
      return currentValue === true
    }).map((opt) => opt.value)
    if (Array.isArray(settings)) {
      settings.forEach((opt) => {
        if (opt?.value) {
          const keys = opt.value.split(".")
          let target = component.properties.header[columnIndex]

          for (let i = 0; i < keys.length - 1; i++) {
            if (target[keys[i]] == null) {
              target[keys[i]] = {}
            }
            target = target[keys[i]]
          }

          const lastKey = keys[keys.length - 1]
          target[lastKey] = true
        }
      })

      currentActiveValues.forEach((activeValue) => {
        if (!settings.some((opt) => opt?.value === activeValue)) {
          const keys = activeValue.split(".")
          let target = component.properties.header[columnIndex]

          for (let i = 0; i < keys.length - 1; i++) {
            if (target[keys[i]]) {
              target = target[keys[i]]
            } else {
              return
            }
          }

          const lastKey = keys[keys.length - 1]
          target[lastKey] = false
        }
      })
    }
  }
  const updateTableHeader = (index: number, field: string, value: any) => {
    const headers = [...component.properties.header]
    headers[index] = { ...headers[index], [field]: value }
    updateProperty("header", headers, component, onPropertyChange)
  }

  const updateTableBody = () => {
    let newBody = component.properties.body.map((row: object) => {
      const newRow: Partial<object> = {}
      component.properties.header.forEach((col: ITableHeader<any>) => {
        const key = col.key as keyof object
        newRow[key] = row[key] ?? `Value of ${key}`
      })
      return newRow
    })

    updateProperty("body", newBody, component, onPropertyChange)
  }

  const updateButtonProperty = (columnIndex: number, buttonIndex: number, field: string, value: any) => {
    const headers = [...component.properties.header]
    const buttons = [...headers[columnIndex].buttons]

    buttons[buttonIndex] = { ...buttons[buttonIndex], [field]: value }
    headers[columnIndex].buttons = buttons
    updateProperty("header", headers, component, onPropertyChange)
  }

  const updateSelectProperty = (columnIndex: number, field: string, value: any) => {
    const headers = [...component.properties.header]
    let select = headers[columnIndex].select

    select = { ...select, [field]: value }
    headers[columnIndex].select = select
    updateProperty("header", headers, component, onPropertyChange)
  }

  const removeButtonFromColumn = (columnIndex: number, buttonIndex: number) => {
    const headers = [...component.properties.header]
    const buttons = [...headers[columnIndex].buttons]

    buttons.splice(buttonIndex, 1)
    headers[columnIndex].buttons = buttons.length ? buttons : undefined
    updateProperty("header", headers, component, onPropertyChange)
  }

  const addNewButton = (columnIndex: number) => {
    const newButton = {
      name: `button${(component.properties.header[columnIndex].buttons ? component.properties.header[columnIndex].buttons.length : 0) + 1}`,
      class: "bg-blue",
      eventHandler: { Header: "SET", Argument: "Save", Variables: [] },
      onClick: () => {},
    }
    const buttons = [...(component.properties.header[columnIndex].buttons || []), newButton]

    updateTableHeader(columnIndex, "buttons", buttons)
  }
</script>

{#snippet TableType()}
  <UI.Select
    label={{ name: $t("constructor.props.table.type") }}
    type="buttons"
    options={$optionsStore.TABLE_TYPE_OPTIONS}
    value={$optionsStore.TABLE_TYPE_OPTIONS.find((o) => o.value === component.properties.type)}
    onUpdate={(option) => {
      if ((option as UI.ISelectOption).value === "logger") {
        updateProperty("dataBuffer.stashData", true, component, onPropertyChange)
        updateProperty("dataBuffer.clearButton", true, component, onPropertyChange)
      } else {
        updateProperty("dataBuffer.stashData", false, component, onPropertyChange)
        updateProperty("dataBuffer.clearButton", false, component, onPropertyChange)
        const headers = [
          {
            key: "id",
            label: { name: "ID" },
            width: "40%",
            sortable: true,
            image: {
              width: "0rem",
              height: "0rem",
            },
            align: "left",
          } as ITableHeader<any>,
          {
            key: "device",
            label: { name: "Device" },
            width: "60%",
            sortable: false,
            image: {
              width: "0rem",
              height: "0rem",
            },
            align: "left",
            text: {
              truncated: true,
            },
          } as ITableHeader<any>,
        ]
        updateProperty("header", headers, component, onPropertyChange)
      }
      updateProperty("type", (option as UI.ISelectOption).value as string, component, onPropertyChange)
    }}
  />
{/snippet}

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
    options={$optionsStore.BUFFER_SIFE_OPTIONS}
    value={$optionsStore.BUFFER_SIFE_OPTIONS.find((o) => o.value === component.properties.dataBuffer.rowsAmmount)}
    onUpdate={(value) => updateProperty("dataBuffer.rowsAmmount", (value as UI.ISelectOption<number>).value as number, component, onPropertyChange)}
  />
{/snippet}

{#snippet ButtonAddSnippet()}
  <UI.Button
    wrapperClass="w-8"
    content={{ icon: ButtonAdd }}
    onClick={() => {
      const newColumn: ITableHeader<any> = {
        key: `column${(component.properties.header?.length || 0) + 1}`,
        label: { name: `Column ${(component.properties.header?.length || 0) + 1}`, class: "" },
        width: "10%",
        sortable: false,
        type: "text",
      }
      const headers = [...(component.properties.header || []), newColumn]
      updateProperty("header", headers, component, onPropertyChange)
      headers.forEach((h) => {
        updateTableHeader(headers.indexOf(h), "width", `${(100 / headers.length).toFixed(2)}%`)
      })
      updateTableBody()
    }}
  />
{/snippet}

{#snippet TableColumnSettings(forConstructor: boolean)}
  {#if component.properties.type === "table"}
    <hr class="border-(--border-color)" />

    <!-- Настройки столбцов таблицы -->
    <div>
      <div class=" flex items-center justify-center gap-2">
        <h4>{$t("constructor.props.table.columns")}</h4>
        {@render ButtonAddSnippet()}
      </div>

      {#each component.properties.header as column, columnIndex (columnIndex)}
        <div class="pb-3 {columnIndex !== component.properties.header.length - 1 ? 'border-b border-(--border-color)/50 ' : ''}">
          <div class="p-2 pr-0 grid grid-cols-[minmax(5rem,10rem)_1fr_minmax(5rem,10rem)_minmax(10rem,21rem)_minmax(13rem,25rem)_2rem] items-end gap-2">
            <UI.Input
              label={{ name: $t("constructor.props.table.columns.key") }}
              value={column.key}
              help={{ regExp: /^[0-9a-zA-Z_-]{0,16}$/ }}
              onUpdate={(value) => {
                updateTableHeader(columnIndex, "key", value)
                updateTableBody()
              }}
            />
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
              value={Number(column.width.replace("%", ""))}
              onUpdate={(value) => updateTableHeader(columnIndex, "width", `${value}%`)}
            />
            <UI.Select
              label={{ name: $t("constructor.props.align.content") }}
              type="buttons"
              value={$optionsStore.ALIGN_OPTIONS.find((a) => (a.value as string).includes(column.align ?? "left"))}
              options={$optionsStore.ALIGN_OPTIONS}
              onUpdate={(option) => updateTableHeader(columnIndex, "align", (option as UI.ISelectOption).value)}
            />
            <UI.Select
              label={{ name: $t("constructor.props.table.content.type") }}
              type="buttons"
              options={forConstructor ? $optionsStore.TABLE_CONTENT_TYPE_OPTIONS.slice(0, 3) : $optionsStore.TABLE_CONTENT_TYPE_OPTIONS}
              value={$optionsStore.TABLE_CONTENT_TYPE_OPTIONS.find((h) => h.value === column.type) || $optionsStore.TABLE_CONTENT_TYPE_OPTIONS[0]}
              onUpdate={(value) => {
                column.type = (value as UI.ISelectOption).value
                if ((value as UI.ISelectOption).value == "buttons" && (!column.buttons || column.buttons.length == 0)) addNewButton(columnIndex)
              }}
            />
            <UI.Button
              wrapperClass="w-8"
              content={{ icon: ButtonDelete }}
              onClick={() => {
                const headers = [...(component.properties.header || [])]
                headers.splice(columnIndex, 1)
                updateProperty("header", headers, component, onPropertyChange)
                headers.forEach((h) => {
                  updateTableHeader(headers.indexOf(h), "width", `${(100 / headers.length).toFixed(2)}%`)
                })
              }}
            />
          </div>

          {#if column.type == "buttons"}
            <div class="flex gap-2 items-end">
              <div class="pl-2 w-12">
                <UI.Button
                  wrapperClass="w-8 {column.type == 'select' ? 'invisible' : ''}"
                  content={{ icon: ButtonAdd, info: { text: $t("constructor.props.table.addbutton"), side: "top" } }}
                  onClick={() => {
                    addNewButton(columnIndex)
                  }}
                />
              </div>
              <div class="w-full">
                {#each column.buttons as button, buttonIndex (buttonIndex)}
                  <div class="flex items-end justify-between gap-2">
                    <UI.Input
                      label={{ name: $t("constructor.props.name") }}
                      wrapperClass="w-3/10"
                      value={button.name}
                      onUpdate={(value) => updateButtonProperty(columnIndex, buttonIndex, "name", value)}
                    />

                    <div class="relative mt-6 flex w-2/10 gap-2">
                      <UI.Button
                        content={{ name: $t("constructor.props.table.type.icon") }}
                        onClick={() => (buttonIcon = { buttonIndex, isModalOpen: true, columnIndex })}
                      />
                      {#if buttonIcon.isModalOpen}
                        <Modal bind:isOpen={buttonIcon.isModalOpen} wrapperClass="w-130">
                          {#snippet main()}
                            <div class="grid grid-cols-3">
                              {#each ICONS as category}
                                <div class="relative m-1.5 rounded-xl border-2 border-(--border-color) p-3">
                                  <div class="absolute -top-3.5 bg-(--back-color) px-1">{$t(`constructor.props.icon.${category[0]}`)}</div>
                                  <div class="grid grid-cols-3 place-items-center gap-2">
                                    {#each category[1] as icon}
                                      <button
                                        class="h-8 w-8 cursor-pointer [&_svg]:h-full [&_svg]:max-h-full [&_svg]:w-full [&_svg]:max-w-full"
                                        onclick={() => {
                                          updateButtonProperty(buttonIcon.columnIndex, buttonIcon.buttonIndex, "icon", icon)
                                        }}
                                      >
                                        {@html icon}
                                      </button>{/each}
                                  </div>
                                </div>
                              {/each}
                            </div>
                          {/snippet}
                        </Modal>
                      {/if}
                      {#if column.buttons[buttonIndex].icon}
                        <UI.Button
                          wrapperClass="w-8.5 "
                          componentClass="p-0.5 bg-red"
                          content={{ icon: CrossIcon }}
                          onClick={() => {
                            updateButtonProperty(buttonIcon.columnIndex, buttonIcon.buttonIndex, "icon", "")
                          }}
                        />
                      {/if}
                    </div>

                    <UI.Select
                      wrapperClass="w-2/10"
                      label={{ name: $t("constructor.props.header") }}
                      type="buttons"
                      value={$optionsStore.HEADER_OPTIONS.find((h) => h.value === button.eventHandler?.Header)}
                      options={$optionsStore.HEADER_OPTIONS}
                      onUpdate={(option) => {
                        const handler = button.eventHandler
                        handler.Header = (option as UI.ISelectOption).value as string
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
                      help={{ info: $t("constructor.props.table.keys.info"), regExp: /^[a-zA-Z0-9\-_ ]{0,500}$/ }}
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
            </div>
          {:else if column.type == "select"}
            <div class="ml-14">
              <UI.Input
                label={{ name: $t("constructor.props.table.select.keys") }}
                value={column.select?.key ?? ""}
                maxlength={500}
                help={{ info: $t("constructor.props.table.select.keys.info"), regExp: /^[a-zA-Z0-9\-_ ]{0,500}$/ }}
                onUpdate={(value) => {
                  updateSelectProperty(columnIndex, "key", value as string)
                }}
              />
            </div>
          {:else if column.type == "image"}
            <div class="ml-14 flex items-end gap-2">
              <UI.Button
                content={{ name: $t("constructor.props.table.columns.defaultIcon") }}
                onClick={() => {
                  defaultIcon = { isModalOpen: true, columnIndex: columnIndex, column: column }
                }}
              />
              {#if column.image?.defaultIcon}
                <UI.Button
                  wrapperClass="w-8.5 "
                  componentClass="p-0.5 bg-red"
                  content={{ icon: CrossIcon }}
                  onClick={() => {
                    updateTableHeader(columnIndex, "image", {
                      class: column.image?.class,
                      width: column.image?.width,
                      height: column.image?.height,
                      defaultIcon: "",
                    })
                  }}
                />
              {/if}

              <UI.Input
                label={{ name: $t("constructor.props.table.columns.class") }}
                value={column.image?.class}
                onUpdate={(value) => {
                  updateTableHeader(columnIndex, "image", {
                    class: value,
                    width: column.image?.width,
                    height: column.image?.height,
                    defaultIcon: column.image.defaultIcon,
                  })
                }}
              />
              <UI.Input
                wrapperClass="w-4/10"
                label={{ name: $t("constructor.props.table.columns.image.width"), class: "px-0" }}
                type="number"
                number={{ minNum: 0, maxNum: 1000, step: 1 }}
                value={Number(column.image?.width.replace("rem", "")) ?? 0}
                onUpdate={(value) => {
                  updateTableHeader(columnIndex, "image", {
                    class: column.image?.class,
                    width: `${value ?? 0}rem`,
                    height: column.image?.height,
                    defaultIcon: column.image.defaultIcon,
                  })
                }}
              />
              <UI.Input
                wrapperClass="w-4/10"
                label={{ name: $t("constructor.props.table.columns.image.height"), class: "px-0" }}
                type="number"
                number={{ minNum: 0, maxNum: 1000, step: 1 }}
                value={Number(column.image?.height.replace("rem", "")) ?? 0}
                onUpdate={(value) => {
                  updateTableHeader(columnIndex, "image", {
                    class: column.image?.class,
                    width: column.image?.width,
                    height: `${value}rem`,
                    defaultIcon: column.image.defaultIcon,
                  })
                }}
              />
            </div>
          {:else if column.type == "text"}
            <div class="ml-14">
              <UI.Select
                label={{ name: $t("constructor.props.tablecolumn.settings") }}
                type="buttons"
                multiSelect={true}
                value={$optionsStore.TABLE_COLUMN_SETTING_OPTIONS.filter((opt) => {
                  if (opt.value.split(".").reduce((o, key) => o?.[key], component.properties.header[columnIndex])) return opt
                })}
                options={$optionsStore.TABLE_COLUMN_SETTING_OPTIONS}
                onUpdate={(value) => {
                  changeColumnSettings(value, columnIndex)
                }}
              />
            </div>
          {/if}
        </div>
      {/each}

      {#if defaultIcon?.isModalOpen}
        <Modal bind:isOpen={defaultIcon.isModalOpen} wrapperClass="w-130">
          {#snippet main()}
            <div class="grid grid-cols-3">
              {#each ICONS as category}
                <div class="relative m-1.5 rounded-xl border-2 border-(--border-color) p-3">
                  <div class="absolute -top-3.5 bg-(--back-color) px-1">{$t(`constructor.props.icon.${category[0]}`)}</div>
                  <div class="grid grid-cols-3 place-items-center gap-2">
                    {#each category[1] as icon}
                      <button
                        class="h-8 w-8 cursor-pointer [&_svg]:h-full [&_svg]:max-h-full [&_svg]:w-full [&_svg]:max-w-full"
                        onclick={() => {
                          if (defaultIcon) {
                            updateTableHeader(defaultIcon.columnIndex, "image", {
                              class: defaultIcon.column.image?.class ?? "",
                              width: defaultIcon.column.image?.width === "0rem" ? "1rem" : defaultIcon.column.image?.width,
                              height: defaultIcon.column.image?.height === "0rem" ? "1rem" : defaultIcon.column.image?.height,
                              defaultIcon: icon,
                            })
                          }
                        }}
                      >
                        {@html icon}
                      </button>{/each}
                  </div>
                </div>
              {/each}
            </div>
          {/snippet}
        </Modal>
      {/if}
    </div>
  {/if}
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
    options={[{ id: crypto.randomUUID(), value: 0, class: "", disabled: component.properties.type === "logger" }]}
    onChange={(value) => {
      updateProperty("dataBuffer.stashData", value, component, onPropertyChange)
    }}
  />
{/snippet}

{#snippet TableClearButton()}
  <UI.Switch
    label={{ name: $t("constructor.props.table.clearButton") }}
    value={component.properties.dataBuffer.clearButton}
    options={[{ id: crypto.randomUUID(), value: 0, class: "" }]}
    onChange={(value) => {
      updateProperty("dataBuffer.clearButton", value, component, onPropertyChange)
    }}
  />
{/snippet}

{#if forConstructor}
  <div class="relative flex flex-row items-start justify-center pb-4">
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Variable" {VARIABLE_OPTIONS} {component} {onPropertyChange} />
      <CommonSnippets snippet="Access" {component} {onPropertyChange} />
      {@render TableType()}
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Colors" initialValue={initialColor} {component} {onPropertyChange} />
      {@render TableOutline()}
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Label" {component} {onPropertyChange} />
      <CommonSnippets snippet="LabelAlign" initialValue={initialAlign} {component} {onPropertyChange} />
      {#if component.properties.dataBuffer.stashData}
        {@render TableBufferSize()}
      {/if}
    </div>
  </div>
  {@render TableColumnSettings(forConstructor)}
{:else}
  <div class="relative flex flex-row items-start justify-center pb-4">
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Identificator" {component} {onPropertyChange} />
      <CommonSnippets snippet="WrapperClass" {component} {onPropertyChange} />
      <CommonSnippets snippet="Colors" initialValue={initialColor} {component} {onPropertyChange} />
      {@render TableOutline()}
    </div>

    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Access" {component} {onPropertyChange} />
      <CommonSnippets snippet="Label" {component} {onPropertyChange} />
      <CommonSnippets snippet="LabelClass" {component} {onPropertyChange} />
    </div>

    <div class="flex w-1/3 flex-col px-2">
      {@render TableFooter()}
      {@render TableType()}

      <div class="flex">
        {@render TableStashData()}
        {#if component.properties.type === "logger"}
          {@render TableClearButton()}
        {/if}
      </div>

      {#if component.properties.dataBuffer.stashData}
        {@render TableBufferSize()}
      {/if}
    </div>
  </div>
  {@render TableColumnSettings(forConstructor)}
{/if}
