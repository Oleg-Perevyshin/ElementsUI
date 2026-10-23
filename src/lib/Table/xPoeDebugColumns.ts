/* $lib/Table/xPoeDebugColumns.ts */
/* Колонки таблицы xPOE-Debug — общие для облака и терминала (строка — xPoeDebugRow ядра протоколов) */
import type { ITableHeader } from "../types"
import { formatXPoeDebugModal, type XPoeDebugRow } from "../protocols/index.js"
import { tableMonoWidth } from "./columnWidth"

export const xPoeDebugTableColumns: ITableHeader<XPoeDebugRow>[] = [
  { label: { name: "TRG" }, content: [{ type: "text", data: { key: "trgId" } }], width: tableMonoWidth(6, 3), align: "center" },
  { label: { name: "SRC" }, content: [{ type: "text", data: { key: "srcId" } }], width: tableMonoWidth(6, 3), align: "center" },
  { label: { name: "HAR" }, content: [{ type: "text", data: { key: "har" } }], width: tableMonoWidth(4, 3), align: "center" },
  { label: { name: "HDR" }, content: [{ type: "text", data: { key: "header" } }], width: tableMonoWidth(4, 3), align: "center" },
  { label: { name: "ARG" }, content: [{ type: "text", data: { key: "argument" } }], width: tableMonoWidth(16, 3), align: "left" },
  {
    label: { name: "VALUE" },
    content: [{ type: "text", data: { key: "value", truncated: true, formatting: formatXPoeDebugModal, copy: true, modal: true } }],
    width: "1fr",
    align: "left",
  },
  /* Свободная куча устройства из DebugLog */
  { label: { name: "FHS" }, content: [{ type: "text", data: { key: "freeHeap" } }], width: tableMonoWidth(7, 3), align: "center" },
]
