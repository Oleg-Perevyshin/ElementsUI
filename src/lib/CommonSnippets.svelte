<!-- $lib/CommonSnippets.svelte - общие пункты панелей свойств конструктора: переменная, доступ, цвет, подпись, выравнивание, флаги, пределы, иконки -->
<script lang="ts">
  import { sanitizeHtml } from "./html"
  import * as UI from "./index"
  import { T } from "./locales/i18n"
  import CrossIcon from "./libIcons/CrossIcon.svelte"
  import { optionsStore } from "./options"
  import { createPropsEditor, optionByClass, type PropertyChange } from "./propsEditor"
  import type { AccentColor } from "./accent"
  import type { IOption } from "./types"
  import { twMerge } from "tailwind-merge"
  import TextsEditor from "./TextsEditor.svelte"
  import IconsMatrix from "./IconsMatrix.svelte"

  /* Значок «нет иконки» для компактной кнопки выбора иконки */
  const ICON_PLACEHOLDER = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/></svg>`

  type NumberRange = { minNum?: number; maxNum?: number; step?: number }
  type IconsLibValue = {
    name: string
    icons: { array: [string, string[]][]; selectArray?: boolean }
    icon: string | string[] | undefined
    onUpdate: (icon: string | string[]) => void
    /* Для строк списков в одну линию: квадратная кнопка с текущей иконкой и подсказкой вместо кнопки с текстом */
    compact?: boolean
  }

  let {
    snippet,
    component,
    onPropertyChange,
    VARIABLE_OPTIONS = [],
    initialValue,
  }: {
    snippet:
      "Variable" | "Access" | "Accent" | "Label" | "LabelAlign" | "Disabled" | "EventHandlerArgument" | "IconsLib" | "Readonly" | "BitModeInfo" | "MinMaxStep"
    component: UI.UIComponent
    onPropertyChange: (change: PropertyChange<object>) => void
    VARIABLE_OPTIONS?: { id: string; value: string; name: string }[]
    /* Accent: { exclude?: значения, которые не предлагать }; MinMaxStep: { number, bitMode?, onUpdate }; IconsLib: IconsLibValue */
    initialValue?: any
  } = $props()

  /* Свойства всех типов как один объект: пункты ниже сами проверяют, есть ли поле у компонента */
  type AnyProps = {
    id?: string
    wrapperClass?: string
    accent?: AccentColor
    disabled?: boolean
    readonly?: boolean
    label?: { name?: string; class?: string }
  }
  const properties = $derived(component.properties as AnyProps & Record<string, any>)
  const edit = $derived(createPropsEditor<AnyProps>(component as { properties: AnyProps }, onPropertyChange as (change: PropertyChange<AnyProps>) => void))

  /* У TextField выравнивается текст (content.class), у остальных - подпись (label.class) */
  const alignKey = $derived(component.type === "TextField" ? "content" : "label")
  const alignOptions: IOption<string>[] = $derived(
    component.type === "Accordion" ? $optionsStore.JUSTIFY_ALIGN_OPTIONS : $optionsStore.TEXT_ALIGN_OPTIONS.slice(0, -1),
  )

  let showIconLib = $state(false)
</script>

{#snippet Flag(name: string, key: "disabled" | "readonly")}
  <UI.Switch
    label={{ name }}
    help={{ info: $T(`constructor.props.${key}.info`) }}
    value={properties[key] ? 1 : 0}
    onUpdate={(value) => edit.set(key, value === 1)}
  />
{/snippet}

{#snippet MinMaxStep({ number, bitMode, onUpdate }: { number?: NumberRange; bitMode?: boolean; onUpdate: (number: NumberRange) => void })}
  <div class="flex">
    {#each [["minNum", "min"], ["maxNum", "max"], ["step", "step"]] as const as [key, caption] (key)}
      {#if key !== "step" || (component.type !== "ProgressBar" && component.type !== "Joystick")}
        <UI.Input
          label={{ name: $T(`constructor.props.${caption}`) }}
          help={{ info: $T(`constructor.props.${caption}.info`) }}
          value={number?.[key]}
          type="number"
          number={key === "step" ? { minNum: 0, maxNum: 1000000, step: 1 } : undefined}
          readonly={bitMode}
          onUpdate={(value) => onUpdate({ ...number, [key]: value as number })}
        />
      {/if}
    {/each}
  </div>
{/snippet}

{#snippet IconsLib(value: IconsLibValue)}
  <div class={value.compact ? "relative flex shrink-0 items-center gap-1" : "relative mt-6 flex w-full gap-2"}>
    {#if value.compact}
      <UI.Button
        wrapperClass="w-auto"
        variant="secondary"
        componentClass="size-8 rounded-[10px]"
        content={{ icon: typeof value.icon === "string" && value.icon ? value.icon : ICON_PLACEHOLDER, info: { text: value.name, side: "top" } }}
        onClick={() => (showIconLib = true)}
      />
    {:else}
      <UI.Button content={{ name: value.name }} variant="primary" onClick={() => (showIconLib = true)} />
    {/if}
    {#if showIconLib && value.icons.selectArray}
      <!-- Наборы состояний: выбирается весь ряд целиком -->
      <UI.Modal bind:isOpen={showIconLib} wrapperClass="w-130">
        {#snippet main()}
          <div class="flex flex-col gap-2">
            {#each value.icons.array as category (category[0])}
              <button
                class="flex cursor-pointer items-center gap-3 rounded-xl border border-(--border-color) p-3 hover:bg-(--container-color)"
                onclick={() => value.onUpdate(category[1])}
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
    {:else if showIconLib}
      <!-- Каталог иконок матрицей 4×4: категории рамками, поиск по имени или категории -->
      <UI.Modal bind:isOpen={showIconLib} title={value.name} wrapperClass="w-auto">
        {#snippet main()}
          <IconsMatrix
            selected={typeof value.icon === "string" ? value.icon : ""}
            onPick={(svg) => {
              value.onUpdate(svg)
              showIconLib = false
            }}
          />
        {/snippet}
      </UI.Modal>
    {/if}
    {#if value.icon?.length}
      <UI.Button
        wrapperClass={value.compact ? "w-auto" : "w-8"}
        variant={value.compact ? "plain" : "primary"}
        accent={value.compact ? undefined : "red"}
        componentClass={value.compact ? "size-8 rounded-[10px] p-[7px]" : "p-0.5"}
        content={{ icon: CrossIcon }}
        onClick={() => value.onUpdate("")}
      />
    {/if}
  </div>
{/snippet}

{#if snippet === "Variable"}
  <UI.Select
    label={{ name: $T("constructor.props.variable") }}
    help={{ info: $T("constructor.props.variable.info") }}
    type="input"
    options={VARIABLE_OPTIONS}
    value={properties.id}
    onUpdate={(value) =>
      onPropertyChange({
        properties: { id: value },
        /* Подпись переменной из облака «<id> - <имя>»: имя - всё после первого разделителя */
        name: VARIABLE_OPTIONS.find((option) => option.value === value)
          ?.name.match(/\s-\s(.*)/)?.[1]
          ?.trim(),
        eventHandler: { Variables: [value] },
      })}
  />
{:else if snippet === "Access"}
  <UI.Select
    label={{ name: $T("constructor.props.access") }}
    help={{ info: $T("constructor.props.access.info") }}
    type="buttons"
    options={["Accordion", "Tabs", "ProgressBar", "TextField", "Graph", "PeriodChart"].includes(component.type)
      ? $optionsStore.ACCESS_OPTION.filter((option) => option.value !== "viewOnly")
      : $optionsStore.ACCESS_OPTION}
    value={component.access}
    onUpdate={(access) => onPropertyChange({ access })}
  />
{:else if snippet === "Accent"}
  <UI.Select
    label={{ name: $T("ui.accent") }}
    help={{ info: $T("ui.accent.info") }}
    type="buttons"
    options={$optionsStore.ACCENT_OPTIONS.filter((option) => !initialValue?.exclude?.includes(option.value))}
    value={properties.accent}
    onUpdate={(accent) => edit.set("accent", accent === properties.accent ? undefined : accent)}
  />
{:else if snippet === "Label"}
  <TextsEditor {component} {onPropertyChange} />
{:else if snippet === "LabelAlign"}
  <UI.Select
    label={{ name: $T("constructor.props.align") }}
    help={{ info: $T("constructor.props.align.info") }}
    type="buttons"
    value={optionByClass(alignOptions, properties[alignKey]?.class)?.value}
    options={alignOptions}
    onUpdate={(align) => onPropertyChange({ properties: { [alignKey]: { ...properties[alignKey], class: twMerge(properties[alignKey]?.class, align) } } })}
  />
{:else if snippet === "Disabled"}
  {@render Flag($T("constructor.props.disabled"), "disabled")}
{:else if snippet === "Readonly"}
  {@render Flag($T("constructor.props.readonly"), "readonly")}
{:else if snippet === "EventHandlerArgument"}
  <UI.Select
    label={{ name: $T("constructor.props.action") }}
    help={{ info: $T("constructor.props.action.info") }}
    type="buttons"
    value={component.eventHandler?.Argument}
    options={$optionsStore.SHORT_ARGUMENT_OPTION}
    onUpdate={(Argument) => onPropertyChange({ eventHandler: { Argument } })}
  />
{:else if snippet === "BitModeInfo"}
  {#if properties.type === "bitMode" || properties.bitMode}
    <UI.TextField wrapperClass="mt-5 shadow-(--border-shadow-color) bg-(--blue-color)/20" content={{ name: $T("ui.bit_range") }} background />
  {/if}
{:else if snippet === "IconsLib"}
  {@render IconsLib(initialValue)}
{:else if snippet === "MinMaxStep"}
  {@render MinMaxStep(initialValue)}
{/if}
