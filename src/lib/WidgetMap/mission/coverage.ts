/* Расчёт траектории покрытия поля (boustrophedon): проходы под заданным углом с шагом, обход запретных зон с отступом, разбиение на ячейки, порядок ячеек и переходы по кратчайшему пути */

export type LngLat = [number, number]
type P = [number, number]
type Interval = [number, number]

export interface ICoverageInput {
  field: LngLat[] /* Внешний контур поля */
  holes: LngLat[][] /* Запретные зоны */
  angle: number /* Направление проходов, ° от севера по часовой */
  spacing: number /* Ширина захвата, расстояние между проходами, м */
  margin: number /* Отступ траектории от границы поля и запретных зон, м */
  start?: LngLat /* Точка взлёта: от неё строится порядок обхода */
  returnHome?: boolean /* Вернуться в точку взлёта после облёта */
  home?: LngLat /* Куда возвращаться, если не в start */
  linkStart?: boolean /* false — start задаёт только порядок обхода, переход от него строит вызывающий (облёт нескольких полей) */
}

export type SegmentKind = "spray" | "turn" | "transit"

export interface ICoverageSegment {
  kind: SegmentKind
  points: LngLat[]
}

export interface ICoverageResult {
  segments: ICoverageSegment[] /* Траектория по порядку: проходы с распылением, развороты, переходы */
  waypoints: { point: LngLat; spray: boolean }[] /* Точки миссии; spray — распыление включено до следующей точки */
  area: number /* Площадь поля без запретных зон, м² */
  sprayLength: number
  turnLength: number
  transitLength: number
  passes: number /* Число проходов */
  cells: number /* Число ячеек разбиения */
  turns: number
  unreachable: number /* Ячейки, к которым не нашёлся путь */
}

/* ********************************************************** */
/* Геометрия в метрах */

const EPS = 1e-7
const sub = (a: P, b: P): P => [a[0] - b[0], a[1] - b[1]]
const dist = (a: P, b: P) => Math.hypot(a[0] - b[0], a[1] - b[1])
const cross = (a: P, b: P) => a[0] * b[1] - a[1] * b[0]

const ringArea = (r: P[]) => {
  let s = 0
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) s += r[j][0] * r[i][1] - r[i][0] * r[j][1]
  return s / 2
}

const pointInRing = (p: P, r: P[]) => {
  let inside = false
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    const [xi, yi] = r[i]
    const [xj, yj] = r[j]
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

const segPointDist = (p: P, a: P, b: P) => {
  const ab = sub(b, a)
  const len2 = ab[0] * ab[0] + ab[1] * ab[1]
  const t = len2 < EPS ? 0 : Math.max(0, Math.min(1, ((p[0] - a[0]) * ab[0] + (p[1] - a[1]) * ab[1]) / len2))
  return dist(p, [a[0] + ab[0] * t, a[1] + ab[1] * t])
}

const segmentsCross = (a: P, b: P, c: P, d: P) => {
  const d1 = cross(sub(d, c), sub(a, c))
  const d2 = cross(sub(d, c), sub(b, c))
  const d3 = cross(sub(b, a), sub(c, a))
  const d4 = cross(sub(b, a), sub(d, a))
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))
}

const segSegDist = (a: P, b: P, c: P, d: P) =>
  segmentsCross(a, b, c, d) ? 0 : Math.min(segPointDist(a, c, d), segPointDist(b, c, d), segPointDist(c, a, b), segPointDist(d, a, b))

/* ********************************************************** */
/* Интервалы на прямой */

const intersectSets = (a: Interval[], b: Interval[]) => {
  const out: Interval[] = []
  let i = 0
  let j = 0
  while (i < a.length && j < b.length) {
    const lo = Math.max(a[i][0], b[j][0])
    const hi = Math.min(a[i][1], b[j][1])
    if (hi > lo) out.push([lo, hi])
    if (a[i][1] < b[j][1]) i++
    else j++
  }
  return out
}

const subtractSets = (a: Interval[], b: Interval[]) => {
  let out = a
  for (const [lo, hi] of b) {
    const next: Interval[] = []
    for (const [x0, x1] of out) {
      if (hi <= x0 || lo >= x1) next.push([x0, x1])
      else {
        if (lo > x0) next.push([x0, lo])
        if (hi < x1) next.push([hi, x1])
      }
    }
    out = next
  }
  return out
}

