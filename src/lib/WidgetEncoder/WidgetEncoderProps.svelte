<!-- $lib/WidgetEncoder/WidgetEncoderProps.svelte - панель пропсов конструктора для WidgetEncoder (энкодер): заголовок, префикс группы (по умолчанию ENC), микросхема, мастер-цвет. -->
<script lang="ts">
  import TextsEditor from "../TextsEditor.svelte"
  import { T } from "../locales/i18n"
  import * as UI from ".."
  import type { UIComponent, IWidgetEncoderProps } from "../types"
  import { createPropsEditor, type PropertyChange } from "../propsEditor"
  import PropsGroup from "../PropsGroup.svelte"
  import CommonSnippets from "../CommonSnippets.svelte"
  import { WIDGET_FIELDS, groupRegExp, prefixMaxLen } from "../gui"
  import { sensorChipOptions } from "../sensorChips"

  const {
    component,
    onPropertyChange,
  }: {
    component: UIComponent<"WidgetEncoder">
    onPropertyChange: (change: PropertyChange<IWidgetEncoderProps>) => void
  } = $props()

  const edit = $derived(createPropsEditor(component, onPropertyChange))
  /* Полный ключ «группа.поле» до 15 символов: группа ограничена самым длинным полем */
  const PREFIX_MAX = prefixMaxLen(Object.keys(WIDGET_FIELDS.WidgetEncoder))
</script>

<div class="flex flex-col gap-2">
  <PropsGroup label={$T("constructor.props.group.general")}>
    <TextsEditor {component} {onPropertyChange} />
    <UI.Input
      label={{ name: $T("widget.enc.group") }}
      maxlength={PREFIX_MAX}
      help={{ info: $T("widget.enc.group.info"), regExp: groupRegExp(PREFIX_MAX) }}
      value={component.properties.id ?? "ENC"}
      onUpdate={(value) => edit.set("id", value as string)}
    />
    <!-- Микросхема: по ней виджет показывает настройки датчика (поля Cfg); «Нет» - только показания, ноль и калибровка -->
    <UI.Select
      label={{ name: $T("sensor.chip") }}
      help={{ info: $T("sensor.chip.info") }}
      options={[{ id: "chip-none", name: $T("sensor.chip.none"), value: "" }, ...sensorChipOptions("enc").map((o) => ({ id: `chip-${o.value}`, ...o }))]}
      value={component.properties.chip ?? ""}
      onUpdate={(value) => edit.set("chip", (value as string) || undefined)}
    />
    <CommonSnippets snippet="Accent" {component} {onPropertyChange} />
  </PropsGroup>
</div>
