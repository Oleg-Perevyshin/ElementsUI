<script lang="ts">
  import { type ITableHeader, type ITableProps, type UIComponent } from '$lib'
  import Button from '$lib/Button/Button.svelte'
  import ComponentExample from '$lib/ComponentExample.svelte'
  import Table from '$lib/Table/Table.svelte'
  import TableProps from '$lib/Table/TableProps.svelte'
  import { updateComponent } from '$lib/types'
  import { onDestroy, onMount } from 'svelte'
  import { formatObjectToString } from '../../common'

  let tableComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: 'Table',
    access: 'full',
    properties: {
      id: crypto.randomUUID(),
      wrapperClass: 'bg-blue',
      label: { name: 'Label', class: 'text-center' },
      type: 'table',
      dataBuffer: { rowsAmmount: 10, cleanButton: true },
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
          align: 'left',
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
          align: 'left',
          overflow: {
            truncated: true,
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
      autoscroll: true,
    },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: '',
  })

  let body: any | null = $state(null)
  let intervalId: any | null = null
  let clear = $state(false)

  const generateLoggerString = (): { logLevel: string; payload: string } => {
    let logLevel = ['info', 'warning', 'error'][Math.floor(Math.random() * 3)]
    return { logLevel, payload: `${logLevel}` }
  }

  const generateStashingData = (): { id: string; device: string } => {
    return {
      id: `Value of id ${Math.floor(Math.random() * 10)}`,
      device: `Value of device ${Math.floor(Math.random() * 10)}`,
    }
  }

  let codeText = $derived(`
<UI.Table
${formatObjectToString(tableComponent.properties as ITableProps<object>)} 
  onClick={() => {}}
/>`)

  onMount(() => {
    body = (tableComponent.properties as ITableProps<object>).type == 'logger' ? generateLoggerString() : generateStashingData()

    intervalId = setInterval(() => {
      body = (tableComponent.properties as ITableProps<object>).type == 'logger' ? generateLoggerString() : generateStashingData()
    }, 1000)
  })

  onDestroy(() => {
    if (intervalId) clearInterval(intervalId)
  })
</script>

<ComponentExample {codeText}>
  {#snippet component()}
    <div class="h-60">
      <Table
        {...tableComponent.properties as ITableProps<object>}
        body={(tableComponent.properties as ITableProps<object>).dataBuffer?.stashData
          ? body
          : (tableComponent.properties as ITableProps<object>).body}
      />
    </div>
  {/snippet}
  {#snippet componentProps()}
    <TableProps
      component={tableComponent as UIComponent & { properties: Partial<ITableProps<object>> }}
      onPropertyChange={(updates) => (tableComponent = updateComponent(tableComponent, updates as object))}
      forConstructor={false}
    />
    <!-- <hr />
    <TableProps
      component={tableComponent as UIComponent & { properties: Partial<ITableProps<object>> }}
      onPropertyChange={(updates) => (tableComponent = updateComponent(tableComponent, updates as object))}
    /> -->
  {/snippet}
</ComponentExample>