/* Пересечение горизонтали y с многоугольником по правилу чёт-нечет: отрезки внутри */
const ringIntervals = (r: P[], y: number): Interval[] => {
  const xs: number[] = []
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    const [x1, y1] = r[j]
    const [x2, y2] = r[i]
    if (y1 > y !== y2 > y) xs.push(x1 + ((y - y1) * (x2 - x1)) / (y2 - y1))
  }
  xs.sort((p, q) => p - q)
  const out: Interval[] = []
  for (let i = 0; i + 1 < xs.length; i += 2) if (xs[i + 1] > xs[i]) out.push([xs[i], xs[i + 1]])
  return out
}

const unionSets = (sets: Interval[][]) => {
  const all = sets.flat().sort((p, q) => p[0] - q[0])
  const out: Interval[] = []
  for (const iv of all) {
    const last = out[out.length - 1]
    if (last && iv[0] <= last[1]) last[1] = Math.max(last[1], iv[1])
    else out.push([iv[0], iv[1]])
  }
  return out
}

/* ********************************************************** */
/* Свободное пространство с отступом в повёрнутой системе: проходы идут вдоль оси x */

class FreeSpace {
  constructor(
    private field: P[],
    private holes: P[][],
    private margin: number,
  ) {}

  private vertexYs = () => [this.field, ...this.holes].flat().map((p) => p[1])

  private rawAt(y: number) {
    const inField = ringIntervals(this.field, y)
    return subtractSets(inField, unionSets(this.holes.map((h) => ringIntervals(h, y))))
  }

  /* Отрезки прохода на высоте y: пересечение свободных отрезков по всей полосе ±margin (с учётом вершин внутри полосы), затем укорочение концов на margin */
  intervalsAt(y: number, minLen: number): Interval[] {
    const m = this.margin
    const ys = new Set<number>([y - m + EPS, y, y + m - EPS])
    for (let k = 1; k < 4; k++) ys.add(y - m + (2 * m * k) / 4)
    for (const vy of this.vertexYs()) if (vy > y - m && vy < y + m) ys.add(vy + EPS).add(vy - EPS)
    let set: Interval[] | null = null
    for (const yy of ys) {
      const s = this.rawAt(yy)
      set = set === null ? s : intersectSets(set, s)
      if (!set.length) return []
    }
    return (set ?? []).map(([a, b]) => [a + m, b - m] as Interval).filter(([a, b]) => b - a >= minLen)
  }

  /* Отрезок пути допустим: внутри поля, вне зон, не ближе margin к их границам */
  segmentClear(a: P, b: P, clearance: number) {
    const mid: P = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
    if (!pointInRing(mid, this.field) || this.holes.some((h) => pointInRing(mid, h))) return false
    for (const ring of [this.field, ...this.holes]) {
      for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        if (segSegDist(a, b, ring[j], ring[i]) < clearance) return false
      }
    }
    return true
  }

  /* Для точки взлёта вне поля: граница поля не мешает, только запретные зоны с отступом */
  segmentClearOfHoles(a: P, b: P, clearance: number) {
    const mid: P = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
    if (this.holes.some((h) => pointInRing(mid, h))) return false
    for (const ring of this.holes) {
      for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) if (segSegDist(a, b, ring[j], ring[i]) < clearance) return false
    }
    return true
  }

  inField(p: P) {
    return pointInRing(p, this.field)
  }

  pointClear(p: P, clearance: number) {
    if (!pointInRing(p, this.field) || this.holes.some((h) => pointInRing(p, h))) return false
    for (const ring of [this.field, ...this.holes]) {
      for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) if (segPointDist(p, ring[j], ring[i]) < clearance) return false
    }
    return true
  }

  /* Узлы графа видимости: вершины поля внутрь и вершины зон наружу, со сдвигом по биссектрисе чуть больше отступа */
  graphNodes(): P[] {
    const out: P[] = []
    const d = this.margin * 1.15 + 0.5
    const push = (ring: P[], outward: boolean) => {
      const ccw = ringArea(ring) > 0
      for (let i = 0; i < ring.length; i++) {
        const prev = ring[(i + ring.length - 1) % ring.length]
        const cur = ring[i]
        const next = ring[(i + 1) % ring.length]
        const e1 = sub(cur, prev)
        const e2 = sub(next, cur)
        const l1 = Math.hypot(...e1) || 1
        const l2 = Math.hypot(...e2) || 1
        /* Нормали внутрь кольца для CCW — влево от ребра */
        const sign = (ccw ? 1 : -1) * (outward ? -1 : 1)
        const n1: P = [(-e1[1] / l1) * sign, (e1[0] / l1) * sign]
        const n2: P = [(-e2[1] / l2) * sign, (e2[0] / l2) * sign]
        const bis: P = [n1[0] + n2[0], n1[1] + n2[1]]
        const bl = Math.hypot(...bis)
        if (bl < 0.2) continue
        const scale = Math.min(d / (bl / 2), d * 4)
        const p: P = [cur[0] + (bis[0] / bl) * scale, cur[1] + (bis[1] / bl) * scale]
        if (this.pointClear(p, this.margin * 0.98)) out.push(p)
      }
    }
    push(this.field, false)
    this.holes.forEach((h) => push(h, true))
    return out
  }
}

