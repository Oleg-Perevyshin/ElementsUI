<script lang="ts">
  import { getContext } from "svelte"
  import { t } from "$lib/locales/i18n"
  import { type UIComponent, type IGraphProps, updateProperty, type ISelectOption, type IUIComponentHandler } from "../types"
  import * as UI from "$lib"
  import Modal from "$lib/Modal.svelte"
  import { ICONS } from "$lib/icons"
  import Button from "$lib/Button/Button.svelte"
  import CrossIcon from "$lib/libIcons/CrossIcon.svelte"
  import { optionsStore } from "$lib/options"
  import { twMerge } from "tailwind-merge"
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

  let showIconLib = $state(false)

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

{#snippet JoystickButtonIcon()}
  <div class="mt-6 flex gap-2">
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
                        updateProperty("buttonIcon", icon as string, component, onPropertyChange)
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
    {#if component.properties.buttonIcon}
      <Button
        wrapperClass="w-8.5 "
        componentClass="p-0.5 bg-red"
        content={{ icon: CrossIcon }}
        onClick={() => {
          updateProperty("buttonIcon", "", component, onPropertyChange)
        }}
      />
    {/if}
  </div>
{/snippet}

{#snippet JoystickAxesNames()}
  <UI.Input
    label={{ name: $t("constructor.props.joystick.axes") }}
    value={component.properties.axes.map((axe: any) => axe.name).join(" ")}
    help={{ info: $t("constructor.props.joystick.axes.info"), regExp: /^[\p{L}0-9\-_":{}]+ +[\p{L}0-9\-_":{}]+(?: +[\p{L}0-9\-_":{}]+)?$/u }}
    maxlength={100}
    onUpdate={(value) => {
      const stringValue = value as string
      const spaceCount = (stringValue.match(/\s/g) || []).length
      if (spaceCount > 2) {
        return
      }
      const parts = stringValue.trim().split(/\s+/)
      updateProperty(
        "axes",
        parts.map((a: any, index: number) => {
          let axeIndex = parts.length == 2 && component.properties.axes.length === 3 ? index + 1 : index
          return {
            name: a,
            minNum: component.properties.axes[axeIndex] ? component.properties.axes[axeIndex].minNum : -100,
            maxNum: component.properties.axes[axeIndex] ? component.properties.axes[axeIndex].maxNum : 100,
          }
        }),
        component,
        onPropertyChange,
      )
    }}
  />
{/snippet}

{#snippet JoystickAxesMinMax()}
  <div class="mt-2 flex w-full justify-around gap-2">
    {#each component.properties.axes as axe, index}
      <div class="flex items-start gap-2">
        <h5 class="mt-1">{axe.name}</h5>
        <UI.Slider
          type="range"
          number={{ minNum: -360, maxNum: 360, step: 10 }}
          value={[component.properties.axes[index].minNum, component.properties.axes[index].maxNum]}
          onUpdate={(value) => {
            if (Array.isArray(value)) {
              const axes = component.properties.axes

              updateProperty(
                "axes",
                axes.map((a: any, i: number) => (i === index ? { ...a, minNum: value[0], maxNum: value[1] } : a)),
                component,
                onPropertyChange,
              )
            }
          }}
        />
      </div>
    {/each}
  </div>
{/snippet}

{#if forConstructor}
  <div>
    <div class="relative flex flex-row items-start justify-center">
      <div class="flex w-1/3 flex-col px-2">
        <CommonSnippets snippet="Variable" {VARIABLE_OPTIONS} {component} {onPropertyChange} />
        <CommonSnippets snippet="EventHandlerArgument" {component} {onPropertyChange} />
      </div>
      <div class="flex w-1/3 flex-col px-2">
        <CommonSnippets snippet="Access" {component} {onPropertyChange} />
        <CommonSnippets snippet="Label" {component} {onPropertyChange} />
        <CommonSnippets snippet="LabelAlign" initialValue={initialAlign} {component} {onPropertyChange} />
      </div>
      <div class="flex w-1/3 flex-col px-2">
        {@render JoystickButtonIcon()}
        {@render JoystickAxesNames()}
        <CommonSnippets snippet="Colors" initialValue={initialColor} {component} {onPropertyChange} />
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
      </div>
      <div class="flex w-1/3 flex-col px-2">
        {@render JoystickButtonIcon()}
        {@render JoystickAxesNames()}
        <CommonSnippets snippet="Colors" initialValue={initialColor} {component} {onPropertyChange} />
      </div>
    </div>
    {@render JoystickAxesMinMax()}
  </div>
{/if}
