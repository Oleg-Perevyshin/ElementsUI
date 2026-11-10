import type { Snippet } from "svelte"
import type { AccentColor } from "./accent"
import type { IMissionPlan } from "./WidgetMap/mission/plan"
import type { IRoutePlan } from "./WidgetMap/mission/route"
import type { IWidgetWiFiConfig, IWidgetDeviceInfoConfig, IWidgetRGBStripConfig, IWidgetPFDData, IWidgetMapData } from "./gui"

export type { AccentColor } from "./accent"
export type { PropertyChange } from "./propsEditor"
export type { IWidgetWiFiConfig, IWidgetDeviceInfoConfig, IWidgetRGBStripConfig, IWidgetPFDData, IWidgetMapData } from "./gui"

/* Иконка: SVG-разметка или компонент */
export type IconSource = ConstructorOfATypedSvelteComponent | string

/* Свойства компонента по типу GUI - источник типа UIComponent и реестра COMPONENTS */
export interface UIComponentPropsMap {
  Accordion: IAccordionProps
  Button: IButtonProps
  Divider: IDividerProps
  FileAttach: IFileAttachProps
  Graph: IGraphProps
  Input: IInputProps
  Joystick: IJoystickProps
  PeriodChart: IPeriodChartProps
  ProgressBar: IProgressBarProps
  Select: ISelectProps<unknown, boolean>
  Slider: ISliderProps
  Switch: ISwitchProps
  Table: ITableProps<Record<string, unknown>>
  Tabs: ITabsProps
  TextField: ITextFieldProps
  VideoViewer: IVideoViewerProps
  Widget: IWidgetProps
  WidgetWiFi: IWidgetWiFiProps
  WidgetDeviceInfo: IWidgetDeviceInfoProps
  WidgetFileSystem: IWidgetFileSystemProps
  WidgetStackInfo: IWidgetStackInfoProps
  WidgetRGBStrip: IWidgetRGBStripProps
  WidgetPFD: IWidgetPFDProps
  WidgetMap: IWidgetMapProps
}

export type UIType = keyof UIComponentPropsMap

/* Компонент GUI: по type сужаются properties (component.type === "Button" - properties: IButtonProps) */
export type UIComponent<K extends UIType = UIType> = {
  [Type in K]: {
    id: string
    name?: string
    access?: "full" | "viewOnly" | "hidden"
    type: Type
    properties: UIComponentPropsMap[Type]
    position: Required<Position>
    parentId: string
    eventHandler?: IUIComponentHandler
  }
}[K]

/* Координаты и размер компонента */
export interface Position {
  row?: number
  col?: number
  width?: number
  height?: number
}

/* Интерфейс обработчика для UI компонента */
export interface IUIComponentHandler {
  Header?: string
  Argument?: string
  Value?: string
  Variables?: string[]
}

/* Интерфейс обработчика для UI компонента */
export interface IReceivingDataObject {
  Name?: string
  Timestamp?: string
  Value?: number | string | boolean
  Info?: string
}

/* ********************************************************** */
/* Интерфейс аккордиона */
export interface IAccordionProps {
  id?: string
  isOpen?: boolean
  wrapperClass?: string
  /* Цвет роли: иконка и текст заголовка - его цвет, фон заголовка - мягкий оттенок; без него - акцент темы */
  accent?: AccentColor
  size?: {
    height?: number
    width?: number
  }
  label?: {
    name?: string
    class?: string
    icon?: IconSource | null
  }
  /* Стрелка раскрытия справа в заголовке; без неё блок всё так же сворачивается нажатием на заголовок */
  chevron?: boolean
  children?: Snippet
  /* Кнопки справа в заголовке: нажатие на них не сворачивает и не разворачивает блок */
  actions?: Snippet
  image?: string
}

/* ********************************************************** */
/* Интерфейс кнопки */
export interface IButtonProps {
  id?: string
  wrapperClass?: string
  componentClass?: string
  /* primary - заливка цветом accent, secondary - поверхность с контуром, plain - текст цветом accent (по умолчанию) */
  variant?: "primary" | "secondary" | "plain"
  accent?: AccentColor
  disabled?: boolean
  content?: {
    name?: string
    info?: { text: string; side: "top" | "bottom" | "left" | "right" }
    icon?: IconSource | null
  }
  keyBind?: {
    showHint?: boolean
    key?: string
    ctrlKey?: boolean
    shiftKey?: boolean
    altKey?: boolean
    metaKey?: boolean /* Поддержка Meta (Cmd на Mac) */
  }
  onClick?: () => void
}

