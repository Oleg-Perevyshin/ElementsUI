<script lang="ts">
  import { getContext } from "svelte"
  import { T } from "$lib/locales/i18n"
  import { type UIComponent, type ISwitchProps, updateProperty, type IOption, type IUIComponentHandler } from "../types"
  import * as UI from "$lib"
  import { optionsStore, findColorOption } from "../options"
  import ButtonDelete from "$lib/libIcons/ButtonDelete.svelte"
  import ButtonAdd from "$lib/libIcons/ButtonAdd.svelte"
  import CommonSnippets from "$lib/CommonSnippets.svelte"
  import PropsGroup from "$lib/PropsGroup.svelte"
  import PropsListModal from "$lib/PropsListModal.svelte"

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
  let initialColor = $derived(findColorOption($optionsStore.COLOR_OPTIONS, component.properties.options?.[0]?.class))
  const initialAlign = $derived(
    $optionsStore.TEXT_ALIGN_OPTIONS.find((a) =>
      (a.value as string).includes(component.properties.label?.class?.split(" ").find((cls: string) => cls.startsWith("text-"))),
    ),
  )
</script>

{#snippet SwitchType()}
  <UI.Select
    wrapperClass="!h-14"
    label={{ name: $T("constructor.props.type") }}
    type="buttons"
    options={$optionsStore.SWITCH_OPTIONS.map((o) => (component.properties.bitMode && o.value == "checkbox" ? { ...o, disabled: true } : o))}
    value={$optionsStore.SWITCH_OPTIONS.find((option) => option.value == component.properties.type)}
    onUpdate={(option) => updateProperty("type", (option as UI.IOption).value as string, component, onPropertyChange)}
  />
{/snippet}

{#snippet SwitchCaptions()}
  {#if component.properties.type == "horizontal"}
    <UI.Input
      label={{ name: $T("constructor.props.caption.left") }}
      value={component.properties.label.captionLeft}
      onUpdate={(value) => updateProperty("label.captionLeft", value as string, component, onPropertyChange)}
    />
    <UI.Input
      label={{ name: $T("constructor.props.caption.right") }}
      value={component.properties.label.captionRight}
      onUpdate={(value) => updateProperty("label.captionRight", value as string, component, onPropertyChange)}
    />
  {/if}
{/snippet}

{#snippet SwitchDisabled()}
  <UI.Switch
    wrapperClass="bg-blue"
    label={{ name: $T("constructor.props.disabled") }}
    value={component.properties.options[0].disabled}
    options={[{ id: crypto.randomUUID(), value: 0, class: "" }]}
    onChange={(value) => {
      const options = [...(component.properties?.options || [])]
      options[0]["disabled"] = value
      updateProperty("options", options, component, onPropertyChange)
    }}
  />
{/snippet}

{#snippet SwitchBitmode()}
  <UI.Switch
    wrapperClass="bg-blue"
    label={{ name: $T("constructor.props.bitMode") }}
    value={component.properties.bitMode}
    options={[{ id: crypto.randomUUID(), value: 0, class: "" }]}
    onChange={(value) => {
      updateProperty("bitMode", value, component, onPropertyChange)
      updateProperty("value", 0, component, onPropertyChange)
      // if (!component.properties.bitMode) updateProperty("value", 0, component, onPropertyChange)
    }}
  />
{/snippet}

{#snippet SwitchOptions()}
  <PropsListModal label={$T("constructor.props.bits.title")} count={component.properties.options?.length ?? 0} wrapperClass="w-200 h-[70%]">
    {#snippet main()}
      <PropsGroup>
        {#snippet headerActions()}
          {#if component.properties.options.length < 32}
            <UI.Button
              wrapperClass="w-8"
              content={{ icon: ButtonAdd }}
              onClick={() => {
                const newOption: IOption = {
                  id: crypto.randomUUID(),
                  name: component.properties?.options.length,
                  value: component.properties?.options.length,
                  class: "bg-blue",
                }
                const options = [...(component.properties?.options || []), newOption]
                updateProperty("options", options, component, onPropertyChange)
              }}
            />
          {/if}
        {/snippet}

        {#each component.properties.options || [] as option, index (option.id)}
          <div class="grid grid-cols-[1fr_auto] items-center gap-2 rounded-lg border border-(--hairline-color) bg-(--container-color)/60 p-2">
            <div class="flex flex-wrap items-end gap-2">
              <UI.Input
                label={{ name: $T("constructor.props.optionname") }}
                wrapperClass="min-w-24 flex-1"
                value={option.name}
                maxlength={4}
                onUpdate={(value) => {
                  const options = [...(component.properties?.options || [])]
                  options[index]["name"] = value
                  updateProperty("options", options, component, onPropertyChange)
                }}
              />
              <UI.Input
                label={{ name: $T("constructor.props.optionposition") }}
                wrapperClass="min-w-24 flex-1"
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
                wrapperClass="min-w-56 flex-[2]"
                label={{ name: $T("constructor.props.colors") }}
                type="buttons"
                options={$optionsStore.COLOR_OPTIONS.filter((option) => option.value !== "bg-max" && option.value !== "bg-gray")}
                value={findColorOption($optionsStore.COLOR_OPTIONS, option.class)}
                onUpdate={(option) => {
                  const options = [...(component.properties?.options || [])]
                  options[index]["class"] = (option as UI.IOption).value
                  updateProperty("options", options, component, onPropertyChange)
                }}
              />
              <UI.Switch
                wrapperClass="min-w-24 bg-blue"
                label={{ name: $T("constructor.props.disabled") }}
                value={option.disabled}
                options={[{ id: crypto.randomUUID(), value: 0, class: "" }]}
                onChange={(value) => {
                  const options = [...(component.properties?.options || [])]
                  options[index]["disabled"] = value
                  updateProperty("options", options, component, onPropertyChange)
                }}
              />
            </div>
            {#if (component.properties.options?.length ?? 0) > 1}
              <UI.Button
                wrapperClass="w-8 shrink-0"
                content={{ icon: ButtonDelete }}
                onClick={() => {
                  const options = [...(component.properties?.options || [])]
                  options.splice(index, 1)
                  updateProperty("options", options, component, onPropertyChange)
                }}
              />
            {/if}
          </div>
        {/each}
      </PropsGroup>
    {/snippet}
  </PropsListModal>
{/snippet}

{#snippet SwitchHeight()}
  <UI.Input
    label={{ name: $T("constructor.props.height") }}
    value={component.properties.height}
    onUpdate={(value) => updateProperty("height", value as string, component, onPropertyChange)}
  />
{/snippet}

{#snippet SwitchValue()}
  <UI.Input
    label={{ name: $T("constructor.props.value") }}
    value={component.properties.value}
    type="number"
    number={{ minNum: 0, maxNum: component.properties.bitMode ? Math.pow(2, 32) : 1, step: 1 }}
    onUpdate={(value) => updateProperty("value", value as number, component, onPropertyChange)}
  />
{/snippet}

{#if forConstructor}
  <div class="flex flex-col gap-2">
    <PropsGroup label={$T("constructor.props.group.general")}>
      <CommonSnippets snippet="Access" {component} {onPropertyChange} />
      <CommonSnippets snippet="Variable" {VARIABLE_OPTIONS} {component} {onPropertyChange} />
      <CommonSnippets snippet="EventHandlerArgument" {component} {onPropertyChange} />
    </PropsGroup>

    <PropsGroup label={$T("constructor.props.group.behavior")}>
      {@render SwitchType()}
      {#if !component.properties.bitMode}
        {@render SwitchCaptions()}
        {@render SwitchDisabled()}
      {/if}
    </PropsGroup>

    <PropsGroup label={$T("constructor.props.group.appearance")}>
      <CommonSnippets snippet="Label" {component} {onPropertyChange} />
      <CommonSnippets snippet="LabelAlign" initialValue={initialAlign} {component} {onPropertyChange} />
      {#if !component.properties.bitMode}
        <CommonSnippets
          snippet="Colors"
          initialValue={{
            color: initialColor,
            uselessColors: ["bg-gray", "bg-max"],
            updateProperty: (option: UI.IOption) => {
              const options = [...(component.properties?.options || [])]
              options[0]["class"] = (option as UI.IOption).value
              updateProperty("options", options, component, onPropertyChange)
            },
          }}
          {component}
          {onPropertyChange}
        />
      {/if}
      {#if component.properties.type != "checkbox"}
        {@render SwitchBitmode()}
      {/if}
    </PropsGroup>
  </div>
  {#if component.properties.bitMode}
    {@render SwitchOptions()}
  {/if}
{:else}
  <div class="flex flex-col gap-2">
    <PropsGroup label={$T("constructor.props.group.general")}>
      <CommonSnippets snippet="Identificator" {component} {onPropertyChange} />
      <CommonSnippets snippet="Access" {component} {onPropertyChange} />
      <CommonSnippets snippet="WrapperClass" {component} {onPropertyChange} />

      {#if !component.properties.bitMode}
        <CommonSnippets
          snippet="Colors"
          initialValue={{
            color: initialColor,
            uselessColors: ["bg-gray", "bg-max"],
            updateProperty: (option: UI.IOption) => {
              const options = [...(component.properties?.options || [])]
              options[0]["class"] = (option as UI.IOption).value
              updateProperty("options", options, component, onPropertyChange)
            },
          }}
          {component}
          {onPropertyChange}
        />
      {/if}
    </PropsGroup>
    <PropsGroup label={$T("constructor.props.group.appearance")}>
      <CommonSnippets snippet="Label" {component} {onPropertyChange} />
      <CommonSnippets snippet="LabelAlign" initialValue={initialAlign} {component} {onPropertyChange} />
      {@render SwitchType()}
      {#if !component.properties.bitMode}
        {@render SwitchCaptions()}
      {/if}
    </PropsGroup>
    <PropsGroup label={$T("constructor.props.group.behavior")}>
      {@render SwitchHeight()}
      {@render SwitchValue()}
      {#if !component.properties.bitMode}
        {@render SwitchDisabled()}
      {/if}
      {#if component.properties.type != "checkbox"}
        {@render SwitchBitmode()}
      {/if}
    </PropsGroup>
  </div>
  {#if component.properties.bitMode}
    {@render SwitchOptions()}
  {/if}
{/if}
