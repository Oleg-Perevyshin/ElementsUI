<script lang="ts">
  import { getContext } from 'svelte'
  import { t } from '$lib/locales/i18n'
  import { type UIComponent, type IGraphProps, updateProperty } from '../types'
  import * as UI from '$lib'

  const {
    component,
    onPropertyChange,
    forConstructor = true,
  } = $props<{
    component: UIComponent & { properties: Partial<IGraphProps> }
    onPropertyChange: (value?: string | object, name?: string, access?: string) => void
    forConstructor?: boolean
  }>()

  const DeviceVariables = getContext<{ id: string; value: string; name: string }[]>('DeviceVariables')
  let VARIABLE_OPTIONS = $derived(DeviceVariables && Array.isArray(DeviceVariables) ? DeviceVariables : [])
</script>

{#if forConstructor}
  <div class="relative flex flex-row items-start justify-center">
    <!-- Сообщение для отправки в ws по нажатию кнопки -->
    <div class="flex w-1/3 flex-col items-center px-2">
      <UI.Select
        label={{ name: $t('constructor.props.variable') }}
        options={VARIABLE_OPTIONS}
        value={VARIABLE_OPTIONS.find((opt) => opt.value === component.properties.id)}
        onUpdate={(value) => {
          updateProperty('id', value.value as string, component, onPropertyChange)
          updateProperty('eventHandler.Variables', value.value as string, component, onPropertyChange)
          onPropertyChange(null, value.name?.split('—')[1].trim(), null)
        }}
      />
    </div>
    <div class="flex w-1/3 flex-col px-2"></div>
    <div class="flex w-1/3 flex-col px-2"></div>
  </div>
{:else}
  <div class="relative mb-2 flex flex-row items-start justify-center">
    <!-- Сообщение для отправки в ws по нажатию кнопки -->
    <div class="flex w-1/3 flex-col items-center px-2">
      <UI.Input
        label={{ name: $t('constructor.props.id') }}
        value={component.properties.id}
        onUpdate={(value) => updateProperty('id', value as string, component, onPropertyChange)}
      />
      <UI.Input
        label={{ name: $t('constructor.props.wrapperclass') }}
        value={component.properties.wrapperClass}
        onUpdate={(value) => updateProperty('wrapperClass', value as string, component, onPropertyChange)}
      />
    </div>
    <div class="flex w-1/3 flex-col px-2">
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
      <UI.Switch
        wrapperClass="bg-blue"
        label={{ name: $t('constructor.props.istest') }}
        value={component.properties.isTest}
        options={[{ id: crypto.randomUUID(), value: 0, class: '' }]}
        onChange={(value) => updateProperty('isTest', value, component, onPropertyChange)}
      />
    </div>
  </div>
  <!-- <hr class="border-gray-400" />
  <div class="space-y-4">
    <div class="m-0 flex items-center justify-center gap-2">
      <h4>{$t('constructor.props.graphdata.title')}</h4>
      <UI.Button wrapperClass="w-8" content={{ icon: ButtonAdd }} />
    </div>

    {#each component.properties.streamingData.data || [] as option, index (option.name)}
      <div class="m-0 flex items-end justify-around gap-2 border-gray-400">
        <UI.Input
          label={{ name: $t('constructor.props.optionname') }}
          wrapperClass="!w-3/10"
          value={option.name}
          onUpdate={(value) => {
            const options = [...(component.properties?.streamingData.data || [])]
            options[index]['name'] = value as string
            updateProperty('streamingData.data', options, component, onPropertyChange)
          }}
        />
        <UI.Input
          label={{ name: $t('constructor.props.optionvalue') }}
          wrapperClass="!w-3/10"
          type="number"
          value={option.value}
          onUpdate={(value) => {
            const options = [...(component.properties?.streamingData.data || [])]
            options[index]['value'] = value as number
            updateProperty('streamingData.data', options, component, onPropertyChange)
          }}
        />
        <UI.Button
          wrapperClass="w-8"
          content={{ icon: ButtonDelete }}
          onClick={() => {
            const options = [...(component.properties?.streamingData.data || [])]
            options.splice(index, 1)
            updateProperty('streamingData.data', options, component, onPropertyChange)
          }}
        />
      </div>
    {/each}
  </div> -->
{/if}
