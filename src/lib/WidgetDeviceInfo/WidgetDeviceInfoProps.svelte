<!-- $lib/WidgetDeviceInfo/WidgetDeviceInfoProps.svelte - панель пропсов конструктора для WidgetDeviceInfo: заголовок/мастер-цвет/префикс группы, переопределение имён полей устройства (keys) и команда перезагрузки - все с дефолтами, равными текущей прошивочной конвенции (см. DEFAULT_PROPS.WidgetDeviceInfo в DevCloud). -->
<script lang="ts">
  import TextsEditor from "../TextsEditor.svelte"
  import { T } from "../locales/i18n"
  import * as UI from ".."
  import type { UIComponent, IWidgetDeviceInfoProps, IWidgetDeviceInfoConfig } from "../types"
  import { createPropsEditor, type PropertyChange } from "../propsEditor"
  import PropsGroup from "../PropsGroup.svelte"
  import CommonSnippets from "../CommonSnippets.svelte"
  import { optionsStore } from "../options"

  const DEVICE_INFO_KEYS: (keyof IWidgetDeviceInfoConfig)[] = ["DevSN", "DevID", "DevFW", "RunCnt", "DevName", "HostName", "WebUser", "WebPsw", "StaIP", "ApIP"]

  const {
    component,
    onPropertyChange,
  }: {
    component: UIComponent & { properties: Partial<IWidgetDeviceInfoProps> }
    onPropertyChange: (change: PropertyChange<IWidgetDeviceInfoProps>) => void
  } = $props()

  const edit = $derived(createPropsEditor(component, onPropertyChange))
</script>

{#snippet WidgetKeys()}
  {#each DEVICE_INFO_KEYS as key (key)}
    <UI.Input label={{ name: key }} value={component.properties.keys?.[key] ?? key} onUpdate={(value) => edit.patch("keys", { [key]: String(value) })} />
  {/each}
{/snippet}

{#snippet WidgetCommand(path: "restartCommand" | "resetCommand", defaultArgument: string)}
  <UI.Select
    label={{ name: $T("widget.common.packet_header") }}
    type="buttons"
    options={$optionsStore.HEADER_OPTIONS}
    value={component.properties[path]?.header || "SET"}
    onUpdate={(header) => edit.patch(path, { header })}
  />
  <UI.Input
    label={{ name: $T("widget.common.argument") }}
    value={component.properties[path]?.argument ?? defaultArgument}
    onUpdate={(value) => edit.patch(path, { argument: String(value) })}
  />
{/snippet}

<div class="flex flex-col gap-2">
  <PropsGroup label={$T("constructor.props.group.general")}>
    <TextsEditor {component} {onPropertyChange} />
    <UI.Input label={{ name: $T("widget.common.group_prefix") }} value={component.properties.id} onUpdate={(value) => edit.set("id", value as string)} />
    <CommonSnippets snippet="Accent" {component} {onPropertyChange} />
  </PropsGroup>
  <PropsGroup label={$T("widget.common.device_keys")}>
    {@render WidgetKeys()}
  </PropsGroup>
  <PropsGroup label={$T("widget.info.restart_command")}>
    {@render WidgetCommand("restartCommand", "Restart")}
  </PropsGroup>
  <PropsGroup label={$T("widget.info.reset_command")}>
    {@render WidgetCommand("resetCommand", "RstNVS")}
  </PropsGroup>
</div>
