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
      label: { name: 'Label', captionLeft: 'Off', captionRight: 'On' },
      value: 2,
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

  const updateComponent = (id: string, updates: Partial<{ properties: Partial<UIComponent['properties']> }>) => {
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
      onPropertyChange={(value) => updateComponent(switchComponent.id, { properties: value } as object)}
      forConstructor={false}
    />
  {/snippet}
</ComponentExample>