/* ********************************************************** */
/* Кратчайшие пути в обход препятствий (граф видимости + Дейкстра) */

class Router {
  private nodes: P[]
  private adj: number[][] = []
  private cache = new Map<string, { len: number; path: P[] }>()

  constructor(
    private space: FreeSpace,
    private clearance: number,
  ) {
    this.nodes = space.graphNodes()
    const n = this.nodes.length
    for (let i = 0; i < n; i++) this.adj.push(new Array(n).fill(Infinity))
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (space.segmentClear(this.nodes[i], this.nodes[j], clearance)) this.adj[i][j] = this.adj[j][i] = dist(this.nodes[i], this.nodes[j])
      }
    }
  }

  route(a: P, b: P): { len: number; path: P[] } {
    /* Конец вне поля (точка взлёта): его отрезки проверяются только на зоны */
    const outA = !this.space.inField(a)
    const outB = !this.space.inField(b)
    const clear = (p: P, q: P, loose: boolean) => (loose ? this.space.segmentClearOfHoles(p, q, this.clearance) : this.space.segmentClear(p, q, this.clearance))
    if (clear(a, b, outA || outB)) return { len: dist(a, b), path: [a, b] }
    const key = `${a[0].toFixed(2)},${a[1].toFixed(2)}>${b[0].toFixed(2)},${b[1].toFixed(2)}`
    const hit = this.cache.get(key)
    if (hit) return hit
    const n = this.nodes.length
    /* Узлы 0..n-1 — граф, n — старт, n+1 — финиш */
    const pos = [...this.nodes, a, b]
    const edge = (i: number, j: number) => {
      if (i < n && j < n) return this.adj[i][j]
      const loose = (outA && (i === n || j === n)) || (outB && (i === n + 1 || j === n + 1))
      return clear(pos[i], pos[j], loose) ? dist(pos[i], pos[j]) : Infinity
    }
    const total = n + 2
    const best = new Array(total).fill(Infinity)
    const prev = new Array(total).fill(-1)
    const done = new Array(total).fill(false)
    best[n] = 0
    for (;;) {
      let u = -1
      for (let i = 0; i < total; i++) if (!done[i] && best[i] < Infinity && (u === -1 || best[i] < best[u])) u = i
      if (u === -1 || u === n + 1) break
      done[u] = true
      for (let v = 0; v < total; v++) {
        if (done[v] || v === u) continue
        const w = edge(u, v)
        if (w < Infinity && best[u] + w < best[v]) {
          best[v] = best[u] + w
          prev[v] = u
        }
      }
    }
    let res: { len: number; path: P[] }
    if (best[n + 1] === Infinity) res = { len: Infinity, path: [a, b] }
    else {
      const path: P[] = []
      for (let v = n + 1; v !== -1; v = prev[v]) path.unshift(pos[v])
      res = { len: best[n + 1], path }
    }
    this.cache.set(key, res)
    return res
  }
}

/* ********************************************************** */
/* Ячейки: подряд идущие проходы, где отрезки соединяются один к одному */

interface Cell {
  lines: { y: number; a: number; b: number }[]
}

