<!-- $lib/GUIRenderer/DeviceTable.svelte - таблица рендерера: обычная - строки из value, журнал (dataBuffer.stashData) - каждое новое value добавляется push() -->
<script lang="ts">
  import type Table from "../Table/Table.svelte"
  import type { ITableButton, ITableProps } from "../types"

  type Row = Record<string, unknown>
  /* view - компонент Table из views рендерера: таблица попадает в сборку, только если приложение её передало */
  let {
    view: TableView,
    properties,
    value,
    onClick,
  }: { view: typeof Table; properties: ITableProps<Row>; value: unknown; onClick?: (row: Row, button: ITableButton<Row>) => void } = $props()

  let table: Table<Row> | undefined = $state()
  const rows = $derived((Array.isArray(value) ? value : value && typeof value === "object" ? [value] : []) as Row[])

  $effect(() => {
    if (properties.dataBuffer?.stashData && rows.length) table?.push(rows)
  })
</script>

<TableView bind:this={table} {...properties} body={properties.dataBuffer?.stashData ? undefined : rows} {onClick} />
