# Table

Таблица строк с данными: файлы, журнал событий, параметры. Ячейки бывают текстом, кнопкой, списком, полосой прогресса и картинкой.

## Назначение

Список строк с данными устройства.

## Пакет данных

- Читает одну переменную: массив объектов, по строке на объект.
- Ячейка-кнопка отправляет своё событие. Остальные ячейки только показывают.

## Ключи

| Ключ | Описание |
|---|---|
| `<переменная>` | Массив `[{ "<ключ колонки>": значение, ... }, ...]`. Ключи колонок задаются в настройках |

## Особенности

### Журнал

С `dataBuffer.stashData` новые строки не заменяют старые, а дописываются в буфер размером `bufferSize`. Так таблица работает как журнал. `logger` пишет новые строки сверху, `autoscroll` держит таблицу прокрученной к последней строке, `clearButton` добавляет кнопку очистки в узкой колонке справа.

### Подгрузка

Если задан `cursor`, при прокрутке до конца таблица вызывает `getData`. Пока `loader()` возвращает `true`, повторных вызовов нет. `cursor = null` выключает подгрузку.

### Вид

- Фон шапки берётся из `--table-header-color`, по умолчанию мягкий акцент `--accent-soft`. В смарт-виджете шапка окрашивается мягким оттенком мастер-цвета виджета.
- Когда у строк появляется полоса прокрутки, шапка сдвигается на её ширину, и колонки совпадают.
- Размер текста строк задаёт переменная `--table-font-size` на любом родителе, по умолчанию `13px`.
- Ширину колонки в знаках моноширинного текста считает `tableMonoWidth(знаков, знаковПодписи?)`. Колонка растёт вместе с размером шрифта и не бывает уже заголовка. Пример: `width: tableMonoWidth(6, 2)` для `0x0000`.
- Окно полного значения (`modal`) переносит длинные строки и сохраняет отступы, так HEX и base64 видны целиком.
- `outline` рисует рамки строк и колонок.
- Для сортировки у колонки должен быть ключ `key`.

## Пропсы

| Название | Тип | По умолчанию | Описание |
|---|---|---|---|
| `id` | `string` | `crypto.randomUUID()` | Идентификатор |
| `label.name`, `label.class` | `string` | `""` | Заголовок и его классы |
| `wrapperClass` | `string` | `""` | Классы обёртки |
| `header` | `ITableHeader[]` | `[]` | Колонки |
| `body` | `T[] \| T \| null` | | Строки. Можно связать через `bind:body` |
| `footer` | `string` | `""` | Текст в нижней панели |
| `dataBuffer.stashData` | `boolean` | `false` | Копить строки в буфере |
| `dataBuffer.bufferSize` | `number` | `10` | Размер буфера |
| `dataBuffer.visibleRows` | `number` | `5` | Сколько строк видно без прокрутки |
| `dataBuffer.logger` | `boolean` | `false` | Новые строки сверху |
| `dataBuffer.clearButton` | `boolean` | `false` | Кнопка очистки |
| `dataBuffer.clearClass` | `string` | `""` | Классы кнопки очистки |
| `outline` | `boolean` | `false` | Рамки строк и колонок |
| `autoscroll` | `boolean` | `false` | Прокручивать к последней строке |
| `cursor` | `string \| null` | `null` | Курсор подгрузки |
| `loader` | `() => boolean` | | Идёт ли загрузка |
| `getData` | `() => void` | | Загрузить следующую порцию |
| `onClick` | `(eventHandler) => void` | | Нажата кнопка в ячейке |

### Колонка `ITableHeader`

| Поле | Тип | Описание |
|---|---|---|
| `label` | `{ name, class }` | Заголовок колонки |
| `width` | `string` | Ширина |
| `align` | `"left" \| "center" \| "right"` | Выравнивание |
| `disableSelect` | `boolean` | Запретить выделение текста |
| `content` | `ITableContent[] \| (row) => ITableContent[]` | Что в ячейке: список или функция от строки |

### Содержимое ячейки `ITableContent`

| `type` | Поля `data` |
|---|---|
| `text` | `key`, `sortable`, `truncated`, `tooltip`, `formatting(text)`, `copy`, `modal`, `class` |
| `button` | `name`, `icon`, `title`, `class` (строки или функции от строки), `eventHandler`, `onClick(row)`. У кнопки-иконки без `name` обязательно `title` |
| `select` | `key` (массив вариантов в строке), `keyCol`, `onChange` |
| `progressBar` | `key`, `minNum`, `maxNum`, `units` |
| `image` | `src` (строка или функция), `alt`, `class`, `width`, `height`, `defaultIcon` |

## Пример

```svelte
<script>
  import * as UI from "poe-svelte-ui-lib"
  const header = [
    { label: { name: "Файл" }, content: [{ type: "text", data: { key: "Name", sortable: true } }] },
    { label: { name: "Размер" }, align: "right", content: [{ type: "text", data: { key: "Size" } }] },
    { label: { name: "" }, width: "3rem", content: [{ type: "button", data: { icon: IconTrash, title: "Удалить", onClick: (row) => remove(row) } }] },
  ]
</script>

<UI.Table label={{ name: "Файлы" }} {header} body={files} />
```

## Панель свойств (TableProps.svelte)

В конструкторе задают колонки (ключ, заголовок, ширину, выравнивание, тип ячейки), буфер журнала и рамки.
