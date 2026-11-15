/* api_msg.h - СГЕНЕРИРОВАНО из messages.yaml библиотеки poe-svelte-ui-lib (npm run Generate), вручную не править */
/* Код сообщения - поле Message в VAL ответа и push и в Payload ER! модуля (0 - сообщения нет), параметры шаблона {0}, {1}... - массив Args */
/* Группы: SYS 1-99, CFG 100-199, FS 200-299, FW 300-399, WIFI 400-499, API 500-599, BUS 600-699, NET 700-799, LORA 800-899, DEV 1000-1999, DRV 2000-2999; резерв: 900-999, 3000-65535 */
#pragma once

#include <stdint.h>

typedef enum {
  MSG_NONE                     = 0,

  /* SYS 1-99: Система */
  MSG_SYS_RESTARTING           = 1,  /* info: Restarting */
  MSG_SYS_UNKNOWN_COMMAND      = 2,  /* error: Unknown command */
  MSG_SYS_INVALID_REQUEST      = 3,  /* error: Invalid request data */
  MSG_SYS_NO_MEMORY            = 4,  /* error: Not enough device memory */
  MSG_SYS_INTERNAL_ERROR       = 5,  /* error: Internal device error */
  MSG_SYS_TIME_UNAVAILABLE     = 6,  /* error: Could not get the time */
  MSG_SYS_MODLIST_CHANGED      = 7,  /* info: Module list changed */
  MSG_SYS_INVALID_ARG          = 8,  /* error: Invalid argument */
  MSG_SYS_INVALID_STATE        = 9,  /* error: Invalid state */
  MSG_SYS_NOT_FOUND            = 10, /* error: Not found */
  MSG_SYS_INVALID_SIZE         = 11, /* error: Invalid size */
  MSG_SYS_TIMEOUT              = 12, /* error: Timed out */
  MSG_SYS_NOT_SUPPORTED        = 13, /* error: Not supported */
  MSG_SYS_NOT_ALLOWED          = 14, /* error: Not allowed */
  MSG_SYS_INVALID_CRC          = 15, /* error: Invalid checksum */
  MSG_SYS_TASK_CREATE_FAILED   = 16, /* error: Could not create task */
  MSG_SYS_TASK_STOPPED         = 17, /* error: Task stopped */
  MSG_SYS_ALREADY_INIT         = 18, /* warn: Already started */
  MSG_SYS_APP_STARTED          = 19, /* info: Device started */
  MSG_SYS_STACK_OVERFLOW       = 20, /* error: Task {0} stack overflow */
  MSG_SYS_HEAP_OVERFLOW        = 21, /* error: Out of memory */
  MSG_SYS_LOW_VOLTAGE          = 22, /* warn: Low supply voltage */

  /* CFG 100-199: Настройки */
  MSG_CFG_NOT_APPLIED          = 100, /* error: Settings not applied: {0}; {0} - поля через запятую */
  MSG_CFG_INVALID              = 101, /* error: Invalid settings data */
  MSG_CFG_GROUP_NOT_FOUND      = 102, /* warn: Settings group not found */
  MSG_CFG_GROUP_REG_FAILED     = 103, /* error: Could not register settings group */
  MSG_CFG_GROUP_LOAD_FAILED    = 104, /* warn: Settings not loaded, factory values used */
  MSG_CFG_NAME_TOO_LONG        = 105, /* error: Name {0} is longer than {1} characters */
  MSG_CFG_TOKEN_SAVE_FAILED    = 106, /* warn: Device token not saved */
  MSG_CFG_KEY_NOT_FOUND        = 107, /* warn: Setting {0} missing, factory value used */
  MSG_CFG_STORAGE_FAILED       = 108, /* error: Settings storage unavailable */
  MSG_CFG_SAVE_FAILED          = 109, /* error: Setting {0} not saved */
  MSG_CFG_DEFAULTS             = 110, /* warn: No settings, factory values used */
  MSG_CFG_DEFAULTS_ADDED       = 111, /* warn: Factory values set for new settings {0} */
  MSG_CFG_OUT_OF_RANGE         = 112, /* warn: Setting {0} out of range, factory value used */
  MSG_CFG_READ_FAILED          = 113, /* warn: Setting {0} not read */
  MSG_CFG_ERASED               = 114, /* info: Settings erased */
  MSG_CFG_ERASED_TOKEN_KEPT    = 115, /* info: Settings erased, device token kept */
  MSG_CFG_GROUP_FAILED         = 116, /* warn: Group {0} not sent */
  MSG_CFG_CHANGES_NOT_REPORTED = 117, /* warn: Change {0} applied but not sent: too many changes */
  MSG_CFG_GROUP_TOO_LARGE      = 118, /* error: Group {0}: {1} bytes exceed page of {2} bytes */
  MSG_CFG_PAGE_INVALID         = 119, /* warn: Settings page {0} invalid ({1}), erasing */
  MSG_CFG_PAGE_RECOVERED       = 120, /* warn: Page {0} recovered after interrupted compaction */
  MSG_CFG_STORAGE_FULL         = 121, /* warn: Settings storage full */
  MSG_CFG_GROUP_SAVE_FAILED    = 122, /* error: Settings group not saved */
  MSG_CFG_DEVNAME_GENERATED    = 123, /* warn: Empty device name replaced with {0} */
  MSG_CFG_NO_DEVICE_ID         = 124, /* error: Device model code not set */
  MSG_CFG_FIELD_READ_ONLY      = 125, /* warn: Setting {0} is read-only */
  MSG_CFG_FIELD_BYTES_EXPECTED = 126, /* warn: Setting {0}: bytes 0-255 expected */
  MSG_CFG_FIELD_TOO_LONG       = 127, /* warn: Setting {0} is too long */
  MSG_CFG_FIELD_OUT_OF_TYPE    = 128, /* warn: Setting {0} out of type range */
  MSG_CFG_FIELD_OUT_OF_RANGE   = 129, /* warn: Setting {0} out of range {1}..{2} */
  MSG_CFG_FLASH_ERROR          = 130, /* error: Flash write or erase error */

  /* FS 200-299: Файлы */
  MSG_FS_FILE_DELETED          = 200, /* info: File deleted */
  MSG_FS_FILE_UPLOADED         = 201, /* info: File uploaded */
  MSG_FS_FILE_NOT_FOUND        = 202, /* error: File not found */
  MSG_FS_INVALID_NAME          = 203, /* error: Invalid file name */
  MSG_FS_UNSUPPORTED_TYPE      = 204, /* error: File type not supported */
  MSG_FS_INVALID_REQUEST       = 205, /* error: Invalid file system request */
  MSG_FS_NO_SPACE              = 206, /* error: Not enough space */
  MSG_FS_FILE_TOO_LARGE        = 207, /* error: File is larger than declared */
  MSG_FS_TRANSFER_INTERRUPTED  = 208, /* error: File transfer interrupted, try again */
  MSG_FS_TRANSFER_CORRUPTED    = 209, /* error: File corrupted in transfer, try again */
  MSG_FS_ERROR                 = 210, /* error: File system error */
  MSG_FS_SESSION_TIMEOUT       = 211, /* warn: File {0} transfer timed out */
  MSG_FS_SIZE_MISMATCH         = 212, /* error: Received {0} bytes, expected {1} */

  /* FW 300-399: Обновление */
  MSG_FW_DOWNLOADING           = 300, /* info: Downloading firmware */
  MSG_FW_DOWNLOADED            = 301, /* info: Firmware downloaded */
  MSG_FW_DOWNLOAD_TIMEOUT      = 302, /* error: Server did not respond during firmware download */
  MSG_FW_DOWNLOAD_FAILED       = 303, /* error: Could not download firmware */
  MSG_FW_UPGRADING             = 304, /* info: Updating firmware */
  MSG_FW_UPGRADED              = 305, /* info: Firmware updated */
  MSG_FW_UPGRADE_FAILED        = 306, /* error: Firmware update failed */
  MSG_FW_RESYNC                = 307, /* warn: Resending firmware from part {0}; {0} - номер части, с которой загрузчик ждёт передачу */
  MSG_FW_FILE_SIZE_INVALID     = 308, /* error: Firmware size {0} exceeds {1} */
  MSG_FW_WRITE_FAILED          = 309, /* error: Firmware not written */
  MSG_FW_IMAGE_INVALID         = 310, /* error: Invalid firmware image */
  MSG_FW_TARGET_NO_RESPONSE    = 311, /* error: Module did not answer update start */
  MSG_FW_BLOCK_SIZE_INVALID    = 312, /* error: Module sent invalid block size */
  MSG_FW_RESYNC_FAILED         = 313, /* error: Resend from block {0} of {1} failed */
  MSG_FW_FRAME_REJECTED        = 314, /* error: Module rejected block {0}, message {1} */
  MSG_FW_RADIO_RESTORE_FAILED  = 315, /* warn: Radio profile not restored */
  MSG_FW_BUSY                  = 316, /* warn: Update already in progress */
  MSG_FW_MARKED_VALID          = 317, /* info: New firmware confirmed */
  MSG_FW_MARK_VALID_FAILED     = 318, /* warn: New firmware not confirmed */
  MSG_FW_VALIDATING            = 319, /* warn: New firmware, confirmation in {0} s */
  MSG_FW_FILE_FAILED           = 320, /* error: Firmware file not read */

  /* WIFI 400-499: Wi-Fi */
  MSG_WIFI_UNAVAILABLE         = 400, /* error: Wi-Fi unavailable */
  MSG_WIFI_NOT_STA             = 401, /* error: Wi-Fi client mode required */
  MSG_WIFI_SCAN_BUSY           = 402, /* warn: Network scan already running */
  MSG_WIFI_SCAN_FAILED         = 403, /* error: Could not scan networks */
  MSG_WIFI_CONNECT_FAILED      = 404, /* warn: Could not connect to Wi-Fi {0}, previous network restored; {0} - SSID */
  MSG_WIFI_AP_PSK_INVALID      = 405, /* warn: Access point password rejected: empty or 8-63 characters */
  MSG_WIFI_SAFE_AP             = 406, /* warn: Invalid Wi-Fi settings, backup access point on */
  MSG_WIFI_APPLY_FAILED        = 407, /* error: Wi-Fi settings not applied, step {0} */
  MSG_WIFI_STATIC_IP_EMPTY     = 408, /* warn: Static address not set, DHCP on */
  MSG_WIFI_DISCONNECTED        = 409, /* warn: Wi-Fi disconnected, reason {0}, attempt {1} of {2} */
  MSG_WIFI_RECONNECT_FAILED    = 410, /* warn: Reconnect failed, reason {0} */
  MSG_WIFI_CONNECTED_SAVED     = 411, /* info: Connected to {0}, saved */
  MSG_WIFI_RESTORED            = 412, /* error: Not connected to {0}, restored {1} */
  MSG_WIFI_NOTICE_DROPPED      = 413, /* warn: Cloud not connected, notice not sent */
  MSG_WIFI_MODE_CHANGE_FAILED  = 414, /* error: Wi-Fi mode not changed, backup access point on */
  MSG_WIFI_SAFE_AP_FAILED      = 415, /* error: Backup access point did not start */

  /* API 500-599: Обмен */
  MSG_API_PAYLOAD_TOO_LARGE    = 500, /* error: Data of {0} bytes does not fit the packet */
  MSG_API_ENCODE_FAILED        = 501, /* error: Packet not encoded */
  MSG_API_SEND_FAILED          = 502, /* warn: Packet not sent */
  MSG_API_NO_BUFFER            = 503, /* warn: No free packet buffer */
  MSG_API_TOKEN_SAVED          = 504, /* info: Device token saved, reconnecting */
  MSG_API_TOKEN_REISSUED       = 505, /* warn: Cloud keeps reissuing the token, no reconnect */
  MSG_API_UNKNOWN_COMMAND      = 506, /* warn: No handler for command {0} */
  MSG_API_BUFFER_EXPIRED       = 507, /* error: Packet buffer {0} held too long */
  MSG_API_QUEUE_FULL           = 508, /* error: Packet queue full */
  MSG_API_INVALID_ENVELOPE     = 509, /* warn: WebSocket packet without HAR, VAL or DevSN */
  MSG_API_INVALID_MODSN        = 510, /* warn: Invalid module serial number {0} */
  MSG_API_BOOTLOADER           = 511, /* info: Restarting into bootloader */
  MSG_API_PLOT_TOO_MANY        = 512, /* warn: Too many plot values: {0} */
  MSG_API_UNKNOWN_BUSID        = 513, /* warn: Unknown address {0} */
  MSG_API_BAD_PACKET           = 514, /* warn: Corrupted packet */
  MSG_API_MODLIST_FULL         = 515, /* warn: Module list full: {0} */
  MSG_API_NEIGHBORS_FULL       = 516, /* warn: Neighbor list full: {0} */
  MSG_API_INVALID_SN           = 517, /* warn: Invalid serial number {0} */
  MSG_API_UNKNOWN_MODSN        = 518, /* warn: Module {0} not found, packet dropped */
  MSG_API_BUFFER_ERROR         = 519, /* error: Packet buffer error */

  /* BUS 600-699: Шины */
  MSG_BUS_TX_BUSY              = 600, /* error: Transmitter busy */
  MSG_BUS_RX_OVERFLOW          = 601, /* error: Receive buffer overflow */
  MSG_BUS_CAN_OFF              = 602, /* error: CAN bus off, restarting */
  MSG_BUS_REINIT_FAILED        = 603, /* error: Controller restart failed */
  MSG_BUS_GPIO_FAILED          = 604, /* error: Pin not configured */
  MSG_BUS_NOT_SUPPORTED        = 605, /* error: Bus not supported */
  MSG_BUS_INIT_FAILED          = 606, /* error: Bus did not start */
  MSG_BUS_NOT_INIT             = 607, /* error: Bus {0} not started */
  MSG_BUS_DEV_EXISTS           = 608, /* warn: Bus {0}: device {1} already attached */
  MSG_BUS_DEV_LIMIT            = 609, /* error: Device limit reached: {0} */
  MSG_BUS_DEV_FAILED           = 610, /* error: Bus {0}: device {1} not responding */
  MSG_BUS_SCAN_FOUND           = 611, /* info: Bus {0}: found {1} */
  MSG_BUS_SCAN_EMPTY           = 612, /* info: Bus {0}: no devices */
  MSG_BUS_STUCK_LOW            = 613, /* error: Bus line held low */
  MSG_BUS_PACKET_LOST          = 614, /* error: Packet lost after {0} attempts */
  MSG_BUS_BITRATE_DEFAULT      = 615, /* warn: Bitrate {0} not supported, using {1} */
  MSG_BUS_XFER_FAILED          = 616, /* error: Bus transfer error */
  MSG_BUS_ADC_NO_CALIB         = 617, /* warn: ADC {0} has no calibration, raw values used */
  MSG_BUS_EXTI_BUSY            = 618, /* error: Interrupt line {0} busy */
  MSG_BUS_CAN_RX_LOST          = 619, /* error: Packet {0} lost on receive */
  MSG_BUS_TX_RETRY             = 620, /* warn: Not sent, attempt {0} of {1} */

  /* NET 700-799: Сеть */
  MSG_NET_TASK_KEPT            = 700, /* error: Task did not exit */
  MSG_NET_LOGIN_FAILED         = 701, /* warn: Login failed, next attempt in {0} ms */
  MSG_NET_FOREIGN_ORIGIN       = 702, /* warn: Request from foreign site rejected */
  MSG_NET_NO_SESSION           = 703, /* warn: Connection without session rejected */
  MSG_NET_HTTP_FAILED          = 704, /* error: Web server did not start */
  MSG_NET_URI_FAILED           = 705, /* error: URI {0} not registered */
  MSG_NET_MDNS_FAILED          = 706, /* error: mDNS did not start */
  MSG_NET_SSDP_BAD_REPLY       = 707, /* warn: Invalid SSDP reply */
  MSG_NET_NOT_READY            = 708, /* warn: Network not ready */
  MSG_NET_DOWNLOAD_TIMEOUT     = 709, /* error: Download aborted: no response for {0} s */
  MSG_NET_CLIENT_FAILED        = 710, /* error: Client not created */
  MSG_NET_METADATA_FAILED      = 711, /* warn: Firmware info not received: error {0}, HTTP {1} */
  MSG_NET_METADATA_INVALID     = 712, /* warn: Firmware info invalid */
  MSG_NET_METADATA_MISMATCH    = 713, /* warn: Received firmware {0} v{1}, requested {2} v{3} */
  MSG_NET_DOWNLOAD_BUSY        = 714, /* warn: Download already in progress */
  MSG_NET_WS_FAILED            = 715, /* error: WebSocket did not start */
  MSG_NET_STREAM_LIMIT         = 716, /* error: No more than {0} streams */
  MSG_NET_SOCKET_ERROR         = 717, /* error: Socket error {0} */

  /* LORA 800-899: LoRa */
  MSG_LORA_SEND_LOST           = 800, /* error: Packet lost after three attempts */
  MSG_LORA_MODE_DONE           = 801, /* info: {0} finished, normal mode */
  MSG_LORA_TX_PENDING          = 802, /* warn: Previous packet still pending, new one dropped */
  MSG_LORA_IGNORED_UPGRADE     = 803, /* warn: {0} skipped: module update in progress */
  MSG_LORA_PROFILE_TIMEOUT     = 804, /* error: Update profile {0} did not switch on */
  MSG_LORA_CONFIG_REJECTED     = 805, /* error: Radio settings {0} rejected: {1} MHz, SF{2}, bandwidth {3}, {4} dBm */
  MSG_LORA_BUSY                = 806, /* warn: {0}: radio busy */
  MSG_LORA_CONFIG_RESET        = 807, /* error: Stored radio settings invalid, factory values used */
  MSG_LORA_RADIO_FAILED        = 808, /* error: Radio not responding */

  /* DEV 1000-1999: Изделия */
  MSG_DEV_POWER_LIMIT          = 1000, /* warn: Channel {0} power limit exceeded, channel turned off; {0} - канал */
  MSG_DEV_NO_IMU_SAMPLES       = 1001, /* warn: No IMU data, check setting {0} */
  MSG_DEV_EMPTY_NAME           = 1002, /* warn: Empty module name {0} */
  MSG_DEV_MISSING_MODSN        = 1003, /* warn: Module serial number missing */
  MSG_DEV_NOT_LORA             = 1004, /* warn: Module {0} is not LoRa */
  MSG_DEV_CAPTURE_STARTED      = 1005, /* info: Capturing module {0} */
  MSG_DEV_MODULE_REMOVED       = 1006, /* info: Module {0} removed */
  MSG_DEV_CAPTURED             = 1007, /* info: Module {0} captured */
  MSG_DEV_RELEASED             = 1008, /* info: Module {0} released */
  MSG_DEV_CAPTURED_BY          = 1009, /* info: Captured by base {0}, service mode */
  MSG_DEV_MODE                 = 1010, /* info: Mode {0} */
  MSG_DEV_NO_BASE              = 1011, /* warn: Base not responding, sending every 5 s */
  MSG_DEV_ADC_FAILED           = 1012, /* error: ADC not started */
  MSG_DEV_FOC_TUNE_FAILED      = 1013, /* error: Auto-tuning {0} failed */

  /* DRV 2000-2999: Драйверы */
  MSG_DRV_SELFTEST_FAILED      = 2000, /* error: Self-test failed */
  MSG_DRV_BUS_REG_FAILED       = 2001, /* error: Could not attach device to bus */
  MSG_DRV_ID_MISMATCH          = 2002, /* error: Unexpected chip, ID {0} */
  MSG_DRV_NO_RESPONSE          = 2003, /* error: Device not responding */
  MSG_DRV_GROUP_APPLY_FAILED   = 2004, /* warn: Settings {0} not applied */
  MSG_DRV_GROUP_READ_FAILED    = 2005, /* warn: Data {0} not read */
  MSG_DRV_READ_FAILED          = 2006, /* error: Device read error */
  MSG_DRV_WRITE_FAILED         = 2007, /* error: Device write error */
  MSG_DRV_START_FAILED         = 2008, /* error: Could not start measurement */
  MSG_DRV_CRC_ERROR            = 2009, /* warn: Data checksum error */
  MSG_DRV_COMM_RECOVERED       = 2010, /* warn: Link restored, settings reapplied */
  MSG_DRV_STARTED              = 2011, /* info: Started */
  MSG_DRV_MAVLINK_NO_CHANNEL   = 2012, /* error: No free MAVLink channel, total {0} */
  MSG_DRV_FRAME_DROPPED        = 2013, /* warn: Frame dropped */
  MSG_DRV_CONFIG_RANGE         = 2014, /* error: Frequency {0} MHz out of range 150-960 */
  MSG_DRV_APPLY_FAILED         = 2015, /* error: Settings not applied */
  MSG_DRV_IMU_CALIB_START      = 2016, /* info: Calibration: keep sensor still, Z axis up */
  MSG_DRV_IMU_ACCEL_CALIB      = 2017, /* info: Accelerometer: [{0}, {1}, {2}], offset [{3}, {4}, {5}] g */
  MSG_DRV_IMU_GYRO_CALIB       = 2018, /* info: Gyroscope: [{0}, {1}, {2}], offset [{3}, {4}, {5}] dps */
  MSG_DRV_FIFO_TIMEOUT         = 2019, /* warn: No data in sensor buffer */
  MSG_DRV_DRDY_TIMEOUT         = 2020, /* error: No data ready signal */
  MSG_DRV_PIN_FAILED           = 2021, /* error: Could not set up interrupt pin */
  MSG_DRV_BIST_FAILED          = 2022, /* error: Self-test: oscillator error, BIST {0}, axes {1} */
  MSG_DRV_MAG_CALIB_START      = 2023, /* info: Rotate device: {0} points needed, within {1} s */
  MSG_DRV_CALIB_TIMEOUT        = 2024, /* warn: Calibration stopped: {0} s passed */
  MSG_DRV_MAG_CALIB_DONE       = 2025, /* info: Hard iron [{0}, {1}, {2}] uT, soft iron {3}, {4}, {5}, quality {6}%, radius {7} uT */
  MSG_DRV_CONDITIONING_DONE    = 2026, /* info: Sensor conditioning done, SRAW_VOC {0} */
  MSG_DRV_CONDITIONING_FAILED  = 2027, /* warn: Sensor conditioning failed */
  MSG_DRV_GNSS_NOT_ACK         = 2028, /* warn: Receiver did not accept command {0} */
  MSG_DRV_MOUNT_FAILED         = 2029, /* error: File system not mounted */
  MSG_DRV_UNMOUNT_FAILED       = 2030, /* warn: File system not unmounted */
  MSG_DRV_AHRS_CALIB_START     = 2031, /* info: Calibration: keep device still for {0} s */
  MSG_DRV_AHRS_CALIB_DONE      = 2032, /* info: Gyro bias [{0}, {1}, {2}] dps, roll {3}, pitch {4} */
  MSG_DRV_AHRS_ALIGN           = 2033, /* info: Heading {0}, field {1} uT */
  MSG_DRV_ENC_ZERO_DONE        = 2034, /* info: Encoder zero {0} saved */
  MSG_DRV_ENC_CAL_START        = 2035, /* info: Encoder calibration at {0} RPM */
  MSG_DRV_ENC_CAL_FAILED       = 2036, /* error: Encoder calibration failed: check speed and magnet */
  MSG_DRV_FOC_MOTOR_PARAMS     = 2037, /* error: Check motor parameters: R {0}, L {1} */
  MSG_DRV_FOC_CURRENT_LOOP     = 2038, /* info: Current loop: bandwidth {0} Hz, Kp {1}, Ki {2}, Tf {3} ms */
  MSG_DRV_FOC_DISABLED         = 2039, /* info: Motor {0} disabled */
  MSG_DRV_FOC_TUNE_RESULT      = 2040, /* info: Ku {0}, Pu {1} s, Kp {2} */
  MSG_DRV_FOC_TUNE_INVALID     = 2041, /* error: Auto-tuning: invalid Ku {0}, Pu {1} */
  MSG_DRV_ECC_ERROR            = 2042, /* error: Controller memory error, ECC {0} */
  MSG_DRV_CANFD_MODE_LOST      = 2043, /* warn: CAN FD controller left operating mode */
  MSG_DRV_CANFD_MODE_INVALID   = 2044, /* error: Invalid stored mode {0}, factory mode {1} used */
  MSG_DRV_CANFD_BITTIME        = 2045, /* error: Invalid bit timing {0} */
  MSG_DRV_CANFD_INIT_FAILED    = 2046, /* error: CAN FD controller setup failed, step {0} */
  MSG_DRV_RGB_SPI_REQUIRED     = 2047, /* error: SPI requires RGB_Strip_SPI in config.yaml */
  MSG_DRV_RGB_RMT_FALLBACK     = 2048, /* warn: {0} RMT symbols unavailable, using {1} */
  MSG_DRV_RGB_APPLY_FAILED     = 2049, /* error: Strip setup failed: {0} LEDs, model {1}, order {2} */
  MSG_DRV_RGB_DRIVER_FAILED    = 2050, /* error: Strip driver not started, interface {0} */
  MSG_DRV_ENC_CAL_DONE         = 2051, /* info: Encoder calibration done */
  MSG_DRV_CALIB_FAILED         = 2052, /* error: Factory calibration not read */
  MSG_DRV_SENSOR_NOT_READY     = 2053, /* warn: Sensor not ready */
} api_msg_t;
