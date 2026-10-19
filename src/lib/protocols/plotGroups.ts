/* $lib/protocols/plotGroups.ts */
/* Графики отладки: кадр xPOE-Debug OK! DebPlot (SC_PLOT прошивки), VALUE — hex CBOR-карты {"Группа.Имя": float32, …} в порядке вызова.
   График на группу — префикс имени до первой точки, без префикса — общая группа ""; серии в порядке карты, у серий, которых в кадре нет, — после них */
import { cborToValue } from "./cbor/value.js"
import { xPoeDebugValueFromText } from "./xPoeDebug.js"

export const DEB_PLOT_ARGUMENT = "DebPlot"

export interface PlotPoint {
  name: string
  value: number
}

/* Значения графиков из VALUE кадра DebPlot (hex CBOR-карты); не карта — пустой список */
export const debPlotValues = (value: string): [string, number][] => {
  try {
    const decoded = cborToValue(xPoeDebugValueFromText(value))
    const entries = decoded instanceof Map ? [...decoded] : decoded && typeof decoded === "object" ? Object.entries(decoded) : []
    return entries.filter((e): e is [string, number] => typeof e[0] === "string" && typeof e[1] === "number" && Number.isFinite(e[1]))
  } catch {
    return []
  }
}

export const createPlotGroups = () => {
  const groups = new Map<string, Map<string, number>>()
  return {
    /* Значения одного кадра; возвращает группы, которые обновились */
    update(values: [string, number][]): string[] {
      const fresh = new Map<string, Map<string, number>>()
      for (const [series, value] of values) {
        const dot = series.indexOf(".")
        const group = dot > 0 ? series.slice(0, dot) : ""
        if (!fresh.has(group)) fresh.set(group, new Map())
        fresh.get(group)!.set(dot > 0 ? series.slice(dot + 1) : series, value)
      }
      for (const [group, ordered] of fresh) {
        for (const [name, value] of groups.get(group) ?? []) if (!ordered.has(name)) ordered.set(name, value)
        groups.set(group, ordered)
      }
      return [...fresh.keys()]
    },
    /* Последние значения серий группы */
    data(group: string): PlotPoint[] {
      return Array.from(groups.get(group) ?? [], ([name, value]) => ({ name, value }))
    },
    clear() {
      groups.clear()
    },
  }
}
