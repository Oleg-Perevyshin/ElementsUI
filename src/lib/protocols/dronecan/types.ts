/* src/lib/protocols/dronecan/types.ts - описание типов DroneCAN, которое строит генератор из DSDL */

/* Поле: p - число (b - bool, u/i - целое без знака и со знаком, f - float16/32/64), v - пустые биты, a - массив, c - вложенный тип */
export type DroneCanField =
  | { k: "p"; kind: "b" | "u" | "i" | "f"; bits: number; trunc?: boolean }
  | { k: "v"; bits: number }
  | { k: "a"; of: DroneCanField; max: number; dyn?: boolean }
  | { k: "c"; name: string }

/* Структура: поля по порядку, union - одно поле из списка с номером-тегом впереди; min/max - длина в битах; constants - именованные значения из DSDL */
export interface DroneCanStruct {
  fields: { name: string | null; type: DroneCanField }[]
  union?: boolean
  min: number
  max: number
  constants?: Record<string, number>
}

/* Тип: полное имя, ID по умолчанию (null - вложенный тип без ID), сообщение или сервис, сигнатура для CRC многокадровых передач */
export type DroneCanTypeDef =
  | { name: string; id: number | null; kind: "msg"; signature: bigint; msg: DroneCanStruct }
  | { name: string; id: number | null; kind: "srv"; signature: bigint; req: DroneCanStruct; res: DroneCanStruct }
