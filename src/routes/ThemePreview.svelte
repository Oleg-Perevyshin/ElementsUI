<!-- src/routes/ThemePreview.svelte — вкладка «Тема» главной витрины: палитра и все компоненты в порядке меню на стилях theme.css,
     тема — глобальная, переключается кнопкой в шапке витрины. -->
<script lang="ts">
  import * as UI from "$lib"
  import type {
    IOption,
    IPeriodChartLevel,
    IWidgetFileSystemInfo,
    IWidgetWiFiConfig,
    ITableHeader,
    IVideoViewerProps,
    IWidgetMapData,
    IWidgetPFDData,
    IWidgetStackInfo,
  } from "$lib/types"
  import { ICONS_ARRAY } from "$lib/icons"
  import { onMount, type Snippet } from "svelte"
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
      { Name: "PSRAM", Total: 4194304, Free: 3980000, MinFree: 3920000 },
    ],
    Tasks: [
      { Name: "api_rx_task", FreeMin: 640, Prio: 5, Core: 1, State: 2 },
      { Name: "telemetry", FreeMin: 1480, Prio: 4, Core: 1, State: 2 },
      { Name: "wifi", FreeMin: 3200, Prio: 23, Core: 0, State: 2 },
    ],
  }

  /* Графики: живой ряд (isTest) и исторический за сутки */
  const graphSeries = [
    { name: "Roll", value: 0 },
    { name: "Pitch", value: 0 },
  ]
  const hourMs = 60 * 60 * 1000
  const graphHistory = [
    {
      name: "P, кВт·ч",
      points: Array.from({ length: 24 }, (_, i) => ({ timestamp: Date.now() - (23 - i) * hourMs, value: 30 + Math.round(Math.sin(i / 3) * 20 + i) })),
    },
  ]
  const levelData = (n: number) => Array.from({ length: n }, (_, i) => Math.round(40 + Math.sin(i / 2) * 25 + (i % 5) * 4))
  const energyLevels: IPeriodChartLevel[] = [
    { name: "Год", data: levelData(12), labels: ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"] },
    { name: "Месяц", data: levelData(31) },
    { name: "Сутки", data: levelData(24) },
  ]

  const mockScan = async () => {
    await new Promise((r) => setTimeout(r, 600))
    return [
      { id: "n1", name: "POE-Net", value: "POE-Net" },
      { id: "n2", name: "Home-5G", value: "Home-5G" },
    ]
  }

  /* Wi-Fi: клиент к роутеру и точка доступа одновременно */
  const wifiConfig: IWidgetWiFiConfig = {
    WiFiMode: 3,
    StaSSID: "POE-Net",
    StaPSK: "",
    StaticIP: 0,
    StaIP: "192.168.1.42",
    StaMS: "255.255.255.0",
    StaGW: "192.168.1.1",
    ApSSID: "Objekt-1",
    ApPSK: "",
    ApIP: "192.168.4.1",
    ApMS: "255.255.255.0",
    ApGW: "192.168.4.1",
  }

  /* Файловая система: имитация устройства — список файлов, удаление и закачка с прогрессом */
  let fsInfo: IWidgetFileSystemInfo = $state({
    Total: 1441792,
    Used: 931626,
    Free: 510166,
    List: [
      { Name: "/storage/cert.pem", Size: 1834 },
      { Name: "/storage/20.00.000-01_14.bin", Size: 917504 },
      { Name: "/storage/notes.md", Size: 12288 },
    ],
  })
  const recalcFs = () => {
    fsInfo.Used = fsInfo.List.reduce((sum, f) => sum + f.Size, 0)
    fsInfo.Free = fsInfo.Total - fsInfo.Used
  }
  const fsDelete = (name: string) => {
    fsInfo.List = fsInfo.List.filter((f) => f.Name !== name)
    recalcFs()
  }
  const fsUpload = async (file: File) => {
    for (let p = 0; p < 100; p += 5) {
      fsInfo.Upload = { Name: file.name, Size: file.size, Progress: p }
      await new Promise((r) => setTimeout(r, 80))
    }
    fsInfo.Upload = undefined
    fsInfo.List = [...fsInfo.List.filter((f) => f.Name !== `/storage/${file.name}`), { Name: `/storage/${file.name}`, Size: file.size }]
    recalcFs()
  }
  const fsDownload = (name: string) => new Promise<void>((r) => setTimeout(() => (console.log("SET FS Download (mock)", name), r()), 600))

  let isModalOpen = $state(false)

  /* Видео: синтетические кадры, как в демо VideoViewer */
  let videoFrame: Blob | undefined = $state()
  let videoStatus: IVideoViewerProps["status"] = $state("connecting")
  onMount(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 320
    canvas.height = 180
    const ctx = canvas.getContext("2d")!
    let hue = 200
    const timer = setInterval(() => {
      hue = (hue + 10) % 360
      ctx.fillStyle = `hsl(${hue}, 45%, 40%)`
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = "#fff"
      ctx.font = "20px monospace"
      ctx.fillText(new Date().toLocaleTimeString(), 20, 95)
      canvas.toBlob((blob) => {
        if (!blob) return
        videoFrame = blob
        videoStatus = "live"
      }, "image/jpeg")
    }, 500)
    return () => clearInterval(timer)
  })

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

