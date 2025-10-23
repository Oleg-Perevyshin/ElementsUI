<script lang="ts">
  import { getContext } from 'svelte'
  import { t } from '$lib/locales/i18n'
  import { type UIComponent, type ISelectProps, type ISelectOption, updateProperty } from '../types'
  import * as UI from '$lib'
  import ButtonDelete from '../libIcons/ButtonDelete.svelte'
  import ButtonAdd from '../libIcons/ButtonAdd.svelte'
  import { optionsStore } from '../options.js'
  import { twMerge } from 'tailwind-merge'

  const {
    component,
    onPropertyChange,
    forConstructor = true,
  } = $props<{
    component: UIComponent & { properties: Partial<ISelectProps> }
    onPropertyChange: (value: string | object, name?: string) => void
    forConstructor?: boolean
  }>()

  const DeviceVariables = getContext<{ id: string; value: string; name: string }[]>('DeviceVariables')
  let VARIABLE_OPTIONS = $derived(DeviceVariables && Array.isArray(DeviceVariables) ? DeviceVariables : [])

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
    $optionsStore.HEADER_OPTIONS.find((h) => h.value === component.properties.eventHandler.Header) ?? {
      id: '',
      name: '',
      value: '',
      class: '!w-1/4',
    },
  )

  let currentType = $derived($optionsStore.SELECT_TYPE_OPTIONS.find((t) => t.value === component.properties.type))

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
</script>

