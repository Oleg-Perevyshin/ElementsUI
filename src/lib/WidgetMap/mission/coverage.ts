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
  linkStart?: boolean /* false - start задаёт только порядок обхода, переход от него строит вызывающий (облёт нескольких полей) */
}

export type SegmentKind = "spray" | "turn" | "transit"

export interface ICoverageSegment {
  kind: SegmentKind
  points: LngLat[]
}

export interface ICoverageResult {
  segments: ICoverageSegment[] /* Траектория по порядку: проходы с распылением, развороты, переходы */
  waypoints: { point: LngLat; spray: boolean }[] /* Точки миссии; spray - распыление включено до следующей точки */
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

/* Те же проверки на числах, без временных массивов: их вызывают сотни тысяч раз за расчёт */
const segPointDistXY = (px: number, py: number, ax: number, ay: number, bx: number, by: number) => {
  const dx = bx - ax
  const dy = by - ay
  const len2 = dx * dx + dy * dy
  const t = len2 < EPS ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2))
  return Math.hypot(px - ax - dx * t, py - ay - dy * t)
}

const segSegDistXY = (ax: number, ay: number, bx: number, by: number, cx: number, cy: number, dx: number, dy: number) => {
  const d1 = (dx - cx) * (ay - cy) - (dy - cy) * (ax - cx)
  const d2 = (dx - cx) * (by - cy) - (dy - cy) * (bx - cx)
  const d3 = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax)
  const d4 = (bx - ax) * (dy - ay) - (by - ay) * (dx - ax)
  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) return 0
  return Math.min(
    segPointDistXY(ax, ay, cx, cy, dx, dy),
    segPointDistXY(bx, by, cx, cy, dx, dy),
    segPointDistXY(cx, cy, ax, ay, bx, by),
    segPointDistXY(dx, dy, ax, ay, bx, by),
  )
}

const pointInRingXY = (x: number, y: number, r: P[]) => {
  let inside = false
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    const xi = r[i][0]
    const yi = r[i][1]
    const xj = r[j][0]
    const yj = r[j][1]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

/* Стороны контуров с рамками: по 8 чисел на сторону (концы и границы рамки) */
const packEdges = (rings: P[][]) => {
  const out: number[] = []
  for (const ring of rings)
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [ax, ay] = ring[j]
      const [bx, by] = ring[i]
      out.push(ax, ay, bx, by, Math.min(ax, bx), Math.min(ay, by), Math.max(ax, bx), Math.max(ay, by))
    }
  return Float64Array.from(out)
}

