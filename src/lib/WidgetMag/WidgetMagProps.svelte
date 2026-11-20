<!-- $lib/WidgetMag/WidgetMagProps.svelte - панель пропсов конструктора для WidgetMag (магнитометр): заголовок, префикс группы (по умолчанию MAGF), мастер-цвет. -->
<script lang="ts">
  import TextsEditor from "../TextsEditor.svelte"
  import { T } from "../locales/i18n"
  import * as UI from ".."
  import type { UIComponent, IWidgetMagProps } from "../types"
  import { createPropsEditor, type PropertyChange } from "../propsEditor"
  import PropsGroup from "../PropsGroup.svelte"
  import CommonSnippets from "../CommonSnippets.svelte"
  import { WIDGET_FIELDS, groupRegExp, prefixMaxLen } from "../gui"

  const {
    component,
    onPropertyChange,
  }: {
    component: UIComponent<"WidgetMag">
    onPropertyChange: (change: PropertyChange<IWidgetMagProps>) => void
  } = $props()

  const edit = $derived(createPropsEditor(component, onPropertyChange))
  /* Полный ключ «группа.поле» до 15 символов: группа ограничена самым длинным полем */
  const PREFIX_MAX = prefixMaxLen(Object.keys(WIDGET_FIELDS.WidgetMag))
</script>

<div class="flex flex-col gap-2">
  <PropsGroup label={$T("constructor.props.group.general")}>
    <TextsEditor {component} {onPropertyChange} />
    <UI.Input
      label={{ name: $T("widget.mag.group") }}
      maxlength={PREFIX_MAX}
      help={{ info: $T("widget.mag.group.info"), regExp: groupRegExp(PREFIX_MAX) }}
      value={component.properties.id ?? "MAGF"}
      onUpdate={(value) => edit.set("id", value as string)}
    />
    <CommonSnippets snippet="Accent" {component} {onPropertyChange} />
  </PropsGroup>
</div>