{#if forConstructor}
  <div class="relative mb-4 flex flex-row items-start justify-center">
    <div class="flex w-1/3 flex-col items-center px-2">
      <UI.Select
        label={{ name: $t('constructor.props.variable') }}
        options={VARIABLE_OPTIONS}
        value={VARIABLE_OPTIONS.find((opt) => opt.value === component.properties.id)}
        onUpdate={(value) => {
          updateProperty('id', value.value as string, component, onPropertyChange)
          updateProperty('eventHandler.Variables', value.value as string, component, onPropertyChange)
        }}
      />
      <UI.Select
        label={{ name: $t('constructor.props.argument') }}
        type="buttons"
        value={$optionsStore.FULL_ARGUMENT_OPTION.find((h) => h.value === component.properties.eventHandler.Argument) ??
          $optionsStore.FULL_ARGUMENT_OPTION.find((h) => h.value === '')}
        options={$optionsStore.FULL_ARGUMENT_OPTION}
        onUpdate={(option) => {
          updateProperty('eventHandler.Argument', option.value as string, component, onPropertyChange)
        }}
      />

      <UI.Input
        wrapperClass="{Header.value === 'SET' ? 'mt-1' : ''} "
        value={component.properties.eventHandler.Argument}
        maxlength={32}
        disabled={component.properties.eventHandler.Argument == 'Save' || component.properties.eventHandler.Argument == 'NoSave'}
        help={{ info: $t('constructor.props.argument.info'), autocomplete: 'on', regExp: /^[a-zA-Z0-9\-_]{0,32}$/ }}
        onUpdate={(value) => updateProperty('eventHandler.Argument', value as string, component, onPropertyChange)}
      />

      <UI.Select
        label={{ name: $t('constructor.props.type') }}
        type="buttons"
        value={currentType}
        options={$optionsStore.SELECT_TYPE_OPTIONS}
        onUpdate={(item) => updateProperty('type', item.value as string, component, onPropertyChange)}
      />
    </div>
    <div class="flex w-1/3 flex-col items-center px-2">
      <UI.Select
        wrapperClass="h-14"
        label={{ name: $t('constructor.props.valuetype') }}
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
          updateProperty('options', options, component, onPropertyChange)
        }}
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
    </div>
    <div class="flex w-1/3 flex-col items-center px-2">
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
    </div>
  </div>

  <hr class="border-gray-400" />

  <!-- Настройки опций -->
  <div class="space-y-4">
    <div class="m-0 flex items-center justify-center gap-2">
      <h4>{$t('constructor.props.options.title')}</h4>
      <UI.Button
        wrapperClass="w-8"
        content={{ icon: ButtonAdd }}
        onClick={() => {
          const newOption: ISelectOption = {
            id: crypto.randomUUID(),
            name: 'New Button',
            class: 'bg-max',
          }
          const options = [...(component.properties?.options || []), newOption]
          updateProperty('options', options, component, onPropertyChange)
        }}
      />
    </div>

    {#each component.properties.options || [] as option, index (option.id)}
      <div class="m-0 flex items-end justify-around gap-2 border-gray-400">
        <UI.Input
          label={{ name: $t('constructor.props.optionname') }}
          wrapperClass="!w-3/10"
          value={option.name}
          onUpdate={(value) => {
            const options = [...(component.properties?.options || [])]
            options[index]['name'] = value
            updateProperty('options', options, component, onPropertyChange)
          }}
        />
        <UI.Input
          label={{ name: $t('constructor.props.optionvalue') }}
          wrapperClass="!w-3/10"
          value={option.value}
          type={currentValueType.value}
          onUpdate={(value) => {
            const options = [...(component.properties?.options || [])]
            options[index]['value'] = value
            updateProperty('options', options, component, onPropertyChange)
          }}
        />
        <UI.Select
          wrapperClass="w-80 h-14.5"
          label={{ name: $t('constructor.props.colors') }}
          type="buttons"
          options={$optionsStore.COLOR_OPTIONS}
          value={$optionsStore.COLOR_OPTIONS.find((c) =>
            (c.value as string).includes(option.class.split(' ').find((cls: string) => cls.startsWith('bg-'))),
          )}
          onUpdate={(option) => {
            const options = [...(component.properties?.options || [])]
            options[index]['class'] = option.value
            updateProperty('options', options, component, onPropertyChange)
          }}
        />
        <UI.Button
          wrapperClass="w-8"
          content={{ icon: ButtonDelete }}
          onClick={() => {
            const options = [...(component.properties?.options || [])]
            options.splice(index, 1)
            updateProperty('options', options, component, onPropertyChange)
          }}
        />
      </div>
    {/each}
  </div>
{:else}
  <div class="relative mb-4 flex flex-row items-start justify-center">
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
    </div>
    <div class="flex w-1/3 flex-col items-center px-2">
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
    </div>
    <div class="flex w-1/3 flex-col items-center px-2">
      <UI.Select
        label={{ name: $t('constructor.props.type') }}
        type="buttons"
        value={currentType}
        options={$optionsStore.SELECT_TYPE_OPTIONS}
        onUpdate={(item) => updateProperty('type', item.value as string, component, onPropertyChange)}
      />
      <UI.Select
        wrapperClass="h-14"
        label={{ name: $t('constructor.props.valuetype') }}
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
          updateProperty('options', options, component, onPropertyChange)
        }}
      />
      <UI.Switch
        wrapperClass="bg-blue"
        label={{ name: $t('constructor.props.disabled') }}
        value={component.properties.disabled ? 2 : 1}
        onChange={(value) => updateProperty('disabled', value === 2, component, onPropertyChange)}
      />
    </div>
  </div>

  <hr class="border-gray-400" />

  <!-- Настройки опций -->
  <div class="space-y-4">
    <div class="m-0 flex items-center justify-center gap-2">
      <h4>{$t('constructor.props.options.title')}</h4>
      <UI.Button
        wrapperClass="w-8"
        content={{ icon: ButtonAdd }}
        onClick={() => {
          const newOption: ISelectOption = {
            id: crypto.randomUUID(),
            name: 'New Button',
            class: 'bg-max',
          }
          const options = [...(component.properties?.options || []), newOption]
          updateProperty('options', options, component, onPropertyChange)
        }}
      />
    </div>

    {#each component.properties.options || [] as option, index (option.id)}
      <div class="m-0 flex items-end justify-around gap-2 border-gray-400">
        <UI.Input
          label={{ name: $t('constructor.props.optionname') }}
          wrapperClass="!w-3/10"
          value={option.name}
          onUpdate={(value) => {
            const options = [...(component.properties?.options || [])]
            options[index]['name'] = value
            updateProperty('options', options, component, onPropertyChange)
          }}
        />
        <UI.Input
          label={{ name: $t('constructor.props.optionvalue') }}
          wrapperClass="!w-3/10"
          value={option.value}
          type={currentValueType.value}
          onUpdate={(value) => {
            const options = [...(component.properties?.options || [])]
            options[index]['value'] = value
            updateProperty('options', options, component, onPropertyChange)
          }}
        />
        <UI.Select
          wrapperClass="w-80 h-14.5"
          label={{ name: $t('constructor.props.colors') }}
          type="buttons"
          options={$optionsStore.COLOR_OPTIONS}
          value={$optionsStore.COLOR_OPTIONS.find((c) =>
            (c.value as string).includes(option.class.split(' ').find((cls: string) => cls.startsWith('bg-'))),
          )}
          onUpdate={(option) => {
            const options = [...(component.properties?.options || [])]
            options[index]['class'] = option.value
            updateProperty('options', options, component, onPropertyChange)
          }}
        />
        <UI.Button
          wrapperClass="w-8"
          content={{ icon: ButtonDelete }}
          onClick={() => {
            const options = [...(component.properties?.options || [])]
            options.splice(index, 1)
            updateProperty('options', options, component, onPropertyChange)
          }}
        />
      </div>
    {/each}
  </div>
{/if}
