/* scripts/GenerateDroneCAN.mjs - официальные описания DSDL (vendor/dronecan-dsdl) в таблицу типов DroneCAN для кодека библиотеки: src/lib/protocols/dronecan/generated/types.ts; разбор и сигнатуры - как в официальном парсере pydronecan (dronecan/dsdl/parser.py, signature.py) */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const DSDL_DIR = path.join(ROOT, "vendor", "dronecan-dsdl")
const OUT_FILE = path.join(ROOT, "src", "lib", "protocols", "dronecan", "generated", "types.ts")

/* CRC-64-WE: начальное 0xFFFF..., полином 0x42F0E1EBA9EA3693, выход xor 0xFFFF... (signature.py) */
const MASK64 = (1n << 64n) - 1n
const POLY64 = 0x42f0e1eba9ea3693n
class Signature {
  constructor(extendFrom) {
    this.crc = extendFrom === undefined ? MASK64 : (BigInt(extendFrom) & MASK64) ^ MASK64
  }
  add(bytes) {
    for (const b of typeof bytes === "string" ? Buffer.from(bytes, "latin1") : bytes) {
      this.crc ^= (BigInt(b) << 56n) & MASK64
      for (let i = 0; i < 8; i++) this.crc = this.crc & (1n << 63n) ? ((this.crc << 1n) & MASK64) ^ POLY64 : this.crc << 1n
    }
  }
  value() {
    return (this.crc & MASK64) ^ MASK64
  }
}
const crc64Bytes = (value) => {
  const out = Buffer.alloc(8)
  out.writeBigUInt64LE(value)
  return out
}
const bitLength = (n) => (n <= 0 ? 0 : n.toString(2).length)

/* Все файлы *.uavcan: имя [DTID.]Имя[.major.minor].uavcan, пространство имён - путь от корня каталога DSDL */
const files = new Map()
const walk = (dir, ns) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, [...ns, entry.name])
    else if (entry.name.endsWith(".uavcan")) {
      const items = entry.name.split(".")
      const hasId = items.length === 3 || items.length === 5
      const name = hasId ? items[1] : items[0]
      files.set([...ns, name].join("."), { file: full, id: hasId ? Number(items[0]) : null })
    }
  }
}
for (const root of fs.readdirSync(DSDL_DIR, { withFileTypes: true })) if (root.isDirectory()) walk(path.join(DSDL_DIR, root.name), [root.name])

/* Простые выражения констант: числа, true/false, символ в кавычках */
const evalConst = (expr) => {
  const text = expr.replace(/\s+/g, "")
  if (/^'.'$/.test(text)) return text.charCodeAt(1)
  const escaped = /^'\\(.)'$/.exec(text)
  if (escaped) return { n: 10, r: 13, t: 9, 0: 0, "\\": 92, "'": 39 }[escaped[1]] ?? escaped[1].charCodeAt(0)
  if (text === "true") return 1
  if (text === "false") return 0
  if (!/^[-+0-9.eExXa-fA-F()*/+-]+$/.test(text)) throw new Error(`константа: ${expr}`)
  return Function(`"use strict"; return (${text})`)()
}

const parsed = new Map()
const parseType = (typedef, castMode, ns) => {
  const voidMatch = /^void(\d{1,2})$/.exec(typedef)
  if (voidMatch) return { k: "v", bits: Number(voidMatch[1]) }
  const arrayMatch = /^(.+?)\[([^\]]*)\]$/.exec(typedef)
  if (arrayMatch) {
    const of = parseType(arrayMatch[1].trim(), castMode, ns)
    const spec = arrayMatch[2].trim()
    if (spec.startsWith("<=")) return { k: "a", of, max: Number(spec.slice(2)), dyn: true }
    if (spec.startsWith("<")) return { k: "a", of, max: Number(spec.slice(1)) - 1, dyn: true }
    return { k: "a", of, max: Number(spec), dyn: false }
  }
  const sat = castMode !== "truncated"
  if (typedef === "bool") return { k: "p", kind: "b", bits: 1, sat }
  const prim = /^([a-z]+)(\d{1,2})$/.exec(typedef)
  if (prim) return { k: "p", kind: { uint: "u", int: "i", float: "f" }[prim[1]], bits: Number(prim[2]), sat }
  const full = typedef.includes(".") ? typedef : `${ns}.${typedef}`
  parse(full)
  return { k: "c", name: full }
}

/* Нормализованное описание поля и типа - основа сигнатуры (get_normalized_definition) */
const normType = (t) => {
  if (t.k === "v") return `void${t.bits}`
  if (t.k === "p") return `${t.sat ? "saturated" : "truncated"} ${{ b: "bool", u: `uint${t.bits}`, i: `int${t.bits}`, f: `float${t.bits}` }[t.kind]}`
  if (t.k === "a") return `${normType(t.of)}[${t.dyn ? "<=" : ""}${t.max}]`
  return t.name
}
const normField = (f) => (f.type.k === "v" ? normType(f.type) : `${normType(f.type)} ${f.name}`)

