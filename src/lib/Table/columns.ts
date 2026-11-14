/* $lib/Table/columns.ts - выбор колонок таблицы: ключ колонки и колонки, скрытые по умолчанию */
import type { ITableHeader } from "../types"

/** Ключ колонки для выбора колонок: id, иначе подпись */
export const columnId = <T extends object>(column: ITableHeader<T>): string => column.id ?? column.label?.name ?? ""

/** Колонки, скрытые по умолчанию (hidden), - их ключи */
export const defaultHiddenColumns = <T extends object>(header: readonly ITableHeader<T>[]): string[] => header.filter((column) => column.hidden).map(columnId)
