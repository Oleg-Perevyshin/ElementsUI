<!-- $lib/WidgetDeviceInfo/WidgetDeviceInfoProps.svelte — панель пропсов конструктора
     для WidgetDeviceInfo. Виджет простой, полей мало — панель тоже простая: заголовок + мастер-цвет. -->
<script lang="ts">
  import { T } from "$lib/locales/i18n"
  import * as UI from "$lib"
  import { updateProperty, type UIComponent, type IWidgetDeviceInfoProps } from "../types"
  import WidgetAccentPicker from "../WidgetAccentPicker.svelte"
  import PropsGroup from "$lib/PropsGroup.svelte"

  const { component, onPropertyChange } = $props<{
    component: UIComponent & { properties: Partial<IWidgetDeviceInfoProps> }
    onPropertyChange: (updates: Partial<{ properties?: string | object; name?: string; access?: string }>) => void
  }>()
</script>

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
