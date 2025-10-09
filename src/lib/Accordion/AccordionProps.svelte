<!-- $lib/ElementsUI/AccordionProps.svelte -->
<script lang="ts">
  import { t } from '$lib/locales/i18n'
  import { updateProperty, type IAccordionProps, type UIComponent } from '../types'
  import * as UI from '$lib'
  import { optionsStore } from '../options'

  const { component, onPropertyChange } = $props<{
    component: UIComponent & { properties: Partial<IAccordionProps> }
    onPropertyChange: (value: string | object) => void
  }>()

  const initialType = $derived($optionsStore.ACCORDION_TYPE_OPTIONS.find((t) => t.value === component.properties.outline))

  const initialAlign = $derived(
    $optionsStore.ALIGN_OPTIONS.find((a) =>
      (a.value as string).includes(component.properties.label?.class?.split(' ').find((cls: string) => cls.startsWith('text-'))),
    ),
  )

  const handleImageUpload = (event: Event) => {
    const input = event.target as HTMLInputElement
    if (!input.files || input.files.length === 0) return

    const file = input.files[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64String = e.target?.result as string
      updateProperty('image', base64String, component, onPropertyChange)
    }
    reader.readAsDataURL(file)
  }
</script>

{#if component && component.properties}
  <div class="flex items-center justify-center gap-8">
    <div class="flex w-1/3 flex-col items-center px-2">
      <UI.Input
        label={{ name: $t('constructor.props.label') }}
        value={component.properties.label.name}
        onUpdate={(value) => updateProperty('label.name', value as string, component, onPropertyChange)}
        type="text"
      />
      <UI.Select
        label={{ name: $t('constructor.props.align') }}
        type="buttons"
        value={initialAlign}
        options={$optionsStore.ALIGN_OPTIONS}
        onUpdate={(option) => updateProperty('label.class', option.value as string, component, onPropertyChange)}
      />
    </div>
    <div class="flex w-1/3 flex-col items-center px-2">
      <UI.Select
        label={{ name: $t('constructor.props.type') }}
        type="buttons"
        value={initialType}
        options={$optionsStore.ACCORDION_TYPE_OPTIONS}
        onUpdate={(item) => updateProperty('outline', item.value as boolean, component, onPropertyChange)}
      />
    </div>
    <div class="flex w-1/3 flex-col items-center gap-2 px-2">
      <UI.FileAttach
        type="image"
        label={{ name: $t('constructor.props.image') }}
        accept="image/png, image/jpeg, image/webp"
        bind:currentImage={component.properties.image}
        onChange={handleImageUpload}
      />
      <UI.Button
        content={{ name: $t('constructor.props.removeimage') }}
        wrapperClass="!w-auto"
        onClick={() => updateProperty('image', '', component, onPropertyChange)}
      />
    </div>
  </div>
{/if}
