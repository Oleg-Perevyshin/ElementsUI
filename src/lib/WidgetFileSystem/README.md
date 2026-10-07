# WidgetFileSystem Component

## Описание

Смарт-виджет файловой системы устройства: занятость памяти, список файлов с удалением и закачка
нового файла с прогрессом. Работает с одним объектом `CFG.FS` ровно в том виде, в каком его отдаёт
прошивка (`FS_WriteState`, ProdFactory-ESP), и с одной командой `FS`. Компонент ничего не знает про
DeviceStore/WebSocket — только `value` и колбэки `onRefresh`/`onDelete`/`onUpload`, вся отправка
(в том числе протокол закачки) на стороне вызывающего кода.

- **Занятость** — «занято X из Y», процент и полоса мастер-цвета; процент оранжевый от 75%,
  красный от 90%. Размеры в Б/КБ/МБ.
- **Файлы** — таблица «Путь / Размер / Удалить»; длинный путь обрезается «…», удаление
  подтверждается внутри карточки. Пустая ФС — «Файлов нет». Колонка удаления есть, только если
  передан `onDelete`.
- **Закачка** — блок есть, только если передан `onUpload`. Имя файла проверяется до отправки
  (`maxNameLength`, по умолчанию 31 — ограничение прошивки). Прогресс берётся из `value.Upload`
  и виден, пока закачку ведёт этот клиент или пока устройство сообщает `Upload` (закачка с
  другого клиента). Ошибка из `onUpload` выводится под полем.

## Протокол устройства

Всё состояние ФС — один объект `CFG.FS`:

```
"CFG.FS": {
  "Total": 1441792, "Used": 98304, "Free": 1343488,
  "List": [{ "Name": "/storage/cert.pem", "Size": 1834 }],
  "Upload": { "Name": "fw.bin", "Size": 917504, "Progress": 35 }
}
```

`Upload` есть, только пока идёт закачка. Снимок со списком `List` приходит на `GET ModCfg`,
`GET FS`, после удаления, после завершения или ошибки закачки и в рассылке `OK! Update`; ход
закачки — только `{"Upload": {...}}` (без списка, раз в 5%). Объект со списком заменяет состояние
целиком, без списка — дописывается поверх (это делает вызывающий код).

Команды — один аргумент `FS`, операция в поле `Op`; ответ всегда `FS` с тем же `Op`:

| Запрос                                                                               | Ответ                                                     |
| ------------------------------------------------------------------------------------ | --------------------------------------------------------- |
| `GET FS`                                                                             | `CFG.FS` — снимок                                         |
| `SET FS {"Op": "Delete", "Name": "/storage/a.bin"}`                                  | `Op`, `CFG.FS` — снимок                                   |
| `SET FS {"Op": "UploadStart", "FileName", "FileExtension", "FileSize", "CurrentID"}` | `Op`, `CurrentID`, `ChunkSize`, `CFG.FS.Upload`           |
| `SET FS {"Op": "UploadChunk", "ChunkIndex", "Data", "CurrentID"}`                    | `Op`, `ChunkIndex`, `CurrentID`, раз в 5% `CFG.FS.Upload` |
| `SET FS {"Op": "UploadDone", "CRC32", "CurrentID"}`                                  | `Op`, `CurrentID`, `CFG.FS` — снимок                      |

Ошибки — `ER! FS` с тем же `Op` (и `CurrentID` у закачки); ошибка закачки несёт снимок `CFG.FS`.

## Пропсы

| Название         | Тип                                     | По умолчанию                   | Описание                                                                                   |
| ---------------- | --------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------ |
| `id`             | `string`                                | `undefined`                    | Префикс прошивочной группы (обычно `"CFG"`), используется вызывающим кодом для чтения `FS` |
| `wrapperClass`   | `string`                                | `""`                           | CSS-классы обёртки                                                                         |
| `componentClass` | `string`                                | `""`                           | «Мастер-цвет» виджета — роль вида `"bg-red"`, перекрашивает весь виджет                    |
| `label`          | `{ name?: string }`                     | `{ name: "Файловая система" }` | Заголовок карточки                                                                         |
| `value`          | `IWidgetFileSystemInfo`                 | `undefined`                    | Состояние файловой системы (`CFG.FS`)                                                      |
| `keys`           | `{ FS?: string }`                       | `undefined`                    | Переопределение имени поля устройства, по умолчанию `FS`                                   |
| `argument`       | `string`                                | `undefined`                    | Аргумент команд, по умолчанию `"FS"` (используется вызывающим кодом)                       |
| `accept`         | `string`                                | `"*/*"`                        | Какие файлы можно выбрать (атрибут `accept`), например `".bin, .txt, .pem"`                |
| `maxNameLength`  | `number`                                | `31`                           | Максимальная длина имени файла                                                             |
| `collapsed`      | `boolean`                               | `false`                        | Свёрнуто ли тело виджета (`$bindable`)                                                     |
| `persistKey`     | `string`                                | `undefined`                    | Ключ для сохранения `collapsed` в `localStorage`                                           |
| `onRefresh`      | `() => void`                            | `undefined`                    | Кнопка «Обновить» в шапке (`GET FS`); без обработчика кнопка неактивна                     |
| `onDelete`       | `(name: string) => void`                | `undefined`                    | Удаление файла после подтверждения; `name` — полный путь из `List`                         |
| `onUpload`       | `(file: File) => void \| Promise<void>` | `undefined`                    | Закачка выбранного файла; исключение показывается как ошибка под полем                     |

### IWidgetFileSystemInfo

| Поле     | Тип                                                 | Описание                                                |
| -------- | --------------------------------------------------- | ------------------------------------------------------- |
| `Total`  | `number`                                            | Размер файловой системы, байт                           |
| `Used`   | `number`                                            | Занято, байт                                            |
| `Free`   | `number`                                            | Свободно, байт                                          |
| `List`   | `{ Name: string; Size: number }[]`                  | Файлы: полный путь (его же принимает `Delete`) и размер |
| `Upload` | `{ Name: string; Size: number; Progress: number }?` | Текущая закачка, `Progress` 0–100 с шагом 5%            |

## Примеры

```svelte
<script>
  import * as UI from "poe-svelte-ui-lib"

  let fs = { Total: 1441792, Used: 98304, Free: 1343488, List: [{ Name: "/storage/cert.pem", Size: 1834 }] }
</script>

<UI.WidgetFileSystem
  value={fs}
  accept=".bin, .txt, .pem"
  onRefresh={() => console.log("GET FS")}
  onDelete={(name) => console.log("SET FS", { Op: "Delete", Name: name })}
  onUpload={async (file) => console.log("SET FS UploadStart/UploadChunk/UploadDone", file.name)}
/>
```

## Конструктор свойств (WidgetFileSystemProps.svelte)

| Название           | Тип                                                                                             | Описание                                  |
| ------------------ | ----------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `component`        | `UIComponent & { properties: Partial<IWidgetFileSystemProps> }`                                 | Объект компонента с его свойствами        |
| `onPropertyChange` | `(updates: Partial<{ properties?: string \| object; name?: string; access?: string }>) => void` | Коллбэк для обновления свойств компонента |

Группы панели: общие (заголовок, префикс группы, мастер-цвет), закачка (`accept`,
`maxNameLength`), устройство (поле `FS`, аргумент команд).
