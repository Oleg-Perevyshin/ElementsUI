<script lang="ts">
  import { getContext } from 'svelte'
  import { t } from '$lib/locales/i18n'
  import { type UIComponent, type IGraphProps, updateProperty, type ISelectOption, type IUIComponentHandler } from '../types'
  import * as UI from '$lib'
  import Modal from '$lib/Modal.svelte'
  import { ICONS } from '$lib/icons'
  import Button from '$lib/Button/Button.svelte'
  import CrossIcon from '$lib/libIcons/CrossIcon.svelte'
  import { optionsStore } from '$lib/options'
  import { twMerge } from 'tailwind-merge'

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

  let Header: ISelectOption = $derived(
    $optionsStore.HEADER_OPTIONS.find((h) => h.value === component.eventHandler.Header) ?? {
      id: '',
      name: '',
      value: '',
      class: '!w-1/4',
    },
  )

  const initialAlign = $derived(
    $optionsStore.TEXT_ALIGN_OPTIONS.find((a) =>
      (a.value as string).includes(component.properties.label?.class?.split(' ').find((cls: string) => cls.startsWith('text-'))),
    ),
  )

  const initialColor = $derived(
    $optionsStore.COLOR_OPTIONS.find((c) =>
      (c.value as string).includes(component.properties.wrapperClass?.split(' ').find((cls: string) => cls.startsWith('bg-'))),
    ),
  )
</script>

