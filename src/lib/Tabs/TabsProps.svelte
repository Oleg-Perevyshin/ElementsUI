<script lang="ts">
  import { T } from "$lib/locales/i18n"
  import { updateProperty, type IOption, type ITabsProps, type IUIComponentHandler, type UIComponent } from "../types"
  import * as UI from "$lib"
  import { optionsStore, findColorOption } from "../options"
  import { ICONS } from "../icons"
  import ButtonAdd from "$lib/libIcons/ButtonAdd.svelte"
  import ButtonDelete from "$lib/libIcons/ButtonDelete.svelte"
  import { twMerge } from "tailwind-merge"
  import CommonSnippets from "$lib/CommonSnippets.svelte"
  import PropsGroup from "$lib/PropsGroup.svelte"
  import PropsListModal from "$lib/PropsListModal.svelte"

  const {
    component,
    onPropertyChange,
    forConstructor = true,
  } = $props<{
    component: UIComponent & { properties: Partial<ITabsProps> }
    onPropertyChange: (updates: Partial<{ properties?: string | object; name?: string; access?: string; eventHandler?: IUIComponentHandler }>) => void
    forConstructor?: boolean
  }>()

  let itemsContainer: HTMLDivElement | null = $state(null)

  const initialColor = $derived(findColorOption($optionsStore.COLOR_OPTIONS, component.properties.wrapperClass))

  const initialPosition = $derived(
    $optionsStore.ICON_TEXT_POSITION_OPTIONS.find((c) =>
      (c.value as string).includes(
        component.properties.items
          .find((item: IOption) => item.class?.includes("flex-"))
          .class.split(" ")
          .find((cls: string) => cls.startsWith("flex-")),
      ),
    ),
  )

  const initialWidth = $derived(() => {
    let width = component.properties.items.find((item: IOption) => item.class?.split(" ").find((cls: string) => cls.startsWith("w-")))
    if (!width) {
      return 0
    } else if (width.class.includes("w-auto")) return 0
    else return 1
  })
</script>