const buildCells = (rows: { y: number; ivs: Interval[] }[]): Cell[] => {
  const cells: Cell[] = []
  let prevRow: { iv: Interval; cell: Cell }[] = []
  for (const row of rows) {
    const cur: { iv: Interval; cell: Cell }[] = []
    for (const iv of row.ivs) {
      const over = prevRow.filter((p) => Math.min(p.iv[1], iv[1]) - Math.max(p.iv[0], iv[0]) > 0)
      let cell: Cell | null = null
      if (over.length === 1) {
        const p = over[0]
        const back = row.ivs.filter((x) => Math.min(p.iv[1], x[1]) - Math.max(p.iv[0], x[0]) > 0)
        if (back.length === 1) cell = p.cell
      }
      if (!cell) {
        cell = { lines: [] }
        cells.push(cell)
      }
      cell.lines.push({ y: row.y, a: iv[0], b: iv[1] })
      cur.push({ iv, cell })
    }
    prevRow = cur
  }
  return cells
}

/* Вариант обхода ячейки: с какого прохода (первый/последний) и с какого конца (левый/правый) */
interface Variant {
  cell: number
  fromTop: boolean
  fromRight: boolean
}

const cellPath = (cell: Cell, v: Variant): { y: number; x0: number; x1: number }[] => {
  const lines = v.fromTop ? [...cell.lines].reverse() : cell.lines
  return lines.map((l, i) => {
    const right = v.fromRight !== (i % 2 === 1)
    return right ? { y: l.y, x0: l.b, x1: l.a } : { y: l.y, x0: l.a, x1: l.b }
  })
}

const entryOf = (cell: Cell, v: Variant): P => {
  const p = cellPath(cell, v)[0]
  return [p.x0, p.y]
}
const exitOf = (cell: Cell, v: Variant): P => {
  const ps = cellPath(cell, v)
  const p = ps[ps.length - 1]
  return [p.x1, p.y]
}

/* Порядок ячеек: точный перебор (Хелд-Карп) до 10 ячеек, иначе жадный выбор с улучшением 2-opt */
const orderCells = (cells: Cell[], cost: (a: P, b: P) => number, start: P | null): Variant[] => {
  const n = cells.length
  if (!n) return []
  const variants: Variant[][] = cells.map((_, i) => [false, true].flatMap((fromTop) => [false, true].map((fromRight) => ({ cell: i, fromTop, fromRight }))))
  const entries = variants.map((vs) => vs.map((v) => entryOf(cells[v.cell], v)))
  const exits = variants.map((vs) => vs.map((v) => exitOf(cells[v.cell], v)))
  const startCost = (i: number, k: number) => (start ? cost(start, entries[i][k]) : 0)

  if (n <= 10) {
    const full = 1 << n
    const dp = new Float64Array(full * n * 4).fill(Infinity)
    const par = new Int32Array(full * n * 4).fill(-1)
    const at = (mask: number, i: number, k: number) => (mask * n + i) * 4 + k
    for (let i = 0; i < n; i++) for (let k = 0; k < 4; k++) dp[at(1 << i, i, k)] = startCost(i, k)
    const trans = new Map<string, number>()
    const tc = (i: number, k: number, j: number, l: number) => {
      const key = `${i}.${k}.${j}.${l}`
      let c = trans.get(key)
      if (c === undefined) {
        c = cost(exits[i][k], entries[j][l])
        trans.set(key, c)
      }
      return c
    }
    for (let mask = 1; mask < full; mask++) {
      for (let i = 0; i < n; i++) {
        if (!(mask & (1 << i))) continue
        for (let k = 0; k < 4; k++) {
          const base = dp[at(mask, i, k)]
          if (base === Infinity) continue
          for (let j = 0; j < n; j++) {
            if (mask & (1 << j)) continue
            const nm = mask | (1 << j)
            for (let l = 0; l < 4; l++) {
              const c = base + tc(i, k, j, l)
              if (c < dp[at(nm, j, l)]) {
                dp[at(nm, j, l)] = c
                par[at(nm, j, l)] = at(mask, i, k)
              }
            }
          }
        }
      }
    }
    let bestIdx = -1
    for (let i = 0; i < n; i++) for (let k = 0; k < 4; k++) if (bestIdx === -1 || dp[at(full - 1, i, k)] < dp[bestIdx]) bestIdx = at(full - 1, i, k)
    const order: Variant[] = []
    for (let idx = bestIdx; idx !== -1; idx = par[idx]) {
      const k = idx % 4
      const i = Math.floor(idx / 4) % n
      order.unshift(variants[i][k])
    }
    return order
  }

  /* Жадно: следующей берётся ближайшая ячейка в лучшем варианте */
  const used = new Array(n).fill(false)
  const order: Variant[] = []
  let pos: P | null = start
  for (let step = 0; step < n; step++) {
    let best: { i: number; k: number; c: number } | null = null
    for (let i = 0; i < n; i++) {
      if (used[i]) continue
      for (let k = 0; k < 4; k++) {
        const c = pos ? cost(pos, entries[i][k]) : 0
        if (!best || c < best.c) best = { i, k, c }
      }
    }
    used[best!.i] = true
    order.push(variants[best!.i][best!.k])
    pos = exits[best!.i][best!.k]
  }
  /* 2-opt по порядку ячеек с перебором вариантов на стыках */
  const exitP = (v: Variant) => exits[v.cell][(v.fromTop ? 2 : 0) + (v.fromRight ? 1 : 0)]
  const entryP = (v: Variant) => entries[v.cell][(v.fromTop ? 2 : 0) + (v.fromRight ? 1 : 0)]
  const flip = (v: Variant): Variant => {
    const lines = cells[v.cell].lines.length
    /* Обратный проход ячейки: старт там, где был выход */
    return { cell: v.cell, fromTop: !v.fromTop, fromRight: lines % 2 === 1 ? !v.fromRight : v.fromRight }
  }
  const tourCost = (o: Variant[]) => {
    let c = start ? cost(start, entryP(o[0])) : 0
    for (let i = 0; i + 1 < o.length; i++) c += cost(exitP(o[i]), entryP(o[i + 1]))
    return c
  }
  let bestCost = tourCost(order)
  for (let improved = true, guard = 0; improved && guard < 50; guard++) {
    improved = false
    for (let i = 0; i < order.length - 1; i++) {
      for (let j = i + 1; j < order.length; j++) {
        const cand = [
          ...order.slice(0, i),
          ...order
            .slice(i, j + 1)
            .reverse()
            .map(flip),
          ...order.slice(j + 1),
        ]
        const c = tourCost(cand)
        if (c < bestCost - 1e-6) {
          order.splice(0, order.length, ...cand)
          bestCost = c
          improved = true
        }
      }
    }
  }
  return order
}

