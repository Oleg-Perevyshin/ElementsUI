/* $lib/firmwareUpdate.ts - обновление прошивки модуля STM через его загрузчик (00.00.491-01, 25.00.000-01) по связи DeviceLink: консоль xPOE-Debug, CAN, RS485. Тот же порядок, что у хаба ProdFactory-ESP (upgrade_service): FirmwareUpgradeStart, части FirmwareUpgradeChunk, FirmwareUpgradeDone; протокол - PROTOCOL.md, «Обновление модуля по шине» */
import { argumentCode, type DeviceReply, type DeviceTransport } from "./fsTransfer.js"
import { crc16Kermit, crc32 } from "./protocols/crc.js"
import { encodeHar } from "./protocols/dictionary.js"

/* Причина ошибки: noBootloader - загрузчик не отозвался после перезагрузки модуля, timeout - нет ответа на шаг, device - ER! (message - текст устройства), badStart - ответ на начало без размера части, resync - части не сходятся после повторов, image - пустой или слишком большой образ, hub - хаб прервал обновление модуля (updateViaHub) */
export type FirmwareErrorCode = "noBootloader" | "timeout" | "device" | "badStart" | "resync" | "image" | "hub"

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

/* Ход: stage - этап, done/total - байты образа (у start и done - 0 и размер) */
export type FirmwareStage = "bootloader" | "erase" | "write" | "verify"
export type FirmwareProgress = (stage: FirmwareStage, done: number, total: number) => void

export interface FirmwareUpdateOptions {
  /* Ожидание загрузчика после перезагрузки модуля, мс, по умолчанию 15000 (окно загрузчика - 5 с после сброса) */
  bootTimeoutMs?: number
  /* Ожидание ответа на часть, мс, по умолчанию 1000 */
  chunkTimeoutMs?: number
  /* Повторов части без ответа и подряд идущих RESYNC, по умолчанию 3 */
  retries?: number
  onProgress?: FirmwareProgress
}

/* Сообщения устройства: RESYNC с номером части в Args[0] */
const MSG_FW_RESYNC = 307
/* Предел образа: регион приложения STM32G491 за загрузчиком, 492 КБ */
const MAX_IMAGE = 492 * 1024
/* Ответ загрузчика на ModuleFind: серийный номер[43] и версия u32 = 0 */
const BOOT_FIND_SIZE = 47
/* Повтор FirmwareUpgradeStart приложению, пока оно отвечает на ModuleFind, мс */
const ENTER_REPEAT_MS = 1000

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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/* Номер части, с которой загрузчик просит продолжить: ER! {Message: 307, Args: [n]} */
const resyncIndex = (reply: DeviceReply) => {
  const args = reply.payload.Args
  const index = Array.isArray(args) ? Number(args[0]) : NaN
  return Number(reply.payload.Message) === MSG_FW_RESYNC && Number.isInteger(index) ? index : null
}

