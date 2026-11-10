<!-- $lib/Joystick/JoystickProps.svelte - панель свойств конструктора для Joystick -->
<script lang="ts">
  import { getContext } from "svelte"
  import { T } from "../locales/i18n"
  import type { UIComponent, IJoystickProps } from "../types"
  import { createPropsEditor, type PropertyChange } from "../propsEditor"
  import { ICONS } from "../icons"
  import CommonSnippets from "../CommonSnippets.svelte"
  import PropsGroup from "../PropsGroup.svelte"

  const {
    component,
    onPropertyChange,
  }: {
    component: UIComponent & { properties: Partial<IJoystickProps> }
    onPropertyChange: (change: PropertyChange<IJoystickProps>) => void
  } = $props()

  const edit = $derived(createPropsEditor(component, onPropertyChange))
  const VARIABLE_OPTIONS = getContext<{ id: string; value: string; name: string }[] | undefined>("DeviceVariables") ?? []
</script>

<div class="flex flex-col gap-2">
  <PropsGroup label={$T("constructor.props.group.general")}>
    <CommonSnippets snippet="Access" {component} {onPropertyChange} />
    <CommonSnippets snippet="Variable" {VARIABLE_OPTIONS} {component} {onPropertyChange} />
    <CommonSnippets snippet="EventHandlerArgument" {component} {onPropertyChange} />
  </PropsGroup>
  <PropsGroup label={$T("constructor.props.group.content")}>
    <CommonSnippets snippet="Label" {component} {onPropertyChange} />
    <CommonSnippets snippet="LabelAlign" {component} {onPropertyChange} />
  </PropsGroup>
  <PropsGroup label={$T("constructor.props.group.appearance")}>
    <CommonSnippets
      snippet="IconsLib"
      initialValue={{
        name: $T("constructor.props.buttonIcon"),
        icon: component.properties.buttonIcon,
        onUpdate: (icon: string) => edit.set("buttonIcon", icon),
        icons: { array: ICONS },
      }}
      {component}
      {onPropertyChange}
    />
    <CommonSnippets snippet="Accent" {component} {onPropertyChange} />
  </PropsGroup>
  <PropsGroup label={$T("constructor.props.group.value")} wrapperClass="mt-3" contentClass="flex-row flex-wrap justify-around gap-2">
    {#each component.properties.axes ?? [] as axis, index (index)}
      <CommonSnippets
        snippet="MinMaxStep"
        initialValue={{
          number: { minNum: axis.minNum, maxNum: axis.maxNum },
          bitMode: index == 2 && axis.name == "",
          onUpdate: (number: { minNum?: number; maxNum?: number }) => edit.updateItem("axes", index, { minNum: number.minNum, maxNum: number.maxNum }),
        }}
        {component}
        {onPropertyChange}
      />
    {/each}
  </PropsGroup>
</div>
