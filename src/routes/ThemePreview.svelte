<!-- src/routes/ThemePreview.svelte — вкладка «Тема» главной витрины: типовой интерфейс облака на стилях theme.css,
     тема — глобальная, переключается кнопкой в шапке витрины. -->
<script lang="ts">
  import * as UI from "$lib"
  import type { IOption, ITableHeader, IWidgetMapData, IWidgetPFDData, IWidgetStackInfo } from "$lib/types"
  import { RenderMarkdown } from "./common"
  import { createFlightSim } from "./components/flightSim"

  /* Живые данные: тот же полёт над Минском, что в демо PFD и карты */
  const simMav = createFlightSim()
  const simGnss = createFlightSim(3)
  let flight: IWidgetPFDData = $state(simMav(0))
  let gnss: IWidgetPFDData = $state(simGnss(0))
  $effect(() => {
    const timer = setInterval(() => {
      flight = simMav(0.1)
      gnss = simGnss(0.1)
    }, 100)
    return () => clearInterval(timer)
  })
  const board = (d: IWidgetPFDData, DevName: string, DevSN: string): IWidgetMapData => ({
    Lat: d.Lat,
    Lon: d.Lon,
    Alt: d.Alt,
    Heading: d.Heading,
    Sat: d.Sat,
    DevName,
    DevSN,
  })

  const ROLES = ["gray", "red", "orange", "yellow", "green", "cyan", "blue", "purple", "pink"]
  const SURFACES = [
    "bg-body",
    "back-color",
    "container-color",
    "field-color",
    "border-color",
    "hairline-color",
    "font-color",
    "muted-color",
    "faint-color",
    "accent-color",
  ]

  const modeOptions: IOption<number>[] = [
    { id: "m0", value: 0, name: "Выкл" },
    { id: "m1", value: 1, name: "Клиент" },
    { id: "m2", value: 2, name: "Точка" },
    { id: "m3", value: 3, name: "Оба" },
  ]
  let mode: IOption<number> = $state(modeOptions[1])

  interface IRow {
    name: string
    value: string
    state: string
  }
  const tableHeader: ITableHeader<IRow>[] = [
    { label: { name: "Параметр" }, content: [{ type: "text", data: { key: "name" } }], width: "40%" },
    { label: { name: "Значение" }, content: [{ type: "text", data: { key: "value" } }], width: "35%" },
    { label: { name: "Состояние" }, content: [{ type: "text", data: { key: "state" } }], width: "25%" },
  ]
  const tableBody: IRow[] = [
    { name: "Напряжение батареи", value: "16.4 В", state: "норма" },
    { name: "Ток", value: "12.1 А", state: "норма" },
    { name: "Температура платы", value: "41 °C", state: "внимание" },
  ]

  const stackInfo: IWidgetStackInfo = {
    Heap: [
      { Name: "Internal", Total: 327680, Free: 118000, MinFree: 92000 },
      { Name: "Default", Total: 4521984, Free: 4100000, MinFree: 4040000 },
    ],
    Tasks: [
      { Name: "api_task", FreeMin: 640, Prio: 5, Core: 1, State: 2 },
      { Name: "telemetry", FreeMin: 1480, Prio: 4, Core: 1, State: 2 },
      { Name: "wifi", FreeMin: 3200, Prio: 23, Core: 0, State: 2 },
    ],
  }

  const markdownSample = `## Заголовок раздела

Абзац текста с \`кодом\`, **жирным** и [ссылкой](#). Длинное имя без пробелов переносится: \`WidgetFileSystemProps.svelte\`.

- Пункт списка
- Второй пункт с \`MAV.Heading\`

| Ключ | Тип | Описание |
| ---- | --- | -------- |
| \`Lat\` | \`number\` | широта, °; вместе с \`Lon\` = 0 — нет фикса |
| \`content.info.side\` | \`"top" \\| "bottom" \\| "left" \\| "right"\` | сторона подсказки |

> Цитата или примечание.

\`\`\`c
Telemetry_SendObject(g_telemetry_stream, g_mcfg.DevSN, "Data", mav, sizeof(mav) / sizeof(mav[0]));
\`\`\``
  let markdownHtml = $state("")
  $effect(() => {
    RenderMarkdown(markdownSample).then((html) => (markdownHtml = html))
  })
</script>

