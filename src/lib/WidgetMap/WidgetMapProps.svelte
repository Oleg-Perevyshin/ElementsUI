<!-- $lib/WidgetMap/WidgetMapProps.svelte - панель пропсов конструктора для WidgetMap: режим (объекты, маршрут или агро), заголовок, режим имитации, группы полей (каждая - объект), мастер-цвет, высота карты, иконка маркера и начальные значения переключателей оператора. -->
<script lang="ts">
  import TextsEditor from "../TextsEditor.svelte"
  import { T } from "../locales/i18n"
  import * as UI from ".."
  import type { UIComponent, IWidgetMapProps } from "../types"
  import { createPropsEditor, type PropertyChange } from "../propsEditor"
  import { ICONS } from "../icons"
  import CommonSnippets from "../CommonSnippets.svelte"
  import PropsGroup from "../PropsGroup.svelte"
  import { twMerge } from "tailwind-merge"

  const {
    component,
    onPropertyChange,
  }: {
    component: UIComponent<"WidgetMap">
    onPropertyChange: (change: PropertyChange<IWidgetMapProps>) => void
  } = $props()

  const edit = $derived(createPropsEditor(component, onPropertyChange))

  /* Высота карты размерами, как у текстового поля: S/M/L/XL */
  const HEIGHT_OPTIONS = [
    { value: 250, name: "S" },
    { value: 400, name: "M" },
    { value: 600, name: "L" },
    { value: 800, name: "XL" },
  ]
  /* Режим карты: объекты в реальном времени, планировщик миссии из точек или генератор миссии для агродрона */
  const MODE_OPTIONS = $derived((["objects", "route", "agro"] as const).map((value) => ({ value, name: $T(`widget.map.mode.${value}`) })))
  const TRACK_LENGTH_OPTIONS = [100, 500, 1000, 5000, 10000, 50000].map((value) => ({ value, name: String(value) }))

  /* Группы через пробел, как переменные кнопки (имя группы не содержит пробелов): "MAV GNSS" */
  const setGroups = (raw: unknown) => {
    const list = String(raw ?? "")
      .trim()
      .split(/[\s,]+/)
      .filter(Boolean)
    edit.set("groups", list.length ? list : ["MAV"])
  }
</script>

<div class="flex flex-col gap-2">
  <PropsGroup>
    <UI.Select
      label={{ name: $T("widget.map.mode") }}
      type="buttons"
      options={MODE_OPTIONS}
      value={component.properties.mode ?? "objects"}
      onUpdate={(mode) => edit.set("mode", mode)}
    />
  </PropsGroup>
  <PropsGroup>
    <UI.Switch
      label={{ name: $T("constructor.props.simulation") }}
      value={component.properties.isTest ? 1 : 0}
      onUpdate={(value) => edit.set("isTest", value === 1)}
    />
  </PropsGroup>
  <!-- В режиме имитации остальные свойства не учитываются, поэтому вся панель бледная и недоступна -->
  <div class={twMerge("flex flex-col gap-2 transition-opacity", component.properties.isTest && "opacity-40 grayscale")} inert={component.properties.isTest}>
    <PropsGroup label={$T("constructor.props.group.general")}>
      <TextsEditor {component} {onPropertyChange} />
      <UI.Input label={{ name: $T("widget.map.groups") }} value={(component.properties.groups ?? ["MAV"]).join(" ")} onUpdate={setGroups} />
      <CommonSnippets snippet="Accent" {component} {onPropertyChange} />
    </PropsGroup>
    <PropsGroup label={$T("constructor.props.group.appearance")}>
      <UI.Select
        label={{ name: $T("widget.map.height") }}
        type="buttons"
        options={HEIGHT_OPTIONS}
        value={component.properties.height ?? 400}
        onUpdate={(height) => edit.set("height", height)}
      />
      <CommonSnippets
        snippet="IconsLib"
        initialValue={{
          name: $T("constructor.props.markerIcon"),
          icon: component.properties.markerIcon,
          onUpdate: (icon: string) => edit.set("markerIcon", icon),
          icons: { array: ICONS },
        }}
        {component}
        {onPropertyChange}
      />
    </PropsGroup>
    <PropsGroup label={$T("widget.map.defaults")}>
      <UI.Switch
        label={{ name: $T("constructor.props.map.track") }}
        value={component.properties.trackEnabled ? 1 : 0}
        onUpdate={(value) => edit.set("trackEnabled", Boolean(value))}
      />
      <UI.Select
        label={{ name: $T("constructor.props.map.trackLength") }}
        type="input"
        options={TRACK_LENGTH_OPTIONS}
        value={component.properties.trackLength ?? 1000}
        onUpdate={(length) => edit.set("trackLength", Number(length) || 1000)}
      />
    </PropsGroup>
  </div>
</div>
