<!-- $lib/WidgetEncoder/WidgetEncoder.svelte - смарт-виджет энкодера угла любого драйвера: угол, скорость, ноль, флаги чипа и итог автокалибровки, кнопки «Ноль здесь» и «Калибровать», настройки микросхемы. Договор с прошивкой - ключи группы (ENC): A (°), Vel (рад/с), ST (флаги), CS (итог автокалибровки), Cfg (биты 0-1 режим: 0 стоп, 1 измерять, 2 автокалибровка, 3 ноль здесь; биты 15-26 - ноль, шаг 360/4096°). Ничего не знает про транспорт - value/onCalibrate/onRefresh -->
<script lang="ts">
  import { onDestroy, untrack } from "svelte"
  import { slide } from "svelte/transition"
  import { twMerge } from "tailwind-merge"
  import * as UI from ".."
  import { T } from "../locales/i18n"
  import type { IWidgetEncoderProps } from "../types"
  import { SENSOR_MODE, sensorMode } from "../gui"
  import { bitFieldGet, bitFieldSet } from "../bitField"
  import WidgetHeader from "../WidgetHeader.svelte"
  import SensorReadout from "../SensorReadout.svelte"
  import SensorCalibrate from "../SensorCalibrate.svelte"
  import SensorSettings from "../SensorSettings.svelte"
  import { sensorChipPart } from "../sensorChips"
  import EncoderIcon from "./EncoderIcon.svelte"
  import { hint, hintsSetting } from "../hints"
  import { accentStyle } from "../accent"
  import { readPersistedCollapsed, writePersistedCollapsed } from "../widgetCollapse"

  let {
    wrapperClass = "",
    accent,
    label = {},
    value = {},
    chip,
    calibrateMs = 60000,
    collapsed = $bindable(false),
    persistKey,
    onSaveCfg,
    onCalibrate,
    onRefresh,
  }: IWidgetEncoderProps = $props()

  const hints = $derived(hintsSetting("WidgetEncoder", persistKey))
  const rootStyle = $derived(accentStyle(accent))

  /* Свёрнутость: выбор пользователя переживает перезагрузку (persistKey) */
  const guiCollapsed = untrack(() => collapsed)
  collapsed = readPersistedCollapsed(
    untrack(() => persistKey),
    guiCollapsed,
  )
  $effect(() => writePersistedCollapsed(persistKey, collapsed, guiCollapsed))

  /* Режимы Cfg: 2 - автокалибровка (вал вращает устройство), 3 - ноль здесь; в обоих драйвер занят */
  const MODE_ZERO = 3
  const BUSY_MODES = [SENSOR_MODE.calibrate, MODE_ZERO]
  /* Ноль - биты 15-26 Cfg, 4096 шагов на оборот */
  const ZERO_START = 15
  const ZERO_END = 26
  /* Ноль драйвер ставит за один проход задачи: потом виджет перечитывает Cfg */
  const ZERO_REFRESH_MS = 800

  const chipPart = $derived(sensorChipPart(chip, "enc"))
  const cfg = $derived(value.Cfg === undefined || value.Cfg === null || (value.Cfg as unknown) === "" ? undefined : Number(value.Cfg) >>> 0)
  const mode = $derived(cfg === undefined ? undefined : sensorMode(cfg))
  /* Идёт автокалибровка, начатая кнопкой: остальное ждёт */
  let calibrating = $state(false)
  let zeroing = $state(false)
  let zeroTimer: ReturnType<typeof setTimeout> | undefined
  onDestroy(() => clearTimeout(zeroTimer))

  const finite = (v: unknown) => (v === undefined || v === null || v === "" || !Number.isFinite(Number(v)) ? undefined : Number(v))
  const rpm = $derived(finite(value.Vel) === undefined ? undefined : (finite(value.Vel)! * 60) / (2 * Math.PI))
  const zeroDeg = $derived(cfg === undefined ? undefined : (bitFieldGet(cfg, ZERO_START, ZERO_END) * 360) / 4096)

  /* Флаги чипа: бит 0 превышение скорости, 1 слабое поле, 2 низкое напряжение */
  const FLAGS = ["overspeed", "weakField", "undervoltage"]
  const status = $derived(finite(value.ST))
  const flagsOn = $derived(status === undefined ? [] : FLAGS.filter((_, bit) => (status >> bit) & 1))
  /* Итог автокалибровки: 0 не запускалась, 1 идёт, 2 ошибка, 3 успешно (нужен перезапуск питания) */
  const CAL_STATES = [
    { key: "idle", color: "var(--muted-color)" },
    { key: "running", color: "var(--purple-text)" },
    { key: "failed", color: "var(--red-text)" },
    { key: "success", color: "var(--green-text)" },
  ]
  const calState = $derived(finite(value.CS) === undefined ? undefined : CAL_STATES[finite(value.CS)!])

  /* «Ноль здесь» - только когда датчик измеряет и ничем не занят */
  const zeroBlocked = $derived(!onCalibrate || mode !== SENSOR_MODE.measure || calibrating || zeroing)
  const zeroHere = () => {
    if (zeroBlocked || cfg === undefined) return
    zeroing = true
    onCalibrate!(bitFieldSet(cfg, 0, 1, MODE_ZERO))
    zeroTimer = setTimeout(() => {
      zeroing = false
      onRefresh?.()
    }, ZERO_REFRESH_MS)
  }
