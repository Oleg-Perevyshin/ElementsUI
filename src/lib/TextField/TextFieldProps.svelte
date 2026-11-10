<!-- $lib/TextField/TextFieldProps.svelte - панель свойств конструктора для TextField -->
<script lang="ts">
  import { getContext } from "svelte"
  import TextsEditor from "../TextsEditor.svelte"
  import { T } from "../locales/i18n"
  import type { ITextFieldProps, UIComponent } from "../types"
  import { createPropsEditor, type PropertyChange } from "../propsEditor"
  import * as UI from ".."
  import { optionsStore } from "../options"
  import { twMerge } from "tailwind-merge"
  import CommonSnippets from "../CommonSnippets.svelte"
  import PropsGroup from "../PropsGroup.svelte"

  const {
    component,
    onPropertyChange,
  }: {
    component: UIComponent<"TextField">
    onPropertyChange: (change: PropertyChange<ITextFieldProps>) => void
  } = $props()

  const edit = $derived(createPropsEditor(component, onPropertyChange))
  const VARIABLE_OPTIONS = getContext<{ id: string; value: string; name: string }[] | undefined>("DeviceVariables") ?? []

  /* Жирный и курсив - классы текста, фон и подчёркивание - флаги */
  const contentClass = $derived(component.properties.content?.class ?? "")
  const settings = $derived(
    [
      contentClass.split(" ").includes("font-bold") && "bold",
      contentClass.split(" ").includes("italic") && "italic",
      component.properties.background && "background",
      component.properties.underline && "underline",
    ].filter(Boolean) as string[],
  )
  const setSettings = (values: string[]) =>
    onPropertyChange({
      properties: {
        background: values.includes("background"),
        underline: values.includes("underline"),
        content: {
          ...component.properties.content,
          class: twMerge(contentClass, values.includes("bold") ? "font-bold" : "font-normal", values.includes("italic") ? "italic" : "not-italic"),
        },
      },
    })
</script>

<div class="flex flex-col gap-2">
  <PropsGroup label={$T("constructor.props.group.general")}>
    <CommonSnippets snippet="Access" {component} {onPropertyChange} />
    <CommonSnippets snippet="Variable" {VARIABLE_OPTIONS} {component} {onPropertyChange} />
  </PropsGroup>
  <PropsGroup label={$T("constructor.props.group.content")}>
    <TextsEditor {component} {onPropertyChange} />
    <CommonSnippets snippet="LabelAlign" {component} {onPropertyChange} />
    <CommonSnippets snippet="Accent" {component} {onPropertyChange} />
  </PropsGroup>
  <PropsGroup label={$T("constructor.props.group.appearance")}>
    <UI.Select
      label={{ name: $T("constructor.props.size") }}
      type="buttons"
      value={component.properties.content?.size}
      options={$optionsStore.TEXTFIELD_SIZE_OPTIONS}
      onUpdate={(size) => edit.patch("content", { size })}
    />
    <UI.Select
      label={{ name: $T("constructor.props.textfield.settings") }}
      type="buttons"
      multiSelect
      value={settings}
      options={$optionsStore.TEXTFIELD_SETTINGS_OPTIONS}
      onUpdate={setSettings}
    />
  </PropsGroup>
</div>
