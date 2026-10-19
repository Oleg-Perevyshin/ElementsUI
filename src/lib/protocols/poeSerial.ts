/* $lib/protocols/poeSerial.ts */
/* Рамка POESerial (system_console прошивки): [SOH] HEADER [US] ARGUMENT [STX] VALUE [ETX] CRC8 [US] FHS [EOT] \n — CRC8 двумя hex-символами
   по HEADER+ARGUMENT+VALUE (crc8RohcUtf8), FHS (свободная куча) только у кадров устройства. Устройство шлёт VALUE текстом (лог или hex-дамп CBOR),
   устройству VALUE уходит сырыми байтами CBOR. Между кадрами — текст: строки Teleplot «>Имя:Значение» (PLOT) и прочий вывод (RAW) */
import { crc8RohcUtf8 } from "./crc.js"
import { jsonToCbor } from "./cbor/json.js"

export const SOH = 0x01
export const STX = 0x02
export const ETX = 0x03
export const EOT = 0x04
export const US = 0x1f
const LF = 0x0a

/* Предел текста без конца строки и незавершённого кадра — дальше отдаётся/сбрасывается, чтобы буфер не рос бесконечно */
const MAX_TEXT_TAIL = 4096
const MAX_FRAME = 8192

export type PoeSerialItem =
  | { type: "frame"; header: string; argument: string; value: string; valueBytes: Uint8Array; crc: string; crcOk: boolean; freeHeap: string }
  | { type: "plot"; name: string; value: string }
  | { type: "raw"; text: string }

const encoder = new TextEncoder()
const decoder = new TextDecoder()
const hex2 = (value: number) => value.toString(16).toUpperCase().padStart(2, "0")

/* Кадр команды устройству — те же байты, что разбирает system_console (VALUE — сырой CBOR, FHS не передаётся) */
export const encodePoeSerialFrame = (header: string, argument: string, value: Uint8Array): Uint8Array => {
  const headerBytes = encoder.encode(header)
  const argumentBytes = encoder.encode(argument)
  const crc = crc8RohcUtf8(crc8RohcUtf8(crc8RohcUtf8(0xff, headerBytes), argumentBytes), value)
  return new Uint8Array([SOH, ...headerBytes, US, ...argumentBytes, STX, ...value, ETX, ...encoder.encode(hex2(crc)), EOT])
}

/* Строки текста вне кадров: Teleplot «>Имя:Значение» → plot, остальное → raw; пустые и с управляющими символами пропускаются */
const textItems = (bytes: Uint8Array): PoeSerialItem[] =>
  decoder
    .decode(bytes)
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && ![...line].some((char) => char.charCodeAt(0) < 0x20 && char !== "\t"))
    .map((line) => {
      const colon = line.indexOf(":")
      return line.startsWith(">") && colon > 1 ? { type: "plot", name: line.slice(1, colon), value: line.slice(colon + 1) } : { type: "raw", text: line }
    })

/* Кадр от SOH до EOT включительно; без разделителей — null (пропускается, как в прошивке и Rust-терминале) */
const frameItem = (frame: Uint8Array): PoeSerialItem | null => {
  const us = frame.indexOf(US)
  const stx = us < 0 ? -1 : frame.indexOf(STX, us + 1)
  const etx = stx < 0 ? -1 : frame.indexOf(ETX, stx + 1)
  if (etx < 0) return null
  const header = frame.subarray(1, us)
  const argument = frame.subarray(us + 1, stx)
  const valueBytes = frame.subarray(stx + 1, etx)
  const tailUs = frame.indexOf(US, etx + 1)
  const crc = decoder.decode(frame.subarray(etx + 1, tailUs < 0 ? frame.length - 1 : tailUs)).trim()
  const freeHeap = tailUs < 0 ? "" : decoder.decode(frame.subarray(tailUs + 1, frame.length - 1)).trim()
  const crcCalc = crc8RohcUtf8(crc8RohcUtf8(crc8RohcUtf8(0xff, header), argument), valueBytes)
  return {
    type: "frame",
    header: decoder.decode(header),
    argument: decoder.decode(argument),
    value: decoder.decode(valueBytes),
    valueBytes: valueBytes.slice(),
    crc,
    crcOk: /^[0-9A-Fa-f]{2}$/.test(crc) && parseInt(crc, 16) === crcCalc,
    freeHeap,
  }
}

const concat = (a: Uint8Array, b: Uint8Array) => {
  const out = new Uint8Array(a.length + b.length)
  out.set(a)
  out.set(b, a.length)
  return out
}

/* Потоковый разбор: push(байты из порта) → готовые кадры и строки; незавершённое ждёт следующего чанка */
export const createPoeSerialParser = () => {
  let buffer = new Uint8Array()
  return {
    push(chunk: Uint8Array): PoeSerialItem[] {
      buffer = concat(buffer, chunk)
      const items: PoeSerialItem[] = []
      for (;;) {
        const soh = buffer.indexOf(SOH)
        if (soh < 0) break
        /* Текст перед кадром не теряем; обрывок прошлого кадра (до последнего EOT) отбрасываем */
        if (soh > 0) {
          const prefix = buffer.subarray(0, soh)
          items.push(...textItems(prefix.subarray(prefix.lastIndexOf(EOT) + 1)))
          buffer = buffer.slice(soh)
          continue
        }
        const eot = buffer.indexOf(EOT)
        if (eot < 0) {
          /* Кадр без конца слишком длинный — потерян EOT: пропускаем его SOH и ищем следующий кадр, иначе ждём ещё байт */
          if (buffer.length <= MAX_FRAME) break
          buffer = buffer.slice(1)
          continue
        }
        const item = frameItem(buffer.subarray(0, eot + 1))
        if (item) items.push(item)
        buffer = buffer.slice(eot + 1)
      }
      /* Хвост без начала кадра: целые строки — наружу, незавершённая строка ждёт следующего чанка */
      if (buffer.indexOf(SOH) < 0) {
        const cut = buffer.length > MAX_TEXT_TAIL ? buffer.length : buffer.lastIndexOf(LF)
        if (cut >= 0) {
          items.push(...textItems(buffer.subarray(0, cut)))
          buffer = buffer.slice(Math.min(cut + 1, buffer.length))
        }
      }
      return items
    },
    /* Сброс при переподключении порта */
    reset() {
      buffer = new Uint8Array()
    },
  }
}

/* Поле Value команды из ввода пользователя: пусто — без тела, hex-строка (с пробелами или без) — готовые байты как есть, иначе JSON → CBOR
   (двоичные данные — base64, ключи с BIN — байты, см. jsonToCbor); не hex и не JSON — ошибка */
export const poeSerialValueFromText = (text: string | undefined): Uint8Array => {
  const trimmed = (text ?? "").trim()
  if (!trimmed) return new Uint8Array()
  if (/^([0-9A-Fa-f]{2}\s?)+$/.test(trimmed)) return Uint8Array.from(trimmed.replace(/\s/g, "").match(/../g) ?? [], (pair) => parseInt(pair, 16))
  let parsed: unknown
  try {
    parsed = JSON.parse(trimmed)
  } catch {
    throw new Error(`Value не является ни hex, ни JSON: ${trimmed}`)
  }
  return jsonToCbor(parsed)
}
