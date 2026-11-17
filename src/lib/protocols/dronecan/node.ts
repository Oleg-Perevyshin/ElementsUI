/* src/lib/protocols/dronecan/node.ts - свой узел на шине DroneCAN: NodeStatus раз в секунду, ответ на GetNodeInfo, сервер динамического назначения Node ID (DNA, как у ArduPilot),
   узлы шины (NodeStatus, GetNodeInfo по первому появлению), последние сообщения узлов с частотой, запросы сервисов с ожиданием ответа (по одному на узел - простые устройства теряют запросы вплотную),
   параметры узла: список, чтение, запись, сохранение, сброс, перезагрузка; файловый сервер (file.Read, file.GetInfo) и обновление прошивки узла (BeginFirmwareUpdate) */
import { droneCanType } from "./codec.js"
import { decodeDroneCanTransfer, encodeDroneCanTransfer } from "./index.js"
import type { DroneCanTransfer, DroneCanTransferType } from "./transfer.js"

/* Состояние узла из NodeStatus: health 0..3, mode 0..7 */
export const DRONECAN_HEALTH = ["OK", "WARNING", "ERROR", "CRITICAL"]
export const DRONECAN_MODE: Record<number, string> = { 0: "OPERATIONAL", 1: "INITIALIZATION", 2: "MAINTENANCE", 3: "SOFTWARE_UPDATE", 7: "OFFLINE" }
/* Узел без NodeStatus дольше 3 с - offline (спецификация DroneCAN) */
export const DRONECAN_OFFLINE_MS = 3000
/* Опкоды ExecuteOpcode: SAVE - записать параметры в память узла, ERASE - сбросить к заводским (после перезагрузки) */
export const DRONECAN_OPCODE_SAVE = 0
export const DRONECAN_OPCODE_ERASE = 1
/* Магическое число RestartNode */
export const DRONECAN_RESTART_MAGIC = 0xacce551b1e
/* file.Read отдаёт до 256 байт; ответ короче - конец файла */
export const DRONECAN_FILE_CHUNK = 256
/* Коды uavcan.protocol.file.Error */
const FILE_OK = 0
const FILE_NOT_FOUND = 2
/* Ответы BeginFirmwareUpdate: 0 - начал, 2 - уже обновляется (тоже годится: загрузчик продолжит читать) */
const FW_OK = 0
const FW_IN_PROGRESS = 2

export type DroneCanParamKind = "empty" | "integer" | "real" | "boolean" | "string"
export type DroneCanParamScalar = number | bigint | boolean | string | null

export interface DroneCanParam {
  /* Номер параметра в списке узла; -1 - прочитан по имени */
  index: number
  name: string
  kind: DroneCanParamKind
  value: DroneCanParamScalar
  /* По умолчанию и пределы узел сообщать не обязан (AP_Periph их не шлёт) - тогда null */
  defaultValue: DroneCanParamScalar
  min: DroneCanParamScalar
  max: DroneCanParamScalar
}

export interface DroneCanNodeInfo {
  name: string
  software?: { major: number; minor: number; optional_field_flags?: number; vcs_commit?: number; image_crc?: number | bigint }
  hardware?: { major: number; minor: number; unique_id?: number[] | string; certificate_of_authenticity?: number[] | string }
}

export interface DroneCanBusNode {
  id: number
  health: number
  mode: number
  subMode: number
  vssc: number
  uptime: number
  lastSeen: number
  /* NodeStatus приходил последние 3 с */
  online: boolean
  info?: DroneCanNodeInfo
  infoPending: boolean
}

export interface DroneCanMessage {
  typeName: string
  value: Record<string, unknown>
  count: number
  /* Гц за последнее окно в 1 с; 0 - сообщение перестало приходить */
  rate: number
  last: number
  stale: boolean
}

export interface DroneCanTransmitted {
  typeName: string
  type: DroneCanTransferType
  value: Record<string, unknown>
  source: number
  destination?: number
  transferId: number
  priority?: number
  canId: number
  frames: Uint8Array[]
}

