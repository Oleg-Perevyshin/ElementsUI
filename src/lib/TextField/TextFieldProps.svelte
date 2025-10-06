<!-- $lib/ElementsUI/GridAccordionProps.svelte -->
<script lang="ts">
  import { t } from '$lib/locales/i18n'
  import type { ITextFieldProps, UIComponent } from '../types'
  import * as UI from '$lib/index'
  import { optionsStore } from '$lib/options'

  const { component, onPropertyChange } = $props<{
    component: UIComponent & { properties: Partial<ITextFieldProps> }
    onPropertyChange: (value: string | object) => void
  }>()

  let currentType = $derived($optionsStore.TEXTFIELD_SIZE_OPTIONS.find((t) => t.value === component.properties.type))

  const initialAlign = $derived(
    $optionsStore.ALIGN_OPTIONS.find((a) =>
      (a.value as string).includes(component.properties.label?.class?.split(' ').find((cls: string) => cls.startsWith('text-'))),
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

  /* Обновление свойства */
  const updateProperty = (path: string, value: string | object | boolean) => {
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
    <div class="flex w-1/3 flex-col px-2">
      <UI.Input
        label={{ name: $t('constructor.props.label') }}
        value={component.properties.label.name}
        onUpdate={(value) => updateProperty('label.name', value as string)}
        type="text"
      />
      <UI.Select
        label={{ name: $t('constructor.props.type') }}
        type="buttons"
        value={currentType}
        options={$optionsStore.TEXTFIELD_SIZE_OPTIONS}
        onUpdate={(item) => updateProperty('type', item.value as string)}
      />
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <UI.Select
        wrapperClass="w-full"
        label={{ name: $t('constructor.props.align') }}
        type="buttons"
        value={initialAlign}
        options={$optionsStore.ALIGN_OPTIONS}
        onUpdate={(option) => handleLabelAlign(option.value as string)}
      />
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <UI.Switch
        wrapperClass="w-full bg-blue"
        label={{ name: $t('constructor.props.bold') }}
        value={component.properties.bold ? 2 : 1}
        onChange={(value) => updateProperty('bold', value === 2)}
      />
      <UI.Switch
        wrapperClass="w-full bg-blue"
        label={{ name: $t('constructor.props.italic') }}
        value={component.properties.italic ? 2 : 1}
        onChange={(value) => updateProperty('italic', value === 2)}
      />
    </div>
  </div>
{/if}
