/* $lib/WidgetAHRS/ahrs.ts - алгоритмы фильтра ориентации и их параметры (ahrs_gimbal, ProdFactory): какой ключ группы влияет на какой алгоритм, диапазоны и шаг полей. Новый алгоритм прошивки - новая строка AHRS_ALGORITHMS */

export type AHRSParam = "TA" | "TM" | "GN" | "GB" | "AN" | "AG" | "MN" | "KP" | "KI" | "KB" | "KM"

export interface IAHRSAlgorithm {
  /* Значение Mode в прошивке */
  mode: number
  name: string
  /* Параметры, которые читает этот алгоритм, в порядке показа */
  params: AHRSParam[]
  /* Алгоритм отдаёт оценку ошибки углов SR, SP, SY */
  sigma?: boolean
}

export const AHRS_ALGORITHMS: IAHRSAlgorithm[] = [
  { mode: 0, name: "VQF", params: ["TA", "TM"] },
  { mode: 1, name: "ESKF", params: ["GN", "GB", "AN", "AG", "MN"], sigma: true },
  { mode: 2, name: "Mahony", params: ["KP", "KI", "AN", "AG", "KM"] },
  { mode: 3, name: "Madgwick", params: ["KB", "AN", "AG", "KM"] },
]

/* Диапазоны как в прошивке (значение вне них устройство отклоняет) и единица - мелко рядом с подписью поля */
export const AHRS_PARAM_RANGES: Record<AHRSParam, { min: number; max: number; step: number; unit: string }> = {
  TA: { min: 0.1, max: 30, step: 0.1, unit: "s" },
  TM: { min: 0.1, max: 120, step: 0.1, unit: "s" },
  GN: { min: 0.0001, max: 1, step: 0.0001, unit: "°/s/√Hz" },
  GB: { min: 0.00001, max: 1, step: 0.00001, unit: "°/s/√s" },
  AN: { min: 0.001, max: 1, step: 0.001, unit: "g" },
  AG: { min: 0.01, max: 2, step: 0.01, unit: "g" },
  MN: { min: 0.1, max: 180, step: 0.1, unit: "°" },
  KP: { min: 0, max: 10, step: 0.01, unit: "" },
  KI: { min: 0, max: 1, step: 0.0001, unit: "" },
  KB: { min: 0, max: 1, step: 0.001, unit: "" },
  KM: { min: 0, max: 1, step: 0.0001, unit: "" },
}

/* Значение с устройства (float32) с точностью шага поля: 0.004999999888 - 0.005 */
export const roundToStep = (value: number, step: number) => {
  const decimals = Math.max(0, Math.ceil(-Math.log10(step) - 1e-9))
  return Number(value.toFixed(decimals))
}

/* Алгоритм по Mode; неизвестный - undefined (виджет показывает только выбор и углы) */
export const ahrsAlgorithm = (mode: unknown): IAHRSAlgorithm | undefined => AHRS_ALGORITHMS.find((a) => a.mode === Number(mode))
