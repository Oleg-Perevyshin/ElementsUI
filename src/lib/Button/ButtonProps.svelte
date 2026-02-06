<!-- $lib/ElementsUI/ButtonProps.svelte -->
<script lang="ts">
  import { Language, t } from "../locales/i18n"
  import { type UIComponent, type IButtonProps, type ISelectOption, updateProperty, type IUIComponentHandler } from "../types"
  import * as UI from "$lib"
  import { optionsStore } from "../options"
  import { twMerge } from "tailwind-merge"
  import CrossIcon from "$lib/libIcons/CrossIcon.svelte"
  import Modal from "$lib/Modal.svelte"
  import { ICONS } from "$lib/icons"
  import Button from "./Button.svelte"
  import CommonSnippets from "$lib/CommonSnippets.svelte"

  const {
    component,
    onPropertyChange,
    forConstructor = true,
  } = $props<{
    component: UIComponent & { properties: Partial<IButtonProps> }
    onPropertyChange: (updates: Partial<{ properties?: string | object; name?: string; access?: string; eventHandler?: IUIComponentHandler }>) => void
    forConstructor?: boolean
  }>()

  let showIconLib = $state(false)

  let hasValue: boolean = $derived(component.eventHandler.Value)

  let Header: ISelectOption = $derived(
    $optionsStore.HEADER_OPTIONS.find((h) => h.value === component.eventHandler.Header) ?? {
      id: "",
      name: "",
      value: "",
      class: "!w-1/4",
    },
  )

  const initialColor = $derived(
    $optionsStore.COLOR_OPTIONS.find((c) =>
      (c.value as string).includes(component.properties.componentClass?.split(" ").find((cls: string) => cls.startsWith("bg-"))),
    ),
  )

  const initialHeight = $derived(
    $optionsStore.HEIGHT_OPTIONS.find((h) =>
      (h.value as string).includes(component.properties.componentClass?.split(" ").find((cls: string) => cls.startsWith("py-"))),
    ),
  )
</script>

