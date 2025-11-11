<script lang="ts">
  import { type ISelectOption, type ISelectProps, type UIComponent } from '$lib'
  import ComponentExample from '$lib/ComponentExample.svelte'
  import Select from '$lib/Select/Select.svelte'
  import SelectProps from '$lib/Select/SelectProps.svelte'
  import { formatObjectToString } from '../../common'

  let selectComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: 'Select',

    properties: {
      id: crypto.randomUUID(),
      wrapperClass: 'bg-max',
      disabled: false,
      label: { name: 'Label', class: 'text-center' },
      type: 'select',
      options: [{ id: crypto.randomUUID(), value: '1', name: 'Option 1', class: 'bg-max' }],
      eventHandler: { Header: 'SET', Argument: '', Variables: [] },
    },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: '',
  })

  let codeText = $derived(`
<UI.Select
${formatObjectToString(selectComponent.properties as ISelectProps)} 
  onUpdate={() => {}}
/>`)

  const updateComponent = (updates: Partial<{ properties: Partial<UIComponent['properties']> }>) => {
    selectComponent = {
      ...selectComponent,
      properties: updates.properties ? { ...selectComponent.properties, ...updates.properties } : selectComponent.properties,
    }
  }
</script>

<ComponentExample {codeText}>
  {#snippet component()}
    <Select
      {...selectComponent.properties as ISelectProps}
      onUpdate={(value) => {
        updateComponent({
          properties: { value: value },
        })
      }}
    />
  {/snippet}
  {#snippet componentProps()}
    <SelectProps
      component={selectComponent as UIComponent & { properties: Partial<ISelectProps> }}
      onPropertyChange={(value) => updateComponent({ properties: value } as object)}
      forConstructor={false}
    />
  {/snippet}
</ComponentExample>
