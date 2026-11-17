/* src/lib/protocols/dronecan/plot.ts - автографики DroneCAN по описанию типа, для любого модуля: какие поля сообщения рисовать на графике без ручной настройки */
import { droneCanType } from "./codec.js"
import type { DroneCanStruct } from "./types.js"

/* Автографики - по описанию типа, для любого модуля: на график идут float, целые со знаком и короткие (до 4) массивы float - векторы;
   не идут поля с именованными значениями DSDL (константы ИМЯПОЛЯ_*: health, mode, status), метки времени, идентификаторы, счётчики, флаги, строки и union */
const PLOT_EXCLUDE = /(^|_)(timestamp|usec|id|uptime|count|crc|flags?|version|index)(_|\d|$)/i
export const droneCanPlotFields = (typeName: string, value: unknown): [string, number][] => {
  const def = droneCanType(typeName)
  if (!def || def.kind !== "msg") return []
  const out: [string, number][] = []
  const walk = (s: DroneCanStruct, v: unknown, prefix: string, depth: number) => {
    if (s.union || !v || typeof v !== "object") return
    const record = v as Record<string, unknown>
    for (const f of s.fields) {
      const name = f.name
      if (!name || PLOT_EXCLUDE.test(name)) continue
      const path = prefix ? `${prefix}.${name}` : name
      const field = record[name]
      const named = !!s.constants && Object.keys(s.constants).some((c) => c.startsWith(`${name.toUpperCase()}_`))
      const t = f.type
      if (t.k === "p") {
        if (!named && (t.kind === "f" || t.kind === "i") && typeof field === "number") out.push([path, field])
      } else if (t.k === "a" && t.of.k === "p" && t.of.kind === "f" && t.max <= 4 && Array.isArray(field)) {
        field.forEach((x, i) => typeof x === "number" && out.push([`${path}[${i}]`, x]))
      } else if (t.k === "c" && depth < 3) {
        const nested = droneCanType(t.name)
        if (nested?.kind === "msg") walk(nested.msg, field, path, depth + 1)
      }
    }
  }
  walk(def.msg, value, "", 0)
  return out
}

/* Все числа сообщения с путями как у графиков - для ручного выбора полей */
export const droneCanNumericFields = (value: unknown, prefix = ""): [string, number][] => {
  if (typeof value === "number") return [[prefix, value]]
  if (Array.isArray(value)) return value.flatMap((v, i) => droneCanNumericFields(v, `${prefix}[${i}]`))
  if (value && typeof value === "object") return Object.entries(value).flatMap(([k, v]) => droneCanNumericFields(v, prefix ? `${prefix}.${k}` : k))
  return []
}
