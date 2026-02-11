<script lang="ts">
  import { getContext } from "svelte"
  import { t } from "$lib/locales/i18n"
  import { type UIComponent, type IProgressBarProps, updateProperty, type IUIComponentHandler } from "../types"
  import * as UI from "$lib"
  import { optionsStore } from "../options"
  import CommonSnippets from "$lib/CommonSnippets.svelte"
  import ButtonAdd from "$lib/libIcons/ButtonAdd.svelte"
  import ButtonDelete from "$lib/libIcons/ButtonDelete.svelte"

  const {
    component,
    onPropertyChange,
    forConstructor = true,
  } = $props<{
    component: UIComponent & { properties: Partial<IProgressBarProps> }
    onPropertyChange: (updates: Partial<{ properties?: string | object; name?: string; access?: string; eventHandler?: IUIComponentHandler }>) => void
    forConstructor?: boolean
  }>()

  const DeviceVariables = getContext<{ id: string; value: string; name: string }[]>("DeviceVariables")
  let VARIABLE_OPTIONS = $derived(DeviceVariables && Array.isArray(DeviceVariables) ? DeviceVariables : [])
</script>

{#snippet ProgressBarType()}
  <UI.Select
    wrapperClass="!h-14"
    label={{ name: $t("constructor.props.type") }}
    disabled={component.properties.bitMode}
    type="buttons"
    options={$optionsStore.SWITCH_OPTIONS.filter((o) => o.value !== "checkbox")}
    value={$optionsStore.SWITCH_OPTIONS.find((option) => option.value == component.properties.type)}
    onUpdate={(option) => updateProperty("type", (option as UI.ISelectOption).value as string, component, onPropertyChange)}
  />
{/snippet}

{#snippet ProgressBarMinMax()}
  <UI.Input
    label={{ name: $t("constructor.props.min") }}
    value={component.properties.number.minNum as number}
    type="number"
    onUpdate={(value) => {
      updateProperty("number.minNum", Number(value), component, onPropertyChange)
      let newValue = component.properties.value.map((pr: UI.ISelectOption) => {
        return { ...pr, value: component.properties.number.minNum + (component.properties.number.maxNum - component.properties.number.minNum) / 2 }
      })
      updateProperty("value", newValue, component, onPropertyChange)
    }}
  />
  <UI.Input
    label={{ name: $t("constructor.props.max") }}
    value={component.properties.number.maxNum as number}
    type="number"
    onUpdate={(value) => {
      updateProperty("number.maxNum", Number(value), component, onPropertyChange)
      let newValue = component.properties.value.map((pr: UI.ISelectOption) => {
        return { ...pr, value: component.properties.number.minNum + (component.properties.number.maxNum - component.properties.number.minNum) / 2 }
      })
      updateProperty("value", newValue, component, onPropertyChange)
    }}
  />
{/snippet}

{#snippet ProgressBarUnits()}
  <UI.Input
    label={{ name: $t("constructor.props.units") }}
    value={component.properties.number.units}
    onUpdate={(value) => updateProperty("number.units", value, component, onPropertyChange)}
  />
{/snippet}

{#snippet ProgressBarOptions()}
  <hr class="border-gray-400" />

  <div class="space-y-4">
    <div class="m-0 flex items-center justify-center gap-2">
      <h4>{$t("constructor.props.progressbar.title")}</h4>
      <UI.Button
        wrapperClass="w-8"
        content={{ icon: ButtonAdd }}
        onClick={() => {
          const newProgress = {
            name: `Label ${component.properties?.items.length + 1}`,
            value: 50,
            class: "bg-blue",
          }
          const progresses = [...(component.properties?.items || []), newProgress]
          updateProperty("items", progresses, component, onPropertyChange)
        }}
      />
    </div>

    {#each component.properties.items || [] as progress, index}
      <div class="m-0 flex items-end justify-around gap-2 border-gray-400">
        <UI.Input
          label={{ name: $t("constructor.props.optionname") }}
          wrapperClass="!w-3/10"
          value={progress.name}
          onUpdate={(value) => {
            const progresses = [...(component.properties?.items || [])]
            progresses[index]["name"] = value
            updateProperty("items", progresses, component, onPropertyChange)
          }}
        />
        <UI.Input
          label={{ name: $t("constructor.props.optionvalue") }}
          wrapperClass="!w-3/10"
          value={component.properties.value[index]}
          type="number"
          onUpdate={(value) => {
            const progresses = [...(component.properties?.value || [])]
            progresses[index] = value
            updateProperty("value", progresses, component, onPropertyChange)
          }}
        />
        {#if forConstructor}
          <UI.Select
            label={{ name: $t("constructor.props.colors") }}
            wrapperClass="w-80 h-14.5"
            type="buttons"
            options={$optionsStore.COLOR_OPTIONS.filter((option) => option.value !== "bg-max")}
            value={$optionsStore.COLOR_OPTIONS.find((c) =>
              (c.value as string).includes(progress.class.split(" ").find((cls: string) => cls.startsWith("bg-"))),
            )}
            onUpdate={(value) => {
              const progresses = [...(component.properties?.items || [])]
              progresses[index]["class"] = (value as UI.ISelectOption).value
              updateProperty("items", progresses, component, onPropertyChange)
            }}
          />
        {:else}
          <UI.Input
            label={{ name: $t("constructor.props.optionclass") }}
            wrapperClass="!w-3/10"
            value={progress.class}
            onUpdate={(value) => {
              const progresses = [...(component.properties?.items || [])]
              progresses[index]["class"] = value
              updateProperty("items", progresses, component, onPropertyChange)
            }}
          />
        {/if}

        <UI.Button
          wrapperClass="w-8"
          content={{ icon: ButtonDelete }}
          onClick={() => {
            const progresses = [...(component.properties?.items || [])]
            progresses.splice(index, 1)
            updateProperty("items", progresses, component, onPropertyChange)
          }}
        />
      </div>
    {/each}
  </div>
{/snippet}

{#if forConstructor}
  <div class="relative flex flex-row items-start justify-center">
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Variable" {VARIABLE_OPTIONS} {component} {onPropertyChange} />
      {@render ProgressBarType()}
    </div>
    <div class="flex w-1/3 flex-col px-2">
      {@render ProgressBarMinMax()}
    </div>
  </div>
  {@render ProgressBarOptions()}
{:else}
  <div class="relative flex flex-row items-start justify-center">
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Identificator" {component} {onPropertyChange} />
      {@render ProgressBarType()}
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="WrapperClass" {component} {onPropertyChange} />
      {@render ProgressBarUnits()}
    </div>
    <div class="flex w-1/3 flex-col px-2">
      {@render ProgressBarMinMax()}
    </div>
  </div>
  {@render ProgressBarOptions()}
{/if}
