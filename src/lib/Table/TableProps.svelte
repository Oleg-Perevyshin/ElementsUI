<script lang="ts">
  import { getContext } from 'svelte'
  import { t } from '$lib/locales/i18n'
  import { type UIComponent, type ITableProps, type ITableHeader, updateProperty, type IUIComponentHandler } from '../types'
  import * as UI from '$lib'
  import ButtonDelete from '$lib/libIcons/ButtonDelete.svelte'
  import ButtonAdd from '$lib/libIcons/ButtonAdd.svelte'
  import { optionsStore } from '../options'
  import { twMerge } from 'tailwind-merge'
  import Modal from '$lib/Modal.svelte'
  import { ICONS } from '$lib/icons'
  import CrossIcon from '$lib/libIcons/CrossIcon.svelte'

  const {
    component,
    onPropertyChange,
    forConstructor = true,
  } = $props<{
    component: UIComponent & { properties: Partial<ITableProps<object>> }
    onPropertyChange: (updates: Partial<{ properties?: string | object; name?: string; access?: string; eventHandler?: IUIComponentHandler }>) => void
    forConstructor?: boolean
  }>()

  const DeviceVariables = getContext<{ id: string; value: string; name: string }[]>('DeviceVariables')
  let VARIABLE_OPTIONS = $derived(DeviceVariables && Array.isArray(DeviceVariables) ? DeviceVariables : [])

  let defaultIcon = $derived({ isModalOpen: false, columnIndex: 0, column: component.properties.header ? component.properties.header[0] : '' })

  const initialColor = $derived(
    $optionsStore.COLOR_OPTIONS.find((c) =>
      (c.value as string).includes(component.properties.wrapperClass?.split(' ').find((cls: string) => cls.startsWith('bg-'))),
    ),
  )

  const initialAlign = $derived(
    $optionsStore.TEXT_ALIGN_OPTIONS.find((a) =>
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
    if (field === 'eventHandler') {
    } else {
      const headers = [...component.properties.header]
      const buttons = [...headers[columnIndex].buttons]
      buttons[buttonIndex] = { ...buttons[buttonIndex], [field]: value }
      headers[columnIndex].buttons = buttons
      updateProperty('header', headers, component, onPropertyChange)
    }
  }

  const removeButtonFromColumn = (columnIndex: number, buttonIndex: number) => {
    const headers = [...component.properties.header]
    const buttons = [...headers[columnIndex].buttons]
    buttons.splice(buttonIndex, 1)
    headers[columnIndex].buttons = buttons.length ? buttons : undefined
    updateProperty('header', headers, component, onPropertyChange)
  }
</script>

{#if forConstructor}
  <div class="relative flex flex-row items-start justify-center pb-4">
    <div class="flex w-1/3 flex-col px-2">
      <UI.Select
        label={{ name: $t('constructor.props.variable') }}
        options={VARIABLE_OPTIONS}
        value={VARIABLE_OPTIONS.find((opt) => opt.value === component.properties.id)}
        onUpdate={(value) => {
          updateProperty('id', value.value as string, component, onPropertyChange)
          onPropertyChange({ name: value.name?.split('—')[1].trim(), eventHandler: { Variables: value.value as string } })
        }}
      />
      <UI.Select
        label={{ name: $t('constructor.props.access') }}
        type="buttons"
        options={$optionsStore.ACCESS_OPTION}
        value={$optionsStore.ACCESS_OPTION.find((o) => o.value === component.access)}
        onUpdate={(option) => onPropertyChange({ access: option.value })}
      />
      <UI.Select
        label={{ name: $t('constructor.props.table.type') }}
        type="buttons"
        options={$optionsStore.TABLE_TYPE_OPTIONS}
        value={$optionsStore.TABLE_TYPE_OPTIONS.find((o) => o.value === component.properties.type)}
        onUpdate={(option) => {
          updateProperty('type', option.value as string, component, onPropertyChange)
          if (option.value === 'logger') updateProperty('stashData', true, component, onPropertyChange)
        }}
      />
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <UI.Select
        wrapperClass="!h-14"
        label={{ name: $t('constructor.props.colors') }}
        type="buttons"
        options={$optionsStore.COLOR_OPTIONS}
        value={initialColor}
        onUpdate={(option) => updateProperty('wrapperClass', twMerge(component.properties.wrapperClass, option.value), component, onPropertyChange)}
      />
      <UI.Switch
        label={{ name: $t('constructor.props.outline') }}
        value={component.properties.outline}
        options={[{ id: crypto.randomUUID(), value: 0, class: '' }]}
        onChange={(value) => updateProperty('outline', value, component, onPropertyChange)}
      />
      <UI.Switch
        label={{ name: $t('constructor.props.table.stashData') }}
        value={component.properties.stashData}
        options={[{ id: crypto.randomUUID(), value: 0, class: '', disabled: component.properties.type === 'logger' }]}
        onChange={(value) => {
          updateProperty('stashData', value, component, onPropertyChange)
        }}
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
        options={$optionsStore.TEXT_ALIGN_OPTIONS}
        onUpdate={(option) => updateProperty('label.class', twMerge(component.properties.label.class, option.value), component, onPropertyChange)}
      />
      <UI.Input
        label={{ name: $t('constructor.props.table.buffersize') }}
        type="number"
        value={component.properties.rowsAmmount}
        onUpdate={(value) => updateProperty('rowsAmmount', value as string, component, onPropertyChange)}
      />
    </div>
  </div>

  <hr class="border-(--border-color)" />

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
          headers.forEach((h) => {
            updateTableHeader(headers.indexOf(h), 'width', `${(100 / headers.length).toFixed(2)}%`)
          })
          updateTableBody()
        }}
      />
    </div>

    {#each component.properties.header as column, columnIndex (columnIndex)}
      <div class="mr-2 grid grid-cols-[minmax(5rem,10rem)_1fr_minmax(5rem,10rem)_minmax(10rem,21rem)_6rem_6rem_2rem_2rem] items-end gap-6">
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
        <UI.Select
          label={{ name: $t('constructor.props.align.content') }}
          type="buttons"
          value={$optionsStore.ALIGN_OPTIONS.find((a) => (a.value as string).includes(column.align))}
          options={$optionsStore.ALIGN_OPTIONS}
          onUpdate={(option) => updateTableHeader(columnIndex, 'align', option.value)}
        />
        <UI.Switch
          label={{ name: $t('constructor.props.table.columns.sortable'), class: 'px-0' }}
          options={[{ id: crypto.randomUUID(), value: 0, class: '' }]}
          value={column.sortable}
          onChange={(value) => updateTableHeader(columnIndex, 'sortable', value)}
        />
        <UI.Switch
          label={{ name: $t('constructor.props.copy'), class: 'px-0' }}
          options={[{ id: crypto.randomUUID(), value: 0, class: '' }]}
          value={column.overflow?.copy}
          onChange={(value) => updateTableHeader(columnIndex, 'overflow', { copy: value })}
        />
        <UI.Button
          wrapperClass="w-8"
          content={{ icon: ButtonAdd, info: { text: $t('constructor.props.table.addaction'), side: 'top' } }}
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
            headers.forEach((h) => {
              updateTableHeader(headers.indexOf(h), 'width', `${(100 / headers.length).toFixed(2)}%`)
            })
          }}
        />
      </div>
      {#if column.buttons && column.buttons.length > 0}
        <div class="mb-5 rounded-lg py-1">
          {#each column.buttons as button, buttonIndex (buttonIndex)}
            <div class="ml-14 flex items-end justify-around gap-2">
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
              <UI.Button
                wrapperClass="w-8"
                content={{ icon: ButtonDelete }}
                onClick={() => {
                  removeButtonFromColumn(columnIndex, buttonIndex)
                }}
              />
            </div>
          {/each}
        </div>
      {/if}
    {/each}
  </div>
{:else}
  <div class="relative flex flex-row items-start justify-center pb-4">
    <div class="flex w-1/3 flex-col px-2">
      <UI.Input
        label={{ name: $t('constructor.props.id') }}
        value={component.properties.id}
        onUpdate={(value) => updateProperty('id', value as string, component, onPropertyChange)}
      />

      <UI.Input
        label={{ name: $t('constructor.props.wrapperclass') }}
        value={component.properties.wrapperClass}
        onUpdate={(value) => updateProperty('wrapperClass', value as string, component, onPropertyChange)}
      />
      <UI.Select
        wrapperClass=" h-14"
        label={{ name: $t('constructor.props.colors') }}
        type="buttons"
        options={$optionsStore.COLOR_OPTIONS}
        value={initialColor}
        onUpdate={(option) => {
          updateProperty('wrapperClass', twMerge(component.properties.wrapperClass, option.value), component, onPropertyChange)
          const options = [...(component.properties?.options || [])]
          options.forEach((o) => {
            o['class'] = option.value
          })
          updateProperty('options', options, component, onPropertyChange)
        }}
      />
      <UI.Switch
        label={{ name: $t('constructor.props.outline') }}
        value={component.properties.outline}
        options={[{ id: crypto.randomUUID(), value: 0, class: '' }]}
        onChange={(value) => updateProperty('outline', value, component, onPropertyChange)}
      />
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <UI.Select
        label={{ name: $t('constructor.props.access') }}
        type="buttons"
        options={$optionsStore.ACCESS_OPTION}
        value={$optionsStore.ACCESS_OPTION.find((o) => o.value === component.access)}
        onUpdate={(option) => onPropertyChange({ access: option.value })}
      />
      <UI.Input
        label={{ name: $t('constructor.props.label') }}
        value={component.properties.label.name}
        onUpdate={(value) => updateProperty('label.name', value as string, component, onPropertyChange)}
      />
      <UI.Input
        label={{ name: $t('constructor.props.label.class') }}
        value={component.properties.label.class}
        onUpdate={(value) => updateProperty('label.class', value as string, component, onPropertyChange)}
      />
      <UI.Input
        label={{ name: $t('constructor.props.footer') }}
        value={component.properties.footer}
        onUpdate={(value) => updateProperty('footer', value as string, component, onPropertyChange)}
      />
    </div>

    <div class="flex w-1/3 flex-col px-2">
      <UI.Select
        label={{ name: $t('constructor.props.table.type') }}
        type="buttons"
        options={$optionsStore.TABLE_TYPE_OPTIONS}
        value={$optionsStore.TABLE_TYPE_OPTIONS.find((o) => o.value === component.properties.type)}
        onUpdate={(option) => {
          updateProperty('type', option.value as string, component, onPropertyChange)
          if (option.value === 'logger') updateProperty('stashData', true, component, onPropertyChange)
        }}
      />
      <UI.Switch
        label={{ name: $t('constructor.props.table.stashData') }}
        value={component.properties.stashData}
        options={[{ id: crypto.randomUUID(), value: 0, class: '', disabled: component.properties.type === 'logger' }]}
        onChange={(value) => {
          updateProperty('stashData', value, component, onPropertyChange)
        }}
      />
      <UI.Input
        label={{ name: $t('constructor.props.table.buffersize') }}
        type="number"
        value={component.properties.rowsAmmount}
        onUpdate={(value) => updateProperty('rowsAmmount', value as string, component, onPropertyChange)}
      />
    </div>
  </div>

  <hr class="border-(--border-color)" />

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
            image: { width: '0rem', height: '0rem' },
          }
          const headers = [...(component.properties.header || []), newColumn]
          updateProperty('header', headers, component, onPropertyChange)
          headers.forEach((h) => {
            updateTableHeader(headers.indexOf(h), 'width', `${(100 / headers.length).toFixed(2)}%`)
          })
          updateTableBody()
        }}
      />
    </div>
    <div class="flex flex-col gap-2">
      {#each component.properties.header as column, columnIndex (columnIndex)}
        <div class="rounded-2xl border border-(--border-color) p-2">
          <div class="mb-5">
            <div class="mr-2 grid grid-cols-[minmax(5rem,10rem)_1fr_minmax(5rem,10rem)_minmax(10rem,21rem)_6rem_6rem_2rem_2rem] items-end gap-6">
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
                label={{ name: $t('constructor.props.table.columns.width'), class: 'px-0' }}
                type="number"
                value={Number(column.width.replace('%', ''))}
                onUpdate={(value) => updateTableHeader(columnIndex, 'width', `${value}%`)}
              />
              <UI.Select
                label={{ name: $t('constructor.props.align.content') }}
                type="buttons"
                value={$optionsStore.ALIGN_OPTIONS.find((a) => (a.value as string).includes(column.align))}
                options={$optionsStore.ALIGN_OPTIONS}
                onUpdate={(option) => updateTableHeader(columnIndex, 'align', option.value)}
              />
              <UI.Switch
                label={{ name: $t('constructor.props.table.columns.sortable'), class: 'px-0' }}
                options={[{ id: crypto.randomUUID(), value: 0, class: '' }]}
                value={column.sortable}
                onChange={(value) => updateTableHeader(columnIndex, 'sortable', value)}
              />
              <UI.Switch
                label={{ name: $t('constructor.props.copy'), class: 'px-0' }}
                options={[{ id: crypto.randomUUID(), value: 0, class: '' }]}
                value={column.overflow?.copy}
                onChange={(value) => updateTableHeader(columnIndex, 'overflow', { copy: value, truncated: column.overflow?.truncated })}
              />
              <UI.Button
                wrapperClass="w-8"
                content={{ icon: ButtonAdd, info: { text: $t('constructor.props.table.addaction'), side: 'top' } }}
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
                  headers.forEach((h) => {
                    updateTableHeader(headers.indexOf(h), 'width', `${(100 / headers.length).toFixed(2)}%`)
                  })
                }}
              />
            </div>
            <div class="mr-2 grid grid-cols-[5rem_minmax(8rem,16rem)_1fr_minmax(8rem,12rem)_minmax(8rem,12rem)] items-end justify-between gap-6">
              <UI.Switch
                label={{ name: $t('constructor.props.table.columns.truncated'), class: 'px-0' }}
                options={[{ id: crypto.randomUUID(), value: 0, class: '' }]}
                value={column.overflow?.truncated}
                onChange={(value) => updateTableHeader(columnIndex, 'overflow', { truncated: value, copy: column.overflow?.copy })}
              />
              <div class="relative mt-6 flex items-center w-full gap-2">
                <UI.Button
                  content={{ name: $t('constructor.props.table.columns.defaultIcon') }}
                  onClick={() => (defaultIcon = { isModalOpen: true, columnIndex: columnIndex, column: column })}
                />
                {#if column.image?.defaultIcon}
                  <UI.Button
                    wrapperClass="w-8.5 "
                    componentClass="p-0.5 bg-red"
                    content={{ icon: CrossIcon }}
                    onClick={() => {
                      updateTableHeader(columnIndex, 'image', {
                        class: column.image?.class,
                        width: column.image?.width,
                        height: column.image?.height,
                        defaultIcon: '',
                      })
                    }}
                  />
                {/if}
              </div>
              <UI.Input
                label={{ name: $t('constructor.props.table.columns.class') }}
                value={column.image?.class}
                onUpdate={(value) => {
                  updateTableHeader(columnIndex, 'image', {
                    class: value,
                    width: column.image?.width,
                    height: column.image?.height,
                    defaultIcon: column.image.defaultIcon,
                  })
                }}
              />
              <UI.Input
                label={{ name: $t('constructor.props.table.columns.image.width'), class: 'px-0' }}
                type="number"
                number={{ minNum: 0, maxNum: 1000, step: 1 }}
                value={Number(column.image?.width.replace('rem', '')) ?? 0}
                onUpdate={(value) => {
                  updateTableHeader(columnIndex, 'image', {
                    class: column.image?.class,
                    width: `${value ?? 0}rem`,
                    height: column.image?.height,
                    defaultIcon: column.image.defaultIcon,
                  })
                }}
              />
              <UI.Input
                label={{ name: $t('constructor.props.table.columns.image.height'), class: 'px-0' }}
                type="number"
                number={{ minNum: 0, maxNum: 1000, step: 1 }}
                value={Number(column.image?.height.replace('rem', ''))}
                onUpdate={(value) => {
                  updateTableHeader(columnIndex, 'image', {
                    class: column.image?.class,
                    width: column.image?.width,
                    height: `${value}rem`,
                    defaultIcon: column.image.defaultIcon,
                  })
                }}
              />
            </div>
          </div>

          {#if column.buttons && column.buttons.length > 0}
            <hr class="border-(--border-color)" />
            <div class="mb-5 rounded-lg p-1">
              {#each column.buttons as button, buttonIndex (buttonIndex)}
                <div class="ml-14 flex items-end justify-between gap-2">
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
        </div>
      {/each}
      {#if defaultIcon.isModalOpen}
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
                          updateTableHeader(defaultIcon.columnIndex, 'image', {
                            class: defaultIcon.column.image?.class,
                            width: defaultIcon.column.image?.width,
                            height: defaultIcon.column.image?.height,
                            defaultIcon: icon as string,
                          })
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
  </div>
{/if}
