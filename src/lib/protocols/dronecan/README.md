# 🛩️ DroneCAN

Протокол CAN, на котором говорит ArduPilot: автопилот, GPS, компасы, ESC, сервоприводы, датчики питания. Здесь он разбирается и собирается тем же способом, что официальная библиотека libcanard.

## ✨ Что умеет

- 📚 Знает все 147 типов из официального набора DSDL: стандартные `uavcan.*`, `dronecan.*`, `ardupilot.*` и типы производителей.
- 🔍 Разбирает передачу в значение по полям, например `uavcan.protocol.NodeStatus` в `{ uptime_sec, health, mode, sub_mode, vendor_specific_status_code }`.
- 🧱 Собирает передачу из значения и режет её на кадры CAN для отправки.
- 🧩 Собирает многокадровые передачи из кадров и проверяет их CRC.
- 🔌 Кадры читает и пишет slcan-адаптер (CANable, WeAct USB2CANFD и подобные), функции для этого есть в `poe-svelte-ui-lib/protocols`.

## 🧩 Как пользоваться

Отдельная точка входа: таблица типов большая, и вебу прошивок она не нужна.

```ts
import { createDroneCanTransferReceiver, decodeDroneCanTransfer, encodeDroneCanTransfer } from "poe-svelte-ui-lib/dronecan"
import { createSlcanReader, encodeSlcanExtFrame } from "poe-svelte-ui-lib/protocols"

const slcan = createSlcanReader()
const transfers = createDroneCanTransferReceiver()

/* Приём: байты порта -> кадры -> передачи -> значения */
for (const frame of slcan.push(bytes)) {
  if (!frame.ext) continue
  const t = transfers.push(frame.canId, frame.data, frame.timestamp)
  if (t) console.log(t.source, decodeDroneCanTransfer(t))
}

/* Отправка: запрос параметра узлу 10 от нашего узла 100 */
const { canId, frames } = encodeDroneCanTransfer({
  typeName: "uavcan.protocol.param.GetSet",
  type: "req",
  value: { index: 0, value: { empty: {} }, name: "COMPASS_ENABLE" },
  source: 100,
  destination: 10,
  transferId: 0,
})
const text = frames.map((data) => encodeSlcanExtFrame(canId, data)).join("")
```

Канал slcan-адаптера открывают командами `slcanOpenCommands("S8")`: классический CAN 1 Мбит/с, на нём работает ArduPilot.

## 💡 Полезно знать

- 🔢 Числа шире 53 бит приходят как `bigint`, остальные - `number`.
- 🔤 Массив байт из печатных символов ASCII приходит строкой (имена узлов и параметров), пустой - пустой строкой. При сборке поле массива байт принимает строку, массив чисел или `Uint8Array`.
- 🔀 Поле-union - объект с одним ключом выбранного варианта, например `{ integer_value: 5 }`, пустой вариант - `{ empty: {} }`.
- 🧯 Значение вне диапазона поля прижимается к краю (`saturated`), у полей `truncated` лишние старшие биты отбрасываются.
- ⚠️ Неизвестный тип, неверный CRC или длина, не сошедшаяся с описанием, - `error` в результате разбора, байты передачи остаются в `payload`.
- 🚌 Сборщик принимает передачи всем узлам, а не только своему: терминал видит всю шину.

<details>
<summary>🔧 Как это устроено</summary>

| Файл                 | Что внутри                                                                                                                       |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `generated/types.ts` | Таблица типов: имя, ID по умолчанию, сигнатура, поля. Генерирует `scripts/GenerateDroneCAN.mjs` (`npm run Generate`), не править |
| `bits.ts`            | Побитовая упаковка чисел и float16 - перенос `canardEncodeScalar`, `canardDecodeScalar`, `copyBitArray` из libcanard             |
| `codec.ts`           | Поля структур, union с тегом, массивы и оптимизация хвостового массива (TAO) - как кодеки `dronecan_dsdlc`                       |
| `transfer.ts`        | 29-битный ID, хвостовой байт, CRC-16 с сигнатурой типа, нарезка и сборка кадров - как `canardHandleRxFrame` и `enqueueTxFrames`  |
| `index.ts`           | Разбор и сборка передачи целиком                                                                                                 |

- Описания DSDL лежат в `vendor/dronecan-dsdl` как есть, из официального репозитория github.com/dronecan/DSDL (MIT). Генератор разбирает их и считает сигнатуры так же, как официальный парсер pydronecan: CRC-64-WE по нормализованному описанию, затем вложенные типы.
- Сигнатуры сверены с официальными значениями libcanard и ArduPilot в `tests/dronecan.test.mjs`: NodeStatus `0x0F0868D0C1A7C6F1`, GetNodeInfo, param.GetSet и другие.
- Классический CAN: хвостовой динамический массив с элементами не короче байта передаётся без поля длины (TAO). CAN FD пока не поддержан.
- Многокадровая передача: первые два байта первого кадра - CRC-16-CCITT (начальное 0xFFFF) по сигнатуре типа и данным, по 7 байт данных в кадре, последний байт кадра - хвостовой (начало, конец, toggle, transfer_id).

</details>
