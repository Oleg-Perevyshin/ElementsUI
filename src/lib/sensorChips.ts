/* $lib/sensorChips.ts - справочник микросхем датчиков для WidgetIMU, WidgetMag и WidgetEncoder: битовые поля слова Cfg драйвера ровно как в прошивке (ProdFactory, components/drivers/<чип>/<чип>.h), заводское слово и ограничения даташита. Биты 0-1 (режим: стоп, измерение, калибровка, по запросу) - общие у всех, их ведёт блок калибровки. Новая микросхема - новая запись SENSOR_CHIPS, виджет не меняется */

/* Значение другого поля той же части Cfg: сначала свой раздел, потом остальные */
export type SensorChipRead = (key: string) => number | undefined

/* Поле Cfg: start..end - биты включительно; select - варианты кодами (available - допустим ли вариант при значениях других полей, недопустимые не показываются, а выбранный недопустимый заменяется ближайшим; format - подпись варианта по другим полям вместо name, @имя - перевод sensor.opt.<имя>; wide - широкий список; buttons - кнопками в строку; locked - показывается, но не выбирается (значение определяет другое поле); gate - режим узла: значение 0 (выключен) скрывает остальные поля раздела, в сводке - «выкл.»; unit - в сводке числом с единицей sensor.unit.<key>; noSummary - не в сводке); switch - один бит (short - подпись кнопки, когда раздел из одних переключателей); visible - показывать ли поле; brief - в сводке шапки (есть хоть одно brief - в сводке только они, иначе все) */
export type SensorChipField =
  | {
      key: string
      start: number
      end: number
      type: "select"
      options: { value: number; name: string }[]
      brief?: boolean
      wide?: boolean
      visible?: (read: SensorChipRead) => boolean
      available?: (value: number, read: SensorChipRead) => boolean
      format?: (value: number, read: SensorChipRead) => string
      unit?: boolean
      noSummary?: boolean
      buttons?: boolean
      locked?: (read: SensorChipRead) => boolean
      gate?: boolean
    }
  | { key: string; start: number; end: number; type: "switch"; short?: string; visible?: (read: SensorChipRead) => boolean }

/* Группа полей в блоке настроек: name - ключ перевода sensor.section.<name> (в сводке sensor.short.<name>); common - без заголовка; раздел из одних переключателей - одна группа кнопок с множественным выбором */
export interface SensorChipSection {
  name: string
  fields: SensorChipField[]
}

/* Часть микросхемы одного класса: поля и заводское слово Cfg (CB_ResetConfig драйвера) */
/* busyModes - режимы (биты 0-1 Cfg), в которых драйвер занят калибровкой: настройки недоступны */
export interface SensorChipPart {
  sections: SensorChipSection[]
  factory: number
  busyModes: number[]
}

/* Класс датчика: виджет берёт свою часть микросхемы */
export type SensorKind = "imu" | "mag" | "enc"

/* Микросхема: у 9-осевого IMU есть обе части imu и mag, у энкодера - enc */
export interface SensorChip {
  id: string
  name: string
  imu?: SensorChipPart
  mag?: SensorChipPart
  enc?: SensorChipPart
}

/* Режим работы (биты 0-1 Cfg, общие у всех драйверов): выбираются только run, режимы калибровки busy видны, пока драйвер в них */
const runField = (run: [number, string][], busy: [number, string][]): SensorChipField => ({
  key: "run",
  start: 0,
  end: 1,
  type: "select",
  wide: true,
  noSummary: true,
  options: [...run, ...busy].map(([value, name]) => ({ value, name: `@${name}` })),
  available: (value, read) => run.some(([v]) => v === value) || read("run") === value,
})

/* Варианты числами с единицей: подписи одинаковые на всех языках */
const opts = (pairs: [number, string][]) => pairs.map(([value, name]) => ({ value, name }))
/* Варианты словами: имя - ключ перевода sensor.opt.<имя> */
const words = (pairs: [number, string][]) => pairs.map(([value, name]) => ({ value, name: `@${name}` }))
/* Частота в Гц подписью: от 1 кГц - в кГц */
const hz = (value: number) => (value >= 1000 ? `${Number((value / 1000).toFixed(2))} kHz` : `${Number(value.toFixed(4))} Hz`)

/* MT6835: период опроса по коду rate, мс (100, 250, 500, 1000 Гц) */
const MT6835_PERIOD_MS = [10, 4, 2, 1]
/* Сглаживание скорости EMA vel = (raw + k*vel) / (k+1): подпись - постоянная времени при текущей частоте опроса */
const mt6835VelFilter = (k: number, read: SensorChipRead) => {
  if (k === 0) return "@none"
  const period = MT6835_PERIOD_MS[read("poll") ?? 3] ?? 1
  return `${Number((-period / Math.log(k / (k + 1))).toFixed(1))} ms`
}

