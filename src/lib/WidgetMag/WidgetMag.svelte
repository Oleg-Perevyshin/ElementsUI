<!-- $lib/WidgetMag/WidgetMag.svelte - смарт-виджет магнитометра любого драйвера: поле по осям и его модуль надписями, качество калибровки, режим датчика и калибровка. Договор с прошивкой - ключи группы (MAGF): CX..CZ (мкТл), CQ (0..100%) и биты 0-1 Cfg (0 стоп, 1 измерять, 2 калибровать, 3 по запросу). Ничего не знает про транспорт - value/onCalibrate/onRefresh -->
<script lang="ts">
  import { untrack } from "svelte"
  import { slide } from "svelte/transition"
  import { twMerge } from "tailwind-merge"
  import { T } from "../locales/i18n"
  import type { IWidgetMagProps } from "../types"
  import { sensorCalibrateCfg, sensorMode } from "../gui"
  import WidgetHeader from "../WidgetHeader.svelte"
  import SensorReadout from "../SensorReadout.svelte"
  import SensorCalibrate from "../SensorCalibrate.svelte"
  import SensorSettings from "../SensorSettings.svelte"
  import SensorMountSettings from "../SensorMountSettings.svelte"
  import { sensorChipPart } from "../sensorChips"
  import MagIcon from "./MagIcon.svelte"
  import { hint, hintsSetting } from "../hints"
  import { accentStyle } from "../accent"
  import { readPersistedCollapsed, writePersistedCollapsed } from "../widgetCollapse"

  let {
    wrapperClass = "",
    accent,
    label = {},
    value = {},
    chip,
    calibrateMs = 30000,
    collapsed = $bindable(false),
    persistKey,
    onSaveCfg,
    onSaveMount,
    onCalibrate,
    onRefresh,
  }: IWidgetMagProps = $props()

  const hints = $derived(hintsSetting("WidgetMag", persistKey))
  const rootStyle = $derived(accentStyle(accent))

  /* Свёрнутость: выбор пользователя переживает перезагрузку (persistKey) */
  const guiCollapsed = untrack(() => collapsed)
  collapsed = readPersistedCollapsed(
    untrack(() => persistKey),
    guiCollapsed,
  )
  $effect(() => writePersistedCollapsed(persistKey, collapsed, guiCollapsed))

  /* Описание микросхемы: блок «Настройки датчика» */
  const chipPart = $derived(sensorChipPart(chip, "mag"))
  /* Идёт калибровка: настройки ждут */
  let calibrating = $state(false)
  const mode = $derived(value.Cfg === undefined ? undefined : sensorMode(value.Cfg))
  /* Модуль поля: у Земли 25-65 мкТл, сильно больше - рядом железо или магнит */
  const norm = $derived(
    [value.CX, value.CY, value.CZ].every((v) => v !== undefined && Number.isFinite(Number(v)))
      ? Math.hypot(Number(value.CX), Number(value.CY), Number(value.CZ))
      : undefined,
  )
  const quality = $derived(value.CQ !== undefined && Number.isFinite(Number(value.CQ)) ? Math.max(0, Math.min(100, Number(value.CQ))) : undefined)
  const qualityColor = $derived(
    quality === undefined ? undefined : quality >= 90 ? "var(--green-text)" : quality >= 70 ? "var(--orange-text)" : "var(--red-text)",
  )
</script>

<div
  class={twMerge("@container relative flex w-full flex-col gap-4 rounded-2xl border border-(--hairline-color) bg-(--container-color) p-4", wrapperClass)}
  style={rootStyle}
>
  <WidgetHeader icon={MagIcon} label={label?.name || $T("widget.mag.title")} bind:collapsed {hints} />

  {#if !collapsed}
    <div class="flex flex-col gap-4" transition:slide={{ duration: 150 }}>
      <div use:hint={{ text: $T("widget.mag.hint.calibrate"), enabled: $hints }}>
        <SensorCalibrate
          {mode}
          instruction={$T("widget.mag.calibrating")}
          {calibrateMs}
          onCalibrate={onCalibrate ? () => onCalibrate(sensorCalibrateCfg(value.Cfg)) : undefined}
          {onRefresh}
          bind:busy={calibrating}
        />
      </div>

      <div class="grid grid-cols-1 gap-3 @2xl:grid-cols-[3fr_1fr]">
        <div class="flex flex-col gap-1.5" use:hint={{ text: $T("widget.mag.hint.field"), enabled: $hints }}>
          <span class="text-[12px] font-semibold text-(--muted-color)">{$T("widget.mag.field")}, µT</span>
          <div class="grid grid-cols-2 gap-1.5 @[16.5rem]:grid-cols-4">
            <SensorReadout label="X" value={value.CX} digits={1} />
            <SensorReadout label="Y" value={value.CY} digits={1} />
            <SensorReadout label="Z" value={value.CZ} digits={1} />
            <SensorReadout label="|B|" value={norm} digits={1} />
          </div>
        </div>
        <div class="flex flex-col gap-1.5" use:hint={{ text: $T("widget.mag.hint.quality"), enabled: $hints }}>
          <span class="text-[12px] font-semibold text-(--muted-color)">{$T("widget.mag.quality")}</span>
          <div class="flex flex-1 flex-col justify-center gap-1.5 rounded-[10px] border border-(--hairline-color) bg-(--back-color) px-3 py-1.5">
            <span class="text-center text-[16px] font-semibold tabular-nums" style={qualityColor ? `color: ${qualityColor}` : undefined}>
              {quality === undefined ? "-" : `${quality.toFixed(0)}%`}
            </span>
            <div class="h-1.5 w-full overflow-hidden rounded-full bg-(--container-color)">
              <div
                class="h-full rounded-full transition-[width] duration-300"
                style="width: {quality ?? 0}%; background: {qualityColor ?? 'transparent'}"
              ></div>
            </div>
          </div>
        </div>
      </div>

      {#if chipPart}
        <SensorSettings part={chipPart} cfg={value.Cfg} onSave={onSaveCfg} hints={$hints} locked={calibrating}>
          {#snippet children()}
            {#if value.MR !== undefined && value.MP !== undefined && value.MY !== undefined}
              <SensorMountSettings
                title={$T("widget.mag.mount.title")}
                mount={{ MR: Number(value.MR), MP: Number(value.MP), MY: Number(value.MY) }}
                onSave={onSaveMount}
                locked={calibrating}
              />
            {/if}
          {/snippet}
        </SensorSettings>
      {/if}
    </div>
  {/if}
</div>
