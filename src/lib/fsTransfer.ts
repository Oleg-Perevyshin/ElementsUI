/* $lib/fsTransfer.ts - обмен файлами с устройством по SET/GET FS (file_system прошивки): закачка, скачивание, список, удаление. Транспорт - у приложения (send, waitFor), операции идут строго по одной */
import { crc32 } from "./protocols/crc.js"
import type { IWidgetFileSystemInfo } from "./types"

/* Ответ устройства на команду: ok - OK!, иначе ER!; payload - Payload ответа, message - Message */
export interface DeviceReply {
  ok: boolean
  payload: Record<string, unknown>
  message?: string
}

/* Транспорт к выбранному модулю: send - пакет без ответа (конверт DevSN/ModSN добавляет приложение); waitFor - первый ответ OK! или ER! с аргументом argument, для которого match вернул true, null - таймаут. waitFor вызывается до send */
export interface DeviceTransport {
  send(header: string, argument: string, payload: Record<string, unknown>): unknown
  waitFor(argument: string, match: (reply: DeviceReply) => boolean, timeoutMs: number): Promise<DeviceReply | null>
}

export interface FsTransferOptions {
  /* Аргумент команд, по умолчанию "FS" */
  argument?: string
  /* Ожидание ответа на шаг, мс, по умолчанию 5000 */
  timeoutMs?: number
  /* Повторов чанка после ER! или таймаута, по умолчанию 3 */
  retries?: number
  /* Предел длины имени файла прошивки (LittleFS), по умолчанию 31 */
  maxNameLength?: number
}

export type FsProgress = (done: number, total: number) => void

export interface FsTransfer {
  upload(name: string, data: Uint8Array | Blob, onProgress?: FsProgress): Promise<void>
  download(name: string, onProgress?: FsProgress): Promise<Uint8Array>
  list(): Promise<IWidgetFileSystemInfo>
  remove(name: string): Promise<IWidgetFileSystemInfo | undefined>
}

const fsState = (payload: Record<string, unknown>) =>
  Object.values(payload).find(
    (value): value is IWidgetFileSystemInfo => !!value && typeof value === "object" && Array.isArray((value as { List?: unknown }).List),
  )

/* Очередь операций на транспорт: GUIRenderer и приложение могут передавать файлы одному устройству одновременно */
const queues = new WeakMap<DeviceTransport, Promise<unknown>>()

export const createFsTransfer = (transport: DeviceTransport, options: FsTransferOptions = {}): FsTransfer => {
  const { argument = "FS", timeoutMs = 5000, retries = 3, maxNameLength = 31 } = options

  /* Операции по очереди: у устройства одна сессия закачки и одна скачивания, поэтому очередь общая для всех передач через этот транспорт */
  const exclusive = <R>(run: () => Promise<R>): Promise<R> => {
    const result = (queues.get(transport) ?? Promise.resolve()).then(run, run)
    queues.set(
      transport,
      result.catch(() => {}),
    )
    return result
  }

  /* Команда и ответ на неё; ER! и таймаут - исключение с текстом устройства */
  const request = async (header: string, payload: Record<string, unknown>, match: (reply: DeviceReply) => boolean, step: string) => {
    const pending = transport.waitFor(argument, match, timeoutMs)
    transport.send(header, argument, payload)
    const reply = await pending
    if (!reply) throw new Error(`${step}: timeout`)
    if (!reply.ok) throw new Error(reply.message || `${step}: ER!`)
    return reply.payload
  }

  /* Шаг сессии: ответ с тем же Op и CurrentID; OK! чанка - ещё и с тем же ChunkIndex */
  const step = (id: number, payload: Record<string, unknown>) =>
    request(
      "SET",
      { ...payload, CurrentID: id },
      ({ ok, payload: answer }) =>
        answer.CurrentID === id && answer.Op === payload.Op && (!ok || payload.ChunkIndex === undefined || answer.ChunkIndex === payload.ChunkIndex),
      String(payload.Op),
    )

  /* Чанк повторяется после ER! или таймаута: устройство перепишет или перечитает тот же блок */
  const withRetry = async <R>(run: () => Promise<R>): Promise<R> => {
    for (let attempt = 0; ; attempt++) {
      try {
        return await run()
      } catch (error) {
        if (attempt >= retries) throw error
      }
    }
  }

  const sessionId = () => Date.now() % 100000

  const upload = (name: string, data: Uint8Array | Blob, onProgress?: FsProgress) =>
    exclusive(async () => {
      if (!name || name.length > maxNameLength) throw new Error(`File name must be 1-${maxNameLength} characters`)
      const bytes = data instanceof Uint8Array ? data : new Uint8Array(await data.arrayBuffer())
      const id = sessionId()
      /* Расширение - последний сегмент: имена вида "web_ui.yaml.gz" */
      const start = await step(id, { Op: "UploadStart", FileName: name, FileExtension: name.split(".").pop(), FileSize: bytes.length })
      const chunkSize = Number(start.ChunkSize)
      if (!(chunkSize > 0)) throw new Error("UploadStart: no ChunkSize")
      for (let index = 0; index * chunkSize < bytes.length; index++) {
        const Data = bytes.subarray(index * chunkSize, (index + 1) * chunkSize)
        await withRetry(() => step(id, { Op: "UploadChunk", ChunkIndex: index, Data }))
        onProgress?.(Math.min((index + 1) * chunkSize, bytes.length), bytes.length)
      }
      await step(id, { Op: "UploadDone", CRC32: crc32(bytes) })
    })

  const download = (name: string, onProgress?: FsProgress) =>
    exclusive(async () => {
      const id = sessionId()
      const start = await step(id, { Op: "DownloadStart", Name: name })
      const size = Number(start.FileSize)
      const chunkSize = Number(start.ChunkSize)
      if (!(size >= 0) || !(chunkSize > 0)) throw new Error("DownloadStart: no FileSize or ChunkSize")
      const bytes = new Uint8Array(size)
      for (let index = 0; index * chunkSize < size; index++) {
        const chunk = await withRetry(async () => {
          const data = (await step(id, { Op: "DownloadChunk", ChunkIndex: index })).Data
          if (!(data instanceof Uint8Array) || index * chunkSize + data.length > size) throw new Error(`DownloadChunk ${index}: bad data`)
          return data
        })
        bytes.set(chunk, index * chunkSize)
        onProgress?.(Math.min((index + 1) * chunkSize, size), size)
      }
      if (crc32(bytes) !== Number(start.CRC32)) throw new Error("CRC32 mismatch")
      await step(id, { Op: "DownloadDone" })
      return bytes
    })

  /* Снимок ФС - ответ GET без Op */
  const list = () =>
    exclusive(async () => {
      const payload = await request("GET", {}, ({ ok, payload: answer }) => !ok || (!answer.Op && !!fsState(answer)), "List")
      return fsState(payload)!
    })

  /* Удаление - ответ со свежим снимком */
  const remove = (name: string) =>
    exclusive(async () => fsState(await request("SET", { Op: "Delete", Name: name }, ({ payload: answer }) => answer.Op === "Delete", "Delete")))

  return { upload, download, list, remove }
}
