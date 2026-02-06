<script lang="ts">
  import { getContext } from "svelte"
  import { t } from "$lib/locales/i18n"
  import { type UIComponent, type ISwitchProps, updateProperty, type ISelectOption, type IUIComponentHandler } from "../types"
  import * as UI from "$lib"
  import { optionsStore } from "../options"
  import ButtonDelete from "$lib/libIcons/ButtonDelete.svelte"
  import ButtonAdd from "$lib/libIcons/ButtonAdd.svelte"
  import CommonSnippets from "$lib/CommonSnippets.svelte"

  const {
    component,
    onPropertyChange,
    forConstructor = true,
  } = $props<{
    component: UIComponent & { properties: Partial<ISwitchProps> }
    onPropertyChange: (updates: Partial<{ properties?: string | object; name?: string; access?: string; eventHandler?: IUIComponentHandler }>) => void
    forConstructor?: boolean
  }>()
  const DeviceVariables = getContext<{ id: string; value: string; name: string }[]>("DeviceVariables")
  let VARIABLE_OPTIONS = $derived(DeviceVariables && Array.isArray(DeviceVariables) ? DeviceVariables : [])

  const initialColor = $derived(
    $optionsStore.COLOR_OPTIONS.find((c) =>
      (c.value as string).includes(component.properties.wrapperClass?.split(" ").find((cls: string) => cls.startsWith("bg-"))),
    ),
  )
</script>

