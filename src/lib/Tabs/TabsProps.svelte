<script lang="ts">
  import { t } from "$lib/locales/i18n"
  import { updateProperty, type ISelectOption, type ITabsProps, type IUIComponentHandler, type UIComponent } from "../types"
  import * as UI from "$lib"
  import { optionsStore } from "../options"
  import { ICONS } from "../icons"
  import Modal from "$lib/Modal.svelte"
  import Button from "$lib/Button/Button.svelte"
  import CrossIcon from "$lib/libIcons/CrossIcon.svelte"
  import ButtonAdd from "$lib/libIcons/ButtonAdd.svelte"
  import ButtonDelete from "$lib/libIcons/ButtonDelete.svelte"
  import { twMerge } from "tailwind-merge"
  import CommonSnippets from "$lib/CommonSnippets.svelte"

  const {
    component,
    onPropertyChange,
    forConstructor = true,
  } = $props<{
    component: UIComponent & { properties: Partial<ITabsProps> }
    onPropertyChange: (updates: Partial<{ properties?: string | object; name?: string; access?: string; eventHandler?: IUIComponentHandler }>) => void
    forConstructor?: boolean
  }>()

  let tabIcon = $state({ index: 0, isModalOpen: false })

  const initialColor = $derived(
    $optionsStore.COLOR_OPTIONS.find((c) =>
      (c.value as string).includes(component.properties.wrapperClass?.split(" ").find((cls: string) => cls.startsWith("bg-"))),
    ),
  )

  const initialPosition = $derived(
    $optionsStore.ICON_TEXT_POSITION_OPTIONS.find((c) =>
      (c.value as string).includes(
        component.properties.items
          .find((item: ISelectOption) => item.class?.includes("flex-"))
          .class.split(" ")
          .find((cls: string) => cls.startsWith("flex-")),
      ),
    ),
  )

  const initialWidth = $derived(() => {
    let width = component.properties.items.find((item: ISelectOption) => item.class?.split(" ").find((cls: string) => cls.startsWith("w-")))
    if (!width) {
      return 0
    } else if (width.class.includes("w-auto")) return 0
    else return 1
  })
</script>

{#snippet TabsIconPosition()}
  <UI.Select
    wrapperClass="h-14"
    label={{ name: $t("constructor.props.icon.text.position") }}
    type="buttons"
    options={$optionsStore.ICON_TEXT_POSITION_OPTIONS}
    value={initialPosition}
    onUpdate={(option) => {
      component.properties.items.forEach((_item: any, index: number) => {
        const items = [...(component.properties?.items || [])]
        items[index]["class"] = twMerge(items[index].class, (option as UI.ISelectOption).value as string)
        updateProperty("items", items, component, onPropertyChange)
      })
    }}
  />
{/snippet}

{#snippet TabsWidthMode()}
  <UI.Switch
    label={{
      name: $t("constructor.props.widthMode"),
      captionLeft: $t("constructor.props.height.small"),
      captionRight: $t("constructor.props.equal"),
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
  <hr class="border-gray-400" />

  <div class="space-y-4">
    <div class="m-0 flex items-center justify-center gap-2">
      <h4>{$t("constructor.props.tabs.title")}</h4>
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
    </div>

    {#each component.properties.items || [] as tab, index}
      <div class="m-0 flex items-end justify-around gap-2 border-gray-400">
        <UI.Input
          label={{ name: $t("constructor.props.optionname") }}
          wrapperClass="w-5/10"
          value={tab.name}
          onUpdate={(value) => {
            const items = [...(component.properties?.items || [])]
            items[index]["name"] = value
            updateProperty("items", items, component, onPropertyChange)
          }}
        />
        <div class="relative mt-5 flex w-3/10 gap-2">
          <UI.Button content={{ name: $t("constructor.props.labelicon") }} onClick={() => (tabIcon = { index: index, isModalOpen: true })} />

          {#if tab.icon}
            <Button
              wrapperClass="w-8.5 "
              componentClass="p-0.5 bg-red"
              content={{ icon: CrossIcon }}
              onClick={() => {
                const items = [...(component.properties?.items || [])]
                items[index]["icon"] = ""
                updateProperty("items", items, component, onPropertyChange)
              }}
            />
          {/if}
        </div>

        {#if component.properties.items.length > 1}
          <UI.Button
            wrapperClass="w-8"
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
    {#if tabIcon.isModalOpen}
      <Modal bind:isOpen={tabIcon.isModalOpen} wrapperClass="w-130">
        {#snippet main()}
          <div class="grid grid-cols-3">
            {#each ICONS as category}
              <div class="relative m-1.5 rounded-xl border-2 border-(--border-color) p-3">
                <div class="absolute -top-3.5 bg-(--back-color) px-1">{$t(`constructor.props.icon.${category[0]}`)}</div>
                <div class="grid grid-cols-3 place-items-center gap-2">
                  {#each category[1] as icon}
                    <button
                      class="h-8 w-8 cursor-pointer [&_svg]:h-full [&_svg]:max-h-full [&_svg]:w-full [&_svg]:max-w-full"
                      onclick={() => {
                        const items = [...(component.properties?.items || [])]
                        items[tabIcon.index]["icon"] = icon as string
                        updateProperty("items", items, component, onPropertyChange)
                      }}
                    >
                      {@html icon}
                    </button>{/each}
                </div>
              </div>
            {/each}
          </div>
        {/snippet}
      </Modal>
    {/if}
  </div>
{/snippet}

{#snippet TabsSize()}
  <div class="flex w-full gap-4">
    <UI.Input
      label={{ name: $t("constructor.props.size.height") }}
      value={component.properties.size.height}
      onUpdate={(value) => updateProperty("size.height", value as number, component, onPropertyChange)}
      number={{ minNum: 1, maxNum: 1000, step: 1 }}
      type="number"
    />
    <UI.Input
      label={{ name: $t("constructor.props.size.width") }}
      value={component.properties.size.width}
      onUpdate={(value) => updateProperty("size.width", value as number, component, onPropertyChange)}
      number={{ minNum: 1, maxNum: 1000, step: 1 }}
      type="number"
    />
  </div>
{/snippet}

{#if forConstructor}
  <div class="flex items-center mb-4 justify-center gap-8">
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Access" {component} {onPropertyChange} />
      <CommonSnippets snippet="Colors" initialValue={initialColor} {component} {onPropertyChange} />
    </div>
    <div class="flex w-1/3 flex-col px-2">
      {@render TabsIconPosition()}
      {@render TabsWidthMode()}
    </div>
  </div>
{:else}
  <div class="flex items-center mb-4 justify-center gap-8">
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Identificator" {component} {onPropertyChange} />
      <CommonSnippets snippet="WrapperClass" {component} {onPropertyChange} />
      {@render TabsSize()}
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Access" {component} {onPropertyChange} />
      <CommonSnippets snippet="Colors" initialValue={initialColor} {component} {onPropertyChange} />
    </div>

    <div class="flex w-1/3 flex-col px-2">
      {@render TabsIconPosition()}
      {@render TabsWidthMode()}
    </div>
  </div>
  {@render TabsSettings()}
{/if}
