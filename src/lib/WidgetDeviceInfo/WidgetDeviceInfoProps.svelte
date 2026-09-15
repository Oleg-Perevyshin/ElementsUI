<!-- $lib/WidgetDeviceInfo/WidgetDeviceInfoProps.svelte — панель пропсов конструктора
     для WidgetDeviceInfo. Виджет простой, полей мало — панель тоже простая: заголовок + мастер-цвет. -->
<script lang="ts">
  import { T } from "$lib/locales/i18n"
  import * as UI from "$lib"
  import { updateProperty, type UIComponent, type IWidgetDeviceInfoProps, type IWidgetDeviceInfoConfig, type IOption } from "../types"
  import WidgetAccentPicker from "../WidgetAccentPicker.svelte"
  import PropsGroup from "$lib/PropsGroup.svelte"
  import { optionsStore } from "../options"

  const DEVICE_INFO_KEYS: (keyof IWidgetDeviceInfoConfig)[] = ["DevSN", "DevID", "DevFW", "RunCnt", "DevName", "HostName", "WebUser", "WebPsw"]

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
    label={{ name: "Заголовок пакета" }}
    type="buttons"
    options={$optionsStore.HEADER_OPTIONS}
    value={$optionsStore.HEADER_OPTIONS.find((o) => o.value === (component.properties.restartCommand?.header || "SET"))}
    onUpdate={(option) => updateProperty("restartCommand.header", (option as IOption<string>).value as string, component, onPropertyChange)}
  />
  <UI.Input
    label={{ name: "Аргумент" }}
    value={component.properties.restartCommand?.argument ?? "Restart"}
    onUpdate={(value) => updateProperty("restartCommand.argument", value as string, component, onPropertyChange)}
  />
{/snippet}

<div class="flex flex-col gap-2">
  <PropsGroup label={$T("constructor.props.group.general")}>
    <UI.Input
      label={{ name: "Заголовок" }}
      value={component.properties.label?.name}
      onUpdate={(value) => updateProperty("label.name", value as string, component, onPropertyChange)}
    />
    <UI.Input
      label={{ name: "Префикс группы (ID)" }}
      value={component.properties.id}
      onUpdate={(value) => updateProperty("id", value as string, component, onPropertyChange)}
    />
    <WidgetAccentPicker
      value={component.properties.componentClass ?? ""}
      onUpdate={(value) => updateProperty("componentClass", value, component, onPropertyChange)}
    />
  </PropsGroup>
  <PropsGroup label="Ключи устройства">
    {@render WidgetKeys()}
  </PropsGroup>
  <PropsGroup label="Команда перезагрузки">
    {@render WidgetRestartCommand()}
  </PropsGroup>
</div>
