# Table Component

## Описание

Таблица - это UI-компонент, который позволяет отображать данные в табличном формате с возможностью сортировки, фильтрации и взаимодействия с элементами. Компонент поддерживает различные типы содержимого столбцов (текст, изображения, кнопки, селекторы, индикаторы прогресса), настройки отображения и другие параметры через систему пропсов.

## Пропсы

| Название     | Тип                                                                                                                              | По умолчанию                                                                                            | Описание                                         |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| id           | string                                                                                                                           | crypto.randomUUID()                                                                                     | Уникальный идентификатор компонента              |
| wrapperClass | string                                                                                                                           | ""                                                                                                      | Дополнительные CSS-классы для обертки компонента |
| label        | { name?: string; class?: string }                                                                                                | { name: "", class: "" }                                                                                 | Настройки заголовка компонента                   |
| body         | any[]                                                                                                                            | $bindable()                                                                                             | Данные таблицы (для двусторонней привязки)       |
| header       | ITableHeader[]                                                                                                                   | []                                                                                                      | Определение столбцов таблицы                     |
| footer       | string                                                                                                                           | ""                                                                                                      | Текст нижнего колонтитула таблицы                |
| dataBuffer   | { stashData?: boolean; bufferSize?: number; clearButton?: boolean; clearClass?: string; logger?: boolean; visibleRows?: number } | { stashData: false, bufferSize: 10, clearButton: false, clearClass: "", logger: false, visibleRows: 5 } | Настройки буфера данных                          |
| outline      | boolean                                                                                                                          | false                                                                                                   | Показывать обводку строк и столбцов              |
| cursor       | any                                                                                                                              | null                                                                                                    | Курсор для подгрузки данных                      |
| loader       | any                                                                                                                              | undefined                                                                                               | Загрузчик данных                                 |
| autoscroll   | boolean                                                                                                                          | false                                                                                                   | Включить автопрокрутку                           |
| getData      | () => void                                                                                                                       | () => {}                                                                                                | Функция получения данных                         |
| onClick      | (eventHandler: any) => void                                                                                                      | undefined                                                                                               | Обработчик клика по элементу таблицы             |

### Вложенные типы

#### Label

| Название | Тип    | По умолчанию | Описание                                   |
| -------- | ------ | ------------ | ------------------------------------------ |
| name     | string | ""           | Текст заголовка компонента                 |
| class    | string | ""           | CSS-классы для стилизации текста заголовка |

#### DataBuffer

| Название    | Тип     | По умолчанию | Описание                                        |
| ----------- | ------- | ------------ | ----------------------------------------------- |
| stashData   | boolean | false        | Включить буферизацию данных                     |
| bufferSize  | number  | 10           | Размер буфера данных                            |
| clearButton | boolean | false        | Показывать кнопку очистки буфера                |
| clearClass  | string  | ""           | CSS-класс для кнопки очистки                    |
| logger      | boolean | false        | Режим журнала (добавление в начало)             |
| visibleRows | number  | 5            | Количество видимых строк при ограничении высоты |

#### ITableHeader

| Название | Тип                                                                                             | Описание                    |
| -------- | ----------------------------------------------------------------------------------------------- | --------------------------- |
| label    | { name: string; class?: string }                                                                | Настройки заголовка столбца |
| key      | string                                                                                          | Ключ для доступа к данным   |
| width    | string                                                                                          | Ширина столбца              |
| sortable | boolean                                                                                         | Возможность сортировки      |
| align    | "left" \| "center" \| "right"                                                                   | Выравнивание содержимого    |
| overflow | { truncated?: boolean; copy?: boolean; modal?: boolean; formatting?: (text: string) => string } | Настройки переполнения      |
| action   | { type: "buttons"; buttons: ITableButton[] }                                                    | Действия для столбца        |
| content  | ITableContent[] \| (row: any) => ITableContent[]                                                | Содержимое столбца          |

## События