/* ICM42688: ODR по коду регистра ACCEL_ODR/GYRO_ODR, Гц; варианты от быстрых к медленным */
const ICM42688_ODR_HZ: Record<number, number> = {
  1: 32000,
  2: 16000,
  3: 8000,
  4: 4000,
  5: 2000,
  6: 1000,
  15: 500,
  7: 200,
  8: 100,
  9: 50,
  10: 25,
  11: 12.5,
  12: 6.25,
  13: 3.125,
  14: 1.5625,
}
const ICM42688_ODR_CODES = [1, 2, 3, 4, 5, 6, 15, 7, 8, 9, 10, 11, 12, 13, 14]
const icm42688Odr = (codes: number[]) => opts(codes.map((code) => [code, hz(ICM42688_ODR_HZ[code])]))
/* Режим узла - биты включения и экономичного режима вместе: 0 выключен, 1 малошумный, 3 экономичный (только акселерометр) */
const icm42688Lp = (read: SensorChipRead) => read("mode") === 3
/* ODR акселерометра: LN - 32 кГц ... 12.5 Гц и 500 Гц, LP - 500 ... 1.5625 Гц */
const icm42688AccelOdr = (code: number, read: SensorChipRead) => (icm42688Lp(read) ? code >= 7 : code <= 11 || code === 15)
/* Полоса UI-фильтра по уровню -3 дБ, Гц, из таблиц даташита (DS-000347 rev 1.6, раздел 5.5): [порядок 1, 2, 3][строка ODR][код 0-7]. */
/* Строки: ODR 1 кГц, 500 Гц и 200 Гц и ниже (коды 1-7 от max(400 Гц, ODR) - одинаковы до 200 Гц); код 0 ниже 200 Гц - ICM42688_LPF_C0 */
const ICM42688_LPF_3DB = [
  [
    [498.3, 227.2, 188.9, 111.0, 92.4, 59.6, 48.8, 23.9],
    [249.1, 113.6, 94.4, 55.5, 46.2, 29.8, 24.4, 11.9],
    [99.6, 90.9, 75.5, 44.4, 37.0, 23.8, 19.5, 9.6],
  ],
  [
    [493.3, 230.7, 191.6, 117.5, 97.1, 59.6, 48.0, 21.3],
    [246.7, 115.3, 95.8, 58.8, 48.5, 29.8, 24.0, 10.6],
    [98.7, 92.3, 76.6, 47.0, 38.8, 23.8, 19.2, 8.5],
  ],
  [
    [492.9, 234.7, 195.8, 118.9, 97.9, 60.8, 46.8, 25.2],
    [246.4, 117.4, 97.9, 59.5, 48.9, 30.4, 23.4, 12.6],
    [98.6, 93.9, 78.3, 47.6, 39.2, 24.3, 18.7, 10.1],
  ],
]
/* Код 0 при ODR 100, 50, 25 и 12.5 Гц по порядкам */
const ICM42688_LPF_C0: Record<number, number[]> = { 100: [49.8, 49.3, 49.3], 50: [24.9, 24.7, 24.6], 25: [12.5, 12.3, 12.3], 12.5: [12.5, 12.3, 12.3] }
/* С 2 кГц полоса по даташиту фиксирована и от кода и порядка не зависит: фильтр показывает её недоступным полем, порядок скрыт */
const ICM42688_LPF_FIXED_ODR = 2000
const ICM42688_LPF_FIXED: Record<number, number> = { 32000: 8400, 16000: 4194.1, 8000: 2096.3, 4000: 1048.1, 2000: 524 }
/* Полоса -3 дБ для кода, ODR до 1 кГц и порядка (код порядка 0-2) */
const icm42688Bw = (code: number, odr: number, order: number) => {
  const table = ICM42688_LPF_3DB[Math.min(2, Math.max(0, order))]
  if (code === 0 && odr < 200) return ICM42688_LPF_C0[odr]?.[Math.min(2, Math.max(0, order))] ?? odr / 2
  return (odr >= 1000 ? table[0] : odr >= 500 ? table[1] : table[2])[code]
}
/* Режим узла даёт данные с UI-фильтром: LN и ODR до 1 кГц (LP акселерометра - усреднение) */
/* Фильтр не выбирается: LN и ODR от 2 кГц - полоса фиксирована */
const icm42688LpfLocked = (accel: boolean) => (read: SensorChipRead) =>
  !(accel && icm42688Lp(read)) && (ICM42688_ODR_HZ[read("odr") ?? -1] ?? 0) >= ICM42688_LPF_FIXED_ODR
