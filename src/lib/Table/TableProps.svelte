<!-- $lib/ElementsUI/TableProps.svelte -->
<script lang="ts">
  import { getContext } from 'svelte'
  import { t } from '$lib/locales/i18n'
  import { type UIComponent, type ITableProps, type ITableHeader, updateProperty } from '../types'
  import * as UI from '$lib'
  import ButtonDelete from '$lib/libIcons/ButtonDelete.svelte'
  import ButtonAdd from '$lib/libIcons/ButtonAdd.svelte'
  import { optionsStore } from '../options'
  import { twMerge } from 'tailwind-merge'

  const { component, onPropertyChange } = $props<{
    component: UIComponent & { properties: Partial<ITableProps<object>> }
    onPropertyChange: (value: string | object, name?: string) => void
  }>()

  const DeviceVariables = getContext<{ id: string; value: string; name: string }[]>('DeviceVariables')
  let VARIABLE_OPTIONS = $derived(DeviceVariables && Array.isArray(DeviceVariables) ? DeviceVariables : [])

  const initialColor = $derived(
    $optionsStore.COLOR_OPTIONS.find((c) =>
      (c.value as string).includes(component.properties.wrapperClass?.split(' ').find((cls: string) => cls.startsWith('bg-'))),
    ),
  )

  const initialAlign = $derived(
    $optionsStore.ALIGN_OPTIONS.find((a) =>
      (a.value as string).includes(component.properties.label?.class?.split(' ').find((cls: string) => cls.startsWith('text-'))),
    ),
  )

  const updateTableHeader = (index: number, field: string, value: any) => {
    const headers = [...component.properties.header]
    headers[index] = { ...headers[index], [field]: value }
    updateProperty('header', headers, component, onPropertyChange)
  }

  const updateTableBody = () => {
    const newBody = component.properties.body.map((row: object) => {
      const newRow: Partial<object> = {}
      component.properties.header.forEach((col: ITableHeader<any>) => {
        const key = col.key as keyof object
        newRow[key] = row[key] ?? `Value of ${key}`
      })
      return newRow
    })
    updateProperty('body', newBody, component, onPropertyChange)
  }

  const updateButtonProperty = (columnIndex: number, buttonIndex: number, field: string, value: any) => {
    const headers = [...component.properties.header]
    const buttons = [...headers[columnIndex].buttons]
    buttons[buttonIndex] = { ...buttons[buttonIndex], [field]: value }
    headers[columnIndex].buttons = buttons
    updateProperty('header', headers, component, onPropertyChange)
  }

  const removeButtonFromColumn = (columnIndex: number, buttonIndex: number) => {
    const headers = [...component.properties.header]
    const buttons = [...headers[columnIndex].buttons]
    buttons.splice(buttonIndex, 1)
    headers[columnIndex].buttons = buttons.length ? buttons : undefined
    updateProperty('header', headers, component, onPropertyChange)
  }
</script>

