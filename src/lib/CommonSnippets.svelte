<script lang="ts">
  import * as UI from "$lib"
  import { t } from "$lib/locales/i18n"
  import { ICONS } from "./icons"
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
    | ""

  interface iconModal {
    buttonIndex?: number
    isModalOpen: boolean
    columnIndex: number
    column?: UI.ITableHeader<any>
  }
  let showIconLib: boolean = $state(false)
</script>

{#snippet Variable()}
  <UI.Select
    label={{ name: $t("constructor.props.variable") }}
    type="input"
    options={VARIABLE_OPTIONS}
    value={VARIABLE_OPTIONS.find((opt) => opt.value === component.properties.id)}
    onUpdate={(value) => {
      updateProperty("id", (value as UI.ISelectOption).value as string, component, onPropertyChange)
      onPropertyChange({
        name: (value as UI.ISelectOption).name?.split("—")[1]?.trim(),
        eventHandler: { Variables: [(value as UI.ISelectOption).value as string] },
      })
    }}
  />
{/snippet}

{#snippet Access()}
  <UI.Select
    label={{ name: $t("constructor.props.access") }}
    type="buttons"
    options={$optionsStore.ACCESS_OPTION}
    value={$optionsStore.ACCESS_OPTION.find((o) => o.value === component.access)}
    onUpdate={(option) => onPropertyChange({ access: (option as UI.ISelectOption).value as string })}
  />
{/snippet}

{#snippet Colors(initialColor: UI.ISelectOption<string>)}
  <UI.Select
    wrapperClass="!h-14"
    label={{ name: $t("constructor.props.colors") }}
    type="buttons"
    options={$optionsStore.COLOR_OPTIONS}
    value={initialColor}
    onUpdate={(option) => {
      if (component.type === "Button") {
        updateProperty(
          "componentClass",
          twMerge((component.properties as UI.IButtonProps).componentClass, (option as UI.ISelectOption<string>).value),
          component,
          onPropertyChange,
        )
      } else {
        updateProperty("wrapperClass", twMerge(component.properties.wrapperClass, (option as UI.ISelectOption<string>).value), component, onPropertyChange)
      }
    }}
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

{#snippet LabelAlign(initialAlign: UI.ISelectOption<string>)}
  <UI.Select
    label={{ name: $t("constructor.props.align") }}
    type="buttons"
    value={initialAlign}
    options={component.type == "Accordion" ? $optionsStore.JUSTIFY_ALIGN_OPTIONS : $optionsStore.TEXT_ALIGN_OPTIONS}
    onUpdate={(option) =>
      updateProperty(
        "label.class",
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
          (option as UI.ISelectOption<string>).value,
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
    wrapperClass="bg-blue"
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
      updateProperty("eventHandler.Argument", (option as UI.ISelectOption).value as string, component, onPropertyChange)
      onPropertyChange({ eventHandler: { Argument: (option as UI.ISelectOption).value as string } })
    }}
  />
{/snippet}

{#snippet IconsLib(initialValue: { name: string; icons: [string, string[]][]; icon: string; updateProperty: (icon: string) => {} })}
  <div class="relative mt-6 flex w-full gap-2">
    <UI.Button content={{ name: initialValue.name }} onClick={() => (showIconLib = true)} />
    {#if showIconLib}
      <UI.Modal bind:isOpen={showIconLib} wrapperClass="w-130">
        {#snippet main()}
          <div class="grid grid-cols-3">
            {#each ICONS as category}
              <div class="relative m-1.5 rounded-xl border-2 border-(--border-color) p-3">
                <div class="absolute -top-3.5 bg-(--back-color) px-1">{$t(`constructor.props.icon.${category[0]}`)}</div>
                <div class="grid grid-cols-3 place-items-center gap-2">
                  {#each category[1] as icon}
                    <button
                      class="h-8 w-8 cursor-pointer [&_svg]:h-full [&_svg]:max-h-full [&_svg]:w-full [&_svg]:max-w-full"
                      onclick={() => initialValue.updateProperty(icon)}
                    >
                      {@html icon}
                    </button>{/each}
                </div>
              </div>
            {/each}
          </div>
        {/snippet}
      </UI.Modal>
    {/if}
    {#if initialValue.icon}
      <UI.Button wrapperClass="w-8.5 " componentClass="p-0.5 bg-red" content={{ icon: CrossIcon }} onClick={() => initialValue.updateProperty("")} />
    {/if}
  </div>
{/snippet}

{#if snippet === "Variable"}
  {@render Variable()}
{/if}
{#if snippet === "Access"}
  {@render Access()}
{/if}
{#if snippet === "Colors"}
  {@render Colors(initialValue)}
{/if}
{#if snippet === "Label"}
  {@render Label()}
{/if}
{#if snippet === "LabelAlign"}
  {@render LabelAlign(initialValue)}
{/if}
{#if snippet === "LabelClass"}
  {@render LabelClass()}
{/if}
{#if snippet === "Identificator"}
  {@render Identificator()}
{/if}
{#if snippet === "WrapperClass"}
  {@render WrapperClass()}
{/if}
{#if snippet === "Disabled"}
  {@render Disabled()}
{/if}
{#if snippet === "EventHandlerArgument"}
  {@render EventHandlerArgument()}
{/if}
{#if snippet === "IconsLib"}
  {@render IconsLib(initialValue)}
{/if}
