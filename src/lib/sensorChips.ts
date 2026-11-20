/* $lib/sensorChips.ts - справочник микросхем датчиков для WidgetIMU и WidgetMag: битовые поля слова Cfg драйвера ровно как в прошивке (ProdFactory, components/drivers/<чип>/<чип>.h), заводское слово. Биты 0-1 (режим: стоп, измерение, калибровка, по запросу) - общие у всех, их ведёт блок калибровки. Новая микросхема - новая запись SENSOR_CHIPS, виджет не меняется */

/* Поле Cfg: start..end - биты включительно; select - варианты кодами, number - целое в пределах, switch - один бит */
export type SensorChipField =
  | { key: string; start: number; end: number; type: "select"; options: { value: number; name: string }[] }
  | { key: string; start: number; end: number; type: "number"; min: number; max: number }
  | { key: string; start: number; end: number; type: "switch" }

/* Группа полей в блоке настроек: name - ключ перевода sensor.section.<name> */
export interface SensorChipSection {
  name: string
  fields: SensorChipField[]
}

/* Часть микросхемы одного класса: поля и заводское слово Cfg (CB_ResetConfig драйвера) */
export interface SensorChipPart {
  sections: SensorChipSection[]
  factory: number
}

/* Микросхема: у 9-осевого IMU есть обе части */
export interface SensorChip {
  id: string
  name: string
  imu?: SensorChipPart
  mag?: SensorChipPart
}

/* Варианты числами с единицей: подписи одинаковые на всех языках */
const opts = (pairs: [number, string][]) => pairs.map(([value, name]) => ({ value, name }))
/* Варианты словами: имя - ключ перевода sensor.opt.<имя> */
const words = (pairs: [number, string][]) => pairs.map(([value, name]) => ({ value, name: `@${name}` }))

const ICM42688_ODR = opts([
  [1, "32 kHz"],
  [2, "16 kHz"],
  [3, "8 kHz"],
  [4, "4 kHz"],
  [5, "2 kHz"],
  [6, "1 kHz"],
  [7, "200 Hz"],
])
const ICM42688_LPF = opts([
  [0, "ODR/2"],
  [1, "ODR/4"],
  [2, "ODR/5"],
  [3, "ODR/8"],
  [4, "ODR/10"],
  [5, "ODR/16"],
  [6, "ODR/20"],
  [7, "ODR/40"],
])
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
      factory: 2384345337,
      sections: [
        {
          name: "common",
          fields: [
            { key: "poll", start: 2, end: 3, type: "select", options: opts([[0, "100 Hz"], [1, "500 Hz"], [2, "1 kHz"]]) },
            { key: "temp", start: 4, end: 4, type: "switch" },
          ],
        },
        {
          name: "accel",
          fields: [
            { key: "enable", start: 5, end: 5, type: "switch" },
            { key: "power", start: 6, end: 7, type: "select", options: words([[0, "off"], [2, "lowPower"], [3, "lowNoise"]]) },
            { key: "range", start: 8, end: 9, type: "select", options: opts([[3, "±2 g"], [2, "±4 g"], [1, "±8 g"], [0, "±16 g"]]) },
            { key: "odr", start: 10, end: 12, type: "select", options: ICM42688_ODR },
            { key: "lpf", start: 13, end: 15, type: "select", options: ICM42688_LPF },
            { key: "lpfOrder", start: 16, end: 17, type: "select", options: LPF_ORDER },
          ],
        },
        {
          name: "gyro",
          fields: [
            { key: "enable", start: 18, end: 18, type: "switch" },
            { key: "power", start: 19, end: 20, type: "select", options: words([[0, "off"], [1, "standby"], [3, "lowNoise"]]) },
            {
              key: "range",
              start: 21,
              end: 23,
              type: "select",
              options: opts([
                [7, "±15.6 °/s"],
                [6, "±31.3 °/s"],
                [5, "±62.5 °/s"],
                [4, "±125 °/s"],
                [3, "±250 °/s"],
                [2, "±500 °/s"],
                [1, "±1000 °/s"],
                [0, "±2000 °/s"],
              ]),
            },
            { key: "odr", start: 24, end: 26, type: "select", options: ICM42688_ODR },
            { key: "lpf", start: 27, end: 29, type: "select", options: ICM42688_LPF },
            { key: "lpfOrder", start: 30, end: 31, type: "select", options: LPF_ORDER },
          ],
        },
      ],
    },
  },
  {
    id: "RM3100",
    name: "RM3100",
    mag: {
      factory: 242197,
      sections: [
        {
          name: "common",
          fields: [
            {
              key: "rate",
              start: 2,
              end: 5,
              type: "select",
              options: opts([
                [0, "600 Hz"],
                [1, "300 Hz"],
                [2, "150 Hz"],
                [3, "75 Hz"],
                [4, "37 Hz"],
                [5, "18 Hz"],
                [6, "9 Hz"],
                [7, "4.5 Hz"],
                [8, "2.3 Hz"],
                [9, "1.2 Hz"],
                [10, "0.6 Hz"],
                [11, "0.3 Hz"],
                [12, "0.15 Hz"],
                [13, "0.075 Hz"],
              ]),
            },
            { key: "cycles", start: 6, end: 14, type: "number", min: 30, max: 400 },
          ],
        },
        {
          name: "axes",
          fields: [
            { key: "axisX", start: 15, end: 15, type: "switch" },
            { key: "axisY", start: 16, end: 16, type: "switch" },
            { key: "axisZ", start: 17, end: 17, type: "switch" },
          ],
        },
      ],
    },
  },
]

/* Микросхема по id из пропса chip; нет или не того класса - undefined (виджет без настроек датчика) */
export const sensorChipPart = (id: string | undefined, kind: "imu" | "mag"): SensorChipPart | undefined =>
  SENSOR_CHIPS.find((chip) => chip.id === id)?.[kind]

/* Варианты выбора микросхемы для панели конструктора */
export const sensorChipOptions = (kind: "imu" | "mag") => SENSOR_CHIPS.filter((chip) => chip[kind]).map((chip) => ({ value: chip.id, name: chip.name }))
