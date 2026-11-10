/* Имитация режима «Объекты» WidgetMap (isTest): шесть аппаратов над одним районом сами выходят на связь и пропадают; грузится динамически только в режиме имитации */
import { createFlightSim, HOME } from "../flightSim"
import type { IWidgetMapData } from "../types"

export { HOME }

const SIM_COUNT = 6
const SIM_ONLINE = 3
export const SIM_GROUPS = Array.from({ length: SIM_COUNT }, (_, i) => `SIM-${i + 1}`)
const SIM_SN = [
  "10.10.001-01_0000804500006B3600004000:F76F",
  "10.10.001-01_0000441B0000F68C0000561C:36B1",
  "20.00.000-01_000068B60000B33B0000A520:5180",
  "00.00.000-00_0000AC670000B22B00007428:DBC5",
  "25.00.000-02_0000A0850000E31300004C5C:8D50",
  "50.00.000-00_0000DCDA00000C1800003194:2BC6",
]
/* Сдвиг маршрута каждого аппарата, м: север, восток - чтобы не летали друг за другом */
const SIM_SHIFT: [number, number][] = [
  [0, 0],
  [-400, 700],
  [700, -900],
  [-800, 600],
  [1100, 900],
  [-600, -1200],
]
const randomSec = (min: number, max: number) => (min + Math.random() * (max - min)) * 1000

/* Кадры аппаратов раз в 0.5 с; на связи всегда три аппарата: пропавшего сменяет тот, кто молчит дольше всех, молчащий маркер успевает покраснеть и скрыться; возвращает остановку */
export const startSimFleet = (onFrame: (value: Record<string, Partial<IWidgetMapData>>) => void): (() => void) => {
  const fleet = SIM_GROUPS.map((group, i) => ({
    group,
    sim: createFlightSim(i % 7),
    online: i < SIM_ONLINE,
    switchAt: i < SIM_ONLINE ? Date.now() + randomSec(20 + i * 25, 40 + i * 25) : 0,
    offlineSince: i,
  }))
  const kmLat = 111320
  const kmLon = 111320 * Math.cos((HOME.lat * Math.PI) / 180)
  const frames: Record<string, Partial<IWidgetMapData>> = {}
  /* Модель летит всегда; пока аппарат без связи, его последний кадр не меняется */
  const tick = (dt: number) => {
    const t = Date.now()
    fleet.forEach((f, i) => {
      const data = f.sim(dt)
      if (f.online && t >= f.switchAt) {
        const next = fleet.filter((x) => !x.online).sort((a, b) => a.offlineSince - b.offlineSince)[0]
        f.online = false
        f.offlineSince = t
        next.online = true
        next.switchAt = t + randomSec(40, 100)
      }
      if (!f.online) return
      frames[f.group] = {
        Lat: data.Lat + SIM_SHIFT[i][0] / kmLat,
        Lon: data.Lon + SIM_SHIFT[i][1] / kmLon,
        Alt: data.Alt + i * 15,
        Heading: data.Heading,
        Sat: data.Sat - (i % 3),
        DevName: f.group,
        DevSN: SIM_SN[i],
      }
    })
    onFrame({ ...frames })
  }
  tick(0)
  const timer = setInterval(() => tick(0.5), 500)
  return () => clearInterval(timer)
}
