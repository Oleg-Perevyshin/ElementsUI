<!-- $lib/ElementsUI/SwitchProps.svelte -->
<script lang="ts">
  import { getContext } from 'svelte'
  import { t } from '$lib/locales/i18n'
  import { type UIComponent, type IGraphProps, updateProperty } from '../types'
  import * as UI from '$lib'

  const { component, onPropertyChange } = $props<{
    component: UIComponent & { properties: Partial<IGraphProps> }
    onPropertyChange: (value: string | object) => void
  }>()

  const DeviceVariables = getContext<string[]>('DeviceVariables')
  let VARIABLE_OPTIONS = $derived(
    DeviceVariables && Array.isArray(DeviceVariables)
      ? DeviceVariables.map((variable) => ({
          id: variable,
          value: variable,
          name: variable,
        }))
      : [],
  )
</script>

{#if component && component.properties}
  <div class="relative flex flex-row items-start justify-center">
    <!-- Сообщение для отправки в ws по нажатию кнопки -->
    <div class="flex w-1/3 flex-col items-center px-2">
      <UI.Select
        label={{ name: $t('constructor.props.variable') }}
        options={VARIABLE_OPTIONS}
        value={VARIABLE_OPTIONS.find((opt) => opt.value === component.properties.id)}
        onUpdate={(value) => {
          updateProperty('id', value.value as string, component, onPropertyChange)
        }}
      />
    </div>
    <div class="flex w-1/3 flex-col px-2"></div>
    <div class="flex w-1/3 flex-col px-2"></div>
  </div>
{/if}
