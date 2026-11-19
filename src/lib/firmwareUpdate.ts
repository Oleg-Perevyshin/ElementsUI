/* $lib/firmwareUpdate.ts - обновление прошивки модуля STM через его загрузчик (00.00.491-01, 25.00.000-01) по связи DeviceLink: CAN, RS485, консоль xPOE-Debug. Связь - файловый сервер: загрузчик сам читает образ командой FirmwareUpgradeRead, как у хаба ProdFactory-ESP (upgrade_service); протокол - PROTOCOL.md, «Обновление модуля по шине» */
import { argumentCode, type DeviceTransport } from "./fsTransfer.js"
import { crc32 } from "./protocols/crc.js"
import { encodeHar } from "./protocols/dictionary.js"

/* Причина ошибки: noBootloader - загрузчик не принял FirmwareUpgradeStart, timeout - загрузчик перестал читать образ, device - ER! (message - текст устройства), image - пустой или слишком большой образ, transport - связь не умеет отвечать на запросы модуля, hub - хаб прервал обновление модуля (updateViaHub) */
export type FirmwareErrorCode = "noBootloader" | "timeout" | "device" | "image" | "transport" | "hub"

/* Ошибка обновления: текст для пользователя - $T(error.key, error.params) из словаря библиотеки, message - тот же смысл по-английски для журнала */
export class FirmwareUpdateError extends Error {
  constructor(
    readonly code: FirmwareErrorCode,
    readonly params: Record<string, string | number> = {},
    message: string = code,
  ) {
    super(message)
    this.name = "FirmwareUpdateError"
  }
  get key() {
    return `firmware.error.${this.code}`
  }
}

/* Ход: stage - этап, done/total - байты образа; write - сколько загрузчик прочитал */
export type FirmwareStage = "bootloader" | "erase" | "write" | "verify"
export type FirmwareProgress = (stage: FirmwareStage, done: number, total: number) => void

export interface FirmwareUpdateOptions {
  /* Ожидание загрузчика: перезагрузка модуля и стирание места под образ, мс, по умолчанию 20000 */
  bootTimeoutMs?: number
  /* Повтор FirmwareUpgradeStart, пока загрузчик не ответил, мс, по умолчанию 1000 */
  startRepeatMs?: number
  /* Загрузчик не читает образ дольше этого - обновление прервано, мс, по умолчанию 5000 */
  idleTimeoutMs?: number
  onProgress?: FirmwareProgress
}

/* Предел образа: регион приложения STM32G491 за загрузчиком, 492 КБ */
const MAX_IMAGE = 492 * 1024
/* Запрос чтения: смещение u32 и сколько байт u8 */
const READ_REQUEST_SIZE = 5

const u32 = (value: number) => {
  const bytes = new Uint8Array(4)
  new DataView(bytes.buffer).setUint32(0, value >>> 0, true)
  return bytes
}

const join = (...parts: Uint8Array[]) => {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0))
  let at = 0
  for (const part of parts) {
    out.set(part, at)
    at += part.length
  }
  return out
}

/** Обновление прошивки модуля образом .bin (без адреса, с начала региона приложения): FirmwareUpgradeStart с размером и CRC32 повторяется, пока модуль не перезагрузится в загрузчик и тот не ответит; загрузчик читает образ кусками (FirmwareUpgradeRead), проверяет CRC32, сообщает FirmwareUpgradeDone и запускает приложение */
export const updateModuleFirmware = async (transport: DeviceTransport, image: Uint8Array, options: FirmwareUpdateOptions = {}) => {
  const { bootTimeoutMs = 20000, startRepeatMs = 1000, idleTimeoutMs = 5000, onProgress } = options
  if (!image.length || image.length > MAX_IMAGE)
    throw new FirmwareUpdateError("image", { size: image.length }, `Image size ${image.length} out of 1-${MAX_IMAGE}`)
  if (!transport.serve) throw new FirmwareUpdateError("transport", {}, "Link cannot answer module requests")
  const [START, READ, DONE] = ["FirmwareUpgradeStart", "FirmwareUpgradeRead", "FirmwareUpgradeDone"].map((a) => argumentCode(transport, a))

  let read = 0
  let lastRead = 0
  /* Чтение образа: ответ - то же смещение и данные с него (у конца файла - короче или пусто) */
  const unserve = transport.serve(READ, (request) => {
    const raw = request.raw
    if (!raw || raw.length < READ_REQUEST_SIZE) return { ok: false, payload: { Message: 3 } }
    const view = new DataView(raw.buffer, raw.byteOffset, raw.length)
    const offset = view.getUint32(0, true)
    const data = image.subarray(Math.min(offset, image.length), Math.min(image.length, offset + raw[4]))
    lastRead = Date.now()
    if (offset + data.length > read) {
      read = offset + data.length
      onProgress?.(read < image.length ? "write" : "verify", read, image.length)
    }
    return { ok: true, payload: join(u32(offset), data) }
  })
  const failOn = (ok: boolean, message: string | undefined, step: string) => {
    if (!ok) throw new FirmwareUpdateError("device", { step, message: message || "ER!" }, `${step}: ER!`)
  }

  try {
    /* 1. Старт: приложение перезагружается в загрузчик молча, загрузчик стирает место под образ и отвечает OK! - повтор, пока нет ответа или чтения */
    onProgress?.("bootloader", 0, image.length)
    const header = join(u32(image.length), u32(crc32(image)))
    const deadline = Date.now() + bootTimeoutMs
    while (!read) {
      if (Date.now() > deadline) throw new FirmwareUpdateError("noBootloader", {}, "Bootloader did not accept FirmwareUpgradeStart")
      const pending = transport.waitFor(START, () => true, startRepeatMs)
      transport.send(encodeHar("SET", START, true, transport.dictionary), header)
      const reply = await pending
      if (!reply) continue
      failOn(reply.ok, reply.message, "FirmwareUpgradeStart")
      onProgress?.("erase", 0, image.length)
      lastRead = Date.now()
      break
    }

    /* 2. Загрузчик читает образ сам; конец - FirmwareUpgradeDone от него: OK! - CRC32 сошлась, приложение запущено */
    for (;;) {
      const done = await transport.waitFor(DONE, () => true, 1000)
      if (done) {
        failOn(done.ok, done.message, "FirmwareUpgradeDone")
        onProgress?.("verify", image.length, image.length)
        return
      }
      if (Date.now() - lastRead > idleTimeoutMs)
        throw new FirmwareUpdateError("timeout", { step: `FirmwareUpgradeRead ${read}` }, `Bootloader stopped reading at ${read}`)
    }
  } finally {
    unserve()
  }
}
