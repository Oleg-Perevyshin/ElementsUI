/* $lib/WidgetMap/mission/fit.ts - вписывание миссии в карту: кнопка «Показать все» в шапке и автоматически, когда карта появляется (загрузка страницы, разворачивание виджета) */
import type { LngLat } from "./coverage"

/* Вписывает точки в карту с отступом; одна точка - приближение к ней */
export const fitMapTo = (map: any, points: LngLat[], animate = true) => {
  if (!map || !points.length) return
  const duration = animate ? 500 : 0
  if (points.length === 1) return map.easeTo({ center: points[0], zoom: 17, duration })
  const lngs = points.map((p) => p[0])
  const lats = points.map((p) => p[1])
  map.fitBounds(
    [
      [Math.min(...lngs), Math.min(...lats)],
      [Math.max(...lngs), Math.max(...lats)],
    ],
    { padding: 50, maxZoom: 18, duration },
  )
}

/* Сколько после появления карты её размер ещё может меняться: виджет разворачивается с анимацией */
const SETTLE_MS = 600

/* Один раз на каждый новый экземпляр карты: после загрузки без анимации и ещё раз при каждой смене размера, пока виджет разворачивается */
export const createAutoFit = () => {
  let fitted: any = null
  return (map: any, fit: () => void) => {
    if (!map || map === fitted) return
    fitted = map
    const born = performance.now()
    const onResize = () => {
      if (performance.now() - born > SETTLE_MS) return map.off("resize", onResize)
      fit()
    }
    map.on("resize", onResize)
    if (map.loaded()) fit()
    else map.once("load", fit)
  }
}
