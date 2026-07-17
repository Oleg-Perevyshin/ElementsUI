# Widget Component

## Описание

Виджет - это UI-компонент, который позволяет отображать и управлять данными с различными типами интерфейсов (ввод, слайдер, переключатель). Компонент поддерживает настройку внешнего вида, иконок, режимов работы и другие параметры через систему пропсов.

## Пропсы

| Название | Тип | По умолчанию | Описание |
| --- | --- | --- | --- |
| `id` | `string` | `crypto.randomUUID()` | Уникальный идентификатор компонента |
| `wrapperClass` | `string` | `undefined` | CSS-классы для обертки компонента |
| `label` | `object` | `-` | Настройки заголовка компонента |
| `label.name` | `string` | `""` | Текст заголовка компонента |
| `label.class` | `string` | `""` | CSS-классы для стилизации текста заголовка |
| `value` | `number` | `0` | Текущее значение компонента: для `input`/`slider` — число в заданном диапазоне, для `switch` — 0 (Off) или 1 (On) |
| `readonly` | `boolean` | `false` | Режим только для чтения: блокирует изменение значения через элементы управления (кнопки, инпут, слайдер, переключатель) |
| `settings` | `object` | `-` | Настройки компонента |
| `settings.label` | `string` | `""` | Текст метки, отображаемой над элементом управления |
| `settings.class` | `string` | `undefined` | Дополнительные CSS-классы для контейнера элемента управления |
| `settings.type` | `"input" \| "switch" \| "slider"` | `"input"` | Тип элемента управления |
| `settings.number` | `object` | `-` | Настройки числового диапазона |
| `settings.number.minNum` | `number` | `0` | Минимально допустимое значение |
| `settings.number.maxNum` | `number` | `1000` | Максимально допустимое значение |
| `settings.number.step` | `number` | `1` | Шаг изменения значения |
| `settings.number.units` | `string` | `undefined` | Единицы измерения, отображаемые рядом со значением |
| `settings.switch` | `object` | `undefined` | Настройки подписей для переключателя |
| `settings.switch.captionLeft` | `string` | `undefined` | Подпись слева от переключателя (по умолчанию отображается `"Off"`) |
| `settings.switch.captionRight` | `string` | `undefined` | Подпись справа от переключателя (по умолчанию отображается `"On"`) |
| `icons` | `object` | `-` | Настройки иконок |
| `icons.array` | `string[]` | `[]` | Массив иконок (SVG/HTML-строки) |
| `icons.cycling` | `boolean` | `true` | Режим циклического переключения иконок: при `true` иконки циклически меняются со скоростью, обратно пропорциональной `value`; при `false` выбирается конкретная иконка, соответствующая текущему значению |
| `icons.class` | `string` | `undefined` | CSS-классы для иконок |
| `onUpdate` | `(value: number) => void` | `undefined` | Обработчик изменения значения |

## События

| Название | Тип | Описание |
| --- | --- | --- |
| `onUpdate` | `(value: number) => void` | Срабатывает при изменении значения компонента |

## Примеры

### Виджет с числовым вводом

```svelte
<script>
  import * as UI from "poe-svelte-ui-lib"

  let widgetValue = 0

  const handleUpdate = (value) => {
    widgetValue = value
    console.log("Новое значение:", value)
  }
</script>

<UI.Widget
  label={{ name: "Temperature", class: "text-blue-500" }}
  settings={{
    label: "Current temperature",
    number: { minNum: 0, maxNum: 100, step: 1, units: "°C" },
    type: "input",
  }}
  value={widgetValue}
  onUpdate={handleUpdate}
/>
```

### Виджет со слайдером

```svelte
<script>
  import * as UI from "poe-svelte-ui-lib"

  let widgetValue = 50

  const handleUpdate = (value) => {
    widgetValue = value
    console.log("Новое значение:", value)
  }
</script>

<UI.Widget
  label={{ name: "Volume Control" }}
  settings={{
    label: "Adjust volume",
    number: { minNum: 0, maxNum: 100, step: 5, units: "%" },
    type: "slider",
  }}
  value={widgetValue}
  onUpdate={handleUpdate}
/>
```

### Виджет с переключателем

```svelte
<script>
  import * as UI from "poe-svelte-ui-lib"

  let widgetValue = 0

  const handleUpdate = (value) => {
    widgetValue = value
    console.log("Новое значение:", value)
  }
</script>

<UI.Widget
  label={{ name: "Power Switch" }}
  settings={{
    label: "Turn device on/off",
    type: "switch",
    switch: { captionLeft: "Off", captionRight: "On" },
  }}
  value={widgetValue}
  onUpdate={handleUpdate}
/>
```

## Внутренняя архитектура

### Реактивность

- Переменная `currentIndex` управляет индексом текущей иконки
- Переменная `currentValue` содержит текущее значение компонента
- Функция `mapToStep` преобразует значение в индекс иконки
- Функция `roundToClean` округляет числа для отображения

### Сторы и зависимости

- Используется стор `twMerge` для объединения Tailwind CSS классов
- Используется `window.setInterval` для циклического переключения иконок

### Директивы

- `bind:value` для двусторонней привязки значения
- `$effect` для синхронизации значений и состояний
- `onUpdate` для обработки изменения значения

### Слоты

- Компонент не использует внешних слотов

## Конструктор свойств (WidgetProps.svelte)

### Описание

Компонент `WidgetProps.svelte` предоставляет визуальный интерфейс для редактирования свойств компонента виджета. Поддерживает два режима отображения: для конструктора и для редактирования.

### Пропсы конструктора

| Название | Тип | По умолчанию | Описание |
| --- | --- | --- | --- |
| `component` | `UIComponent & { properties: Partial<IWidgetProps> }` | `-` | Объект компонента с его свойствами |
| `onPropertyChange` | `(updates: Partial<{ properties?: string \| object; name?: string; access?: string; eventHandler?: IUIComponentHandler }>) => void` | `-` | Коллбэк для обновления свойств компонента |
| `forConstructor` | `boolean` | `true` | Режим отображения (для конструктора или редактирования) |

### Особенности конструктора

- Предоставляет визуальные элементы управления для всех доступных свойств
- Поддерживает настройку типа управления (ввод, слайдер, переключатель)
- Включает настройки числового диапазона и иконок
- Имеет различные наборы полей в зависимости от режима (`forConstructor`)
- Использует систему локализации через `$T('constructor.props.*')`

## Заметки

### Адаптивность

- Компонент использует Tailwind CSS для адаптивного дизайна
- Виджет автоматически адаптируется под размер контейнера
- Используются относительные единицы измерения для обеспечения масштабируемости

### Ограничения

- В режиме циклического переключения иконок используется интервал для автоматического переключения
- Значения ограничены минимальным и максимальным диапазоном
- Тип управления влияет на доступные настройки

### Производительность

- Компонент использует оптимизации Svelte для минимизации перерисовок
- Используется эффективное объединение классов через `twMerge`
- Циклическое переключение иконок останавливается при размонтировании компонента
