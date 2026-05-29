// $lib/ElementsUI/options.ts
import { derived } from "svelte/store"
import { T } from "./locales/i18n"

function id() {
  return crypto.randomUUID() as string
}

export const optionsStore = derived(T, ($T) => {
  return {
    HEADER_OPTIONS: [
      { id: id(), name: "GET", value: "GET" },
      { id: id(), name: "SET", value: "SET" },
      { id: id(), name: "OK!", value: "OK!" },
      { id: id(), name: "ER!", value: "ER!" },
    ],

    SHORT_ARGUMENT_OPTION: [
      { id: id(), value: "NoSave", name: $T("constructor.props.action.update") },
      { id: id(), value: "Save", name: $T("constructor.props.action.save") },
      { id: id(), value: "NoSend", name: $T("constructor.props.action.nosend") },
    ],

    FULL_ARGUMENT_OPTION: [
      { id: id(), value: "NoSave", name: $T("constructor.props.action.update") },
      { id: id(), value: "Save", name: $T("constructor.props.action.save") },
      { id: id(), value: "", name: $T("constructor.props.action.custom") },
    ],

    ACCESS_OPTION: [
      { id: id(), value: "full", name: $T("constructor.props.type.full") },
      { id: id(), value: "viewOnly", name: $T("constructor.props.type.viewOnly") },
      { id: id(), value: "hidden", name: $T("constructor.props.type.hidden") },
    ],

    INPUT_TYPE_OPTIONS: [
      { id: id(), value: "text", name: $T("constructor.props.type.text") },
      { id: id(), value: "password", name: $T("constructor.props.type.password") },
      { id: id(), value: "number", name: $T("constructor.props.type.number") },
      { id: id(), value: "text-area", name: $T("constructor.props.type.textarea") },
      { id: id(), value: "bitMode", name: $T("constructor.props.type.bitMode") },
    ],

    SELECT_TYPE_OPTIONS: [
      { id: id(), value: "select", name: $T("constructor.props.type.select") },
      { id: id(), value: "buttons", name: $T("constructor.props.type.buttons") },
      { id: id(), value: "input", name: $T("constructor.props.type.selectput") },
    ],

    SELECT_VALUE_TYPE_OPTIONS: [
      { id: id(), value: "text" as const, name: $T("constructor.props.valuetype.text") },
      { id: id(), value: "number" as const, name: $T("constructor.props.valuetype.number") },
    ],

    SLIDER_TYPE_OPTIONS: [
      { id: id(), value: "single", name: $T("constructor.props.type.single") },
      { id: id(), value: "range", name: $T("constructor.props.type.range") },
    ],

    TEXTFIELD_SIZE_OPTIONS: [
      { id: id(), value: "small", name: $T("constructor.props.type.small") },
      { id: id(), value: "base", name: $T("constructor.props.type.base") },
      { id: id(), value: "large", name: $T("constructor.props.type.large") },
      { id: id(), value: "huge", name: $T("constructor.props.type.huge") },
      { id: id(), value: "massive", name: $T("constructor.props.type.massive") },
    ],

    TEXTFIELD_SETTINGS_OPTIONS: [
      { id: id(), value: "bold", name: $T("constructor.props.bold") },
      { id: id(), value: "italic", name: $T("constructor.props.italic") },
      { id: id(), value: "background", name: $T("constructor.props.background") },
    ],

    COLOR_OPTIONS: [
      { id: id(), name: "", value: "bg-max", class: "bg-max" },
      { id: id(), name: "", value: "bg-red", class: "bg-red" },
      { id: id(), name: "", value: "bg-yellow", class: "bg-yellow" },
      { id: id(), name: "", value: "bg-green", class: "bg-green" },
      { id: id(), name: "-", value: "bg-blue", class: "bg-blue text-transparent" },
      { id: id(), name: "", value: "bg-purple", class: "bg-purple" },
      { id: id(), name: "", value: "bg-gray", class: "bg-gray" },
    ],

    TEXT_COLOR_OPTIONS: [
      {
        id: "TEXT_COLOR_SHADOW",
        name: "-",
        value: "text-[#333] dark:text-[#e2e3e7]",
        class: "bg-[var(--shadow-color)] dark:bg-[#e2e3e7] border-[var(--shadow-color)] dark:border-[#e2e3e7] text-transparent",
      },
      { id: "TEXT_COLOR_RED", name: "", value: "text-red-500 dark:text-red-400", class: "bg-red-500 dark:bg-red-400 border-red-500 dark:border-red-400" },
      {
        id: "TEXT_COLOR_YELLOW",
        name: "",
        value: "text-yellow-500 dark:text-yellow-400",
        class: "bg-yellow-500 dark:bg-yellow-400 border-yellow-500 dark:border-yellow-400",
      },
      {
        id: "TEXT_COLOR_GREEN",
        name: "",
        value: "text-green-500 dark:text-green-400",
        class: "bg-green-500 dark:bg-green-400 border-green-500 dark:border-green-400",
      },
      {
        id: "TEXT_COLOR_BLUE",
        name: "",
        value: "text-blue-500 dark:text-blue-400",
        class: "bg-blue-500 dark:bg-blue-400 border-blue-500 dark:border-blue-400",
      },
      {
        id: "TEXT_COLOR_PURPLE",
        name: "",
        value: "text-purple-500 dark:text-purple-400",
        class: "bg-purple-500 dark:bg-purple-400 border-purple-500 dark:border-purple-400",
      },
      {
        id: "TEXT_COLOR_GRAY",
        name: "",
        value: "text-gray-500 dark:text-gray-400",
        class: "bg-gray-500 dark:bg-gray-400 border-gray-500 dark:border-gray-400",
      },
    ],

    TEXT_ALIGN_OPTIONS: [
      { id: id(), value: "text-left", name: $T("constructor.props.align.left") },
      { id: id(), value: "text-center", name: $T("constructor.props.align.center") },
      { id: id(), value: "text-right", name: $T("constructor.props.align.right") },
      { id: id(), value: "text-justify", name: $T("constructor.props.align.justify") },
    ],

    ALIGN_OPTIONS: [
      { id: id(), value: "left", name: $T("constructor.props.align.left") },
      { id: id(), value: "center", name: $T("constructor.props.align.center") },
      { id: id(), value: "right", name: $T("constructor.props.align.right") },
    ],

    JUSTIFY_ALIGN_OPTIONS: [
      { id: id(), value: "justify-start", name: $T("constructor.props.align.left") },
      { id: id(), value: "justify-center", name: $T("constructor.props.align.center") },
      { id: id(), value: "justify-end", name: $T("constructor.props.align.right") },
    ],

    ICON_TEXT_POSITION_OPTIONS: [
      { id: id(), value: "flex-row", name: "←" },
      { id: id(), value: "flex-col", name: "↑" },
      { id: id(), value: "flex-row-reverse", name: "→" },
      { id: id(), value: "flex-col-reverse", name: "↓" },
    ],

    TABLE_TEXT_SETTING_OPTIONS: [
      { id: id(), value: "sortable", name: $T("constructor.props.table.columns.sortable") },
      { id: id(), value: "copy", name: $T("constructor.props.copy") },
      { id: id(), value: "truncated", name: $T("constructor.props.table.columns.truncated") },
      { id: id(), value: "tooltip", name: $T("constructor.props.table.columns.tooltip") },
      { id: id(), value: "modal", name: $T("constructor.props.table.columns.modal") },
    ],

    HEIGHT_OPTIONS: [
      { id: id(), value: "py-1", name: $T("constructor.props.height.small") },
      { id: id(), value: "py-2", name: $T("constructor.props.height.medium") },
      { id: id(), value: "py-3", name: $T("constructor.props.height.large") },
    ],

    ACCORDION_TYPE_OPTIONS: [
      { id: id(), value: false, name: $T("constructor.props.type.main") },
      { id: id(), value: true, name: $T("constructor.props.type.sub") },
    ],

    FILE_ATTACH_TYPE_OPTIONS: [
      { id: id(), value: "file", name: $T("constructor.props.type.file") },
      { id: id(), value: "image", name: $T("constructor.props.type.image") },
    ],

    FITMODE_OPTIONS: [
      { id: id(), value: "cover", name: $T("constructor.props.type.cover") },
      { id: id(), value: "contain", name: $T("constructor.props.type.contain") },
    ],

    SWITCH_OPTIONS: [
      { id: id(), value: "horizontal", name: $T("constructor.props.type.horizontal") },
      { id: id(), value: "vertical", name: $T("constructor.props.type.vertical") },
      { id: id(), value: "checkbox", name: $T("constructor.props.type.checkbox") },
    ],

    INFO_SIDE_OPTIONS: [
      { id: id(), value: "top", name: $T("constructor.props.info.top") },
      { id: id(), value: "bottom", name: $T("constructor.props.info.bottom") },
      { id: id(), value: "left", name: $T("constructor.props.info.left") },
      { id: id(), value: "right", name: $T("constructor.props.info.right") },
    ],

    FORM_OPTIONS: [
      { id: id(), value: "square", name: $T("constructor.props.type.square") },
      { id: id(), value: "circle", name: $T("constructor.props.type.circle") },
    ],

    TABLE_TYPE_OPTIONS: [
      { id: id(), value: "table", name: $T("constructor.props.table.type.table") },
      { id: id(), value: "logger", name: $T("constructor.props.table.type.logger") },
    ],

    TABLE_CONTENT_TYPE_OPTIONS: [
      { id: id(), value: "text", name: $T("constructor.props.table.type.text") },
      { id: id(), value: "select", name: $T("constructor.props.table.type.select") },
      { id: id(), value: "button", name: $T("constructor.props.table.type.button") },
      { id: id(), value: "progressBar", name: $T("constructor.props.table.type.progressbar") },
      { id: id(), value: "image", name: $T("constructor.props.table.type.icon") },
    ],

    INPUT_SETTING_OPTIONS: [
      { id: id(), value: "readonly", name: $T("constructor.props.readonly") },
      { id: id(), value: "help.copyButton", name: $T("constructor.props.copy") },
    ],

    BUFFER_SIZE_OPTIONS: [
      { id: id(), value: 10, name: "10" },
      { id: id(), value: 50, name: "50" },
      { id: id(), value: 100, name: "100" },
      { id: id(), value: 500, name: "500" },
      { id: id(), value: 1000, name: "1000" },
    ],

    VISIBLE_ROWS_OPTIONS: [
      { id: id(), value: 5, name: "5" },
      { id: id(), value: 10, name: "10" },
      { id: id(), value: 20, name: "20" },
    ],

    WIDGET_TYPE_OPTIONS: [
      { id: id(), value: "input", name: $T("constructor.props.input") },
      { id: id(), value: "slider", name: $T("constructor.props.slider") },
      { id: id(), value: "switch", name: $T("constructor.props.switch") },
    ],

    INPUT_REGEXP_OPTIONS: [
      { id: id(), value: "/^[0-9a-z]{0,10}$/", name: $T("constructor.props.regexp.latin10") },
      { id: id(), value: "/^[а-яА-яЁё]{0,10}$/", name: $T("constructor.props.regexp.kiril10") },
      {
        id: id(),
        value: "/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/",
        name: $T("constructor.props.regexp.ipv4"),
      },
      { id: id(), value: "/((^|:)([0-9a-fA-F]{0,4})){1,8}$/", name: $T("constructor.props.regexp.ipv6") },
      { id: id(), value: "/(0[1-9]|[12][0-9]|3[01])[.](0[1-9]|1[012])[.](19|20)\\d\\d/", name: $T("constructor.props.regexp.date") },
      { id: id(), value: "/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/", name: $T("constructor.props.regexp.time") },
      { id: id(), value: "/^[a-zA-Z0-9.!#$%&'*+/=?^_{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)\\*$/", name: $T("constructor.props.regexp.email") },
      { id: id(), value: "/(https?):((//)|(\\\\))+[\\w\\d:#@%/$()~_?\\+-=\\\\\\.&]*/", name: $T("constructor.props.regexp.url") },
      { id: id(), value: "/^-?\\d+(\\.\\d+)?$/", name: $T("constructor.props.regexp.numbers") },
      { id: id(), value: "/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/", name: $T("constructor.props.regexp.colorhex") },
      { id: id(), value: "/^[0-9A-F]{0,4}$/", name: $T("constructor.props.regexp.devid") },
      { id: id(), value: "/^[0-9a-fA-F]{4}-[0-9a-fA-F]{24}[:][0-9a-fA-F]{2}$|^$/", name: $T("constructor.props.regexp.serialnum") },
    ],

    AUTOCOMPLETE_CONSTRUCTOR_OPTIONS: [
      { id: id(), value: "on", name: $T("constructor.props.autocomplete.on") },
      { id: id(), value: "off", name: $T("constructor.props.autocomplete.off") },
      { id: id(), value: "given-name", name: $T("constructor.props.autocomplete.given-name") },
      { id: id(), value: "family-name", name: $T("constructor.props.autocomplete.family-name") },
      { id: id(), value: "nickname", name: $T("constructor.props.autocomplete.nickname") },
      { id: id(), value: "username", name: $T("constructor.props.autocomplete.username") },
      { id: id(), value: "new-password", name: $T("constructor.props.autocomplete.new-password") },
      { id: id(), value: "current-password", name: $T("constructor.props.autocomplete.current-password") },
      { id: id(), value: "organization-title", name: $T("constructor.props.autocomplete.organization-title") },
      { id: id(), value: "country-name", name: $T("constructor.props.autocomplete.country-name") },
      { id: id(), value: "address-level1", name: $T("constructor.props.autocomplete.address-level1") },
      { id: id(), value: "address-level2", name: $T("constructor.props.autocomplete.address-level2") },
      { id: id(), value: "street-address", name: $T("constructor.props.autocomplete.street-address") },
      { id: id(), value: "postal-code", name: $T("constructor.props.autocomplete.postal-code") },
      { id: id(), value: "email", name: $T("constructor.props.autocomplete.email") },
      { id: id(), value: "tel", name: $T("constructor.props.autocomplete.tel") },
    ],

    AUTOCOMPLETE_OPTIONS: [
      // Основные значения
      { id: id(), value: "on", name: $T("constructor.props.autocomplete.on") },
      { id: id(), value: "off", name: $T("constructor.props.autocomplete.off") },
      // Имя и фамилия
      { id: id(), value: "name", name: $T("constructor.props.autocomplete.name") },
      { id: id(), value: "honorific-prefix", name: $T("constructor.props.autocomplete.honorific-prefix") },
      { id: id(), value: "given-name", name: $T("constructor.props.autocomplete.given-name") },
      { id: id(), value: "additional-name", name: $T("constructor.props.autocomplete.additional-name") },
      { id: id(), value: "family-name", name: $T("constructor.props.autocomplete.family-name") },
      { id: id(), value: "honorific-suffix", name: $T("constructor.props.autocomplete.honorific-suffix") },
      { id: id(), value: "nickname", name: $T("constructor.props.autocomplete.nickname") },

      // Пользовательская информация
      { id: id(), value: "username", name: $T("constructor.props.autocomplete.username") },
      { id: id(), value: "new-password", name: $T("constructor.props.autocomplete.new-password") },
      { id: id(), value: "current-password", name: $T("constructor.props.autocomplete.current-password") },
      { id: id(), value: "one-time-code", name: $T("constructor.props.autocomplete.one-time-code") },

      // Организация
      { id: id(), value: "organization-title", name: $T("constructor.props.autocomplete.organization-title") },
      { id: id(), value: "organization", name: $T("constructor.props.autocomplete.organization") },

      // Адрес
      { id: id(), value: "street-address", name: $T("constructor.props.autocomplete.street-address") },
      { id: id(), value: "address-line1", name: $T("constructor.props.autocomplete.address-line1") },
      { id: id(), value: "address-line2", name: $T("constructor.props.autocomplete.address-line2") },
      { id: id(), value: "address-line3", name: $T("constructor.props.autocomplete.address-line3") },
      { id: id(), value: "address-level4", name: $T("constructor.props.autocomplete.address-level4") },
      { id: id(), value: "address-level3", name: $T("constructor.props.autocomplete.address-level3") },
      { id: id(), value: "address-level2", name: $T("constructor.props.autocomplete.address-level2") },
      { id: id(), value: "address-level1", name: $T("constructor.props.autocomplete.address-level1") },
      { id: id(), value: "country", name: $T("constructor.props.autocomplete.country") },
      { id: id(), value: "country-name", name: $T("constructor.props.autocomplete.country-name") },
      { id: id(), value: "postal-code", name: $T("constructor.props.autocomplete.postal-code") },

      // Контактная информация
      { id: id(), value: "cc-name", name: $T("constructor.props.autocomplete.cc-name") },
      { id: id(), value: "cc-given-name", name: $T("constructor.props.autocomplete.cc-given-name") },
      { id: id(), value: "cc-additional-name", name: $T("constructor.props.autocomplete.cc-additional-name") },
      { id: id(), value: "cc-family-name", name: $T("constructor.props.autocomplete.cc-family-name") },
      { id: id(), value: "cc-number", name: $T("constructor.props.autocomplete.cc-number") },
      { id: id(), value: "cc-exp", name: $T("constructor.props.autocomplete.cc-exp") },
      { id: id(), value: "cc-exp-month", name: $T("constructor.props.autocomplete.cc-exp-month") },
      { id: id(), value: "cc-exp-year", name: $T("constructor.props.autocomplete.cc-exp-year") },
      { id: id(), value: "cc-csc", name: $T("constructor.props.autocomplete.cc-csc") },
      { id: id(), value: "cc-type", name: $T("constructor.props.autocomplete.cc-type") },

      // Контакт
      { id: id(), value: "transaction-currency", name: $T("constructor.props.autocomplete.transaction-currency") },
      { id: id(), value: "transaction-amount", name: $T("constructor.props.autocomplete.transaction-amount") },
      { id: id(), value: "language", name: $T("constructor.props.autocomplete.language") },
      { id: id(), value: "bday", name: $T("constructor.props.autocomplete.bday") },
      { id: id(), value: "bday-day", name: $T("constructor.props.autocomplete.bday-day") },
      { id: id(), value: "bday-month", name: $T("constructor.props.autocomplete.bday-month") },
      { id: id(), value: "bday-year", name: $T("constructor.props.autocomplete.bday-year") },

      // Связь
      { id: id(), value: "sex", name: $T("constructor.props.autocomplete.sex") },
      { id: id(), value: "url", name: $T("constructor.props.autocomplete.url") },
      { id: id(), value: "photo", name: $T("constructor.props.autocomplete.photo") },

      // Email и телефон
      { id: id(), value: "email", name: $T("constructor.props.autocomplete.email") },
      { id: id(), value: "tel", name: $T("constructor.props.autocomplete.tel") },
      { id: id(), value: "tel-country-code", name: $T("constructor.props.autocomplete.tel-country-code") },
      { id: id(), value: "tel-national", name: $T("constructor.props.autocomplete.tel-national") },
      { id: id(), value: "tel-area-code", name: $T("constructor.props.autocomplete.tel-area-code") },
      { id: id(), value: "tel-local", name: $T("constructor.props.autocomplete.tel-local") },
      { id: id(), value: "tel-local-prefix", name: $T("constructor.props.autocomplete.tel-local-prefix") },
      { id: id(), value: "tel-local-suffix", name: $T("constructor.props.autocomplete.tel-local-suffix") },
      { id: id(), value: "tel-extension", name: $T("constructor.props.autocomplete.tel-extension") },
      { id: id(), value: "impp", name: $T("constructor.props.autocomplete.impp") },
      { id: id(), value: "fax", name: $T("constructor.props.autocomplete.fax") },
    ],
  }
})
