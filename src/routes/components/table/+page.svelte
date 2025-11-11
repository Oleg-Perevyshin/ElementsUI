<script lang="ts">
  import { type ITableHeader, type ITableProps, type UIComponent } from '$lib'
  import ComponentExample from '$lib/ComponentExample.svelte'
  import Table from '$lib/Table/Table.svelte'
  import TableProps from '$lib/Table/TableProps.svelte'
  import { formatObjectToString } from '../../common'

  let tableComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: 'Table',

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
          image: {
            width: '0rem',
            height: '0rem',
          },
        } as ITableHeader<any>,
        {
          key: 'device',
          label: { name: 'Device' },
          width: '60%',
          sortable: false,
          image: {
            width: '0rem',
            height: '0rem',
          },
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
      ],
      footer: '',
    },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: '',
  })

  let codeText = $derived(`
<UI.Table
${formatObjectToString(tableComponent.properties as ITableProps<object>)} 
  onClick={() => {}}
/>`)

  const updateComponent = (updates: Partial<{ properties: Partial<UIComponent['properties']> }>) => {
    tableComponent = {
      ...tableComponent,
      properties: updates.properties ? { ...tableComponent.properties, ...updates.properties } : tableComponent.properties,
    }
  }
</script>

<ComponentExample {codeText}>
  {#snippet component()}
    <div>
      <Table {...tableComponent.properties as ITableProps<object>} />
    </div>
  {/snippet}
  {#snippet componentProps()}
    <TableProps
      component={tableComponent as UIComponent & { properties: Partial<ITableProps<object>> }}
      onPropertyChange={(value) => updateComponent({ properties: value } as object)}
      forConstructor={false}
    />
  {/snippet}
</ComponentExample>
