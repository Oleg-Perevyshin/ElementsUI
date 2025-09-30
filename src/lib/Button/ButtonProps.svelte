<!-- $lib/ElementsUI/ButtonProps.svelte -->
<script lang="ts">
  import { t } from '../locales/i18n'
  import type { UIComponent, IButtonProps, ISelectOption } from '../types'
  import * as UI from '../index'
  import { optionsStore } from '../options'

  const { component, onPropertyChange } = $props<{
    component: UIComponent & { properties: Partial<IButtonProps> }
    onPropertyChange: (value: string | object) => void
  }>()

  let Header: ISelectOption = $derived(
    $optionsStore.HEADER_OPTIONS.find((h) => h.value === component.properties.eventHandler.Header) ?? { id: '', name: '', value: '', class: '!w-1/4' },
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

  const initialHeight = $derived(
    $optionsStore.HEIGHT_OPTIONS.find((h) =>
      (h.value as string).includes(component.properties.componentClass?.split(' ').find((cls: string) => cls.startsWith('py-'))),
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
    updateProperty('componentClass', componentClass)
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

  const handleButtonHeight = (height: string) => {
    let buttonClass = component.properties.componentClass || ''
    buttonClass = buttonClass
      .split(' ')
      .filter((cls: string) => !cls.startsWith('py-'))
      .join(' ')
    if (height) {
      buttonClass += ` ${height}`
    }
    updateProperty('componentClass', buttonClass)
  }

  /* Обновление свойства */
  const updateProperty = (path: string, value: string | object | string[]) => {
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
  <div class="relative flex flex-row items-start justify-center">
    <!-- Сообщение для отправки в ws по нажатию кнопки -->
    <div class="flex w-1/3 flex-col items-center px-2">
      <UI.Select
        wrapperClass="w-full"
        label={{ name: $t('service.constructor.props.header') }}
        type="buttons"
        value={Header}
        options={$optionsStore.HEADER_OPTIONS}
        onUpdate={(option) => {
          Header = option
          updateProperty('eventHandler.Header', Header.value as string)
        }}
      />
      {#if Header.value === 'SET'}
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
      {/if}
      {#if (component.properties.eventHandler.Argument !== 'Save' && component.properties.eventHandler.Argument !== 'NoSave') || Header.value !== 'SET'}
        <UI.Input
          wrapperClass="w-full {Header.value === 'SET' ? 'mt-1' : ''} "
          label={{ name: Header.value === 'SET' ? '' : $t('service.constructor.props.argument') }}
          value={component.properties.eventHandler.Argument}
          type="text"
          autocomplete="on"
          componentClass="w-full"
          maxlength={32}
          regExp={/^[a-zA-Z0-9\-_]{0,32}$/}
          help={{ info: $t('service.constructor.props.argument.info') }}
          onUpdate={(value) => updateProperty('eventHandler.Argument', value as string)}
        />
        <UI.Input
          wrapperClass="w-full"
          label={{ name: $t('service.constructor.props.value') }}
          value={component.properties.eventHandler.Value}
          type="text"
          autocomplete="on"
          componentClass="w-full"
          maxlength={500}
          regExp={/^[a-zA-Z0-9\-_ ":{}]{0,500}$/}
          help={{ info: $t('service.constructor.props.value.info') }}
          onUpdate={(value) => updateProperty('eventHandler.Value', value as string)}
        />
      {/if}
      <UI.Input
        wrapperClass="w-full"
        label={{ name: $t('service.constructor.props.variables') }}
        value={component.properties.eventHandler.Variables.join(' ')}
        type="text"
        autocomplete="on"
        componentClass="w-full"
        maxlength={500}
        regExp={/^[a-zA-Z0-9\-_ ]{0,500}$/}
        help={{ info: $t('service.constructor.props.variables.info') }}
        onUpdate={(value) => {
          const parts = (value as string).trim().split(/\s+/)
          updateProperty('eventHandler.Variables', parts)
        }}
      />
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <UI.Input
        wrapperClass="w-full"
        label={{ name: $t('service.constructor.props.name') }}
        value={component.properties.name}
        type="text"
        onUpdate={(value) => updateProperty('name', value as string)}
      />
      <UI.Select
        wrapperClass="w-full"
        label={{ name: $t('service.constructor.props.height') }}
        type="buttons"
        options={$optionsStore.HEIGHT_OPTIONS}
        value={initialHeight}
        onUpdate={(option) => handleButtonHeight(option.value as string)}
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
{/if}
