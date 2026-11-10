<!-- $lib/GUIRenderer/DeviceTable.svelte - таблица рендерера: обычная - строки из value, журнал (dataBuffer.stashData) - каждое новое value добавляется push() -->
<script lang="ts">
  import Table from "../Table/Table.svelte"
  import type { ITableButton, ITableProps } from "../types"

  type Row = Record<string, unknown>
  let { properties, value, onClick }: { properties: ITableProps<Row>; value: unknown; onClick?: (row: Row, button: ITableButton<Row>) => void } = $props()

  let table: Table<Row> | undefined = $state()
  const rows = $derived((Array.isArray(value) ? value : value && typeof value === "object" ? [value] : []) as Row[])

  $effect(() => {
    if (properties.dataBuffer?.stashData && rows.length) table?.push(rows)
  })
</script>

<Table bind:this={table} {...properties} body={properties.dataBuffer?.stashData ? undefined : rows} {onClick} />