/* ********************************************************** */
/* Проекция: локальная плоскость вокруг центра поля, поворот так, чтобы проходы шли вдоль x */

const makeProjection = (field: LngLat[], angleDeg: number) => {
  const lon0 = field.reduce((s, p) => s + p[0], 0) / field.length
  const lat0 = field.reduce((s, p) => s + p[1], 0) / field.length
  const kLat = 111320
  const kLon = 111320 * Math.cos((lat0 * Math.PI) / 180)
  const th = (angleDeg * Math.PI) / 180
  /* Направление прохода (восток, север) = (sin, cos); ось x вдоль прохода, y поперёк */
  const dx = Math.sin(th)
  const dy = Math.cos(th)
  const fwd = (ll: LngLat): P => {
    const e = (ll[0] - lon0) * kLon
    const n = (ll[1] - lat0) * kLat
    return [e * dx + n * dy, -e * dy + n * dx]
  }
  const inv = (p: P): LngLat => {
    const e = p[0] * dx - p[1] * dy
    const n = p[0] * dy + p[1] * dx
    return [lon0 + e / kLon, lat0 + n / kLat]
  }
  return { fwd, inv, kLat, kLon }
}

/* Площадь поля без зон, м² (зоны, частично выходящие за поле, считаются целиком — приближение) */
export const fieldArea = (field: LngLat[], holes: LngLat[][]) => {
  if (field.length < 3) return 0
  const { fwd } = makeProjection(field, 0)
  const outer = Math.abs(ringArea(field.map(fwd)))
  const inner = holes.filter((h) => h.length >= 3).reduce((s, h) => s + Math.abs(ringArea(h.map(fwd))), 0)
  return Math.max(0, outer - inner)
}

/* ********************************************************** */
/* Проходы: равномерно между крайними допустимыми положениями, шаг не больше заданного */

const buildRows = (space: FreeSpace, ring: P[], spacing: number, margin: number) => {
  const ys = ring.map((p) => p[1])
  const lo = Math.min(...ys) + margin
  const hi = Math.max(...ys) - margin
  const span = hi - lo
  const count = span <= 0 ? 1 : Math.ceil(span / spacing - 1e-6) + 1
  const step = count > 1 ? span / (count - 1) : 0
  const minLen = Math.max(1, spacing * 0.25)
  const rows: { y: number; ivs: Interval[] }[] = []
  for (let k = 0; k < count; k++) {
    const y = count > 1 ? lo + k * step : (lo + hi) / 2
    const ivs = space.intervalsAt(y, minLen)
    if (ivs.length) rows.push({ y, ivs })
  }
  return rows
}

