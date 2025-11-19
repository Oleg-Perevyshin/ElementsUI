<script lang="ts">
  import { type ISwitchProps, type UIComponent } from '$lib'
  import ComponentExample from '$lib/ComponentExample.svelte'

  import Switch from '$lib/Switch/Switch.svelte'
  import SwitchProps from '$lib/Switch/SwitchProps.svelte'
  import { formatObjectToString } from '../../common'

  let switchComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: 'Switch',
    access: 'full',
    properties: {
      id: crypto.randomUUID(),
      disabled: false,
      height: '2rem',
      type: 'horizontal',
      bitMode: false,
      label: { name: 'Label', captionLeft: 'Off', captionRight: 'On' },
      value: 1,
      options: [
        { id: crypto.randomUUID(), value: 0, name: '0', class: 'bg-red', disabled: false },
        { id: crypto.randomUUID(), value: 5, name: '5', class: 'bg-green', disabled: false },
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

  const updateComponent = (
    updates: Partial<{
      name: string
      access: 'full' | 'viewOnly' | 'hidden'
      properties: Partial<UIComponent['properties']>
    }>,
  ) => {
    switchComponent = {
      ...switchComponent,
      access: updates.access ?? switchComponent.access,
      name: updates.name ?? switchComponent.name,
      properties: updates.properties ? { ...switchComponent.properties, ...updates.properties } : switchComponent.properties,
    }
  }
</script>

<ComponentExample {codeText}>
  {#snippet component()}
    <div class=" flex w-full justify-center">
      <Switch wrapperClass={(switchComponent.properties as ISwitchProps).bitMode ? 'w-50' : ''} {...switchComponent.properties as ISwitchProps} />
    </div>
  {/snippet}
  {#snippet componentProps()}
    <SwitchProps
      component={switchComponent as UIComponent & { properties: Partial<ISwitchProps> }}
      onPropertyChange={(value, name, access) => updateComponent({ access, name, properties: value } as object)}
      forConstructor={true}
    />
    <hr />
    <SwitchProps
      component={switchComponent as UIComponent & { properties: Partial<ISwitchProps> }}
      onPropertyChange={(value, name, access) => updateComponent({ access, name, properties: value } as object)}
      forConstructor={false}
    />
  {/snippet}
</ComponentExample>
