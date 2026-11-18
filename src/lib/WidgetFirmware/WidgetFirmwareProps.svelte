<!-- $lib/WidgetFirmware/WidgetFirmwareProps.svelte - панель пропсов конструктора для WidgetFirmware: заголовок и переводы, мастер-цвет, допустимые файлы (accept) - с дефолтами COMPONENT_DEFAULTS -->
<script lang="ts">
  import TextsEditor from "../TextsEditor.svelte"
  import { T } from "../locales/i18n"
  import * as UI from ".."
  import type { UIComponent, IWidgetFirmwareProps } from "../types"
  import { createPropsEditor, type PropertyChange } from "../propsEditor"
  import PropsGroup from "../PropsGroup.svelte"
  import CommonSnippets from "../CommonSnippets.svelte"

  const {
    component,
    onPropertyChange,
  }: {
    component: UIComponent<"WidgetFirmware">
    onPropertyChange: (change: PropertyChange<IWidgetFirmwareProps>) => void
  } = $props()

  const edit = $derived(createPropsEditor(component, onPropertyChange))
</script>

<div class="flex flex-col gap-2">
  <PropsGroup label={$T("constructor.props.group.general")}>
    <TextsEditor {component} {onPropertyChange} />
    <CommonSnippets snippet="Accent" {component} {onPropertyChange} />
  </PropsGroup>
  <PropsGroup label={$T("widget.firmware.file_group")}>
    <UI.Input
      label={{ name: $T("widget.firmware.accept") }}
      help={{ info: $T("widget.firmware.accept.info") }}
      value={component.properties.accept ?? ".bin"}
      placeholder=".bin"
      onUpdate={(value) => edit.set("accept", value as string)}
    />
  </PropsGroup>
</div>
