<!-- $lib/ElementsUI/TableProps.svelte -->
<script lang="ts">
  import { getContext } from 'svelte'
  import { t } from '../locales/i18n'
  import type { UIComponent, ITableProps, ITableHeader } from '../types'
  import * as UI from '../index'
  import ButtonDelete from '../appIcons/ButtonDelete.svelte'
  import ButtonAdd from '../appIcons/ButtonAdd.svelte'
  import { optionsStore } from '../options'

  const { component, onPropertyChange } = $props<{
    component: UIComponent & { properties: Partial<ITableProps<object>> }
    onPropertyChange: (value: string | object) => void
  }>()

  const DeviceVariables = getContext<{ value: string; name: string }[]>('DeviceVariables')
  let VARIABLE_OPTIONS = $derived(
    DeviceVariables.map((variable: { value: string; name: string }) => ({
      id: variable.name,
      value: variable.value,
      name: `${variable.value} | ${variable.name}`,
    })),
  )

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

  /* Добавление цветов через селект */
  const handleOptionColorChange = (color: string) => {
    let componentClass = component.properties.componentClass || ''
    componentClass = componentClass
      .split(' ')
      .filter((cls: string) => !cls.startsWith('bg-'))
      .join(' ')
    if (color) {
      componentClass += ` ${color}`
    }
    updateProperty('wrapperClass', componentClass)
  }

  const handleLabelAlign = (align: string) => {
    let labelClass = component.properties.label.class || ''
    labelClass = labelClass
      .split(' ')
      .filter((cls: string) => !cls.startsWith('text-'))
      .join(' ')
    if (align) {
      labelClass += ` ${align}`
    }
    updateProperty('label.class', labelClass)
  }

  /* Обновление свойства */
  const updateProperty = (path: string, value: string | object) => {
    const newProperties = JSON.parse(JSON.stringify(component.properties))
    const parts = path.split('.')
    let obj = newProperties

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]
      if (!obj[part]) obj[part] = {}
      obj = obj[part]
    }

    obj[parts[parts.length - 1]] = value
    onPropertyChange(newProperties)
  }

  const updateTableHeader = (index: number, field: keyof ITableHeader<any>, value: any) => {
    const headers = [...component.properties.tableHeader]
    headers[index] = { ...headers[index], [field]: value }
    updateProperty('tableHeader', headers)
  }

  const updateButtonProperty = (columnIndex: number, buttonIndex: number, field: string, value: any) => {
    const headers = [...component.properties.tableHeader]
    const buttons = [...headers[columnIndex].buttons]
    buttons[buttonIndex] = { ...buttons[buttonIndex], [field]: value }
    headers[columnIndex].buttons = buttons
    updateProperty('tableHeader', headers)
  }

  const removeButtonFromColumn = (columnIndex: number, buttonIndex: number) => {
    const headers = [...component.properties.tableHeader]
    const buttons = [...headers[columnIndex].buttons]
    buttons.splice(buttonIndex, 1)
    headers[columnIndex].buttons = buttons.length ? buttons : undefined
    updateProperty('tableHeader', headers)
  }
</script>

