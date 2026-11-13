/* api_har.h - СГЕНЕРИРОВАНО из commands.yaml библиотеки poe-svelte-ui-lib (npm run Generate), вручную не править */
#pragma once
#include <stdint.h>

/* ********************************************************** */
/* Команда пакета: заголовок, аргумент и признак «нужен ответ» в одном 16-битном слове */
typedef union {
  struct {
    uint16_t reply : 1;  /* Бит 0: 1 - получатель отвечает */
    uint16_t arg   : 13; /* Биты 1-13: аргумент (0..8191) */
    uint16_t hdr   : 2;  /* Биты 14-15: заголовок (GET SET OK! ER!) */
  };
  uint16_t word;
} har_t;

/* Готовое слово HAR: HAR - с ответом, HAR_NR - без ответа */
#define HAR(_h, _a)    (((har_t) {.hdr = (_h), .arg = (_a), .reply = 1}).word)
#define HAR_NR(_h, _a) (((har_t) {.hdr = (_h), .arg = (_a), .reply = 0}).word)

/* Коды заголовков */
typedef enum { H_GET = 0, H_SET = 1, H_OK = 2, H_ER = 3 } api_header_t;

/* Словарь аргументов - единый для всех устройств и обоих фреймворков (.framework/Dictionary.yaml), 0 = отсутствие аргумента; имён в прошивке нет, только коды */
typedef enum {
  /* 0 - отсутствие аргумента */
  A_UNKNOWN           = 0, /* Аргумент отсутствует */

  /* Служебные команды */
  A_RESTART           = 1,  /* SET: перезагрузка устройства */
  A_DEF_CONFIG        = 2,  /* SET: сброс конфигурации к заводской */
  A_DOWNLOAD_FIRMWARE = 3,  /* SET: скачивание прошивки с сервера (http_client) */
  A_RESET_NVS         = 5,  /* SET: очистка NVS и перезагрузка */
  A_LOCAL_TIME        = 6,  /* GET: локальное время устройства */
  A_UPDATE            = 7,  /* OK!/ER!: обновление данных в интерфейсе (DevCloud ретранслирует DataStream) */
  A_STACK_INFO        = 8,  /* GET: снимок куч и стеков задач */
  A_BACKUP            = 9,  /* Резервная копия конфигурации */
  A_BIND_MOD_KEY      = 10, /* SET: привязка ключа модуля (ModBindKey) */
  A_DEBUG_LOG         = 11, /* OK!: сообщение отладки - CBOR-массив [уровень, тег, текст|байты, FHS] */
  A_DEBUG_PLOT        = 12, /* OK!: значения графиков отладки - CBOR-карта {"Имя": float32} (LOG_PLOT) */
  A_DATA_STREAM       = 15, /* OK!: поток данных групп конфигурации (CS_PushGroupStream) */

  /* Локальная сеть */
  A_APS_LIST          = 21, /* GET: список точек доступа Wi-Fi */
  A_FS = 22, /* Файловая система: GET FS - снимок, SET FS {Op: Delete|UploadStart|UploadChunk|UploadDone|DownloadStart|DownloadChunk|DownloadDone} */
  A_JOIN_DEV                = 23, /* SET: подтверждение подключения устройства к облаку */
  A_JOIN_USER               = 24, /* SET: пользователь подключился к устройству */
  A_LEAVE_USER              = 25, /* SET: пользователь отключился от устройства */

  /* Модули в рамках изделия */
  A_MODULE_FIND             = 31, /* GET/OK!: поиск модулей на шинах изделия */
  A_MODULE_LIST             = 32, /* Список модулей изделия (CFG.ModList) */
  A_MODULE_CAPTURE          = 33, /* GET/OK!: захват модуля для привязки */
  A_MODULE_INFO             = 34, /* GET/OK!: информация о модуле */
  A_MODULE_MODE             = 35, /* SET: режим работы модуля */
  A_MODULE_CFG              = 36, /* GET/SET: конфигурация модуля (группы config_service) */
  A_MODULE_TELEMETRY_1      = 37, /* Телеметрия модуля, канал 1 */
  A_MODULE_TELEMETRY_2      = 38, /* Телеметрия модуля, канал 2 */
  A_MODULE_TELEMETRY_3      = 39, /* Телеметрия модуля, канал 3 */
  A_MODULE_TELEMETRY_4      = 40, /* Телеметрия модуля, канал 4 */
  A_MODULE_TELEMETRY_5      = 41, /* Телеметрия модуля, канал 5 */
  A_MODULE_STREAM_1         = 42, /* Поток данных модуля, канал 1 */
  A_MODULE_STREAM_2         = 43, /* Поток данных модуля, канал 2 */
  A_MODULE_STREAM_3         = 44, /* Поток данных модуля, канал 3 */
  A_MODULE_STREAM_4         = 45, /* Поток данных модуля, канал 4 */
  A_MODULE_STREAM_5         = 46, /* Поток данных модуля, канал 5 */

  /* Обновление прошивки */
  A_UPGRADE_START           = 51, /* Старт обновления прошивки модуля по шине */
  A_UPGRADE_PROC            = 52, /* Блок прошивки при обновлении по шине */
  A_UPGRADE_DONE            = 53, /* Завершение обновления прошивки по шине */
  A_UPGRADE_ERR             = 54, /* Ошибка обновления прошивки по шине */

  /* Работа с модулями перемещения (оси подвесов, линейные перемещения, серво приводы и подобные) */
  A_MOTION_INIT             = 111, /* SET: включение/калибровка (1 байт: команда) */
  A_MOTION_MODE             = 112, /* SET: режим управления (2 байта: ctrl_mode + torque_mode) */
  A_MOTION_POS              = 113, /* GET/SET: целевое значение (4 байта: float) */
  A_MOTION_PID              = 114, /* SET: коэффициенты PID (13 байт: selector + Kp + Ki + Kd) */
  A_MOTION_INFO             = 115, /* GET: телеметрия (32 байта: angle+vel+Iq+Id+target+flags) */
  A_MOTION_CFG              = 116, /* GET/SET: конфигурация мотора (28 байт: лимиты+параметры) */
  A_MOTION_CAL              = 117, /* SET: запуск калибровки нулевого угла (0 байт) */

  /* Работа с модулями ориентации (IMU, магнетометры, GNSS и подобные) */
  A_ORIENTATION_DATA        = 141, /* SET: углы ориентации от модуля */
  A_ORIENTATION_OFFSET      = 142, /* Смещения ориентации */
  A_ORIENTATION_ACC_CALIB   = 143, /* Калибровка акселерометра */
  A_ORIENTATION_MAG_CALIB   = 144, /* Калибровка магнетометра */

  /* Облако DevCloud (7000..7999): команды самого облака по /ws, устройства их не получают */
  /* Чаты (7000..7099) */
  A_CLOUD_CHAT_MESSAGE      = 7000, /* SET: новое сообщение в чат (браузер - облако - участники) */
  A_CLOUD_CHAT_MESSAGES     = 7001, /* GET/OK!: страница истории чата */
  A_CLOUD_SYSTEM_MESSAGE    = 7002, /* SET: сообщение в системный чат (администратор) */
  A_CLOUD_EDIT_MESSAGE      = 7003, /* SET/OK!: правка своего сообщения */
  A_CLOUD_DELETE_MESSAGE    = 7004, /* SET/OK!: удаление своего сообщения */
  A_CLOUD_UPDATE_LAST_READ  = 7005, /* SET: чат прочитан, вкладка чата закрыта */
  A_CLOUD_JOIN_CHAT         = 7006, /* SET/OK!: вход в чат */
  A_CLOUD_USER_CONNECTED    = 7007, /* SET: собеседник открыл чат */
  A_CLOUD_CHAT_UNREAD       = 7008, /* OK!: число непрочитанных в чате */
  A_CLOUD_CHAT_PINS         = 7009, /* OK!: закреплённые чаты пользователя */
  A_CLOUD_EDIT_CHAT_GROUP   = 7010, /* OK!: чат создан или изменён */
  A_CLOUD_REMOVE_FROM_CHAT  = 7011, /* OK!: пользователь удалён из чата */

  /* Устройства в облаке (7100..7199) */
  A_CLOUD_DEVICE_MESSAGES   = 7100, /* GET/OK!: страница журнала устройства */
  A_CLOUD_DEVICE_CONNECTION = 7101, /* OK!: устройство в сети или ушло из сети */
  A_CLOUD_LEAVE_GROUP       = 7102, /* SET/OK!: выход из группы устройства */
  A_CLOUD_LEAVE_GROUPS      = 7103, /* SET: выход из групп всех устройств */
  A_CLOUD_RESET_DEV_TOKEN   = 7104, /* SET/OK!: сброс токена устройства (TOFU) */
} api_argument_t;
