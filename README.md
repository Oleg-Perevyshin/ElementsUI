# poe-svelte-ui-lib

Набор UI-компонентов на Svelte 5 (в режиме рун) для конструктора интерфейсов устройств: поля ввода, селекторы, таблицы, графики, виджеты устройства (WiFi, информация об устройстве) и вспомогательные примитивы (модалки, перетаскивание, drag&drop-конструктор свойств).

## Установка

```bash
npm install poe-svelte-ui-lib
```

### Требования (peerDependencies)

- `svelte ^5.0.0`
- `tailwindcss ^4.0.0` — компоненты стилизуются исключительно Tailwind-утилитами и CSS-переменными темы, без собственного скомпилированного CSS в пакете

### Подключение стилей и темы

Пакет не поставляет готовый CSS-файл — цветовые токены (`--back-color`, `--accent-color`, `--red-color` и т.д.) и типографика ожидаются от проекта-потребителя. Возьмите `src/app.css` этого репозитория как стартовый шаблон и скопируйте в свой проект (палитру можно переопределить своими значениями — имена переменных и структура классов `bg-*`/`border-*` должны остаться прежними, чтобы компоненты стилизовались корректно). В `app.css` потребителя также нужно указать Tailwind, откуда сканировать классы из собранного пакета:

```css
@import "tailwindcss";
@source "../node_modules/poe-svelte-ui-lib/dist";
```

Справочник по регулярным выражениям (`docs/info/RegExp.md`) и протокол обмена данными с устройством (`docs/info/ExchangeRules.md`) — вспомогательные материалы для тех, кто настраивает валидацию полей и работу с `DeviceStore`.

## Использование

```svelte
<script lang="ts">
  import * as UI from "poe-svelte-ui-lib"

  let value = $state("")
</script>

<UI.Input label={{ name: "Имя" }} bind:value type="text" />
<UI.Button content={{ name: "Сохранить" }} onClick={() => console.log(value)} />
```

Полный список компонентов и типов — в `src/lib/index.ts`. У каждого компонента есть README рядом с исходником (`src/lib/<Component>/README.md`, для `Modal`/`Dragging` — `src/lib/<Component>.README.md`) с описанием пропсов, примерами и внутренним устройством; живая витрина всех компонентов — `npm run dev` → `/components/all`.

## Разработка

```bash
npm run dev        # витрина компонентов (SvelteKit dev-сервер)
npm run build       # сборка пакета (svelte-kit sync + svelte-package + publint) → dist/
npm run Formatting  # prettier --write .
```

---

Лицензия: MIT — см. `LICENSE`.