{#if component && component.properties}
  <div class="relative flex flex-row items-start justify-center">
    <div class="flex w-1/3 flex-col items-center px-2">
      <UI.Select
        label={{ name: $t('service.constructor.props.variable') }}
        options={VARIABLE_OPTIONS}
        value={VARIABLE_OPTIONS.find((opt) => opt.value === component.properties.id.value)}
        onUpdate={(value) => {
          updateProperty('id.name', (value.name as string).split('|')[1].trim())
          updateProperty('id.value', value.value as string)
          updateProperty('eventHandler.Variables', value.value as string)
        }}
      />
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <UI.Select
        wrapperClass="!h-14"
        label={{ name: $t('service.constructor.props.colors') }}
        type="buttons"
        options={$optionsStore.COLOR_OPTIONS}
        value={initialColor}
        onUpdate={(option) => handleOptionColorChange(option.value as string)}
      />
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <UI.Input
        wrapperClass="w-full"
        label={{ name: $t('service.constructor.props.label') }}
        value={component.properties.label.name}
        type="text"
        componentClass="w-full"
        onUpdate={(value) => updateProperty('label.name', value as string)}
      />
      <UI.Select
        wrapperClass="w-full"
        label={{ name: $t('service.constructor.props.align') }}
        type="buttons"
        value={initialAlign}
        options={$optionsStore.ALIGN_OPTIONS}
        onUpdate={(option) => handleLabelAlign(option.value as string)}
      />
    </div>
  </div>

  <hr class="border-gray-400" />

  <!-- Настройки столбцов таблицы -->
  <div class="space-y-4">
    <div class="m-0 flex items-center justify-center gap-2">
      <h4>{$t('service.constructor.props.table.columns')}</h4>
      <UI.Button
        wrapperClass="!w-10"
        icon={{ component: ButtonAdd, properties: { height: '1.5rem', width: '1.5rem' } }}
        componentClass="h-10 border-none hover:shadow-none"
        onClick={() => {
          const newColumn: ITableHeader<any> = {
            key: `column${(component.properties.tableHeader?.length || 0) + 1}`,
            label: `Column ${(component.properties.tableHeader?.length || 0) + 1}`,
            width: '100px',
            sortable: false,
          }
          const headers = [...(component.properties.tableHeader || []), newColumn]
          updateProperty('tableHeader', headers)
        }}
      />
    </div>

    {#each component.properties.tableHeader as column, columnIndex}
      <div class="m-0 flex items-end justify-around gap-2">
        <UI.Input
          label={{ name: $t('service.constructor.props.table.columns.key') }}
          wrapperClass="!w-2/10"
          value={column.key}
          type="text"
          regExp={/^[0-9a-zA-Z_-]{0,16}$/}
          onUpdate={(value) => updateTableHeader(columnIndex, 'key', value)}
        />
        <UI.Input
          label={{ name: $t('service.constructor.props.table.columns.label') }}
          wrapperClass="!w-2/10"
          value={column.label}
          type="text"
          onUpdate={(value) => updateTableHeader(columnIndex, 'label', value)}
        />
        <UI.Input
          label={{ name: $t('service.constructor.props.table.columns.width') }}
          wrapperClass="!w-2/10"
          value={column.width}
          type="text"
          onUpdate={(value) => updateTableHeader(columnIndex, 'width', value)}
        />
        <UI.Switch
          wrapperClass="!w-1/10"
          label={{ name: $t('service.constructor.props.table.columns.sortable') }}
          value={column.sortable ? 2 : 1}
          onChange={(value) => updateTableHeader(columnIndex, 'sortable', value === 2)}
        />
        <UI.Button
          wrapperClass="!w-1/20"
          icon={{ component: ButtonAdd, properties: { height: '1.5rem', width: '1.5rem' } }}
          componentClass="h-10 w-10 border-none hover:shadow-none"
          info={$t('service.constructor.props.table.addaction')}
          onClick={() => {
            const newButton = {
              name: `button${(component.properties.tableHeader[columnIndex].buttons || 0) + 1}`,
              class: 'bg-blue',
              eventHandler: { Header: 'SET', Argument: 'Save', Variables: [] },
              onClick: () => {},
            }
            const buttons = [...(component.properties.tableHeader[columnIndex].buttons || []), newButton]
            updateTableHeader(columnIndex, 'buttons', buttons)
          }}
        />
        <UI.Button
          wrapperClass="!w-1/20"
          icon={{ component: ButtonDelete, properties: { height: '1.5rem', width: '1.5rem' } }}
          componentClass="h-10 w-10 border-none hover:shadow-none"
          info={$t('service.constructor.props.table.deletecolumn')}
          onClick={() => {
            const headers = [...(component.properties.tableHeader || [])]
            headers.splice(columnIndex, 1)
            updateProperty('tableHeader', headers)
          }}
        />
      </div>
      {#if column.buttons && column.buttons.length > 0}
        <div class="m-2 rounded-lg bg-[var(--field-color)] p-2">
          {#each column.buttons as button, buttonIndex}
            <div class="flex items-end justify-around gap-2">
              <UI.Input
                label={{ name: $t('service.constructor.props.name') }}
                wrapperClass="!w-2/10"
                value={button.name}
                type="text"
                onUpdate={(value) => updateButtonProperty(columnIndex, buttonIndex, 'name', value)}
              />
              <UI.Select
                wrapperClass="!w-3/10"
                label={{ name: $t('service.constructor.props.header') }}
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
                label={{ name: $t('service.constructor.props.argument') }}
                value={button.eventHandler?.Argument}
                type="text"
                onUpdate={(value) => {
                  const handler = button.eventHandler
                  handler.Argument = value as string
                  updateButtonProperty(columnIndex, buttonIndex, 'eventHandler', handler)
                }}
              />
              <UI.Input
                wrapperClass="!w-2/10"
                label={{ name: $t('service.constructor.props.table.keys') }}
                value={button.eventHandler?.Variables.join(' ')}
                type="text"
                maxlength={500}
                regExp={/^[a-zA-Z0-9\-_ ]{0,500}$/}
                help={{ info: $t('service.constructor.props.table.keys.info') }}
                onUpdate={(value) => {
                  const handler = { ...button.eventHandler }
                  handler.Variables = (value as string).trim().split(/\s+/)
                  updateButtonProperty(columnIndex, buttonIndex, 'eventHandler', handler)
                }}
              />
              <UI.Button
                wrapperClass="!w-1/20"
                icon={{ component: ButtonDelete, properties: { height: '1.5rem', width: '1.5rem' } }}
                componentClass="h-10 w-10 border-none hover:shadow-none"
                onClick={() => removeButtonFromColumn(columnIndex, buttonIndex)}
              />
            </div>
          {/each}
        </div>
      {/if}
    {/each}
  </div>
{/if}
