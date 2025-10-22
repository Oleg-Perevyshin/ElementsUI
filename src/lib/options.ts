// $lib/ElementsUI/options.ts
import { derived } from 'svelte/store'
import { t } from './locales/i18n'

function id() {
  return crypto.randomUUID() as string
}

export const optionsStore = derived(t, ($t) => {
  return {
    HEADER_OPTIONS: [
      { id: id(), name: 'GET', value: 'GET' },
      { id: id(), name: 'SET', value: 'SET' },
      { id: id(), name: 'OK!', value: 'OK!' },
      { id: id(), name: 'ER!', value: 'ER!' },
    ],

    SHORT_ARGUMENT_OPTION: [
      { id: id(), value: 'NoSave', name: $t('constructor.props.action.update') },
      { id: id(), value: 'Save', name: $t('constructor.props.action.save') },
      { id: id(), value: 'NoSend', name: $t('constructor.props.action.nosend') },
    ],

    FULL_ARGUMENT_OPTION: [
      { id: id(), value: 'NoSave', name: $t('constructor.props.action.update') },
      { id: id(), value: 'Save', name: $t('constructor.props.action.save') },
      { id: id(), value: '', name: $t('constructor.props.action.custom') },
    ],

    INPUT_TYPE_OPTIONS: [
      { id: id(), value: 'text', name: $t('constructor.props.type.text') },
      { id: id(), value: 'password', name: $t('constructor.props.type.password') },
      { id: id(), value: 'number', name: $t('constructor.props.type.number') },
      { id: id(), value: 'text-area', name: $t('constructor.props.type.textarea') },
    ],

    SELECT_TYPE_OPTIONS: [
      { id: id(), value: 'select', name: $t('constructor.props.type.select') },
      { id: id(), value: 'buttons', name: $t('constructor.props.type.buttons') },
      { id: id(), value: 'input', name: $t('constructor.props.type.selectput') },
    ],

    SELECT_VALUE_TYPE_OPTIONS: [
      { id: id(), value: 'text' as const, name: $t('constructor.props.valuetype.text') },
      { id: id(), value: 'number' as const, name: $t('constructor.props.valuetype.number') },
    ],

    SLIDER_TYPE_OPTIONS: [
      { id: id(), value: 'single', name: $t('constructor.props.type.single') },
      { id: id(), value: 'range', name: $t('constructor.props.type.range') },
    ],

    TEXTFIELD_SIZE_OPTIONS: [
      { id: id(), value: 'small', name: $t('constructor.props.type.small') },
      { id: id(), value: 'base', name: $t('constructor.props.type.base') },
      { id: id(), value: 'large', name: $t('constructor.props.type.large') },
      { id: id(), value: 'huge', name: $t('constructor.props.type.huge') },
      { id: id(), value: 'massive', name: $t('constructor.props.type.massive') },
    ],

    COLOR_OPTIONS: [
      { id: id(), name: '', value: 'bg-max', class: 'bg-max' },
      { id: id(), name: '', value: 'bg-red', class: 'bg-red' },
      { id: id(), name: '', value: 'bg-yellow', class: 'bg-yellow' },
      { id: id(), name: '', value: 'bg-green', class: 'bg-green' },
      { id: id(), name: '', value: 'bg-blue', class: 'bg-blue' },
      { id: id(), name: '', value: 'bg-purple', class: 'bg-purple' },
      { id: id(), name: '', value: 'bg-gray', class: 'bg-gray' },
    ],

    TEXT_COLOR_OPTIONS: [
      { id: id(), name: '', value: 'text-[#333] dark:text-[#e2e3e7]', class: 'bg-[var(--shadow-color)] dark:bg-[#e2e3e7] ' },
      { id: id(), name: '', value: 'text-red-500 dark:text-red-400', class: 'bg-red-500 dark:bg-red-400' },
      { id: id(), name: '', value: 'text-yellow-500 dark:text-yellow-400', class: 'bg-yellow-500 dark:bg-yellow-400' },
      { id: id(), name: '', value: 'text-green-500 dark:text-green-400', class: 'bg-green-500 dark:bg-green-400' },
      { id: id(), name: '', value: 'text-blue-500 dark:text-blue-400', class: 'bg-blue-500 dark:bg-blue-400' },
      { id: id(), name: '', value: 'text-purple-500 dark:text-purple-400', class: 'bg-purple-500 dark:bg-purple-400' },
      { id: id(), name: '', value: 'text-gray-500 dark:text-gray-400', class: 'bg-gray-500 dark:bg-gray-400' },
    ],

    ALIGN_OPTIONS: [
      { id: id(), value: 'text-left', name: $t('constructor.props.align.left') },
      { id: id(), value: 'text-center', name: $t('constructor.props.align.center') },
      { id: id(), value: 'text-right', name: $t('constructor.props.align.right') },
    ],

    HEIGHT_OPTIONS: [
      { id: id(), value: 'py-1', name: $t('constructor.props.height.small') },
      { id: id(), value: 'py-2', name: $t('constructor.props.height.medium') },
      { id: id(), value: 'py-3', name: $t('constructor.props.height.large') },
    ],

    ACCORDION_TYPE_OPTIONS: [
      { id: id(), value: false, name: $t('constructor.props.type.main') },
      { id: id(), value: true, name: $t('constructor.props.type.sub') },
    ],

    FILE_ATTACH_TYPE_OPTIONS: [
      { id: id(), value: 'file', name: $t('constructor.props.type.file') },
      { id: id(), value: 'image', name: $t('constructor.props.type.image') },
    ],

    FITMODE_OPTIONS: [
      { id: id(), value: 'cover', name: $t('constructor.props.type.cover') },
      { id: id(), value: 'contain', name: $t('constructor.props.type.contain') },
    ],

    FORM_OPTIONS: [
      { id: id(), value: 'square', name: $t('constructor.props.type.square') },
      { id: id(), value: 'circle', name: $t('constructor.props.type.circle') },
    ],

    AUTOCOMPLETE_OPTIONS: [
      { id: id(), value: 'on', name: $t('constructor.props.autocomplete.on') },
      { id: id(), value: 'off', name: $t('constructor.props.autocomplete.off') },
      { id: id(), value: 'given-name', name: $t('constructor.props.autocomplete.given-name') },
      { id: id(), value: 'family-name', name: $t('constructor.props.autocomplete.family-name') },
      { id: id(), value: 'name', name: $t('constructor.props.autocomplete.name') },
      { id: id(), value: 'email', name: $t('constructor.props.autocomplete.email') },
      { id: id(), value: 'username', name: $t('constructor.props.autocomplete.username') },
      { id: id(), value: 'new-password', name: $t('constructor.props.autocomplete.new-password') },
      { id: id(), value: 'current-password', name: $t('constructor.props.autocomplete.current-password') },
      { id: id(), value: 'tel', name: $t('constructor.props.autocomplete.tel') },
      { id: id(), value: 'country-name', name: $t('constructor.props.autocomplete.country-name') },
      { id: id(), value: 'address-level1', name: $t('constructor.props.autocomplete.address-level1') },
      { id: id(), value: 'address-level2', name: $t('constructor.props.autocomplete.address-level2') },
      { id: id(), value: 'street-address', name: $t('constructor.props.autocomplete.street-address') },
      { id: id(), value: 'postal-code', name: $t('constructor.props.autocomplete.postal-code') },
    ],
  }
})
