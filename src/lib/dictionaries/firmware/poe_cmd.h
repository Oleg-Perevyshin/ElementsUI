/* poe_cmd.h - СГЕНЕРИРОВАНО из poe_cmd.yaml библиотеки xPOE-Stack Lib (npm run Generate), вручную не править */
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

/* Словарь аргументов - единый для всех устройств и обоих фреймворков (.framework/poe_cmd.yaml), 0 = отсутствие аргумента; имён в прошивке нет, только коды */
/* clang-format off */
typedef enum {
  /* 0 - отсутствие аргумента */
  A_UNKNOWN                         = 0,    /* Аргумент отсутствует */

  /* Служебные команды и отладка */
  A_SYSTEM_RESTART                  = 1,    /* SET: перезагрузка устройства */
  A_SYSTEM_DEFAULT_CONFIG           = 2,    /* SET: сброс конфигурации к заводской */
  A_FIRMWARE_DOWNLOAD               = 3,    /* SET: скачивание прошивки с сервера (http_client) */
  A_SYSTEM_FILE_SYSTEM              = 4,    /* Файловая система: GET - снимок, SET {Op: Delete|UploadStart|UploadChunk|UploadDone|DownloadStart|DownloadChunk|DownloadDone} */
  A_SYSTEM_RESET_STORAGE            = 5,    /* SET: очистка хранилища настроек (NVS/Flash) и перезагрузка */
  A_SYSTEM_LOCAL_TIME               = 6,    /* GET: локальное время устройства */
  A_SYSTEM_DATA_UPDATE              = 7,    /* OK!/ER!: обновление данных в интерфейсе (DevCloud ретранслирует SystemDataStream) */
  A_SYSTEM_STACK_INFO               = 8,    /* GET: снимок куч и стеков задач */
  A_SYSTEM_BACKUP                   = 9,    /* Резервная копия конфигурации */
  A_MODULE_BIND_KEY                 = 10,   /* SET: привязка ключа модуля (ModBindKey) */
  A_DEBUG_LOG                       = 11,   /* OK!: сообщение отладки - CBOR-массив [уровень, тег, текст|байты, FHS] */
  A_DEBUG_PLOT                      = 12,   /* OK!: значения графиков отладки - CBOR-карта {"Имя": float32} (LOG_PLOT) */
  A_DEBUG_MIRROR                    = 13,   /* OK!: копия пакета другого интерфейса в консоль (уровень TRACE) - {Dir, If, Trg, Src, HAR, ModSN, Val} */
  A_SYSTEM_DATA_STREAM              = 15,   /* OK!: поток данных групп конфигурации (CS_PushGroupStream) */

  /* Локальная сеть и подключение к облаку */
  A_NETWORK_ACCESS_POINTS           = 21,   /* GET: список точек доступа Wi-Fi */
  A_CLOUD_JOIN_DEVICE               = 23,   /* SET: подтверждение подключения устройства к облаку */
  A_CLOUD_JOIN_USER                 = 24,   /* SET: пользователь подключился к устройству */
  A_CLOUD_LEAVE_USER                = 25,   /* SET: пользователь отключился от устройства */

  /* Модули в рамках изделия */
  A_MODULE_FIND                     = 31,   /* GET/OK!: поиск модулей на шинах изделия */
  A_MODULE_LIST                     = 32,   /* Список модулей изделия (CFG.ModList) */
  A_MODULE_CAPTURE                  = 33,   /* GET/OK!: захват модуля для привязки */
  A_MODULE_INFO                     = 34,   /* GET/OK!: информация о модуле */
  A_MODULE_MODE                     = 35,   /* SET: режим работы модуля */
  A_MODULE_CONFIG                   = 36,   /* GET/SET: конфигурация модуля (группы config_service) */
  A_MODULE_TELEMETRY_1              = 37,   /* Телеметрия модуля, канал 1 */
  A_MODULE_TELEMETRY_2              = 38,   /* Телеметрия модуля, канал 2 */
  A_MODULE_TELEMETRY_3              = 39,   /* Телеметрия модуля, канал 3 */
  A_MODULE_TELEMETRY_4              = 40,   /* Телеметрия модуля, канал 4 */
  A_MODULE_TELEMETRY_5              = 41,   /* Телеметрия модуля, канал 5 */
  A_MODULE_STREAM_1                 = 42,   /* Поток данных модуля, канал 1 */
  A_MODULE_STREAM_2                 = 43,   /* Поток данных модуля, канал 2 */
  A_MODULE_STREAM_3                 = 44,   /* Поток данных модуля, канал 3 */
  A_MODULE_STREAM_4                 = 45,   /* Поток данных модуля, канал 4 */
  A_MODULE_STREAM_5                 = 46,   /* Поток данных модуля, канал 5 */

  /* Обновление прошивки */
  A_FIRMWARE_UPGRADE_START          = 51,   /* Старт обновления: размер и CRC32 образа; приложение уходит в загрузчик, загрузчик стирает место и читает образ сам */
  A_FIRMWARE_UPGRADE_READ           = 52,   /* Загрузчик читает кусок образа у сервера (хаб, терминал): смещение и длина, ответ - смещение и данные */
  A_FIRMWARE_UPGRADE_DONE           = 53,   /* Итог обновления от загрузчика серверу: OK! - CRC32 сошлась, приложение запущено */

  /* Работа с модулями перемещения (оси подвесов, линейные перемещения, серво приводы и подобные) */
  A_MOTION_ENABLE                   = 111,  /* SET: привод - число 1 (включить, держит текущий угол) или 0 (фазы без напряжения, драйвер спит) */
  A_MOTION_MODE                     = 112,  /* SET: режим управления - число: 0 момент, 1 скорость, 2 угол, 3 скорость без обратной связи, 4 угол без обратной связи; продолжает с текущего состояния */
  A_MOTION_TARGET                   = 113,  /* SET: цель в единицах текущего режима (число: В или А, рад/с, рад); с флагом ответа - OK! с состоянием оси (angle, vel, iq, flags) */
  A_MOTION_INFO                     = 115,  /* GET: состояние оси - карта Angle, Vel, Target (рад, рад/с), Iq, Id (А), Uq, Ud (В), Mode, Torq, Flags */
  A_MOTION_CALIBRATE                = 117,  /* SET: калибровка нуля и направления мотора без рывков, результат сохраняется (тело {}) */
  A_MOTION_VELOCITY                 = 118,  /* SET: уставка скорости оси, рад/с (число); с флагом ответа - OK! с состоянием оси (angle, vel, iq, flags) */
  A_MOTION_ANGLE                    = 119,  /* SET: уставка угла оси, рад (число); с флагом ответа - OK! с состоянием оси (angle, vel, iq, flags) */
  A_MOTION_HOME                     = 120,  /* SET: плавный выход оси в начальное положение (MOT.M_Home со скоростью MOT.M_HSpd) с обратной связью (тело {}) */

  /* Работа с модулями ориентации (IMU, магнетометры, GNSS и подобные) */
  A_ORIENTATION_DATA                = 141,  /* SET: углы ориентации от модуля */
  A_ORIENTATION_OFFSET              = 142,  /* Смещения ориентации */
  A_ORIENTATION_ACCEL_CALIBRATE     = 143,  /* Калибровка акселерометра */
  A_ORIENTATION_MAG_CALIBRATE       = 144,  /* Калибровка магнетометра */
  A_ORIENTATION_GYROSCOPE_CALIBRATE = 145,  /* Калибровка гироскопа */

  /* Облако DevCloud (7000..7999): команды самого облака по /ws, устройства их не получают */
  /* Чаты (7000..7099) */
  A_CLOUD_CHAT_MESSAGE              = 7000, /* SET: новое сообщение в чат (браузер - облако - участники) */
  A_CLOUD_CHAT_MESSAGES             = 7001, /* GET/OK!: страница истории чата */
  A_CLOUD_CHAT_SYSTEM_MESSAGE       = 7002, /* SET: сообщение в системный чат (администратор) */
  A_CLOUD_CHAT_EDIT_MESSAGE         = 7003, /* SET/OK!: правка своего сообщения */
  A_CLOUD_CHAT_DELETE_MESSAGE       = 7004, /* SET/OK!: удаление своего сообщения */
  A_CLOUD_CHAT_LAST_READ            = 7005, /* SET: чат прочитан, вкладка чата закрыта */
  A_CLOUD_CHAT_JOIN                 = 7006, /* SET/OK!: вход в чат */
  A_CLOUD_CHAT_USER_CONNECTED       = 7007, /* SET: собеседник открыл чат */
  A_CLOUD_CHAT_UNREAD               = 7008, /* OK!: число непрочитанных в чате */
  A_CLOUD_CHAT_PINS                 = 7009, /* OK!: закреплённые чаты пользователя */
  A_CLOUD_CHAT_EDIT_GROUP           = 7010, /* OK!: чат создан или изменён */
  A_CLOUD_CHAT_REMOVE_USER          = 7011, /* OK!: пользователь удалён из чата */

  /* Устройства в облаке (7100..7199) */
  A_CLOUD_DEVICE_MESSAGES           = 7100, /* GET/OK!: страница журнала устройства */
  A_CLOUD_DEVICE_CONNECTION         = 7101, /* OK!: устройство в сети или ушло из сети */
  A_CLOUD_DEVICE_LEAVE_GROUP        = 7102, /* SET/OK!: выход из группы устройства */
  A_CLOUD_DEVICE_LEAVE_GROUPS       = 7103, /* SET: выход из групп всех устройств */
  A_CLOUD_DEVICE_RESET_TOKEN        = 7104, /* SET/OK!: сброс токена устройства (TOFU) */
} api_argument_t;
/* clang-format on */

