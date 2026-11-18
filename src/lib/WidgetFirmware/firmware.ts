/* $lib/WidgetFirmware/firmware.ts - как приложение обновляет прошивку модуля, чей GUI показан: через хаб ESP (upgrade_service ProdFactory-ESP, облако) или напрямую через загрузчик модуля (updateModuleFirmware, терминал) */
import type { DeviceLink } from "../gui.js"
import { sendCommand } from "../fsTransfer.js"
import { FirmwareUpdateError } from "../firmwareUpdate.js"

/* Как обновлять прошивку модуля, чей GUI показан: даёт приложение (облако, терминал) */
export interface FirmwareTarget {
  /* Серийный номер модуля */
  ModSN: string
  /* Связь головного модуля (хаба ESP): обновление через хаб, образ хаб берёт из каталога сам */
  hub?: DeviceLink
  /* Прямое обновление: образ версии из каталога облака */
  catalog?: (VerFW: number) => Promise<Uint8Array>
  /* Прямое обновление выбранным файлом .bin */
  file?: boolean
}

export interface HubUpdateOptions {
  /* Предел всего обновления, мс, по умолчанию 180000: модулю нужно до ~25 с на переход в загрузчик без хода */
  timeoutMs?: number
  /* Период опроса CFG.ModList, мс, по умолчанию 500 */
  pollMs?: number
}

type ModRow = { ModSN?: unknown; VerFW?: unknown; Progress?: unknown }

/* Строка модуля в списке хаба CFG.ModList (его кладёт приложение из OK! SystemDataUpdate) */
const moduleRow = (hub: DeviceLink, ModSN: string): ModRow | undefined => {
  const list = hub.get("CFG.ModList")
  return Array.isArray(list) ? (list as ModRow[]).find((row) => !!row && typeof row === "object" && row.ModSN === ModSN) : undefined
}

/* Обновление модуля через хаб: SET FirmwareUpgradeStart {ModSN, VerFW} без ответа, ход - Progress строки модуля в CFG.ModList (0..100) */
/* Успех - ход был и дошёл до 100 или версия строки стала VerFW; ход был и упал в 0 до 100 - отказ хаба (он же шлёт Message 306); последний 0 после успеха не учитывается */
export const updateViaHub = async (hub: DeviceLink, ModSN: string, VerFW: number, onProgress?: (percent: number) => void, options: HubUpdateOptions = {}) => {
  const { timeoutMs = 180000, pollMs = 500 } = options
  /* Ход до команды (остаток прошлого обновления) за начало нового не принимается, пока не изменится */
  const before = Number(moduleRow(hub, ModSN)?.Progress)
  sendCommand(hub, "SET", "FirmwareUpgradeStart", { ModSN, VerFW }, false)
  const started = Date.now()
  return new Promise<void>((resolve, reject) => {
    let seen = false
    let last = 0
    const tick = () => {
      const row = moduleRow(hub, ModSN)
      const raw = row?.Progress
      const progress = raw === undefined || raw === null || raw === "" ? NaN : Number(raw)
      if (Number.isFinite(progress)) {
        if (!seen && progress > 0 && progress !== before) seen = true
        if (seen && progress > 0) {
          last = Math.min(100, progress)
          onProgress?.(last)
        }
        if (seen && progress >= 100) return resolve()
        if (seen && progress <= 0) {
          if (Number(row?.VerFW) === VerFW) return resolve()
          return reject(new FirmwareUpdateError("hub", { percent: Math.round(last) }, `Hub aborted module update at ${last}%`))
        }
      }
      if (seen && Number(row?.VerFW) === VerFW) {
        onProgress?.(100)
        return resolve()
      }
      if (Date.now() - started >= timeoutMs) return reject(new FirmwareUpdateError("timeout", { step: "hub" }, "hub: timeout"))
      setTimeout(tick, pollMs)
    }
    setTimeout(tick, pollMs)
  })
}
