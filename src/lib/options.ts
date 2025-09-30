// $lib/ElementsUI/options.ts
import { derived } from 'svelte/store'
import { t } from './locales/i18n'

function id() {
  return crypto.randomUUID() as string
}

export const optionsStore = derived(t, ($t) => {
  return {
    HEADER_OPTIONS: [
      { id: id(), name: 'GET', value: 'GET', class: '!w-1/4' },
      { id: id(), name: 'SET', value: 'SET', class: '!w-1/4' },
      { id: id(), name: 'OK!', value: 'OK!', class: '!w-1/4' },
      { id: id(), name: 'ER!', value: 'ER!', class: '!w-1/4' },
    ],

    SHORT_ARGUMENT_OPTION: [
      { id: id(), value: 'NoSave', name: $t('service.constructor.props.action.update'), class: '!w-1/3' },
      { id: id(), value: 'Save', name: $t('service.constructor.props.action.save'), class: '!w-1/3' },
      { id: id(), value: 'NoSend', name: $t('service.constructor.props.action.nosend'), class: '!w-1/3' },
    ],

    FULL_ARGUMENT_OPTION: [
      { id: id(), value: 'NoSave', name: $t('service.constructor.props.action.update'), class: '!w-1/3' },
      { id: id(), value: 'Save', name: $t('service.constructor.props.action.save'), class: '!w-1/3' },
      { id: id(), value: '', name: $t('service.constructor.props.action.custom'), class: '!w-1/3' },
    ],

    INPUT_TYPE_OPTIONS: [
      { id: id(), value: 'text', name: $t('service.constructor.props.type.text') },
      { id: id(), value: 'password', name: $t('service.constructor.props.type.password') },
      { id: id(), value: 'number', name: $t('service.constructor.props.type.number') },
      { id: id(), value: 'text-area', name: $t('service.constructor.props.type.textarea') },
    ],

    SELECT_TYPE_OPTIONS: [
      { id: id(), value: 'select', name: $t('service.constructor.props.type.select'), class: '!w-1/2' },
      { id: id(), value: 'buttons', name: $t('service.constructor.props.type.buttons'), class: '!w-1/2' },
    ],

    SELECT_VALUE_TYPE_OPTIONS: [
      { id: id(), value: 'text' as const, name: $t('service.constructor.props.valuetype.text'), class: '!w-1/2' },
      { id: id(), value: 'number' as const, name: $t('service.constructor.props.valuetype.number'), class: '!w-1/2' },
    ],

    SLIDER_TYPE_OPTIONS: [
      { id: id(), value: 'single', name: $t('service.constructor.props.type.single'), class: '!w-1/2' },
      { id: id(), value: 'range', name: $t('service.constructor.props.type.range'), class: '!w-1/2' },
    ],

    TEXTFIELD_SIZE_OPTIONS: [
      { id: id(), value: 'small', name: $t('service.constructor.props.type.small'), class: '!w-1/3' },
      { id: id(), value: 'medium', name: $t('service.constructor.props.type.medium'), class: '!w-1/3' },
      { id: id(), value: 'xlarge', name: $t('service.constructor.props.type.xlarge'), class: '!w-1/3' },
    ],

    COLOR_OPTIONS: [
      { id: id(), name: '', value: 'bg-gray', class: '!w-1/6 bg-gray' },
      { id: id(), name: '', value: 'bg-max', class: '!w-1/6 bg-max' },
      { id: id(), name: '', value: 'bg-red', class: '!w-1/6 bg-red' },
      { id: id(), name: '', value: 'bg-yellow', class: '!w-1/6 bg-yellow' },
      { id: id(), name: '', value: 'bg-green', class: '!w-1/6 bg-green' },
      { id: id(), name: '', value: 'bg-blue', class: '!w-1/6 bg-blue' },
    ],

    ALIGN_OPTIONS: [
      { id: id(), value: 'text-left', name: $t('service.constructor.props.align.left'), class: '!w-1/3' },
      { id: id(), value: 'text-center', name: $t('service.constructor.props.align.center'), class: '!w-1/3' },
      { id: id(), value: 'text-right', name: $t('service.constructor.props.align.right'), class: '!w-1/3' },
    ],

    HEIGHT_OPTIONS: [
      { id: id(), value: 'py-1', name: $t('service.constructor.props.height.small'), class: '!w-1/3' },
      { id: id(), value: 'py-2', name: $t('service.constructor.props.height.medium'), class: '!w-1/3' },
      { id: id(), value: 'py-3', name: $t('service.constructor.props.height.large'), class: '!w-1/3' },
    ],

    ACCORDION_TYPE_OPTIONS: [
      { id: id(), value: 'main', name: $t('service.constructor.props.type.main'), class: '!w-1/2' },
      { id: id(), value: 'sub', name: $t('service.constructor.props.type.sub'), class: '!w-1/2' },
    ],
  }
})
