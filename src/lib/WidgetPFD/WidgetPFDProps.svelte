<!-- $lib/WidgetPFD/WidgetPFDProps.svelte — панель пропсов конструктора для WidgetPFD:
     заголовок, префикс группы полей (по умолчанию MAV), мастер-цвет и границы цветовых зон. -->
<script lang="ts">
  import { T } from "$lib/locales/i18n"
  import * as UI from "$lib"
  import { updateProperty, type UIComponent, type IWidgetPFDProps, type IWidgetPFDLimits } from "../types"
  import WidgetAccentPicker from "../WidgetAccentPicker.svelte"
  import PropsGroup from "$lib/PropsGroup.svelte"

  const { component, onPropertyChange } = $props<{
    component: UIComponent & { properties: Partial<IWidgetPFDProps> }
    onPropertyChange: (updates: Partial<{ properties?: string | object; name?: string; access?: string }>) => void
  }>()

  /* Пустое поле — граница не задана (зона не рисуется) */
  const setLimit = (key: keyof IWidgetPFDLimits, raw: unknown) => {
    const text = String(raw ?? "").trim()
    const next: IWidgetPFDLimits = { ...(component.properties.limits ?? {}) }
    if (text === "" || !Number.isFinite(Number(text))) delete next[key]
    else next[key] = Number(text)
    updateProperty("limits", next, component, onPropertyChange)
  }
  const limits = $derived((component.properties.limits ?? {}) as IWidgetPFDLimits)
</script>

<div class="flex flex-col gap-2">
  <PropsGroup label={$T("constructor.props.group.general")}>
    <UI.Input
      label={{ name: "Заголовок" }}
      value={component.properties.label?.name}
      onUpdate={(value) => updateProperty("label.name", value as string, component, onPropertyChange)}
    />
    <UI.Input
      label={{ name: "Группа полей (ID)" }}
      value={component.properties.id ?? "MAV"}
      onUpdate={(value) => updateProperty("id", value as string, component, onPropertyChange)}
    />
    <WidgetAccentPicker
      value={component.properties.componentClass ?? ""}
      onUpdate={(value) => updateProperty("componentClass", value, component, onPropertyChange)}
    />
  </PropsGroup>
  <PropsGroup label="Границы">
    <div class="grid grid-cols-2 gap-2">
      <UI.Input label={{ name: "Скорость мин., м/с" }} type="number" value={limits.speedMin} onUpdate={(v) => setLimit("speedMin", v)} />
      <UI.Input label={{ name: "Скорость макс., м/с" }} type="number" value={limits.speedMax} onUpdate={(v) => setLimit("speedMax", v)} />
      <UI.Input label={{ name: "Предельный крен, °" }} type="number" value={limits.bankMax} onUpdate={(v) => setLimit("bankMax", v)} />
      <UI.Input label={{ name: "Высота макс., м" }} type="number" value={limits.altMax} onUpdate={(v) => setLimit("altMax", v)} />
      <UI.Input label={{ name: "Низкий заряд, %" }} type="number" value={limits.battLow} onUpdate={(v) => setLimit("battLow", v)} />
      <UI.Input label={{ name: "Нет данных через, мс" }} type="number" value={limits.staleMs ?? 2000} onUpdate={(v) => setLimit("staleMs", v)} />
    </div>
  </PropsGroup>
</div>
