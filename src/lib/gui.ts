/* $lib/gui.ts - чистые правила рендерера GUI устройства (GUIRenderer): сетка, поля смарт-виджетов, битовые поля, сборка пакетов команд, слияние ответа устройства в хранилище значений. Без Svelte - проверяются тестами против dist */
import { bitFieldGet, bitFieldSet } from "./bitField.js"
import type { DeviceTransport } from "./fsTransfer"
import type { IUIComponentHandler, IWidgetFileSystemInfo, IWidgetStackInfo, UIComponent, UIType } from "./types"

/* Сетка GUI: 23 колонки (2, 3, 4, 6 и 12 равных групп с пустой колонкой между ними), высота строки в rem - общая для конструктора и рендерера */
export const GUI_GRID = { columns: 23, cellHeight: 6 } as const

/* Смарт-виджет - тип с префиксом Widget, кроме примитива Widget */
export const isWidgetType = (type: string) => type.startsWith("Widget") && type !== "Widget"

/* Строк сетки у компонента: аккордеон и смарт-виджеты - одна строка, растущая по содержимому */
export const spanRows = (c: { type: string; position: { height?: number } }) => (c.type === "Accordion" || isWidgetType(c.type) ? 1 : (c.position.height ?? 1))

/* ********************************************************** */
/* Поля смарт-виджетов: имя поля - тип значения; ключ на устройстве - "{префикс}.{keys[поле] ?? поле}" */
const num = 0
const text = ""

