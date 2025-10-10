<!-- $lib/ElementsUI/InputProps.svelte -->
<script lang="ts">
  import { getContext } from 'svelte'
  import { t } from '$lib/locales/i18n'
  import type { IInputProps, UIComponent, ISelectOption } from '../types'
  import * as UI from '$lib'
  import { optionsStore } from '../options'

  const { component, onPropertyChange } = $props<{
    component: UIComponent & { properties: Partial<IInputProps> }
    onPropertyChange: (value: string | object) => void
  }>()

  let isValidRegExp = $state(true)
  const DeviceVariables = getContext<string[]>('DeviceVariables')
  let VARIABLE_OPTIONS = $derived(
    DeviceVariables && Array.isArray(DeviceVariables)
      ? DeviceVariables.map((variable) => ({
          id: variable,
          value: variable,
          name: variable,
        }))
      : [],
  )

  const initialColor = $derived(
    $optionsStore.COLOR_OPTIONS.find((c) =>
      (c.value as string).includes(component.properties.componentClass?.split(' ').find((cls: string) => cls.startsWith('bg-'))),
    ),
  )

  const initialAlign = $derived(
    $optionsStore.ALIGN_OPTIONS.find((a) =>
      (a.value as string).includes(component.properties.label?.class?.split(' ').find((cls: string) => cls.startsWith('text-'))),
    ),
  )

  /* Обновление свойства */
  const updateProperty = (path: string, value: string | object | boolean | number | RegExp) => {
    const newProperties = JSON.parse(JSON.stringify(component.properties))
    if (path === 'regExp') {
      try {
        let regex: RegExp
        if (typeof value === 'string') {
          const pattern = value.match(/^\/(.*)\/([gimsuy]*)$/)

          regex = pattern ? new RegExp(pattern[1], pattern[2]) : new RegExp(value)
          if (pattern === null) return
          regex.test('')
        } else {
          throw new Error('Invalid RegExp type')
        }

        newProperties.regExp = regex
        isValidRegExp = true
      } catch (error) {
        console.warn('Invalid RegExp:', error)
        newProperties.regExp = typeof value === 'string' ? value : String(value)
        isValidRegExp = false
        return
      }
    }

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

  const handleOptionColorChange = (color: string) => {
    let componentClass = component.properties.componentClass || ''

    componentClass = componentClass
      .split(' ')
      .filter((cls: string) => !cls.startsWith('bg-'))
      .join(' ')

    if (color) {
      componentClass += ` ${color}`
    }

    updateProperty('componentClass', componentClass)
  }
</script>

{#if component && component.properties}
  <div class="relative flex flex-row items-start justify-center">
    <!-- Сообщение для отправки в ws по нажатию кнопки -->
    <div class="flex w-1/3 flex-col items-center px-2">
      <UI.Select
        label={{ name: $t('constructor.props.variable') }}
        options={VARIABLE_OPTIONS}
        value={VARIABLE_OPTIONS.find((opt) => opt.value === component.properties.id)}
        onUpdate={(selectedOption) => {
          if (selectedOption && selectedOption.name) {
            updateProperty('id', selectedOption.value as string)
            updateProperty('eventHandler.Variables', selectedOption.value as string)
          }
        }}
      />
      <UI.Select
        label={{ name: $t('constructor.props.type') }}
        options={$optionsStore.INPUT_TYPE_OPTIONS}
        type="buttons"
        value={$optionsStore.INPUT_TYPE_OPTIONS.find((opt) => opt.value === (component.properties.type || 'text'))}
        onUpdate={(selectedOption) => updateProperty('type', selectedOption.value as string)}
      />
      {#if component.properties.type === 'text' || component.properties.type === 'password' || component.properties.type === 'text-area'}
        <UI.Input
          label={{ name: $t('constructor.props.maxlenght') }}
          value={component.properties.maxlength}
          onUpdate={(value) => updateProperty('maxlength', value as string)}
        />
        <UI.Input
          label={{ name: $t('constructor.props.regexp') }}
          value={component.properties.help.regExp}
          maxlength={150}
          help={{ info: $t('constructor.props.regexp.info') }}
          componentClass={isValidRegExp === false ? '!border-2 !border-red-400' : ''}
          onUpdate={(value) => updateProperty('help.regExp', value)}
        />
      {:else if component.properties.type === 'number' && !component.properties.readonly && !component.properties.disabled}
        <UI.Input
          label={{ name: $t('constructor.props.minnum') }}
          value={component.properties.number.minNum as number}
          type="number"
          onUpdate={(value) => {
            // if ((value as number) >= component.properties.number.maxNum) {
            //   value = component.properties.number.maxNum - component.properties.number.step
            // }
            updateProperty('number.minNum', Number(value))
          }}
        />
        <UI.Input
          label={{ name: $t('constructor.props.maxnum') }}
          value={component.properties.number.maxNum as number}
          type="number"
          onUpdate={(value) => {
            // if ((value as number) <= component.properties.number.minNum) {
            //   value = component.properties.number.minNum + component.properties.number.step
            // }
            updateProperty('number.maxNum', Number(value))
          }}
        />
        <UI.Input
          label={{ name: $t('constructor.props.step') }}
          value={component.properties.number.step as number}
          type="number"
          onUpdate={(value) => updateProperty('number.step', Number(value))}
        />
      {/if}
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <UI.Input
        label={{ name: $t('constructor.props.placeholder') }}
        value={component.properties.placeholder as string}
        onUpdate={(value) => updateProperty('placeholder', value)}
      />
      <UI.Input
        label={{ name: $t('constructor.props.info') }}
        value={component.properties.help.info as string}
        onUpdate={(value) => updateProperty('help.info', value)}
      />
      <UI.Switch
        label={{ name: $t('constructor.props.readonly') }}
        value={component.properties.readonly ? 2 : 1}
        onChange={(value) => updateProperty('readonly', value === 2)}
      />
      <UI.Switch
        label={{ name: $t('constructor.props.copy') }}
        value={component.properties.help.copyButton ? 2 : 1}
        onChange={(value) => updateProperty('help.copyButton', value === 2)}
      />
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <UI.Input
        label={{ name: $t('constructor.props.label') }}
        value={component.properties.label.name}
        onUpdate={(value) => updateProperty('label.name', value as string)}
      />
      <UI.Select
        label={{ name: $t('constructor.props.align') }}
        type="buttons"
        value={initialAlign}
        options={$optionsStore.ALIGN_OPTIONS}
        onUpdate={(option) => updateProperty('label.class', `${component.properties.label.class} ${option.value}`)}
      />
      <UI.Select
        wrapperClass="h-14"
        label={{ name: $t('constructor.props.colors') }}
        type="buttons"
        options={$optionsStore.COLOR_OPTIONS}
        value={initialColor}
        onUpdate={(option) => handleOptionColorChange(option.value as string)}
      />
    </div>
  </div>
{/if}
