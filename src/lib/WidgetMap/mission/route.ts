/* Режим «Маршрут» карты: план из точек со своей высотой и скоростью, длина и время пути, выгрузка миссии в формате QGC WPL 110 */
import type { LngLat } from "./coverage"

export interface IRouteWaypoint {
  point: LngLat
  alt: number /* Высота над точкой взлёта, м */
  speed: number /* Скорость на пути к этой точке, м/с */
}

export interface IRoutePlan {
  start?: LngLat /* Точка взлёта */
  points: IRouteWaypoint[]
  returnHome: boolean /* В конце вернуться и сесть в точке взлёта (RTL) */
}

/* Высота и скорость первой точки; следующие берут значения предыдущей */
export const ROUTE_FIRST_ALT = 30
export const ROUTE_FIRST_SPEED = 8

/* По умолчанию: облёт вокруг демо-поля под Минском с подъёмом, снижением и сменой скорости */
export const DEFAULT_ROUTE_PLAN: IRoutePlan = {
  start: [27.458182, 53.888606],
  points: [
    { point: [27.45885, 53.88935], alt: 30, speed: 6 },
    { point: [27.45985, 53.89005], alt: 40, speed: 8 },
    { point: [27.46115, 53.88975], alt: 50, speed: 10 },
    { point: [27.46225, 53.88865], alt: 50, speed: 10 },
    { point: [27.46175, 53.88775], alt: 35, speed: 8 },
    { point: [27.46005, 53.88785], alt: 25, speed: 6 },
  ],
  returnHome: true,
}

const R = 6371000
/* Расстояние по поверхности между двумя точками, м */
export const distance = (a: LngLat, b: LngLat) => {
  const toRad = Math.PI / 180
  const dLat = (b[1] - a[1]) * toRad
  const dLon = (b[0] - a[0]) * toRad
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * toRad) * Math.cos(b[1] * toRad) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

/* Путь по порядку: взлёт, точки, возврат; у каждого шага длина с учётом смены высоты и скорость, с которой он пройден */
export const routeLegs = (plan: IRoutePlan) => {
  const nodes: { point: LngLat; alt: number; speed: number }[] = []
  const first = plan.points[0]
  const last = plan.points[plan.points.length - 1]
  if (plan.start && first) nodes.push({ point: plan.start, alt: first.alt, speed: first.speed })
  nodes.push(...plan.points)
  if (plan.returnHome && plan.start && last) nodes.push({ point: plan.start, alt: last.alt, speed: last.speed })
  const legs: { length: number; speed: number }[] = []
  for (let i = 1; i < nodes.length; i++)
    legs.push({ length: Math.hypot(distance(nodes[i - 1].point, nodes[i].point), nodes[i].alt - nodes[i - 1].alt), speed: nodes[i].speed })
  return { nodes, legs }
}

export const routeStats = (plan: IRoutePlan) => {
  const { legs } = routeLegs(plan)
  const length = legs.reduce((s, l) => s + l.length, 0)
  const flight = legs.reduce((s, l) => s + (l.speed > 0 ? l.length / l.speed : 0), 0)
  /* Взлёт и посадка со скоростью около 2.5 м/с */
  const first = plan.points[0]
  const last = plan.points[plan.points.length - 1]
  const climb = plan.start && first ? (first.alt + (plan.returnHome ? last.alt : 0)) / 2.5 : 0
  return {
    points: plan.points.length,
    length,
    timeMin: (flight + climb) / 60,
    maxAlt: plan.points.reduce((m, p) => Math.max(m, p.alt), 0),
  }
}

/* Миссия и номера команд её точек: дом, взлёт на высоту первой точки (у точки взлёта), точки маршрута с DO_CHANGE_SPEED перед сменой скорости, при необходимости возврат RTL к точке взлёта */
export const routeMission = (plan: IRoutePlan) => {
  const nav: { point: LngLat; seq: number }[] = []
  const home = plan.start ?? plan.points[0]?.point
  if (!home || !plan.points.length) return { text: "", nav }
  const lines = ["QGC WPL 110"]
  let seq = 0
  const row = (current: number, frame: number, cmd: number, p: number[], ll: [number, number], alt: number) =>
    lines.push([seq++, current, frame, cmd, ...p, ll[1].toFixed(8), ll[0].toFixed(8), alt.toFixed(2), 1].join("\t"))
  row(1, 0, 16, [0, 0, 0, 0], home, 0)
  nav.push({ point: home, seq })
  row(0, 3, 22, [0, 0, 0, 0], [0, 0], plan.points[0].alt)
  let speed = NaN
  for (const wp of plan.points) {
    if (wp.speed !== speed) {
      speed = wp.speed
      row(0, 3, 178, [1, speed, -1, 0], [0, 0], 0)
    }
    nav.push({ point: wp.point, seq })
    row(0, 3, 16, [0, 0, 0, 0], wp.point, wp.alt)
  }
  if (plan.returnHome) {
    nav.push({ point: home, seq })
    row(0, 3, 20, [0, 0, 0, 0], [0, 0], 0)
  }
  return { text: lines.join("\n") + "\n", nav }
}
