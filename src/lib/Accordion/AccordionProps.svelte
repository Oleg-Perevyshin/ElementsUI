<!-- $lib/ElementsUI/AccordionProps.svelte -->
<script lang="ts">
  import { t } from '../locales/i18n'
  import type { IAccordionProps, UIComponent } from '../types'
  import * as UI from '../index'
  import { optionsStore } from '../options'

  const { component, onPropertyChange } = $props<{
    component: UIComponent & { properties: Partial<IAccordionProps> }
    onPropertyChange: (value: string | object) => void
  }>()

  let currentType = $derived($optionsStore.ACCORDION_TYPE_OPTIONS.find((t) => t.value === component.properties.type))

  /* Обновление свойства */
  const updateProperty = (path: string, value: string | object) => {
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

  const handleImageUpload = (event: Event) => {
    const input = event.target as HTMLInputElement
    if (!input.files || input.files.length === 0) return

    const file = input.files[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64String = e.target?.result as string
      updateProperty('image', base64String)
    }
    reader.readAsDataURL(file)
  }
</script>

{#if component && component.properties}
  <div class="flex items-center justify-center gap-8">
    <UI.Input
      label={{ name: $t('service.constructor.props.label') }}
      wrapperClass="!w-1/3"
      value={component.properties.label.name}
      onUpdate={(value) => updateProperty('label.name', value as string)}
      type="text"
    />
    <UI.Select
      wrapperClass="!w-1/3"
      label={{ name: $t('service.constructor.props.type') }}
      type="buttons"
      value={currentType}
      options={$optionsStore.ACCORDION_TYPE_OPTIONS}
      onUpdate={(item) => updateProperty('type', item.value as string)}
    />
    <UI.FileAttach
      type="image"
      label={{ name: $t('service.constructor.props.image') }}
      accept="image/png, image/jpeg, image/webp"
      onChange={handleImageUpload}
    />
    <UI.Button name={$t('service.constructor.props.removeimage')} wrapperClass="!w-auto" componentClass="px-4" onClick={() => updateProperty('image', '')} />
  </div>
{/if}
