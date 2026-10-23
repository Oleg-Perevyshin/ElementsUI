# 📡 Протокол POE на базе CBOR

Один бинарный пакет `poe_cbor_pkt` на всех проводах: CAN, CAN FD, RS485, LoRa и UART-консоль (xPOE-Debug). Отдельный конверт — только у WebSocket облака.
Реализации: прошивки ProdFactory-ESP / ProdFactory-STM (`components/core/poe_cbor`, `api_service`) и ядро `poe-svelte-ui-lib/protocols` (DevCloud, SYP-DevTerminal, WebApp).

## 📦 Пакет

```
0x9F  [TrgBusID, SrcBusID, HAR, Payload, CRC16]  [ … ]  0xFF
```

- Пакет — CBOR-массив неопределённой длины (`0x9F` … `0xFF`), записей сколько угодно: разным адресатам или несколько одному, порядок сохраняется
- Запись — массив ровно из 5 элементов (`0x85`); `0x9F 0x85` — маркер начала пакета в потоке
- Числа — минимальной длиной CBOR: меньше 24 — 1 байт, до 255 — 2, до 65535 — 3

| Поле       | Тип       | Смысл                                                                               |
| ---------- | --------- | ----------------------------------------------------------------------------------- |
| `TrgBusID` | uint16    | Адресат: BusID модуля, `0xFFFF` — всем                                              |
| `SrcBusID` | uint16    | Отправитель, ответ уходит ему; `0x0000` — внешний клиент (терминал, отладка облака) |
| `HAR`      | uint16    | Заголовок, аргумент и флаг ответа                                                   |
| `Payload`  | CBOR item | Тело команды                                                                        |
| `CRC16`    | uint16    | CRC-16/KERMIT записи                                                                |

## 🔢 HAR

```
бит 15-14  hdr    0 GET · 1 SET · 2 OK! · 3 ER!
бит 13-1   arg    код из словаря, 0..8191
бит 0      reply  1 — получатель отвечает
```

- Прошивка: `har_t` (`api_har.h`), `HAR(h, a)` — с ответом, `HAR_NR(h, a)` — без; библиотека: `makeHar` / `splitHar`
- Ответ — только на запрос с `reply = 1`, сам ответ всегда без флага; телеметрия и потоки — `HAR_NR`
- Строки (`"GET"`, `"ModCfg"`) по проводу не передаются; словарь один — `dictionary.yaml` этой библиотеки, в прошивках копия `.framework/Dictionary.yaml`, сборка сверяет с ней `api_har.h`
- Всё отладочное в словаре начинается с `Debug`: `DebugLog` = 11, `DebugPlot` = 12

## 📄 Payload — всегда одно CBOR item

| Данные                       | Кодирование                                                                                                                                |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Карта, массив, число, строка | Как есть (ответы `Writer_*`, `{"CfgGroup":"CFG"}`)                                                                                         |
| Сырые бинарные поля          | Байтовая строка `h'…'`: `CBOR_PACK` / `CBOR_EncodeFields`, разбор — `CBOR_UNPACK` (снимает байтовую строку и сверяет длину с суммой полей) |
| Пустое тело                  | `null` (`0xF6`), в `pkt->data` — `data_len = 0`                                                                                            |

Флагов формата нет — тип виден по самому CBOR.

## ✅ CRC-16/KERMIT

- Полином `0x8408` (отражённый `0x1021`), init 0, `check("123456789") = 0x2189`
- Считается по CBOR-байтам записи от `0x85` до конца `Payload`, поле CRC не входит — покрывает адреса и флаг ответа
- Запись с неверным CRC пропускается, остальные записи пакета принимаются

## 🧭 Адресация

- BusID модуля — CRC16 серийного номера (`get_dev_bus_id`), `0x0000` и `0xFFFF` модулю не выдаются
- Шина: модуль принимает записи со своим `TrgBusID` и `0xFFFF`, собственное эхо (CAN loopback, RS485) отбрасывает по `SrcBusID`
- Консоль: `0x0000`, свой BusID и `0xFFFF` — этот модуль, BusID модуля из `ModList` — головной модуль пересылает команду по `ModSN` и возвращает ответ
- Без обработчика: `OK!`/`ER!` и широковещательные — молча, адресованные `GET`/`SET` — в лог