{#snippet preview()}
  <!-- Шапка устройства -->
  <div class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-(--hairline-color) bg-(--back-color) p-4">
    <div class="flex flex-col">
      <h4>Объект 1</h4>
      <span class="text-sm text-(--muted-color)">20.00.000-01 · ПО 1.4.2</span>
    </div>
    <div class="flex flex-wrap gap-2 text-xs font-semibold">
      <span class="rounded-full bg-(--green-soft) px-2.5 py-1 text-(--green-color)">В сети</span>
      <span class="rounded-full bg-(--yellow-soft) px-2.5 py-1 text-(--yellow-color)">Обновление</span>
      <span class="rounded-full bg-(--red-soft) px-2.5 py-1 text-(--red-color)">Ошибка датчика</span>
    </div>
  </div>

  <!-- Палитра -->
  <div class="flex flex-col gap-3 rounded-2xl border border-(--hairline-color) bg-(--back-color) p-4">
    <h6>Палитра</h6>
    <div class="grid grid-cols-5 gap-2">
      {#each SURFACES as token}
        <div class="flex flex-col gap-1">
          <div class="h-8 rounded-lg border border-(--hairline-color)" style="background: var(--{token})"></div>
          <span class="truncate font-mono text-[10px] text-(--muted-color)">--{token}</span>
        </div>
      {/each}
    </div>
    <div class="grid grid-cols-9 gap-2">
      {#each ROLES as role}
        <div class="flex flex-col gap-1">
          <div class="h-8 rounded-lg" style="background: var(--{role}-color)"></div>
          <div class="h-4 rounded-md" style="background: var(--{role}-soft)"></div>
          <span class="truncate font-mono text-[10px] text-(--muted-color)">{role}</span>
        </div>
      {/each}
    </div>
  </div>

  <!-- Кнопки и поля -->
  <div class="flex flex-col gap-3 rounded-2xl border border-(--hairline-color) bg-(--back-color) p-4">
    <h6>Управление</h6>
    <div class="grid grid-cols-3 gap-2">
      {#each ROLES as role}
        <UI.Button content={{ name: role }} componentClass={`bg-${role}`} />
      {/each}
    </div>
    <div class="grid grid-cols-2 gap-2">
      <UI.Button content={{ name: "Отключена" }} componentClass="bg-blue" disabled />
      <UI.Button content={{ name: "Без роли" }} />
    </div>
    <div class="grid grid-cols-2 gap-3">
      <UI.Input label={{ name: "Имя устройства" }} value="Объект 1" />
      <UI.Input label={{ name: "Частота, Гц" }} type="number" value={20} number={{ minNum: 1, maxNum: 100, step: 1 }} />
      <UI.Input label={{ name: "Неверный ввод" }} value="12.34.567" isValid={false} />
      <UI.Input label={{ name: "Только чтение" }} value="20000001A1B2C3" readonly help={{ copyButton: true }} />
    </div>
    <UI.Select label={{ name: "Режим Wi-Fi" }} type="buttons" options={modeOptions} value={mode} onUpdate={(v) => !Array.isArray(v) && (mode = v)} />
    <div class="grid grid-cols-2 gap-3">
      <UI.Switch label={{ name: "Реле", captionLeft: "Выкл", captionRight: "Вкл" }} value={1} />
      <UI.Slider label={{ name: "Яркость" }} value={60} number={{ minNum: 0, maxNum: 100, step: 1 }} />
    </div>
    <UI.ProgressBar
      items={[
        { name: "Заряд", class: "bg-green" },
        { name: "Память", class: "bg-orange" },
      ]}
      value={[{ Value: 72 }, { Value: 38 }]}
    />
    <UI.Table header={tableHeader} body={tableBody} />
  </div>

  <!-- Виджеты -->
  <UI.WidgetPFD value={flight} limits={{ speedMin: 8, speedMax: 25, bankMax: 30, altMax: 170, battLow: 20 }} />
  <UI.WidgetMap
    groups={["MAV", "GNSS"]}
    value={{ MAV: board(flight, "Объект 1", "20000001A1B2C3"), GNSS: board(gnss, "Объект 2", "20000001D4E5F6") }}
    height={250}
    trackEnabled
  />
  <UI.WidgetDeviceInfo
    componentClass="bg-blue"
    value={{
      DevSN: "20000001A1B2C3",
      DevID: "20.00.000-01",
      DevFW: 142,
      RunCnt: 37,
      DevName: "Объект 1",
      HostName: "bort-1",
      WebUser: "admin",
      WebPsw: "",
      StaIP: "192.168.1.42",
      ApIP: "192.168.4.1",
    }}
    onSave={() => {}}
    onRestart={() => {}}
  />
  <UI.WidgetRGBStrip
    componentClass="bg-purple"
    value={{ Color: [255, 120, 0, 0], Effect: 2, Speed: 4, Count: 64, Model: 0, Order: 0, MaxCount: 128 }}
    onChange={() => {}}
    onSave={() => {}}
  />
  <UI.WidgetStackInfo componentClass="bg-green" value={stackInfo} warnBytes={1024} onRefresh={() => {}} />

  <!-- Типографика и Markdown -->
  <div class="flex flex-col gap-2 rounded-2xl border border-(--hairline-color) bg-(--back-color) p-4">
    <h6>Типографика</h6>
    <h1>Заголовок h1</h1>
    <h2>Заголовок h2</h2>
    <h3>Заголовок h3</h3>
    <h4>Заголовок h4</h4>
    <h5>Заголовок h5</h5>
    <p>Обычный текст абзаца. <span class="text-(--muted-color)">Приглушённый текст.</span> <span class="text-(--faint-color)">Бледный текст.</span></p>
    <label for="">Подпись поля (label)</label>
  </div>
  <div class="markdown-content rounded-2xl border border-(--hairline-color) bg-(--back-color) px-6 py-4">
    {@html markdownHtml}
  </div>
{/snippet}

<div class="flex flex-col gap-4">
  <p class="text-sm text-(--muted-color)">
    Интерфейс облака на одной странице — стили из <code>src/lib/theme.css</code>, тот же файл подключает DevCloud. Тема переключается кнопкой в шапке витрины;
    правьте <code>theme.css</code> и смотрите результат здесь.
  </p>
  {@render preview()}
</div>