/* Важность команды на CAN по коду аргумента: 0 - самый важный, 3 - фон; команды без своей важности - CMD_PRIORITY_DEFAULT */
#define CMD_PRIORITY_DEFAULT 2
static inline uint8_t CMD_Priority(uint16_t arg) {
  switch(arg) {
    case A_MOTION_ENABLE:
    case A_MOTION_TARGET:
    case A_MOTION_VELOCITY:
    case A_MOTION_ANGLE:
      return 0;
    case A_SYSTEM_DATA_UPDATE:
    case A_SYSTEM_DATA_STREAM:
    case A_MODULE_TELEMETRY_1:
    case A_MODULE_TELEMETRY_2:
    case A_MODULE_TELEMETRY_3:
    case A_MODULE_TELEMETRY_4:
    case A_MODULE_TELEMETRY_5:
    case A_MODULE_STREAM_1:
    case A_MODULE_STREAM_2:
    case A_MODULE_STREAM_3:
    case A_MODULE_STREAM_4:
    case A_MODULE_STREAM_5:
    case A_FIRMWARE_UPGRADE_START:
    case A_FIRMWARE_UPGRADE_READ:
    case A_FIRMWARE_UPGRADE_DONE:
    case A_ORIENTATION_DATA:
      return 1;
    case A_SYSTEM_FILE_SYSTEM:
    case A_DEBUG_LOG:
    case A_DEBUG_PLOT:
    case A_DEBUG_MIRROR:
      return 3;
    default:
      return CMD_PRIORITY_DEFAULT;
  }
}