{#if forConstructor}
  <div>
    <div class="relative flex flex-row items-start justify-center">
      <!-- Сообщение для отправки в ws по нажатию кнопки -->
      <div class="flex w-1/3 flex-col items-center px-2">
        <UI.Select
          label={{ name: $t('constructor.props.header') }}
          type="buttons"
          value={Header}
          options={$optionsStore.HEADER_OPTIONS}
          onUpdate={(option) => {
            Header = { ...option }
            onPropertyChange({ eventHandler: { Header: Header.value as string } })
          }}
        />
        {#if Header.value === 'SET'}
          <UI.Select
            label={{ name: $t('constructor.props.argument') }}
            type="buttons"
            value={$optionsStore.FULL_ARGUMENT_OPTION.find((h) => h.value === component.eventHandler.Argument) ??
              $optionsStore.FULL_ARGUMENT_OPTION.find((h) => h.value === '')}
            options={$optionsStore.FULL_ARGUMENT_OPTION}
            onUpdate={(option) => {
              onPropertyChange({ eventHandler: { Argument: option.value as string } })
            }}
          />
        {/if}
        <UI.Input
          label={{ name: Header.value !== 'SET' ? $t('constructor.props.argument') : '' }}
          wrapperClass="{Header.value === 'SET' ? 'mt-1' : ''} "
          value={component.eventHandler.Argument}
          maxlength={32}
          disabled={Header.value === 'SET' && (component.eventHandler.Argument == 'Save' || component.eventHandler.Argument == 'NoSave')}
          help={{ info: $t('constructor.props.argument.info'), autocomplete: 'on', regExp: /^[a-zA-Z0-9\-_]{0,32}$/ }}
          onUpdate={(value) => onPropertyChange({ eventHandler: { Argument: value as string } })}
        />
        {#if (component.eventHandler.Argument !== 'Save' && component.eventHandler.Argument !== 'NoSave') || Header.value === 'SET'}
          <UI.Input
            label={{ name: $t('constructor.props.value') }}
            value={component.eventHandler.Value}
            help={{ info: $t('constructor.props.value.info') }}
            maxlength={500}
            onUpdate={(value) => onPropertyChange({ eventHandler: { Value: value as string } })}
          />
        {/if}
      </div>
      <div class="flex w-1/3 flex-col px-2">
        <UI.Select
          label={{ name: $t('constructor.props.access') }}
          type="buttons"
          options={$optionsStore.ACCESS_OPTION}
          value={$optionsStore.ACCESS_OPTION.find((o) => o.value === component.access)}
          onUpdate={(option) => onPropertyChange({ access: option.value })}
        />
        <UI.Input
          label={{ name: $t('constructor.props.label') }}
          value={component.properties.label.name}
          onUpdate={(value) => updateProperty('label.name', value as string, component, onPropertyChange)}
        />
        <UI.Input
          label={{ name: $t('constructor.props.label.class') }}
          value={component.properties.label.class}
          onUpdate={(value) => updateProperty('label.class', value as string, component, onPropertyChange)}
        />
      </div>
      <div class="flex w-1/3 flex-col px-2">
        <div class="mt-6 flex gap-2">
          <UI.Button content={{ name: $t('constructor.props.buttonIcon') }} onClick={() => (showIconLib = true)} />
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
                              updateProperty('buttonIcon', icon as string, component, onPropertyChange)
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
                updateProperty('buttonIcon', '', component, onPropertyChange)
              }}
            />
          {/if}
        </div>
        <UI.Input
          label={{ name: $t('constructor.props.joystick.axes') }}
          value={component.properties.axes.map((axe: any) => axe.name).join(' ')}
          help={{ info: $t('constructor.props.joystick.axes.info'), regExp: /^[\p{L}0-9\-_":{}]+ +[\p{L}0-9\-_":{}]+(?: +[\p{L}0-9\-_":{}]+)?$/u }}
          maxlength={100}
          onUpdate={(value) => {
            const stringValue = value as string
            const spaceCount = (stringValue.match(/\s/g) || []).length
            if (spaceCount > 2) {
              return
            }
            const parts = stringValue.trim().split(/\s+/)
            updateProperty(
              'axes',
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
        <UI.Select
          wrapperClass="!h-14"
          label={{ name: $t('constructor.props.colors') }}
          type="buttons"
          options={$optionsStore.COLOR_OPTIONS}
          value={initialColor}
          onUpdate={(option) => updateProperty('wrapperClass', twMerge(component.properties.wrapperClass, option.value), component, onPropertyChange)}
        />
      </div>
    </div>
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
                  'axes',
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
  </div>
{:else}
  <div>
    <div class="relative mb-2 flex flex-row items-start justify-center">
      <!-- Сообщение для отправки в ws по нажатию кнопки -->
      <div class="flex w-1/3 flex-col items-center px-2">
        <UI.Input
          label={{ name: $t('constructor.props.id') }}
          value={component.properties.id}
          onUpdate={(value) => updateProperty('id', value as string, component, onPropertyChange)}
        />
        <UI.Select
          label={{ name: $t('constructor.props.access') }}
          type="buttons"
          options={$optionsStore.ACCESS_OPTION}
          value={$optionsStore.ACCESS_OPTION.find((o) => o.value === component.access)}
          onUpdate={(option) => onPropertyChange({ access: option.value })}
        />
      </div>
      <div class="flex w-1/3 flex-col px-2">
        <UI.Input
          label={{ name: $t('constructor.props.label') }}
          value={component.properties.label.name}
          onUpdate={(value) => updateProperty('label.name', value as string, component, onPropertyChange)}
        />
        <UI.Select
          label={{ name: $t('constructor.props.align') }}
          type="buttons"
          value={initialAlign}
          options={$optionsStore.TEXT_ALIGN_OPTIONS}
          onUpdate={(option) => updateProperty('label.class', twMerge(component.properties.label.class, option.value), component, onPropertyChange)}
        />
      </div>
      <div class="flex w-1/3 flex-col px-2">
        <div class="mt-6 flex gap-2">
          <UI.Button content={{ name: $t('constructor.props.buttonIcon') }} onClick={() => (showIconLib = true)} />
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
                              updateProperty('buttonIcon', icon as string, component, onPropertyChange)
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
                updateProperty('buttonIcon', '', component, onPropertyChange)
              }}
            />
          {/if}
        </div>
        <UI.Input
          label={{ name: $t('constructor.props.joystick.axes') }}
          value={component.properties.axes.map((axe: any) => axe.name).join(' ')}
          help={{ info: $t('constructor.props.joystick.axes.info'), regExp: /^[\p{L}0-9\-_":{}]+ +[\p{L}0-9\-_":{}]+(?: +[\p{L}0-9\-_":{}]+)?$/u }}
          maxlength={100}
          onUpdate={(value) => {
            const stringValue = value as string
            const spaceCount = (stringValue.match(/\s/g) || []).length
            if (spaceCount > 2) {
              return
            }
            const parts = stringValue.trim().split(/\s+/)
            updateProperty(
              'axes',
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

        <UI.Select
          wrapperClass="!h-14"
          label={{ name: $t('constructor.props.colors') }}
          type="buttons"
          options={$optionsStore.COLOR_OPTIONS}
          value={initialColor}
          onUpdate={(option) => updateProperty('wrapperClass', twMerge(component.properties.wrapperClass, option.value), component, onPropertyChange)}
        />
      </div>
    </div>
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
                  'axes',
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
  </div>
{/if}