/* ********************************************************** */
/* Интерфейс карусели */
export interface ICarouselProps {
  id?: string
  wrapperClass?: string
  label?: { name?: string; class?: string }
  scrollValue?: number
  children?: Snippet
}

/* ********************************************************** */
/* Интерфейс разделителя элементов */
export interface IDividerProps {
  id?: string
  wrapperClass?: string
  type?: "line" | "empty"
  width?: number
  /* Без цвета - волосяная линия темы */
  accent?: AccentColor
  anchor?: "top" | "center" | "bottom"
}

/* ********************************************************** */
/* Интерфейс прикрепления файлов */
export interface IFileAttachProps {
  id?: string
  wrapperClass?: string
  componentClass?: string
  label?: { name?: string; class?: string }
  type?: "file" | "image" | "button"
  accept?: string
  /* Только для type "button": подсказка при наведении и своя иконка (по умолчанию - документ со стрелкой вверх) */
  info?: { text: string; side: "top" | "bottom" | "left" | "right" }
  icon?: IconSource | null
  imageSize?: { height?: string; width?: string; fitMode?: "cover" | "contain"; form?: "square" | "circle" }
  disabled?: boolean
  currentImage?: string | null
  /* Выбранный файл; null - выбор отменён */
  onUpdate?: (file: File | null, event: Event) => void
}

/* ********************************************************** */
/* Интерфейсы графика */
export interface IGraphDataObject {
  name: string
  value: number
}

/* Точка статического (исторического) ряда. timestamp - Unix-эпоха в миллисекундах (как Date.now()) */
export interface IGraphHistoryPoint {
  value: number
  timestamp: number
}

export interface IGraphHistorySeries {
  name: string
  points: IGraphHistoryPoint[]
}

export interface IGraphProps {
  id?: string
  wrapperClass?: string
  label?: { name?: string; class?: string }
  streamingData?: { data: IGraphDataObject[] | null }
  isTest?: boolean
  /* 0 = AUTO - точка на каждый новый массив streamingData.data (или вызов push() через bind:this), иначе - последние значения раз в столько мс */
  refreshRate?: number
  /* Если задан (непустой) - статический режим, весь массив разом по реальным timestamp, streamingData/refreshRate игнорируются */
  historyData?: IGraphHistorySeries[]
}

/* ********************************************************** */
/* Интерфейсы столбчатого графика с переключателем уровней детализации (Год/Месяц/Сутки/Час и т.п.) */
export interface IPeriodChartLevel {
  name: string /* Подпись вкладки переключателя, напр. "Час"/"Сутки"/"Месяц"/"Год" */
  variable?: string /* Имя переменной устройства, откуда берутся data этого уровня, напр. "PWR.EHour" */
  data: number[] /* Значения - длина массива = число столбиков, ничем не ограничена */
  labels?: string[] /* Подписи столбиков по X; если не заданы - используется индекс+1 */
}

export interface IPeriodChartProps {
  id?: string
  wrapperClass?: string
  accent?: AccentColor
  label?: { name?: string; class?: string }
  levels?: IPeriodChartLevel[] /* Порядок = порядок вкладок переключателя, всегда открывается на первом (индекс 0) */
  unit?: string /* Единицы для тултипа/подписи, напр. "Вт·ч" */
  /* Только уведомление о смене вкладки - сам компонент ничего не запрашивает, консьюмер сам решает, догружать ли данные */
  onLevelChange?: (index: number, level: IPeriodChartLevel) => void
}