const icm42688OrderShown = (accel: boolean) => (read: SensorChipRead) =>
  !(accel && icm42688Lp(read)) && (ICM42688_ODR_HZ[read("odr") ?? -1] ?? 0) < ICM42688_LPF_FIXED_ODR
/* Фильтр: LN - полоса не выше ODR/2 (выше Найквиста смысла нет), код 0 (ODR/2) есть всегда; LP акселерометра - только усреднение 1 или 16 */
const icm42688LpfAvailable = (accel: boolean) => (code: number, read: SensorChipRead) => {
  if (accel && icm42688Lp(read)) return code === 1 || code === 6
  const odr = ICM42688_ODR_HZ[read("odr") ?? -1]
  if (!odr || odr >= ICM42688_LPF_FIXED_ODR || code === 0) return true
  return icm42688Bw(code, odr, read("lpfOrder") ?? 2) <= odr / 2 + 1e-9
}
/* Подпись фильтра: LN - полоса -3 дБ по даташиту для ODR и порядка своего узла, LP акселерометра - усреднение */
const icm42688LpfName = (accel: boolean) => (code: number, read: SensorChipRead) => {
  if (accel && icm42688Lp(read)) return code === 6 ? "@avg16" : "@avg1"
  const odr = ICM42688_ODR_HZ[read("odr") ?? -1]
  if (!odr) return `#${code}`
  return hz(odr >= ICM42688_LPF_FIXED_ODR ? ICM42688_LPF_FIXED[odr] : icm42688Bw(code, odr, read("lpfOrder") ?? 2))
}
const ICM42688_LPF = opts([0, 1, 2, 3, 4, 5, 6, 7].map((code) => [code, `#${code}`]))
const LPF_ORDER = opts([
  [0, "1"],
  [1, "2"],
  [2, "3"],
])

