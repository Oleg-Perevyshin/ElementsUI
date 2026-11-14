<!-- $lib/Button/ButtonProps.svelte - панель свойств конструктора для Button -->
<script lang="ts">
  import TextsEditor from "../TextsEditor.svelte"
  import { localizeText } from "../locales/localize"
  import { DEFAULT_LANGUAGE } from "../locales/languages"
  import { T } from "../locales/i18n"
  import type { UIComponent, IButtonProps } from "../types"
  import { createPropsEditor, optionByClass, type PropertyChange } from "../propsEditor"
  import * as UI from ".."
  import { optionsStore } from "../options"
  import ArgumentSelect from "../ArgumentSelect.svelte"
  import type { AccentColor } from "../accent"
  import { twMerge } from "tailwind-merge"
  import { ICONS } from "../icons"
  import CommonSnippets from "../CommonSnippets.svelte"
  import PropsGroup from "../PropsGroup.svelte"
  import InfoIcon from "../libIcons/InfoIcon.svelte"

  const {
    component,
    onPropertyChange,
  }: {
    component: UIComponent<"Button">
    onPropertyChange: (change: PropertyChange<IButtonProps>) => void
  } = $props()

  const edit = $derived(createPropsEditor(component, onPropertyChange))
  const properties = $derived(component.properties)
  const hasName = $derived(!!localizeText(properties.content?.name, DEFAULT_LANGUAGE).trim())

  /* Argument пуст - поле ниже лишь визуально показывает "ModCfg", реальное значение нужно проставить в состояние */
  $effect(() => {
    if (!component.eventHandler?.Argument) onPropertyChange({ eventHandler: { Argument: "ModCfg" } })
  })

  /* Один выбор цвета: серый - secondary (поверхность с контуром), цвет - primary этого цвета, повторное нажатие на выбранный - plain (без фона) */
  const colorValue = $derived(properties.variant === "primary" ? (properties.accent ?? "blue") : properties.variant === "secondary" ? "gray" : undefined)
  const setColor = (accent: AccentColor) =>
    onPropertyChange({
      properties:
        accent === colorValue
          ? { variant: "plain", accent: undefined }
          : accent === "gray"
            ? { variant: "secondary", accent: undefined }
            : { variant: "primary", accent: accent === "blue" ? undefined : accent },
    })

  /* Иконка без подписи - круглая кнопка по размеру иконки */
  const setIcon = (icon: string) =>
    onPropertyChange({
      properties: {
        content: { ...properties.content, icon },
        ...(icon || !hasName ? { componentClass: twMerge(properties.componentClass, icon && !hasName ? "w-fit p-2" : "w-full px-1 py-1") } : {}),
      },
    })
</script>

<div class="flex flex-col gap-2">
  <PropsGroup label={$T("constructor.props.group.general")}>
    <CommonSnippets snippet="Access" {component} {onPropertyChange} />
    <UI.Select
      label={{ name: $T("constructor.props.header") }}
      help={{ info: $T("constructor.props.button.header.info") }}
      type="buttons"
      value={component.eventHandler?.Header}
      options={$optionsStore.HEADER_OPTIONS}
      onUpdate={(Header) => onPropertyChange({ eventHandler: { Header } })}
    />
    <ArgumentSelect value={component.eventHandler?.Argument || "ModCfg"} onUpdate={(Argument) => onPropertyChange({ eventHandler: { Argument } })} />
  </PropsGroup>
  <PropsGroup label={$T("constructor.props.group.value")}>
    {#if component.eventHandler?.Argument !== "ModCfg" || component.eventHandler?.Header === "SET"}
      <UI.Input
        label={{ name: $T("constructor.props.value") }}
        value={component.eventHandler?.Value}
        help={{ info: $T("constructor.props.value.info") }}
        maxlength={500}
        onUpdate={(value) => onPropertyChange({ eventHandler: { Value: String(value) } })}
      />
    {/if}
    <UI.Input
      label={{ name: $T("constructor.props.variables") }}
      disabled={!!component.eventHandler?.Value}
      value={component.eventHandler?.Variables?.join(" ")}
      help={{ info: $T("constructor.props.variables.info"), autocomplete: "on", regExp: /^[a-zA-Z0-9.\-_ ":{}]{0,500}$/ }}
      maxlength={500}
      onUpdate={(value) => onPropertyChange({ eventHandler: { Variables: String(value).trim().split(/\s+/) } })}
    />
    <div class="flex items-end gap-2">
      <UI.Button wrapperClass="w-8" content={{ icon: InfoIcon, info: { text: $T("constructor.props.button.colors.hint"), side: "right" } }} />
      <UI.Select
        label={{ name: $T("constructor.props.colors") }}
        help={{ info: $T("constructor.props.button.colors.info") }}
        type="buttons"
        options={$optionsStore.ACCENT_OPTIONS}
        value={colorValue}
        onUpdate={setColor}
      />
    </div>
  </PropsGroup>
  <PropsGroup label={$T("constructor.props.group.appearance")}>
    <TextsEditor {component} {onPropertyChange} />
    <CommonSnippets
      snippet="IconsLib"
      initialValue={{ name: $T("constructor.props.buttonIcon"), icon: properties.content?.icon, onUpdate: setIcon, icons: { array: ICONS } }}
      {component}
      {onPropertyChange}
    />
    {#if hasName || !properties.content?.icon}
      <UI.Select
        label={{ name: $T("constructor.props.height") }}
        help={{ info: $T("constructor.props.button.height.info") }}
        type="buttons"
        options={$optionsStore.HEIGHT_OPTIONS}
        value={optionByClass($optionsStore.HEIGHT_OPTIONS, properties.componentClass)?.value}
        onUpdate={(height) => edit.set("componentClass", twMerge(properties.componentClass, height))}
      />
    {/if}
  </PropsGroup>
</div>
