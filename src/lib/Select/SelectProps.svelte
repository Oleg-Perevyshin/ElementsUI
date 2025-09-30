<!-- $lib/ElementsUI/SelectProps.svelte -->
<script lang="ts">
  import { getContext } from 'svelte'
  import { t } from '../locales/i18n'
  import type { UIComponent, ISelectProps, ISelectOption } from '../types.js'
  import * as UI from '../index'
  import ButtonDelete from '../appIcons/ButtonDelete.svelte'
  import ButtonAdd from '../appIcons/ButtonAdd.svelte'

  import { optionsStore } from '../options.js'

  const { component, onPropertyChange } = $props<{
    component: UIComponent & { properties: Partial<ISelectProps> }
    onPropertyChange: (path: string, value: string | object) => void
  }>()

  const DeviceVariables = getContext<{ value: string; name: string }[]>('DeviceVariables')
  let VARIABLE_OPTIONS = $derived(
    DeviceVariables.map((variable: { value: string; name: string }) => ({
      id: variable.name,
      value: variable.value,
      name: `${variable.value} | ${variable.name}`,
    })),
  )

  type ValueTypeOption = {
    id: string
    value: 'text' | 'number'
    name: string
    class: string
  }
  let currentValueType = $derived(
    !component.properties.options[0]
      ? ($optionsStore.SELECT_VALUE_TYPE_OPTIONS[0] as ValueTypeOption)
      : typeof component.properties.options[0].value === 'number'
        ? $optionsStore.SELECT_VALUE_TYPE_OPTIONS[1]
        : ($optionsStore.SELECT_VALUE_TYPE_OPTIONS[0] as ValueTypeOption),
  )

  let Header: ISelectOption = $derived(
    $optionsStore.HEADER_OPTIONS.find((h) => h.value === component.properties.eventHandler.Header) ?? { id: '', name: '', value: '', class: '!w-1/4' },
  )

  let currentType = $derived($optionsStore.SELECT_TYPE_OPTIONS.find((t) => t.value === component.properties.type))

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

  const handleOptionColorChange = (color: string) => {
    let wrapperClass = component.properties.wrapperClass || ''
    wrapperClass = wrapperClass
      .split(' ')
      .filter((cls: string) => !cls.startsWith('bg-'))
      .join(' ')
    if (color) {
      wrapperClass += ` ${color}`
    }
    updateProperty('wrapperClass', wrapperClass)
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
</script>

{#if component && component.properties}
  <div class="relative mb-4 flex flex-row items-start justify-center">
    <div class="flex w-1/3 flex-col items-center px-2">
      <UI.Select
        wrapperClass="w-full"
        label={{ name: $t('service.constructor.props.argument') }}
        type="buttons"
        value={$optionsStore.FULL_ARGUMENT_OPTION.find((h) => h.value === component.properties.eventHandler.Argument)}
        options={$optionsStore.FULL_ARGUMENT_OPTION}
        onUpdate={(option) => {
          updateProperty('eventHandler.Argument', option.value as string)
        }}
      />
      {#if component.properties.eventHandler.Argument !== 'Save' && component.properties.eventHandler.Argument !== 'NoSave'}
        <UI.Input
          wrapperClass="w-full {Header.value === 'SET' ? 'mt-1' : ''} "
          label={{ name: $t('service.constructor.props.argument') }}
          value={component.properties.eventHandler.Argument}
          type="text"
          autocomplete="on"
          componentClass="w-full"
          maxlength={32}
          regExp={/^[a-zA-Z0-9\-_]{0,32}$/}
          help={{ info: $t('service.constructor.props.argument.info') }}
          onUpdate={(value) => updateProperty('eventHandler.Argument', value as string)}
        />
      {/if}
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
      <UI.Select
        label={{ name: $t('service.constructor.props.type') }}
        type="buttons"
        value={currentType}
        options={$optionsStore.SELECT_TYPE_OPTIONS}
        onUpdate={(item) => updateProperty('type', item.value as string)}
      />
    </div>
    <div class="flex w-1/3 flex-col items-center px-2">
      <UI.Select
        wrapperClass="w-full h-14"
        label={{ name: $t('service.constructor.props.valuetype') }}
        type="buttons"
        options={$optionsStore.SELECT_VALUE_TYPE_OPTIONS}
        value={currentValueType}
        onUpdate={(value) => {
          currentValueType = value as ValueTypeOption
          const options = [...(component.properties?.options || [])]
          const newType = value.value
          options.forEach((option) => {
            if (newType === 'number') option.value = option.value !== undefined ? Number(option.value) : 0
            else option.value = option.value !== undefined ? String(option.value) : ''
          })
          updateProperty('options', options)
        }}
      />
      <UI.Select
        wrapperClass="w-full h-14"
        label={{ name: $t('service.constructor.props.colors') }}
        type="buttons"
        options={$optionsStore.COLOR_OPTIONS}
        value={initialColor}
        onUpdate={(option) => handleOptionColorChange(option.value as string)}
      />
    </div>
    <div class="flex w-1/3 flex-col items-center px-2">
      <UI.Input
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

  <!-- Настройки опций -->
  <div class="space-y-4">
    <div class="m-0 flex items-center justify-center gap-2">
      <h4>{$t('service.constructor.props.options.title')}</h4>
      <UI.Button
        wrapperClass="!w-10"
        icon={{ component: ButtonAdd, properties: { height: '1.5rem', width: '1.5rem' } }}
        componentClass="h-10 border-none hover:shadow-none"
        onClick={() => {
          const newOption: ISelectOption = {
            id: crypto.randomUUID(),
            name: 'New Button',
            class: '',
          }
          const options = [...(component.properties?.options || []), newOption]
          updateProperty('options', options)
        }}
      />
    </div>

    {#each component.properties.options || [] as option, index (option.id)}
      <div class="m-0 flex items-end justify-around gap-2 border-gray-400">
        <UI.Input
          label={{ name: $t('service.constructor.props.optionname') }}
          wrapperClass="!w-3/10"
          value={option.name}
          type="text"
          onUpdate={(value) => {
            const options = [...(component.properties?.options || [])]
            options[index]['name'] = value
            updateProperty('options', options)
          }}
        />
        <UI.Input
          label={{ name: $t('service.constructor.props.optionvalue') }}
          wrapperClass="!w-3/10"
          value={option.value}
          type={currentValueType.value}
          onUpdate={(value) => {
            const options = [...(component.properties?.options || [])]
            options[index]['value'] = value
            updateProperty('options', options)
          }}
        />
        <UI.Input
          label={{ name: $t('service.constructor.props.optionclass') }}
          wrapperClass="!w-3/10"
          value={option.class}
          type="text"
          onUpdate={(value) => {
            const options = [...(component.properties?.options || [])]
            options[index]['class'] = value
            updateProperty('options', options)
          }}
        />
        <UI.Button
          wrapperClass="!w-1/10"
          icon={{ component: ButtonDelete, properties: { height: '1.5rem', width: '1.5rem' } }}
          componentClass="h-10 w-10 border-none hover:shadow-none"
          onClick={() => {
            const options = [...(component.properties?.options || [])]
            options.splice(index, 1)
            updateProperty('options', options)
          }}
        />
      </div>
    {/each}
  </div>
{/if}
