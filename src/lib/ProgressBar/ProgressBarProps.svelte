<script lang="ts">
  import { getContext } from 'svelte'
  import { t } from '$lib/locales/i18n'
  import { type UIComponent, type IProgressBarProps, updateProperty } from '../types'
  import * as UI from '$lib'
  import { optionsStore } from '../options'
  import { twMerge } from 'tailwind-merge'

  const {
    component,
    onPropertyChange,
    forConstructor = true,
  } = $props<{
    component: UIComponent & { properties: Partial<IProgressBarProps> }
    onPropertyChange: (value: string | object, name?: string) => void
    forConstructor?: boolean
  }>()

  const DeviceVariables = getContext<{ id: string; value: string; name: string }[]>('DeviceVariables')
  let VARIABLE_OPTIONS = $derived(DeviceVariables && Array.isArray(DeviceVariables) ? DeviceVariables : [])

  const initialAlign = $derived(
    $optionsStore.TEXT_ALIGN_OPTIONS.find((a) =>
      (a.value as string).includes(component.properties.label?.class?.split(' ').find((cls: string) => cls.startsWith('text-'))),
    ),
  )

  const initialColor = $derived(
    $optionsStore.COLOR_OPTIONS.find((c) =>
      (c.value as string).includes(component.properties.wrapperClass?.split(' ').find((cls: string) => cls.startsWith('bg-'))),
    ),
  )
</script>

{#if forConstructor}
  <div class="relative flex flex-row items-start justify-center">
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
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <UI.Input
        label={{ name: $t('constructor.props.min') }}
        value={component.properties.number.minNum as number}
        type="number"
        onUpdate={(value) => {
          // if ((value as number) >= component.properties.number.maxNum) {
          //   value = component.properties.number.maxNum - 1
          // }
          updateProperty('number.minNum', Number(value), component, onPropertyChange)
          updateProperty(
            'value',
            component.properties.number.minNum + (component.properties.number.maxNum - component.properties.number.minNum) / 3,
            component,
            onPropertyChange,
          )
        }}
      />
      <UI.Input
        label={{ name: $t('constructor.props.max') }}
        value={component.properties.number.maxNum as number}
        type="number"
        onUpdate={(value) => {
          // if ((value as number) <= component.properties.number.minNum) {
          //   value = component.properties.number.minNum + 1
          // }
          updateProperty('number.maxNum', Number(value), component, onPropertyChange)
          updateProperty(
            'value',
            component.properties.number.minNum + (component.properties.number.maxNum - component.properties.number.minNum) / 3,
            component,
            onPropertyChange,
          )
        }}
      />
      <UI.Input
        label={{ name: $t('constructor.props.units') }}
        value={component.properties.number.units}
        onUpdate={(value) => updateProperty('number.units', value, component, onPropertyChange)}
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
      <UI.Select
        wrapperClass="!h-14"
        label={{ name: $t('constructor.props.colors') }}
        type="buttons"
        options={$optionsStore.COLOR_OPTIONS}
        value={initialColor}
        onUpdate={(option) => updateProperty('wrapperClass', twMerge(component.properties.wrapperClass, option.value), component, onPropertyChange)}
      />
    </div>
  </div>
{:else}
  <div class="relative flex flex-row items-start justify-center">
    <div class="flex w-1/3 flex-col items-center px-2">
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
      <UI.Input
        label={{ name: $t('constructor.props.label.class') }}
        value={component.properties.label.class}
        onUpdate={(value) => updateProperty('label.class', value as string, component, onPropertyChange)}
      />
      <UI.Input
        label={{ name: $t('constructor.props.value') }}
        type="number"
        number={{ minNum: component.properties.number.minNum, maxNum: component.properties.number.maxNum, step: 1 }}
        value={component.properties.value}
        onUpdate={(value) => updateProperty('value', value as string, component, onPropertyChange)}
      />
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <UI.Input
        label={{ name: $t('constructor.props.min') }}
        value={component.properties.number.minNum as number}
        type="number"
        onUpdate={(value) => {
          updateProperty('number.minNum', Number(value), component, onPropertyChange)
        }}
      />
      <UI.Input
        label={{ name: $t('constructor.props.max') }}
        value={component.properties.number.maxNum as number}
        type="number"
        onUpdate={(value) => {
          updateProperty('number.maxNum', Number(value), component, onPropertyChange)
        }}
      />

      <UI.Input
        label={{ name: $t('constructor.props.units') }}
        value={component.properties.number.units}
        onUpdate={(value) => updateProperty('number.units', value, component, onPropertyChange)}
      />
    </div>
  </div>
{/if}
