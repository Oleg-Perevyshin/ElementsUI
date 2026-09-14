<!-- $lib/WidgetAccentPicker.svelte — переиспользуемый пункт панели пропсов "Мастер-цвет" для
     смарт-виджетов конструктора (WidgetWiFi, WidgetDeviceInfo и далее). Один UI на все виджеты,
     та же палитра, что и у примитивов (optionsStore.COLOR_OPTIONS) — см. widgetAccent.ts. -->
<script lang="ts">
  import { optionsStore } from "./options"
  import Select from "./Select/Select.svelte"
  import type { IOption } from "./types"

  let {
    value = "",
    onUpdate,
    wrapperClass = "h-14",
  }: {
    value?: string
    onUpdate: (value: string) => void
    wrapperClass?: string
  } = $props()
</script>

<Select
  {wrapperClass}
  label={{ name: "Мастер-цвет" }}
  type="buttons"
  options={$optionsStore.COLOR_OPTIONS}
  value={$optionsStore.COLOR_OPTIONS.find((o) => o.value === value) ?? $optionsStore.COLOR_OPTIONS[0]}
  onUpdate={(option) => onUpdate((option as IOption<string>).value ?? "")}
/>
