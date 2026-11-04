# TextField

Надпись: заголовок раздела, пояснение, подпись.

## Назначение

Надпись, заголовок или пояснение.

## Пакет данных

С устройством не связан, это статичный текст.

## Особенности

- Для значения с устройства используйте `Input` в режиме «только чтение» или виджет.
- Размеров пять: `small`, `base`, `large`, `huge`, `massive`.
- Выравнивание наследуется от контейнера. Своё можно задать в `content.class`, например `text-center`.
- `background` рисует под текстом скруглённую подложку цвета панели.

## Пропсы

| Название | Тип | По умолчанию | Описание |
|---|---|---|---|
| `id` | `string` | `crypto.randomUUID()` | Идентификатор |
| `content.name` | `string` | `""` | Текст |
| `content.size` | `"small" \| "base" \| "large" \| "huge" \| "massive"` | `"base"` | Размер: `text-sm`, `text-base`, `text-2xl`, `text-4xl`, `text-5xl` |
| `content.class` | `string` | `""` | Классы текста |
| `background` | `boolean` | `false` | Подложка |
| `underline` | `boolean` | `false` | Подчёркивание |
| `wrapperClass` | `string` | `""` | Классы обёртки |

Колбэков нет.

## Пример

```svelte
<UI.TextField content={{ name: "Настройки сети", size: "large" }} />
<UI.TextField content={{ name: "Изменения вступят в силу после перезагрузки", size: "small", class: "text-center" }} background />
```

## Панель свойств (TextFieldProps.svelte)

В конструкторе задают текст, размер, подложку и подчёркивание.