{#snippet SwitchType()}
  <UI.Select
    wrapperClass="!h-14"
    label={{ name: $t("constructor.props.type") }}
    disabled={component.properties.bitMode}
    type="buttons"
    options={$optionsStore.SWITCH_OPTIONS}
    value={$optionsStore.SWITCH_OPTIONS.find((option) => option.value == component.properties.type)}
    onUpdate={(option) => updateProperty("type", (option as UI.ISelectOption).value as string, component, onPropertyChange)}
  />
{/snippet}

{#snippet SwitchCaptions()}
  <UI.Input
    label={{ name: $t("constructor.props.caption.left") }}
    value={component.properties.label.captionLeft}
    onUpdate={(value) => updateProperty("label.captionLeft", value as string, component, onPropertyChange)}
  />
  <UI.Input
    label={{ name: $t("constructor.props.caption.right") }}
    value={component.properties.label.captionRight}
    onUpdate={(value) => updateProperty("label.captionRight", value as string, component, onPropertyChange)}
  />
{/snippet}

{#snippet SwitchDisabled()}
  <UI.Switch
    wrapperClass="bg-blue"
    label={{ name: $t("constructor.props.disabled") }}
    value={component.properties.options[0].disabled}
    options={[{ id: crypto.randomUUID(), value: 0, class: "" }]}
    onChange={(value) => {
      const options = [...(component.properties?.options || [])]
      options[0]["disabled"] = value
      updateProperty("options", options, component, onPropertyChange)
    }}
  />
{/snippet}

{#snippet SwitchColors()}
  <UI.Select
    wrapperClass="!h-14"
    label={{ name: $t("constructor.props.colors") }}
    type="buttons"
    options={$optionsStore.COLOR_OPTIONS.filter((option) => option.value !== "bg-max" && option.value !== "bg-gray")}
    value={$optionsStore.COLOR_OPTIONS.find((c) =>
      (c.value as string).includes(component.properties.options[0].class.split(" ").find((cls: string) => cls.startsWith("bg-"))),
    )}
    onUpdate={(option) => {
      const options = [...(component.properties?.options || [])]
      options[0]["class"] = (option as UI.ISelectOption).value
      updateProperty("options", options, component, onPropertyChange)
    }}
  />
{/snippet}

{#snippet SwitchBitmode()}
  <UI.Switch
    wrapperClass="bg-blue"
    label={{ name: $t("constructor.props.bitmode") }}
    value={component.properties.bitMode}
    options={[{ id: crypto.randomUUID(), value: 0, class: "" }]}
    onChange={(value) => {
      updateProperty("bitMode", value, component, onPropertyChange)
      if (!component.properties.bitMode) updateProperty("value", 1, component, onPropertyChange)
      if (component.properties.bitMode) updateProperty("type", "vertical", component, onPropertyChange)
    }}
  />
{/snippet}

{#snippet SwitchOptions()}
  <hr class="border-gray-400" />

  <!-- Настройки опций -->
  <div class="space-y-4">
    <div class="m-0 flex items-center justify-center gap-2">
      <h4>{$t("constructor.props.bits.title")}</h4>
      <UI.Button
        wrapperClass="w-8"
        content={{ icon: ButtonAdd }}
        onClick={() => {
          const newOption: ISelectOption = {
            id: crypto.randomUUID(),
            name: component.properties?.options.length,
            value: component.properties?.options.length,
            class: "bg-blue",
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
          maxlength={4}
          onUpdate={(value) => {
            const options = [...(component.properties?.options || [])]
            options[index]["name"] = value
            updateProperty("options", options, component, onPropertyChange)
          }}
        />
        <UI.Input
          label={{ name: $t("constructor.props.optionposition") }}
          wrapperClass="!w-3/10"
          value={option.value}
          type="number"
          number={{ minNum: 0, maxNum: 31, step: 1 }}
          onUpdate={(value) => {
            const options = [...(component.properties?.options || [])]
            options[index]["value"] = value
            updateProperty("options", options, component, onPropertyChange)
          }}
        />
        <UI.Select
          wrapperClass="w-80 h-14.5"
          label={{ name: $t("constructor.props.colors") }}
          type="buttons"
          options={$optionsStore.COLOR_OPTIONS.filter((option) => option.value !== "bg-max" && option.value !== "bg-gray")}
          value={$optionsStore.COLOR_OPTIONS.find((c) => (c.value as string).includes(option.class.split(" ").find((cls: string) => cls.startsWith("bg-"))))}
          onUpdate={(option) => {
            const options = [...(component.properties?.options || [])]
            options[index]["class"] = (option as UI.ISelectOption).value
            updateProperty("options", options, component, onPropertyChange)
          }}
        />
        <UI.Switch
          wrapperClass=" w-1/10 bg-blue"
          label={{ name: $t("constructor.props.disabled") }}
          value={option.disabled}
          options={[{ id: crypto.randomUUID(), value: 0, class: "" }]}
          onChange={(value) => {
            const options = [...(component.properties?.options || [])]
            options[index]["disabled"] = value
            updateProperty("options", options, component, onPropertyChange)
          }}
        />
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

{#snippet SwitchHeight()}
  <UI.Input
    label={{ name: $t("constructor.props.height") }}
    value={component.properties.height}
    onUpdate={(value) => updateProperty("height", value as string, component, onPropertyChange)}
  />
{/snippet}

{#snippet SwitchValue()}
  <UI.Input
    label={{ name: $t("constructor.props.value") }}
    value={component.properties.value}
    type="number"
    number={{ minNum: 0, maxNum: component.properties.bitMode ? Math.pow(2, 32) : 1, step: 1 }}
    onUpdate={(value) => updateProperty("value", value as number, component, onPropertyChange)}
  />
{/snippet}

{#if forConstructor}
  <div class="relative flex flex-row items-start justify-center">
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Variable" {VARIABLE_OPTIONS} {component} {onPropertyChange} />
      <CommonSnippets snippet="EventHandlerArgument" {component} {onPropertyChange} />
      <CommonSnippets snippet="Access" {component} {onPropertyChange} />
    </div>

    <div class="flex w-1/3 flex-col px-2">
      {@render SwitchType()}
      {#if !component.properties.bitMode}
        {@render SwitchCaptions()}
        {@render SwitchDisabled()}
      {/if}
    </div>

    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Label" {component} {onPropertyChange} />
      {#if !component.properties.bitMode}
        {@render SwitchColors()}
      {/if}
      {@render SwitchBitmode()}
    </div>
  </div>
  {#if component.properties.bitMode}
    {@render SwitchOptions()}
  {/if}
{:else}
  <div class="relative flex flex-row items-start justify-center">
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Identificator" {component} {onPropertyChange} />
      <CommonSnippets snippet="Access" {component} {onPropertyChange} />
      <CommonSnippets snippet="WrapperClass" {component} {onPropertyChange} />

      {#if !component.properties.bitMode}
        {@render SwitchColors()}
      {/if}
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Label" {component} {onPropertyChange} />

      {#if !component.properties.bitMode}
        {@render SwitchCaptions()}
      {/if}
      {@render SwitchType()}
    </div>
    <div class="flex w-1/3 flex-col px-2">
      {@render SwitchHeight()}
      {@render SwitchValue()}
      {#if !component.properties.bitMode}
        {@render SwitchDisabled()}
      {/if}
      {@render SwitchBitmode()}
    </div>
  </div>
  {#if component.properties.bitMode}
    {@render SwitchOptions()}
  {/if}
{/if}
