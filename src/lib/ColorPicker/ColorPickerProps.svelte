<!-- $lib/ElementsUI/ButtonProps.svelte -->
<script lang="ts">
  import { t } from '$lib/locales/i18n'
  import { type UIComponent, type IColorPickerProps, updateProperty } from '../types'
  import * as UI from '$lib'
  import { getContext } from 'svelte'
  import { optionsStore } from '../options'

  const { component, onPropertyChange } = $props<{
    component: UIComponent & { properties: Partial<IColorPickerProps> }
    onPropertyChange: (value: string | object, name?: string) => void
  }>()

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

  const initialAlign = $derived(
    $optionsStore.ALIGN_OPTIONS.find((a) =>
      (a.value as string).includes(component.properties.label?.class?.split(' ').find((cls: string) => cls.startsWith('text-'))),
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
          updateProperty('id', value.value as string, component, onPropertyChange, value.name?.split('|')[1].trim())
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
        label={{ name: $t('constructor.props.label') }}
        value={component.properties.label.name}
        type="text"
        onUpdate={(value) => updateProperty('label.name', value as string, component, onPropertyChange)}
      />
      <UI.Select
        label={{ name: $t('constructor.props.align') }}
        type="buttons"
        value={initialAlign}
        options={$optionsStore.ALIGN_OPTIONS}
        onUpdate={(option) => updateProperty('label.class', option.value as string, component, onPropertyChange)}
      />
    </div>
  </div>
{/if}
