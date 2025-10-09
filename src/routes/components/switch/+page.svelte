<script lang="ts">
  import { type ISwitchProps, type UIComponent } from '$lib'

  import Switch from '$lib/Switch/Switch.svelte'
  import SwitchProps from '$lib/Switch/SwitchProps.svelte'

  let switchComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: 'Switch',
    component: null,
    properties: {
      id: crypto.randomUUID(),
      wrapperClass: 'bg-blue',
      disabled: false,
      label: { name: 'Label', class: 'text-center', captionLeft: 'Off', captionRight: 'On' },
      value: 2,
      eventHandler: { Header: 'SET', Argument: 'NoSend', Variables: [] },
    },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: '',
  })

  const updateComponent = (id: string, updates: Partial<{ properties: Partial<UIComponent['properties']> }>) => {
    switchComponent = {
      ...switchComponent,
      properties: updates.properties ? { ...switchComponent.properties, ...updates.properties } : switchComponent.properties,
    }
  }
</script>

<Switch {...switchComponent.properties as ISwitchProps} />

<SwitchProps
  component={switchComponent as UIComponent & { properties: Partial<ISwitchProps> }}
  onPropertyChange={(value) => updateComponent(switchComponent.id, { properties: value } as object)}
/>