</script>

<div
  class={twMerge("@container relative flex w-full flex-col gap-4 rounded-2xl border border-(--hairline-color) bg-(--container-color) p-4", wrapperClass)}
  style={rootStyle}
>
  <WidgetHeader icon={EncoderIcon} label={label?.name || $T("widget.enc.title")} bind:collapsed {hints} />

  {#if !collapsed}
    <div class="flex flex-col gap-4" transition:slide={{ duration: 150 }}>
      <div use:hint={{ text: $T("widget.enc.hint.calibrate"), enabled: $hints }}>
        <SensorCalibrate
          {mode}
          instruction={$T("widget.enc.calibrating")}
          confirm={$T("widget.enc.calibrate.confirm")}
          {calibrateMs}
          onCalibrate={onCalibrate && cfg !== undefined ? () => onCalibrate(bitFieldSet(cfg, 0, 1, SENSOR_MODE.calibrate)) : undefined}
          {onRefresh}
          modeKeys={["stop", "measure", "calibrate", "zero"]}
          busyModes={BUSY_MODES}
          locked={zeroing}
          bind:busy={calibrating}
        />
      </div>

      <div class="grid grid-cols-3 gap-1.5" use:hint={{ text: $T("widget.enc.hint.readout"), enabled: $hints }}>
        <SensorReadout label={$T("widget.enc.angle")} value={value.A} digits={2} unit="°" />
        <SensorReadout label={$T("widget.enc.speed")} value={rpm} digits={0} unit={$T("widget.enc.rpm")} />
        <SensorReadout label={$T("widget.enc.zero")} value={zeroDeg} digits={2} unit="°" />
      </div>

      <div class="flex flex-wrap items-center justify-between gap-2">
        <div class="flex flex-wrap items-center gap-1.5 text-[12px]" use:hint={{ text: $T("widget.enc.hint.status"), enabled: $hints }}>
          {#if status !== undefined}
            {#if flagsOn.length}
              {#each flagsOn as flag (flag)}
                <span class="rounded-full border border-(--red-text) px-2 py-0.5 whitespace-nowrap text-(--red-text)">{$T(`widget.enc.flag.${flag}`)}</span>
              {/each}
            {:else}
              <span class="rounded-full border border-(--hairline-color) px-2 py-0.5 whitespace-nowrap text-(--green-text)">{$T("widget.enc.flag.ok")}</span>
            {/if}
          {/if}
          {#if calState}
            <span class="rounded-full border border-(--hairline-color) px-2 py-0.5 whitespace-nowrap">
              <span class="text-(--muted-color)">{$T("widget.enc.cal")}:</span>
              <span style="color: {calState.color}">{$T(`widget.enc.cal.${calState.key}`)}</span>
            </span>
          {/if}
        </div>
        {#if onCalibrate}
          <div use:hint={{ text: $T("widget.enc.hint.zero"), enabled: $hints }}>
            <UI.Button wrapperClass="w-40" variant="primary" content={{ name: $T("widget.enc.zeroHere") }} disabled={zeroBlocked} onClick={zeroHere} />
          </div>
        {/if}
      </div>

      {#if chipPart}
        <SensorSettings part={chipPart} cfg={value.Cfg} onSave={onSaveCfg} hints={$hints} locked={calibrating || zeroing} />
      {/if}
    </div>
  {/if}
</div>