{#if component && component.properties}
  <div class="relative flex flex-row items-start justify-center">
    <UI.Select
      label={{ name: $t('constructor.props.variable') }}
      options={VARIABLE_OPTIONS}
      value={VARIABLE_OPTIONS.find((opt) => opt.value === component.properties.id)}
      onUpdate={(value) => {
        updateProperty('id', value.value as string, component, onPropertyChange, value.name?.split('|')[1].trim())
        updateProperty('eventHandler.Variables', value.value as string, component, onPropertyChange)
      }}
    />
    <div class="flex w-1/3 flex-col px-2">
      <UI.Select
        wrapperClass="!h-14"
        label={{ name: $t('constructor.props.colors') }}
        type="buttons"
        options={$optionsStore.COLOR_OPTIONS}
        value={initialColor}
        onUpdate={(option) => updateProperty('wrapperClass', twMerge(component.properties.wrapperClass, option.value), component, onPropertyChange)}
      />
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <UI.Input
        label={{ name: $t('constructor.props.label') }}
        value={component.properties.label.name}
        onUpdate={(value) => updateProperty('label.name', value as string, component, onPropertyChange)}
      />
      <UI.Select
        label={{ name: $t('constructor.props.align') }}
        type="buttons"
        value={initialAlign}
        options={$optionsStore.ALIGN_OPTIONS}
        onUpdate={(option) => updateProperty('label.class', twMerge(component.properties.label.class, option.value), component, onPropertyChange)}
      />
    </div>
  </div>

  <hr class="border-[var(--border-color)]" />

  <!-- Настройки столбцов таблицы -->
  <div>
    <div class=" flex items-center justify-center gap-2">
      <h4>{$t('constructor.props.table.columns')}</h4>
      <UI.Button
        wrapperClass="w-8"
        content={{ icon: ButtonAdd }}
        onClick={() => {
          const newColumn: ITableHeader<any> = {
            key: `column${(component.properties.header?.length || 0) + 1}`,
            label: { name: `Column ${(component.properties.header?.length || 0) + 1}`, class: '' },
            width: '10%',
            sortable: false,
          }
          const headers = [...(component.properties.header || []), newColumn]
          updateProperty('header', headers, component, onPropertyChange)
          updateTableBody()
        }}
      />
    </div>

    {#each component.properties.header as column, columnIndex (columnIndex)}
      <div class="mr-2 flex items-end justify-around gap-6">
        <UI.Input
          label={{ name: $t('constructor.props.table.columns.key') }}
          value={column.key}
          help={{ regExp: /^[0-9a-zA-Z_-]{0,16}$/ }}
          onUpdate={(value) => {
            updateTableHeader(columnIndex, 'key', value)
            updateTableBody()
          }}
        />
        <UI.Input
          label={{ name: $t('constructor.props.table.columns.label') }}
          value={column.label.name}
          onUpdate={(value) => {
            updateTableHeader(columnIndex, 'label', { ['name']: value })
          }}
        />
        <UI.Input
          label={{ name: $t('constructor.props.table.columns.width') }}
          type="number"
          value={Number(column.width.replace('%', ''))}
          onUpdate={(value) => updateTableHeader(columnIndex, 'width', `${value}%`)}
        />
        <UI.Switch
          wrapperClass="w-2/10"
          label={{ name: $t('constructor.props.table.columns.sortable') }}
          value={column.sortable ? 2 : 1}
          onChange={(value) => updateTableHeader(columnIndex, 'sortable', value === 2)}
        />
        <UI.Button
          wrapperClass="w-8"
          content={{ icon: ButtonAdd, info: $t('constructor.props.table.addaction') }}
          onClick={() => {
            const newButton = {
              name: `button${(component.properties.header[columnIndex].buttons ? component.properties.header[columnIndex].buttons.length : 0) + 1}`,
              class: 'bg-blue',
              eventHandler: { Header: 'SET', Argument: 'Save', Variables: [] },
              onClick: () => {},
            }
            const buttons = [...(component.properties.header[columnIndex].buttons || []), newButton]
            updateTableHeader(columnIndex, 'buttons', buttons)
          }}
        />
        <UI.Button
          wrapperClass="w-8"
          content={{ icon: ButtonDelete }}
          onClick={() => {
            const headers = [...(component.properties.header || [])]
            headers.splice(columnIndex, 1)
            updateProperty('header', headers, component, onPropertyChange)
          }}
        />
      </div>
      {#if column.buttons && column.buttons.length > 0}
        <div class="mb-5 rounded-lg p-1">
          {#each column.buttons as button, buttonIndex (buttonIndex)}
            <div class="mx-14 flex items-end justify-around gap-2">
              <UI.Input
                label={{ name: $t('constructor.props.name') }}
                wrapperClass="!w-3/10"
                value={button.name}
                onUpdate={(value) => updateButtonProperty(columnIndex, buttonIndex, 'name', value)}
              />
              <UI.Select
                wrapperClass="!w-2/10"
                label={{ name: $t('constructor.props.header') }}
                type="buttons"
                value={$optionsStore.HEADER_OPTIONS.find((h) => h.value === button.eventHandler?.Header)}
                options={$optionsStore.HEADER_OPTIONS}
                onUpdate={(option) => {
                  const handler = button.eventHandler
                  handler.Header = option.value as string
                  updateButtonProperty(columnIndex, buttonIndex, 'eventHandler', handler)
                }}
              />
              <UI.Input
                wrapperClass="!w-2/10"
                label={{ name: $t('constructor.props.argument') }}
                value={button.eventHandler?.Argument}
                onUpdate={(value) => {
                  const handler = button.eventHandler
                  handler.Argument = value as string
                  updateButtonProperty(columnIndex, buttonIndex, 'eventHandler', handler)
                }}
              />
              <UI.Input
                wrapperClass="!w-2/10"
                label={{ name: $t('constructor.props.table.keys') }}
                value={button.eventHandler?.Variables.join(' ')}
                maxlength={500}
                help={{ info: $t('constructor.props.table.keys.info'), regExp: /^[a-zA-Z0-9\-_ ]{0,500}$/ }}
                onUpdate={(value) => {
                  const handler = { ...button.eventHandler }
                  handler.Variables = (value as string).trim().split(/\s+/)
                  updateButtonProperty(columnIndex, buttonIndex, 'eventHandler', handler)
                }}
              />
              <UI.Button wrapperClass="w-8" content={{ icon: ButtonDelete }} onClick={() => removeButtonFromColumn(columnIndex, buttonIndex)} />
            </div>
          {/each}
        </div>
      {/if}
    {/each}
  </div>
{/if}
