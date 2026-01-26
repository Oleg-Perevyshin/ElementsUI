<!-- $lib/ElementsUI/ButtonProps.svelte -->
<script lang="ts">
  import { t } from "$lib/locales/i18n"
  import { type UIComponent, type IColorPickerProps, updateProperty, type IUIComponentHandler } from "../types"
  import * as UI from "$lib"
  import { getContext } from "svelte"
  import { optionsStore } from "../options"

  const {
    component,
    onPropertyChange,
    forConstructor = true,
  } = $props<{
    component: UIComponent & { properties: Partial<IColorPickerProps> }
    onPropertyChange: (updates: Partial<{ properties?: string | object; name?: string; access?: string; eventHandler?: IUIComponentHandler }>) => void
    forConstructor?: boolean
  }>()

  const DeviceVariables = getContext<{ id: string; value: string; name: string }[]>("DeviceVariables")
  let VARIABLE_OPTIONS = $derived(DeviceVariables && Array.isArray(DeviceVariables) ? DeviceVariables : [])

  const initialAlign = $derived(
    $optionsStore.TEXT_ALIGN_OPTIONS.find((a) =>
      (a.value as string).includes(component.properties.label?.class?.split(" ").find((cls: string) => cls.startsWith("text-"))),
    ),
  )
</script>

{#if forConstructor}
  <div class="relative flex flex-row items-start justify-center">
    <!-- Сообщение для отправки в ws по нажатию кнопки -->
    <div class="flex w-1/3 flex-col items-center px-2">
      <UI.Select
        label={{ name: $t("constructor.props.variable") }}
        options={VARIABLE_OPTIONS}
        value={VARIABLE_OPTIONS.find((opt) => opt.value === component.properties.id)}
        onUpdate={(value) => {
          updateProperty("id", value.value as string, component, onPropertyChange)
          onPropertyChange({ name: value.name?.split("—")[1].trim(), eventHandler: { Variables: [value.value as string] } })
        }}
      />
      <UI.Select
        label={{ name: $t("constructor.props.action") }}
        type="buttons"
        value={$optionsStore.SHORT_ARGUMENT_OPTION.find((h) => h.value === component.eventHandler.Argument)}
        options={$optionsStore.SHORT_ARGUMENT_OPTION}
        onUpdate={(option) => {
          onPropertyChange({ eventHandler: { Argument: option.value as string } })
        }}
      />
    </div>
    <div class="flex w-1/3 flex-col items-center px-2">
      <UI.Select
        label={{ name: $t("constructor.props.access") }}
        type="buttons"
        options={$optionsStore.ACCESS_OPTION}
        value={$optionsStore.ACCESS_OPTION.find((o) => o.value === component.access)}
        onUpdate={(option) => onPropertyChange({ access: option.value })}
      />
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <UI.Input
        label={{ name: $t("constructor.props.label") }}
        value={component.properties.label.name}
        onUpdate={(value) => updateProperty("label.name", value as string, component, onPropertyChange)}
      />
      <UI.Select
        label={{ name: $t("constructor.props.align") }}
        type="buttons"
        value={initialAlign}
        options={$optionsStore.TEXT_ALIGN_OPTIONS}
        onUpdate={(option) => updateProperty("label.class", option.value as string, component, onPropertyChange)}
      />
    </div>
  </div>
{:else}
  <div class="relative flex flex-row items-start justify-center">
    <!-- Сообщение для отправки в ws по нажатию кнопки -->
    <div class="flex w-1/3 flex-col items-center px-2">
      <UI.Input
        label={{ name: $t("constructor.props.id") }}
        value={component.properties.id}
        onUpdate={(value) => updateProperty("id", value as string, component, onPropertyChange)}
      />
      <UI.Select
        label={{ name: $t("constructor.props.access") }}
        type="buttons"
        options={$optionsStore.ACCESS_OPTION}
        value={$optionsStore.ACCESS_OPTION.find((o) => o.value === component.access)}
        onUpdate={(option) => onPropertyChange({ access: option.value })}
      />
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <UI.Input
        label={{ name: $t("constructor.props.label") }}
        value={component.properties.label.name}
        onUpdate={(value) => updateProperty("label.name", value as string, component, onPropertyChange)}
      />
      <UI.Input
        label={{ name: $t("constructor.props.label.class") }}
        value={component.properties.label.class}
        onUpdate={(value) => updateProperty("label.class", value as string, component, onPropertyChange)}
      />
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <UI.Input
        label={{ name: $t("constructor.props.wrapperclass") }}
        value={component.properties.wrapperClass}
        onUpdate={(value) => updateProperty("wrapperClass", value as string, component, onPropertyChange)}
      />
      <UI.TextField content={{ name: $t("constructor.props.defaultcolor"), class: "font-bold" }} />
      <div class="flex items-center gap-3">
        <UI.TextField wrapperClass="w-4" content={{ name: "R", class: "font-bold" }} />
        <UI.Input
          value={component.properties.value[0]}
          type="number"
          number={{ minNum: 0, maxNum: 255, step: 1 }}
          onUpdate={(value) =>
            updateProperty("value", [value as number, component.properties.value[1], component.properties.value[2]], component, onPropertyChange)}
        />
        <UI.TextField wrapperClass="w-4" content={{ name: "G", class: "font-bold" }} />
        <UI.Input
          value={component.properties.value[1]}
          type="number"
          number={{ minNum: 0, maxNum: 255, step: 1 }}
          onUpdate={(value) =>
            updateProperty("value", [component.properties.value[0], value as number, component.properties.value[2]], component, onPropertyChange)}
        />
        <UI.TextField wrapperClass="w-4" content={{ name: "B", class: "font-bold" }} />
        <UI.Input
          value={component.properties.value[2]}
          type="number"
          number={{ minNum: 0, maxNum: 255, step: 1 }}
          onUpdate={(value) =>
            updateProperty("value", [component.properties.value[0], component.properties.value[1], value as number], component, onPropertyChange)}
        />
      </div>
    </div>
  </div>
{/if}
