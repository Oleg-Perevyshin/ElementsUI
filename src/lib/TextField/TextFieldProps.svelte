<script lang="ts">
  import TextsEditor from "../TextsEditor.svelte"
  import { T } from "$lib/locales/i18n"
  import { findOptionByClass, updateProperty, type ITextFieldProps, type IUIComponentHandler, type UIComponent } from "../types"
  import * as UI from "$lib/index"
  import { optionsStore, findColorOption } from "$lib/options"
  import { getContext } from "svelte"
  import { twMerge } from "tailwind-merge"
  import CommonSnippets from "$lib/CommonSnippets.svelte"
  import PropsGroup from "$lib/PropsGroup.svelte"

  const {
    component,
    onPropertyChange,
    forConstructor = true,
  }: {
    component: UIComponent & { properties: Partial<ITextFieldProps> }
    onPropertyChange: (updates: Partial<{ properties?: string | object; name?: string; access?: string; eventHandler?: IUIComponentHandler }>) => void
    forConstructor?: boolean
  } = $props()
  const DeviceVariables = getContext<{ id: string; value: string; name: string }[]>("DeviceVariables")
  let VARIABLE_OPTIONS = $derived(DeviceVariables && Array.isArray(DeviceVariables) ? DeviceVariables : [])

  const contentClass = $derived(component.properties.content?.class ?? "")
  let currentType = $derived($optionsStore.TEXTFIELD_SIZE_OPTIONS.find((t) => t.value === component.properties.content?.size))

  const initialAlign = $derived(findOptionByClass($optionsStore.TEXT_ALIGN_OPTIONS, component.properties.content?.class, "text-"))
  const initialColor = $derived(findColorOption($optionsStore.TEXT_COLOR_OPTIONS, component.properties.wrapperClass, "text-"))
</script>

{#snippet TextFieldSize()}
  <UI.Select
    label={{ name: $T("constructor.props.size") }}
    type="buttons"
    value={currentType}
    options={$optionsStore.TEXTFIELD_SIZE_OPTIONS}
    onUpdate={(item) => updateProperty("content.size", (item as UI.IOption).value as string, component, onPropertyChange)}
  />
{/snippet}

{#snippet TextFieldName()}
  <TextsEditor {component} {onPropertyChange} />
{/snippet}

{#snippet TextFieldColors()}
  <UI.Select
    label={{ name: $T("constructor.props.textcolors") }}
    type="buttons"
    options={$optionsStore.TEXT_COLOR_OPTIONS}
    value={initialColor}
    onUpdate={(option) =>
      updateProperty("wrapperClass", twMerge(component.properties.wrapperClass, (option as UI.IOption).value as string), component, onPropertyChange)}
  />
{/snippet}

{#snippet TextFieldSettings()}
  <UI.Select
    label={{ name: $T("constructor.props.textfield.settings") }}
    type="buttons"
    multiSelect={true}
    value={$optionsStore.TEXTFIELD_SETTINGS_OPTIONS.filter((opt) => {
      if (contentClass.includes(`${opt.value}`) && !contentClass.includes(`not-${opt.value}`)) return opt
      if (opt.value == "background" && component.properties.background) return opt
      if (opt.value == "underline" && component.properties.underline) return opt
    })}
    options={$optionsStore.TEXTFIELD_SETTINGS_OPTIONS}
    onUpdate={(value) => {
      const currentActiveValues = $optionsStore.TEXTFIELD_SETTINGS_OPTIONS.filter((opt) => {
        if (!opt?.value) return false
        return (
          (contentClass.includes(`${opt.value}`) && !contentClass.includes(`not-${opt.value}`)) ||
          (opt.value == "background" && component.properties.background) ||
          (opt.value == "underline" && component.properties.underline)
        )
      }).map((opt) => opt.value)
      if (Array.isArray(value)) {
        value.forEach((opt) => {
          opt?.value === "background"
            ? updateProperty("background", true, component, onPropertyChange)
            : opt?.value === "underline"
              ? updateProperty("underline", true, component, onPropertyChange)
              : updateProperty("content.class", twMerge(`${contentClass} ${opt.value === "bold" ? "font-bold" : "italic"}`), component, onPropertyChange)
        })

        currentActiveValues.forEach((activeValue) => {
          if (!value.some((opt) => opt?.value === activeValue)) {
            activeValue === "background"
              ? updateProperty("background", false, component, onPropertyChange)
              : activeValue === "underline"
                ? updateProperty("underline", false, component, onPropertyChange)
                : updateProperty(
                    "content.class",
                    twMerge(`${contentClass} ${activeValue === "bold" ? "font-normal" : "not-italic"}`),
                    component,
                    onPropertyChange,
                  )
          }
        })
      }
    }}
  />
{/snippet}

{#snippet TextFieldComponentClass()}
  <UI.Input
    label={{ name: $T("constructor.props.componentclass") }}
    value={contentClass}
    onUpdate={(value) => updateProperty("content.class", value as string, component, onPropertyChange)}
  />
{/snippet}

{#if forConstructor}
  <div class="flex flex-col gap-2">
    <PropsGroup label={$T("constructor.props.group.general")}>
      <CommonSnippets snippet="Access" {component} {onPropertyChange} />
      <CommonSnippets snippet="Variable" {VARIABLE_OPTIONS} {component} {onPropertyChange} />
    </PropsGroup>
    <PropsGroup label={$T("constructor.props.group.content")}>
      {@render TextFieldName()}
      <CommonSnippets snippet="LabelAlign" initialValue={initialAlign} {component} {onPropertyChange} />
      {@render TextFieldColors()}
    </PropsGroup>
    <PropsGroup label={$T("constructor.props.group.appearance")}>
      {@render TextFieldSize()}
      {@render TextFieldSettings()}
    </PropsGroup>
  </div>
{:else}
  <div class="flex flex-col gap-2">
    <PropsGroup label={$T("constructor.props.group.general")}>
      <CommonSnippets snippet="Identificator" {component} {onPropertyChange} />
      <CommonSnippets snippet="Access" {component} {onPropertyChange} />
      {@render TextFieldName()}
    </PropsGroup>
    <PropsGroup label={$T("constructor.props.group.content")}>
      {@render TextFieldComponentClass()}
      <CommonSnippets snippet="LabelClass" {component} {onPropertyChange} />
      {@render TextFieldColors()}
    </PropsGroup>
    <PropsGroup label={$T("constructor.props.group.appearance")}>
      {@render TextFieldSize()}
      {@render TextFieldSettings()}
    </PropsGroup>
  </div>
{/if}