/* ********************************************************** */
/* Интерфейс поля ввода */
export interface IInputProps {
  id?: string
  type?: "text" | "password" | "number" | "text-area" | "bitMode"
  wrapperClass?: string
  label?: { name?: string; class?: string }
  componentClass?: string
  /* Цвет роли: рамка и лёгкий фон поля */
  accent?: AccentColor
  disabled?: boolean
  readonly?: boolean
  value?: string | number
  range?: { start: number; end: number }
  maxlength?: number
  textareaRows?: number
  placeholder?: string
  number?: { minNum?: number; maxNum?: number; step?: number }
  help?: {
    info?: string
    copyButton?: boolean
    regExp?: string | RegExp
    autocomplete?:
      | "on"
      | "off"
      | "given-name"
      | "family-name"
      | "nickname"
      | "username"
      | "new-password"
      | "current-password"
      | "one-time-code"
      | "organization-title"
      | "country-name"
      | "address-level1"
      | "address-level2"
      | "street-address"
      | "postal-code"
      | "email"
      | "tel"
      | null
  }
  /* Принятое значение: Enter, уход из поля, кнопки счётчика; неверный ввод не уходит */
  onUpdate?: (value: string | number) => void
  /* Текст при каждом вводе */
  onInput?: (value: string) => void
}

/* ********************************************************** */
/* Интерфейс джойстика */
export interface IJoystickProps {
  id?: string
  wrapperClass?: string
  /* По умолчанию blue */
  accent?: AccentColor
  label?: { name?: string; class?: string }
  value?: number[]
  readonly?: boolean
  axes?: { name: string; minNum?: number; maxNum?: number }[]
  buttonIcon?: IconSource
  onUpdate?: (value: number[]) => void
}

/* ********************************************************** */
/* Интерфейс индикатора прогресса */
export interface IProgressBarProps {
  id?: string
  accent?: AccentColor
  /* accent полосы важнее общего */
  items?: { name?: string; accent?: AccentColor }[]
  value?: IReceivingDataObject[]
  number?: {
    minNum?: number
    maxNum?: number
    units?: string
  }
  type?: "horizontal" | "vertical"
  wrapperClass?: string
}

/* ********************************************************** */
/* Интерфейс элемента выбора и его опций */
/* Значение Select: при multiSelect - массив значений вариантов */
export type SelectValue<T, M extends boolean = false> = M extends true ? T[] : T

export interface ISelectProps<T = unknown, M extends boolean = false> {
  id?: string
  wrapperClass?: string
  componentClass?: string
  disabled?: boolean
  label?: { name?: string; class?: string }
  /* input - поле с подсказками: значение - выбранный вариант или введённый текст (число, если варианты числовые) */
  type?: "select" | "buttons" | "input"
  /* Только для type="buttons" */
  multiSelect?: M
  /* Для type="buttons": группа по ширине содержимого - все кнопки одинаковой ширины по самой длинной подписи, текст без переноса и обрезки */
  fitContent?: boolean
  listHeight?: string
  /* Значение варианта (option.value), не сам вариант */
  value?: SelectValue<T, M> | null
  options?: IOption<T>[]
  bitMode?: boolean
  range?: { start: number; end: number }
  /* Выбранное значение: выбор варианта, для type="input" - ещё Enter и уход из поля */
  onUpdate?: (value: SelectValue<T, M>) => void
  /* Только type="input": текст при каждом вводе */
  onInput?: (text: string) => void
}

export interface IOption<T = unknown> {
  /* Ключ варианта; без него - значение */
  id?: string
  value: T
  name?: string
  disabled?: boolean
  /* Цвет варианта: в type="buttons" вариант залит им всегда, у Switch - цвет бита */
  accent?: AccentColor
  /* Иконка варианта: SVG-разметка или короткая метка ("S", "XL"). В type="buttons" показывается вместо name, name - подсказка и aria-label */
  icon?: string
}

/* ********************************************************** */
/* Интерфейс ползунка */
export interface ISliderProps {
  id?: string
  wrapperClass?: string
  accent?: AccentColor
  label?: { name?: string; class?: string }
  value?: number | [number, number]
  type?: "single" | "range"
  number?: { minNum: number; maxNum: number; step: number }
  disabled?: boolean
  /* Принятое значение: бегунок отпущен, кнопки +/- */
  onUpdate?: (value: number | [number, number]) => void
  /* Значение во время перетаскивания */
  onInput?: (value: number | [number, number]) => void
}

