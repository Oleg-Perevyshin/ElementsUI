# WidgetFileSystem Component

## Описание

Смарт-виджет файловой системы устройства: занятость памяти, список файлов с удалением и закачка
нового файла с прогрессом. Работает с объектом `FSInfo` группы `CFG` ровно в том виде, в каком
его отдаёт прошивка (`FS_WriteFullInfo`, ProdFactory-ESP), и с прогрессом закачки `UlProg`.
Компонент ничего не знает про DeviceStore/WebSocket — только `value`/`uploadProgress` и колбэки
`onRefresh`/`onDelete`/`onUpload`, вся отправка (в том числе протокол закачки `FUpS` → `FUpP` →
`FUpD`) на стороне вызывающего кода.

Заменяет собой блок из отдельных компонентов (поля «Всего/Использовано/Свободно», кнопка
`GET FSInfo`, таблица `FSList` с кнопкой `DelFile`, `FileAttach`, `ProgressBar` по `UlProg`) —
одной карточкой в стиле `WidgetWiFi`/`WidgetDeviceInfo`.

- **Занятость** — «занято X из Y», процент и полоса; от 75% полоса оранжевая, от 90% — красная.
  Размеры показываются в Б/КБ/МБ.
- **Файлы** — таблица «Путь / Размер / Удалить»; длинный путь обрезается «…», удаление
  подтверждается внутри карточки. Пустая ФС — «Файлов нет». Колонка удаления есть, только
  если передан `onDelete`.
- **Закачка** — блок есть, только если передан `onUpload`. Имя файла проверяется до отправки
  (`maxNameLength`, по умолчанию 31 — ограничение прошивки), пока `onUpload` не завершится,
  показывается прогресс из `uploadProgress`; ошибка из `onUpload` выводится под полем.

## Пропсы

| Название         | Тип                                      | По умолчанию                   | Описание                                                                                                                |
| ---------------- | ---------------------------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `id`             | `string`                                 | `undefined`                    | Префикс прошивочной группы (обычно `"CFG"`), используется вызывающим кодом для чтения `FSInfo`/`UlProg`                 |
| `wrapperClass`   | `string`                                 | `""`                           | CSS-классы обёртки                                                                                                      |
| `componentClass` | `string`                                 | `""`                           | «Мастер-цвет» виджета — роль вида `"bg-red"` (см. `optionsStore.COLOR_OPTIONS`)                                         |
| `label`          | `{ name?: string }`                      | `{ name: "Файловая система" }` | Заголовок карточки                                                                                                      |
| `value`          | `IWidgetFileSystemInfo`                  | `undefined`                    | Состояние файловой системы (`CFG.FSInfo`)                                                                               |
| `uploadProgress` | `number`                                 | `0`                            | Прогресс текущей закачки, % (`CFG.UlProg`)                                                                              |
| `keys`           | `{ FSInfo?: string; UlProg?: string }`   | `undefined`                    | Переопределение имён полей устройства, по умолчанию `FSInfo` и `UlProg`                                                 |
| `accept`         | `string`                                 | `"*/*"`                        | Какие файлы можно выбрать (атрибут `accept`), например `".bin, .txt, .pem"`                                             |
| `maxNameLength`  | `number`                                 | `31`                           | Максимальная длина имени файла                                                                                          |
| `infoCommand`    | `{ header?: string; argument?: string }` | `undefined`                    | Команда обновления, по умолчанию `GET FSInfo` (используется вызывающим кодом)                                           |
| `deleteCommand`  | `{ header?: string; argument?: string }` | `undefined`                    | Команда удаления, по умолчанию `SET DelFile` (используется вызывающим кодом)                                            |
| `collapsed`      | `boolean`                                | `false`                        | Свёрнуто ли тело виджета (`$bindable`)                                                                                  |
| `persistKey`     | `string`                                 | `undefined`                    | Ключ для сохранения `collapsed` в `localStorage`                                                                        |
| `onRefresh`      | `() => void`                             | `undefined`                    | Кнопка «Обновить» в шапке; без обработчика кнопка неактивна                                                             |
| `onDelete`       | `(name: string) => void`                 | `undefined`                    | Удаление файла после подтверждения; `name` — полный путь из `FSList`                                                    |
| `onUpload`       | `(file: File) => void \| Promise<void>`  | `undefined`                    | Закачка выбранного файла; пока промис не завершён — показывается прогресс, исключение показывается как ошибка под полем |

### IWidgetFileSystemInfo

| Поле        | Тип                                | Описание                                                          |
| ----------- | ---------------------------------- | ----------------------------------------------------------------- |
| `FSTotal`   | `number`                           | Размер файловой системы, байт                                     |
| `FSUsed`    | `number`                           | Занято, байт                                                      |
| `FSFree`    | `number`                           | Свободно, байт                                                    |
| `FileCount` | `number`                           | Количество файлов (если нет — длина `FSList`)                     |
| `FSList`    | `{ Name: string; Size: number }[]` | Файлы: полный путь (его же принимает `DelFile`) и размер в байтах |

## Примеры

```svelte
<script>
  import * as UI from "poe-svelte-ui-lib"

  let fsInfo = { FSTotal: 1441792, FSUsed: 98304, FSFree: 1343488, FileCount: 1, FSList: [{ Name: "/littlefs/cert.pem", Size: 1834 }] }
  let progress = 0
</script>

<UI.WidgetFileSystem
  value={fsInfo}
  uploadProgress={progress}
  accept=".bin, .txt, .pem"
  onRefresh={() => console.log("GET FSInfo")}
  onDelete={(name) => console.log("SET DelFile", { Name: name })}
  onUpload={async (file) => console.log("FUpS/FUpP/FUpD", file.name)}
/>
```

## Конструктор свойств (WidgetFileSystemProps.svelte)

| Название           | Тип                                                                                             | Описание                                  |
| ------------------ | ----------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `component`        | `UIComponent & { properties: Partial<IWidgetFileSystemProps> }`                                 | Объект компонента с его свойствами        |
| `onPropertyChange` | `(updates: Partial<{ properties?: string \| object; name?: string; access?: string }>) => void` | Коллбэк для обновления свойств компонента |

Группы панели: общие (заголовок, префикс группы, мастер-цвет), закачка (`accept`,
`maxNameLength`), ключи устройства (`FSInfo`, `UlProg`), команды обновления и удаления.
