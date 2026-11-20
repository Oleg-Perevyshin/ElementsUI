<!-- $lib/SensorCalibrate.svelte - режим датчика и калибровка для WidgetIMU, WidgetMag и WidgetEncoder: значок режима (биты 0-1 Cfg), кнопка «Калибровать», подсказка, что делать с датчиком, и полоса времени калибровки. Пока калибровка идёт, виджет раз в pollMs зовёт onRefresh: калибровка кончилась, когда драйвер побывал в режиме busyModes и вышел из него; calibrateMs - предел ожидания, потом ещё один onRefresh. Калибровать нельзя, пока датчик остановлен, драйвер занят (busyModes) или виджет занят другим делом (locked); busy - идёт ли калибровка -->
<script lang="ts">
  import { onDestroy } from "svelte"
  import { slide } from "svelte/transition"
  import * as UI from "./index"
  import { T } from "./locales/i18n"
  import { SENSOR_MODE } from "./gui"

  let {
    mode,
    instruction,
    calibrateMs,
    onCalibrate,
    onRefresh,
    modeKeys = ["stop", "measure", "calibrate", "on_demand"],
    busyModes = [2],
    locked = false,
    busy = $bindable(false),
    pollMs = 1000,
  }: {
    /* Режим из Cfg; undefined - Cfg ещё не прочитан */
    mode: number | undefined
    /* Что делать с датчиком во время калибровки */
    instruction: string
    calibrateMs: number
    onCalibrate?: () => void
    onRefresh?: () => void
    /* Подписи режимов 0-3: widget.sensor.mode.<ключ> */
    modeKeys?: string[]
    /* Режимы, в которых драйвер занят калибровкой */
    busyModes?: number[]
    /* Виджет занят другим делом (запись положения) */
    locked?: boolean
    /* Идёт калибровка, начатая этой кнопкой */
    busy?: boolean
    /* Как часто перечитывать настройки во время калибровки, мс; 0 - только по окончании calibrateMs */
    pollMs?: number
  } = $props()

  const COLORS = ["var(--faint-color)", "var(--green-text)", "var(--purple-text)", "var(--blue-text)"]
  const shown = $derived(mode === undefined ? undefined : { key: modeKeys[mode], color: busyModes.includes(mode) ? COLORS[2] : COLORS[mode] })

  /* Прошивка сама возвращается в измерение, но Cfg без запроса не присылает: виджет перечитывает его, пока идёт калибровка */
  let started = $state(0)
  let now = $state(0)
  let polled = 0
  /* Драйвер уже ответил режимом калибровки: выход из него - конец */
  let seenBusy = false
  let timer: ReturnType<typeof setInterval> | undefined
  const running = $derived(started > 0)
  $effect(() => {
    if (!running || mode === undefined) return
    if (busyModes.includes(mode)) seenBusy = true
    else if (seenBusy) stop()
  })
  $effect(() => {
    busy = running
  })
  /* Почему нельзя калибровать: остановлен, драйвер занят, виджет занят; пусто - можно */
  const blocked = $derived(
    running ? "" : mode === undefined ? "unknown" : mode === SENSOR_MODE.stop ? "stopped" : busyModes.includes(mode) || locked ? "busy" : "",
  )
  /* Полоса по времени до предела calibrateMs; конец по ответу прошивки может прийти раньше */
  const progress = $derived(running ? Math.min(100, ((now - started) / calibrateMs) * 100) : 0)

  const stop = () => {
    clearInterval(timer)
    timer = undefined
    started = 0
  }
  const start = () => {
    if (!onCalibrate || running || blocked) return
    onCalibrate()
    seenBusy = false
    started = now = polled = Date.now()
    timer = setInterval(() => {
      now = Date.now()
      if (now - started >= calibrateMs) {
        stop()
        onRefresh?.()
        return
      }
      if (pollMs > 0 && now - polled >= pollMs) {
        polled = now
        onRefresh?.()
      }
    }, 200)
  }
  onDestroy(stop)
</script>

<div class="flex flex-col gap-2">
  <div class="flex flex-wrap items-center justify-between gap-2">
    <span class="flex items-center gap-2 text-[13px]">
      <span
        class="size-2 rounded-full {running || (mode !== undefined && busyModes.includes(mode)) ? 'animate-pulse' : ''}"
        style="background: {running ? 'var(--purple-text)' : (shown?.color ?? 'var(--faint-color)')}"
      ></span>
      <span class="text-(--muted-color)">{$T("widget.sensor.mode")}:</span>
      <span class="font-semibold">{running ? $T("widget.sensor.mode.calibrate") : shown ? $T(`widget.sensor.mode.${shown.key}`) : "-"}</span>
    </span>
    {#if onCalibrate}
      <UI.Button
        wrapperClass="w-40"
        variant="primary"
        accent="purple"
        content={{ name: $T("widget.sensor.calibrate") }}
        disabled={running || !!blocked}
        onClick={start}
      />
    {/if}
  </div>
  {#if onCalibrate && (blocked === "stopped" || blocked === "busy")}
    <span class="text-right text-[12px] text-(--muted-color)">{$T(`widget.sensor.calibrate.${blocked}`)}</span>
  {/if}
  {#if running}
    <div class="flex flex-col gap-1.5" transition:slide={{ duration: 150 }}>
      <span class="text-center text-[12px] text-(--muted-color)">{instruction}</span>
      <div class="h-1.5 w-full overflow-hidden rounded-full bg-(--back-color)">
        <div class="h-full rounded-full bg-(--purple-text) transition-[width] duration-200" style="width: {progress}%"></div>
      </div>
    </div>
  {/if}
</div>
