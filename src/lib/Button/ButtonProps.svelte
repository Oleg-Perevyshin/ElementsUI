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

{#if forConstructor}
  <div class="relative flex flex-row items-start justify-center">
    <!-- Сообщение для отправки в ws по нажатию кнопки -->
    <div class="flex w-1/3 flex-col items-center px-2">
      <UI.Select
        label={{ name: $t("constructor.props.header") }}
        type="buttons"
        value={Header}
        options={$optionsStore.HEADER_OPTIONS}
        onUpdate={(option) => {
          Header = { ...option }
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
            onPropertyChange({ eventHandler: { Argument: option.value as string } })
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
    </div>
    <div class="flex w-1/3 flex-col items-center px-2">
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
      <UI.Select
        label={{ name: $t("constructor.props.access") }}
        type="buttons"
        options={$optionsStore.ACCESS_OPTION}
        value={$optionsStore.ACCESS_OPTION.find((o) => o.value === component.access)}
        onUpdate={(option) => onPropertyChange({ access: option.value })}
      />
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
    </div>
    <div class="flex w-1/3 flex-col items-center px-2">
      <UI.Input
        label={{ name: $t("constructor.props.name") }}
        value={component.properties.content.name}
        onUpdate={(value) => updateProperty("content.name", value as string, component, onPropertyChange)}
      />
      <UI.Select
        label={{ name: $t("constructor.props.height") }}
        type="buttons"
        options={$optionsStore.HEIGHT_OPTIONS}
        value={initialHeight}
        onUpdate={(option) => updateProperty("componentClass", twMerge(component.properties.componentClass, option.value), component, onPropertyChange)}
      />
      <UI.Select
        wrapperClass="h-14"
        label={{ name: $t("constructor.props.colors") }}
        type="buttons"
        options={$optionsStore.COLOR_OPTIONS}
        value={initialColor}
        onUpdate={(option) => updateProperty("componentClass", twMerge(component.properties.componentClass, option.value), component, onPropertyChange)}
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
      <UI.Input
        label={{ name: $t("constructor.props.wrapperclass") }}
        value={component.properties.wrapperClass}
        onUpdate={(value) => updateProperty("wrapperClass", value as string, component, onPropertyChange)}
      />

      <UI.Switch
        wrapperClass="bg-blue"
        label={{ name: $t("constructor.props.disabled") }}
        value={component.properties.disabled}
        options={[{ id: crypto.randomUUID(), value: 0, class: "" }]}
        onChange={(value) => updateProperty("disabled", value, component, onPropertyChange)}
      />
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <UI.Input
        label={{ name: $t("constructor.props.name") }}
        value={component.properties.content.name}
        onUpdate={(value) => updateProperty("content.name", value as string, component, onPropertyChange)}
      />
      <UI.Input
        label={{ name: $t("constructor.props.info") }}
        value={component.properties.content.info.text}
        onUpdate={(value) => updateProperty("content.info.text", value as string, component, onPropertyChange)}
      />
      <UI.Select
        label={{ name: $t("constructor.props.info.side") }}
        type="buttons"
        options={$optionsStore.INFO_SIDE_OPTIONS}
        value={$optionsStore.INFO_SIDE_OPTIONS.find((h) => h.value === component.properties.content.info.side)}
        onUpdate={(option) => updateProperty("content.info.side", option.value as string, component, onPropertyChange)}
      />
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <UI.Input
        label={{ name: $t("constructor.props.componentclass") }}
        value={component.properties.componentClass}
        onUpdate={(value) => updateProperty("componentClass", value as string, component, onPropertyChange)}
      />
      <UI.Select
        wrapperClass="h-14"
        label={{ name: $t("constructor.props.colors") }}
        type="buttons"
        options={$optionsStore.COLOR_OPTIONS}
        value={initialColor}
        onUpdate={(option) => updateProperty("componentClass", twMerge(component.properties.componentClass, option.value), component, onPropertyChange)}
      />
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
    </div>
  </div>
{/if}
