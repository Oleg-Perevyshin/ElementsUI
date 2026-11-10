/* tests/fsTransfer.test.mjs - обмен файлами SET FS против модели прошивки (file_system ProdFactory-ESP): чанки, повтор после ER! и таймаута, CRC32, очередь операций */
import { test } from "node:test"
import assert from "node:assert/strict"
import { createFsTransfer } from "../dist/fsTransfer.js"
import { crc32 } from "../dist/protocols/crc.js"

/* Устройство: отвечает на SET/GET FS как прошивка; fail(op, index) - сколько раз отказать (ER!) или промолчать ("drop") */
const fakeDevice = ({ chunkSize = 4, files = {}, faults = [] } = {}) => {
  const waiters = []
  const sent = []
  let upload = null
  let download = null
  const reply = (ok, payload, message = "") => {
    const answer = { ok, payload, message }
    const index = waiters.findIndex((w) => w.match(answer))
    if (index < 0) return
    const [waiter] = waiters.splice(index, 1)
    clearTimeout(waiter.timer)
    waiter.resolve(answer)
  }
  const state = () => ({ "CFG.FS": { Total: 100, Used: 0, Free: 100, List: Object.keys(files).map((Name) => ({ Name, Size: files[Name].length })) } })
  const fault = (op, index) => {
    const i = faults.findIndex((f) => f.op === op && (f.index === undefined || f.index === index))
    return i >= 0 ? faults.splice(i, 1)[0].kind : null
  }
  const transport = {
    waitFor: (argument, match, timeoutMs) =>
      new Promise((resolve) => {
        const waiter = { match, resolve }
        waiter.timer = setTimeout(() => {
          waiters.splice(waiters.indexOf(waiter), 1)
          resolve(null)
        }, timeoutMs)
        waiters.push(waiter)
      }),
    send: (header, argument, p) => {
      sent.push({ header, argument, op: p.Op, index: p.ChunkIndex })
      const base = { Op: p.Op, CurrentID: p.CurrentID }
      const kind = fault(p.Op, p.ChunkIndex)
      if (kind === "drop") return
      if (kind === "er") return queueMicrotask(() => reply(false, base, "ER: Chunk"))
      queueMicrotask(() => {
        if (header === "GET") return reply(true, state())
        switch (p.Op) {
          case "UploadStart":
            upload = { name: p.FileName, size: p.FileSize, data: [] }
            return reply(true, { ...base, ChunkSize: chunkSize })
          case "UploadChunk":
            upload.data[p.ChunkIndex] = p.Data.slice()
            return reply(true, { ...base, ChunkIndex: p.ChunkIndex })
          case "UploadDone": {
            const bytes = Uint8Array.from(upload.data.flatMap((c) => [...c]))
            if (crc32(bytes) !== p.CRC32) return reply(false, base, "ER: CRC32")
            files[upload.name] = bytes
            return reply(true, base)
          }
          case "DownloadStart":
            download = files[p.Name]
            return reply(true, { ...base, FileSize: download.length, ChunkSize: chunkSize, CRC32: crc32(download) })
          case "DownloadChunk":
            return reply(true, { ...base, ChunkIndex: p.ChunkIndex, Data: download.subarray(p.ChunkIndex * chunkSize, (p.ChunkIndex + 1) * chunkSize) })
          case "DownloadDone":
            return reply(true, base)
          case "Delete":
            delete files[p.Name]
            return reply(true, { Op: "Delete", ...state() })
        }
      })
    },
  }
  return { transport, files, sent }
}

const bytes = Uint8Array.from({ length: 10 }, (_, i) => i * 7)

test("CRC-32: контрольное значение", () => {
  assert.equal(crc32(new TextEncoder().encode("123456789")), 0xcbf43926)
})

test("закачка и скачивание: чанки по размеру устройства, CRC32, прогресс", async () => {
  const device = fakeDevice()
  const fs = createFsTransfer(device.transport)
  const progress = []
  await fs.upload("gui.yaml.gz", bytes, (done, total) => progress.push([done, total]))
  assert.deepEqual(device.files["gui.yaml.gz"], bytes)
  assert.deepEqual(progress, [
    [4, 10],
    [8, 10],
    [10, 10],
  ])
  assert.deepEqual([...(await fs.download("gui.yaml.gz"))], [...bytes])
  assert.deepEqual((await fs.list()).List, [{ Name: "gui.yaml.gz", Size: 10 }])
  assert.deepEqual((await fs.remove("gui.yaml.gz")).List, [])
})

test("повтор чанка после ER! и таймаута на любом индексе; исчерпание повторов - ошибка", async () => {
  const device = fakeDevice({
    faults: [
      { op: "UploadChunk", index: 0, kind: "er" },
      { op: "UploadChunk", index: 2, kind: "drop" },
      { op: "DownloadChunk", index: 1, kind: "er" },
    ],
  })
  const fs = createFsTransfer(device.transport, { timeoutMs: 50 })
  await fs.upload("a.bin", bytes)
  assert.deepEqual(device.files["a.bin"], bytes)
  assert.equal(device.sent.filter((s) => s.op === "UploadChunk").length, 5)
  assert.deepEqual([...(await fs.download("a.bin"))], [...bytes])

  const broken = fakeDevice({ faults: Array.from({ length: 4 }, () => ({ op: "UploadChunk", index: 1, kind: "er" })) })
  await assert.rejects(createFsTransfer(broken.transport, { timeoutMs: 50 }).upload("b.bin", bytes), /ER: Chunk/)
})

test("отказ старта и длинное имя; операции идут по очереди", async () => {
  const device = fakeDevice({ faults: [{ op: "UploadStart", kind: "er" }] })
  const fs = createFsTransfer(device.transport)
  await assert.rejects(fs.upload("x.bin", bytes), /ER: Chunk/)
  await assert.rejects(fs.upload("x".repeat(32), bytes), /1-31/)
  await Promise.all([fs.upload("1.bin", bytes), fs.upload("2.bin", bytes.subarray(0, 3))])
  const ops = device.sent.map((s) => s.op).filter((op) => op === "UploadStart" || op === "UploadDone")
  assert.deepEqual(ops, ["UploadStart", "UploadStart", "UploadDone", "UploadStart", "UploadDone"])
})
