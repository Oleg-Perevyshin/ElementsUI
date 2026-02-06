<script lang="ts">
  import { getContext, onMount } from "svelte"
  import { t } from "$lib/locales/i18n"
  import { type UIComponent, type ISelectProps, type ISelectOption, updateProperty, type IUIComponentHandler } from "../types"
  import * as UI from "$lib"
  import ButtonDelete from "../libIcons/ButtonDelete.svelte"
  import ButtonAdd from "../libIcons/ButtonAdd.svelte"
  import { optionsStore } from "../options.js"
  import { twMerge } from "tailwind-merge"
  import CommonSnippets from "$lib/CommonSnippets.svelte"

  const {
    component,
    onPropertyChange,
    forConstructor = true,
  } = $props<{
    component: UIComponent & { properties: Partial<ISelectProps> }
    onPropertyChange: (updates: Partial<{ properties?: string | object; name?: string; access?: string; eventHandler?: IUIComponentHandler }>) => void
    forConstructor?: boolean
  }>()

  const DeviceVariables = getContext<{ id: string; value: string; name: string }[]>("DeviceVariables")
  let VARIABLE_OPTIONS = $derived(DeviceVariables && Array.isArray(DeviceVariables) ? DeviceVariables : [])

  let Header: ISelectOption = $derived(
    $optionsStore.HEADER_OPTIONS.find((h) => h.value === component.eventHandler.Header) ?? {
      id: "",
      name: "",
      value: "",
      class: "!w-1/4",
    },
  )

  let currentType = $derived($optionsStore.SELECT_TYPE_OPTIONS.find((t) => t.value === component.properties.type))

  const generateBitOptions = (start: number, end: number) => {
    const bitsNeeded = end - start + 1
    const count = Math.pow(2, bitsNeeded)

    const options: ISelectOption<number>[] = []

    for (let i = 0; i < count; i++) {
      const binary = i.toString(2).padStart(bitsNeeded, "0")

      options.push({
        id: crypto.randomUUID(),
        value: parseInt(binary, 2) << start,
        name: binary,
        class: "bg-max",
      })
    }
    updateProperty("options", options, component, onPropertyChange)
  }

  const initialAlign = $derived(
    $optionsStore.TEXT_ALIGN_OPTIONS.find((a) =>
      (a.value as string).includes(component.properties.label?.class?.split(" ").find((cls: string) => cls.startsWith("text-"))),
    ),
  )
</script>

