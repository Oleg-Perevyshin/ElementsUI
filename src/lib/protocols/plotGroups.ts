/* $lib/protocols/plotGroups.ts */
/* Группы графиков Teleplot (строки PLOT >Группа.Имя:Значение): график на группу — префикс до первой точки, без префикса — общая группа "".
   Серии идут в том порядке, в котором устройство их шлёт: пачка значений приходит подряд, новая начинается после паузы дольше gapMs или с повтора имени;
   порядок берётся из последней пачки (подключение посреди пачки не сдвигает порядок навсегда) */
export interface PlotPoint {
  name: string
  value: number
}

export const createPlotGroups = ({ gapMs = 50 } = {}) => {
  const groups = new Map<string, { values: Map<string, number>; burst: string[]; last: number }>()
  return {
    /* Значение серии (now — время прихода, мс); возвращает группу или null, если значение не число */
    push(series: string, value: number, now = Date.now()): string | null {
      if (!series || !Number.isFinite(value)) return null
      const dot = series.indexOf(".")
      const group = dot > 0 ? series.slice(0, dot) : ""
      const name = dot > 0 ? series.slice(dot + 1) : series
      let g = groups.get(group)
      if (!g) groups.set(group, (g = { values: new Map(), burst: [], last: now }))
      if (now - g.last > gapMs || g.burst.includes(name)) {
        const ordered = new Map<string, number>()
        for (const n of g.burst) ordered.set(n, g.values.get(n) as number)
        for (const [n, v] of g.values) if (!ordered.has(n)) ordered.set(n, v)
        g.values = ordered
        g.burst = []
      }
      g.last = now
      g.burst.push(name)
      g.values.set(name, value)
      return group
    },
    /* Последние значения серий группы в порядке устройства */
    data(group: string): PlotPoint[] {
      return Array.from(groups.get(group)?.values ?? [], ([name, value]) => ({ name, value }))
    },
    clear() {
      groups.clear()
    },
  }
}
