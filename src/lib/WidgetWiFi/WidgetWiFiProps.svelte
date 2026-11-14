<!-- $lib/WidgetWiFi/WidgetWiFiProps.svelte - панель пропсов конструктора для WidgetWiFi. Виджет - самостоятельный тип компонента (не набор примитивов с привязкой полей), поэтому и панель проще: не "к какой переменной привязать", а "как виджет себя ведёт". -->
<script lang="ts">
  import { WIDGET_FIELDS } from "../gui"
  import TextsEditor from "../TextsEditor.svelte"
  import { T } from "../locales/i18n"
  import * as UI from ".."
  import type { UIComponent, IWidgetWiFiProps, IWidgetWiFiConfig, IOption } from "../types"
  import { createPropsEditor, type PropertyChange } from "../propsEditor"
  import PropsGroup from "../PropsGroup.svelte"
  import ArgumentSelect from "../ArgumentSelect.svelte"
  import CommonSnippets from "../CommonSnippets.svelte"
  import { optionsStore } from "../options"

  const WIFI_KEYS = Object.keys(WIDGET_FIELDS.WidgetWiFi) as (keyof IWidgetWiFiConfig)[]

  const {
    component,
    onPropertyChange,
  }: {
    component: UIComponent<"WidgetWiFi">
    onPropertyChange: (change: PropertyChange<IWidgetWiFiProps>) => void
  } = $props()

  const edit = $derived(createPropsEditor(component, onPropertyChange))

  const MODE_OPTIONS: IOption<number>[] = [
    { id: "sta", name: "STA", value: 1 },
    { id: "ap", name: "AP", value: 2 },
    { id: "apsta", name: "STA + AP", value: 3 },
  ]
</script>

{#snippet WidgetLabel()}
  <TextsEditor {component} {onPropertyChange} />
{/snippet}

{#snippet WidgetGroupPrefix()}
  <UI.Input
    label={{ name: $T("widget.common.group_prefix") }}
    help={{ info: $T("widget.common.group_prefix.info") }}
    value={component.properties.id}
    onUpdate={(value) => edit.set("id", value as string)}
  />
{/snippet}

{#snippet WidgetKeys()}
  {#each WIFI_KEYS as key (key)}
    <UI.Input
      label={{ name: key }}
      help={{ info: $T("widget.common.key.info") }}
      value={component.properties.keys?.[key] ?? key}
      onUpdate={(value) => edit.patch("keys", { [key]: String(value) })}
    />
  {/each}
{/snippet}

{#snippet WidgetScanCommand()}
  <UI.Select
    label={{ name: $T("widget.common.packet_header") }}
    help={{ info: $T("constructor.props.button.header.info") }}
    type="buttons"
    options={$optionsStore.HEADER_OPTIONS}
    value={component.properties.scanCommand?.header || "GET"}
    onUpdate={(option) => edit.patch("scanCommand", { header: option })}
  />
  <ArgumentSelect
    label={$T("widget.common.argument")}
    value={component.properties.scanCommand?.argument ?? "APsList"}
    onUpdate={(argument) => edit.patch("scanCommand", { argument })}
  />
{/snippet}

{#snippet WidgetAllowedModes()}
  <UI.Select
    label={{ name: $T("widget.wifi.allowed_modes") }}
    help={{ info: $T("widget.wifi.allowed_modes.info") }}
    type="buttons"
    multiSelect
    options={MODE_OPTIONS}
    value={component.properties.allowedModes ?? [1, 2, 3]}
    onUpdate={(modes) => edit.set("allowedModes", modes)}
  />
{/snippet}

{#snippet WidgetConfirmAP()}
  <UI.Switch
    label={{ name: $T("widget.wifi.ap_confirm") }}
    help={{ info: $T("widget.wifi.ap_confirm.info") }}
    value={component.properties.confirmOnAP === false ? 0 : 1}
    onUpdate={(value) => edit.set("confirmOnAP", value === 1)}
  />
{/snippet}

{#snippet WidgetColor()}
  <CommonSnippets snippet="Accent" {component} {onPropertyChange} />
{/snippet}

<div class="flex flex-col gap-2">
  <PropsGroup label={$T("constructor.props.group.general")}>
    {@render WidgetLabel()}
    {@render WidgetGroupPrefix()}
    {@render WidgetAllowedModes()}
    {@render WidgetColor()}
  </PropsGroup>
  <PropsGroup label={$T("constructor.props.group.behavior")}>
    {@render WidgetConfirmAP()}
  </PropsGroup>
  <PropsGroup label={$T("widget.common.device_keys")}>
    {@render WidgetKeys()}
  </PropsGroup>
  <PropsGroup label={$T("widget.wifi.scan_command")}>
    {@render WidgetScanCommand()}
  </PropsGroup>
</div>
