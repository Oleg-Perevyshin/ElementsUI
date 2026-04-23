<script lang="ts">
  import * as UI from "$lib"
  import { t } from "$lib/locales/i18n"
  import CrossIcon from "./libIcons/CrossIcon.svelte"
  import { optionsStore } from "./options"
  import { updateProperty } from "./types"
  import { twMerge } from "tailwind-merge"

  let {
    snippet = "",
    component,
    onPropertyChange,
    VARIABLE_OPTIONS = [],
    initialValue,
  }: {
    snippet: snippetNames
    component: UI.UIComponent
    onPropertyChange: (updates: Partial<{ properties?: string | object; name?: string; access?: string; eventHandler?: UI.IUIComponentHandler }>) => void
    VARIABLE_OPTIONS?: { id: string; value: string; name: string }[]
    initialValue?: any
  } = $props()

  type snippetNames =
    | "Variable"
    | "Access"
    | "Colors"
    | "Label"
    | "LabelAlign"
    | "LabelClass"
    | "Identificator"
    | "WrapperClass"
    | "Disabled"
    | "EventHandlerArgument"
    | "IconsLib"
    | "Readonly"
    | "MinMaxStep"
    | ""

  let showIconLib: boolean = $state(false)
</script>

{#snippet Variable()}
  <UI.Select
    label={{ name: $t("constructor.props.variable") }}
    type="input"
    options={VARIABLE_OPTIONS}
    value={VARIABLE_OPTIONS.find((opt) => opt.value === component.properties.id)}
    onUpdate={(value) => {
      updateProperty("id", (value as UI.IOption).value as string, component, onPropertyChange)
      onPropertyChange({
        name: (value as UI.IOption).name?.split("—")[1]?.trim(),
        eventHandler: { Variables: [(value as UI.IOption).value as string] },
      })
    }}
  />
{/snippet}

{#snippet Access()}
  <UI.Select
    label={{ name: $t("constructor.props.access") }}
    type="buttons"
    options={component.type === "Accordion" ||
    component.type === "Tabs" ||
    component.type === "ProgressBar" ||
    component.type === "TextField" ||
    component.type === "Graph" ||
    component.type === "Map"
      ? $optionsStore.ACCESS_OPTION.filter((o) => o.value !== "viewOnly")
      : $optionsStore.ACCESS_OPTION}
    value={$optionsStore.ACCESS_OPTION.find((o) => o.value === component.access)}
    onUpdate={(option) => onPropertyChange({ access: (option as UI.IOption).value as string })}
  />
{/snippet}

{#snippet Colors(initialValue: { color: UI.IOption<string>; uselessColors?: string[]; updateProperty?: (option: UI.IOption | UI.IOption[]) => {} })}
  <UI.Select
    label={{ name: $t("constructor.props.colors") }}
    type="buttons"
    options={$optionsStore.COLOR_OPTIONS.filter((o) => !initialValue.uselessColors?.includes(o.value))}
    value={initialValue.color}
    onUpdate={(option) =>
      initialValue.updateProperty
        ? initialValue.updateProperty(option)
        : updateProperty("wrapperClass", twMerge(component.properties.wrapperClass, (option as UI.IOption<string>).value), component, onPropertyChange)}
  />
{/snippet}

{#snippet Label()}
  <UI.Input
    label={{ name: $t("constructor.props.label") }}
    value={(
      component.properties as
        | UI.IAccordionProps
        | UI.IInputProps
        | UI.ISwitchProps
        | UI.IColorPickerProps
        | UI.ISliderProps
        | UI.IGraphProps
        | UI.ITableProps<object>
        | UI.IFileAttachProps
        | UI.IJoystickProps
        | UI.IMapProps
    ).label?.name}
    onUpdate={(value) => updateProperty("label.name", value as string, component, onPropertyChange)}
  />
{/snippet}

{#snippet LabelAlign(initialAlign: UI.IOption<string>)}
  <UI.Select
    label={{ name: $t("constructor.props.align") }}
    type="buttons"
    value={initialAlign}
    options={component.type == "Accordion" ? $optionsStore.JUSTIFY_ALIGN_OPTIONS : $optionsStore.TEXT_ALIGN_OPTIONS.slice(0, -1)}
    onUpdate={(option) =>
      updateProperty(
        component.type == "TextField" ? "content.class" : "label.class",
        twMerge(
          (
            component.properties as
              | UI.IAccordionProps
              | UI.IInputProps
              | UI.ISwitchProps
              | UI.IColorPickerProps
              | UI.ISliderProps
              | UI.IGraphProps
              | UI.ITableProps<object>
              | UI.IFileAttachProps
              | UI.IJoystickProps
              | UI.IMapProps
          ).label?.class,
          (option as UI.IOption<string>).value,
        ),
        component,
        onPropertyChange,
      )}
  />
{/snippet}

{#snippet LabelClass()}
  <UI.Input
    label={{ name: $t("constructor.props.label.class") }}
    value={(
      component.properties as
        | UI.IAccordionProps
        | UI.IInputProps
        | UI.ISwitchProps
        | UI.IColorPickerProps
        | UI.ISliderProps
        | UI.IGraphProps
        | UI.ITableProps<object>
        | UI.IFileAttachProps
        | UI.IJoystickProps
        | UI.IMapProps
    ).label?.class}
    onUpdate={(value) => updateProperty("label.class", value as string, component, onPropertyChange)}
  />
{/snippet}

{#snippet Identificator()}
  <UI.Input
    label={{ name: $t("constructor.props.id") }}
    value={component.properties.id}
    onUpdate={(value) => updateProperty("id", value as string, component, onPropertyChange)}
  />
{/snippet}

{#snippet WrapperClass()}
  <UI.Input
    label={{ name: $t("constructor.props.wrapperclass") }}
    value={component.properties.wrapperClass}
    onUpdate={(value) => updateProperty("wrapperClass", value as string, component, onPropertyChange)}
  />
{/snippet}

{#snippet Disabled()}
  <UI.Switch
    label={{ name: $t("constructor.props.disabled") }}
    value={(component.properties as UI.IInputProps | UI.ISwitchProps | UI.ISliderProps | UI.IFileAttachProps)?.disabled ? 1 : 0}
    options={[{ id: crypto.randomUUID(), value: 0, class: "" }]}
    onChange={(value) => updateProperty("disabled", value, component, onPropertyChange)}
  />
{/snippet}

{#snippet EventHandlerArgument()}
  <UI.Select
    label={{ name: $t("constructor.props.action") }}
    type="buttons"
    value={$optionsStore.SHORT_ARGUMENT_OPTION.find((h) => h.value === component.eventHandler?.Argument)}
    options={$optionsStore.SHORT_ARGUMENT_OPTION}
    onUpdate={(option) => {
      updateProperty("eventHandler.Argument", (option as UI.IOption).value as string, component, onPropertyChange)
      onPropertyChange({ eventHandler: { Argument: (option as UI.IOption).value as string } })
    }}
  />
{/snippet}

{#snippet Readonly()}
  <UI.Switch
    label={{ name: $t("constructor.props.readonly") }}
    value={Number((component.properties as UI.IColorPickerProps | UI.IInputProps | UI.IJoystickProps | UI.IWidgetProps).readonly)}
    options={[{ id: crypto.randomUUID(), value: 0, class: "" }]}
    onChange={(value) => updateProperty("readonly", value, component, onPropertyChange)}
  />
{/snippet}

{#snippet MinMaxStep(initialValue: {
  number: { minNum: number; maxNum: number; step?: number }
  bitMode?: boolean
  updateProperty: (value: number, property: string) => {}
})}
  <div class="flex">
    <UI.Input
      label={{ name: $t("constructor.props.min") }}
      value={initialValue.number?.minNum}
      type="number"
      readonly={initialValue.bitMode}
      onUpdate={(value) => initialValue.updateProperty(value as number, "number.minNum")}
    />
    <UI.Input
      label={{ name: $t("constructor.props.max") }}
      value={initialValue.number?.maxNum}
      type="number"
      readonly={initialValue.bitMode}
      onUpdate={(value) => initialValue.updateProperty(value as number, "number.maxNum")}
    />
    {#if component.type !== "ProgressBar" && component.type !== "Joystick"}
      <UI.Input
        label={{ name: $t("constructor.props.step") }}
        value={initialValue.number?.step}
        type="number"
        number={{ minNum: 0, maxNum: 1000000, step: 1 }}
        readonly={initialValue.bitMode}
        onUpdate={(value) => initialValue.updateProperty(value as number, "number.step")}
      />
    {/if}
  </div>
{/snippet}

{#snippet IconsLib(initialValue: {
  name: string
  icons: { array: [string, string[]][]; selectArray?: false }
  icon: string | string[]
  updateProperty: (icon: string | string[]) => {}
})}
  <div class="relative mt-6 flex w-full gap-2">
    <UI.Button content={{ name: initialValue.name }} onClick={() => (showIconLib = true)} />
    {#if showIconLib}
      <UI.Modal bind:isOpen={showIconLib} wrapperClass="w-130">
        {#snippet main()}
          <div class="grid" style="grid-template-columns: repeat({initialValue.icons.selectArray ? 1 : 3}, minmax(0, 1fr));">
            {#each initialValue.icons.array as category}
              <div
                class="relative m-1.5 rounded-xl border-2 border-(--border-color) p-3 {initialValue.icons.selectArray ? 'cursor-pointer' : ''}"
                role="button"
                tabindex={null}
                onkeydown={null}
                onclick={() => (initialValue.icons.selectArray ? initialValue.updateProperty(category[1]) : {})}
              >
                <div class="absolute -top-3.5 bg-(--back-color) px-1">{$t(`constructor.props.icon.${category[0]}`)}</div>
                <div class="grid place-items-center gap-2" style="grid-template-columns: repeat({initialValue.icons.selectArray ? 9 : 3}, minmax(0, 1fr));">
                  {#each category[1] as icon}
                    <button
                      class="h-8 w-8 cursor-pointer [&_svg]:h-full [&_svg]:max-h-full [&_svg]:w-full [&_svg]:max-w-full"
                      onclick={() => initialValue.updateProperty(icon)}
                    >
                      {@html icon}
                    </button>
                  {/each}
                </div>
              </div>
            {/each}
          </div>
        {/snippet}
      </UI.Modal>
    {/if}
    {#if initialValue.icon}
      <UI.Button wrapperClass="w-8.5" componentClass="p-0.5 bg-red" content={{ icon: CrossIcon }} onClick={() => initialValue.updateProperty("")} />
    {/if}
  </div>
{/snippet}

{#if snippet === "Variable"}
  {@render Variable()}
{:else if snippet === "Access"}
  {@render Access()}
{:else if snippet === "Colors"}
  {@render Colors(initialValue)}
{:else if snippet === "Label"}
  {@render Label()}
{:else if snippet === "LabelAlign"}
  {@render LabelAlign(initialValue)}
{:else if snippet === "LabelClass"}
  {@render LabelClass()}
{:else if snippet === "Identificator"}
  {@render Identificator()}
{:else if snippet === "WrapperClass"}
  {@render WrapperClass()}
{:else if snippet === "Disabled"}
  {@render Disabled()}
{:else if snippet === "EventHandlerArgument"}
  {@render EventHandlerArgument()}
{:else if snippet === "Readonly"}
  {@render Readonly()}
{:else if snippet === "IconsLib"}
  {@render IconsLib(initialValue)}
{:else if snippet === "MinMaxStep"}
  {@render MinMaxStep(initialValue)}
{/if}
