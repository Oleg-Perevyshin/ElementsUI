<script lang="ts">
  import { getContext, onMount } from "svelte"
  import { t } from "$lib/locales/i18n"
  import { type UIComponent, type ISelectProps, type IOption, updateProperty, type IUIComponentHandler } from "../types"
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

  let itemsContainer: HTMLDivElement | null = $state(null)

  type ValueTypeOption = {
    id: string
    value: "text" | "number"
    name: string
    class: string
  }
  let currentValueType = $derived(
    !component.properties.options[0]
      ? ($optionsStore.SELECT_VALUE_TYPE_OPTIONS[0] as ValueTypeOption)
      : typeof component.properties.options[0].value === "number"
        ? $optionsStore.SELECT_VALUE_TYPE_OPTIONS[1]
        : ($optionsStore.SELECT_VALUE_TYPE_OPTIONS[0] as ValueTypeOption),
  )

  let Header: IOption = $derived(
    $optionsStore.HEADER_OPTIONS.find((h) => h.value === component.eventHandler.Header) ?? {
      id: "",
      name: "",
      value: "",
      class: "!w-1/4",
    },
  )

  let currentType = $derived($optionsStore.SELECT_TYPE_OPTIONS.find((t) => t.value === component.properties.type))

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
      onPropertyChange({ eventHandler: { Argument: (option as UI.IOption).value as string } })
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
    onUpdate={(item) => updateProperty("type", (item as UI.IOption).value as string, component, onPropertyChange)}
  />
{/snippet}

{#snippet SelectValueType()}
  <UI.Select
    wrapperClass="h-14"
    label={{ name: $t("constructor.props.valuetype") }}
    type="buttons"
    disabled={component.properties.bitMode}
    options={$optionsStore.SELECT_VALUE_TYPE_OPTIONS}
    value={currentValueType}
    onUpdate={(value) => {
      currentValueType = value as ValueTypeOption
      const options = [...(component.properties?.options || [])]
      const newType = !Array.isArray(value) ? value.value : value[0].value
      options.forEach((option) => {
        if (newType === "number") option.value = option.value !== undefined ? Number(option.value) : 0
        else option.value = option.value !== undefined ? String(option.value) : ""
      })
      updateProperty("options", options, component, onPropertyChange)
    }}
  />
{/snippet}

{#snippet SelectSettings()}
  <UI.Switch
    label={{ name: $t("constructor.props.bitMode") }}
    value={component.properties.bitMode}
    options={[{ id: crypto.randomUUID(), value: 0, class: "" }]}
    onChange={(value) => {
      updateProperty("bitMode", value, component, onPropertyChange)
      const options = [...(component.properties?.options || [])]
      const newType = $optionsStore.SELECT_VALUE_TYPE_OPTIONS[1].value
      options.forEach((option) => {
        if (newType === "number") option.value = option.value !== undefined ? Number(option.value) : 0
        else option.value = option.value !== undefined ? String(option.value) : ""
      })
      updateProperty("options", options, component, onPropertyChange)
    }}
  />

  {#if component.properties.type === "buttons" && !component.properties.bitMode}
    <UI.Switch
      label={{ name: $t("constructor.props.multiselect") }}
      value={component.properties.multiSelect}
      options={[{ id: crypto.randomUUID(), value: 0, class: "" }]}
      onChange={(value) => {
        updateProperty("multiSelect", value, component, onPropertyChange)
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
          updateProperty("range.start", value[0] as number, component, onPropertyChange)
          updateProperty("range.end", value[1] as number, component, onPropertyChange)
        }
      }}
    />
  {/if}
{/snippet}

{#snippet SelectOptions()}
  <hr class="border-gray-400" />

  <div class="space-y-4" bind:this={itemsContainer}>
    <div class="m-0 flex items-center justify-center gap-2">
      <h4>{$t("constructor.props.options.title")}</h4>
      <UI.Button
        wrapperClass="w-8"
        content={{ icon: ButtonAdd }}
        onClick={() => {
          const newOption: IOption = {
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
      <div id="item-{index}" class="m-0 flex items-end justify-around gap-2 border-gray-400">
        <UI.Dragging
          wrapperClass="w-9"
          container={itemsContainer}
          array={component.properties.options}
          elementIndex={index}
          onUpdate={(updatedArray) => {
            updateProperty("options", updatedArray, component, onPropertyChange)
          }}
        />
        <UI.Input
          label={{ name: $t("constructor.props.optionname") }}
          wrapperClass="w-3/10"
          value={option.name}
          onUpdate={(value) => {
            const options = [...(component.properties?.options || [])]
            options[index]["name"] = value
            updateProperty("options", options, component, onPropertyChange)
          }}
        />
        <UI.Input
          label={{ name: $t("constructor.props.optionvalue") }}
          wrapperClass="w-3/10"
          value={option.value}
          type={currentValueType.value}
          number={{ minNum: 0, maxNum: Math.pow(2, component.properties.range.end - component.properties.range.start + 1), step: 1 }}
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
              options[index]["class"] = (option as UI.IOption).value
              updateProperty("options", options, component, onPropertyChange)
            }}
          />
        {:else}
          <UI.Input
            label={{ name: $t("constructor.props.optionclass") }}
            wrapperClass="w-3/10"
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
    <div id="item-{component.properties.options.length}" class="min-h-4"></div>
  </div>
{/snippet}

{#if forConstructor}
  <div class="relative mb-4 flex flex-row items-start justify-center">
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Access" {component} {onPropertyChange} />
      <CommonSnippets snippet="Variable" {VARIABLE_OPTIONS} {component} {onPropertyChange} />
      {@render SelectArgument()}
    </div>
    <div class="flex w-1/3 flex-col px-2">
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
