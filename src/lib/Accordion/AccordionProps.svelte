<!-- $lib/Accordion/AccordionProps.svelte - панель свойств конструктора для Accordion -->
<script lang="ts">
  import { T } from "../locales/i18n"
  import type { IAccordionProps, UIComponent } from "../types"
  import { createPropsEditor, type PropertyChange } from "../propsEditor"
  import * as UI from ".."
  import { ICONS } from "../icons"
  import CrossIcon from "../libIcons/CrossIcon.svelte"
  import CommonSnippets from "../CommonSnippets.svelte"
  import PropsGroup from "../PropsGroup.svelte"

  const {
    component,
    onPropertyChange,
  }: {
    component: UIComponent<"Accordion">
    onPropertyChange: (change: PropertyChange<IAccordionProps>) => void
  } = $props()

  const edit = $derived(createPropsEditor(component, onPropertyChange))

  /* Фон - картинка в data URL прямо в свойствах */
  const setImage = (file: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => edit.set("image", String(reader.result))
    reader.readAsDataURL(file)
  }
</script>

<div class="flex flex-col gap-2">
  <PropsGroup label={$T("constructor.props.group.general")}>
    <CommonSnippets snippet="Access" {component} {onPropertyChange} />
  </PropsGroup>
  <PropsGroup label={$T("constructor.props.group.content")}>
    <CommonSnippets snippet="Label" {component} {onPropertyChange} />
    <CommonSnippets snippet="LabelAlign" {component} {onPropertyChange} />
    <CommonSnippets
      snippet="IconsLib"
      initialValue={{
        name: $T("constructor.props.labelicon"),
        icon: component.properties.label?.icon,
        onUpdate: (icon: string) => edit.patch("label", { icon }),
        icons: { array: ICONS },
      }}
      {component}
      {onPropertyChange}
    />
  </PropsGroup>
  <PropsGroup label={$T("constructor.props.group.appearance")} contentClass="items-center">
    <CommonSnippets snippet="Accent" {component} {onPropertyChange} />
    <UI.Switch
      type="checkbox"
      label={{ name: $T("constructor.props.accordion.stripe") }}
      help={{ info: $T("constructor.props.accordion.stripe.info") }}
      value={component.properties.stripe ? 1 : 0}
      onUpdate={(value) => edit.set("stripe", value === 1)}
    />
    <UI.Switch
      type="checkbox"
      label={{ name: $T("constructor.props.accordion.outline") }}
      help={{ info: $T("constructor.props.accordion.outline.info") }}
      value={component.properties.outline === false ? 0 : 1}
      disabled={!!component.properties.stripe}
      onUpdate={(value) => edit.set("outline", value === 1)}
    />
    <div class="flex items-center">
      <UI.FileAttach
        type="image"
        label={{ name: $T("constructor.props.image") }}
        help={{ info: $T("constructor.props.accordion.image.info") }}
        accept="image/png, image/jpeg, image/webp"
        currentImage={component.properties.image ?? ""}
        onUpdate={setImage}
      />
      {#if component.properties.image}
        <UI.Button wrapperClass="w-8 mt-6" variant="primary" accent="red" content={{ icon: CrossIcon }} onClick={() => edit.set("image", "")} />
      {/if}
    </div>
  </PropsGroup>
</div>
