<!-- $lib/Select/SelectProps.svelte - панель свойств конструктора для Select -->
<script lang="ts">
  import { getContext } from "svelte"
  import { Language, T } from "../locales/i18n"
  import type { UIComponent, ISelectProps, IOption } from "../types"
  import { createPropsEditor, optionByClass, type PropertyChange } from "../propsEditor"
  import * as UI from ".."
  import ButtonDelete from "../libIcons/ButtonDelete.svelte"
  import ButtonAdd from "../libIcons/ButtonAdd.svelte"
  import { optionsStore } from "../options"
  import CommonSnippets from "../CommonSnippets.svelte"
  import PropsGroup from "../PropsGroup.svelte"
  import PropsListModal from "../PropsListModal.svelte"
  import PropsListHeader from "../PropsListHeader.svelte"
  import { localizeText } from "../locales/localize"
  import { twMerge } from "tailwind-merge"

  const {
    component,
    onPropertyChange,
  }: {
    component: UIComponent<"Select">
    onPropertyChange: (change: PropertyChange<ISelectProps<unknown, boolean>>) => void
  } = $props()

  const edit = $derived(createPropsEditor(component, onPropertyChange))
  const VARIABLE_OPTIONS = getContext<{ id: string; value: string; name: string }[] | undefined>("DeviceVariables") ?? []

  let itemsContainer: HTMLDivElement | null = $state(null)
  /* Колонки строки варианта: ручка, номер и текст, значение, цвет, удаление */
  const OPTION_GRID = "grid-cols-[2rem_minmax(8rem,1fr)_minmax(6rem,1fr)_minmax(0,2fr)_2rem]"

  const options = $derived(component.properties.options ?? [])
  const valueType = $derived(typeof options[0]?.value === "number" ? "number" : "text")
  /* Диапазон битов bitMode; без range в свойствах - один нулевой бит */
  const bitRange = $derived(component.properties.range ?? { start: 0, end: 0 })
  const bitMax = $derived(Math.pow(2, bitRange.end - bitRange.start + 1) - 1)
  const contentAlignOptions = $derived($optionsStore.TEXT_ALIGN_OPTIONS.slice(0, -1))

  /* Argument пуст - поле ниже лишь визуально показывает "ModCfg", реальное значение нужно проставить в состояние */
  $effect(() => {
    if (!component.eventHandler?.Argument) onPropertyChange({ eventHandler: { Argument: "ModCfg" } })
  })
</script>

