<script lang="ts">
  import { getContext } from "svelte"
  import { t } from "$lib/locales/i18n"
  import type { IInputProps, UIComponent, IOption, IUIComponentHandler } from "../types"
  import * as UI from "$lib"
  import { optionsStore } from "../options"
  import { twMerge } from "tailwind-merge"

  const {
    component,
    onPropertyChange,
    forConstructor = true,
  } = $props<{
    component: UIComponent & { properties: Partial<IInputProps> }
    onPropertyChange: (updates: Partial<{ properties?: string | object; name?: string; access?: string; eventHandler?: IUIComponentHandler }>) => void
    forConstructor?: boolean
  }>()

  let isValidRegExp = $state(true)
  const DeviceVariables = getContext<{ id: string; value: string; name: string }[]>("DeviceVariables")
  let VARIABLE_OPTIONS = $derived(DeviceVariables && Array.isArray(DeviceVariables) ? DeviceVariables : [])

  const initialColor = $derived(
    $optionsStore.COLOR_OPTIONS.find((c) =>
      (c.value as string).includes(component.properties.componentClass?.split(" ").find((cls: string) => cls.startsWith("bg-"))),
    ),
  )

  const initialAlign = $derived(
    $optionsStore.TEXT_ALIGN_OPTIONS.find((a) =>
      (a.value as string).includes(component.properties.label?.class?.split(" ").find((cls: string) => cls.startsWith("text-"))),
    ),
  )

  /* Обновление свойства */
  const updateProperty = (path: string, value: string | object | boolean | number | RegExp) => {
    const newProperties = JSON.parse(JSON.stringify(component.properties))
    if (path === "regExp") {
      try {
        let regex: RegExp
        if (typeof value === "string") {
          const pattern = value.match(/^\/(.*)\/([gimsuy]*)$/)

          regex = pattern ? new RegExp(pattern[1], pattern[2]) : new RegExp(value)
          if (pattern === null) return
          regex.test("")
        } else {
          throw new Error("Invalid RegExp type")
        }

        newProperties.regExp = regex
        isValidRegExp = true
      } catch (error) {
        console.warn("Invalid RegExp:", error)
        newProperties.regExp = typeof value === "string" ? value : String(value)
        isValidRegExp = false
        return
      }
    }

    const parts = path.split(".")
    let obj = newProperties

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]
      if (!obj[part]) obj[part] = {}
      obj = obj[part]
    }

    obj[parts[parts.length - 1]] = value
    onPropertyChange({ properties: newProperties })
  }

  const handleOptionColorChange = (color: string) => {
    let componentClass = component.properties.componentClass || ""

    componentClass = componentClass
      .split(" ")
      .filter((cls: string) => !cls.startsWith("bg-"))
      .join(" ")

    if (color) {
      componentClass += ` ${color}`
    }

    updateProperty("componentClass", componentClass)
  }
</script>

