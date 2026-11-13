/* tests/dictionaries.test.mjs - словари dictionaries/: сообщения устройств (код -> текст на языке, уровень и группа, параметры шаблона, неизвестный код), группы (диапазоны, приставки имён), заголовки прошивок api_har.h и api_msg.h совпадают с commands.yaml и messages.yaml */
import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import {
  formatDeviceMessage,
  parseDebugLogMessage,
  formatXPoeDebugValue,
  formatXPoeDebugPretty,
  xPoeDebugMessage,
  DEVICE_MESSAGES,
  MESSAGE_CODES,
  MESSAGE_GROUPS,
  DEFAULT_ARGUMENT_CODES,
} from "../dist/protocols/index.js"

const dictionaryFile = (path) => readFileSync(new URL(`../dist/dictionaries/${path}`, import.meta.url), "utf8")

test("нет сообщения: 0, отсутствие кода, не число - null", () => {
  assert.equal(formatDeviceMessage(0), null)
  assert.equal(formatDeviceMessage(undefined), null)
  assert.equal(formatDeviceMessage(null), null)
  assert.equal(formatDeviceMessage("ER: File Not Found"), null)
  assert.equal(formatDeviceMessage(-5), null)
})

test("текст на языке, уровень и группа", () => {
  const code = MESSAGE_CODES.SYS_MODLIST_CHANGED
  assert.deepEqual(formatDeviceMessage(code, [], "ru"), { text: "Список модулей изменён", level: "info", group: "SYS", groupName: "Система" })
  assert.deepEqual(formatDeviceMessage(code, [], "en"), { text: "Module list changed", level: "info", group: "SYS", groupName: "System" })
  assert.deepEqual(formatDeviceMessage(code, [], "zh"), { text: "模块列表已更改", level: "info", group: "SYS", groupName: "系统" })
  assert.equal(formatDeviceMessage(MESSAGE_CODES.FS_FILE_NOT_FOUND, [], "ru").level, "error")
  assert.equal(formatDeviceMessage(MESSAGE_CODES.FS_FILE_NOT_FOUND, [], "ru").groupName, "Файлы")
  assert.equal(formatDeviceMessage(MESSAGE_CODES.CFG_GROUP_NOT_FOUND, [], "en").groupName, "Settings")
  assert.deepEqual(formatDeviceMessage(MESSAGE_CODES.DEV_POWER_LIMIT, [1], "ru"), {
    text: "Превышен предел мощности канала 1, канал отключён",
    level: "warn",
    group: "DEV",
    groupName: "Изделия",
  })
  /* Без языка - язык по умолчанию (ru) */
  assert.equal(formatDeviceMessage(MESSAGE_CODES.SYS_RESTARTING).text, "Перезагрузка")
})

test("параметры шаблона по порядку, нехватка - ?", () => {
  assert.equal(
    formatDeviceMessage(MESSAGE_CODES.WIFI_CONNECT_FAILED, ["Home 5G"], "ru").text,
    "Не удалось подключиться к Wi-Fi Home 5G, восстановлена прежняя сеть",
  )
  assert.equal(formatDeviceMessage(MESSAGE_CODES.DEV_POWER_LIMIT, [3], "en").text, "Channel 3 power limit exceeded, channel turned off")
  assert.equal(formatDeviceMessage(MESSAGE_CODES.FW_RESYNC, [17], "en").text, "Resending firmware from part 17")
  assert.equal(formatDeviceMessage(MESSAGE_CODES.CFG_NOT_APPLIED, [], "en").text, "Settings not applied: ?")
})

test('консоль: DebugLog "MSG <код>[ <арг1>[<TAB><арг2>...]]" - сообщение текстом на языке', () => {
  assert.deepEqual(parseDebugLogMessage("MSG 6"), { Message: 6 })
  assert.deepEqual(parseDebugLogMessage("MSG 404 Home 5G"), { Message: 404, Args: ["Home 5G"] })
  assert.deepEqual(parseDebugLogMessage("MSG 100 Name\tMode"), { Message: 100, Args: ["Name", "Mode"] })
  assert.equal(parseDebugLogMessage("MSG x"), null)
  assert.equal(parseDebugLogMessage("Нет связи"), null)
  /* VALUE - как пришёл, сообщение - отдельно (xPoeDebugMessage, поле message строки) */
  assert.equal(formatXPoeDebugValue([2, "HAR 0xC048", "MSG 404 Home 5G", 1000], new Uint8Array()), "🟡 · HAR 0xC048 · MSG 404 Home 5G")
  assert.equal(formatXPoeDebugPretty([3, "HAR 0x0002", "MSG 1", 1000], false), "🟢 HAR 0x0002\nMSG 1\nFHS: 1000")
  assert.deepEqual(xPoeDebugMessage([2, "HAR 0xC048", "MSG 404 Home 5G", 1000], "ru"), {
    text: "Не удалось подключиться к Wi-Fi Home 5G, восстановлена прежняя сеть",
    level: "warn",
    group: "WIFI",
    groupName: formatDeviceMessage(404, [], "ru").groupName,
  })
  assert.equal(xPoeDebugMessage([1, "HAR 0xC048", "MSG 100 Name, Mode", 1000], "en").text, "Settings not applied: Name, Mode")
  assert.equal(xPoeDebugMessage([1, "HAR 0xC048", "MSG 65000 a b\t2", 1000], "en").text, "#65000: a b, 2")
  assert.equal(
    xPoeDebugMessage(
      new Map([
        ["Message", 404],
        ["Args", ["Home"]],
      ]),
      "en",
    ).text,
    "Could not connect to Wi-Fi Home, previous network restored",
  )
  assert.equal(xPoeDebugMessage({ Message: 404 }, "en").level, "warn")
  assert.equal(xPoeDebugMessage([2, "Net", "Нет связи", 1000]), null)
  assert.equal(xPoeDebugMessage({ DevName: "x" }), null)
  assert.equal(formatXPoeDebugValue([2, "Net", "Нет связи", 1000], new Uint8Array()), "🟡 · Net · Нет связи")
})