export const WIDGET_FIELDS = {
  WidgetWiFi: {
    WiFiMode: num /* 0=NULL, 1=STA, 2=AP, 3=STA+AP - как wifi_mode_t */,
    StaSSID: text,
    StaPSK: text,
    StaticIP: num /* 0=DHCP, 1=Static */,
    StaIP: text,
    StaMS: text,
    StaGW: text,
    ApSSID: text,
    ApPSK: text,
    ApIP: text,
    ApMS: text,
    ApGW: text,
  },
  WidgetDeviceInfo: {
    DevSN: text,
    DevID: text,
    DevFW: num,
    RunCnt: num,
    DevName: text,
    BindKey: text /* ключ привязки: метка роли модуля, по ней ядро изделия связывает с ним свою сущность (ось подвеса, датчик) */,
    HostName: text,
    WebUser: text,
    WebPsw: text,
    /* Текущие адреса STA/AP - только отображение, сеть настраивает WidgetWiFi */
    StaIP: text,
    ApIP: text,
    DevBusID: num /* адрес на шине (STM, хабы) - только чтение, показывается HEX */,
    SCLL: num /* уровень логов консоли: 0 OFF, 1 ERROR, 2 WARNING, 3 INFO, 4 DEBUG, 5 TRACE (и копии всех пакетов) */,
  },
  /* Объект FS (FS_WriteState прошивки): Total/Used/Free/List и Upload во время закачки */
  WidgetFileSystem: { FS: {} as IWidgetFileSystemInfo },
  /* Объект StackInfo лежит в Payload без префикса группы (API_GetStackInfo) */
  WidgetStackInfo: { StackInfo: {} as IWidgetStackInfo },
  /* Текущая версия модуля; список версий VerFW-S подставляет приложение */
  WidgetFirmware: { DevFW: num },
  /* Группа LST драйвера RGB_Strip */
  WidgetRGBStrip: {
    Color: [] as number[] /* [R, G, B, W] 0..255; W - только SK6812 */,
    Effect: num /* 0 статичный, 1 радуга, 2 дыхание, 3 палитра, 4 комета, 5 мерцание, 6 огонь, 7 бегущие огни */,
    Speed: num /* 0..10, 0 - пауза */,
    Count: num,
    Model: num /* 0 WS2812, 1 SK6812 (RGBW), 2 WS2811 */,
    Order: num /* 0 GRB, 1 RGB, 2 BRG, 3 RBG, 4 GBR, 5 BGR */,
    MaxCount: num /* ёмкость из прошивки, только чтение */,
  },
  /* Телеметрия MAVLink (20.00.000-01) */
  WidgetPFD: {
    Roll: num /* крен, ° (вправо +) */,
    Pitch: num /* тангаж, ° (вверх +) */,
    Heading: num /* курс, 0..360° */,
    GSpeed: num /* путевая скорость, м/с */,
    ASpeed: num /* воздушная скорость, м/с */,
    Load: num /* перегрузка, g; нет числа - плашка G скрыта */,
    Slip: num /* боковая перегрузка, g, вправо +; нет числа - шарик скрыт */,
    Thr: num /* газ, %; нет числа - плашка THR скрыта */,
    WindDir: num /* откуда дует ветер, 0-360°; нет числа - плашка ветра скрыта */,
    WindSpd: num /* скорость ветра, м/с */,
    Climb: num /* вертикальная скорость, м/с (вверх +) */,
    Alt: num /* высота над точкой взлёта, м */,
    AltMSL: num /* высота над уровнем моря, м */,
    Lat: num,
    Lon: num,
    Vx: num /* скорость на север, м/с */,
    Vy: num /* скорость на восток, м/с */,
    Fix: num /* GPS_FIX_TYPE: 0-1 нет, 2 2D, 3 3D, 4 DGPS, 5 RTK float, 6 RTK fixed */,
    Sat: num,
    BV: num /* напряжение батареи, В */,
    BC: num /* ток, А; -1 - не измеряется */,
    BRem: num /* остаток, %; -1 - неизвестно */,
    Mode: num /* custom_mode HEARTBEAT */,
    VType: num /* MAV_TYPE - названия режимов */,
    Armed: num /* 1 - взведён */,
    HomeLat: num /* точка взлёта, °; 0 - неизвестна */,
    HomeLon: num,
    Press: num /* давление, гПа */,
    Temp: num /* температура, °C */,
    WPNum: num /* текущая точка маршрута; 0 - маршрута нет */,
    WPDist: num /* до точки, м */,
    WPBrg: num /* курс на точку, 0..360° */,
    AltErr: num /* целевая высота минус текущая, м */,
    SpdErr: num /* целевая скорость минус текущая, м/с */,
    XTE: num /* боковое отклонение от линии маршрута, м */,
    RSSI: num /* сигнал своей стороны, %; -1 - неизвестно */,
    RemRSSI: num /* сигнал удалённой стороны, %; -1 - неизвестно */,
    Drop: num /* потери пакетов, % */,
    HDOP: num /* точность GPS по горизонтали; -1 - неизвестно */,
    EKF: num /* наибольшая дисперсия навигационного фильтра: < 0.5 норма, < 0.8 внимание */,
    SensErr: num /* включённых, но неисправных датчиков */,
    Msg: text /* последнее сообщение автопилота (STATUSTEXT) */,
    MsgSev: num /* 0-3 ошибка, 4 предупреждение, 5-7 информация */,
    MsgSeq: num /* номер сообщения - новое даже с тем же текстом */,
  },
  /* Фильтр ориентации ahrs_gimbal (группа AHRF): алгоритм и его параметры - настройки, углы, ноль гироскопа и ошибка оценки - только чтение */
  WidgetAHRS: {
    Mode: num /* 0 VQF, 1 ESKF, 2 Махони, 3 Маджвик */,
    MU: num /* 1 - магнитометр поправляет курс */,
    TA: num /* VQF: постоянная поправки наклона, с */,
    TM: num /* VQF: постоянная поправки курса, с */,
    GN: num /* ESKF: шум гироскопа, °/с/√Гц */,
    GB: num /* ESKF: уход нуля гироскопа, °/с/√с */,
    AN: num /* шум акселерометра, g */,
    AG: num /* порог отклонения модуля ускорения от 1 g */,
    MN: num /* ESKF: шум курса, ° */,
    KP: num /* Махони: пропорциональный коэффициент */,
    KI: num /* Махони: интегральный коэффициент */,
    KB: num /* Маджвик: шаг по тяжести */,
    KM: num /* Махони и Маджвик: поправка курса */,
    R: num /* крен, ° */,
    P: num /* тангаж, ° */,
    Y: num /* рыскание, 0..360° */,
    BX: num /* ноль гироскопа, °/с */,
    BY: num,
    BZ: num,
    SR: num /* ESKF: ошибка оценки крена (1 сигма), ° */,
    SP: num,
    SY: num,
  },
  /* IMU любого драйвера (группа IMUF): Cfg биты 0-1 - режим (0 стоп, 1 измерять, 2 ноль гироскопа, 3 записать положение акселерометра), показания - только чтение */
  WidgetIMU: {
    Cfg: num,
    MR: num /* поворот осей датчика относительно корпуса, ° */,
    MP: num,
    MY: num,
    AX: num /* ускорение, g */,
    AY: num,
    AZ: num,
    GX: num /* угловая скорость, °/с */,
    GY: num,
    GZ: num,
    T: num /* температура, °C */,
    ACP: num /* записанные положения калибровки акселерометра по 6 положениям, биты +X, -X, +Y, -Y, +Z, -Z; нет ключа - драйвер её не умеет */,
  },
  /* Магнитометр любого драйвера (группа MAGF): Cfg биты 0-1 - режим (0 стоп, 1 измерять, 2 калибровать, 3 по запросу), поле и качество калибровки - только чтение */
  WidgetMag: {
    Cfg: num,
    MR: num /* собственная привязка магнитометра к корпусу, ° */,
    MP: num,
    MY: num,
    CX: num /* поле, мкТл */,
    CY: num,
    CZ: num,
    CQ: num /* качество калибровки, 0..100% */,
  },
  /* Энкодер любого драйвера (группа ENC): Cfg биты 0-1 - режим (0 стоп, 1 измерять, 2 автокалибровка, 3 ноль здесь), ноль - биты 15-26 Cfg; показания - только чтение */
  WidgetEncoder: {
    Cfg: num,
    A: num /* угол, ° */,
    Vel: num /* скорость, рад/с */,
    ST: num /* флаги чипа: бит 0 превышение скорости, 1 слабое поле, 2 низкое напряжение */,
    CS: num /* итог автокалибровки: 0 нет, 1 идёт, 2 ошибка, 3 успешно */,
    CR: num /* скорость вала при последней автокалибровке по замеру датчика, об/мин; 0 - не было */,
  },
  /* Векторное управление мотором (группа FOC, компонент foc_control прошивки): состояние оси Ang (°), Vel (°/с), Iq (А), Uq (В), Flg (флаги) - только чтение; настройки в градусах */
  WidgetFOC: {
    Ang: num,
    Vel: num,
    Iq: num,
    Uq: num,
    Flg: num,
    M_Type: num,
    M_PP: num,
    M_R: num,
    M_L: num,
    M_KV: num,
    M_Dir: num,
    ZEA: num,
    M_VL: num,
    M_CL: num,
    M_VLL: num,
    M_CTO: num,
    M_Torq: num,
    M_Mod: num,
    C_Kp: num,
    C_Ki: num,
    C_Kd: num,
    C_Lim: num,
    C_Ramp: num,
    V_Kp: num,
    V_Ki: num,
    V_Kd: num,
    V_Lim: num,
    V_Ramp: num,
    A_Kp: num,
    A_Lim: num,
    A_Ramp: num,
    S_Gain: num,
    S_OffA: num,
    S_OffB: num,
    S_OffC: num,
    S_VTf: num,
    S_CTf: num,
    TuneHz: num,
    Run: num,
  },
  /* База оси любого привода (группа HOME, компонент homing прошивки): способ, состояние и края - только чтение; Off, Speed, Marg и ключи способа сохраняются */
  WidgetHoming: {
    Sensor: num,
    SensorPos: num,
    Backoff: num,
    FineSpeed: num,
    Phase: num /* 1 поиск, 2 отъезд, 3 точный подход */,
    Dir: num /* Направление поиска датчика: -1 или +1 */,
    Type: num /* способ поиска: 0 базы нет, 1 механические упоры */,
    St: num /* состояние: 0 не искали, 1 идёт, 2 найдена, 3 отказ */,
    Err: num /* код отказа последнего поиска (словарь сообщений), 0 - нет */,
    Found: num /* база найдена */,
    Lo: num /* край, от которого разрешённый ход идёт в плюс, ° датчика */,
    Hi: num /* второй край, ° датчика */,
    Pos: num /* угол вала сейчас, ° датчика */,
    Off: num /* дом от центра между краями, °; без базы - угол дома */,
    Speed: num /* скорость поиска и выхода домой, °/с */,
    Marg: num /* отступ от краёв в работе, ° */,
    Force: num /* способ «упоры»: усилие мотора при поиске, % от полного */,
    Lag: num /* способ «упоры»: цель ушла от вала на столько, а вал стоит - упор, ° */,
  },
  /* Поля одного борта карты, групп может быть несколько (groups) */
  WidgetMap: {
    Lat: num /* 0 вместе с Lon - нет фикса */,
    Lon: num,
    Alt: num,
    Heading: num /* поворот маркера */,
    Sat: num,
    DevName: text /* подпись маркера */,
    DevSN: text,
    WPNum: num /* текущая команда миссии - прогресс режимов «Маршрут» и «Агро» */,
  },
}