/** Обновление прошивки модуля образом .bin (без адреса, с начала региона приложения): модуль уходит в загрузчик, образ передаётся частями, загрузчик проверяет CRC32 и запускает приложение */
export const updateModuleFirmware = async (transport: DeviceTransport, image: Uint8Array, options: FirmwareUpdateOptions = {}) => {
  const { bootTimeoutMs = 15000, chunkTimeoutMs = 1000, retries = 3, onProgress } = options
  if (!image.length || image.length > MAX_IMAGE)
    throw new FirmwareUpdateError("image", { size: image.length }, `Image size ${image.length} out of 1-${MAX_IMAGE}`)
  const [START, CHUNK, DONE, FIND] = ["FirmwareUpgradeStart", "FirmwareUpgradeChunk", "FirmwareUpgradeDone", "ModuleFind"].map((a) =>
    argumentCode(transport, a),
  )

  /* Команда с сырыми полями (байтовая строка) или без тела и ответ на неё; null - таймаут */
  const request = (header: string, code: number, payload: Uint8Array | null, timeoutMs: number) => {
    const pending = transport.waitFor(code, () => true, timeoutMs)
    transport.send(encodeHar(header, code, true, transport.dictionary), payload)
    return pending
  }
  const failOn = (reply: DeviceReply | null, step: string) => {
    if (!reply) throw new FirmwareUpdateError("timeout", { step }, `${step}: timeout`)
    if (!reply.ok) throw new FirmwareUpdateError("device", { step, message: reply.message || String(reply.payload.Message ?? "ER!") }, `${step}: ER!`)
    return reply
  }

  /* 1. Приложение по FirmwareUpgradeStart перезагружается в загрузчик без ответа; загрузчик в окне 5 с отвечает на ModuleFind версией 0 */
  onProgress?.("bootloader", 0, image.length)
  const header = join(u32(image.length), u32(crc32(image)))
  const enter = () => transport.send(encodeHar("SET", START, false, transport.dictionary), header)
  enter()
  let entered = Date.now()
  const deadline = entered + bootTimeoutMs
  let found = false
  while (!found && Date.now() < deadline) {
    const reply = await request("GET", FIND, null, 300)
    const raw = reply?.ok ? reply.raw : undefined
    /* Загрузчик: 47 байт - серийный номер[43] и версия u32 = 0; приложение отвечает своей версией */
    found = raw?.length === BOOT_FIND_SIZE && new DataView(raw.buffer, raw.byteOffset + 43, 4).getUint32(0, true) === 0
    if (found || !reply) continue
    /* Отвечает приложение: команда могла потеряться (модуль как раз перезапускался) - повтор раз в секунду */
    if (Date.now() - entered >= ENTER_REPEAT_MS) {
      enter()
      entered = Date.now()
    }
    await sleep(300)
  }
  if (!found) throw new FirmwareUpdateError("noBootloader", {}, "Bootloader did not answer ModuleFind")

  /* 2. Начало: размер и CRC32, загрузчик стирает место и отвечает размером части */
  onProgress?.("erase", 0, image.length)
  const start = failOn(await request("SET", START, header, 10000), "FirmwareUpgradeStart")
  const block = start.raw?.length === 1 ? start.raw[0] : 0
  if (!block) throw new FirmwareUpdateError("badStart", {}, "No chunk size in FirmwareUpgradeStart reply")

  /* 3. Части по порядку: номер, CRC16 части, данные; RESYNC - продолжить с указанной части */
  const frames = Math.ceil(image.length / block)
  let frame = 0
  let misses = 0
  let resyncs = 0
  while (frame < frames) {
    const data = image.subarray(frame * block, Math.min(image.length, (frame + 1) * block))
    const crc = new Uint8Array(2)
    new DataView(crc.buffer).setUint16(0, crc16Kermit(0, data), true)
    const reply = await request("SET", CHUNK, join(u32(frame), crc, data), chunkTimeoutMs)
    if (!reply) {
      if (++misses > retries) throw new FirmwareUpdateError("timeout", { step: `FirmwareUpgradeChunk ${frame}` }, `Chunk ${frame}: timeout`)
      continue
    }
    misses = 0
    if (!reply.ok) {
      const index = resyncIndex(reply)
      if (index === null) failOn(reply, `FirmwareUpgradeChunk ${frame}`)
      if (index === null || index > frames || ++resyncs > retries) throw new FirmwareUpdateError("resync", { frame }, `Chunk ${frame}: resync failed`)
      frame = index
      continue
    }
    resyncs = 0
    frame++
    onProgress?.("write", Math.min(image.length, frame * block), image.length)
  }

  /* 4. Конец: загрузчик проверяет CRC32 образа и запускает приложение */
  onProgress?.("verify", image.length, image.length)
  failOn(await request("SET", DONE, null, 3000), "FirmwareUpgradeDone")
}
