/* tests/firmwareUpdate.test.mjs - обновление прошивки модуля STM против модели загрузчика 00.00.491-01: переход приложения в загрузчик, части с CRC16, RESYNC, CRC32 образа; обновление через хаб ESP (updateViaHub) по ходу в CFG.ModList */
import { test } from "node:test"
import assert from "node:assert/strict"
import { updateModuleFirmware, FirmwareUpdateError } from "../dist/firmwareUpdate.js"
import { crc16Kermit, crc32 } from "../dist/protocols/crc.js"
import { decodeHar } from "../dist/protocols/dictionary.js"
import { updateViaHub } from "../dist/WidgetFirmware/firmware.js"

const u32 = (bytes, at) => new DataView(bytes.buffer, bytes.byteOffset + at, 4).getUint32(0, true)

/* Модуль: приложение (ModuleFind - версия 1) и загрузчик (версия 0, части по block байт); resyncAt - на какой части один раз попросить повтор с resyncTo; noBoot - загрузчика нет */
const fakeModule = ({ block = 40, resyncAt = -1, resyncTo = 0, noBoot = false, dropEnter = 0 } = {}) => {
  const waiters = []
  const state = { boot: false, image: null, size: 0, crc: 0, next: 0, written: [], done: false, resynced: false }
  const answer = (code, ok, payload, raw) => {
    const reply = { ok, payload: payload ?? {}, raw, message: "" }
    const index = waiters.findIndex((w) => w.code === code && w.match(reply))
    if (index < 0) return
    const [w] = waiters.splice(index, 1)
    clearTimeout(w.timer)
    w.resolve(reply)
  }
  const transport = {
    waitFor: (code, match, timeoutMs) =>
      new Promise((resolve) => {
        const w = { code, match, resolve }
        w.timer = setTimeout(() => {
          waiters.splice(waiters.indexOf(w), 1)
          resolve(null)
        }, timeoutMs)
        waiters.push(w)
      }),
    send: (har, payload) => {
      const { header, argument, code, reply } = decodeHar(har)
      setTimeout(() => {
        if (argument === "ModuleFind") {
          const raw = new Uint8Array(state.boot ? 47 : 60)
          if (!state.boot) raw[raw.length - 4] = 1
          return answer(code, true, {}, raw)
        }
        if (argument === "FirmwareUpgradeStart" && !state.boot) {
          assert.equal(reply, false)
          if (dropEnter-- > 0) return /* модуль как раз перезапускался - команда потерялась */
          if (!noBoot) setTimeout(() => (state.boot = true), 30)
          return
        }
        if (argument === "FirmwareUpgradeStart") {
          state.size = u32(payload, 0)
          state.crc = u32(payload, 4)
          state.next = 0
          state.written = []
          return answer(code, true, {}, Uint8Array.of(block))
        }
        if (argument === "FirmwareUpgradeChunk") {
          const index = u32(payload, 0)
          const crc = new DataView(payload.buffer, payload.byteOffset + 4, 2).getUint16(0, true)
          const data = payload.subarray(6)
          if (index === resyncAt && !state.resynced) {
            state.resynced = true
            state.next = resyncTo
            state.written.length = resyncTo
            return answer(code, false, { Message: 307, Args: [resyncTo] })
          }
          if (index !== state.next || crc16Kermit(0, data) !== crc) return answer(code, false, { Message: 307, Args: [state.next] })
          state.written[index] = data.slice()
          state.next++
          return answer(code, true, {}, payload.subarray(0, 4))
        }
        if (argument === "FirmwareUpgradeDone") {
          assert.equal(payload, null)
          const image = new Uint8Array(state.written.flatMap((d) => [...d]))
          if (image.length !== state.size || crc32(image) !== state.crc) return answer(code, false, { Message: 306 })
          state.image = image
          state.done = true
          return answer(code, true, {}, undefined)
        }
        assert.fail(`${header} ${argument}`)
      }, 1)
    },
  }
  return { transport, state }
}

const image = (n) => Uint8Array.from({ length: n }, (_, i) => (i * 7 + 3) & 0xff)

test("Прошивка: переход в загрузчик, части по ответу Start, CRC32 и запуск", async () => {
  const { transport, state } = fakeModule({ block: 40 })
  const bin = image(1000)
  const stages = []
  await updateModuleFirmware(transport, bin, { onProgress: (stage, done) => stages.push(`${stage}:${done}`) })
  assert.equal(state.done, true)
  assert.deepEqual(state.image, bin)
  assert.equal(stages.at(-1), "verify:1000")
  assert.ok(stages.includes("write:1000"))
})