export type WidgetFieldsType = keyof typeof WIDGET_FIELDS
export type IWidgetWiFiConfig = typeof WIDGET_FIELDS.WidgetWiFi
export type IWidgetDeviceInfoConfig = typeof WIDGET_FIELDS.WidgetDeviceInfo
export type IWidgetRGBStripConfig = typeof WIDGET_FIELDS.WidgetRGBStrip
export type IWidgetPFDData = typeof WIDGET_FIELDS.WidgetPFD
export type IWidgetMapData = typeof WIDGET_FIELDS.WidgetMap
export type IWidgetAHRSData = typeof WIDGET_FIELDS.WidgetAHRS
export type IWidgetIMUData = typeof WIDGET_FIELDS.WidgetIMU
export type IWidgetMagData = typeof WIDGET_FIELDS.WidgetMag
export type IWidgetEncoderData = typeof WIDGET_FIELDS.WidgetEncoder
export type IWidgetHomingData = typeof WIDGET_FIELDS.WidgetHoming
export type IWidgetFOCData = typeof WIDGET_FIELDS.WidgetFOC

/* Ключ переменной устройства «ГРУППА.Поле» - до 15 символов: буфер прошивки 16 с \0, это и предел ключа NVS в ESP-IDF */
export const KEY_MAX_LEN = 15
/* Группа до 4 символов, с точкой - 5 (CFG_GROUP_MAX_LEN прошивки) */
export const GROUP_MAX_LEN = 4
/* Ключ целиком: до 15 символов, группа перед точкой - до 4, после точки - хотя бы один символ; без группы тоже можно (StackInfo, GMBL у ядра); пустой - нет ключа */
export const VARIABLE_KEY_REGEXP = new RegExp(`^(?=.{0,${KEY_MAX_LEN}}$)(([A-Za-z0-9_-]{1,${GROUP_MAX_LEN}}[.])?[A-Za-z0-9_-]+)?$`)
export const keyRegExp = (max: number, min = 0) => new RegExp(`^[A-Za-z0-9_.-]{${min},${Math.max(min, max)}}$`)
/* Префикс группы - без точки, её добавляет виджет */
export const groupRegExp = (max: number) => new RegExp(`^[A-Za-z0-9_-]{0,${max}}$`)
/* Сколько символов остаётся полю после префикса группы с точкой */
export const fieldMaxLen = (prefix: string) => (prefix ? KEY_MAX_LEN - prefix.length - 1 : KEY_MAX_LEN)
/* Сколько символов остаётся префиксу группы: не больше 4 и не больше, чем оставляет самое длинное поле */
export const prefixMaxLen = (fields: string[]) => Math.min(GROUP_MAX_LEN, KEY_MAX_LEN - 1 - Math.max(0, ...fields.map((field) => field.length)))

