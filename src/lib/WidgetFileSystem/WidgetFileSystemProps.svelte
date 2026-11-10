<!-- $lib/WidgetFileSystem/WidgetFileSystemProps.svelte - панель пропсов конструктора для WidgetFileSystem: заголовок/мастер-цвет/префикс группы, имя поля устройства (keys.FS), фильтр закачки и аргумент команд - все с дефолтами, равными прошивочной конвенции (COMPONENT_DEFAULTS). -->
<script lang="ts">
  import TextsEditor from "../TextsEditor.svelte"
  import { T } from "../locales/i18n"
  import * as UI from ".."
  import type { UIComponent, IWidgetFileSystemProps } from "../types"
  import { createPropsEditor, type PropertyChange } from "../propsEditor"
  import PropsGroup from "../PropsGroup.svelte"
  import CommonSnippets from "../CommonSnippets.svelte"

  const {
    component,
    onPropertyChange,
  }: {
    component: UIComponent<"WidgetFileSystem">
    onPropertyChange: (change: PropertyChange<IWidgetFileSystemProps>) => void
  } = $props()

  const edit = $derived(createPropsEditor(component, onPropertyChange))
</script>

<div class="flex flex-col gap-2">
  <PropsGroup label={$T("constructor.props.group.general")}>
    <TextsEditor {component} {onPropertyChange} />
    <UI.Input label={{ name: $T("widget.common.group_prefix") }} value={component.properties.id} onUpdate={(value) => edit.set("id", value as string)} />
    <CommonSnippets snippet="Accent" {component} {onPropertyChange} />
  </PropsGroup>
  <PropsGroup label={$T("widget.fs.upload_group")}>
    <UI.Input
      label={{ name: $T("widget.fs.accept") }}
      value={component.properties.accept ?? "*/*"}
      placeholder=".bin, .txt, .pem"
      onUpdate={(value) => edit.set("accept", value as string)}
    />
    <UI.Input
      label={{ name: $T("widget.fs.max_name") }}
      type="number"
      number={{ minNum: 1, maxNum: 255, step: 1 }}
      value={component.properties.maxNameLength ?? 31}
      onUpdate={(value) => edit.set("maxNameLength", Number(value))}
    />
  </PropsGroup>
  <PropsGroup label={$T("widget.common.device")}>
    <UI.Input
      label={{ name: $T("widget.fs.state_field") }}
      value={component.properties.keys?.FS ?? "FS"}
      onUpdate={(value) => edit.patch("keys", { FS: value as string })}
    />
    <UI.Input
      label={{ name: $T("widget.fs.command_arg") }}
      value={component.properties.argument ?? "FS"}
      onUpdate={(value) => edit.set("argument", value as string)}
    />
  </PropsGroup>
</div>
