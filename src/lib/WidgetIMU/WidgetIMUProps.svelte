<!-- $lib/WidgetIMU/WidgetIMUProps.svelte - панель пропсов конструктора для WidgetIMU (IMU): заголовок, префикс группы (по умолчанию IMUF), мастер-цвет. -->
<script lang="ts">
  import TextsEditor from "../TextsEditor.svelte"
  import { T } from "../locales/i18n"
  import * as UI from ".."
  import type { UIComponent, IWidgetIMUProps } from "../types"
  import { createPropsEditor, type PropertyChange } from "../propsEditor"
  import PropsGroup from "../PropsGroup.svelte"
  import CommonSnippets from "../CommonSnippets.svelte"
  import { WIDGET_FIELDS, groupRegExp, prefixMaxLen } from "../gui"
  import { sensorChipOptions } from "../sensorChips"

  const {
    component,
    onPropertyChange,
  }: {
    component: UIComponent<"WidgetIMU">
    onPropertyChange: (change: PropertyChange<IWidgetIMUProps>) => void
  } = $props()

  const edit = $derived(createPropsEditor(component, onPropertyChange))
  /* Полный ключ «группа.поле» до 15 символов: группа ограничена самым длинным полем */
  const PREFIX_MAX = prefixMaxLen(Object.keys(WIDGET_FIELDS.WidgetIMU))
</script>

<div class="flex flex-col gap-2">
  <PropsGroup label={$T("constructor.props.group.general")}>
    <TextsEditor {component} {onPropertyChange} />
    <UI.Input
      label={{ name: $T("widget.imu.group") }}
      maxlength={PREFIX_MAX}
      help={{ info: $T("widget.imu.group.info"), regExp: groupRegExp(PREFIX_MAX) }}
      value={component.properties.id ?? "IMUF"}
      onUpdate={(value) => edit.set("id", value as string)}
    />
    <!-- Микросхема: по ней виджет показывает настройки датчика (поля Cfg); «Нет» - только показания и калибровка -->
    <UI.Select
      label={{ name: $T("sensor.chip") }}
      help={{ info: $T("sensor.chip.info") }}
      options={[{ id: "chip-none", name: $T("sensor.chip.none"), value: "" }, ...sensorChipOptions("imu").map((o) => ({ id: `chip-${o.value}`, ...o }))]}
      value={component.properties.chip ?? ""}
      onUpdate={(value) => edit.set("chip", (value as string) || undefined)}
    />
    <CommonSnippets snippet="Accent" {component} {onPropertyChange} />
  </PropsGroup>
</div>