/* Группа полей по умолчанию (properties.id пуст); у StackInfo группы нет, у карты группы - groups */
export const WIDGET_PREFIX: Record<WidgetFieldsType, string> = {
  WidgetWiFi: "CFG",
  WidgetDeviceInfo: "CFG",
  WidgetFileSystem: "CFG",
  WidgetStackInfo: "",
  WidgetFirmware: "CFG",
  WidgetRGBStrip: "LST",
  WidgetPFD: "MAV",
  WidgetMap: "MAV",
  WidgetAHRS: "AHRF",
  WidgetIMU: "IMUF",
  WidgetMag: "MAGF",
  WidgetEncoder: "ENC",
  WidgetHoming: "HOME",
  WidgetFOC: "FOC",
}

export const widgetPrefixes = (type: WidgetFieldsType, props: { id?: string; groups?: string[] }): string[] =>
  type === "WidgetMap" ? (props.groups ?? [WIDGET_PREFIX.WidgetMap]) : type === "WidgetStackInfo" ? [""] : [props.id || WIDGET_PREFIX[type]]

/* Поля, которые виджет сохраняет одним SET ModuleConfig; остальные только читаются */
export const WIDGET_SAVE_FIELDS = {
  WidgetWiFi: Object.keys(WIDGET_FIELDS.WidgetWiFi) as (keyof IWidgetWiFiConfig)[],
  WidgetDeviceInfo: ["DevName", "BindKey", "HostName", "WebUser", "WebPsw", "SCLL"] as (keyof IWidgetDeviceInfoConfig)[],
  WidgetRGBStrip: ["Count", "Model", "Order"] as (keyof IWidgetRGBStripConfig)[],
}

