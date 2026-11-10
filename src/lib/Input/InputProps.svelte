<!-- $lib/Input/InputProps.svelte - панель свойств конструктора для Input -->
<script lang="ts">
  import { getContext } from "svelte"
  import { T } from "../locales/i18n"
  import translations from "../locales/constructor"
  import { DEFAULT_LANGUAGE, LANGUAGE_CODES } from "../locales/languages"
  import type { IInputProps, IOption, UIComponent } from "../types"
  import { createPropsEditor, optionByClass, type PropertyChange } from "../propsEditor"
  import * as UI from ".."
  import { optionsStore } from "../options"
  import { twMerge } from "tailwind-merge"
  import Library from "../libIcons/Library.svelte"
  import CommonSnippets from "../CommonSnippets.svelte"
  import PropsGroup from "../PropsGroup.svelte"

  const {
    component,
    onPropertyChange,
  }: {
    component: UIComponent<"Input">
    onPropertyChange: (change: PropertyChange<IInputProps>) => void
  } = $props()

  const edit = $derived(createPropsEditor(component, onPropertyChange))
  const properties = $derived(component.properties)
  const VARIABLE_OPTIONS = getContext<{ id: string; value: string; name: string }[] | undefined>("DeviceVariables") ?? []

  let showRegExpLibrary = $state(false)
  let isValidRegExp = $state(true)

  /* Диапазон битов поля bitMode; без range в свойствах - один нулевой бит */
  const bitRange = $derived(properties.range ?? { start: 0, end: 0 })
  const bitMax = (range: { start: number; end: number }) => Math.pow(2, range.end - range.start + 1) - 1

  /* Подсказка битового режима «Максимальное число: N» сразу на всех языках - иначе записалась бы на языке интерфейса конструктора; текст на языках хранится как и остальные переводы */
  const maxNumInfo = (range: { start: number; end: number }) => {
    const row = translations["constructor.props.maxnum"]
    return Object.fromEntries(LANGUAGE_CODES.map((lang) => [lang, `${row[lang] || row[DEFAULT_LANGUAGE]}: ${bitMax(range)}`])) as unknown as string
  }
  const bitProps = (range: { start: number; end: number }) => ({
    range,
    number: { minNum: 0, maxNum: bitMax(range), step: 1 },
    help: { ...properties.help, info: maxNumInfo(range) },
  })

  const setType = (type: NonNullable<IInputProps["type"]>) =>
    onPropertyChange({
      properties:
        type === "bitMode"
          ? { type, ...bitProps(bitRange) }
          : { type, help: { ...properties.help, info: "", copyButton: type === "password" ? false : properties.help?.copyButton } },
    })

  const isPattern = (text: string) => {
    try {
      const match = text.match(/^\/(.*)\/([gimsuy]*)$/)
      new RegExp(match ? match[1] : text, match?.[2])
      return true
    } catch {
      return false
    }
  }
  const setRegExp = (regExp: string) => {
    isValidRegExp = isPattern(regExp)
    if (isValidRegExp) edit.patch("help", { regExp })
  }

  const settings = $derived([properties.readonly && "readonly", properties.help?.copyButton && "help.copyButton"].filter(Boolean) as string[])
  const isText = $derived(properties.type === "text" || properties.type === "password" || properties.type === "text-area")
</script>

