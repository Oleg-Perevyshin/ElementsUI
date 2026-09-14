<!-- $lib/WidgetWiFi/WidgetWiFiProps.svelte — панель пропсов конструктора для WidgetWiFi.
     Виджет — самостоятельный тип компонента (не набор примитивов с привязкой полей),
     поэтому и панель проще: не "к какой переменной привязать", а "как виджет себя ведёт". -->
<script lang="ts">
  import * as UI from "$lib"
  import { updateProperty, type UIComponent, type IWidgetWiFiProps, type IOption } from "../types"
  import WidgetAccentPicker from "../WidgetAccentPicker.svelte"

  const { component, onPropertyChange } = $props<{
    component: UIComponent & { properties: Partial<IWidgetWiFiProps> }
    onPropertyChange: (updates: Partial<{ properties?: string | object; name?: string; access?: string }>) => void
  }>()

  const MODE_OPTIONS: IOption<number>[] = [
    { id: "sta", name: "STA", value: 1 },
    { id: "ap", name: "AP", value: 2 },
    { id: "apsta", name: "STA + AP", value: 3 },
  ]
</script>

{#snippet WidgetLabel()}
  <UI.Input
    label={{ name: "Заголовок" }}
    value={component.properties.label?.name}
    onUpdate={(value) => updateProperty("label.name", value as string, component, onPropertyChange)}
  />
{/snippet}

{#snippet WidgetAllowedModes()}
  <UI.Select
    label={{ name: "Разрешённые режимы" }}
    type="buttons"
    multiSelect={true}
    options={MODE_OPTIONS}
    value={MODE_OPTIONS.filter((o) => (component.properties.allowedModes ?? [1, 2, 3]).includes(o.value as number))}
    onUpdate={(value) => {
      if (Array.isArray(value)) updateProperty("allowedModes", value.map((o) => o.value) as number[], component, onPropertyChange)
    }}
  />
{/snippet}

{#snippet WidgetConfirmAP()}
  <UI.Switch
    label={{ name: "Подтверждение при включении AP" }}
    value={component.properties.confirmOnAP === false ? 0 : 1}
    options={[{ id: crypto.randomUUID(), value: 0, class: "" }]}
    onChange={(value) => updateProperty("confirmOnAP", value === 1, component, onPropertyChange)}
  />
{/snippet}

{#snippet WidgetColor()}
  <WidgetAccentPicker
    value={component.properties.componentClass ?? ""}
    onUpdate={(value) => updateProperty("componentClass", value, component, onPropertyChange)}
  />
{/snippet}

<div class="flex w-full flex-col gap-3">
  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
    {@render WidgetLabel()}
    {@render WidgetConfirmAP()}
  </div>
  {@render WidgetAllowedModes()}
  {@render WidgetColor()}
</div>
