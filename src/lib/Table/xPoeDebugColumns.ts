/* Колонки таблицы xPOE-Debug - общие для облака и терминала (строка - xPoeDebugRow ядра протоколов) */
import { get } from "svelte/store"
import type { AccentColor } from "../accent"
import { escapeHtml } from "../html"
import { T } from "../locales/i18n"
import type { DeviceMessageLevel } from "../protocols/messages.js"
import type { XPoeDebugRow } from "../protocols/xPoeDebug.js"
import type { ITableHeader } from "../types"
import { tableMonoWidth } from "./columnWidth"
import { xPoeDebugModal } from "./XPoeDebugModal.svelte"

/* Цвет метки заголовка; RAW и прочие - серые, ⚠️ (неверная CRC) - жёлтая */
const HEADER_COLORS: Record<string, AccentColor> = { GET: "blue", SET: "orange", "OK!": "green", "ER!": "red", "⚠️": "yellow" }
/* Цвет текста сообщения по уровню; info - приглушённый */
const LEVEL_COLORS: Record<DeviceMessageLevel, string> = { info: "var(--muted-color)", warn: "var(--yellow-text)", error: "var(--red-text)" }

/* Ячейка КОМАНДА: заголовок цветной меткой, рядом аргумент, ниже мелко сообщение устройства цветом уровня (до двух строк, целиком - в подсказке); данные экранированы */
const commandHtml = (row: XPoeDebugRow): string => {
  const color = HEADER_COLORS[row.header] ?? "gray"
  const badge = `<span class="rounded-md px-1.5 text-[0.9em] font-medium" style="color: var(--${color}-text); background-color: var(--${color}-soft)">${escapeHtml(row.header)}</span>`
  const message = row.message
    ? `<span class="mt-0.5 line-clamp-2 text-[0.85em] leading-tight" style="color: ${LEVEL_COLORS[row.level ?? "info"]}">${escapeHtml(row.message)}</span>`
    : ""
  return `${badge}${row.argument ? ` ${escapeHtml(row.argument)}` : ""}${message}`
}

/* Подсказка КОМАНДЫ: HAR и флаг ответа, неверная CRC, сообщение целиком */
const commandTooltip = (row: XPoeDebugRow): string => {
  const $T = get(T)
  return [
    row.har && `HAR 0x${row.har} · ${$T(row.reply ? "common.table.xpoe.reply" : "common.table.xpoe.no_reply")}`,
    row.header === "⚠️" && `${$T("common.table.xpoe.crc")} (CRC ${row.crc})`,
    row.message,
  ]
    .filter(Boolean)
    .join("\n")
}

export const xPoeDebugTableColumns: ITableHeader<XPoeDebugRow>[] = [
  { label: { name: "TRG" }, content: [{ type: "text", data: { key: "trgId" } }], width: tableMonoWidth(6, 3), align: "center" },
  { label: { name: "SRC" }, content: [{ type: "text", data: { key: "srcId" } }], width: tableMonoWidth(6, 3), align: "center" },
  {
    label: { name: "common.table.xpoe.command" },
    content: [{ type: "text", data: { key: "argument", render: commandHtml, html: true, tooltip: commandTooltip } }],
    width: tableMonoWidth(21, 7),
    align: "left",
  },
  /* Payload как пришёл, без пояснений - копируется чистым; окно - Payload развёрнуто, сообщение и HEX; у RAW - сам текст */
  {
    label: { name: "VALUE" },
    content: [{ type: "text", data: { key: "value", truncated: true, copy: true, modal: xPoeDebugModal } }],
    width: "1fr",
    align: "left",
  },
  /* Свободная куча устройства из DebugLog */
  { label: { name: "FHS" }, content: [{ type: "text", data: { key: "freeHeap" } }], width: tableMonoWidth(7, 3), align: "center" },
]
