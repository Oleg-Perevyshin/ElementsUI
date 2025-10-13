<script lang="ts">
  import { type ITableHeader, type ITableProps, type UIComponent } from '$lib'
  import Table from '$lib/Table/Table.svelte'
  import TableProps from '$lib/Table/TableProps.svelte'

  let tableComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: 'Table',
    component: null,
    properties: {
      id: crypto.randomUUID(),
      wrapperClass: 'bg-blue',
      label: { name: 'Label', class: 'text-center' },
      header: [
        {
          key: 'id',
          label: { name: 'ID' },
          width: '40%',
          sortable: true,
        } as ITableHeader<any>,
        {
          key: 'device',
          label: { name: 'Device' },
          width: '60%',
          sortable: false,
        } as ITableHeader<any>,
      ],
      body: [
        {
          id: 'Value of id',
          device: 'Value of device',
        },
        {
          id: 'Value of id',
          device: 'Value of device',
        },
        {
          id: 'Value of id',
          device: 'Value of device',
        },
      ],
      footer: '',
    },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: '',
  })

  const updateComponent = (id: string, updates: Partial<{ properties: Partial<UIComponent['properties']> }>) => {
    tableComponent = {
      ...tableComponent,
      properties: updates.properties ? { ...tableComponent.properties, ...updates.properties } : tableComponent.properties,
    }
  }
</script>

<div class="h-100">
  <Table {...tableComponent.properties as ITableProps<object>} />
</div>

<TableProps
  component={tableComponent as UIComponent & { properties: Partial<ITableProps<object>> }}
  onPropertyChange={(value) => updateComponent(tableComponent.id, { properties: value } as object)}
/>
