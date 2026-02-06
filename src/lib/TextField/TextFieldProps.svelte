<script lang="ts">
  import { t } from "$lib/locales/i18n"
  import { updateProperty, type ITextFieldProps, type IUIComponentHandler, type UIComponent } from "../types"
  import * as UI from "$lib/index"
  import { optionsStore } from "$lib/options"
  import { getContext } from "svelte"
  import { twMerge } from "tailwind-merge"
  import CommonSnippets from "$lib/CommonSnippets.svelte"

  const {
    component,
    onPropertyChange,
    forConstructor = true,
  } = $props<{
    component: UIComponent & { properties: Partial<ITextFieldProps> }
    onPropertyChange: (updates: Partial<{ properties?: string | object; name?: string; access?: string; eventHandler?: IUIComponentHandler }>) => void
    forConstructor?: boolean
  }>()
  const DeviceVariables = getContext<{ id: string; value: string; name: string }[]>("DeviceVariables")
  let VARIABLE_OPTIONS = $derived(DeviceVariables && Array.isArray(DeviceVariables) ? DeviceVariables : [])

  let currentType = $derived($optionsStore.TEXTFIELD_SIZE_OPTIONS.find((t) => t.value === component.properties.content.size))

  const initialAlign = $derived(
    $optionsStore.TEXT_ALIGN_OPTIONS.find((a) =>
      (a.value as string).includes(component.properties.content?.class?.split(" ").find((cls: string) => cls.startsWith("text-"))),
    ),
  )
  const initialColor = $derived(
    $optionsStore.TEXT_COLOR_OPTIONS.find((c) =>
      (c.value as string).includes(component.properties.wrapperClass?.split(" ").find((cls: string) => cls.startsWith("text-"))),
    ),
  )
</script>

{#snippet TextFieldSize()}
  <UI.Select
    label={{ name: $t("constructor.props.size") }}
    type="buttons"
    value={currentType}
    options={$optionsStore.TEXTFIELD_SIZE_OPTIONS}
    onUpdate={(item) => updateProperty("content.size", (item as UI.ISelectOption).value as string, component, onPropertyChange)}
  />
{/snippet}

{#snippet TextFieldName()}
  <UI.Input
    label={{ name: $t("constructor.props.label") }}
    value={component.properties.content.name}
    onUpdate={(value) => updateProperty("content.name", value as string, component, onPropertyChange)}
  />
{/snippet}

{#snippet TextFieldColors()}
  <UI.Select
    wrapperClass="!h-14"
    label={{ name: $t("constructor.props.textcolors") }}
    type="buttons"
    options={$optionsStore.TEXT_COLOR_OPTIONS}
    value={initialColor}
    onUpdate={(option) =>
      updateProperty("wrapperClass", twMerge(component.properties.wrapperClass, (option as UI.ISelectOption).value as string), component, onPropertyChange)}
  />
{/snippet}

{#snippet TextFieldSettings()}
  <UI.Select
    label={{ name: $t("constructor.props.textfield.settings") }}
    type="buttons"
    multiSelect={true}
    value={$optionsStore.TEXTFIELD_SETTINGS_OPTIONS.filter((opt) => {
      if (component.properties.content.class.includes(`${opt.value}`) && !component.properties.content.class.includes(`not-${opt.value}`)) return opt
      if (opt.value == "background" && component.properties.background) return opt
    })}
    options={$optionsStore.TEXTFIELD_SETTINGS_OPTIONS}
    onUpdate={(value) => {
      const currentActiveValues = $optionsStore.TEXTFIELD_SETTINGS_OPTIONS.filter((opt) => {
        if (!opt?.value) return false
        const currentValue =
          (component.properties.content.class.includes(`${opt.value}`) && !component.properties.content.class.includes(`not-${opt.value}`)) ||
          (opt.value == "background" && component.properties.background)
        return currentValue === true
      }).map((opt) => opt.value)
      if (Array.isArray(value)) {
        value.forEach((opt) => {
          if (opt?.value === "background") {
            updateProperty("background", true, component, onPropertyChange)
          } else {
            updateProperty(
              "content.class",
              twMerge(`${component.properties.content.class} ${opt.value === "bold" ? "font-bold" : "italic"}`),
              component,
              onPropertyChange,
            )
          }
        })

        currentActiveValues.forEach((activeValue) => {
          if (!value.some((opt) => opt?.value === activeValue)) {
            if (activeValue === "background") {
              updateProperty("background", false, component, onPropertyChange)
            } else {
              updateProperty(
                "content.class",
                twMerge(`${component.properties.content.class} ${activeValue === "bold" ? "font-normal" : "not-italic"}`),
                component,
                onPropertyChange,
              )
            }
          }
        })
      }
    }}
  />
{/snippet}

{#snippet TextFieldComponentClass()}
  <UI.Input
    label={{ name: $t("constructor.props.componentclass") }}
    value={component.properties.content.class}
    onUpdate={(value) => updateProperty("content.class", value as string, component, onPropertyChange)}
  />
{/snippet}

{#if forConstructor}
  <div class="relative flex flex-row items-start justify-center">
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Variable" {VARIABLE_OPTIONS} {component} {onPropertyChange} />
      {@render TextFieldName()}
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="LabelAlign" initialValue={initialAlign} {component} {onPropertyChange} />
      {@render TextFieldColors()}
    </div>
    <div class="flex w-1/3 flex-col px-2">
      {@render TextFieldSize()}
      {@render TextFieldSettings()}
    </div>
  </div>
{:else}
  <div class="relative flex flex-row items-start justify-center">
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Identificator" {component} {onPropertyChange} />
      {@render TextFieldName()}
    </div>
    <div class="flex w-1/3 flex-col px-2">
      {@render TextFieldComponentClass()}
      <CommonSnippets snippet="LabelClass" {component} {onPropertyChange} />
      {@render TextFieldColors()}
    </div>
    <div class="flex w-1/3 flex-col px-2">
      {@render TextFieldSize()}

      {@render TextFieldSettings()}
    </div>
  </div>
{/if}
