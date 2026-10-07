<!-- $lib/WidgetFileSystem/WidgetFileSystemProps.svelte — панель пропсов конструктора для
     WidgetFileSystem: заголовок/мастер-цвет/префикс группы, имя поля устройства (keys.FS),
     фильтр закачки и аргумент команд — все с дефолтами, равными прошивочной конвенции
     (см. DEFAULT_PROPS.WidgetFileSystem в DevCloud). -->
<script lang="ts">
  import { T } from "$lib/locales/i18n"
  import * as UI from "$lib"
  import { updateProperty, type UIComponent, type IWidgetFileSystemProps } from "../types"
  import WidgetAccentPicker from "../WidgetAccentPicker.svelte"
  import PropsGroup from "$lib/PropsGroup.svelte"

  const { component, onPropertyChange } = $props<{
    component: UIComponent & { properties: Partial<IWidgetFileSystemProps> }
    onPropertyChange: (updates: Partial<{ properties?: string | object; name?: string; access?: string }>) => void
  }>()
</script>

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
  <PropsGroup label="Закачка файлов">
    <UI.Input
      label={{ name: "Допустимые файлы (accept)" }}
      value={component.properties.accept ?? "*/*"}
      placeholder=".bin, .txt, .pem"
      onUpdate={(value) => updateProperty("accept", value as string, component, onPropertyChange)}
    />
    <UI.Input
      label={{ name: "Максимальная длина имени" }}
      type="number"
      number={{ minNum: 1, maxNum: 255, step: 1 }}
      value={component.properties.maxNameLength ?? 31}
      onUpdate={(value) => updateProperty("maxNameLength", Number(value), component, onPropertyChange)}
    />
  </PropsGroup>
  <PropsGroup label="Устройство">
    <UI.Input
      label={{ name: "Поле состояния ФС" }}
      value={component.properties.keys?.FS ?? "FS"}
      onUpdate={(value) => updateProperty("keys.FS", value as string, component, onPropertyChange)}
    />
    <UI.Input
      label={{ name: "Аргумент команд" }}
      value={component.properties.argument ?? "FS"}
      onUpdate={(value) => updateProperty("argument", value as string, component, onPropertyChange)}
    />
  </PropsGroup>
</div>