<div class="flex flex-col gap-2">
  <PropsGroup label={$T("constructor.props.group.general")}>
    <CommonSnippets snippet="Access" {component} {onPropertyChange} />
    <CommonSnippets snippet="Variable" {VARIABLE_OPTIONS} {component} {onPropertyChange} />
    <UI.Select
      label={{ name: $T("constructor.props.type") }}
      options={$optionsStore.INPUT_TYPE_OPTIONS}
      type="buttons"
      value={properties.type ?? "text"}
      onUpdate={setType}
    />
    {#if isText}
      <UI.Input
        label={{ name: $T("constructor.props.maxlength") }}
        type="number"
        number={{ minNum: 1, maxNum: 1000000, step: 1 }}
        value={properties.maxlength}
        onUpdate={(value) => edit.set("maxlength", Number(value))}
      />
      <div class="flex items-end">
        <UI.Input
          label={{ name: $T("constructor.props.regexp") }}
          value={properties.help?.regExp?.toString()}
          maxlength={150}
          accent={isValidRegExp ? undefined : "red"}
          onInput={(text) => (isValidRegExp = isPattern(text))}
          onUpdate={(value) => setRegExp(String(value))}
        />
        <UI.Button
          wrapperClass="w-8"
          content={{ icon: Library, info: { text: $T("constructor.props.regexp.library.info"), side: "top" } }}
          onClick={() => (showRegExpLibrary = !showRegExpLibrary)}
        />
        <UI.Modal title={$T("constructor.props.regexp.library.info")} bind:isOpen={showRegExpLibrary} wrapperClass="w-200 h-[80%]">
          {#snippet main()}
            {#each $optionsStore.INPUT_REGEXP_OPTIONS as regexp (regexp.id)}
              <button
                class="m-1.5 flex cursor-pointer flex-col items-start justify-start rounded-xl border-2 border-(--border-color) p-3 transition duration-150 hover:bg-(--gray-color)/30"
                onclick={() => {
                  setRegExp(regexp.value)
                  showRegExpLibrary = false
                }}
              >
                <h5>{regexp.name}</h5>
                <span>{regexp.value}</span>
              </button>
            {/each}
          {/snippet}
        </UI.Modal>
      </div>
      {#if properties.type === "text-area"}
        <UI.Input
          label={{ name: $T("constructor.props.textarea.rows") }}
          type="number"
          value={properties.textareaRows}
          onUpdate={(value) => edit.set("textareaRows", Number(value))}
        />
      {/if}
      {#if properties.type !== "password"}
        <UI.Select
          label={{ name: $T("constructor.props.align.content") }}
          options={$optionsStore.TEXT_ALIGN_OPTIONS}
          type="buttons"
          value={optionByClass($optionsStore.TEXT_ALIGN_OPTIONS, properties.componentClass)?.value ?? "text-left"}
          onUpdate={(align) => edit.set("componentClass", twMerge(properties.componentClass, align))}
        />
      {/if}
    {:else if properties.type === "number" && !properties.readonly && !properties.disabled}
      <CommonSnippets
        snippet="MinMaxStep"
        initialValue={{ number: properties.number, onUpdate: (number: IInputProps["number"]) => edit.set("number", number) }}
        {component}
        {onPropertyChange}
      />
    {:else if properties.type === "bitMode"}
      <UI.Slider
        label={{ name: $T("constructor.props.range") }}
        type="range"
        number={{ minNum: 0, maxNum: 31, step: 1 }}
        value={[bitRange.start, bitRange.end]}
        onUpdate={(value) => Array.isArray(value) && onPropertyChange({ properties: bitProps({ start: value[0], end: value[1] }) })}
      />
    {/if}
  </PropsGroup>
  <PropsGroup label={$T("constructor.props.group.value")}>
    <UI.Input
      label={{ name: $T("constructor.props.defaultvalue") }}
      help={{ regExp: properties.type === "number" ? /^-?\d*\.?\d+$/ : undefined }}
      value={properties.value}
      onUpdate={(value) => edit.set("value", value)}
    />
    {#if properties.type !== "bitMode"}
      <UI.Select
        options={$optionsStore.INPUT_SETTING_OPTIONS.map((option) => ({
          ...option,
          disabled: properties.type === "password" && option.value === "help.copyButton",
        }))}
        type="buttons"
        multiSelect
        value={settings}
        onUpdate={(values) =>
          onPropertyChange({
            properties: { readonly: values.includes("readonly"), help: { ...properties.help, copyButton: values.includes("help.copyButton") } },
          })}
      />
    {/if}
    <CommonSnippets snippet="BitModeInfo" {component} {onPropertyChange} />
  </PropsGroup>
  <PropsGroup label={$T("constructor.props.group.appearance")}>
    <CommonSnippets snippet="Label" {component} {onPropertyChange} />
    <CommonSnippets snippet="LabelAlign" {component} {onPropertyChange} />
    <UI.Select
      label={{ name: $T("constructor.props.autocomplete") }}
      options={$optionsStore.AUTOCOMPLETE_CONSTRUCTOR_OPTIONS as IOption<string>[]}
      value={properties.help?.autocomplete || "off"}
      onUpdate={(autocomplete) => edit.patch("help", { autocomplete: autocomplete as NonNullable<IInputProps["help"]>["autocomplete"] })}
    />
    <CommonSnippets snippet="Accent" {component} {onPropertyChange} />
  </PropsGroup>
</div>
