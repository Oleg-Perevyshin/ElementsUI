<!-- $lib/ElementsUI/AccordionProps.svelte -->
<script lang="ts">
  import { t } from '$lib/locales/i18n'
  import { updateProperty, type IAccordionProps, type UIComponent } from '../types'
  import * as UI from '$lib'
  import { optionsStore } from '../options'
  import { fly } from 'svelte/transition'
  import { ICONS } from './icons'

  const { component, onPropertyChange } = $props<{
    component: UIComponent & { properties: Partial<IAccordionProps> }
    onPropertyChange: (value: string | object) => void
  }>()

  let showIconLib = $state(true)

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

  let currentImage = $derived(component.properties.image)
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
    <div class="flex w-1/3 flex-col items-center gap-6 px-2">
      <UI.Select
        label={{ name: $t('constructor.props.type') }}
        type="buttons"
        value={initialType}
        options={$optionsStore.ACCORDION_TYPE_OPTIONS}
        onUpdate={(item) => updateProperty('outline', item.value as boolean, component, onPropertyChange)}
      />
      <div class="relative w-full">
        <UI.Button content={{ name: 'Иконка заголовка' }} onClick={() => (showIconLib = !showIconLib)} />
        {#if showIconLib}
          <div
            transition:fly={{ duration: 350 }}
            class="emoji-container absolute right-6 bottom-full z-10 m-2 flex max-h-60 max-w-md flex-wrap gap-1 overflow-auto rounded-2xl bg-[var(--field-color)] p-2 shadow-lg"
          >
            {#each ICONS as icon}
              <button
                class="h-8 w-8 cursor-pointer [&_svg]:h-full [&_svg]:max-h-full [&_svg]:w-full [&_svg]:max-w-full"
                onclick={() => {
                  updateProperty('label.icon', icon as string, component, onPropertyChange)
                }}
              >
                {@html icon}
              </button>
            {/each}
          </div>
        {/if}
      </div>
    </div>
    <div class="flex w-1/3 flex-col items-center gap-2 px-2">
      <UI.FileAttach
        type="image"
        label={{ name: $t('constructor.props.image') }}
        accept="image/png, image/jpeg, image/webp"
        bind:currentImage
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