const maxBits = (t) => {
  if (t.k === "v" || t.k === "p") return t.bits
  if (t.k === "a") return t.max * maxBits(t.of) + (t.dyn ? bitLength(t.max) : 0)
  return parse(t.name).struct.max
}
const minBits = (t) => {
  if (t.k === "v" || t.k === "p") return t.bits
  if (t.k === "a") return t.dyn ? 0 : t.max * minBits(t.of)
  return parse(t.name).struct.min
}
const structBits = (s) => {
  if (!s.fields.length) return { max: 0, min: 0 }
  const maxes = s.fields.map((f) => maxBits(f.type))
  const mins = s.fields.map((f) => minBits(f.type))
  const tag = bitLength(Math.max(s.fields.length - 1, 1))
  return s.union
    ? { max: Math.max(...maxes) + tag, min: Math.min(...mins) + tag }
    : { max: maxes.reduce((a, b) => a + b, 0), min: mins.reduce((a, b) => a + b, 0) }
}
const nestedSignature = (t) => (t.k === "c" ? parse(t.name).signature : t.k === "a" ? nestedSignature(t.of) : null)

function parse(fullName) {
  if (parsed.has(fullName)) return parsed.get(fullName)
  const source = files.get(fullName)
  if (!source) throw new Error(`нет описания ${fullName}`)
  const ns = fullName.split(".").slice(0, -1).join(".")
  const req = { fields: [], constants: [], union: false }
  let res = null
  let override = null
  const text = fs.readFileSync(source.file, "utf8")
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, "").trim()
    if (!line) continue
    const cur = res ?? req
    if (line === "---") {
      res = { fields: [], constants: [], union: false }
      continue
    }
    if (line === "@union") {
      cur.union = true
      continue
    }
    let tokens = line.split(/\s+/)
    if (tokens.length === 2 && tokens[0] === "OVERRIDE_SIGNATURE") {
      override = BigInt(`0x${tokens[1].replace(/^0x/i, "")}`)
      continue
    }
    let cast = null
    if (tokens[0] === "saturated" || tokens[0] === "truncated") [cast, ...tokens] = tokens
    const type = parseType(tokens[0], cast, ns)
    const name = tokens[1] ?? null
    if (tokens.length > 2) {
      if (tokens[2] !== "=") throw new Error(`${fullName}: ожидалось = в «${line}»`)
      cur.constants.push({ name, value: evalConst(tokens.slice(3).join(" ")) })
    } else cur.fields.push({ name, type })
  }
  /* Сигнатура DSDL - по нормализованному тексту, затем data type signature с вложенными типами (get_data_type_signature) */
  const block = (s) => (s.union ? "\n@union\n" : "") + s.fields.map(normField).join("\n") + "\n"
  const normalized = `${fullName}\n${res ? `${block(req)}\n---\n${block(res)}` : block(req)}`
    .trim()
    .replace(/\n\n\n/g, "\n")
    .replace(/\n\n/g, "\n")
  const entry = { name: fullName, id: source.id, kind: res ? "srv" : "msg", req, res, signature: 0n, struct: null }
  parsed.set(fullName, entry)
  let dsdlSig
  if (override !== null) dsdlSig = override
  else {
    const s = new Signature()
    s.add(normalized)
    dsdlSig = s.value()
  }
  const sig = new Signature(dsdlSig)
  for (const field of [...req.fields, ...(res?.fields ?? [])]) {
    const nested = nestedSignature(field.type)
    if (nested !== null) {
      const current = sig.value()
      sig.add(crc64Bytes(nested))
      sig.add(crc64Bytes(current))
    }
  }
  entry.signature = sig.value()
  if (!res) entry.struct = { ...structBits(req) }
  for (const s of [req, res].filter(Boolean)) Object.assign(s, structBits(s))
  return entry
}

for (const name of [...files.keys()].sort()) parse(name)

/* Вывод: компактные описания полей - p (число: b/u/i/f, bits, sat), v (пустые биты), a (массив: of, max, dyn), c (вложенный тип по имени) */
const emitType = (t) => {
  if (t.k === "p") return `{ k: "p", kind: "${t.kind}", bits: ${t.bits}${t.sat ? "" : ", trunc: true"} }`
  if (t.k === "v") return `{ k: "v", bits: ${t.bits} }`
  if (t.k === "a") return `{ k: "a", of: ${emitType(t.of)}, max: ${t.max}${t.dyn ? ", dyn: true" : ""} }`
  return `{ k: "c", name: "${t.name}" }`
}
const emitStruct = (s) =>
  `{ fields: [${s.fields.map((f) => `{ name: ${f.name ? `"${f.name}"` : "null"}, type: ${emitType(f.type)} }`).join(", ")}], ` +
  `${s.union ? "union: true, " : ""}min: ${s.min}, max: ${s.max}` +
  `${s.constants.length ? `, constants: { ${s.constants.map((c) => `${c.name}: ${JSON.stringify(c.value)}`).join(", ")} }` : ""} }`
const lines = [...parsed.values()].map(
  (t) =>
    `  { name: "${t.name}", id: ${t.id}, kind: "${t.kind}", signature: 0x${t.signature.toString(16).padStart(16, "0")}n, ` +
    (t.kind === "msg" ? `msg: ${emitStruct(t.req)} },` : `req: ${emitStruct(t.req)}, res: ${emitStruct(t.res)} },`),
)
const out =
  `/* СГЕНЕРИРОВАНО scripts/GenerateDroneCAN.mjs из официальных описаний DSDL (vendor/dronecan-dsdl), вручную не править */\n` +
  `import type { DroneCanTypeDef } from "../types.js"\n\n` +
  `export const DRONECAN_TYPES: DroneCanTypeDef[] = [\n${lines.join("\n")}\n]\n`
fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true })
fs.writeFileSync(OUT_FILE, out)
console.log(`DroneCAN: ${parsed.size} типов -> ${path.relative(ROOT, OUT_FILE)}`)