{#snippet TabsIconPosition()}
  <UI.Select
    wrapperClass="h-14"
    label={{ name: $T("constructor.props.icon.text.position") }}
    type="buttons"
    options={$optionsStore.ICON_TEXT_POSITION_OPTIONS}
    value={initialPosition}
    onUpdate={(option) => {
      component.properties.items.forEach((_item: any, index: number) => {
        const items = [...(component.properties?.items || [])]
        items[index]["class"] = twMerge(items[index].class, (option as UI.IOption).value as string)
        updateProperty("items", items, component, onPropertyChange)
      })
    }}
  />
{/snippet}

{#snippet TabsWidthMode()}
  <UI.Switch
    label={{
      name: $T("constructor.props.widthMode"),
      captionLeft: $T("constructor.props.height.small"),
      captionRight: $T("constructor.props.equal"),
    }}
    value={initialWidth()}
    options={[{ id: crypto.randomUUID(), value: 0, class: "" }]}
    onChange={(value) => {
      component.properties.items.forEach((_item: any, index: number) => {
        const items = [...(component.properties?.items || [])]
        items[index]["class"] = twMerge(items[index].class, value ? `w-[${(1 / items.length) * 100}%]` : "w-auto")
        updateProperty("items", items, component, onPropertyChange)
      })
    }}
  />
{/snippet}

{#snippet TabsSettings()}
  <PropsListModal label={$T("constructor.props.tabs.title")} count={component.properties.items?.length ?? 0} wrapperClass="w-200 h-[70%]">
    {#snippet main()}
      <PropsGroup>
        {#snippet headerActions()}
          {#if component.properties?.items.length < 10}
            <UI.Button
              wrapperClass="w-8"
              content={{ icon: ButtonAdd }}
              onClick={() => {
                const newItem: { name: string; icon: string; class: string } = {
                  name: `Tab ${component.properties?.items.length + 1}`,
                  class: `text-${initialColor?.value.slice(3)}-500 ${initialPosition?.value}`,
                  icon: "",
                }
                const items = [...(component.properties?.items || []), newItem]
                items.forEach((_item: any, index: number) => {
                  items[index]["class"] = twMerge(items[index].class, initialWidth() ? `w-[${(1 / items.length) * 100}%]` : "w-auto")
                  updateProperty("items", items, component, onPropertyChange)
                })
              }}
            />
          {/if}
        {/snippet}

        <div bind:this={itemsContainer} class="flex flex-col gap-2">
          {#each component.properties.items || [] as tab, index}
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
                  wrapperClass="min-w-32 flex-1"
                  value={tab.name}
                  onUpdate={(value) => {
                    const items = [...(component.properties?.items || [])]
                    items[index]["name"] = value
                    updateProperty("items", items, component, onPropertyChange)
                  }}
                />
                <div class="relative min-w-32">
                  <CommonSnippets
                    snippet="IconsLib"
                    initialValue={{
                      name: $T("constructor.props.table.type.icon"),
                      icon: component.properties.items[index].icon,
                      updateProperty: (icon: string) => {
                        const items = [...(component.properties?.items || [])]
                        items[index]["icon"] = icon as string
                        updateProperty("items", items, component, onPropertyChange)
                      },
                      icons: { array: ICONS },
                    }}
                    {component}
                    {onPropertyChange}
                  />
                </div>

                <UI.Switch
                  wrapperClass="min-w-24"
                  label={{ name: $T("constructor.props.disabled") }}
                  value={tab?.disabled ? 1 : 0}
                  options={[{ id: crypto.randomUUID(), value: 0, class: "" }]}
                  onChange={(value) => {
                    const items = [...(component.properties?.items || [])]
                    items[index]["disabled"] = value
                    updateProperty("items", items, component, onPropertyChange)
                  }}
                />
              </div>
              {#if component.properties.items.length > 1}
                <UI.Button
                  wrapperClass="w-8 shrink-0"
                  content={{ icon: ButtonDelete }}
                  onClick={() => {
                    const items = [...(component.properties?.items || [])]
                    items.splice(index, 1)
                    items.forEach((_item: any, index: number) => {
                      items[index]["class"] = twMerge(items[index].class, initialWidth() ? `w-[${(1 / items.length) * 100}%]` : "w-auto")
                      updateProperty("items", items, component, onPropertyChange)
                    })
                    updateProperty("items", items, component, onPropertyChange)
                  }}
                />
              {/if}
            </div>
          {/each}
          <div id="item-{component.properties.items.length}" class="min-h-4"></div>
        </div>
      </PropsGroup>
    {/snippet}
  </PropsListModal>
{/snippet}

{#snippet TabsSize()}
  <div class="flex w-full gap-4">
    <UI.Input
      label={{ name: $T("constructor.props.size.height") }}
      value={component.properties.size.height}
      onUpdate={(value) => updateProperty("size.height", value as number, component, onPropertyChange)}
      number={{ minNum: 1, maxNum: 1000, step: 1 }}
      type="number"
    />
    <UI.Input
      label={{ name: $T("constructor.props.size.width") }}
      value={component.properties.size.width}
      onUpdate={(value) => updateProperty("size.width", value as number, component, onPropertyChange)}
      number={{ minNum: 1, maxNum: 1000, step: 1 }}
      type="number"
    />
  </div>
{/snippet}

{#if forConstructor}
  <div class="flex flex-col gap-2">
    <PropsGroup label={$T("constructor.props.group.general")}>
      <CommonSnippets snippet="Access" {component} {onPropertyChange} />
      <CommonSnippets snippet="Colors" initialValue={{ color: initialColor, uselessColors: ["bg-max"] }} {component} {onPropertyChange} />
    </PropsGroup>
    <PropsGroup label={$T("constructor.props.group.appearance")}>
      {@render TabsIconPosition()}
      {@render TabsWidthMode()}
    </PropsGroup>
  </div>
  {@render TabsSettings()}
{:else}
  <div class="flex flex-col gap-2">
    <PropsGroup label={$T("constructor.props.group.general")}>
      <CommonSnippets snippet="Identificator" {component} {onPropertyChange} />
      <CommonSnippets snippet="WrapperClass" {component} {onPropertyChange} />
      {@render TabsSize()}
    </PropsGroup>
    <PropsGroup label={$T("constructor.props.group.appearance")}>
      <CommonSnippets snippet="Access" {component} {onPropertyChange} />
      <CommonSnippets snippet="Colors" initialValue={{ color: initialColor, uselessColors: ["bg-max"] }} {component} {onPropertyChange} />
      {@render TabsIconPosition()}
      {@render TabsWidthMode()}
    </PropsGroup>
  </div>
  {@render TabsSettings()}
{/if}