/* Поля main_config, которые есть у каждой прошивки: весь набор STM, у ESP он тоже есть; заглушка GUI облака показывает их у любого устройства */
export const DEVICE_INFO_COMMON_FIELDS: (keyof IWidgetDeviceInfoConfig)[] = ["DevSN", "DevName", "BindKey", "DevBusID", "DevFW", "RunCnt", "SCLL"]

/* Поля WidgetDeviceInfo без своего выбора (show): набор ESP-шлюза */
export const DEVICE_INFO_DEFAULT_FIELDS: (keyof IWidgetDeviceInfoConfig)[] = [
  "DevSN",
  "DevID",
  "DevFW",
  "RunCnt",
  "StaIP",
  "ApIP",
  "DevName",
  "BindKey",
  "HostName",
  "WebUser",
  "WebPsw",
]

/* Ключ поля на устройстве; пустой префикс - ключ без группы */
export const widgetKey = (prefix: string, field: string, keys?: Partial<Record<string, string>>) => `${prefix ? `${prefix}.` : ""}${keys?.[field] || field}`

/* Значения полей виджета: { поле: get(ключ) }, поля без значения пропускаются */
export const readWidgetFields = <F extends object>(
  get: (key: string) => unknown,
  prefix: string,
  fields: F,
  keys?: Partial<Record<keyof F, string>>,
): Partial<F> =>
  Object.fromEntries(
    Object.keys(fields)
      .map((field) => [field, get(widgetKey(prefix, field, keys))])
      .filter(([, value]) => value !== undefined),
  ) as Partial<F>

/* Payload SET ModuleConfig из значений виджета: только перечисленные поля, ключи устройства */
export const widgetPacket = <K extends string>(prefix: string, fields: readonly K[], values: Partial<Record<K, unknown>>, keys?: Partial<Record<K, string>>) =>
  Object.fromEntries(fields.map((field) => [widgetKey(prefix, field, keys), values[field]])) as Record<string, unknown>

/* ********************************************************** */
/* Режим датчика - биты 0-1 слова Cfg, общий договор драйверов IMU и магнитометра: 0 стоп, 1 измерять, 2 калибровать, 3 по запросу (у IMU - записать положение калибровки акселерометра) */
export const SENSOR_MODE = { stop: 0, measure: 1, calibrate: 2, onDemand: 3 } as const
export const sensorMode = (cfg: unknown): number => bitFieldGet(Number(cfg) || 0, 0, 1)
/* Cfg для запуска калибровки: режим 2, остальные биты как были */
export const sensorCalibrateCfg = (cfg: unknown): number => bitFieldSet(Number(cfg) || 0, 0, 1, SENSOR_MODE.calibrate)

