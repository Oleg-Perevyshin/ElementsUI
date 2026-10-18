<script lang="ts">
  import TextsEditor from "../TextsEditor.svelte"
  import { getContext } from "svelte"
  import { Language, T } from "$lib/locales/i18n"
  import { localizeText } from "$lib/locales/localize"
  import { type UIComponent, type IProgressBarProps, updateProperty, type IUIComponentHandler } from "../types"
  import * as UI from "$lib"
  import { optionsStore, findColorOption } from "../options"
  import CommonSnippets from "$lib/CommonSnippets.svelte"
  import PropsGroup from "$lib/PropsGroup.svelte"
  import PropsListModal from "$lib/PropsListModal.svelte"
  import PropsListHeader from "$lib/PropsListHeader.svelte"
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
  /* Колонки строки шкалы: ручка, номер и текст, цвет (в конструкторе на две колонки) или значение и стили, удаление */
  const ITEM_GRID = "grid-cols-[2rem_minmax(8rem,1fr)_minmax(6rem,1fr)_minmax(0,1fr)_2rem]"
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
  <TextsEditor {component} {onPropertyChange} />
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
                name: "",
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
          {#if component.properties.items?.length}
            <PropsListHeader
              gridClass={ITEM_GRID}
              captions={[
                "",
                $T("constructor.props.item"),
                forConstructor ? $T("constructor.props.colors") : $T("constructor.props.optionvalue"),
                forConstructor ? "" : $T("constructor.props.optionclass"),
                "",
              ]}
            />
          {/if}
          {#each component.properties.items || [] as progress, index}
            <div
              id="item-{index}"
              class="grid {ITEM_GRID} items-center gap-3 rounded-lg border border-(--hairline-color) bg-(--container-color)/60 px-2 py-1.5"
            >
              <UI.Dragging
                container={itemsContainer}
                array={component.properties.items}
                elementIndex={index}
                onUpdate={(updatedArray) => {
                  updateProperty("items", updatedArray, component, onPropertyChange)
                }}
              />
              <div class="flex min-w-0 items-baseline gap-2 text-[13px]">
                <span class="shrink-0 font-semibold">{$T("constructor.props.progressbar.item", { n: index + 1 })}</span>
                <span class="truncate text-(--muted-color)">{localizeText(progress.name, $Language) || $T("constructor.props.tabs.untitled")}</span>
              </div>
              {#if forConstructor}
                <UI.Select
                  wrapperClass="col-span-2"
                  type="buttons"
                  options={$optionsStore.COLOR_OPTIONS.filter((option) => option.value !== "bg-max")}
                  value={findColorOption($optionsStore.COLOR_OPTIONS, progress.class)}
                  onUpdate={(value) => {
                    const progresses = (component.properties?.items || []).map((p: { name?: string; class?: string }, i: number) =>
                      i === index ? { ...p, class: (value as UI.IOption).value } : p,
                    )
                    updateProperty("items", progresses, component, onPropertyChange)
                  }}
                />
              {:else}
                <UI.Input
                  value={(component.properties.value || [])[index]?.Value}
                  type="number"
                  onUpdate={(value) => {
                    const base =
                      component.properties?.value ||
                      component.properties?.items.map((item: { name?: string; class?: string }, i: number) => ({
                        Name: item.name,
                        Value: i == index ? value : 0,
                      }))
                    const progresses = base.map((p: { Name?: string; Value?: number }, i: number) => (i === index ? { ...p, Value: value } : p))
                    updateProperty("value", progresses, component, onPropertyChange)
                  }}
                />
                <UI.Input
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
