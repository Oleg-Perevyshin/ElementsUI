<!-- $lib/ElementsUI/AccordionProps.svelte -->
<script lang="ts">
  import { t } from "$lib/locales/i18n"
  import { updateProperty, type IAccordionProps, type IUIComponentHandler, type UIComponent } from "../types"
  import * as UI from "$lib"
  import { optionsStore } from "../options"
  import { ICONS } from "../icons"
  import Button from "$lib/Button/Button.svelte"
  import CrossIcon from "$lib/libIcons/CrossIcon.svelte"
  import CommonSnippets from "$lib/CommonSnippets.svelte"

  const {
    component,
    onPropertyChange,
    forConstructor = true,
  } = $props<{
    component: UIComponent & { properties: Partial<IAccordionProps> }
    onPropertyChange: (updates: Partial<{ properties?: string | object; name?: string; access?: string; eventHandler?: IUIComponentHandler }>) => void
    forConstructor?: boolean
  }>()

  const initialAlign = $derived(
    $optionsStore.JUSTIFY_ALIGN_OPTIONS.find((a) =>
      (a.value as string).includes(component.properties.label?.class?.split(" ").find((cls: string) => cls.startsWith("justify-"))),
    ),
  )

  const handleImageUpload = (event: Event) => {
    const input = event.target as HTMLInputElement
    if (!input.files || input.files.length === 0) return

    const file = input.files[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64String = e.target?.result as string
      updateProperty("image", base64String, component, onPropertyChange)
    }
    reader.readAsDataURL(file)
  }

  let currentImage = $derived(component.properties.image ?? "")
</script>

{#snippet AccordionBackgroundImage()}
  <div class="flex items-center">
    <UI.FileAttach
      type="image"
      label={{ name: $t("constructor.props.image") }}
      accept="image/png, image/jpeg, image/webp"
      bind:currentImage
      onChange={handleImageUpload}
    />
    {#if currentImage}
      <Button
        wrapperClass="w-8.5 mt-6"
        componentClass="p-0.5 bg-red"
        content={{ icon: CrossIcon }}
        onClick={() => {
          updateProperty("image", "", component, onPropertyChange)
        }}
      />
    {/if}
  </div>
{/snippet}

{#snippet AccordionSize()}
  <div class="flex w-full gap-4">
    <UI.Input
      label={{ name: $t("constructor.props.size.height") }}
      value={component.properties.size.height}
      onUpdate={(value) => updateProperty("size.height", value as number, component, onPropertyChange)}
      number={{ minNum: 1, maxNum: 1000, step: 1 }}
      type="number"
    />
    <UI.Input
      label={{ name: $t("constructor.props.size.width") }}
      value={component.properties.size.width}
      onUpdate={(value) => updateProperty("size.width", value as number, component, onPropertyChange)}
      number={{ minNum: 1, maxNum: 1000, step: 1 }}
      type="number"
    />
  </div>
{/snippet}

{#snippet AccordionIsOpen()}
  <UI.Switch
    label={{ name: $t("constructor.props.open") }}
    value={component.properties.isOpen}
    options={[{ id: crypto.randomUUID(), value: 0, class: "" }]}
    onChange={(value) => updateProperty("isOpen", value, component, onPropertyChange)}
  />
{/snippet}

{#if forConstructor}
  <div class="flex items-start justify-center gap-8">
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Access" {component} {onPropertyChange} />
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Label" {component} {onPropertyChange} />
      <CommonSnippets snippet="LabelAlign" initialValue={initialAlign} {component} {onPropertyChange} />
      <CommonSnippets
        snippet="IconsLib"
        initialValue={{
          name: $t("constructor.props.labelicon"),
          icon: component.properties.label.icon,
          updateProperty: (icon: string) => updateProperty("label.icon", icon as string, component, onPropertyChange),
          icons: { array: ICONS },
        }}
        {component}
        {onPropertyChange}
      />
    </div>
    <div class="flex w-1/3 flex-col gap-2 items-center px-2">
      {@render AccordionBackgroundImage()}
    </div>
  </div>
{:else}
  <div class="flex items-start justify-center gap-8">
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Identificator" {component} {onPropertyChange} />
      <CommonSnippets snippet="Access" {component} {onPropertyChange} />
      <CommonSnippets snippet="WrapperClass" {component} {onPropertyChange} />
      {@render AccordionSize()}
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Label" {component} {onPropertyChange} />
      <CommonSnippets snippet="LabelClass" initialValue={initialAlign} {component} {onPropertyChange} />
      <CommonSnippets
        snippet="IconsLib"
        initialValue={{
          name: $t("constructor.props.labelicon"),
          icons: { array: ICONS },
          icon: component.properties.label.icon,
          updateProperty: (icon: string) => updateProperty("label.icon", icon as string, component, onPropertyChange),
        }}
        {component}
        {onPropertyChange}
      />
      {@render AccordionIsOpen()}
    </div>
    <div class="flex w-1/3 flex-col items-center gap-2 px-2">
      {@render AccordionBackgroundImage()}
    </div>
  </div>
{/if}
