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
├─ scripts/UpdateIconsLib.ts       assets/IconsCatalog -> src/lib/icons.ts (npm run UpdateIconsLib)
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
- Смарт-виджеты: `WidgetWiFi`, `WidgetDeviceInfo`, `WidgetFileSystem`, `WidgetStackInfo`, `WidgetRGBStrip`, `WidgetPFD`, `WidgetMap`.
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

| Виджет             | Префикс по умолчанию | Поля (кратко)                                                                                                                | Сохраняемые поля                           |
| ------------------ | -------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `WidgetWiFi`       | `CFG`                | `WiFiMode` (0 NULL, 1 STA, 2 AP, 3 STA+AP), `StaSSID`, `StaPSK`, `StaticIP`, `StaIP/MS/GW`, `ApSSID/PSK/IP/MS/GW`            | все                                        |
| `WidgetDeviceInfo` | `CFG`                | `DevSN`, `DevID`, `DevFW`, `RunCnt`, `DevName`, `HostName`, `WebUser`, `WebPsw`, `StaIP`, `ApIP`                             | `DevName`, `HostName`, `WebUser`, `WebPsw` |
| `WidgetFileSystem` | `CFG`                | объект `FS` (Total/Used/Free/List, Upload во время закачки)                                                                  | -                                          |
| `WidgetStackInfo`  | без группы           | объект `StackInfo` (кучи и стеки задач)                                                                                      | -                                          |
| `WidgetRGBStrip`   | `LST`                | `Color` [R,G,B,W], `Effect` 0-7, `Speed` 0-10, `Count`, `Model` (WS2812/SK6812/WS2811), `Order`, `MaxCount`                  | `Count`, `Model`, `Order`                  |
| `WidgetPFD`        | `MAV`                | телеметрия MAVLink: ориентация, скорости, высоты, GPS, батарея, режим, маршрут, связь, сообщения (`Msg`, `MsgSev`, `MsgSeq`) | -                                          |
| `WidgetMap`        | `groups: ["MAV"]`    | на каждый борт: `Lat`, `Lon`, `Alt`, `Heading`, `Sat`, `DevName`, `DevSN`, `WPNum`                                           | -                                          |

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

| Команда                          | Что делает                                                                                                                                                                                                               |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm install`                    | Зависимости                                                                                                                                                                                                              |
| `npm run dev`                    | Витрина на dev-сервере Vite                                                                                                                                                                                              |
| `npm run check`                  | `svelte-kit sync` + `svelte-check` (типы)                                                                                                                                                                                |
| `npm run TestProtocols`          | Генерация словаря, `svelte-package`, `node --test tests/*.test.mjs`                                                                                                                                                      |
| `npm run Dictionary`             | `dictionaries/`: `commands.yaml` -> `generated/commands.ts`, `messages.yaml` -> `generated/messages.ts`, `components.yaml` -> `generated/components.ts`, заголовки прошивок `firmware/api_har.h` и `firmware/api_msg.h`  |
| `npm run UpdateIconsLib`         | `tsx scripts/UpdateIconsLib.ts`: каталог `assets/IconsCatalog` -> `src/lib/icons.ts` (`ICONS`, `ICON_NAMES`, `ICONS_ARRAY`)                                                                                              |
| `npm run Formatting`             | `prettier --write .` - единственный способ форматирования, перед каждым коммитом                                                                                                                                         |
| `npm run build`                  | Сборка витрины в `docs/`                                                                                                                                                                                                 |
| `npm pack` (запускает `prepack`) | Словарь -> `svelte-kit sync` -> `svelte-check` -> `svelte-package` (в `dist/`) -> `tsc -p tests/dist-types.tsconfig.json` (проверка `.d.ts` так, как их видит приложение) -> `node --test tests/*.test.mjs` -> `publint` |
| `npm run CheckUpdate`            | `npx npm-check-updates -u && npm install`                                                                                                                                                                                |

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
- Новая команда протокола или сообщение устройства: правка `src/lib/dictionaries/commands.yaml` или `messages.yaml`, `npm run Dictionary` (генерирует и `src/lib/dictionaries/firmware/api_har.h`, `api_msg.h`), затем копирование `commands.yaml`/`messages.yaml` в `.framework/Dictionary.yaml`/`Messages.yaml` и обоих заголовков в `api_service` обоих фреймворков; после правки протоколов - `npm run TestProtocols`.
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
