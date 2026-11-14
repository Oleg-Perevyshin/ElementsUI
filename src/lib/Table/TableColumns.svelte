<!-- $lib/Table/TableColumns.svelte - выбор колонок таблицы, как у таблиц БД в облаке: кнопка со значком, в панели флажки колонок и «По умолчанию». hidden - ключи скрытых колонок для hiddenColumns таблицы, undefined - по умолчанию (колонки с hidden) -->
<script lang="ts" generics="Row extends object">
  import { T } from "../locales/i18n"
  import type { ITableHeader } from "../types"
  import Dropdown from "../Dropdown/Dropdown.svelte"
  import Switch from "../Switch/Switch.svelte"
  import Button from "../Button/Button.svelte"
  import Divider from "../Divider/Divider.svelte"
  import ColumnsIcon from "../libIcons/ColumnsIcon.svelte"
  import { columnId, defaultHiddenColumns } from "./columns"

  let {
    header,
    hidden = $bindable(),
    wrapperClass = "w-8",
    componentClass = "p-1.5",
    onChange,
  }: {
    header: readonly ITableHeader<Row>[]
    hidden?: string[]
    wrapperClass?: string
    componentClass?: string
    /* Выбор изменился: ключи скрытых колонок, undefined - вернулись к умолчанию */
    onChange?: (hidden: string[] | undefined) => void
  } = $props()

  /* Колонки для выбора: с подписью; ширина 0% - служебная, её не выбирают */
  const columns = $derived(header.filter((column) => column.width !== "0%" && columnId(column)))
  const current = $derived(new Set(hidden ?? defaultHiddenColumns(header)))
  const shown = $derived(columns.filter((column) => !current.has(columnId(column))).length)

  const set = (next: string[] | undefined) => {
    hidden = next
    onChange?.(next)
  }
  /* Последнюю видимую колонку скрыть нельзя */
  const toggle = (id: string, on: boolean) => {
    const next = new Set(current)
    if (on) next.delete(id)
    else if (shown > 1) next.add(id)
    set([...next])
  }
</script>

<Dropdown
  align="end"
  button={{
    wrapperClass,
    componentClass,
    variant: "secondary",
    content: { icon: ColumnsIcon, info: { text: $T("common.table.columns", { shown, total: columns.length }), side: "top" } },
  }}
>
  {#snippet children()}
    {#each columns as column (columnId(column))}
      {@const id = columnId(column)}
      <Switch
        type="checkbox"
        wrapperClass="h-7 shrink-0 justify-start rounded-md px-2 hover:bg-(--container-color)"
        label={{ name: $T(column.label?.name ?? id), class: "min-w-0 flex-1 truncate" }}
        disabled={shown === 1 && !current.has(id)}
        value={current.has(id) ? 0 : 1}
        onUpdate={(on) => toggle(id, Boolean(on))}
      />
    {/each}
    <Divider wrapperClass="my-1" />
    <Button componentClass="h-7 text-[12px]" content={{ name: $T("common.table.columns.default") }} onClick={() => set(undefined)} />
  {/snippet}
</Dropdown>