/* ********************************************************** */
/* Интерфейс переключателя */
export interface ISwitchProps {
  id?: string
  height?: string
  wrapperClass?: string
  disabled?: boolean
  label?: {
    name?: string
    class?: string
    captionLeft?: string
    captionRight?: string
  }
  hiddenInfo?: string
  accent?: AccentColor
  /* Только bitMode: биты (value - номер бита, name - подпись, accent - цвет) */
  options?: IOption<number>[]
  bitMode?: boolean
  type?: "horizontal" | "vertical" | "checkbox"
  value?: number
  onUpdate?: (value: number) => void
}

/* ********************************************************** */
/* Интерфейсы таблицы */

export interface ITableText<T extends object> {
  key: keyof T
  /* Содержимое ячейки из строки; по умолчанию - значение по key (варианты списка - их имена, объект - JSON) */
  render?: (row: T) => string
  /* Ссылка из строки: содержимое ячейки выводится текстом внутри <a>, без HTML и санитайзера */
  href?: (row: T) => string
  /* Содержимое - готовый HTML (render или вызывающий сами экранируют данные); по умолчанию выводится как текст */
  html?: boolean
  sortable?: boolean
  truncated?: boolean
  tooltip?: boolean
  copy?: boolean
  /* Полный вид по нажатию: true - содержимое ячейки целиком с кнопкой копирования, сниппет - своё содержимое окна, аргумент - строка */
  modal?: boolean | Snippet<[T]>
  class?: string
}
export interface ITableSelect<T extends object> {
  key: keyof T
  keyCol: string
  onChange?: () => void
}
export interface ITableButton<T extends object> {
  name?: string | ((row: T) => string)
  icon?: ConstructorOfATypedSvelteComponent | string
  /* Подсказка при наведении - обязательна для кнопки-значка без name */
  title?: string | ((row: T) => string)
  class?: string | ((row: T) => string)
  eventHandler?: IUIComponentHandler
  onClick?: (row: T) => void
}
export interface ITableProgressBar<T extends object> {
  key: keyof T
  minNum?: number
  maxNum?: number
  units?: string
}
export interface ITableImage<T extends object> {
  src?: string | ((row: T) => string)
  alt?: string
  class?: string
  width?: string
  height?: string
  defaultIcon?: ConstructorOfATypedSvelteComponent | string
}

export type ITableContent<T extends object> =
  | { type: "text"; data: ITableText<T> }
  | { type: "select"; data: ITableSelect<T> }
  | { type: "button"; data: ITableButton<T> | ((row: T) => ITableButton<T>) }
  | { type: "progressBar"; data: ITableProgressBar<T> }
  | { type: "image"; data: ITableImage<T> }

export interface ITableHeader<T extends object> {
  label?: { name?: string; class?: string }
  width?: string
  align?: "left" | "center" | "right"
  disableSelect?: boolean
  content?: ITableContent<T>[] | ((row: T) => ITableContent<T>[])
}

export interface ITableProps<T extends object> {
  id?: string
  wrapperClass?: string
  /* Цвет шапки, кнопок без своего цвета и фокуса */
  accent?: AccentColor
  label?: { name?: string; class?: string }
  header?: ITableHeader<T>[]
  /* Строки обычной таблицы; журнал (dataBuffer.stashData) строки получает методом push() через bind:this */
  body?: T[]
  footer?: string
  /* Журнал: stashData - строки копятся в кольцевом буфере bufferSize (по умолчанию 10), высота - по visibleRows строкам, logger - новые сверху */
  dataBuffer?: { stashData?: boolean; bufferSize?: number; visibleRows?: number; clearButton?: boolean; clearClass?: string; logger?: boolean }
  outline?: boolean
  cursor?: string | null
  loader?: () => boolean
  autoscroll?: boolean
  getData?: () => void
  /* Нажатие кнопки строки без своего onClick: строка с выбранными в списках значениями и описание кнопки; пакет команды строит приложение */
  onClick?: (row: T, button: ITableButton<T>) => void
}

