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

/* Ячейка SRC → TRG: отправитель и адресат одной строкой, HEX без 0x (пояснение - в справке таблицы); у RAW адресов нет - пусто */
const routeText = (row: XPoeDebugRow): string => {
  const id = (value: string) => value.replace(/^0x/i, "")
  return row.srcId || row.trgId ? `${id(row.srcId)} → ${id(row.trgId)}` : ""
}

/* Справка таблицы xPOE-Debug (help таблицы): что в каждой колонке */
export const xPoeDebugTableHelp = { info: "common.table.xpoe.info" }

/* Направление строки: стрелка и rx/tx */
const dirText = (row: XPoeDebugRow): string => (row.dir === "tx" ? "→ tx" : row.dir === "rx" ? "← rx" : "")

export const xPoeDebugTableColumns: ITableHeader<XPoeDebugRow>[] = [
  /* Необязательные колонки (hidden): включаются выбором колонок TableColumns; time и dir пишет приложение */
  {
    id: "time",
    label: { name: "common.table.xpoe.time" },
    hidden: true,
    content: [{ type: "text", data: { key: "time" } }],
    width: tableMonoWidth(12, 5),
    align: "center",
  },
  {
    id: "dir",
    label: { name: "common.table.xpoe.dir" },
    hidden: true,
    content: [{ type: "text", data: { key: "dir", render: dirText } }],
    width: tableMonoWidth(5, 11),
    align: "center",
  },
  {
    label: { name: "SRC → TRG" },
    content: [{ type: "text", data: { key: "srcId", render: routeText } }],
    width: tableMonoWidth(11, 11),
    align: "center",
  },
  {
    label: { name: "common.table.xpoe.command" },
    content: [{ type: "text", data: { key: "argument", render: commandHtml, html: true, tooltip: commandTooltip } }],
    width: tableMonoWidth(21, 7),
    align: "left",
  },
  /* Payload как пришёл, без пояснений - копируется чистым; окно - Payload развёрнуто, сообщение и HEX; у RAW - сам текст */
  {
    label: { name: "common.table.xpoe.value" },
    content: [{ type: "text", data: { key: "value", truncated: true, copy: true, modal: xPoeDebugModal } }],
    width: "1fr",
    align: "left",
  },
  { id: "har", label: { name: "HAR" }, hidden: true, content: [{ type: "text", data: { key: "har" } }], width: tableMonoWidth(4, 3), align: "center" },
  { id: "crc", label: { name: "CRC" }, hidden: true, content: [{ type: "text", data: { key: "crc" } }], width: tableMonoWidth(4, 3), align: "center" },
  /* Свободная куча устройства из DebugLog */
  { label: { name: "FHS" }, content: [{ type: "text", data: { key: "freeHeap" } }], width: tableMonoWidth(7, 3), align: "center" },
]
