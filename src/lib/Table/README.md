# Table Component

## Описание

Таблица - это UI-компонент, который позволяет отображать данные в табличном формате с возможностью сортировки, фильтрации и взаимодействия с элементами. Компонент поддерживает различные типы содержимого столбцов (текст, изображения, кнопки, селекторы, индикаторы прогресса), настройки отображения и другие параметры через систему пропсов.

## Пропсы

| Название | Тип | По умолчанию | Описание |
| --- | --- | --- | --- |
| `id` | `string` | `crypto.randomUUID()` | Уникальный идентификатор компонента |
| `wrapperClass` | `string` | `""` | Дополнительные CSS-классы для внешней обёртки компонента |
| `label` | `object` | `-` | Настройки подписи компонента |
| `label.name` | `string` | `""` | Текст заголовка компонента |
| `label.class` | `string` | `""` | CSS-классы для стилизации текста заголовка |
| `header` | `ITableHeader<T>[]` | `[]` | Конфигурация колонок: массив объектов с настройками `width` (ширина), `align` (выравнивание), `label` (заголовок), `content` (массив элементов: `text`/`image`/`button`/`select`/`progressBar` с типизированными `data`) |
| `body` | `T[] \| T \| null` | `-` | Данные строк таблицы: массив объектов или единичный объект; каждый объект представляет строку с ключами, соответствующими колонкам; поддерживает двустороннее связывание (`$bindable`) |
| `footer` | `string` | `""` | Текст сводной информации, отображаемый в нижней панели таблицы |
| `dataBuffer` | `object` | `-` | Настройки буфера данных |
| `dataBuffer.stashData` | `boolean` | `false` | Включить буферизацию данных |
| `dataBuffer.bufferSize` | `number` | `10` | Размер буфера данных |
| `dataBuffer.visibleRows` | `number` | `5` | Количество видимых строк при ограничении высоты |
| `dataBuffer.clearButton` | `boolean` | `false` | Показывать кнопку очистки буфера |
| `dataBuffer.clearClass` | `string` | `""` | CSS-класс для кнопки очистки |
| `dataBuffer.logger` | `boolean` | `false` | Режим журнала (добавление новых строк в начало) |
| `outline` | `boolean` | `false` | Показывать обводку строк и столбцов |
| `cursor` | `string \| null` | `null` | Курсор пагинации для бесконечной прокрутки: передаётся в `getData` при достижении конца списка; при `null` загрузка новых данных отключена |
| `loader` | `Writable<boolean>` | `undefined` | Svelte store с состоянием загрузки: при `true` блокирует повторные запросы `getData` во время получения данных |
| `autoscroll` | `boolean` | `false` | Автоматическая прокрутка: при `true` таблица всегда прокручивается к последней строке при добавлении новых данных |
| `getData` | `() => void` | `() => {}` | Callback-функция для загрузки следующей порции данных: вызывается при достижении конца прокрутки (если заданы `cursor` и `loader`) |
| `onClick` | `(eventHandler: IUIComponentHandler) => void` | `undefined` | Обработчик клика по элементу таблицы (например, кнопке) |

### Вложенные типы

#### ITableHeader\<T\>

| Название | Тип | По умолчанию | Описание |
| --- | --- | --- | --- |
| `label` | `{ name?: string; class?: string }` | `undefined` | Настройки заголовка столбца |
| `width` | `string` | `undefined` | Ширина столбца |
| `align` | `"left" \| "center" \| "right"` | `undefined` | Выравнивание содержимого |
| `disableSelect` | `boolean` | `undefined` | Запрет выделения текста в столбце |
| `content` | `ITableContent<T>[] \| ((row: T) => ITableContent<T>[])` | `undefined` | Содержимое столбца (статичный массив либо функция от строки) |

#### ITableContent\<T\> (по типу `type`)

| Название | Тип | Описание |
| --- | --- | --- |
| `type: "text"` | `{ type: "text"; data: ITableText<T> }` | Текстовая ячейка |
| `type: "select"` | `{ type: "select"; data: ITableSelect<T> }` | Ячейка-селектор |
| `type: "button"` | `{ type: "button"; data: ITableButton<T> \| ((row: T) => ITableButton<T>) }` | Ячейка-кнопка |
| `type: "progressBar"` | `{ type: "progressBar"; data: ITableProgressBar<T> }` | Ячейка с индикатором прогресса |
| `type: "image"` | `{ type: "image"; data: ITableImage<T> }` | Ячейка с изображением |