/* ********************************************************** */
/* Интерфейс меню */
export interface ITabsProps {
  id?: string
  wrapperClass?: string
  accent?: AccentColor
  size?: {
    height?: number
    width?: number
  }
  activeTab?: number
  /* id - стабильный идентификатор вкладки: по нему конструктор переносит содержимое вкладки при перестановке/удалении (содержимое привязано к номеру вкладки) */
  items: {
    id?: string
    name?: string
    icon?: IconSource
    class?: string
    children?: Snippet
    onClick?: () => void
    disabled?: boolean
  }[]
  children?: Snippet<[any]>
  apiArray?: UIComponent[]
  Components?: Snippet<[component: UIComponent, fixedHeight: boolean]>
}

/* ********************************************************** */
/* Интерфейс текста */
export interface ITextFieldProps {
  id?: string
  wrapperClass?: string
  /* Цвет текста; без него - обычный */
  accent?: AccentColor
  background?: boolean
  underline?: boolean
  content?: {
    name?: string
    class?: string
    size?: "small" | "base" | "large" | "huge" | "massive"
  }
}

/* ********************************************************** */
/* Интерфейс видео потока */
export interface IVideoViewerProps {
  id?: string
  wrapperClass?: string
  label?: { name?: string; class?: string }
  showSelect?: boolean
  /* "camera" - локальный getUserMedia (по умолчанию); "remote" - компонент только отображает кадры из пропа frame */
  source?: "camera" | "remote"
  /* Ключ потока для приложения/конструктора - самим компонентом не используется (WS не открывает) */
  streamKey?: string
  /* Последний полученный кадр в режиме remote - прокидывается родителем реактивно */
  frame?: Uint8Array | Blob | null
  status?: "connecting" | "live" | "offline" | "error"
  accent?: AccentColor
}

/* ********************************************************** */
/* Интерфейс виджета */
export interface IWidgetProps {
  id?: string
  wrapperClass?: string
  /* Цвет роли: иконка, переключатель, слайдер, фокус поля */
  accent?: AccentColor
  label?: { name?: string; class?: string }
  value?: number
  readonly?: boolean
  settings?: {
    label?: string
    type?: "input" | "switch" | "slider"
    number?: { minNum?: number; maxNum?: number; step?: number; units?: string }
    switch?: { captionLeft?: string; captionRight?: string }
  }
  icons?: { array: string[]; cycling?: boolean }
  /* Принятое значение */
  onUpdate?: (value: number) => void
  /* Значение слайдера во время перетаскивания */
  onInput?: (value: number) => void
}

export interface IWidgetWiFiProps {
  /* В отличие от примитивов id - не биндинг одной переменной, а префикс прошивочной группы (обычно "CFG"), с которой работает весь набор полей виджета разом (см. keys ниже) */
  id?: string
  wrapperClass?: string
  accent?: AccentColor
  label?: { name?: string }
  value?: Partial<IWidgetWiFiConfig>
  /* Переопределение имени поля устройства для каждого ключа IWidgetWiFiConfig - по умолчанию совпадает с именем самого ключа (WiFiMode, StaSSID, ...), меняется только если у прошивки другая конвенция именования */
  keys?: Partial<Record<keyof IWidgetWiFiConfig, string>>
  /* Команда сканирования сетей - по умолчанию Header: GET, Argument: APsList */
  scanCommand?: { header?: string; argument?: string }
  allowedModes?: number[]
  confirmOnAP?: boolean
  /* Свёрнут ли виджет по умолчанию - как isOpen у Accordion, задаётся в конструкторе и сохраняется в GUI, чтобы при входе на устройство все видели один и тот же задуманный вид интерфейса */
  collapsed?: boolean
  /* Уникальный ключ виджета (обычно ModSN + id компонента) - если задан, поверх дефолта ещё запоминается личный выбор пользователя в localStorage и переживает перезагрузку страницы */
  persistKey?: string
  onScan?: () => Promise<{ id: string; name: string; value: string }[]>
  onSave?: (config: IWidgetWiFiConfig) => void
}

