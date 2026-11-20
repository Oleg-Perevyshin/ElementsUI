<!-- $lib/WidgetIMU/WidgetIMU.svelte - смарт-виджет IMU любого драйвера: ускорения, угловые скорости и температура надписями, режим датчика и калибровка. Договор с прошивкой - ключи группы (IMUF): AX..AZ, GX..GZ, T и биты 0-1 Cfg (0 стоп, 1 измерять, 2 калибровать). Настройки конкретного чипа виджет не трогает. Ничего не знает про транспорт - value/onCalibrate/onRefresh -->
<script lang="ts">
  import { untrack } from "svelte"
  import { slide } from "svelte/transition"
  import { twMerge } from "tailwind-merge"
  import { T } from "../locales/i18n"
  import type { IWidgetIMUProps } from "../types"
  import { sensorCalibrateCfg, sensorMode } from "../gui"
  import WidgetHeader from "../WidgetHeader.svelte"
  import SensorReadout from "../SensorReadout.svelte"
  import SensorCalibrate from "../SensorCalibrate.svelte"
  import ImuIcon from "./ImuIcon.svelte"
  import { hint, hintsSetting } from "../hints"
  import { accentStyle } from "../accent"
  import { readPersistedCollapsed, writePersistedCollapsed } from "../widgetCollapse"

  let {
    wrapperClass = "",
    accent,
    label = {},
    value = {},
    calibrateMs = 4000,
    collapsed = $bindable(false),
    persistKey,
    onCalibrate,
    onRefresh,
  }: IWidgetIMUProps = $props()

  const hints = $derived(hintsSetting("WidgetIMU", persistKey))
  const rootStyle = $derived(accentStyle(accent))

  /* Свёрнутость: выбор пользователя переживает перезагрузку (persistKey) */
  const guiCollapsed = untrack(() => collapsed)
  collapsed = readPersistedCollapsed(
    untrack(() => persistKey),
    guiCollapsed,
  )
  $effect(() => writePersistedCollapsed(persistKey, collapsed, guiCollapsed))

  const mode = $derived(value.Cfg === undefined ? undefined : sensorMode(value.Cfg))
  /* Модуль ускорения: в покое около 1 g - быстрая проверка калибровки акселерометра */
  const norm = $derived(
    [value.AX, value.AY, value.AZ].every((v) => v !== undefined && Number.isFinite(Number(v)))
      ? Math.hypot(Number(value.AX), Number(value.AY), Number(value.AZ))
      : undefined,
  )
</script>

<div
  class={twMerge("@container relative flex w-full flex-col gap-4 rounded-2xl border border-(--hairline-color) bg-(--container-color) p-4", wrapperClass)}
  style={rootStyle}
>
  <WidgetHeader icon={ImuIcon} label={label?.name || $T("widget.imu.title")} bind:collapsed {hints} />

  {#if !collapsed}
    <div class="flex flex-col gap-4" transition:slide={{ duration: 150 }}>
      <div use:hint={{ text: $T("widget.imu.hint.calibrate"), enabled: $hints }}>
        <SensorCalibrate
          {mode}
          instruction={$T("widget.imu.calibrating")}
          {calibrateMs}
          onCalibrate={onCalibrate ? () => onCalibrate(sensorCalibrateCfg(value.Cfg)) : undefined}
          {onRefresh}
        />
      </div>

      <div class="grid grid-cols-1 gap-3 @2xl:grid-cols-2">
        <div class="flex flex-col gap-1.5" use:hint={{ text: $T("widget.imu.hint.accel"), enabled: $hints }}>
          <span class="text-[12px] font-semibold text-(--muted-color)">{$T("widget.imu.accel")}</span>
          <div class="grid grid-cols-4 gap-1.5">
            <SensorReadout label="X" value={value.AX} digits={3} unit="g" />
            <SensorReadout label="Y" value={value.AY} digits={3} unit="g" />
            <SensorReadout label="Z" value={value.AZ} digits={3} unit="g" />
            <SensorReadout label="|a|" value={norm} digits={3} unit="g" />
          </div>
        </div>
        <div class="flex flex-col gap-1.5" use:hint={{ text: $T("widget.imu.hint.gyro"), enabled: $hints }}>
          <span class="text-[12px] font-semibold text-(--muted-color)">{$T("widget.imu.gyro")}</span>
          <div class="grid grid-cols-4 gap-1.5">
            <SensorReadout label="X" value={value.GX} digits={2} unit="°/s" />
            <SensorReadout label="Y" value={value.GY} digits={2} unit="°/s" />
            <SensorReadout label="Z" value={value.GZ} digits={2} unit="°/s" />
            <SensorReadout label="T" value={value.T} digits={1} unit="°C" />
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
