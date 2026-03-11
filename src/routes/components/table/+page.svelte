<script lang="ts">
  import { type ITableHeader, type ITableProps, type UIComponent } from "$lib"
  import ComponentExample from "$lib/ComponentExample.svelte"
  import Table from "$lib/Table/Table.svelte"
  import TableProps from "$lib/Table/TableProps.svelte"
  import { updateComponent, type ITableButtons } from "$lib/types"
  import { onDestroy, onMount } from "svelte"
  import { formatObjectToString } from "../../common"

  let tableComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: "Table",
    access: "full",
    properties: {
      id: crypto.randomUUID(),
      wrapperClass: "bg-blue",
      label: { name: "Label", class: "text-center" },
      dataBuffer: { bufferSize: 10, visibleRows: 5, logger: false },
      header: [
        {
          key: "id-S",
          label: { name: "ID" },
          width: "40%",
          image: {
            width: "0rem",
            height: "0rem",
          },
          type: "select",
          select: { key: "" },
          align: "left",
          text: { sortable: true, truncated: false, copy: false },
        } as ITableHeader<any>,
        {
          key: "device",
          label: { name: "Device" },
          width: "30%",
          image: {
            width: "0rem",
            height: "0rem",
          },
          type: "text",
          align: "left",
          sortable: true,
          disableSelect: true,
          text: {
            truncated: true,
            copy: false,
            modal: true,
          },
        } as ITableHeader<any>,
        {
          key: "buttons",
          label: { name: "Действия" },
          width: "30%",
          buttons: [
            {
              name: "send",
              eventHandler: { Header: "SET", Argument: "Save", Variables: ["id-S"] },
            },
          ],
          type: "buttons",
          align: "left",
          text: {
            truncated: true,
            copy: false,
          },
        } as ITableHeader<any>,
      ],
      body: [
        {
          "id-S": [
            { id: "Value of id1", name: "Value of id1", value: "Value of id1" },
            { id: "Value of id2", name: "Value of id2", value: "Value of id2" },
            { id: "Value of id3", name: "Value of id3", value: "Value of id3" },
            { id: "Value of id4", name: "Value of id4", value: "Value of id4" },
          ],
          id: "Value of id5",
          device: "Value of device",
          buttons: [],
        },
        {},
        {
          "id-S": [
            { id: "Value of id1", name: "Value of id1", value: "Value of id1" },
            { id: "Value of id2", name: "Value of id2", value: "Value of id2" },
            { id: "Value of id3", name: "Value of id3", value: "Value of id3" },
            { id: "Value of id4", name: "Value of id4", value: "Value of id4" },
          ],
          id: "Value of id2",
          device: "Value of device",
          buttons: [],
        },
      ],
      footer: "",
      autoscroll: true,
    },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: "",
  })

  let body: any | null = $state(null)
  let intervalId: any | null = null

  const generateStashingData = (): { "id-S": string; device: string; buttons: ITableButtons<object>[] }[] => {
    return [
      {
        "id-S": `Value of id ${Math.floor(Math.random() * 10)}`,
        device: `Value of device ${Math.floor(Math.random() * 10)}`,
        buttons: [],
      },
      // {
      //   id: `Value of id ${Math.floor(Math.random() * 10)}`,
      //   device: `Value of device ${Math.floor(Math.random() * 10)}`,
      // },
    ]
  }

  let tableRef: any = $state(null)

  $effect(() => {
    if (!(tableComponent.properties as ITableProps<object>).dataBuffer?.stashData) {
      tableRef.clearBuffer()
    }
  })

  let codeText = $derived(`
<UI.Table
${formatObjectToString(tableComponent.properties as ITableProps<object>)} 
  onClick={() => {}}
/>`)

  onMount(() => {
    body = generateStashingData()

    intervalId = setInterval(() => {
      body = generateStashingData()
    }, 1000)
  })

  onDestroy(() => {
    if (intervalId) clearInterval(intervalId)
  })
</script>

<ComponentExample {codeText}>
  {#snippet component()}
    <div class="">
      <Table
        bind:this={tableRef}
        {...tableComponent.properties as ITableProps<object>}
        body={(tableComponent.properties as ITableProps<object>).dataBuffer?.stashData ? body : (tableComponent.properties as ITableProps<object>).body}
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
