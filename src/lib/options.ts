import { derived } from "svelte/store"
import { T } from "./locales/i18n"
import { PROPS_ICONS } from "./libIcons/propsIcons"
import { ACCENT_COLORS, type AccentColor } from "./accent"
import { DEFAULT_ARGUMENT_CODES } from "./dictionaries/generated/commands"

/* Аргумент команды в конструкторе: только имя команды устройства из мастер-словаря (коды 1..4095, без команд облака 7000..7999) или служебный NoSend; в провод имя уходит кодом в HAR. Предел длины поля ввода - 31 знак */
export const ARGUMENT_MAX_LENGTH = 31
export const ARGUMENT_REGEXP = new RegExp(
  `^(${[
    ...Object.entries(DEFAULT_ARGUMENT_CODES)
      .filter(([, code]) => code > 0 && code < 4096)
      .map(([name]) => name),
    "NoSend",
  ].join("|")})$`,
)

/* Вариант со стабильным id по значению: id не меняется при смене языка */
const opt = <const V>(value: V, name?: string, icon?: string) => ({ id: String(value), value, name, icon })

export const optionsStore = derived(T, ($T) => {
  return {
    /* Палитра ролей темы, порядок по кругу тонов, серый первым. Повторное нажатие на выбранный цвет снимает его: компонент берёт цвет родителя или темы */
    ACCENT_OPTIONS: ACCENT_COLORS.map((accent) => ({ ...opt(accent, ""), accent })),

    /* Поля eventHandler - строки */
    HEADER_OPTIONS: ["GET", "SET", "OK!", "ER!"].map((header) => opt<string>(header, header)),

    SHORT_ARGUMENT_OPTION: [opt<string>("ModCfg", $T("constructor.props.action.save")), opt<string>("NoSend", $T("constructor.props.action.nosend"))],

    ACCESS_OPTION: [
      opt("full", $T("constructor.props.type.full")),
      opt("viewOnly", $T("constructor.props.type.viewOnly")),
      opt("hidden", $T("constructor.props.type.hidden")),
    ],

    INPUT_TYPE_OPTIONS: [
      opt("text", $T("constructor.props.type.text"), "Aa"),
      opt("password", $T("constructor.props.type.password"), "•••"),
      opt("number", $T("constructor.props.type.number"), "123"),
      opt("text-area", $T("constructor.props.type.textarea"), "¶"),
      opt("bitMode", $T("constructor.props.type.bitMode"), "01"),
    ],

    SELECT_TYPE_OPTIONS: [
      opt("select", $T("constructor.props.type.select")),
      opt("buttons", $T("constructor.props.type.buttons")),
      opt("input", $T("constructor.props.type.selectput")),
      opt("radio", $T("constructor.props.type.radio")),
    ],

    SELECT_VALUE_TYPE_OPTIONS: [opt("text", $T("constructor.props.valuetype.text")), opt("number", $T("constructor.props.valuetype.number"))],

    SLIDER_TYPE_OPTIONS: [
      opt("single", $T("constructor.props.type.single"), PROPS_ICONS.sliderSingle),
      opt("range", $T("constructor.props.type.range"), PROPS_ICONS.sliderRange),
    ],

    TEXTFIELD_SIZE_OPTIONS: [
      opt("small", $T("constructor.props.type.small"), "S"),
      opt("base", $T("constructor.props.type.base"), "M"),
      opt("large", $T("constructor.props.type.large"), "L"),
      opt("huge", $T("constructor.props.type.huge"), "XL"),
      opt("massive", $T("constructor.props.type.massive"), "XXL"),
    ],

    TEXTFIELD_SETTINGS_OPTIONS: [
      opt("bold", $T("constructor.props.bold"), PROPS_ICONS.bold),
      opt("italic", $T("constructor.props.italic"), PROPS_ICONS.italic),
      opt("underline", $T("constructor.props.underline"), PROPS_ICONS.underline),
      opt("background", $T("constructor.props.background"), PROPS_ICONS.highlight),
    ],

    TEXT_ALIGN_OPTIONS: [
      opt("text-left", $T("constructor.props.align.left"), PROPS_ICONS.alignLeft),
      opt("text-center", $T("constructor.props.align.center"), PROPS_ICONS.alignCenter),
      opt("text-right", $T("constructor.props.align.right"), PROPS_ICONS.alignRight),
      opt("text-justify", $T("constructor.props.align.justify"), PROPS_ICONS.alignJustify),
    ],

    ALIGN_OPTIONS: [
      opt("left", $T("constructor.props.align.left"), PROPS_ICONS.alignLeft),
      opt("center", $T("constructor.props.align.center"), PROPS_ICONS.alignCenter),
      opt("right", $T("constructor.props.align.right"), PROPS_ICONS.alignRight),
    ],

    JUSTIFY_ALIGN_OPTIONS: [
      opt("justify-start", $T("constructor.props.align.left"), PROPS_ICONS.alignLeft),
      opt("justify-center", $T("constructor.props.align.center"), PROPS_ICONS.alignCenter),
      opt("justify-end", $T("constructor.props.align.right"), PROPS_ICONS.alignRight),
    ],

    ICON_TEXT_POSITION_OPTIONS: [
      opt("flex-row", $T("constructor.props.iconpos.left"), PROPS_ICONS.arrowLeft),
      opt("flex-col", $T("constructor.props.iconpos.top"), PROPS_ICONS.arrowUp),
      opt("flex-row-reverse", $T("constructor.props.iconpos.right"), PROPS_ICONS.arrowRight),
      opt("flex-col-reverse", $T("constructor.props.iconpos.bottom"), PROPS_ICONS.arrowDown),
    ],

    TABLE_TEXT_SETTING_OPTIONS: [
      opt("sortable", $T("constructor.props.table.columns.sortable"), PROPS_ICONS.sort),
      opt("copy", $T("constructor.props.copy"), PROPS_ICONS.copy),
      opt("truncated", $T("constructor.props.table.columns.truncated"), PROPS_ICONS.ellipsis),
      opt("tooltip", $T("constructor.props.table.columns.tooltip"), PROPS_ICONS.tooltip),
      opt("modal", $T("constructor.props.table.columns.modal"), PROPS_ICONS.modal),
    ],

    HEIGHT_OPTIONS: [
      opt("py-1", $T("constructor.props.height.small"), "S"),
      opt("py-2", $T("constructor.props.height.medium"), "M"),
      opt("py-3", $T("constructor.props.height.large"), "L"),
    ],

    FILE_ATTACH_TYPE_OPTIONS: [
      opt("file", $T("constructor.props.type.file"), PROPS_ICONS.file),
      opt("image", $T("constructor.props.type.image"), PROPS_ICONS.image),
    ],

    DIVIDER_TYPE_OPTIONS: [
      opt("line", $T("constructor.props.divider.type.line"), PROPS_ICONS.dividerLine),
      opt("empty", $T("constructor.props.divider.type.empty"), PROPS_ICONS.dividerSpace),
    ],

    ORIENTATION_OPTIONS: [
      opt("horizontal", $T("constructor.props.orientation.horizontal"), PROPS_ICONS.arrowRight),
      opt("vertical", $T("constructor.props.orientation.vertical"), PROPS_ICONS.arrowDown),
    ],

    /* Привязка вертикального разделителя: те же значения anchor, что у горизонтального (top - слева, bottom - справа) */
    DIVIDER_ANCHOR_VERTICAL_OPTIONS: [
      opt("top", $T("constructor.props.align.left"), PROPS_ICONS.alignLeft),
      opt("center", $T("constructor.props.align.center"), PROPS_ICONS.alignCenter),
      opt("bottom", $T("constructor.props.align.right"), PROPS_ICONS.alignRight),
    ],

    DIVIDER_ANCHOR_OPTIONS: [
      opt("top", $T("constructor.props.divider.anchor.top"), PROPS_ICONS.anchorTop),
      opt("center", $T("constructor.props.divider.anchor.center"), PROPS_ICONS.anchorCenter),
      opt("bottom", $T("constructor.props.divider.anchor.bottom"), PROPS_ICONS.anchorBottom),
    ],

    FITMODE_OPTIONS: [
      opt("cover", $T("constructor.props.type.cover"), PROPS_ICONS.fitCover),
      opt("contain", $T("constructor.props.type.contain"), PROPS_ICONS.fitContain),
    ],

    SWITCH_OPTIONS: [
      opt("horizontal", $T("constructor.props.type.horizontal"), PROPS_ICONS.toggleHorizontal),
      opt("vertical", $T("constructor.props.type.vertical"), PROPS_ICONS.toggleVertical),
      opt("checkbox", $T("constructor.props.type.checkbox"), PROPS_ICONS.checkbox),
    ],

    INFO_SIDE_OPTIONS: [
      opt("top", $T("constructor.props.info.top"), PROPS_ICONS.arrowUp),
      opt("bottom", $T("constructor.props.info.bottom"), PROPS_ICONS.arrowDown),
      opt("left", $T("constructor.props.info.left"), PROPS_ICONS.arrowLeft),
      opt("right", $T("constructor.props.info.right"), PROPS_ICONS.arrowRight),
    ],

    FORM_OPTIONS: [
      opt("square", $T("constructor.props.type.square"), PROPS_ICONS.square),
      opt("circle", $T("constructor.props.type.circle"), PROPS_ICONS.circle),
    ],

    TABLE_CONTENT_TYPE_OPTIONS: [
      opt("text", $T("constructor.props.table.type.text")),
      opt("select", $T("constructor.props.table.type.select")),
      opt("button", $T("constructor.props.table.type.button")),
      opt("progressBar", $T("constructor.props.table.type.progressbar")),
      opt("image", $T("constructor.props.table.type.icon")),
    ],

    INPUT_SETTING_OPTIONS: [
      opt("readonly", $T("constructor.props.readonly"), PROPS_ICONS.lock),
      opt("help.copyButton", $T("constructor.props.copy"), PROPS_ICONS.copy),
    ],

    BUFFER_SIZE_OPTIONS: [opt(10, "10"), opt(50, "50"), opt(100, "100"), opt(500, "500"), opt(1000, "1000")],

    VISIBLE_ROWS_OPTIONS: [opt(5, "5"), opt(10, "10"), opt(20, "20")],

    WIDGET_TYPE_OPTIONS: [
      opt("input", $T("constructor.props.input")),
      opt("slider", $T("constructor.props.slider")),
      opt("switch", $T("constructor.props.switch")),
    ],

    INPUT_REGEXP_OPTIONS: [
      opt("/^[0-9a-z]{0,10}$/", $T("constructor.props.regexp.latin10")),
      opt("/^[а-яА-яЁё]{0,10}$/", $T("constructor.props.regexp.kiril10")),
      opt("/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/", $T("constructor.props.regexp.ipv4")),
      opt("/((^|:)([0-9a-fA-F]{0,4})){1,8}$/", $T("constructor.props.regexp.ipv6")),
      opt("/^(0[1-9]|[12][0-9]|3[01])[.](0[1-9]|1[012])[.](19|20)\\d\\d$/", $T("constructor.props.regexp.date")),
      opt("/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/", $T("constructor.props.regexp.time")),
      opt("/^[a-zA-Z0-9.!#$%&'*+/=?^_{|}~-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)+$/", $T("constructor.props.regexp.email")),
      opt("/^https?:\\/\\/[\\w.-]+(?:\\.[a-zA-Z]{2,})+(?:[/?#]\\S*)?$/", $T("constructor.props.regexp.url")),
      opt("/^-?\\d+(\\.\\d+)?$/", $T("constructor.props.regexp.numbers")),
      opt("/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/", $T("constructor.props.regexp.colorhex")),
      opt("/^[0-9A-F]{0,4}$/", $T("constructor.props.regexp.devid")),
      opt("/^[0-9a-fA-F]{4}-[0-9a-fA-F]{24}[:][0-9a-fA-F]{2}$|^$/", $T("constructor.props.regexp.serialnum")),
      opt("/^(\\+7|8)[\\s-]?\\(?\\d{3}\\)?[\\s-]?\\d{3}[\\s-]?\\d{2}[\\s-]?\\d{2}$/", $T("constructor.props.regexp.phone")),
      opt("/^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/", $T("constructor.props.regexp.mac")),
      opt("/^[a-zA-Z0-9_]{3,16}$/", $T("constructor.props.regexp.username")),
      opt("/^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d!@#$%^&*]{8,}$/", $T("constructor.props.regexp.password")),
    ],

    AUTOCOMPLETE_CONSTRUCTOR_OPTIONS: [
      opt("on", $T("constructor.props.autocomplete.on")),
      opt("off", $T("constructor.props.autocomplete.off")),
      opt("given-name", $T("constructor.props.autocomplete.given-name")),
      opt("family-name", $T("constructor.props.autocomplete.family-name")),
      opt("nickname", $T("constructor.props.autocomplete.nickname")),
      opt("username", $T("constructor.props.autocomplete.username")),
      opt("new-password", $T("constructor.props.autocomplete.new-password")),
      opt("current-password", $T("constructor.props.autocomplete.current-password")),
      opt("organization-title", $T("constructor.props.autocomplete.organization-title")),
      opt("country-name", $T("constructor.props.autocomplete.country-name")),
      opt("address-level1", $T("constructor.props.autocomplete.address-level1")),
      opt("address-level2", $T("constructor.props.autocomplete.address-level2")),
      opt("street-address", $T("constructor.props.autocomplete.street-address")),
      opt("postal-code", $T("constructor.props.autocomplete.postal-code")),
      opt("email", $T("constructor.props.autocomplete.email")),
      opt("tel", $T("constructor.props.autocomplete.tel")),
    ],
  }
})
