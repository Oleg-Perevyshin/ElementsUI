/* Колонки таблицы xPOE-Debug - общие для облака и терминала (строка - xPoeDebugRow ядра протоколов) */
import type { ITableHeader } from "../types"
import type { XPoeDebugRow } from "../protocols/xPoeDebug.js"
import { tableMonoWidth } from "./columnWidth"
import { xPoeDebugModal } from "./XPoeDebugModal.svelte"

export const xPoeDebugTableColumns: ITableHeader<XPoeDebugRow>[] = [
  { label: { name: "TRG" }, content: [{ type: "text", data: { key: "trgId" } }], width: tableMonoWidth(6, 3), align: "center" },
  { label: { name: "SRC" }, content: [{ type: "text", data: { key: "srcId" } }], width: tableMonoWidth(6, 3), align: "center" },
  { label: { name: "HAR" }, content: [{ type: "text", data: { key: "har" } }], width: tableMonoWidth(4, 3), align: "center" },
  { label: { name: "HDR" }, content: [{ type: "text", data: { key: "header" } }], width: tableMonoWidth(4, 3), align: "center" },
  { label: { name: "ARG" }, content: [{ type: "text", data: { key: "argument" } }], width: tableMonoWidth(16, 3), align: "left" },
  /* Строка - кратко, окно - Payload развёрнуто и HEX; у RAW - сам текст */
  {
    label: { name: "VALUE" },
    content: [{ type: "text", data: { key: "value", truncated: true, copy: true, modal: xPoeDebugModal } }],
    width: "1fr",
    align: "left",
  },
  /* Свободная куча устройства из DebugLog */
  { label: { name: "FHS" }, content: [{ type: "text", data: { key: "freeHeap" } }], width: tableMonoWidth(7, 3), align: "center" },
]