export interface IWidgetDeviceInfoProps {
  /* Префикс прошивочной группы (обычно "CFG"), с которой работает весь набор полей виджета разом */
  id?: string
  wrapperClass?: string
  accent?: AccentColor
  label?: { name?: string }
  value?: Partial<IWidgetDeviceInfoConfig>
  /* Переопределение имени поля устройства для каждого ключа IWidgetDeviceInfoConfig - по умолчанию совпадает с именем самого ключа (DevSN, DevName, ...) */
  keys?: Partial<Record<keyof IWidgetDeviceInfoConfig, string>>
  /* Команда перезагрузки - по умолчанию Header: SET, Argument: Restart */
  restartCommand?: { header?: string; argument?: string }
  /* Команда сброса всех настроек к заводским (очистка NVS и перезагрузка) - по умолчанию Header: SET, Argument: RstNVS */
  resetCommand?: { header?: string; argument?: string }
  collapsed?: boolean
  persistKey?: string
  onSave?: (info: IWidgetDeviceInfoConfig) => void
  onRestart?: () => void
  /* Без колбэка кнопка «Сброс настроек» не показывается */
  onFactoryReset?: () => void
}

/* Состояние файловой системы - объект CFG.FS в том виде, в каком его отдаёт прошивка (FS_WriteState, ProdFactory-ESP) */
export interface IWidgetFileSystemFile {
  Name: string /* полный путь файла на устройстве - его же принимает SET FS {"Op": "Delete"} */
  Size: number /* байт */
}

export interface IWidgetFileSystemUpload {
  Name: string /* имя закачиваемого файла */
  Size: number /* байт */
  Progress: number /* 0..100, шаг 5% */
}

export interface IWidgetFileSystemInfo {
  Total: number /* байт */
  Used: number
  Free: number
  List: IWidgetFileSystemFile[]
  /* Есть только пока идёт закачка (с любого клиента) */
  Upload?: IWidgetFileSystemUpload
}

export interface IWidgetFileSystemProps {
  /* Префикс прошивочной группы (обычно "CFG"), в которой живёт объект FS */
  id?: string
  wrapperClass?: string
  accent?: AccentColor
  label?: { name?: string }
  value?: IWidgetFileSystemInfo
  /* Переопределение имени поля устройства - по умолчанию FS (итоговый ключ CFG.FS) */
  keys?: { FS?: string }
  /* Аргумент команд файловой системы - по умолчанию "FS": GET FS - снимок, SET FS {"Op": ...} - операции */
  argument?: string
  /* Какие файлы можно выбрать для закачки (атрибут accept), например ".bin, .txt, .pem" */
  accept?: string
  /* Максимальная длина имени файла - ограничение прошивки (LittleFS, upload_file.c), по умолчанию 31 */
  maxNameLength?: number
  collapsed?: boolean
  persistKey?: string
  onRefresh?: () => void
  onDelete?: (name: string) => void
  /* Скачивание файла (createFsTransfer, GUIRenderer): виджет только отдаёт имя и ждёт завершения */
  onDownload?: (name: string) => void | Promise<void>
  /* Закачка файла (createFsTransfer, GUIRenderer): виджет только отдаёт выбранный файл */
  onUpload?: (file: File) => void | Promise<void>
}

/* Снимок памяти и задач - объект StackInfo в том виде, в каком его отдают ProdFactory-ESP и ProdFactory-STM (API_GetStackInfo) */
export interface IWidgetStackInfoHeap {
  Name: string /* ESP: Internal и PSRAM (если есть), STM: Heap */
  Total: number /* байт */
  Free: number
  MinFree: number /* минимум свободного с момента старта */
}

export interface IWidgetStackInfoTask {
  Name: string
  FreeMin: number /* минимальный запас стека с момента создания задачи, байт */
  Prio: number
  Core?: number /* только ESP: ядро привязки, -1 - без привязки */
  State: number /* eTaskState: 0 Running, 1 Ready, 2 Blocked, 3 Suspended, 4 Deleted */
  CPU?: number /* загрузка задачи, % одного ядра с прошлого ответа (с запуска - в первом ответе) */
}

export interface IWidgetStackInfo {
  Heap: IWidgetStackInfoHeap[]
  Tasks: IWidgetStackInfoTask[]
}