#### ITableText\<T\>

| Название | Тип | По умолчанию | Описание |
| --- | --- | --- | --- |
| `key` | `keyof T` | `-` | Ключ для доступа к данным строки |
| `sortable` | `boolean` | `undefined` | Возможность сортировки по столбцу |
| `truncated` | `boolean` | `undefined` | Обрезать длинный текст с многоточием |
| `tooltip` | `boolean` | `undefined` | Показывать всплывающую подсказку с полным текстом |
| `formatting` | `(text: string) => string` | `undefined` | Функция форматирования отображаемого текста |
| `copy` | `boolean` | `undefined` | Показывать кнопку копирования значения |
| `modal` | `boolean` | `undefined` | Открывать полное значение в модальном окне |
| `class` | `string` | `undefined` | CSS-классы для стилизации ячейки |

#### ITableSelect\<T\>

| Название | Тип | По умолчанию | Описание |
| --- | --- | --- | --- |
| `key` | `keyof T` | `-` | Ключ для доступа к данным строки (массив опций) |
| `keyCol` | `string` | `-` | Ключ столбца, связанного с селектором |
| `onChange` | `() => void` | `undefined` | Обработчик изменения выбора |

#### ITableButton\<T\>

| Название | Тип | По умолчанию | Описание |
| --- | --- | --- | --- |
| `name` | `string \| ((row: T) => string)` | `undefined` | Текст кнопки (статичный или вычисляемый по строке) |
| `icon` | `ConstructorOfATypedSvelteComponent \| string` | `undefined` | Иконка кнопки (Svelte-компонент или строка SVG) |
| `class` | `string \| ((row: T) => string)` | `undefined` | CSS-классы кнопки (статичные или вычисляемые по строке) |
| `eventHandler` | `IUIComponentHandler` | `undefined` | Обработчик события конструктора |
| `onClick` | `(row: T) => void` | `undefined` | Обработчик клика по кнопке |

#### ITableProgressBar\<T\>

| Название | Тип | По умолчанию | Описание |
| --- | --- | --- | --- |
| `key` | `keyof T` | `-` | Ключ для доступа к числовому значению строки |
| `minNum` | `number` | `undefined` | Минимальное значение прогресса |
| `maxNum` | `number` | `undefined` | Максимальное значение прогресса |
| `units` | `string` | `undefined` | Единицы измерения, отображаемые рядом со значением |

#### ITableImage\<T\>

| Название | Тип | По умолчанию | Описание |
| --- | --- | --- | --- |
| `src` | `string \| ((row: T) => string)` | `undefined` | Источник изображения (статичный или вычисляемый по строке) |
| `alt` | `string` | `undefined` | Альтернативный текст изображения |
| `class` | `string` | `undefined` | CSS-классы для стилизации изображения |
| `width` | `string` | `undefined` | Ширина изображения |
| `height` | `string` | `undefined` | Высота изображения |
| `defaultIcon` | `ConstructorOfATypedSvelteComponent \| string` | `undefined` | Иконка-заглушка при отсутствии `src` |

## События

| Название | Тип | Описание |
| --- | --- | --- |
| onClick | (eventHandler: any) => void | Срабатывает при клике по элементу таблицы (например, кнопке) |

## Примеры

### Базовая таблица

