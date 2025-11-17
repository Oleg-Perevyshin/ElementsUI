<script lang="ts">
  import { getContext } from 'svelte'
  import { t } from '$lib/locales/i18n'
  import { type UIComponent, type ISwitchProps, updateProperty, type ISelectOption } from '../types'
  import * as UI from '$lib'
  import { optionsStore } from '../options'
  import { twMerge } from 'tailwind-merge'
  import ButtonDelete from '$lib/libIcons/ButtonDelete.svelte'
  import ButtonAdd from '$lib/libIcons/ButtonAdd.svelte'

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

{#if forConstructor}
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
      {#if !component.properties.bitMode}
        <UI.Select
          wrapperClass="!h-14"
          label={{ name: $t('constructor.props.type') }}
          type="buttons"
          options={$optionsStore.SWITCH_OPTIONS}
          value={$optionsStore.SWITCH_OPTIONS.find((option) => option.value == component.properties.type)}
          onUpdate={(option) => updateProperty('type', option.value as string, component, onPropertyChange)}
        />
      {/if}
    </div>
    {#if !component.properties.bitMode}
      <div class="flex w-1/3 flex-col px-2">
        <UI.Input
          label={{ name: $t('constructor.props.caption.left') }}
          value={component.properties.label.captionLeft}
          onUpdate={(value) => updateProperty('label.captionLeft', value as string, component, onPropertyChange)}
        />
        <UI.Input
          label={{ name: $t('constructor.props.caption.right') }}
          value={component.properties.label.captionRight}
          onUpdate={(value) => updateProperty('label.captionRight', value as string, component, onPropertyChange)}
        />

        <UI.Switch
          wrapperClass="bg-blue"
          label={{ name: $t('constructor.props.disabled') }}
          value={component.properties.options[0].disabled}
          options={[{ id: crypto.randomUUID(), value: 0, class: '' }]}
          onChange={(value) => {
            const options = [...(component.properties?.options || [])]
            options[0]['disabled'] = value
            updateProperty('options', options, component, onPropertyChange)
          }}
        />
      </div>
    {/if}
    <div class="flex w-1/3 flex-col px-2">
      <UI.Input
        label={{ name: $t('constructor.props.label') }}
        value={component.properties.label.name}
        onUpdate={(value) => updateProperty('label.name', value as string, component, onPropertyChange)}
      />
      {#if !component.properties.bitMode}
        <UI.Select
          wrapperClass="!h-14"
          label={{ name: $t('constructor.props.colors') }}
          type="buttons"
          options={$optionsStore.COLOR_OPTIONS.filter((option) => option.value !== 'bg-max' && option.value !== 'bg-gray')}
          value={initialColor}
          onUpdate={(option) => {
            const options = [...(component.properties?.options || [])]
            options[0]['class'] = option.value
            updateProperty('options', options, component, onPropertyChange)
          }}
        />
      {/if}
      <UI.Switch
        wrapperClass="bg-blue"
        label={{ name: $t('constructor.props.bitmode') }}
        value={component.properties.bitMode}
        options={[{ id: crypto.randomUUID(), value: 0, class: '' }]}
        onChange={(value) => {
          updateProperty('bitMode', value, component, onPropertyChange)
          updateProperty('value', 1, component, onPropertyChange)
        }}
      />
    </div>
  </div>
  {#if component.properties.bitMode}
    <hr class="border-gray-400" />

    <!-- Настройки опций -->
    <div class="space-y-4">
      <div class="m-0 flex items-center justify-center gap-2">
        <h4>{$t('constructor.props.bits.title')}</h4>
        <UI.Button
          wrapperClass="w-8"
          content={{ icon: ButtonAdd }}
          onClick={() => {
            const newOption: ISelectOption = {
              id: crypto.randomUUID(),
              name: `Option ${component.properties?.options.length + 1}`,
              value: component.properties?.options.length,
              class: 'bg-blue',
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
            type="number"
            number={{ minNum: 0, maxNum: 31, step: 1 }}
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
            options={$optionsStore.COLOR_OPTIONS.filter((option) => option.value !== 'bg-max' && option.value !== 'bg-gray')}
            value={$optionsStore.COLOR_OPTIONS.find((c) =>
              (c.value as string).includes(option.class.split(' ').find((cls: string) => cls.startsWith('bg-'))),
            )}
            onUpdate={(option) => {
              const options = [...(component.properties?.options || [])]
              options[index]['class'] = option.value
              updateProperty('options', options, component, onPropertyChange)
            }}
          />
          <UI.Switch
            wrapperClass=" w-1/10 bg-blue"
            label={{ name: $t('constructor.props.disabled') }}
            value={option.disabled}
            options={[{ id: crypto.randomUUID(), value: 0, class: '' }]}
            onChange={(value) => {
              const options = [...(component.properties?.options || [])]
              options[index]['disabled'] = value
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
{:else}
  <div class="relative flex flex-row items-start justify-center">
    <!-- Сообщение для отправки в ws по нажатию кнопки -->
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
        options={$optionsStore.COLOR_OPTIONS.filter((option) => option.value !== 'bg-max' && option.value !== 'bg-gray')}
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
    <div class="flex w-1/3 flex-col px-2">
      <UI.Input
        label={{ name: $t('constructor.props.label') }}
        value={component.properties.label.name}
        onUpdate={(value) => updateProperty('label.name', value as string, component, onPropertyChange)}
      />
      <UI.Input
        label={{ name: $t('constructor.props.caption.left') }}
        value={component.properties.label.captionLeft}
        onUpdate={(value) => updateProperty('label.captionLeft', value as string, component, onPropertyChange)}
      />
      <UI.Input
        label={{ name: $t('constructor.props.caption.right') }}
        value={component.properties.label.captionRight}
        onUpdate={(value) => updateProperty('label.captionRight', value as string, component, onPropertyChange)}
      />
      <UI.Select
        wrapperClass="!h-14"
        label={{ name: $t('constructor.props.type') }}
        type="buttons"
        options={$optionsStore.SWITCH_OPTIONS}
        value={$optionsStore.SWITCH_OPTIONS.find((option) => option.value == component.properties.type)}
        onUpdate={(option) => updateProperty('type', option.value as string, component, onPropertyChange)}
      />
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <UI.Input
        label={{ name: $t('constructor.props.height') }}
        value={component.properties.height}
        onUpdate={(value) => updateProperty('height', value as string, component, onPropertyChange)}
      />
      <UI.Input
        label={{ name: $t('constructor.props.value') }}
        value={component.properties.value}
        type="number"
        number={{ minNum: 0, maxNum: component.properties.bitMode ? Math.pow(2, 32) : 1, step: 1 }}
        onUpdate={(value) => updateProperty('value', value as number, component, onPropertyChange)}
      />
      <UI.Switch
        wrapperClass="bg-blue"
        label={{ name: $t('constructor.props.disabled') }}
        value={component.properties.disabled}
        options={[{ id: crypto.randomUUID(), value: 0, class: '' }]}
        onChange={(value) => updateProperty('disabled', value, component, onPropertyChange)}
      />
      <UI.Switch
        wrapperClass="bg-blue"
        label={{ name: $t('constructor.props.bitmode') }}
        value={component.properties.bitMode}
        options={[{ id: crypto.randomUUID(), value: 0, class: '' }]}
        onChange={(value) => {
          updateProperty('bitMode', value, component, onPropertyChange)
          updateProperty('value', 1, component, onPropertyChange)
        }}
      />
    </div>
  </div>
  {#if component.properties.bitMode}
    <hr class="border-gray-400" />

    <!-- Настройки опций -->
    <div class="space-y-4">
      <div class="m-0 flex items-center justify-center gap-2">
        <h4>{$t('constructor.props.bits.title')}</h4>
        <UI.Button
          wrapperClass="w-8"
          content={{ icon: ButtonAdd }}
          onClick={() => {
            const newOption: ISelectOption = {
              id: crypto.randomUUID(),
              name: `Option ${component.properties?.options.length + 1}`,
              value: component.properties?.options.length,
              class: 'bg-blue',
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
            type="number"
            number={{ minNum: 0, maxNum: 31, step: 1 }}
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
            options={$optionsStore.COLOR_OPTIONS.filter((option) => option.value !== 'bg-max' && option.value !== 'bg-gray')}
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
{/if}