<div class="flex flex-col gap-2">
  <PropsGroup label={$T("constructor.props.group.general")}>
    <CommonSnippets snippet="Access" {component} {onPropertyChange} />
    <CommonSnippets snippet="Variable" {VARIABLE_OPTIONS} {component} {onPropertyChange} />
    <UI.Input
      label={{ name: $T("constructor.props.argument") }}
      value={component.eventHandler?.Argument || "ModCfg"}
      maxlength={32}
      help={{ info: $T("constructor.props.argument.info"), autocomplete: "on", regExp: /^[a-zA-Z0-9\-_]{0,32}$/ }}
      onUpdate={(value) => onPropertyChange({ eventHandler: { Argument: String(value) } })}
    />
  </PropsGroup>
  <PropsGroup label={$T("constructor.props.group.value")}>
    <UI.Select
      label={{ name: $T("constructor.props.type") }}
      type="buttons"
      value={component.properties.type}
      options={$optionsStore.SELECT_TYPE_OPTIONS}
      onUpdate={(type) =>
        onPropertyChange({
          properties: {
            type,
            /* Несколько значений - только у кнопок */
            ...(type !== "buttons" && Array.isArray(component.properties.value) ? { value: component.properties.value[0], multiSelect: false } : {}),
          },
        })}
    />
    <UI.Select
      wrapperClass="h-14"
      label={{ name: $T("constructor.props.valuetype") }}
      type="buttons"
      disabled={component.properties.bitMode}
      options={$optionsStore.SELECT_VALUE_TYPE_OPTIONS}
      value={valueType}
      onUpdate={(type) =>
        edit.set(
          "options",
          options.map((option) => ({ ...option, value: type === "number" ? Number(option.value ?? 0) || 0 : String(option.value ?? "") })),
        )}
    />
    <CommonSnippets snippet="BitModeInfo" {component} {onPropertyChange} />
  </PropsGroup>
  <PropsGroup label={$T("constructor.props.group.appearance")}>
    <CommonSnippets snippet="Label" {component} {onPropertyChange} />
    <CommonSnippets snippet="LabelAlign" {component} {onPropertyChange} />
    <UI.Select
      label={{ name: $T("constructor.props.align.content") }}
      type="buttons"
      value={optionByClass(contentAlignOptions, component.properties.componentClass)?.value ?? "text-left"}
      options={contentAlignOptions}
      onUpdate={(align) => edit.set("componentClass", twMerge(component.properties.componentClass, align))}
    />
    <UI.Switch
      label={{ name: $T("constructor.props.bitMode") }}
      value={component.properties.bitMode ? 1 : 0}
      onUpdate={(value) =>
        onPropertyChange({
          properties: {
            bitMode: value === 1,
            options: options.map((option) => ({ ...option, value: Math.min(Math.max(Number(option.value) || 0, 0), bitMax) })),
          },
        })}
    />
    {#if component.properties.type === "buttons" && !component.properties.bitMode}
      <UI.Switch
        label={{ name: $T("constructor.props.multiselect") }}
        value={component.properties.multiSelect ? 1 : 0}
        onUpdate={(value) => edit.set("multiSelect", value === 1)}
      />
    {/if}
    {#if component.properties.bitMode}
      <UI.Slider
        label={{ name: $T("constructor.props.range") }}
        type="range"
        number={{ minNum: 0, maxNum: 31, step: 1 }}
        value={[bitRange.start, bitRange.end]}
        onUpdate={(value) => Array.isArray(value) && edit.set("range", { start: value[0], end: value[1] })}
      />
    {/if}
  </PropsGroup>
</div>

<PropsListModal label={$T("constructor.props.options.title")} count={options.length} wrapperClass="w-200 h-[70%]">
  {#snippet main()}
    <PropsGroup>
      {#snippet headerActions()}
        <UI.Button
          wrapperClass="w-8"
          content={{ icon: ButtonAdd }}
          onClick={() =>
            edit.addItem("options", {
              id: crypto.randomUUID(),
              name: "",
              value: valueType === "number" ? options.length + 1 : String(options.length + 1),
            } as IOption)}
        />
      {/snippet}

      <div bind:this={itemsContainer} class="flex flex-col gap-2">
        {#if options.length}
          <PropsListHeader
            gridClass={OPTION_GRID}
            captions={["", $T("constructor.props.item"), $T("constructor.props.optionvalue"), $T("constructor.props.colors"), ""]}
          />
        {/if}
        {#each options as option, index (option.id ?? index)}
          <div
            id="item-{index}"
            class="grid {OPTION_GRID} items-center gap-3 rounded-lg border border-(--hairline-color) bg-(--container-color)/60 px-2 py-1.5"
          >
            <UI.Dragging container={itemsContainer} array={options} elementIndex={index} onUpdate={(updated) => edit.set("options", updated)} />
            <div class="flex min-w-0 items-baseline gap-2 text-[13px]">
              <span class="shrink-0 font-semibold">{$T("constructor.props.options.item", { n: index + 1 })}</span>
              <span class="truncate text-(--muted-color)">{localizeText(option.name, $Language) || $T("constructor.props.tabs.untitled")}</span>
            </div>
            <UI.Input
              value={option.value as string | number | undefined}
              type={valueType}
              number={component.properties.bitMode ? { minNum: 0, maxNum: bitMax, step: 1 } : { minNum: -1000000, maxNum: 1000000, step: 1 }}
              onUpdate={(value) => edit.updateItem("options", index, { value })}
            />
            <UI.Select
              type="buttons"
              options={$optionsStore.ACCENT_OPTIONS}
              value={option.accent}
              onUpdate={(accent) => edit.updateItem("options", index, { accent: accent === option.accent ? undefined : accent })}
            />
            <UI.Button wrapperClass="w-8" content={{ icon: ButtonDelete }} onClick={() => edit.removeItem("options", index)} />
          </div>
        {/each}
        <div id="item-{options.length}" class="min-h-4"></div>
      </div>
    </PropsGroup>
  {/snippet}
</PropsListModal>
