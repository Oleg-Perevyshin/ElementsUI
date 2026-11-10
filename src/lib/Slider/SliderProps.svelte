<!-- $lib/Slider/SliderProps.svelte - панель свойств конструктора для Slider -->
<script lang="ts">
  import { getContext } from "svelte"
  import { T } from "../locales/i18n"
  import type { UIComponent, ISliderProps } from "../types"
  import type { PropertyChange } from "../propsEditor"
  import * as UI from ".."
  import { optionsStore } from "../options"
  import CommonSnippets from "../CommonSnippets.svelte"
  import PropsGroup from "../PropsGroup.svelte"

  const {
    component,
    onPropertyChange,
  }: {
    component: UIComponent<"Slider">
    onPropertyChange: (change: PropertyChange<ISliderProps>) => void
  } = $props()

  const VARIABLE_OPTIONS = getContext<{ id: string; value: string; name: string }[] | undefined>("DeviceVariables") ?? []
</script>

<div class="flex flex-col gap-2">
  <PropsGroup label={$T("constructor.props.group.general")}>
    <CommonSnippets snippet="Access" {component} {onPropertyChange} />
    <CommonSnippets snippet="Variable" {VARIABLE_OPTIONS} {component} {onPropertyChange} />
    <CommonSnippets snippet="EventHandlerArgument" {component} {onPropertyChange} />
  </PropsGroup>
  <PropsGroup label={$T("constructor.props.group.value")}>
    <UI.Select
      label={{ name: $T("constructor.props.type") }}
      type="buttons"
      value={component.properties.type ?? "single"}
      options={$optionsStore.SLIDER_TYPE_OPTIONS}
      onUpdate={(type) => onPropertyChange({ properties: { type, value: type === "single" ? 5 : [2, 7] } })}
    />
    <CommonSnippets
      snippet="MinMaxStep"
      initialValue={{ number: component.properties.number, onUpdate: (number: ISliderProps["number"]) => onPropertyChange({ properties: { number } }) }}
      {component}
      {onPropertyChange}
    />
  </PropsGroup>
  <PropsGroup label={$T("constructor.props.group.appearance")}>
    <CommonSnippets snippet="Label" {component} {onPropertyChange} />
    <CommonSnippets snippet="LabelAlign" {component} {onPropertyChange} />
    <CommonSnippets snippet="Accent" initialValue={{ exclude: ["gray"] }} {component} {onPropertyChange} />
  </PropsGroup>
</div>
