<!-- $lib/WidgetStackInfo/WidgetStackInfoProps.svelte - панель пропсов конструктора для WidgetStackInfo: заголовок/мастер-цвет, порог подсветки запаса стека, автоопрос по умолчанию, имя объекта ответа (keys.StackInfo) и аргумент запроса - все с дефолтами прошивочной конвенции (COMPONENT_DEFAULTS). -->
<script lang="ts">
  import TextsEditor from "../TextsEditor.svelte"
  import { T } from "../locales/i18n"
  import * as UI from ".."
  import type { UIComponent, IWidgetStackInfoProps } from "../types"
  import { createPropsEditor, type PropertyChange } from "../propsEditor"
  import PropsGroup from "../PropsGroup.svelte"
  import CommonSnippets from "../CommonSnippets.svelte"

  const {
    component,
    onPropertyChange,
  }: {
    component: UIComponent<"WidgetStackInfo">
    onPropertyChange: (change: PropertyChange<IWidgetStackInfoProps>) => void
  } = $props()

  const edit = $derived(createPropsEditor(component, onPropertyChange))
</script>

<div class="flex flex-col gap-2">
  <PropsGroup label={$T("constructor.props.group.general")}>
    <TextsEditor {component} {onPropertyChange} />
    <CommonSnippets snippet="Accent" {component} {onPropertyChange} />
  </PropsGroup>
  <PropsGroup label={$T("widget.stack.display")}>
    <UI.Input
      label={{ name: $T("widget.stack.warn_bytes") }}
      type="number"
      number={{ minNum: 0, maxNum: 65535, step: 64 }}
      value={component.properties.warnBytes ?? 512}
      onUpdate={(value) => edit.set("warnBytes", Number(value))}
    />
    <UI.Input
      label={{ name: $T("widget.stack.period") }}
      type="number"
      number={{ minNum: 0, maxNum: 60000, step: 1000 }}
      value={component.properties.period ?? 0}
      onUpdate={(value) => edit.set("period", Number(value))}
    />
  </PropsGroup>
  <PropsGroup label={$T("widget.common.device")}>
    <UI.Input
      label={{ name: $T("widget.stack.response") }}
      value={component.properties.keys?.StackInfo ?? "StackInfo"}
      onUpdate={(value) => edit.patch("keys", { StackInfo: value as string })}
    />
    <UI.Input
      label={{ name: $T("widget.stack.request") }}
      value={component.properties.argument ?? "StackInfo"}
      onUpdate={(value) => edit.set("argument", value as string)}
    />
  </PropsGroup>
</div>
