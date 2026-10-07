<!-- $lib/WidgetStackInfo/WidgetStackInfoProps.svelte — панель пропсов конструктора для
     WidgetStackInfo: заголовок/мастер-цвет, порог подсветки запаса стека, автоопрос по умолчанию,
     имя объекта ответа (keys.StackInfo) и аргумент запроса — все с дефолтами прошивочной конвенции
     (см. DEFAULT_PROPS.WidgetStackInfo в DevCloud). -->
<script lang="ts">
  import { T } from "$lib/locales/i18n"
  import * as UI from "$lib"
  import { updateProperty, type UIComponent, type IWidgetStackInfoProps } from "../types"
  import WidgetAccentPicker from "../WidgetAccentPicker.svelte"
  import PropsGroup from "$lib/PropsGroup.svelte"

  const { component, onPropertyChange } = $props<{
    component: UIComponent & { properties: Partial<IWidgetStackInfoProps> }
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
    <WidgetAccentPicker
      value={component.properties.componentClass ?? ""}
      onUpdate={(value) => updateProperty("componentClass", value, component, onPropertyChange)}
    />
  </PropsGroup>
  <PropsGroup label="Отображение">
    <UI.Input
      label={{ name: "Порог запаса стека, Б" }}
      type="number"
      number={{ minNum: 0, maxNum: 65535, step: 64 }}
      value={component.properties.warnBytes ?? 512}
      onUpdate={(value) => updateProperty("warnBytes", Number(value), component, onPropertyChange)}
    />
    <UI.Input
      label={{ name: "Автоопрос по умолчанию, мс (0 — выкл)" }}
      type="number"
      number={{ minNum: 0, maxNum: 60000, step: 1000 }}
      value={component.properties.period ?? 0}
      onUpdate={(value) => updateProperty("period", Number(value), component, onPropertyChange)}
    />
  </PropsGroup>
  <PropsGroup label="Устройство">
    <UI.Input
      label={{ name: "Объект ответа" }}
      value={component.properties.keys?.StackInfo ?? "StackInfo"}
      onUpdate={(value) => updateProperty("keys.StackInfo", value as string, component, onPropertyChange)}
    />
    <UI.Input
      label={{ name: "Аргумент запроса" }}
      value={component.properties.argument ?? "StackInfo"}
      onUpdate={(value) => updateProperty("argument", value as string, component, onPropertyChange)}
    />
  </PropsGroup>
</div>
