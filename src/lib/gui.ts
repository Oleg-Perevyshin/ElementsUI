/* $lib/gui.ts - чистые правила рендерера GUI устройства (GUIRenderer): сетка, поля смарт-виджетов, битовые поля, сборка пакетов команд, слияние ответа устройства в хранилище значений. Без Svelte - проверяются тестами против dist */
import { bitFieldGet, bitFieldSet } from "./bitField.js"
import type { DeviceTransport } from "./fsTransfer"
import type { IUIComponentHandler, IWidgetFileSystemInfo, IWidgetStackInfo, UIComponent } from "./types"

/* Сетка GUI: 18 колонок, высота строки в rem - общая для конструктора и рендерера */
export const GUI_GRID = { columns: 18, cellHeight: 6 } as const

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
    HostName: text,
    WebUser: text,
    WebPsw: text,
    /* Текущие адреса STA/AP - только отображение, сеть настраивает WidgetWiFi */
    StaIP: text,
    ApIP: text,
  },
  /* Объект FS (FS_WriteState прошивки): Total/Used/Free/List и Upload во время закачки */
  WidgetFileSystem: { FS: {} as IWidgetFileSystemInfo },
  /* Объект StackInfo лежит в Payload без префикса группы (API_GetStackInfo) */
  WidgetStackInfo: { StackInfo: {} as IWidgetStackInfo },
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

/* Группа полей по умолчанию (properties.id пуст); у StackInfo группы нет, у карты группы - groups */
const WIDGET_PREFIX: Record<WidgetFieldsType, string> = {
  WidgetWiFi: "CFG",
  WidgetDeviceInfo: "CFG",
  WidgetFileSystem: "CFG",
  WidgetStackInfo: "",
  WidgetRGBStrip: "LST",
  WidgetPFD: "MAV",
  WidgetMap: "MAV",
}

export const widgetPrefixes = (type: WidgetFieldsType, props: { id?: string; groups?: string[] }): string[] =>
  type === "WidgetMap" ? (props.groups ?? [WIDGET_PREFIX.WidgetMap]) : type === "WidgetStackInfo" ? [""] : [props.id || WIDGET_PREFIX[type]]

/* Поля, которые виджет сохраняет одним SET ModCfg; остальные только читаются */
export const WIDGET_SAVE_FIELDS = {
  WidgetWiFi: Object.keys(WIDGET_FIELDS.WidgetWiFi) as (keyof IWidgetWiFiConfig)[],
  WidgetDeviceInfo: ["DevName", "HostName", "WebUser", "WebPsw"] as (keyof IWidgetDeviceInfoConfig)[],
  WidgetRGBStrip: ["Count", "Model", "Order"] as (keyof IWidgetRGBStripConfig)[],
}

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

/* Payload SET ModCfg из значений виджета: только перечисленные поля, ключи устройства */
export const widgetPacket = <K extends string>(prefix: string, fields: readonly K[], values: Partial<Record<K, unknown>>, keys?: Partial<Record<K, string>>) =>
  Object.fromEntries(fields.map((field) => [widgetKey(prefix, field, keys), values[field]])) as Record<string, unknown>

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
/* Связь рендерера с выбранным модулем: get - значение переменной (реактивное, если хранилище реактивное), module - переменная другого модуля (колонка keyCol таблицы); set - своё значение до ответа устройства; send и waitFor - транспорт команд */
export interface DeviceLink extends DeviceTransport {
  get(key: string, module?: string): unknown
  set?(key: string, value: unknown): void
}

/* Пакет команды: Payload и локальные записи значений (оптимистичное обновление) */
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
/* Служебные поля диалога SET FS - не состояние устройства */
const FS_PROTOCOL_KEYS = new Set(["Op", "CurrentID", "ChunkSize", "ChunkIndex", "Name", "FileSize", "CRC32", "Data"])

/* Payload ответа устройства в хранилище значений (Map, SvelteMap): ключ prefix + имя; объект пишется целиком и ещё по полям "имя-поле"; объект без List поверх сохранённого с List - ход закачки CFG.FS, дописывается. Пишутся только изменившиеся значения */
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
    if (argument === "FS" && FS_PROTOCOL_KEYS.has(name)) continue
    let value = raw
    if (isRecord(raw)) {
      const stored = values.get(prefix + name)
      if (!("List" in raw) && isRecord(stored) && "List" in stored) value = { ...stored, ...raw }
      for (const [field, sub] of Object.entries(raw)) put(`${prefix}${name}-${field}`, sub)
    }
    put(prefix + name, value)
  }
}
