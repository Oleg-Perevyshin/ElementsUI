<!-- $lib/Widget/WidgetProps.svelte - панель свойств конструктора для Widget -->
<script lang="ts">
  import { getContext } from "svelte"
  import { T } from "../locales/i18n"
  import type { IWidgetProps, UIComponent } from "../types"
  import { createPropsEditor, type PropertyChange } from "../propsEditor"
  import * as UI from ".."
  import { optionsStore } from "../options"
  import { ICONS_ARRAY } from "../icons"
  import CommonSnippets from "../CommonSnippets.svelte"
  import PropsGroup from "../PropsGroup.svelte"

  const {
    component,
    onPropertyChange,
  }: {
    component: UIComponent & { properties: Partial<IWidgetProps> }
    onPropertyChange: (change: PropertyChange<IWidgetProps>) => void
  } = $props()

  const edit = $derived(createPropsEditor(component, onPropertyChange))
  const VARIABLE_OPTIONS = getContext<{ id: string; value: string; name: string }[] | undefined>("DeviceVariables") ?? []
  const settings = $derived(component.properties.settings)
</script>

<div class="flex flex-col gap-2">
  <PropsGroup label={$T("constructor.props.group.general")}>
    <CommonSnippets snippet="Access" {component} {onPropertyChange} />
    <CommonSnippets snippet="Variable" {VARIABLE_OPTIONS} {component} {onPropertyChange} />
    <CommonSnippets snippet="EventHandlerArgument" {component} {onPropertyChange} />
  </PropsGroup>
  <PropsGroup label={$T("constructor.props.group.content")}>
    <CommonSnippets snippet="Label" {component} {onPropertyChange} />
    <CommonSnippets
      snippet="IconsLib"
      initialValue={{
        name: $T("constructor.props.labelicon"),
        icon: component.properties.icons?.array,
        onUpdate: (array: string[]) => edit.patch("icons", { array }),
        icons: { array: ICONS_ARRAY, selectArray: true },
      }}
      {component}
      {onPropertyChange}
    />
    <UI.Switch
      label={{ name: $T("constructor.props.widget.mode") }}
      value={component.properties.icons?.cycling ? 1 : 0}
      onUpdate={(value) => edit.set("icons", { array: [], ...component.properties.icons, cycling: value === 1 })}
    />
  </PropsGroup>
  <PropsGroup label={$T("constructor.props.group.appearance")}>
    <CommonSnippets snippet="Accent" initialValue={{ exclude: [""] }} {component} {onPropertyChange} />
    <UI.Select
      label={{ name: $T("constructor.props.settings.type") }}
      type="buttons"
      options={$optionsStore.WIDGET_TYPE_OPTIONS}
      value={settings?.type}
      onUpdate={(type) => edit.patch("settings", { type })}
    />
    {#if settings?.type == "input" || settings?.type == "slider"}
      <CommonSnippets
        snippet="MinMaxStep"
        initialValue={{ number: settings?.number, onUpdate: (number: NonNullable<IWidgetProps["settings"]>["number"]) => edit.patch("settings", { number }) }}
        {component}
        {onPropertyChange}
      />
    {/if}
  </PropsGroup>
</div>
