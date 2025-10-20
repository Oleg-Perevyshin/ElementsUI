<!-- $lib/ElementsUI/ButtonProps.svelte -->
<script lang="ts">
  import { t } from '$lib/locales/i18n'
  import { type UIComponent, type IColorPickerProps, updateProperty } from '../types'
  import * as UI from '$lib'
  import { getContext } from 'svelte'
  import { optionsStore } from '../options'
  import type { IFileInputProps } from './FileAttach.svelte'

  const {
    component,
    onPropertyChange,
    forConstructor = true,
  } = $props<{
    component: UIComponent & { properties: Partial<IFileInputProps> }
    onPropertyChange: (value: string | object, name?: string) => void
    forConstructor?: boolean
  }>()
</script>

{#if !forConstructor}
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
    <div class="flex w-1/3 flex-col px-2">
      <UI.Select
        label={{ name: $t('constructor.props.type') }}
        type="buttons"
        value={$optionsStore.FILE_ATTACH_TYPE_OPTIONS.find((c) => (c.value as string).includes(component.properties.type))}
        options={$optionsStore.FILE_ATTACH_TYPE_OPTIONS}
        onUpdate={(option) => updateProperty('type', option.value as string, component, onPropertyChange)}
      />
      <UI.Input
        label={{ name: $t('constructor.props.file.accept') }}
        value={component.properties.accept}
        onUpdate={(value) => updateProperty('accept', value as string, component, onPropertyChange)}
      />
      {#if component.properties.type === 'image'}
        <div class="flex gap-4">
          <UI.Input
            label={{ name: $t('constructor.props.imageSize.height') }}
            value={component.properties.imageSize.height}
            onUpdate={(value) => updateProperty('imageSize.height', value as string, component, onPropertyChange)}
          />
          <UI.Input
            label={{ name: $t('constructor.props.imageSize.width') }}
            value={component.properties.imageSize.width}
            onUpdate={(value) => updateProperty('imageSize.width', value as string, component, onPropertyChange)}
          />
        </div>
        <div class="flex gap-4">
          <UI.Select
            label={{ name: $t('constructor.props.fitmode') }}
            type="buttons"
            value={$optionsStore.FITMODE_OPTIONS.find((c) => (c.value as string).includes(component.properties.imageSize.fitMode))}
            options={$optionsStore.FITMODE_OPTIONS}
            onUpdate={(option) => updateProperty('imageSize.fitMode', option.value as string, component, onPropertyChange)}
          />
          <UI.Select
            label={{ name: $t('constructor.props.form') }}
            type="buttons"
            value={$optionsStore.FORM_OPTIONS.find((c) => (c.value as string).includes(component.properties.imageSize.form))}
            options={$optionsStore.FORM_OPTIONS}
            onUpdate={(option) => updateProperty('imageSize.form', option.value as string, component, onPropertyChange)}
          />
        </div>
      {/if}
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <UI.Input
        label={{ name: $t('constructor.props.currentImage') }}
        value={component.properties.currentImage}
        onUpdate={(value) => updateProperty('currentImage', value as string, component, onPropertyChange)}
      />
    </div>
  </div>
{/if}
