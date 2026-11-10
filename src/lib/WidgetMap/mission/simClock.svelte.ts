/* $lib/WidgetMap/mission/simClock.svelte.ts - часы имитации полёта: живут в режиме карты, а не в слое на карте, поэтому полёт и прогресс в шапке идут и при свёрнутой карте */
import type { LngLat } from "./coverage"

/* Вершина пути: speed и spray относятся к отрезку, который в неё приходит */
export interface ISimVertex {
  point: LngLat
  alt: number
  speed: number
  spray?: boolean
}

const R = 6371000
const toRad = Math.PI / 180
const legLen = (a: LngLat, b: LngLat) => {
  const dLat = (b[1] - a[1]) * toRad
  const dLon = (b[0] - a[0]) * toRad
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * toRad) * Math.cos(b[1] * toRad) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export const SIM_RATES = [1, 5, 10, 25]

export class SimClock {
  path = $state.raw<ISimVertex[]>([])
  /* Время прибытия в каждую вершину, с */
  times = $state.raw<number[]>([0])
  t = $state(0)
  playing = $state(false)
  rate = $state(5)
  duration = $derived(this.times[this.times.length - 1] ?? 0)
  progress = $derived(this.duration > 0 ? this.t / this.duration : 0)

  #raf = 0
  #last = 0

  /* Новый путь - полёт заново и на паузе */
  setPath(path: ISimVertex[]) {
    const times = [0]
    for (let i = 1; i < path.length; i++) {
      const len = Math.hypot(legLen(path[i - 1].point, path[i].point), path[i].alt - path[i - 1].alt)
      times.push(times[i - 1] + len / Math.max(0.1, path[i].speed))
    }
    this.path = path
    this.times = times
    this.t = 0
    this.pause()
  }

  /* Запуск после конца пути начинает полёт заново */
  toggle() {
    if (this.playing) return this.pause()
    if (this.t >= this.duration) this.t = 0
    this.playing = true
    this.#last = 0
    if (typeof requestAnimationFrame !== "undefined" && !this.#raf) this.#raf = requestAnimationFrame(this.#tick)
  }

  pause() {
    this.playing = false
    if (this.#raf) cancelAnimationFrame(this.#raf)
    this.#raf = 0
  }

  /* Прокрутка пути ставит полёт на паузу */
  seek(t: number) {
    this.pause()
    this.t = Math.min(Math.max(0, t), this.duration)
  }

  destroy() {
    this.pause()
  }

  #tick = (now: number) => {
    this.#raf = 0
    if (!this.playing || this.duration <= 0) return
    if (this.#last) this.t += ((now - this.#last) / 1000) * this.rate
    this.#last = now
    if (this.t >= this.duration) {
      this.t = this.duration
      this.playing = false
      return
    }
    this.#raf = requestAnimationFrame(this.#tick)
  }
}
