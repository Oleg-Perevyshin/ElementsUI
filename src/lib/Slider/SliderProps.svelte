<!-- $lib/ElementsUI/SwitchProps.svelte -->
<script lang="ts">
  import { getContext } from 'svelte'
  import { t } from '../locales/i18n'
  import type { UIComponent, ISliderProps } from '../types'
  import * as UI from '../index'
  import { optionsStore } from '../options'

  const { component, onPropertyChange } = $props<{
    component: UIComponent & { properties: Partial<ISliderProps> }
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

  const initialAlign = $derived(
    $optionsStore.ALIGN_OPTIONS.find((a) =>
      (a.value as string).includes(component.properties.label?.class?.split(' ').find((cls: string) => cls.startsWith('text-'))),
    ),
  )

  const initialColor = $derived(
    $optionsStore.COLOR_OPTIONS.find((c) =>
      (c.value as string).includes(component.properties.wrapperClass?.split(' ').find((cls: string) => cls.startsWith('bg-'))),
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
  const updateProperty = (path: string, value: number | string | object) => {
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
        wrapperClass="w-full"
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
      <UI.Select
        wrapperClass="w-full"
        label={{ name: $t('service.constructor.props.type') }}
        type="buttons"
        value={$optionsStore.SLIDER_TYPE_OPTIONS.find((opt) => opt.value === (component.properties.type || 'single'))}
        options={$optionsStore.SLIDER_TYPE_OPTIONS}
        onUpdate={(type) => {
          updateProperty('value', type.value === 'single' ? 5 : [2, 7])
          updateProperty('type', type.value as string)
        }}
      />
      <UI.Input
        wrapperClass="w-full"
        label={{ name: $t('service.constructor.props.minnum') }}
        value={component.properties.number.minNum as number}
        type="number"
        onUpdate={(value) => updateProperty('number.minNum', Number(value))}
      />
      <UI.Input
        wrapperClass="w-full"
        label={{ name: $t('service.constructor.props.maxnum') }}
        value={component.properties.number.maxNum as number}
        type="number"
        onUpdate={(value) => updateProperty('number.maxNum', Number(value))}
      />
      <UI.Input
        wrapperClass="w-full"
        label={{ name: $t('service.constructor.props.step') }}
        value={component.properties.number.step as number}
        type="number"
        onUpdate={(value) => updateProperty('number.step', Number(value))}
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
