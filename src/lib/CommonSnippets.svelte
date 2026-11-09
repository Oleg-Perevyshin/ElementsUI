<script lang="ts">
  import { sanitizeHtml } from "./html"
  import * as UI from "./index"
  import { T } from "./locales/i18n"
  import CrossIcon from "./libIcons/CrossIcon.svelte"
  import { optionsStore } from "./options"
  import { updateProperty } from "./types"
  import { twMerge } from "tailwind-merge"

  /* Значок «нет иконки» для компактной кнопки выбора иконки */
  const ICON_PLACEHOLDER = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/></svg>`
  import TextsEditor from "./TextsEditor.svelte"
  import IconsMatrix from "./IconsMatrix.svelte"

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
    | "BitModeInfo"
    | "MinMaxStep"
    | ""

  let showIconLib: boolean = $state(false)
</script>

{#snippet Variable()}
  <UI.Select
    label={{ name: $T("constructor.props.variable") }}
    type="input"
    options={VARIABLE_OPTIONS}
    value={VARIABLE_OPTIONS.find((opt) => opt.value === component.properties.id)}
    onUpdate={(value) => {
      updateProperty("id", (value as UI.IOption).value as string, component, onPropertyChange)
      onPropertyChange({
        /* \u041f\u043e\u0434\u043f\u0438\u0441\u044c \u043f\u0435\u0440\u0435\u043c\u0435\u043d\u043d\u043e\u0439 \u0438\u0437 \u043e\u0431\u043b\u0430\u043a\u0430 \u00ab<id> - <\u0438\u043c\u044f>\u00bb: \u0438\u043c\u044f - \u0432\u0441\u0451 \u043f\u043e\u0441\u043b\u0435 \u043f\u0435\u0440\u0432\u043e\u0433\u043e \u0440\u0430\u0437\u0434\u0435\u043b\u0438\u0442\u0435\u043b\u044f; \u043f\u0440\u0438\u043d\u0438\u043c\u0430\u0435\u0442\u0441\u044f \u0438 \u0434\u043b\u0438\u043d\u043d\u043e\u0435 \u0442\u0438\u0440\u0435 (\u2014) \u0441\u0442\u0430\u0440\u044b\u0445 \u043f\u043e\u0434\u043f\u0438\u0441\u0435\u0439 */
        name: (value as UI.IOption).name?.match(/\s[\u2014-]\s(.*)/)?.[1]?.trim(),
        eventHandler: { Variables: [(value as UI.IOption).value as string] },
      })
    }}
  />
{/snippet}

{#snippet Access()}
  <UI.Select
    label={{ name: $T("constructor.props.access") }}
    type="buttons"
    options={component.type === "Accordion" ||
    component.type === "Tabs" ||
    component.type === "ProgressBar" ||
    component.type === "TextField" ||
    component.type === "Graph" ||
    component.type === "PeriodChart"
      ? $optionsStore.ACCESS_OPTION.filter((o) => o.value !== "viewOnly")
      : $optionsStore.ACCESS_OPTION}
    value={$optionsStore.ACCESS_OPTION.find((o) => o.value === component.access)}
    onUpdate={(option) => onPropertyChange({ access: (option as UI.IOption).value as string })}
  />
{/snippet}

{#snippet Colors(initialValue: { color: UI.IOption<string>; uselessColors?: string[]; updateProperty?: (option: UI.IOption | UI.IOption[]) => {} })}
  <UI.Select
    label={{ name: $T("constructor.props.colors") }}
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
  <TextsEditor {component} {onPropertyChange} />
{/snippet}

{#snippet LabelAlign(initialAlign: UI.IOption<string>)}
  <UI.Select
    label={{ name: $T("constructor.props.align") }}
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
              | UI.ISliderProps
              | UI.IGraphProps
              | UI.ITableProps<object>
              | UI.IFileAttachProps
              | UI.IJoystickProps
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
    label={{ name: $T("constructor.props.label.class") }}
    value={(
      component.properties as
        | UI.IAccordionProps
        | UI.IInputProps
        | UI.ISwitchProps
        | UI.ISliderProps
        | UI.IGraphProps
        | UI.ITableProps<object>
        | UI.IFileAttachProps
        | UI.IJoystickProps
    ).label?.class}
    onUpdate={(value) => updateProperty("label.class", value as string, component, onPropertyChange)}
  />
{/snippet}

{#snippet Identificator()}
  <UI.Input
    label={{ name: $T("constructor.props.id") }}
    value={component.properties.id}
    onUpdate={(value) => updateProperty("id", value as string, component, onPropertyChange)}
  />
{/snippet}

{#snippet WrapperClass()}
  <UI.Input
    label={{ name: $T("constructor.props.wrapperclass") }}
    value={component.properties.wrapperClass}
    onUpdate={(value) => updateProperty("wrapperClass", value as string, component, onPropertyChange)}
  />
{/snippet}

{#snippet Disabled()}
  <UI.Switch
    label={{ name: $T("constructor.props.disabled") }}
    value={(component.properties as UI.IInputProps | UI.ISwitchProps | UI.ISliderProps | UI.IFileAttachProps)?.disabled ? 1 : 0}
    options={[{ id: crypto.randomUUID(), value: 0, class: "" }]}
    onChange={(value) => updateProperty("disabled", value === 1, component, onPropertyChange)}
  />
{/snippet}

{#snippet EventHandlerArgument()}
  <UI.Select
    label={{ name: $T("constructor.props.action") }}
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
    label={{ name: $T("constructor.props.readonly") }}
    value={Number((component.properties as UI.IInputProps | UI.IJoystickProps | UI.IWidgetProps).readonly)}
    options={[{ id: crypto.randomUUID(), value: 0, class: "" }]}
    onChange={(value) => updateProperty("readonly", value === 1, component, onPropertyChange)}
  />
{/snippet}

{#snippet BitModeInfo()}
  {#if (component.properties as UI.IInputProps).type === "bitMode" || (component.properties as UI.ISelectProps).bitMode || (component.properties as UI.ISwitchProps).bitMode}
    <UI.TextField
      wrapperClass="mt-5 shadow-(--border-shadow-color) bg-(--blue-color)/20"
      content={{
        name: $T("ui.bit_range"),
      }}
      background
    />
  {/if}
{/snippet}

{#snippet MinMaxStep(initialValue: {
  number: { minNum: number; maxNum: number; step?: number }
  bitMode?: boolean
  updateProperty: (value: number, property: string) => {}
})}
  <div class="flex">
    <UI.Input
      label={{ name: $T("constructor.props.min") }}
      value={initialValue.number?.minNum}
      type="number"
      readonly={initialValue.bitMode}
      onUpdate={(value) => initialValue.updateProperty(value as number, "number.minNum")}
    />
    <UI.Input
      label={{ name: $T("constructor.props.max") }}
      value={initialValue.number?.maxNum}
      type="number"
      readonly={initialValue.bitMode}
      onUpdate={(value) => initialValue.updateProperty(value as number, "number.maxNum")}
    />
    {#if component.type !== "ProgressBar" && component.type !== "Joystick"}
      <UI.Input
        label={{ name: $T("constructor.props.step") }}
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
  /* compact - для строк списков в одну линию: квадратная кнопка с текущей иконкой и подсказкой вместо кнопки с текстом */
  compact?: boolean
})}
  <div class={initialValue.compact ? "relative flex shrink-0 items-center gap-1" : "relative mt-6 flex w-full gap-2"}>
    {#if initialValue.compact}
      <UI.Button
        wrapperClass="w-auto"
        componentClass="size-8 rounded-[10px] p-[6px] bg-max"
        content={{
          icon: typeof initialValue.icon === "string" && initialValue.icon ? initialValue.icon : ICON_PLACEHOLDER,
          info: { text: initialValue.name, side: "top" },
        }}
        onClick={() => (showIconLib = true)}
      />
    {:else}
      <UI.Button content={{ name: initialValue.name }} componentClass="bg-blue" onClick={() => (showIconLib = true)} />
    {/if}
    {#if showIconLib}
      {#if initialValue.icons.selectArray}
        <!-- Наборы состояний: выбирается весь ряд целиком -->
        <UI.Modal bind:isOpen={showIconLib} wrapperClass="w-130">
          {#snippet main()}
            <div class="flex flex-col gap-2">
              {#each initialValue.icons.array as category (category[0])}
                <button
                  class="flex cursor-pointer items-center gap-3 rounded-xl border border-(--border-color) p-3 hover:bg-(--container-color)"
                  onclick={() => initialValue.updateProperty(category[1])}
                >
                  <span class="w-28 text-left text-sm">{$T(`constructor.props.icon.${category[0]}`)}</span>
                  {#each category[1] as icon, i (i)}
                    <span class="size-8 [&_svg]:h-full [&_svg]:w-full">{@html sanitizeHtml(icon)}</span>
                  {/each}
                </button>
              {/each}
            </div>
          {/snippet}
        </UI.Modal>
      {:else}
        <!-- Каталог иконок матрицей 4×4: категории рамками, поиск по имени или категории -->
        <UI.Modal bind:isOpen={showIconLib} title={initialValue.name} wrapperClass="w-auto">
          {#snippet main()}
            <IconsMatrix
              selected={typeof initialValue.icon === "string" ? initialValue.icon : ""}
              onPick={(svg) => {
                initialValue.updateProperty(svg)
                showIconLib = false
              }}
            />
          {/snippet}
        </UI.Modal>
      {/if}
    {/if}
    {#if initialValue.icon}
      <UI.Button
        wrapperClass={initialValue.compact ? "w-auto" : "w-8"}
        componentClass={initialValue.compact ? "size-8 rounded-[10px] p-[7px] bg-transparent" : "p-0.5 bg-red"}
        content={{ icon: CrossIcon }}
        onClick={() => initialValue.updateProperty("")}
      />
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
{:else if snippet === "BitModeInfo"}
  {@render BitModeInfo()}
{:else if snippet === "IconsLib"}
  {@render IconsLib(initialValue)}
{:else if snippet === "MinMaxStep"}
  {@render MinMaxStep(initialValue)}
{/if}
