<!-- $lib/WidgetWiFi/WidgetWiFiProps.svelte — панель пропсов конструктора для WidgetWiFi.
     Виджет — самостоятельный тип компонента (не набор примитивов с привязкой полей),
     поэтому и панель проще: не "к какой переменной привязать", а "как виджет себя ведёт". -->
<script lang="ts">
  import TextsEditor from "../TextsEditor.svelte"
  import { T } from "$lib/locales/i18n"
  import * as UI from "$lib"
  import { updateProperty, type UIComponent, type IWidgetWiFiProps, type IWidgetWiFiConfig, type IOption } from "../types"
  import WidgetAccentPicker from "../WidgetAccentPicker.svelte"
  import PropsGroup from "$lib/PropsGroup.svelte"
  import { optionsStore } from "../options"

  const WIFI_KEYS: (keyof IWidgetWiFiConfig)[] = [
    "WiFiMode",
    "StaSSID",
    "StaPSK",
    "StaticIP",
    "StaIP",
    "StaMS",
    "StaGW",
    "ApSSID",
    "ApPSK",
    "ApIP",
    "ApMS",
    "ApGW",
  ]

  const { component, onPropertyChange } = $props<{
    component: UIComponent & { properties: Partial<IWidgetWiFiProps> }
    onPropertyChange: (updates: Partial<{ properties?: string | object; name?: string; access?: string }>) => void
  }>()

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
    value={component.properties.id}
    onUpdate={(value) => updateProperty("id", value as string, component, onPropertyChange)}
  />
{/snippet}

{#snippet WidgetKeys()}
  {#each WIFI_KEYS as key (key)}
    <UI.Input
      label={{ name: key }}
      value={component.properties.keys?.[key] ?? key}
      onUpdate={(value) => updateProperty(`keys.${key}`, value as string, component, onPropertyChange)}
    />
  {/each}
{/snippet}

{#snippet WidgetScanCommand()}
  <UI.Select
    label={{ name: $T("widget.common.packet_header") }}
    type="buttons"
    options={$optionsStore.HEADER_OPTIONS}
    value={$optionsStore.HEADER_OPTIONS.find((o) => o.value === (component.properties.scanCommand?.header || "GET"))}
    onUpdate={(option) => updateProperty("scanCommand.header", (option as IOption<string>).value as string, component, onPropertyChange)}
  />
  <UI.Input
    label={{ name: $T("widget.common.argument") }}
    value={component.properties.scanCommand?.argument ?? "APsList"}
    onUpdate={(value) => updateProperty("scanCommand.argument", value as string, component, onPropertyChange)}
  />
{/snippet}

{#snippet WidgetAllowedModes()}
  <UI.Select
    label={{ name: $T("widget.wifi.allowed_modes") }}
    type="buttons"
    multiSelect={true}
    options={MODE_OPTIONS}
    value={MODE_OPTIONS.filter((o) => (component.properties.allowedModes ?? [1, 2, 3]).includes(o.value as number))}
    onUpdate={(value) => {
      if (Array.isArray(value)) updateProperty("allowedModes", value.map((o) => o.value) as number[], component, onPropertyChange)
    }}
  />
{/snippet}

{#snippet WidgetConfirmAP()}
  <UI.Switch
    label={{ name: $T("widget.wifi.ap_confirm") }}
    value={component.properties.confirmOnAP === false ? 0 : 1}
    options={[{ id: crypto.randomUUID(), value: 0, class: "" }]}
    onChange={(value) => updateProperty("confirmOnAP", value === 1, component, onPropertyChange)}
  />
{/snippet}

{#snippet WidgetColor()}
  <WidgetAccentPicker
    value={component.properties.componentClass ?? ""}
    onUpdate={(value) => updateProperty("componentClass", value, component, onPropertyChange)}
  />
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
