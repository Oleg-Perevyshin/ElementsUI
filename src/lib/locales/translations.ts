// $lib/locales/translations.ts
interface Translations {
  [language: string]: { [key: string]: string }
}

const translations: Translations = {
  ru: {
    'constructor.props.label': 'Текст надписи',
    'constructor.props.type': 'Тип',
    'constructor.props.align': 'Выравнивание',
    'constructor.props.bold': 'Жирный',
    'constructor.props.italic': 'Курсив',
    'constructor.props.type.small': 'Малый',
    'constructor.props.type.medium': 'Обычный',
    'constructor.props.type.xlarge': 'Большой',
    'constructor.props.align.left': 'Слева',
    'constructor.props.align.center': 'По центру',
    'constructor.props.align.right': 'Справа',
  },
  en: {},
  zh: {},
}
export default translations
