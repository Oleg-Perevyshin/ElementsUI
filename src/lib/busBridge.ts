/* $lib/busBridge.ts - мост GUI к устройству через шину (консоль xPOE-Debug, CAN, RS485): та же связь DeviceLink, что у веба и облака, - модули по ModSN, значения "<ModSN>|ключ", сообщения устройства в ответах */
import { formatDeviceMessage, splitHar, type DeviceMessageLevel, type Dictionary } from "./protocols"
import type { DeviceReply } from "./fsTransfer"
import { mergeDevicePayload, type DeviceLink } from "./gui"
import { DEFAULT_LANGUAGE, type LanguageCode } from "./locales/languages"

/* Принятый пакет шины: адреса, заголовок и аргумент именами словаря, code - код аргумента, payload - декодированный CBOR */
export interface BusPacket {
  trgId: number
  srcId: number
  header: string
  argument: string
  code: number
  payload: unknown
}

/* Канал к порту: send - пакет адресату trgId от клиента (SourceID 0000), listen - подписка на принятые пакеты, возвращает отписку */
export interface BusChannel {
  send(trgId: number, har: number, payload: Record<string, unknown>): unknown
  listen(handler: (packet: BusPacket) => void): () => void
}

/* Модуль изделия из CFG.ModList головного модуля (или сам модуль консоли, если списка нет) */
export interface BusModule {
  ModSN: string
  ModName: string
  VerFW: number
  ModIFace?: number
  Progress?: number
  /* Модуль, к которому подключён порт: команды ему - на адрес 0000 */
  self: boolean
}

export interface BusBridgeOptions {
  /* Хранилище значений "<ModSN>|ключ" (Map, SvelteMap) - как DeviceStore веба */
  values: { get(key: string): unknown; set(key: string, value: never): unknown }
  dictionary?: Dictionary
  /* Язык текстов сообщений устройства */
  language?: () => LanguageCode
  /* Сообщение устройства (код Message не 0) - уведомление с именем модуля, как в вебе */
  onMessage?: (text: string, level: DeviceMessageLevel, module: BusModule | undefined) => void
  /* Список модулей изменился */
  onModules?: (modules: BusModule[]) => void
  /* Адрес команд модулю порта: 0000 - консоль xPOE-Debug (по умолчанию), FFFF - шины CAN и RS485, где терминал сам ведущий */
  selfTarget?: number
}

/* Аргументы, чей Payload ложится в значения - как в вебе (README протокола: Update, DataStream и др.) */
const DATA_ARGUMENTS = new Set(["Update", "DataStream", "ModCfg", "FS", "ModInfo", "APsList", "StackInfo"])
/* Сообщение консоли приходит пакетом DebugLog прямо перед своим ответом - склеиваются в этом окне, мс */
const MESSAGE_WINDOW_MS = 500

const isRecord = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value)

/** BusID модуля по серийному номеру: HEX после ":", 0000 и FFFF сдвигаются на 1 (get_dev_bus_id прошивок); нет - 0 */
export const busIdFromSN = (serial: string): number => {
  const tail = serial.split(":")[1]
  const id = tail ? parseInt(tail, 16) : NaN
  if (!Number.isFinite(id)) return 0
  return id === 0 || id === 0xffff ? id ^ 1 : id
}

/* Сообщение консоли: DebugLog [уровень, "HAR 0x....", "MSG <код> <арг1>\t<арг2>", FHS] */
const parseConsoleMessage = (payload: unknown): { har: number; code: number; args: string[] } | null => {
  if (!Array.isArray(payload)) return null
  const tag = /^HAR 0x([0-9A-F]{4})$/i.exec(String(payload[1] ?? ""))
  const text = /^MSG (\d+)(?: (.*))?$/s.exec(String(payload[2] ?? ""))
  if (!tag || !text) return null
  return { har: parseInt(tag[1], 16), code: Number(text[1]), args: text[2] ? text[2].split("\t") : [] }
}