/* ********************************************************** */
/* Битовое поле: Input type "bitMode" и Select с bitMode читают и пишут биты range слова переменной */
export const bitRange = (component: UIComponent): { start: number; end: number } | null => {
  const props = component.properties as { type?: string; bitMode?: boolean; range?: { start: number; end: number } }
  const isBits = (component.type === "Input" && props.type === "bitMode") || (component.type === "Select" && props.bitMode)
  return isBits && props.range ? props.range : null
}

/* Значение для компонента из слова устройства */
export const readBits = (component: UIComponent, word: unknown): unknown => {
  const range = bitRange(component)
  return range ? bitFieldGet(Number(word) || 0, range.start, range.end) : word
}

/* Новое слово устройства после изменения компонента */
export const writeBits = (component: UIComponent, word: unknown, value: unknown): unknown => {
  const range = bitRange(component)
  return range ? bitFieldSet(Number(word) || 0, range.start, range.end, Number(value)) : value
}

/* ********************************************************** */
/* Связь рендерера с выбранным модулем: get - значение переменной (реактивное, если хранилище реактивное), module - переменная другого модуля (колонка keyCol таблицы); set - своё значение до ответа устройства; send и waitFor - транспорт команд с HAR, dictionary - словарь имён в коды */
export interface DeviceLink extends DeviceTransport {
  get(key: string, module?: string): unknown
  set?(key: string, value: unknown): void
}

/* Пакет команды: заголовок и аргумент именами из eventHandler (в провод их переводит sendCommand в HAR), Payload и локальные записи значений (оптимистичное обновление) */
export interface DevicePacket {
  header: string
  argument: string
  payload: Record<string, unknown>
  writes: [key: string, value: unknown][]
  /* false - Argument "NoSend": значения записываются, пакет не уходит */
  send: boolean
}

const isRecord = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value)

/* Пакет компонента по eventHandler: Value - готовый JSON Payload; иначе Payload из Variables, у изменённой переменной - новое значение, "группа-поле" - вложенный объект { группа: { поле } }. null - нет Header/Argument или неверный JSON */
export const commandPacket = (
  handler: IUIComponentHandler | undefined,
  get: (key: string) => unknown,
  changed?: [key: string, value: unknown],
): DevicePacket | null => {
  if (!handler?.Header || !handler.Argument) return null
  const packet: DevicePacket = { header: handler.Header, argument: handler.Argument, payload: {}, writes: [], send: handler.Argument !== "NoSend" }
  if (handler.Value) {
    try {
      const parsed: unknown = JSON.parse(handler.Value)
      if (!isRecord(parsed)) return null
      packet.payload = parsed
    } catch {
      return null
    }
    return packet
  }
  for (const variable of handler.Variables ?? []) {
    const value = changed && variable === changed[0] ? changed[1] : get(variable)
    const parts = variable.split("-")
    if (parts.length === 2) {
      const group = (isRecord(packet.payload[parts[0]]) ? packet.payload[parts[0]] : (packet.payload[parts[0]] = {})) as Record<string, unknown>
      group[parts[1]] = value
    } else packet.payload[variable] = value
    packet.writes.push([variable, value])
  }
  return packet
}

/* Пакет кнопки строки таблицы: Payload - значения Variables из строки; у списка ключ вариантов "-S", значение - в поле без суффикса */
export const tablePacket = (handler: IUIComponentHandler | undefined, row: object): DevicePacket | null => {
  if (!handler?.Header || !handler.Argument) return null
  const payload = Object.fromEntries(
    (handler.Variables ?? []).map((variable) => {
      const key = variable.replace(/-S$/, "")
      return [key, (row as Record<string, unknown>)[key]]
    }),
  )
  return { header: handler.Header, argument: handler.Argument, payload, writes: [], send: handler.Argument !== "NoSend" }
}