{#snippet TabContent(item: { name: string })}
  <div class="ui-inset flex flex-col gap-2 rounded-xl p-3">
    <span class="font-semibold">Содержимое вкладки «{item.name}»</span>
    <UI.Input placeholder="Поле внутри вкладки" />
  </div>
{/snippet}

{#snippet preview()}
  <!-- Палитра и состояния — основа темы -->
  <div class="flex flex-col gap-3 ui-panel rounded-2xl p-4">
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
    <div class="flex flex-wrap gap-2 text-xs font-semibold">
      <span class="rounded-full bg-(--green-soft) px-2.5 py-1 text-(--green-color)">В сети</span>
      <span class="rounded-full bg-(--yellow-soft) px-2.5 py-1 text-(--yellow-color)">Обновление</span>
      <span class="rounded-full bg-(--red-soft) px-2.5 py-1 text-(--red-color)">Ошибка датчика</span>
    </div>
  </div>

  <!-- Компоненты — в порядке меню слева, каждый тип в своём разделе -->
  {#snippet WiFi()}<UI.WidgetWiFi componentClass="bg-blue" value={wifiConfig} onScan={mockScan} onSave={() => {}} />{/snippet}
  {@render section("WidgetWiFi", WiFi, false)}

  {#snippet DeviceInfo()}
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
      onFactoryReset={() => {}}
    />
  {/snippet}
  {@render section("WidgetDeviceInfo", DeviceInfo, false)}

  {#snippet FileSystem()}<UI.WidgetFileSystem
      value={fsInfo}
      componentClass="bg-cyan"
      accept=".bin, .txt, .md, .pem"
      onRefresh={() => {}}
      onDelete={fsDelete}
      onUpload={fsUpload}
      onDownload={fsDownload}
    />{/snippet}
  {@render section("WidgetFileSystem", FileSystem, false)}

  {#snippet StackInfo()}<UI.WidgetStackInfo componentClass="bg-green" value={stackInfo} warnBytes={1024} onRefresh={() => {}} />{/snippet}
  {@render section("WidgetStackInfo", StackInfo, false)}

  {#snippet RGBStrip()}
    <UI.WidgetRGBStrip
      componentClass="bg-purple"
      value={{ Color: [255, 120, 0, 0], Effect: 2, Speed: 4, Count: 64, Model: 0, Order: 0, MaxCount: 128 }}
      onChange={() => {}}
      onSave={() => {}}
    />
  {/snippet}
  {@render section("WidgetRGBStrip", RGBStrip, false)}

  {#snippet PFD()}<UI.WidgetPFD value={flight} limits={{ speedMin: 8, speedMax: 25, bankMax: 30, altMax: 170, battLow: 20 }} />{/snippet}
  {@render section("WidgetPFD", PFD, false)}

  {#snippet Map()}
    <UI.WidgetMap
      groups={["MAV", "GNSS"]}
      value={{ MAV: board(flight, "Объект 1", "20000001A1B2C3"), GNSS: board(gnss, "Объект 2", "20000001D4E5F6") }}
      height={250}
      trackEnabled
    />
  {/snippet}
  {@render section("WidgetMap", Map, false)}

  {#snippet Accordion()}
    <UI.Accordion label={{ name: "Аккордеон" }} isOpen={true} size={{ width: 2, height: 1 }}>
      <UI.Input label={{ name: "Поле внутри" }} value="Значение" />
      <UI.Switch label={{ name: "Переключатель" }} value={0} options={[{ id: "sw", value: 0, class: "" }]} />
    </UI.Accordion>
  {/snippet}
  {@render section("Accordion", Accordion)}

  {#snippet Buttons()}
    <div class="grid grid-cols-3 gap-2">
      {#each ROLES as role}
        <UI.Button content={{ name: role }} componentClass={`bg-${role}`} />
      {/each}
    </div>
    <div class="grid grid-cols-3 gap-2">
      <UI.Button content={{ name: "Отключена" }} componentClass="bg-blue" disabled />
      <UI.Button content={{ name: "Без роли" }} />
      <UI.Button componentClass="bg-blue" content={{ name: "Открыть окно" }} onClick={() => (isModalOpen = true)} />
    </div>
  {/snippet}
  {@render section("Button", Buttons)}

  {#snippet Carousel()}
    <UI.Carousel label={{ name: "Карусель" }} scrollValue={260}>
      {#each ["Первый", "Второй", "Третий", "Четвёртый", "Пятый"] as name (name)}
        <div class="ui-inset h-20 w-64 min-w-64 rounded-xl p-3">{name}</div>
      {/each}
    </UI.Carousel>
  {/snippet}
  {@render section("Carousel", Carousel)}

  {#snippet Divider()}
    <UI.Divider type="line" width={2} color="bg-blue" anchor="center" />
    <UI.Divider type="line" width={4} color="bg-red" anchor="center" />
  {/snippet}
  {@render section("Divider", Divider)}

  {#snippet FileAttach()}
    <div class="flex flex-wrap items-start gap-4">
      <UI.FileAttach label={{ name: "Файл" }} type="file" wrapperClass="w-72" />
      <UI.FileAttach label={{ name: "Изображение" }} type="image" imageSize={{ height: "8rem", width: "8rem", fitMode: "cover" }} />
    </div>
  {/snippet}
  {@render section("FileAttach", FileAttach)}

  {#snippet Graph()}
    <UI.Graph label={{ name: "Живой ряд" }} streamingData={{ data: graphSeries }} isTest={true} />
    <UI.Graph label={{ name: "История за сутки" }} historyData={graphHistory} />
  {/snippet}
  {@render section("Graph", Graph)}

  {#snippet Inputs()}
    <div class="grid grid-cols-2 gap-3">
      <UI.Input label={{ name: "Имя устройства" }} value="Объект 1" />
      <UI.Input label={{ name: "Частота, Гц" }} type="number" value={20} number={{ minNum: 1, maxNum: 100, step: 1 }} />
      <UI.Input label={{ name: "Код устройства — неверный формат" }} value="12.34.567" help={{ regExp: /^\d{2}\.\d{2}\.\d{3}-\d{2}$/ }} />
      <UI.Input label={{ name: "Только чтение" }} value="20000001A1B2C3" readonly help={{ copyButton: true }} />
    </div>
    <UI.Input
      label={{ name: "Многострочный ввод" }}
      type="text-area"
      textareaRows={4}
      value={"Первая строка заметки\nВторая строка — поле растёт по высоте на заданное число строк"}
    />
  {/snippet}
  {@render section("Input", Inputs)}

  {#snippet Joystick()}<UI.Joystick label={{ name: "Джойстик" }} />{/snippet}
  {@render section("Joystick", Joystick)}

  {#snippet PeriodChart()}<UI.PeriodChart label={{ name: "Расход энергии" }} levels={energyLevels} unit=" Вт·ч" />{/snippet}
  {@render section("PeriodChart", PeriodChart)}

  {#snippet ProgressBar()}
    <UI.ProgressBar
      items={[
        { name: "Заряд", class: "bg-green" },
        { name: "Память", class: "bg-orange" },
      ]}
      value={[{ Value: 72 }, { Value: 38 }]}
    />
  {/snippet}
  {@render section("ProgressBar", ProgressBar)}

  {#snippet Select()}
    <UI.Select label={{ name: "Режим Wi-Fi" }} type="buttons" options={modeOptions} value={mode} onUpdate={(v) => !Array.isArray(v) && (mode = v)} />
    <UI.Select label={{ name: "Список" }} options={modeOptions} value={mode} onUpdate={(v) => !Array.isArray(v) && (mode = v)} />
  {/snippet}
  {@render section("Select", Select)}

  {#snippet Slider()}
    <div class="grid gap-4 sm:grid-cols-2">
      <UI.Slider label={{ name: "Яркость" }} value={60} number={{ minNum: 0, maxNum: 100, step: 1 }} />
      <UI.Slider label={{ name: "Диапазон температуры" }} value={[-12, 35]} number={{ minNum: -50, maxNum: 50, step: 1 }} />
    </div>
  {/snippet}
  {@render section("Slider", Slider)}

  {#snippet Switch()}
    <div class="grid grid-cols-2 gap-3">
      <UI.Switch label={{ name: "Реле", captionLeft: "Выкл", captionRight: "Вкл" }} value={1} options={[{ id: "sw", value: 0, class: "" }]} />
      <UI.Switch label={{ name: "Выключен" }} value={0} options={[{ id: "sw", value: 0, class: "" }]} />
    </div>
  {/snippet}
  {@render section("Switch", Switch)}

  {#snippet Table()}<UI.Table header={tableHeader} body={tableBody} />{/snippet}
  {@render section("Table", Table)}

  {#snippet Tabs()}<UI.Tabs
      items={[{ name: "Обзор" }, { name: "Настройки" }, { name: "Журнал" }]}
      children={TabContent}
      size={{ height: 1, width: 1 }}
    />{/snippet}
  {@render section("Tabs", Tabs)}

  {#snippet TextField()}
    <UI.TextField content={{ name: "Текстовое поле", size: "large", class: "font-bold" }} />
    <UI.TextField content={{ name: "С подложкой", size: "base", class: "" }} background />
  {/snippet}
  {@render section("TextField", TextField)}

  {#snippet Video()}
    <div class="h-64">
      <UI.VideoViewer label={{ name: "Видеопоток" }} source="remote" frame={videoFrame} status={videoStatus} />
    </div>
  {/snippet}
  {@render section("VideoViewer", Video)}

  {#snippet Widgets()}
    <div class="grid gap-4 lg:grid-cols-3">
      <UI.Widget
        wrapperClass="h-70"
        label={{ name: "Пропеллер" }}
        icons={{ array: ICONS_ARRAY[2][1], cycling: true }}
        settings={{ label: "Скорость", number: { minNum: 0, maxNum: 10, step: 1, units: "м/с" }, type: "input" }}
      />
      <UI.Widget
        wrapperClass="h-70"
        label={{ name: "Заряд" }}
        icons={{ array: ICONS_ARRAY[0][1], cycling: false }}
        settings={{ number: { minNum: 0, maxNum: 100, step: 1, units: "%" }, type: "slider" }}
      />
      <UI.Widget wrapperClass="h-70" label={{ name: "Лампочка" }} icons={{ array: ICONS_ARRAY[1][1], cycling: false }} settings={{ type: "switch" }} />
    </div>
  {/snippet}
  {@render section("Widget", Widgets, false)}

  <!-- Типографика и Markdown -->
  <div class="flex flex-col gap-2 ui-panel rounded-2xl p-4">
    <h6>Типографика</h6>
    <h1>Заголовок h1</h1>
    <h2>Заголовок h2</h2>
    <h3>Заголовок h3</h3>
    <h4>Заголовок h4</h4>
    <h5>Заголовок h5</h5>
    <p>Обычный текст абзаца. <span class="text-(--muted-color)">Приглушённый текст.</span> <span class="text-(--faint-color)">Бледный текст.</span></p>
    <label for="">Подпись поля (label)</label>
  </div>
  <div class="markdown-content ui-panel rounded-2xl px-6 py-4">
    {@html markdownHtml}
  </div>
{/snippet}

<!-- Раздел одного типа компонента: имя как в меню слева; виджеты — сами карточки, поэтому без своей панели (panel = false) -->
{#snippet section(title: string, body: Snippet, panel = true)}
  <section class="flex flex-col gap-2">
    <h6 class="px-1">{title}</h6>
    <div class={panel ? "ui-panel flex flex-col gap-4 rounded-2xl p-4" : "flex flex-col gap-4"}>
      {@render body()}
    </div>
  </section>
{/snippet}

<div class="flex flex-col gap-10">
  <p class="text-sm text-(--muted-color)">
    Интерфейс облака на одной странице — стили из <code>src/lib/theme.css</code>, тот же файл подключает DevCloud. Тема переключается кнопкой в шапке витрины;
    правьте <code>theme.css</code> и смотрите результат здесь.
  </p>
  {@render preview()}
</div>

<UI.Modal title="Модальное окно" bind:isOpen={isModalOpen} wrapperClass="w-120">
  {#snippet main()}
    <p>Окно поверх страницы: заливка панели, тень и затемнение фона.</p>
    <div class="ui-inset mt-3 rounded-xl p-3">Вложенный блок внутри окна</div>
  {/snippet}
  {#snippet footer()}
    <UI.Button wrapperClass="w-32" componentClass="bg-green" content={{ name: "Готово" }} onClick={() => (isModalOpen = false)} />
  {/snippet}
</UI.Modal>
