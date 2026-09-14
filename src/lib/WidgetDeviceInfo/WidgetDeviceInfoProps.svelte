<!-- $lib/WidgetDeviceInfo/WidgetDeviceInfoProps.svelte — панель пропсов конструктора
     для WidgetDeviceInfo. Виджет простой, полей мало — панель тоже простая: заголовок + мастер-цвет. -->
<script lang="ts">
  import * as UI from "$lib"
  import { updateProperty, type UIComponent, type IWidgetDeviceInfoProps } from "../types"
  import WidgetAccentPicker from "../WidgetAccentPicker.svelte"

  const { component, onPropertyChange } = $props<{
    component: UIComponent & { properties: Partial<IWidgetDeviceInfoProps> }
    onPropertyChange: (updates: Partial<{ properties?: string | object; name?: string; access?: string }>) => void
  }>()
</script>

<div class="flex w-full flex-col gap-3">
  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
    <UI.Input
      label={{ name: "Заголовок" }}
      value={component.properties.label?.name}
      onUpdate={(value) => updateProperty("label.name", value as string, component, onPropertyChange)}
    />
    <WidgetAccentPicker
      value={component.properties.componentClass ?? ""}
      onUpdate={(value) => updateProperty("componentClass", value, component, onPropertyChange)}
    />
  </div>
</div>
