<script lang="ts">
  import { getContext } from "svelte"
  import { T } from "$lib/locales/i18n"
  import { type UIComponent, type IProgressBarProps, updateProperty, type IUIComponentHandler } from "../types"
  import * as UI from "$lib"
  import { optionsStore, findColorOption } from "../options"
  import CommonSnippets from "$lib/CommonSnippets.svelte"
  import PropsGroup from "$lib/PropsGroup.svelte"
  import PropsListModal from "$lib/PropsListModal.svelte"
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
    label={{ name: $T("constructor.props.type") }}
    disabled={component.properties.bitMode}
    type="buttons"
    options={$optionsStore.SWITCH_OPTIONS.filter((o) => o.value !== "checkbox")}
    value={$optionsStore.SWITCH_OPTIONS.find((option) => option.value == component.properties.type)}
    onUpdate={(option) => updateProperty("type", (option as UI.IOption).value as string, component, onPropertyChange)}
  />
{/snippet}

{#snippet ProgressBarUnits()}
  <UI.Input
    label={{ name: $T("constructor.props.units") }}
    value={component.properties.number.units}
    onUpdate={(value) => updateProperty("number.units", value, component, onPropertyChange)}
  />
{/snippet}

{#snippet ProgressBarOptions()}
  <PropsListModal label={$T("constructor.props.progressbar.title")} count={component.properties.items?.length ?? 0} wrapperClass="w-200 h-[70%]">
    {#snippet main()}
      <PropsGroup>
        {#snippet headerActions()}
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
        {/snippet}

        <div bind:this={itemsContainer} class="flex flex-col gap-2">
          {#each component.properties.items || [] as progress, index}
            <div
              id="item-{index}"
              class="grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-lg border border-(--hairline-color) bg-(--container-color)/60 p-2"
            >
              <UI.Dragging
                wrapperClass="shrink-0"
                container={itemsContainer}
                array={component.properties.items}
                elementIndex={index}
                onUpdate={(updatedArray) => {
                  updateProperty("items", updatedArray, component, onPropertyChange)
                }}
              />
              <div class="flex flex-wrap items-end gap-2">
                <UI.Input
                  label={{ name: $T("constructor.props.optionname") }}
                  wrapperClass="min-w-28 flex-1"
                  value={progress.name}
                  onUpdate={(value) => {
                    const progresses = [...(component.properties?.items || [])]
                    progresses[index]["name"] = value
                    updateProperty("items", progresses, component, onPropertyChange)
                  }}
                />
                {#if forConstructor}
                  <UI.Select
                    label={{ name: $T("constructor.props.colors") }}
                    wrapperClass="min-w-56 flex-[2]"
                    type="buttons"
                    options={$optionsStore.COLOR_OPTIONS.filter((option) => option.value !== "bg-max")}
                    value={findColorOption($optionsStore.COLOR_OPTIONS, progress.class)}
                    onUpdate={(value) => {
                      const progresses = [...(component.properties?.items || [])]
                      progresses[index]["class"] = (value as UI.IOption).value
                      updateProperty("items", progresses, component, onPropertyChange)
                    }}
                  />
                {:else}
                  <UI.Input
                    label={{ name: $T("constructor.props.optionvalue") }}
                    wrapperClass="min-w-24 flex-1"
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
                    label={{ name: $T("constructor.props.optionclass") }}
                    wrapperClass="min-w-32 flex-[2]"
                    value={progress.class}
                    onUpdate={(value) => {
                      const progresses = [...(component.properties?.items || [])]
                      progresses[index]["class"] = value
                      updateProperty("items", progresses, component, onPropertyChange)
                    }}
                  />
                {/if}
              </div>
              <UI.Button
                wrapperClass="w-8 shrink-0"
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
      </PropsGroup>
    {/snippet}
  </PropsListModal>
{/snippet}

{#if forConstructor}
  <div class="flex flex-col gap-2">
    <PropsGroup label={$T("constructor.props.group.general")}>
      <CommonSnippets snippet="Access" {component} {onPropertyChange} />
      <CommonSnippets snippet="Variable" {VARIABLE_OPTIONS} {component} {onPropertyChange} />
      {@render ProgressBarType()}
    </PropsGroup>
    <PropsGroup label={$T("constructor.props.group.value")}>
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
    </PropsGroup>
  </div>
  {@render ProgressBarOptions()}
{:else}
  <div class="flex flex-col gap-2">
    <PropsGroup label={$T("constructor.props.group.general")}>
      <CommonSnippets snippet="Access" {component} {onPropertyChange} />
      <CommonSnippets snippet="Identificator" {component} {onPropertyChange} />
      {@render ProgressBarType()}
    </PropsGroup>
    <PropsGroup label={$T("constructor.props.group.value")}>
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
    </PropsGroup>
  </div>
  {@render ProgressBarOptions()}
{/if}