/* Быстрая оценка угла без маршрутизации: длина проходов, развороты и число ячеек */
export const estimateAngleCost = (input: ICoverageInput, angle: number) => {
  if (input.field.length < 3 || input.spacing <= 0) return Infinity
  const proj = makeProjection(input.field, angle)
  const field = proj.fwd ? input.field.map(proj.fwd) : []
  const holes = input.holes.filter((h) => h.length >= 3).map((h) => h.map(proj.fwd))
  const space = new FreeSpace(field, holes, Math.max(0, input.margin))
  const rows = buildRows(space, field, input.spacing, Math.max(0, input.margin))
  const cells = buildCells(rows)
  const sprayLen = rows.reduce((s, r) => s + r.ivs.reduce((q, [a, b]) => q + (b - a), 0), 0)
  const passes = rows.reduce((s, r) => s + r.ivs.length, 0)
  /* Разворот обходится как ~3 шага захвата пути, переход между ячейками — как 10 */
  return sprayLen + passes * input.spacing * 3 + cells.length * input.spacing * 10
}

/* Лучший угол: грубый перебор через 3°, затем уточнение через 0.5° */
export const optimizeAngle = (input: ICoverageInput) => {
  let best = { angle: input.angle, cost: Infinity }
  for (let a = 0; a < 180; a += 3) {
    const c = estimateAngleCost(input, a)
    if (c < best.cost) best = { angle: a, cost: c }
  }
  const base = best.angle
  for (let a = base - 3; a <= base + 3; a += 0.5) {
    const c = estimateAngleCost(input, (a + 180) % 180)
    if (c < best.cost) best = { angle: (a + 180) % 180, cost: c }
  }
  return best.angle
}

/* Точки миссии: начала и концы проходов и изломы обходов; распыление включено на проходах */
const waypointsOf = (start: LngLat | undefined, segments: ICoverageSegment[]) => {
  const waypoints: { point: LngLat; spray: boolean }[] = []
  const pushWp = (point: LngLat, spray: boolean) => {
    const last = waypoints[waypoints.length - 1]
    if (last && Math.abs(last.point[0] - point[0]) < 1e-9 && Math.abs(last.point[1] - point[1]) < 1e-9) {
      last.spray = spray
      return
    }
    waypoints.push({ point, spray })
  }
  if (start) pushWp(start, false)
  for (const s of segments) {
    s.points.forEach((p, i) => {
      if (i < s.points.length - 1) pushWp(p, s.kind === "spray")
    })
    pushWp(s.points[s.points.length - 1], false)
  }
  return waypoints
}

/* Переход по открытой местности между любыми точками: обход всех зон с отступом, без привязки к одному полю */
const routeOpen = (a: LngLat, b: LngLat, holes: LngLat[][], margin: number) => {
  const proj = makeProjection([a, b], 0)
  const A = proj.fwd(a)
  const B = proj.fwd(b)
  const hs = holes.filter((h) => h.length >= 3).map((h) => h.map(proj.fwd))
  const xs = [A[0], B[0], ...hs.flat().map((p) => p[0])]
  const ys = [A[1], B[1], ...hs.flat().map((p) => p[1])]
  const pad = 100 + margin * 2
  const x0 = Math.min(...xs) - pad
  const x1 = Math.max(...xs) + pad
  const y0 = Math.min(...ys) - pad
  const y1 = Math.max(...ys) + pad
  const box: P[] = [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ]
  const r = new Router(new FreeSpace(box, hs, margin), margin * 0.98).route(A, B)
  return { ok: r.len !== Infinity, len: r.len === Infinity ? dist(A, B) : r.len, path: r.path.map(proj.inv) }
}

/* ********************************************************** */
/* Полный расчёт траектории */

