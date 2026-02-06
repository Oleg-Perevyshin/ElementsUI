<script lang="ts">
  import { t } from "$lib/locales/i18n"
  import { type UIComponent, type IGraphProps, updateProperty, type IUIComponentHandler } from "../types"
  import * as UI from "$lib"
  import Modal from "$lib/Modal.svelte"
  import { ICONS } from "$lib/icons"
  import Button from "$lib/Button/Button.svelte"
  import CrossIcon from "$lib/libIcons/CrossIcon.svelte"
  import { optionsStore } from "$lib/options"
  import { twMerge } from "tailwind-merge"
  import { getContext } from "svelte"
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
</script>

{#snippet MapMarkerIcon()}
  <div class="mt-6 flex gap-2">
    <UI.Button content={{ name: $t("constructor.props.markerIcon") }} onClick={() => (showIconLib = true)} />
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
                        updateProperty("markerIcon", icon as string, component, onPropertyChange)
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
    {#if component.properties.markerIcon}
      <Button
        wrapperClass="w-8.5 "
        componentClass="p-0.5 bg-red"
        content={{ icon: CrossIcon }}
        onClick={() => {
          updateProperty("markerIcon", "", component, onPropertyChange)
        }}
      />
    {/if}
  </div>
{/snippet}

{#if forConstructor}
  <div class="relative flex flex-row items-start justify-center">
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Variable" {VARIABLE_OPTIONS} {component} {onPropertyChange} />
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Label" {component} {onPropertyChange} />
      <CommonSnippets snippet="LabelAlign" initialValue={initialAlign} {component} {onPropertyChange} />
    </div>
    <div class="flex w-1/3 flex-col px-2">
      {@render MapMarkerIcon()}
    </div>
  </div>
{:else}
  <div class="relative mb-2 flex flex-row items-start justify-center">
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Identificator" {component} {onPropertyChange} />
    </div>
    <div class="flex w-1/3 flex-col px-2">
      <CommonSnippets snippet="Label" {component} {onPropertyChange} />
      <CommonSnippets snippet="LabelClass" {component} {onPropertyChange} />
    </div>

    <div class="flex w-1/3 flex-col px-2">
      {@render MapMarkerIcon()}
    </div>
  </div>
{/if}
