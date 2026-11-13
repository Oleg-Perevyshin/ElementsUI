<!-- $lib/Tabs/TabsProps.svelte - панель свойств конструктора для Tabs -->
<script lang="ts">
  import TextsEditor from "../TextsEditor.svelte"
  import { Language, T } from "../locales/i18n"
  import { localizeText } from "../locales/localize"
  import type { UIComponent, ITabsProps } from "../types"
  import { createPropsEditor, optionByClass, type PropertyChange } from "../propsEditor"
  import * as UI from ".."
  import { optionsStore } from "../options"
  import { twMerge } from "tailwind-merge"
  import { ICONS } from "../icons"
  import ButtonDelete from "../libIcons/ButtonDelete.svelte"
  import ButtonAdd from "../libIcons/ButtonAdd.svelte"
  import CommonSnippets from "../CommonSnippets.svelte"
  import PropsGroup from "../PropsGroup.svelte"
  import PropsListModal from "../PropsListModal.svelte"

  const {
    component,
    onPropertyChange,
  }: {
    component: UIComponent<"Tabs">
    onPropertyChange: (change: PropertyChange<ITabsProps>) => void
  } = $props()

  const edit = $derived(createPropsEditor(component, onPropertyChange))
  let itemsContainer: HTMLDivElement | null = $state(null)
  const items = $derived(component.properties.items ?? [])

  /* У каждой вкладки - стабильный id: по нему конструктор переносит её содержимое при перестановке и удалении вкладок */
  $effect(() => {
    if (items.some((item) => !item.id))
      edit.set(
        "items",
        items.map((item) => (item.id ? item : { ...item, id: crypto.randomUUID() })),
      )
  })

  /* Положение иконки и ширина вкладок - классы, общие для всех вкладок */
  const position = $derived(items.map((item) => optionByClass($optionsStore.ICON_TEXT_POSITION_OPTIONS, item.class)).find(Boolean)?.value)
  const equalWidth = $derived(items.some((item) => item.class?.split(" ").includes("flex-1")))
  /* «Равные» - flex-1 (место делится поровну с учётом gap), «Авто» - w-auto (ширина по содержимому) */
  const tabClass = (cls: string | undefined, equal: boolean, pos = position) =>
    twMerge((cls ?? "").replace(/\bflex-1\b|\bw-auto\b/g, "").trim(), pos, equal ? "flex-1" : "w-auto")
  const setItems = (next: ITabsProps["items"], equal = equalWidth, pos = position) =>
    edit.set(
      "items",
      next.map((item) => ({ ...item, class: tabClass(item.class, equal, pos) })),
    )
</script>

<div class="flex flex-col gap-2">
  <PropsGroup label={$T("constructor.props.group.general")}>
    <CommonSnippets snippet="Access" {component} {onPropertyChange} />
    <TextsEditor {component} {onPropertyChange} />
    <CommonSnippets snippet="Accent" {component} {onPropertyChange} />
  </PropsGroup>
  <PropsGroup label={$T("constructor.props.group.appearance")}>
    <UI.Select
      label={{ name: $T("constructor.props.orientation") }}
      type="buttons"
      options={$optionsStore.ORIENTATION_OPTIONS}
      value={component.properties.orientation ?? "horizontal"}
      onUpdate={(orientation) => edit.set("orientation", orientation)}
    />
    <UI.Select
      wrapperClass="h-14"
      label={{ name: $T("constructor.props.icon.text.position") }}
      type="buttons"
      options={$optionsStore.ICON_TEXT_POSITION_OPTIONS}
      value={position}
      onUpdate={(pos) => setItems(items, equalWidth, pos)}
    />
    <UI.Switch
      label={{ name: $T("constructor.props.widthMode"), captionLeft: $T("constructor.props.height.small"), captionRight: $T("constructor.props.equal") }}
      value={equalWidth ? 1 : 0}
      onUpdate={(value) => setItems(items, value === 1)}
    />
  </PropsGroup>
</div>

<PropsListModal label={$T("constructor.props.tabs.title")} count={items.length} wrapperClass="w-200 h-[70%]">
  {#snippet main()}
    <PropsGroup>
      {#snippet headerActions()}
        {#if items.length < 10}
          <UI.Button
            wrapperClass="w-8"
            content={{ icon: ButtonAdd }}
            onClick={() => setItems([...items, { id: crypto.randomUUID(), name: "", icon: "", class: "" }])}
          />
        {/if}
      {/snippet}

      <div bind:this={itemsContainer} class="flex flex-col gap-2">
        {#each items as tab, index (tab.id ?? index)}
          <!-- Строка в одну линию: ручка, какая это вкладка, иконка, «Отключить», удаление -->
          <div
            id="item-{index}"
            class="grid grid-cols-[auto_minmax(0,1fr)_auto_auto_auto] items-center gap-3 rounded-lg border border-(--hairline-color) bg-(--container-color)/60 px-2 py-1.5"
          >
            <UI.Dragging
              wrapperClass="shrink-0"
              container={itemsContainer}
              array={items}
              elementIndex={index}
              onUpdate={(updated) => edit.set("items", updated)}
            />
            <!-- Номер и название на текущем языке (название правится в «Тексты и переводы») -->
            <div class="flex min-w-0 items-baseline gap-2 text-[13px]">
              <span class="shrink-0 font-semibold">{$T("constructor.props.tabs.item", { n: index + 1 })}</span>
              <span class="truncate text-(--muted-color)">{localizeText(tab.name, $Language) || $T("constructor.props.tabs.untitled")}</span>
            </div>
            <CommonSnippets
              snippet="IconsLib"
              initialValue={{
                name: $T("constructor.props.table.type.icon"),
                icon: tab.icon,
                onUpdate: (icon: string) => edit.updateItem("items", index, { icon }),
                icons: { array: ICONS },
                compact: true,
              }}
              {component}
              {onPropertyChange}
            />
            <UI.Switch
              wrapperClass="w-auto"
              label={{ captionRight: $T("constructor.props.disabled") }}
              value={tab.disabled ? 1 : 0}
              onUpdate={(value) => edit.updateItem("items", index, { disabled: value === 1 })}
            />
            {#if items.length > 1}
              <UI.Button
                wrapperClass="w-8 shrink-0"
                variant="primary"
                accent="red"
                content={{ icon: ButtonDelete }}
                onClick={() => edit.removeItem("items", index)}
              />
            {/if}
          </div>
        {/each}
        <div id="item-{items.length}" class="min-h-4"></div>
      </div>
    </PropsGroup>
  {/snippet}
</PropsListModal>
