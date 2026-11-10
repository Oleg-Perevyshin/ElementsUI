# Переход на 2.0: данные, графики, карта, словарь

## Новая точка входа `poe-svelte-ui-lib/constructor`

Панели свойств и всё, что нужно только конструктору, вынесены из основной точки входа: WebApp прошивки больше не тянет их и словарь конструктора.

| Было                                                                                | Стало                                                                                                     |
| ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `UI.ButtonProps`, `UI.TableProps`, ... `UI.WidgetMapProps` из `"poe-svelte-ui-lib"` | `import { ButtonProps, TableProps, ... } from "poe-svelte-ui-lib/constructor"`                            |
| `UI.TextsEditor`                                                                    | `import { TextsEditor } from "poe-svelte-ui-lib/constructor"`                                             |
| `component.info.*`, `constructor.*`, `library.*` в `$T` библиотеки всегда           | Подключаются импортом `poe-svelte-ui-lib/constructor` (один раз, до отрисовки). Без него `$T` их не знает |

Там же `optionsStore`, `findColorOption`, `stripLegacyTextColor`, `CommonSnippets` и сам словарь `constructorTranslations`. Новое в `i18n`: `extendTranslations(dictionary)` и тип `TranslationKey` (подсказка ключей в `$T`, любая строка по-прежнему допустима).

## Table

| Было                                                                 | Стало                                                                                                                          |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Журнал: `body` с `dataBuffer.stashData`, таблица сама очищала `body` | `bind:this={log}` и `log.push(rows)` (строка или массив); `body` в журнале не читается                                         |
| `body: T[] \| T \| null`, `bind:body`                                | `body?: T[]`, не связывается; сортировка - внутри таблицы                                                                      |
| `clearBuffer()`                                                      | `clear()`                                                                                                                      |
| `onClick(eventHandler)` - таблица собирала `Value` из `Variables`    | `onClick(row, button)` - строка с выбранными в списках значениями и кнопка; пакет из `button.eventHandler` собирает приложение |
| `text.formatting(text)` - HTML окна и подсказки                      | `text.render(row)` - содержимое ячейки; окно - `modal: true` или сниппет `Snippet<[row]>`                                      |
| `id` у корня таблицы со случайным суффиксом, `rowDiv…`, `select…`    | Глобальных id нет, две таблицы на странице не мешают друг другу                                                                |

Сборка пакета кнопки в рендерере (DevCloud `GUIPreview`, WebApp `GUIPreview`) - то, что раньше делала таблица:

```ts
onClick={(row, button) => {
  const handler = button.eventHandler
  if (!handler) return
  const value = Object.fromEntries((handler.Variables ?? []).map((v) => {
    const key = v.replace(/-S$/, "") /* у списка -S - варианты, значение - в поле без суффикса */
    return [key, (row as Record<string, unknown>)[key]]
  }))
  handleUIComponentEvent({ ...handler, Value: JSON.stringify(value) }, null, null)
}}
```

Журнал в рендерере: вместо `body` в режиме `stashData` - `bind:this` и `push` при каждом новом значении переменной.

Колонки в `.ts` без Svelte-разметки могут сделать окно через `createRawSnippet` из `svelte`, например CAN-окно вместо `formatting: formatCanDataModal`:

```ts
import { createRawSnippet } from "svelte"
const canModal = createRawSnippet((row: () => CanRow) => ({ render: () => `<div class="whitespace-pre-wrap">${formatCanDataModal(row().data)}</div>` }))
{ type: "text", data: { key: "data", truncated: true, copy: true, modal: canModal } }
```

## xPOE-Debug

| Было                                                                                       | Стало                                                                                                                    |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `XPoeDebugItem.value` - HEX Payload                                                        | `valueBytes` - байты, `payload` - Payload, декодированный один раз при разборе                                           |
| `XPoeDebugRow.value` - HEX, приложение заменяло его на `formatXPoeDebugValueForTable(...)` | `value` - уже готовый краткий текст, плюс `valueBytes` и `payload`; строки из `xPoeDebugRow` кладутся в таблицу как есть |
| `formatXPoeDebugValue(hex)` - HTML                                                         | `formatXPoeDebugValue(payload, bytes)` - текст                                                                           |
| `formatXPoeDebugPretty(hex)`                                                               | `formatXPoeDebugPretty(payload, html?)`                                                                                  |
| `formatXPoeDebugValueForTable`, `formatXPoeDebugModal`, `bindXPoeDebugCopyButtons`         | Удалены: окно строки - сниппет в `xPoeDebugTableColumns`, кнопки копирования - свои у каждого раздела                    |
| `debugPlotValues(row.value)` - HEX                                                         | `debugPlotValues(row.payload)`                                                                                           |

Строка отправленной команды (DevCloud `webserial.ts`): пакет, который уходит в порт, разобрать тем же парсером - `createXPoeDebugParser().push(frame).map(xPoeDebugRow)`.

## Graph

| Было                                                               | Стало                                                                                                   |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| AUTO: опрос `streamingData` каждые 10 мс, точка при смене значений | Точка на каждый новый массив `streamingData.data` или вызов `push(sample, time?)` через `bind:this`     |
| `streamingData` строкой JSON                                       | Только объект `{ data }`                                                                                |
| Цвета линий `#3b82f6`...                                           | Метки темы `--blue-mark`, `--red-mark`, `--green-mark`, `--orange-mark`, `--purple-mark`, `--cyan-mark` |

Если приложение меняет значения в том же массиве на месте, а не присваивает новый, точки не появятся: присваивайте новый массив или вызывайте `push`.

## WidgetMap

- MapLibre по умолчанию с CDN, как раньше. Для точки доступа без интернета: `configureMapLibre({ module, css, styles })` из `"poe-svelte-ui-lib"` до первой отрисовки карты; `module` - адрес ES-модуля или функция, отдающая модуль.
- Имитация (`isTest`) грузится отдельным модулем только при включении; у Vite это отдельные файлы `simFleet-*.js` и `testSeries-*.js` рядом с бандлом. Если сборка прошивки кладёт в flash все файлы каталога, их можно исключить.
- Ключи словаря `constructor.props.map.fitAll`, `fitAllHint`, `timeout`, `loading`, `noconnection` и `constructor.props.table.fulldata` переименованы в `widget.map.*` и `common.table.fulldata`.
