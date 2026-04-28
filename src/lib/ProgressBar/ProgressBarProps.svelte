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
  let itemsContainer: HTMLDivElement | null = $state(null)
</script>

{#snippet ProgressBarType()}
  <UI.Select
    wrapperClass="!h-14"
    label={{ name: $t("constructor.props.type") }}
    disabled={component.properties.bitMode}
    type="buttons"
    options={$optionsStore.SWITCH_OPTIONS.filter((o) => o.value !== "checkbox")}
    value={$optionsStore.SWITCH_OPTIONS.find((option) => option.value == component.properties.type)}
    onUpdate={(option) => updateProperty("type", (option as UI.IOption).value as string, component, onPropertyChange)}
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
  <div class="space-y-4" bind:this={itemsContainer}>
    <div class="m-0 flex items-center justify-center gap-2">
      <h4>{$t("constructor.props.progressbar.title")}</h4>
      <UI.Button
        wrapperClass="w-8"
        content={{ icon: ButtonAdd }}
        onClick={() => {
          const newProgress = {
            name: `Label ${component.properties?.items.length + 1}`,
            class: "bg-blue",
          }
          const progresses = [...(component.properties?.items || []), newProgress]
          updateProperty("items", progresses, component, onPropertyChange)
          updateProperty(
            "value",
            Array.from(component.properties?.items, (x: { name?: string; class?: string }) => {
              return { Name: x.name, Value: (component.properties.number.maxNum - component.properties.number.minNum) / 2 }
            }),
            component,
            onPropertyChange,
          )
        }}
      />
    </div>

    {#each component.properties.items || [] as progress, index}
      <div id="item-{index}" class="m-0 flex items-end w-full gap-1">
        <UI.Dragging
          wrapperClass="w-9"
          container={itemsContainer}
          array={component.properties.items}
          elementIndex={index}
          onUpdate={(updatedArray) => {
            updateProperty("items", updatedArray, component, onPropertyChange)
          }}
        />
        <UI.Input
          label={{ name: $t("constructor.props.optionname") }}
          wrapperClass="w-1/4"
          value={progress.name}
          onUpdate={(value) => {
            const progresses = [...(component.properties?.items || [])]
            progresses[index]["name"] = value
            updateProperty("items", progresses, component, onPropertyChange)
          }}
        />
        {#if forConstructor}
          <UI.Select
            label={{ name: $t("constructor.props.colors") }}
            wrapperClass="w-1/2 h-14.5"
            type="buttons"
            options={$optionsStore.COLOR_OPTIONS.filter((option) => option.value !== "bg-max")}
            value={$optionsStore.COLOR_OPTIONS.find((c) =>
              (c.value as string).includes(progress.class.split(" ").find((cls: string) => cls.startsWith("bg-"))),
            )}
            onUpdate={(value) => {
              const progresses = [...(component.properties?.items || [])]
              progresses[index]["class"] = (value as UI.IOption).value
              updateProperty("items", progresses, component, onPropertyChange)
            }}
          />
        {:else}
          <UI.Input
            label={{ name: $t("constructor.props.optionvalue") }}
            wrapperClass="w-1/4"
            value={(component.properties.value || [])[index]?.Value}
            type="number"
            onUpdate={(value) => {
              const progresses = [
                ...(component.properties?.value ||
                  component.properties?.items.map((item: { name?: string; class?: string }, i: number) => {
                    return {
                      Name: item.name,
                      Value: i == index ? value : 0,
                    }
                  })),
              ]
              progresses[index].Value = value
              updateProperty("value", progresses, component, onPropertyChange)
            }}
          />
          <UI.Input
            label={{ name: $t("constructor.props.optionclass") }}
            wrapperClass="w-1/3"
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
    <div id="item-{component.properties.items.length}" class="min-h-4"></div>
  </div>
{/snippet}

{#if forConstructor}
  <div class="relative flex flex-row items-start justify-center">
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Access" {component} {onPropertyChange} />
      <CommonSnippets snippet="Variable" {VARIABLE_OPTIONS} {component} {onPropertyChange} />
      {@render ProgressBarType()}
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets
        snippet="MinMaxStep"
        initialValue={{
          number: component.properties.number,
          bitMode: component.properties.bitMode,
          updateProperty: (value: number, property: string) => {
            updateProperty(property, Number(value), component, onPropertyChange)
            let newValue = component.properties.value?.map((pr: UI.IReceivingDataObject) => {
              return { ...pr, Value: component.properties.number.minNum + (component.properties.number.maxNum - component.properties.number.minNum) / 2 }
            })
            updateProperty("value", newValue, component, onPropertyChange)
          },
        }}
        {component}
        {onPropertyChange}
      />
      {@render ProgressBarUnits()}
    </div>
    <div class="flex w-1/3 flex-col px-2">
      {@render ProgressBarOptions()}
    </div>
  </div>
{:else}
  <div class="relative flex flex-row items-start justify-center">
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Access" {component} {onPropertyChange} />
      <CommonSnippets snippet="Identificator" {component} {onPropertyChange} />
      {@render ProgressBarType()}
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="WrapperClass" {component} {onPropertyChange} />
      <CommonSnippets
        snippet="MinMaxStep"
        initialValue={{
          number: component.properties.number,
          bitMode: component.properties.bitMode,
          updateProperty: (value: number, property: string) => {
            updateProperty(property, Number(value), component, onPropertyChange)
            let newValue = component.properties.value?.map((pr: UI.IReceivingDataObject) => {
              return { ...pr, Value: component.properties.number.minNum + (component.properties.number.maxNum - component.properties.number.minNum) / 2 }
            })
            updateProperty("value", newValue, component, onPropertyChange)
          },
        }}
        {component}
        {onPropertyChange}
      />
      {@render ProgressBarUnits()}
    </div>
    <div class="flex w-1/3 flex-col px-2">
      {@render ProgressBarOptions()}
    </div>
  </div>
{/if}