/* Значение параметра union uavcan.protocol.param.Value -> {kind, value} */
export const droneCanParamValue = (union: unknown): { kind: DroneCanParamKind; value: DroneCanParamScalar } => {
  if (!union || typeof union !== "object") return { kind: "empty", value: null }
  const u = union as Record<string, unknown>
  if ("integer_value" in u) return { kind: "integer", value: u.integer_value as number | bigint }
  if ("real_value" in u) return { kind: "real", value: u.real_value as number }
  if ("boolean_value" in u) return { kind: "boolean", value: !!u.boolean_value }
  if ("string_value" in u) return { kind: "string", value: String(u.string_value ?? "") }
  return { kind: "empty", value: null }
}

/* Обратно: значение того же вида, что у параметра */
export const droneCanParamUnion = (kind: DroneCanParamKind, value: unknown): Record<string, unknown> => {
  if (kind === "integer") return { integer_value: typeof value === "bigint" ? value : Math.round(Number(value)) }
  if (kind === "real") return { real_value: Number(value) }
  if (kind === "boolean") return { boolean_value: value === true || value === 1 || value === "true" ? 1 : 0 }
  if (kind === "string") return { string_value: String(value ?? "") }
  return { empty: {} }
}

const toEntry = (index: number, res: Record<string, unknown>): DroneCanParam => ({
  index,
  name: String(res.name ?? ""),
  ...droneCanParamValue(res.value),
  defaultValue: droneCanParamValue(res.default_value).value,
  min: droneCanParamValue(res.min_value).value,
  max: droneCanParamValue(res.max_value).value,
})

/* Ход обновления прошивки: start - запрос отправлен, read - узел читает файл (bytes из size), done - файл прочитан целиком и узел снова в рабочем режиме */
export interface DroneCanFirmwareProgress {
  phase: "start" | "read" | "reboot" | "done"
  bytes: number
  size: number
}

export interface DroneCanNodeOptions {
  /* Свой Node ID 1..127 */
  nodeId: number
  /* Передача в шину: 29-битный ID и данные кадров (с хвостовым байтом) */
  write: (canId: number, frames: Uint8Array[]) => Promise<unknown>
  /* Имя узла в ответе на GetNodeInfo */
  name?: string
  /* Сервер DNA - назначать номера узлам без номера (по умолчанию да) */
  allocator?: boolean
  /* Каждая своя передача; auto - служебная (NodeStatus, ответ GetNodeInfo, опрос узлов, DNA) */
  onTransmit?: (t: DroneCanTransmitted, auto: boolean) => void
  /* Узлы шины: при появлении нового и раз в секунду */
  onNodes?: (nodes: DroneCanBusNode[]) => void
  /* На шине есть другой узел с нашим номером - один раз */
  onConflict?: (nodeId: number) => void
  /* Сервер DNA назначил номер узлу с уникальным ID (HEX) */
  onAllocate?: (nodeId: number, uniqueId: string) => void
  requestTimeoutMs?: number
  now?: () => number
}

export interface DroneCanNode {
  nodeId: number
  /* Каждая принятая передача шины */
  handle(t: DroneCanTransfer): void
  request(
    typeName: string,
    node: number,
    value?: Record<string, unknown>,
    options?: { timeoutMs?: number; retries?: number; priority?: number; auto?: boolean },
  ): Promise<Record<string, unknown>>
  broadcast(typeName: string, value?: Record<string, unknown>): Promise<void>
  listParams(node: number, onProgress?: (list: DroneCanParam[]) => void): Promise<DroneCanParam[]>
  getParam(node: number, name: string): Promise<DroneCanParam | undefined>
  setParam(node: number, name: string, kind: DroneCanParamKind, value: unknown): Promise<DroneCanParam>
  executeOpcode(node: number, opcode: number): Promise<boolean>
  restart(node: number): Promise<boolean>
  nodes(): DroneCanBusNode[]
  messages(id: number): DroneCanMessage[]
  allocations(): Map<string, number>
  /* Файл на нашем узле для file.Read других узлов; null - убрать */
  serveFile(path: string, data: Uint8Array | null): void
  /* Обновление прошивки узла файлом data: BeginFirmwareUpdate, узел (его загрузчик) читает файл с нас, ждём его возвращения в рабочий режим */
  updateFirmware(
    node: number,
    data: Uint8Array,
    options?: { path?: string; onProgress?: (p: DroneCanFirmwareProgress) => void; idleTimeoutMs?: number; rebootTimeoutMs?: number },
  ): Promise<void>
  dispose(): void
}

type BusEntry = Omit<DroneCanBusNode, "online">
type MessageEntry = Omit<DroneCanMessage, "stale"> & { windowStart: number; windowCount: number }