export const planCoverage = (input: ICoverageInput): ICoverageResult | null => {
  if (input.field.length < 3 || input.spacing <= 0) return null
  const margin = Math.max(0, input.margin)
  const proj = makeProjection(input.field, input.angle)
  const field = input.field.map(proj.fwd)
  const holes = input.holes.filter((h) => h.length >= 3).map((h) => h.map(proj.fwd))
  const space = new FreeSpace(field, holes, margin)
  const clearance = margin * 0.98
  const router = new Router(space, clearance)

  const rows = buildRows(space, field, input.spacing, margin)
  const cells = buildCells(rows)
  const startP: P | null = input.start ? proj.fwd(input.start) : null
  const routeCost = (a: P, b: P) => {
    const r = router.route(a, b)
    return r.len === Infinity ? 1e9 + dist(a, b) : r.len
  }
  const order = orderCells(cells, routeCost, startP)

  const segments: ICoverageSegment[] = []
  const toLL = (ps: P[]) => ps.map(proj.inv)
  let sprayLength = 0
  let turnLength = 0
  let transitLength = 0
  let turns = 0
  let unreachable = 0
  let pos: P | null = input.linkStart === false ? null : startP

  const link = (from: P, to: P, kind: "turn" | "transit") => {
    if (dist(from, to) < 0.01) return
    const r = router.route(from, to)
    if (r.len === Infinity) unreachable++
    const len = r.len === Infinity ? dist(from, to) : r.len
    if (kind === "turn") turnLength += len
    else transitLength += len
    segments.push({ kind, points: toLL(r.path) })
  }

  for (const v of order) {
    const lines = cellPath(cells[v.cell], v)
    lines.forEach((l, i) => {
      const a: P = [l.x0, l.y]
      const b: P = [l.x1, l.y]
      if (pos) {
        link(pos, a, i === 0 ? "transit" : "turn")
        if (i > 0) turns++
      }
      segments.push({ kind: "spray", points: toLL([a, b]) })
      sprayLength += dist(a, b)
      pos = b
    })
  }
  const homeP: P | null = input.home ? proj.fwd(input.home) : startP
  if (input.returnHome && homeP && pos) link(pos, homeP, "transit")

  const waypoints = waypointsOf(input.linkStart === false ? undefined : input.start, segments)

  return {
    segments,
    waypoints,
    area: fieldArea(input.field, input.holes),
    sprayLength,
    turnLength,
    transitLength,
    passes: rows.reduce((s, r) => s + r.ivs.length, 0),
    cells: cells.length,
    turns,
    unreachable,
  }
}

/* ********************************************************** */
/* Несколько полей: каждое покрывается отдельно, поля облетаются по очереди от ближайшего, переходы между ними обходят зоны */

export interface IFieldsInput extends Omit<ICoverageInput, "field" | "home" | "angle"> {
  fields: { contour: LngLat[]; angle: number }[] /* Поля со своим углом проходов */
}

