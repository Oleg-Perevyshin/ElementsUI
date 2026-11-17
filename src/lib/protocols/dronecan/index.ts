/* src/lib/protocols/dronecan/index.ts - DroneCAN (протокол CAN ArduPilot, классический CAN 1 Мбит/с), отдельная точка входа "poe-svelte-ui-lib/dronecan" (таблица типов большая и не нужна вебу прошивок): типы из официальных DSDL, кодек и передачи по алгоритмам libcanard, разбор и сборка передачи целиком */
import { droneCanMessage, droneCanService, droneCanStruct, droneCanType, decodeDroneCan, encodeDroneCan, type DroneCanValue } from "./codec.js"
import { createDroneCanReceiver, droneCanFrames, makeDroneCanId, type DroneCanId, type DroneCanTransfer, type DroneCanTransferType } from "./transfer.js"
import type { DroneCanTypeDef } from "./types.js"

export * from "./types.js"
export * from "./codec.js"
export * from "./transfer.js"
export { encodeScalar, decodeScalar, floatToFloat16, float16ToFloat } from "./bits.js"

/* Тип передачи по её ID: сообщение - по ID сообщения, запрос и ответ - по ID сервиса */
export const droneCanTypeOf = (id: Pick<DroneCanId, "type" | "dataTypeId" | "source">): DroneCanTypeDef | undefined =>
  id.type === "msg" ? (id.source === 0 ? undefined : droneCanMessage(id.dataTypeId)) : droneCanService(id.dataTypeId)

/* Сборщик передач с сигнатурами известных типов - для CRC многокадровых передач */
export const createDroneCanTransferReceiver = (timeoutMs = 2000) => createDroneCanReceiver({ timeoutMs, signatureOf: (id) => droneCanTypeOf(id)?.signature })

export interface DroneCanDecoded {
  /* Полное имя типа, например uavcan.protocol.NodeStatus; неизвестный тип - пусто */
  typeName: string
  value?: { [key: string]: DroneCanValue }
  error?: string
}

/* Значение передачи по описанию её типа; неизвестный тип или битые данные - error, байты остаются в transfer.payload */
export const decodeDroneCanTransfer = (t: DroneCanTransfer): DroneCanDecoded => {
  const def = droneCanTypeOf(t)
  if (!def) return { typeName: "", error: t.source === 0 && t.type === "msg" ? "anonymous" : `unknown ${t.type} ${t.dataTypeId}` }
  if (!t.crcOk) return { typeName: def.name, error: "CRC" }
  try {
    return { typeName: def.name, value: decodeDroneCan(droneCanStruct(def, t.type), t.payload) }
  } catch (error) {
    return { typeName: def.name, error: error instanceof Error ? error.message : String(error) }
  }
}

export interface DroneCanOutgoing {
  /* Полное имя типа; type - сообщение, запрос или ответ сервиса */
  typeName: string
  type: DroneCanTransferType
  value: Record<string, unknown>
  source: number
  destination?: number
  priority?: number
  transferId: number
  /* ID типа, если у него нет ID по умолчанию или нужен другой */
  dataTypeId?: number
}

/* Передача в кадры CAN: 29-битный ID и данные каждого кадра с хвостовым байтом */
export const encodeDroneCanTransfer = (out: DroneCanOutgoing): { canId: number; frames: Uint8Array[] } => {
  const def = droneCanType(out.typeName)
  if (!def) throw new Error(`DroneCAN: нет типа ${out.typeName}`)
  if ((def.kind === "msg") !== (out.type === "msg")) throw new Error(`DroneCAN: ${out.typeName} - ${def.kind === "msg" ? "сообщение" : "сервис"}`)
  const dataTypeId = out.dataTypeId ?? def.id
  if (dataTypeId === null) throw new Error(`DroneCAN: у ${out.typeName} нет ID по умолчанию`)
  const payload = encodeDroneCan(droneCanStruct(def, out.type), out.value)
  const canId = makeDroneCanId({ priority: out.priority ?? 16, type: out.type, dataTypeId, source: out.source, destination: out.destination ?? 0 })
  return { canId, frames: droneCanFrames(canId, payload, out.transferId, def.signature) }
}
