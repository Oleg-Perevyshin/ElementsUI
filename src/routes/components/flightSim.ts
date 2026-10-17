/* Имитация полёта для демо WidgetPFD/WidgetMap — та же модель, что MavlinkTelemetry_Simulate в прошивке 20.00.000-01:
   облёт маршрута из 7 точек над Минском, развороты креном до 35° с инерцией, западный ветер с порывами, набор/снижение */
import type { IWidgetPFDData } from "$lib/types"

export const HOME = { lat: 53.9006, lon: 27.559 }
const ROUTE: [number, number, number][] = [
  [0, 600, 120],
  [800, 1000, 150],
  [1200, 200, 180],
  [500, -300, 160],
  [900, -800, 140],
  [-300, -700, 130],
  [-400, 200, 120],
]
const STEP = 0.02
const G = 9.81
const BANK_MAX = (35 * Math.PI) / 180
const RAD2DEG = 180 / Math.PI
const remainder = (x: number, y: number) => x - y * Math.round(x / y)

export const createFlightSim = (startWp = 0) => {
  const s = { t: 0, wp: startWp, north: 0, east: 0, alt: 120, psi: Math.PI / 2, phi: 0, v: 18, climb: 0, vn: 0, ve: 0 }

  const step = () => {
    s.t += STEP
    let wp = ROUTE[s.wp]
    if (Math.hypot(wp[0] - s.north, wp[1] - s.east) < 60) {
      s.wp = (s.wp + 1) % ROUTE.length
      wp = ROUTE[s.wp]
    }
    const err = remainder(Math.atan2(wp[1] - s.east, wp[0] - s.north) - s.psi, 2 * Math.PI)
    const phiCmd = Math.max(-BANK_MAX, Math.min(BANK_MAX, 1.2 * err))
    s.phi += (phiCmd - s.phi) * Math.min(1, STEP / 0.8)
    s.v += ((18 + 2 * Math.sin(s.t / 23) - s.v) * STEP) / 3
    s.psi = remainder(s.psi + ((G * Math.tan(s.phi)) / s.v) * STEP, 2 * Math.PI)
    s.climb = Math.max(-3, Math.min(4, (wp[2] - s.alt) * 0.2))
    s.vn = s.v * Math.cos(s.psi)
    s.ve = s.v * Math.sin(s.psi) + 5 + 1.5 * Math.sin(s.t * 0.37)
    s.north += s.vn * STEP
    s.east += s.ve * STEP
    s.alt += s.climb * STEP
  }

  /* Продвигает модель на dtSec и возвращает поля группы MAV */
  return (dtSec: number): IWidgetPFDData => {
    for (let i = Math.min(Math.round(dtSec / STEP), 100); i > 0; i--) step()
    const t = s.t
    const altMsl = s.alt + 220
    return {
      Roll: s.phi * RAD2DEG + 1.5 * Math.sin(t * 1.7) + 0.8 * Math.sin(t * 3.1),
      Pitch: Math.atan2(s.climb, s.v) * RAD2DEG + 2.5 + Math.sin(t * 1.3),
      Heading: (s.psi * RAD2DEG + 360) % 360,
      GSpeed: Math.hypot(s.vn, s.ve),
      ASpeed: s.v,
      Climb: s.climb,
      Alt: s.alt,
      AltMSL: altMsl,
      Lat: HOME.lat + s.north / 111320,
      Lon: HOME.lon + s.east / (111320 * Math.cos((HOME.lat * Math.PI) / 180)),
      Vx: s.vn,
      Vy: s.ve,
      Fix: 3,
      Sat: 15 + Math.trunc(3 * Math.sin(t / 50)),
      BV: 16.6 - (t % 1200) * 0.002,
      BC: 8 + 3 * Math.max(s.climb, 0) + 0.1 * Math.abs(s.phi * RAD2DEG),
      BRem: 100 - Math.trunc((t % 1200) / 15),
      Mode: 10,
      VType: 1,
      Armed: 1,
      HomeLat: HOME.lat,
      HomeLon: HOME.lon,
      Press: 1013.25 * Math.pow(1 - 2.25577e-5 * altMsl, 5.25588),
      Temp: 18 - altMsl * 0.0065,
    }
  }
}