const insideRing = (pt: LngLat, ring: LngLat[]) => {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    if (yi > pt[1] !== yj > pt[1] && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}
const centroid = (ring: LngLat[]): LngLat => [ring.reduce((s, p) => s + p[0], 0) / ring.length, ring.reduce((s, p) => s + p[1], 0) / ring.length]

/* Зоны, центр которых лежит внутри поля */
export const holesOf = (field: LngLat[], holes: LngLat[][]) => holes.filter((h) => h.length >= 3 && insideRing(centroid(h), field))

/* Площадь всех полей без их зон, м² */
export const fieldsArea = (fields: LngLat[][], holes: LngLat[][]) => fields.reduce((s, f) => s + fieldArea(f, holesOf(f, holes)), 0)

export const planFields = (input: IFieldsInput): ICoverageResult | null => {
  const fields = input.fields.filter((f) => f.contour.length >= 3)
  if (!fields.length || input.spacing <= 0) return null
  /* Порядок полей: каждый раз ближайшее к текущему положению по центру */
  const left = fields.map((f) => ({ f, c: centroid(f.contour) }))
  const ordered: { contour: LngLat[]; angle: number }[] = []
  let cur: LngLat = input.start ?? left[0].c
  while (left.length) {
    const kLon = Math.cos((cur[1] * Math.PI) / 180)
    let best = 0
    let bestD = Infinity
    left.forEach((x, i) => {
      const d = Math.hypot((x.c[0] - cur[0]) * kLon, x.c[1] - cur[1])
      if (d < bestD) [best, bestD] = [i, d]
    })
    const [next] = left.splice(best, 1)
    ordered.push(next.f)
    cur = next.c
  }

  const total: ICoverageResult = {
    segments: [],
    waypoints: [],
    area: 0,
    sprayLength: 0,
    turnLength: 0,
    transitLength: 0,
    passes: 0,
    cells: 0,
    turns: 0,
    unreachable: 0,
  }
  const margin = Math.max(0, input.margin)
  /* Переходы к полю, между полями и домой — по открытой местности в обход всех зон */
  const transit = (from: LngLat, to: LngLat) => {
    const t = routeOpen(from, to, input.holes, margin)
    if (!t.ok) total.unreachable++
    total.transitLength += t.len
    total.segments.push({ kind: "transit", points: t.path })
  }
  let pos: LngLat | undefined = input.start
  for (const field of ordered) {
    const r = planCoverage({ ...input, field: field.contour, angle: field.angle, start: pos, linkStart: false, returnHome: false })
    if (!r || !r.segments.length) continue
    const entry = r.segments[0].points[0]
    if (pos) transit(pos, entry)
    total.segments.push(...r.segments)
    total.sprayLength += r.sprayLength
    total.turnLength += r.turnLength
    total.transitLength += r.transitLength
    total.passes += r.passes
    total.cells += r.cells
    total.turns += r.turns
    total.unreachable += r.unreachable
    const lastSeg = r.segments[r.segments.length - 1]
    pos = lastSeg.points[lastSeg.points.length - 1]
  }
  if (input.returnHome && input.start && pos) transit(pos, input.start)
  total.waypoints = waypointsOf(input.start, total.segments)
  total.area = fieldsArea(
    fields.map((f) => f.contour),
    input.holes,
  )
  return total
}

/* Лучший угол для одного поля с учётом его зон, округлён до 0.5° */
export const bestFieldAngle = (contour: LngLat[], holes: LngLat[][], spacing: number, margin: number) =>
  Math.round(optimizeAngle({ field: contour, holes: holesOf(contour, holes), angle: 0, spacing, margin }) * 2) / 2

/* ********************************************************** */
/* Миссия в формате QGC WPL 110 (Mission Planner, QGroundControl): точка дома, скорость, точки маршрута; распыление включается в начале прохода и выключается в конце */

/* none — без команд распыления; sprayer — MAV_CMD_DO_SPRAYER (ArduPilot Sprayer); servo — DO_SET_SERVO на канал насоса */
export type SprayControl = "none" | "sprayer" | "servo"

export interface IMissionExport {
  alt: number /* Высота над точкой взлёта, м */
  speed: number /* м/с */
  spray: SprayControl
  servo?: { channel: number; on: number; off: number } /* Канал и ШИМ насоса для режима servo */
}

export const toWaypointsFile = (res: ICoverageResult, home: LngLat, opt: IMissionExport) => toMission(res, home, opt).text

/* Миссия и номера команд её точек маршрута: по ним прогресс считается из WPNum телеметрии */
export const toMission = (res: ICoverageResult, home: LngLat, opt: IMissionExport) => {
  const lines = ["QGC WPL 110"]
  const nav: { point: LngLat; seq: number; spray?: boolean }[] = []
  let seq = 0
  const row = (current: number, frame: number, cmd: number, p: number[], ll: [number, number], alt: number) =>
    lines.push([seq++, current, frame, cmd, ...p, ll[1].toFixed(8), ll[0].toFixed(8), alt.toFixed(2), 1].join("\t"))
  const sprayRow = (on: boolean) => {
    if (opt.spray === "sprayer") row(0, 3, 216, [on ? 1 : 0, 0, 0, 0], [0, 0], 0)
    if (opt.spray === "servo" && opt.servo) row(0, 3, 183, [opt.servo.channel, on ? opt.servo.on : opt.servo.off, 0, 0], [0, 0], 0)
  }
  row(1, 0, 16, [0, 0, 0, 0], home, 0)
  row(0, 3, 178, [1, opt.speed, -1, 0], [0, 0], 0)
  /* Перед полётом распыление явно выключено, чтобы не лить по дороге к полю */
  sprayRow(false)
  let spraying = false
  let sprayOnLeg = false
  for (const wp of res.waypoints) {
    nav.push({ point: wp.point, seq, spray: sprayOnLeg })
    sprayOnLeg = wp.spray
    row(0, 3, 16, [0, 0, 0, 0], wp.point, opt.alt)
    if (wp.spray !== spraying) {
      spraying = wp.spray
      sprayRow(spraying)
    }
  }
  if (spraying) sprayRow(false)
  return { text: lines.join("\n") + "\n", nav }
}
