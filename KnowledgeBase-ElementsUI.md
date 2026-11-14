<!-- Файл собирает node .knowledgebase/build.mjs из .knowledgebase/Overview.md и документации проекта (34 файлов). Вручную не править: правь источники и пересобери -->

# База знаний ElementsUI

## 🧱 Обзор ElementsUI

Общая библиотека интерфейса и протокола для всего стека xPOE-DevStack. Из неё облако, веб-интерфейс прошивок и настольный терминал берут одни и те же компоненты, тему, переводы, кодек пакетов и словарь команд.

Этот обзор даёт цельную картину проекта и собирает в одном месте то, что разбросано по README компонентов. Ниже в справочнике идут все `.md` файлы репозитория целиком: за подробностями по конкретному компоненту смотрите его README.

## 🎯 Назначение и место в стеке

ElementsUI - репозиторий npm-библиотеки `poe-svelte-ui-lib` (лицензия MIT, мажорная версия 2.x; точный номер - поле `version` в `package.json`). Это общий слой интерфейса и протокола для всего стека xPOE-DevStack: компоненты Svelte 5, смарт-виджеты устройства, рендерер GUI из конструктора, панели свойств конструктора, тема, языки RU/EN/ZH, ядро протоколов обмена с устройствами и мастер-словарь команд.

### ✨ Что умеет

- 🧩 Даёт готовые компоненты: поля ввода, списки, переключатели, ползунки, кнопки, графики, таблицы, вкладки и другие.
- 📦 Даёт смарт-виджеты под типовые задачи устройства: Wi-Fi, паспорт устройства, файлы, память, светодиодная лента, пилотажный дисплей, карта.
- 🖥️ Рисует интерфейс устройства, собранный в конструкторе DevCloud, и сам обменивается с устройством командами.
- 🛠️ Даёт конструктору DevCloud панели свойств для каждого компонента.
- 🎨 Даёт одну тему на все приложения, светлую и тёмную.
- 🌍 Переводит интерфейс на русский, английский и китайский.
- 📡 Содержит ядро протокола: сборку и разбор пакетов, CRC, отладочную консоль, CAN, графики отладки.
- 📖 Хранит мастер-словарь команд для всего стека.

### 🧩 Место в стеке xPOE-DevStack

Главная идея: приложения стека не держат своих копий интерфейса, кодека и словаря. Всё берётся из библиотеки, поэтому один и тот же компонент, пакет и перевод одинаковы везде.

| Проект          | Что это                           | Что берёт из библиотеки                                     |
| --------------- | --------------------------------- | ----------------------------------------------------------- |
| DevCloud        | Облако                            | Компоненты, рендерер, конструктор, протокол, языки          |
| DevTerminal     | Настольный терминал отладки       | Ядро протокола и графики отладки                            |
| ProdFactory-ESP | Прошивки ESP32 и их веб-интерфейс | Рендерер, смарт-виджеты, тему; копию словаря                |
| ProdFactory-STM | Прошивки STM32                    | Копию словаря; байты пакетов совпадают с кодеком библиотеки |

### 💡 Полезно знать

- 👀 Компонент только показывает данные и сообщает об изменениях. Сеть и данные устройства - забота приложения.
- ⚠️ Любая правка компонента, темы или протокола сразу видна в DevCloud, WebApp и DevTerminal.
- 🌐 Живые примеры всех компонентов есть на витрине в GitHub Pages.

<details>
<summary>🔗 Как связан каждый проект</summary>

Стек xPOE-DevStack (папка `D:\Projects`):

| Проект          | Что это                                                                          | Как связан с ElementsUI                                                                                                                                                                                                                                                                                                                    |
| --------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| DevCloud        | Облако: конструктор GUI устройства, панель управления, отладка, WebSocket-сервер | Зависимость `poe-svelte-ui-lib` (`^2.x`, точный номер - в `package.json` проекта). Использует компоненты, `GUIRenderer`, точку входа `/constructor` (панели свойств, `createComponent`, `PANELS`), `/protocols` (кодек, xPOE-Debug), `/locales` (серверный код под Node без Vite). Версию библиотеки в облаке поднимает CI этой библиотеки |
| DevTerminal     | Настольный терминал отладки через COM-порт                                       | Зависимость `poe-svelte-ui-lib` (`^2.x`, точный номер - в `package.json` проекта). Ядро `/protocols`: пакеты, разбор консоли xPOE-Debug, CAN через slcan, колонки таблицы `xPoeDebugTableColumns`, графики `DebugPlot`                                                                                                                     |
| ProdFactory-ESP | Прошивки ESP32 и их веб-интерфейс `WebApp`, который устройство раздаёт само      | `WebApp/package.json` зависит от `poe-svelte-ui-lib` (`^2.x`, точный номер - там же): `GUIRenderer`, смарт-виджеты, тема. Конструктор в бандл WebApp не попадает. Прошивка держит копию словаря `.framework/Dictionary.yaml`, сборка сверяет её с `api_har.h`                                                                              |
| ProdFactory-STM | Прошивки STM32 (модули на шине)                                                  | Копия словаря `.framework/Dictionary.yaml`; байты пакетов совпадают с кодеком библиотеки (компоненты `poe_cbor`, `api_service`)                                                                                                                                                                                                            |

</details>

<details>
<summary>🧭 Границы ответственности и адреса</summary>

- Компонент только показывает данные и сообщает об изменениях (пропсы и колбэки). Сеть, WebSocket, выбор модуля и хранилище значений - у приложения.
- `src/lib/protocols/` - единственный источник протокола и кодека для программ. В прошивках тот же протокол реализован в C (`poe_cbor`, `api_service`), совпадение байт проверяют тесты.
- `src/lib/dictionaries/` - мастер-словари для всего стека: команды `commands.yaml`, сообщения устройств `messages.yaml` и список компонентов GUI `components.yaml`, из них генерируются код для JS и заголовки прошивок `api_har.h`, `api_msg.h`.
- Любая правка компонента, темы или протокола сразу затрагивает DevCloud, WebApp и DevTerminal.

Витрина с живыми примерами публикуется на GitHub Pages: `https://oleg-perevyshin.github.io/ElementsUI/`. Репозиторий: `github.com/Oleg-Perevyshin/ElementsUI`.

</details>

## 🧰 Технологии и версии

Библиотека написана на Svelte 5 с рунами и TypeScript, стили - Tailwind CSS 4. Витрина собирается SvelteKit в статический сайт. У пакета одна зависимость во время работы - `tailwind-merge`. Тесты идут на встроенном в Node `node:test`, без сторонних раннеров.

<details>
<summary>📋 Версии из `package.json`</summary>

Версии взяты из `package.json` (диапазоны devDependencies на момент написания).

| Что               | Версия                                                              | Роль                                                                                                                              |
| ----------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Svelte            | peer `^5.0.0`, dev `^5.57.3`                                        | Компоненты на рунах (`compilerOptions: { runes: true }`)                                                                          |
| Tailwind CSS      | peer `^4.0.0`, dev `^4.3.5` (`@tailwindcss/vite`)                   | Стилизация утилитами и переменными темы                                                                                           |
| tailwind-merge    | `^3.7.0`                                                            | Единственная runtime-зависимость                                                                                                  |
| SvelteKit         | `@sveltejs/kit ^3.1.1`, `adapter-static ^4.0.1`                     | Витрина (статический сайт в `docs/`)                                                                                              |
| @sveltejs/package | `^3.0.2`                                                            | Сборка пакета в `dist/`                                                                                                           |
| Vite              | `^8.3.6`, `@sveltejs/vite-plugin-svelte ^7.3.1`                     | Dev-сервер и сборка                                                                                                               |
| TypeScript        | `^6.0.3`, `svelte-check ^4.7.8`                                     | Типы, `strict: true`                                                                                                              |
| MapLibre GL       | dev `^6.17.0` (установлена 6.18.0, с CDN грузится та же)            | Карта `WidgetMap`; в бандле внешняя (`external: ["maplibre-gl"]`), по умолчанию грузится с CDN, для офлайна - `configureMapLibre` |
| marked, dompurify | dev                                                                 | Только витрина: показ README и Markdown                                                                                           |
| Prettier          | `^3.9.10` + `prettier-plugin-svelte`, `prettier-plugin-tailwindcss` | Форматирование                                                                                                                    |
| publint           | `^0.3.25`                                                           | Проверка экспорта пакета перед публикацией                                                                                        |
| tsx               | `^4.23.15`                                                          | Запуск `iconsLib.ts`                                                                                                              |
| Node.js           | 24 в CI                                                             | Тесты на `node:test`, без сторонних раннеров                                                                                      |

Иконки каталога - Tabler Icons (MIT). CBOR-кодек свой (`src/lib/protocols/cbor`, RFC 8949), без внешних библиотек.

</details>

## 🗂️ Структура репозитория

Репозиторий делится на две части. В `src/lib` лежит сам пакет: у каждого компонента своя папка с кодом, панелью свойств для конструктора и README. В `src/routes` лежит витрина с примерами. Собранный пакет (`dist/`) и собранная витрина (`docs/`) в git не хранятся.

Что есть в библиотеке:

- 🧩 Обычные компоненты: поле ввода, список, переключатель, ползунок, кнопка, джойстик, индикатор прогресса, графики, таблица, выбор файла, видео, текст, примитив-виджет.
- 📐 Раскладка: сворачиваемый блок, вкладки, разделитель, карусель, модальное окно, перетаскивание.
- 📦 Смарт-виджеты: Wi-Fi, паспорт устройства, файловая система, память и стеки, светодиодная лента, пилотажный дисплей, карта.
- 🗺️ Карта - самый большой модуль: борта, треки и миссии.

<details>
<summary>🌳 Дерево файлов</summary>

```
ElementsUI/
├─ package.json            версия, скрипты, exports (6 точек входа: ., /protocols, /dictionaries/*, /constructor, /locales, /theme.css), allowScripts
├─ vite.config.ts          SvelteKit + Tailwind, витрина в docs/, base /ElementsUI, __LIB_VERSION__
├─ tsconfig.json           strict, include src/**
├─ .prettierrc             printWidth 160, без точек с запятой, LF
├─ .editorconfig, .npmrc   LF, финальный перевод строки; engine-strict=true
├─ README.md               главное руководство (установка, GUI, протокол кратко, тема, языки, выпуск)
├─ AGENTS.md               правила для агентов: границы, узкий экран, выпуск, известные проблемы
├─ .github/workflows/
│  ├─ npm_publish.yaml     [publish]: публикация в npm + автообновление DevCloud
│  └─ ghpages_deploy.yaml  [deploy]: витрина на GitHub Pages
├─ scripts/GenerateDictionary.mjs   src/lib/dictionaries: commands.yaml -> generated/commands.ts, messages.yaml -> generated/messages.ts, components.yaml -> generated/components.ts; заголовки прошивок firmware/api_har.h, api_msg.h в стиле .clang-format прошивок
├─ scripts/UpdateIconsLib.ts       assets/IconsCatalog -> src/lib/icons.ts (npm run Generate)
├─ assets/IconsCatalog/    SVG каталога (категория.имя.svg), наборы battery/bulb/propeller; в npm-пакет не входит
├─ tests/                  node:test против собранного dist/ (+ dist-types.tsconfig.json)
├─ static/                 favicon, .nojekyll для Pages
├─ src/
│  ├─ app.css, app.html, app.d.ts   оболочка витрины
│  ├─ appIcons/            значки только витрины
│  ├─ routes/              витрина (SvelteKit, prerender)
│  │  ├─ +layout.svelte    шапка, меню компонентов, тема, язык, версия
│  │  ├─ +page.svelte      главная: вкладки «Обзор» (README), «Тема», «Иконки», «Регулярные выражения»
│  │  ├─ components/<имя>/+page.svelte   страница каждого компонента (24 папки)
│  │  ├─ ComponentExample.svelte, ThemePreview.svelte, IconsShowcase.svelte, common.ts
│  │  └─ RegExp.md         справочник регулярных выражений для полей ввода
│  └─ lib/                 исходник пакета (собирается в dist/)
│     ├─ index.ts          точка входа "poe-svelte-ui-lib"
│     ├─ constructor.ts    точка входа "poe-svelte-ui-lib/constructor"
│     ├─ theme.css         точка входа "poe-svelte-ui-lib/theme.css"
│     ├─ <Компонент>/      Компонент.svelte + КомпонентProps.svelte + README.md (+ вспомогательные .ts)
│     ├─ GUIRenderer/      GUIRenderer.svelte, DeviceTable.svelte
│     ├─ protocols/        ядро протоколов, PROTOCOL.md, cbor/
│     ├─ dictionaries/     commands.yaml, messages.yaml, components.yaml, generated/ (TS), firmware/ (api_har.h, api_msg.h), README.md
│     ├─ locales/          languages.ts, i18n.ts, localize.ts, translations.ts, constructor.ts, index.ts
│     ├─ libIcons/         служебные значки компонентов и панелей
│     ├─ gui.ts            чистые правила рендерера (сетка, виджеты, биты, пакеты, раскладка)
│     ├─ registry.ts       COMPONENTS: отрисовка и метаданные по типу компонента (для конструктора)
│     ├─ componentMeta.ts  COMPONENT_META: тип обмена и поля смарт-виджета, без компонентов (для GUIRenderer)
│     ├─ guiViews.ts       GUI_VIEWS: компоненты отрисовки всех типов; GUIRenderer берёт их из пропса views
│     ├─ defaults.ts       свойства и размеры новых компонентов, createComponent
│     ├─ propsEditor.ts    неизменяемая правка свойств из панелей
│     ├─ fsTransfer.ts     обмен файлами по SET/GET FS
│     ├─ types.ts          все интерфейсы пропсов, UIComponent
│     ├─ icons.ts          СГЕНЕРИРОВАН из assets/IconsCatalog
│     └─ html.ts, accent.ts, bitField.ts, themeWatch.ts, hints.ts, ring.ts, ...  общие утилиты
├─ dist/   (в .gitignore)  собранный пакет
└─ docs/   (в .gitignore)  собранная витрина
```

</details>

<details>
<summary>🧱 Компоненты в `src/lib`</summary>

У каждого своя папка с README и панелью свойств `*Props.svelte`:

- Компоненты: `Input`, `Select`, `Switch`, `Slider`, `Button`, `Joystick`, `ProgressBar`, `Graph`, `PeriodChart`, `Table`, `FileAttach`, `VideoViewer`, `TextField`, `Widget`.
- Раскладка: `Accordion`, `Tabs`, `Divider`, `Carousel`, `Dropdown` (меню у кнопки, без панели свойств); в корне `lib` - `Modal.svelte`, `Dragging.svelte` (свои README рядом: `Modal.README.md`, `Dragging.README.md`).
- Смарт-виджеты: `WidgetWiFi`, `WidgetDeviceInfo`, `WidgetLoRa`, `WidgetFileSystem`, `WidgetStackInfo`, `WidgetRGBStrip`, `WidgetPFD`, `WidgetMap`.
- `WidgetMap` - самый большой модуль: обёртка MapLibre (`mapWrapper/`), миссии (`mission/`: режимы «Маршрут» и «Агро», расчёт покрытия поля, прогресс, выгрузка QGC WPL 110, имитация).

Общие части интерфейса в корне `lib`: `WidgetHeader` (шапка виджета), `SectionHead` и `ExpandIcon` (сворачиваемые разделы), `FieldLabel` (подпись поля, с `info` - значок ⓘ с пояснением), `InfoHint` (сам значок ⓘ, пояснение позиционируется от окна и не обрезается), `Tooltip`, `CopiedChip`, `Icon`, `IconsMatrix` (выбор иконки), `Loader/` (крутилка, без панели свойств), значки `libIcons/` (экспорт под именами `IconArrow`, `IconCross` и другими), `TextsEditor` (окно «Тексты и переводы»), `CommonSnippets`, `PropsGroup`, `PropsListHeader`, `PropsListModal` (части панелей свойств).

</details>

## 🔄 Архитектура и потоки данных

### ✨ Главная идея

Пакет разделён на несколько точек входа. Приложение с интерфейсом берёт компоненты и рендерер, конструктор - ещё и панели свойств, а серверный код и терминал - только протокол и языки, которые работают под Node без Svelte.

Данные ходят двумя путями:

1. 🖥️ **Интерфейс устройства** (DevCloud, WebApp). Автор собирает GUI в конструкторе, рендерер его рисует. Пользователь меняет значение - рендерер собирает команду и отдаёт приложению, приложение шлёт её устройству и кладёт ответ в хранилище, рендерер обновляется сам.
2. 🔌 **Пакет по проводу** (DevTerminal, отладка DevCloud). Команда упаковывается в пакет `poe_cbor_pkt` и уходит по CAN, RS485 или UART-консоли. На приёме разборщики собирают пакеты из потока и превращают консоль в строки таблицы и графики.

### 💡 Полезно знать

- ⚡ Рендерер записывает новое значение сразу, не дожидаясь ответа устройства.
- 📦 Смарт-виджет работает сразу с группой полей и сохраняет их одной командой.
- 📁 Файлы для `WidgetFileSystem` и `FileAttach` рендерер передаёт сам.

<details>
<summary>🚪 Точки входа пакета</summary>

| Импорт                             | Файл в dist          | Что даёт                                                                                                                                                                                                         | Svelte нужен           |
| ---------------------------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| `poe-svelte-ui-lib`                | `index.js`           | Компоненты, виджеты, `GUIRenderer`, правила `gui.ts`, реестр `COMPONENTS`, `createFsTransfer`, i18n, `sanitizeHtml`, иконки, все типы                                                                            | да                     |
| `poe-svelte-ui-lib/constructor`    | `constructor.js`     | Панели свойств `*Props`, `PANELS`, `COMPONENT_DEFAULTS`, `COMPONENT_SIZES`, `createComponent`, `createPropsEditor`, `applyPropertyChange`, `optionsStore`, `TextsEditor`, `CommonSnippets`, словарь конструктора | да                     |
| `poe-svelte-ui-lib/protocols`      | `protocols/index.js` | CBOR, пакет `poe_cbor_pkt`, HAR, CRC, словарь, xPOE-Debug, CAN/slcan, графики отладки                                                                                                                            | нет, работает под Node |
| `poe-svelte-ui-lib/dictionaries/*` | файлы словарей       | `commands.yaml`, `messages.yaml`, `components.yaml`, `firmware/api_har.h`, `firmware/api_msg.h` как файлы                                                                                                        | -                      |
| `poe-svelte-ui-lib/locales`        | `locales/index.js`   | `LANGUAGES`, переводчик, `localizeDeep` без компонентов                                                                                                                                                          | нет, для Node          |
| `poe-svelte-ui-lib/theme.css`      | `theme.css`          | Палитра `.light`/`.dark`, типографика, роли `bg-*`/`border-*`                                                                                                                                                    | -                      |

Импорт `/constructor` один раз до отрисовки подключает словарь конструктора к `$T` библиотеки (`extendTranslations`). Ядро протоколов и `locales` используют импорты с расширением `.js`, чтобы их разрешал сам Node без бандлера.

</details>

<details>
<summary>🖥️ Поток GUI устройства (DevCloud, WebApp)</summary>

1. Автор собирает GUI в конструкторе DevCloud: холст 23 колонки, компоненты создаёт `createComponent`, свойства правят панели `PANELS[type]` через `PropertyChange`. Результат - массив `UIComponent[]`, его хранит приложение.
2. Приложение загружает GUI модуля и рисует `<GUIRenderer components link persistKey viewer render onError />`.
3. Рендерер переводит тексты (`localizeDeep`, кэш по ссылке и языку), строит дерево вложенности по `parentId` (дети `Accordion` и `Tabs`), раскладывает сетку и для каждого компонента берёт значение через `link.get(key)`.
4. Пользователь меняет значение. Компонент вызывает `onUpdate`, рендерер собирает пакет `commandPacket(eventHandler, get, [key, value])`: если в `eventHandler.Value` готовый JSON - он и есть Payload, иначе Payload собирается из `Variables` (ключ `группа-поле` становится вложенным объектом). Битовые поля пишутся через `writeBits`.
5. Рендерер записывает значение заранее (`link.set`, оптимистичное обновление) и отправляет `link.send(header, argument, payload)`. При `Argument: "NoSend"` значение только записывается, пакет не уходит.
6. Рендерер переводит имена команды в число `HAR` по словарю (`sendCommand`) и отдаёт его в `link.send(har, payload)`. Приложение заворачивает его в WebSocket-конверт `{HAR, VAL: {DevSN, ModSN, Payload}}`, устройство отвечает `OK!`/`ER!`. Входящий конверт приложение разбирает `decodeWsEnvelope` в `{ header, argument, code, reply, VAL }`.
7. Приложение кладёт ответ в реактивное хранилище (`SvelteMap`) функцией `mergeDevicePayload(values, "<ModSN>|", argument, Payload)` (`argument` - имя из разобранного конверта). `get` читает это хранилище, рендерер обновляется сам.

Смарт-виджеты работают с группой полей по префиксу (`CFG`, `LST`, `MAV`): читают `readWidgetFields`, сохраняют одним `SET ModCfg` из `widgetPacket` (только поля из `WIDGET_SAVE_FIELDS`). Поиск сетей - `GET APsList` с ожиданием ответа 3000 мс, перезагрузка - `SET Restart`, сброс - `SET RstNVS`, обновление снимков - `GET FS` и `GET StackInfo`. Файлы `WidgetFileSystem` и `FileAttach` рендерер ведёт сам через `createFsTransfer(link)`.

</details>

<details>
<summary>🔌 Поток пакета по проводу (DevTerminal, отладка DevCloud)</summary>

1. Команда собирается `encodePacket` в `poe_cbor_pkt`: CBOR-массив неопределённой длины `0x9F [TrgBusID, SrcBusID, HAR, Payload, CRC16] ... 0xFF`.
2. Для CAN/CAN FD пакет режется `canFragments`/`encodeCanPacket` на кадры 8 или 64 байта и уходит через slcan-адаптер (`slcanOpenCommands`, `encodeSlcanFrame`).
3. Для RS485 и UART-консоли пакет идёт сплошным потоком; на приёме разборщик ищет начало `0x9F 0x85`.
4. Приём: `createPacketStreamParser` (RS485), `createXPoeDebugParser` (консоль, пакеты вперемешку с текстом загрузчика), `createCanParser` (сборка фрагментов CAN). Общий буфер - `framer.ts`. RS485 и консоль ищут начало общей `packetStart` (`packet.ts`, метка `0x9F 0x85`), пакет без записей - мусор; `decodePacket` принимает только indefinite-массив `0x9F` (definite прошивка отвергает). CAN считает `sessionTimeoutMs` от последнего фрагмента и выдаёт только целый пакет.
5. Поле Value консоли - `xPoeDebugValueFromText`: поток YAML как в колонке VALUE (корневая карта без скобок, `h'0A1B'` - байтовая строка) или JSON, `0x0A1B` - готовый CBOR как есть, `12` - число 12.
6. Строки консоли превращаются в строки таблицы `xPoeDebugRow` (колонки `xPoeDebugTableColumns`: `TRG | SRC | КОМАНДА | VALUE | FHS`; `VALUE` - Payload как пришёл в стиле YAML (`A: 1, B: [1, 2]`, вставляется в поле Value тем же CBOR; окно - блочный YAML), сообщение устройства и HAR - в `КОМАНДЕ` и её подсказке), значения `DebugPlot` - в графики `createPlotGroups`/`debugPlotValues`.

</details>

<details>
<summary>🧩 Основные модули и обязанности</summary>

| Модуль                                    | Обязанность                                                                                                                                                                                       |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GUIRenderer/GUIRenderer.svelte`          | Отрисовка GUI: сетка, вложенность, значения, биты, пакеты, виджеты, файлы, журнал таблицы, узкий экран (`NARROW_MAX_PX = 640`)                                                                    |
| `gui.ts`                                  | Чистые функции без Svelte: `GUI_GRID`, `WIDGET_FIELDS`, `commandPacket`, `tablePacket`, `readBits`/`writeBits`, `mergeDevicePayload`, `layoutFlow`/`layoutColumns`/`flowMinWidth`                 |
| `registry.ts`                             | `COMPONENTS[type] = { view, io, fields? }` для конструктора; `COMPONENT_META` и `componentVariables` - в `componentMeta.ts`, без компонентов                                                      |
| `defaults.ts`                             | `COMPONENT_DEFAULTS`, `COMPONENT_SIZES`, `minComponentWidth`, `createComponent`                                                                                                                   |
| `propsEditor.ts`                          | `createPropsEditor` (`set`, `patch`, `addItem`, `updateItem`, `removeItem`), `applyPropertyChange`                                                                                                |
| `fsTransfer.ts`                           | Файлы по `SET FS`: чанки, повторы, CRC-32, общая очередь операций на транспорт                                                                                                                    |
| `protocols/`                              | CBOR, пакет, HAR, CRC, словарь, xPOE-Debug, CAN, графики отладки, `formatDeviceMessage`                                                                                                           |
| `dictionaries/`                           | Мастер-словари команд и сообщений, сгенерированный TS и заголовки прошивок                                                                                                                        |
| `locales/`                                | Список языков, переводчик `$T`, многоязычные тексты GUI                                                                                                                                           |
| `theme.css`, `accent.ts`, `themeWatch.ts` | Тема, цвет роли компонента, слежение за темой из JS                                                                                                                                               |
| `html.ts`                                 | `escapeHtml`, `htmlToText`, `sanitizeHtml` (белый список тегов SVG и текста; `href` только `#id` и у `<a>` `mailto:`, `style` только свойства цвета и значков, `class` без `fixed`/`inset`/`z-*`) |
| `bitField.ts`                             | Битовое поле 32-битного слова без знаковых операций JS (бит 31 корректен)                                                                                                                         |
| `widgetCollapse.ts`, `hints.ts`           | Свёрнутость виджетов и подсказки «?» в `localStorage` по `persistKey`                                                                                                                             |
| `ring.ts`                                 | Кольцевой буфер для потоков строк таблицы, точек графика, трека карты                                                                                                                             |
| `flightSim.ts`                            | Имитация полёта для `WidgetPFD`/`WidgetMap` (та же модель, что в прошивке)                                                                                                                        |

</details>

## 📜 Ключевые контракты: API, протокол, форматы, модели данных

### ✨ Что важно помнить

- 🧾 **GUI устройства - массив `UIComponent[]`.** У каждого компонента тип, свойства, место на сетке из 23 колонок, родитель, доступ и команда.
- 🔁 **Компонент говорит колбэками:** `onUpdate` - значение принято, `onInput` - значение во время ввода, `onPropertyChange` - правка свойств в конструкторе.
- 🌉 **Рендерер связан с приложением через `DeviceLink`:** читать значение, записать, отправить команду, дождаться ответа.
- 📦 **Пакет по проводу - `poe_cbor_pkt`:** адрес получателя и отправителя, заголовок с командой, тело и CRC.
- 📖 **Команда в проводе - число `HAR`** (заголовок, код из словаря `commands.yaml`, флаг ответа) и на шине, и в WebSocket-конверте `{HAR, VAL}`. Имена - только для людей.
- 📁 **Файлы передаются командой `SET FS`** по кускам с повторами и проверкой CRC-32.

<details>
<summary>🧾 Компонент GUI (`UIComponent`)</summary>

| Поле           | Тип                                          | Смысл                                                                                          |
| -------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `id`           | string                                       | UUID; у ребёнка `Tabs` - UUID без первого знака плюс номер вкладки (номер - после 35-го знака) |
| `type`         | `UIType`                                     | Один из 24 типов (`UIComponentPropsMap`)                                                       |
| `properties`   | по типу                                      | Сужается по `type`: после `type === "Button"` это `IButtonProps`                               |
| `position`     | `{ row, col, width, height }`                | Клетки сетки 23 колонки                                                                        |
| `parentId`     | string                                       | Родитель-контейнер, `""` - корень                                                              |
| `access`       | `full` / `viewOnly` / `hidden`               | В режиме `viewer` видны только `full` и `viewOnly`                                             |
| `eventHandler` | `{ Header?, Argument?, Value?, Variables? }` | Команда компонента; по умолчанию `SET ModCfg`, у `Input` - `NoSend`                            |

</details>

<details>
<summary>🔀 Реестр: тип обмена компонента (`ComponentIO`)</summary>

| `io`        | Компоненты                                                  |
| ----------- | ----------------------------------------------------------- |
| `none`      | `Accordion`, `Tabs`, `TextField`, `Divider`, `VideoViewer`  |
| `write`     | `Button`, `FileAttach`                                      |
| `readWrite` | `Input`, `Select`, `Switch`, `Slider`, `Joystick`, `Widget` |
| `read`      | `ProgressBar`, `Graph`, `PeriodChart`, `Table`              |
| `widget`    | 7 смарт-виджетов                                            |

</details>

<details>
<summary>📦 Смарт-виджеты: группы и поля (`WIDGET_FIELDS`)</summary>

Ключ поля на устройстве - `{префикс}.{keys[поле] ?? поле}`.

| Виджет             | Префикс по умолчанию | Поля (кратко)                                                                                                                | Сохраняемые поля                             |
| ------------------ | -------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `WidgetWiFi`       | `CFG`                | `WiFiMode` (0 NULL, 1 STA, 2 AP, 3 STA+AP), `StaSSID`, `StaPSK`, `StaticIP`, `StaIP/MS/GW`, `ApSSID/PSK/IP/MS/GW`            | все                                          |
| `WidgetDeviceInfo` | `CFG`                | `DevSN`, `DevID`, `DevFW`, `RunCnt`, `DevName`, `HostName`, `WebUser`, `WebPsw`, `StaIP`, `ApIP`                             | `DevName`, `HostName`, `WebUser`, `WebPsw`   |
| `WidgetLoRa`       | `LORA`               | ключи из `params` (шаблон HT_CT62 - одно слово `Cfg`)                                                                        | те же ключи, свои биты поверх текущего слова |
| `WidgetFileSystem` | `CFG`                | объект `FS` (Total/Used/Free/List, Upload во время закачки)                                                                  | -                                            |
| `WidgetStackInfo`  | без группы           | объект `StackInfo` (кучи и стеки задач)                                                                                      | -                                            |
| `WidgetRGBStrip`   | `LST`                | `Color` [R,G,B,W], `Effect` 0-7, `Speed` 0-10, `Count`, `Model` (WS2812/SK6812/WS2811), `Order`, `MaxCount`                  | `Count`, `Model`, `Order`                    |
| `WidgetPFD`        | `MAV`                | телеметрия MAVLink: ориентация, скорости, высоты, GPS, батарея, режим, маршрут, связь, сообщения (`Msg`, `MsgSev`, `MsgSeq`) | -                                            |
| `WidgetMap`        | `groups: ["MAV"]`    | на каждый борт: `Lat`, `Lon`, `Alt`, `Heading`, `Sat`, `DevName`, `DevSN`, `WPNum`                                           | -                                            |

</details>

<details>
<summary>🌉 Связь рендерера с приложением</summary>

```ts
interface DeviceTransport {
  send(header: string, argument: string, payload: Record<string, unknown>): unknown
  waitFor(argument: string, match: (reply: DeviceReply) => boolean, timeoutMs: number): Promise<DeviceReply | null>
}
interface DeviceLink extends DeviceTransport {
  get(key: string, module?: string): unknown
  set?(key: string, value: unknown): void
}
interface DeviceReply {
  ok: boolean
  payload: Record<string, unknown>
  message?: string
}
```

Хранилище значений приложения: ключ `<ModSN>|<ключ>`. `mergeDevicePayload` пишет объект целиком и дополнительно по полям `имя-поле`, дописывает ход закачки к снимку `CFG.FS`, пропускает служебные поля диалога FS (`Op`, `CurrentID`, `ChunkSize`, `ChunkIndex`, `Name`, `FileSize`, `CRC32`, `Data`), пишет только изменившиеся значения.

</details>

<details>
<summary>🔔 Колбэки компонентов и цвет</summary>

| Колбэк                      | Когда                                                                               | Аргументы                                                              |
| --------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `onUpdate`                  | Принятое значение: Enter, уход из поля, отпущенный бегунок, выбор варианта, счётчик | значение первым (у `Select` - `option.value`)                          |
| `onInput`                   | Текущее значение во время ввода или перетаскивания                                  | значение                                                               |
| `onPropertyChange` (панели) | Изменение свойств в конструкторе                                                    | `PropertyChange`: новые `properties`, `name`, `access`, `eventHandler` |

Цвет компонента - проп `accent`: `gray`, `red`, `orange`, `yellow`, `green`, `cyan`, `blue`, `purple` (`ACCENT_COLORS`). У `Button` ещё `variant` (`primary`, `secondary`, `plain`).

</details>

<details>
<summary>📡 Пакет `poe_cbor_pkt` и каналы</summary>

| Поле записи | Тип                | Смысл                                                                                                |
| ----------- | ------------------ | ---------------------------------------------------------------------------------------------------- |
| `TrgBusID`  | uint16             | Получатель, `0xFFFF` - всем                                                                          |
| `SrcBusID`  | uint16             | Отправитель, `0x0000` - внешний клиент (терминал, отладка облака)                                    |
| `HAR`       | uint16             | Биты 15-14 заголовок (0 GET, 1 SET, 2 OK!, 3 ER!), биты 13-1 команда 0..8191, бит 0 - нужен ответ    |
| `Payload`   | одно значение CBOR | Объект/массив/число/строка, байтовая строка для сырых полей, `null` - пусто                          |
| `CRC16`     | uint16             | CRC-16/KERMIT (полином `0x8408`, init 0, check `0x2189`) по байтам записи от `0x85` до конца Payload |

- Пакет: `0x9F` + записи по 5 элементов (`0x85`) + `0xFF`. Пара `0x9F 0x85` - начало пакета в потоке.
- BusID модуля - CRC-16 его серийного номера, `0x0000` и `0xFFFF` не выдаются.
- Запись с неверной CRC пропускается, остальные записи пакета принимаются.
- Разборщики: пауза дольше `gapMs` (по умолчанию 100 мс; у CAN - `sessionTimeoutMs`) сбрасывает недособранное, предел `maxBytes` по умолчанию 8192. Пауза RS485 в прошивке - 20 мс.
- Пример `GET ModCfg {}` из терминала: `9F 85 00 00 18 49 A0 19 66 06 FF` (HAR `0x0049`, CRC `0x6606`).

| Канал                   | Передача                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CAN, CAN FD             | Кадры 8 или 64 байта; 11-битный ID: бит 10 - последний кадр (`CAN_FINAL_BIT`), биты 0-9 - номер пакета                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| RS485                   | Сплошной поток, поиск `0x9F 0x85`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| LoRa                    | Пакет целиком в одном радиокадре                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| UART-консоль xPOE-Debug | Поток вперемешку с текстом загрузчика; логи `OK! DebugLog` `[уровень, тег, текст \| байты, FHS]`, графики `OK! DebugPlot` `{"Группа.Имя": float32}`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| WebSocket               | Конверт `{HAR, VAL}` на всех соединениях (браузер - облако, облако - устройство, WebApp - устройство): `HAR` - то же 16-битное число, что на шине (заголовок, код из словаря, флаг ответа), имён в проводе нет. Запрос `VAL: {DevSN, ModSN?, TrgBusID?, SrcBusID?, Payload?}`, ответ `VAL: {DevSN, ModSN, Message, Args?, Payload}`, `Message` - код из `messages.yaml` (0 - нет сообщения; группы `SYS` 1-99, `CFG` 100-199, `FS` 200-299, `FW` 300-399, `WIFI` 400-499, `DEV` 1000-1999), `Args` - параметры шаблона, текст, уровень и группа - `formatDeviceMessage`. У `ER!` модуля на шине `Payload` - карта `{Message, Args?}`, хаб переносит её в `VAL`; в консоли сообщение - `DebugLog` с тегом `HAR 0x....` и текстом `MSG <код>[ <арг1>[<TAB><арг2>...]]` (`parseDebugLogMessage`). Сборка и разбор - `encodeWsEnvelope`, `decodeWsEnvelope` |

Аутентификация устройства в облаке (TOFU) описана в `PROTOCOL.md`: токен 64 hex-символа, передаётся `Authorization: Bearer`, выдаётся в `SET JoinDev {DevToken}`, неверный токен после подтверждения - закрытие кодом `1008`.

</details>

<details>
<summary>📖 Словарь команд (`dictionaries/commands.yaml`)</summary>

Строка словаря: `- [Строка, Перечисление, Код]`, код 0..8191 (13 бит). Диапазоны: 0-4095 - команды устройств, 7000-7999 - команды самого облака DevCloud по `/ws` (устройства их не получают), 4096-6999 и 8000-8191 - резерв. Группы кодов:

| Диапазон  | Группа                      | Примеры                                                                                                                                                                                              |
| --------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0         | нет аргумента               | `Unknown`                                                                                                                                                                                            |
| 1-15      | служебные                   | `Restart` 1, `DefCfg` 2, `DlFW` 3, `RstNVS` 5, `LocTime` 6, `Update` 7, `StackInfo` 8, `BackUp` 9, `BindMKey` 10, `DebugLog` 11, `DebugPlot` 12, `DataStream` 15                                     |
| 21-25     | локальная сеть              | `APsList` 21, `FS` 22, `JoinDev` 23, `JoinUser` 24, `LeaveUser` 25                                                                                                                                   |
| 31-46     | модули изделия              | `ModFind` 31, `ModList` 32, `ModCap` 33, `ModInfo` 34, `ModMode` 35, `ModCfg` 36, телеметрия `ModT1-5` 37-41, потоки `ModS1-5` 42-46                                                                 |
| 51-54     | обновление прошивки по шине | `FwUpgS`, `FwUpgP`, `FwUpgD`, `FwUpgE`                                                                                                                                                               |
| 111-117   | модули перемещения          | `MotInit`, `MotMode`, `MotPos`, `MotPID`, `MotInfo`, `MotCfg`, `MotCal`                                                                                                                              |
| 141-144   | модули ориентации           | `OrData`, `OrOfs`, `OrAccCal`, `OrMagCal`                                                                                                                                                            |
| 7000-7011 | облако: чаты                | `ChatMessage` 7000, `ChatMessages`, `SystemMessage`, `EditMessage`, `DeleteMessage`, `UpdateLastRead`, `JoinChat`, `UserConnected`, `ChatUnread`, `ChatPins`, `EditChatGroup`, `RemoveFromChat` 7011 |
| 7100-7104 | облако: устройства          | `DeviceMessages` 7100, `DeviceConnection` 7101, `LeaveGroup` 7102, `LeaveGroups` 7103, `ResetDevToken` 7104                                                                                          |

Задел: `BackUp`, `BindMKey`, `ModList`, `ModMode`, `ModT2-ModT5`, `FwUpgE`, `OrOfs`, `OrAccCal`, `OrMagCal` есть в словаре, но ни одна прошивка ESP/STM их пока не обрабатывает. Коды закреплены и не меняются, описания в `commands.yaml` - план, а не текущее поведение. В примерах документации берут команды, которые прошивки реально обрабатывают: `ModCfg`, `ModInfo`, `FS`, `APsList`, `StackInfo`.

`scripts/GenerateDictionary.mjs` превращает словарь в `DEFAULT_ARGUMENT_CODES` (`dictionaries/generated/commands.ts`, не править руками) и падает на повторе имени или кода и на коде больше `0x1FFF`. Словарь конкретного устройства читается `parseArgumentDictionary` и оборачивается `createDictionary(codes)`.

</details>

<details>
<summary>📁 Обмен файлами (`SET FS`)</summary>

| Операция              | Шаги `Op`                                                                                                                     |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `upload(name, bytes)` | `UploadStart` (`FileName`, `FileExtension`, `FileSize`) -> `UploadChunk` (`ChunkIndex`, `Data`) ... -> `UploadDone` (`CRC32`) |
| `download(name)`      | `DownloadStart` (`Name`) -> `DownloadChunk` ... -> `DownloadDone`                                                             |
| `list()`              | `GET FS` без `Op` - снимок                                                                                                    |
| `remove(name)`        | `SET FS {Op: "Delete", Name}` - снимок после удаления                                                                         |

Параметры `createFsTransfer`: `argument = "FS"`, `timeoutMs = 5000`, `retries = 3`, `maxNameLength = 31` (байты UTF-8; длинное или пустое имя - `FsNameError` до `UploadStart`, единственная проверка имени; `GUIRenderer` берёт предел из свойств `WidgetFileSystem`, очередь передач по ключу `аргумент:предел`). Размер чанка задаёт устройство, ответ сверяется по `Op`, `CurrentID` и `ChunkIndex`, чанк после `ER!` или таймаута повторяется. Операции идут строго по одной в очереди, общей для транспорта.

</details>

## ⚙️ Конфигурация и настройки

### 🧩 Как подключить

Приложение подключает в своём `app.css` Tailwind, тему библиотеки и папку собранного пакета, чтобы Tailwind увидел классы компонентов. Дальше настраивать почти нечего: сетка, размеры, язык и тема имеют значения по умолчанию.

### 💡 Полезно знать

- 🌍 Язык по умолчанию - русский, выбранные язык и тема запоминаются в браузере.
- 🗺️ Для карты без интернета нужно заранее указать, откуда брать MapLibre и стили.
- ✍️ Свои стили тегов в приложении пишутся только внутри `@layer base`, иначе они перебивают утилиты Tailwind.

<details>
<summary>🎨 Подключение в `app.css`</summary>

```css
@import "tailwindcss";
@import "poe-svelte-ui-lib/theme.css";
@source "../node_modules/poe-svelte-ui-lib/dist";
@custom-variant dark (&:where(.dark, .dark *));
```

Стили тегов в приложении пишутся только внутри `@layer base`, иначе они перебивают утилиты Tailwind. Классы ролей (`.bg-red`, `.bg-max`) и классы темы остаются вне слоя.

</details>

<details>
<summary>📋 Настройки и значения по умолчанию</summary>

| Что                                   | Где                                                                       | Значение                                                                                                                                                                                                     |
| ------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Сетка GUI                             | `GUI_GRID` в `gui.ts`                                                     | 23 колонки, высота строки 6rem                                                                                                                                                                               |
| Узкий рендерер                        | `NARROW_MAX_PX` в `GUIRenderer.svelte`                                    | 640 px                                                                                                                                                                                                       |
| Минимальная ширина смарт-виджета      | `minComponentWidth`                                                       | 7 клеток (треть сетки)                                                                                                                                                                                       |
| Минимальные ширины блоков на телефоне | `MIN_PX` в `gui.ts`                                                       | `Switch` 90, `Input` 120, `Select` 130, `Slider` 120, `Button` 110, `TextField` 100, `ProgressBar` 140, `Widget` 120, `Joystick` 200 px                                                                      |
| Базовый кегль темы                    | `theme.css`                                                               | 15px; уже 768px - 14px; на сенсорном экране поля ввода не мельче 16px                                                                                                                                        |
| Язык по умолчанию                     | `DEFAULT_LANGUAGE`                                                        | `ru`; список `LANGUAGES`: `ru`, `en`, `zh`                                                                                                                                                                   |
| Хранение языка                        | `localStorage` `AppLanguage`                                              | `setLanguage`, `restoreLanguage`                                                                                                                                                                             |
| Хранение темы (витрина, приложения)   | `localStorage` `AppTheme`, классы `.light`/`.dark`, событие `ThemeChange` | следит `themeWatch.ts`                                                                                                                                                                                       |
| Данные в браузере у рендерера         | ключи по `persistKey` (обычно `ModSN`)                                    | свёрнутость виджетов, подсказки, планы карты `WidgetMap.plan                                                                                                                                                 | ...`, `WidgetMap.route | ...` |
| Значения по умолчанию виджетов        | `COMPONENT_DEFAULTS`                                                      | `WidgetFileSystem.maxNameLength` 31, `WidgetStackInfo.warnBytes` 512, `WidgetPFD.limits.staleMs` 2000, `WidgetMap.height` 400, `trackLength` 1000, `Table.dataBuffer` `{ bufferSize: 100, visibleRows: 10 }` |
| Карта без интернета                   | `configureMapLibre({ module, css, styles })`                              | вызвать до первой отрисовки карты; без сети через 10 с - «нет подключения»                                                                                                                                   |
| Сборка витрины                        | `vite.config.ts`                                                          | `adapter-static` в `docs/`, `paths.base = "/ElementsUI"`, `__LIB_VERSION__` из `package.json`, `maplibre-gl` внешний                                                                                         |
| npm                                   | `.npmrc`                                                                  | `engine-strict=true`                                                                                                                                                                                         |
| Скрипты зависимостей                  | `allowScripts` в `package.json`                                           | версии должны совпадать с установленными (сейчас `esbuild@0.28.2`)                                                                                                                                           |

</details>

## 🔨 Сборка, запуск, проверка, тесты, форматирование

### ✨ Обычный порядок работы

1. Поставить зависимости и открыть витрину на dev-сервере.
2. Править компонент и смотреть его на витрине, в том числе в режиме «Телефон».
3. Проверить типы, а после правки протоколов прогнать тесты протоколов.
4. Перед коммитом отформатировать проект единственной командой форматирования.

### 💡 Полезно знать

- 🧪 Тесты работают против собранного пакета `dist/`, поэтому сначала идёт сборка пакета.
- 📦 Перед публикацией `npm pack` прогоняет всю цепочку проверок сам.
- 🚫 Сгенерированные файлы словаря и иконок руками не правятся.

<details>
<summary>⌨️ Команды</summary>

| Команда                          | Что делает                                                                                                                                                                                                                                                                        |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm install`                    | Зависимости                                                                                                                                                                                                                                                                       |
| `npm run dev`                    | Витрина на dev-сервере Vite                                                                                                                                                                                                                                                       |
| `npm run Test`                   | Генерация словаря, `svelte-package`, `node --test tests/*.test.mjs`                                                                                                                                                                                                               |
| `npm run Generate`               | всё сгенерированное: словари `dictionaries/` (`commands.yaml`, `messages.yaml`, `components.yaml` -> `generated/*.ts`, заголовки прошивок `firmware/api_har.h`, `api_msg.h`) и `src/lib/icons.ts` из каталога `assets/IconsCatalog`; перед публикацией и в `Test` запускается сам |
| `npm run Formatting`             | `prettier --write .` - единственный способ форматирования, перед каждым коммитом                                                                                                                                                                                                  |
| `npm run build`                  | Сборка витрины в `docs/`                                                                                                                                                                                                                                                          |
| `npm pack` (запускает `prepack`) | Словарь -> `svelte-kit sync` -> `svelte-check` -> `svelte-package` (в `dist/`) -> `tsc -p tests/dist-types.tsconfig.json` (проверка `.d.ts` так, как их видит приложение) -> `node --test tests/*.test.mjs` -> `publint`                                                          |
| `npm run CheckUpdate`            | `npx npm-check-updates -u && npm install`                                                                                                                                                                                                                                         |

</details>

<details>
<summary>🧪 Тесты</summary>

Тесты (`tests/`, `node:test`, работают против собранного `dist/`):

| Файл                  | Что проверяет                                                                                                   |
| --------------------- | --------------------------------------------------------------------------------------------------------------- |
| `protocols.test.mjs`  | Кодек и разборщики против эталонных байт, собранных кодом прошивки                                              |
| `gui.test.mjs`        | Поля виджетов, битовые поля, пакеты кнопки и таблицы, `mergeDevicePayload`, раскладку по группам                |
| `bitField.test.mjs`   | Битовые поля против эталона на BigInt, включая бит 31                                                           |
| `fsTransfer.test.mjs` | Обмен файлами против модели `file_system` ProdFactory-ESP: чанки, повтор после `ER!` и таймаута, CRC32, очередь |
| `html.test.mjs`       | `sanitizeHtml` против типовых XSS и внешних ресурсов                                                            |
| `coverage.test.mjs`   | Облёт поля `WidgetMap` (агро): площадь и число проходов                                                         |
| `localize.test.mjs`   | Перевод текстов GUI (`localizeDeep`)                                                                            |
| `maplibre.test.mjs`   | Версия MapLibre на CDN (`MAPLIBRE_VERSION`) совпадает с установленной `maplibre-gl`                             |

Ручная проверка узкого экрана: кнопка «Телефон» в витрине (рамка 375 px) и временная страница `src/routes/<новое имя>` с `GUIRenderer`/виджетами на 320-414 px; перед коммитом страницу удалить.

</details>

## 🚀 Выпуск и развёртывание

Выпуск запускается сообщением коммита в `main`: тег `[publish]` публикует пакет в npm, тег `[deploy]` выкладывает витрину на GitHub Pages. Версия поднимается в `package.json` заранее (версия витрины берётся оттуда же). Обычный вид: `X.Y.Z [deploy] [publish] описание`.

### 💡 Полезно знать

- ☁️ После публикации CI сам ставит новую версию в DevCloud и запускает выкатку облака. Вручную версию библиотеки в облаке не поднимают.
- 🔑 Публикация в npm идёт без постоянного токена.
- 🧰 WebApp прошивки и DevTerminal обновляют зависимость сами.

<details>
<summary>🔐 Workflow выпуска подробно</summary>

| Тег         | Workflow                                                 | Что происходит                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ----------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `[publish]` | `.github/workflows/npm_publish.yaml`, job `publish`      | Ubuntu 24.04, Node 24, `npm install -g npm@11.20.0` (версия закреплена), `npm ci` (ровно по `package-lock.json`), `npm publish --access public --provenance=false` (prepack запускается один раз, самим `npm publish`). Публикация через trusted publisher npm (OIDC, `id-token: write`), постоянного токена нет                                                                                                                                                                              |
| `[publish]` | тот же workflow, job `update-devcloud` (после `publish`) | Ждёт версию в реестре npm (до 40 попыток по 15 с, 10 минут), клонирует DevCloud с `git.xpoe.pro/xPOE-Studio/DevCloud.git` по секрету `DEVCLOUD_ACCESS_TOKEN`, ставит `poe-svelte-ui-lib@VERSION`, `svelte-kit sync`, `prisma generate` (с фиктивным `DATABASE_URL`), `svelte-check --threshold error`. Если всё прошло и `package.json` изменился - `npm version minor` в DevCloud и коммит `X.Y [deploy] Обновление ElementsUI до X.Y.Z` в `main` облака, что запускает развёртывание облака |
| `[deploy]`  | `.github/workflows/ghpages_deploy.yaml`                  | Node 24, `npm install`, `npm run build`, выгрузка `./docs` в GitHub Pages                                                                                                                                                                                                                                                                                                                                                                                                                     |

Оба workflow можно запустить и вручную (`workflow_dispatch`). Версию библиотеки в DevCloud вручную не поднимают; если проверка типов облака упала, облако остаётся на старой версии, причина - в логе job `update-devcloud`. WebApp прошивки и DevTerminal обновляют зависимость сами, автоматики для них в этом репозитории нет.

</details>

## 📏 Правила и соглашения разработки

### ✨ Главное

- 👀 Компонент - только показ и колбэки, без сети и состояния устройств.
- 🧩 У каждого компонента три файла: сам компонент, панель свойств и README.
- 🎨 Цвета только токенами темы, тексты только через переводчик.
- 📱 Компонент подстраивается под ширину своего места, а не окна.
- 🛡️ HTML из GUI и данных устройства выводится только после очистки.
- 📖 Новая команда протокола сначала добавляется в мастер-словарь.

<details>
<summary>📝 Все правила подробно</summary>

- Svelte 5 на рунах, TypeScript `strict`. Компонент - только показ и колбэки, без сети и состояния устройств.
- Внутри `src/lib` импорты относительные; витрина импортирует библиотеку через `#lib` (поле `imports` в `package.json`). В ядре протоколов и `locales` импорты с расширением `.js`.
- У каждого компонента: `Компонент.svelte`, парная панель `КомпонентProps.svelte` (только через `/constructor`), `README.md` рядом. Новый тип добавляется в `UIComponentPropsMap` (`types.ts`), `COMPONENT_META` (`componentMeta.ts`), `COMPONENTS` (`registry.ts`; ещё в `GUI_VIEWS` (`guiViews.ts`) и ветку в `GUIRenderer`), `PANELS` (`constructor.ts`), `COMPONENT_DEFAULTS` и `COMPONENT_SIZES` (`defaults.ts`).
- Панели свойств не меняют свойства на месте: `createPropsEditor` отправляет новые объекты верхнего уровня одним `PropertyChange`.
- Описание компонента два: короткое по кнопке (i) (ключ `component.info.<Тип>` словаря конструктора: Назначение, Пакет данных, Ключи, Особенности, Настройки) и подробное `src/lib/<Компонент>/README.md` (открывается на вкладке «Инфо» витрины). Оно не должно противоречить короткому. В интерфейсе пользователя описаний для программиста нет.
- Тексты компонентов только через `$T("ключ")` из `translations.ts`, русских строк в разметке нет. Тексты из конструктора - строка или `{ ru, en, zh }`, переводятся `localizeDeep`.
- Цвета только токенами темы: цветной текст и линии - `--*-text`, заливки - `--*-color`, мягкий фон - `--*-soft`, метки - `--*-mark`, акцент как текст - `--accent-text`. Текст не делают полупрозрачным, подписи не мельче 11px, панели не полупрозрачные.
- Узкий экран: корень виджета `@container`, колонки `@sm:`/`@md:`/`@xl:`; классы `sm:`/`md:` (ширина окна) в компонентах не используются (исключение - размеры текста `TextField`, `max-sm:`). Шапка виджета всегда одна строка.
- HTML из GUI и данных устройства - только через `sanitizeHtml`. Ячейка `Table` по умолчанию текст; разметка - `html: true` и экранирование `escapeHtml` на стороне данных.
- Новая команда протокола или сообщение устройства: правка `src/lib/dictionaries/commands.yaml` или `messages.yaml`, `npm run Generate` (генерирует и `src/lib/dictionaries/firmware/api_har.h`, `api_msg.h`), затем копирование `commands.yaml`/`messages.yaml` в `.framework/Dictionary.yaml`/`Messages.yaml` и обоих заголовков в `api_service` обоих фреймворков; после правки протоколов - `npm run Test`.
- Компоненты не выводят случайные DOM id; проп `id` примитива - переменная устройства, в разметку не попадает (кроме `Button`).
- Комментарии в коде только однострочные `/* ... */`, без истории «было/стало». Документация описывает только текущее состояние. В текстах обычный дефис, без длинных и средних тире.
- Форматирование: Prettier (`printWidth` 160, без точек с запятой, двойные кавычки по умолчанию, `trailingComma: all`, LF), только `npm run Formatting`.
- Коммит только после показа изменений и явного «коммить», без строк соавторства. Ненужное удаляется сразу.
- Генерируемые файлы не правятся руками: `src/lib/dictionaries/generated/`, `src/lib/dictionaries/firmware/api_har.h`, `src/lib/dictionaries/firmware/api_msg.h`, `src/lib/icons.ts`.

</details>

## ⚠️ Известные ограничения и принятые решения

По `AGENTS.md` открытых известных проблем нет.

### 💡 Принятые решения коротко

- 📐 Сетка из 23 колонок выбрана, чтобы ровно вставали группы одинаковой ширины с пустой колонкой между ними.
- 🌐 Рендерер и обмен файлами ничего не грузят из интернета, кроме карты.
- 🔄 Vite держит старые модули: после удаления и создания файлов dev-сервер нужно перезапускать.

<details>
<summary>📋 Все решения и ограничения</summary>

- Сетка 23 колонки выбрана, чтобы ровно вставали 2, 3, 4, 6 и 12 одинаковых групп с пустой колонкой между ними (11, 7, 5, 3 и 1 колонка на группу). Рендерер понимает GUI по группам, поэтому автор соблюдает 7 правил раскладки из README (раздел «GUI устройства», «Правила для автора GUI»).
- `Accordion` и смарт-виджеты занимают одну строку сетки и растут по содержимому (`spanRows`).
- Содержимое `Accordion` и выбранной вкладки `Tabs` рендерер рисует через `Layout` (у `Tabs` - сниппет `Content`): на узком экране по группам `layoutFlow`, а не в сетке `size.width`.
- `VideoViewer`: камера, полученная после размонтирования (флаг `destroyed` после `await getUserMedia`), сразу выключается; список камер - по событию `devicechange`, без опроса.
- Сворачиваемые разделы внутри виджетов - `SectionHead` с круглым `ExpandIcon`; в шапках виджетов и в `Accordion` маленькая стрелка (решение владельца).
- `Select type="buttons"` без `fitContent` сам становится выпадающим списком, если варианты не помещаются; с `fitContent` не сворачивается никогда.
- `WidgetPFD` уже 440 px рисуется 1:1. На карте нет кнопок масштаба и местоположения (колесо и два пальца), есть компас и полный экран.
- Новые виджеты на холсте конструктора создаются свёрнутыми (`collapsed: true`).
- MapLibre по умолчанию с CDN; имитация (`isTest`) у `WidgetMap`, `WidgetPFD`, `Graph` грузится отдельным модулем только при включении, чтобы прошивка могла исключить её из flash.
- `Graph` добавляет точку только на новый массив `streamingData.data` или вызов `push`; изменение на месте точек не даёт.
- Иконка в GUI сохраняется как SVG, поэтому перестановка каталога не ломает сохранённые интерфейсы.
- Рендерер и обмен файлами ничего не грузят из интернета (кроме карты).
- Подводный камень разработки: Vite держит старые модули. После удаления и создания файлов или правок в `node_modules` - перезапуск dev-сервера с очисткой `node_modules/.vite`, временную страницу каждый раз называть по-новому; ошибки со старой меткой `?t=` - от старого модуля.
- Корень пакета тянет Svelte-компоненты, поэтому серверный код под Node импортирует только `/protocols` и `/locales`.

</details>

## 🗺️ Карта документации

Главное руководство - `README.md` в корне: тот же текст показан на вкладке «Обзор» витрины и на npm. Правила для ИИ - `AGENTS.md`, протокол целиком - `src/lib/protocols/PROTOCOL.md`. У каждого компонента свой README рядом с кодом.

<details>
<summary>📚 Все документы</summary>

| Путь                                 | О чём                                                                                                                                                                                                                                                                                           |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `README.md`                          | Главное руководство: что внутри, установка, колбэки, `GUIRenderer` и правила раскладки, `DeviceLink`, функции рендерера, реестр, файлы, протокол кратко, словарь, тема и контраст, иконки, языки, как описывать компонент, разработка, выпуск. Тот же текст на вкладке «Обзор» витрины и на npm |
| `AGENTS.md`                          | Правила для ИИ-агентов: границы библиотеки, узкий экран, подводные камни Vite, выпуск, правила работы с пользователем, известные проблемы, форматирование                                                                                                                                       |
| `src/lib/dictionaries/README.md`     | Словари команд и сообщений: как добавить команду или сообщение, генерация, копирование во фреймворки, стиль заголовков прошивок                                                                                                                                                                 |
| `src/lib/protocols/PROTOCOL.md`      | Протокол целиком: пакет, HAR, словарь, Payload, CRC, адреса, каналы, отладка в консоли, WebSocket-конверт, TOFU-аутентификация, пример байт, соответствие функций прошивки и библиотеки                                                                                                         |
| `src/routes/RegExp.md`               | Справочник регулярных выражений для проверки полей ввода (вкладка витрины)                                                                                                                                                                                                                      |
| `src/lib/Modal.README.md`            | Модальное окно: стек окон, Escape, фокус                                                                                                                                                                                                                                                        |
| `src/lib/Dragging.README.md`         | Перетаскивание элементов списков                                                                                                                                                                                                                                                                |
| `src/lib/Accordion/README.md`        | Сворачиваемый блок, слот `actions`                                                                                                                                                                                                                                                              |
| `src/lib/Button/README.md`           | Кнопка: `variant`, `accent`, подсказки                                                                                                                                                                                                                                                          |
| `src/lib/Carousel/README.md`         | Карусель                                                                                                                                                                                                                                                                                        |
| `src/lib/Divider/README.md`          | Разделитель                                                                                                                                                                                                                                                                                     |
| `src/lib/FileAttach/README.md`       | Выбор и отправка файла                                                                                                                                                                                                                                                                          |
| `src/lib/Graph/README.md`            | Потоковый график, `push`, имитация                                                                                                                                                                                                                                                              |
| `src/lib/Input/README.md`            | Поле ввода, типы, битовый режим, проверка                                                                                                                                                                                                                                                       |
| `src/lib/Joystick/README.md`         | Джойстик по осям                                                                                                                                                                                                                                                                                |
| `src/lib/PeriodChart/README.md`      | График уровней по периодам                                                                                                                                                                                                                                                                      |
| `src/lib/ProgressBar/README.md`      | Индикаторы прогресса                                                                                                                                                                                                                                                                            |
| `src/lib/Select/README.md`           | Список: `select`, `buttons`, `input`, `multiSelect`, `bitMode`                                                                                                                                                                                                                                  |
| `src/lib/Slider/README.md`           | Бегунок                                                                                                                                                                                                                                                                                         |
| `src/lib/Switch/README.md`           | Переключатель, биты                                                                                                                                                                                                                                                                             |
| `src/lib/Table/README.md`            | Таблица: колонки, журнал `push`, кнопки строк, `html`, сортировка, xPOE-Debug                                                                                                                                                                                                                   |
| `src/lib/Tabs/README.md`             | Вкладки                                                                                                                                                                                                                                                                                         |
| `src/lib/TextField/README.md`        | Текст и заголовки                                                                                                                                                                                                                                                                               |
| `src/lib/VideoViewer/README.md`      | Видео, своя отрисовка через `render`                                                                                                                                                                                                                                                            |
| `src/lib/Widget/README.md`           | Примитив-виджет со значком и слайдером                                                                                                                                                                                                                                                          |
| `src/lib/WidgetWiFi/README.md`       | Режим сети, STA/AP, поиск сетей                                                                                                                                                                                                                                                                 |
| `src/lib/WidgetDeviceInfo/README.md` | Паспорт устройства, настройки, перезагрузка и сброс                                                                                                                                                                                                                                             |
| `src/lib/WidgetLoRa/README.md`       | Настройки радио LoRa: параметры, их место в прошивке и шаблоны драйверов                                                                                                                                                                                                                        |
| `src/lib/WidgetFileSystem/README.md` | Файловая система устройства, закачка и удаление                                                                                                                                                                                                                                                 |
| `src/lib/WidgetStackInfo/README.md`  | Память и стеки задач                                                                                                                                                                                                                                                                            |
| `src/lib/WidgetRGBStrip/README.md`   | Адресная светодиодная лента                                                                                                                                                                                                                                                                     |
| `src/lib/WidgetPFD/README.md`        | Пилотажный дисплей по телеметрии MAVLink                                                                                                                                                                                                                                                        |
| `src/lib/WidgetMap/README.md`        | Карта: борта, треки, миссии «Маршрут» и «Агро», имитация, офлайн-карта (самый большой README)                                                                                                                                                                                                   |

В `dist/` (в `.gitignore`) лежат копии этих README, попавшие в пакет; источник - `src/`.

</details>

## 📖 Глоссарий

Короткие пояснения к словам, которые встречаются в этом обзоре и в README.

<details>
<summary>🔤 Термины</summary>

| Термин                   | Значение                                                                                                                                                        |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| xPOE-DevStack            | Стек проектов: DevCloud, ElementsUI, DevTerminal, ProdFactory-ESP, ProdFactory-STM                                                                              |
| `poe-svelte-ui-lib`      | Имя npm-пакета этого репозитория                                                                                                                                |
| Витрина                  | Сайт SvelteKit из `src/routes` с примерами и панелями свойств, на GitHub Pages                                                                                  |
| Конструктор              | Редактор GUI устройства в DevCloud; его части в библиотеке - точка входа `/constructor`                                                                         |
| Панель свойств           | `*Props.svelte`: редактор свойств компонента в конструкторе, отдаёт `PropertyChange`                                                                            |
| GUI                      | Описание интерфейса устройства - массив `UIComponent[]`                                                                                                         |
| `GUIRenderer`            | Компонент, который рисует GUI и обменивается с устройством через `DeviceLink`                                                                                   |
| `DeviceLink`             | Мост рендерера к приложению: `get`, `set`, `send`, `waitFor`                                                                                                    |
| Смарт-виджет             | Готовый блок `Widget*` под одну задачу, работает с группой полей по префиксу                                                                                    |
| Примитив                 | Обычный компонент, привязанный к одной переменной устройства                                                                                                    |
| Группа полей / префикс   | Часть ключа до точки: `CFG`, `LST`, `MAV` (группы `config_service` прошивки)                                                                                    |
| `ModSN`, `DevSN`         | Серийный номер модуля и устройства; ключ хранилища `<ModSN>                                                                                                     | <ключ>` |
| `ModCfg`                 | Команда 36: чтение и запись конфигурации модуля                                                                                                                 |
| `NoSend`                 | Аргумент `eventHandler`: значение записывается локально, пакет не отправляется                                                                                  |
| Битовое поле (`bitMode`) | Режим `Input`/`Select`: компонент читает и пишет биты `range` 32-битного слова                                                                                  |
| `poe_cbor_pkt`           | Пакет протокола: CBOR-массив записей `[TrgBusID, SrcBusID, HAR, Payload, CRC16]`                                                                                |
| HAR                      | 16-битное поле: заголовок, команда, флаг ответа                                                                                                                 |
| BusID                    | Адрес модуля на шине: CRC-16 серийного номера                                                                                                                   |
| Заголовок                | `GET`, `SET`, `OK!`, `ER!`                                                                                                                                      |
| Аргумент / команда       | Имя или код из словаря (`ModCfg` = 36)                                                                                                                          |
| Мастер-словари           | `src/lib/dictionaries/commands.yaml`, `messages.yaml`; копии в `.framework/Dictionary.yaml`, `Messages.yaml` прошивок                                           |
| xPOE-Debug               | UART-консоль устройства как шина: пакеты вперемешку с текстом, логи `DebugLog`, графики `DebugPlot`                                                             |
| FHS                      | Свободная память устройства в записи `DebugLog`                                                                                                                 |
| slcan                    | Текстовый протокол USB-CAN адаптера, через который терминал работает с CAN                                                                                      |
| TOFU                     | Доверие при первом подключении: облако выдаёт устройству токен `DevToken`                                                                                       |
| WebApp                   | Веб-интерфейс, который прошивка ProdFactory-ESP раздаёт с устройства                                                                                            |
| `accent`                 | Роль цвета темы компонента (`gray` ... `purple`)                                                                                                                |
| Токены темы              | CSS-переменные: `--bg-body`, `--back-color`, `--container-color`, `--field-color`, `--font-color`, `--muted-color`, `--faint-color`, `--*-color/text/soft/mark` |
| `ui-panel`, `ui-inset`   | Готовые классы поверхностей: блок на фоне страницы и блок внутри панели                                                                                         |
| `persistKey`             | Ключ хранения в браузере (обычно `ModSN`) для свёрнутости, подсказок и планов карты                                                                             |
| `viewer`                 | Режим наблюдателя: только `access` `full`/`viewOnly`, управление отключено (`WidgetWiFi`/`WidgetDeviceInfo` без `onSave` - только чтение, пароли маской)        |
| Узкий экран              | Рендерер уже 640 px: блоки раскладываются по группам, карточками и строками формы                                                                               |
| Режим «Телефон»          | Кнопка витрины: пример в рамке 375 px                                                                                                                           |
| `[publish]`, `[deploy]`  | Теги в сообщении коммита в `main`: публикация в npm и выкладка витрины                                                                                          |

</details>

# Документация из репозитория

Ниже - каждый файл документации проекта целиком, заголовки сдвинуты на два уровня. Пути - от корня репозитория.

- `README.md`
- `src/lib/Accordion/README.md`
- `src/lib/Button/README.md`
- `src/lib/Carousel/README.md`
- `src/lib/dictionaries/README.md`
- `src/lib/Divider/README.md`
- `src/lib/Dragging.README.md`
- `src/lib/Dropdown/README.md`
- `src/lib/FileAttach/README.md`
- `src/lib/Graph/README.md`
- `src/lib/Input/README.md`
- `src/lib/Joystick/README.md`
- `src/lib/Loader/README.md`
- `src/lib/Modal.README.md`
- `src/lib/PeriodChart/README.md`
- `src/lib/ProgressBar/README.md`
- `src/lib/protocols/PROTOCOL.md`
- `src/lib/Select/README.md`
- `src/lib/Slider/README.md`
- `src/lib/Switch/README.md`
- `src/lib/Table/README.md`
- `src/lib/Tabs/README.md`
- `src/lib/TextField/README.md`
- `src/lib/VideoViewer/README.md`
- `src/lib/Widget/README.md`
- `src/lib/WidgetDeviceInfo/README.md`
- `src/lib/WidgetFileSystem/README.md`
- `src/lib/WidgetLoRa/README.md`
- `src/lib/WidgetMap/README.md`
- `src/lib/WidgetPFD/README.md`
- `src/lib/WidgetRGBStrip/README.md`
- `src/lib/WidgetStackInfo/README.md`
- `src/lib/WidgetWiFi/README.md`
- `src/routes/RegExp.md`

## Файл `README.md`

### 🧱 poe-svelte-ui-lib

Библиотека готовых блоков интерфейса для устройств: кнопки, поля, графики, карта и целые виджеты на Svelte 5. Её используют три приложения, и компонент в каждом выглядит и работает одинаково:

- ☁️ **DevCloud** - облако: конструктор интерфейса устройства, панель управления, отладка.
- 📟 **WebApp** - веб-интерфейс, который прошивка ProdFactory-ESP раздаёт с самого устройства.
- 🖥️ **DevTerminal** - настольный терминал для отладки через COM-порт.

Кроме компонентов, в библиотеке лежат ядро протоколов обмена с устройством, общий словарь команд, тема и переводы. Приложения не держат своих копий, всё берут отсюда.

👀 Витрина с живыми примерами: [oleg-perevyshin.github.io/ElementsUI](https://oleg-perevyshin.github.io/ElementsUI/).

#### ✨ Что умеет

- 🧩 Даёт компоненты, каждый из которых показывает и меняет одну переменную устройства.
- 📦 Даёт смарт-виджеты: готовые блоки под одну задачу, например настройку WiFi или карту.
- 🗂️ Раскладывает интерфейс: сворачиваемые блоки, вкладки, разделители, карусель, окна.
- 🖼️ Сам рисует весь интерфейс устройства, собранный в конструкторе DevCloud.
- 📡 Собирает и разбирает пакеты для всех каналов связи с устройством, в том числе под Node.
- 📖 Хранит общий словарь команд для облака, терминала и прошивок.
- 🎨 Даёт одну тему на все приложения, светлую и тёмную, с проверенным контрастом.
- 🌍 Говорит на русском, английском и китайском.
- 🛠️ Даёт панели свойств для конструктора DevCloud.

#### 📚 Что внутри

**📦 Смарт-виджеты.** Готовые блоки под одну задачу. Виджет сам работает с группой полей прошивки по префиксу, привязывать переменные по одной не нужно.

- 📶 `WidgetWiFi` - режим сети, подключение к точке доступа, своя точка доступа, поиск сетей.
- 🪪 `WidgetDeviceInfo` - паспорт устройства, основные настройки, перезагрузка.
- 📡 `WidgetLoRa` - настройки радио LoRa любой микросхемы: где лежит каждый параметр, задаётся в конструкторе.
- 🗂️ `WidgetFileSystem` - занятая память, список файлов, загрузка и удаление.
- 🧠 `WidgetStackInfo` - свободная память и запас стека задач, для отладки.
- 🌈 `WidgetRGBStrip` - адресная светодиодная лента: цвет, эффекты, параметры.
- ✈️ `WidgetPFD` - пилотажный дисплей: авиагоризонт, шкалы скорости и высоты, маршрут, сообщения автопилота.
- 🗺️ `WidgetMap` - карта с объектами и их траекториями.

**🧩 Компоненты.** Каждый привязывается к одной переменной устройства: `Input`, `Select`, `Switch`, `Slider`, `Button`, `Joystick`, `ProgressBar`, `Graph`, `PeriodChart`, `Table`, `FileAttach`, `VideoViewer`, `TextField`, `Widget`.

**🗂️ Раскладка.** `Accordion`, `Tabs`, `Divider`, `Carousel`, `Modal`, `Dropdown`. У `Accordion` есть необязательный слот `actions` - кнопки справа в заголовке, нажатие на них блок не сворачивает. `Dropdown` - выпадающее меню или всплывающая панель у кнопки.

**🔣 Значки и мелочи.** Крутилка `Loader`, значок раскрытия `ExpandIcon` (вниз или вбок), подпись поля `FieldLabel` с пояснением `InfoHint` и значки библиотеки: `IconArrow`, `IconCross`, `IconClear`, `IconDelete`, `IconAdd`, `IconDownload`, `IconCopy`, `IconInfo`, `IconError`, `IconLibrary`, `IconMoveVertical`, `IconGripVerticalDual`, `IconGripVerticalLeft`, `IconGripVerticalRight`. Значки рисуются цветом текста (`currentColor`), своя ширина значка - `1em` или `1.5em` от размера текста, точный размер задаёт родитель, например `[&_svg]:size-5`. Держать их копии в приложении не нужно.

**📡 Ядро протоколов** (`poe-svelte-ui-lib/protocols`). Кодирование и разбор пакетов для всех каналов связи с устройством. Работает без Svelte, в том числе под Node.

**📚 Словари** (`poe-svelte-ui-lib/dictionaries/*`). Мастер-словари команд и сообщений устройств и заголовки для прошивок, см. [src/lib/dictionaries/README.md](src/lib/dictionaries/README.md).

**🎨 Тема** (`poe-svelte-ui-lib/theme.css`) и **🌍 языки** (`poe-svelte-ui-lib/locales`).

**🛠️ Конструктор** (`poe-svelte-ui-lib/constructor`). Панели свойств, их общие части и словарь конструктора. Нужен только приложениям с конструктором, в бандл WebApp прошивки не попадает.

У каждого компонента рядом с исходником есть свой README с пропсами и примерами. Полный список экспортов в `src/lib/index.ts` и `src/lib/constructor.ts`.

#### 🧩 Как подключить

1. Установите пакет:

   ```bash
   npm install poe-svelte-ui-lib
   ```

2. Убедитесь, что в приложении есть `svelte` 5 и `tailwindcss` 4. Компоненты стилизуются утилитами Tailwind и переменными темы.
3. Подключите тему в `app.css` приложения:

   ```css
   @import "tailwindcss";
   @import "poe-svelte-ui-lib/theme.css";
   @source "../node_modules/poe-svelte-ui-lib/dist";
   @custom-variant dark (&:where(.dark, .dark *));
   ```

4. Ниже в `app.css` допишите только то, чем ваше приложение отличается от остальных.

#### 🚀 Как пользоваться

```svelte
<script lang="ts">
  import * as UI from "poe-svelte-ui-lib"

  let value = $state("")
</script>

<UI.Input label={{ name: "Имя" }} bind:value type="text" />
<UI.Button content={{ name: "Сохранить" }} onClick={() => console.log(value)} />
```

- 👀 Главное правило: компонент только показывает данные и сообщает об изменениях.
- 📥 Значения приходят через пропсы, изменения уходят колбэками.
- 🌐 Сетью, WebSocket и хранилищем значений занимается приложение, а не компонент.
- 🎨 Цвет компонента задаёт проп `accent`.

<details>
<summary>🔌 Колбэки, цвет и ключи значений</summary>

- Смысл колбэков у всех компонентов один: `onUpdate` - принятое значение (Enter, уход из поля, отпущенный бегунок, выбор варианта), `onInput` - текущее значение во время ввода или перетаскивания. Значение всегда идёт первым аргументом.
- У `Select` значение - это `option.value`, а не сам вариант. Тип значения - `SelectValue<T, M>`, пропсы - `ISelectProps<T, M>`, где `M` - `multiSelect` (тогда значение - массив значений).
- Компоненты не выводят случайные DOM id. Проп `id` примитива - переменная устройства, в разметку он не попадает (кроме `Button`, где это атрибут `id`).
- Цвет компонента задаёт проп `accent` (роль темы: `gray`, `red`, `orange`, `yellow`, `green`, `cyan`, `blue`, `purple`), у `Button` ещё `variant`.
- В DevCloud и WebApp значения устройства хранятся под ключами вида `<ModSN>|<ключ>`. Смарт-виджет читает свою группу целиком, например все поля `CFG.*` или `MAV.*`.

</details>

<details>
<summary>🛠️ Панели свойств для конструктора</summary>

У каждого компонента есть парный `<Компонент>Props.svelte`. Это панель свойств для конструктора DevCloud, импорт из `poe-svelte-ui-lib/constructor` (в основной точке входа панелей нет). Импорт этой точки входа один раз, до отрисовки, подключает к `$T` словарь конструктора. Пропсы у всех панелей одинаковые:

| Пропс              | Что это                                                                                                                                   |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `component`        | Компонент интерфейса и его свойства                                                                                                       |
| `onPropertyChange` | `(change: PropertyChange) => void`: новые `properties`, `name`, `access`, `eventHandler`; приложение сливает их по ключам верхнего уровня |

Поле «Аргумент» в панелях (`Button`, `Select`, кнопки `Table`, команды `WidgetDeviceInfo`) принимает только имя из мастер-словаря команд `commands.yaml` или служебный `NoSend`, до 31 знака (`ARGUMENT_REGEXP`, `ARGUMENT_MAX_LENGTH` в `options.ts`). Прошивка читает аргумент в `char[32]`, а неизвестное имя молча превращает в `A_UNKNOWN`, поэтому опечатка подсвечивается сразу и не сохраняется.

Своя панель свойств строится на `createPropsEditor(component, onPropertyChange)`: `set`, `patch`, `addItem`, `updateItem`, `removeItem` отправляют новые объекты, сами свойства не меняются на месте.

В `poe-svelte-ui-lib/constructor` также `optionsStore` (в нём и палитра `ACCENT_OPTIONS`; повторное нажатие на выбранный цвет снимает его), `CommonSnippets` и словарь `constructorTranslations`.

</details>

#### 🖥️ GUI устройства

Интерфейс, собранный в конструкторе, рисует компонент `GUIRenderer`. Он сам раскладывает блоки по сетке, берёт значения переменных, отправляет команды и ведёт смарт-виджеты и файлы. Приложению остаётся транспорт, выбор модуля, загрузка GUI и хранилище значений.

```svelte
<UI.GUIRenderer
  components={module.UIBlocks}
  {link}
  persistKey={module.ModSN}
  viewer={!canManage}
  render={{ VideoViewer: video }}
  views={UI.GUI_VIEWS}
  onError={addMessage}
/>
```

**📦 Что попадает в сборку.** `GUIRenderer` сам не импортирует ни одного компонента: каждый тип он берёт из пропса `views`. Облако и терминал передают `UI.GUI_VIEWS` - все типы. Приложению с ограниченной памятью (веб-интерфейс прошивки) достаточно перечислить только нужные: `{ Button: UI.Button, Input: UI.Input, ... }`. Чего нет в `views`, то не попадает в сборку и рисуется заглушкой «Компонент не входит в эту сборку». Какие типы есть в GUI, возвращает `guiTypes(components)`.

**📐 Правила для автора GUI.** Рендерер понимает интерфейс по группам, поэтому при сборке в конструкторе соблюдайте правила:

1. 🧱 Группа - параметры одного объекта (мотор, канал, контур регулятора). Внутри группы блоки стоят вплотную, без пустых клеток.
2. ↔️ Группы рядом разделяет пустая колонка.
3. ↕️ Группы друг под другом разделяет пустая строка или блок во всю ширину (`Divider`, заголовок, график).
4. 🏷️ Заголовок группы - `TextField` в её первой строке на всю ширину группы.
5. 📝 Поля внутри группы - строками формы: «Напряжение | Ток», «Кол-во ПП | Скорость».
6. 📊 Широкий блок (график, таблица, смарт-виджет, список кнопками) - во всю ширину своей группы.
7. 🚧 Блок не перекрывает пустую клетку-границу, иначе он склеит две группы.

<details>
<summary>🔬 Как раскладывается сетка</summary>

- Сетка - 23 колонки, строка `6rem`. В неё ровно встают 2, 3, 4, 6 и 12 одинаковых групп с пустой колонкой между ними (11, 7, 5, 3 и 1 колонка на группу).
- Компоненты вкладываются в `Accordion` и `Tabs` по `parentId`, номер вкладки - после 35-го знака `id`.
- Рендерер берёт значения переменных, разбирает битовые поля, собирает пакеты команд и ведёт смарт-виджеты и файлы.
- На компьютере сетка такая, как в конструкторе; пустая колонка между группами сжимается до узкой полосы, пустая строка - до обычного зазора.
- Если рендерер уже 640px (телефон, узкая панель), блоки раскладываются по группам: одинаковые группы из мелких блоков (каналы) - карточками по 2-3 в ряд, остальные - друг под другом, поля группы - строками с переносом.
- `Accordion` раскладывает своё содержимое так же, колонок у него не меньше, чем у самого дальнего блока.
- `Tabs` раскладывает содержимое выбранной вкладки так же, как `Accordion` (сниппет `Content`): на компьютере - сетка автора внутри вкладки, на телефоне - по группам. Без этого блоки вкладки сжались бы в одну колонку из `size.width`.

</details>

<details>
<summary>⚙️ Пропсы GUIRenderer и DeviceLink</summary>

| Пропс        | Что это                                                                                                                                                         |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components` | `UIComponent[]` из конструктора                                                                                                                                 |
| `link`       | `DeviceLink` выбранного модуля, см. ниже                                                                                                                        |
| `language`   | язык текстов GUI, по умолчанию язык библиотеки                                                                                                                  |
| `viewer`     | наблюдатель: видны только `access` `full` и `viewOnly`, управление отключено; `WidgetWiFi` и `WidgetDeviceInfo` без `onSave` - только для чтения, пароли маской |
| `persistKey` | ключ хранения в браузере (обычно `ModSN`): свёрнутость виджетов, планы `WidgetMap`                                                                              |
| `render`     | своя отрисовка типа: `{ VideoViewer: snippet }`, сниппет получает компонент                                                                                     |
| `views`      | компоненты отрисовки по типу: `GUI_VIEWS` или только нужные; тип без компонента рисуется заглушкой                                                              |
| `onError`    | готовый текст ошибки на языке библиотеки: команда не собрана, ошибка передачи файла, сбой поиска сетей WiFi (ER! или нет ответа)                                |

```ts
interface DeviceLink {
  get(key: string, module?: string): unknown /* значение переменной без префикса модуля; module - другой модуль (keyCol таблицы) */
  set?(key: string, value: unknown): void /* своё значение до ответа устройства */
  dictionary?: Dictionary /* словарь имён в коды, по умолчанию встроенный */
  send(har: number, payload: Record<string, unknown>): unknown /* готовый HAR; конверт {HAR, VAL: {DevSN, ModSN, Payload}} собирает приложение */
  waitFor(
    code: number,
    match: (reply: DeviceReply) => boolean,
    timeoutMs: number,
  ): Promise<DeviceReply | null> /* первый OK!/ER! с этим кодом аргумента; null - таймаут */
}
interface DeviceReply {
  ok: boolean
  payload: Record<string, unknown>
  message?: string
}
```

- `get` читает реактивное хранилище (`SvelteMap`), тогда рендерер обновляется сам.
- Ответы устройства приложение кладёт в хранилище функцией `mergeDevicePayload(values, "<ModSN>|", argument, Payload)`: объект пишется целиком и по полям `имя-поле`, ход закачки `CFG.FS` дописывается к снимку, служебные поля `SET FS` пропускаются. `argument` - имя из разобранного конверта (`decodeWsEnvelope`).
- Отправка `SET Restart` и `SET RstNVS` идёт через `link.send`, приложение узнаёт их по `HAR` (`encodeHar("SET", "Restart")`) и может показать состояние перезагрузки.
- Имя аргумента не из словаря рендерер не отправляет и сообщает через `onError`.

</details>

<details>
<summary>🔢 Команды в провод: HAR</summary>

В `eventHandler` команда записана именами (`SET`, `ModCfg`) - это справка автора GUI. В `link.send` рендерер отдаёт уже число `HAR` (заголовок, код из словаря, флаг ответа), а ответ ждёт по коду аргумента. Конверт WebSocket `{HAR, VAL}` собирает приложение. Подробно - раздел «WebSocket» в [PROTOCOL.md](src/lib/protocols/PROTOCOL.md).

- Свою команду по именам приложение шлёт так же: `sendCommand(link, header, argument, payload)` (аргумент - имя или код), код для ожидания - `argumentCode(link, argument)`.
- Входящий конверт разберите `decodeWsEnvelope(packet)`: получите `{ header, argument, code, reply, VAL }`. По `code` будите `waitFor`, по `argument` зовите `mergeDevicePayload`.
- Словарь - встроенный `DEFAULT_DICTIONARY`. Команду, которой в нём нет, передайте кодом: числом или строкой `"4097"`/`"0x1001"`.

```ts
import { encodeWsEnvelope, decodeWsEnvelope, valueToCbor, cborToValue } from "poe-svelte-ui-lib/protocols"

const link: DeviceLink = {
  send: (har, payload) => socket.send(valueToCbor({ HAR: har, VAL: { DevSN: hub.DevSN, ModSN: module.ModSN, Payload: payload } })),
  /* ... */
}
socket.onmessage = (event) => {
  const message = decodeWsEnvelope(cborToValue(new Uint8Array(event.data)))
  if (message) handle(message) /* message.header === "OK!", message.code === 36, message.argument === "ModCfg" */
}
/* Своя команда облаку или устройству по именам */
socket.send(valueToCbor(encodeWsEnvelope("SET", "JoinDev", { DevSN, Watch: true })))
```

</details>

<details>
<summary>🧮 Чистые функции и реестр</summary>

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
| `guiTypes`                                              | типы компонентов в GUI - из них приложение собирает `views` рендерера                             |

**Реестр.**

- `COMPONENT_META[type]` - `{ io, fields? }`: обмен с устройством (`none`, `read`, `write`, `readWrite`, `widget`) и поля смарт-виджета, без самих компонентов (`componentMeta.ts`). Его берёт `GUIRenderer`.
- `COMPONENTS[type]` - `{ view, io, fields? }`: то же плюс компонент отрисовки, для конструктора. Тянет в сборку все виджеты, поэтому в рендерере не используется.
- `package.json` объявляет побочные эффекты только у CSS и у `constructor` (его импорт подключает словарь конструктора): без этого сборщик приложения не может выбросить неиспользуемые модули библиотеки, а без `constructor` в списке выбрасывает импорт `import "poe-svelte-ui-lib/constructor"` и тексты панелей показываются ключами.
- `componentVariables(component)` - переменные устройства компонента (список переменных конструктора).
- `UIComponent` - объединение по `type`: после `component.type === "Button"` у `properties` тип `IButtonProps`, `UIComponent<"Button">` - компонент одного типа.
- В `poe-svelte-ui-lib/constructor`: `PANELS[type]` - панель свойств, `COMPONENT_DEFAULTS`, `COMPONENT_SIZES`, `minComponentWidth`, `createComponent(type, { col, row }, parentId, { tab, areaWidth })`, `applyPropertyChange(component, change)`.

</details>

<details>
<summary>📁 Обмен файлами</summary>

`createFsTransfer(transport, { argument = "FS", timeoutMs = 5000, retries = 3, maxNameLength = 31 })` - обмен файлами по `SET FS` прошивки. `transport` - тот же `DeviceLink` (`send(har, payload)`, `waitFor(code, ...)`), `argument` - имя или код; имя не из словаря - отказ без отправки. `maxNameLength` - предел имени в байтах UTF-8 (буква кириллицы - 2 байта). Слишком длинное или пустое имя `upload` отвергает ещё до `UploadStart` ошибкой `FsNameError` (поле `maxBytes`). Это единственная проверка имени: `GUIRenderer` передаёт сюда `maxNameLength` из свойств `WidgetFileSystem`, сам виджет имя не проверяет и только переводит сообщение.

<details>
<summary>Ошибки передачи</summary>

Все ошибки передачи - `FsTransferError` с кодом `code` и параметрами `params`. Текст для человека берут из словаря библиотеки: `$T(error.key, error.params)`, ключ `widget.fs.error.<code>`. `message` - то же по-английски, для журнала. `FsNameError` - её частный случай с кодом `name`.

| `code`        | Когда                                                      | `params`          |
| ------------- | ---------------------------------------------------------- | ----------------- |
| `timeout`     | устройство не ответило на шаг                              | `step`            |
| `device`      | устройство ответило `ER!`                                  | `step`, `message` |
| `noChunkSize` | в ответе на `UploadStart` нет `ChunkSize`                  |                   |
| `badStart`    | в ответе на `DownloadStart` нет `FileSize` или `ChunkSize` |                   |
| `badChunk`    | чанк скачивания не того типа или размера                   | `index`           |
| `crc`         | CRC32 скачанного файла не совпала                          |                   |
| `name`        | имя пустое или длиннее `maxNameLength` байт                | `n`               |

`GUIRenderer` и `WidgetFileSystem` переводят коды сами.

</details>

| Метод                                      | Что делает                  |
| ------------------------------------------ | --------------------------- |
| `upload(name, bytes \| Blob, onProgress?)` | закачать файл на устройство |
| `download(name, onProgress?)`              | скачать файл, `Uint8Array`  |
| `list()`                                   | снимок ФС                   |
| `remove(name)`                             | снимок после удаления       |

- Размер чанка задаёт устройство, чанк после `ER!` или таймаута повторяется, целостность - CRC-32 (`crc32` в `poe-svelte-ui-lib/protocols`).
- Операции идут по очереди, общей для всех передач через один транспорт: рендерер и приложение могут работать с файлами одного устройства одновременно, сессии не пересекутся.
- Рендерер сам ведёт файлы `WidgetFileSystem` и `FileAttach`.
- Рендерер и обмен файлами ничего не грузят из интернета. `WidgetMap` без сети через 10 с показывает «нет подключения»; для карты без интернета - `configureMapLibre`.

</details>

#### 📡 Протоколы

Пакет `poe_cbor_pkt` один для CAN, CAN FD, RS485 и UART-консоли. В нём адрес получателя, адрес отправителя, команда и данные в CBOR. Библиотека умеет:

- 📦 собирать и разбирать пакеты, считать CRC;
- 🚌 резать пакет на кадры CAN и CAN FD и собирать обратно, общаться со slcan-адаптером;
- 🖥️ разбирать поток консоли xPOE-Debug, где пакеты идут вперемешку с текстом загрузчика;
- 🐞 показывать отладочные логи `DebugLog` и графики `DebugPlot` из прошивки;
- 🔄 переводить значения между JSON и CBOR;
- 🌐 собирать и разбирать WebSocket-конверт `{HAR, VAL}` (`encodeWsEnvelope`, `decodeWsEnvelope`): команда в нём то же число `HAR`, что на шине;
- 💬 показывать сообщения устройств на языке пользователя: устройство шлёт код `Message` и параметры `Args`, `formatDeviceMessage` даёт текст, уровень и группу сообщения.

Формат пакета, адресация, транспорты и список функций описаны в [PROTOCOL.md](src/lib/protocols/PROTOCOL.md).

<details>
<summary>🧭 Приём потока и поле Value</summary>

- Пакет - только indefinite-массив `0x9F ... 0xFF`, как в прошивке. `decodePacket` считает definite-массивы мусором, а `createPacketStreamParser` (RS485) ищет метку `0x9F 0x85` и пропускает пакеты без записей. Шум вроде `0x80` или `0x81` перед пакетом пропускается: пустых строк нет, настоящий пакет не теряется.
- `createCanParser` считает `sessionTimeoutMs` от последнего фрагмента и выдаёт только целый пакет. Хвост с потерянным началом отбрасывается.
- Колонка VALUE консоли (`formatXPoeDebugValue`) показывает Payload в стиле YAML: `CFG.WiFiMode: 1, List: [1, 2]`, байты `h'0C73'`, строки в кавычках, только если иначе читаются не так (`"123"`). Поле Value (`xPoeDebugValueFromText`) принимает этот же вид и JSON: скопированное из VALUE уходит тем же CBOR. `h'..'` - байтовая строка, `0x0A1B` - готовый CBOR как есть, `12` - число 12. Подсказки у поля Value в приложениях пишутся по этому правилу.

</details>

<details>
<summary>🧪 Проверка</summary>

Байты совпадают с тем, что собирает прошивка. Это проверяет `npm run Test`: тесты сверяют результат с эталонными пакетами, собранными кодом прошивки.

</details>

#### 📚 Словари команд и сообщений

Все команды (`GET`, `SET`, `ModCfg`, `Restart` и остальные) и тексты событий устройств («Файл удалён», «Прошивка обновлена») записаны в двух файлах папки `src/lib/dictionaries/`: `commands.yaml` и `messages.yaml`. Это единственный источник для прошивок, облака, терминала и веб-интерфейса. Новую команду или сообщение сначала добавляют сюда, потом копируют в оба фреймворка прошивок.

- 📖 Коды команд 0-4095 - команды устройств, 7000-7999 - команды самого облака DevCloud (чаты, журнал, состояние устройств).
- 💬 Устройство шлёт только код сообщения и параметры, текст на языке пользователя собирает `formatDeviceMessage(code, args?, lang?)` из `poe-svelte-ui-lib/protocols`. Сообщения разбиты на группы со своими диапазонами кодов: `SYS` 1-99, `CFG` 100-199, `FS` 200-299, `FW` 300-399, `WIFI` 400-499, `DEV` 1000-1999 (500-999 и 2000+ - резерв).
- ⚙️ `npm run Generate` (перед публикацией запускается сам) генерирует код для JS и заголовки прошивок `api_har.h`, `api_msg.h`.

Как добавить команду или сообщение, что генерируется и куда копировать - в [src/lib/dictionaries/README.md](src/lib/dictionaries/README.md). Формат на проводе - в [PROTOCOL.md](src/lib/protocols/PROTOCOL.md).

#### 🎨 Тема

Тема одна для всех приложений. Эталоном служит DevCloud, витрина подключает тот же файл.

- 🪜 Поверхности идут в четыре ступени: фон страницы, панель, блок внутри панели, поле ввода.
- 🧰 Для частых случаев есть готовые классы: `ui-panel` для блока прямо на фоне страницы, `ui-inset` для блока внутри панели.
- 🌗 Контраст в светлой и тёмной теме одинаковый и проходит нормы WCAG 2.1.
- 🌈 Восемь цветов ролей: серый, красный, оранжевый, жёлтый, зелёный, голубой, синий, фиолетовый.
- ✍️ Текст в три ступени: основной, вторичный и подсказки.
- 🔣 Значки двух размеров: `--icon-size` (18px) везде и `--icon-size-sm` (14px) у мелкого текста - стрелки раскрытия, копирование, ⓘ. Свой значок в приложении задают так же: `size-(--icon-size)`.
- 👀 Всю тему разом можно посмотреть на вкладке «Тема» на главной витрины: палитра, все компоненты с демо-данными, типографика и Markdown.

<details>
<summary>🪜 Поверхности и текст</summary>

- Поверхности: фон страницы `--bg-body`, панель `--back-color`, блок внутри панели `--container-color`, поле ввода `--field-color`.
- Текст: основной `--font-color`, вторичный `--muted-color`, подсказки `--faint-color`. Текст не делают полупрозрачным (`opacity`), для вторичного текста берут `--muted-color`. Мельче 11px подписи не делают.
- Панели не делают полупрозрачными, на фоне они теряются. Выпадающие меню делают через `ui-panel` с тенью `--elevation-3`.

</details>

<details>
<summary>🌗 Контраст</summary>

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

</details>

<details>
<summary>🌈 Цвета ролей и акцент</summary>

Цвета ролей - ровная гамма в OKLCH: красный, оранжевый, жёлтый, зелёный, голубой, синий, фиолетовый, плюс серый. Тоны идут по кругу с близким шагом (27, 58, 98, 150, 225, 262, 310), поэтому соседние цвета, например оранжевый и жёлтый или голубой и синий, хорошо различаются. В палитрах (мастер-цвет, теги) порядок такой: серый, красный, оранжевый, жёлтый, зелёный, голубой, синий, фиолетовый.

У каждого цвета четыре варианта:

- `--*-color` - заливка. Текст на ней белый, а на оранжевой, жёлтой и голубой тёмный (`--on-orange`, `--on-yellow`, `--on-cyan`). Компоненты берут его из `--on-accent`, классы `bg-orange` и `bg-yellow` подставляют его сами;
- `--*-text` - цветной текст;
- `--*-soft` - мягкий фон блока или строки;
- `--*-mark` - самый яркий цвет гаммы для полос, точек, тегов и индикаторов. Для текста он не годится, жёлтый и голубой на белом не читаются.

Акцентный цвет `--accent-color` - это синий из гаммы, заливка. Когда акцент нужен как текст, значок, рамка или кольцо фокуса, берут `--accent-text`: в тёмной теме заливка темна для тонкой линии. У компонента с пропом `accent` оба токена переопределяет `accentStyle(accent)`.

Цветной текст, рамки и линии пишут через `--red-text`, `--green-text`, `--orange-text` и так далее (классы `text-(--red-text)`, `border-(--red-text)`), а не через `--red-color`. Заливки `--*-color` как текст и тонкие линии плохо читаются: в тёмной теме они тёмные, а жёлтая и оранжевая слишком светлые на белом. Классы `border-*` в тёмной теме сами берут цвет метки.

Виджеты, которые рисуют цветами из JS (карта, графики), узнают тему через `isDarkTheme(el)` и следят за её сменой через `watchTheme(cb)` из `themeWatch.ts`. Тёмная тема включает `color-scheme: dark`, поэтому выпадающие списки, чекбоксы и прокрутка браузера тоже тёмные.

</details>

<details>
<summary>✍️ Свои стили в приложении</summary>

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

</details>

<details>
<summary>📋 Таблица: разметка в ячейках и цвет шапки</summary>

- Текст ячейки `Table` выводится как текст, теги в данных устройства не работают. Если ячейке нужна разметка (цвет, жирный текст, ссылка на `#id` или `mailto:`), у колонки ставят `html: true`, а данные в ней экранируют сами функцией `escapeHtml`. Внешние ссылки `sanitizeHtml` вырезает. Для обычного текста разметка не нужна: содержимое ячейки задаёт `render(row)`, подсказку - `tooltip` (`true` или функция от строки), окно по нажатию - `modal` (`true` или сниппет), цвет текста - `accent(row)`. Всё это выводится как текст.
- Шапку `Table` можно перекрасить переменной `--table-header-color`. Компонент с `accent` задаёт её сам мягким оттенком своего цвета.

</details>

<details>
<summary>📱 Узкий экран</summary>

На экране уже 768px тема уменьшает базовый кегль с 15 до 14px, а заголовки `h1`-`h4` на ступень. Всё, что задано в `rem` (отступы, значки, поля), уменьшается вместе с кеглем. Размеры в пикселях (`text-[24px]`) тема не трогает: для телефона их задают сами страницы.

</details>

#### 🖼️ Иконки

В библиотеке есть каталог иконок для конструктора: 12 категорий по 16 иконок. Иконки обозначают темы и подсистемы устройства, их ставят в заголовки аккордеонов и похожих блоков, поэтому стрелок, плюсов, крестиков и повторов в каталоге нет.

- 🗂️ Категории: питание и электрика, электроника, связь и сеть, датчики и измерения, климат и среда, свет, производство, транспорт и навигация, авиация и космос, медиа, дом и безопасность, настройки и данные. Порядок идёт от простого оборудования к сложному, настройки и данные в конце.
- ✏️ Все иконки из одного набора, [Tabler Icons](https://tabler.io/icons) (MIT): контурные, сетка 24 px, линия 1,75.
- 🎨 Цвет берут из `currentColor`, поэтому иконка сама следует теме и мастер-цвету.
- 🔍 В конструкторе иконку выбирают в окне с поиском по имени или категории.
- 👀 Весь каталог с именами виден на вкладке «Иконки» на главной витрины, клик по иконке копирует её SVG.

<details>
<summary>🛡️ Безопасный вывод SVG и HTML</summary>

Иконки и HTML из GUI и данных устройства компоненты выводят только через `sanitizeHtml` (`src/lib/html.ts`, экспортируется из библиотеки). Он заново собирает разметку из разрешённых тегов SVG и простого текста: скрипты, обработчики `on*`, внешние ссылки и `url()` на чужие ресурсы выбрасываются. Работает одинаково в браузере и при серверном рендере.

<details>
<summary>🛡️ Что именно пропускает sanitizeHtml</summary>

- Ссылки `href` и `xlink:href`: только на свой фрагмент `#id`, у `<a>` ещё `mailto:`. Адреса `http(s):`, `//...`, `javascript:` и прочие выбрасываются вместе с атрибутом.
- `style`: остаются только свойства для цвета и значков - `color`, `background-color`, `opacity`, `fill*`, `stroke*`, `stop-color`, `stop-opacity`, `width`, `height`, `font-size`, `font-weight`, `font-style`, `text-decoration`, `text-align`, `vertical-align`, `white-space`. `position`, `inset`, `top`, `z-index`, `transform` и всё остальное выбрасывается, поэтому разметка из данных не может накрыть страницу невидимым блоком. `url()` допустим только на `#id`.
- `class`: выбрасываются классы Tailwind, которыми элемент выносится поверх страницы (`fixed`, `absolute`, `sticky`, `inset-*`, `top-*`, `z-*`, `translate-*` и подобные, в том числе с `md:`, `hover:` и `!`). Остальные классы остаются.

</details> Приложение, которое само вставляет такую разметку через `{@html}`, тоже пропускает её через `sanitizeHtml`.

</details>

<details>
<summary>🛠️ Как устроен каталог</summary>

- Каталог лежит в `assets/IconsCatalog`, скрипт сборки - `scripts/UpdateIconsLib.ts`. Оба в npm-пакет не входят: иконки уже вшиты строками в `src/lib/icons.ts`.
- Файл называется `категория.имя.svg`, имя - как в Tabler.
- Скрипт `npm run Generate` собирает из файлов `icons.ts`: `ICONS` (иконки по категориям), `ICON_NAMES` (имена для поиска и подсказок) и `ICONS_ARRAY` (наборы состояний из папок `battery`, `bulb`, `propeller`, их переключает `Widget` по значению).
- Порядок категорий задан в `CATEGORY_ORDER` в `scripts/UpdateIconsLib.ts`, название категории - ключ `constructor.props.icon.<категория>` в словаре.
- Окно выбора в конструкторе - `IconsMatrix`: категории матрицей 4×3 (в клетке 4×4), сверху поиск по имени или категории, при наведении подсказка с именем.
- Иконка сохраняется в GUI как SVG, поэтому перестановка каталога не ломает сохранённые интерфейсы.

</details>

#### 🌍 Языки

Сейчас библиотека говорит на русском, английском и китайском (RU, EN, ZH). Список языков задан в одном месте, и переключатели языка во всех приложениях подхватывают его сами.

- ➕ Чтобы добавить язык, достаточно одной записи в `LANGUAGES` (`src/lib/locales/languages.ts`).
- 🇷🇺 Пока перевода нет, показывается русский текст.
- 🔁 Один вызов `setLanguage` переключает язык и в библиотеке, и в приложении. Выбор сохраняется в браузере.

<details>
<summary>⚙️ Подключение в приложении</summary>

Приложения не держат свой список языков. Они берут его из библиотеки, а свой словарь подключают так:

```ts
export const T = createTranslator(translations)
```

- Свой словарь к `$T` библиотеки добавляет `extendTranslations(dictionary)`. Тип `TranslationKey` подсказывает ключи в `$T`, любая строка тоже допустима.
- В SSR-приложениях сохранённый язык восстанавливают вызовом `restoreLanguage()` в `onMount` корневого layout.
- Серверный код, который запускается под Node без Vite, импортирует языки из `poe-svelte-ui-lib/locales`. Корень пакета тянет Svelte-компоненты, и Node его не загрузит.

</details>

<details>
<summary>📝 Два вида текстов</summary>

- **Встроенные тексты компонентов**: подписи, кнопки, подсказки. Они только в словаре `src/lib/locales/translations.ts` и выводятся через `$T("ключ")`. Русских строк прямо в разметке быть не должно.
- **Тексты из конструктора**: название поля, варианты списка, заголовки колонок. Это строка или объект `{ ru, en, zh }`. Приложение переводит всё описание интерфейса функцией `localizeDeep` перед показом. В конструкторе их правят в окне «Тексты и переводы», которое есть у каждого компонента.
- `localizeDeep` переводит только поля текстов (`name`, `label`, `labels`, `placeholder`, `text`, `info`, `title`, `captionLeft`, `captionRight`, `units`, `unit`, `footer`, `hiddenInfo`, `alt`) - те же, что показывает окно «Тексты и переводы». Объект считается переводом, если все его ключи похожи на коды языков и хотя бы один есть в `LANGUAGES`. Остальные объекты (данные колонки `{ key: "device" }`, картинка `{ src, alt }`) остаются как есть.

</details>

#### ✍️ Как описывать компонент

У компонента два описания:

- ℹ️ **Короткое**, по кнопке (i). Лежит в словаре под ключом `component.info.<Тип>`. Его показывают витрина и конструктор DevCloud.
- 📘 **Подробное**, `src/lib/<Компонент>/README.md`. Оно открывается на вкладке «Инфо» витрины. Начало повторяет короткое описание и не должно ему противоречить. Дальше идут пропсы, примеры, панель свойств и внутреннее устройство.

<details>
<summary>📋 Разделы короткого описания</summary>

Разделы идут в таком порядке, ненужные пропускаются:

| Раздел       | Что писать                                                                      |
| ------------ | ------------------------------------------------------------------------------- |
| Назначение   | Одна-две фразы: что это и когда применять                                       |
| Пакет данных | Откуда данные, каким пакетом и как часто их слать, что компонент отправляет сам |
| Ключи        | По пункту на ключ: тип, единицы, смысл                                          |
| Особенности  | Поведение, ограничения, советы                                                  |
| Настройки    | Что меняется в панели свойств                                                   |

</details>

#### 🛠️ Разработка

- 🧪 Витрина устроена как конструктор DevCloud: слева компонент и его код, справа панель свойств той же ширины, что в облаке. Если подпись не влезает, это видно сразу.
- 🔗 Внутри библиотеки импорты относительные. Витрина импортирует библиотеку через `#lib` (поле `imports` в `package.json`).

<details>
<summary>⌨️ Команды</summary>

```bash
npm run dev            # витрина на локальном сервере
npm run prepack        # всё перед публикацией: словари, типы, сборка, тесты, publint
npm run Test           # тесты: протоколы, словари, битовые поля, очистка HTML, облёт поля
npm run Formatting     # prettier
npm run build          # сборка витрины в docs/
npm pack               # сборка пакета в dist/: проверка типов, тесты, publint
```

</details>

#### 🚢 Выпуск

Выпуск запускается сообщением коммита в `main`:

- 📦 `[publish]` публикует пакет в npm;
- 🌐 `[deploy]` обновляет витрину на GitHub Pages.

Перед выпуском поднимите версию в `package.json`. Версия на витрине берётся оттуда же. После публикации облако обновляется само, вручную версию библиотеки в облаке не поднимают.

<details>
<summary>🔐 Публикация и обновление облака</summary>

- Публикация идёт через trusted publisher npm, постоянный токен не нужен. Связь настроена на npmjs.com в настройках пакета: GitHub Actions, репозиторий `Oleg-Perevyshin/ElementsUI`, workflow `npm_publish.yaml`.
- После публикации workflow ставит новую версию в DevCloud, проверяет типы и, если всё прошло, поднимает вторую цифру версии облака и пушит туда коммит вида `X.Y [deploy] Обновление ElementsUI до X.Y.Z`.
- Если проверка упала, облако остаётся на старой версии, причину ищите в логе job `update-devcloud`.

</details>

#### 💡 Полезно знать

- 📱 На телефоне тема чуть уменьшает шрифт, всё в `rem` уменьшается вместе с ним.
- 🧱 Стили тегов в приложении пишите только внутри `@layer base`, иначе подписи компонентов станут крупнее.
- 🛡️ Разметку из данных устройства выводите только через `sanitizeHtml`.
- 🌐 Карта `WidgetMap` без интернета работает только со своим модулем MapLibre (`configureMapLibre`).
- ℹ️ Значок ⓘ с пояснением (`help.info`) после заголовка есть у `Select`, `Switch`, `Slider`, `Graph`, `Joystick`, `PeriodChart`, `ProgressBar`, `Table` и `VideoViewer`. Без заголовка значок стоит на его месте. Значок - общий `InfoHint`, у всех, кроме `Switch`, вместе с подписью через `FieldLabel`. У `Input` значок ⓘ внутри поля слева и от заголовка не зависит. Пояснение задаётся в «Тексты и переводы», `GUIRenderer` передаёт его вместе с остальными свойствами.
- 🟢 Под Node без Vite языки берите из `poe-svelte-ui-lib/locales`, а протоколы из `poe-svelte-ui-lib/protocols`.

---

Лицензия MIT, см. `LICENSE`.

## Файл `src/lib/Accordion/README.md`

### 🪗 Accordion

Сворачиваемый блок. В нём группируют компоненты, которые нужны не всегда: настройки, диагностику, редкие разделы.

#### ✨ Что умеет

- 📂 Открывается и закрывается нажатием на заголовок.
- 🧱 Внутри своя сетка, в неё можно положить любые компоненты.
- 🏷️ Заголовок с иконкой и стрелкой раскрытия. Стрелку можно убрать.
- 🔘 Справа в заголовке можно разместить свои кнопки. Нажатие на них не сворачивает блок.
- 🎨 Заголовок окрашивается в выбранный цвет, как у смарт-виджетов.
- 🖼️ Под содержимое можно подложить картинку.
- 🟪 Может быть с цветной полосой слева, без рамки или на всю высоту места.

#### 🧩 Как настроить в конструкторе

1. Перетащите аккордеон на макет и подпишите его.
2. Выберите иконку и цвет заголовка.
3. Перетащите внутрь нужные компоненты. Размер сетки задаётся при создании и меняется растягиванием.
4. Если нужно, загрузите картинку фона.

#### 💡 Полезно знать

- 📏 Закрытый аккордеон занимает одну строку сетки, открытый растягивается по содержимому.
- 💤 Содержимое появляется, только когда блок открыт.
- 🔌 Аккордеон с устройством не связан. Он ничего не читает и не отправляет.

<details>
<summary>📦 Данные устройства</summary>

С устройством не связан, ничего не читает и не отправляет.

</details>

<details>
<summary>🔬 Как устроено</summary>

- Заголовок состоит из кнопки сворачивания на всю ширину и необязательного сниппета `actions` справа. `actions` лежит вне кнопки, поэтому нажатия на него не сворачивают блок.
- Содержимое рисуется только при `isOpen`, открытие и закрытие анимируются за 200 мс.
- Содержимое раскладывается в сетку `size.width` колонок на `size.height` строк.
- С картинкой фона (`image`) строки сетки не ниже `6.5rem`, картинка растянута на всю область (`cover`, по центру).
- Без `chevron` блок всё так же сворачивается нажатием на заголовок.

</details>

<details>
<summary>🎨 Оформление подробно</summary>

- Цвет `accent` работает как у смарт-виджетов: иконка, текст и стрелка заголовка окрашены цветом текста роли (70% `--accent-text` с цветом шрифта), фон заголовка 22% цвета поверх фона, при наведении 30%.
- Без `accent` используется акцент родителя или темы. Цвет из `label.class` перекрывает цвет текста.
- Раскрытое содержимое на чистом фоне `--back-color`, радиус блока 14.
- `stripe` - полоса 6px слева цветом метки `--<accent>-mark` (без `accent` - цвет акцента), рамка с радиусом 15. Так выглядят разделы дашборда и администрирования DevCloud.
- `outline={false}` - без рамки и скругления, когда блок уже лежит в своей карточке. При `stripe` не действует.
- `componentClass` - классы рамки блока, например тень `shadow-(--elevation-1)`.
- `fill` - раскрытый блок занимает всю высоту родителя (родитель - flex-колонка): обёртка, рамка и содержимое растягиваются, сетка содержимого - одна строка на всю высоту. Свёрнутый блок не растягивается.

</details>

<details>
<summary>💻 Полоса и высота</summary>

```svelte
<div class="flex h-full flex-col gap-3">
  <UI.Accordion label={{ name: "Пользователи" }} accent="blue" stripe componentClass="shadow-(--elevation-1)" wrapperClass="shrink-0" bind:isOpen>
    ...
  </UI.Accordion>
  <UI.Accordion label={{ name: "Журнал" }} accent="purple" stripe fill isOpen>
    <div class="h-full overflow-y-auto">...</div>
  </UI.Accordion>
</div>
```

</details>

<details>
<summary>⚙️ Пропсы</summary>

| Название         | Тип                           | По умолчанию  | Описание                                                                        |
| ---------------- | ----------------------------- | ------------- | ------------------------------------------------------------------------------- |
| `id`             | `string`                      |               | Идентификатор в конструкторе. Компонент его не использует                       |
| `isOpen`         | `boolean`                     | `false`       | Открыт ли. Можно связать через `bind:isOpen`                                    |
| `wrapperClass`   | `string`                      | `""`          | Классы обёртки                                                                  |
| `componentClass` | `string`                      | `""`          | Классы рамки блока: тень, свой радиус                                           |
| `accent`         | `AccentColor`                 |               | Цвет заголовка: `red`, `green`, `blue` и другие. Без него - акцент темы         |
| `stripe`         | `boolean`                     | `false`       | Цветная полоса 6px слева цветом метки `accent`                                  |
| `outline`        | `boolean`                     | `true`        | Рамка и скругление. `false` - без них                                           |
| `fill`           | `boolean`                     | `false`       | Раскрытый блок на всю высоту родителя-колонки                                   |
| `size`           | `{ width, height }`           | `1 × 1`       | Сетка содержимого: колонки и строки                                             |
| `label.name`     | `string`                      | `""`          | Заголовок                                                                       |
| `label.class`    | `string`                      | `"text-left"` | Классы текста заголовка                                                         |
| `label.icon`     | `Component \| string \| null` | `null`        | Иконка заголовка: Svelte-компонент или SVG-строка                               |
| `chevron`        | `boolean`                     | `true`        | Стрелка раскрытия в заголовке. Без неё блок сворачивается нажатием на заголовок |
| `image`          | `string`                      | `""`          | Картинка фона содержимого                                                       |
| `children`       | `Snippet`                     |               | Содержимое                                                                      |
| `actions`        | `Snippet`                     |               | Кнопки справа в заголовке. Нажатие на них не сворачивает блок                   |

Колбэков нет. Открытие и закрытие компонент обрабатывает сам.

</details>

<details>
<summary>💻 Примеры кода</summary>

```svelte
<script>
  import * as UI from "poe-svelte-ui-lib"
  let open = $state(false)
</script>

<UI.Accordion label={{ name: "Сеть" }} accent="blue" bind:isOpen={open}>
  <UI.Input label={{ name: "SSID" }} />
</UI.Accordion>

<UI.Accordion label={{ name: "Журнал" }} chevron={false}>
  {#snippet actions()}
    <UI.Button content={{ icon: IconRefresh }} onClick={reload} />
  {/snippet}
  <UI.TextField content={{ name: "Записей нет" }} />
</UI.Accordion>
```

</details>

<details>
<summary>🛠️ Панель свойств (AccordionProps.svelte)</summary>

Панель для конструктора DevCloud. В ней задают доступ (без варианта «только просмотр»), заголовок, его выравнивание, иконку из библиотеки иконок, цвет и картинку фона. Картинка загружается файлом PNG, JPEG или WebP и хранится как base64, рядом есть кнопка удаления.

| Пропс              | Тип                                | Описание                                              |
| ------------------ | ---------------------------------- | ----------------------------------------------------- |
| `component`        | `UIComponent<"Accordion">`         | Компонент и его свойства                              |
| `onPropertyChange` | `(change: PropertyChange) => void` | Сообщает об изменении: свойства, имя, доступ, событие |

</details>

## Файл `src/lib/Button/README.md`

### 🔘 Button

Кнопка, которая отправляет команду на устройство. Нажали - устройство перезагрузилось, сохранило настройки или включило нужный режим.

#### ✨ Что умеет

- 📤 По нажатию отправляет на устройство команду, например «перезагрузиться» или «сохранить».
- 🧺 Может собрать значения из других полей интерфейса и отправить их одним пакетом - так делается кнопка «Сохранить» для формы настроек.
- 🎨 Бывает залитой, контурной или просто текстом. Цвет выбирается, например красный для опасных действий.
- 🖼️ Может быть с текстом, с иконкой или только с иконкой - тогда она круглая.
- ⌨️ Нажимается и горячей клавишей, например Ctrl+R.
- 💬 Показывает подсказку при наведении.
- 📌 Бывает кнопкой-переключателем: нажатая выглядит как выбранная кнопка группы.
- ⏳ Показывает крутилку, пока идёт действие, и в это время не нажимается.

#### 🧩 Как настроить в конструкторе

1. Перетащите кнопку на макет и подпишите её.
2. Выберите иконку и цвет, если нужно.
3. Укажите, какую команду отправлять: например `SET` и `Restart`.
4. Если кнопка должна отправить значения других полей, перечислите их переменные. Если всегда одно и то же значение - задайте его.

#### 💡 Полезно знать

- Вид и цвет кнопки задают её роль: залитая - главное действие, красная - опасное, контурная и текстовая - второстепенное.
- Горячая клавиша работает во всём окне. Если у двух кнопок одна клавиша, сработают обе.
- Подпись стоит точно по центру кнопки по высоте заглавных букв и цифр, поэтому «115200 8N1» и «Подключиться» выглядят одинаково ровно. Хвосты букв не обрезаются.
- Кнопка только отправляет. Ответ устройства она не показывает.

<details>
<summary>📦 Что уходит на устройство</summary>

- По нажатию уходит **Заголовок** и **Аргумент**, например `SET` и `Restart`. В конструкторе аргумент - только имя из словаря команд или `NoSend`, до 31 знака: опечатка подсвечивается и не сохраняется.
- **Переменные.** Текущие значения других компонентов кладутся в тот же пакет. Так делается кнопка «Сохранить» для полей с аргументом `NoSend`.
- **Фиксированное значение** (JSON) отправляется как есть вместо переменных, например `{"Mode": 2}`.
- Значение с устройства кнопка не показывает.

| Ключ           | Описание                                                                               |
| -------------- | -------------------------------------------------------------------------------------- |
| `<переменные>` | Имена через пробел, например `CFG.StaSSID CFG.StaPSK`. В имени переменной пробелов нет |

</details>

<details>
<summary>🎨 Оформление подробно</summary>

- Вид задаёт `variant`: `primary` - заливка цветом `accent` с белым текстом, `secondary` - кнопка с контуром на фоне, `plain` (по умолчанию) - текст цветом `accent`.
- Цвет задаёт `accent`. Без него берётся акцент родителя или темы. Для опасного действия - `variant="primary" accent="red"`.
- Подпись для экранного диктора берётся из `content.name` или `content.info.text`.
- Кнопка с иконкой и без текста круглая, размером с поле ввода: 32px (`size-8`). Если `wrapperClass` задаёт ширину (`w-10`, `size-12`), кругом заполняется обёртка; `componentClass` (например `size-7`) важнее обоих. `w-auto`, `w-fit`, `w-max`, `w-min`, `w-full` ширину не задают.
- Значок всегда размера `--icon-size` из темы (18px) и не зависит от размера кнопки: отступами его не подгоняют. В кнопке меньше значка он сжимается до её размера.
- Горячая клавиша (`keyBind`) слушается на всём окне.
- Подсказка `content.info` показывает только текст, без разметки. Она всплывает при наведении мышью и при фокусе с клавиатуры (`:focus-visible`), на телефоне от касания не всплывает. Когда фокус возвращается на кнопку сам, после закрытия окна или меню, подсказка не появляется и не висит поверх соседних элементов.
- `pressed` - кнопка-переключатель: `true` - залита цветом `accent`, как выбранный вариант `Select type="buttons"` (у `primary` ещё внутренняя рамка), у кнопки `aria-pressed`. Без пропа кнопка обычная.
- `loading` - крутилка `Loader` на месте значка (у кнопки без значка - перед подписью). Кнопка не нажимается и не реагирует на горячую клавишу, но не серая, у неё `aria-busy`.
- `aria` - для кнопки, открывающей панель: `haspopup`, `expanded`, `controls` ставятся на саму кнопку. Так делает `Dropdown`.

</details>

<details>
<summary>⚙️ Пропсы</summary>

| Название           | Тип                                   | По умолчанию         | Описание                                                                          |
| ------------------ | ------------------------------------- | -------------------- | --------------------------------------------------------------------------------- |
| `id`               | `string`                              |                      | Атрибут `id` кнопки                                                               |
| `wrapperClass`     | `string`                              | `""`                 | Классы обёртки                                                                    |
| `componentClass`   | `string`                              | `""`                 | Классы самой кнопки                                                               |
| `variant`          | `"primary" \| "secondary" \| "plain"` | `"plain"`            | Вид: заливка, контур или текст                                                    |
| `accent`           | `AccentColor`                         |                      | Цвет: `red`, `green`, `blue` и другие. Без него - акцент темы                     |
| `disabled`         | `boolean`                             | `false`              | Кнопка неактивна                                                                  |
| `pressed`          | `boolean`                             |                      | Кнопка-переключатель: нажата или нет (`aria-pressed`). Без пропа - обычная кнопка |
| `loading`          | `boolean`                             | `false`              | Идёт действие: крутилка вместо значка, кнопка не нажимается                       |
| `aria`             | `{ haspopup, expanded, controls }`    |                      | Атрибуты кнопки, открывающей панель                                               |
| `content.name`     | `string`                              |                      | Текст                                                                             |
| `content.icon`     | `Component \| string \| null`         | `null`               | Иконка: Svelte-компонент или SVG-строка                                           |
| `content.info`     | `{ text, side }`                      |                      | Подсказка при наведении. `side`: `top`, `bottom`, `left`, `right`                 |
| `keyBind`          | `object`                              | `{ showHint: true }` | Горячая клавиша: `key`, `ctrlKey`, `shiftKey`, `altKey`, `metaKey`                |
| `keyBind.showHint` | `boolean`                             | `true`               | Показывать клавишу на кнопке                                                      |
| `onClick`          | `() => void`                          |                      | Нажатие кнопкой мыши или горячей клавишей                                         |

</details>

<details>
<summary>💻 Примеры кода</summary>

```svelte
<script>
  import * as UI from "poe-svelte-ui-lib"
</script>

<UI.Button content={{ name: "Сохранить" }} variant="primary" onClick={() => console.log("сохранено")} />

<UI.Button content={{ name: "Удалить" }} variant="primary" accent="red" disabled />

<UI.Button content={{ name: "Обновить", info: { text: "Ctrl+R", side: "bottom" } }} keyBind={{ key: "r", ctrlKey: true }} onClick={refresh} />

<UI.Button content={{ icon: IconSettings }} onClick={openSettings} />

<UI.Button variant="secondary" pressed={pinned} content={{ name: "Закрепить" }} onClick={() => (pinned = !pinned)} />

<UI.Button variant="primary" loading={saving} content={{ name: "Сохранить", icon: UI.IconAdd }} onClick={save} />
```

</details>

<details>
<summary>🛠️ Панель свойств (ButtonProps.svelte)</summary>

Панель для конструктора DevCloud. В ней задают доступ, заголовок и аргумент команды, фиксированное значение или переменные, цвет, текст и подсказку, иконку из библиотеки иконок и высоту. Выбор цвета даёт `variant="primary"` этого цвета, «-» даёт `secondary`, повторное нажатие на выбранный цвет даёт `plain`.

| Пропс              | Тип                                | Описание                                              |
| ------------------ | ---------------------------------- | ----------------------------------------------------- |
| `component`        | `UIComponent<"Button">`            | Компонент и его свойства                              |
| `onPropertyChange` | `(change: PropertyChange) => void` | Сообщает об изменении: свойства, имя, доступ, событие |

</details>

## Файл `src/lib/Carousel/README.md`

### 🎠 Carousel

Горизонтальная лента карточек со стрелками. В интерфейсе устройства в облаке и WebApp по ней листают модули устройства.

#### ✨ Что умеет

- ⬅️➡️ Листает карточки стрелками слева и справа.
- 🙈 Прячет стрелку, когда лента дошла до начала или до конца. Если всё помещается, стрелок нет.
- 🏷️ Может показать заголовок над лентой.

#### 💡 Полезно знать

- 📏 Карточкам нужна своя ширина, иначе лента не поймёт, что прокручивать.
- ↔️ Лента прокручивается только по горизонтали и только стрелками.
- 🔌 С устройством не связана, содержимое передаётся снаружи.
- 🧩 В конструкторе её нет, это компонент для кода.

<details>
<summary>📦 Данные устройства</summary>

С устройством не связана. Содержимое передаётся снаружи.

</details>

<details>
<summary>🔬 Как устроено</summary>

- Одно нажатие на стрелку плавно сдвигает ленту на `scrollValue` пикселей.
- Видимость стрелок пересчитывается при прокрутке и при изменении размера ленты.
- Контейнер ленты с `overflow-hidden`, поэтому колесом мыши и свайпом она не листается, только стрелками.
- `id` ставится на сам контейнер ленты, а не на обёртку.

</details>

<details>
<summary>🎨 Оформление подробно</summary>

- Лента на сплошном фоне `--container-color` со скруглением, карточки с отступом 8 px.
- Стрелки 32 px, круглые, на фоне `--back-color` с линией и тенью уровня 2.
- Заголовок `h5` с классами `label.class`.

</details>

<details>
<summary>⚙️ Пропсы</summary>

| Название       | Тип       | По умолчанию          | Описание                         |
| -------------- | --------- | --------------------- | -------------------------------- |
| `id`           | `string`  | `crypto.randomUUID()` | Идентификатор                    |
| `wrapperClass` | `string`  | `""`                  | Классы обёртки                   |
| `label.name`   | `string`  | `""`                  | Заголовок                        |
| `label.class`  | `string`  | `"text-left"`         | Классы заголовка                 |
| `scrollValue`  | `number`  | `200`                 | Шаг прокрутки стрелкой, пикселей |
| `children`     | `Snippet` |                       | Карточки                         |

Колбэков нет.

</details>

<details>
<summary>💻 Примеры кода</summary>

```svelte
<script>
  import * as UI from "poe-svelte-ui-lib"
</script>

<UI.Carousel label={{ name: "Модули" }} scrollValue={300}>
  {#each modules as m}
    <div class="w-72 shrink-0">{m.name}</div>
  {/each}
</UI.Carousel>
```

</details>

<details>
<summary>🛠️ Панель свойств</summary>

Панели свойств для конструктора у карусели нет.

</details>

## Файл `src/lib/dictionaries/README.md`

### 📚 Словари протокола

Единые словари команд и сообщений устройств и список компонентов GUI для всего стека: прошивок ESP и STM, облака DevCloud, терминала DevTerminal и веб-интерфейса прошивок.

#### ✨ Что умеет

- 📖 `commands.yaml` - словарь команд: имя аргумента, имя в перечислении C и код поля HAR.
- 💬 `messages.yaml` - словарь сообщений устройств: группы с диапазонами кодов и сообщения (код, группа, имя, уровень, короткий понятный текст на RU, EN, ZH).
- 🧩 `components.yaml` - список компонентов GUI: тип (значение `type` в GUI и имя экспорта компонента) и обмен с устройством.
- ⚙️ Из словарей генерируется код для JS (`generated/`) и заголовки для прошивок (`firmware/api_har.h`, `firmware/api_msg.h`).
- 📦 Файлы поставляются в пакете: `poe-svelte-ui-lib/dictionaries/commands.yaml`, `poe-svelte-ui-lib/dictionaries/messages.yaml`, `poe-svelte-ui-lib/dictionaries/components.yaml`, `poe-svelte-ui-lib/dictionaries/firmware/api_har.h`, `poe-svelte-ui-lib/dictionaries/firmware/api_msg.h`.

#### 🧩 Как пользоваться

Новая команда:

1. Добавить строку в `commands.yaml`: `- [Имя, A_ИМЯ, код]   # описание`, в свой раздел и диапазон.
2. `npm run Generate`.
3. Скопировать `commands.yaml` в `.framework/Dictionary.yaml` и `firmware/api_har.h` в `components/core/api_service/api_har.h` обоих фреймворков (ProdFactory-ESP и ProdFactory-STM).

Новое сообщение:

1. Добавить строку в раздел `messages` файла `messages.yaml`: `- { code, group, name, level, ru, en, zh }` - в свою группу, код из её диапазона, имя с приставкой группы (`FS_...`). Текст короткий и понятный пользователю: причина без технических подробностей, параметр `{0}` - только если без него теряется смысл. Нужна новая группа ядра - добавить её в раздел `groups` с диапазоном из резерва 500-999.
2. `npm run Generate`.
3. Скопировать `messages.yaml` в `.framework/Messages.yaml` и `firmware/api_msg.h` в `components/core/api_service/api_msg.h` обоих фреймворков.

Новый компонент GUI:

1. Добавить строку в `components.yaml`: `- [Тип, обмен]   # описание`, обмен - `none`, `read`, `write`, `readWrite` или `widget`.
2. `npm run Generate`. Тип должен быть и в `UIComponentPropsMap` (`types.ts`), и в `GUI_VIEWS` (`guiViews.ts`), иначе библиотека не скомпилируется.
3. Скопировать `components.yaml` в `.framework/Components.yaml` фреймворков: сборка веб-интерфейса прошивки сверяет с ним GUI устройства.

В JS словари доступны через `poe-svelte-ui-lib/protocols`: `DEFAULT_ARGUMENT_CODES`, `DEFAULT_DICTIONARY`, `DEVICE_MESSAGES`, `MESSAGE_GROUPS`, `MESSAGE_CODES`, `formatDeviceMessage`.

| Группа | Коды      | Что                                            |
| ------ | --------- | ---------------------------------------------- |
| `SYS`  | 1-99      | Система: перезагрузка, неверный запрос, память |
| `CFG`  | 100-199   | Настройки                                      |
| `FS`   | 200-299   | Файлы                                          |
| `FW`   | 300-399   | Обновление прошивки                            |
| `WIFI` | 400-499   | Wi-Fi                                          |
| -      | 500-999   | Резерв для новых групп ядра                    |
| `DEV`  | 1000-1999 | Изделия каталога (`catalog/<CatalogID>`)       |
| -      | 2000+     | Резерв                                         |

#### 💡 Полезно знать

- Сгенерированные файлы (`generated/`, `firmware/`) руками не правят: их перезаписывает `npm run Generate`, перед публикацией он запускается сам.
- Заголовки прошивок сразу в стиле `.clang-format` прошивок: команда «Format» их не меняет.
- После правки словарей - `npm run Test`.

<details>
<summary>📖 Словарь команд</summary>

- Строка: `- [Строковое имя, Имя в enum, Код]`, комментарий после `#` переходит в заголовок.
- Диапазоны: 0-4095 - устройства (команды прошивок), 4096-6999 - резерв, 7000-7999 - облако DevCloud (команды самого облака, не устройств), 8000-8191 - резерв. Код не больше `0x1FFF` (13 бит аргумента).
- Генератор падает на повторе имени или кода и на коде вне диапазона.
- `generated/commands.ts` - `DEFAULT_ARGUMENT_CODES` (имя -> код), из него `DEFAULT_DICTIONARY` ядра протоколов.
- `firmware/api_har.h` - `har_t`, макросы `HAR`/`HAR_NR`, `api_header_t` и `enum api_argument_t` (`A_* = код`) с комментариями разделов и строк. При сборке прошивки `.framework/Dictionary.yaml` сверяется с заголовком.

</details>

<details>
<summary>🧩 Список компонентов</summary>

- Строка: `- [Тип, обмен]`, комментарий после `#` - описание. Тип в PascalCase - это и значение `type` в GUI, и имя экспорта компонента.
- Генератор падает на повторе типа и на обмене не из списка.
- `generated/components.ts` - `COMPONENT_TYPES` (кортеж типов) и `COMPONENT_IO` (тип -> обмен). Из них `componentMeta.ts` строит `COMPONENT_META`; присваивания там не скомпилируются, если список и `UIType` разошлись в любую сторону.
- Во фреймворках `.framework/Components.yaml` - копия: сборка веба прошивки останавливается, если в GUI устройства тип не из списка.

</details>

<details>
<summary>💬 Словарь сообщений</summary>

- Два раздела. `groups:` - строки `ИМЯ: { range: [от, до], ru: "...", en: "...", zh: "..." }`: имя группы (`UPPER` без `_`) - приставка имён её сообщений, `range` - диапазон кодов, `ru`/`en`/`zh` - название группы. `messages:` - строки `- { code: код, group: ГРУППА, name: ГРУППА_ИМЯ, level: info|warn|error, ru: "...", en: "...", zh: "..." }`, комментарий после `#` (что значат параметры) переходит в заголовок.
- Код 1-65535, 0 - сообщения нет. Резерв: 500-999 - для новых групп ядра, 2000-65535 - на будущее.
- `name` в стиле `UPPER_SNAKE`, в прошивке это `MSG_<name>`.
- Генератор падает, если: диапазоны групп пересекаются или выходят за 1-65535; у группы нет названия на одном из языков; у сообщения нет группы, код вне её диапазона или имя без приставки `ГРУППА_`; повтор имени или кода; неизвестный `level`; пустой текст; параметры `{0}`, `{1}` в языках разные.
- `generated/messages.ts` - `MESSAGE_GROUPS` (группа -> `{ from, to, ru, en, zh }`), `DEVICE_MESSAGES` (код -> `{ group, name, level, ru, en, zh }`) и `MESSAGE_CODES` (имя -> код). Порядок - по группам, внутри группы по коду.
- `firmware/api_msg.h` - `typedef enum { MSG_NONE = 0, MSG_SYS_RESTARTING = 1, ... } api_msg_t`: раздел-комментарий на каждую группу (`/* FS 200-299: Файлы */`), у элемента в комментарии уровень и английский текст, в шапке файла - список групп и резерв.
- Как сообщение идёт по проводу (VAL ответа и push, Payload `ER!` модуля, текст `MSG <код>` в консоли) - в [PROTOCOL.md](../protocols/PROTOCOL.md), раздел «Сообщения устройств».

</details>

<details>
<summary>⚙️ Стиль заголовков прошивок</summary>

- Генератор `scripts/GenerateDictionary.mjs` выравнивает перечисления так же, как `clang-format` со стилем прошивок (`ColumnLimit: 150`, выравнивание `=` и комментариев в конце строк через пустые строки и комментарии).
- `=` выравнивается по самому длинному имени, пока строки помещаются в 150 столбцов; строка длиннее начинает новую последовательность.
- Комментарии в конце строк выравниваются внутри раздела.
- Проверка: `clang-format --dry-run -Werror --style=file:<ProdFactory-ESP>/.clang-format api_har.h api_msg.h` (бинарник из `esp-clang` ESP-IDF) - без замечаний.

</details>

## Файл `src/lib/Divider/README.md`

### ➖ Divider

Разделитель между группами компонентов: тонкая линия или просто пустой отступ.

#### ✨ Что умеет

- 📏 Рисует линию во всю ширину. Толщину можно менять.
- ⬜ Может быть пустым отступом без линии.
- ⬆️⬇️ Ставит линию сверху, посередине или снизу своей ячейки.
- 🎨 Линию можно окрасить в цвет из палитры. Без цвета она нейтральная.
- ↕️ Бывает вертикальной: линия сверху вниз между колонками.

#### 🧩 Как настроить в конструкторе

1. Перетащите разделитель на макет между группами.
2. Выберите тип: линия или отступ.
3. Нужный зазор получите, меняя высоту разделителя на сетке.
4. Выберите положение линии, толщину и цвет.

#### 💡 Полезно знать

- 🔌 С устройством не связан.
- 📐 Разделитель занимает всю высоту своей ячейки, поэтому высота ячейки и есть отступ.

<details>
<summary>📦 Данные устройства</summary>

С устройством не связан.

</details>

<details>
<summary>🎨 Оформление подробно</summary>

- Линия всегда во всю ширину. Толщину задаёт `width` в пикселях.
- Компонент занимает всю высоту, отведённую ему в сетке. `anchor` ставит линию сверху, посередине или снизу.
- Без `accent` линия нейтральная (`--hairline-color`). С `accent` она окрашивается цветом этой роли.
- В превью интерфейса разделитель всегда получает явную высоту по сетке. Иначе пустая ячейка схлопнулась бы почти в ноль.

</details>

<details>
<summary>⚙️ Пропсы</summary>

| Название       | Тип                             | По умолчанию   | Описание                                                                                                                                                                                                    |
| -------------- | ------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`           | `string`                        |                | Идентификатор в конструкторе. Компонент его не использует                                                                                                                                                   |
| `wrapperClass` | `string`                        | `""`           | Классы обёртки                                                                                                                                                                                              |
| `type`         | `"line" \| "empty"`             | `"line"`       | Линия или пустой отступ                                                                                                                                                                                     |
| `orientation`  | `"horizontal" \| "vertical"`    | `"horizontal"` | `vertical` - линия сверху вниз на всю высоту. В строке (`flex-row`) занимает только толщину линии, в колонке и ячейке сетки - всю ширину, `anchor` ставит её слева (`top`), по центру или справа (`bottom`) |
| `width`        | `number`                        | `1`            | Толщина линии, пикселей                                                                                                                                                                                     |
| `accent`       | `AccentColor`                   |                | Цвет: `gray`, `red`, `orange`, `yellow`, `green`, `cyan`, `blue`, `purple`. Без него - нейтральный                                                                                                          |
| `anchor`       | `"top" \| "center" \| "bottom"` | `"center"`     | Где стоит линия по высоте                                                                                                                                                                                   |

Колбэков нет.

</details>

<details>
<summary>💻 Примеры кода</summary>

```svelte
<UI.Divider />
<UI.Divider accent="blue" width={2} anchor="bottom" />
<UI.Divider type="empty" />
```

</details>

<details>
<summary>🛠️ Панель свойств (DividerProps.svelte)</summary>

Панель для конструктора DevCloud. В ней задают доступ, тип, положение линии, толщину (от 1 до 20 px) и цвет.

| Пропс              | Тип                                | Описание                                              |
| ------------------ | ---------------------------------- | ----------------------------------------------------- |
| `component`        | `UIComponent<"Divider">`           | Компонент и его свойства                              |
| `onPropertyChange` | `(change: PropertyChange) => void` | Сообщает об изменении: свойства, имя, доступ, событие |

</details>

## Файл `src/lib/Dragging.README.md`

### ↕️ Dragging

Ручка для перестановки элементов списка мышью. Её ставят в каждую строку списка: зажали, потянули, отпустили, и строка встала на новое место.

#### ✨ Что умеет

- 🖱️ Переставляет строки списка перетаскиванием мышью.
- 👻 Показывает перетаскиваемую строку с тенью и акцентной рамкой.
- 📍 Отмечает место вставки штриховой рамкой.
- 🌊 Плавно раздвигает соседние строки.
- 🧺 Работает с несколькими независимыми списками на одной странице.

#### 🧩 Где применяется

Это служебный компонент для панелей свойств: так переставляют вкладки Tabs, варианты Select, биты Switch, полосы ProgressBar, уровни PeriodChart. В конструкторе интерфейса его нет.

#### 🚀 Как подключить

1. Положите строки списка в общий контейнер и получите ссылку на него через `bind:this`.
2. Дайте каждой строке `id` вида `item-{номер}`.
3. Поставьте в каждую строку `Dragging` и передайте контейнер, массив и номер строки.
4. Сохраняйте новый порядок в `onUpdate`.

```svelte
<script>
  import * as UI from "poe-svelte-ui-lib"
  let container = $state()
  let items = $state(["Первый", "Второй", "Третий"])
</script>

<div bind:this={container} class="flex flex-col gap-1">
  {#each items as item, index (item)}
    <div id={`item-${index}`} class="flex items-center gap-2 p-2">
      <UI.Dragging {container} array={items} elementIndex={index} onUpdate={(arr) => (items = arr)} />
      <span>{item}</span>
    </div>
  {/each}
</div>
```

Если на странице несколько независимых списков, добавьте номер контейнера в `id` (`item-{номер}-{контейнер}`) и передайте его в `containerIndex`.

#### 💡 Полезно знать

- 🖱️ Работает только с мышью. Касания и перестановка с клавиатуры не поддерживаются.
- 🔒 Если элемент в списке один, ручка бледная и не тянется.
- 💾 `onUpdate` вызывается дважды. Сохранять порядок нужно по второму вызову.
- ⚠️ `container`, `array` и `elementIndex` обязательны.

<details>
<summary>🔬 Как устроено</summary>

- Массив `array` меняется на месте. `onUpdate` вызывается дважды: когда элемент вынули из массива и когда вставили на новое место.
- Первый вызов `onUpdate` - промежуточный, массив без перетаскиваемого элемента. Сохранять порядок (на сервер, в хранилище) нужно только по второму вызову, когда длина массива снова полная.
- Вторым аргументом `onUpdate` во втором вызове приходит `containerIndex` (`null`, если он не задан). В первом вызове там всегда `null`.
- Строки списка ищутся по `id` вида `<elementsId>-<номер>` только внутри своего контейнера, номера идут подряд без перетаскиваемой строки.
- Место вставки - перед первой строкой, середина которой ниже курсора. Если курсор ниже середины последней строки, элемент встаёт в конец списка. Поэтому плейсхолдер не прыгает туда-обратно на границе.

</details>

<details>
<summary>🎨 Вид перетаскивания</summary>

Вид общий для библиотеки и приложений, его задают функции из `dragStyle.ts`. Так же выглядит перетаскивание компонентов на холсте конструктора DevCloud.

| Функция                            | Что делает                                                                                          |
| ---------------------------------- | --------------------------------------------------------------------------------------------------- |
| `applyDragGhost(el)`               | Перетаскиваемый элемент: фон с оттенком акцента, акцентная рамка, тень, курсор «захват»             |
| `clearDragGhost(el)`               | Снимает этот вид                                                                                    |
| `createDropPlaceholder(height)`    | Место вставки: мягкий акцент и штриховая рамка                                                      |
| `animateReorder(elements, mutate)` | Плавно раздвигает соседние строки, 160 мс. Отключается, если в системе выбрано «уменьшить движение» |

Из пакета экспортируются `applyDragGhost`, `clearDragGhost` и `createDropPlaceholder`. `animateReorder` внутренняя, её использует только `Dragging`.

</details>

<details>
<summary>⚙️ Пропсы</summary>

| Название         | Тип                     | По умолчанию | Описание                                 |
| ---------------- | ----------------------- | ------------ | ---------------------------------------- |
| `container`      | `HTMLDivElement`        | обязателен   | Контейнер списка                         |
| `array`          | `any[]`                 | обязателен   | Элементы списка                          |
| `elementIndex`   | `number`                | обязателен   | Номер элемента этой ручки                |
| `elementsId`     | `string`                | `"item"`     | Начало `id` строк                        |
| `containerIndex` | `number`                |              | Номер контейнера, если списков несколько |
| `wrapperClass`   | `string`                |              | Классы ручки                             |
| `onUpdate`       | `(arr, index?) => void` |              | Порядок изменился                        |

</details>

<details>
<summary>🛠️ Списки в панелях свойств</summary>

- Строка списка в панели свойств: ручка, номер и текст элемента («Вариант 2 · Ручной»), поля без своих подписей и кнопка удаления.
- Подписи колонок один раз сверху рисует `PropsListHeader.svelte` с той же сеткой колонок. При пустом списке шапки нет.
- Тексты элементов правятся только в окне «Тексты и переводы». Новый элемент создаётся без текста.

</details>

## Файл `src/lib/Dropdown/README.md`

### 🔻 Dropdown

Выпадающее меню или всплывающая панель у кнопки: «Действия» в строке таблицы, выбор языка, маленькая форма поверх страницы.

#### ✨ Что умеет

- 🔘 Открывается кнопкой. Кнопка - обычная `Button` со всеми её видами или своя разметка.
- 📋 Показывает пункты меню: значок, подпись, цвет (например красный для «Удалить»), неактивные пункты и разделители.
- 🧩 Вместо пунктов может показать любое содержимое: форму, список, подсказку.
- 🪟 Панель не обрезается краем блока или прокруткой и сама открывается вверх, если снизу мало места.
- 🖱️ Закрывается кликом мимо, клавишей Escape и выбором пункта. Списки вложенных компонентов (Select внутри панели) кликом мимо не считаются, так что в панель можно класть поля с выпадающими списками.
- ⌨️ Работает с клавиатуры: стрелки, Home, End, Enter.

#### 🧩 Как пользоваться

```svelte
<script>
  import * as UI from "poe-svelte-ui-lib"
</script>

<UI.Dropdown
  button={{ variant: "secondary", content: { name: "Действия" } }}
  items={[
    { name: "Копировать", icon: UI.IconCopy, onClick: copy },
    { divider: true },
    { name: "Удалить", icon: UI.IconDelete, accent: "red", onClick: remove },
  ]}
/>
```

#### 💡 Полезно знать

- 🔌 Компонент только показывает меню и сообщает о выборе. Что делать по пункту, решает приложение.
- 🛠️ В конструкторе DevCloud его нет: это деталь интерфейса приложения, а не переменная устройства.

<details>
<summary>🎛️ Свой триггер и своё содержимое</summary>

Сниппет `trigger` получает атрибуты кнопки (`props`) и признак открытия. Разверните атрибуты на своей кнопке: в них клик, клавиатура и `aria`.

```svelte
<UI.Dropdown items={languages} onSelect={(item) => UI.setLanguage(item.id)}>
  {#snippet trigger(props, isOpen)}
    <button {...props} class="size-8 rounded-full" aria-label="Язык">{@html flag}</button>
  {/snippet}
</UI.Dropdown>
```

Без `items` панель рисует `children`. Сниппет получает функцию `close`, чтобы закрыть панель из своей кнопки.

```svelte
<UI.Dropdown button={{ content: { name: "Фильтр" } }} align="end" componentClass="w-64 p-3">
  {#snippet children(close)}
    <UI.Input label={{ name: "Имя" }} autofocus />
    <UI.Button content={{ name: "Готово" }} onClick={close} />
  {/snippet}
</UI.Dropdown>
```

</details>

<details>
<summary>🔬 Как устроено</summary>

- Панель выносится в `body` и стоит `fixed` от окна, как список `Select`. Позиция следует за триггером при прокрутке и изменении окна. У панели `data-ui-portal`: `Modal` не считает клик по ней кликом снаружи.
- Вниз, если снизу хватает места (от 160 px) или его больше, чем сверху, иначе вверх. Высота не больше `maxHeight` и свободного места, дальше прокрутка.
- `align="start"` - левый край панели по левому краю триггера, `"end"` - правый по правому. Ширина не меньше триггера и 10rem. Панель шире места до края окна сдвигается внутрь и за край не уходит.
- С пунктами: панель `role="menu"`, пункт `role="menuitem"`, разделитель `role="separator"`, у триггера `aria-haspopup="menu"`, `aria-expanded`, `aria-controls`. Без пунктов - `role="dialog"`, `aria-haspopup="dialog"`.
- Стрелка вниз на триггере открывает меню и ставит фокус на первый пункт, стрелка вверх - на последний. В меню стрелки ходят по доступным пунктам по кругу, Home и End - к первому и последнему.
- Escape закрывает панель и возвращает фокус на триггер, до модального окна вокруг не доходит. Tab закрывает панель.
- Выбор пункта: сначала `item.onClick`, потом `onSelect(item, index)`, затем панель закрывается. Неактивный пункт не выбирается.

</details>

<details>
<summary>⚙️ Пропсы</summary>

| Название         | Тип                          | По умолчанию | Описание                                             |
| ---------------- | ---------------------------- | ------------ | ---------------------------------------------------- |
| `button`         | `IButtonProps` без `onClick` |              | Кнопка-триггер, если нет сниппета `trigger`          |
| `trigger`        | `Snippet<[props, isOpen]>`   |              | Свой триггер: `<button {...props}>`                  |
| `items`          | `IDropdownItem[]`            |              | Пункты меню. Без них панель рисует `children`        |
| `children`       | `Snippet<[close]>`           |              | Своё содержимое панели                               |
| `isOpen`         | `boolean`                    | `false`      | Открыта ли панель. Можно связать через `bind:isOpen` |
| `disabled`       | `boolean`                    | `false`      | Триггер неактивен                                    |
| `align`          | `"start" \| "end"`           | `"start"`    | По какому краю триггера ставится панель              |
| `maxHeight`      | `string`                     | `"20rem"`    | Наибольшая высота панели                             |
| `wrapperClass`   | `string`                     | `""`         | Классы обёртки триггера                              |
| `componentClass` | `string`                     | `""`         | Классы панели                                        |
| `onSelect`       | `(item, index) => void`      |              | Выбран пункт (после его `onClick`)                   |
| `onOpenChange`   | `(isOpen: boolean) => void`  |              | Панель открылась или закрылась                       |

Пункт `IDropdownItem`:

| Поле       | Тип                   | Описание                         |
| ---------- | --------------------- | -------------------------------- |
| `id`       | `string`              | Ключ пункта, необязателен        |
| `name`     | `string`              | Подпись                          |
| `icon`     | `Component \| string` | Значок: Svelte-компонент или SVG |
| `accent`   | `AccentColor`         | Цвет значка и подписи            |
| `disabled` | `boolean`             | Пункт неактивен                  |
| `divider`  | `boolean`             | Разделитель вместо пункта        |
| `onClick`  | `() => void`          | Действие пункта                  |

</details>

## Файл `src/lib/FileAttach/README.md`

### 📎 FileAttach

Выбор файла с компьютера. Через него закачивают в память устройства сертификат, прошивку или картинку.

#### ✨ Что умеет

- 📄 Показывает поле с именем выбранного файла.
- 🖼️ Может показывать превью картинки, квадратное или круглое. Картинка видна сразу после выбора, ещё до загрузки.
- 🔘 Бывает маленькой кнопкой-иконкой «Открыть файл» для панелей инструментов, а с подписью - обычной кнопкой со значком и текстом.
- 🗃️ Может выбрать сразу несколько файлов.
- 🎯 Можно ограничить, какие файлы разрешено выбирать, например только `.pem` или только картинки.
- 🔁 Срабатывает даже при повторном выборе того же файла.

#### 🧩 Как настроить в конструкторе

1. Перетащите компонент на макет и подпишите его.
2. Укажите, какие файлы можно выбирать, например `.bin,.pem` или `image/*`.

#### 💡 Полезно знать

- 📤 Сам компонент файл никуда не отправляет. Он только передаёт выбранный файл приложению, а закачкой на устройство занимается приложение.
- 📏 Имя файла на устройстве не длиннее 31 символа - это ограничение прошивки.
- 🗂️ Список файлов, удаление и прогресс закачки показывает виджет «Файловая система».
- 👀 Файлы с устройства этот компонент не показывает.

<details>
<summary>📦 Данные устройства</summary>

- Выбранный файл приложение отправляет частями командой `SET FS`: `UploadStart`, затем `UploadChunk`, затем `UploadDone`.
- Файлы с устройства компонент не показывает.
- Список файлов, удаление и прогресс закачки показывает виджет «Файловая система» (`WidgetFileSystem`).

| Ключ   | Описание                                                   |
| ------ | ---------------------------------------------------------- |
| `Name` | Имя файла, не длиннее 31 символа. Это ограничение прошивки |

</details>

<details>
<summary>🔀 Виды подробно</summary>

Вид задаёт `type`:

- `file` - поле с пунктирной рамкой высотой 2rem: слева «Выбрать файл» акцентным цветом, справа имя выбранного файла. Пока файл не выбран, надпись бледная.
- `image` - превью картинки, квадратное (скругление 12px) или круглое. Пока картинки нет, внутри надпись «Image». Выбранная картинка (`image/*`) сразу показывается через временный blob-URL, ещё до загрузки. Он освобождается при новом выборе и при удалении компонента.
- `button` - кнопка-иконка «Открыть файл» (как `Button`) для панелей инструментов, рядом с кнопками «Сохранить в файл» и подобными. По умолчанию иконка - документ со стрелкой вверх. Имя выбранного файла нигде не остаётся.
- После выбора компонент сразу забирает файлы и очищает скрытый `<input type="file">` у всех видов. Поэтому тот же файл можно выбрать снова, и `onUpdate` сработает ещё раз. Поле `file` при этом продолжает показывать имя выбранного файла (это поле формы), `image` - превью.

```svelte
<UI.FileAttach type="button" accept=".yaml,.gz" info={{ text: "Открыть файл", side: "top" }} onUpdate={(file) => open(file)} />
```

- Какие файлы можно выбрать, задаёт `accept` в формате HTML, например `.bin,.pem` или `image/*`.
- Сам файл компонент никуда не отправляет. Его получает `onUpdate`, а загрузкой занимается приложение. Отмена окна выбора ничего не меняет: `onUpdate` не вызывается, прежний выбор остаётся на экране.
- `currentImage` принимает data-URL или чистый base64. Чистый base64 показывается как `data:image/png;base64,...`.

</details>

<details>
<summary>⚙️ Пропсы</summary>

| Название                    | Тип                                | По умолчанию                        | Описание                                                                         |
| --------------------------- | ---------------------------------- | ----------------------------------- | -------------------------------------------------------------------------------- |
| `id`                        | `string`                           |                                     | Идентификатор в конструкторе. Компонент его не использует                        |
| `wrapperClass`              | `string`                           | `""`                                | Классы обёртки                                                                   |
| `componentClass`            | `string`                           | `""`                                | Классы поля с именем файла или кнопки                                            |
| `label.name`, `label.class` | `string`                           | `""`                                | Заголовок и его классы                                                           |
| `type`                      | `"file" \| "image" \| "button"`    | `"file"`                            | Вид                                                                              |
| `accept`                    | `string`                           | `"*/*"`                             | Какие файлы можно выбрать                                                        |
| `multiple`                  | `boolean`                          | `false`                             | Несколько файлов сразу: `onUpdate` получает массив `File[]`                      |
| `caption`                   | `string`                           | `""`                                | Только `button`: подпись рядом со значком                                        |
| `imageSize`                 | `{ height, width, fitMode, form }` | `10rem`, `10rem`, `cover`, `square` | Размер превью, масштабирование (`cover`, `contain`) и форма (`square`, `circle`) |
| `currentImage`              | `string \| null`                   | `""`                                | Текущая картинка: data-URL или base64. Можно связать через `bind:`               |
| `info`                      | `{ text, side }`                   |                                     | Только `button`: подсказка, как у `Button`                                       |
| `help.info`                 | `string`                           |                                     | Значок ⓘ после подписи с пояснением, как у `Input`; без подписи - на её месте    |
| `icon`                      | `Component \| string`              | документ со стрелкой                | Только `button`: своя иконка                                                     |
| `disabled`                  | `boolean`                          | `false`                             | Неактивен                                                                        |
| `onUpdate`                  | `(value, event) => void`           |                                     | Выбор: `File`, при `multiple` - `File[]`. При отмене окна выбора не вызывается   |

</details>

<details>
<summary>💻 Примеры кода</summary>

```svelte
<script>
  import * as UI from "poe-svelte-ui-lib"
  let avatar = $state("")
</script>

<UI.FileAttach label={{ name: "Сертификат" }} accept=".pem" onUpdate={(file) => upload(file)} />

<UI.FileAttach type="image" accept="image/*" imageSize={{ form: "circle" }} bind:currentImage={avatar} />
```

</details>

<details>
<summary>🛠️ Панель свойств (FileAttachProps.svelte)</summary>

- В панели задают доступ, заголовок и его выравнивание, допустимые файлы (`accept`).
- Вид и размер превью в панели не выбираются, они задаются только в коде.

| Пропс              | Тип                                | Описание                                              |
| ------------------ | ---------------------------------- | ----------------------------------------------------- |
| `component`        | `UIComponent<"FileAttach">`        | Компонент и его свойства                              |
| `onPropertyChange` | `(change: PropertyChange) => void` | Сообщает об изменении: свойства, имя, доступ, событие |

</details>

## Файл `src/lib/Graph/README.md`

### 📈 Graph

Живой график нескольких значений во времени. Каждое новое значение добавляет точку справа, а старые уезжают влево - видно, как меняются температура, ток или любые другие показания.

#### ✨ Что умеет

- 〰️ Рисует до шести линий сразу, каждая своим цветом.
- 📋 Справа показывает легенду: цвет, имя и текущее значение каждой линии.
- 🖱️ При наведении мыши показывает время и значения всех линий в этой точке.
- ⏱️ Прямо на графике можно выбрать, как часто добавлять точки: при каждом изменении или раз в заданный промежуток.
- 📏 Сам подбирает масштаб по высоте, чтобы линии не упирались в края.
- 🗂️ Умеет показать и готовую историю, например энергию за сутки по часам.
- 🧪 Есть режим имитации со случайными данными - можно посмотреть график без устройства.

#### 🧩 Как настроить в конструкторе

1. Перетащите график на макет и подпишите его.
2. Выберите переменную устройства, в которой лежат значения линий.
3. Выберите, как часто добавлять точки. «AUTO» - на каждое новое значение с устройства.
4. Чтобы посмотреть, как график выглядит, включите имитацию. Пока она включена, остальные настройки бледные и недоступны.

#### 🔀 Два режима

- 🔴 **Живой.** Значения приходят с устройства, и точки добавляются по ходу дела.
- 📚 **История.** Графику передают готовый ряд с отметками времени, и он рисует его целиком. Переключатель частоты в этом режиме скрыт.

#### 💡 Полезно знать

- 👀 График только показывает данные и ничего не отправляет на устройство.
- 🚀 Частые данные лучше слать потоком телеметрии устройства, а не обычными командами.
- 6️⃣ Линий не больше шести, лишние просто не рисуются.
- ✂️ Длинное имя линии обрезается, полное видно в подсказке при наведении.
- 🧹 Старые точки удаляются сами, память не растёт.
- 📊 Для накопленных значений по периодам (энергия за час или сутки) удобнее PeriodChart.
- ℹ️ Пояснение к заголовку (`help.info`) задаётся в «Тексты и переводы», строка «Справка · Подсказка». Значок ⓘ стоит сразу после заголовка, текст всплывает при наведении поверх страницы и не обрезается краем окна или блока. Без заголовка значок стоит на его месте.

<details>
<summary>📦 Данные устройства</summary>

- Читает одну переменную. Каждое обновление добавляет точку.
- Частые данные лучше слать потоком телеметрии устройства (`Telemetry_SendGraph` в `stream_client`), а не командным каналом.
- Только показывает, ничего не отправляет.

| Ключ           | Описание                                                                                       |
| -------------- | ---------------------------------------------------------------------------------------------- |
| `<переменная>` | Массив `[{ "name": "Temp", "value": 23.4 }, ...]`. Каждое `name` это своя линия, `value` число |

</details>

<details>
<summary>🔀 Режимы подробно</summary>

**Живой.** Данные приходят в `streamingData.data`. Когда рисовать новую точку, решает `refreshRate`:

- `0` (AUTO) - точка на каждый новый массив `streamingData.data` (новый объект, а не правка старого) или на вызов `push(sample)`;
- число - последние значения добавляются точкой раз в столько миллисекунд.

`push(sample, time?)` через `bind:this` добавляет точку напрямую, без `streamingData`: `sample` - массив `{ name, value }`, `time` - момент в мс, по умолчанию сейчас.

Варианты в выпадающем списке: AUTO, 50, 100, 250, 500, 1000, 5000 мс. Этот же список стоит справа на самом графике, и пользователь может сменить частоту на ходу.

**Статический.** Если передан непустой `historyData`, график рисует готовый ряд с отметками времени, например энергию за сутки по часам. Точки сортируются по времени сами. Новый массив `historyData` перерисовывает график целиком. `streamingData` и `refreshRate` при этом не учитываются, список частоты скрыт.

**Имитация.** `isTest` включает случайные данные (от -50 до 50), точка каждые 50 мс. Модуль имитации грузится динамически только в этом режиме и в бандл приложения без имитации не входит. Пока режим включён, значения устройства и `refreshRate` не учитываются. Линии берутся из имён в `streamingData.data`, а если их нет, как у нового графика в конструкторе, рисуются три линии Test 1-3. В конструкторе все остальные свойства становятся бледными и недоступными, пока имитацию не выключат.

</details>

<details>
<summary>🔬 Как устроено</summary>

- Рисуется на canvas. Ширина подстраивается под контейнер, высота области графика 16rem (`h-64`). Холст лежит поверх контейнера, поэтому в сетке и во flex график не распирает колонку.
- Цвета линий по порядку - метки темы: `--blue-mark`, `--red-mark`, `--green-mark`, `--orange-mark`, `--purple-mark`, `--cyan-mark`.
- Точки каждой линии лежат в кольцевом буфере вне реактивности: 20 последних в режиме AUTO и 100 при заданном интервале. Перерисовка - не чаще кадра.
- Масштаб по Y считается по данным с запасом 10%. В живом режиме он плавно подъезжает к новому диапазону.
- Сетка стоит на круглых отметках. По Y шаг 1, 2, 2.5 или 5 × 10ⁿ (около шести линий), знаков после запятой - сколько у шага, левое поле растёт под самую длинную подпись. По X шаг от 0.1 с до года - самый мелкий, при котором подписи не слипаются (не ближе 50 px).
- Подписи по X: в живом режиме - секунды относительно текущего момента, кратные шагу (`0s`, `-5s`, при шаге меньше секунды - `-0.5s`). В статическом - время, кратное шагу в местном времени: `ЧЧ:ММ:СС` при шаге меньше минуты, иначе `ЧЧ:ММ` (с `ДД.ММ`, если ряд длиннее суток), `ДД.ММ` при шаге от суток, `ММ.ГГГГ` от месяца.
- Подсказка при наведении берёт ближайшую по времени точку каждой линии и рисует вертикальную линию-указатель. Значения в подсказке и в легенде округляются до двух знаков.
- Сетка пунктирная, цвета `--faint-color` темы, указатель под подсказкой - `--muted-color`. При смене темы график перерисовывается.

</details>

<details>
<summary>⚙️ Пропсы</summary>

| Название                    | Тип                                          | По умолчанию | Описание                                                                                                    |
| --------------------------- | -------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------- |
| `wrapperClass`              | `string`                                     | `""`         | Классы обёртки                                                                                              |
| `label.name`, `label.class` | `string`                                     | `""`         | Заголовок и его классы                                                                                      |
| `help.info`                 | `string`                                     | `""`         | Пояснение: значок ⓘ после заголовка, текст всплывает при наведении. Без заголовка значок стоит на его месте |
| `streamingData.data`        | `{ name, value }[] \| null`                  | `[]`         | Текущие значения линий для живого режима                                                                    |
| `refreshRate`               | `number`                                     | `0`          | Период добавления точек, мс. `0` - на каждый новый `streamingData.data`                                     |
| `historyData`               | `{ name, points: { value, timestamp }[] }[]` | `[]`         | Готовый ряд для статического режима. `timestamp` в миллисекундах, как `Date.now()`                          |
| `isTest`                    | `boolean`                                    | `false`      | Режим имитации: случайные данные, точка каждые 50 мс                                                        |

Колбэков нет. Метод через `bind:this`: `push(sample, time?)`.

</details>

<details>
<summary>💻 Примеры кода</summary>

```svelte
<script>
  import * as UI from "poe-svelte-ui-lib"
  let values = $state([
    { name: "Temp", value: 23.4 },
    { name: "Hum", value: 41 },
  ])
</script>

<UI.Graph label={{ name: "Климат" }} streamingData={{ data: values }} />

<UI.Graph
  label={{ name: "Энергия за сутки" }}
  historyData={[
    {
      name: "kWh",
      points: [
        { timestamp: 1767225600000, value: 1.2 },
        { timestamp: 1767229200000, value: 0.9 },
      ],
    },
  ]}
/>
```

</details>

<details>
<summary>🛠️ Панель свойств (GraphProps.svelte)</summary>

Импорт из `poe-svelte-ui-lib/constructor`. Сверху переключатель имитации (`isTest`). Пока он включён, остальная панель бледная и недоступна (`inert`).

- **Общее:** доступ, переменная.
- **Внешний вид:** заголовок и его выравнивание.
- **Поведение:** период обновления `refreshRate`.

| Пропс              | Тип                                | Описание                                              |
| ------------------ | ---------------------------------- | ----------------------------------------------------- |
| `component`        | `UIComponent<"Graph">`             | Компонент и его свойства                              |
| `onPropertyChange` | `(change: PropertyChange) => void` | Сообщает об изменении: свойства, имя, доступ, событие |

</details>

## Файл `src/lib/Input/README.md`

### ✏️ Input

Поле ввода. Показывает значение с устройства и позволяет его поменять: имя устройства, пароль, порог срабатывания.

#### 🔤 Типы поля

- 🅰️ **Текст** - обычная строка.
- 🔒 **Пароль** - ввод скрыт, рядом кнопка «показать».
- 🔢 **Число** - со стрелками вверх и вниз и пределами.
- 📝 **Многострочный текст** - для длинных значений.
- 🧮 **Битовое поле** - число, которое занимает только часть битов переменной устройства.

#### ✨ Что умеет

- 📥 Показывает текущее значение с устройства.
- ✅ Проверяет формат ввода и подсвечивает ошибку красным с подписью под полем.
- 📋 Может показать кнопку копирования значения.
- 👁️ Может работать только на показ, без редактирования.
- 💬 Показывает подсказку у значка «i» слева внутри поля, даже без заголовка.
- 🚨 Показывает ошибку от приложения: красная рамка и текст под полем.
- 🎯 Ставит фокус в поле само при появлении или по команде приложения.
- 📐 Многострочное поле может заполнить всю высоту места вместе с заголовком.
- 🎨 Может быть окрашено в цвет: рамка и лёгкий фон цветом роли.

#### 🧩 Как настроить в конструкторе

1. Перетащите поле на макет и выберите переменную устройства.
2. Выберите тип поля.
3. Для текста задайте наибольшую длину и при желании правило проверки (есть библиотека готовых выражений).
4. Для числа задайте минимум, максимум и шаг. Для битового поля - диапазон битов, предел панель посчитает сама.
5. При необходимости включите «только чтение» и кнопку копирования, задайте значение по умолчанию, подпись и цвет.
6. Добавьте на макет кнопку «Сохранить» и перечислите в ней переменную этого поля.

#### 💡 Полезно знать

- 💾 Само поле на устройство ничего не отправляет. Введённое значение запоминается, а отправляет его кнопка, в которой перечислена переменная поля.
- ⚠️ Неверный ввод подсвечивается красным и не запоминается: по кнопке уйдёт последнее верное значение.
- 🔢 Число вне пределов поле само подтягивает к минимуму или максимуму.
- 🔒 У пароля кнопки копирования нет.

<details>
<summary>📦 Что уходит на устройство</summary>

- Читает одну переменную, например `CFG.DevName`, и показывает её значение.
- Конструктор DevCloud создаёт поле с событием **Заголовок** `SET` и **Аргумент** `NoSend`, в панели свойств их не поменять. С `NoSend` значение сразу не уходит: оно сохраняется в значениях устройства, а отправляет его другой компонент, например кнопка «Сохранить» с этой переменной.
- `onUpdate` вызывается, когда значение принято: Enter, уход из поля, стрелки счётчика. Значение, не прошедшее проверку `help.regExp`, и не число в поле `number` наружу не уходят.
- Если устройство прислало `0` или пустую строку, облако показывает в поле значение по умолчанию из свойств (`value`).
- В битовом поле облако берёт и меняет только биты с N по M (`range`), остальные биты переменной сохраняются.

| Ключ           | Описание                                                                                    |
| -------------- | ------------------------------------------------------------------------------------------- |
| `<переменная>` | Строка или число по типу поля. Для битового поля целое число, меняются только биты с N по M |

</details>

<details>
<summary>🔬 Как устроено</summary>

| Тип (`type`) | Что это                                                                                         |
| ------------ | ----------------------------------------------------------------------------------------------- |
| `text`       | Обычный текст                                                                                   |
| `password`   | Скрытый ввод с кнопкой «показать». Копирование недоступно                                       |
| `number`     | Число со стрелками. При целом `number.step` точку ввести нельзя. Запятая читается как точка     |
| `text-area`  | Многострочный текст, высота в строках `textareaRows`, можно растянуть по вертикали              |
| `bitMode`    | Целое число для части 32-битного слова. Поле со стрелками, предел задайте через `number.maxNum` |

- Проверка `help.regExp` работает для всех типов, кроме `number`. Неверный ввод подсвечивается красной рамкой, под полем появляется текст ошибки, у поля ставится `aria-invalid`, `onUpdate` не вызывается.
- `help.regExp` принимает `RegExp`, строку выражения или строку вида `/.../флаги`. Флаги `g` и `y` компонент убирает (с ними проверка одного и того же значения то проходит, то нет), конструктор принимает только `i`, `m`, `s`, `u`.
- Длину ограничивает `maxlength` самого поля: лишние знаки просто не вводятся.
- `number` и `bitMode`: введённое число подтягивается к `minNum` и `maxNum`, у `bitMode` дробная часть отбрасывается. `onUpdate` получает число. Если ввод не число (например, поле очищено), `onUpdate` не вызывается, и слово конфигурации не портится.
- Стрелки есть у `number` и `bitMode`, кроме `readonly` и `disabled`. Пустое значение стрелка сначала ставит в `minNum`. Шаг за предел ставит ровно предел.
- Числа округляются до 5 знаков после запятой, чтобы не было хвостов вида `0.30000000000000004`.
- `readonly` превращает поле в отображение значения. Кнопка копирования (`help.copyButton`) работает у любого поля, кроме пароля и неактивного.
- Подсказка `help.info` - значок ⓘ после заголовка, как у `Select` и `Switch`. Текст всплывает при наведении мышью и при фокусе с клавиатуры, на телефоне - по касанию значка, закрывается касанием в другом месте. Подсказка не выходит за край окна. Без заголовка значок стоит на его месте. Показывает только текст, без разметки.
- `error` - ошибка от приложения (например, ответ сервера «логин занят»). Рамка красная, текст под полем, у поля `aria-invalid` и `aria-describedby` на текст ошибки (`role="alert"`, диктор зачитает его при появлении). Ошибка приложения важнее ошибки формата.
- `autofocus` ставит фокус после появления поля (атрибут браузера сработал бы только при загрузке страницы). Фокус извне: `bind:this={field}`, затем `field.focus()`. Сам элемент поля - `bind:ref`.
- `fill` для `text-area`: обёртка, заголовок, поле и ошибка - колонка на всю высоту родителя, поле забирает остаток высоты, ручка растягивания убрана. Родитель - flex-колонка или блок с высотой. Поле сжимается вместе с родителем (`min-h-0`) и не вылезает за его рамку, даже если родитель ниже обычных 5rem.
- Цвет `accent` красит рамку и даёт лёгкий фон цветом роли.
- `onInput` получает текст при каждом вводе, `onUpdate` - только принятое значение.
- `range` нужен только панели свойств и облаку. По нему панель считает предел битового поля: `2^(end - start + 1) - 1`. Сам `Input` этот проп не читает.

</details>

<details>
<summary>⚙️ Пропсы</summary>

| Название                         | Тип                                                            | По умолчанию          | Описание                                                                           |
| -------------------------------- | -------------------------------------------------------------- | --------------------- | ---------------------------------------------------------------------------------- |
| `id`                             | `string`                                                       |                       | Переменная устройства. Компонент её не использует                                  |
| `type`                           | `"text" \| "password" \| "number" \| "text-area" \| "bitMode"` | `"text"`              | Тип поля                                                                           |
| `value`                          | `string \| number`                                             |                       | Значение. Можно связать через `bind:value`                                         |
| `label.name`, `label.class`      | `string`                                                       | `""`                  | Заголовок и его классы                                                             |
| `wrapperClass`, `componentClass` | `string`                                                       | `""`                  | Классы обёртки и поля                                                              |
| `accent`                         | `AccentColor`                                                  |                       | Цвет: рамка и лёгкий фон поля                                                      |
| `placeholder`                    | `string`                                                       | `""`                  | Подсказка в пустом поле                                                            |
| `disabled`                       | `boolean`                                                      | `false`               | Неактивно                                                                          |
| `readonly`                       | `boolean`                                                      | `false`               | Только показ                                                                       |
| `maxlength`                      | `number`                                                       | `100`                 | Наибольшая длина текста                                                            |
| `textareaRows`                   | `number`                                                       | `3`                   | Строк у `text-area`                                                                |
| `number.minNum`, `number.maxNum` | `number`                                                       | `-1000000`, `1000000` | Пределы числа                                                                      |
| `number.step`                    | `number`                                                       | `1`                   | Шаг стрелок                                                                        |
| `range`                          | `{ start, end }`                                               |                       | Биты битового поля, только для панели свойств и облака                             |
| `help.info`                      | `string`                                                       | `""`                  | Подсказка: значок ⓘ после заголовка, без заголовка - на его месте                  |
| `help.copyButton`                | `boolean`                                                      | `false`               | Кнопка копирования                                                                 |
| `help.regExp`                    | `string \| RegExp`                                             |                       | Проверка ввода. Готовые выражения на вкладке «Регулярные выражения» витрины        |
| `help.autocomplete`              | `string \| null`                                               | `"off"`               | Атрибут `autocomplete` браузера: `username`, `new-password`, `email` и другие      |
| `error`                          | `string`                                                       | `""`                  | Ошибка от приложения: красная рамка и этот текст под полем                         |
| `autofocus`                      | `boolean`                                                      | `false`               | Фокус в поле сразу после появления                                                 |
| `fill`                           | `boolean`                                                      | `false`               | Только `text-area`: заголовок и поле заполняют высоту родителя                     |
| `ref`                            | `HTMLInputElement \| HTMLTextAreaElement \| null`              |                       | Элемент поля, `bind:ref`                                                           |
| `focus()`                        | метод                                                          |                       | Поставить фокус в поле: `bind:this={field}`, затем `field.focus()`                 |
| `onUpdate`                       | `(value: string \| number) => void`                            |                       | Значение принято: Enter, уход из поля, стрелки. При неверном формате не вызывается |
| `onInput`                        | `(value: string) => void`                                      |                       | Текст при каждом вводе                                                             |

Значения по умолчанию у `number` и `help` действуют, только если объект не передан целиком.

</details>

<details>
<summary>💻 Примеры кода</summary>

```svelte
<script>
  import * as UI from "poe-svelte-ui-lib"
  let name = $state("")
  let limit = $state(10)
</script>

<UI.Input label={{ name: "Имя устройства" }} bind:value={name} maxlength={31} help={{ regExp: "^[A-Za-z0-9_-]*$" }} />

<UI.Input label={{ name: "Порог, Вт" }} type="number" bind:value={limit} number={{ minNum: 0, maxNum: 3000, step: 10 }} />

<UI.Input label={{ name: "Серийный номер" }} value="10.10.001-01_..." readonly help={{ copyButton: true }} />

<UI.Input label={{ name: "Логин" }} bind:value={login} error={serverError} autofocus />

<!-- Заметки на всю высоту панели -->
<div class="flex h-full flex-col">
  <UI.Input label={{ name: "Заметки" }} type="text-area" fill bind:value={notes} />
</div>
```

</details>

<details>
<summary>🛠️ Панель свойств (InputProps.svelte)</summary>

Панель для конструктора DevCloud.

- **Общее:** доступ, переменная, тип поля.
- **Значение:** значение по умолчанию, опции «только чтение» и «копирование» (кроме битового поля). У пароля копирование недоступно, при выборе пароля оно выключается.
- **Ограничения:** для текста, пароля и многострочного текста - наибольшая длина и регулярное выражение с библиотекой готовых. У многострочного - число строк. У текста и многострочного - выравнивание содержимого. У числа - минимум, максимум и шаг, если поле не «только чтение» и не неактивно.
- **Битовое поле:** диапазон битов от 0 до 31. Панель сама ставит минимум 0, шаг 1, предел `2^(end - start + 1) - 1` и подсказку «Максимальное число: N» сразу на всех языках.
- **Внешний вид:** заголовок, его выравнивание, автозаполнение браузера, цвет.
- Событие отправки (заголовок и аргумент) в панели не настраивается.

| Пропс              | Тип                                | Описание                                              |
| ------------------ | ---------------------------------- | ----------------------------------------------------- |
| `component`        | `UIComponent<"Input">`             | Компонент и его свойства                              |
| `onPropertyChange` | `(change: PropertyChange) => void` | Сообщает об изменении: свойства, имя, доступ, событие |

</details>

## Файл `src/lib/Joystick/README.md`

### 🕹️ Joystick

Круглый джойстик из кнопок для управления по двум или трём осям: движение, поворот камеры, наклон.

#### ✨ Что умеет

- ⬆️ Кнопки вверх-вниз и влево-вправо меняют две главные оси, диагональные - обе сразу.
- 🔄 Две боковые кнопки крутят третью ось, например крен.
- 🎯 Шаг одного нажатия выбирается внизу: 0.01, 0.1, 1, 10 или 100.
- ⏺️ Центральная кнопка включает и выключает свой флаг, ей можно поставить иконку.
- 0️⃣ Кнопка «0» сбрасывает все оси в ноль.
- 🔢 Под джойстиком видны текущие значения осей.
- 🎨 Цвет джойстика можно сменить, по умолчанию он синий.

#### 🧩 Как настроить в конструкторе

1. Перетащите джойстик на макет и подпишите его.
2. Выберите переменную устройства и команду отправки, например `SET` и `ModCfg`.
3. Выберите иконку центральной кнопки и цвет.
4. Задайте каждой оси минимум и максимум.

#### 💡 Полезно знать

- ⚡ Нажатие стрелки сразу отправляет значения всех осей на устройство. Если в команде указано `NoSend`, они не уходят сами, их отправит другой компонент.
- 🚧 Значение оси не выходит за свои пределы.
- 🙈 Если третьей оси не дать имя, её кнопки и поле прячутся.
- 👀 В режиме «только чтение» остаются только значения осей, без кнопок.
- ℹ️ Пояснение к заголовку (`help.info`) задаётся в «Тексты и переводы», строка «Справка · Подсказка». Значок ⓘ стоит сразу после заголовка, текст всплывает при наведении поверх страницы и не обрезается краем окна или блока. Без заголовка значок стоит на его месте.

<details>
<summary>📦 Данные устройства</summary>

- Читает и пишет одну переменную со значениями всех осей.
- Значение отправляется (`onUpdate`) при каждом нажатии любой кнопки: направлений, боковых, центральной и «0».
- Отправка настраивается в событии: **Заголовок** (обычно `SET`) и **Аргумент** (обычно `ModCfg`). С `NoSend` значение сразу не уходит, его отправит другой компонент.

| Ключ           | Описание                                                                                                                             |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `<переменная>` | Массив из 4 чисел `[ось 1, ось 2, ось 3, флаг]`, например `[x, y, z, 0]`. Последний элемент - состояние центральной кнопки (0 или 1) |

</details>

<details>
<summary>🔬 Как устроено</summary>

- Кнопки направлений меняют оси на шаг чувствительности: вверх и вниз - `value[0]` (+ и -), вправо и влево - `value[1]` (+ и -), диагональные - обе оси сразу. Боковые кнопки меняют `value[2]`.
- Шаг выбирается переключателем: 0.01, 0.1, 1, 10 или 100, по умолчанию 1. Результат чистится от погрешностей дробей (до 1-2 знаков).
- Значение оси не выходит за `minNum` и `maxNum`, по умолчанию -360 и 360.
- Осей по умолчанию три: Pitch, Yaw и Roll. Если третьей оси нет или у неё пустое имя, боковые кнопки и поле третьей оси прячутся, поэтому можно передать и две оси.
- Центральная кнопка переключает `value[3]` между 0 и 1. Включённая кнопка чуть темнее.
- Кнопка «0» ставит `[0, 0, 0, 0]`.
- В режиме `readonly` джойстик и выбор шага скрыты, видны только значения осей.
- Размеры фиксированные: круг 10rem, панель шага 20rem. Под контейнер джойстик не подстраивается.

</details>

<details>
<summary>🎨 Оформление подробно</summary>

- Цвет задаёт `accent`, по умолчанию `blue`. Из него, как у смарт-виджетов, выводятся акцент и цвет значков (`--on-accent`).
- Поля значений осей и кнопка «0» окрашены мягким оттенком того же цвета.
- Иконка центральной кнопки: Svelte-компонент или SVG-строка. Без неё рисуется домик.

</details>

<details>
<summary>⚙️ Пропсы</summary>

| Название                    | Тип                            | По умолчанию     | Описание                                                                                                    |
| --------------------------- | ------------------------------ | ---------------- | ----------------------------------------------------------------------------------------------------------- |
| `id`                        | `string`                       |                  | Переменная устройства. Компонент её не использует                                                           |
| `wrapperClass`              | `string`                       | `""`             | Классы обёртки                                                                                              |
| `accent`                    | `AccentColor`                  | `"blue"`         | Цвет джойстика                                                                                              |
| `label.name`, `label.class` | `string`                       | `""`             | Заголовок и его классы                                                                                      |
| `help.info`                 | `string`                       | `""`             | Пояснение: значок ⓘ после заголовка, текст всплывает при наведении. Без заголовка значок стоит на его месте |
| `value`                     | `number[]`                     | `[0, 0, 0, 0]`   | Значения осей и флаг центральной кнопки. Можно связать через `bind:value`                                   |
| `axes`                      | `{ name, minNum?, maxNum? }[]` | Pitch, Yaw, Roll | Оси. Пределы по умолчанию -360 и 360                                                                        |
| `buttonIcon`                | `Component \| string`          |                  | Иконка центральной кнопки                                                                                   |
| `readonly`                  | `boolean`                      | `false`          | Только показ                                                                                                |
| `onUpdate`                  | `(value: number[]) => void`    |                  | Нажата кнопка направления или боковая                                                                       |

</details>

<details>
<summary>💻 Примеры кода</summary>

```svelte
<script>
  import * as UI from "poe-svelte-ui-lib"
  let pos = $state([0, 0, 0, 0])
</script>

<UI.Joystick
  label={{ name: "Камера" }}
  axes={[{ name: "Pitch", minNum: -90, maxNum: 90 }, { name: "Yaw" }, { name: "" }]}
  bind:value={pos}
  onUpdate={(v) => send(v)}
/>
```

</details>

<details>
<summary>🛠️ Панель свойств (JoystickProps.svelte)</summary>

- В панели задают доступ, переменную, действие (`ModCfg` или `NoSend`); заголовок и его выравнивание; иконку центральной кнопки, цвет; минимум и максимум каждой оси.
- Пределы третьей оси недоступны для правки, если у неё пустое имя.
- Имена осей и режим «только чтение» в панели не задаются.

| Пропс              | Тип                                | Описание                                              |
| ------------------ | ---------------------------------- | ----------------------------------------------------- |
| `component`        | `UIComponent<"Joystick">`          | Компонент и его свойства                              |
| `onPropertyChange` | `(change: PropertyChange) => void` | Сообщает об изменении: свойства, имя, доступ, событие |

</details>

## Файл `src/lib/Loader/README.md`

### ⏳ Loader

Крутилка ожидания: показывает, что идёт загрузка или расчёт.

#### ✨ Что умеет

- 🔄 Крутится, пока видна. Анимация не замирает, даже когда страница занята расчётом.
- 🎨 Берёт цвет текста вокруг, размер задаётся одним пропом.
- 🗣️ С подписью сообщает экранному диктору, что идёт загрузка.

#### 🧩 Как пользоваться

```svelte
<script>
  import * as UI from "poe-svelte-ui-lib"
</script>

<UI.Loader />
<UI.Loader size="2rem" label="Загрузка" class="text-(--accent-text)" />
```

#### 💡 Полезно знать

- 🔘 У кнопки крутилку включает проп `loading` у `Button`, отдельный `Loader` там не нужен.

<details>
<summary>⚙️ Пропсы</summary>

| Название | Тип      | По умолчанию | Описание                                                                     |
| -------- | -------- | ------------ | ---------------------------------------------------------------------------- |
| `size`   | `string` | `"1em"`      | Ширина и высота, любая CSS-длина                                             |
| `label`  | `string` | `""`         | Подпись для диктора: с ней `role="status"`, без неё крутилка только картинка |
| `class`  | `string` | `""`         | Классы, например цвет `text-(--accent-text)`                                 |

</details>

## Файл `src/lib/Modal.README.md`

### 🪟 Modal

Модальное окно поверх страницы: вопрос, подтверждение или небольшая форма. Закрывается крестиком, кликом мимо окна или клавишей Escape.

#### ✨ Что умеет

- ❌ Закрывается крестиком, кликом мимо окна или клавишей Escape.
- 🪜 Окна можно открывать одно поверх другого, закрывается всегда верхнее.
- 🌫️ Затемняет и слегка размывает страницу под собой.
- 📜 Длинное содержимое прокручивается внутри, шапка с крестиком остаётся на месте.
- 🔘 Внизу может быть подвал с кнопками.
- ⌨️ Держит фокус внутри себя и возвращает его на место после закрытия.

#### 🧩 Где применяется

Это служебный компонент для кода приложений. В конструкторе интерфейса его нет, поэтому панели свойств у него тоже нет.

#### 🚀 Как пользоваться

1. Заведите переменную `isOpen` и свяжите её через `bind:isOpen`.
2. Передайте содержимое сниппетом `main`.
3. Если нужны кнопки, положите их в сниппет `footer`. Подтверждающее действие ставьте первым.

```svelte
<script>
  import * as UI from "poe-svelte-ui-lib"
  let isOpen = $state(false)
</script>

<UI.Button content={{ name: "Удалить" }} variant="primary" accent="red" onClick={() => (isOpen = true)} />

<UI.Modal bind:isOpen title="Удалить файл?" width="400px">
  {#snippet main()}
    <p>Файл будет удалён с устройства.</p>
  {/snippet}
  {#snippet footer()}
    <UI.Button content={{ name: "Удалить" }} variant="primary" accent="red" onClick={remove} />
    <UI.Button content={{ name: "Отмена" }} variant="secondary" onClick={() => (isOpen = false)} />
  {/snippet}
</UI.Modal>
```

#### 💡 Полезно знать

- 🧩 Содержимое передаётся сниппетом `main`, обычные дочерние элементы не подойдут. Подвал `footer` необязателен.
- ➡️ Кнопки в подвале выстраиваются справа налево: первая в коде оказывается крайней справа.
- 🔽 Выпадающие списки `Select` внутри окна работают как обычно: клик по ним не закрывает окно.
- 📏 Окно не выше 90% экрана.

<details>
<summary>🔬 Как устроено</summary>

- Подложка затемняет страницу на 40% и размывает её.
- Окно не выше 90% экрана. Длинное содержимое прокручивается внутри, шапка с крестиком остаётся на месте.
- Escape и клик мимо окна закрывают только верхнее окно из открытых.
- Выпадающие списки `Select` внутри окна вынесены в `body`. Клик по ним не считается кликом мимо окна.
- Окно - это `role="dialog"` с `aria-modal`. Фокус не выходит за открытое окно (Tab и Shift+Tab ходят по кругу), после закрытия он возвращается туда, где был.
- При открытии фокус встаёт в первое поле ввода окна, чтобы можно было сразу печатать. Если полей нет, фокус на самом окне.
- Escape и клик мимо окна ставят `isOpen = false` и вызывают `onCancel`. Крестик вызывает только `onCancel`: если вы передали свой `onCancel`, закройте окно в нём сами.
- Кнопки подвала стоят по центру, у всех одна ширина. Подвал развёрнут (`row-reverse`), поэтому первая кнопка в коде крайняя справа.

</details>

<details>
<summary>🪜 Стек окон</summary>

Какие окна открыты и в каком порядке, хранит внутренний `ModalStack` (`src/lib/ModalStackStore.ts`, наружу не экспортируется). Это store со списком id открытых окон:

```ts
ModalStack.subscribe // список id в порядке открытия
ModalStack.open(id) // добавить в конец
ModalStack.close(id) // убрать
```

Каждое окно само добавляет себя в стек при открытии и убирает при закрытии и размонтировании. Вызывать `open` и `close` вручную не нужно. Чем позже открыто окно, тем выше его `z-index`.

</details>

<details>
<summary>⚙️ Пропсы</summary>

| Название       | Тип          | По умолчанию | Описание                                                   |
| -------------- | ------------ | ------------ | ---------------------------------------------------------- |
| `isOpen`       | `boolean`    | `false`      | Открыто ли окно. Можно связать через `bind:isOpen`         |
| `title`        | `string`     |              | Заголовок                                                  |
| `width`        | `string`     | `""`         | Ширина, например `"600px"`. По умолчанию из `wrapperClass` |
| `wrapperClass` | `string`     | `""`         | Классы окна                                                |
| `mainClass`    | `string`     | `""`         | Классы области содержимого                                 |
| `main`         | `Snippet`    | обязателен   | Содержимое                                                 |
| `footer`       | `Snippet`    |              | Подвал, обычно кнопки                                      |
| `onCancel`     | `() => void` | закрыть окно | Окно закрывают крестиком, кликом мимо или Escape           |

</details>

## Файл `src/lib/PeriodChart/README.md`

### 📊 PeriodChart

Столбики накопленных значений с переключателем периода: год, месяц, сутки, час. Удобно смотреть, например, расход электроэнергии.

#### ✨ Что умеет

- 🗓️ Сверху переключатель периодов, ниже столбики выбранного периода.
- 📏 Слева шкала с делениями, она сама подстраивается под данные.
- 🖱️ При наведении на столбик показывает его точное значение с единицами.
- 🏷️ Под столбиками подписи. Если столбиков много, подписи идут через одну-две, чтобы читались.
- 🎨 Цвет столбиков можно выбрать.
- 🧪 Без настроенных данных показывает демо-столбики за год, месяц, сутки и час.

#### 🧩 Как настроить в конструкторе

1. Перетащите диаграмму на макет и подпишите её.
2. Выберите цвет.
3. Добавьте периоды. Для каждого выберите переменную устройства, где лежат значения. При желании задайте подписи столбиков.
4. Расставьте периоды по порядку перетаскиванием - диаграмма всегда открывается на первом.

#### 💡 Полезно знать

- 👀 Диаграмма только показывает данные, ничего не запрашивает и не отправляет.
- 1️⃣ Если период один, переключателя нет.
- 🔤 Период без подписи подписывается сам по своему месту: год, месяц, сутки, час. Поэтому подписи могут повторяться.
- ➖ Отрицательные значения не показываются, шкала всегда начинается с нуля.
- 🔍 Даже очень маленькое положительное значение видно как тонкий столбик.
- 📈 Диаграмма рассчитана на десятки столбиков. Для сотен и тысяч точек лучше Graph.
- ℹ️ Пояснение к заголовку (`help.info`) задаётся в «Тексты и переводы», строка «Справка · Подсказка». Значок ⓘ стоит сразу после заголовка, текст всплывает при наведении поверх страницы и не обрезается краем окна или блока. Без заголовка значок стоит на его месте.

<details>
<summary>📦 Данные устройства</summary>

- Каждый **уровень** это своя вкладка переключателя и своя переменная устройства.
- Сама диаграмма ничего не запрашивает и не отправляет, данные приходят с устройства.
- Панель свойств собирает переменные всех уровней в `eventHandler.Variables`, чтобы приложение подписалось на них разом.

| Ключ                  | Описание                             |
| --------------------- | ------------------------------------ |
| `<переменная уровня>` | Массив чисел, по столбику на элемент |

</details>

<details>
<summary>🔬 Как устроено</summary>

- Всегда открывается на первом уровне. Если уровней стало меньше, чем номер выбранного, выбирается первый. Если уровень один, переключателя нет.
- Пустая подпись уровня заменяется периодом по месту уровня: 1 - год, 2 - месяц, 3 - сутки, 4 - час. Подписи могут повторяться. Для пятого уровня и дальше замены нет.
- Без `levels` показываются 4 демо-уровня со случайными значениями 0-100: год (12 столбиков), месяц (31), сутки (24), час (6).
- Столбики делят ширину поровну. Положительное значение всегда видно, хотя бы на 2% высоты. Отрицательные значения не показываются, шкала начинается с нуля.
- Шкала слева подбирается сама: шаг 1, 2, 2.5 или 5 · 10ⁿ, около 4 делений, верх округляется вверх до шага. От 10 000 подписи с `k`, от 1 000 000 с `M`, например `0…100`, `0…0.08`, `0…3M`. Если все значения не больше нуля, шкала `0…1`.
- Точное значение видно в подсказке при наведении: 4 значащие цифры и единицы, например `910: 0.0734 мкВт/см²`. Целые числа показываются как есть.
- Подписи под столбиками берутся из `labels` или номера столбика (с 1). Если столбиков много, подписи прореживаются, их не больше 12.
- Пустой массив данных показывает надпись «нет данных».
- `onLevelChange` вызывается только при выборе другого уровня, повторный щелчок по текущему его не вызывает.
- Компонент сделан на HTML и CSS без canvas, высота области столбиков 10rem (`h-40`).
- Округление только для показа, данные в `levels` не меняются.

</details>

<details>
<summary>🎨 Оформление подробно</summary>

- `accent` задаёт цвет столбиков: обычные с прозрачностью 35%, столбик под курсором - полным цветом.
- Выбранная вкладка переключателя выделяется светлым фоном и тенью, а не акцентным цветом.
- Сетка пунктирная цвета `--faint-color`, нулевая линия сплошная.

</details>

<details>
<summary>⚙️ Пропсы</summary>

| Название            | Тип                                    | По умолчанию  | Описание                                                                                                                               |
| ------------------- | -------------------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                | `string`                               |               | Идентификатор в конструкторе. Компонент его не использует                                                                              |
| `wrapperClass`      | `string`                               | `""`          | Классы обёртки                                                                                                                         |
| `accent`            | `AccentColor`                          |               | Цвет столбиков. Без него - акцент темы                                                                                                 |
| `label`             | `{ name, class }`                      |               | Заголовок над графиком                                                                                                                 |
| `help.info`         | `string`                               | `""`          | Пояснение: значок ⓘ после заголовка, текст всплывает при наведении. Без заголовка значок стоит на его месте                            |
| `levels`            | `{ name, variable?, data, labels? }[]` | 4 демо-уровня | Уровни в порядке вкладок                                                                                                               |
| `levels[].name`     | `string`                               |               | Подпись вкладки, например «Час». Пустая подпись заменяется периодом по месту уровня: год, месяц, сутки, час. Подписи могут повторяться |
| `levels[].variable` | `string`                               |               | Переменная устройства, например `PWR.EHour`. Нужна конструктору для подписки, сам компонент её не читает                               |
| `levels[].data`     | `number[]`                             |               | Значения, по столбику на элемент                                                                                                       |
| `levels[].labels`   | `string[]`                             |               | Подписи столбиков                                                                                                                      |
| `unit`              | `string`                               | `""`          | Единицы для подсказки, например `" Вт·ч"`                                                                                              |
| `onLevelChange`     | `(index, level) => void`               |               | Выбран другой уровень. Здесь можно догрузить данные                                                                                    |

</details>

<details>
<summary>💻 Примеры кода</summary>

```svelte
<UI.PeriodChart
  label={{ name: "Энергия" }}
  unit=" кВт·ч"
  levels={[
    { name: "Сутки", variable: "PWR.EDay", data: [1.2, 0.9, 1.4] },
    { name: "Месяц", variable: "PWR.EMonth", data: [31, 28, 35] },
  ]}
/>
```

</details>

<details>
<summary>🛠️ Панель свойств (PeriodChartProps.svelte)</summary>

- В панели задают доступ, цвет, заголовок и список уровней.
- Список уровней: перетаскивание, номер и подпись на текущем языке, переменная, данные (числа через запятую), подписи столбиков (через запятую), удаление. Последний уровень удалить нельзя. Новый уровень добавляется без подписи и без данных.
- Любое изменение списка обновляет `eventHandler.Variables` переменными всех уровней.
- Единицы `unit` в панели не задаются. Поля для правки подписи уровня в списке нет, подпись только показывается.

| Пропс              | Тип                                | Описание                                              |
| ------------------ | ---------------------------------- | ----------------------------------------------------- |
| `component`        | `UIComponent<"PeriodChart">`       | Компонент и его свойства                              |
| `onPropertyChange` | `(change: PropertyChange) => void` | Сообщает об изменении: свойства, имя, доступ, событие |

</details>

## Файл `src/lib/ProgressBar/README.md`

### 📊 ProgressBar

Одна или несколько полос заполнения. Наглядно показывают уровень жидкости, заряд батареи или загрузку процессора.

#### ✨ Что умеет

- 📈 Показывает значения с устройства полосами, которые заполняются от нуля до максимума.
- 🔢 Над каждой полосой подпись и число с единицами, например `75%`.
- ↕️ Полосы бывают горизонтальными и вертикальными.
- 🎨 Каждой полосе можно дать свой цвет.
- 📝 Под полосой может появиться пояснение от устройства, например «5.4 из 8 ГБ».

#### 🧩 Как настроить в конструкторе

1. Перетащите компонент на макет и выберите переменную устройства.
2. Выберите направление: горизонтально или вертикально.
3. Задайте минимум, максимум и единицы.
4. Добавьте полосы, подпишите их и выберите цвета. Порядок меняется перетаскиванием.

#### 💡 Полезно знать

- 🔗 Полосы связаны с данными по порядку, а не по имени. Первая полоса показывает первое значение, вторая второе.
- 📌 Значение за пределами шкалы прижимается к краю.
- 📐 Вертикальным полосам нужна высота, задайте её контейнеру.
- 👀 Компонент только показывает и ничего не отправляет.
- 🏷️ Над полосами можно вывести общий заголовок (`label`), как у остальных компонентов. Пустой заголовок не выводится, место не занимает. У каждой полосы остаётся своя подпись (`items[].name`). Новый компонент в конструкторе сразу с одной полосой.
- ℹ️ Пояснение к заголовку (`help.info`) задаётся в «Тексты и переводы», строка «Справка · Подсказка». Значок ⓘ стоит сразу после заголовка, текст всплывает при наведении поверх страницы и не обрезается краем окна или блока. Без заголовка значок стоит на его месте.

<details>
<summary>📦 Данные устройства</summary>

- Читает одну переменную со значениями всех полос.
- Только показывает, ничего не отправляет.

| Ключ           | Описание                                                                               |
| -------------- | -------------------------------------------------------------------------------------- |
| `<переменная>` | Массив `[{ "Value": 75 }, ...]`, по элементу на полосу. `Value` число в пределах шкалы |

- `Name` в элементе заменяет подпись полосы из настроек.
- `Info` выводится под полосой.

</details>

<details>
<summary>🔬 Как устроено</summary>

- Полосы сопоставляются с данными по порядку, а не по имени. Порядок в настройках и в данных должен совпадать.
- Значение за пределами шкалы прижимается к краю. Число в виде строки тоже понимается. Если значения для полосы нет, она пустая, а число показывает минимум шкалы.
- Дробные значения округляются до одного или двух знаков.
- Горизонтально: подпись и значение над полосой, полосы друг под другом. Вертикально: подпись сверху, значение и `Info` снизу, полоса заполняется снизу вверх, полосы стоят рядом с переносом.

</details>

<details>
<summary>🎨 Оформление подробно</summary>

- Цвет полосы задаёт `items[].accent`. Без своего цвета полоса берёт общий `accent`, а без него - акцент темы.
- Толщина полосы 6 px, дорожка `--container-color`.
- Подпись приглушённым цветом, `Info` бледным.

</details>

<details>
<summary>⚙️ Пропсы</summary>

| Название                         | Тип                                     | По умолчанию          | Описание                                                                                                    |
| -------------------------------- | --------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------- |
| `id`                             | `string`                                |                       | Переменная устройства. Компонент её не использует                                                           |
| `wrapperClass`                   | `string`                                | `""`                  | Классы обёртки                                                                                              |
| `accent`                         | `AccentColor`                           |                       | Общий цвет полос                                                                                            |
| `label.name`, `label.class`      | `string`                                | `""`                  | Общий заголовок над полосами. Пустой не выводится                                                           |
| `help.info`                      | `string`                                | `""`                  | Пояснение: значок ⓘ после заголовка, текст всплывает при наведении. Без заголовка значок стоит на его месте |
| `items`                          | `{ name?, accent? }[]`                  | `[{ name: "Label" }]` | Полосы: подпись и цвет. Цвет полосы важнее общего                                                           |
| `value`                          | `{ Name?, Value, Info?, Timestamp? }[]` |                       | Значения по порядку полос. `Name` заменяет подпись из `items`                                               |
| `type`                           | `"horizontal" \| "vertical"`            | `"horizontal"`        | Направление                                                                                                 |
| `number.minNum`, `number.maxNum` | `number`                                | `0`, `100`            | Пределы шкалы                                                                                               |
| `number.units`                   | `string`                                | `"%"`                 | Единицы                                                                                                     |

Колбэков нет.

</details>

<details>
<summary>💻 Примеры кода</summary>

```svelte
<UI.ProgressBar items={[{ name: "CPU" }, { name: "RAM", accent: "green" }]} value={[{ Value: 42 }, { Value: 67, Info: "5.4 из 8 ГБ" }]} />
```

</details>

<details>
<summary>🛠️ Панель свойств (ProgressBarProps.svelte)</summary>

Панель для конструктора DevCloud. В ней задают доступ (без варианта «только просмотр»), переменную, направление, минимум и максимум (шага нет), а подписи полос и единицы правятся в окне «Тексты и переводы». Список полос открывается в отдельном окне: полосы добавляют, удаляют, перетаскивают и красят (новая полоса синяя). При смене пределов значения в превью ставятся в середину шкалы. Общий цвет `accent` в панели не задаётся.

| Пропс              | Тип                                | Описание                                              |
| ------------------ | ---------------------------------- | ----------------------------------------------------- |
| `component`        | `UIComponent<"ProgressBar">`       | Компонент и его свойства                              |
| `onPropertyChange` | `(change: PropertyChange) => void` | Сообщает об изменении: свойства, имя, доступ, событие |

</details>

## Файл `src/lib/protocols/PROTOCOL.md`

### 📡 Протокол обмена с устройствами

Единый язык, на котором устройства на прошивках ProdFactory-ESP и ProdFactory-STM говорят между собой и с программами вокруг них: DevCloud, DevTerminal и веб-интерфейсом ESP. Здесь описано, как устроен пакет, как он адресуется и как едет по разным проводам.

#### ✨ Главное

- 📦 По всем проводам ходит один и тот же пакет `poe_cbor_pkt`: CAN, CAN FD, RS485, LoRa и UART-консоль xPOE-Debug.
- 🧬 Данные всегда кодируются в CBOR (RFC 8949). JSON в этом описании только для удобства чтения.
- 📬 В пакете есть адрес получателя, адрес отправителя, команда, данные и контрольная сумма.
- 📨 В одном пакете может быть несколько записей, в том числе разным получателям.
- 🛡️ Каждая запись защищена своей контрольной суммой: испорченная запись пропускается, остальные принимаются.
- 🌐 У WebSocket свой конверт `{HAR, VAL}`: команда в нём то же число `HAR`, что на шине. Так говорят браузер с облаком, облако с устройством и веб-интерфейс ESP с устройством.
- 💬 Текст события устройство шлёт кодом из словаря сообщений `dictionaries/messages.yaml`, облако показывает его на языке пользователя.
- 🔐 Устройство доказывает облаку, что оно то самое, токеном, который получает при первом подключении.

#### 🧩 Где живёт код

- 🔧 В прошивках: компоненты `poe_cbor` и `api_service`.
- 💻 В программах: `poe-svelte-ui-lib/protocols` из этой библиотеки.

Байты в обоих местах совпадают, это проверяют тесты: `npm run Test` сверяет байты с эталонами из прошивки. Таблица соответствия функций - в конце документа.

#### 📦 Пакет

Пакет - это список записей. Каждая запись говорит: кому, от кого, какая команда, какие данные и контрольная сумма.

<details>
<summary>🔬 Формат пакета</summary>

```
0x9F  [TrgBusID, SrcBusID, HAR, Payload, CRC16]  [ ... ]  0xFF
```

Пакет это CBOR-массив неопределённой длины: начинается с `0x9F`, заканчивается `0xFF`. Внутри одна или несколько записей. Записи могут идти разным получателям, порядок сохраняется.

Запись это массив ровно из пяти элементов (`0x85`). Поэтому пара байт `0x9F 0x85` отмечает начало пакета в потоке.

| Поле       | Тип                | Что это                                                                                |
| ---------- | ------------------ | -------------------------------------------------------------------------------------- |
| `TrgBusID` | uint16             | Кому. `0xFFFF` значит всем                                                             |
| `SrcBusID` | uint16             | От кого, ответ уйдёт сюда. `0x0000` значит внешний клиент: терминал или отладка облака |
| `HAR`      | uint16             | Заголовок, команда и флаг ответа                                                       |
| `Payload`  | одно значение CBOR | Данные команды                                                                         |
| `CRC16`    | uint16             | Контрольная сумма записи                                                               |

Числа пишутся в CBOR кратчайшим способом: до 23 занимают 1 байт, до 255 занимают 2, до 65535 занимают 3.

</details>

#### 🏷️ Команда (HAR)

Одно 16-битное число несёт сразу три вещи: вид сообщения (`GET`, `SET`, `OK!`, `ER!`), код команды из словаря и флаг «ответь мне».

- 🙋 Устройство отвечает только на запрос с флагом ответа. Сам ответ всегда без флага.
- 📈 Телеметрию и потоки данных шлют без флага, чтобы не ждать подтверждений.
- 🔢 Имена `"GET"` и `"ModCfg"` не передаются ни по шине, ни по WebSocket, только коды. Имена нужны людям: интерфейсы, журналы и документация расшифровывают `HAR` по словарю.

<details>
<summary>🔬 Раскладка битов</summary>

```
биты 15-14  заголовок  0 GET, 1 SET, 2 OK!, 3 ER!
биты 13-1   команда    код из словаря, 0..8191
бит 0       ответ      1 - получатель должен ответить
```

В прошивке `HAR` это `har_t` из `api_har.h`, собирается макросами `HAR(h, a)` (с ответом) и `HAR_NR(h, a)` (без). В библиотеке числами это `makeHar` и `splitHar`, словами - `encodeHar(заголовок, аргумент, ответ?, словарь?)` (аргумент - имя или код) и `decodeHar(har, словарь?)`, который возвращает `{ header, argument, code, reply }`. `makeHar`, `encodeHar` и `encodePacket` бросают `RangeError`, если заголовок, команда, BusID или HAR вне диапазона; `encodeHar` с неизвестным заголовком или именем не из словаря бросает `Error`.

</details>

#### 📖 Словарь команд

Коды команд записаны в одном файле: `src/lib/dictionaries/commands.yaml` этой библиотеки (как добавить команду - в [README словарей](../dictionaries/README.md)). Им пользуются все: прошивки, облако, терминал и веб-интерфейс. Все отладочные команды начинаются с `Debug`: `DebugLog` это 11, `DebugPlot` это 12.

- 🔧 Команды устройств - коды 0-4095.
- ☁️ Команды самого облака DevCloud (чаты, журнал, состояние устройств) - коды 7000-7999.
- 🧱 4096-6999 и 8000-8191 - резерв.

<details>
<summary>☁️ Облако: коды команд DevCloud</summary>

Эти команды ходят только между браузером и облаком по `/ws`, устройства их не получают. Команды устройств, которыми пользуется и облако (`JoinDev` 23, `JoinUser` 24, `LeaveUser` 25, `FS` 22, `Update` 7, `DataStream` 15, `ModCfg` 36 и другие), остаются со своими кодами.

| Код  | Имя                | Заголовки | Что делает                               |
| ---- | ------------------ | --------- | ---------------------------------------- |
| 7000 | `ChatMessage`      | SET       | Новое сообщение в чат                    |
| 7001 | `ChatMessages`     | GET, OK!  | Страница истории чата                    |
| 7002 | `SystemMessage`    | SET       | Сообщение в системный чат, администратор |
| 7003 | `EditMessage`      | SET, OK!  | Правка своего сообщения                  |
| 7004 | `DeleteMessage`    | SET, OK!  | Удаление своего сообщения                |
| 7005 | `UpdateLastRead`   | SET       | Чат прочитан, вкладка чата закрыта       |
| 7006 | `JoinChat`         | SET, OK!  | Вход в чат                               |
| 7007 | `UserConnected`    | SET       | Собеседник открыл чат                    |
| 7008 | `ChatUnread`       | OK!       | Число непрочитанных в чате               |
| 7009 | `ChatPins`         | OK!       | Закреплённые чаты пользователя           |
| 7010 | `EditChatGroup`    | OK!       | Чат создан или изменён                   |
| 7011 | `RemoveFromChat`   | OK!       | Пользователь удалён из чата              |
| 7100 | `DeviceMessages`   | GET, OK!  | Страница журнала устройства              |
| 7101 | `DeviceConnection` | OK!       | Устройство в сети или ушло из сети       |
| 7102 | `LeaveGroup`       | SET, OK!  | Выход из группы устройства               |
| 7103 | `LeaveGroups`      | SET       | Выход из групп всех устройств            |
| 7104 | `ResetDevToken`    | SET, OK!  | Сброс токена устройства (TOFU)           |

Новая команда облака получает свободный код из 7000-7999 в `commands.yaml`, потом словарь копируется в прошивки, как любая другая команда. Потоки `/ws-stream` - отдельный канал с текстовыми командами подписки, конверта `{HAR, VAL}` там нет.

</details>

<details>
<summary>⚙️ Копии словаря и словарь устройства</summary>

- `api_har.h` прошивок генерируется из `commands.yaml` командой `npm run Generate` (`src/lib/dictionaries/firmware/api_har.h`, вручную не править). В прошивках лежат копии словаря `.framework/Dictionary.yaml` и заголовка, сборка сверяет их между собой.
- Часть аргументов словаря - задел, прошивки их пока не обрабатывают: `BackUp`, `BindMKey`, `ModList`, `ModMode`, `ModT2-ModT5`, `FwUpgE`, `OrOfs`, `OrAccCal`, `OrMagCal`. Коды у них закреплены и не меняются. Такой аргумент модуль примет, но ответа не будет, поэтому в примерах берут реальные команды (`ModCfg`, `ModInfo`, `FS`).
- Словарь один на стек: прошивки собираются с его копией, поэтому приложения берут встроенный `DEFAULT_DICTIONARY`. Объект словаря (`createDictionary(codes)`): `code(имя)`, `name(код)`, `header(код)`, `har(заголовок, команда, ответ)`.
- Команду, которой нет в словаре, задают числом: `code` и `har` принимают код строкой, десятичный или HEX (`"4097"`, `"0x1001"`), а `name` для неизвестного кода возвращает его же числом строкой, так что запись «туда и обратно» сходится.
- Такой словарь принимают `encodeHar`, `decodeHar`, `encodeWsEnvelope`, `decodeWsEnvelope`, `encodeXPoeDebugFrame` (последний аргумент), `createXPoeDebugParser({ dictionary })` и связь `GUIRenderer` (поле `dictionary`). Без него берётся встроенный.

</details>

#### 💬 Сообщения устройств

Текст события в ответе или пуше устройство шлёт не строкой, а кодом. Все коды записаны в одном файле: `src/lib/dictionaries/messages.yaml` этой библиотеки, рядом со словарём команд `commands.yaml`. Коды разбиты на группы, у каждой свой диапазон и приставка имени. У каждого кода уровень (`info`, `warn`, `error`) и текст на русском, английском и китайском. Облако и веб-интерфейс показывают сообщение на языке пользователя.

- 0 или нет поля `Message` - сообщения нет.
- Тексты короткие и понятные пользователю: причина без технических подробностей (подробности прошивка пишет в свой журнал). Изменяемую часть (SSID, номер канала, список полей) устройство шлёт отдельно, массивом `Args`, только если без неё теряется смысл. В шаблоне это `{0}`, `{1}` и дальше по порядку.
- 📚 Новое сообщение сначала добавляют в `messages.yaml`, потом копируют в прошивки (`.framework/Messages.yaml` и `api_msg.h` обоих фреймворков).
- 🗂️ Новое сообщение - в свою группу: код из её диапазона, имя с её приставкой. Новая группа ядра получает диапазон из резерва 500-999.

| Группа | Коды      | Название   | Что                                                        |
| ------ | --------- | ---------- | ---------------------------------------------------------- |
| `SYS`  | 1-99      | Система    | Перезагрузка, неизвестная команда, неверный запрос, память |
| `CFG`  | 100-199   | Настройки  | Приём настроек (`config_service`)                          |
| `FS`   | 200-299   | Файлы      | Файловая система, загрузка и выгрузка файлов               |
| `FW`   | 300-399   | Обновление | Загрузка и обновление прошивки, обновление модуля по шине  |
| `WIFI` | 400-499   | Wi-Fi      | Поиск сетей и подключение                                  |
| -      | 500-999   | -          | Резерв для новых групп ядра                                |
| `DEV`  | 1000-1999 | Изделия    | Сообщения изделий каталога (`catalog/<CatalogID>`)         |
| -      | 2000+     | -          | Резерв                                                     |

<details>
<summary>⚙️ Формат и функции</summary>

```
WebSocket, ответ или пуш   {HAR, VAL: {DevSN, ModSN, Message: 404, Args: ["Home 5G"], Payload}}
шина, ER! модуля           [TrgBusID, SrcBusID, HAR (ER!), {Message: 404, Args: ["Home 5G"]}, CRC16]
консоль, DebugLog          [уровень, "HAR 0xC048", "MSG 404 Home 5G", FHS]
```

- 🚌 Шина: у ответа `ER!` модуль кладёт в `Payload` CBOR-карту `{Message: код, Args?: [строки]}`. У `OK!` пакет шины не меняется - в `Payload` голые данные.
- 🔁 Хаб ESP, пересылая `ER!` модуля клиенту (`RouteResponseToClient`), берёт `Message` и `Args` из `Payload` модуля и кладёт их в конверт `{HAR, VAL: {DevSN, ModSN, Message, Args?, Payload}}`.
- 🖥️ Консоль: сообщение приходит отдельным пакетом `DebugLog` с тегом `HAR 0x....` (HAR ответа) и текстом `MSG <код>[ <арг1>[<TAB><арг2>...]]`: пробел после кода, TAB между параметрами (в SSID бывают пробелы). Таблица консоли оставляет текст в `VALUE` как пришёл (`MSG 404 Home 5G`), а сообщение на языке (`Не удалось подключиться к Wi-Fi Home 5G, восстановлена прежняя сеть`) показывает в колонке `КОМАНДА` под командой. Строка `xPoeDebugRow` несёт его в полях `message` и `level`, их собирает `xPoeDebugMessage(payload, lang)` - и для `DebugLog`, и для карты `{Message, Args}` в `Payload` ответа `ER!`. Разбор текста - `parseDebugLogMessage(text)` -> `{ Message, Args? }` или `null`.

- `Message` - число 0..65535, `Args` - массив строк и чисел, только если у сообщения есть параметры. Тип в библиотеке - `DeviceMessage = { Message: number, Args?: (string | number)[] }`.
- `messages.yaml`: раздел `groups` (`ИМЯ: { range: [от, до], ru, en, zh }`) и раздел `messages` (строки `- { code, group, name, level, ru, en, zh }`). `name` - имя для C в стиле `UPPER_SNAKE` с приставкой группы (`FS_FILE_NOT_FOUND`), в прошивке это `MSG_<name>` из `api_msg.h`. Префиксов `ER:`/`WR:` в тексте нет, вид сообщения задаёт `level`.
- `npm run Generate` (и `prepack`) из `messages.yaml` генерирует `dictionaries/generated/messages.ts` (`MESSAGE_GROUPS`: группа -> диапазон и название на языках, `DEVICE_MESSAGES`: код -> запись с группой, `MESSAGE_CODES`: имя -> код) и `dictionaries/firmware/api_msg.h` (`typedef enum { MSG_NONE = 0, MSG_SYS_RESTARTING = 1, ... } api_msg_t`, раздел-комментарий на каждую группу). Генератор падает на пересечении диапазонов групп, коде вне диапазона своей группы, имени без приставки группы, повторе кода или имени, неизвестном `level`, пустом тексте и разных параметрах в языках. Оба файла не правятся руками, `messages.yaml` и оба заголовка прошивок есть в пакете (`poe-svelte-ui-lib/dictionaries/messages.yaml`, `poe-svelte-ui-lib/dictionaries/firmware/api_har.h`, `poe-svelte-ui-lib/dictionaries/firmware/api_msg.h`).
- `formatDeviceMessage(code, args?, lang?)` возвращает `{ text, level, group, groupName }` (тип `FormattedDeviceMessage`) или `null` (0, нет кода, не число). `group` - код группы (`"FS"`), `groupName` - её название на языке (`"Файлы"`). Без `lang` - язык по умолчанию, приложение передаёт текущий язык (`getLanguage()`). Нет перевода на язык - английский текст. Неизвестный код - `"#1234"` (с параметрами `"#1234: a, b"`) и уровень `info`, группа - по диапазону кода, код из резерва - `group` и `groupName` равны `null`. Параметра не хватило - на его месте `?`.
- Параметры есть у четырёх сообщений: `CFG_NOT_APPLIED` (100) - `{0}` поля настроек, которые не приняты, через запятую (причины по полям прошивка пишет в свой журнал); `FW_RESYNC` (307) - `{0}` номер части прошивки, с которой загрузчик модуля ждёт передачу (число, раздел «Обновление модуля по шине»); `WIFI_CONNECT_FAILED` (404) - `{0}` SSID, к которой не удалось подключиться (устройство вернулось к прежней сети); `DEV_POWER_LIMIT` (1000) - `{0}` номер канала, который отключён.

```ts
import { formatDeviceMessage } from "poe-svelte-ui-lib/protocols"
import { getLanguage } from "poe-svelte-ui-lib/locales"

const shown = formatDeviceMessage(VAL.Message, VAL.Args, getLanguage())
/* { text: "Не удалось подключиться к Wi-Fi Home 5G, восстановлена прежняя сеть", level: "warn", group: "WIFI", groupName: "Wi-Fi" } */
```

</details>

<details>
<summary>🔀 Переход</summary>

На один выпуск облака `Message` ещё может прийти строкой от старой прошивки (`"OK: ModList Changed"`). `formatDeviceMessage` такую строку не разбирает и возвращает `null`, облако показывает строку как есть. Блок удаляется со следующим выпуском.

</details>

#### 📄 Данные (Payload)

`Payload` это всегда ровно одно значение CBOR: объект, массив, число, строка, набор байт или «ничего». Поля «формат данных» нет, тип видно по самому CBOR.

<details>
<summary>📦 Как кодируются данные</summary>

| Данные                        | Как кодируются                                                         |
| ----------------------------- | ---------------------------------------------------------------------- |
| Объект, массив, число, строка | Как есть, например `{"CfgGroup":"CFG"}`                                |
| Набор сырых двоичных полей    | Байтовая строка `h'...'`. В прошивке `CBOR_PACK`, разбор `CBOR_UNPACK` |
| Ничего                        | `null` (`0xF6`). В прошивке это `data_len = 0`                         |
| Ответ `ER!` модуля на шине    | Карта `{Message: код, Args?: [строки]}` (раздел «Сообщения устройств») |

</details>

#### 🔄 Обновление модуля по шине

Хаб ESP передаёт прошивку загрузчику модуля STM тремя командами: `FwUpgS` (51) - размер и CRC32 образа, `FwUpgP` (52) - части образа по порядку, `FwUpgD` (53) - проверка CRC32 и запуск приложения. Загрузчик отвечает тем же пакетом `poe_cbor_pkt`, что и все модули.

<details>
<summary>⚙️ Ответы загрузчика</summary>

| Команда  | `OK!` (`Payload` - байтовая строка, поля подряд, little-endian) | `ER!` (`Payload` - карта)                                                                   |
| -------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `FwUpgS` | размер части, `u8`                                              | `{Message: 3}` неверный размер, `{Message: 5}` Flash не стёрлась                            |
| `FwUpgP` | номер принятой части, `u32`                                     | `{Message: 307, Args: [номер]}` - передать заново с этой части; `{Message: 3}` - нет сеанса |
| `FwUpgD` | ничего (`null`)                                                 | `{Message: 3}` пришло не всё, `{Message: 306}` CRC32 не совпала                             |

```
шина, ER! FwUpgP   [TrgBusID, SrcBusID, HAR (ER! FwUpgP), {Message: 307, Args: [17]}, CRC16]
```

- `FW_RESYNC` (307): номер в `Args[0]` - число CBOR, а не строка. Пришёл не тот номер части - загрузчик ждёт свой следующий, часть с неверной CRC16 или не записалась - тот же номер. Хаб продолжает передачу с этой части; иной код `Message` - отказ обновления (`MSG_FW_UPGRADE_FAILED` клиенту).
- Карту `ER!` загрузчик пишет вручную, без `api_service` (ProdFactory-STM, `catalog/00.00.491-01` CAN FD и `catalog/25.00.000-01` LoRa), разбирает хаб в `upgrade_service` (ProdFactory-ESP). Загрузчики прошлых версий отвечали `ER!` сырыми 4 байтами номера - с новым хабом не работают, перепрошиваются кабелем.

</details>

#### ✅ Контрольная сумма (CRC)

Каждая запись несёт CRC-16. Она защищает и адреса, и флаг ответа. Запись с неправильной CRC пропускается, остальные записи того же пакета принимаются.

<details>
<summary>🔬 Алгоритм</summary>

- CRC-16/KERMIT: полином `0x8408` (отражённый `0x1021`), начальное значение 0, `check("123456789") = 0x2189`.
- Считается по байтам записи от `0x85` до конца `Payload`, поле CRC не входит.

</details>

#### 📍 Адреса

- 🆔 Адрес модуля на шине (BusID) - это CRC-16 его серийного номера.
- 📢 Адрес `0xFFFF` значит «всем».
- 🖥️ Адрес `0x0000` - внешний клиент: терминал или отладка облака.

<details>
<summary>🔬 Правила адресации</summary>

- BusID модуля это CRC-16 его серийного номера. Значения `0x0000` и `0xFFFF` модулю не выдаются.
- На шине модуль принимает записи со своим BusID и с `0xFFFF`. Свои же записи, вернувшиеся эхом (так бывает на CAN и RS485), он узнаёт по `SrcBusID` и пропускает.
- В консоли адрес `0x0000`, свой BusID и `0xFFFF` значат «этот модуль». BusID другого модуля изделия значит, что модуль консоли перешлёт команду по шине и вернёт ответ.
- Если обработчика команды нет, `OK!`, `ER!` и широковещательные записи отбрасываются молча. `GET` и `SET`, адресованные модулю, отбрасываются с записью в лог.

</details>

#### 🔌 Как пакет едет по разным проводам

- 🚌 **CAN и CAN FD** - пакет режется на кадры по 8 или 64 байта.
- 🔗 **RS485** - сплошной поток, начало пакета ищется по меткам.
- 📻 **LoRa** - пакет целиком в одном радиокадре.
- 🖥️ **UART-консоль** - пакеты идут вперемешку с текстом загрузчика.

<details>
<summary>🔬 Подробно по каналам</summary>

| Канал        | Как передаётся                                                                                                                                                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| CAN, CAN FD  | Пакет режется на кадры по 8 или 64 байта. В 11-битном ID бит 10 значит «последний кадр», биты 0-9 это номер пакета. Хвост кадра CAN FD отрезается по длине пакета                                                                    |
| RS485        | Сплошной поток. Пакет начинается с `0x9F 0x85`, байты до этой метки и пакет без записей считаются мусором. Пауза сбрасывает недособранный пакет: в прошивке 20 мс, на компьютере 100 мс, потому что USB-адаптер отдаёт байты пачками |
| LoRa         | Пакет целиком в одном радиокадре                                                                                                                                                                                                     |
| UART-консоль | Сплошной поток вперемешку с текстом загрузчика. Пакет начинается с `0x9F 0x85`, остальное считается текстом. Недособранный пакет сбрасывается после 100 мс тишины                                                                    |

</details>

<details>
<summary>⚙️ Разборщики потока</summary>

Все три разборщика потока (`createPacketStreamParser`, `createXPoeDebugParser`, `createCanParser`) устроены одинаково:

- Пауза дольше `gapMs` (по умолчанию 100 мс) сбрасывает недособранное. У CAN вместо неё `sessionTimeoutMs` (по умолчанию 2000 мс): столько незавершённая сессия ждёт следующий фрагмент (отсчёт от последнего кадра, а не от первого) и столько живёт обрывок строки slcan. Поэтому длинный пакет на медленной шине собирается целиком, если кадры идут без больших пауз.
- Пакет - только indefinite-массив `0x9F ... 0xFF`, как в прошивке (`CBOR_PktDecInit`). Definite-массивы (`0x80`-`0x9B`) `decodePacket` считает мусором. `createPacketStreamParser` (RS485) и `createXPoeDebugParser` ищут начало одной общей функцией по метке `0x9F 0x85`, а пакет без записей пропускают. Шумовой байт перед пакетом не съедает настоящий пакет.
- `createCanParser` выдаёт собранное, только если это целый пакет. Если начало потеряно или сессия истекла, хвост пакета отбрасывается, а не выдаётся обрезанным сообщением.
- Застрявшее начало длиннее `maxBytes` (по умолчанию 8192) пропускается по байту. У CAN сессия длиннее `maxPacketBytes` (по умолчанию 8192) сбрасывается.
- Заявленная в CBOR длина больше `maxBytes` считается мусором, а не поводом ждать.

</details>

<details>
<summary>🔢 Целые и дробные числа в кодеке</summary>

- `valueToCbor` пишет число как целое CBOR, только если оно точное целое JS (`Number.isSafeInteger`, до 2^53 - 1). Большое «целое» вроде `1e20` уходит как float (кратчайший из float16/float32/float64, без потери значения). Целое за пределами uint64 передают только как `bigint`, и тогда кодек бросает ошибку, а не обрезает значение.
- `cborToValue` отдаёт целое CBOR числом, если оно помещается в safe integer, иначе строкой с точным значением (uint64 и int64 устройства не теряют младшие цифры). Сам `CborDecoder` для таких целых возвращает `bigint`.

</details>

#### 🐞 Отладка в консоли

Прошивка присылает в консоль отладочные сообщения и значения для графиков. Это обычные пакеты, адресованные внешнему клиенту, без флага ответа.

<details>
<summary>📦 Отладочные пакеты</summary>

Прошивка шлёт отладочные пакеты с `TrgBusID = 0`, своим BusID в `SrcBusID` и без флага ответа.

| Команда         | Payload                                                                     |
| --------------- | --------------------------------------------------------------------------- |
| `OK! DebugLog`  | `[уровень, тег, текст или байты, FHS]`. FHS это свободная память устройства |
| `OK! DebugPlot` | `{"Группа.Имя": float32, ...}`, один вызов `LOG_PLOT`                       |

На запрос из консоли прошивка отвечает голым `Payload`. Если у ответа есть сообщение `Message`, оно приходит отдельным пакетом `DebugLog`: тег `HAR 0x....`, текст `MSG <код>[ <арг1>[<TAB><арг2>...]]` (раздел «Сообщения устройств»). Таблица консоли показывает его текстом на языке пользователя в колонке `КОМАНДА`, `VALUE` остаётся как пришёл.

</details>

<details>
<summary>👀 Колонка VALUE в консоли</summary>

Таблица консоли показывает `Payload` наглядно, в стиле YAML (`formatXPoeDebugValue`), а окно строки - развёрнуто (`formatXPoeDebugPretty`). Строку VALUE можно скопировать и вставить в поле Value: уйдёт тот же CBOR.

| Payload                     | Строка VALUE                                               |
| --------------------------- | ---------------------------------------------------------- |
| карта                       | `CFG.DevName: ESP32-Pico-1, CFG.WiFiMode: 1` без `{}`      |
| вложенная карта, массив     | `Net: {SSID: Home 5G, Ch: 6}, List: [1, 2]`                |
| пустая карта, пустой массив | `{}`, `[]`                                                 |
| байтовая строка             | `h'0C73'`                                                  |
| число, логическое, null     | `42`, `12.3`, `true`, `null`                               |
| строка                      | `Home 5G`, в кавычках, если иначе читается не так: `"123"` |
| не CBOR                     | HEX байт: `AB CD`                                          |
| `DebugLog`                  | `🟡 · тег · текст`                                         |

- Ключи и строки пишутся без кавычек. Кавычки `"..."` ставятся, если строка похожа на число, `true`, `false` или `null`, пустая, содержит `:`, `,`, `[]{}`, `#`, перевод строки, пробелы по краям или начинается с кавычки или `h'`.
- Порядок пар и типы ключей - как на проводе: ключ-число без кавычек (`1: x`), ключ-строка из цифр в кавычках (`"1": x`).
- Окно строки показывает тот же `Payload` блочным YAML с отступом 2 пробела.

<details>
<summary>Подробнее о числах и окне</summary>

- float32 с провода декодер отдаёт кратчайшей записью того же float32: `12.3`, а не `12.300000190734863`, `0.005`, а не `0.004999999888241291`. Так числа чистые везде - в журнале, полях GUI и графиках. Обратно такое число уходит float64, прошивки читают любое число CBOR (`CBOR_DecodeNumber`). Целые за пределами 2^53 показываются точно (`18446744073709551615`).
- `.inf`, `-.inf`, `.nan` - бесконечности и NaN.
- Корень не карта - как одно значение: `[1, 2]`, `h'01FF'`, `42`, `"123"`.
- Окно: вложенная карта или массив - с новой строки с отступом 2, элементы массива через `- `.

```yaml
Mode: 1
Net:
  SSID: Home 5G
  Ch:
    - 1
    - 6
Raw: h'01'
```

</details>

</details>

<details>
<summary>✍️ Поле Value в консоли</summary>

Значение команды из консоли (DevCloud, DevTerminal) превращает в `Payload` функция `xPoeDebugValueFromText(text)`. Поле понимает тот же вид, что колонка VALUE, и JSON.

| Ввод                          | Что уходит                                      |
| ----------------------------- | ----------------------------------------------- |
| пусто                         | пустой `Payload`                                |
| `CfgGroup: CFG, CFG.SCLL: 3`  | карта (скобки у корневой карты можно не писать) |
| `{"CfgGroup":"CFG"}`          | JSON - тоже карта                               |
| `[1, 2]`, `12`, `"12"`, `abc` | массив, число 12, строка `12`, строка `abc`     |
| `h'0A 1B'`                    | байтовая строка CBOR (пробелы внутри можно)     |
| `0x0A1B`                      | эти байты как есть, это уже готовый CBOR        |

- Голые цифры вроде `10` - это число, а не байт `0x10`.
- Ошибка разбора называет причину и позицию: `ожидалась «,» или «]» (позиция 6)`.

<details>
<summary>Подробнее о разборе</summary>

- Поддерживается поток YAML: карты `{a: 1}`, массивы `[1, 2]`, строки в `"..."` (экранирование как в JSON) и `'...'` (кавычка удваивается), `null`/`~`, `true`/`false`, `.inf`/`.nan`, `ключ:` без значения - `null`.
- Ключ без кавычек читается по виду: `1: x` - ключ-число, `"1": x` - ключ-строка.
- Целое за пределами 2^53 уходит точно (uint64), дробное - кратчайшим float16/float32/float64 без потери значения.
- В JSON строка под ключом, который кончается на `BIN` (`FileBin`, `DataBIN`), - это Base64 байтов, как в пресетах команд.
- Нечётное число HEX-цифр в `h'..'` или `0x..` - ошибка.

</details>

</details>

#### 🌐 WebSocket

Облако, браузер и локальный веб-интерфейс ESP говорят через WebSocket. Сообщение здесь - конверт из двух полей: `HAR` (то же число, что на шине) и `VAL` (данные). Так устроены все соединения: браузер - облако, облако - устройство, веб-интерфейс - устройство.

- 🔢 Команда всегда числом `HAR`: заголовок, код из словаря и флаг ответа. Имён в конверте нет.
- 🆔 В запросе к устройству указан серийный номер устройства.
- 🧩 Можно обратиться к конкретному модулю на шине, устройство-хаб перешлёт запрос с тем же `HAR` без перевода. Так модуль получает и команды, которых хаб не знает.
- 🙋 Флаг ответа работает как на шине: запрос с флагом ждёт ответа, ответ и телеметрия идут без флага.
- 📝 Событие из ответа (код сообщения) облако сохраняет в журнал устройства.

<details>
<summary>📦 Конверт</summary>

```
запрос  {HAR, VAL: {DevSN, ModSN?, TrgBusID?, SrcBusID?, Payload?}}
ответ   {HAR, VAL: {DevSN, ModSN, Message, Args?, Payload}}
```

| Поле  | Тип    | Что это                                                                                            |
| ----- | ------ | -------------------------------------------------------------------------------------------------- |
| `HAR` | uint16 | Заголовок (биты 15-14), код аргумента (биты 13-1), флаг ответа (бит 0)                             |
| `VAL` | объект | Данные: адрес (`DevSN`, `ModSN`), `Payload`, у ответа `Message` (код) и `Args`, у облака свои поля |

| Заголовок | Код (биты 15-14) | Флаг ответа по умолчанию |
| --------- | ---------------- | ------------------------ |
| `GET`     | 0                | есть                     |
| `SET`     | 1                | есть                     |
| `OK!`     | 2                | нет                      |
| `ER!`     | 3                | нет                      |

- `DevSN` обязателен в запросе к устройству и должен совпасть с его серийным номером.
- `ModSN` - модуль, которому адресован запрос. Без него запрос идёт самому устройству.
- `Message` в ответе - код события из `messages.yaml`, `Args` - его параметры (раздел «Сообщения устройств»). DevCloud сохраняет сообщение с кодом не 0 в журнал устройства.
- Флаг ответа (бит 0): устройство отвечает только на запрос с флагом. Ответ, пуш и телеметрия - без флага.
- Сообщение без целого `HAR` 0..65535 или с `VAL` не объектом - не конверт, его отбрасывают.
- Код, которого нет в словаре получателя, не ошибка: имя для журнала - строка из числа (`"4097"`), сам код сохраняется.

В прошивке запрос принимает `API_Service_ReceiveWsPacket`, ответ собирает `API_Service_BeginResponse`. Ответ модуля с шины устройство-хаб заворачивает в конверт с тем же `HAR`. У `ER!` модуля хаб переносит `Message` и `Args` из `Payload` модуля в `VAL`.

</details>

<details>
<summary>🔁 Пример туда и обратно: GET ModCfg модулю за хабом</summary>

`ModCfg` = 36. Запрос с флагом ответа: `HAR = (0 << 14) | (36 << 1) | 1 = 0x0049` (73). Ответ `OK!` без флага: `HAR = (2 << 14) | (36 << 1) = 0x8048` (32840).

```
туда     {HAR: 73, VAL: {DevSN: "HUB-SN", ModSN: "MOD-SN", Payload: {}}}
на шине  [TrgBusID модуля, SrcBusID хаба, HAR 0x0049, {}, CRC16]
обратно  {HAR: 32840, VAL: {DevSN: "HUB-SN", ModSN: "MOD-SN", Message: 0, Payload: {...}}}
```

То же в коде:

```ts
import { encodeWsEnvelope, decodeWsEnvelope, valueToCbor, cborToValue } from "poe-svelte-ui-lib/protocols"

socket.send(valueToCbor(encodeWsEnvelope("GET", "ModCfg", { DevSN, ModSN, Payload: {} })))
/* { header: "OK!", argument: "ModCfg", code: 36, reply: false, VAL: {...} } или null */
const message = decodeWsEnvelope(cborToValue(new Uint8Array(event.data)))
```

</details>

<details>
<summary>🧰 Функции конверта</summary>

| Функция                                                                           | Что делает                                                                                                                                                        |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `encodeWsEnvelope(header, argument, VAL, reply?, dictionary?)`                    | Собирает `{HAR, VAL}`. `argument` - имя или код. `reply` по умолчанию: `GET`/`SET` - да, `OK!`/`ER!` - нет. Имя не из словаря или значение вне диапазона - ошибка |
| `decodeWsEnvelope(packet, dictionary?)`                                           | Разбирает `{HAR, VAL}` в `{ header, argument, code, reply, VAL }`, не конверт - `null`. Неизвестный код - `argument` строкой из числа                             |
| `encodeHar(header, argument, reply?, dictionary?)`, `decodeHar(har, dictionary?)` | То же для одного числа `HAR`, общие для шины, xPOE-Debug и WebSocket                                                                                              |

Связь `GUIRenderer` (`DeviceLink`) и `createFsTransfer` отдают приложению уже готовый `HAR`: `send(har, payload)`, а ответ ждут по коду аргумента: `waitFor(code, match, timeoutMs)`. Имена `Header`/`Argument` в `eventHandler` компонента - справка автора GUI, в провод они уходят числом.

</details>

<details>
<summary>🔐 Аутентификация устройства в облаке (TOFU)</summary>

Устройство подключается к облаку `wss://{SrvDomain}/ws?DevSN&DevName&DevFW` и публикует потоки в `wss://{SrvDomain}/ws-stream?DevSN&Key&role=publisher`. Доверие устанавливается при первом подключении: облако выдаёт устройству токен, дальше устройство предъявляет его при каждом подключении.

- Токен: 64 hex-символа (32 случайных байта). Облако хранит только его SHA-256 и признак «подтверждён».
- Устройство передаёт токен заголовком `Authorization: Bearer <токен>` в обоих подключениях. В query токен не кладётся.
- Выдача: если у устройства нет подтверждённого токена, облако принимает подключение и присылает новый токен в `SET JoinDev`, `Payload: {DevToken: "<токен>"}`. Устройство принимает `DevToken` только из облачного WebSocket, сохраняет его и переподключается.
- Подтверждение: первое подключение с верным токеном помечает его подтверждённым. После этого подключение без токена или с неверным токеном облако закрывает кодом `1008`.
- Прошивка без поддержки токена игнорирует `DevToken` и подключается без него. Облако её принимает, пока токен не подтверждён.
- Токен хранится в разделе NVS `config` отдельным ключом `DevToken`, вне групп `ModCfg`: его не отдаёт `GET ModCfg`, не меняют `SET ModCfg` и `DefCfg`. При стирании раздела (`RstNVS`, полный сброс настроек, восстановление после повреждения) токен сохраняется в памяти и записывается обратно.
- Если токен потерян (полное стирание флеша) или выдан чужому, администратор сбрасывает его в DevCloud; при следующем подключении устройство получит новый.
- Модули на шине (STM32) к облаку не подключаются, их представляет устройство-хаб.

</details>

#### 🔍 Пример: `GET ModCfg {}` из терминала

Терминал просит у модуля консоли его настройки. Весь запрос занимает 11 байт.

<details>
<summary>🔬 Разбор по байтам</summary>

```
9F  85  00  00  18 49  A0  19 66 06  FF
│   │   │   │   │      │   │         └ конец пакета
│   │   │   │   │      │   └ CRC16 = 0x6606
│   │   │   │   │      └ Payload = {}
│   │   │   │   └ HAR = 0x0049: GET, команда 36 (ModCfg), с ответом
│   │   │   └ SrcBusID = 0x0000, терминал
│   │   └ TrgBusID = 0x0000, модуль консоли
│   └ запись из пяти полей
└ начало пакета
```

</details>

#### 🧰 Функции

Одни и те же действия есть и в прошивке, и в библиотеке. Таблица помогает найти пару.

<details>
<summary>📋 Соответствие прошивки и библиотеки</summary>

| Что     | В прошивке (ESP и STM)                                                                                                                     | В `poe-svelte-ui-lib/protocols`                                                                                                |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| Пакет   | `CBOR_PktEncInit`, `CBOR_PktEncAddRaw`, `CBOR_PACK`, `CBOR_PktEncFinish`, `CBOR_PktDecInit`, `CBOR_PktDecNext`, поток `CBOR_PktStreamPush` | `encodePacket`, `decodePacket`, `createPacketStreamParser`, `encodePacketBytesPayload`                                         |
| HAR     | `har_t`, `HAR`, `HAR_NR`, коды `A_*` в `api_har.h` (имён в прошивке нет, лог печатает `HAR 0x%04X`)                                        | `makeHar`, `splitHar`, `encodeHar`, `decodeHar`, `createDictionary`, `HEADER_CODES`, `DEFAULT_ARGUMENT_CODES`                  |
| WS      | `API_Service_ReceiveWsPacket`, `API_Service_BeginResponse`, коды `MSG_*` в `api_msg.h`                                                     | `encodeWsEnvelope`, `decodeWsEnvelope`, `formatDeviceMessage`, `DEVICE_MESSAGES`, `MESSAGE_GROUPS`, `MESSAGE_CODES`            |
| Приём   | `API_Service_ReceiveBusPacket`, `API_Service_ReceiveWsPacket`, консоль в `system_console`                                                  | `createXPoeDebugParser`, `createCanParser`                                                                                     |
| Ответ   | `API_Service_BeginResponse`, `Writer_*`, `API_Service_FinishResponse`                                                                      |                                                                                                                                |
| Консоль | `LOG_*`, `LOG_HEX`, `LOG_PLOT`                                                                                                             | `encodeXPoeDebugFrame`, `xPoeDebugRow`, `xPoeDebugTableColumns`, `debugPlotValues`, `parseDebugLogMessage`, `xPoeDebugMessage` |
| CAN     | `can_service`                                                                                                                              | `encodeCanPacket`, `createCanParser`, `slcanOpenCommands`                                                                      |
| Тесты   | `tests/` прошивок                                                                                                                          | `npm run Test` сверяет байты с эталонами из прошивки                                                                           |

`xPoeDebugTableColumns` - колонки таблицы `Table`, поэтому он экспортируется из основной точки входа `poe-svelte-ui-lib`, а не из `poe-svelte-ui-lib/protocols`.

</details>

#### 💡 Полезно знать

- 🧭 Пара байт `0x9F 0x85` - примета начала пакета в любом потоке.
- 🔇 На телеметрию устройство не отвечает: у неё нет флага ответа.
- 📚 Новую команду сначала добавляют в `dictionaries/commands.yaml` библиотеки, новое сообщение - в `dictionaries/messages.yaml`, потом копируют в прошивки.
- 🛰️ Модули на шине к облаку сами не подключаются, их представляет устройство-хаб.

## Файл `src/lib/Select/README.md`

### 🔽 Select

Выбор одного значения из списка: режим работы, скорость порта, часовой пояс. Бывает выпадающим списком, рядом кнопок или полем с поиском.

#### 🎛️ Виды

- 📜 **Выпадающий список** - классика: нажали, выбрали.
- 🔲 **Ряд кнопок** - все варианты видны сразу. Удобен для 2-4 коротких вариантов. Только в нём можно выбрать несколько вариантов.
- 🔎 **Поле с поиском** - начните печатать, и в списке останутся подходящие варианты.
- 🔘 **Радиокнопки** - варианты в строку с кружками, выбор одного. Удобно в строке таблицы.

#### ✨ Что умеет

- 📥 Показывает текущее значение с устройства и меняет его.
- 📡 Варианты задаются в настройках или приходят с устройства, например список найденных WiFi-сетей.
- 🎨 Вариант может быть своего цвета, тогда цвет виден всегда, а выбранный отмечается рамкой.
- 🖼️ В ряду кнопок вариант может быть иконкой, а подпись всплывает подсказкой. Можно показать иконку и подпись рядом.
- 🏳️ В выпадающем списке у вариантов и выбранного значения тоже видны иконки, например флаги языков.
- 🧮 Умеет менять только часть битов в числе устройства.
- 🚫 Отдельный вариант или весь список можно сделать недоступным.
- ⌨️ Работает с клавиатуры: стрелки, Enter, Escape.

#### 🧩 Как настроить в конструкторе

1. Перетащите список на макет и выберите переменную устройства.
2. Выберите вид: выпадающий список, кнопки или поле с поиском.
3. Добавьте варианты: подпись, значение и при желании цвет.
4. Выберите тип значения: текст или число.
5. Если значение занимает только несколько битов числа, включите битовый режим и задайте диапазон битов.
6. Укажите аргумент команды, обычно `ModCfg`.

#### 💡 Полезно знать

- 📤 Выбранное значение сразу уходит на устройство.
- 📡 Если устройство прислало свой список вариантов, он заменяет варианты из настроек.
- ⌨️ В поле с поиском можно ввести своё значение, которого нет в списке, и оно тоже отправится.
- 📏 Выпадающий список открывается вверх, если внизу экрана не хватает места, и его не обрезают соседние панели.

<details>
<summary>📦 Что уходит на устройство</summary>

- Читает и пишет одну переменную с выбранным значением.
- Варианты задаются в настройках или приходят с устройства отдельной переменной `<имя>-S`. Так строится, например, список найденных WiFi-сетей. Список с устройства заменяет варианты из настроек.
- Отправка настраивается в событии: **Заголовок** `SET` и **Аргумент** (по умолчанию `ModCfg`). С `NoSend` значение сразу не уходит, его отправит другой компонент. В конструкторе аргумент - только имя из словаря команд или `NoSend`, до 31 знака.
- В битовом режиме меняются только биты с N по M (`range`), остальные биты переменной сохраняются.

| Ключ             | Описание                                                                                      |
| ---------------- | --------------------------------------------------------------------------------------------- |
| `<переменная>`   | Значение выбранного варианта (`value`). Для битового поля целое число, меняются биты с N по M |
| `<переменная>-S` | Необязательный список вариантов `[{ "id", "name", "value" }, ...]`                            |

</details>

<details>
<summary>🎨 Оформление подробно</summary>

| Вид (`type`) | Что это                                                                                                     |
| ------------ | ----------------------------------------------------------------------------------------------------------- |
| `select`     | Выпадающий список                                                                                           |
| `buttons`    | Ряд кнопок. Удобен для 2-4 коротких вариантов. Только он умеет выбирать несколько вариантов (`multiSelect`) |
| `input`      | Поле с поиском по названиям вариантов                                                                       |
| `radio`      | Радиокнопки в строку (переносятся, если не помещаются). Один выбранный вариант, стрелки выбирают соседний   |

- Выпадающий список выносится в `body`, поэтому его не обрезает прокрутка родителя. Закрывается кликом снаружи. Открывается вверх, если снизу места меньше, чем нужно, а сверху больше. Высота не больше `listHeight` и свободного места.
- `listHeight` понимает `rem` и `px`. Другое значение даёт 256 px.
- В виде `input` в списке остаются варианты, в названии которых есть введённый текст. `onInput` получает текст при каждом вводе. `onUpdate` вызывается при выборе варианта, Enter и уходе из поля. Текст, которого нет в списке, становится новым значением. Если у первого варианта числовое значение, введённое число отправляется числом.
- Клавиатура: стрелки открывают список и ходят по вариантам, Enter выбирает, Escape закрывает список.
- Если варианты `buttons` не помещаются по ширине, сначала у кнопок сжимаются отступы (с 12 до 4 px с каждой стороны), и только если подписи не помещаются и так, группа показывается выпадающим списком. Место появилось - снова кнопки. Решает самая широкая подпись: кнопки делят ширину поровну.
- В виде `buttons` вариант с `icon` показывает иконку, а `name` уходит в подсказку. Так узкие панели не обрезают подписи.
- В виде `buttons` вариант со своим цветом (`accent`) залит им всегда, а выбранный отмечается рамкой. Так сделана палитра цветов в панелях свойств.
- `fitContent` делает кнопки одинаковыми по самой длинной подписи, без переноса текста. Подходит для шапок и переключателей режима.
- `bitMode` и `range` нужны только панели свойств и облаку, сам `Select` их не читает.

</details>

<details>
<summary>🔘 Радиокнопки и значки</summary>

- `type="radio"`: кружок 18px и точка 10px стоят по центру сетки, контур рисуется внутренней обводкой и не сдвигает точку, поэтому она ровно в центре при любом масштабе экрана. Группа `role="radiogroup"`, у варианта `role="radio"` и `aria-checked`. Табуляция попадает только на выбранный вариант, стрелки выбирают соседний доступный. `multiSelect` не работает.
- Цвет варианта (`accent`) красит его кружок, `disabled` варианта и всей группы работает как у кнопок.
- `option.icon` бывает SVG-строкой (очищается `sanitizeHtml`), Svelte-компонентом или короткой меткой.

</details>

<details>
<summary>⚙️ Пропсы</summary>

| Название                         | Тип                                           | По умолчанию | Описание                                                                                                           |
| -------------------------------- | --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------ |
| `id`                             | `string`                                      |              | Переменная устройства. Компонент её не использует                                                                  |
| `type`                           | `"select" \| "buttons" \| "input" \| "radio"` | `"select"`   | Вид                                                                                                                |
| `options`                        | `IOption[]`                                   | `[]`         | Варианты                                                                                                           |
| `value`                          | `T \| T[] \| null`                            |              | Значение выбранного варианта (`option.value`), массив значений при `multiSelect`. Можно связать через `bind:value` |
| `multiSelect`                    | `boolean`                                     | `false`      | Несколько вариантов, только для `buttons`                                                                          |
| `fitContent`                     | `boolean`                                     | `false`      | Кнопки по ширине содержимого, только для `buttons`                                                                 |
| `showNames`                      | `boolean`                                     | `false`      | Только `buttons`: у вариантов со значком подпись рядом со значком, а не в подсказке                                |
| `listHeight`                     | `string`                                      | `"16rem"`    | Наибольшая высота списка для `select` и `input`                                                                    |
| `label.name`, `label.class`      | `string`                                      | `""`         | Заголовок и его классы                                                                                             |
| `help.info`                      | `string`                                      | `""`         | Пояснение: значок ⓘ после заголовка, текст всплывает при наведении. Без заголовка значок стоит на его месте        |
| `wrapperClass`, `componentClass` | `string`                                      | `""`         | Классы обёртки и поля                                                                                              |
| `disabled`                       | `boolean`                                     | `false`      | Неактивен                                                                                                          |
| `bitMode`                        | `boolean`                                     |              | Битовый режим, только для панели свойств и облака                                                                  |
| `range`                          | `{ start, end }`                              |              | Биты битового поля, только для панели свойств и облака                                                             |
| `onUpdate`                       | `(value: T \| T[]) => void`                   |              | Выбрано значение. Для `input` ещё Enter и уход из поля                                                             |
| `onInput`                        | `(text: string) => void`                      |              | Только `input`: текст при каждом вводе                                                                             |

Вариант `IOption`:

| Поле       | Тип                   | Описание                                                                                                                                                                                       |
| ---------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`       | `string`              | Ключ варианта, необязателен. Без него ключ - значение                                                                                                                                          |
| `value`    | любой                 | Значение, обязательно                                                                                                                                                                          |
| `name`     | `string`              | Подпись                                                                                                                                                                                        |
| `accent`   | `AccentColor`         | Цвет варианта. В `buttons` вариант залит им всегда                                                                                                                                             |
| `icon`     | `Component \| string` | Значок: Svelte-компонент, SVG или короткая метка вроде `"XL"`. В `buttons` вместо подписи (с `showNames` - рядом), в списке и у выбранного значения - перед подписью, у `radio` - после кружка |
| `disabled` | `boolean`             | Нельзя выбрать                                                                                                                                                                                 |

</details>

<details>
<summary>💻 Примеры кода</summary>

```svelte
<script>
  import * as UI from "poe-svelte-ui-lib"
  const modes = [
    { name: "Авто", value: 0 },
    { name: "Ручной", value: 1 },
  ]
  let mode = $state(0)
</script>

<UI.Select label={{ name: "Режим" }} options={modes} bind:value={mode} />

<UI.Select type="buttons" options={modes} bind:value={mode} />

<UI.Select type="input" label={{ name: "Часовой пояс" }} options={zones} value={zone} onUpdate={(v) => (zone = v)} />
```

</details>

<details>
<summary>🛠️ Панель свойств (SelectProps.svelte)</summary>

Панель для конструктора DevCloud.

- **Общее:** доступ, переменная, аргумент команды. Пустой аргумент сразу заменяется на `ModCfg`. Заголовок команды в панели не настраивается.
- **Значение:** вид, тип значения (текст или число). Смена типа переводит значения всех вариантов. В битовом режиме тип значения недоступен.
- **Внешний вид:** заголовок, его выравнивание, выравнивание содержимого, битовый режим. Для вида «кнопки» без битового режима - переключатель множественного выбора.
- **Битовый режим:** диапазон битов от 0 до 31. Значения вариантов ограничиваются числом `2^(end - start + 1) - 1`, при включении режима лишнее обрезается.
- **Варианты** в отдельном окне: подпись, значение, цвет. Новый вариант без цвета.
- При смене вида с «кнопок» на другой из нескольких выбранных остаётся первый.

| Пропс              | Тип                                | Описание                                              |
| ------------------ | ---------------------------------- | ----------------------------------------------------- |
| `component`        | `UIComponent<"Select">`            | Компонент и его свойства                              |
| `onPropertyChange` | `(change: PropertyChange) => void` | Сообщает об изменении: свойства, имя, доступ, событие |

</details>

## Файл `src/lib/Slider/README.md`

### 🎚️ Slider

Ползунок для числа или диапазона. Подходит для яркости, громкости или рабочего интервала температуры.

#### ✨ Что умеет

- 👆 Плавно выбирает число: тянете ползунок, отпускаете, и значение уходит на устройство.
- ↔️ Может работать как диапазон: два ползунка задают «от» и «до».
- ➕ Рядом с дорожкой есть счётчик с кнопками «минус» и «плюс» для точной подстройки на один шаг.
- 📏 Не даёт выйти за заданные пределы и ставит значение точно на шаг.
- 🎨 Дорожку и ползунок можно окрасить в цвет из палитры.
- 📱 Подстраивается под ширину контейнера.

#### 🧩 Как настроить в конструкторе

1. Перетащите ползунок на макет и подпишите его.
2. Выберите переменную устройства, которую он меняет.
3. Выберите вид: одно значение или диапазон.
4. Задайте минимум, максимум и шаг.
5. Укажите, какую команду отправлять: обычно `SET` и `ModCfg`.

#### 💡 Полезно знать

- ✋ В диапазоне тянуть можно только за сам ползунок. Нажатие по пустой дорожке ничего не двигает.
- 🔒 Два ползунка диапазона не сходятся ближе одного шага.
- 📨 Значение уходит, когда ползунок отпустили, а не во время перемещения.
- 🧺 Если значение не должно уходить сразу, его можно отправить позже другой кнопкой «Сохранить».
- ℹ️ Пояснение к заголовку (`help.info`) задаётся в «Тексты и переводы», строка «Справка · Подсказка». Значок ⓘ стоит сразу после заголовка, текст всплывает при наведении поверх страницы и не обрезается краем окна или блока. Без заголовка значок стоит на его месте.

<details>
<summary>📦 Данные устройства</summary>

- Читает и пишет одну переменную.
- Значение отправляется (`onUpdate`), когда ползунок отпущен, и при нажатии кнопок «минус» и «плюс». Во время перетаскивания вызывается только `onInput`.
- Отправка настраивается в событии: **Заголовок** (обычно `SET`) и **Аргумент** (обычно `ModCfg`). С `NoSend` значение сразу не уходит, его отправит другой компонент.

| Ключ           | Описание                               |
| -------------- | -------------------------------------- |
| `<переменная>` | Число. Для диапазона массив `[от, до]` |

</details>

<details>
<summary>🔬 Как устроено</summary>

- `type="range"` даёт два ползунка, значение тогда массив из двух чисел. Диапазоном слайдер становится и при `type="single"`, если в `value` пришёл массив из двух чисел.
- Значение не выходит за `minNum` и `maxNum` и округляется до шага `step` (на сетку `minNum + k * step`). Дробные значения округляются до одного или двух знаков.
- Если значения нет, ставится `minNum`, для диапазона `[minNum, maxNum]`.
- У диапазона оба ползунка лежат на одной дорожке во всю ширину. События ловит только сам ползунок, поэтому клик по пустой дорожке ничего не двигает.
- Кнопки «минус» и «плюс» неактивны на краях шкалы, а в диапазоне не дают ползункам сойтись.
- Ширина поля значения считается по числу цифр в `maxNum`.

</details>

<details>
<summary>🎨 Оформление подробно</summary>

- Цвет задаёт `accent`: им заливается дорожка и обводится ползунок. Без него используется акцент темы.
- Дорожка 6 px, ползунок 18 px, белый с обводкой 2 px цвета заливки.
- `disabled` делает слайдер полупрозрачным и неактивным.

</details>

<details>
<summary>⚙️ Пропсы</summary>

| Название                         | Тип                          | По умолчанию | Описание                                                                                                    |
| -------------------------------- | ---------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------- |
| `id`                             | `string`                     |              | Переменная устройства. Компонент её не использует                                                           |
| `type`                           | `"single" \| "range"`        | `"single"`   | Одно значение или диапазон                                                                                  |
| `value`                          | `number \| [number, number]` | `0`          | Значение. Можно связать через `bind:value`                                                                  |
| `number.minNum`, `number.maxNum` | `number`                     | `0`, `10`    | Пределы                                                                                                     |
| `number.step`                    | `number`                     | `1`          | Шаг, больше нуля                                                                                            |
| `label.name`, `label.class`      | `string`                     | `""`         | Заголовок и его классы                                                                                      |
| `help.info`                      | `string`                     | `""`         | Пояснение: значок ⓘ после заголовка, текст всплывает при наведении. Без заголовка значок стоит на его месте |
| `wrapperClass`                   | `string`                     | `""`         | Классы обёртки                                                                                              |
| `accent`                         | `AccentColor`                |              | Цвет дорожки и ползунка                                                                                     |
| `disabled`                       | `boolean`                    | `false`      | Неактивен                                                                                                   |
| `onUpdate`                       | `(value) => void`            |              | Значение принято: ползунок отпущен, нажата «минус» или «плюс»                                               |
| `onInput`                        | `(value) => void`            |              | Значение во время перетаскивания                                                                            |

</details>

<details>
<summary>💻 Примеры кода</summary>

```svelte
<script>
  import * as UI from "poe-svelte-ui-lib"
  let level = $state(50)
  let window = $state([18, 24])
</script>

<UI.Slider label={{ name: "Яркость" }} bind:value={level} number={{ minNum: 0, maxNum: 100, step: 5 }} />

<UI.Slider label={{ name: "Температура" }} type="range" bind:value={window} number={{ minNum: 0, maxNum: 40 }} />
```

</details>

<details>
<summary>🛠️ Панель свойств (SliderProps.svelte)</summary>

Панель для конструктора DevCloud. В ней задают доступ, переменную, событие отправки, вид, пределы и шаг, заголовок, его выравнивание и цвет. Серого цвета в палитре слайдера нет. При смене вида значение сбрасывается на `5` или `[2, 7]`.

| Пропс              | Тип                                | Описание                                              |
| ------------------ | ---------------------------------- | ----------------------------------------------------- |
| `component`        | `UIComponent<"Slider">`            | Компонент и его свойства                              |
| `onPropertyChange` | `(change: PropertyChange) => void` | Сообщает об изменении: свойства, имя, доступ, событие |

</details>

## Файл `src/lib/Switch/README.md`

### 🎚️ Switch

Переключатель «включено/выключено» для реле, режимов и флагов. Щёлкнули - устройство сразу получило новое значение.

#### ✨ Что умеет

- 🔛 Бывает горизонтальным тумблером, вертикальным тумблером или галочкой.
- 🏷️ Слева и справа от горизонтального тумблера можно подписать состояния, например «Выкл» и «Вкл». Подписи тоже нажимаются.
- 🔢 Умеет управлять отдельными битами одного числа: каждый тумблер отвечает за свой бит, до 32 штук.
- 🎨 Во включённом состоянии подсвечивается выбранным цветом.
- 💬 У галочки есть подсказка при наведении.
- 🚫 Можно сделать неактивным целиком или выключить отдельные тумблеры.

#### 🧩 Как настроить в конструкторе

1. Перетащите переключатель на макет и подпишите его.
2. Выберите переменную устройства и команду отправки, например `SET` и `ModCfg`.
3. Выберите вид: горизонтальный, вертикальный или галочка.
4. Если одно число хранит много флагов, включите битовый режим и добавьте тумблеры: у каждого короткое имя, номер бита и цвет.

#### 🔀 Режимы

- 🔘 **Обычный.** Один тумблер, значение 0 или 1.
- 🔢 **Битовый.** Несколько тумблеров, каждый переключает свой бит общего числа. Над каждым тумблером его короткое имя.
- ☑️ **Галочка.** Маленький квадратик с подписью рядом. Подписей по бокам нет, вместо них подсказка при наведении.

#### 💡 Полезно знать

- ⚡ Значение уходит на устройство сразу при переключении. Если в команде указано `NoSend`, оно не уходит само, его отправит другой компонент, например кнопка «Сохранить».
- ☑️ Галочка не работает в битовом режиме.
- 🏷️ Подписи по бокам бывают только у горизонтального тумблера в обычном режиме.
- 🔄 При включении или выключении битового режима значение сбрасывается в 0.

<details>
<summary>📦 Данные устройства</summary>

- Читает и пишет одну переменную.
- Значение отправляется сразу при переключении.
- Отправка настраивается в событии: **Заголовок** (обычно `SET`) и **Аргумент** (обычно `ModCfg`). С `NoSend` значение сразу не уходит, его отправит другой компонент.

| Ключ           | Описание                                                                                         |
| -------------- | ------------------------------------------------------------------------------------------------ |
| `<переменная>` | `0` или `1`. В битовом режиме целое число-маска, каждый переключатель управляет своим битом 0-31 |

</details>

<details>
<summary>🔀 Режимы подробно</summary>

- **Обычный режим.** Один тумблер, значение 0 или 1. `options` не нужны, цвет задаёт `accent`. Подписи `captionLeft` и `captionRight` есть только у горизонтального тумблера: левая ставит 0, правая ставит 1. Активная подпись выделяется цветом текста.
- **Битовый режим** (`bitMode`). Каждый вариант из `options` это свой тумблер со своим битом (`value` варианта это номер бита, 0-31). `name` варианта выводится над тумблером. Значение это маска из всех битов, до 32. Подписей по бокам нет. В вертикальном виде тумблеры переносятся на новую строку, если не помещаются.
- **Галочка** (`type="checkbox"`). Квадрат 20px со скруглением 6px, справа `label.name` (по нему тоже можно щёлкнуть). Подписей по бокам нет, вместо них подсказка `hiddenInfo` сверху при наведении. `options` можно не передавать. В битовом режиме галочки нет.
- Если `value` не задано (`undefined` или `null`), компонент ставит 0.

</details>

<details>
<summary>🎨 Оформление подробно</summary>

- Размер тумблера задаёт `height`. Длина дорожки равна `height * 1.7`, бегунок `height * 0.8`.
- Цвет включённой дорожки и галочки задаёт `accent`, в битовом режиме - `accent` варианта. Без цвета используется акцент темы. Выключенная дорожка серая (`--border-color`).
- Неактивный тумблер полупрозрачный, подписи цвета `--faint-color`.
- Заголовок по умолчанию по центру, `text-[12px]`, цвета `--muted-color`. `text-left` или `text-right` в `label.class` меняют выравнивание.

</details>

<details>
<summary>⚙️ Пропсы</summary>

| Название                                  | Тип                                        | По умолчанию   | Описание                                                                                                                                                                      |
| ----------------------------------------- | ------------------------------------------ | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                                      | `string`                                   |                | Переменная устройства. Компонент её не использует                                                                                                                             |
| `type`                                    | `"horizontal" \| "vertical" \| "checkbox"` | `"horizontal"` | Вид                                                                                                                                                                           |
| `value`                                   | `number`                                   |                | 0 или 1, в битовом режиме маска. Можно связать через `bind:value`                                                                                                             |
| `bitMode`                                 | `boolean`                                  | `false`        | Битовый режим                                                                                                                                                                 |
| `accent`                                  | `AccentColor`                              |                | Цвет включённого тумблера и галочки                                                                                                                                           |
| `options`                                 | `IOption<number>[]`                        | `[]`           | Только `bitMode`: биты. `name` подпись, `value` номер бита, `accent` цвет, `disabled`                                                                                         |
| `height`                                  | `string`                                   | `"1.625rem"`   | Высота тумблера                                                                                                                                                               |
| `label.name`, `label.class`               | `string`                                   | `""`           | Заголовок и его классы                                                                                                                                                        |
| `label.captionLeft`, `label.captionRight` | `string`                                   | `""`           | Подписи слева и справа                                                                                                                                                        |
| `help.info`                               | `string`                                   | `""`           | Пояснение: значок ⓘ после заголовка (у галочки - после подписи). Без заголовка - после правой подписи тумблера, а если её нет - на месте заголовка; у галочки - и без подписи |
| `hiddenInfo`                              | `string`                                   | `""`           | Подсказка для галочки                                                                                                                                                         |
| `wrapperClass`                            | `string`                                   | `""`           | Классы обёртки                                                                                                                                                                |
| `disabled`                                | `boolean`                                  | `false`        | Неактивен весь переключатель. Отдельный тумблер выключает `options[].disabled`                                                                                                |
| `onUpdate`                                | `(value: number) => void`                  |                | Значение изменилось                                                                                                                                                           |

</details>

<details>
<summary>💻 Примеры кода</summary>

```svelte
<script>
  import * as UI from "poe-svelte-ui-lib"
  let relay = $state(0)
  let flags = $state(0b101)
</script>

<UI.Switch label={{ name: "Реле 1", captionLeft: "Выкл", captionRight: "Вкл" }} accent="green" bind:value={relay} />

<UI.Switch
  label={{ name: "Каналы" }}
  bitMode
  options={[
    { name: "1", value: 0 },
    { name: "2", value: 1 },
    { name: "3", value: 2, accent: "red" },
  ]}
  bind:value={flags}
/>

<UI.Switch type="checkbox" label={{ name: "Запомнить" }} hiddenInfo="Сохранить вход" bind:value={relay} />
```

</details>

<details>
<summary>🛠️ Панель свойств (SwitchProps.svelte)</summary>

- В панели задают доступ, переменную, действие (`ModCfg` или `NoSend`); вид и неактивность; заголовок и его выравнивание, цвет (без серого и «нет цвета»), битовый режим. Неактивность и цвет в битовом режиме скрыты.
- Вид «галочка» недоступен, пока включён битовый режим, а переключатель битового режима скрыт для галочки.
- В битовом режиме открывается список битов: имя (до 4 символов), позиция (0-31), цвет, неактивность, удаление. Битов не больше 32, последний удалить нельзя. Новый бит получает следующий номер и цвет `blue`.

| Пропс              | Тип                                | Описание                                              |
| ------------------ | ---------------------------------- | ----------------------------------------------------- |
| `component`        | `UIComponent<"Switch">`            | Компонент и его свойства                              |
| `onPropertyChange` | `(change: PropertyChange) => void` | Сообщает об изменении: свойства, имя, доступ, событие |

</details>

## Файл `src/lib/Table/README.md`

### 📋 Table

Таблица со строками данных: файлы, журнал событий, параметры. В ячейках может быть текст, кнопка, выпадающий список, полоса прогресса или картинка.

#### ✨ Что умеет

- 📄 Показывает список строк, которые прислало устройство: одна строка на запись.
- 🔘 В ячейке может стоять кнопка: таблица сообщает приложению, какая кнопка нажата и в какой строке, команду отправляет приложение. При нажатии кнопка слегка сжимается и темнеет, как обычная `Button`.
- ⋯ В ячейке может стоять меню действий строки (кнопка «⋯» и пункты `Dropdown`), например «Изменить» и красное «Удалить».
- 🔽 Можно выбрать значение из списка прямо в ячейке.
- 📊 Число можно показать полосой прогресса с единицами измерения.
- 🖼️ В ячейке может быть картинка или иконка.
- ↕️ Сортирует строки по клику на стрелки в заголовке колонки.
- 📋 Копирует значение ячейки одной кнопкой.
- 🔍 Длинное значение открывается целиком в отдельном окне, а короткая подсказка всплывает при наведении.
- 📜 Работает как журнал: новые строки не заменяют старые, а дописываются, старые уходят, когда буфер заполнен.
- 🧹 В режиме журнала может показать кнопку очистки.
- ⏬ Умеет подгружать данные порциями, когда таблицу прокрутили до конца.

#### 🧩 Как настроить в конструкторе

1. Перетащите таблицу на макет и подпишите её.
2. Выберите переменную устройства, в которой лежит список строк.
3. Откройте настройку колонок и добавьте нужные: заголовок, ширину в процентах, выравнивание.
4. В каждую колонку добавьте содержимое: текст, список, кнопку или полосу прогресса, и укажите, из какого поля строки брать значение.
5. Для кнопки выберите иконку, цвет, команду и поля строки, которые нужно отправить.
6. Если нужен журнал, включите «Накопление данных». Тогда появятся размер буфера, число видимых строк, кнопка очистки и порядок строк: новые снизу или сверху.
7. При желании включите рамки между строками и колонками.

#### 💡 Полезно знать

- 📐 Ширины колонок в процентах должны в сумме давать 100, иначе поле ширины подсвечивается.
- 👀 Все ячейки, кроме кнопок, только показывают данные.
- 🛡️ Текст из данных выводится как обычный текст, разметка в нём не срабатывает.
- 🔤 Размер текста строк можно поменять сразу для всей таблицы.
- 🎨 Шапка окрашивается мягким оттенком цвета таблицы.
- ℹ️ Пояснение к заголовку (`help.info`) задаётся в «Тексты и переводы», строка «Справка · Подсказка». Значок ⓘ стоит сразу после заголовка, текст всплывает при наведении поверх страницы и не обрезается краем окна или блока. Без заголовка значок стоит на его месте.

<details>
<summary>📦 Данные устройства</summary>

- Читает одну переменную: массив объектов, по строке на объект. Пустые объекты `{}` не показываются (кроме режима журнала).
- Таблица сама ничего не отправляет. Кнопка со своим `onClick(row)` вызывает его, иначе таблица вызывает `onClick(row, button)`: строка с выбранными в списках значениями и описание кнопки. Пакет команды из `button.eventHandler` (поля строки по `Variables`, в панели это «Перечень ключей» через пробел) собирает приложение.

| Ключ           | Описание                                                                                 |
| -------------- | ---------------------------------------------------------------------------------------- |
| `<переменная>` | Массив `[{ "<ключ колонки>": значение, ... }, ...]`. Ключи колонок задаются в настройках |

</details>

<details>
<summary>📜 Журнал и подгрузка</summary>

**Журнал.** С `dataBuffer.stashData` таблица не берёт `body`, а копит строки, которые приложение добавляет методом `push(rows)` через `bind:this`. Строки лежат в кольцевом буфере размером `bufferSize`: старые вытесняются без копирования всего буфера, перерисовка - не чаще кадра экрана, сколько бы `push` ни пришло за это время. На скрытой вкладке строки копятся в буфере и появляются при возврате.

```svelte
<script>
  let log
  socket.onmessage = (e) => log.push(JSON.parse(e.data))
</script>

<UI.Table bind:this={log} {header} dataBuffer={{ stashData: true, bufferSize: 500, logger: true }} />
```

- `logger` пишет новые строки сверху.
- `autoscroll` держит таблицу прокрученной к последней строке, пока пользователь сам не отмотал её выше. В режиме `logger` не прокручивает.
- `visibleRows` - сколько строк видно без прокрутки. Высоту таблица считает по первым строкам.
- `clearButton` добавляет красную кнопку очистки в узкой колонке справа (`2.5rem`), она не перекрывает заголовки. Очистку можно вызвать и из кода: `clear()`.

**Подгрузка.** Если задан `cursor` и передан `loader`, при прокрутке почти до конца (последние 50 px) таблица вызывает `getData`. Если строк меньше высоты таблицы, она сама зовёт `getData`, пока не заполнится. Пока `loader()` возвращает `true`, повторных вызовов нет. `cursor = null` выключает подгрузку. Без `loader` подгрузка не работает.

</details>

<details>
<summary>🎨 Оформление подробно</summary>

- Фон шапки берётся из `--table-header-color`, по умолчанию мягкий акцент `--accent-soft`. Цвет таблицы задаёт `accent`, в смарт-виджете шапка окрашивается мягким оттенком мастер-цвета виджета.
- Заголовки колонок переводятся, если в них ключ перевода.
- Когда у строк появляется полоса прокрутки, шапка сдвигается на её ширину, и колонки совпадают.
- Размер текста строк задаёт переменная `--table-font-size` на любом родителе, по умолчанию `13px`.
- Ширину колонки в знаках моноширинного текста считает `tableMonoWidth(знаков, знаковПодписи?)` из `columnWidth.ts`. Колонка растёт вместе с размером шрифта и не бывает уже заголовка. Пример: `width: tableMonoWidth(6, 2)` для `0x0000`.
- Колонка с `width: "0%"` скрыта. Без `width` колонка занимает `minmax(0, 1fr)`.
- Колонки с выравниванием вправо показывают цифры одинаковой ширины.
- Если колонки не помещаются (заданные ширины и по 5rem на гибкие), таблица прокручивается вбок, а не обрезается.
- Текстовая ячейка выводит `render(row)`, без него - значение по `key`: массив вариантов `{ name, value }` списком `name`, другой объект - как JSON. Всё выводится как текст, HTML - только с `html: true`, данные тогда экранирует вызывающий. Ссылку задаёт `href(row)`: ячейка становится `<a>` с текстом внутри, HTML для этого не нужен. `
` в тексте переносит строку. Цвет из строки задаёт `accent(row)` (роль темы, как у компонентов), с `badge: true` текст стоит на мягкой подложке своего цвета; ячейка из одних бейджей ставит их вплотную с переносом. `onClick(row)` делает текст кнопкой (открыть папку и т.п.), сортировка по `key` при этом остаётся. Несколько элементов ячейки встают в ряд, со `stack: true` у колонки - столбиком.
- `modal: true` открывает по нажатию содержимое ячейки целиком: длинные строки переносятся, отступы сохраняются, кнопка в окне копирует текст. `modal` - сниппет `Snippet<[row]>`: в окне своё содержимое (без кнопки внизу), так устроено окно xPOE-Debug.
- `copy` и подсказка берут видимый текст ячейки (у HTML-ячейки без разметки).
- `outline` рисует рамки строк и колонок.
- Для сортировки у колонки должен быть ключ `key` у текстового содержимого с `sortable`. Числа и даты сравниваются как числа, строки - сначала по первому числу в них, потом по алфавиту. Колонку с `content`-функцией отсортировать нельзя.
- Кнопка в ячейке: с `bg-*` в `class` она залитая, без него или с `bg-transparent` - текст акцентного цвета.
- Полоса прогресса: число слева с `units`, полоса от `minNum` (по умолчанию 0) до `maxNum` (по умолчанию 100).
- Картинка по умолчанию `2rem` на `2rem`. Если `src` пуст, показывается `defaultIcon`. Для base64 задайте `src` функцией, например ``(row) => row.icon ? `data:image/png;base64,${row.icon}` : ""``.
- Выпадающий список ячейки закрывается при прокрутке и изменении размера окна.

</details>

<details>
<summary>⚙️ Пропсы</summary>

| Название                    | Тип                     | По умолчанию | Описание                                                                                                    |
| --------------------------- | ----------------------- | ------------ | ----------------------------------------------------------------------------------------------------------- |
| `label.name`, `label.class` | `string`                | `""`         | Заголовок и его классы                                                                                      |
| `help.info`                 | `string`                | `""`         | Пояснение: значок ⓘ после заголовка, текст всплывает при наведении. Без заголовка значок стоит на его месте |
| `wrapperClass`              | `string`                | `""`         | Классы обёртки                                                                                              |
| `accent`                    | `AccentColor`           | -            | Цвет шапки, фокуса и кнопок без своего цвета                                                                |
| `header`                    | `ITableHeader[]`        | `[]`         | Колонки                                                                                                     |
| `body`                      | `T[]`                   | `[]`         | Строки обычной таблицы                                                                                      |
| `footer`                    | `string`                | `""`         | Текст в нижней панели                                                                                       |
| `dataBuffer.stashData`      | `boolean`               | `false`      | Копить строки в буфере                                                                                      |
| `dataBuffer.bufferSize`     | `number`                | `10`         | Размер буфера                                                                                               |
| `dataBuffer.visibleRows`    | `number`                | `5`          | Сколько строк видно без прокрутки                                                                           |
| `dataBuffer.logger`         | `boolean`               | `false`      | Новые строки сверху                                                                                         |
| `dataBuffer.clearButton`    | `boolean`               | `false`      | Кнопка очистки                                                                                              |
| `dataBuffer.clearClass`     | `string`                | `""`         | Классы кнопки очистки                                                                                       |
| `outline`                   | `boolean`               | `false`      | Рамки строк и колонок                                                                                       |
| `autoscroll`                | `boolean`               | `false`      | Прокручивать к последней строке                                                                             |
| `cursor`                    | `string \| null`        | `null`       | Курсор подгрузки                                                                                            |
| `loader`                    | `() => boolean`         |              | Идёт ли загрузка                                                                                            |
| `getData`                   | `() => void`            |              | Загрузить следующую порцию                                                                                  |
| `onClick`                   | `(row, button) => void` |              | Нажата кнопка без своего `onClick`                                                                          |

Методы через `bind:this`: `push(rows)` - добавить строку или массив строк в журнал, `clear()` - очистить журнал.

##### Колонка `ITableHeader`

| Поле            | Тип                                           | Описание                                   |
| --------------- | --------------------------------------------- | ------------------------------------------ |
| `label`         | `{ name, class }`                             | Заголовок колонки                          |
| `width`         | `string`                                      | Ширина. `"0%"` скрывает колонку            |
| `align`         | `"left" \| "center" \| "right"`               | Выравнивание                               |
| `stack`         | `boolean`                                     | Элементы ячейки столбиком                  |
| `disableSelect` | `boolean`                                     | Запретить выделение текста                 |
| `content`       | `ITableContent[] \| (row) => ITableContent[]` | Что в ячейке: список или функция от строки |

##### Содержимое ячейки `ITableContent`

| `type`        | Поля `data`                                                                                                                                                                                                                                                                                                          |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `text`        | `key`, `render(row)`, `href(row)`, `html`, `sortable`, `truncated`, `tooltip` (`true` или функция от строки), `copy`, `modal` (`true` или сниппет), `accent(row)`, `badge`, `onClick(row)`                                                                                                                           |
| `button`      | `name`, `icon`, `title`, `class` (строки или функции от строки), `eventHandler`, `onClick(row)`, `hideIf: { key, value }` - не показывать в строке, где `row[key]` равно `value` (строками; в панели «Скрыть, если ключ»). У кнопки-иконки без `name` обязательно `title`. Весь `data` может быть функцией от строки |
| `select`      | `key` (массив вариантов в строке), `keyCol`, `onChange`                                                                                                                                                                                                                                                              |
| `menu`        | `items(row)` - пункты `Dropdown` для строки, `icon` (по умолчанию «⋯», `IconMore`), `title`. Только из кода приложения, в конструкторе нет; удаление - пункт с `accent: "red"`                                                                                                                                       |
| `progressBar` | `key`, `minNum`, `maxNum`, `units`                                                                                                                                                                                                                                                                                   |
| `image`       | `src` (строка или функция), `alt`, `class`, `width`, `height`, `defaultIcon`                                                                                                                                                                                                                                         |

Выпадающий список ячейки: `key` указывает на массив вариантов `{ id, name, value }` в строке, а выбранное значение - в поле с тем же именем без суффикса `-S` (`Mode-S` - варианты, `Mode` - значение). Выбор хранится в таблице поверх строки до следующего `body` и приходит в `onClick`. `keyCol` - ключ колонки с серийным номером модуля (пусто - серийный номер изделия), его читает облако, а не сама таблица.

</details>

<details>
<summary>💻 Примеры кода</summary>

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

Кнопка с командой из конструктора - пакет собирает приложение:

```svelte
<UI.Table {header} body={rows} onClick={(row, button) => button.eventHandler && send(button.eventHandler, pick(row, button.eventHandler.Variables))} />
```

Колонка, где ячейка показывает одно, а окно - другое:

```ts
{ type: "text", data: { key: "status", render: (row) => (row.online ? "🟢 в сети" : "⚪ нет связи"), modal: detailsSnippet } }
```

Колонки в `.ts` без разметки делают окно через `createRawSnippet` из `svelte`:

```ts
const canModal = createRawSnippet((row: () => CanRow) => ({ render: () => `<div class="whitespace-pre-wrap">${formatCanDataModal(row().data)}</div>` }))
{ type: "text", data: { key: "data", truncated: true, copy: true, modal: canModal } }
```

Готовые колонки отладочной таблицы xPOE лежат в `xPoeDebugColumns.ts` (`xPoeDebugTableColumns`), их используют облако и терминал: `TRG | SRC | КОМАНДА | VALUE | FHS`. Строки - `xPoeDebugRow` ядра протоколов.

- `КОМАНДА` - одна ячейка (`render` с `html: true`): заголовок цветной меткой (`GET` синий, `SET` оранжевый, `OK!` зелёный, `ER!` красный, `⚠️` - неверная CRC - жёлтый, `RAW` и прочие серые), рядом аргумент. Ниже мелко - `message`, сообщение устройства цветом `level` (`error` красный, `warn` жёлтый, `info` приглушённый), не больше двух строк. Подсказка при наведении - `HAR 0x....`, флаг ответа (`reply`), неверная CRC и сообщение целиком. Ширина постоянная, `tableMonoWidth(21, 7)`.
- `VALUE` - `value`, Payload кратко как пришёл, в стиле YAML (`CFG.WiFiMode: 1, List: [1, 2]`, байты `h'0C73'`), без пояснений: копируется чистым и вставляется в поле Value тем же CBOR. Окно строки показывает Payload блочным YAML с отступом 2. `payload` - декодированный один раз при разборе, `valueBytes` - исходные байты.
- Окно строки (`XPoeDebugModal.svelte`) показывает Payload развёрнуто в цветах темы, сообщение (`Message`, если есть) и HEX, у каждого раздела своя кнопка копирования.

</details>

<details>
<summary>🛠️ Панель свойств (TableProps.svelte)</summary>

Панель для конструктора DevCloud, импорт из `poe-svelte-ui-lib/constructor`.

- **Общее:** доступ, переменная, «Накопление данных». При включённом накоплении - кнопка очистки и порядок новых строк (снизу или сверху). Выключение накопления сбрасывает кнопку очистки и порядок.
- **Внешний вид:** цвет (`accent`), рамки, размер буфера (10, 50, 100, 500 или 1000) при включённом накоплении.
- **Содержимое:** заголовок, его выравнивание, число видимых строк (5, 10 или 20) при включённом накоплении.
- **Колонки** в отдельном окне: добавить, перетащить, удалить. У колонки ширина в процентах, выравнивание и содержимое. Новая колонка получает ширину `10%` и текстовое содержимое.
- Типы содержимого: текст, список, кнопка, полоса прогресса, картинка (иконка по умолчанию, классы, ширина и высота).
- У текста настраиваются ключ и опции «сортировка», «копирование», «обрезка», «подсказка», «окно полного значения».
- У списка - ключ и «Ключ строки» (`keyCol`).
- У кнопки - иконка, цвет, заголовок и аргумент команды, перечень ключей строки. Новая кнопка: `bg-blue`, `SET`, `ModCfg`. Повторный выбор того же цвета делает кнопку прозрачной.
- У полосы прогресса - ключ, минимум, максимум, единицы.

| Пропс              | Тип                                | Описание                                              |
| ------------------ | ---------------------------------- | ----------------------------------------------------- |
| `component`        | `UIComponent<"Table">`             | Компонент и его свойства                              |
| `onPropertyChange` | `(change: PropertyChange) => void` | Сообщает об изменении: свойства, имя, доступ, событие |

</details>

## Файл `src/lib/Tabs/README.md`

### 🗂️ Tabs

Вкладки. Помогают разложить много компонентов по нескольким страницам в одном месте, чтобы экран не был перегружен.

#### ✨ Что умеет

- 📑 Делит область на страницы: сверху полоса вкладок, ниже содержимое выбранной.
- 🧱 У каждой вкладки своя сетка, на которую кладут компоненты.
- 🖼️ У вкладки может быть подпись, иконка или и то и другое. Иконку можно поставить слева, сверху, справа или снизу от текста.
- ↔️ Вкладки бывают одинаковой ширины или по размеру подписи.
- 🎨 Выбранная вкладка подчёркнута линией акцентного цвета, а цвет можно сменить.
- 🚫 Отдельную вкладку можно сделать неактивной.
- ↕️ Вкладки могут стоять столбцом слева от содержимого. На узком месте они сами встают строкой сверху.

#### 🧩 Как настроить в конструкторе

1. Перетащите вкладки на макет.
2. Добавьте нужные вкладки, выберите им иконки и расставьте по порядку перетаскиванием.
3. Подписи вкладок задайте в «Тексты и переводы».
4. Выберите цвет, положение иконки и ширину вкладок: «Равные» или «Авто».
5. Выберите вкладку и кладите компоненты прямо на неё.

#### 💡 Полезно знать

- 🔌 Вкладки не связаны с устройством, они только раскладывают интерфейс.
- 🔟 Вкладок не больше десяти, последнюю удалить нельзя.
- 🚚 Когда вкладки переставляют или удаляют, их содержимое переезжает вместе с ними.
- ⚡ Рисуется только содержимое выбранной вкладки.

<details>
<summary>📦 Данные устройства</summary>

С устройством не связаны.

</details>

<details>
<summary>🔬 Как устроено</summary>

- У каждой вкладки своя сетка: `size.width` колонок и `size.height` строк (строки по высоте содержимого).
- Рисуется только содержимое выбранной вкладки.
- В конструкторе у каждой вкладки есть постоянный `id`. Если его нет, панель свойств сама его добавляет. По нему содержимое переезжает вместе с вкладкой, когда вкладки переставляют или удаляют.
- Полоса вкладок прилипает к верху и прокручивается вбок, если вкладки не помещаются.

Содержимое можно передать четырьмя способами (если переданы несколько, работает первый по списку):

1. список компонентов `apiArray` и сниппет `Content`, который получает все компоненты выбранной вкладки и сам их раскладывает. Его вывод занимает всю ширину сетки вкладки. Так делает `GUIRenderer`: содержимое вкладки идёт через ту же раскладку, что и у `Accordion`, поэтому на телефоне блоки встают по группам, а не сжимаются в одну колонку сетки `size.width`;
2. список компонентов `apiArray` и сниппет `Components`, который их рисует. Так делают конструктор и превью интерфейса. На вкладке показываются компоненты, у которых `id` оканчивается номером этой вкладки (с нуля). У id из конструктора (UUID без первого символа, 35 знаков, + номер) номер берётся после 35-го знака, поэтому цифра в конце UUID не мешает;
3. общий сниппет `children`, он получает текущую вкладку;
4. сниппет у каждой вкладки `items[].children`.

</details>

<details>
<summary>🎨 Оформление подробно</summary>

- Выбранная вкладка отмечается линией 2px цвета `--accent-text` и полужирным текстом. С `accent` её текст тоже цвета роли. Неактивная вкладка цвета `--faint-color`.
- `accent` перекрашивает акцент вкладок, как у смарт-виджетов. Цвет вкладок задаётся только им, `items[].class` - для расположения.
- Положение иконки относительно текста задаёт класс вкладки: `flex-row`, `flex-col`, `flex-row-reverse`, `flex-col-reverse`. При `flex-col*` и наличии иконок вкладки становятся высотой 80px.
- Класс `flex-1` растягивает вкладки поровну («Равные»), `w-auto` даёт ширину по содержимому («Авто»).
- `wrapperClass` задаёт и выравнивание полосы вкладок, например `justify-center`.
- Иконка 18px: Svelte-компонент или SVG-строка.
- `orientation="vertical"`: ширина столбца вкладок - по самой длинной подписи, но не больше `20rem` и 40% ширины компонента. Остальное место забирает содержимое. Подпись длиннее предела обрезается многоточием, целиком она видна в подсказке при наведении.

</details>

<details>
<summary>⚙️ Пропсы</summary>

| Название           | Тип                                 | По умолчанию   | Описание                                                                                                    |
| ------------------ | ----------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------- |
| `id`               | `string`                            |                | Идентификатор в конструкторе. Компонент его не использует                                                   |
| `items`            | `ITabItem[]`                        | две вкладки    | Вкладки                                                                                                     |
| `items[].id`       | `string`                            |                | Постоянный id вкладки                                                                                       |
| `items[].name`     | `string`                            |                | Подпись                                                                                                     |
| `items[].icon`     | `Component \| string`               |                | Иконка                                                                                                      |
| `items[].class`    | `string`                            |                | Классы вкладки: положение иконки и ширина                                                                   |
| `items[].children` | `Snippet`                           |                | Содержимое вкладки                                                                                          |
| `items[].onClick`  | `() => void`                        |                | Нажатие на вкладку                                                                                          |
| `items[].disabled` | `boolean`                           |                | Вкладка неактивна                                                                                           |
| `activeTab`        | `number`                            | `0`            | Номер выбранной вкладки. Можно связать через `bind:activeTab`                                               |
| `wrapperClass`     | `string`                            | `""`           | Классы полосы вкладок, например `justify-center`                                                            |
| `accent`           | `AccentColor`                       |                | Цвет выбранной вкладки. Без него - акцент темы                                                              |
| `orientation`      | `"horizontal" \| "vertical"`        | `"horizontal"` | `vertical` - вкладки столбцом слева, линия выбранной справа. Уже 448 px (`@md` контейнера) - строкой сверху |
| `size`             | `{ width, height }`                 | `12 × 6`       | Сетка содержимого: колонки и строки                                                                         |
| `children`         | `Snippet<[item]>`                   |                | Общее содержимое                                                                                            |
| `apiArray`         | `UIComponent[]`                     | `[]`           | Компоненты для `Content` или `Components`                                                                   |
| `Components`       | `Snippet<[component, fixedHeight]>` |                | Как рисовать компонент из `apiArray`                                                                        |
| `Content`          | `Snippet<[components]>`             |                | Как рисовать всё содержимое вкладки из `apiArray`                                                           |

</details>

<details>
<summary>💻 Примеры кода</summary>

```svelte
<script>
  import * as UI from "poe-svelte-ui-lib"
  let tab = $state(0)
</script>

<UI.Tabs items={[{ name: "Сеть" }, { name: "Система" }]} bind:activeTab={tab}>
  {#snippet children(item)}
    <p>{item.name}</p>
  {/snippet}
</UI.Tabs>
```

</details>

<details>
<summary>🛠️ Панель свойств (TabsProps.svelte)</summary>

- В панели задают доступ (без варианта «только просмотр»), тексты и переводы, цвет; положение иконки, ширину вкладок («Равные» или «Авто»).
- Список вкладок: перетаскивание, номер и подпись на текущем языке, иконка, «Отключить», удаление. Добавить можно, пока вкладок меньше десяти. Удалить можно, пока их больше одной.
- Положение иконки и ширина применяются сразу ко всем вкладкам.

| Пропс              | Тип                                | Описание                                              |
| ------------------ | ---------------------------------- | ----------------------------------------------------- |
| `component`        | `UIComponent<"Tabs">`              | Компонент и его свойства                              |
| `onPropertyChange` | `(change: PropertyChange) => void` | Сообщает об изменении: свойства, имя, доступ, событие |

</details>

## Файл `src/lib/TextField/README.md`

### 🔤 TextField

Надпись на экране: заголовок раздела, пояснение или подпись.

#### ✨ Что умеет

- ✍️ Показывает любой текст, с переводами на другие языки.
- 🔠 Пять размеров: от мелкой серой подписи до крупного заголовка.
- 🖌️ Текст бывает жирным, курсивом, подчёркнутым и цветным.
- 🟦 Может лежать на скруглённой подложке, как на карточке.
- ↔️ Выравнивается по левому краю, по центру, по правому краю или по ширине.

#### 🧩 Как настроить в конструкторе

1. Перетащите надпись на макет.
2. Введите текст в окне «Тексты и переводы».
3. Выберите размер, выравнивание и цвет.
4. Включите жирный, курсив, подчёркивание или подложку, если нужно.

#### 💡 Полезно знать

- 📌 Надпись статичная, значение с устройства она не показывает. Для этого возьмите поле ввода в режиме «только чтение» или виджет.
- 🔍 Самый мелкий размер всегда приглушённого цвета, он для пояснений.

<details>
<summary>📦 Данные устройства</summary>

С устройством не связан, это статичный текст.

</details>

<details>
<summary>🎨 Оформление подробно</summary>

- Размеры по шкале типографики темы:

| `content.size` | Размер | Особенности                       |
| -------------- | ------ | --------------------------------- |
| `small`        | 13 px  | Приглушённый цвет `--muted-color` |
| `base`         | 15 px  |                                   |
| `large`        | 24 px  | Полужирный, сжатый трекинг        |
| `huge`         | 34 px  | Полужирный, сжатый трекинг        |
| `massive`      | 44 px  | Жирный, сжатый трекинг            |

- Выравнивание наследуется от контейнера. Своё можно задать в `content.class`, например `text-center`.
- `background` рисует под текстом скруглённую подложку (радиус 14, тонкая рамка, фон `--back-color`).
- `underline` подчёркивает текст.
- Цвет текста задаёт `accent` (цвет текста роли `--accent-text`). Без него цвет обычный. Жирный и курсив панель кладёт в `content.class`.

</details>

<details>
<summary>⚙️ Пропсы</summary>

| Название        | Тип                                                   | По умолчанию | Описание                                                  |
| --------------- | ----------------------------------------------------- | ------------ | --------------------------------------------------------- |
| `id`            | `string`                                              |              | Идентификатор в конструкторе. Компонент его не использует |
| `content.name`  | `string`                                              | `""`         | Текст                                                     |
| `content.size`  | `"small" \| "base" \| "large" \| "huge" \| "massive"` | `"base"`     | Размер: 13, 15, 24, 34, 44 px                             |
| `content.class` | `string`                                              | `""`         | Классы текста                                             |
| `background`    | `boolean`                                             | `false`      | Подложка                                                  |
| `underline`     | `boolean`                                             | `false`      | Подчёркивание                                             |
| `wrapperClass`  | `string`                                              | `""`         | Классы обёртки                                            |
| `accent`        | `AccentColor`                                         |              | Цвет текста. Без него - обычный                           |

Колбэков нет.

</details>

<details>
<summary>💻 Примеры кода</summary>

```svelte
<UI.TextField content={{ name: "Настройки сети", size: "large" }} />
<UI.TextField content={{ name: "Изменения вступят в силу после перезагрузки", size: "small", class: "text-center" }} background />
```

</details>

<details>
<summary>🛠️ Панель свойств (TextFieldProps.svelte)</summary>

Панель для конструктора DevCloud. В ней задают доступ (без варианта «только просмотр»), текст в окне «Тексты и переводы», выравнивание, цвет текста, размер и оформление: жирный, курсив, подчёркивание, подложка. В панели есть и выбор переменной, но сама надпись значение переменной не показывает.

| Пропс              | Тип                                | Описание                                              |
| ------------------ | ---------------------------------- | ----------------------------------------------------- |
| `component`        | `UIComponent<"TextField">`         | Компонент и его свойства                              |
| `onPropertyChange` | `(change: PropertyChange) => void` | Сообщает об изменении: свойства, имя, доступ, событие |

</details>

## Файл `src/lib/VideoViewer/README.md`

### 📹 VideoViewer

Окно видео. Показывает картинку с камеры компьютера или телефона либо кадры, которые присылает устройство через облако.

#### ✨ Что умеет

- 🎥 Показывает живое видео с камеры этого компьютера или телефона.
- 📡 Показывает кадры с камеры устройства, например с модуля `Cam1`.
- 🔀 Если камер несколько, под видео появляется выбор камеры.
- ⏳ Пока видео нет, показывает понятный статус: подключение, нет связи или ошибка.
- 🔁 Если доступа к камере нет, выводит сообщение и кнопку «Повторить».
- 🎨 Цветная рамка вокруг кадра, если выбрать цвет.

#### 🧩 Как настроить в конструкторе

1. Перетащите окно видео на макет и подпишите его.
2. Выберите источник: камера компьютера или устройство.
3. Для устройства укажите ключ потока, например `Cam1`.
4. Решите, показывать ли выбор камеры, и при желании выберите цвет рамки.

#### 💡 Полезно знать

- 🔐 Для камеры компьютера браузер спросит разрешение. Без него видео не появится.
- 🖼️ Видео занимает всё окно и сохраняет пропорции, ничего не обрезается.
- 👀 Компонент только показывает. Он ничего не отправляет на устройство и не сохраняет запись.
- ℹ️ Пояснение к заголовку (`help.info`) задаётся в «Тексты и переводы», строка «Справка · Подсказка». Значок ⓘ стоит сразу после заголовка, текст всплывает при наведении поверх страницы и не обрезается краем окна или блока. Без заголовка значок стоит на его месте.

<details>
<summary>📦 Данные устройства</summary>

- **Камера** (`source="camera"`) - камера этого компьютера или телефона.
- **С устройства** (`source="remote"`) - кадры, которые устройство передаёт через облако по ключу потока.
- Ничего не отправляет и не сохраняет.

| Ключ            | Описание                               |
| --------------- | -------------------------------------- |
| `<ключ потока>` | Имя потока устройства, например `Cam1` |

</details>

<details>
<summary>🔬 Как устроено</summary>

- **Камера.** Запрашивается видео без звука, желательно 640 × 480, фронтальная камера (`facingMode: "user"`). По умолчанию запускается первая камера из списка. Список камер обновляется, когда камеру подключают или отключают (событие `devicechange`), без опроса по таймеру. Выбор камеры появляется, если камер больше одной и `showSelect` включён. Если доступа нет, поверх кадра показывается текст причины от браузера (`message` ошибки `getUserMedia`: доступ запрещён, камера занята другой программой и т.п.), а если браузер причину не дал - общий текст «Камера недоступна». Рядом кнопка «Повторить», она снова запрашивает разрешение.
- **С устройства.** Компонент сам соединений не открывает. Приложение получает кадры JPEG (например, по WebSocket `/ws-stream`) и передаёт в `frame`, а состояние соединения в `status`. `Uint8Array` оборачивается в `Blob` с типом `image/jpeg`. Пока кадров нет или соединение не `live`, поверх кадра виден индикатор: `connecting` - «подключение», `offline` - «нет связи», `error` - значок и текст ошибки.
- Видео и кадр вписываются с сохранением пропорций (`object-contain`).
- Поток камеры останавливается при размонтировании. Если окно убрали, пока браузер ещё выдаёт камеру (ждём `getUserMedia`), полученный поток сразу выключается, камера не остаётся гореть. То же с потоком, запрошенным до `stopStream()` или до выбора другой камеры. Ссылка на каждый кадр освобождается перед следующим, память не растёт.

</details>

<details>
<summary>🎨 Оформление подробно</summary>

- Цвет задаёт `accent`. Он рисуется кольцом вокруг кадра (`ring-2`, цвет `--accent-text` выбранной роли). Кольцо не меняет размеры окна. Без `accent` кольца нет.
- Фон под кадром и под индикатором `--container-color`, радиус 14.
- Выбор камеры занимает половину ширины окна.

</details>

<details>
<summary>⚙️ Пропсы</summary>

| Название                    | Тип                                              | По умолчанию | Описание                                                                                                    |
| --------------------------- | ------------------------------------------------ | ------------ | ----------------------------------------------------------------------------------------------------------- |
| `id`                        | `string`                                         |              | Идентификатор в конструкторе. Компонент его не использует                                                   |
| `source`                    | `"camera" \| "remote"`                           | `"camera"`   | Откуда картинка                                                                                             |
| `frame`                     | `Uint8Array \| Blob \| null`                     | `null`       | Последний кадр JPEG для `remote`                                                                            |
| `status`                    | `"connecting" \| "live" \| "offline" \| "error"` |              | Состояние соединения для `remote`                                                                           |
| `streamKey`                 | `string`                                         |              | Ключ потока. Нужен приложению, сам компонент его не читает                                                  |
| `showSelect`                | `boolean`                                        | `true`       | Показывать выбор камеры                                                                                     |
| `label.name`, `label.class` | `string`                                         | `""`         | Заголовок и его классы                                                                                      |
| `help.info`                 | `string`                                         | `""`         | Пояснение: значок ⓘ после заголовка, текст всплывает при наведении. Без заголовка значок стоит на его месте |
| `wrapperClass`              | `string`                                         | `""`         | Классы обёртки                                                                                              |
| `accent`                    | `AccentColor`                                    |              | Цвет кольца вокруг кадра. Без него кольца нет                                                               |

Колбэков нет. Для режима камеры через `bind:this` доступны методы:

| Метод                 | Что делает                                |
| --------------------- | ----------------------------------------- |
| `getDevices()`        | Возвращает список камер и обновляет выбор |
| `startStream(devId?)` | Запускает камеру, по умолчанию первую     |
| `stopStream()`        | Останавливает камеру                      |

</details>

<details>
<summary>💻 Примеры кода</summary>

```svelte
<UI.VideoViewer label={{ name: "Камера" }} />

<UI.VideoViewer label={{ name: "Cam1" }} source="remote" streamKey="Cam1" frame={lastFrame} status={streamStatus} />
```

</details>

<details>
<summary>🛠️ Панель свойств (VideoViewerProps.svelte)</summary>

Панель для конструктора DevCloud. В ней задают доступ, заголовок, источник (камера или устройство), показ выбора камеры и цвет. Поле ключа потока появляется только для источника «устройство».

| Пропс              | Тип                                | Описание                                              |
| ------------------ | ---------------------------------- | ----------------------------------------------------- |
| `component`        | `UIComponent<"VideoViewer">`       | Компонент и его свойства                              |
| `onPropertyChange` | `(change: PropertyChange) => void` | Сообщает об изменении: свойства, имя, доступ, событие |

</details>

## Файл `src/lib/Widget/README.md`

### 🎛️ Widget

Карточка одного значения: крупная цифра, иконка и управление. Например, скорость вентилятора с кнопками ± или уставка температуры со слайдером.

#### ✨ Что умеет

- 🔢 Крупно показывает текущее значение, а вверху - название, иконку и единицы.
- 🕹️ Управление бывает трёх видов: поле с кнопками ±, слайдер или переключатель «вкл/выкл».
- 🖼️ Иконка меняется вместе со значением: чем больше значение, тем «дальше» иконка из набора.
- 🌀 Иконки могут сменяться по кругу, и тем быстрее, чем больше значение. Так оживает, например, вентилятор.
- 🎨 Один цвет перекрашивает всю карточку: переключатель, слайдер, рамку поля и иконку.
- 👀 Можно оставить только показ, без управления.

#### 🧩 Как настроить в конструкторе

1. Перетащите карточку на макет и подпишите её.
2. Выберите переменную устройства и команду отправки, например `SET` и `ModCfg`.
3. Выберите иконки и включите анимацию, если нужно.
4. Выберите цвет и вид управления. Для поля и слайдера задайте минимум, максимум и шаг.

#### 💡 Полезно знать

- ⚡ Изменение уходит на устройство сразу. Если в команде указано `NoSend`, оно не уходит само, его отправит другой компонент.
- 🚧 Кнопки ± и слайдер не выпускают значение за пределы.
- 🔘 У переключателя значение только 0 или 1, а в центре карточки вместо цифры пишется «Off» или «On» (или свои подписи).
- ⌨️ Число можно набрать в поле вручную: оно отправится по Enter или когда вы уйдёте из поля, и тоже не выйдет за пределы.

<details>
<summary>📦 Данные устройства</summary>

- Читает и пишет одну переменную.
- Изменение отправляется сразу.
- Отправка настраивается в событии: **Заголовок** (обычно `SET`) и **Аргумент** (обычно `ModCfg`). С `NoSend` значение сразу не уходит, его отправит другой компонент.

| Ключ           | Описание                                  |
| -------------- | ----------------------------------------- |
| `<переменная>` | Число в пределах от минимума до максимума |

</details>

<details>
<summary>🔀 Управление подробно</summary>

Вид задаёт `settings.type`:

- `input` - поле с кнопками ±. Кнопки меняют значение на шаг и не выходят за `minNum` и `maxNum`. Ручной ввод в поле по `change` (Enter или уход из поля) зажимается в `minNum` и `maxNum` и вызывает `onUpdate`. Не число, например пустое поле, возвращает прежнее значение.
- `slider` - слайдер с кнопками ±. Во время перетаскивания вызывается `onInput`, когда бегунок отпущен - `onUpdate`. Кнопки блокируются на краях диапазона. Результат шага чистится от погрешностей дробей (до 1-2 знаков).
- `switch` - тумблер, значение 0 или 1. Подписи `settings.switch.captionLeft` и `captionRight` по бокам тоже нажимаются: левая ставит 0, правая ставит 1. В центре карточки показывается `captionLeft` при 0 и `captionRight` иначе, по умолчанию `Off` и `On`.
- Без `settings.type` в центре карточки показывается `Off` или `On`, блока управления нет. По умолчанию `type` не задан.
- `readonly`: у поля скрываются кнопки ±, само поле только для чтения. Тумблер, его подписи и слайдер становятся неактивными и полупрозрачными, `onUpdate` не вызывается.
- Если `value` не задано (`undefined` или `null`), берётся `minNum`.

</details>

<details>
<summary>🖼️ Иконки подробно</summary>

- Набор иконок `icons.array` распределяется по диапазону значения: чем больше значение, тем дальше иконка. Максимум диапазона всегда даёт последнюю иконку.
- У переключателя без анимации при 0 показывается первая иконка, иначе последняя.
- С `icons.cycling` иконки сменяются по кругу. Диапазон делится на 10 ступеней, период смены равен `700 / ступень` мс: чем больше значение, тем быстрее. На минимуме анимация стоит. У включённого переключателя скорость как у середины диапазона. Таймер останавливается при размонтировании.
- Иконка 20px в шапке. С `accent` она цвета текста роли (`--accent-text`), без него `--muted-color`.

</details>

<details>
<summary>🎨 Оформление подробно</summary>

- Цвет задаёт `accent`. Из него, как у смарт-виджетов, переопределяются `--accent-color` и связанные переменные карточки: перекрашиваются иконка, тумблер, слайдер и фокус поля.
- Карточка: шапка 44px с иконкой, названием и единицами `settings.number.units`, затем крупное значение, внизу блок управления на фоне `--container-color`. Кнопки ± 32px.
- `settings.label` - подпись над управлением, мелкими заглавными буквами.

</details>

<details>
<summary>⚙️ Пропсы</summary>

| Название                                      | Тип                               | По умолчанию    | Описание                                           |
| --------------------------------------------- | --------------------------------- | --------------- | -------------------------------------------------- |
| `id`                                          | `string`                          |                 | Переменная устройства. Компонент её не использует  |
| `value`                                       | `number`                          | `0`             | Значение. Для `switch` 0 или 1. Можно `bind:value` |
| `label.name`, `label.class`                   | `string`                          | `""`            | Заголовок и его классы                             |
| `wrapperClass`                                | `string`                          |                 | Классы обёртки                                     |
| `accent`                                      | `AccentColor`                     |                 | Цвет: иконка, переключатель, слайдер, фокус поля   |
| `readonly`                                    | `boolean`                         | `false`         | Только показ                                       |
| `settings.type`                               | `"input" \| "switch" \| "slider"` |                 | Вид управления. Без него блока управления нет      |
| `settings.label`                              | `string`                          | `""`            | Подпись над управлением                            |
| `settings.number.minNum`, `maxNum`            | `number`                          | `0`, `1000`     | Пределы                                            |
| `settings.number.step`                        | `number`                          | `1`             | Шаг                                                |
| `settings.number.units`                       | `string`                          |                 | Единицы в шапке карточки                           |
| `settings.switch.captionLeft`, `captionRight` | `string`                          | `"Off"`, `"On"` | Подписи переключателя                              |
| `icons.array`                                 | `string[]`                        | `[]`            | Иконки, SVG-строки                                 |
| `icons.cycling`                               | `boolean`                         | `true`          | Менять иконки по кругу                             |
| `onUpdate`                                    | `(value: number) => void`         |                 | Значение принято                                   |
| `onInput`                                     | `(value: number) => void`         |                 | Значение слайдера во время перетаскивания          |

</details>

<details>
<summary>💻 Примеры кода</summary>

```svelte
<UI.Widget
  label={{ name: "Вентилятор" }}
  bind:value={fan}
  accent="blue"
  settings={{ type: "slider", number: { minNum: 0, maxNum: 100, step: 5, units: "%" } }}
  icons={{ array: [IconFan], cycling: true }}
/>
```

</details>

<details>
<summary>🛠️ Панель свойств (WidgetProps.svelte)</summary>

- В панели задают доступ, переменную, действие (`ModCfg` или `NoSend`); заголовок, иконки из библиотеки, анимацию; цвет (без «нет цвета»), вид управления, для поля и слайдера - минимум, максимум и шаг.
- Единицы и подпись над управлением в панели не задаются.

| Пропс              | Тип                                | Описание                                              |
| ------------------ | ---------------------------------- | ----------------------------------------------------- |
| `component`        | `UIComponent<"Widget">`            | Компонент и его свойства                              |
| `onPropertyChange` | `(change: PropertyChange) => void` | Сообщает об изменении: свойства, имя, доступ, событие |

</details>

## Файл `src/lib/WidgetDeviceInfo/README.md`

### 🪪 WidgetDeviceInfo

Карточка «Об устройстве» - его паспорт и главные настройки. Здесь видно серийный номер и версию прошивки, можно поменять имя устройства, логин веб-интерфейса или уровень логов, перезагрузить устройство или сбросить его к заводским настройкам. Набор полей выбирается под устройство: у шлюза ESP одни поля, у модуля STM другие.

#### ✨ Что умеет

- 🏷️ Показывает паспорт устройства: серийный номер, код модели, адрес на шине, версию прошивки и сколько раз оно включалось.
- 🧩 Показывает только выбранные в конструкторе поля и сохраняет только их.
- 📋 Серийный номер стоит отдельной строкой целиком и копируется одной кнопкой.
- 🌐 Показывает текущие адреса устройства: в сети роутера и в его собственной точке доступа.
- ✏️ Позволяет поменять имя устройства, сетевое имя, логин с паролем веб-интерфейса и уровень логов консоли.
- 💾 Правки уходят на устройство одной кнопкой «Сохранить». Пока не сохранили, под кнопкой висит напоминание.
- 🔁 Кнопка «Перезагрузить» в шапке перезапускает устройство. Настройки при этом сохраняются.
- 🧨 «Сброс настроек» возвращает всё к заводскому, но только после подтверждения.
- 🔽 Сворачивается по клику на заголовок.
- ❓ Кнопка «?» в шапке включает подсказки к каждому полю.

#### 🧩 Как настроить в конструкторе

1. Перетащите виджет на макет. Привязывать поля не нужно: виджет сам знает, где лежат данные устройства.
2. Если нужно, задайте заголовок. Без него карточка называется «Об устройстве» на языке пользователя.
3. Выберите мастер-цвет: в него окрасятся значок и кнопка «Сохранить».
4. В группе «Поля» отметьте галочками, что показывать. У отмеченного поля рядом его ключ в прошивке, его меняют, только если в прошивке другое имя. По умолчанию набор шлюза ESP. Для модуля STM: `DevSN`, `DevBusID`, `DevFW`, `RunCnt`, `DevName`, `SCLL`.
5. Команды перезагрузки и сброса уже настроены под прошивку, менять их не нужно.

#### 💡 Полезно знать

- 🏷️ Имя устройства обязательно. Пока поле пустое, «Сохранить» неактивна и под ней красная подсказка «Укажите имя устройства»: без имени облако не примет подключение устройства.
- ⌨️ В поля имени и логина нельзя ввести лишние символы: они сразу вырезаются. Какие символы разрешены, написано в подсказках.
- 🔗 Сетевое имя вводится без «.local» - эту часть устройство добавляет само, и она показана рядом с полем.
- ⚡ Перезагрузка срабатывает сразу, без вопроса. Связь пропадёт на несколько секунд.
- 🧨 После сброса устройство перезагрузится, и связь по WiFi может пропасть.
- ✋ Пока у пользователя есть несохранённые правки, свежие данные с устройства их не затирают.
- 👀 Без `onSave` (наблюдатель, нет прав на запись) виджет только показывает данные: поля не правятся, пароль Web закрыт точками и без глазика.
- 📐 Виджет занимает всю ширину своей ячейки, а высота подстраивается под содержимое.

<details>
<summary>📦 Данные устройства</summary>

- Работает с полями группы `CFG`. Группу можно сменить префиксом в настройках.
- «Сохранить» отдаёт в `onSave` все поля, а приложение отправляет одним пакетом `SET ModCfg` только показанные редактируемые: из `DevName`, `HostName`, `WebUser`, `WebPsw`, `SCLL`. Скрытые поля не уходят: прошивка отвергает пакет с незнакомым ключом целиком (у STM нет `HostName`, `WebUser`, `WebPsw`).
- «Перезагрузить» отправляет `SET Restart`.
- «Сброс настроек» после подтверждения отправляет `SET RstNVS`. Прошивка стирает все настройки (WiFi, имя, пароль Web, настройки модулей) и перезагружается.
- Сам виджет с устройством не говорит. Читает и пишет поля приложение.

</details>

<details>
<summary>🔑 Ключи</summary>

| Ключ                | Описание                                                                                                                           |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `DevSN`             | Серийный номер, только чтение                                                                                                      |
| `DevID`             | Код изделия, только чтение                                                                                                         |
| `DevFW`             | Версия прошивки, только чтение                                                                                                     |
| `RunCnt`            | Сколько раз устройство включалось, только чтение                                                                                   |
| `DevBusID`          | Адрес на шине CAN или RS485, только чтение, показывается HEX из 4 знаков                                                           |
| `SCLL`              | Уровень логов консоли: 0 OFF, 1 ERROR, 2 WARNING, 3 INFO, 4 DEBUG. Графики PLOT уходят от уровня INFO                              |
| `StaIP`, `ApIP`     | Текущие адреса в сети роутера и своей точки доступа, только чтение. `0.0.0.0` в `StaIP` - к роутеру не подключено                  |
| `DevName`           | Имя устройства, обязательно: латиница, цифры, `_`, `-` и `.`, от 1 до 15 символов                                                  |
| `HostName`          | Сетевое имя без `.local`, домен добавляет устройство. Латиница, цифры, `_` и `-`, до 18 символов                                   |
| `WebUser`, `WebPsw` | Логин и пароль веб-интерфейса, до 15 символов. Логин: латиница, цифры, `_` и `-`. Пароль: любые печатные символы ASCII без пробела |

</details>

<details>
<summary>🔬 Как устроено</summary>

- **Набор полей.** `show` - список показываемых полей, без него `DEVICE_INFO_DEFAULT_FIELDS` (набор ESP). Пустые блоки (паспорт, настройки) и кнопка «Сохранить» без редактируемых полей не рисуются. Имя устройства обязательно, только если оно показано.
- **Паспорт.** Серийный номер длинный (например `00.00.000-00_0000AC670000B22B00007428:DBC5`), поэтому стоит своей строкой, не обрезается и имеет кнопку копирования. Ниже в ряд код изделия, адрес на шине, версия и счётчик запусков, затем два адреса.
- **Ограничения полей.** Длина задана `maxlength`. Недопустимые символы вырезаются при вводе, значение с устройства вне правила подсвечивается проверкой `regExp`. У имени устройства правило `/^[A-Za-z0-9_.-]+$/`, поэтому пустое имя тоже подсвечивается, а `save` его не отправляет: прошивка пустое имя принимает, облако отклоняет такое устройство при подключении.
- **Пароль Web** с `autocomplete="one-time-code"`, браузер не подставляет в него сохранённые логины.
- **Кнопка сброса** есть, только если передан `onFactoryReset`. Подтверждение открывается поверх карточки. Перезагрузка подтверждения не спрашивает.
- **Живые данные.** `value` это поток с устройства: поля только для чтения обновляются постоянно, а новое значение подхватывается, только если нет несохранённых правок.
- **Сворачивание.** Шапка сворачивает виджет. Свёрнутость по умолчанию задаётся в конструкторе (`collapsed`). С `persistKey` личный выбор пользователя запоминается в браузере и применяется сразу, без мигания. Если в GUI поменяли `collapsed`, прежний выбор сбрасывается.
- **Подсказки.** Кнопка «?» включает подсказки, по умолчанию они выключены. Выбор запоминается для каждого экземпляра по `persistKey`, без него он общий для всех виджетов этого типа.
- **Мастер-цвет.** `accent` перекрашивает весь виджет через `accentStyle`. Кнопки сброса остаются красными.
- **В `GUIRenderer`** `persistKey` равен `<persistKey рендерера>|id компонента`. В режиме только просмотра `onSave`, `onRestart` и `onFactoryReset` не передаются. Без `onSave` поля `DevName`, `HostName`, `WebUser` - `readonly`, а `WebPsw` выводится обычным полем с маской `••••••••` (пустой пароль - пустое поле), поэтому глазика нет. Сам пароль в браузер всё равно приходит, маска только не показывает его. В сетке виджет занимает одну строку, по умолчанию 8 клеток в ширину и не уже 6.

</details>

<details>
<summary>⚙️ Пропсы</summary>

| Название         | Тип                             | По умолчанию     | Описание                                                                                                                                     |
| ---------------- | ------------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`             | `string`                        | `"CFG"`          | Префикс группы полей                                                                                                                         |
| `keys`           | `Partial<Record<ключ, string>>` | имена ключей     | Другие имена полей                                                                                                                           |
| `show`           | `ключ[]`                        | набор ESP        | Какие поля показывать и сохранять                                                                                                            |
| `value`          | `IWidgetDeviceInfoConfig`       |                  | Текущие значения                                                                                                                             |
| `label.name`     | `string`                        |                  | Заголовок. Пусто - «Об устройстве» на языке пользователя                                                                                     |
| `wrapperClass`   | `string`                        | `""`             | Классы обёртки                                                                                                                               |
| `accent`         | `AccentColor`                   |                  | Мастер-цвет                                                                                                                                  |
| `restartCommand` | `{ header, argument }`          | `SET`, `Restart` | Команда перезагрузки                                                                                                                         |
| `resetCommand`   | `{ header, argument }`          | `SET`, `RstNVS`  | Команда сброса настроек                                                                                                                      |
| `collapsed`      | `boolean`                       | `false`          | Свёрнут ли. Можно связать через `bind:collapsed`                                                                                             |
| `persistKey`     | `string`                        |                  | Ключ для запоминания свёрнутости и подсказок                                                                                                 |
| `onSave`         | `(info) => void`                |                  | Нажата «Сохранить», в `info` все поля. Без него поля только для чтения, пароль маской. Без него или с пустым `DevName` «Сохранить» неактивна |
| `onRestart`      | `() => void`                    |                  | Нажата «Перезагрузить». Без него кнопка неактивна                                                                                            |
| `onFactoryReset` | `() => void`                    |                  | Сброс подтверждён. Без него кнопки сброса нет                                                                                                |

</details>

<details>
<summary>💻 Примеры кода</summary>

```svelte
<UI.WidgetDeviceInfo
  value={{
    DevSN: "00.00.000-00_0000AC670000B22B00007428:DBC5",
    DevID: "00.00.000-00",
    DevFW: 1,
    RunCnt: 128,
    DevName: "Kitchen",
    HostName: "kitchen",
    WebUser: "admin",
    WebPsw: "",
    StaIP: "192.168.1.40",
    ApIP: "192.168.4.1",
  }}
  onSave={(info) => sendModCfg(info)}
  onRestart={() => send("SET", "Restart")}
  onFactoryReset={() => send("SET", "RstNVS")}
/>
```

</details>

<details>
<summary>🛠️ Панель свойств (WidgetDeviceInfoProps.svelte)</summary>

Панель для конструктора DevCloud. Значения по умолчанию совпадают с прошивкой.

- **Общие:** заголовок и переводы, префикс группы, мастер-цвет.
- **Поля:** 12 строк. Галочка - поле показывается и сохраняется (`show`), рядом у отмеченного - ключ в прошивке (`keys`). У неотмеченных ключа нет, панель не загромождается.
- **Команда перезагрузки:** заголовок пакета и аргумент.
- **Команда сброса настроек:** заголовок пакета и аргумент.

| Пропс              | Тип                                | Описание                                              |
| ------------------ | ---------------------------------- | ----------------------------------------------------- |
| `component`        | `UIComponent<"WidgetDeviceInfo">`  | Компонент и его свойства                              |
| `onPropertyChange` | `(change: PropertyChange) => void` | Сообщает об изменении: свойства, имя, доступ, событие |

</details>

## Файл `src/lib/WidgetFileSystem/README.md`

### 🗂️ WidgetFileSystem

Карточка с файлами устройства. Видно, сколько памяти занято и какие файлы лежат, а любой файл можно скачать, удалить или закачать новый.

#### ✨ Что умеет

- 📊 Показывает, сколько памяти занято и сколько свободно: надпись «Занято X из Y», процент и полоска.
- 🚦 Процент становится оранжевым, когда память заполнена на 75%, и красным на 90%. Это сигнал, что скоро места не хватит.
- 📄 Выводит список файлов с путём и размером. Список можно отсортировать по пути, нажав на заголовок колонки.
- ⬇️ Скачивает файл с устройства на компьютер.
- 🗑️ Удаляет файл, но сначала переспрашивает прямо в карточке.
- ⬆️ Закачивает новый файл и показывает прогресс. Файл с тем же именем заменяется.
- 👀 Прогресс закачки видят все, кто сейчас открыл это устройство, даже с другого компьютера.
- 🔄 Кнопка «Обновить» заново запрашивает список файлов.
- 🔽 Сворачивается по клику на заголовок.
- ❓ Кнопка «?» в шапке включает подсказки к частям карточки.

#### 🧩 Как настроить в конструкторе

1. Перетащите виджет на макет. Привязывать переменные не нужно: он сам знает, с какими данными работать.
2. Если нужно, задайте свой заголовок. Без него карточка называется «Файловая система» на языке пользователя.
3. Выберите мастер-цвет: в него окрасятся значок, полоски и шапка таблицы.
4. Укажите, какие файлы можно выбирать для закачки, например только `.bin` и `.pem`.
5. Остальные настройки трогать не нужно, они уже совпадают с прошивкой.

#### 💡 Полезно знать

- ✏️ Имя файла проверяется ещё до отправки на устройство. По умолчанию оно не длиннее 31 байта UTF-8 (буква кириллицы занимает 2 байта) - это ограничение прошивки.
- ⏳ Пока идёт закачка, выбрать второй файл нельзя. Скачивать тоже можно только по одному файлу.
- ⚠️ Если закачка или скачивание сорвались, причина появится прямо под полем или под списком.
- 👁️ В режиме только для просмотра кнопок скачивания, удаления и закачки нет.
- 📐 Виджет занимает всю ширину своей ячейки, а высота подстраивается под содержимое.

<details>
<summary>📦 Данные устройства</summary>

- Виджет работает с одним объектом `CFG.FS`. Префикс группы (`CFG`) и имя поля (`FS`) меняются в настройках.
- «Обновить» отправляет `GET FS`.
- «Удалить» после подтверждения отправляет `SET FS` с `Op: Delete`.
- Закачка: `SET FS` с `Op` по очереди `UploadStart`, `UploadChunk`, `UploadDone`.
- Скачивание: `SET FS` с `Op` по очереди `DownloadStart`, `DownloadChunk`, `DownloadDone`.
- Сам виджет протоколы закачки и скачивания не ведёт: он только отдаёт приложению выбранный файл или имя и ждёт завершения.

</details>

<details>
<summary>🔑 Ключи</summary>

| Ключ                    | Описание                                                                                              |
| ----------------------- | ----------------------------------------------------------------------------------------------------- |
| `Total`, `Used`, `Free` | Объём, занято и свободно, байт. Если `Free` нет, он считается как `Total - Used`                      |
| `List`                  | Файлы `[{ "Name", "Size" }]`: полный путь и размер в байтах                                           |
| `Upload`                | Идущая закачка `{ "Name", "Size", "Progress" }`. Есть только во время закачки, `Progress` от 0 до 100 |

</details>

<details>
<summary>📡 Протокол устройства</summary>

Всё состояние файловой системы это один объект:

```
"CFG.FS": {
  "Total": 1441792, "Used": 98304, "Free": 1343488,
  "List": [{ "Name": "/storage/cert.pem", "Size": 1834 }],
  "Upload": { "Name": "fw.bin", "Size": 917504, "Progress": 35 }
}
```

Полный снимок со списком файлов приходит на `GET ModCfg`, `GET FS`, после удаления, после конца или ошибки закачки и в рассылке `OK! Update`. Во время закачки раз в 5% приходит только `{"Upload": {...}}` без списка. Снимок со списком заменяет состояние целиком.

Все команды идут с аргументом `FS`, операция в поле `Op`. Ответ тоже `FS` с тем же `Op`.

| Запрос                                                                               | Ответ                                                     |
| ------------------------------------------------------------------------------------ | --------------------------------------------------------- |
| `GET FS`                                                                             | Снимок `CFG.FS`                                           |
| `SET FS {"Op": "Delete", "Name": "/storage/a.bin"}`                                  | `Op` и снимок                                             |
| `SET FS {"Op": "UploadStart", "FileName", "FileExtension", "FileSize", "CurrentID"}` | `Op`, `CurrentID`, `ChunkSize`, `CFG.FS.Upload`           |
| `SET FS {"Op": "UploadChunk", "ChunkIndex", "Data", "CurrentID"}`                    | `Op`, `ChunkIndex`, `CurrentID`, раз в 5% `CFG.FS.Upload` |
| `SET FS {"Op": "UploadDone", "CRC32", "CurrentID"}`                                  | `Op`, `CurrentID`, снимок                                 |

Ошибка приходит как `ER! FS` с тем же `Op`, у закачки ещё и с `CurrentID`. Ошибка закачки несёт снимок.

</details>

<details>
<summary>🔬 Как устроено</summary>

- **Занятость.** «Занято X из Y», процент и полоса мастер-цвета. Процент оранжевый от 75%, красный от 90%. Размеры в Б, КБ и МБ, начиная с КБ одна цифра после запятой. Под полосой «Свободно» и число файлов.
- **Файлы.** Таблица «Путь, Размер, действия» высотой до `max-h-72`, дальше прокрутка. Длинный путь обрезается, по пути можно сортировать. Действия это значки с подсказкой: «Скачать» есть, только если передан `onDownload`, «Удалить» только с `onDelete`. Пустой список показывает «Файлов нет».
- **Удаление.** Подтверждение открывается поверх карточки, а не на весь экран, и показывает полный путь файла.
- **Закачка.** Блок есть, только если передан `onUpload`. Длину имени проверяет одно место - `createFsTransfer`, в байтах UTF-8 и до `UploadStart` (прошивка отвергла бы длинное имя уже после него). `GUIRenderer` создаёт передачу с `maxNameLength` из свойств виджета. Сам виджет имя не проверяет: на ошибку `FsNameError` из `onUpload` он показывает переведённое «Имя файла пустое или длиннее N байт». Приложение, которое передаёт свой `onUpload` без `createFsTransfer`, проверяет имя само. Поле выбора неактивно, пока идёт своя закачка или пока устройство сообщает `Upload` (закачка с другого клиента). Прогресс берётся из `value.Upload`, нечисловое значение считается 0.
- **Скачивание.** Одновременно идёт только одно, под таблицей видно «Скачивание: имя».
- Ошибку, брошенную из `onUpload` или `onDownload`, виджет показывает под полем или под таблицей. Ошибку `FsTransferError` (из `createFsTransfer`) он переводит по коду (`widget.fs.error.<code>`), у другой ошибки показывает `message`.
- Без `onRefresh` кнопка «Обновить» неактивна.
- **Сворачивание.** Шапка сворачивает виджет. Свёрнутость по умолчанию задаётся в конструкторе (`collapsed`). С `persistKey` личный выбор пользователя запоминается в браузере и применяется сразу, без мигания. Если в GUI поменяли `collapsed`, прежний выбор сбрасывается.
- **Подсказки.** Кнопка «?» включает подсказки, по умолчанию они выключены. Выбор запоминается для каждого экземпляра по `persistKey`, без него он общий для всех виджетов этого типа.
- **Мастер-цвет.** `accent` перекрашивает весь виджет через `accentStyle`.
- **В `GUIRenderer`** `persistKey` равен `<persistKey рендерера>|id компонента`. В режиме только просмотра `onDelete`, `onUpload` и `onDownload` не передаются. В сетке виджет занимает одну строку, растущую по содержимому, по умолчанию 10 клеток в ширину и не уже 6.

</details>

<details>
<summary>⚙️ Пропсы</summary>

| Название        | Тип                                     | По умолчанию | Описание                                                                              |
| --------------- | --------------------------------------- | ------------ | ------------------------------------------------------------------------------------- |
| `id`            | `string`                                | `"CFG"`      | Префикс группы. Используется приложением при чтении                                   |
| `keys.FS`       | `string`                                | `"FS"`       | Имя поля устройства                                                                   |
| `argument`      | `string`                                | `"FS"`       | Аргумент команд                                                                       |
| `value`         | `IWidgetFileSystemInfo`                 |              | Состояние `CFG.FS`                                                                    |
| `label.name`    | `string`                                |              | Заголовок. Пусто - «Файловая система» на языке пользователя                           |
| `wrapperClass`  | `string`                                | `""`         | Классы обёртки                                                                        |
| `accent`        | `AccentColor`                           |              | Мастер-цвет                                                                           |
| `accept`        | `string`                                | `"*/*"`      | Какие файлы можно выбрать, например `.bin,.pem`                                       |
| `maxNameLength` | `number`                                | `31`         | Наибольшая длина имени в байтах UTF-8: `GUIRenderer` передаёт её в `createFsTransfer` |
| `collapsed`     | `boolean`                               | `false`      | Свёрнут ли. Можно связать через `bind:collapsed`                                      |
| `persistKey`    | `string`                                |              | Ключ для запоминания свёрнутости и подсказок                                          |
| `onRefresh`     | `() => void`                            |              | Нажата «Обновить». Без него кнопка неактивна                                          |
| `onDelete`      | `(name) => void`                        |              | Удаление подтверждено. `name` полный путь                                             |
| `onUpload`      | `(file: File) => void \| Promise<void>` |              | Закачать выбранный файл                                                               |
| `onDownload`    | `(name) => void \| Promise<void>`       |              | Скачать файл и сохранить на компьютер                                                 |

</details>

<details>
<summary>💻 Примеры кода</summary>

```svelte
<UI.WidgetFileSystem
  value={fs}
  accept=".bin,.pem"
  onRefresh={() => send("GET", "FS")}
  onDelete={(name) => send("SET", "FS", { Op: "Delete", Name: name })}
  onUpload={(file) => uploadFile(file)}
  onDownload={(name) => downloadFile(name)}
/>
```

</details>

<details>
<summary>🛠️ Панель свойств (WidgetFileSystemProps.svelte)</summary>

Панель для конструктора DevCloud. Все значения по умолчанию совпадают с прошивкой.

- **Общие:** заголовок и переводы, префикс группы, мастер-цвет.
- **Закачка файлов:** допустимые файлы (`accept`), наибольшая длина имени (от 1 до 255, по умолчанию 31).
- **Устройство:** поле состояния ФС (`keys.FS`), аргумент команд (`argument`).

| Пропс              | Тип                                | Описание                                              |
| ------------------ | ---------------------------------- | ----------------------------------------------------- |
| `component`        | `UIComponent<"WidgetFileSystem">`  | Компонент и его свойства                              |
| `onPropertyChange` | `(change: PropertyChange) => void` | Сообщает об изменении: свойства, имя, доступ, событие |

</details>

## Файл `src/lib/WidgetLoRa/README.md`

### 📡 WidgetLoRa

Карточка настроек радио LoRa: частота, мощность, полоса, спред-фактор, скорость кодирования, преамбула, CRC и инверсия IQ. Виджет не привязан к микросхеме или драйверу: где каждый параметр лежит в прошивке, задаётся в конструкторе.

#### ✨ Что умеет

- 📻 Показывает и меняет параметры радио понятными значениями: частоту в МГц, мощность в дБм, полосу в кГц.
- 🧩 Показывает только выбранные параметры и отправляет только их.
- 🧱 Параметр может лежать в своём ключе или в битах общего слова. Чужие биты слова при сохранении не меняются.
- 📋 Готовые шаблоны драйверов заполняют всё сразу, дальше любое поле правится.
- 💾 Правки уходят на устройство одной кнопкой «Сохранить». Пока не сохранили, под кнопкой висит напоминание.
- 🔽 Сворачивается по клику на заголовок, кнопка «?» включает подсказки.

#### 🧩 Как настроить в конструкторе

1. Перетащите виджет на макет и задайте префикс группы, обычно `LORA`.
2. Выберите шаблон драйвера. Он заполнит, где лежит каждый параметр.
3. Если прошивка другая, поправьте параметры: галочка показывает параметр, рядом ключ, биты и коды.

#### 💡 Полезно знать

- 📡 У базы и всех её модулей радио должно быть настроено одинаково, иначе связь пропадёт. Меняйте настройки сначала у модулей, потом у базы.
- 🔢 Число в прошивке = значение × масштаб + смещение. Например, частота в Гц при показе в МГц - масштаб 1000000.
- 📝 Таблица кодов - пары `имя=код` через пробел, например `125=4 250=5 500=6`. С ней параметр выбирается из списка.

<details>
<summary>⚙️ Свойства и шаблоны</summary>

| Свойство         | Что это                                                                                                                            |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `id`             | Префикс группы, ключи на устройстве - `{id}.{key}`                                                                                 |
| `value`          | Значения ключей группы без префикса: `{ Cfg: 1820660393 }`                                                                         |
| `params`         | Параметры: `{ Freq: { key, bits?: { start, end }, scale?, offset?, min?, max?, step?, options? }, ... }`. Нет параметра - он скрыт |
| `preset`         | Шаблон, которым заполнены `params`, только для конструктора                                                                        |
| `onSave(values)` | Значения ключей для `SET ModCfg`: `{ Cfg: слово }`. Без колбэка - только просмотр                                                  |

Шаблоны (`LORA_PRESETS`):

- `HT_CT62` - общее слово драйвера HT_CT62 ProdFactory-ESP и `lora_service` ProdFactory-STM (STM32WL). Всё в слове `Cfg`: биты 2-6 мощность (дБм), 7-10 код полосы SX126x (4 = 125, 5 = 250, 6 = 500 кГц), 11-13 SF минус 5 (SF7-SF12), 14-15 CR минус 1 (0 = 4/5), 16 CRC, 17 инверсия IQ, 18-20 индекс длины преамбулы (6, 8, 10, 12, 16, 20, 24, 32), 21-30 частота в МГц. Биты 0-1 - режим работы драйвера, виджет их не трогает.

`loraDecode(params, value)` и `loraEncode(params, value, values)` из `lora.ts` - чтение и сборка слов без Svelte, их проверяет `tests/lora.test.mjs`.

</details>

## Файл `src/lib/WidgetMap/README.md`

### 🗺️ WidgetMap

Смарт-виджет «Карта»: показывает, где находятся ваши аппараты, куда они смотрят и как двигались. А ещё на ней можно спланировать полёт: проложить маршрут по точкам или построить миссию для агродрона, который сам облетит и опрыскает поля.

#### ✨ Что умеет

- 📍 Показывает несколько аппаратов сразу, каждый своим маркером с подписью.
- 🧭 Маркер поворачивается по курсу аппарата.
- 🐾 Рисует след - траекторию, по которой аппарат летел.
- 🟢 Сразу видно, кто на связи: живой маркер зелёный, замолчавший краснеет, а потом исчезает.
- 🎯 Может следить за аппаратом и держать его в центре карты.
- 🛫 Режим «Маршрут» - простой планировщик полёта по точкам с высотами и скоростями.
- 🌾 Режим «Агро» - строит миссию опрыскивания полей с обходом деревьев, опор и построек.
- 📤 Готовую миссию можно скачать, скопировать или отправить на дрон.
- 🎮 Есть имитация: карта оживает и без устройства.
- 🌗 Светлая или тёмная, вместе с темой страницы.

#### 🧭 Три режима

| Режим      | Для чего                                                                           |
| ---------- | ---------------------------------------------------------------------------------- |
| 📍 Объекты | Карта аппаратов в реальном времени: положение, курс и след. Режим по умолчанию     |
| 🛫 Маршрут | Планировщик полёта: точки по порядку облёта, у каждой своя высота и скорость       |
| 🌾 Агро    | Генератор миссии для агродрона: обводите поля и запретные зоны, карта строит облёт |

Аппараты с устройства видны во всех трёх режимах.

#### 🧩 Как настроить в конструкторе

1. Добавьте «Карту» из смарт-виджетов.
2. Выберите режим: «Объекты», «Маршрут» или «Агро».
3. Перечислите группы полей устройства через пробел, например `MAV GNSS`. Каждая группа - отдельный аппарат на карте. Привязывать переменные не нужно.
4. Выберите высоту карты (S, M, L, XL), цвет и иконку маркера, если нужно.
5. Остальное оператор включает прямо на карте: след, его длину и через сколько прятать молчащие аппараты.

#### 👀 Что видит оператор

- 🟢 **Свежесть.** Пока данные аппарата меняются, маркер зелёный. Перестали меняться - маркер красный. Ещё немного тишины - он скрывается до новых данных.
- 🐾 **След.** Новая точка следа появляется, только когда аппарат сдвинулся. Курс и высота могут меняться чаще.
- 🔍 **«Показать все»** в шапке вписывает в экран все видимые аппараты, а один аппарат - приближает. Сама карта вид не меняет, ведь аппаратов может быть много.
- 🃏 **Клик по маркеру** открывает карточку: имя, группа, координаты, высота, курс, спутники, серийный номер. В ней кнопки «Копировать» (всё в буфер обмена), «Следить» и «Скрыть» (до следующего обновления аппарата).
- 🎯 **Слежение.** Кнопка «Следить» залипает. Один аппарат всегда в центре карты. Несколько вписываются в карту при включении, дальше карта держит в центре их середину. Масштаб остаётся за оператором: карта сама отдаляется, только когда аппарат уходит за край. Под отслеживаемым маркером видна точка, даже при закрытой карточке. Если аппарат пропал, слежение продолжится, когда он появится снова. «Скрыть» снимает слежение.
- 🔢 **Шапка** показывает, сколько аппаратов на связи: зелёный - все, серый - часть, красный - ни одного.
- 🧭 **Только вид сверху.** Наклонить карту нельзя. Масштаб - колесом мыши или двумя пальцами, кнопок масштаба нет. Правая кнопка мыши только поворачивает карту, компас справа вверху возвращает её на север.

#### 💡 Полезно знать

- 🌐 Для карты нужен интернет. Без него видна заглушка «Карта не загружена».
- 📡 Карта только показывает и ничего не отправляет на устройство. Исключение - кнопка «Отправить» в режимах миссии.
- 🎨 Цвет виджета красит кнопки, линию маршрута, точки, точку взлёта, переходы и аппарат в имитации. Цвета со смыслом не меняются: поля зелёные, запретные зоны красные, развороты оранжевые, удаление и ошибки красные.
- 📐 Ширина карты равна ширине контейнера. В сетке конструктора виджет занимает одну строку.
- 📦 Сворачивание и кнопка «?» с подсказками работают как у других смарт-виджетов.
- 🤝 Имена полей общие с пилотажным дисплеем `WidgetPFD` и `WidgetDeviceInfo`: одна отправка телеметрии кормит все три.

<details>
<summary>📦 Данные устройства</summary>

- Работает с полями групп устройства, по группе на объект. По умолчанию `MAV`. Несколько групп пишут через пробел: `MAV GNSS`, например автопилот и собственный GNSS-приёмник модуля.
- Координаты приходят потоком телеметрии раз в 0.5-1 секунды, имя и серийный номер реже.
- Только показывает, ничего не отправляет.

**Как подключить**

1. **Прошивка** шлёт поля группы потоком телеметрии (`Telemetry_SendObject`, ключ `Data`). Облако и WebApp раскладывают их в переменные `<ModSN>|<группа>.<ключ>`. Имя и серийный номер шлют отдельным кадром раз в несколько секунд: буфер `Telemetry_SendObject` 512 байт, и строки в нём занимают много места.
2. **В конструкторе** добавьте «Карту» из смарт-виджетов и перечислите группы через пробел. Привязывать переменные не нужно.
3. **Оператор** на самой карте включает траекторию, выбирает число её точек и через сколько скрывать молчащие объекты.

```c
/* Группа MAV: те же ключи читает WidgetPFD */
const telemetry_kv_t mav[] = {
    TLM_F("MAV.Lat", lat_deg), TLM_F("MAV.Lon", lon_deg), TLM_F("MAV.Alt", alt_m),
    TLM_F("MAV.Heading", hdg_deg), TLM_F("MAV.Sat", (float) sats),
};
Telemetry_SendObject(g_telemetry_stream, g_mcfg.DevSN, "Data", mav, sizeof(mav) / sizeof(mav[0])); /* раз в 0.5 с */

/* Имя и серийный номер отдельным кадром раз в несколько секунд */
const telemetry_kv_t dev[] = {TLM_S("MAV.DevName", g_mcfg.DevName), TLM_S("MAV.DevSN", g_mcfg.DevSN)};
Telemetry_SendObject(g_telemetry_stream, g_mcfg.DevSN, "Data", dev, sizeof(dev) / sizeof(dev[0]));
```

`value` собирает `GUIRenderer`: для каждой группы читает переменные `<группа>.<ключ>` выбранного модуля.

</details>

<details>
<summary>🔑 Ключи</summary>

| Ключ         | Описание                                                                              |
| ------------ | ------------------------------------------------------------------------------------- |
| `Lat`, `Lon` | Широта и долгота, °. Обязательны. Если оба равны 0, фиксации нет и объект не рисуется |
| `Alt`        | Высота, м                                                                             |
| `Heading`    | Курс, 0-360°. Поворачивает маркер                                                     |
| `Sat`        | Число спутников                                                                       |
| `DevName`    | Имя объекта, подпись маркера. Без него подписью будет имя группы                      |
| `DevSN`      | Серийный номер                                                                        |
| `WPNum`      | Номер текущей команды миссии. Нужен только режимам «Маршрут» и «Агро» для прогресса   |

Имена ключей общие с `WidgetPFD` и `WidgetDeviceInfo`. Одна отправка телеметрии кормит и карту, и пилотажный дисплей. Другие имена полей задаются пропсом `keys`.

</details>

<details>
<summary>🔬 Как устроено: карта объектов</summary>

- Объект обновляется только при реальной смене значений (координаты, высота, курс, спутники, имя, серийный номер). Свежесть считается от последнего изменения, а не от перерисовки.
- **Свежесть.** Объект свежий, пока менялся в пределах `markerTimeout`. Ещё один `markerTimeout` он красный, дальше скрыт до новых данных. Траектория тоже зелёная или красная по свежести.
- **Траектория.** Точка добавляется только при смене `Lat`/`Lon`. Точки каждой группы лежат в кольцевом буфере на `trackLength` точек вне реактивности, объекты - неизменяемые записи в `$state.raw`: до 50 000 точек без глубоких прокси и копий на каждую точку. При уменьшении длины накопленный след подрезается. Цвет следа - метки темы `--green-mark` и `--red-mark` по свежести.
- **Панель оператора** поверх карты: флажок траектории, число точек траектории (100, 500, 1000, 5000, 10000, 50000) и таймаут маркера (30 с, 1, 3, 5, 10, 30 мин, 1 ч). Эти значения можно связать через `bind:`.
- **«Показать все».** Один объект - приближение к масштабу 16. Несколько - вписывание с полями 60 px, не ближе масштаба 16.
- **«Показать все» в «Маршруте» и «Агро»** вписывает весь маршрут или все поля, зоны и точку взлёта. Когда карта появляется (загрузка страницы, разворачивание виджета), она вписывается сама, без анимации.
- **Слежение.** Один объект центрируется плавно, за 300 мс. При смене набора отслеживаемых объектов карта вписывает их; дальше держит в центре середину, а если объекты не помещаются, отдаляется, не приближая.
- **Вид карты** (центр, масштаб, поворот) переживает сворачивание: карта открывается там, где её оставили.
- **Только 2D.** Наклон отключён (`maxPitch = 0`).
- **Тема.** Карта светлая или тёмная по ближайшему предку `.dark`/`.light` и переключается вместе с темой; тему и цвета слоёв все три режима берут из одного `themeState` (`mapTheme.svelte.ts`).
- **Библиотека карты.** MapLibre загружается один раз на страницу, по умолчанию с CDN. Без интернета (точка доступа устройства) свой модуль, CSS и стили подложки задаёт `configureMapLibre` до первой отрисовки карты:

```ts
import { configureMapLibre } from "poe-svelte-ui-lib"
configureMapLibre({ module: "/maplibre-gl.mjs", css: "/maplibre-gl.css", styles: { light: "/map-light.json", dark: "/map-dark.json" } })
/* или модуль из бандла: configureMapLibre({ module: () => import("maplibre-gl"), css: cssUrl }) */
```

С CDN без сети видна заглушка «Карта не загружена»; со своим модулем проверка сети не делается.

<details>
<summary>Версия MapLibre на CDN</summary>

С CDN грузится та же версия, что стоит в devDependency `maplibre-gl` (по ней проверяются типы): константа `MAPLIBRE_VERSION` в `mapWrapper/utils.ts`. После `npm run CheckUpdate` её поднимают вручную до установленной версии. Если забыть, тест `tests/maplibre.test.mjs` в `npm run prepack` упадёт и покажет, какую версию поставить.

</details>

- **Подложка.** Стили CARTO (Voyager для светлой темы, Dark Matter для тёмной) на данных OpenStreetMap. Указывать источник обязательно, подпись свёрнута в кнопку «i» в углу карты.
- Сворачивание, мастер-цвет и кнопка «?» с подсказками работают как у `WidgetWiFi`.
- Мастер-цвет (`accent`) красит весь виджет: кнопки, линию маршрута, точки, точку взлёта, переходы и аппарат в имитации. Цвета со смыслом не меняются: поля зелёные, запретные зоны красные, развороты оранжевые, «Очистить», удаление и ошибка отправки красные.

</details>

#### 🎮 Режим имитации

Включите имитацию, и карта оживёт без устройства.

- 📍 В «Объектах» над Минском летают тестовые аппараты. Одни выходят на связь, другие пропадают, поэтому видны все состояния маркера: свежий, красный, скрытый и снова появившийся.
- ✈️ В «Маршруте» и «Агро» аппарат пролетает построенную миссию. Полёт можно запустить, поставить на паузу, ускорить или промотать.
- 🔒 Пока имитация включена, данные устройства не учитываются, а остальные настройки в конструкторе недоступны.

<details>
<summary>🔬 Как устроено: имитация</summary>

**Режим «Объекты».** Модуль имитации (`simFleet.ts`) грузится динамически только при `isTest` и в бандл приложения без имитации не входит. `isTest` включает имитацию шести аппаратов `SIM-1`-`SIM-6` без устройства. Они летают над одним районом Минска, в пределах пары километров, и обновляются раз в полсекунды. На связи всегда три аппарата. Когда один из них пропадает, его сразу сменяет тот, кто молчит дольше всех. Первые смены происходят через 20-40, 45-65 и 70-90 секунд, дальше каждый вышедший на связь аппарат держится 40-100 секунд. Поэтому видно все состояния маркера: свежий, красный устаревший, скрытый и снова появившийся. При включении карта переходит к этому району. Пока режим включён, `value` и `groups` не учитываются. В конструкторе все остальные свойства становятся бледными и недоступными, пока имитацию не выключат.

**Режимы «Маршрут» и «Агро».** `isTest` включает имитацию полёта по рассчитанной траектории. Аппарат летит по маршруту со скоростями его точек или по проходам «Агро» и оставляет след цвета виджета. В «Агро» маркер - квадрокоптер, он зелёный, пока идёт распыление. Панель внизу карты по центру показывает время полёта, процент пройденного пути, высоту, скорость и распыление; там же запуск и пауза, ускорение ×1, ×5, ×10 или ×25 (по умолчанию ×5) и полоса прокрутки пути: её перетаскивание ставит полёт на паузу, чтобы рассмотреть любое место траектории. Полёт запускается вручную кнопкой ▶ и останавливается в конце пути; повторный запуск начинает его заново. Часы имитации (`mission/simClock.svelte.ts`) живут в самом режиме, а не в слое карты, поэтому при свёрнутой карте полёт продолжается, и процент в шапке растёт. При любом изменении маршрута или полей аппарат возвращается в начало и встаёт на паузу. Аппараты из `groups` в это время не рисуются.

</details>

#### 🛫 Режим «Маршрут»

Обычный планировщик полёта: ставите точки по порядку облёта, у каждой своя высота и скорость. Аппараты с устройства видны поверх маршрута, как в режиме «Объекты».

1. ✏️ **«Редактор точек»** на карте включает правку. Клик по карте добавляет точку в конец маршрута. Новая точка берёт высоту и скорость предыдущей, первая получает 30 м и 8 м/с. Esc или двойной клик заканчивают правку.
2. 🖱️ В режиме правки точки можно перетаскивать. Потяните за середину отрезка, чтобы вставить точку между соседними. Правый клик удаляет точку. Без правки на карте видны только номера точек, их не сдвинуть случайно. Точку взлёта `H` можно перетаскивать всегда.
3. 📋 Блок **«Итог»**: сверху расчёт (число точек, длина пути, время, наибольшая высота), ниже список точек с высотой, скоростью, расстоянием от предыдущей точки и удалением. Порядок меняется перетаскиванием строки за ручку, под списком флажок возврата с посадкой. Клик по номеру показывает точку на карте.
4. 📤 Готовую миссию можно скачать, скопировать или отправить на дрон.

<details>
<summary>🛠️ Миссия и план маршрута</summary>

Миссия в формате QGC WPL 110: точка дома, `NAV_TAKEOFF` на высоту первой точки, точки маршрута со своими высотами, `DO_CHANGE_SPEED` перед точкой, где меняется скорость, в конце `RTL`, если включён возврат. Высоты отсчитываются от точки взлёта.

Длина пути считается от точки взлёта через все точки (и обратно, если включён возврат), с учётом смены высоты. Время: каждый отрезок со скоростью своей точки плюс набор высоты и посадка около 2.5 м/с.

Порядок строк в списке меняется перетаскиванием за ручку, как в списках панелей свойств. Флажок под списком - возврат с посадкой (RTL).

План хранит владелец карты через `route` и `onRouteChange`. Без `route` показывается демо-облёт вокруг поля под Минском (`DEFAULT_ROUTE_PLAN`).

| Поле `IRoutePlan` | Описание                                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------------------ |
| `start`           | Точка взлёта, `[lng, lat]`                                                                                   |
| `points`          | Точки `{ point: [lng, lat], alt, speed }`: высота в метрах над точкой взлёта, скорость на пути к точке в м/с |
| `returnHome`      | Вернуться и сесть в конце (RTL)                                                                              |

</details>

##### 📊 Прогресс в шапке

Когда дрон летит по миссии, в шапке видна полоска и процент выполнения. В «Маршруте» рядом написано, к какой точке летит дрон, например «к точке 3/6» или «возврат», а в «Агро» - сколько гектаров уже обработано. В имитации полоска показывает ход имитации.

<details>
<summary>🔬 Как устроено: прогресс</summary>

В режиме имитации это прогресс имитации. Без имитации прогресс считается по телеметрии первой группы карты: `WPNum` (номер команды миссии, которую выполняет автопилот) и положение аппарата. Если текущая команда служебная (скорость, распылитель), целью считается следующая точка. Внутри отрезка учитывается, сколько аппарат уже пролетел к цели. Прогресс верен, только если на борту та же миссия, что построена на карте. Без `WPNum` полоски нет. Расчёт - `progress.ts`.

</details>

#### 🌾 Режим «Агро»

Карта превращается в генератор миссии для агродрона. Вы обводите на карте одно или несколько полей и места, где летать нельзя. Карта сама строит маршрут: покрывает поля полосами, облетает препятствия и выключает распылитель там, где он не нужен. Готовую миссию понимают Mission Planner, QGroundControl и автопилот ArduPilot.

Аппараты с устройства видны поверх миссии так же, как в режиме «Объекты»: маркер, карточка по клику и след, если он включён.

Пока ничего не нарисовано, на карте показаны три демо-поля под Минском с деревьями, опорой ЛЭП, постройкой и прудом. На них удобно посмотреть, как всё работает.

<details>
<summary>⚙️ План, демо и выдача миссии</summary>

`mode="agro"`. План хранит владелец карты через `plan` и `onPlanChange`, миссия уходит наружу через `onSend` в формате QGC WPL 110 для автопилота ArduPilot. Без `onSend` кнопка «Отправить» неактивна.

Без `plan` показываются три демо-поля под Минском (`DEFAULT_MISSION_PLAN`): большое сложной формы с прорезью и выступами, рощей, опорой ЛЭП и постройкой, среднее с выступами, крюком и прудом, малое с вырезом и деревом. Между полями стоит большая треугольная зона, внизу зона, которая задевает все три поля; перелёты их обходят. Ширина захвата по умолчанию 5 м, отступ от границ 2 м.

</details>

##### 🧑‍🌾 Как пользоваться

1. 🟩 **«Редактор полей»** на карте: кликами по карте обведите участок. Контур замыкается кликом по первой точке, двойным кликом, Enter или кнопкой «Замкнуть». Backspace убирает последнюю точку, Esc сбрасывает начатый контур. Следующий контур станет ещё одним полем.
2. 🟥 **«Редактор запретных зон»** на карте: обведите места, где нельзя лететь и распылять: деревья, опоры ЛЭП, постройки, водоёмы. Зон может быть сколько угодно. Зона может лежать внутри поля, выходить за его край или стоять вне полей. Из полосы распыления вырезается только часть зоны внутри поля, и площадь поля уменьшается только на эту часть.

   ⚠️ **Важно.** Перелёты от точки взлёта к полю, между полями и домой обходят все зоны, в том числе стоящие вне полей. Опоры ЛЭП, вышки, деревья и постройки на пути между полями обязательно обводите запретными зонами. Иначе аппарат полетит напрямую и может в них врезаться.

3. 🏠 **Точка взлёта** (цвета виджета) видна всегда, её можно перетащить в любой момент.
4. 🎚️ В блоке **«Маршрут и внесение»** задайте ширину захвата, отступ от границ, высоту, скорость, норму внесения и объём бака.
5. 🧮 **Направление полос.** Новое поле сразу получает хорошее направление. Кнопка «Авторасчёт» точно подбирает его для всех полей, пока крутится колесо ожидания с процентом. Ползунок «Угол для всех полей» ставит всем одно направление, например вдоль рядов посадки. Направление отдельного поля правится в его строке в блоке «Итог». Кнопка «i» рядом с «Авторасчётом» подробно объясняет, как идёт подбор.
6. 📋 Блок **«Итог»** показывает контуры, площадь к обработке, покрытие, длину пути, время, расход раствора и число дозаправок.
7. 📤 **«Скачать»**, **«Копировать»** или **«Отправить»** миссию.

✏️ Точки контуров видны и перетаскиваются, только пока включён «Редактор полей» или «Редактор запретных зон». Потяните за середину стороны, чтобы добавить точку. Правый клик удаляет точку. Поля и зоны удаляются крестиком в блоке «Итог». Там же видно, где какое поле или зона: при наведении на строку контур подсвечивается на карте, нажатие на название приближает к нему карту. Подписей на самой карте нет, маленькой зоне их некуда поставить. Редактор выключается той же кнопкой, кнопкой «Готово» или Esc.

<details>
<summary>🔬 Как устроено: «Авторасчёт»</summary>

У каждого поля свой угол проходов. Новое поле сразу получает лучший угол по быстрой оценке. «Авторасчёт» пересчитывает углы всех полей приближениями по полному расчёту траектории: шаг 5° по всем направлениям и вдоль сторон поля, затем 1° около трёх лучших, затем 0,1° около победителя. Лучший угол даёт наименьшую цену: время облёта плюс около 4 с на разворот плюс штраф за недолив, где метр недолитого прохода стоит как три метра полёта.

Пока идёт расчёт, на карте видно колесо ожидания «Расчёт оптимального маршрута» с полосой и процентом (на большом поле это несколько секунд). Кнопка «i» справа от «Авторасчёта» открывает подробное описание алгоритма: проходы, ячейки, порядок облёта, штрафы и поиск угла приближениями. Текст лежит в словаре под ключом `widget.mission.autoInfo`.

Подробности - в разделе «Как подбирается направление проходов» ниже.

</details>

##### 🧠 Как строится миссия

Дальше по шагам рассказано, как карта прокладывает маршрут и подбирает направление проходов. Каждый раздел начинается с сути простыми словами. В блоках «Как устроено» - алгоритмы и детали для тех, кому нужно разобраться глубже или доработать расчёт, их можно пропустить.

##### ⚡ Коротко

- 🚜 Каждое поле покрывается параллельными проходами, как трактор пашет поле: туда, разворот, обратно.
- ↔️ Проходы не подходят к краю поля и к запретным зонам ближе отступа.
- ✂️ Если зона разрезает поле, оно делится на части, и каждая часть облетается отдельно.
- 🔀 Части и поля облетаются в таком порядке, чтобы пустых перелётов было как можно меньше.
- 🌳 Развороты и перелёты огибают запретные зоны.
- 💧 Распылитель работает только на проходах. На разворотах и перелётах он выключен.
- 🧭 Направление проходов у каждого поля своё. Карта подбирает его сама, чтобы поле обрабатывалось быстрее и полнее.

Маршрут пересчитывается сразу, как только вы что-то меняете: двигаете точку, меняете ширину захвата или угол.

<details>
<summary>🔬 Как устроено</summary>

Весь расчёт идёт в браузере, без сервера, в `src/lib/WidgetMap/mission/coverage.ts`. Метод - покрытие проходами туда-обратно (boustrophedon) с разбиением поля на ячейки, порядком ячеек как задачей коммивояжёра и путями в обход препятствий по графу видимости. Полный пересчёт занимает доли секунды, поэтому пока точку тянут мышью, он не повторяется на каждое движение: считается план до начала перетаскивания, а после отпускания - новый (`MapAgro.svelte`).

</details>

##### 📝 Что вы задаёте

- 🟩 **Поля** - участки, которые нужно обработать.
- 🟥 **Запретные зоны** - места, где нельзя лететь и распылять: деревья, опоры ЛЭП, постройки, пруды.
- 🏠 **Точка взлёта** - откуда дрон начинает и куда возвращается.
- 📏 **Ширина захвата** - какую полосу дрон обрабатывает за один проход, в метрах.
- ↔️ **Отступ** - на сколько метров маршрут держится от края поля и от зон.
- 🧭 **Угол** - направление проходов. 0° - проходы идут с юга на север, 90° - с запада на восток.
- ✈️ **Высота и скорость** полёта.
- 🧪 **Норма внесения и объём бака** - нужны только чтобы посчитать, сколько раствора уйдёт и сколько раз придётся заправляться.

Зона мешает каждому полю, которое она задевает: лежит внутри, выходит за край или пересекает границу. Перелётам между полями мешают все зоны, даже стоящие в стороне от полей.

<details>
<summary>🔬 Как устроено</summary>

План - `IMissionPlan` в `plan.ts`: `fields` (контур `[lng, lat][]` и `angle`, градусы от севера по часовой), `holes`, `start`, `spacing`, `margin`, `alt`, `speed`, `returnHome`, `rate`, `tank`, `sprayControl`, `servoChannel`, `servoOn`, `servoOff`. Зоны поля отбирает `holesOf`: зона относится к полю, если вершина одного контура лежит внутри другого или их стороны пересекаются.

</details>

##### 🚜 Как прокладывается маршрут по полю

###### 📐 Перевод в метры и поворот

Карта работает с широтой и долготой, а расстояния нужны в метрах. Поэтому поле переводится на плоскость в метрах и поворачивается так, чтобы проходы шли слева направо. Для полей размером в несколько километров ошибка такого перевода незаметна. В конце точки маршрута переводятся обратно в координаты.

<details>
<summary>🔬 Как устроено</summary>

`makeProjection`: локальная равнопромежуточная проекция вокруг среднего арифметического вершин поля, 111 320 м на градус широты и 111 320 · cos(широты) на градус долготы. Затем поворот на угол поля: ось X идёт вдоль прохода, Y - поперёк. Все дальнейшие шаги работают в этой системе, где проходы - горизонтали `y = const`.

</details>

###### ➖ Проходы

Поле покрывается параллельными линиями.

- Первый и последний проходы отстоят от края поля на отступ.
- Остальные распределяются между ними поровну, с шагом не больше ширины захвата. Поэтому соседние полосы обычно чуть перекрываются, но пропусков между ними нет.

> 💡 Пример. Поле шириной 52 м, захват 5 м, отступ 2 м. Между крайними проходами остаётся 48 м. Получается 11 проходов с шагом 4,8 м: полосы перекрываются на 20 см.

<details>
<summary>🔬 Как устроено</summary>

`buildRows`: от `minY + margin` до `maxY - margin`, число проходов `ceil(размах / spacing) + 1`, шаг `размах / (число - 1)`. Если поле уже двух отступов, проход один, по середине.

</details>

###### ✅ Где проход можно лететь

Проход - это не тонкая линия, а полоса. Карта проверяет её целиком, на отступ в обе стороны от линии полёта. Если в эту полосу попадает край поля, угол зоны или её сторона, этот кусок прохода выбрасывается.

```
  край поля                                            край поля
  |  отступ  ════════════  отступ  ▓▓▓▓▓  отступ  ════════════  отступ  |
                                    зона
```

- Зона посреди поля разрезает проход на два куска.
- Вырез в краю поля делает проход короче.
- Совсем короткие куски, меньше четверти ширины захвата (но не меньше 1 м), не летаются: на них дрон больше потратит на разворот, чем обработает.

<details>
<summary>🔬 Как устроено</summary>

`FreeSpace.intervalsAt(y)`. На горизонтали пересечение с многоугольником ищется по правилу чёт-нечет (`ringIntervals`), зоны объединяются (`unionSets`) и вычитаются из поля (`subtractSets`). Чтобы полоса была свободна по всей ширине, это делается не на одной линии, а на наборе: края полосы `y ± margin`, её середина `y`, четверти `y ± margin / 2` и уровни всех вершин контуров, попавших в полосу (по ±ε от каждой). Результаты пересекаются (`intersectSets`): остаётся только то, что свободно на всех линиях сразу, поэтому угол зоны между линиями не проскочит. Затем концы отрезков укорачиваются на `margin`, и отбрасываются отрезки короче `max(1, spacing / 4)`.

</details>

###### 🧩 Части поля

Если зона разрезает проходы, поле делится на части. Внутри каждой части проходы идут подряд змейкой: один туда, следующий обратно.

```
  проход 6  ════════════════════════════      часть 4
  проход 5  ════════════════════════════      часть 4
  проход 4  ═════════   ▓▓▓▓   ═════════      слева часть 2, справа часть 3
  проход 3  ═════════   ▓▓▓▓   ═════════      слева часть 2, справа часть 3
  проход 2  ════════════════════════════      часть 1
  проход 1  ════════════════════════════      часть 1
```

Поле с одной зоной посередине - это четыре части: под зоной, слева от неё, справа и над ней.

Каждую часть можно начать с четырёх сторон: с нижнего или верхнего прохода, с левого или правого конца. От этого зависит, где дрон в неё войдёт и где выйдет.

<details>
<summary>🔬 Как устроено</summary>

Разбиение на ячейки, близкое к бустрофедонному разложению (`buildCells`). Проходы идут снизу вверх. Отрезок продолжает ячейку отрезка предыдущего прохода, только если они перекрываются по X один к одному: у нового ровно один перекрывающийся сосед снизу, а у того ровно один сосед сверху в текущем проходе. Иначе - разветвление или слияние, и начинается новая ячейка. Четыре варианта обхода ячейки (`Variant`: `fromTop`, `fromRight`) задают её вход и выход (`entryOf`, `exitOf`); внутри обход змейкой, направление чередуется по проходам (`cellPath`).

</details>

###### 🌳 Как дрон огибает зоны

Если между двумя точками маршрута стоит зона или выступ поля, дрон летит в обход:

- вокруг каждого угла поля и зоны, чуть дальше отступа, ставятся опорные точки;
- маршрут идёт по ним кратчайшим путём и нигде не подходит к границам ближе отступа.

Если точка взлёта стоит за пределами поля, край поля путь к нему не ограничивает, мешают только зоны.

Если обойти не получилось, например зоны перекрыли проход между ними, такой перелёт идёт по прямой, а в блоке «Итог» появляется красная строка «Недостижимо». Обычно это значит, что зоны стоят слишком плотно для заданного отступа.

<details>
<summary>🔬 Как устроено</summary>

Граф видимости (`Router`).

- **Узлы** (`FreeSpace.graphNodes`): каждая вершина поля сдвигается внутрь, каждая вершина зоны - наружу, по биссектрисе угла на `margin · 1,15 + 0,5 м` (не дальше четырёхкратного). Узлы, оказавшиеся ближе `0,98 · margin` к любой стороне, выбрасываются.
- **Рёбра**: пара узлов связана, если отрезок между ними лежит внутри поля (проверка по середине), вне зон и не ближе `0,98 · margin` ни к одной стороне (`segmentClear`). Стороны хранятся плоским массивом вместе с ограничивающими рамками, и стороны с далёкой рамкой не проверяются (`packEdges`, `edgesClear`): проверка вызывается сотни тысяч раз за расчёт.
- **Кратчайшие пути** между всеми парами узлов считаются один раз на поле алгоритмом Флойда-Уоршелла, с матрицей «следующий узел» для восстановления пути.
- **Запрос пути A → B** (`route`): если прямой отрезок свободен - он; иначе минимум по всем парам узлов «A видит i» + «путь i → j» + «j видит B». Видимость точки из узлов и готовые пути кэшируются: одна точка входа ячейки участвует в сотнях вариантов.
- Если A или B вне поля (точка взлёта), отрезки от неё проверяются только по зонам (`segmentClearOfHoles`).
- Путь не найден - длина бесконечна, при сборке маршрута это `unreachable`, а в стоимости порядка ячеек - `10⁹ + расстояние`.

</details>

###### 🔀 В каком порядке облетать части

Карта ищет порядок частей и сторону входа в каждую, при которых пустые перелёты между частями самые короткие. Длина перелёта считается по настоящему пути в обход зон, а не по прямой.

- **До 10 частей** карта перебирает все варианты и находит самый короткий.
- **Больше 10 частей** вариантов слишком много. Тогда карта каждый раз летит в ближайшую часть, а потом пробует переставить части местами и оставляет перестановки, которые укорачивают путь.

<details>
<summary>🔬 Как устроено</summary>

`orderCells` решает задачу коммивояжёра без возврата, где у каждой ячейки 4 варианта входа и выхода, а стоимость перехода - длина пути `Router` от выхода одной ячейки до входа другой (от точки взлёта до первой).

- **n ≤ 10** - точное решение динамикой Хелда-Карпа по подмножествам: состояние (маска посещённых ячеек, последняя ячейка, её вариант), `2ⁿ · n · 4` состояний. Матрица переходов `4n × 4n` считается заранее.
- **n > 10** - жадный выбор ближайшей ячейки в лучшем варианте, затем улучшение 2-opt: отрезок последовательности разворачивается, и каждая ячейка в нём переворачивается, чтобы вход и выход поменялись местами (`flip`: смена `fromTop`, а при нечётном числе проходов ещё и `fromRight`). Повторяется, пока есть улучшение, но не больше 50 кругов.

</details>

###### 🧱 Из чего состоит маршрут

| Участок     | Что это                                             | Распылитель |
| ----------- | --------------------------------------------------- | ----------- |
| 💧 Проход   | Полёт вдоль полосы                                  | включён     |
| ↩️ Разворот | Переход на соседний проход                          | выключен    |
| ✈️ Перелёт  | К первой части, между частями, между полями и домой | выключен    |

<details>
<summary>🔬 Как устроено</summary>

`planCoverage` проходит ячейки в найденном порядке и собирает сегменты `spray`, `turn` и `transit` (`ICoverageSegment`). Развороты и перелёты внутри поля тоже идут через `Router`, поэтому разворот может обогнуть зону. В результате (`ICoverageResult`) - сегменты, точки миссии, площадь, длины распыления, разворотов и перелётов, число проходов, ячеек, разворотов и недостижимых переходов.

</details>

##### 🗂️ Несколько полей

- Поля облетаются по очереди: от точки взлёта к ближайшему полю, от него к ближайшему из оставшихся и так далее.
- У каждого поля свой угол и свои зоны, маршрут по каждому строится отдельно, как описано выше.
- Перелёты к полю, между полями и домой огибают все зоны, в том числе стоящие вне полей.

⚠️ **Важно.** Опоры ЛЭП, вышки, деревья и постройки между полями обязательно обведите запретными зонами. Карта знает только о том, что нарисовано, и необведённое препятствие пролетит напрямую.

<details>
<summary>🔬 Как устроено</summary>

`planFields`. Порядок полей - жадный по ближайшему центру (среднее вершин), без оптимизации всего обхода. Каждое поле считается `planCoverage` со своим углом и `holesOf`, без привязки к точке взлёта (`linkStart: false`). Перелёты строит `routeOpen`: тот же граф видимости, но «полем» служит прямоугольник вокруг точек и всех зон с запасом `100 м + 2 · margin`, а препятствиями - все зоны.

</details>

##### 🧭 Как подбирается направление проходов

От направления проходов зависит очень многое: сколько будет проходов и разворотов, как далеко перелетать между частями и сколько поля останется необработанным у косых краёв.

###### ⚡ Сразу после того, как поле нарисовано

Как только вы замкнули контур, поле получает примерное направление: карта быстро прикидывает углы через 3°, а потом уточняет лучший через 0,5°. Маршрут появляется сразу. Сразу после этого запускается точный подбор.

<details>
<summary>🔬 Как устроено</summary>

`bestFieldAngle` → `optimizeAngle` → `estimateAngleCost`. Оценка без прокладки путей: длина всех отрезков проходов + `3 · spacing` за каждый отрезок (цена разворота) + `10 · spacing` за каждую ячейку (цена перелёта). Перебор 0-180° через 3°, затем ±3° вокруг лучшего через 0,5°, итог округляется до 0,5°.

</details>

###### 🎯 Кнопка «Авторасчёт»

«Авторасчёт» точно подбирает направление для всех полей по очереди. Угол каждого поля меняется, как только для него подбор закончен. Пока идёт расчёт, на карте крутится колесо ожидания с процентом.

Для каждого направления карта строит весь маршрут по полю и считает, сколько секунд он займёт:

- ⏱️ **время полёта** - весь путь, делённый на скорость;
- ↩️ **плюс 4 секунды на каждый разворот** - дрон тормозит и снова разгоняется;
- 🕳️ **плюс штраф за пропуски.** Если часть поля осталась необработанной, каждый недостающий метр прохода считается как три метра полёта: за пропуском пришлось бы возвращаться;
- 🚫 **направление, при котором часть поля недостижима,** сразу проигрывает.

Побеждает направление с самым маленьким временем.

Маленький поворот может резко поменять результат: на полградуса больше - и появился или пропал целый проход. Поэтому направление ищется в три захода, каждый раз точнее:

1. Все направления через 5° и направления каждой стороны поля: вдоль длинной стороны проходы часто ложатся лучше всего.
2. Вокруг трёх лучших вариантов - через 1°. Три варианта, а не один, чтобы не пропустить настоящий лучший.
3. Вокруг победителя - через 0,1°.

На одно поле это около 75 полных расчётов. Обычно хватает нескольких секунд, страница при этом не замирает.

Направление можно задать и самому: ползунком «Угол для всех полей» или у отдельного поля в блоке «Итог». Например, чтобы проходы шли вдоль рядов посадки. После правки контура поля нажмите «Авторасчёт» ещё раз.

<details>
<summary>🔬 Как устроено</summary>

`searchFieldAngle` - поиск по полному расчёту `planCoverage` для каждого угла.

- **Цена угла**, секунды: `(sprayLength + turnLength + transitLength + 3 · missed) / speed + 4 · turns + 10⁶ · unreachable`, где `missed = max(0, площадь / spacing - sprayLength)` - недостающая длина проходов до идеального покрытия.
- **Заход 1**: 36 углов через 5° на 0-180° плюс направления всех сторон контура (с поправкой на косинус широты).
- **Заход 2**: три лучших угла, разнесённых минимум на 5° (с учётом того, что 0° и 180° - одно направление), и по 9 углов вокруг каждого через 1° (±4°).
- **Заход 3**: 11 углов через 0,1° вокруг победителя (±0,5°).
- Цены кэшируются по углу, округлённому до 0,1°. Расчёт асинхронный: управление отдаётся странице, когда с прошлой отдачи прошло больше 12 мс, и отчёт о прогрессе идёт в `onProgress`.
- Сразу после замыкания поля `MapAgro` запускает этот поиск для нового контура. Если контур изменили или удалили, пока шёл поиск, найденный угол не ставится.

</details>

###### 🤔 Почему проходы не всегда вдоль стороны поля

Направления сторон всегда проверяются, но выигрывают не всегда. Если вести проходы вдоль одной стороны, к другим сторонам они идут наискось. Каждый такой проход обрывается на отступе от косого края, и вдоль него остаются необработанные клинья. Часто лучше всего оказывается направление между двумя сторонами. Если все длинные стороны поля параллельны, карта выберет направление вдоль них.

##### 📋 Что показывает «Итог»

- 📐 **Площадь** - площадь полей без запретных зон.
- 💧 **Покрытие** - какая доля этой площади попадает под распылитель. Остальное съедают отступы от краёв и зон. Чтобы обработать больше, уменьшите отступ.
- ⏱️ **Длина пути и время** - весь маршрут и время полёта по нему, плюс 4 секунды на разворот.
- 🧪 **Раствор** - площадь в гектарах, умноженная на норму внесения.
- ⛽ **Дозаправки** - сколько раз придётся долить бак, не считая заправки перед вылетом.

Дозаправки - только подсказка: в маршрут возвраты на заправку не вставляются.

<details>
<summary>🔬 Как устроено</summary>

Площадь (`fieldArea`, `fieldsArea`) считается полосами: поле режется горизонталями с шагом около 0,2 м (от 200 до 5000 полос), на каждой суммируются отрезки «поле минус объединение зон». Поэтому зона, вылезающая за край поля, и наложенные зоны учитываются верно. Покрытие `= sprayLength · spacing / площадь` (не больше 100 %), время `= (весь путь) / speed + 4 · turns`, раствор `= площадь_га · rate`, дозаправки `= max(0, ceil(раствор / tank) - 1)` (`MapAgro.svelte`, блок `stats`).

</details>

##### 📤 Что уходит на дрон

Готовую миссию можно скачать, скопировать или отправить на дрон. Это текстовый файл, который понимают Mission Planner, QGroundControl и автопилот ArduPilot.

В миссии по порядку:

1. 🏠 Точка дома - точка взлёта.
2. ✈️ Скорость полёта.
3. 🚱 Команда выключить распылитель, чтобы он точно не работал по дороге к полю.
4. 📍 Точки маршрута на заданной высоте над точкой взлёта: начала и концы проходов и точки обхода зон.
5. 💧 Между ними команды распылителя: включить в начале каждого прохода и выключить в его конце.
6. 🔚 В конце распылитель выключен.

Как миссия включает распылитель, выбирается на карте:

| Способ                | Что нужно настроить на дроне                                              |
| --------------------- | ------------------------------------------------------------------------- |
| Распылитель ArduPilot | `SPRAY_ENABLE=1`, насос на выходе с `SERVOx_FUNCTION=22`                  |
| Насос на выходе       | Номер выхода и сигналы «включить» и «выключить» задаются на карте         |
| Без команд            | Ничего, но насос работает и на разворотах, часть поля обработается дважды |

🚫 **Чего в миссии нет:**

- команды взлёта;
- команды посадки и возврата. Флажок «Вернуться к точке взлёта» только добавляет перелёт к ней на высоте полёта;
- возвратов на заправку.

📊 Когда дрон летит по миссии, карта показывает, какая часть пути пройдена и сколько уже обработано. Для этого дрон должен присылать номер текущей точки миссии.

<details>
<summary>🔬 Как устроено</summary>

`toMission`, формат QGC WPL 110: строки `seq, current, frame, command, p1-p4, lat, lon, alt, autocontinue` через табуляцию.

| Команда                        | Код | frame       | Параметры                                                                                   |
| ------------------------------ | --- | ----------- | ------------------------------------------------------------------------------------------- |
| Точка дома                     | 16  | 0           | координаты взлёта, высота 0, `current = 1`                                                  |
| `MAV_CMD_NAV_TAKEOFF`          | 22  | 3           | высота `alt`. Без неё ArduCopter на земле не взлетает                                       |
| `MAV_CMD_DO_CHANGE_SPEED`      | 178 | 3           | `p1 = 1` (путевая скорость), `p2 = speed`, `p3 = -1`                                        |
| `MAV_CMD_DO_SPRAYER`           | 216 | 3           | `p1 = 1` включить, `0` выключить                                                            |
| `MAV_CMD_DO_SET_SERVO`         | 183 | 3           | `p1 =` канал, `p2 =` ШИМ «вкл» или «выкл»                                                   |
| `MAV_CMD_NAV_WAYPOINT`         | 16  | 3 (от дома) | координаты, `alt`                                                                           |
| `MAV_CMD_NAV_RETURN_TO_LAUNCH` | 20  | 3           | в конце, если включён возврат: дрон садится в точке взлёта, а не висит над последней точкой |

Точки миссии (`waypointsOf`) - все вершины сегментов подряд, начиная с точки взлёта, совпадающие точки склеиваются; у точки флаг `spray`: включено ли распыление на участке после неё. Команда распылителя вставляется после точки, где флаг меняется. В ArduPilot DO-команда выполняется по прибытии в предыдущую точку маршрута, поэтому насос включается ровно в начале прохода и выключается в его конце. Обычно распылитель выключается уже в конце последнего прохода; если он остался включён после последней точки, в конец добавляется команда выключения. Номера команд точек маршрута сохраняются (`nav`), и `progress.ts` по `WPNum` из телеметрии считает долю пройденного пути и пролитую длину.

</details>

<details>
<summary>📂 Где это в коде</summary>

Всё лежит в `src/lib/WidgetMap/mission/`.

| Что                         | Где                                                                   |
| --------------------------- | --------------------------------------------------------------------- |
| План миссии и демо-поля     | `plan.ts`: `IMissionPlan`, `DEFAULT_MISSION_PLAN`                     |
| Перевод в метры и поворот   | `coverage.ts`: `makeProjection`                                       |
| Проходы и свободные отрезки | `coverage.ts`: `buildRows`, `FreeSpace.intervalsAt`                   |
| Части поля (ячейки)         | `coverage.ts`: `buildCells`, `cellPath`                               |
| Обход зон                   | `coverage.ts`: `FreeSpace.graphNodes`, `Router`                       |
| Порядок частей              | `coverage.ts`: `orderCells`                                           |
| Маршрут одного поля         | `coverage.ts`: `planCoverage`                                         |
| Несколько полей и перелёты  | `coverage.ts`: `planFields`, `routeOpen`                              |
| Площадь                     | `coverage.ts`: `fieldArea`, `fieldsArea`                              |
| Быстрая оценка угла         | `coverage.ts`: `estimateAngleCost`, `optimizeAngle`, `bestFieldAngle` |
| Точный подбор угла          | `coverage.ts`: `searchFieldAngle`                                     |
| Миссия QGC WPL 110          | `coverage.ts`: `toMission`                                            |
| Прогресс по телеметрии      | `progress.ts`                                                         |
| Интерфейс, итоги, подбор    | `MapAgro.svelte`                                                      |

Расчёт внутренний, наружу экспортируются только план и его типы, чтобы хранить его у себя:

- режим «Агро»: `DEFAULT_MISSION_PLAN`, типы `IMissionPlan`, `IMissionField`, `LngLat`, `SprayControl`;
- режим «Маршрут»: `DEFAULT_ROUTE_PLAN`, типы `IRoutePlan`, `IRouteWaypoint`.

</details>

<details>
<summary>📋 План миссии (IMissionPlan)</summary>

| Поле                                  | По умолчанию        | Описание                                                                                |
| ------------------------------------- | ------------------- | --------------------------------------------------------------------------------------- |
| `fields`                              | три демо-поля       | Поля `{ contour: [lng, lat][], angle }`: контур и угол проходов, ° от севера по часовой |
| `holes`                               | демо-зоны           | Запретные зоны, массив контуров; зона относится к каждому полю, которое задевает        |
| `start`                               | ниже демо-полей     | Точка взлёта, `[lng, lat]`                                                              |
| `spacing`                             | `5`                 | Ширина захвата, м                                                                       |
| `margin`                              | `2`                 | Отступ от границ и зон, м                                                               |
| `alt`, `speed`                        | `4`, `6`            | Высота, м, и скорость, м/с                                                              |
| `returnHome`                          | `true`              | Вернуться к точке взлёта в конце                                                        |
| `rate`, `tank`                        | `10`, `50`          | Норма внесения, л/га, и объём бака, л                                                   |
| `sprayControl`                        | `"sprayer"`         | `sprayer`, `servo` или `none`                                                           |
| `servoChannel`, `servoOn`, `servoOff` | `9`, `1900`, `1100` | Канал и ШИМ насоса для режима `servo`                                                   |

</details>

<details>
<summary>⚙️ Пропсы</summary>

| Название        | Тип                                       | По умолчанию           | Описание                                                                       |
| --------------- | ----------------------------------------- | ---------------------- | ------------------------------------------------------------------------------ |
| `groups`        | `string[]`                                | `["MAV"]`              | Группы полей, по объекту на группу                                             |
| `value`         | `Record<группа, Partial<IWidgetMapData>>` |                        | Значения по группам: `{ MAV: {...}, GNSS: {...} }`                             |
| `keys`          | `Partial<Record<ключ, string>>`           | имена ключей           | Другие имена полей                                                             |
| `height`        | `number`                                  | `400`                  | Высота карты, px                                                               |
| `markerIcon`    | `Component \| string`                     | стрелка                | Иконка маркера                                                                 |
| `trackEnabled`  | `boolean`                                 | `false`                | Траектория включена. Можно связать через `bind:`                               |
| `trackLength`   | `number`                                  | `1000`                 | Точек траектории. Можно связать через `bind:`                                  |
| `markerTimeout` | `number`                                  | `30000`                | Таймаут маркера, мс. Можно связать через `bind:`                               |
| `isTest`        | `boolean`                                 | `false`                | Режим имитации                                                                 |
| `mode`          | `"objects" \| "route" \| "agro"`          | `"objects"`            | Карта объектов, планировщик маршрута или генератор миссии для агродрона        |
| `plan`          | `IMissionPlan`                            | `DEFAULT_MISSION_PLAN` | План миссии в режиме «Агро». Можно связать через `bind:`                       |
| `onPlanChange`  | `(plan) => void`                          |                        | Вызывается при каждом изменении плана                                          |
| `route`         | `IRoutePlan`                              | `DEFAULT_ROUTE_PLAN`   | Маршрут в режиме «Маршрут». Можно связать через `bind:`                        |
| `onRouteChange` | `(route) => void`                         |                        | Вызывается при каждом изменении маршрута                                       |
| `onSend`        | `(mission, plan) => void \| Promise`      |                        | Отправка миссии, `mission` - текст QGC WPL 110. Без него «Отправить» неактивна |
| `label.name`    | `string`                                  |                        | Заголовок. Пусто - «Карта» на языке пользователя                               |
| `wrapperClass`  | `string`                                  | `""`                   | Классы обёртки                                                                 |
| `accent`        | `AccentColor`                             |                        | Мастер-цвет всего виджета                                                      |
| `collapsed`     | `boolean`                                 | `false`                | Свёрнут ли. Можно связать через `bind:`                                        |
| `persistKey`    | `string`                                  |                        | Ключ для запоминания свёрнутого состояния                                      |

</details>

<details>
<summary>💻 Примеры кода</summary>

```svelte
<UI.WidgetMap groups={["MAV", "GNSS"]} value={{ MAV: mav, GNSS: gnss }} height={400} trackEnabled />

<UI.WidgetMap mode="route" bind:route groups={["MAV"]} value={{ MAV: mav }} onSend={(mission) => sendToDevice(mission)} />

<UI.WidgetMap mode="agro" bind:plan groups={["MAV"]} value={{ MAV: mav }} onSend={(mission) => sendToDevice(mission)} />
```

`value` собирает `GUIRenderer`: для каждой группы читает переменные `<группа>.<ключ>` выбранного модуля.

</details>

<details>
<summary>🛠️ Панель свойств (WidgetMapProps.svelte)</summary>

Импорт из `poe-svelte-ui-lib/constructor`.

В конструкторе задают:

- режим: «Объекты», «Маршрут» или «Агро»;
- имитацию. Пока она включена, остальная панель бледная и недоступна;
- заголовок, группы через пробел (запятая тоже разделяет; пустое поле даёт `MAV`) и мастер-цвет;
- высоту карты: S, M, L, XL - 250, 400, 600, 800 пикселей;
- иконку маркера из библиотеки иконок;
- начальные значения траектории: включена ли и сколько точек хранить (100, 500, 1000, 5000, 10000, 50000).

Группы, иконка маркера, траектория и имитация действуют во всех режимах. Таймаут маркера в панели не задаётся, его выбирает оператор на карте.

</details>

<details>
<summary>🔬 Внутреннее устройство</summary>

В папке `mapWrapper/` лежат тонкие Svelte-обёртки над MapLibre GL: `MapLibre`, `Marker`, `Popup`, `Line`, элементы управления и `CustomControl` для своих кнопок поверх карты.

В папке `mission/` лежат режимы построения миссии: `MapRoute.svelte` и `route.ts` (режим «Маршрут»), `MapAgro.svelte` (интерфейс режима «Агро»), `coverage.ts` (расчёт траектории и выгрузка миссии), `plan.ts` (тип плана и план по умолчанию), `progress.ts` (прогресс по телеметрии), `simClock.svelte.ts` (часы имитации полёта), `MissionSim.svelte` (аппарат, след и панель имитации на карте), `fit.ts` (вписывание миссии в карту), `MissionLayers.svelte` (слои карты и перетаскивание точек).

</details>

## Файл `src/lib/WidgetPFD/README.md`

### ✈️ WidgetPFD

Пилотажный дисплей, как в кабине самолёта или на наземной станции. Одним взглядом видно, как летит аппарат: наклон, скорость, высота, курс и состояние всех систем.

#### ✨ Что умеет

- 🌅 Рисует авиагоризонт: небо и земля наклоняются вместе с аппаратом, движение плавное.
- 📏 Показывает ленты скорости слева, высоты справа и курса снизу.
- 🚦 Сверху строка состояния: взведён ли аппарат, режим полёта, GPS, связь и батарея.
- 🎯 Отмечает цели маршрута: нужную скорость, высоту и курс на следующую точку.
- 🏠 Показывает, где точка взлёта, куда аппарат движется на самом деле и сколько осталось до точки маршрута.
- 💨 Показывает газ, перегрузку, ветер и скольжение, если автопилот их присылает.
- 💬 Выводит сообщения автопилота, важные выделяет цветом.
- 🔴 Подсвечивает красным опасные значения: слишком малую или большую скорость, сильный крен, большую высоту, низкий заряд.
- ❓ По кнопке «?» в шапке включаются подсказки: наведите курсор на любой элемент, и внизу горизонта появится, что это и что значит.
- ⛔ Если данные перестали приходить, прибор перечёркивается надписью «NO DATA».
- 🎮 Умеет летать без устройства: режим имитации облетает маршрут над Минском.

#### 🧩 Как настроить в конструкторе

1. Перетащите виджет на макет. Он займёт всю ширину строки.
2. При желании подпишите его. Без подписи заголовок будет «Пилотажный дисплей» на языке пользователя.
3. Если телеметрия приходит не в группе `MAV`, укажите свою группу.
4. Выберите мастер-цвет для шапки и рамок значений.
5. Задайте границы опасных зон: скорость, крен, высоту, перегрузку, заряд батареи и через сколько показывать «NO DATA». Пустое поле значит, что зоны нет.
6. Чтобы посмотреть прибор в деле без аппарата, включите «Имитацию».

#### 💡 Полезно знать

- 👀 Виджет только показывает. На устройство он ничего не отправляет.
- 🎮 Пока включена имитация, остальные настройки в панели бледнеют и не действуют. Заголовок, цвет и границы зон на имитации видны как есть.
- 📱 В узкой ячейке ленты скорости и высоты заменяются числами поверх горизонта.
- 🔤 Подписи шкал (SPD, ALT, AS, VS, NO DATA) на всех языках одинаковые, это принятые в авиации сокращения. Переводятся подсказки и строки состояния.
- 📂 Виджет можно свернуть кликом по шапке.
- 🧮 Расстояние и направление на точку взлёта, трек и возраст данных виджет считает сам.

<details>
<summary>📦 Данные устройства</summary>

- Работает с полями группы `MAV` из телеметрии автопилота MAVLink. Группу можно сменить префиксом в настройках.
- Устройство (например, `20.00.000-01`) шлёт телеметрию потоком (`Telemetry_SendObject`, ключ `Data`). Облако раскладывает поля по значениям группы.
- `Roll`, `Pitch` и `Heading` приходят примерно 20 раз в секунду, остальное 1-2 раза в секунду.
- Только показывает, ничего не отправляет.

| Поля                        | Что                                                      | Сообщение MAVLink                          | Частота         |
| --------------------------- | -------------------------------------------------------- | ------------------------------------------ | --------------- |
| `Roll`, `Pitch`, `Heading`  | Крен, тангаж, курс, °                                    | ATTITUDE                                   | 20 Гц           |
| `Load`                      | Нормальная перегрузка, g                                 | SCALED_IMU (`-zacc / 1000`)                | 10 Гц           |
| `Slip`                      | Боковая перегрузка, g, вправо +                          | SCALED_IMU (`yacc / 1000`)                 | 10 Гц           |
| `GSpeed`, `ASpeed`, `Climb` | Путевая, воздушная и вертикальная скорость, м/с          | VFR_HUD                                    | 2 Гц            |
| `Thr`                       | Газ, %                                                   | VFR_HUD                                    | 2 Гц            |
| `WindDir`, `WindSpd`        | Откуда дует ветер, °, и его скорость, м/с                | WIND                                       | 2 Гц            |
| `Alt`, `AltMSL`             | Высота над точкой взлёта и над морем, м                  | GLOBAL_POSITION_INT, VFR_HUD               | 2 Гц            |
| `Lat`, `Lon`, `Vx`, `Vy`    | Координаты, скорость на север и восток                   | GLOBAL_POSITION_INT                        | 2 Гц            |
| `Fix`, `Sat`                | Тип фиксации GPS, спутники                               | GPS_RAW_INT                                | 2 Гц            |
| `BV`, `BC`, `BRem`          | Батарея: В, А, %                                         | SYS_STATUS                                 | 2 Гц            |
| `Mode`, `VType`, `Armed`    | Режим, тип аппарата, взведён ли                          | HEARTBEAT                                  | 2 Гц            |
| `HomeLat`, `HomeLon`        | Точка взлёта                                             | HOME_POSITION                              | 2 Гц            |
| `Press`, `Temp`             | Давление, гПа, температура, °C                           | SCALED_PRESSURE                            | 2 Гц            |
| `WPNum`, `WPDist`, `WPBrg`  | Точка маршрута, расстояние до неё, м, курс на неё, °     | MISSION_CURRENT, NAV_CONTROLLER_OUTPUT     | 2 Гц            |
| `AltErr`, `SpdErr`, `XTE`   | Ошибка высоты и скорости, боковое отклонение, м          | NAV_CONTROLLER_OUTPUT                      | 2 Гц            |
| `RSSI`, `RemRSSI`, `Drop`   | Сигнал своей и удалённой стороны, потери пакетов, %      | RADIO_STATUS, SYS_STATUS                   | 2 Гц            |
| `HDOP`, `EKF`, `SensErr`    | Точность GPS, дисперсия фильтра EKF, неисправные датчики | GPS_RAW_INT, EKF_STATUS_REPORT, SYS_STATUS | 2 Гц            |
| `Msg`, `MsgSev`, `MsgSeq`   | Сообщение автопилота, важность, номер                    | STATUSTEXT                                 | когда появилось |

</details>

<details>
<summary>🔑 Ключи</summary>

| Ключ                      | Описание                                                                                                                                           |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Roll`, `Pitch`           | Крен (вправо +) и тангаж (вверх +), °                                                                                                              |
| `Heading`                 | Курс, 0-360°                                                                                                                                       |
| `GSpeed`, `ASpeed`        | Путевая и воздушная скорость, м/с                                                                                                                  |
| `Alt`, `AltMSL`           | Высота над точкой взлёта и над морем, м                                                                                                            |
| `Climb`                   | Вертикальная скорость, м/с, вверх +                                                                                                                |
| `Load`                    | Нормальная перегрузка, g. 1 это горизонтальный полёт. Не число - плашки G нет                                                                      |
| `Slip`                    | Боковая перегрузка, g, вправо +. Не число - шарика скольжения нет                                                                                  |
| `Thr`                     | Газ, %. Не число - плашки THR нет                                                                                                                  |
| `WindDir`, `WindSpd`      | Откуда дует ветер, 0-360°, и скорость, м/с. Не число - плашки ветра нет                                                                            |
| `Lat`, `Lon`              | Координаты, °                                                                                                                                      |
| `Vx`, `Vy`                | Скорость на север и восток, м/с. По ней строится трек                                                                                              |
| `Fix`, `Sat`              | Фиксация GPS: `0`-`1` нет, `2` 2D, `3` 3D, `4` DGPS, `5` RTK float, `6` RTK fix. Число спутников                                                   |
| `BV`, `BC`, `BRem`        | Напряжение, В. Ток, А (`-1` не измеряется). Остаток, % (`-1` неизвестен)                                                                           |
| `Mode`, `VType`, `Armed`  | Режим автопилота, тип аппарата (по нему выбираются названия режимов), `1` взведён                                                                  |
| `HomeLat`, `HomeLon`      | Точка взлёта, °. `0` - неизвестна                                                                                                                  |
| `Press`, `Temp`           | Давление, гПа, температура, °C                                                                                                                     |
| `WPNum`                   | Номер точки маршрута. `0` - маршрута нет, метки целей не рисуются                                                                                  |
| `WPDist`, `WPBrg`         | Расстояние до точки, м, и курс на неё, °                                                                                                           |
| `AltErr`, `SpdErr`        | Цель минус текущее: высота, м, и воздушная скорость, м/с                                                                                           |
| `XTE`                     | Боковое отклонение от линии маршрута, м                                                                                                            |
| `RSSI`, `RemRSSI`         | Сигнал своей и удалённой стороны, %. `-1` - неизвестно                                                                                             |
| `Drop`                    | Потери пакетов телеметрии, %                                                                                                                       |
| `HDOP`                    | Точность GPS по горизонтали: до 1 отлично, больше 2 неточно. `-1` - неизвестно                                                                     |
| `EKF`                     | Наибольшая дисперсия навигационного фильтра: от 0.5 внимание, от 0.8 тревога                                                                       |
| `SensErr`                 | Сколько включённых датчиков неисправно                                                                                                             |
| `Msg`, `MsgSev`, `MsgSeq` | Текст сообщения, важность (`0`-`3` ошибка, `4` предупреждение, `5`-`7` информация), номер. По номеру видно новое сообщение, даже если текст тот же |

Названия режимов выбираются по `VType`: `1` и `19`-`25` - самолёт, `10` и `11` - ровер, остальные - коптер. Неизвестный режим показывается как `MODE <номер>`.

</details>

<details>
<summary>🔬 Что показывает прибор подробно</summary>

**Строка состояния** сверху. Четыре группы:

- «Система»: взведён или нет, режим, индикатор «НАВ». «НАВ» оранжевый, если дисперсия EKF от 0.5, и красный, если от 0.8 или есть неисправные датчики;
- «GPS»: фиксация, спутники, HDOP;
- «Связь»: сигнал своей и удалённой стороны, потери пакетов;
- «Батарея»: вольты, амперы, проценты. Красная, если заряд не выше `limits.battLow`.

**Авиагоризонт.** Небо и земля по крену и тангажу, шкала тангажа через 5°, дуга крена с отметками 10, 20, 30, 45 и 60°, символ самолёта. Между пакетами положение сглаживается.

**Ленты.**

- Слева путевая скорость. Жёлтая стрелка тренда показывает, какой станет скорость через 10 секунд при текущем ускорении.
- Справа высота над точкой взлёта с вариометром у края.
- Снизу курс. Розовый ▲ это трек, то есть куда аппарат движется на самом деле (рисуется, когда скорость больше 0.5 м/с). Зелёный ● это направление на точку взлёта.

**Углы горизонта.**

- Слева сверху `G`, перегрузка. Вне пределов `gMin` и `gMax` она красная. В подсказке минимум и максимум за время просмотра.
- Справа сверху `THR`, газ.
- Под `G` ветер: стрелка показывает, куда он дует относительно носа. Вниз значит встречный, вверх попутный.
- Под лентами воздушная скорость `AS` и вертикальная скорость `VS`. Набор зелёный, снижение оранжевое.

**Шарик скольжения** под указателем крена. В центре значит полёт без скольжения. Больше 0.1 g шарик оранжевый.

**Метки целей** бирюзовые: целевая скорость и высота на лентах, курс на точку маршрута ◆ на ленте курса. Цель за краем ленты прижимается к краю.

**Под прибором** группы «Маршрут» (точка, расстояние, отклонение, время до точки), «Дом» (расстояние и направление), «Трек», «Позиция» (координаты и высота над морем) и «Воздух» (давление и температура).

**Сообщения автопилота** видны 10 секунд в строке внизу горизонта, цвет по важности. Последние пять видны при наведении.

**Подсказки.** Включаются кнопкой «?» в шапке, по умолчанию выключены. Наведите курсор на любой элемент: в строке внизу горизонта появится, что это за величина, её значение и что оно значит. Выбор запоминается в браузере: с `persistKey` для этого экземпляра, без него для всех PFD.

**Нет данных.** Если пакеты не приходят дольше `limits.staleMs` (по умолчанию 2 секунды), прибор перечёркивается с надписью «NO DATA». Возраст данных всегда виден в шапке.

**Узкая ячейка.** Если виджет уже 440 пикселей, ленты скорости и высоты заменяются числами поверх горизонта.

</details>

<details>
<summary>🎮 Режим имитации</summary>

`isTest` включает полёт без устройства: прибор получает кадр каждые 50 мс от той же модели полёта, что в прошивке 20.00.000-01. Это облёт маршрута над Минском. Пока режим включён, `value`, `id` и `limits.staleMs` не учитываются. В конструкторе все остальные свойства становятся бледными и недоступными, пока имитацию не выключат. Сохранённые заголовок, цвет и границы зон на имитации видны как есть. Модель полёта лежит в `src/lib/flightSim.ts`.

</details>

<details>
<summary>⚙️ Пропсы</summary>

| Название       | Тип                             | По умолчанию | Описание                                                      |
| -------------- | ------------------------------- | ------------ | ------------------------------------------------------------- |
| `id`           | `string`                        | `"MAV"`      | Префикс группы                                                |
| `keys`         | `Partial<Record<ключ, string>>` | имена ключей | Другие имена полей                                            |
| `value`        | `Partial<IWidgetPFDData>`       |              | Поля группы. Без них «NO DATA»                                |
| `limits`       | `IWidgetPFDLimits`              |              | Границы цветных зон                                           |
| `isTest`       | `boolean`                       | `false`      | Режим имитации                                                |
| `label.name`   | `string`                        |              | Заголовок. Пусто - «Пилотажный дисплей» на языке пользователя |
| `wrapperClass` | `string`                        | `""`         | Классы обёртки                                                |
| `accent`       | `AccentColor`                   |              | Мастер-цвет: шапка и рамки значений                           |
| `collapsed`    | `boolean`                       | `false`      | Свёрнут ли                                                    |
| `persistKey`   | `string`                        |              | Ключ для запоминания свёрнутого состояния и подсказок         |

`id` и `keys` сам компонент не читает: по ним собирается `value` снаружи, виджет получает уже готовые поля.

Границы `limits`. Незаданная граница не рисуется.

| Поле                   | Что делает                                                                 |
| ---------------------- | -------------------------------------------------------------------------- |
| `speedMin`, `speedMax` | Скорость, м/с: ниже и выше красная зона на ленте                           |
| `bankMax`              | Крен, °: за пределом дуга и указатель крена красные                        |
| `altMax`               | Высота, м: выше красная зона                                               |
| `gMin`, `gMax`         | Перегрузка, g: вне пределов плашка G красная                               |
| `battLow`              | Заряд, %: не выше этого значения батарея в строке состояния красная        |
| `staleMs`              | Через сколько миллисекунд без данных показать «NO DATA», по умолчанию 2000 |

</details>

<details>
<summary>💻 Примеры кода</summary>

```svelte
<UI.WidgetPFD value={mav} limits={{ speedMin: 8, speedMax: 25, bankMax: 30, altMax: 150, gMin: -1, gMax: 3.8, battLow: 20 }} />
```

</details>

<details>
<summary>🛠️ Панель свойств (WidgetPFDProps.svelte)</summary>

В конструкторе сверху переключатель «Имитация». Ниже заголовок, префикс группы (по умолчанию `MAV`), мастер-цвет и границы: скорость, крен, высоту, перегрузку, заряд и время до «NO DATA». Пустое или нечисловое поле границы удаляет её. Пока имитация включена, всё ниже переключателя бледное и недоступно.

| Пропс              | Тип                                | Описание                                              |
| ------------------ | ---------------------------------- | ----------------------------------------------------- |
| `component`        | `UIComponent<"WidgetPFD">`         | Компонент и его свойства                              |
| `onPropertyChange` | `(change: PropertyChange) => void` | Сообщает об изменении: свойства, имя, доступ, событие |

</details>

## Файл `src/lib/WidgetRGBStrip/README.md`

### 🌈 WidgetRGBStrip

Пульт для адресной светодиодной ленты. Выбираете цвет, эффект и скорость - лента сразу откликается, а в отдельном блоке настраивается сама лента: сколько в ней светодиодов и какого они типа.

#### ✨ Что умеет

- 🎨 Подбирает цвет на палитре: оттенок, яркость и отдельная полоска для белого и серого.
- ⚪ Для лент с отдельным белым светодиодом (SK6812) появляется ползунок яркости белого.
- ✨ Включает один из восьми эффектов: статичный цвет, радуга, дыхание, палитра, комета, мерцание, огонь, бегущие огни.
- 🐢 Регулирует скорость эффекта, а на нуле эффект замирает на паузе.
- ⚡ Цвет, эффект и скорость уходят на ленту сразу, без кнопки «Сохранить».
- 🟥 В шапке виден образец текущего цвета, и он меняется сразу, ещё до ответа устройства.
- 🛠️ В блоке «Оборудование» задаются число светодиодов, модель чипа и порядок цветов. Эти настройки сохраняются отдельной кнопкой.
- 🔽 Сворачивается по клику на заголовок.
- ❓ Кнопка «?» в шапке включает подсказки.

#### 🧩 Как настроить в конструкторе

1. Перетащите виджет на макет. Привязывать переменные не нужно.
2. Если нужно, задайте заголовок. Без него карточка называется «RGB лента» на языке пользователя.
3. Если в прошивке у ленты другая группа настроек, впишите её. По умолчанию это `LST`.
4. Выберите мастер-цвет виджета.

#### 💡 Полезно знать

- 🔄 После сохранения оборудования лента перезапускается с новыми настройками.
- 📦 Блок «Оборудование» свёрнут: это редкие настройки. В его заголовке кратко видно текущее: число светодиодов, модель и порядок цветов. Пока есть несохранённые правки, блок не сворачивается.
- 🔢 Число светодиодов должно быть целым и не больше того, что разрешает прошивка. Иначе сохранить не получится, и виджет подскажет почему.
- 🐢 Для статичного цвета скорость не действует, и её ползунок неактивен.
- 🔀 Если красный светится зелёным - поменяйте порядок цветов.
- 📌 Пин данных и способ передачи задаются только в прошивке, из виджета их не поменять.
- 📐 Виджет занимает всю ширину своей ячейки, а высота подстраивается под содержимое.

<details>
<summary>📦 Данные устройства</summary>

- Работает с полями группы `LST` драйвера `RGB_Strip` прошивки ProdFactory-ESP. Группу можно сменить префиксом в настройках.
- Цвет, эффект и скорость отправляются сразу, по одному полю: `onUpdate(value, field)`, приложение шлёт `SET ModCfg` с этим ключом.
- Блок «Оборудование» правится на месте и уходит одним пакетом `SET ModCfg` с `Count`, `Model`, `Order` по «Сохранить». Прошивка после этого перезапускает ленту.

</details>

<details>
<summary>🔑 Ключи</summary>

| Ключ       | Описание                                                                                                   |
| ---------- | ---------------------------------------------------------------------------------------------------------- |
| `Color`    | `[R, G, B, W]`, каждое 0-255. `W` только у SK6812                                                          |
| `Effect`   | `0` статичный, `1` радуга, `2` дыхание, `3` палитра, `4` комета, `5` мерцание, `6` огонь, `7` бегущие огни |
| `Speed`    | 0-10 по нелинейной шкале, `0` пауза                                                                        |
| `Count`    | Сколько светодиодов, от 1 до `MaxCount`                                                                    |
| `Model`    | `0` WS2812, `1` SK6812 (RGBW), `2` WS2811                                                                  |
| `Order`    | Порядок цветов: `0` GRB, `1` RGB, `2` BRG, `3` RBG, `4` GBR, `5` BGR                                       |
| `MaxCount` | Наибольшее число светодиодов, задано в прошивке, только чтение                                             |

</details>

<details>
<summary>📡 Протокол устройства</summary>

```
"LST.Color": [255, 120, 0, 0],
"LST.Effect": 0,
"LST.Speed": 3,
"LST.Count": 64,
"LST.Model": 0,
"LST.Order": 0,
"LST.MaxCount": 64
```

Изменения отправляются `SET ModCfg` с нужными ключами группы. Пин данных и способ передачи (RMT или SPI) задаются в прошивке (`RGB_Strip_Init`), через виджет их не поменять.

</details>

<details>
<summary>🔬 Как устроено</summary>

- **Палитра** (внутренний `ColorPicker.svelte`, отдельно не экспортируется): полоса оттенка, полоса яркости и полоса белого, справа квадрат-превью с HEX. Полоса белого задаёт `R = G = B`, это не канал `W`. Полосы двигаются мышью, касанием и стрелками клавиатуры. Значение уходит, когда отпустили кнопку мыши или палец. Канал `W` при смене цвета сохраняется прежним. Без `onUpdate` полосы скрыты и видно только превью.
- **Белый канал.** Ползунок 0-255 виден, когда в блоке оборудования выбрана модель SK6812, даже до сохранения.
- **Скорость.** Ползунок 0-10 с шагом 1, неактивен при эффекте `0` (статичный).
- **Образец в шапке** - цвет первого светодиода (`Color`), без учёта яркости: тусклый светодиод показан тем же оттенком, а белый и серый своим уровнем. Отправленный цвет показывается сразу, а новое значение с устройства его заменяет. Эффекты «радуга», «палитра» и «огонь» цвет пикселей не сообщают, поэтому образец остаётся базовым `Color`.
- **Оборудование.** Пока правок нет, поля показывают свежие значения с устройства. Если `MaxCount` не пришёл, верхняя граница числа светодиодов 1024. При правках видна строка о перезапуске ленты или, при неверном количестве, «Количество - целое от 1 до N». «Сохранить» неактивна без `onSave`, без правок и при неверном количестве.
- **Без `onUpdate`** цвет, эффект и скорость только показываются.
- **Сворачивание.** Шапка сворачивает виджет. Свёрнутость по умолчанию задаётся в конструкторе (`collapsed`). С `persistKey` личный выбор пользователя запоминается в браузере и применяется сразу, без мигания. Если в GUI поменяли `collapsed`, прежний выбор сбрасывается.
- **Подсказки.** Кнопка «?» включает подсказки, по умолчанию они выключены. Выбор запоминается для каждого экземпляра по `persistKey`, без него он общий для всех виджетов этого типа.
- **Мастер-цвет.** `accent` перекрашивает весь виджет через `accentStyle`, включая кнопку «Сохранить».
- **В `GUIRenderer`** `persistKey` равен `<persistKey рендерера>|id компонента`. В режиме только просмотра `onUpdate` и `onSave` не передаются. В сетке виджет занимает одну строку, по умолчанию 8 клеток в ширину и не уже 6.

</details>

<details>
<summary>⚙️ Пропсы</summary>

| Название       | Тип                                                      | По умолчанию | Описание                                             |
| -------------- | -------------------------------------------------------- | ------------ | ---------------------------------------------------- |
| `id`           | `string`                                                 | `"LST"`      | Префикс группы                                       |
| `keys`         | `Partial<Record<ключ, string>>`                          | имена ключей | Другие имена полей                                   |
| `value`        | `Partial<IWidgetRGBStripConfig>`                         |              | Поля группы                                          |
| `label.name`   | `string`                                                 |              | Заголовок. Пусто - «RGB лента» на языке пользователя |
| `wrapperClass` | `string`                                                 | `""`         | Классы обёртки                                       |
| `accent`       | `AccentColor`                                            |              | Мастер-цвет                                          |
| `collapsed`    | `boolean`                                                | `false`      | Свёрнут ли. Можно связать через `bind:collapsed`     |
| `persistKey`   | `string`                                                 |              | Ключ для запоминания свёрнутости и подсказок         |
| `onUpdate`     | `(value, field: "Color" \| "Effect" \| "Speed") => void` |              | Изменилось свечение                                  |
| `onSave`       | `({ Count, Model, Order }) => void`                      |              | Нажата «Сохранить» в блоке оборудования              |

</details>

<details>
<summary>💻 Примеры кода</summary>

```svelte
<UI.WidgetRGBStrip
  value={strip}
  onUpdate={(value, field) => sendModCfg({ [`LST.${field}`]: value })}
  onSave={(hw) => sendModCfg({ "LST.Count": hw.Count, "LST.Model": hw.Model, "LST.Order": hw.Order })}
/>
```

</details>

<details>
<summary>🛠️ Панель свойств (WidgetRGBStripProps.svelte)</summary>

Панель для конструктора DevCloud. В ней задают заголовок и переводы, группу ленты (`id`, по умолчанию `LST`) и мастер-цвет. Имена полей (`keys`) в панели не редактируются.

| Пропс              | Тип                                | Описание                                              |
| ------------------ | ---------------------------------- | ----------------------------------------------------- |
| `component`        | `UIComponent<"WidgetRGBStrip">`    | Компонент и его свойства                              |
| `onPropertyChange` | `(change: PropertyChange) => void` | Сообщает об изменении: свойства, имя, доступ, событие |

</details>

## Файл `src/lib/WidgetStackInfo/README.md`

### 🧠 WidgetStackInfo

Карточка для отладки прошивки: сколько свободной памяти у устройства и какой запас стека у каждой задачи. Помогает поймать нехватку памяти до того, как устройство начнёт перезагружаться.

#### ✨ Что умеет

- 📊 Для каждой области памяти показывает «Занято X из Y», процент и полоску.
- 🌗 Светлая часть полоски показывает пик занятости с момента включения - насколько близко устройство подходило к нехватке.
- 🚦 Процент становится оранжевым при 75% и красным при 90%.
- 🗣️ Называет память понятными словами: «Встроенная ОЗУ», «Внешняя ОЗУ (PSRAM)», «ОЗУ».
- 📋 Выводит таблицу задач прошивки: состояние, приоритет, ядро, загрузку процессора и запас стека.
- ⚠️ Самые рискованные задачи всегда сверху. Маленький запас стека подсвечивается оранжевым и красным, а над таблицей видно, сколько задач в опасной зоне.
- 🔄 Обновляется кнопкой или сам: раз в 1, 5 или 10 секунд.
- 🔽 Сворачивается по клику на заголовок.
- ❓ Кнопка «?» в шапке включает подсказки.

#### 🧩 Как настроить в конструкторе

1. Перетащите виджет на макет. Привязывать переменные не нужно.
2. Если нужно, задайте заголовок. Без него карточка называется «Стек и задачи» на языке пользователя.
3. Задайте порог запаса стека: задачи с меньшим запасом будут подсвечены. По умолчанию 512 байт.
4. Если хотите, включите автоопрос сразу при открытии страницы.
5. Выберите мастер-цвет: в него окрасятся значок, полоски и шапка таблицы.

#### 💡 Полезно знать

- 💤 Свёрнутый виджет не опрашивает устройство.
- ▶️ Включённый автоопрос сразу отправляет первый запрос, не дожидаясь паузы.
- 🔢 Порядок задач всегда по возрастанию запаса стека, сортировка кликом отключена, чтобы таблица не прыгала при автоопросе.
- 📭 Пока данных нет, виджет предлагает нажать «Обновить».
- 📐 Виджет занимает всю ширину своей ячейки, а высота подстраивается под содержимое.

<details>
<summary>📦 Данные устройства</summary>

- Работает с объектом `StackInfo` из ответа на `GET StackInfo`. Объект лежит в `Payload` ответа, а не в группе `CFG`, поэтому префикса группы у виджета нет.
- Запрос отправляется кнопкой «Обновить» или автоопросом. Сам виджет только вызывает `onRefresh`.

</details>

<details>
<summary>🔑 Ключи</summary>

| Ключ    | Описание                                                                                                                 |
| ------- | ------------------------------------------------------------------------------------------------------------------------ |
| `Heap`  | Кучи памяти `[{ "Name", "Total", "Free", "MinFree" }]`, байт. `MinFree` это наименьший свободный объём с момента запуска |
| `Tasks` | Задачи `[{ "Name", "State", "Prio", "Core", "CPU", "FreeMin" }]`                                                         |

Поля задачи:

| Поле      | Что значит                                                                                       |
| --------- | ------------------------------------------------------------------------------------------------ |
| `State`   | `0` выполняется, `1` готова, `2` ждёт, `3` приостановлена, `4` удалена                           |
| `Prio`    | Приоритет                                                                                        |
| `Core`    | Ядро, только у ESP32. `-1` значит любое                                                          |
| `CPU`     | Загрузка одного ядра задачей в процентах с прошлого ответа (в первом ответе - с момента запуска) |
| `FreeMin` | Наименьший запас стека с момента создания задачи, байт                                           |

</details>

<details>
<summary>📡 Протокол устройства</summary>

```
"StackInfo": {
  "Heap": [
    { "Name": "Internal", "Total": 327680, "Free": 118000, "MinFree": 92000 },
    { "Name": "PSRAM", "Total": 4194304, "Free": 3980000, "MinFree": 3920000 }
  ],
  "Tasks": [{ "Name": "api_rx_task", "FreeMin": 1240, "Prio": 5, "Core": 1, "State": 2, "CPU": 3.5 }]
}
```

Формат общий у ProdFactory-ESP и ProdFactory-STM, его отдаёт `API_GetStackInfo`. Все размеры в байтах.

</details>

<details>
<summary>🔬 Как устроено</summary>

- **Кучи.** Карточка на каждую, при двух и более - в две колонки. «Занято X из Y», процент и полоса мастер-цвета. Процент оранжевый от 75%, красный от 90%. Светлая подложка полосы показывает пик занятости (`Total - MinFree`). Снизу «Свободно» и «Минимум». Размеры в Б, КБ и МБ.
- **Имена куч** переводятся на язык пользователя: `Internal` «Встроенная ОЗУ», `PSRAM` «Внешняя ОЗУ (PSRAM)», `Heap` (у STM) «ОЗУ». В подсказке объяснено, что это за память. Неизвестное имя выводится как есть, без подсказки.
- **Задачи.** Таблица «Задача, Состояние, Приор., Ядро, CPU %, Запас Б» высотой до `max-h-80`, дальше прокрутка. Колонка «Ядро» есть, только если хоть у одной задачи пришёл `Core`, колонка «CPU» - только если пришёл `CPU`.
- **Подсветка запаса.** Меньше `warnBytes` красный, меньше двойного `warnBytes` оранжевый. Над таблицей число задач и, если есть, красная строка «Запас стека меньше N Б: K».
- **Подсветка CPU.** От 50% оранжевая, от 80% красная. Задачи `IDLE*` не подсвечиваются: это свободное время ядра. Цвет задаёт `accent(row)` колонки таблицы (роли темы `orange` и `red`), в ячейке - обычный текст без HTML.
- **Обновление.** Кнопка «Обновить» и автоопрос: выключен, 1, 5 или 10 секунд. Без `onRefresh` и кнопка, и автоопрос неактивны. Если `period` задан не из этого списка (в панели свойств можно ввести любое число), переключатель показывает «Выкл», но опрос идёт с заданным периодом.
- **Сворачивание.** Шапка сворачивает виджет. Свёрнутость по умолчанию задаётся в конструкторе (`collapsed`). С `persistKey` личный выбор пользователя запоминается в браузере и применяется сразу, без мигания. Если в GUI поменяли `collapsed`, прежний выбор сбрасывается.
- **Подсказки.** Кнопка «?» включает подсказки, по умолчанию они выключены. Выбор запоминается для каждого экземпляра по `persistKey`, без него он общий для всех виджетов этого типа.
- **Мастер-цвет.** `accent` перекрашивает весь виджет через `accentStyle`.
- **В `GUIRenderer`** `persistKey` равен `<persistKey рендерера>|id компонента`. В сетке виджет занимает одну строку, по умолчанию 10 клеток в ширину и не уже 6.

</details>

<details>
<summary>⚙️ Пропсы</summary>

| Название         | Тип                | По умолчанию  | Описание                                                                       |
| ---------------- | ------------------ | ------------- | ------------------------------------------------------------------------------ |
| `id`             | `string`           |               | Не используется: префикса группы у виджета нет                                 |
| `keys.StackInfo` | `string`           | `"StackInfo"` | Имя объекта в ответе                                                           |
| `argument`       | `string`           | `"StackInfo"` | Аргумент запроса                                                               |
| `value`          | `IWidgetStackInfo` |               | Снимок `StackInfo`                                                             |
| `label.name`     | `string`           |               | Заголовок. Пусто - «Стек и задачи» на языке пользователя                       |
| `wrapperClass`   | `string`           | `""`          | Классы обёртки                                                                 |
| `accent`         | `AccentColor`      |               | Мастер-цвет                                                                    |
| `warnBytes`      | `number`           | `512`         | Порог подсветки запаса стека, байт                                             |
| `period`         | `number`           | `0`           | Период автоопроса, мс. `0` только по кнопке. Можно связать через `bind:period` |
| `collapsed`      | `boolean`          | `false`       | Свёрнут ли. Можно связать через `bind:collapsed`                               |
| `persistKey`     | `string`           |               | Ключ для запоминания свёрнутости и подсказок                                   |
| `onRefresh`      | `() => void`       |               | Запросить снимок. Без него кнопка и автоопрос неактивны                        |

</details>

<details>
<summary>💻 Примеры кода</summary>

```svelte
<UI.WidgetStackInfo value={stackInfo} warnBytes={1024} onRefresh={() => send("GET", "StackInfo")} />
```

</details>

<details>
<summary>🛠️ Панель свойств (WidgetStackInfoProps.svelte)</summary>

Панель для конструктора DevCloud. Значения по умолчанию совпадают с прошивкой.

- **Общие:** заголовок и переводы, мастер-цвет.
- **Отображение:** порог запаса стека (0-65535 байт, шаг 64), автоопрос по умолчанию (0-60000 мс, шаг 1000, `0` - выключен).
- **Устройство:** имя объекта ответа (`keys.StackInfo`), аргумент запроса (`argument`).

| Пропс              | Тип                                | Описание                                              |
| ------------------ | ---------------------------------- | ----------------------------------------------------- |
| `component`        | `UIComponent<"WidgetStackInfo">`   | Компонент и его свойства                              |
| `onPropertyChange` | `(change: PropertyChange) => void` | Сообщает об изменении: свойства, имя, доступ, событие |

</details>

## Файл `src/lib/WidgetWiFi/README.md`

### 📶 WidgetWiFi

Карточка настройки сети устройства. Здесь выбирают режим WiFi, подключают устройство к роутеру и настраивают его собственную точку доступа.

#### ✨ Что умеет

- 🔀 Переключает режим: подключение к роутеру, своя точка доступа или оба сразу.
- 🔍 Ищет сети вокруг устройства: нажали на лупу - и в списке у имени сети появились найденные.
- 🔐 Принимает пароль сети и проверяет, что он подходящей длины.
- 🌐 Позволяет получать адрес от роутера автоматически или задать его вручную вместе с маской и шлюзом.
- 📡 Настраивает собственную сеть устройства: имя, пароль и адреса.
- 💾 Все правки копятся на месте и уходят на устройство одной кнопкой «Сохранить». Пока не сохранили, под кнопкой висит напоминание.
- 🛑 Перед сохранением режима «только точка доступа» предупреждает, что устройство пропадёт из облака.
- 🔽 Сворачивается по клику на заголовок.
- ❓ Кнопка «?» в шапке включает подсказки к неочевидным полям.

#### 🧩 Как настроить в конструкторе

1. Перетащите виджет на макет. Привязывать поля по одному не нужно: виджет сам работает со всеми настройками сети.
2. Если нужно, задайте заголовок. Без него карточка называется «WiFi».
3. Отметьте, какие режимы разрешено выбирать пользователю.
4. Выберите мастер-цвет: в него окрасятся значок, переключатели и кнопка «Сохранить».
5. Оставьте включённым предупреждение о режиме точки доступа, если не уверены.

#### 💡 Полезно знать

- 👁️ Набор полей зависит от режима: для роутера свои поля, для точки доступа свои, в режиме «оба» видны все.
- ✋ Пока у пользователя есть несохранённые правки, свежие данные с устройства их не затирают.
- 🛑 Предупреждение появляется только при сохранении, само переключение режима ничего не отправляет.
- 🔑 Браузер не подсовывает в поля пароля сохранённые логины.
- 👀 Без `onSave` (наблюдатель, нет прав на запись) виджет только показывает настройки: поля не правятся, режимы и поиск неактивны, пароли закрыты точками и без глазика.
- 📐 Виджет занимает всю ширину своей ячейки, а высота подстраивается под содержимое.

<details>
<summary>📦 Данные устройства</summary>

- Работает с полями группы `CFG`. Группу можно сменить префиксом в настройках.
- Поля правятся на месте. «Сохранить» отдаёт в `onSave` все 12 полей, а приложение отправляет их одним пакетом `SET ModCfg`.
- Кнопка поиска (лупа) отправляет `GET APsList`. Найденные сети появляются в списке у поля SSID.
- Сам виджет с устройством не говорит. Читает и пишет поля `GUIRenderer`.

</details>

<details>
<summary>🔑 Ключи</summary>

| Ключ                      | Описание                                                    |
| ------------------------- | ----------------------------------------------------------- |
| `WiFiMode`                | Режим: `0` выключен, `1` клиент, `2` точка доступа, `3` оба |
| `StaSSID`, `StaPSK`       | Сеть роутера и её пароль                                    |
| `StaticIP`                | `0` DHCP, `1` статический адрес                             |
| `StaIP`, `StaMS`, `StaGW` | Адрес, маска и шлюз в сети роутера                          |
| `ApSSID`, `ApPSK`         | Имя и пароль своей точки доступа                            |
| `ApIP`, `ApMS`, `ApGW`    | Адрес, маска и шлюз своей точки доступа                     |

Режим `0` в виджете выбрать нельзя: переключатель предлагает только `STA`, `AP` и `STA + AP`. Если с устройства пришёл `0`, ни одна секция полей не показывается.

</details>

<details>
<summary>🔬 Как устроено</summary>

- **Режим.** Переключатель в шапке. В режиме клиента видны SSID с кнопкой поиска и пароль роутера в одну строку, переключатель DHCP или статический адрес и, при статическом, поля адреса, маски и шлюза. В режиме точки доступа видны её SSID, пароль, адрес, маска и шлюз. В режиме `STA + AP` обе секции.
- **Поиск сетей.** Кнопка неактивна без `onScan`, во время поиска вместо лупы крутится загрузка. При выборе сети из списка в SSID попадает только `value`, без уровня сигнала и канала из подписи.
- **Проверки.** Пароль либо пустой, либо от 8 до 63 символов (поле принимает до 64). Адреса, маски и шлюзы проверяются как IPv4, до 15 символов. SSID точки доступа не длиннее 32 символов. У SSID роутера ограничения длины в виджете нет.
- **Пароли.** У полей пароля `autocomplete="one-time-code"`, поэтому менеджер паролей браузера не накрывает список сетей своими логинами.
- **Предупреждение.** Перед сохранением режима `2` при `confirmOnAP` поверх карточки открывается окно: клиент STA выключится, устройство отключится от облака и будет доступно только по своей точке доступа. Кнопка подтверждения красная. Для `STA + AP` предупреждения нет, STA остаётся активным.
- **Живые данные.** `value` это поток с устройства. Новое значение подхватывается, только если нет несохранённых правок.
- **Только просмотр.** Если `onSave` не передан, поля `readonly`, переключатели режима и IP и поиск сети `disabled`. Пароли `StaPSK` и `ApPSK` выводятся обычным полем с маской `••••••••` (пустой пароль - пустое поле), поэтому глазика нет. Правок не бывает, и живые данные всегда обновляются. Сами пароли при этом в браузер всё равно приходят, маска только не показывает их.
- **Без данных** виджет стартует с режима `1`, DHCP и точкой доступа `192.168.108.1` / `255.255.255.0` / `192.168.108.1`.
- **Сворачивание.** Шапка сворачивает виджет, клик по переключателю режима не сворачивает. Свёрнутость по умолчанию задаётся в конструкторе (`collapsed`). С `persistKey` личный выбор пользователя запоминается в браузере и применяется сразу, без мигания. Если в GUI поменяли `collapsed`, прежний выбор сбрасывается. Так работают все смарт-виджеты.
- **Подсказки.** Кнопка «?» включает подсказки, по умолчанию они выключены. Выбор запоминается для каждого экземпляра по `persistKey`, без него он общий для всех виджетов этого типа.
- **Мастер-цвет.** `accent` через `accentStyle` красит значок, переключатели, рамку фокуса, кнопку «Сохранить» и шапку таблиц в виджете.
- **В `GUIRenderer`** `persistKey` равен `<persistKey рендерера>|id компонента`. Ответ на поиск рендерер ждёт до 3 секунд (`link.waitFor`) в поле `<префикс>.<StaSSID>-S`. Если устройство ответило `ER!` или не ответило, рендерер сообщает об этом через `onError`, а список остаётся пустым. В режиме только просмотра `onScan` и `onSave` не передаются, и виджет становится только для чтения. В сетке виджет занимает одну строку, по умолчанию 8 клеток в ширину и не уже 6.

</details>

<details>
<summary>⚙️ Пропсы</summary>

| Название       | Тип                                    | По умолчанию     | Описание                                                                                                                           |
| -------------- | -------------------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `id`           | `string`                               | `"CFG"`          | Префикс группы полей                                                                                                               |
| `keys`         | `Partial<Record<ключ, string>>`        | имена ключей     | Другие имена полей, если у прошивки иначе                                                                                          |
| `value`        | `IWidgetWiFiConfig`                    |                  | Текущие значения полей                                                                                                             |
| `label.name`   | `string`                               | `"WiFi"`         | Заголовок. Пусто - название на языке пользователя                                                                                  |
| `wrapperClass` | `string`                               | `""`             | Классы обёртки                                                                                                                     |
| `accent`       | `AccentColor`                          |                  | Мастер-цвет                                                                                                                        |
| `allowedModes` | `number[]`                             | `[1, 2, 3]`      | Какие режимы можно выбрать                                                                                                         |
| `confirmOnAP`  | `boolean`                              | `true`           | Предупреждать при сохранении режима точки доступа                                                                                  |
| `scanCommand`  | `{ header, argument }`                 | `GET`, `APsList` | Команда поиска сетей                                                                                                               |
| `collapsed`    | `boolean`                              | `false`          | Свёрнут ли. Можно связать через `bind:collapsed`                                                                                   |
| `persistKey`   | `string`                               |                  | Ключ для запоминания свёрнутости и подсказок                                                                                       |
| `onScan`       | `() => Promise<{ id, name, value }[]>` |                  | Найти сети. `name` подпись в списке, `value` SSID                                                                                  |
| `onSave`       | `(config) => void`                     |                  | Нажата «Сохранить», в `config` все поля `IWidgetWiFiConfig`. Без него «Сохранить» неактивна, поля только для чтения, пароли маской |

</details>

<details>
<summary>💻 Примеры кода</summary>

```svelte
<script>
  import * as UI from "poe-svelte-ui-lib"

  const scan = async () => [{ id: "1", name: "Home (-48 dBm, ch 6)", value: "Home" }]
  const save = (config) => sendModCfg(config)
</script>

<UI.WidgetWiFi value={wifi} onScan={scan} onSave={save} />
```

</details>

<details>
<summary>🛠️ Панель свойств (WidgetWiFiProps.svelte)</summary>

Панель для конструктора DevCloud. Значения по умолчанию совпадают с прошивкой.

- **Общие:** заголовок и переводы, префикс группы, разрешённые режимы (множественный выбор), мастер-цвет.
- **Поведение:** подтверждение при включении AP (`confirmOnAP`).
- **Ключи устройства:** другое имя для каждого из 12 полей.
- **Команда сканирования:** заголовок пакета и аргумент.

| Пропс              | Тип                                | Описание                                              |
| ------------------ | ---------------------------------- | ----------------------------------------------------- |
| `component`        | `UIComponent<"WidgetWiFi">`        | Компонент и его свойства                              |
| `onPropertyChange` | `(change: PropertyChange) => void` | Сообщает об изменении: свойства, имя, доступ, событие |

</details>

## Файл `src/routes/RegExp.md`

### 🔤 Регулярные выражения

Шпаргалка по регулярным выражениям JavaScript. Пригодится, когда нужно проверить, что в поле ввода `Input` ввели правильное значение: IP-адрес, почту, серийный номер.

#### 🧩 Как пользоваться

1. Найдите подходящий шаблон в списке ниже или соберите свой.
2. Вставьте его в настройку «Выражение валидации» поля `Input` (проп `help.regExp`).
3. Проверьте выражение на сайте [regex101.com](https://regex101.com/) или [regexr.com](https://regexr.com/).

Неверный ввод поле подсветит красной рамкой и не отправит на устройство. `help.regExp` принимает `RegExp`, строку выражения или строку вида `/.../флаги`.

#### 📋 Готовые шаблоны

- 🔡 Строчная латиница и цифры, не длиннее 10 символов - `/^[0-9a-z]{0,10}$/`
- 🌐 IPv4 - `/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/`
- 🌐 IPv6 - `/((^|:)([0-9a-fA-F]{0,4})){1,8}$/`
- 📅 Дата в формате ДД.ММ.ГГГГ - `/(0[1-9]|[12][0-9]|3[01])[.](0[1-9]|1[012])[.](19|20)\d\d/`
- 🕐 Время (24-часовой формат) - `/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/`
- ✉️ Электронная почта - `/^[a-zA-Z0-9.!#$%&'*+/=?^_{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/`
- 🔗 URL - `/^https?:\/\/[\w.-]+(?:\.[a-zA-Z]{2,})+(?:[/?#]\S*)?$/`
- 🔢 Целые числа и числа с плавающей точкой (разделитель точка) - `/^-?\d+(\.\d+)?$/`
- 🎨 Цвет HEX - `/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/`
- 🆔 ID устройства - `/^[0-9A-F]{0,4}$/`
- 🏷️ Серийный номер устройства - `/^[0-9a-fA-F]{4}-[0-9a-fA-F]{24}[:][0-9a-fA-F]{2}$|^$/`
- 📞 Телефон РФ (`+7`/`8`, с разделителями или без) - `/^(\+7|8)[\s-]?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/`
- 🖧 MAC-адрес - `/^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/`
- 👤 Логин (латиница/цифры/подчёркивание, 3-16 символов) - `/^[a-zA-Z0-9_]{3,16}$/`
- 🔑 Пароль (мин. 8 символов, минимум одна буква и одна цифра) - `/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*]{8,}$/`

#### 💡 Полезно знать

- 🎯 `^` в начале и `$` в конце требуют, чтобы под шаблон подошла вся строка, а не её часть.
- 🧮 Каждый символ в наборе описывается отдельно: `[0-31]` - это не числа от 0 до 31, а цифры от 0 до 3 и символ `1`.
- 🇷🇺 `\w` не знает кириллицу, а `[а-я]` не включает «ё».
- 🚫 Запись `{,5}` в JavaScript не работает, пишите `{0,5}`.
- ✳️ Специальные символы, которые нужны буквально, экранируют обратным слэшем: `\.` - точка.

<details>
<summary>🔤 Символы</summary>

- `.` - любой символ
- `a` - символ буквы "a" (так же и с другими буквами)
- `\n` - символ переноса строки
- `\t` - символ табуляции

- `\d` - все цифры - `[0-9]`
- `\D` - всё кроме цифр - `[^0-9]`
- `\s` - все пробельные символы - пробел, табуляция, перенос строки и т.д. (` `, `\t`, `\n`, `\r`, `\f`, `\v`)
- `\S` - всё кроме пробельных символов
- `\w` - все словесные символы (без кириллицы) - `[a-zA-Z0-9_]`
- `\W` - всё, кроме словесных символов

**Экранирование специальных символов.** Экранируются: `. * + ? ^ $ { } ( ) [ ] | \ /`

Пример: `\.` - буквальная точка, `\\` - обратный слэш.

</details>

<details>
<summary>🔁 Повторение символов (квантификаторы)</summary>

- `*` - 0 и более раз
- `+` - 1 и более раз
- `?` - 0 или 1 раз

- `{5}` - ровно 5 раз
- `{1,5}` - от 1 до 5 раз
- `{1,}` - от 1 раза
- `{0,5}` - до 5 раз (запись `{,5}` в JavaScript не работает)

Применяются к символу или группе, после которой стоят.

**Например:**

- `a+` - символ "a" 1 или более раз;
- `.*` - любой символ 0 или более раз;
- `(Bob)?` - группа символов "Bob" 0 или 1 раз;
- `аб{3}` - "а" 1 раз и "б" 3 раза.

</details>

<details>
<summary>🧺 Группы и границы</summary>

`()` - позволяют использовать группы элементов или просто объединять несколько символов.

По умолчанию всё, что находится в круглых скобках, попадает в группы (т.е. отображается в результате). Чтобы этого избежать, используют незахватывающие группы: `(?:  )`. Например, `(?:https?|ftp)://([^/\r\n]+)(/[^\r\n]*)`.

- `|` - знак логического ИЛИ
- `^` - символ начала строки
- `$` - символ конца строки
- `\b` - символ границы слова

**Например:**

- `(Bob|Alice)` - "Bob" или "Alice";
- `^a.*c$` - начинается с символа "a" (`^a`), заканчивается на символ "c" (`c$`), между ними 0 и более любых символов;
- `\bJava\b` - "Java" как обособленное слово, но не в составе другого слова, например "JavaScript".

</details>

<details>
<summary>🎯 Наборы символов</summary>

`^` внутри `[]` - исключение.

- `[а-я]` - кириллица в нижнем регистре без "ё"
- `[абвгд]` - то же, что и `[а-д]`
- `[a-zA-Z]` - вся латиница
- `[а-яА-ЯЁё]` - вся кириллица
- `[^a-zA-Z]` - всё кроме латиницы
- `[0-5]` - все цифры от 0 до 5
- `25[0-5]` - числа от 250 до 255

При составлении выражения нужно учитывать, что каждый символ описывается отдельно! Запись `[0-31]` вернёт не диапазон от 0 до 31, а диапазон от 0 до 3 и символ `1`.

</details>

<details>
<summary>📚 Полезные материалы</summary>

- Регулярные выражения за 100 секунд (ENG) - https://www.youtube.com/watch?v=sXQxhojSdZM
- Сайт для проверки регулярных выражений онлайн - https://regexr.com/
- Ещё один сайт для проверки регулярных выражений - https://regex101.com/ (выберите ECMAScript (JavaScript) в настройках)

</details>