| Название | Тип                         | Описание                                                     |
| -------- | --------------------------- | ------------------------------------------------------------ |
| onClick  | (eventHandler: any) => void | Срабатывает при клике по элементу таблицы (например, кнопке) |

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
        "data:image/svg+xml;base64,PHN2ZyBiYXNlUHJvZmlsZT0iZnVsbCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iNTIxIiBoZWlnaHQ9IjQ3NyI+DQo8ZGVmcz4NCjxzdHlsZT5jaXJjbGU,cGF0aCxwb2x5bGluZXtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmR9PC9zdHlsZT4NCjwvZGVmcz4NCjxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzc3NyIgc3Ryb2tlLXdpZHRoPSIxMCIgZD0iTTExNi42MyAxODguNjJsODMgNTIiLz4NCjxjaXJjbGUgY3g9Ijg0LjgzIiBjeT0iMTY4LjgzIiByPSIzNi44MyIgZmlsbD0iIzIyMiIgc3Ryb2tlPSIjNzc3IiBzdHJva2Utd2lkdGg9IjEwIi8+DQo8cGF0aCBmaWxsPSJub25lIiBzdHJva2U9IiM3NzciIHN0cm9rZS13aWR0aD0iMTAiIGQ9Ik00MDkuMDMgMzgwLjAzbC04My01MiIvPg0KPGNpcmNsZSBjeD0iNDQwLjgzIiBjeT0iMzk5LjgzIiByPSIzNi44MyIgZmlsbD0iIzIyMiIgc3Ryb2tlPSIjNzc3IiBzdHJva2Utd2lkdGg9IjEwIi8+DQo8cGF0aCBmaWxsPSJub25lIiBzdHJva2U9IiM1OUYiIHN0cm9rZS13aWR0aD0iMTAiIGQ9Ik0xMTIuMDMgMzc5LjAzbDgzLTUyTTI2Mi4wMyAyMDQuMDN2LTg4Ii8+DQo8Y2lyY2xlIGN4PSIyNjEuMzMiIGN5PSIyODQuMzMiIHI9Ijc4LjMzIiBmaWxsPSIjZmZmIiBzdHJva2U9IiM1OUYiIHN0cm9rZS13aWR0aD0iMTUiLz4NCjxjaXJjbGUgY3g9Ijc2LjgzIiBjeT0iMzk5LjgzIiByPSIzNi44MyIgZmlsbD0iI2ZmZiIgc3Ryb2tlPSIjNTlGIiBzdHJva2Utd2lkdGg9IjEwIi8+DQo8Y2lyY2xlIGN4PSIyNjAuODMiIGN5PSI3Ni44MyIgcj0iMzYuODMiIGZpbGw9IiNmZmYiIHN0cm9rZT0iIzU5RiIgc3Ryb2tlLXdpZHRoPSIxMCIvPg0KPHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNTlGIiBzdHJva2Utd2lkdGg9IjEwIiBkPSJNNDY1IDM0MEM1MTMgMTQyIDMyOSA3OSAzMjkgNzlNNDI3IDMzMWM0MC0xNjItMTEwLTIxMy0xMTAtMjEzTTM4OSAzMTljMzEtMTI1LTg2LTE2NS04Ni0xNjUiLz4NCjwvc3ZnPg==",
      name: "Device A",
      status: "online",
      lastActive: String(new Date()),
    },
    {
      id: "# 2",
      imageUrl:
        "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+DQo8c3ZnDQogICB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iDQogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjDQogICB4bWxuczp0ZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiDQogICB4bWxuczpzdmc9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnDQogICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciDQogICB4bWxuczpzb2RpcG9kaT0iaHR0cDovL3NvZGlwb2RpLnNvdXJjZWZvcmdlLm5ldC9EVEQvc29kaXBvZGktMC5kdGQiDQogICB4bWxuczppbmtzY2FwZT0iaHR0cDovL3d3dy5pbmtzY2FwZS5vcmcgbmFtZXNwYWNlcy9pbmtzY2FwZSIgDQogICBpZD0ic3ZnOCIgDQogICB2ZXJzaW9uPSIxLjEiDQogICB2aWV3Qm94PSIwIDAgMTMuMjI5MTY2IDEzLjIyOTE2NiINCiAgIGhlaWdodD0iMTMuMjI5MTY2bW0iDQogICB3aWR0aD0iMTMuMjI5MTY2bW0iDQogICBzb2RpcG9kaTpkb2NuYW1lPSJNdWx0aSBTd2l0Y2ggdjEyLnN2ZyINCiAgIGlua3NjYXBlOnZlcnNpb249IjAuOTIuMSByMTUzNzEiDQogICBpbmtzY2FwZTpleHBvcnQtZmlsZW5hbWU9IkQ6XGFud29ya1zQmNC60L7QvdC60Lgg0YPRgdGC0YDQvtC50YHRgtCyXE11bHRpIFN3aXRjaCB2MTEucG5nIg0KICAgaW5rc2NhcGU6ZXhwb3J0LXhkcGk9IjIzMC40MDAwMSINCiAgIGlua3NjYXBlOmV4cG9ydC15ZHBpPSIyMzAuNDAwMDEiPg0KICA8c29kaXBvZGk6bmFtZWR2aWV3DQogICAgIHBhZ2Vjb2xvcj0iI2ZmZmZmZiINCiAgICAgYm9yZGVyY29sb3I9IiM2NjY2NjYiDQogICAgIGJvcmRlcm9wYWNpdHk9IjEiDQogICAgIG9iamVjdHRvbGVyYW5jZT0iMTAiDQogICAgIGdyaWR0b2xlcmFuY2U9IjEwIg0KICAgICBndWlkZXRvbGVyYW5jZT0iMTAiDQogICAgIGlua3NjYXBlOnBhZ2VvcGFjaXR5PSIwIg0KICAgICBpbmtzY2FwZTpwYWdlc2hhZG93PSIyIg0KICAgICBpbmtzY2FwZTp3aW5kb3ctd2lkdGg9IjE5MjAiDQogICAgIGlua3NjYXBlOndpbmRvdy1oZWlnaHQ9IjEwMTciDQogICAgIGlkPSJuYW1lZHZpZXcxOSINCiAgICAgc2hvd2dyaWQ9ImZhbHNlIg0KICAgICBpbmtzY2FwZTp6b29tPSIxMy4zNTAxNzciDQogICAgIGlua3NjYXBlOmN4PSI3LjkyNjAxMDYiDQogICAgIGlua3NjYXBlOmN5PSIyMi41NjgwMjIiDQogICAgIGlua3NjYXBlOndpbmRvdy14PSItOCINCiAgICAgaW5rc2NhcGU6d2luZG93LXk9Ii04Ig0KICAgICBpbmtzY2FwZTp3aW5kb3ctbWF4aW1pemVkPSIxIg0KICAgICBpbmtzY2FwZTpjdXJyZW50LWxheWVyPSJzdmc4IiAvPg0KICA8ZGVmcw0KICAgICBpZD0iZGVmczIiPg0KICAgIDxtYXJrZXINCiAgICAgICBpbmtzY2FwZTpzdG9ja2lkPSJFbXB0eVRyaWFuZ2xlT3V0TSINCiAgICAgICBvcmllbnQ9ImF1dG8iDQogICAgICAgcmVmWT0iMC4wIg0KICAgICAgIHJlZlg9IjAuMCINCiAgICAgICBpZD0ibWFya2VyNTQ3NSINCiAgICAgICBzdHlsZT0ib3ZlcmZsb3c6dmlzaWJsZSINCiAgICAgICBpbmtzY2FwZTppc3N0b2NrPSJ0cnVlIj4NCiAgICAgIDxwYXRoDQogICAgICAgICBpZD0icGF0aDU0NzMiDQogICAgICAgICBkPSJNIDUuNzcsMC4wIEwgLTIuODgsNS4wIEwgLTIuODgsLTUuMCBMIDUuNzcsMC4wIHogIg0KICAgICAgICAgc3R5bGU9ImZpbGwtcnVsZTpldmVub2RkO2ZpbGw6I2ZmZmZmZjtzdHJva2U6Izc3Nzc3NztzdHJva2Utd2lkdGg6MXB0O3N0cm9rZS1vcGFjaXR5OjEiDQogICAgICAgICB0cmFuc2Zvcm09InNjYWxlKDAuNCkgdHJhbnNsYXRlKC00LjUsMCkiIC8+DQogICAgPC9tYXJrZXI+DQogICAgPG1hcmtlcg0KICAgICAgIGlua3NjYXBlOmlzc3RvY2s9InRydWUiDQogICAgICAgc3R5bGU9Im92ZXJmbG93OnZpc2libGUiDQogICAgICAgaWQ9Im1hcmtlcjUxMTEiDQogICAgICAgcmVmWD0iMC4wIg0KICAgICAgIHJlZlk9IjAuMCINCiAgICAgICBvcmllbnQ9ImF1dG8iDQogICAgICAgaW5rc2NhcGU6c3RvY2tpZD0iRW1wdHlUcmlhbmdsZU91dE0iPg0KICAgICAgPHBhdGgNCiAgICAgICAgIHRyYW5zZm9ybT0ic2NhbGUoMC40KSB0cmFuc2xhdGUoLTQuNSwwKSINCiAgICAgICAgIHN0eWxlPSJmaWxsLXJ1bGU6ZXZlbm9kZDtmaWxsOiM3Nzc3Nzc7c3Ryb2tlOiM3Nzc3Nzc7c3Ryb2tlLXdpZHRoOjFwdDtzdHJva2Utb3BhY2l0eToxO2ZpbGwtb3BhY2l0eToxIg0KICAgICAgICAgZD0iTSA1Ljc3LDAuMCBMIC0yLjg4LDUuMCBMIC0yLjg4LC01LjAgTCA1Ljc3LDAuMCB6ICINCiAgICAgICAgIGlkPSJwYXRoNTEwOSIgLz4NCiAgICA8L21hcmtlcj4NCiAgICA8bWFya2VyDQogICAgICAgaW5rc2NhcGU6c3RvY2tpZD0iRW1wdHlUcmlhbmdsZU91dE0iDQogICAgICAgb3JpZW50PSJhdXRvIg0KICAgICAgIHJlZlk9IjAuMCINCiAgICAgICByZWZYPSIwLjAiDQogICAgICAgaWQ9IkVtcHR5VHJpYW5nbGVPdXRNIg0KICAgICAgIHN0eWxlPSJvdmVyZmxvdzp2aXNpYmxlIg0KICAgICAgIGlua3NjYXBlOmlzc3RvY2s9InRydWUiDQogICAgICAgaW5rc2NhcGU6Y29sbGVjdD0iYWx3YXlzIj4NCiAgICAgIDxwYXRoDQogICAgICAgICBpZD0icGF0aDQ5NzYiDQogICAgICAgICBkPSJNIDUuNzcsMC4wIEwgLTIuODgsNS4wIEwgLTIuODgsLTUuMCBMIDUuNzcsMC4wIHogIg0KICAgICAgICAgc3R5bGU9ImZpbGwtcnVsZTpldmVub2RkO2ZpbGw6Izc3Nzc3NztzdHJva2U6Izc3Nzc3NztzdHJva2Utd2lkdGg6MXB0O3N0cm9rZS1vcGFjaXR5OjE7ZmlsbC1vcGFjaXR5OjEiDQogICAgICAgICB0cmFuc2Zvcm09InNjYWxlKDAuNCkgdHJhbnNsYXRlKC00LjUsMCkiIC8+DQogICAgPC9tYXJrZXI+DQogICAgPGxpbmVhckdyYWRpZW50DQogICAgICAgaWQ9ImEiPg0KICAgICAgPHN0b3ANCiAgICAgICAgIGlkPSJzdG9wMTAiDQogICAgICAgICBzdG9wLWNvbG9yPSIjZDllYzAwIg0KICAgICAgICAgb2Zmc2V0PSIwIiAvPg0KICAgICAgPHN0b3ANCiAgICAgICAgIGlkPSJzdG9wMTIiDQogICAgICAgICBzdG9wLW9wYWNpdHk9IjAiDQogICAgICAgICBzdG9wLWNvbG9yPSIjZjdmZjk4Ig0KICAgICAgICAgb2Zmc2V0PSIxIiAvPg0KICAgIDwvbGluZWFyR3JhZGllbnQ+DQogIDwvZGVmcz4NCiAgPG1ldGFkYXRhDQogICAgIGlkPSJtZXRhZGF0YTUiPg0KICAgIDxyZGY6UkRGPg0KICAgICAgPGNjOldvcmsNCiAgICAgICAgIHJkZjphYm91dD0iIj4NCiAgICAgICAgPGRjOmZvcm1hdD5pbWFnZS9zdmcreG1sPC9kYzpmb3JtYXQ+DQogICAgICAgIDxkYzp0eXBlDQogICAgICAgICAgIHJkZjpyZXNvdXJjZT0iaHR0cDovL3B1cmwub3JnL2RjL2RjbWl0eXBlL1N0aWxsSW1hZ2UiIC8+DQogICAgICAgIDxkYzp0aXRsZT48L2RjOnRpdGxlPg0KICAgICAgPC9jYzpXb3JrPg0KICAgIDwvcmRmOlJERj4NCiAgPC9tZXRhZGF0YT4NCiAgPGNpcmNsZQ0KICAgICBzdHlsZT0ib3BhY2l0eToxO2ZpbGw6bm9uZTtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6I2UwNjY2NjtzdHJva2Utd2lkdGg6MC43OTM3NTAwNTtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLW1pdGVybGltaXQ6NDtzdHJva2UtZGFzaGFycmF5Om5vbmU7c3Ryb2tlLW9wYWNpdHk6MTtwYWludC1vcmRlcjpzdHJva2UgZmlsbCBtYXJrZXJzIg0KICAgICBpZD0icGF0aDQ1MTYiDQogICAgIGN4PSI2LjYxNDU4MyINCiAgICAgY3k9IjYuNjE0NTgzIg0KICAgICByPSI2LjIxNzcwODYiDQogICAgIGlua3NjYXBlOmV4cG9ydC14ZHBpPSIyMzAuMzk5OTkiDQogICAgIGlua3NjYXBlOmV4cG9ydC15ZHBpPSIyMzAuMzk5OTkiIC8+DQogIDxjaXJjbGUNCiAgICAgaW5rc2NhcGU6ZXhwb3J0LXlkcGk9IjIzMC4zOTk5OSINCiAgICAgaW5rc2NhcGU6ZXhwb3J0LXhkcGk9IjIzMC4zOTk5OSINCiAgICAgcj0iNi41NDg0Mzc2Ig0KICAgICBjeT0iNi42MTQ1ODMiDQogICAgIGN4PSI2LjYxNDU4MyINCiAgICAgaWQ9ImNpcmNsZTQ0OTUiDQogICAgIHN0eWxlPSJvcGFjaXR5OjE7ZmlsbDpub25lO2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTojNTU1NTU1O3N0cm9rZS13aWR0aDowLjEzMjI5MTY3O3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2UtbWl0ZXJsaW1pdDo0O3N0cm9rZS1kYXNoYXJyYXk6bm9uZTtzdHJva2Utb3BhY2l0eToxO3BhaW50LW9yZGVyOnN0cm9rZSBmaWxsIG1hcmtlcnMiIC8+DQogIDxwYXRoDQogICAgIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiNlMDY2NjY7c3Ryb2tlLXdpZHRoOjAuNjYxNDU4Mzc7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS1taXRlcmxpbWl0OjQ7c3Ryb2tlLWRhc2hhcnJheTpub25lO3N0cm9rZS1vcGFjaXR5OjEiDQogICAgIGQ9Ik0gNi41NjgyNjEsMy43NjYxNzA2IFYgNi42MDQyMzQyIg0KICAgICBpZD0icGF0aDQ1MzEtOSINCiAgICAgaW5rc2NhcGU6Y29ubmVjdG9yLWN1cnZhdHVyZT0iMCINCiAgICAgaW5rc2NhcGU6ZXhwb3J0LXhkcGk9IjIzMC40MDAwMSINCiAgICAgaW5rc2NhcGU6ZXhwb3J0LXlkcGk9IjIzMC40MDAwMSIgLz4NCiAgPHBhdGgNCiAgICAgc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6I2UwNjY2NjtzdHJva2Utd2lkdGg6MC42NjE0NTgzNztzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLW1pdGVybGltaXQ6NDtzdHJva2UtZGFzaGFycmF5Om5vbmU7c3Ryb2tlLW9wYWNpdHk6MSINCiAgICAgZD0iTSA5LjQ1NDY5Nyw2LjYwNDIzNDIgSCA2LjU2ODI2MSINCiAgICAgaWQ9InBhdGg0NTM3Ig0KICAgICBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIwIg0KICAgICBpbmtzY2FwZTpleHBvcnQteGRwaT0iMjMwLjQwMDAxIg0KICAgICBpbmtzY2FwZTpleHBvcnQteWRwaT0iMjMwLjQwMDAxIiAvPg0KICA8cmVjdA0KICAgICBzdHlsZT0ib3BhY2l0eToxO2ZpbGw6I2UwNjY2NjtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6Izc3Nzc3NztzdHJva2Utd2lkdGg6MC41MjkxNjY2ODtzdHJva2UtbGluZWNhcDpzcXVhcmU7c3Ryb2tlLWxpbmVqb2luOm1pdGVyO3N0cm9rZS1taXRlcmxpbWl0OjQ7c3Ryb2tlLWRhc2hhcnJheTpub25lO3N0cm9rZS1vcGFjaXR5OjE7cGFpbnQtb3JkZXI6c3Ryb2tlIGZpbGwgbWFya2VycyINCiAgICAgaWQ9InJlY3Q0NTIyIg0KICAgICB3aWR0aD0iMS4zNjc0OTEyIg0KICAgICBoZWlnaHQ9IjEuMzY3NDkxMiINCiAgICAgeD0iOC44MzE3MjUxIg0KICAgICB5PSI4LjkxMTA0MTMiDQogICAgIHJ4PSIwLjIzODIzNzExIg0KICAgICByeT0iMC4yMzgyMzcxMSIgLz4NCiAgPHJlY3QNCiAgICAgc3R5bGU9Im9wYWNpdHk6MTtmaWxsOm5vbmU7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOiM3Nzc3Nzc7c3Ryb2tlLXdpZHRoOjAuMjY0NTgzMzU7c3Ryb2tlLWxpbmVjYXA6c3F1YXJlO3N0cm9rZS1saW5lam9pbjptaXRlcjtzdHJva2UtbWl0ZXJsaW1pdDo0O3N0cm9rZS1kYXNoYXJyYXk6bm9uZTtzdHJva2Utb3BhY2l0eToxO3BhaW50LW9yZGVyOnN0cm9rZSBmaWxsIG1hcmtlcnMiDQogICAgIGlkPSJyZWN0NTk4MiINCiAgICAgd2lkdGg9IjEuNTkxNzE0NCINCiAgICAgaGVpZ2h0PSIxLjU5MTcxNDQiDQogICAgIHg9IjIuODYwNDYxNyINCiAgICAgeT0iMi45MTk3MzI2Ig0KICAgICByeD0iMC4yOTQyOTI5Ig0KICAgICByeT0iMC4yOTQyOTI5IiAvPg0KICA8cGF0aA0KICAgICBzdHlsZT0ib3BhY2l0eToxO2ZpbGw6bm9uZTtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6Izc3Nzc3NztzdHJva2Utd2lkdGg6MC4yNjQ1ODMzNTtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLW1pdGVybGltaXQ6NDtzdHJva2UtZGFzaGFycmF5Om5vbmU7c3Ryb2tlLW9wYWNpdHk6MTttYXJrZXItZW5kOnVybCgjRW1wdHlUcmlhbmdsZU91dE0pO3BhaW50LW9yZGVyOnN0cm9rZSBmaWxsIG1hcmtlcnMiDQogICAgIGlkPSJjaXJjbGU0ODExIg0KICAgICBpbmtzY2FwZTpleHBvcnQteGRwaT0iMjMwLjM5OTk5Ig0KICAgICBpbmtzY2FwZTpleHBvcnQteWRwaT0iMjMwLjM5OTk5Ig0KICAgICBzb2RpcG9kaTp0eXBlPSJhcmMiDQogICAgIHNvZGlwb2RpOmN4PSI2LjYxNDU4MyINCiAgICAgc29kaXBvZGk6Y3k9IjYuNjE0NTgzIg0KICAgICBzb2RpcG9kaTpyeD0iNC4zNjIyNjE4Ig0KICAgICBzb2RpcG9kaTpyeT0iNC4zNjIyNjE4Ig0KICAgICBzb2RpcG9kaTpzdGFydD0iNC4zNDIxMDgxIg0KICAgICBzb2RpcG9kaTplbmQ9IjAuMzYzODY3MTIiDQogICAgIHNvZGlwb2RpOm9wZW49InRydWUiDQogICAgIGQ9Ik0gNS4wMzU5Nzk1LDIuNTQ3OTcwMyBBIDQuMzYyMjYxOCw0LjM2MjI2MTggMCAwIDEgOS42ODkyNjAyLDMuNTIwMTIyMSA0LjM2MjI2MTgsNC4zNjIyNjE4IDAgMCAxIDEwLjY5MTIzNyw4LjE2NzA3MTkiIC8+DQogIDxwYXRoDQogICAgIGQ9Im0gLTguMTY2NjMwMSwtMTAuODQ3NDU5IGEgNC4zNjIyNjE4LDQuMzYyMjYxOCAwIDAgMSA0LjYyNTg1ODYsMS4wMDU3MDM5IDQuMzYyMjYxOCw0LjM2MjI2MTggMCAwIDEgMC45ODUyNjUxLDQuNjMwMjU1Ig0KICAgICBzb2RpcG9kaTpvcGVuPSJ0cnVlIg0KICAgICBzb2RpcG9kaTplbmQ9IjAuMzYzODY3MTIiDQogICAgIHNvZGlwb2RpOnN0YXJ0PSI0LjM1MjkzODIiDQogICAgIHNvZGlwb2RpOnJ5PSI0LjM2MjI2MTgiDQogICAgIHNvZGlwb2RpOnJ4PSI0LjM2MjI2MTgiDQogICAgIHNvZGlwb2RpOmN5PSItNi43NjM5ODkiDQogICAgIHNvZGlwb2RpOmN4PSItNi42MzIxNjAyIg0KICAgICBzb2RpcG9kaTp0eXBlPSJhcmMiDQogICAgIGlua3NjYXBlOmV4cG9ydC15ZHBpPSIyMzAuMzk5OTkiDQogICAgIGlua3NjYXBlOmV4cG9ydC14ZHBpPSIyMzAuMzk5OTkiDQogICAgIGlkPSJwYXRoNTEwNyINCiAgICAgc3R5bGU9Im9wYWNpdHk6MTtmaWxsOm5vbmU7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOiM3Nzc3Nzc7c3Ryb2tlLXdpZHRoOjAuMjY0NTgzMzU7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS1taXRlcmxpbWl0OjQ7c3Ryb2tlLWRhc2hhcnJheTpub25lO3N0cm9rZS1vcGFjaXR5OjE7bWFya2VyLWVuZDp1cmwoI21hcmtlcjUxMTEpO3BhaW50LW9yZGVyOnN0cm9rZSBmaWxsIG1hcmtlcnMiDQogICAgIHRyYW5zZm9ybT0ic2NhbGUoLTEpIiAvPg0KPC9zdmc+DQo=",
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

| Название         | Тип                                                                                                                               | По умолчанию | Описание                                                |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------ | ------------------------------------------------------- |
| component        | UIComponent & { properties: Partial<ITableProps<object>> }                                                                        | -            | Объект компонента с его свойствами                      |
| onPropertyChange | (updates: Partial<{ properties?: string \| object; name?: string; access?: string; eventHandler?: IUIComponentHandler }>) => void | -            | Коллбэк для обновления свойств компонента               |
| forConstructor   | boolean                                                                                                                           | true         | Режим отображения (для конструктора или редактирования) |

### Особенности конструктора

- Предоставляет визуальные элементы управления для всех доступных свойств
- Поддерживает настройку столбцов таблицы с различными типами содержимого
- Включает настройки буфера данных, обводки и автопрокрутки
- Имеет различные наборы полей в зависимости от режима (`forConstructor`)
- Использует систему локализации через `$t('constructor.props.*')`

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
