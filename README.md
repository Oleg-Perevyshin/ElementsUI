# poe-svelte-ui-lib

Библиотека компонентов на Svelte 5 для интерфейсов устройств. Её используют три приложения, и компонент в каждом выглядит и работает одинаково:

- **DevCloud** - облако: конструктор интерфейса устройства, панель управления, отладка;
- **WebApp** - веб-интерфейс, который прошивка ProdFactory-ESP раздаёт с самого устройства;
- **DevTerminal** - настольный терминал для отладки через COM-порт.

Кроме компонентов, в библиотеке лежат ядро протоколов обмена с устройством, общий словарь команд, тема и переводы. Приложения не держат своих копий, всё берут отсюда.

Витрина с живыми примерами: [oleg-perevyshin.github.io/ElementsUI](https://oleg-perevyshin.github.io/ElementsUI/).

## Что внутри

**Смарт-виджеты.** Готовые блоки под одну задачу. Виджет сам работает с группой полей прошивки по префиксу, привязывать переменные по одной не нужно.

- `WidgetWiFi` - режим сети, подключение к точке доступа, своя точка доступа, поиск сетей.
- `WidgetDeviceInfo` - паспорт устройства, основные настройки, перезагрузка.
- `WidgetFileSystem` - занятая память, список файлов, загрузка и удаление.
- `WidgetStackInfo` - свободная память и запас стека задач, для отладки.
- `WidgetRGBStrip` - адресная светодиодная лента: цвет, эффекты, параметры.
- `WidgetPFD` - пилотажный дисплей: авиагоризонт, шкалы скорости и высоты, маршрут, сообщения автопилота.
- `WidgetMap` - карта с объектами и их траекториями.

**Компоненты.** Каждый привязывается к одной переменной устройства: `Input`, `Select`, `Switch`, `Slider`, `Button`, `Joystick`, `ProgressBar`, `Graph`, `PeriodChart`, `Table`, `FileAttach`, `VideoViewer`, `TextField`, `Widget`.

**Раскладка.** `Accordion`, `Tabs`, `Divider`, `Carousel`, `Modal`. У `Accordion` есть необязательный слот `actions` - кнопки справа в заголовке, нажатие на них блок не сворачивает.

**Ядро протоколов** (`poe-svelte-ui-lib/protocols`). Кодирование и разбор пакетов для всех каналов связи с устройством. Работает без Svelte, в том числе под Node.

**Тема** (`poe-svelte-ui-lib/theme.css`) и **языки** (`poe-svelte-ui-lib/locales`).

**Конструктор** (`poe-svelte-ui-lib/constructor`). Панели свойств, их общие части и словарь конструктора. Нужен только приложениям с конструктором, в бандл WebApp прошивки не попадает.

Полный список экспортов в `src/lib/index.ts` и `src/lib/constructor.ts`. У каждого компонента рядом с исходником есть свой README с пропсами и примерами.

## Установка

```bash
npm install poe-svelte-ui-lib
```

Приложению нужны `svelte` 5 и `tailwindcss` 4. Компоненты стилизуются утилитами Tailwind и переменными темы.

В `app.css` приложения:

```css
@import "tailwindcss";
@import "poe-svelte-ui-lib/theme.css";
@source "../node_modules/poe-svelte-ui-lib/dist";
@custom-variant dark (&:where(.dark, .dark *));
```

Ниже можно дописать только то, чем приложение отличается от остальных.

## Как пользоваться

```svelte
<script lang="ts">
  import * as UI from "poe-svelte-ui-lib"

  let value = $state("")
</script>

<UI.Input label={{ name: "Имя" }} bind:value type="text" />
<UI.Button content={{ name: "Сохранить" }} onClick={() => console.log(value)} />
```

Главное правило: компонент только показывает данные и сообщает об изменениях. Значения приходят через пропсы, изменения уходят колбэками. Сетью, WebSocket и хранилищем значений занимается приложение.

Смысл колбэков у всех компонентов один: `onUpdate` - принятое значение (Enter, уход из поля, отпущенный бегунок, выбор варианта), `onInput` - текущее значение во время ввода или перетаскивания. Значение всегда идёт первым аргументом. У `Select` значение - это `option.value`, а не сам вариант. Цвет компонента задаёт проп `accent` (роль темы: `gray`, `red`, `orange`, `yellow`, `green`, `cyan`, `blue`, `purple`), у `Button` ещё `variant`.

В DevCloud и WebApp значения устройства хранятся под ключами вида `<ModSN>|<ключ>`. Смарт-виджет читает свою группу целиком, например все поля `CFG.*` или `MAV.*`.

У каждого компонента есть парный `<Компонент>Props.svelte`. Это панель свойств для конструктора DevCloud, импорт из `poe-svelte-ui-lib/constructor` (в основной точке входа панелей нет). Импорт этой точки входа один раз, до отрисовки, подключает к `$T` словарь конструктора. Пропсы у всех панелей одинаковые:

| Пропс              | Что это                                                                                                                                   |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `component`        | Компонент интерфейса и его свойства                                                                                                       |
| `onPropertyChange` | `(change: PropertyChange) => void`: новые `properties`, `name`, `access`, `eventHandler`; приложение сливает их по ключам верхнего уровня |

Своя панель свойств строится на `createPropsEditor(component, onPropertyChange)`: `set`, `patch`, `addItem`, `updateItem`, `removeItem` отправляют новые объекты, сами свойства не меняются на месте.

## GUI устройства

GUI из конструктора рисует `GUIRenderer`. Он раскладывает сетку (18 колонок, строка `6rem`), вкладывает компоненты в `Accordion` и `Tabs` (по `parentId`, номер вкладки - после 35-го знака `id`), берёт значения переменных, разбирает битовые поля, собирает пакеты команд и ведёт смарт-виджеты и файлы. Приложение отвечает за транспорт, выбор модуля, загрузку GUI и хранилище значений.

```svelte
<UI.GUIRenderer components={module.UIBlocks} {link} persistKey={module.ModSN} viewer={!canManage} render={{ VideoViewer: video }} onError={addMessage} />
```

| Пропс        | Что это                                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------------------------- |
| `components` | `UIComponent[]` в формате 2.0 (`migrateGUI` применяется один раз к сохранённым GUI, рендерер его не вызывает) |
| `link`       | `DeviceLink` выбранного модуля, см. ниже                                                                      |
| `language`   | язык текстов GUI, по умолчанию язык библиотеки                                                                |
| `viewer`     | наблюдатель: видны только `access` `full` и `viewOnly`, управление отключено                                  |
| `persistKey` | ключ хранения в браузере (обычно `ModSN`): свёрнутость виджетов, планы `WidgetMap`                            |
| `render`     | своя отрисовка типа: `{ VideoViewer: snippet }`, сниппет получает компонент                                   |
| `onError`    | текст ошибки команды или передачи файла                                                                       |

```ts
interface DeviceLink {
  get(key: string, module?: string): unknown /* значение переменной без префикса модуля; module - другой модуль (keyCol таблицы) */
  set?(key: string, value: unknown): void /* своё значение до ответа устройства */
  send(header: string, argument: string, payload: Record<string, unknown>): unknown /* конверт DevSN/ModSN добавляет приложение */
  waitFor(
    argument: string,
    match: (reply: DeviceReply) => boolean,
    timeoutMs: number,
  ): Promise<DeviceReply | null> /* первый OK!/ER! с этим аргументом; null - таймаут */
}
interface DeviceReply {
  ok: boolean
  payload: Record<string, unknown>
  message?: string
}
```

`get` читает реактивное хранилище (`SvelteMap`), тогда рендерер обновляется сам. Ответы устройства приложение кладёт в хранилище функцией `mergeDevicePayload(values, "<ModSN>|", ARG, Payload)`: объект пишется целиком и по полям `имя-поле`, ход закачки `CFG.FS` дописывается к снимку, служебные поля `SET FS` пропускаются.

Правила рендерера - чистые функции, их можно звать и без него:

| Функция                                                 | Что делает                                                                                        |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `commandPacket(eventHandler, get, [key, value]?)`       | пакет компонента: `Value` - готовый Payload, иначе `Variables` (`группа-поле` - вложенный объект) |
| `tablePacket(eventHandler, row)`                        | пакет кнопки строки таблицы: `Variables` из строки, у списка поле без `-S`                        |
| `readBits` / `writeBits` / `bitRange`                   | битовое поле `Input` (`type: "bitMode"`) и `Select` (`bitMode`)                                   |
| `readWidgetFields(get, prefix, fields, keys)`           | значения полей смарт-виджета                                                                      |
| `widgetPacket(prefix, fields, values, keys)`            | Payload `SET ModCfg` виджета                                                                      |
| `WIDGET_FIELDS`, `WIDGET_SAVE_FIELDS`, `widgetPrefixes` | поля смарт-виджетов (из них выведены `IWidgetWiFiConfig` и остальные), сохраняемые поля, группы   |
| `GUI_GRID`, `spanRows`, `isWidgetType`                  | сетка                                                                                             |

Отправка `SET Restart` и `SET RstNVS` идёт через `link.send`, приложение может по ним показать состояние перезагрузки.

**Реестр.** `COMPONENTS[type]` - `{ view, io, fields? }`: компонент отрисовки, обмен с устройством (`none`, `read`, `write`, `readWrite`, `widget`) и поля смарт-виджета. `componentVariables(component)` - переменные устройства компонента (список переменных конструктора). `UIComponent` - объединение по `type`: после `component.type === "Button"` у `properties` тип `IButtonProps`, `UIComponent<"Button">` - компонент одного типа. В `poe-svelte-ui-lib/constructor`: `PANELS[type]` - панель свойств, `COMPONENT_DEFAULTS`, `COMPONENT_SIZES`, `minComponentWidth`, `createComponent(type, { col, row }, parentId, { tab, areaWidth })`, `applyPropertyChange(component, change)`.

**Файлы.** `createFsTransfer(transport, { argument = "FS", timeoutMs = 5000, retries = 3, maxNameLength = 31 })` - обмен файлами по `SET FS` прошивки: `upload(name, bytes | Blob, onProgress?)`, `download(name, onProgress?)` - `Uint8Array`, `list()` - снимок ФС, `remove(name)` - снимок после удаления. Размер чанка задаёт устройство, чанк после `ER!` или таймаута повторяется, целостность - CRC-32 (`crc32` в `poe-svelte-ui-lib/protocols`). Операции идут по очереди, общей для всех передач через один транспорт: рендерер и приложение могут работать с файлами одного устройства одновременно, сессии не пересекутся. Рендерер сам ведёт файлы `WidgetFileSystem` и `FileAttach`.

Рендерер и обмен файлами ничего не грузят из интернета. `WidgetMap` без сети через 10 с показывает «нет подключения»; для карты без интернета - `configureMapLibre`.

## Протоколы

Пакет `poe_cbor_pkt` один для CAN, CAN FD, RS485 и UART-консоли. В нём адрес получателя, адрес отправителя, команда и данные в CBOR. Библиотека умеет:

- собирать и разбирать пакеты, считать CRC;
- резать пакет на кадры CAN и CAN FD и собирать обратно, общаться со slcan-адаптером;
- разбирать поток консоли xPOE-Debug, где пакеты идут вперемешку с текстом загрузчика;
- показывать отладочные логи `DebugLog` и графики `DebugPlot` из прошивки;
- переводить значения между JSON и CBOR.

Байты совпадают с тем, что собирает прошивка. Это проверяет `npm run TestProtocols`: тесты сверяют результат с эталонными пакетами, собранными кодом прошивки.

Формат пакета, адресация, транспорты и список функций описаны в [PROTOCOL.md](src/lib/protocols/PROTOCOL.md).

## Словарь команд

Все команды (`GET`, `SET`, `ModCfg`, `Restart` и остальные) записаны в одном файле `src/lib/protocols/dictionary.yaml`. Из него генерируется `DEFAULT_ARGUMENT_CODES` для JS (`npm run Dictionary`, перед публикацией запускается сам).

Прошивки ProdFactory-ESP и ProdFactory-STM держат копию словаря в `.framework/Dictionary.yaml`. При сборке прошивки она сверяется с `api_har.h`. Новую команду сначала добавляют сюда, потом копируют в оба фреймворка.

## Тема

Тема одна для всех приложений. Эталоном служит DevCloud, витрина подключает тот же файл.

Поверхности идут в четыре ступени: фон страницы `--bg-body`, панель `--back-color`, блок внутри панели `--container-color`, поле ввода `--field-color`. Для частых случаев есть готовые классы. `ui-panel` для блока прямо на фоне страницы, `ui-inset` для блока внутри панели.

Контраст в обеих темах одинаковый, нормы WCAG 2.1 на любом фоне темы:

| Что                                                        | Порог                         |
| ---------------------------------------------------------- | ----------------------------- |
| Основной текст `--font-color`                              | от 14:1                       |
| Вторичный текст `--muted-color`                            | от 7:1 (AAA)                  |
| Подсказки `--faint-color`                                  | от 4,6:1 (AA)                 |
| Цветной текст `--*-text`, акцент как текст `--accent-text` | от 6:1, и на своём `--*-soft` |
| Текст на заливке `--*-color`                               | от 4,6:1                      |
| Рамки полей, переключателей и кнопок `--border-color`      | от 3:1 (WCAG 1.4.11)          |

Декоративные разделители `--hairline-color` под нормы не попадают: они ничего не обозначают. Палитра пересчитывается генератором в OKLCH под эти пороги, вручную оттенки не подбирают.

Текст идёт в три ступени: основной `--font-color`, вторичный `--muted-color`, подсказки `--faint-color`. Текст не делают полупрозрачным (`opacity`), для вторичного текста берут `--muted-color`. Мельче 11px подписи не делают.

Цвета ролей - ровная гамма в OKLCH: красный, оранжевый, жёлтый, зелёный, голубой, синий, фиолетовый, плюс серый. Тоны идут по кругу с близким шагом (27, 58, 98, 150, 225, 262, 310), поэтому соседние цвета, например оранжевый и жёлтый или голубой и синий, хорошо различаются. В палитрах (мастер-цвет, теги) порядок такой: серый, красный, оранжевый, жёлтый, зелёный, голубой, синий, фиолетовый. У каждого цвета четыре варианта:

- `--*-color` - заливка. Текст на ней белый, а на оранжевой, жёлтой и голубой тёмный (`--on-orange`, `--on-yellow`, `--on-cyan`). Компоненты берут его из `--on-accent`, классы `bg-orange` и `bg-yellow` подставляют его сами;
- `--*-text` - цветной текст;
- `--*-soft` - мягкий фон блока или строки;
- `--*-mark` - самый яркий цвет гаммы для полос, точек, тегов и индикаторов. Для текста он не годится, жёлтый и голубой на белом не читаются.

Акцентный цвет `--accent-color` - это синий из гаммы, заливка. Когда акцент нужен как текст, значок, рамка или кольцо фокуса, берут `--accent-text`: в тёмной теме заливка темна для тонкой линии. У компонента с пропом `accent` оба токена переопределяет `accentStyle(accent)`.

Цветной текст, рамки и линии пишут через `--red-text`, `--green-text`, `--orange-text` и так далее (классы `text-(--red-text)`, `border-(--red-text)`), а не через `--red-color`. Заливки `--*-color` как текст и тонкие линии плохо читаются: в тёмной теме они тёмные, а жёлтая и оранжевая слишком светлые на белом. Классы `border-*` в тёмной теме сами берут цвет метки.

Виджеты, которые рисуют цветами из JS (карта, графики), узнают тему через `isDarkTheme(el)` и следят за её сменой через `watchTheme(cb)` из `themeWatch.ts`. Тёмная тема включает `color-scheme: dark`, поэтому выпадающие списки, чекбоксы и прокрутка браузера тоже тёмные.

Панели не делают полупрозрачными, на фоне они теряются. Выпадающие меню делают через `ui-panel` с тенью `--elevation-3`.

Стили тегов в приложении пишите только внутри `@layer base`. Правило вне слоя сильнее утилит Tailwind, и подписи в компонентах станут крупнее, чем задумано.

```css
@layer base {
  h5 {
    font-size: 1rem;
    font-weight: 600;
  }
}
```

Классы ролей (`.bg-red`, `.bg-max` и другие) и классы темы (`.light`, `.dark`) остаются вне слоя. Они как раз должны перебивать утилиты.

Текст ячейки `Table` выводится как текст, теги в данных устройства не работают. Если ячейке нужна разметка (цвет, ссылка), у колонки ставят `html: true`, а данные в ней экранируют сами функцией `escapeHtml`. `formatting` возвращает HTML для окна и подсказки и тоже сам экранирует текст.

Шапку `Table` можно перекрасить переменной `--table-header-color`. Компонент с `accent` задаёт её сам мягким оттенком своего цвета.

Посмотреть всю тему разом можно на вкладке «Тема» на главной витрины. Там палитра, все компоненты с демо-данными, типографика и Markdown.

## Иконки

Каталог иконок для конструктора лежит в `src/lib/IconsCatalog`. Это 12 категорий по 16 иконок. Иконки обозначают темы и подсистемы устройства, их ставят в заголовки аккордеонов и похожих блоков, поэтому стрелок, плюсов, крестиков и повторов в каталоге нет. Категории: питание и электрика, электроника, связь и сеть, датчики и измерения, климат и среда, свет, производство, транспорт и навигация, авиация и космос, медиа, дом и безопасность, настройки и данные. Порядок идёт от простого оборудования к сложному, настройки и данные в конце.

Все иконки из одного набора, [Tabler Icons](https://tabler.io/icons) (MIT): контурные, сетка 24 px, линия 1,75. Цвет берут из `currentColor`, поэтому иконка сама следует теме и мастер-цвету.

Иконки и HTML из GUI и данных устройства компоненты выводят только через `sanitizeHtml` (`src/lib/html.ts`, экспортируется из библиотеки). Он заново собирает разметку из разрешённых тегов SVG и простого текста: скрипты, обработчики `on*`, внешние ссылки и `url()` на чужие ресурсы выбрасываются. Работает одинаково в браузере и при серверном рендере. Приложение, которое само вставляет такую разметку через `{@html}`, тоже пропускает её через `sanitizeHtml`.

Файл называется `категория.имя.svg`, имя - как в Tabler. Скрипт `npm run UpdateIconsLib` собирает из файлов `icons.ts`: `ICONS` (иконки по категориям), `ICON_NAMES` (имена для поиска и подсказок) и `ICONS_ARRAY` (наборы состояний из папок `battery`, `bulb`, `propeller`, их переключает `Widget` по значению). Порядок категорий задан в `CATEGORY_ORDER` в `iconsLib.ts`, название категории - ключ `constructor.props.icon.<категория>` в словаре.

В конструкторе иконку выбирают в окне `IconsMatrix`: категории матрицей 4×3 (в клетке 4×4), сверху поиск по имени или категории, при наведении подсказка с именем. Иконка сохраняется в GUI как SVG, поэтому перестановка каталога не ломает сохранённые интерфейсы. Весь каталог с именами виден на вкладке «Иконки» на главной витрины, клик по иконке копирует её SVG.

## Языки

Список языков задан в одном месте, `LANGUAGES` в `src/lib/locales/languages.ts`. Сейчас это RU, EN и ZH. Чтобы добавить язык, достаточно одной записи там. Переключатели языка во всех приложениях подхватят его сами. Пока перевода нет, показывается русский текст.

Приложения не держат свой список языков. Они берут его из библиотеки, а свой словарь подключают так:

```ts
export const T = createTranslator(translations)
```

Один вызов `setLanguage` переключает язык и в библиотеке, и в приложении. Выбор сохраняется в браузере. В SSR-приложениях сохранённый язык восстанавливают вызовом `restoreLanguage()` в `onMount` корневого layout.

Серверный код, который запускается под Node без Vite, импортирует языки из `poe-svelte-ui-lib/locales`. Корень пакета тянет Svelte-компоненты, и Node его не загрузит.

Тексты бывают двух видов:

- **Встроенные тексты компонентов**: подписи, кнопки, подсказки. Они только в словаре `src/lib/locales/translations.ts` и выводятся через `$T("ключ")`. Русских строк прямо в разметке быть не должно.
- **Тексты из конструктора**: название поля, варианты списка, заголовки колонок. Это строка или объект `{ ru, en, zh }`. Приложение переводит всё описание интерфейса функцией `localizeDeep` перед показом. В конструкторе их правят в окне «Тексты и переводы», которое есть у каждого компонента.

## Переход на 2.0

Версия 2.0 меняет API. Сохранённые GUI (каталог DevCloud, интерфейсы устройств) переводятся один раз функцией `migrateGUI(components)`, для одного компонента - `migrateProperties(component)`; рендерер GUI старый формат не читает. Обе функции чистые: исходный объект не меняется, повторный вызов ничего не меняет. Код приложений правится вручную по списку ниже.

**Цвет: `accent` вместо классов.** Классы `bg-*` и `text-*` в `componentClass`, `wrapperClass`, `settings.class`, `options[].class`, `items[].class` цвет больше не задают.

| Где                                                                                                                 | Было                                                      | Стало                                                    |
| ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------- |
| `Button`                                                                                                            | `componentClass="bg-green"`                               | `variant="primary" accent="green"`                       |
| `Button`                                                                                                            | `componentClass="bg-max"`, `"bg-gray"`                    | `variant="secondary"`                                    |
| `Button`                                                                                                            | `componentClass="bg-transparent p-1"`                     | `componentClass="p-1"` (`variant` по умолчанию `plain`)  |
| `Button` внутри виджета                                                                                             | `componentClass="bg-accent"`                              | `variant="primary"`                                      |
| `Accordion`, `Input`                                                                                                | `componentClass="bg-red"`                                 | `accent="red"`                                           |
| `WidgetWiFi`, `WidgetDeviceInfo`, `WidgetFileSystem`, `WidgetStackInfo`, `WidgetRGBStrip`, `WidgetPFD`, `WidgetMap` | `componentClass="bg-red"` (проп удалён)                   | `accent="red"`                                           |
| `Slider`, `Switch`, `Joystick`, `Tabs`, `PeriodChart`, `VideoViewer`, `ProgressBar`                                 | `wrapperClass="bg-red ..."`                               | `accent="red"` (у `Joystick` по умолчанию `blue`)        |
| `Divider`                                                                                                           | `color="bg-red"` (проп удалён)                            | `accent="red"`                                           |
| `TextField`                                                                                                         | `text-(color:--red-text)` в `wrapperClass`                | `accent="red"`                                           |
| `Widget`                                                                                                            | `settings.class: "bg-red"`, `icons.class`                 | `accent: "red"`, `icons.class` удалён                    |
| `ProgressBar`                                                                                                       | `items: [{ name, class: "bg-red" }]`                      | `items: [{ name, accent: "red" }]`                       |
| `Select`, `Switch` (биты)                                                                                           | `options: [{ ..., class: "bg-red" }]`                     | `options: [{ ..., accent: "red" }]`                      |
| `Switch` (обычный)                                                                                                  | `options={[{ id, value: 0, class: "bg-red", disabled }]}` | `accent="red" disabled` (`options` только для `bitMode`) |
| `Table`                                                                                                             | `wrapperClass="bg-red ..."`                               | `accent="red"` (кнопки ячеек - по-прежнему `class`)      |
| Свой элемент в цвет компонента                                                                                      | `style={UI.widgetAccentStyle(componentClass)}`            | `style={UI.accentStyle(accent)}`                         |

**Колбэки.**

| Компонент        | Было                                        | Стало                                                                              |
| ---------------- | ------------------------------------------- | ---------------------------------------------------------------------------------- |
| `Input`          | `onUpdate` на каждую клавишу                | `onUpdate` - Enter, уход из поля, счётчик; `onInput(text)` - каждый ввод           |
| `Input`          | `bind:isValid`                              | проп удалён, проверка внутри (`aria-invalid`)                                      |
| `Slider`         | `onUpdate` во время перетаскивания          | `onUpdate` - бегунок отпущен или `+/-`; `onInput(value)` - во время перетаскивания |
| `Widget`         | `onUpdate` во время перетаскивания слайдера | `onUpdate` - принятое значение; `onInput(value)` - слайдер во время перетаскивания |
| `Switch`         | `onChange={(value) => ...}`                 | `onUpdate={(value) => ...}`                                                        |
| `FileAttach`     | `onChange={(event, file) => ...}`           | `onUpdate={(file, event) => ...}`                                                  |
| `WidgetRGBStrip` | `onChange={(field, value) => ...}`          | `onUpdate={(value, field) => ...}`                                                 |

**Select: значение варианта, а не вариант.**

| Было                                                             | Стало                                                                       |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `value={options.find((o) => o.value === x)}`                     | `value={x}` или `bind:value={x}`                                            |
| `onUpdate={(o) => (x = (o as UI.IOption).value)}`                | `onUpdate={(v) => (x = v)}`                                                 |
| `multiSelect`: `value` и `onUpdate` - массив вариантов           | массив значений                                                             |
| `type="input"`: `onUpdate` на каждую клавишу и дважды при выборе | `onInput(text)` при вводе, `onUpdate` - Enter, уход из поля, выбор варианта |
| `IOption`: `{ id: string; value?: T; class?: string; ... }`      | `{ id?: string; value: T; accent?: AccentColor; ... }`                      |

Тип значения - `SelectValue<T, M>`, пропсы - `ISelectProps<T, M>`, где `M` - `multiSelect`. Список открывается стрелками, выбор - Enter, закрытие - Escape.

**Панели свойств.**

| Было                                                                                                                                           | Стало                                                                           |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `UI.ButtonProps`, `UI.TableProps`, ... `UI.WidgetMapProps`, `UI.TextsEditor` из `"poe-svelte-ui-lib"`                                          | `import { ButtonProps, TextsEditor, ... } from "poe-svelte-ui-lib/constructor"` |
| `component.info.*`, `constructor.*`, `library.*` в `$T` библиотеки всегда                                                                      | подключаются импортом `poe-svelte-ui-lib/constructor`                           |
| `<UI.SelectProps {component} {onPropertyChange} forConstructor={false} />`                                                                     | проп `forConstructor` удалён, панель одна                                       |
| тип `onPropertyChange` копировался в приложение                                                                                                | `import type { PropertyChange } from "poe-svelte-ui-lib/constructor"`           |
| `updateProperty("label.class", v, component, onPropertyChange)`                                                                                | `createPropsEditor(component, onPropertyChange).patch("label", { class: v })`   |
| `updateComponent`, `findOptionByClass`, `findColorOption`, `stripLegacyTextColor`, `COLOR_OPTIONS`, `TEXT_COLOR_OPTIONS`, `WidgetAccentPicker` | удалены                                                                         |

В `poe-svelte-ui-lib/constructor` также `optionsStore` (в нём и палитра `ACCENT_OPTIONS`; повторное нажатие на выбранный цвет снимает его), `CommonSnippets`, `createPropsEditor` и словарь `constructorTranslations`. В `i18n` добавлены `extendTranslations(dictionary)` и тип `TranslationKey` (подсказка ключей в `$T`, любая строка по-прежнему допустима).

**Table.**

| Было                                                                 | Стало                                                                                                                          |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Журнал: `body` с `dataBuffer.stashData`, таблица сама очищала `body` | `bind:this={log}` и `log.push(rows)` (строка или массив); `body` в журнале не читается                                         |
| `body: T[] \| T \| null`, `bind:body`                                | `body?: T[]`, не связывается; сортировка - внутри таблицы                                                                      |
| `clearBuffer()`                                                      | `clear()`                                                                                                                      |
| `onClick(eventHandler)` - таблица собирала `Value` из `Variables`    | `onClick(row, button)` - строка с выбранными в списках значениями и кнопка; пакет из `button.eventHandler` собирает приложение |
| `text.formatting(text)` - HTML окна и подсказки                      | `text.render(row)` - содержимое ячейки; окно - `modal: true` или сниппет `Snippet<[row]>`                                      |

Пакет кнопки строки собирает `tablePacket(button.eventHandler, row)`, журнал (`stashData`) в GUI ведёт `GUIRenderer`. Колонки в `.ts` без разметки делают окно через `createRawSnippet` из `svelte`:

```ts
const canModal = createRawSnippet((row: () => CanRow) => ({ render: () => `<div class="whitespace-pre-wrap">${formatCanDataModal(row().data)}</div>` }))
{ type: "text", data: { key: "data", truncated: true, copy: true, modal: canModal } }
```

**Рендерер GUI и конструктор.** Оба `GUIPreview.svelte` (DevCloud, WebApp) заменяются на `GUIRenderer`, приложение оставляет транспорт, список модулей, загрузку GUI и свои мосты потоков.

| Было в приложении                                                                                                                            | Стало                                                                                               |
| -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| сетка и `{#snippet Components}` с ветвью на каждый тип, кэш `localizeDeep`                                                                   | `<UI.GUIRenderer components link persistKey viewer render onError />`                               |
| `handleUIComponentEvent`, сборка Payload из `Variables`, `onClick` таблицы                                                                   | внутри рендерера (`commandPacket`, `tablePacket`)                                                   |
| `bitFieldGet`/`bitFieldSet` у `Input` и `Select`, `-S` варианты `Select`, колонки-списки таблицы                                             | внутри рендерера (`readBits`, `writeBits`)                                                          |
| `readWidgetFields`, `saveWidgetFields`, `sendWidgetCommand`, `readFileSystem`, `readStackInfo`, `scanWiFiNetworks`, `WIDGET_FIELDS` (WebApp) | внутри рендерера (`WIDGET_FIELDS`, `readWidgetFields`, `widgetPacket`)                              |
| `uploadFile`, `downloadFile`, `fsStep`, `withRetry`, `handleFileUpload`, `crc32` приложения                                                  | `createFsTransfer(link)`, рендерер ведёт сам; `crc32` из `poe-svelte-ui-lib/protocols`              |
| планы карты в `localStorage` (`loadMission`, `saveMission`)                                                                                  | рендерер по `persistKey`                                                                            |
| `applyPayload` и разбор Payload в эффекте (`DATA_PAYLOAD_ARGS`, `FS_PROTOCOL_KEYS`, `topLevelToFlatten`)                                     | `mergeDevicePayload(values, "<ModSN>\|", ARG, Payload)`; набор ARG остаётся у приложения            |
| начальные значения переменных компонентов (`0` или `""`) после загрузки GUI                                                                  | не нужны: компонент без значения берёт своё по умолчанию                                            |
| `VideoViewerRemote` в ветке `VideoViewer`                                                                                                    | `render={{ VideoViewer: snippet }}`                                                                 |
| `common.ts`: `CELL_HEIGHT`, `UIAreaCols`, `spanRows`, `isWidgetType`, `WIDGET_FIELD_GROUPS`, `WIDGET_EDITABLE_FIELD_GROUPS`                  | `GUI_GRID`, `spanRows`, `isWidgetType`, `WIDGET_FIELDS`, `WIDGET_SAVE_FIELDS`, `componentVariables` |
| `common.ts`: `DEFAULT_PROPS`, `componentMap`, `WIDGET_MIN_WIDTH`, `minWidthOf`                                                               | `COMPONENT_DEFAULTS`, `COMPONENT_SIZES`, `minComponentWidth` (`/constructor`)                       |
| `ConstructorUI`: `switch` по типу в `createComponent`, свой `updateComponent` для `properties`                                               | `createComponent(type, { col, row }, parentId, { tab, areaWidth })`, `applyPropertyChange`          |
| ветвь панели на каждый тип с `as UI.UIComponent & { properties: Partial<...> }`                                                              | `{@const Panel = PANELS[c.type]}<Panel component={c} {onPropertyChange} />`                         |
| `component.properties as UI.IButtonProps`                                                                                                    | `if (component.type === "Button")` - `properties` уже `IButtonProps`                                |
| `IWidgetWiFiConfig` и др. - отдельные интерфейсы, `value` виджета - полный объект                                                            | выведены из `WIDGET_FIELDS`; `value` у `WidgetWiFi` и `WidgetDeviceInfo` - `Partial`                |

Транспорт `waitFor` в WebApp пишется заново (сейчас там опрос `lastResponse`): первый пакет `OK!`/`ER!` с аргументом, прошедший `match`, или `null` по таймауту.

**xPOE-Debug.**

| Было                                                                                       | Стало                                                                                                             |
| ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `XPoeDebugItem.value` - HEX Payload                                                        | `valueBytes` - байты, `payload` - Payload, декодированный один раз при разборе                                    |
| `XPoeDebugRow.value` - HEX, приложение заменяло его на `formatXPoeDebugValueForTable(...)` | `value` - готовый краткий текст, плюс `valueBytes` и `payload`; строки `xPoeDebugRow` кладутся в таблицу как есть |
| `formatXPoeDebugValue(hex)` - HTML                                                         | `formatXPoeDebugValue(payload, bytes)` - текст                                                                    |
| `formatXPoeDebugPretty(hex)`                                                               | `formatXPoeDebugPretty(payload, html?)`                                                                           |
| `formatXPoeDebugValueForTable`, `formatXPoeDebugModal`, `bindXPoeDebugCopyButtons`         | удалены: окно строки - сниппет в `xPoeDebugTableColumns`                                                          |
| `debugPlotValues(row.value)` - HEX                                                         | `debugPlotValues(row.payload)`                                                                                    |

Строку отправленной команды (DevCloud `webserial.ts`) разбирают тем же парсером: `createXPoeDebugParser().push(frame).map(xPoeDebugRow)`.

**Graph.**

| Было                                                               | Стало                                                                                                   |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| AUTO: опрос `streamingData` каждые 10 мс, точка при смене значений | точка на каждый новый массив `streamingData.data` или вызов `push(sample, time?)` через `bind:this`     |
| `streamingData` строкой JSON                                       | только объект `{ data }`                                                                                |
| цвета линий `#3b82f6`...                                           | метки темы `--blue-mark`, `--red-mark`, `--green-mark`, `--orange-mark`, `--purple-mark`, `--cyan-mark` |

Значения, изменённые на месте в том же массиве, точек не дают: присваивайте новый массив или вызывайте `push`.

**WidgetMap и имитация.**

- MapLibre по умолчанию с CDN. Для точки доступа без интернета - `configureMapLibre({ module, css, styles })` до первой отрисовки карты; `module` - адрес ES-модуля или функция, отдающая модуль.
- Имитация (`isTest`) у `WidgetMap`, `WidgetPFD` и `Graph` грузится отдельным модулем только при включении (у Vite - отдельные файлы рядом с бандлом). Сборка прошивки, которая кладёт во flash весь каталог, может их исключить.
- Ключи `constructor.props.map.fitAll`, `fitAllHint`, `timeout`, `loading`, `noconnection` и `constructor.props.table.fulldata` переименованы в `widget.map.*` и `common.table.fulldata`.

**Прочее.**

- Компоненты не выводят случайные DOM id вида `${id}-xxxxxx`. Проп `id` примитива - переменная устройства, в разметку он не попадает (кроме `Button`, где это атрибут `id`).
- Новые экспорты: `Icon`, `accentStyle`, `ACCENT_COLORS`, `AccentColor`, `migrateProperties`, `migrateGUI`, `copyText`, `SelectValue`, `IconSource`, `configureMapLibre`.
- Ключи переводов `ui.info.show`, `ui.info.hide`, `library.for_constructor` удалены; добавлены `ui.joystick.*`, `widget.rgb.hue`, `widget.rgb.brightness`.

## Как описывать компонент

У компонента два описания.

**Короткое**, по кнопке (i). Лежит в словаре под ключом `component.info.<Тип>`. Его показывают витрина и конструктор DevCloud. Разделы идут в таком порядке, ненужные пропускаются:

| Раздел       | Что писать                                                                      |
| ------------ | ------------------------------------------------------------------------------- |
| Назначение   | Одна-две фразы: что это и когда применять                                       |
| Пакет данных | Откуда данные, каким пакетом и как часто их слать, что компонент отправляет сам |
| Ключи        | По пункту на ключ: тип, единицы, смысл                                          |
| Особенности  | Поведение, ограничения, советы                                                  |
| Настройки    | Что меняется в панели свойств                                                   |

**Подробное**, `src/lib/<Компонент>/README.md`. Оно открывается на вкладке «Инфо» витрины. Начало повторяет короткое описание и не должно ему противоречить. Дальше идут пропсы, примеры, панель свойств и внутреннее устройство.

## Разработка

```bash
npm run dev            # витрина на локальном сервере
npm run check          # проверка типов
npm run TestProtocols  # тесты: протоколы, битовые поля, очистка HTML, облёт поля
npm run Formatting     # prettier
npm run build          # сборка витрины в docs/
npm pack               # сборка пакета в dist/: проверка типов, тесты, publint
```

Витрина устроена как конструктор DevCloud: слева компонент и его код, справа панель свойств той же ширины, что в облаке. Если подпись не влезает, это видно сразу.

Внутри библиотеки импорты относительные. Витрина импортирует библиотеку через `#lib` (поле `imports` в `package.json`).

## Выпуск

Выпуск запускается сообщением коммита в `main`:

- `[publish]` публикует пакет в npm;
- `[deploy]` обновляет витрину на GitHub Pages.

Перед выпуском поднимите версию в `package.json`. Версия на витрине берётся оттуда же.

Публикация идёт через trusted publisher npm, постоянный токен не нужен. Связь настроена на npmjs.com в настройках пакета: GitHub Actions, репозиторий `Oleg-Perevyshin/ElementsUI`, workflow `npm_publish.yaml`.

После публикации облако обновляется само. Workflow ставит новую версию в DevCloud, проверяет типы и, если всё прошло, поднимает вторую цифру версии облака и пушит туда коммит вида `1.6 [deploy] Обновление ElementsUI до 1.84.0`. Вручную версию библиотеки в облаке не поднимают. Если проверка упала, облако остаётся на старой версии, причину ищите в логе job `update-devcloud`.

---

Лицензия MIT, см. `LICENSE`.