{#snippet ButtonHeaderArgument()}
  <UI.Select
    label={{ name: $t("constructor.props.header") }}
    type="buttons"
    value={Header}
    options={$optionsStore.HEADER_OPTIONS}
    onUpdate={(option) => {
      Header = { ...(option as ISelectOption<string>) }
      onPropertyChange({ eventHandler: { Header: Header.value as string } })
    }}
  />
  {#if Header.value === "SET"}
    <UI.Select
      label={{ name: $t("constructor.props.argument") }}
      type="buttons"
      value={$optionsStore.FULL_ARGUMENT_OPTION.find((h) => h.value === component.eventHandler.Argument) ??
        $optionsStore.FULL_ARGUMENT_OPTION.find((h) => h.value === "")}
      options={$optionsStore.FULL_ARGUMENT_OPTION}
      onUpdate={(option) => {
        onPropertyChange({ eventHandler: { Argument: (option as ISelectOption<string>).value as string } })
      }}
    />
  {/if}
  <UI.Input
    label={{ name: Header.value !== "SET" ? $t("constructor.props.argument") : "" }}
    wrapperClass="{Header.value === 'SET' ? 'mt-1' : ''} "
    value={component.eventHandler.Argument}
    maxlength={32}
    disabled={Header.value === "SET" && (component.eventHandler.Argument == "Save" || component.eventHandler.Argument == "NoSave")}
    help={{ info: $t("constructor.props.argument.info"), autocomplete: "on", regExp: /^[a-zA-Z0-9\-_]{0,32}$/ }}
    onUpdate={(value) => onPropertyChange({ eventHandler: { Argument: value as string } })}
  />
{/snippet}

{#snippet ButtonVariables()}
  {#if (component.eventHandler.Argument !== "Save" && component.eventHandler.Argument !== "NoSave") || Header.value === "SET"}
    <UI.Input
      label={{ name: $t("constructor.props.value") }}
      value={component.eventHandler.Value}
      help={{ info: $t("constructor.props.value.info") }}
      maxlength={500}
      onUpdate={(value) => onPropertyChange({ eventHandler: { Value: value as string } })}
    />
  {/if}
  <UI.Input
    label={{ name: $t("constructor.props.variables") }}
    disabled={hasValue}
    value={component.eventHandler.Variables.join(" ")}
    help={{ info: $t("constructor.props.variables.info"), autocomplete: "on", regExp: /^[a-zA-Z0-9\-_ ":{}]{0,500}$/ }}
    maxlength={500}
    onUpdate={(value) => {
      const parts = (value as string).trim().split(/\s+/)

      onPropertyChange({ eventHandler: { Variables: parts } })
    }}
  />
{/snippet}

{#snippet ButtonIcon()}
  <div class="relative mt-6 flex w-full gap-2">
    <UI.Button content={{ name: $t("constructor.props.buttonIcon") }} onClick={() => (showIconLib = true)} />
    {#if showIconLib}
      <Modal bind:isOpen={showIconLib} wrapperClass="w-130">
        {#snippet main()}
          <div class="grid grid-cols-3">
            {#each ICONS as category}
              <div class="relative m-1.5 rounded-xl border-2 border-(--border-color) p-3">
                <div class="absolute -top-3.5 bg-(--back-color) px-1">{$t(`constructor.props.icon.${category[0]}`)}</div>
                <div class="grid grid-cols-3 place-items-center gap-2">
                  {#each category[1] as icon}
                    <button
                      class="h-8 w-8 cursor-pointer [&_svg]:h-full [&_svg]:max-h-full [&_svg]:w-full [&_svg]:max-w-full"
                      onclick={() => {
                        updateProperty("content.icon", icon as string, component, onPropertyChange)
                      }}
                    >
                      {@html icon}
                    </button>{/each}
                </div>
              </div>
            {/each}
          </div>
        {/snippet}
      </Modal>
    {/if}
    {#if component.properties.content.icon}
      <Button
        wrapperClass="w-8.5 "
        componentClass="p-0.5 bg-red"
        content={{ icon: CrossIcon }}
        onClick={() => {
          updateProperty("content.icon", "", component, onPropertyChange)
        }}
      />
    {/if}
  </div>
{/snippet}

{#snippet ButtonName()}
  <UI.Input
    label={{ name: $t("constructor.props.name") }}
    value={component.properties.content.name}
    onUpdate={(value) => updateProperty("content.name", value as string, component, onPropertyChange)}
  />
{/snippet}

{#snippet ButtonHeight()}
  <UI.Select
    label={{ name: $t("constructor.props.height") }}
    type="buttons"
    options={$optionsStore.HEIGHT_OPTIONS}
    value={initialHeight}
    onUpdate={(option) =>
      updateProperty("componentClass", twMerge(component.properties.componentClass, (option as ISelectOption<string>).value), component, onPropertyChange)}
  />
{/snippet}

{#snippet ButtonInfo()}
  <UI.Input
    label={{ name: $t("constructor.props.info") }}
    value={component.properties.content.info.text}
    onUpdate={(value) => updateProperty("content.info.text", value as string, component, onPropertyChange)}
  />
{/snippet}

{#snippet ButtonInfoSide()}
  <UI.Select
    label={{ name: $t("constructor.props.info.side") }}
    type="buttons"
    options={$optionsStore.INFO_SIDE_OPTIONS}
    value={$optionsStore.INFO_SIDE_OPTIONS.find((h) => h.value === component.properties.content.info.side)}
    onUpdate={(option) => updateProperty("content.info.side", (option as ISelectOption<string>).value as string, component, onPropertyChange)}
  />
{/snippet}

{#snippet ButtonComponentClass()}
  <UI.Input
    label={{ name: $t("constructor.props.componentclass") }}
    value={component.properties.componentClass}
    onUpdate={(value) => updateProperty("componentClass", value as string, component, onPropertyChange)}
  />
{/snippet}

{#if forConstructor}
  <div class="relative flex flex-row items-start justify-center">
    <!-- Сообщение для отправки в ws по нажатию кнопки -->
    <div class="flex w-1/3 flex-col px-2">
      {@render ButtonHeaderArgument()}
    </div>
    <div class="flex w-1/3 flex-col px-2">
      {@render ButtonVariables()}
      <CommonSnippets snippet="Access" {component} {onPropertyChange} />
      {@render ButtonIcon()}
    </div>
    <div class="flex w-1/3 flex-col px-2">
      {@render ButtonName()}
      {@render ButtonHeight()}
      <CommonSnippets snippet="Colors" initialValue={initialColor} {component} {onPropertyChange} />
    </div>
  </div>
{:else}
  <div class="relative flex flex-row items-start justify-center">
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Identificator" {component} {onPropertyChange} />
      <CommonSnippets snippet="Access" {component} {onPropertyChange} />
      <CommonSnippets snippet="WrapperClass" {component} {onPropertyChange} />

      <CommonSnippets snippet="Disabled" {component} {onPropertyChange} />
    </div>
    <div class="flex w-1/3 flex-col px-2">
      {@render ButtonName()}
      {@render ButtonInfo()}
      {@render ButtonInfoSide()}
    </div>
    <div class="flex w-1/3 flex-col px-2">
      {@render ButtonComponentClass()}
      <CommonSnippets snippet="Colors" initialValue={initialColor} {component} {onPropertyChange} />
      {@render ButtonIcon()}
    </div>
  </div>
{/if}
