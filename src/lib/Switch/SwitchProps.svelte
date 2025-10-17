<script lang="ts">
  import { getContext } from 'svelte'
  import { t } from '$lib/locales/i18n'
  import { type UIComponent, type ISwitchProps, updateProperty, type ISelectOption } from '../types'
  import * as UI from '$lib'
  import { optionsStore } from '../options'
  import { twMerge } from 'tailwind-merge'

  const {
    component,
    onPropertyChange,
    forConstructor = true,
  } = $props<{
    component: UIComponent & { properties: Partial<ISwitchProps> }
    onPropertyChange: (value: string | object, name?: string) => void
    forConstructor?: boolean
  }>()
  const DeviceVariables = getContext<{ id: string; value: string; name: string }[]>('DeviceVariables')
  let VARIABLE_OPTIONS = $derived(DeviceVariables && Array.isArray(DeviceVariables) ? DeviceVariables : [])

  const initialColor = $derived(
    $optionsStore.COLOR_OPTIONS.find((c) =>
      (c.value as string).includes(component.properties.wrapperClass?.split(' ').find((cls: string) => cls.startsWith('bg-'))),
    ),
  )
</script>

{#if component && component.properties}
  <div class="relative flex flex-row items-start justify-center">
    <!-- Сообщение для отправки в ws по нажатию кнопки -->
    <div class="flex w-1/3 flex-col items-center px-2">
      <UI.Select
        label={{ name: $t('constructor.props.variable') }}
        options={VARIABLE_OPTIONS}
        value={VARIABLE_OPTIONS.find((opt) => opt.value === component.properties.id)}
        onUpdate={(value) => {
          updateProperty('id', value.value as string, component, onPropertyChange, value.name?.split('—')[1].trim())
          updateProperty('eventHandler.Variables', value.value as string, component, onPropertyChange)
        }}
      />
      <UI.Select
        label={{ name: $t('constructor.props.action') }}
        type="buttons"
        value={$optionsStore.SHORT_ARGUMENT_OPTION.find((h) => h.value === component.properties.eventHandler.Argument)}
        options={$optionsStore.SHORT_ARGUMENT_OPTION}
        onUpdate={(option) => {
          updateProperty('eventHandler.Argument', option.value as string, component, onPropertyChange)
        }}
      />
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <UI.Input
        label={{ name: $t('constructor.props.caption.left') }}
        value={component.properties.label.captionLeft}
        type="text"
        onUpdate={(value) => updateProperty('label.captionLeft', value as string, component, onPropertyChange)}
      />
      <UI.Input
        label={{ name: $t('constructor.props.caption.right') }}
        value={component.properties.label.captionRight}
        type="text"
        onUpdate={(value) => updateProperty('label.captionRight', value as string, component, onPropertyChange)}
      />
      <UI.Switch
        wrapperClass="bg-blue"
        label={{ name: $t('constructor.props.disabled') }}
        value={component.properties.disabled ? 2 : 1}
        onChange={(value) => updateProperty('disabled', value === 2, component, onPropertyChange)}
      />
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <UI.Input
        label={{ name: $t('constructor.props.label') }}
        value={component.properties.label.name}
        type="text"
        onUpdate={(value) => updateProperty('label.name', value as string, component, onPropertyChange)}
      />
      <UI.Select
        wrapperClass="!h-14"
        label={{ name: $t('constructor.props.colors') }}
        type="buttons"
        options={$optionsStore.COLOR_OPTIONS.filter((option) => option.value !== 'bg-max' && option.value !== 'bg-gray')}
        value={initialColor}
        onUpdate={(option) => updateProperty('wrapperClass', twMerge(component.properties.wrapperClass, option.value), component, onPropertyChange)}
      />
    </div>
  </div>
{/if}