## 🚌 Транспорты

| Канал        | Передача                                                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| CAN / CAN FD | Кадры по 8 / 64 байта; 11-битный ID: бит 10 — последний фрагмент, биты 9-0 — номер пакета; паддинг CAN FD отрезается по длине пакета |
| RS485        | Сырой поток: начало `0x9F 0x85`, пауза приёма (20 мс) сбрасывает недособранный хвост, мусор сдвигается по байту                      |
| LoRa         | Пакет целиком в радиокадре                                                                                                           |
| UART-консоль | Сырой поток вперемешку с текстом загрузчика: начало `0x9F 0x85`, остальное — текст (RAW), хвост сбрасывается после 100 мс тишины     |

## 🐞 Консоль: отладочные пакеты

Прошивка шлёт их с `TrgBusID = 0`, `SrcBusID` = свой BusID, без флага ответа.

| HAR             | Payload                                                      |
| --------------- | ------------------------------------------------------------ |
| `OK! DebugLog`  | `[уровень, тег, текст или байты, FHS]`, FHS — свободная куча |
| `OK! DebugPlot` | `{"Группа.Имя": float32, …}` — один вызов `LOG_PLOT`         |

Ответ API в консоль — голый `Payload`; непустой `Message` приходит отдельным `DebugLog`.

## 🌐 WebSocket (облако и локальный веб)

```
запрос  {HDR, ARG, VAL: {DevSN, ModSN?, TrgBusID?, SrcBusID?, Payload?}}
ответ   {HDR, ARG, VAL: {DevSN, ModSN, Message, Payload}}
```

`DevSN` обязателен и должен совпасть с устройством, `ModSN` — адресат (без него — головной модуль). Приём — `API_Service_ReceiveWsPacket`, ответ — `API_Service_BeginResponse`; ответ модуля с шины головной модуль оборачивает в конверт сам.

## 💡 Пример: `GET ModCfg {}` из терминала

```
9F  85  00  00  18 49  A0  19 66 06  FF
│   │   │   │   │      │   │         └ конец пакета
│   │   │   │   │      │   └ CRC16 = 0x6606
│   │   │   │   │      └ Payload = {}
│   │   │   │   └ HAR = 0x0049: GET, arg 36 (ModCfg), reply = 1
│   │   │   └ SrcBusID = 0x0000 (терминал)
│   │   └ TrgBusID = 0x0000 (модуль консоли)
│   └ запись из 5 полей
└ начало пакета
```

## 🧩 API

|         | Прошивка (ESP и STM)                                                                                                                             | `poe-svelte-ui-lib/protocols`                                                          |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| Пакет   | `CBOR_PktEncInit` / `CBOR_PktEncAddRaw` / `CBOR_PACK` / `CBOR_PktEncFinish`, `CBOR_PktDecInit` / `CBOR_PktDecNext`, поток — `CBOR_PktStreamPush` | `encodePacket`, `decodePacket`, `createPacketStreamParser`, `encodePacketBytesPayload` |
| HAR     | `har_t`, `HAR`, `HAR_NR`, `API_Service_HarName`, `API_Service_HarByName`                                                                         | `makeHar`, `splitHar`, `xPoeDebugHar`, `HEADER_CODES`, `DEFAULT_ARGUMENT_CODES`        |
| Приём   | `API_Service_ReceiveBusPacket`, `API_Service_ReceiveWsPacket`, консоль — `system_console`                                                        | `createXPoeDebugParser`, `createCanParser`                                             |
| Ответ   | `API_Service_BeginResponse`, `Writer_*`, `API_Service_FinishResponse`                                                                            | —                                                                                      |
| Консоль | `LOG_*`, `LOG_HEX`, `LOG_PLOT`                                                                                                                   | `encodeXPoeDebugFrame`, `xPoeDebugRow`, `xPoeDebugTableColumns`, `debugPlotValues`     |
| CAN     | `can_service`                                                                                                                                    | `encodeCanPacket`, `createCanParser`, `slcanOpenCommands`                              |
| Тесты   | хостовые `tests/` прошивок                                                                                                                       | `npm run TestProtocols` по эталонным байтам прошивки                                   |