export const SENSOR_CHIPS: SensorChip[] = [
  {
    id: "ICM42688",
    name: "ICM-42688-P",
    imu: {
      factory: 291605261,
      busyModes: [2, 3],
      sections: [
        {
          name: "common",
          fields: [
            runField(
              [
                [0, "stop"],
                [1, "measure"],
              ],
              [
                [2, "calibrate"],
                [3, "pose"],
              ],
            ),
            { key: "temp", start: 2, end: 2, type: "switch" },
          ],
        },
        {
          name: "accel",
          fields: [
            {
              key: "mode",
              gate: true,
              wide: true,
              start: 3,
              end: 4,
              type: "select",
              options: words([
                [0, "off"],
                [1, "lowNoise"],
                [3, "lowPower"],
              ]),
              available: (value) => value !== 2,
            },
            {
              key: "range",
              brief: true,
              start: 5,
              end: 6,
              type: "select",
              options: opts([
                [3, "±2 g"],
                [2, "±4 g"],
                [1, "±8 g"],
                [0, "±16 g"],
              ]),
            },
            { key: "odr", brief: true, start: 7, end: 10, type: "select", options: icm42688Odr(ICM42688_ODR_CODES), available: icm42688AccelOdr },
            {
              key: "lpf",
              start: 11,
              end: 13,
              type: "select",
              options: ICM42688_LPF,
              locked: icm42688LpfLocked(true),
              available: icm42688LpfAvailable(true),
              format: icm42688LpfName(true),
            },
            { key: "lpfOrder", start: 14, end: 15, type: "select", options: LPF_ORDER, visible: icm42688OrderShown(true) },
          ],
        },
        {
          name: "gyro",
          fields: [
            {
              key: "mode",
              gate: true,
              wide: true,
              start: 16,
              end: 16,
              type: "select",
              options: words([
                [0, "off"],
                [1, "lowNoise"],
              ]),
            },
            {
              key: "range",
              brief: true,
              start: 17,
              end: 19,
              type: "select",
              options: opts([
                [7, "±15.6°/s"],
                [6, "±31.3°/s"],
                [5, "±62.5°/s"],
                [4, "±125°/s"],
                [3, "±250°/s"],
                [2, "±500°/s"],
                [1, "±1000°/s"],
                [0, "±2000°/s"],
              ]),
            },
            {
              key: "odr",
              brief: true,
              start: 20,
              end: 23,
              type: "select",
              options: icm42688Odr(ICM42688_ODR_CODES.filter((code) => code < 12 || code === 15)),
            },
            {
              key: "lpf",
              start: 24,
              end: 26,
              type: "select",
              options: ICM42688_LPF,
              locked: icm42688LpfLocked(false),
              available: icm42688LpfAvailable(false),
              format: icm42688LpfName(false),
            },
            { key: "lpfOrder", start: 27, end: 28, type: "select", options: LPF_ORDER, visible: icm42688OrderShown(false) },
          ],
        },
      ],
    },
  },
  {
    id: "RM3100",
    name: "RM3100",
    mag: {
      factory: 238997,
      busyModes: [2],
      sections: [
        {
          name: "common",
          fields: [
            runField(
              [
                [0, "stop"],
                [1, "measure"],
                [3, "onDemand"],
              ],
              [[2, "calibrate"]],
            ),
          ],
        },
        {
          name: "axes",
          fields: [
            { key: "axisX", start: 15, end: 15, type: "switch", short: "X" },
            { key: "axisY", start: 16, end: 16, type: "switch", short: "Y" },
            { key: "axisZ", start: 17, end: 17, type: "switch", short: "Z" },
          ],
        },
        {
          name: "common",
          fields: [
            {
              /* Частота 1.2-37 Гц: при любых циклах (до 400) и осях замер успевает за период */
              key: "rate",
              start: 2,
              end: 5,
              type: "select",
              options: opts([
                [4, "37 Hz"],
                [5, "18 Hz"],
                [6, "9 Hz"],
                [7, "4.5 Hz"],
                [8, "2.3 Hz"],
                [9, "1.2 Hz"],
              ]),
            },
            {
              key: "cycles",
              start: 6,
              end: 14,
              type: "select",
              unit: true,
              buttons: true,
              options: words([
                [50, "cycles50"],
                [150, "cycles150"],
                [300, "cycles300"],
              ]),
            },
          ],
        },
      ],
    },
  },
  {
    id: "MT6835",
    name: "MT6835",
    enc: {
      /* Измерять 1 кГц, полоса базовая, против часовой, гистерезис 0.022°, без сглаживания, ноль 0 (CB_ResetConfig драйвера) */
      factory: 13,
      busyModes: [2, 3],
      sections: [
        {
          name: "common",
          fields: [
            runField(
              [
                [0, "stop"],
                [1, "measure"],
              ],
              [
                [2, "calibrate"],
                [3, "zero"],
              ],
            ),
            {
              key: "direction",
              start: 7,
              end: 7,
              type: "select",
              buttons: true,
              brief: true,
              options: words([
                [0, "ccw"],
                [1, "cw"],
              ]),
            },
          ],
        },
        {
          name: "common",
          fields: [
            {
              key: "poll",
              start: 2,
              end: 3,
              type: "select",
              brief: true,
              options: opts([
                [3, "1 kHz"],
                [2, "500 Hz"],
                [1, "250 Hz"],
                [0, "100 Hz"],
              ]),
            },
            {
              /* BW[2:0] (0x011): базовая полоса - меньше шум, ×128 - быстрее отклик */
              key: "bandwidth",
              start: 4,
              end: 6,
              type: "select",
              options: opts([
                [0, "×1"],
                [1, "×2"],
                [2, "×4"],
                [3, "×8"],
                [4, "×16"],
                [5, "×32"],
                [6, "×64"],
                [7, "×128"],
              ]),
            },
            {
              /* HYST[2:0] (0x00D): варианты по возрастанию окна, коды не по порядку */
              key: "hyst",
              start: 8,
              end: 10,
              type: "select",
              options: opts([
                [4, "0°"],
                [5, "0.003°"],
                [6, "0.006°"],
                [7, "0.011°"],
                [0, "0.022°"],
                [1, "0.044°"],
                [2, "0.088°"],
                [3, "0.176°"],
              ]),
            },
            {
              key: "velFilter",
              start: 11,
              end: 14,
              type: "select",
              format: mt6835VelFilter,
              options: [0, 1, 2, 4, 8, 15].map((value) => ({ value, name: String(value) })),
            },
          ],
        },
      ],
    },
  },
]

/* Микросхема по id из пропса chip; нет или не того класса - undefined (виджет без настроек датчика) */
export const sensorChipPart = (id: string | undefined, kind: SensorKind): SensorChipPart | undefined => SENSOR_CHIPS.find((chip) => chip.id === id)?.[kind]

/* Варианты выбора микросхемы для панели конструктора */
export const sensorChipOptions = (kind: SensorKind) => SENSOR_CHIPS.filter((chip) => chip[kind]).map((chip) => ({ value: chip.id, name: chip.name }))
