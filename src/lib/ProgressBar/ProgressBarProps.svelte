<!-- $lib/ProgressBar/ProgressBarProps.svelte - панель свойств конструктора для ProgressBar -->
<script lang="ts">
  import { getContext } from "svelte"
  import { Language, T } from "../locales/i18n"
  import { localizeText } from "../locales/localize"
  import type { IProgressBarProps, UIComponent } from "../types"
  import { createPropsEditor, type PropertyChange } from "../propsEditor"
  import * as UI from ".."
  import { optionsStore } from "../options"
  import TextsEditor from "../TextsEditor.svelte"
  import ButtonAdd from "../libIcons/ButtonAdd.svelte"
  import ButtonDelete from "../libIcons/ButtonDelete.svelte"
  import CommonSnippets from "../CommonSnippets.svelte"
  import PropsGroup from "../PropsGroup.svelte"
  import PropsListHeader from "../PropsListHeader.svelte"
  import PropsListModal from "../PropsListModal.svelte"

  const {
    component,
    onPropertyChange,
  }: {
    component: UIComponent<"ProgressBar">
    onPropertyChange: (change: PropertyChange<IProgressBarProps>) => void
  } = $props()

  const edit = $derived(createPropsEditor(component, onPropertyChange))
  const VARIABLE_OPTIONS = getContext<{ id: string; value: string; name: string }[] | undefined>("DeviceVariables") ?? []
  let itemsContainer: HTMLDivElement | null = $state(null)
  /* Колонки строки шкалы: ручка, номер и текст, цвет на две колонки, удаление */
  const ITEM_GRID = "grid-cols-[2rem_minmax(8rem,1fr)_minmax(6rem,1fr)_minmax(0,1fr)_2rem]"
  const items = $derived(component.properties.items ?? [])
  /* Значения предпросмотра в конструкторе - середина шкалы */
  const middle = (number: IProgressBarProps["number"]) => (number?.minNum ?? 0) + ((number?.maxNum ?? 0) - (number?.minNum ?? 0)) / 2
  const previewValue = (list: typeof items, number: IProgressBarProps["number"]) => list.map((item) => ({ Name: item.name, Value: middle(number) }))
</script>

<div class="flex flex-col gap-2">
  <PropsGroup label={$T("constructor.props.group.general")}>
    <CommonSnippets snippet="Access" {component} {onPropertyChange} />
    <CommonSnippets snippet="Variable" {VARIABLE_OPTIONS} {component} {onPropertyChange} />
    <UI.Select
      wrapperClass="!h-14"
      label={{ name: $T("constructor.props.type") }}
      type="buttons"
      options={$optionsStore.SWITCH_OPTIONS.filter((option) => option.value !== "checkbox")}
      value={component.properties.type}
      onUpdate={(type) => edit.set("type", type as IProgressBarProps["type"])}
    />
  </PropsGroup>
  <PropsGroup label={$T("constructor.props.group.value")}>
    <CommonSnippets
      snippet="MinMaxStep"
      initialValue={{
        number: component.properties.number,
        onUpdate: (number: IProgressBarProps["number"]) => onPropertyChange({ properties: { number, value: previewValue(items, number) } }),
      }}
      {component}
      {onPropertyChange}
    />
    <TextsEditor {component} {onPropertyChange} />
  </PropsGroup>
</div>

<PropsListModal label={$T("constructor.props.progressbar.title")} count={items.length} wrapperClass="w-200 h-[70%]">
  {#snippet main()}
    <PropsGroup>
      {#snippet headerActions()}
        <UI.Button
          wrapperClass="w-8"
          content={{ icon: ButtonAdd }}
          onClick={() => {
            const next = [...items, { name: "", accent: "blue" as const }]
            onPropertyChange({ properties: { items: next, value: previewValue(next, component.properties.number) } })
          }}
        />
      {/snippet}

      <div bind:this={itemsContainer} class="flex flex-col gap-2">
        {#if items.length}
          <PropsListHeader gridClass={ITEM_GRID} captions={["", $T("constructor.props.item"), $T("constructor.props.colors"), "", ""]} />
        {/if}
        {#each items as progress, index (index)}
          <div id="item-{index}" class="grid {ITEM_GRID} items-center gap-3 rounded-lg border border-(--hairline-color) bg-(--container-color)/60 px-2 py-1.5">
            <UI.Dragging container={itemsContainer} array={items} elementIndex={index} onUpdate={(updated) => edit.set("items", updated)} />
            <div class="flex min-w-0 items-baseline gap-2 text-[13px]">
              <span class="shrink-0 font-semibold">{$T("constructor.props.progressbar.item", { n: index + 1 })}</span>
              <span class="truncate text-(--muted-color)">{localizeText(progress.name, $Language) || $T("constructor.props.tabs.untitled")}</span>
            </div>
            <UI.Select
              wrapperClass="col-span-2"
              type="buttons"
              options={$optionsStore.ACCENT_OPTIONS}
              value={progress.accent}
              onUpdate={(accent) => edit.updateItem("items", index, { accent: accent === progress.accent ? undefined : accent })}
            />
            <UI.Button wrapperClass="w-8" content={{ icon: ButtonDelete }} onClick={() => edit.removeItem("items", index)} />
          </div>
        {/each}
        <div id="item-{items.length}" class="min-h-4"></div>
      </div>
    </PropsGroup>
  {/snippet}
</PropsListModal>