```svelte
<script>
  import * as UI from "poe-svelte-ui-lib"

  interface ITableRow {
    id: string
    imageUrl: string
    name: string
    status: "online" | "offline"
    lastActive: string
    action?: string
  }

  const columns = [
    { label: { name: "ID" }, key: "id", width: "5%", sortable: true, align: "center" },
    {
      label: { name: "Image" },
      key: "imageUrl",
      width: "20%",
      image: {
        src: (row: ITableRow) => row.imageUrl,
        alt: "Image",
        width: "5rem",
        height: "5rem",
      },
    },
    { label: { name: "Name" }, key: "name", width: "12%", sortable: true },
    {
      label: { name: "Status" },
      key: "status",
      width: "10%",
      overflow: {
        truncated: true,
        formatting: (text) => {
          if (text === "online") {
            return "1"
          } else return "2"
        },
      },
    },
    {
      label: { name: "Last Active" },
      key: "lastActive",
      width: "auto",
      sortable: true,
      overflow: { truncated: true, copy: true, modal: true },
    },
    {
      label: { name: "Actions" },
      key: "action",
      width: "15%",
      align: "center",
      action: {
        type: "buttons",
        buttons: [
          { name: "Action 1 (id)", class: "bg-blue", eventHandler: { Header: "SET", Argument: "save", Variables: ["name"] } },
          { name: "Action 2 (name)", class: "bg-green", onClick: (row) => console.log(row.name) },
        ],
      },
    },
  ]

  const rows = [
    {
      id: "# 1",
      imageUrl:
        "data:image/svg+xml;base64,...",
      name: "Device A",
      status: "online",
      lastActive: String(new Date()),
    },
    {
      id: "# 2",
      imageUrl:
        "data:image/svg+xml;base64,...",
      name: "Device B",
      status: "offline",
      lastActive: String(new Date(Date.now() - 86400000 * 4)),
    },
  ]

  const handleButtonClick = (eventHandler) => {
    console.log("Клик по кнопке:", eventHandler)
  }
</script>

<UI.Table label={{ name: "Devices" }} header={columns} body={rows} onClick={handleButtonClick} footer={`rows: ${rows.length}`} />
```

## Внутренняя архитектура

### Реактивность

- Переменная `sortState` управляет сортировкой столбцов
- Переменная `buffer` хранит буферизированные данные
- Переменная `isDropdownOpen` управляет состоянием выпадающих списков
- Функция `sortRows` сортирует строки по указанному ключу

### Сторы и зависимости

- Используется стор `twMerge` для объединения Tailwind CSS классов
- Используются переходы `fade`, `fly`, `slide` из `svelte/transition` для анимаций
- Используется `onMount` для инициализации обработчиков прокрутки

### Директивы

- `bind:this` для получения ссылок на DOM-элементы
- `transition:slide` и `transition:fly` для анимации элементов
- `onMount` и `onDestroy` для управления слушателями событий

### Слоты

- Слот `main` для содержимого модального окна
- Слот `footer` для нижнего колонтитула модального окна

## Конструктор свойств (TableProps.svelte)

### Описание

Компонент `TableProps.svelte` предоставляет визуальный интерфейс для редактирования свойств компонента таблицы. Поддерживает два режима отображения: для конструктора и для редактирования.

### Пропсы конструктора

| Название | Тип | По умолчанию | Описание |
| --- | --- | --- | --- |
| `component` | `UIComponent & { properties: Partial<ITableProps<object>> }` | `-` | Объект компонента с его свойствами |
| `onPropertyChange` | `(updates: Partial<{ properties?: string \| object; name?: string; access?: string; eventHandler?: IUIComponentHandler }>) => void` | `-` | Коллбэк для обновления свойств компонента |
| `forConstructor` | `boolean` | `true` | Режим отображения (для конструктора или редактирования) |

### Особенности конструктора

- Предоставляет визуальные элементы управления для всех доступных свойств
- Поддерживает настройку столбцов таблицы с различными типами содержимого
- Включает настройки буфера данных, обводки и автопрокрутки
- Имеет различные наборы полей в зависимости от режима (`forConstructor`)
- Использует систему локализации через `$T('constructor.props.*')`

## Заметки

### Адаптивность

- Компонент использует Tailwind CSS для адаптивного дизайна
- Таблица автоматически адаптируется под размеры контейнера
- Используются относительные единицы измерения для обеспечения масштабируемости

### Ограничения

- Для корректной работы сортировки необходимо указывать ключи данных
- Буферизированные данные ограничены размером буфера
- При использовании режима журнала новые данные добавляются в начало списка

### Производительность

- Компонент использует оптимизации Svelte для минимизации перерисовок
- Буферизация данных позволяет эффективно отображать большие объемы информации
- Используется эффективное объединение классов через `twMerge`
