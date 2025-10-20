<!-- $lib/ElementsUI/ButtonProps.svelte -->
<script lang="ts">
  import { t } from '$lib/locales/i18n'
  import { type UIComponent, type IButtonProps, type ISelectOption, updateProperty } from '../types'
  import * as UI from '$lib'
  import { optionsStore } from '../options'
  import { twMerge } from 'tailwind-merge'

  const {
    component,
    onPropertyChange,
    forConstructor = true,
  } = $props<{
    component: UIComponent & { properties: Partial<IButtonProps> }
    onPropertyChange: (value: string | object, name?: string) => void
    forConstructor?: boolean
  }>()

  let hasValue: boolean = $derived(component.properties.eventHandler.Value)

  let Header: ISelectOption = $derived(
    $optionsStore.HEADER_OPTIONS.find((h) => h.value === component.properties.eventHandler.Header) ?? {
      id: '',
      name: '',
      value: '',
      class: '!w-1/4',
    },
  )

  const initialColor = $derived(
    $optionsStore.COLOR_OPTIONS.find((c) =>
      (c.value as string).includes(component.properties.componentClass?.split(' ').find((cls: string) => cls.startsWith('bg-'))),
    ),
  )

  const initialHeight = $derived(
    $optionsStore.HEIGHT_OPTIONS.find((h) =>
      (h.value as string).includes(component.properties.componentClass?.split(' ').find((cls: string) => cls.startsWith('py-'))),
    ),
  )
</script>

{#if forConstructor}
  <div class="relative flex flex-row items-start justify-center">
    <!-- Сообщение для отправки в ws по нажатию кнопки -->
    <div class="flex w-1/3 flex-col items-center px-2">
      <UI.Select
        label={{ name: $t('constructor.props.header') }}
        type="buttons"
        value={Header}
        options={$optionsStore.HEADER_OPTIONS}
        onUpdate={(option) => {
          Header = option
          updateProperty('eventHandler.Header', Header.value as string, component, onPropertyChange)
        }}
      />
      {#if Header.value === 'SET'}
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
      {/if}
      <UI.Input
        label={{ name: Header.value !== 'SET' ? $t('constructor.props.argument') : '' }}
        wrapperClass="{Header.value === 'SET' ? 'mt-1' : ''} "
        value={component.properties.eventHandler.Argument}
        maxlength={32}
        disabled={Header.value === 'SET' &&
          (component.properties.eventHandler.Argument == 'Save' || component.properties.eventHandler.Argument == 'NoSave')}
        help={{ info: $t('constructor.props.argument.info'), autocomplete: 'on', regExp: /^[a-zA-Z0-9\-_]{0,32}$/ }}
        onUpdate={(value) => updateProperty('eventHandler.Argument', value as string, component, onPropertyChange)}
      />

      {#if (component.properties.eventHandler.Argument !== 'Save' && component.properties.eventHandler.Argument !== 'NoSave') || Header.value !== 'SET'}
        <UI.Input
          label={{ name: $t('constructor.props.value') }}
          value={component.properties.eventHandler.Value}
          help={{ info: $t('constructor.props.value.info') }}
          maxlength={500}
          onUpdate={(value) => updateProperty('eventHandler.Value', value as string, component, onPropertyChange)}
        />
      {/if}
      <UI.Input
        label={{ name: $t('constructor.props.variables') }}
        disabled={hasValue}
        value={component.properties.eventHandler.Variables.join(' ')}
        help={{ info: $t('constructor.props.variables.info'), autocomplete: 'on', regExp: /^[a-zA-Z0-9\-_ ":{}]{0,500}$/ }}
        maxlength={500}
        onUpdate={(value) => {
          const parts = (value as string).trim().split(/\s+/)
          updateProperty('eventHandler.Variables', parts, component, onPropertyChange)
        }}
      />
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <UI.Input
        label={{ name: $t('constructor.props.name') }}
        value={component.properties.content.name}
        onUpdate={(value) => updateProperty('content.name', value as string, component, onPropertyChange)}
      />
      <UI.Select
        label={{ name: $t('constructor.props.height') }}
        type="buttons"
        options={$optionsStore.HEIGHT_OPTIONS}
        value={initialHeight}
        onUpdate={(option) =>
          updateProperty('componentClass', twMerge(component.properties.componentClass, option.value), component, onPropertyChange)}
      />
      <UI.Select
        wrapperClass="h-14"
        label={{ name: $t('constructor.props.colors') }}
        type="buttons"
        options={$optionsStore.COLOR_OPTIONS}
        value={initialColor}
        onUpdate={(option) =>
          updateProperty('componentClass', twMerge(component.properties.componentClass, option.value), component, onPropertyChange)}
      />
    </div>
  </div>
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

      <UI.Switch
        wrapperClass="bg-blue"
        label={{ name: $t('constructor.props.disabled') }}
        value={component.properties.disabled ? 2 : 1}
        onChange={(value) => updateProperty('disabled', value === 2, component, onPropertyChange)}
      />
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <UI.Input
        label={{ name: $t('constructor.props.name') }}
        value={component.properties.content.name}
        onUpdate={(value) => updateProperty('content.name', value as string, component, onPropertyChange)}
      />
      <UI.Input
        label={{ name: $t('constructor.props.info') }}
        value={component.properties.content.info}
        onUpdate={(value) => updateProperty('content.info', value as string, component, onPropertyChange)}
      />
      <UI.Input
        label={{ name: $t('constructor.props.svgicon') }}
        type="text-area"
        maxlength={100000}
        value={component.properties.content.icon}
        onUpdate={(value) => updateProperty('content.icon', value as string, component, onPropertyChange)}
      />
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <UI.Input
        label={{ name: $t('constructor.props.componentclass') }}
        value={component.properties.componentClass}
        onUpdate={(value) => updateProperty('componentClass', value as string, component, onPropertyChange)}
      />
      <UI.Select
        label={{ name: $t('constructor.props.height') }}
        type="buttons"
        options={$optionsStore.HEIGHT_OPTIONS}
        value={initialHeight}
        onUpdate={(option) =>
          updateProperty('componentClass', twMerge(component.properties.componentClass, option.value), component, onPropertyChange)}
      />
      <UI.Select
        wrapperClass="h-14"
        label={{ name: $t('constructor.props.colors') }}
        type="buttons"
        options={$optionsStore.COLOR_OPTIONS}
        value={initialColor}
        onUpdate={(option) =>
          updateProperty('componentClass', twMerge(component.properties.componentClass, option.value), component, onPropertyChange)}
      />
    </div>
  </div>
{/if}
