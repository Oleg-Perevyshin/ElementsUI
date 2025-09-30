<!-- $lib/ElementsUI/SwitchProps.svelte -->
<script lang="ts">
  import { getContext } from 'svelte'
  import { t } from '../locales/i18n'
  import type { UIComponent, ISwitchProps } from '../types'
  import * as UI from '../index'
  import { optionsStore } from '../options'

  const { component, onPropertyChange } = $props<{
    component: UIComponent & { properties: Partial<ISwitchProps> }
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
  const updateProperty = (path: string, value: string | object | boolean | number) => {
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
        label={{ name: $t('service.constructor.props.action') }}
        type="buttons"
        value={$optionsStore.SHORT_ARGUMENT_OPTION.find((h) => h.value === component.properties.eventHandler.Argument)}
        options={$optionsStore.SHORT_ARGUMENT_OPTION}
        onUpdate={(option) => {
          updateProperty('eventHandler.Argument', option.value as string)
        }}
      />
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <UI.Input
        label={{ name: $t('service.constructor.props.caption.left') }}
        value={component.properties.label.captionLeft}
        type="text"
        onUpdate={(value) => updateProperty('label.captionLeft', value as string)}
      />
      <UI.Input
        label={{ name: $t('service.constructor.props.caption.right') }}
        value={component.properties.label.captionRight}
        type="text"
        onUpdate={(value) => updateProperty('label.captionRight', value as string)}
      />
      <UI.Switch
        label={{ name: $t('service.constructor.props.disabled') }}
        value={component.properties.disabled ? 2 : 1}
        onChange={(value) => updateProperty('disabled', value === 2)}
      />
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <UI.Input
        label={{ name: $t('service.constructor.props.label') }}
        value={component.properties.label.name}
        type="text"
        onUpdate={(value) => updateProperty('label.name', value as string)}
      />
      <UI.Select
        label={{ name: $t('service.constructor.props.align') }}
        type="buttons"
        value={initialAlign}
        options={$optionsStore.ALIGN_OPTIONS}
        onUpdate={(option) => handleLabelAlign(option.value as string)}
      />
      <UI.Select
        wrapperClass="!h-14"
        label={{ name: $t('service.constructor.props.colors') }}
        type="buttons"
        options={$optionsStore.COLOR_OPTIONS}
        value={initialColor}
        onUpdate={(option) => handleOptionColorChange(option.value as string)}
      />
    </div>
  </div>
{/if}
