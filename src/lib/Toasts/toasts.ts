/* $lib/Toasts/toasts.ts - очередь всплывающих уведомлений (как в облаке DevCloud): автоудаление через 7 с, то же сообщение не повторяется, а живёт дольше */
import { get, writable } from "svelte/store"
import type { DeviceMessageLevel } from "../protocols"

export interface IToast {
  id: number
  /* Заголовок, например имя модуля */
  title?: string
  text: string
  /* Цвет текста и полосы: error - красный, warn - жёлтый, info - зелёный; без уровня - приглушённый текст, зелёная полоса */
  level?: DeviceMessageLevel
  createdAt: number
}

/* Время жизни уведомления, мс */
export const TOAST_LIFETIME_MS = 7000

export const toasts = writable<IToast[]>([])
const timers = new Map<number, ReturnType<typeof setTimeout>>()
let nextId = 0

/** Убрать уведомление */
export const removeToast = (id: number) => {
  clearTimeout(timers.get(id))
  timers.delete(id)
  toasts.update((list) => list.filter((toast) => toast.id !== id))
}

/** Показать уведомление; такое же уже на экране - живёт ещё TOAST_LIFETIME_MS. Префиксы "ER: ", "WR: ", "OK: " в тексте (как в облаке) задают уровень */
export const addToast = (text: string, title?: string, level?: DeviceMessageLevel) => {
  const prefix = /^(ER|WR|OK): /.exec(text)
  if (prefix) {
    text = text.slice(4)
    level ??= prefix[1] === "ER" ? "error" : prefix[1] === "WR" ? "warn" : "info"
  }
  const same = get(toasts).find((toast) => toast.text === text && toast.title === title)
  const id = same?.id ?? nextId++
  if (!same) toasts.update((list) => [...list, { id, title, text, level, createdAt: Date.now() }])
  else toasts.update((list) => list.map((toast) => (toast.id === id ? { ...toast, createdAt: Date.now() } : toast)))
  clearTimeout(timers.get(id))
  timers.set(
    id,
    setTimeout(() => removeToast(id), TOAST_LIFETIME_MS),
  )
}
