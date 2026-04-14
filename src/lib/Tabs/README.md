# Tabs Component

## Описание

Вкладки - это UI-компонент, который позволяет организовать контент в виде переключаемых вкладок. Компонент поддерживает настройку внешнего вида вкладок, иконок, позиционирования текста и иконки, ширину вкладок, а также другие параметры через систему пропсов.

## Пропсы

| Название     | Тип                                                                                                                                                      | По умолчанию                                                                     | Описание                                |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------- |
| id           | string                                                                                                                                                   | crypto.randomUUID()                                                              | Уникальный идентификатор компонента     |
| wrapperClass | string                                                                                                                                                   | "bg-blue"                                                                        | CSS-классы для обертки компонента       |
| size         | { width: number; height: number }                                                                                                                        | { width: 12, height: 6 }                                                         | Размеры сетки содержимого вкладок       |
| activeTab    | number                                                                                                                                                   | 0                                                                                | Индекс активной вкладки                 |
| items        | { name: string; icon?: string \| ConstructorOfATypedSvelteComponent; class?: string; disabled?: boolean; onClick?: () => void; children?: () => void }[] | [{ name: "tab 1", icon: "", class: "" }, { name: "tab 2", icon: "", class: "" }] | Массив элементов вкладок                |
| children     | (item: any) => void                                                                                                                                      | undefined                                                                        | Слот для содержимого вкладок            |
| apiArray     | any[]                                                                                                                                                    | []                                                                               | Массив данных для отображения через API |
| Components   | (comp: any, isRoot: boolean) => void                                                                                                                     | undefined                                                                        | Функция для отображения компонентов     |

### Вложенные типы

#### Items

| Название | Тип                                          | Описание                                  |
| -------- | -------------------------------------------- | ----------------------------------------- |
| name     | string                                       | Название вкладки                          |
| icon     | string \| ConstructorOfATypedSvelteComponent | Иконка вкладки (SVG строка или компонент) |
| class    | string                                       | CSS-классы для стилизации вкладки         |
| disabled | boolean                                      | Состояние отключения вкладки              |
| onClick  | () => void                                   | Обработчик клика по вкладке               |
| children | () => void                                   | Слот для содержимого вкладки              |

#### Size

| Название | Тип    | По умолчанию | Описание                               |
| -------- | ------ | ------------ | -------------------------------------- |
| width    | number | 12           | Количество колонок в сетке содержимого |
| height   | number | 6            | Количество строк в сетке содержимого   |

## События

Компонент не генерирует специфические события, но поддерживает обработчики кликов по вкладкам через свойство `onClick` в элементах массива `items`.

## Примеры

### Базовые вкладки

```svelte
<script>
  import * as UI from "poe-svelte-ui-lib"
</script>

<UI.Tabs
  items={[{ name: "Tab1" }, { name: "Tab2" }, { name: "Tab3" }, { name: "Tab4" }]}
  children={Tab}
  size={{ height: 1, width: 1 }}
/>
{#snippet Tab(item: { name: string })}
  <div>
    <h5>Content of {item.name}</h5>
  </div>
{/snippet}
```

### Вкладки с иконками

```svelte
<script>
  import * as UI from "poe-svelte-ui-lib"
  import IconGripHorizontalUp from "./appIcons/IconGripHorizontalUp.svelte"
  import IconGripVerticalRight from "./appIcons/IconGripVerticalRight.svelte"
  import IconGripHorizontalDown from "./appIcons/IconGripHorizontalDown.svelte"
  import IconGripVerticalLeft from "./appIcons/IconGripVerticalLeft.svelte"
</script>

<UI.Tabs
  items={[
    { name: "Tab1", icon: IconGripHorizontalUp, class: "flex-col" },
    { name: "Tab2", icon: IconGripVerticalRight, class: "flex-row-reverse" },
    { name: "Tab3", icon: IconGripHorizontalDown, class: "flex-col-reverse" },
    { name: "Tab4", icon: IconGripVerticalLeft, class: "" },
  ]}
  children={Tab}
  size={{ height: 1, width: 1 }}
/>
{#snippet Tab(item: { name: string })}
  <div>
    <h5>Content of {item.name}</h5>
  </div>
{/snippet}
```

### Вкладки с настраиваемыми классами

```svelte
<script>
  import * as UI from "poe-svelte-ui-lib"
</script>

<UI.Tabs
  items={[
    { name: "Tab1", class: "w-1/4" },
    { name: "Tab2", class: "w-1/4" },
    { name: "Tab3", class: "w-1/4" },
    { name: "Tab4", class: "w-1/4" },
  ]}
  children={Tab}
  size={{ height: 1, width: 1 }}
/>
{#snippet Tab(item: { name: string })}
  <div>
    <h5>Content of {item.name}</h5>
  </div>
{/snippet}
```

## Внутренняя архитектура

### Реактивность

- Переменная `currentTabIndex` управляет индексом активной вкладки
- Переменная `isCol` определяет ориентацию вкладок (колонка или строка)
- Функция `onclick` переключает активную вкладку при клике

### Сторы и зависимости

- Используется стор `twMerge` для объединения Tailwind CSS классов
- Используется `optionsStore` для получения цветовых опций

### Директивы

- `#each` для отображения списка вкладок
- `bind:this` для получения ссылок на DOM-элементы
- `$derived` для вычисления текущего индекса активной вкладки

### Слоты

- `children` - слот для содержимого вкладок
- Сниппеты для отображения содержимого каждой вкладки

## Конструктор свойств (TabsProps.svelte)

### Описание

Компонент `TabsProps.svelte` предоставляет визуальный интерфейс для редактирования свойств компонента вкладок. Поддерживает два режима отображения: для конструктора и для редактирования.

### Пропсы конструктора

| Название         | Тип                                                                                                                               | По умолчанию | Описание                                                |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------ | ------------------------------------------------------- |
| component        | UIComponent & { properties: Partial<ITabsProps> }                                                                                 | -            | Объект компонента с его свойствами                      |
| onPropertyChange | (updates: Partial<{ properties?: string \| object; name?: string; access?: string; eventHandler?: IUIComponentHandler }>) => void | -            | Коллбэк для обновления свойств компонента               |
| forConstructor   | boolean                                                                                                                           | true         | Режим отображения (для конструктора или редактирования) |

### Особенности конструктора

- Предоставляет визуальные элементы управления для всех доступных свойств
- Поддерживает настройку позиционирования иконки и текста
- Включает управление списком вкладок с возможностью добавления/удаления
- Имеет различные наборы полей в зависимости от режима (`forConstructor`)
- Использует систему локализации через `$t('constructor.props.*')`

## Заметки

### Адаптивность

- Компонент использует Tailwind CSS для адаптивного дизайна
- Вкладки автоматически адаптируются под размер контейнера
- Используются относительные единицы измерения для обеспечения масштабируемости

### Ограничения

- Максимальное количество вкладок ограничено 10
- При добавлении новых вкладок классы копируются из текущей цветовой схемы
- Содержимое вкладок отображается только для активной вкладки

### Производительность

- Компонент использует оптимизации Svelte для минимизации перерисовок
- Используется эффективное объединение классов через `twMerge`
- Содержимое вкладок рендерится только при активации соответствующей вкладки