/** Мост: связь DeviceLink для каждого модуля изделия поверх канала шины */
export const createBusBridge = (channel: BusChannel, options: BusBridgeOptions) => {
  const { values, dictionary, language = () => DEFAULT_LANGUAGE, onMessage, onModules, selfTarget = 0 } = options
  let selfSN = ""
  let modules: BusModule[] = []
  /* Сообщение, ждущее свой ответ: по адресу отправителя */
  const pending = new Map<number, { har: number; text: string; level: DeviceMessageLevel; ts: number }>()
  const handlers = new Set<(packet: BusPacket, module: string, message: string | undefined) => void>()

  const moduleOf = (ModSN: string) => modules.find((m) => m.ModSN === ModSN)
  /* ModSN отправителя: модуль консоли, модуль из списка по BusID; неизвестный - "0x...." до прихода списка */
  const snOf = (srcId: number) =>
    (selfSN && busIdFromSN(selfSN) === srcId ? selfSN : modules.find((m) => !m.self && busIdFromSN(m.ModSN) === srcId)?.ModSN) ??
    `0x${srcId.toString(16).toUpperCase().padStart(4, "0")}`
  /* Адрес команды: модулю порта - selfTarget, остальным - их BusID (головной модуль перешлёт) */
  const busOf = (ModSN: string) => (!ModSN || ModSN === selfSN ? selfTarget : busIdFromSN(ModSN))

  const setModules = (next: BusModule[]) => {
    modules = next
    onModules?.(modules)
  }

  /* Свой серийный номер из ответа модуля консоли: CFG.DevSN или ModSN в ModInfo */
  const learnSelf = (packet: BusPacket) => {
    if (!isRecord(packet.payload)) return
    const sn = packet.payload["CFG.DevSN"] ?? (packet.argument === "ModInfo" ? packet.payload.ModSN : undefined)
    if (selfSN || typeof sn !== "string" || busIdFromSN(sn) !== packet.srcId) return
    selfSN = sn
    if (!modules.some((m) => m.self)) {
      const name = String(packet.payload["CFG.DevName"] ?? packet.payload.ModName ?? sn)
      setModules([{ ModSN: sn, ModName: name, VerFW: Number(packet.payload["CFG.DevFW"] ?? packet.payload.VerFW) || 0, self: true }, ...modules])
    }
  }

  const learnModules = (packet: BusPacket) => {
    const list = isRecord(packet.payload) ? packet.payload["CFG.ModList"] : undefined
    /* Список модулей - только от модуля порта: у модулей за ним свой ModList из одного себя */
    if (!Array.isArray(list) || !list.length || packet.srcId !== busIdFromSN(String(list[0]?.ModSN ?? "")) || (selfSN && list[0].ModSN !== selfSN)) return
    selfSN = String(list[0].ModSN)
    setModules(
      list.filter(isRecord).map((m) => ({
        ModSN: String(m.ModSN ?? ""),
        ModName: String(m.ModName ?? m.ModSN ?? ""),
        VerFW: Number(m.VerFW) || 0,
        ModIFace: typeof m.ModIFace === "number" ? m.ModIFace : undefined,
        Progress: typeof m.Progress === "number" ? m.Progress : undefined,
        self: m.ModSN === selfSN,
      })),
    )
  }

  const unlisten = channel.listen((packet) => {
    /* DebugLog с сообщением - ждёт свой ответ, в значения не идёт */
    const consoleMessage = packet.argument === "DebugLog" ? parseConsoleMessage(packet.payload) : null
    if (consoleMessage) {
      const shown = formatDeviceMessage(consoleMessage.code, consoleMessage.args, language())
      if (shown) pending.set(packet.srcId, { har: consoleMessage.har, text: shown.text, level: shown.level, ts: Date.now() })
      return
    }
    learnSelf(packet)
    learnModules(packet)
    const ModSN = snOf(packet.srcId)
    if (DATA_ARGUMENTS.has(packet.argument) && packet.header !== "ER!") mergeDevicePayload(values, `${ModSN}|`, packet.argument, packet.payload)

    /* Своё сообщение: тот же отправитель и аргумент, пришло только что */
    let message: string | undefined
    const waiting = pending.get(packet.srcId)
    if (waiting && Date.now() - waiting.ts < MESSAGE_WINDOW_MS && splitHar(waiting.har).argument === packet.code) {
      pending.delete(packet.srcId)
      message = waiting.text
      onMessage?.(waiting.text, waiting.level, moduleOf(ModSN))
    }
    for (const handler of handlers) handler(packet, ModSN, message)
  })

  /* Связь модуля: одна на ModSN - у рендерера на неё завязана очередь передачи файлов */
  const links = new Map<string, DeviceLink>()
  const link = (ModSN: string): DeviceLink => {
    const known = links.get(ModSN)
    if (known) return known
    const created: DeviceLink = {
      dictionary,
      get: (key, module) => values.get(`${module ?? ModSN}|${key}`),
      set: (key, value) => values.set(`${ModSN}|${key}`, value as never),
      send: (har, payload) => channel.send(busOf(ModSN), har, payload),
      waitFor: (code, match, timeoutMs) =>
        new Promise<DeviceReply | null>((resolve) => {
          const done = (reply: DeviceReply | null) => {
            clearTimeout(timer)
            handlers.delete(handler)
            resolve(reply)
          }
          const handler = (packet: BusPacket, from: string, message: string | undefined) => {
            if (
              packet.code !== code ||
              (from !== ModSN && !(ModSN === "" && from === (selfSN || from))) ||
              (packet.header !== "OK!" && packet.header !== "ER!")
            )
              return
            const reply: DeviceReply = { ok: packet.header === "OK!", payload: isRecord(packet.payload) ? packet.payload : {}, message }
            if (match(reply)) done(reply)
          }
          handlers.add(handler)
          const timer = setTimeout(() => done(null), timeoutMs)
        }),
    }
    links.set(ModSN, created)
    return created
  }

  return {
    /** Связь с модулем; "" - модуль консоли, пока его серийный номер не известен */
    link,
    /** Модули изделия: из CFG.ModList головного модуля или сам модуль консоли */
    modules: () => modules,
    /** Серийный номер модуля консоли ("" - ещё не ответил) */
    self: () => selfSN,
    /** Отписка от канала */
    dispose: () => {
      unlisten()
      handlers.clear()
    },
  }
}

export type BusBridge = ReturnType<typeof createBusBridge>
