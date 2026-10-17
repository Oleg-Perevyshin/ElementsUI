<!-- $lib/WidgetMap/WidgetMapProps.svelte — панель пропсов конструктора для WidgetMap: заголовок, группы полей
     (каждая — объект), мастер-цвет, высота карты, иконка маркера и начальные значения переключателей оператора. -->
<script lang="ts">
  import { T } from "$lib/locales/i18n"
  import * as UI from "$lib"
  import { updateProperty, type UIComponent, type IWidgetMapProps } from "../types"
  import { ICONS } from "$lib/icons"
  import WidgetAccentPicker from "../WidgetAccentPicker.svelte"
  import CommonSnippets from "$lib/CommonSnippets.svelte"
  import PropsGroup from "$lib/PropsGroup.svelte"

  const { component, onPropertyChange } = $props<{
    component: UIComponent & { properties: Partial<IWidgetMapProps> }
    onPropertyChange: (updates: Partial<{ properties?: string | object; name?: string; access?: string }>) => void
  }>()

  /* Высота карты размерами, как у текстового поля: S/M/L/XL */
  const HEIGHT_OPTIONS = [
    { value: 250, name: "S" },
    { value: 400, name: "M" },
    { value: 600, name: "L" },
    { value: 800, name: "XL" },
  ].map((o) => ({ id: crypto.randomUUID(), ...o }))
  const TRACK_LENGTH_OPTIONS = [100, 500, 1000, 5000, 10000, 50000].map((value) => ({ id: crypto.randomUUID(), value, name: String(value) }))

  /* Группы через пробел, как переменные кнопки (имя группы не содержит пробелов): "MAV GNSS" */
  const setGroups = (raw: unknown) => {
    const list = String(raw ?? "")
      .trim()
      .split(/[\s,]+/)
      .filter(Boolean)
    updateProperty("groups", list.length ? list : ["MAV"], component, onPropertyChange)
  }
</script>

<div class="flex flex-col gap-2">
  <PropsGroup label={$T("constructor.props.group.general")}>
    <UI.Input
      label={{ name: "Заголовок" }}
      value={component.properties.label?.name}
      onUpdate={(value) => updateProperty("label.name", value as string, component, onPropertyChange)}
    />
    <UI.Input label={{ name: "Группы полей (через пробел)" }} value={(component.properties.groups ?? ["MAV"]).join(" ")} onUpdate={setGroups} />
    <WidgetAccentPicker
      value={component.properties.componentClass ?? ""}
      onUpdate={(value) => updateProperty("componentClass", value, component, onPropertyChange)}
    />
  </PropsGroup>
  <PropsGroup label={$T("constructor.props.group.appearance")}>
    <UI.Select
      label={{ name: "Высота карты" }}
      type="buttons"
      options={HEIGHT_OPTIONS}
      value={HEIGHT_OPTIONS.find((opt) => opt.value === (component.properties.height ?? 400)) ?? HEIGHT_OPTIONS[1]}
      onUpdate={(option) => updateProperty("height", (option as { value: number }).value, component, onPropertyChange)}
    />
    <CommonSnippets
      snippet="IconsLib"
      initialValue={{
        name: $T("constructor.props.markerIcon"),
        icon: component.properties.markerIcon,
        updateProperty: (icon: string) => updateProperty("markerIcon", icon as string, component, onPropertyChange),
        icons: { array: ICONS },
      }}
      {component}
      {onPropertyChange}
    />
  </PropsGroup>
  <PropsGroup label="По умолчанию (оператор меняет на карте)">
    <UI.Switch
      label={{ name: $T("constructor.props.map.track") }}
      value={component.properties.trackEnabled ? 1 : 0}
      options={[{ id: crypto.randomUUID(), value: 0, class: "" }]}
      onChange={(value) => updateProperty("trackEnabled", Boolean(value), component, onPropertyChange)}
    />
    <UI.Select
      label={{ name: $T("constructor.props.map.trackLength") }}
      type="input"
      options={TRACK_LENGTH_OPTIONS}
      value={TRACK_LENGTH_OPTIONS.find((opt) => opt.value === (component.properties.trackLength ?? 1000))}
      onUpdate={(option) => updateProperty("trackLength", (option as { value: number }).value, component, onPropertyChange)}
    />
  </PropsGroup>
</div>
