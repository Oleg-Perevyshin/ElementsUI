<script lang="ts">
  import { type ISelectOption, type ISelectProps, type UIComponent } from '$lib'
  import Select from '$lib/Select/Select.svelte'
  import SelectProps from '$lib/Select/SelectProps.svelte'

  let selectComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: 'Select',
    component: null,
    properties: {
      id: crypto.randomUUID(),
      wrapperClass: 'bg-max',
      disabled: false,
      label: { name: 'Label', class: 'text-center' },
      type: 'select',
      options: [{ id: crypto.randomUUID(), value: '0', name: 'Option', class: '' }],
      eventHandler: { Header: 'SET', Argument: '', Variables: [] },
    },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: '',
  })

  const updateComponent = (id: string, updates: Partial<{ properties: Partial<UIComponent['properties']> }>) => {
    selectComponent = {
      ...selectComponent,
      properties: updates.properties ? { ...selectComponent.properties, ...updates.properties } : selectComponent.properties,
    }
  }
</script>

<Select {...selectComponent.properties as ISelectProps} />

<SelectProps
  component={selectComponent as UIComponent & { properties: Partial<ISelectProps> }}
  onPropertyChange={(value) => updateComponent(selectComponent.id, { properties: value } as object)}
/>
