/* api_msg.h - СГЕНЕРИРОВАНО из messages.yaml библиотеки poe-svelte-ui-lib (npm run Generate), вручную не править */
/* Код сообщения - поле Message в VAL ответа и push и в Payload ER! модуля (0 - сообщения нет), параметры шаблона {0}, {1}... - массив Args */
/* Группы: SYS 1-99, CFG 100-199, FS 200-299, FW 300-399, WIFI 400-499, DEV 1000-1999; резерв: 500-999, 2000-65535 */
#pragma once

#include <stdint.h>

typedef enum {
  MSG_NONE                    = 0,

  /* SYS 1-99: Система */
  MSG_SYS_RESTARTING          = 1, /* info: Restarting */
  MSG_SYS_UNKNOWN_COMMAND     = 2, /* error: Unknown command */
  MSG_SYS_INVALID_REQUEST     = 3, /* error: Invalid request data */
  MSG_SYS_NO_MEMORY           = 4, /* error: Not enough device memory */
  MSG_SYS_INTERNAL_ERROR      = 5, /* error: Internal device error */
  MSG_SYS_TIME_UNAVAILABLE    = 6, /* error: Could not get the time */
  MSG_SYS_MODLIST_CHANGED     = 7, /* info: Module list changed */

  /* CFG 100-199: Настройки */
  MSG_CFG_NOT_APPLIED         = 100, /* error: Settings not applied: {0}; {0} - поля через запятую */
  MSG_CFG_INVALID             = 101, /* error: Invalid settings data */
  MSG_CFG_GROUP_NOT_FOUND     = 102, /* warn: Settings group not found */

  /* FS 200-299: Файлы */
  MSG_FS_FILE_DELETED         = 200, /* info: File deleted */
  MSG_FS_FILE_UPLOADED        = 201, /* info: File uploaded */
  MSG_FS_FILE_NOT_FOUND       = 202, /* error: File not found */
  MSG_FS_INVALID_NAME         = 203, /* error: Invalid file name */
  MSG_FS_UNSUPPORTED_TYPE     = 204, /* error: File type not supported */
  MSG_FS_INVALID_REQUEST      = 205, /* error: Invalid file system request */
  MSG_FS_NO_SPACE             = 206, /* error: Not enough space */
  MSG_FS_FILE_TOO_LARGE       = 207, /* error: File is larger than declared */
  MSG_FS_TRANSFER_INTERRUPTED = 208, /* error: File transfer interrupted, try again */
  MSG_FS_TRANSFER_CORRUPTED   = 209, /* error: File corrupted in transfer, try again */
  MSG_FS_ERROR                = 210, /* error: File system error */

  /* FW 300-399: Обновление */
  MSG_FW_DOWNLOADING          = 300, /* info: Downloading firmware */
  MSG_FW_DOWNLOADED           = 301, /* info: Firmware downloaded */
  MSG_FW_DOWNLOAD_TIMEOUT     = 302, /* error: Server did not respond during firmware download */
  MSG_FW_DOWNLOAD_FAILED      = 303, /* error: Could not download firmware */
  MSG_FW_UPGRADING            = 304, /* info: Updating firmware */
  MSG_FW_UPGRADED             = 305, /* info: Firmware updated */
  MSG_FW_UPGRADE_FAILED       = 306, /* error: Firmware update failed */
  MSG_FW_RESYNC               = 307, /* warn: Resending firmware from part {0}; {0} - номер части, с которой загрузчик ждёт передачу */

  /* WIFI 400-499: Wi-Fi */
  MSG_WIFI_UNAVAILABLE        = 400, /* error: Wi-Fi unavailable */
  MSG_WIFI_NOT_STA            = 401, /* error: Wi-Fi client mode required */
  MSG_WIFI_SCAN_BUSY          = 402, /* warn: Network scan already running */
  MSG_WIFI_SCAN_FAILED        = 403, /* error: Could not scan networks */
  MSG_WIFI_CONNECT_FAILED     = 404, /* warn: Could not connect to Wi-Fi {0}, previous network restored; {0} - SSID */

  /* DEV 1000-1999: Изделия */
  MSG_DEV_POWER_LIMIT         = 1000, /* warn: Channel {0} power limit exceeded, channel turned off; {0} - канал */
} api_msg_t;
