# FileAttach

Выбор файла. В интерфейсе устройства через него закачивают файл в память устройства: сертификат, прошивку, картинку.

## Назначение

Закачивает выбранный файл в файловую систему устройства.

## Пакет данных

- Выбранный файл приложение отправляет частями командой `SET FS`: `UploadStart`, затем `UploadChunk`, затем `UploadDone`.
- Файлы с устройства компонент не показывает.

## Ключи

| Ключ | Описание |
|---|---|
| `Name` | Имя файла, не длиннее 31 символа. Это ограничение прошивки |

## Особенности

Есть три вида (`type`):

- `file` - поле с именем выбранного файла;
- `image` - превью картинки, квадратное или круглое. Выбранная картинка сразу показывается, ещё до загрузки;
- `button` - кнопка-иконка «Открыть файл» для панелей инструментов, рядом с кнопками «Сохранить в файл» и подобными.

```svelte
<UI.FileAttach type="button" accept=".yaml,.gz" info={{ text: "Открыть файл", side: "top" }} onChange={(event, file) => open(file)} />
```

- Какие файлы можно выбрать, задаёт `accept` в формате HTML, например `.bin,.pem` или `image/*`.
- Сам файл компонент никуда не отправляет. Его получает `onChange`, а загрузкой занимается приложение.
- Список файлов, удаление и прогресс закачки показывает виджет «Файловая система» (`WidgetFileSystem`).

## Пропсы

| Название | Тип | По умолчанию | Описание |
|---|---|---|---|
| `id` | `string` | `crypto.randomUUID()` | Идентификатор |
| `wrapperClass` | `string` | `""` | Классы обёртки |
| `componentClass` | `string` | `""` | Классы поля с именем файла или кнопки |
| `label.name`, `label.class` | `string` | `""` | Заголовок и его классы |
| `type` | `"file" \| "image" \| "button"` | `"file"` | Вид |
| `accept` | `string` | `"*/*"` | Какие файлы можно выбрать |
| `imageSize` | `{ height, width, fitMode, form }` | `10rem`, `10rem`, `cover`, `square` | Размер превью, масштабирование (`cover`, `contain`) и форма (`square`, `circle`) |
| `currentImage` | `string \| null` | `""` | Текущая картинка: data-URL или base64. Можно связать через `bind:` |
| `info` | `{ text, side }` | | Только `button`: подсказка, как у `Button` |
| `icon` | `Component \| string` | документ со стрелкой | Только `button`: своя иконка |
| `disabled` | `boolean` | `false` | Неактивен |
| `onChange` | `(event, file \| null) => void` | | Выбран файл. `null`, если выбор сброшен |

## Пример

```svelte
<script>
  import * as UI from "poe-svelte-ui-lib"
  let avatar = $state("")
</script>

<UI.FileAttach label={{ name: "Сертификат" }} accept=".pem" onChange={(e, file) => upload(file)} />

<UI.FileAttach type="image" accept="image/*" imageSize={{ form: "circle" }} bind:currentImage={avatar} />
```

## Панель свойств (FileAttachProps.svelte)

В конструкторе выбирают вид (файл или картинка), размер и форму превью, допустимые файлы.
