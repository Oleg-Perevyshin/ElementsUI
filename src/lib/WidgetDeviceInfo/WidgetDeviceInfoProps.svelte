<!-- $lib/WidgetDeviceInfo/WidgetDeviceInfoProps.svelte — панель пропсов конструктора
     для WidgetDeviceInfo: заголовок/мастер-цвет/префикс группы, переопределение имён полей
     устройства (keys) и команда перезагрузки — все с дефолтами, равными текущей прошивочной
     конвенции (см. DEFAULT_PROPS.WidgetDeviceInfo в DevCloud). -->
<script lang="ts">
  import TextsEditor from "../TextsEditor.svelte"
  import { T } from "$lib/locales/i18n"
  import * as UI from "$lib"
  import { updateProperty, type UIComponent, type IWidgetDeviceInfoProps, type IWidgetDeviceInfoConfig, type IOption } from "../types"
  import WidgetAccentPicker from "../WidgetAccentPicker.svelte"
  import PropsGroup from "$lib/PropsGroup.svelte"
  import { optionsStore } from "../options"

  const DEVICE_INFO_KEYS: (keyof IWidgetDeviceInfoConfig)[] = ["DevSN", "DevID", "DevFW", "RunCnt", "DevName", "HostName", "WebUser", "WebPsw", "StaIP", "ApIP"]

  const { component, onPropertyChange } = $props<{
    component: UIComponent & { properties: Partial<IWidgetDeviceInfoProps> }
    onPropertyChange: (updates: Partial<{ properties?: string | object; name?: string; access?: string }>) => void
  }>()
</script>

{#snippet WidgetKeys()}
  {#each DEVICE_INFO_KEYS as key (key)}
    <UI.Input
      label={{ name: key }}
      value={component.properties.keys?.[key] ?? key}
      onUpdate={(value) => updateProperty(`keys.${key}`, value as string, component, onPropertyChange)}
    />
  {/each}
{/snippet}

{#snippet WidgetRestartCommand()}
  <UI.Select
    label={{ name: $T("widget.common.packet_header") }}
    type="buttons"
    options={$optionsStore.HEADER_OPTIONS}
    value={$optionsStore.HEADER_OPTIONS.find((o) => o.value === (component.properties.restartCommand?.header || "SET"))}
    onUpdate={(option) => updateProperty("restartCommand.header", (option as IOption<string>).value as string, component, onPropertyChange)}
  />
  <UI.Input
    label={{ name: $T("widget.common.argument") }}
    value={component.properties.restartCommand?.argument ?? "Restart"}
    onUpdate={(value) => updateProperty("restartCommand.argument", value as string, component, onPropertyChange)}
  />
{/snippet}

<div class="flex flex-col gap-2">
  <PropsGroup label={$T("constructor.props.group.general")}>
    <TextsEditor {component} {onPropertyChange} />
    <UI.Input
      label={{ name: $T("widget.common.group_prefix") }}
      value={component.properties.id}
      onUpdate={(value) => updateProperty("id", value as string, component, onPropertyChange)}
    />
    <WidgetAccentPicker
      value={component.properties.componentClass ?? ""}
      onUpdate={(value) => updateProperty("componentClass", value, component, onPropertyChange)}
    />
  </PropsGroup>
  <PropsGroup label={$T("widget.common.device_keys")}>
    {@render WidgetKeys()}
  </PropsGroup>
  <PropsGroup label={$T("widget.info.restart_command")}>
    {@render WidgetRestartCommand()}
  </PropsGroup>
</div>