/* ********************************************************** */
/* Служебные поля диалога SET SystemFileSystem - не состояние устройства */
const FS_PROTOCOL_KEYS = new Set(["Op", "CurrentID", "ChunkSize", "ChunkIndex", "Name", "FileSize", "CRC32", "Data"])

/* Payload ответа устройства в хранилище значений (Map, SvelteMap): ключ prefix + имя; объект пишется целиком и ещё по полям "имя-поле"; объект без List поверх сохранённого с List - ход закачки CFG.FS, дописывается. Пишутся только изменившиеся значения; argument - имя аргумента из разобранного конверта (decodeWsEnvelope) */
export const mergeDevicePayload = (
  values: { get(key: string): unknown; set(key: string, value: never): unknown },
  prefix: string,
  argument: string,
  payload: unknown,
) => {
  if (!isRecord(payload)) return
  const put = (key: string, value: unknown) => {
    if (values.get(key) !== value) values.set(key, value as never)
  }
  for (const [name, raw] of Object.entries(payload)) {
    if (argument === "SystemFileSystem" && FS_PROTOCOL_KEYS.has(name)) continue
    let value = raw
    if (isRecord(raw)) {
      const stored = values.get(prefix + name)
      if (!("List" in raw) && isRecord(stored) && "List" in stored) value = { ...stored, ...raw }
      for (const [field, sub] of Object.entries(raw)) put(`${prefix}${name}-${field}`, sub)
    }
    put(prefix + name, value)
  }
}

/* ********************************************************** */
/* Раскладка по правилам автора: группа - блоки вплотную; группы разделяет пустая строка или блок во всю ширину (друг под другом), пустая колонка (рядом); см. README «Раскладка и правила для автора GUI» */
const rows = (c: UIComponent): [number, number] => [c.position.row, c.position.row + spanRows(c)]
const cols = (c: UIComponent): [number, number] => [c.position.col, c.position.col + c.position.width]

/* Деление по оси: gap - новая часть только через пустую клетку (граница групп), без gap - на любой границе (строки формы) */
const split = (list: UIComponent[], range: (c: UIComponent) => [number, number], gap: boolean) => {
  const sorted = [...list].sort((a, b) => range(a)[0] - range(b)[0])
  const parts: UIComponent[][] = []
  let end = -Infinity
  for (const c of sorted) {
    const [start, stop] = range(c)
    if (gap ? start > end : start >= end) parts.push([c])
    else parts[parts.length - 1].push(c)
    end = Math.max(end, stop)
  }
  return parts
}

/* stack - сверху вниз, groups - группы рядом (на телефоне карточки), line - строка формы (рядом с переносом) */
export type FlowNode = { kind: "leaf"; component: UIComponent } | { kind: "stack" | "groups" | "line"; items: FlowNode[] }
const leaf = (component: UIComponent): FlowNode => ({ kind: "leaf", component })

/* Группа без пустых клеток внутри: строки формы сверху вниз, в строке блоки рядом; блок в несколько строк (джойстик) встаёт рядом со своими соседями */
const form = (list: UIComponent[]): FlowNode => {
  if (list.length === 1) return leaf(list[0])
  const bands = split(list, rows, false)
  if (bands.length > 1) return { kind: "stack", items: bands.map(form) }
  const columns = split(list, cols, false)
  if (columns.length > 1) return { kind: "line", items: columns.map(form) }
  return { kind: "stack", items: [...list].sort((a, b) => a.position.row - b.position.row || a.position.col - b.position.col).map(leaf) }
}

/* Участки между блоками во всю ширину (разделитель, график): такой блок - тоже граница разделов */
const parts = (list: UIComponent[]) => {
  const out: UIComponent[][] = []
  let run: UIComponent[] = []
  for (const band of split(list, rows, false)) {
    if (split(band, cols, false).length > 1) {
      run.push(...band)
      continue
    }
    if (run.length) out.push(run)
    out.push(band)
    run = []
  }
  if (run.length) out.push(run)
  return out
}

