<!-- $lib/ElementsUI/GridAccordionProps.svelte -->
<script lang="ts">
  import { t } from '$lib/locales/i18n'
  import { updateProperty, type ITextFieldProps, type UIComponent } from '../types'
  import * as UI from '$lib/index'
  import { optionsStore } from '$lib/options'
  import { getContext } from 'svelte'
  import { twMerge } from 'tailwind-merge'

  const { component, onPropertyChange } = $props<{
    component: UIComponent & { properties: Partial<ITextFieldProps> }
    onPropertyChange: (value: string | object) => void
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
  let currentType = $derived($optionsStore.TEXTFIELD_SIZE_OPTIONS.find((t) => t.value === component.properties.content.size))

  const initialAlign = $derived(
    $optionsStore.ALIGN_OPTIONS.find((a) =>
      (a.value as string).includes(component.properties.content?.class?.split(' ').find((cls: string) => cls.startsWith('text-'))),
    ),
  )
  const initialColor = $derived(
    $optionsStore.TEXT_COLOR_OPTIONS.find((c) =>
      (c.value as string).includes(component.properties.wrapperClass?.split(' ').find((cls: string) => cls.startsWith('text-'))),
    ),
  )
  const initialBold = $derived(component.properties.content?.class?.split(' ').find((cls: string) => cls.startsWith('font-bold')))
  const initialItalic = $derived(component.properties.content?.class?.split(' ').find((cls: string) => cls.startsWith('italic')))
</script>

{#if component && component.properties}
  <div class="relative flex flex-row items-start justify-center">
    <div class="flex w-1/3 flex-col px-2">
      <UI.Select
        label={{ name: $t('constructor.props.variable') }}
        options={VARIABLE_OPTIONS}
        value={VARIABLE_OPTIONS.find((opt) => opt.value === component.properties.id)}
        onUpdate={(value) => {
          updateProperty('id', value.value as string, component, onPropertyChange)
          updateProperty('eventHandler.Variables', value.value as string, component, onPropertyChange)
        }}
      />
      <UI.Input
        label={{ name: $t('constructor.props.label') }}
        value={component.properties.content.name}
        onUpdate={(value) => updateProperty('content.name', value as string, component, onPropertyChange)}
      />
      <UI.Select
        label={{ name: $t('constructor.props.size') }}
        type="buttons"
        value={currentType}
        options={$optionsStore.TEXTFIELD_SIZE_OPTIONS}
        onUpdate={(item) => updateProperty('content.size', item.value as string, component, onPropertyChange)}
      />
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <UI.Select
        label={{ name: $t('constructor.props.align') }}
        type="buttons"
        value={initialAlign}
        options={$optionsStore.ALIGN_OPTIONS}
        onUpdate={(option) => updateProperty('content.class', twMerge(component.properties.content.class, option.value), component, onPropertyChange)}
      />
      <UI.Select
        wrapperClass="!h-14"
        label={{ name: $t('constructor.props.textcolors') }}
        type="buttons"
        options={$optionsStore.TEXT_COLOR_OPTIONS}
        value={initialColor}
        onUpdate={(option) => updateProperty('wrapperClass', twMerge(component.properties.wrapperClass, option.value), component, onPropertyChange)}
      />
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <UI.Switch
        label={{ name: $t('constructor.props.bold') }}
        value={initialBold ? 2 : 1}
        onChange={(value) =>
          updateProperty(
            'content.class',
            `${component.properties.content.class} ${value === 2 ? 'font-bold' : 'font-normal'}`,
            component,
            onPropertyChange,
          )}
      />
      <UI.Switch
        label={{ name: $t('constructor.props.italic') }}
        value={initialItalic ? 2 : 1}
        onChange={(value) =>
          updateProperty(
            'content.class',
            `${component.properties.content.class} ${value === 2 ? 'italic' : 'not-italic'}`,
            component,
            onPropertyChange,
          )}
      />
      <UI.Switch
        label={{ name: $t('constructor.props.background') }}
        value={component.properties.background ? 2 : 1}
        onChange={(value) => updateProperty('background', value === 2, component, onPropertyChange)}
      />
    </div>
  </div>
{/if}
