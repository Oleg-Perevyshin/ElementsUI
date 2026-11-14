<!-- $lib/Switch/SwitchProps.svelte - панель свойств конструктора для Switch -->
<script lang="ts">
  import { getContext } from "svelte"
  import { T } from "../locales/i18n"
  import type { UIComponent, ISwitchProps } from "../types"
  import { createPropsEditor, type PropertyChange } from "../propsEditor"
  import * as UI from ".."
  import { optionsStore } from "../options"
  import ButtonAdd from "../libIcons/ButtonAdd.svelte"
  import ButtonDelete from "../libIcons/ButtonDelete.svelte"
  import CommonSnippets from "../CommonSnippets.svelte"
  import PropsGroup from "../PropsGroup.svelte"
  import PropsListModal from "../PropsListModal.svelte"
  import PropsListHeader from "../PropsListHeader.svelte"

  const {
    component,
    onPropertyChange,
  }: {
    component: UIComponent<"Switch">
    onPropertyChange: (change: PropertyChange<ISwitchProps>) => void
  } = $props()

  const edit = $derived(createPropsEditor(component, onPropertyChange))
  const VARIABLE_OPTIONS = getContext<{ id: string; value: string; name: string }[] | undefined>("DeviceVariables") ?? []
  /* Колонки строки бита: метка, позиция, цвет, отключение, удаление */
  const BIT_GRID = "grid-cols-[minmax(4rem,1fr)_minmax(4rem,1fr)_minmax(0,2fr)_auto_2rem]"
  const bits = $derived(component.properties.options ?? [])
  const bitMode = $derived(!!component.properties.bitMode)
</script>

<div class="flex flex-col gap-2">
  <PropsGroup label={$T("constructor.props.group.general")}>
    <CommonSnippets snippet="Access" {component} {onPropertyChange} />
    <CommonSnippets snippet="Variable" {VARIABLE_OPTIONS} {component} {onPropertyChange} />
    <CommonSnippets snippet="EventHandlerArgument" {component} {onPropertyChange} />
  </PropsGroup>
  <PropsGroup label={$T("constructor.props.group.behavior")}>
    <UI.Select
      wrapperClass="!h-14"
      label={{ name: $T("constructor.props.type") }}
      help={{ info: $T("constructor.props.switch.type.info") }}
      type="buttons"
      options={$optionsStore.SWITCH_OPTIONS.map((option) => ({ ...option, disabled: bitMode && option.value == "checkbox" }))}
      value={component.properties.type}
      onUpdate={(type) => edit.set("type", type)}
    />
    {#if !bitMode}
      <CommonSnippets snippet="Disabled" {component} {onPropertyChange} />
    {/if}
  </PropsGroup>
  <PropsGroup label={$T("constructor.props.group.appearance")}>
    <CommonSnippets snippet="Label" {component} {onPropertyChange} />
    <CommonSnippets snippet="LabelAlign" {component} {onPropertyChange} />
    {#if !bitMode}
      <CommonSnippets snippet="Accent" initialValue={{ exclude: ["gray"] }} {component} {onPropertyChange} />
    {/if}
    {#if component.properties.type != "checkbox"}
      <UI.Switch
        label={{ name: $T("constructor.props.bitMode") }}
        help={{ info: $T("constructor.props.switch.bitMode.info") }}
        value={bitMode ? 1 : 0}
        onUpdate={(value) => onPropertyChange({ properties: { bitMode: value === 1, value: 0 } })}
      />
    {/if}
  </PropsGroup>
</div>

{#if bitMode}
  <PropsListModal label={$T("constructor.props.bits.title")} count={bits.length} wrapperClass="w-200 h-[70%]">
    {#snippet main()}
      <PropsGroup>
        {#snippet headerActions()}
          {#if bits.length < 32}
            <UI.Button
              wrapperClass="w-8"
              content={{ icon: ButtonAdd }}
              onClick={() => edit.addItem("options", { id: crypto.randomUUID(), name: String(bits.length), value: bits.length, accent: "blue" })}
            />
          {/if}
        {/snippet}

        {#if bits.length}
          <PropsListHeader
            gridClass={BIT_GRID}
            captions={[$T("constructor.props.optionname"), $T("constructor.props.optionposition"), $T("constructor.props.colors"), "", ""]}
          />
        {/if}
        {#each bits as bit, index (bit.id ?? index)}
          <div class="grid {BIT_GRID} items-center gap-3 rounded-lg border border-(--hairline-color) bg-(--container-color)/60 px-2 py-1.5">
            <!-- Имя варианта - короткая метка бита (до 4 символов), не переводится -->
            <UI.Input value={bit.name} maxlength={4} onUpdate={(value) => edit.updateItem("options", index, { name: String(value) })} />
            <UI.Input
              value={bit.value}
              type="number"
              number={{ minNum: 0, maxNum: 31, step: 1 }}
              onUpdate={(value) => edit.updateItem("options", index, { value: Number(value) })}
            />
            <UI.Select
              type="buttons"
              options={$optionsStore.ACCENT_OPTIONS.filter((option) => option.value !== "gray")}
              value={bit.accent}
              onUpdate={(accent) => edit.updateItem("options", index, { accent: accent === bit.accent ? undefined : accent })}
            />
            <UI.Switch
              label={{ captionRight: $T("constructor.props.disabled") }}
              help={{ info: $T("constructor.props.switch.bit.disabled.info") }}
              value={bit.disabled ? 1 : 0}
              onUpdate={(value) => edit.updateItem("options", index, { disabled: value === 1 })}
            />
            {#if bits.length > 1}
              <UI.Button wrapperClass="w-8" variant="primary" accent="red" content={{ icon: ButtonDelete }} onClick={() => edit.removeItem("options", index)} />
            {:else}
              <span></span>
            {/if}
          </div>
        {/each}
      </PropsGroup>
    {/snippet}
  </PropsListModal>
{/if}