export const layoutFlow = (list: UIComponent[]): FlowNode => {
  if (list.length === 1) return leaf(list[0])
  const sections = split(list, rows, true)
  if (sections.length > 1) return { kind: "stack", items: sections.map(layoutFlow) }
  const runs = parts(list)
  if (runs.length > 1) return { kind: "stack", items: runs.map(layoutFlow) }
  const groups = split(list, cols, true)
  if (groups.length > 1) return { kind: "groups", items: groups.map(layoutFlow) }
  return form(list)
}

/* Наименьшая удобная ширина блока на телефоне, px; не указан - во всю ширину */
const MIN_PX: Partial<Record<UIType, number>> = {
  Switch: 90,
  Input: 120,
  Select: 130,
  Slider: 120,
  Button: 110,
  TextField: 100,
  ProgressBar: 140,
  Widget: 120,
  Joystick: 200,
}
export const flowMinWidth = (node: FlowNode): number => {
  if (node.kind === "leaf") {
    /* Список кнопками - по ширине вариантов, не поместится в пол-экрана - во всю ширину */
    const props = node.component.properties as { type?: string; options?: unknown[] }
    if (node.component.type === "Select" && props.type === "buttons") {
      const px = 44 * (props.options?.length ?? 2)
      return px > 300 ? Infinity : Math.max(px, 120)
    }
    return MIN_PX[node.component.type] ?? Infinity
  }
  const widths = node.items.map(flowMinWidth)
  return node.kind === "stack" ? Math.max(...widths) : widths.reduce((sum, w) => sum + w + 8, -8)
}

/* Компьютер: сетка из колонок автора, внутренние пустые колонки (границы групп) - узкая полоса вместо полной колонки */
const GUTTER = "0.75rem"
export const layoutColumns = (list: UIComponent[], total: number) => {
  const used = new Set<number>()
  for (const c of list) for (let col = c.position.col; col < c.position.col + c.position.width; col++) used.add(col)
  const count = Math.max(total, ...list.map((c) => c.position.col + c.position.width - 1))
  const first = Math.min(...used)
  const last = Math.max(...used)
  return Array.from({ length: count }, (_, i) => (i + 1 > first && i + 1 < last && !used.has(i + 1) ? GUTTER : "minmax(0, 1fr)")).join(" ")
}

/* Типы компонентов, которые встречаются в GUI (по порядку первого появления): по ним приложение собирает views для GUIRenderer, чтобы в сборку попали только они */
export const guiTypes = (components: readonly { type: UIType }[]): UIType[] => [...new Set(components.map((component) => component.type))]

/* ********************************************************** */
/* Файл GUI - YAML { metadata, components }, как сохраняет конструктор DevCloud; YAML читает и пишет приложение, здесь - проверка уже разобранных данных */
export interface GuiFile {
  metadata: Record<string, unknown>
  components: UIComponent[]
}

/* Разобранный YAML в файл GUI; нет списка components - null */
export const toGuiFile = (data: unknown): GuiFile | null => {
  if (!data || typeof data !== "object" || !Array.isArray((data as GuiFile).components)) return null
  const { metadata } = data as Partial<GuiFile>
  return { metadata: metadata && typeof metadata === "object" ? metadata : {}, components: (data as GuiFile).components }
}

/* Метаданные файла GUI или набора команд: имя неверного поля (metadata, DevID, VerFW, Author, Date) или null */
export const guiMetadataError = (metadata: unknown): "metadata" | "DevID" | "VerFW" | "Author" | "Date" | null => {
  if (!metadata || typeof metadata !== "object") return "metadata"
  const { DevID, VerFW, Author, Date } = metadata as Record<string, unknown>
  if (typeof DevID !== "string" || !DevID.trim()) return "DevID"
  /* Версия - целое от 0: 0 - GUI модуля в загрузчике */
  if (typeof VerFW !== "number" || !Number.isInteger(VerFW) || VerFW < 0) return "VerFW"
  if (typeof Author !== "string" || !Author.trim()) return "Author"
  if (typeof Date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(Date)) return "Date"
  return null
}