{#snippet SelectArgument()}
  <UI.Select
    label={{ name: $t("constructor.props.argument") }}
    type="buttons"
    value={$optionsStore.FULL_ARGUMENT_OPTION.find((h) => h.value === component.eventHandler.Argument) ??
      $optionsStore.FULL_ARGUMENT_OPTION.find((h) => h.value === "")}
    options={$optionsStore.FULL_ARGUMENT_OPTION}
    onUpdate={(option) => {
      onPropertyChange({ eventHandler: { Argument: (option as UI.ISelectOption).value as string } })
    }}
  />

  <UI.Input
    wrapperClass="{Header.value === 'SET' ? 'mt-1' : ''} "
    value={component.eventHandler.Argument}
    maxlength={32}
    disabled={component.eventHandler.Argument == "Save" || component.eventHandler.Argument == "NoSave"}
    help={{ info: $t("constructor.props.argument.info"), autocomplete: "on", regExp: /^[a-zA-Z0-9\-_]{0,32}$/ }}
    onUpdate={(value) => onPropertyChange({ eventHandler: { Argument: value as string } })}
  />
{/snippet}

{#snippet SelectType()}
  <UI.Select
    label={{ name: $t("constructor.props.type") }}
    type="buttons"
    value={currentType}
    options={$optionsStore.SELECT_TYPE_OPTIONS}
    onUpdate={(item) => updateProperty("type", (item as UI.ISelectOption).value as string, component, onPropertyChange)}
  />
{/snippet}

{#snippet SelectValueType()}
  <UI.Select
    wrapperClass="h-14"
    label={{ name: $t("constructor.props.valuetype") }}
    type="buttons"
    disabled={component.properties.bitMode}
    options={$optionsStore.SELECT_VALUE_TYPE_OPTIONS}
    value={$optionsStore.SELECT_VALUE_TYPE_OPTIONS.find((t) => t.value === component.properties.valueType)}
    onUpdate={(value) => {
      const options = [...(component.properties?.options || [])]
      const newType = (value as UI.ISelectOption).value ?? "text"
      options.forEach((option) => {
        if (newType === "number") option.value = option.value !== undefined ? Number(option.value) : 0
        else option.value = option.value !== undefined ? String(option.value) : ""
      })
      updateProperty("options", options, component, onPropertyChange)
      updateProperty("valueType", newType, component, onPropertyChange)
    }}
  />
{/snippet}

{#snippet SelectSettings()}
  {#if component.properties.type === "buttons"}
    <UI.Switch
      label={{ name: $t("constructor.props.multiselect") }}
      value={component.properties.multiSelect}
      options={[{ id: crypto.randomUUID(), value: 0, class: "" }]}
      onChange={(value) => {
        updateProperty("multiSelect", value, component, onPropertyChange)
      }}
    />
  {:else}
    <UI.Switch
      label={{ name: $t("constructor.props.bitmode") }}
      value={component.properties.bitMode}
      options={[{ id: crypto.randomUUID(), value: 0, class: "" }]}
      onChange={(value) => {
        updateProperty("bitMode", value, component, onPropertyChange)
        updateProperty("valueType", "number", component, onPropertyChange)
        const options = [...(component.properties?.options || [])]
        const newType = $optionsStore.SELECT_VALUE_TYPE_OPTIONS[1].value
        options.forEach((option) => {
          if (newType === "number") option.value = option.value !== undefined ? Number(option.value) : 0
          else option.value = option.value !== undefined ? String(option.value) : ""
        })
        updateProperty("options", options, component, onPropertyChange)
        if (value) generateBitOptions(component.properties.range.start, component.properties.range.end)
      }}
    />
  {/if}
  {#if component.properties.bitMode}
    <UI.Slider
      label={{ name: $t("constructor.props.range") }}
      type="range"
      number={{ minNum: 0, maxNum: 31, step: 1 }}
      value={[component.properties.range.start, component.properties.range.end]}
      onUpdate={(value) => {
        if (Array.isArray(value)) {
          if (value[1] - value[0] > 6) value = [value[0], value[0] + 6]
          updateProperty("range.start", value[0] as number, component, onPropertyChange)
          updateProperty("range.end", value[1] as number, component, onPropertyChange)
          generateBitOptions(component.properties.range.start, component.properties.range.end)
        }
      }}
    />
  {/if}
{/snippet}

{#snippet SelectOptions()}
  <hr class="border-gray-400" />

  <div class="space-y-4">
    <div class="m-0 flex items-center justify-center gap-2">
      <h4>{$t("constructor.props.options.title")}</h4>
      <UI.Button
        wrapperClass="w-8"
        content={{ icon: ButtonAdd }}
        onClick={() => {
          const newOption: ISelectOption = {
            id: crypto.randomUUID(),
            name: `Option ${component.properties?.options.length + 1}`,
            value: component.properties?.options.length + 1,
            class: "bg-max",
          }
          const options = [...(component.properties?.options || []), newOption]
          updateProperty("options", options, component, onPropertyChange)
        }}
      />
    </div>

    {#each component.properties.options || [] as option, index (option.id)}
      <div class="m-0 flex items-end justify-around gap-2 border-gray-400">
        <UI.Input
          label={{ name: $t("constructor.props.optionname") }}
          wrapperClass="!w-3/10"
          value={option.name}
          onUpdate={(value) => {
            const options = [...(component.properties?.options || [])]
            options[index]["name"] = value
            updateProperty("options", options, component, onPropertyChange)
          }}
        />
        <UI.Input
          label={{ name: $t("constructor.props.optionvalue") }}
          wrapperClass="!w-3/10"
          value={option.value}
          readonly={component.properties.bitMode}
          type={component.properties.valueType}
          onUpdate={(value) => {
            const options = [...(component.properties?.options || [])]
            options[index]["value"] = value
            updateProperty("options", options, component, onPropertyChange)
          }}
        />
        {#if forConstructor}
          <UI.Select
            wrapperClass="w-80 h-14.5"
            label={{ name: $t("constructor.props.colors") }}
            type="buttons"
            options={$optionsStore.COLOR_OPTIONS}
            value={$optionsStore.COLOR_OPTIONS.find((c) => (c.value as string).includes(option.class.split(" ").find((cls: string) => cls.startsWith("bg-"))))}
            onUpdate={(option) => {
              const options = [...(component.properties?.options || [])]
              options[index]["class"] = (option as UI.ISelectOption).value
              updateProperty("options", options, component, onPropertyChange)
            }}
          />
        {:else}
          <UI.Input
            label={{ name: $t("constructor.props.optionclass") }}
            wrapperClass="!w-3/10"
            value={option.class}
            onUpdate={(value) => {
              const options = [...(component.properties?.options || [])]
              options[index]["class"] = value as string
              updateProperty("options", options, component, onPropertyChange)
            }}
          />
        {/if}

        <UI.Button
          wrapperClass="w-8"
          content={{ icon: ButtonDelete }}
          onClick={() => {
            const options = [...(component.properties?.options || [])]
            options.splice(index, 1)
            updateProperty("options", options, component, onPropertyChange)
          }}
        />
      </div>
    {/each}
  </div>
{/snippet}

{#if forConstructor}
  <div class="relative mb-4 flex flex-row items-start justify-center">
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Variable" {VARIABLE_OPTIONS} {component} {onPropertyChange} />
      {@render SelectArgument()}
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Access" {component} {onPropertyChange} />
      {@render SelectType()}
      {@render SelectValueType()}
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Label" {component} {onPropertyChange} />
      <CommonSnippets snippet="LabelAlign" initialValue={initialAlign} {component} {onPropertyChange} />
      {@render SelectSettings()}
    </div>
  </div>
  {@render SelectOptions()}
{:else}
  <div class="relative mb-4 flex flex-row items-start justify-center">
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Identificator" {component} {onPropertyChange} />
      <CommonSnippets snippet="Access" {component} {onPropertyChange} />
      <CommonSnippets snippet="WrapperClass" {component} {onPropertyChange} />
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Label" {component} {onPropertyChange} />
      <CommonSnippets snippet="LabelClass" {component} {onPropertyChange} />
      <CommonSnippets snippet="Disabled" {component} {onPropertyChange} />
    </div>
    <div class="flex w-1/3 flex-col items-center px-2">
      {@render SelectType()}
      {@render SelectValueType()}
      {@render SelectSettings()}
    </div>
  </div>

  {@render SelectOptions()}
{/if}