test("Прошивка: RESYNC с номером части - передача продолжается с неё", async () => {
  const { transport, state } = fakeModule({ block: 240, resyncAt: 3, resyncTo: 1 })
  const bin = image(2000)
  await updateModuleFirmware(transport, bin)
  assert.equal(state.resynced, true)
  assert.deepEqual(state.image, bin)
})

test("Прошивка: загрузчик не отозвался - noBootloader, пустой образ - image", async () => {
  const { transport } = fakeModule({ noBoot: true })
  await assert.rejects(
    updateModuleFirmware(transport, image(100), { bootTimeoutMs: 700 }),
    (e) => e instanceof FirmwareUpdateError && e.code === "noBootloader",
  )
  await assert.rejects(updateModuleFirmware(transport, new Uint8Array()), (e) => e instanceof FirmwareUpdateError && e.code === "image")
})

/* Хаб ESP: шаги steps - Progress строки модуля после команды, по одному на тик; VerFW строки становится новой на шаге verAt */
const fakeHub = (steps, { verAt = -1, VerFW = 7, ModSN = "M1", initial = 0 } = {}) => {
  const sent = []
  let row = { ModSN, ModName: "Привод", VerFW: 3, Progress: initial }
  let step = -1
  let timer
  const hub = {
    get: (key) => (key === "CFG.ModList" ? [{ ModSN: "OTHER", VerFW: 1, Progress: 55 }, row] : undefined),
    waitFor: () => Promise.resolve(null),
    send: (har, payload) => {
      sent.push({ ...decodeHar(har), payload })
      timer = setInterval(() => {
        if (++step >= steps.length) return clearInterval(timer)
        row = { ...row, Progress: steps[step], ...(step >= verAt && verAt >= 0 ? { VerFW } : {}) }
      }, 4)
    },
  }
  return { hub, sent, stop: () => clearInterval(timer) }
}

test("Хаб: SET FirmwareUpgradeStart без ответа, ход до 100 - успех, последний 0 не ошибка", async () => {
  const { hub, sent, stop } = fakeHub([0, 0, 5, 40, 80, 100, 0])
  const seen = []
  await updateViaHub(hub, "M1", 7, (p) => seen.push(p), { pollMs: 2, timeoutMs: 2000 })
  stop()
  assert.equal(sent.length, 1)
  assert.equal(sent[0].argument, "FirmwareUpgradeStart")
  assert.equal(sent[0].header, "SET")
  assert.equal(sent[0].reply, false)
  assert.deepEqual(sent[0].payload, { ModSN: "M1", VerFW: 7 })
  assert.equal(seen.at(-1), 100)
  assert.ok(seen.every((p) => p > 0 && p <= 100))
})

test("Хаб: 100 пропущен, но версия модуля стала новой - успех", async () => {
  const { hub, stop } = fakeHub([10, 60, 0], { verAt: 2 })
  await updateViaHub(hub, "M1", 7, undefined, { pollMs: 1, timeoutMs: 2000 })
  stop()
})

test("Хаб: ход упал в 0 до 100 - ошибка hub с процентом; нет хода - timeout", async () => {
  const failed = fakeHub([0, 20, 45, 0])
  await assert.rejects(
    updateViaHub(failed.hub, "M1", 7, undefined, { pollMs: 1, timeoutMs: 2000 }),
    (e) => e instanceof FirmwareUpdateError && e.code === "hub" && e.params.percent === 45,
  )
  failed.stop()
  /* Остаток прошлого обновления (100 до команды) не принимается за успех */
  const silent = fakeHub([], { initial: 100 })
  await assert.rejects(
    updateViaHub(silent.hub, "M1", 7, undefined, { pollMs: 5, timeoutMs: 60 }),
    (e) => e instanceof FirmwareUpdateError && e.code === "timeout" && e.params.step === "hub",
  )
  silent.stop()
})

test("Прошивка: первая команда перехода в загрузчик потерялась - повтор, пока отвечает приложение", async () => {
  const { transport, state } = fakeModule({ dropEnter: 2 })
  const bin = image(500)
  await updateModuleFirmware(transport, bin)
  assert.deepEqual(state.image, bin)
})