{#snippet InputVariable()}
  <UI.Select
    label={{ name: $t("constructor.props.variable") }}
    type="input"
    options={VARIABLE_OPTIONS}
    value={VARIABLE_OPTIONS.find((opt) => opt.value === component.properties.id)}
    onUpdate={(value) => {
      updateProperty("id", (value as IOption).value as string)
      onPropertyChange({ name: (value as IOption).name?.split("—")[1]?.trim(), eventHandler: { Variables: [(value as IOption).value as string] } })
    }}
  />
{/snippet}

{#snippet InputAccess()}
  <UI.Select
    label={{ name: $t("constructor.props.access") }}
    type="buttons"
    options={$optionsStore.ACCESS_OPTION}
    value={$optionsStore.ACCESS_OPTION.find((o) => o.value === component.access)}
    onUpdate={(option) => onPropertyChange({ access: (option as IOption).value })}
  />
{/snippet}

{#snippet InputLabel()}
  <UI.Input
    label={{ name: $t("constructor.props.label") }}
    value={component.properties.label.name}
    onUpdate={(value) => updateProperty("label.name", value as string)}
  />
{/snippet}

{#snippet InputLabelAlign()}
  <UI.Select
    label={{ name: $t("constructor.props.align") }}
    type="buttons"
    value={initialAlign}
    options={$optionsStore.TEXT_ALIGN_OPTIONS}
    onUpdate={(option) => updateProperty("label.class", twMerge(component.properties.label.class, (option as IOption<string>).value))}
  />
{/snippet}

{#snippet InputType()}
  <UI.Select
    label={{ name: $t("constructor.props.type") }}
    options={$optionsStore.INPUT_TYPE_OPTIONS.map((o) => (component.properties.bitMode && o.value != "number" ? { ...o, disabled: true } : o))}
    type="buttons"
    value={$optionsStore.INPUT_TYPE_OPTIONS.find((opt) => opt.value === (component.properties.type || "text"))}
    onUpdate={(option) => {
      updateProperty("type", (option as UI.IOption).value as string)
    }}
  />
  {#if component.properties.type === "text" || component.properties.type === "password" || component.properties.type === "text-area"}
    <UI.Input
      label={{ name: $t("constructor.props.maxlength") }}
      type="number"
      number={{ minNum: 1, maxNum: 1000000, step: 1 }}
      value={component.properties.maxlength}
      onUpdate={(value) => updateProperty("maxlength", value as string)}
    />
    <UI.Input
      label={{ name: $t("constructor.props.regexp") }}
      value={component.properties.help.regExp}
      maxlength={150}
      help={{ info: $t("constructor.props.regexp.info") }}
      componentClass={isValidRegExp === false ? "!border-2 !border-red-400" : ""}
      onUpdate={(value) => updateProperty("help.regExp", value as string)}
    />
    {#if component.properties.type === "text-area"}
      <UI.Input
        label={{ name: $t("constructor.props.textarea.rows") }}
        value={component.properties.textareaRows}
        onUpdate={(value) => updateProperty("textareaRows", value as string)}
      />
    {/if}
  {:else if !component.properties.bitMode && component.properties.type === "number" && !component.properties.readonly && !component.properties.disabled}
    <div class="flex">
      <UI.Input
        label={{ name: $t("constructor.props.min") }}
        value={component.properties.number.minNum as number}
        type="number"
        readonly={component.properties.bitMode}
        onUpdate={(value) => {
          updateProperty("number.minNum", Number(value))
        }}
      />
      <UI.Input
        label={{ name: $t("constructor.props.max") }}
        value={component.properties.number.maxNum as number}
        type="number"
        readonly={component.properties.bitMode}
        onUpdate={(value) => {
          updateProperty("number.maxNum", Number(value))
        }}
      />
      <UI.Input
        label={{ name: $t("constructor.props.step") }}
        value={component.properties.number.step as number}
        type="number"
        readonly={component.properties.bitMode}
        onUpdate={(value) => updateProperty("number.step", Number(value))}
      />
    </div>
  {/if}
{/snippet}

{#snippet InputPlaceholder()}
  <UI.Input
    label={{ name: $t("constructor.props.placeholder") }}
    value={component.properties.placeholder as string}
    onUpdate={(value) => updateProperty("placeholder", value)}
  />
{/snippet}

{#snippet InputInfo()}
  <UI.Input
    label={{ name: $t("constructor.props.info") }}
    value={component.properties.help.info as string}
    onUpdate={(value) => updateProperty("help.info", value)}
  />
{/snippet}

{#snippet InputSettings()}
  <UI.Select
    label={{ name: $t("constructor.props.type") }}
    options={$optionsStore.INPUT_SETTING_OPTIONS.map((o) =>
      (component.properties.type === "password" || component.properties.type === "number") && o.value == "help.copyButton" ? { ...o, disabled: true } : o,
    )}
    type="buttons"
    multiSelect={true}
    value={$optionsStore.INPUT_SETTING_OPTIONS.filter((opt) => {
      if (opt.value.split(".").reduce((o, key) => o?.[key], component.properties)) return opt
    })}
    onUpdate={(value) => {
      const currentActiveValues = $optionsStore.INPUT_SETTING_OPTIONS.filter((opt) => {
        if (!opt?.value) return false
        return opt.value.split(".").reduce((o, key) => o?.[key], component.properties)
      }).map((opt) => opt.value)
      if (Array.isArray(value)) {
        value.forEach((opt) => {
          updateProperty(opt.value ?? "", true)
          if (opt.value === "bitMode") {
            updateProperty("type", "number")
            updateProperty("number.minNum", 0)
            updateProperty("number.maxNum", Math.pow(2, component.properties.range.end - component.properties.range.start + 1))
            updateProperty("number.step", 1)
            updateProperty("help.info", `${$t("constructor.props.maxnum")}: ${component.properties.number.maxNum}`)
          }
        })

        currentActiveValues.forEach((activeValue) => {
          if (!value.some((opt) => opt?.value === activeValue)) {
            updateProperty(activeValue, false)
            if (activeValue === "bitMode") {
              updateProperty("help.info", "")
            }
          }
        })
      }
    }}
  />
{/snippet}

{#snippet InputAutocomplete()}
  <UI.Select
    label={{ name: $t("constructor.props.autocomplete") }}
    options={$optionsStore.AUTOCOMPLETE_CONSTRUCTOR_OPTIONS}
    value={$optionsStore.AUTOCOMPLETE_CONSTRUCTOR_OPTIONS.find((opt) => opt.value === (component.properties.help.autocomplete || "off"))}
    onUpdate={(option) => updateProperty("help.autocomplete", (option as UI.IOption).value as string)}
  />
{/snippet}

{#snippet InputColors()}
  <UI.Select
    wrapperClass="h-14"
    label={{ name: $t("constructor.props.colors") }}
    type="buttons"
    options={$optionsStore.COLOR_OPTIONS}
    value={initialColor}
    onUpdate={(option) => handleOptionColorChange((option as UI.IOption).value as string)}
  />
{/snippet}

{#snippet InputIdentificator()}
  <UI.Input label={{ name: $t("constructor.props.id") }} value={component.properties.id} onUpdate={(value) => updateProperty("id", value as string)} />
{/snippet}

{#snippet InputWrapperClass()}
  <UI.Input
    label={{ name: $t("constructor.props.wrapperclass") }}
    value={component.properties.wrapperClass}
    onUpdate={(value) => updateProperty("wrapperClass", value as string)}
  />
{/snippet}

{#snippet InputLabelClass()}
  <UI.Input
    label={{ name: $t("constructor.props.label.class") }}
    value={component.properties.label.class}
    onUpdate={(value) => updateProperty("label.class", value as string)}
  />
{/snippet}

{#snippet InputComponentClass()}
  <UI.Input
    label={{ name: $t("constructor.props.componentclass") }}
    value={component.properties.componentClass}
    onUpdate={(value) => updateProperty("componentClass", twMerge(component.properties.componentClass, value as string))}
  />
{/snippet}

{#snippet InputValue()}
  <UI.Input label={{ name: $t("constructor.props.value") }} value={component.properties.value} onUpdate={(value) => updateProperty("value", value as string)} />
{/snippet}

{#snippet InputDisabled()}
  <UI.Switch
    label={{ name: $t("constructor.props.disabled") }}
    value={component.properties.disabled}
    options={[{ id: crypto.randomUUID(), value: 0, class: "" }]}
    onChange={(value) => updateProperty("disabled", value)}
  />
{/snippet}

{#snippet InputBitmode()}
  {#if component.properties.bitMode}
    <UI.Slider
      label={{ name: $t("constructor.props.range") }}
      type="range"
      number={{ minNum: 0, maxNum: 31, step: 1 }}
      value={[component.properties.range.start, component.properties.range.end]}
      onUpdate={(value) => {
        if (Array.isArray(value)) {
          updateProperty("range.start", value[0] as number)
          updateProperty("range.end", value[1] as number)
          updateProperty("number.minNum", 0)
          updateProperty("number.maxNum", Math.pow(2, component.properties.range.end - component.properties.range.start + 1))
          updateProperty("number.step", 1)
          updateProperty("help.info", `${$t("constructor.props.maxnum")}: ${component.properties.number.maxNum}`)
        }
      }}
    />
  {/if}
{/snippet}

{#if forConstructor}
  <div class="relative flex flex-row items-start justify-center">
    <div class="flex w-1/3 flex-col px-2">
      {@render InputVariable()}
      {@render InputAccess()}
      {@render InputType()}
    </div>
    <div class="flex w-1/3 flex-col px-2">
      {@render InputPlaceholder()}
      {@render InputInfo()}
      {@render InputSettings()}
      {@render InputBitmode()}
    </div>
    <div class="flex w-1/3 flex-col px-2">
      {@render InputLabel()}
      {@render InputLabelAlign()}
      {@render InputAutocomplete()}
      {@render InputColors()}
    </div>
  </div>
{:else}
  <div class="relative flex flex-row items-start justify-center">
    <div class="flex w-1/3 flex-col px-2">
      {@render InputIdentificator()}
      {@render InputWrapperClass()}
      {@render InputLabel()}
      {@render InputLabelClass()}
      {@render InputComponentClass()}
      {@render InputColors()}
    </div>
    <div class="flex w-1/3 flex-col px-2">
      {@render InputAccess()}
      {@render InputValue()}
      {@render InputType()}
    </div>
    <div class="flex w-1/3 flex-col px-2">
      {@render InputPlaceholder()}
      {@render InputInfo()}
      {@render InputAutocomplete()}
      {@render InputSettings()}
      <div class="flex">
        {@render InputDisabled()}
        {@render InputBitmode()}
      </div>
    </div>
  </div>
{/if}
