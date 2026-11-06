/* Прогресс выполнения миссии по телеметрии: номер текущей команды автопилота (WPNum) и положение аппарата переводятся в долю пройденного пути и пройденную длину с распылением */
import type { LngLat } from "./coverage"
import { distance } from "./route"

/* Точка маршрута миссии: номер её команды в файле и включено ли распыление на пути к ней */
export interface IMissionNav {
  point: LngLat
  seq: number
  spray?: boolean
}

export interface IMissionProgress {
  fraction: number /* 0..1 - доля пути */
  sprayDone: number /* Пройдено с распылением, м */
  sprayTotal: number /* Всего с распылением, м */
  target: number /* Номер точки маршрута (с 1), к которой летит аппарат */
  total: number /* Точек маршрута */
  finished: boolean /* Номер команды за концом миссии - миссия выполнена */
}

/* wpNum - номер команды, которую сейчас выполняет автопилот; если это служебная команда (скорость, распылитель), целью считается следующая точка */
export const missionProgress = (nav: IMissionNav[], wpNum: number | undefined, pos: LngLat | undefined): IMissionProgress | null => {
  if (nav.length < 2 || !wpNum || wpNum < 0) return null
  const cum = [0]
  const cumSpray = [0]
  for (let i = 1; i < nav.length; i++) {
    const d = distance(nav[i - 1].point, nav[i].point)
    cum.push(cum[i - 1] + d)
    cumSpray.push(cumSpray[i - 1] + (nav[i].spray ? d : 0))
  }
  const total = cum[cum.length - 1]
  if (total <= 0) return null
  let k = nav.findIndex((n) => n.seq >= wpNum)
  const sprayTotal = cumSpray[cumSpray.length - 1]
  if (k === -1) return { fraction: 1, sprayDone: sprayTotal, sprayTotal, target: nav.length, total: nav.length, finished: true }
  if (k === 0) return { fraction: 0, sprayDone: 0, sprayTotal, target: 1, total: nav.length, finished: false }
  /* Часть текущего отрезка: проекция положения аппарата на отрезок от прошлой точки к цели */
  const a = nav[k - 1].point
  const b = nav[k].point
  const leg = cum[k] - cum[k - 1]
  let part = 0
  if (pos && leg > 0) {
    const kLon = Math.cos((a[1] * Math.PI) / 180)
    const abx = (b[0] - a[0]) * kLon
    const aby = b[1] - a[1]
    const apx = (pos[0] - a[0]) * kLon
    const apy = pos[1] - a[1]
    const len2 = abx * abx + aby * aby
    part = len2 > 0 ? Math.min(1, Math.max(0, (apx * abx + apy * aby) / len2)) : 0
  }
  const done = cum[k - 1] + part * leg
  const sprayDone = cumSpray[k - 1] + (nav[k].spray ? part * leg : 0)
  return { fraction: done / total, sprayDone, sprayTotal, target: k, total: nav.length, finished: false }
}
