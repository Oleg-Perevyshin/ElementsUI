/* tests/firmwareUpdate.test.mjs - обновление прошивки модуля STM против модели загрузчика 00.00.491-01: переход приложения в загрузчик повтором FirmwareUpgradeStart, загрузчик сам читает образ (FirmwareUpgradeRead) с повтором потерянного ответа, CRC32 образа и FirmwareUpgradeDone; обновление через хаб ESP (updateViaHub) по ходу в CFG.ModList */
import { test } from "node:test"
import assert from "node:assert/strict"
import { updateModuleFirmware, FirmwareUpdateError } from "../dist/firmwareUpdate.js"
import { crc32 } from "../dist/protocols/crc.js"
import { decodeHar } from "../dist/protocols/dictionary.js"
import { updateViaHub } from "../dist/WidgetFirmware/firmware.js"

const u32 = (bytes, at) => new DataView(bytes.buffer, bytes.byteOffset + at, 4).getUint32(0, true)
const readRequest = (offset, size) => {
  const raw = new Uint8Array(5)
  new DataView(raw.buffer).setUint32(0, offset, true)
  raw[4] = size
  return raw
}

/* Модуль: приложение молча уходит в загрузчик по FirmwareUpgradeStart (dropEnter первых команд теряются), загрузчик отвечает OK! на старт и читает образ кусками block; dropRead - номер чтения, ответ на которое теряется (загрузчик повторяет), noBoot - загрузчика нет, stopAt - загрузчик замолкает с этого смещения */
const fakeModule = ({ block = 40, noBoot = false, dropEnter = 0, dropRead = -1, stopAt = -1 } = {}) => {
  const waiters = []
  let served
  const state = { boot: false, image: null, starts: 0, reads: 0 }
  const answer = (code, ok, payload) => {
    const reply = { ok, payload: payload ?? {}, message: "" }
    const index = waiters.findIndex((w) => w.code === code && w.match(reply))
    if (index < 0) return
    const [w] = waiters.splice(index, 1)
    clearTimeout(w.timer)
    w.resolve(reply)
  }
  /* Загрузчик: читает подряд, потерянный ответ - то же смещение ещё раз */
  const bootloader = async (code, size, crc, DONE) => {
    const parts = []
    let offset = 0
    while (offset < size) {
      if (offset === stopAt) return
      const reply = served.answer({ header: "GET", payload: {}, raw: readRequest(offset, block) })
      if (state.reads++ === dropRead) continue
      assert.equal(reply.ok, true)
      assert.equal(u32(reply.payload, 0), offset)
      const data = reply.payload.subarray(4)
      parts.push(data.slice())
      offset += data.length
      await new Promise((r) => setTimeout(r, 0))
    }
    const image = new Uint8Array(parts.flatMap((d) => [...d]))
    if (image.length !== size || crc32(image) !== crc) return answer(DONE, false, { Message: 306 })
    state.image = image
    answer(DONE, true, {})
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
    serve: (code, handler) => {
      served = { code, answer: handler }
      return () => (served = undefined)
    },
    send: (har, payload) => {
      const { header, argument, code, reply } = decodeHar(har)
      assert.equal(`${header} ${argument}`, "SET FirmwareUpgradeStart")
      assert.equal(reply, true)
      state.starts++
      setTimeout(() => {
        if (!state.boot) {
          if (dropEnter-- > 0) return /* модуль как раз перезапускался - команда потерялась */
          if (!noBoot) setTimeout(() => (state.boot = true), 30)
          return
        }
        if (state.reading) return
        state.reading = true
        answer(code, true, {})
        bootloader(code, u32(payload, 0), u32(payload, 4), code + 2)
      }, 1)
    },
  }
  return { transport, state }
}

const image = (n) => Uint8Array.from({ length: n }, (_, i) => (i * 7 + 3) & 0xff)

test("Прошивка: переход в загрузчик, загрузчик читает образ сам, CRC32 и FirmwareUpgradeDone", async () => {
  const { transport, state } = fakeModule({ block: 40 })
  const bin = image(1000)
  const stages = []
  await updateModuleFirmware(transport, bin, { startRepeatMs: 50, onProgress: (stage, done) => stages.push(`${stage}:${done}`) })
  assert.deepEqual(state.image, bin)
  assert.ok(stages.includes("erase:0"))
  assert.ok(stages.includes("write:40"))
  assert.equal(stages.at(-1), "verify:1000")
})

test("Прошивка: ответ на чтение потерялся - загрузчик читает то же смещение ещё раз", async () => {
  const { transport, state } = fakeModule({ block: 224, dropRead: 3 })
  const bin = image(2000)
  await updateModuleFirmware(transport, bin, { startRepeatMs: 50 })
  assert.deepEqual(state.image, bin)
})

test("Прошивка: первые команды перехода в загрузчик потерялись - старт повторяется", async () => {
  const { transport, state } = fakeModule({ dropEnter: 2 })
  const bin = image(500)
  await updateModuleFirmware(transport, bin, { startRepeatMs: 50 })
  assert.deepEqual(state.image, bin)
  assert.ok(state.starts >= 4)
})

test("Прошивка: загрузчик не отозвался - noBootloader, замолчал - timeout, пустой образ - image, связь без serve - transport", async () => {
  await assert.rejects(
    updateModuleFirmware(fakeModule({ noBoot: true }).transport, image(100), { bootTimeoutMs: 300, startRepeatMs: 50 }),
    (e) => e instanceof FirmwareUpdateError && e.code === "noBootloader",
  )
  await assert.rejects(
    updateModuleFirmware(fakeModule({ stopAt: 80 }).transport, image(400), { startRepeatMs: 50, idleTimeoutMs: 200 }),
    (e) => e instanceof FirmwareUpdateError && e.code === "timeout",
  )
  const { transport } = fakeModule()
  await assert.rejects(updateModuleFirmware(transport, new Uint8Array()), (e) => e instanceof FirmwareUpdateError && e.code === "image")
  const { serve: _serve, ...plain } = transport
  await assert.rejects(updateModuleFirmware(plain, image(10)), (e) => e instanceof FirmwareUpdateError && e.code === "transport")
})

/* Хаб ESP: шаги steps - Progress строки модуля после команды, по одному на тик; VerFW строки становится новой на шаге verAt */
const fakeHub = (steps, { verAt = -1, VerFW = 7, ModSN = "M1", initial = 0, oldVerFW = 3 } = {}) => {
  const sent = []
  let row = { ModSN, ModName: "Привод", VerFW: oldVerFW, Progress: initial }
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

test("Хаб: повторная прошивка той же версии - успех только на 100, не на первом ходе", async () => {
  const { hub, stop } = fakeHub([0, 10, 50, 75, 100], { oldVerFW: 7 })
  const seen = []
  await updateViaHub(hub, "M1", 7, (p) => seen.push(p), { pollMs: 1, timeoutMs: 2000 })
  stop()
  assert.equal(seen.at(-1), 100)
  assert.ok(seen.includes(50))
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
