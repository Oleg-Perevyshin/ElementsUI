<!-- $lib/WidgetRGBStrip/WidgetRGBStripProps.svelte - панель пропсов конструктора для WidgetRGBStrip: заголовок, префикс группы (по умолчанию LST), мастер-цвет. -->
<script lang="ts">
  import TextsEditor from "../TextsEditor.svelte"
  import { T } from "../locales/i18n"
  import * as UI from ".."
  import type { UIComponent, IWidgetRGBStripProps } from "../types"
  import { createPropsEditor, type PropertyChange } from "../propsEditor"
  import PropsGroup from "../PropsGroup.svelte"
  import CommonSnippets from "../CommonSnippets.svelte"
  import { WIDGET_FIELDS, groupRegExp, prefixMaxLen } from "../gui"

  const {
    component,
    onPropertyChange,
  }: {
    component: UIComponent<"WidgetRGBStrip">
    onPropertyChange: (change: PropertyChange<IWidgetRGBStripProps>) => void
  } = $props()

  const edit = $derived(createPropsEditor(component, onPropertyChange))
  /* Полный ключ «группа.поле» до 15 символов: группа ограничена самым длинным полем */
  const PREFIX_MAX = prefixMaxLen(Object.keys(WIDGET_FIELDS.WidgetRGBStrip))
</script>

<div class="flex flex-col gap-2">
  <PropsGroup label={$T("constructor.props.group.general")}>
    <TextsEditor {component} {onPropertyChange} />
    <UI.Input
      label={{ name: $T("widget.rgb.group") }}
      maxlength={PREFIX_MAX}
      help={{ info: $T("widget.rgb.group.info"), regExp: groupRegExp(PREFIX_MAX) }}
      value={component.properties.id ?? "LST"}
      onUpdate={(value) => edit.set("id", value as string)}
    />
    <CommonSnippets snippet="Accent" {component} {onPropertyChange} />
  </PropsGroup>
</div>