test("неизвестный код - #код с параметрами, уровень info, группа по диапазону кода, в резерве - null", () => {
  assert.deepEqual(formatDeviceMessage(65000, [], "ru"), { text: "#65000", level: "info", group: null, groupName: null })
  assert.deepEqual(formatDeviceMessage(65000, ["a", 2], "ru"), { text: "#65000: a, 2", level: "info", group: null, groupName: null })
  assert.deepEqual(formatDeviceMessage(750, [], "en"), { text: "#750", level: "info", group: null, groupName: null })
  assert.deepEqual(formatDeviceMessage(299, [], "en"), { text: "#299", level: "info", group: "FS", groupName: "Files" })
})

test("группы: диапазоны в 1..65535 без пересечений, резерв 500-999 и 2000+, названия на трёх языках", () => {
  const ranges = Object.values(MESSAGE_GROUPS).sort((a, b) => a.from - b.from)
  assert.deepEqual(Object.keys(MESSAGE_GROUPS), ["SYS", "CFG", "FS", "FW", "WIFI", "DEV"])
  for (const [index, group] of ranges.entries()) {
    assert.ok(group.from >= 1 && group.from <= group.to && group.to <= 65535)
    if (index) assert.ok(group.from > ranges[index - 1].to, "диапазоны пересекаются")
    for (const lang of ["ru", "en", "zh"]) assert.ok(group[lang])
  }
  for (const code of [500, 999, 2000, 65535]) assert.ok(!ranges.some((group) => code >= group.from && code <= group.to), `${code} не в резерве`)
})

test("сообщения: код в диапазоне своей группы, имя с приставкой группы, параметры одинаковы в языках", () => {
  const params = (text) => [...new Set(text.match(/\{\d+\}/g))].sort().join(",")
  for (const [code, entry] of Object.entries(DEVICE_MESSAGES)) {
    const group = MESSAGE_GROUPS[entry.group]
    assert.ok(group, `${entry.name}: нет группы ${entry.group}`)
    assert.ok(+code >= group.from && +code <= group.to, `${entry.name}: код ${code} вне ${entry.group}`)
    assert.ok(entry.name.startsWith(`${entry.group}_`), `${entry.name}: нет приставки ${entry.group}_`)
    for (const lang of ["ru", "zh"]) assert.equal(params(entry[lang]), params(entry.en), `${entry.name}: параметры ${lang}`)
  }
})

test("messages.yaml: коды 1..65535 без повторов, у каждого три языка, DEVICE_MESSAGES - ровно словарь", () => {
  const lines = dictionaryFile("messages.yaml").match(/^\s+- \{.*$/gm)
  assert.equal(Object.keys(DEVICE_MESSAGES).length, lines.length)
  for (const [code, entry] of Object.entries(DEVICE_MESSAGES)) {
    assert.ok(+code >= 1 && +code <= 65535)
    assert.equal(MESSAGE_CODES[entry.name], +code)
    for (const lang of ["ru", "en", "zh"]) assert.ok(entry[lang], `${entry.name}: нет ${lang}`)
    assert.ok(
      lines.some(
        (line) =>
          line.includes(`code: ${code},`) &&
          line.includes(`group: ${entry.group},`) &&
          line.includes(`name: ${entry.name},`) &&
          line.includes(`level: ${entry.level},`),
      ),
      entry.name,
    )
  }
})

test("api_har.h: те же коды, что commands.yaml (DEFAULT_ARGUMENT_CODES), плюс har_t и макросы", () => {
  const header = dictionaryFile("firmware/api_har.h")
  const yamlEnums = Object.fromEntries(
    [...dictionaryFile("commands.yaml").matchAll(/^- \[\s*[^,\]]+?\s*,\s*(\w+)\s*,\s*(\d+)\s*\]/gm)].map(([, name, code]) => [name, Number(code)]),
  )
  const headerEnums = Object.fromEntries([...header.matchAll(/^\s*(A_\w+)\s*=\s*(\d+),/gm)].map(([, name, code]) => [name, Number(code)]))
  assert.deepEqual(headerEnums, yamlEnums)
  assert.deepEqual(
    Object.values(headerEnums).sort((a, b) => a - b),
    Object.values(DEFAULT_ARGUMENT_CODES).sort((a, b) => a - b),
  )
  for (const part of ["} har_t;", "#define HAR(_h, _a)", "#define HAR_NR(_h, _a)", "H_ER = 3 } api_header_t;", "} api_argument_t;"])
    assert.ok(header.includes(part), part)
})

test("api_msg.h: MSG_NONE = 0, MSG_<name> = код для каждого сообщения messages.yaml, раздел на каждую группу, резерв в шапке", () => {
  const header = dictionaryFile("firmware/api_msg.h")
  for (const [name, { from, to, ru }] of Object.entries(MESSAGE_GROUPS)) assert.ok(header.includes(`  /* ${name} ${from}-${to}: ${ru} */\n`), name)
  assert.ok(header.includes("резерв: 500-999, 2000-65535 */"))
  const enumCodes = Object.fromEntries([...header.matchAll(/^\s*MSG_(\w+)\s*=\s*(\d+),/gm)].map(([, name, code]) => [name, Number(code)]))
  assert.equal(enumCodes.NONE, 0)
  delete enumCodes.NONE
  assert.deepEqual(enumCodes, MESSAGE_CODES)
})
