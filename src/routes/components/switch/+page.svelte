<script lang="ts">
  import { type ISwitchProps, type UIComponent } from '$lib'
  import ComponentExample from '$lib/ComponentExample.svelte'

  import Switch from '$lib/Switch/Switch.svelte'
  import SwitchProps from '$lib/Switch/SwitchProps.svelte'
  import { formatObjectToString } from '../../common'

  let switchComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: 'Switch',
    properties: {
      id: crypto.randomUUID(),
      wrapperClass: 'bg-blue',
      disabled: false,
      height: '2rem',
      type: 'horizontal',
      bitMode: false,
      label: { name: 'Label', captionLeft: 'Off', captionRight: 'On' },
      value: 1,
      options: [
        { id: crypto.randomUUID(), value: 0, name: '', class: 'bg-red', disabled: false },
        { id: crypto.randomUUID(), value: 5, name: '', class: 'bg-green', disabled: false },
      ],
      eventHandler: { Header: 'SET', Argument: 'NoSend', Variables: [] },
    },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: '',
  })

  let codeText = $derived(`
<UI.Switch
${formatObjectToString(switchComponent.properties as ISwitchProps)} 
  onChange={() => {}}
/>`)

  const updateComponent = (updates: Partial<{ properties: Partial<UIComponent['properties']> }>) => {
    switchComponent = {
      ...switchComponent,
      properties: updates.properties ? { ...switchComponent.properties, ...updates.properties } : switchComponent.properties,
    }
  }
</script>

<ComponentExample {codeText}>
  {#snippet component()}
    <Switch {...switchComponent.properties as ISwitchProps} />
  {/snippet}
  {#snippet componentProps()}
    <SwitchProps
      component={switchComponent as UIComponent & { properties: Partial<ISwitchProps> }}
      onPropertyChange={(value) => updateComponent({ properties: value } as object)}
      forConstructor={true}
    />

    <!-- <SwitchProps
      component={switchComponent as UIComponent & { properties: Partial<ISwitchProps> }}
      onPropertyChange={(value) => updateComponent({ properties: value } as object)}
      forConstructor={true}
    /> -->
  {/snippet}
</ComponentExample>
