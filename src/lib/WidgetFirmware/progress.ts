/* $lib/WidgetFirmware/progress.ts - ход обновления прошивки вне виджета: по ключу (серийный номер модуля), живёт, пока открыто приложение. GUI пересоздаётся (смена раскладки, новый GUI, модуль ушёл в загрузчик) - новый WidgetFirmware сразу показывает идущее обновление, а второе на тот же модуль не запускается */
import { SvelteMap } from "svelte/reactivity"
import type { WidgetFirmwareStage } from "../types"

export interface FirmwareProgressState {
  /* Обновление идёт */
  running: boolean
  /* Этап: start, bootloader, erase, write, verify, hub; done - готово, error - ошибка */
  stage: WidgetFirmwareStage | "done" | "error" | null
  /* Ход 0-100, целые */
  percent: number
  /* Текст ошибки для строки состояния */
  errorText: string
}

export const FIRMWARE_PROGRESS_IDLE: FirmwareProgressState = { running: false, stage: null, percent: 0, errorText: "" }

/* Ход по ключу; запись целиком (set), чтобы виджеты видели изменение */
export const firmwareProgress = new SvelteMap<string, FirmwareProgressState>()

/* Обновить ход по ключу частично */
export const patchFirmwareProgress = (key: string, patch: Partial<FirmwareProgressState>) =>
  firmwareProgress.set(key, { ...(firmwareProgress.get(key) ?? FIRMWARE_PROGRESS_IDLE), ...patch })

/* Модули, чья прошивка обновляется сейчас: одно обновление за раз на всё приложение, а не на экземпляр GUIRenderer */
export const flashingModules = new Set<string>()