/* Отрезок не ближе clearance ни к одной стороне; стороны, чья рамка дальше clearance от рамки отрезка, не проверяются */
const edgesClear = (edges: Float64Array, ax: number, ay: number, bx: number, by: number, clearance: number) => {
  const minx = Math.min(ax, bx) - clearance
  const maxx = Math.max(ax, bx) + clearance
  const miny = Math.min(ay, by) - clearance
  const maxy = Math.max(ay, by) + clearance
  for (let k = 0; k < edges.length; k += 8) {
    if (edges[k + 4] > maxx || edges[k + 6] < minx || edges[k + 5] > maxy || edges[k + 7] < miny) continue
    if (segSegDistXY(ax, ay, bx, by, edges[k], edges[k + 1], edges[k + 2], edges[k + 3]) < clearance) return false
  }
  return true
}

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
  private allEdges: Float64Array
  private holeEdges: Float64Array

  constructor(
    private field: P[],
    private holes: P[][],
    private margin: number,
  ) {
    this.allEdges = packEdges([field, ...holes])
    this.holeEdges = packEdges(holes)
  }

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
    const mx = (a[0] + b[0]) / 2
    const my = (a[1] + b[1]) / 2
    if (!pointInRingXY(mx, my, this.field)) return false
    for (const h of this.holes) if (pointInRingXY(mx, my, h)) return false
    return edgesClear(this.allEdges, a[0], a[1], b[0], b[1], clearance)
  }

  /* Для точки взлёта вне поля: граница поля не мешает, только запретные зоны с отступом */
  segmentClearOfHoles(a: P, b: P, clearance: number) {
    const mx = (a[0] + b[0]) / 2
    const my = (a[1] + b[1]) / 2
    for (const h of this.holes) if (pointInRingXY(mx, my, h)) return false
    return edgesClear(this.holeEdges, a[0], a[1], b[0], b[1], clearance)
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
        /* Нормали внутрь кольца для CCW - влево от ребра */
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
/* Кратчайшие пути в обход препятствий: граф видимости, кратчайшие пути между его узлами считаются один раз (Флойд-Уоршелл) */

class Router {
  private nodes: P[]
  /* Длины кратчайших путей между узлами и следующий узел на пути, матрицы n x n */
  private far: Float64Array
  private next: Int32Array
  private cache = new Map<string, { len: number; path: P[] }>()

  constructor(
    private space: FreeSpace,
    private clearance: number,
  ) {
    this.nodes = space.graphNodes()
    const n = this.nodes.length
    const far = new Float64Array(n * n).fill(Infinity)
    const next = new Int32Array(n * n).fill(-1)
    for (let i = 0; i < n; i++) {
      far[i * n + i] = 0
      next[i * n + i] = i
      for (let j = i + 1; j < n; j++) {
        if (!space.segmentClear(this.nodes[i], this.nodes[j], clearance)) continue
        const d = dist(this.nodes[i], this.nodes[j])
        far[i * n + j] = far[j * n + i] = d
        next[i * n + j] = j
        next[j * n + i] = i
      }
    }
    for (let k = 0; k < n; k++)
      for (let i = 0; i < n; i++) {
        const ik = far[i * n + k]
        if (ik === Infinity) continue
        for (let j = 0; j < n; j++) {
          const c = ik + far[k * n + j]
          if (c < far[i * n + j]) {
            far[i * n + j] = c
            next[i * n + j] = next[i * n + k]
          }
        }
      }
    this.far = far
    this.next = next
  }

  /* Видимость точки из узлов графа: одна и та же точка входа или выхода ячейки участвует во многих маршрутах */
  private visCache = new Map<string, Float64Array>()
  private visibility(p: P, loose: boolean) {
    const key = `${p[0]},${p[1]},${loose}`
    let vis = this.visCache.get(key)
    if (!vis) {
      vis = new Float64Array(this.nodes.length)
      for (let i = 0; i < this.nodes.length; i++) {
        const q = this.nodes[i]
        const ok = loose ? this.space.segmentClearOfHoles(p, q, this.clearance) : this.space.segmentClear(p, q, this.clearance)
        vis[i] = ok ? dist(p, q) : Infinity
      }
      this.visCache.set(key, vis)
    }
    return vis
  }

  route(a: P, b: P): { len: number; path: P[] } {
    const key = `${a[0]},${a[1]}>${b[0]},${b[1]}`
    const hit = this.cache.get(key)
    if (hit) return hit
    /* Конец вне поля (точка взлёта): его отрезки проверяются только на зоны */
    const outA = !this.space.inField(a)
    const outB = !this.space.inField(b)
    const loose = outA || outB
    if (loose ? this.space.segmentClearOfHoles(a, b, this.clearance) : this.space.segmentClear(a, b, this.clearance)) {
      const direct = { len: dist(a, b), path: [a, b] }
      this.cache.set(key, direct)
      return direct
    }
    const n = this.nodes.length
    const visA = this.visibility(a, outA)
    const visB = this.visibility(b, outB)
    /* Лучший путь: от a к видимому узлу i, по графу к узлу j, от j к b */
    let len = Infinity
    let bi = -1
    let bj = -1
    for (let i = 0; i < n; i++) {
      const ai = visA[i]
      if (ai === Infinity) continue
      for (let j = 0; j < n; j++) {
        const jb = visB[j]
        if (jb === Infinity) continue
        const c = ai + this.far[i * n + j] + jb
        if (c < len) {
          len = c
          bi = i
          bj = j
        }
      }
    }
    let res: { len: number; path: P[] }
    if (len === Infinity) res = { len: Infinity, path: [a, b] }
    else {
      const path: P[] = [a]
      for (let v = bi; ; v = this.next[v * n + bj]) {
        path.push(this.nodes[v])
        if (v === bj) break
      }
      path.push(b)
      res = { len, path }
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
    /* Стоимости всех переходов «выход варианта k ячейки i - вход варианта l ячейки j» заранее, числами: перебор обращается к ним сотни тысяч раз */
    const m = n * 4
    const trans = new Float64Array(m * m)
    for (let i = 0; i < n; i++)
      for (let k = 0; k < 4; k++)
        for (let j = 0; j < n; j++) {
          if (j === i) continue
          for (let l = 0; l < 4; l++) trans[(i * 4 + k) * m + j * 4 + l] = cost(exits[i][k], entries[j][l])
        }
    const tc = (i: number, k: number, j: number, l: number) => trans[(i * 4 + k) * m + j * 4 + l]
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

/* Площадь поля без зон, м²: сумма свободных отрезков по полосам 0.2 м, поэтому зона за краем поля и наложенные зоны считаются верно */
export const fieldArea = (field: LngLat[], holes: LngLat[][]) => {
  if (field.length < 3) return 0
  const { fwd } = makeProjection(field, 0)
  const ring = field.map(fwd)
  const rings = holes.filter((h) => h.length >= 3).map((h) => h.map(fwd))
  const ys = ring.map((p) => p[1])
  const lo = Math.min(...ys)
  const span = Math.max(...ys) - lo
  if (span <= 0) return 0
  const n = Math.min(5000, Math.max(200, Math.ceil(span / 0.2)))
  const h = span / n
  let area = 0
  for (let k = 0; k < n; k++) {
    const y = lo + (k + 0.5) * h
    const free = subtractSets(ringIntervals(ring, y), unionSets(rings.map((r) => ringIntervals(r, y))))
    area += free.reduce((s, [a, b]) => s + (b - a), 0) * h
  }
  return area
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
  /* Разворот обходится как ~3 шага захвата пути, переход между ячейками - как 10 */
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

/* Зоны, которые задевают поле: вершина одного контура внутри другого или пересечение сторон; зона может выступать за край поля */
const ringsTouch = (a: LngLat[], b: LngLat[]) => {
  if (a.some((p) => insideRing(p, b)) || b.some((p) => insideRing(p, a))) return true
  for (let i = 0; i < a.length; i++) {
    const a1 = a[i] as P
    const a2 = a[(i + 1) % a.length] as P
    for (let j = 0; j < b.length; j++) if (segmentsCross(a1, a2, b[j] as P, b[(j + 1) % b.length] as P)) return true
  }
  return false
}
export const holesOf = (field: LngLat[], holes: LngLat[][]) => holes.filter((h) => h.length >= 3 && ringsTouch(h, field))

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
  /* Переходы к полю, между полями и домой - по открытой местности в обход всех зон */
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

/* Подбор угла поля приближениями по полному расчёту траектории: шаг 5° по всем 180° и направления сторон поля, затем шаг 1° около трёх лучших, затем 0.1° около победителя. Мерило - время облёта: путь со скоростью плюс около 4 с на разворот, недопокрытая площадь штрафуется. Считается частями, чтобы интерфейс не замирал */
export const searchFieldAngle = async (
  contour: LngLat[],
  holes: LngLat[][],
  spacing: number,
  margin: number,
  speed: number,
  onProgress?: (fraction: number) => void,
) => {
  const own = holesOf(contour, holes)
  const area = fieldArea(contour, own)
  const norm = (a: number) => Math.round((((a % 180) + 180) % 180) * 10) / 10
  const cache = new Map<number, number>()
  const cost = (a: number) => {
    const key = norm(a)
    const hit = cache.get(key)
    if (hit !== undefined) return hit
    const r = planCoverage({ field: contour, holes: own, angle: key, spacing, margin })
    /* Недопокрытая площадь штрафуется: недолитый метр прохода стоит как трёхкратный полёт по нему - за ним пришлось бы возвращаться */
    const missed = r ? Math.max(0, area / spacing - r.sprayLength) : 0
    const c = r ? (r.sprayLength + r.turnLength + r.transitLength + missed * 3) / Math.max(0.1, speed) + r.turns * 4 + r.unreachable * 1e6 : Infinity
    cache.set(key, c)
    return c
  }
  /* Страница получает управление, когда расчёты заняли больше 12 мс: так она успевает отрисоваться, а лишних пауз между быстрыми расчётами нет */
  let lastYield = performance.now()
  const yieldUi = async () => {
    if (performance.now() - lastYield < 12) return
    await new Promise((r) => setTimeout(r, 0))
    lastYield = performance.now()
  }
  /* Направления сторон поля: вдоль длинной стороны проходы часто ложатся лучше всего */
  const kLon = Math.cos(((contour[0]?.[1] ?? 0) * Math.PI) / 180)
  const edges = contour.map((p, i) => {
    const q = contour[(i + 1) % contour.length]
    return norm((Math.atan2((q[0] - p[0]) * kLon, q[1] - p[1]) * 180) / Math.PI)
  })
  const coarse = [...new Set([...Array.from({ length: 36 }, (_, i) => i * 5), ...edges])]
  const stages = coarse.length + 3 * 9 + 11
  let done = 0
  const run = async (angles: number[]) => {
    for (const a of angles) {
      cost(a)
      done++
      onProgress?.(Math.min(1, done / stages))
      await yieldUi()
    }
  }
  await run(coarse)
  /* Три лучших диапазона, не ближе 5° друг к другу */
  const ranked = [...coarse].sort((a, b) => cost(a) - cost(b))
  const seeds: number[] = []
  for (const a of ranked) {
    if (seeds.every((b) => Math.min(Math.abs(a - b), 180 - Math.abs(a - b)) >= 5)) seeds.push(a)
    if (seeds.length === 3) break
  }
  await run(seeds.flatMap((sd) => Array.from({ length: 9 }, (_, i) => norm(sd - 4 + i))))
  let best = [...cache.entries()].reduce((m, e) => (e[1] < m[1] ? e : m))[0]
  await run(Array.from({ length: 11 }, (_, i) => norm(best - 0.5 + i * 0.1)))
  best = [...cache.entries()].reduce((m, e) => (e[1] < m[1] ? e : m))[0]
  onProgress?.(1)
  return best
}

/* ********************************************************** */
/* Миссия в формате QGC WPL 110 (Mission Planner, QGroundControl): точка дома, скорость, точки маршрута; распыление включается в начале прохода и выключается в конце */

/* none - без команд распыления; sprayer - MAV_CMD_DO_SPRAYER (ArduPilot Sprayer); servo - DO_SET_SERVO на канал насоса */
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