export interface IWidgetStackInfoProps {
  id?: string
  wrapperClass?: string
  accent?: AccentColor
  label?: { name?: string }
  value?: IWidgetStackInfo
  /* Переопределение имени объекта в ответе - по умолчанию StackInfo */
  keys?: { StackInfo?: string }
  /* Аргумент запроса - по умолчанию "StackInfo" (GET StackInfo) */
  argument?: string
  /* Запас стека ниже порога (байт) подсвечивается красным, ниже удвоенного - оранжевым */
  warnBytes?: number
  /* Период автоопроса, мс; 0 - только по кнопке */
  period?: number
  collapsed?: boolean
  persistKey?: string
  onRefresh?: () => void
}

export interface IWidgetRGBStripProps {
  /* Префикс прошивочной группы ленты, по умолчанию "LST" */
  id?: string
  wrapperClass?: string
  accent?: AccentColor
  label?: { name?: string }
  value?: Partial<IWidgetRGBStripConfig>
  /* Переопределение имён полей устройства, по умолчанию совпадают с ключами IWidgetRGBStripConfig */
  keys?: Partial<Record<keyof IWidgetRGBStripConfig, string>>
  collapsed?: boolean
  persistKey?: string
  /* Цвет, эффект, скорость - отправляются сразу */
  onUpdate?: (value: number | number[], field: "Color" | "Effect" | "Speed") => void
  /* Количество, модель, порядок - одним пакетом по «Сохранить» (лента перезапускается) */
  onSave?: (hardware: Pick<IWidgetRGBStripConfig, "Count" | "Model" | "Order">) => void
}

/* Границы для цветовых зон; не заданная граница не рисуется */
export interface IWidgetPFDLimits {
  speedMin?: number /* м/с - ниже красная зона на ленте скорости */
  speedMax?: number /* м/с - выше красная зона */
  bankMax?: number /* ° - за пределом дуга крена красная */
  altMax?: number /* м - выше красная зона на ленте высоты */
  gMin?: number /* g - ниже перегрузка красная */
  gMax?: number /* g - выше перегрузка красная */
  battLow?: number /* % - ниже батарея подсвечивается */
  staleMs?: number /* мс без новых данных - флаг «нет данных», по умолчанию 2000 */
}

export interface IWidgetPFDProps {
  /* Префикс группы полей, по умолчанию "MAV" */
  id?: string
  wrapperClass?: string
  accent?: AccentColor
  label?: { name?: string }
  value?: Partial<IWidgetPFDData>
  keys?: Partial<Record<keyof IWidgetPFDData, string>>
  limits?: IWidgetPFDLimits
  /* Режим имитации: полёт по маршруту вместо данных устройства, value и id не учитываются */
  isTest?: boolean
  collapsed?: boolean
  persistKey?: string
}

export interface IWidgetMapProps {
  id?: string
  wrapperClass?: string
  accent?: AccentColor
  label?: { name?: string }
  /* Префиксы групп полей - каждая группа отдельный борт (маркер и траектория), по умолчанию ["MAV"] */
  groups?: string[]
  /* Значения по группам: { MAV: { Lat, Lon, ... }, GNSS: {...} } */
  value?: Record<string, Partial<IWidgetMapData>>
  keys?: Partial<Record<keyof IWidgetMapData, string>>
  /* Высота карты, px */
  height?: number
  markerIcon?: IconSource
  /* Начальные значения переключателей оператора поверх карты */
  trackEnabled?: boolean
  trackLength?: number
  markerTimeout?: number
  /* Режим имитации: два объекта летают по маршруту, value и groups не учитываются */
  isTest?: boolean
  collapsed?: boolean
  persistKey?: string
  /* objects - карта объектов, route - планировщик миссии из точек, agro - генератор миссии для агродрона; аппараты из групп рисуются во всех режимах */
  mode?: "objects" | "route" | "agro"
  /* План миссии; без него - демо-поле из DEFAULT_MISSION_PLAN. Можно связать через bind: */
  plan?: IMissionPlan
  onPlanChange?: (plan: IMissionPlan) => void
  /* Маршрут режима route; без него - демо-облёт из DEFAULT_ROUTE_PLAN. Можно связать через bind: */
  route?: IRoutePlan
  onRouteChange?: (route: IRoutePlan) => void
  /* Отправка миссии (текст QGC WPL 110) на борт; без обработчика кнопка «Отправить» неактивна */
  onSend?: (mission: string, plan: IMissionPlan | IRoutePlan) => void | Promise<void>
}
