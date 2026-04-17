<script lang="ts">
  import { getContext } from "svelte"
  import { t } from "$lib/locales/i18n"
  import { type UIComponent, type IGraphProps, updateProperty, type IOption, type IUIComponentHandler } from "../types"
  import * as UI from "$lib"
  import { ICONS } from "$lib/icons"
  import { optionsStore } from "$lib/options"
  import CommonSnippets from "$lib/CommonSnippets.svelte"

  const {
    component,
    onPropertyChange,
    forConstructor = true,
  } = $props<{
    component: UIComponent & { properties: Partial<IGraphProps> }
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

  const initialColor = $derived(
    $optionsStore.COLOR_OPTIONS.find((c) =>
      (c.value as string).includes(component.properties.wrapperClass?.split(" ").find((cls: string) => cls.startsWith("bg-"))),
    ),
  )
</script>

{#snippet JoystickAxesMinMax()}
  <div class="mt-2 flex w-full justify-around gap-2">
    {#each component.properties.axes as axe, index}
      {@const axesOptions = [
        { name: $t("constructor.props.joystick.pitch.axe"), info: "", regExp: /^[\p{L}0-9\-_"':{}]+$/u },
        { name: $t("constructor.props.joystick.yaw.axe"), info: "", regExp: /^[\p{L}0-9\-_"':{}]+$/u },
        { name: $t("constructor.props.joystick.roll.axe"), info: $t("constructor.props.joystick.axes.info"), regExp: /^[\p{L}0-9\-_"':{}]*$/u },
      ]}
      <div class="flex flex-col gap-1">
        <UI.Input
          label={{ name: axesOptions[index].name }}
          value={axe.name}
          help={{ info: axesOptions[index].info, regExp: axesOptions[index].regExp }}
          maxlength={20}
          onUpdate={(value) => {
            updateProperty(
              "axes",
              component.properties.axes.map((a: any, i: number) => (i === index ? { ...a, name: value } : a)),
              component,
              onPropertyChange,
            )
          }}
        />

        <CommonSnippets
          snippet="MinMaxStep"
          initialValue={{
            number: { minNum: axe.minNum, maxNum: axe.maxNum },
            bitMode: index == 2 && axe.name == "",
            updateProperty: (value: number, property: string) => {
              updateProperty(
                "axes",
                component.properties.axes.map((a: any, i: number) => (i === index ? { ...a, [property.split(".")[1]]: value } : a)),
                component,
                onPropertyChange,
              )
            },
          }}
          {component}
          {onPropertyChange}
        />
      </div>
    {/each}
  </div>
{/snippet}

{#if forConstructor}
  <div>
    <div class="relative flex flex-row items-start justify-center">
      <div class="flex w-1/3 flex-col px-2">
        <CommonSnippets snippet="Access" {component} {onPropertyChange} />
        <CommonSnippets snippet="Variable" {VARIABLE_OPTIONS} {component} {onPropertyChange} />
        <CommonSnippets snippet="EventHandlerArgument" {component} {onPropertyChange} />
      </div>
      <div class="flex w-1/3 flex-col px-2">
        <CommonSnippets snippet="Label" {component} {onPropertyChange} />
        <CommonSnippets snippet="LabelAlign" initialValue={initialAlign} {component} {onPropertyChange} />
      </div>
      <div class="flex w-1/3 flex-col px-2">
        <CommonSnippets
          snippet="IconsLib"
          initialValue={{
            name: $t("constructor.props.buttonIcon"),
            icon: component.properties.buttonIcon,
            updateProperty: (icon: string) => updateProperty("buttonIcon", icon as string, component, onPropertyChange),
            icons: { array: ICONS },
          }}
          {component}
          {onPropertyChange}
        />
        <CommonSnippets snippet="Colors" initialValue={{ color: initialColor }} {component} {onPropertyChange} />
      </div>
    </div>
    {@render JoystickAxesMinMax()}
  </div>
{:else}
  <div>
    <div class="relative mb-2 flex flex-row items-start justify-center">
      <div class="flex w-1/3 flex-col px-2">
        <CommonSnippets snippet="Identificator" {component} {onPropertyChange} />
        <CommonSnippets snippet="Access" {component} {onPropertyChange} />
      </div>
      <div class="flex w-1/3 flex-col px-2">
        <CommonSnippets snippet="Label" {component} {onPropertyChange} />
        <CommonSnippets snippet="LabelClass" {component} {onPropertyChange} />
        <CommonSnippets snippet="Readonly" {component} {onPropertyChange} />
      </div>
      <div class="flex w-1/3 flex-col px-2">
        <CommonSnippets
          snippet="IconsLib"
          initialValue={{
            name: $t("constructor.props.buttonIcon"),
            icon: component.properties.buttonIcon,
            updateProperty: (icon: string) => updateProperty("buttonIcon", icon as string, component, onPropertyChange),
            icons: { array: ICONS },
          }}
          {component}
          {onPropertyChange}
        />
        <CommonSnippets snippet="Colors" initialValue={{ color: initialColor }} {component} {onPropertyChange} />
      </div>
    </div>
    {@render JoystickAxesMinMax()}
  </div>
{/if}
