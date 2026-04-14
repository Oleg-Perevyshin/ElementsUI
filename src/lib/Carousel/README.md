# Carousel Component

## Описание

Карусель - это интерактивный UI-компонент, который позволяет просматривать контент в виде прокручиваемой ленты с возможностью навигации по стрелкам.

## Пропсы

| Название     | Тип                               | По умолчанию                     | Описание                                                    |
| ------------ | --------------------------------- | -------------------------------- | ----------------------------------------------------------- |
| id           | string                            | crypto.randomUUID()              | Уникальный идентификатор компонента                         |
| wrapperClass | string                            | ""                               | Дополнительные CSS-классы для обертки компонента            |
| label        | { name?: string; class?: string } | { name: "", class: "text-left" } | Настройки заголовка карусели                                |
| scrollValue  | number                            | 200                              | Значение прокрутки при нажатии на стрелки (в пикселях)      |
| children     | Snippet                           | undefined                        | Слот для содержимого, которое будет отображаться в карусели |

### Вложенные типы

#### Label

| Название | Тип    | По умолчанию | Описание                                   |
| -------- | ------ | ------------ | ------------------------------------------ |
| name     | string | ""           | Текст заголовка карусели                   |
| class    | string | "text-left"  | CSS-классы для стилизации текста заголовка |

## События

Компонент не генерирует специфические события.

## Примеры

### Базовое использование

```svelte
<script>
  import * as UI from "poe-svelte-ui-lib"
</script>

<UI.Carousel scrollValue={200}>
  <div class="w-90 min-w-90 h-20 bg-white p-2">
    <div class="mr-2 flex flex-col items-end">
      <h5 class="flex items-center whitespace-nowrap">COIV-REQE-J1U9-VCS7 |</h5>
      <p class="flex w-fit text-sm whitespace-nowrap gap-0.5">10.00.000-00_00007C9E0000BDE300000718:B2</p>
    </div>
  </div>
  <div class="w-90 min-w-90 h-20 bg-white p-2">
    <div class="mr-2 flex flex-col items-end">
      <h5 class="flex items-center whitespace-nowrap">COIV-REQE-J1U9-VCS7 |</h5>
      <p class="flex w-fit text-sm whitespace-nowrap gap-0.5">10.00.000-00_00007C9E0000BDE300000718:B2</p>
    </div>
  </div>
  <div class="w-90 min-w-90 h-20 bg-white p-2">
    <div class="mr-2 flex flex-col items-end">
      <h5 class="flex items-center whitespace-nowrap">COIV-REQE-J1U9-VCS7 |</h5>
      <p class="flex w-fit text-sm whitespace-nowrap gap-0.5">10.00.000-00_00007C9E0000BDE300000718:B2</p>
    </div>
  </div>
</UI.Carousel>
```

### С заголовком

```svelte
<script>
  import * as UI from "poe-svelte-ui-lib"
</script>

<UI.Carousel label={{ name: "Карусель с заголовком" }} scrollValue={300}>
  <div class="w-80 min-w-80 h-24 bg-blue-100 p-3 rounded-lg">
    <p>Элемент 1</p>
  </div>
  <div class="w-80 min-w-80 h-24 bg-green-100 p-3 rounded-lg">
    <p>Элемент 2</p>
  </div>
  <div class="w-80 min-w-80 h-24 bg-yellow-100 p-3 rounded-lg">
    <p>Элемент 3</p>
  </div>
  <div class="w-80 min-w-80 h-24 bg-red-100 p-3 rounded-lg">
    <p>Элемент 4</p>
  </div>
</UI.Carousel>
```

### С настраиваемым классом обертки

```svelte
<script>
  import * as UI from "poe-svelte-ui-lib"
</script>

<UI.Carousel wrapperClass="my-4 mx-auto max-w-4xl" scrollValue={150}>
  <div class="w-72 min-w-72 h-16 bg-purple-100 p-2 rounded-md">
    <p>Контент 1</p>
  </div>
  <div class="w-72 min-w-72 h-16 bg-pink-100 p-2 rounded-md">
    <p>Контент 2</p>
  </div>
  <div class="w-72 min-w-72 h-16 bg-indigo-100 p-2 rounded-md">
    <p>Контент 3</p>
  </div>
</UI.Carousel>
```

## Внутренняя архитектура

### Реактивность

- Переменная `carouselRef` хранит ссылку на DOM-элемент карусели
- Переменная `isAtStart` отслеживает, находится ли карусель в начале прокрутки
- Переменная `isAtEnd` отслеживает, находится ли карусель в конце прокрутки
- Функция `updateScrollState` обновляет состояния `isAtStart` и `isAtEnd` при прокрутке

### Сторы и зависимости

- Используется стор `twMerge` для объединения Tailwind CSS классов
- Применяется переход `slide` из `svelte/transition` для анимации стрелок навигации
- Используется `ResizeObserver` для отслеживания изменений размера

### Директивы

- `bind:this={carouselRef}` для получения ссылки на элемент карусели
- `transition:slide` для анимации стрелок навигации
- `$effect` для установки и очистки обработчиков событий

### Слоты

- `children` - слот для содержимого, которое отображается внутри карусели

## Заметки

### Адаптивность

- Компонент использует Tailwind CSS для адаптивного дизайна
- Стрелки навигации автоматически скрываются при достижении начала или конца карусели
- Используются относительные единицы измерения для обеспечения масштабируемости

### Ограничения

- Для корректного отображения элементы внутри карусели должны иметь фиксированную ширину
- Компонент не поддерживает вертикальную прокрутку
- Значение `scrollValue` влияет на величину прокрутки при нажатии стрелок

### Производительность

- Компонент использует оптимизации Svelte для минимизации перерисовок
- Обработчики событий и `ResizeObserver` корректно удаляются при размонтировании
- Используется эффективное объединение классов через `twMerge`