export const createDroneCanNode = ({
  nodeId,
  write,
  name = "pro.xpoe.node",
  allocator = true,
  onTransmit,
  onNodes,
  onConflict,
  onAllocate,
  requestTimeoutMs = 1000,
  now = () => Date.now(),
}: DroneCanNodeOptions): DroneCanNode => {
  const started = now()
  /* transfer_id ведётся отдельно на каждый тип и получателя, как в libcanard */
  const transferIds = new Map<string, number>()
  const nextTransferId = (key: string) => {
    const id = transferIds.get(key) ?? 0
    transferIds.set(key, (id + 1) & 0x1f)
    return id
  }
  const transmit = async (out: Omit<DroneCanTransmitted, "source" | "canId" | "frames">, auto: boolean) => {
    const encoded = encodeDroneCanTransfer({ ...out, source: nodeId })
    await write(encoded.canId, encoded.frames)
    onTransmit?.({ ...out, source: nodeId, frames: encoded.frames, canId: encoded.canId }, auto)
  }
  const status = () => ({ uptime_sec: Math.floor((now() - started) / 1000), health: 0, mode: 0, sub_mode: 0, vendor_specific_status_code: 0 })

  const nodes = new Map<number, BusEntry>()
  const emitNodes = () => onNodes?.([...nodes.values()].map((n) => ({ ...n, online: now() - n.lastSeen < DRONECAN_OFFLINE_MS })).sort((a, b) => a.id - b.id))

  /* Последние сообщения узлов; частота - число сообщений за окно не короче 1 с: кадры приходят из порта пачками, интервал между соседними сообщениями ничего не говорит */
  const messages = new Map<number, Map<string, MessageEntry>>()
  const storeMessage = (source: number, typeName: string, value: Record<string, unknown>) => {
    const byType = messages.get(source) ?? new Map<string, MessageEntry>()
    messages.set(source, byType)
    const at = now()
    const entry = byType.get(typeName) ?? { typeName, value, count: 0, rate: 0, last: 0, windowStart: at, windowCount: 0 }
    entry.windowCount++
    if (at - entry.windowStart >= 1000) {
      entry.rate = (entry.windowCount * 1000) / (at - entry.windowStart)
      entry.windowStart = at
      entry.windowCount = 0
    }
    Object.assign(entry, { value, count: entry.count + 1, last: at })
    byType.set(typeName, entry)
  }

  /* Ожидающие ответы: ключ ID сервиса:узел:transfer_id; очередь запросов на узел - следующий уходит после ответа или тайм-аута предыдущего */
  const pending = new Map<string, { resolve: (value: Record<string, unknown>) => void; timer: ReturnType<typeof setTimeout> }>()
  const queues = new Map<number, Promise<unknown>>()
  const enqueue = <T>(node: number, job: () => Promise<T>): Promise<T> => {
    const prev = queues.get(node) ?? Promise.resolve()
    const next = prev.then(job, job)
    queues.set(
      node,
      next.catch(() => {}),
    )
    return next
  }

  const request: DroneCanNode["request"] = (typeName, node, value = {}, { timeoutMs = requestTimeoutMs, retries = 1, priority = 24, auto = false } = {}) => {
    const def = droneCanType(typeName)
    if (!def || def.kind !== "srv") return Promise.reject(new Error(`DroneCAN: ${typeName} - не сервис`))
    if (!(node >= 1 && node <= 127)) return Promise.reject(new Error("DroneCAN: узел-получатель 1..127"))
    return enqueue(node, async () => {
      for (let attempt = 0; ; attempt++) {
        const transferId = nextTransferId(`req:${def.id}:${node}`)
        const key = `${def.id}:${node}:${transferId}`
        const answer = new Promise<Record<string, unknown>>((resolve, reject) => {
          const timer = setTimeout(() => {
            pending.delete(key)
            reject(new Error(`DroneCAN: узел ${node} не ответил на ${typeName}`))
          }, timeoutMs)
          pending.set(key, { resolve, timer })
        })
        await transmit({ typeName, type: "req", value, destination: node, transferId, priority }, auto)
        try {
          return await answer
        } catch (error) {
          if (attempt >= retries) throw error
        }
      }
    })
  }

  /* GetNodeInfo узла при первом появлении и после перезагрузки (uptime стал меньше) */
  const askInfo = (id: number) => {
    const entry = nodes.get(id)
    if (!entry || entry.infoPending) return
    entry.infoPending = true
    request("uavcan.protocol.GetNodeInfo", id, {}, { auto: true, retries: 2 })
      .then((info) => {
        entry.info = {
          name: String(info.name ?? ""),
          software: info.software_version as DroneCanNodeInfo["software"],
          hardware: info.hardware_version as DroneCanNodeInfo["hardware"],
        }
        /* Уникальный ID узла - его номер для DNA: тот же модуль после перезагрузки получит прежний номер */
        const uid = uidBytes(entry.info.hardware?.unique_id)
        if (uid.length === 16) allocations.set(uidKey(uid), id)
      })
      .catch(() => {})
      .finally(() => {
        entry.infoPending = false
        emitNodes()
      })
  }

  /* Сервер DNA: узел без номера шлёт анонимно Allocation с уникальным ID частями (6+6+4 байта), сервер после каждой части повторяет собранное;
     собрано 16 байт - номер: тот же, что раньше этому ID (выданный нами или из GetNodeInfo узла), желаемый, если свободен, иначе свободный сверху от 125 */
  const allocations = new Map<string, number>()
  let uidBuffer: number[] = []
  const uidKey = (uid: number[]) => uid.map((b) => b.toString(16).padStart(2, "0")).join("")
  /* Уникальный ID из кодека: массив байт или строка, если байты печатные */
  const uidBytes = (raw: unknown) => Array.from(typeof raw === "string" ? new TextEncoder().encode(raw) : Array.isArray(raw) ? (raw as number[]) : [])
  const freeId = (preferred: number) => {
    const busy = new Set([nodeId, ...nodes.keys(), ...allocations.values()])
    if (preferred >= 1 && preferred <= 125 && !busy.has(preferred)) return preferred
    for (let id = 125; id >= 1; id--) if (!busy.has(id)) return id
    return 0
  }
  const allocate = (msg: Record<string, unknown>) => {
    const part = uidBytes(msg.unique_id)
    if (msg.first_part_of_unique_id) uidBuffer = part
    else if (uidBuffer.length) uidBuffer = [...uidBuffer, ...part].slice(0, 16)
    else return
    let assigned = 0
    if (uidBuffer.length >= 16) {
      const key = uidKey(uidBuffer)
      assigned = allocations.get(key) ?? freeId(Number(msg.node_id ?? 0))
      if (assigned) {
        allocations.set(key, assigned)
        onAllocate?.(assigned, key)
      }
    }
    void transmit(
      {
        typeName: "uavcan.protocol.dynamic_node_id.Allocation",
        type: "msg",
        value: { node_id: assigned, first_part_of_unique_id: 0, unique_id: uidBuffer },
        transferId: nextTransferId("msg:Allocation"),
        priority: 30,
      },
      true,
    ).catch(() => {})
    if (uidBuffer.length >= 16) uidBuffer = []
  }

  /* Файловый сервер: путь -> данные; чтения - чтобы обновление прошивки видело ход */
  const files = new Map<string, Uint8Array>()
  const readWatchers = new Set<(path: string, offset: number, client: number) => void>()
  const pathText = (path: unknown) => {
    const raw = (path as Record<string, unknown> | undefined)?.path
    return typeof raw === "string" ? raw : Array.isArray(raw) ? String.fromCharCode(...(raw as number[])) : ""
  }
  const respond = (t: DroneCanTransfer, typeName: string, value: Record<string, unknown>) =>
    void transmit({ typeName, type: "res", destination: t.source, transferId: t.transferId, priority: t.priority, value }, true).catch(() => {})
  const serveFileRequest = (t: DroneCanTransfer, typeName: string, value: Record<string, unknown>) => {
    const path = pathText(value.path)
    const data = files.get(path)
    if (typeName === "uavcan.protocol.file.GetInfo") {
      respond(
        t,
        typeName,
        data
          ? { size: data.length, error: { value: FILE_OK }, entry_type: { flags: 1 | 8 } }
          : { size: 0, error: { value: FILE_NOT_FOUND }, entry_type: { flags: 0 } },
      )
      return
    }
    const offset = Number(value.offset ?? 0)
    if (!data) return respond(t, typeName, { error: { value: FILE_NOT_FOUND }, data: [] })
    respond(t, typeName, { error: { value: FILE_OK }, data: data.subarray(offset, offset + DRONECAN_FILE_CHUNK) })
    for (const watch of readWatchers) watch(path, offset, t.source)
  }

  let conflict = false
  const statusTimer = setInterval(() => {
    void transmit(
      { typeName: "uavcan.protocol.NodeStatus", type: "msg", value: status(), transferId: nextTransferId("msg:NodeStatus"), priority: 30 },
      true,
    ).catch(() => {})
  }, 1000)
  /* Раз в секунду - пересчёт online у узлов, замолчавших без NodeStatus */
  const offlineTimer = setInterval(() => nodes.size && emitNodes(), 1000)

  return {
    nodeId,
    handle(t) {
      if (t.type === "msg" && t.source === 0) {
        const anon = t.crcOk ? decodeDroneCanTransfer(t) : undefined
        if (allocator && anon?.typeName === "uavcan.protocol.dynamic_node_id.Allocation" && anon.value) allocate(anon.value)
        return
      }
      /* Свои кадры адаптер не возвращает: передача с нашим номером - чужой узел с тем же Node ID */
      if (t.source === nodeId && !conflict) {
        conflict = true
        onConflict?.(nodeId)
      }
      const decoded = t.crcOk ? decodeDroneCanTransfer(t) : undefined
      if (t.type === "res" && t.destination === nodeId) {
        const key = `${t.dataTypeId}:${t.source}:${t.transferId}`
        const wait = pending.get(key)
        if (wait) {
          clearTimeout(wait.timer)
          pending.delete(key)
          wait.resolve(decoded?.value ?? {})
        }
        return
      }
      if (
        t.type === "req" &&
        t.destination === nodeId &&
        decoded?.value &&
        (decoded.typeName === "uavcan.protocol.file.Read" || decoded.typeName === "uavcan.protocol.file.GetInfo")
      ) {
        serveFileRequest(t, decoded.typeName, decoded.value)
        return
      }
      if (t.type === "req" && t.destination === nodeId && decoded?.typeName === "uavcan.protocol.GetNodeInfo") {
        void transmit(
          {
            typeName: "uavcan.protocol.GetNodeInfo",
            type: "res",
            destination: t.source,
            transferId: t.transferId,
            priority: t.priority,
            value: {
              status: status(),
              software_version: { major: 1, minor: 0 },
              hardware_version: { major: 0, minor: 0, unique_id: [], certificate_of_authenticity: [] },
              name,
            },
          },
          true,
        ).catch(() => {})
        return
      }
      if (t.type !== "msg" || !decoded?.value) return
      storeMessage(t.source, decoded.typeName, decoded.value)
      if (decoded.typeName !== "uavcan.protocol.NodeStatus") return
      const s = decoded.value as Record<string, number>
      const known = nodes.get(t.source)
      const rebooted = !!known && s.uptime_sec < known.uptime
      const entry: BusEntry = known ?? { id: t.source, health: 0, mode: 0, subMode: 0, vssc: 0, uptime: 0, lastSeen: 0, infoPending: false }
      Object.assign(entry, { health: s.health, mode: s.mode, subMode: s.sub_mode, vssc: s.vendor_specific_status_code, uptime: s.uptime_sec, lastSeen: now() })
      nodes.set(t.source, entry)
      if (!known || rebooted || !entry.info) askInfo(t.source)
      if (!known) emitNodes()
    },
    request,
    broadcast(typeName, value = {}) {
      const def = droneCanType(typeName)
      if (!def || def.kind !== "msg") return Promise.reject(new Error(`DroneCAN: ${typeName} - не сообщение`))
      return transmit({ typeName, type: "msg", value, transferId: nextTransferId(`msg:${def.id}`) }, false)
    },
    /* Все параметры по номеру, пока не придёт пустое имя (конец списка) */
    async listParams(node, onProgress) {
      const list: DroneCanParam[] = []
      for (let index = 0; index < 1024; index++) {
        const res = await request("uavcan.protocol.param.GetSet", node, { index }, { retries: 2 })
        if (!res.name) break
        list.push(toEntry(index, res))
        onProgress?.([...list])
      }
      return list
    },
    async getParam(node, paramName) {
      const res = await request("uavcan.protocol.param.GetSet", node, { name: paramName }, { retries: 2 })
      return res.name ? toEntry(-1, res) : undefined
    },
    /* Запись по имени; ответ узла - итоговое значение (узел может его ограничить) */
    async setParam(node, paramName, kind, value) {
      const res = await request("uavcan.protocol.param.GetSet", node, { value: droneCanParamUnion(kind, value), name: paramName }, { retries: 2 })
      if (!res.name) throw new Error(`DroneCAN: узел ${node} не знает параметр ${paramName}`)
      return toEntry(-1, res)
    },
    async executeOpcode(node, opcode) {
      const res = await request("uavcan.protocol.param.ExecuteOpcode", node, { opcode, argument: 0 }, { timeoutMs: 3000, retries: 0 })
      return !!res.ok
    },
    async restart(node) {
      const res = await request("uavcan.protocol.RestartNode", node, { magic_number: DRONECAN_RESTART_MAGIC }, { timeoutMs: 2000, retries: 0 })
      return !!res.ok
    },
    nodes: () => [...nodes.values()].map((n) => ({ ...n, online: now() - n.lastSeen < DRONECAN_OFFLINE_MS })),
    messages: (id) =>
      [...(messages.get(id)?.values() ?? [])]
        .map(({ windowStart: _start, windowCount: _count, ...m }) => {
          const stale = now() - m.last > DRONECAN_OFFLINE_MS
          return { ...m, rate: stale ? 0 : m.rate, stale }
        })
        .sort((a, b) => a.typeName.localeCompare(b.typeName)),
    allocations: () => new Map(allocations),
    serveFile(path, data) {
      if (data) files.set(path, data)
      else files.delete(path)
    },
    /* Узел перезагружается в загрузчик и читает файл с нас; номер у загрузчика может смениться (DNA) - ход считается по чтениям нашего файла от любого узла */
    async updateFirmware(node, data, { path = `fw/${node}.bin`, onProgress, idleTimeoutMs = 20000, rebootTimeoutMs = 60000 } = {}) {
      files.set(path, data)
      onProgress?.({ phase: "start", bytes: 0, size: data.length })
      try {
        let bytes = 0
        let lastRead = now()
        let done = false
        /* Время чтения последнего куска: NodeStatus в рабочем режиме после него - прошивка встала */
        let doneAt = 0
        const watch = (readPath: string, offset: number) => {
          if (readPath !== path) return
          lastRead = now()
          bytes = Math.max(bytes, Math.min(offset + DRONECAN_FILE_CHUNK, data.length))
          if (offset + DRONECAN_FILE_CHUNK >= data.length && !done) {
            done = true
            doneAt = now()
          }
          onProgress?.({ phase: "read", bytes, size: data.length })
        }
        readWatchers.add(watch)
        try {
          const res = await request(
            "uavcan.protocol.file.BeginFirmwareUpdate",
            node,
            { source_node_id: nodeId, image_file_remote_path: { path } },
            { timeoutMs: 3000, retries: 1 },
          )
          const code = Number(res.error ?? 0)
          if (code !== FW_OK && code !== FW_IN_PROGRESS) {
            const message = typeof res.optional_error_message === "string" ? res.optional_error_message : ""
            throw new Error(`DroneCAN: узел ${node} отказал в обновлении прошивки (код ${code}${message ? `, ${message}` : ""})`)
          }
          lastRead = now()
          while (!done) {
            await new Promise((resolve) => setTimeout(resolve, 200))
            if (now() - lastRead > idleTimeoutMs) throw new Error(`DroneCAN: узел ${node} перестал читать прошивку (${bytes} из ${data.length} байт)`)
          }
        } finally {
          readWatchers.delete(watch)
        }
        /* Файл прочитан: ждём, что узел снова пришлёт NodeStatus в рабочем режиме */
        onProgress?.({ phase: "reboot", bytes: data.length, size: data.length })
        while (now() - doneAt < rebootTimeoutMs) {
          const entry = nodes.get(node)
          if (entry && entry.lastSeen >= doneAt && entry.mode === 0) {
            onProgress?.({ phase: "done", bytes: data.length, size: data.length })
            return
          }
          await new Promise((resolve) => setTimeout(resolve, 250))
        }
        throw new Error(`DroneCAN: узел ${node} не вернулся в рабочий режим после прошивки`)
      } finally {
        files.delete(path)
      }
    },
    dispose() {
      clearInterval(statusTimer)
      clearInterval(offlineTimer)
      for (const wait of pending.values()) clearTimeout(wait.timer)
      pending.clear()
    },
  }
}
