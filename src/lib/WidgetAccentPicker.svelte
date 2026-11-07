<!-- $lib/WidgetAccentPicker.svelte - переиспользуемый пункт панели пропсов «Мастер-цвет» для смарт-виджетов конструктора (WidgetWiFi, WidgetDeviceInfo и далее). Один UI на все виджеты, та же палитра, что и у примитивов (optionsStore.COLOR_OPTIONS) - см. widgetAccent.ts. -->
<script lang="ts">
  import { T } from "./locales/i18n"
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

  /* bg-max не показываем: без выбора виджет и так синий, это цвет по умолчанию */
  const options = $derived($optionsStore.COLOR_OPTIONS.filter((o) => o.value !== "bg-max"))
</script>

<Select
  {wrapperClass}
  label={{ name: $T("ui.accent") }}
  type="buttons"
  {options}
  value={options.find((o) => o.value === value) ?? options.find((o) => o.value === "bg-blue")}
  onUpdate={(option) => onUpdate((option as IOption<string>).value ?? "")}
/>
