<!-- $lib/WidgetAHRS/WidgetAHRS.svelte - смарт-виджет фильтра ориентации (ahrs_gimbal): авиагоризонт и углы, ноль гироскопа, у ESKF ошибка оценки; выбор алгоритма и только его параметры (AHRS_ALGORITHMS в ahrs.ts). Правки локальные до «Сохранить», уходят одним пакетом. Ничего не знает про транспорт - value/onSave -->
<script lang="ts">
  import { untrack } from "svelte"
  import { slide } from "svelte/transition"
  import { twMerge } from "tailwind-merge"
  import * as UI from ".."
  import { T } from "../locales/i18n"
  import type { IWidgetAHRSProps, IWidgetAHRSData } from "../types"
  import WidgetHeader from "../WidgetHeader.svelte"
  import SensorReadout from "../SensorReadout.svelte"
  import AhrsIcon from "./AhrsIcon.svelte"
  import Horizon from "./Horizon.svelte"
  import { AHRS_ALGORITHMS, AHRS_PARAM_RANGES, ahrsAlgorithm, roundToStep, type AHRSParam } from "./ahrs"
  import { hint, hintsSetting } from "../hints"
  import { accentStyle } from "../accent"
  import { readPersistedCollapsed, writePersistedCollapsed } from "../widgetCollapse"

  let { wrapperClass = "", accent, label = {}, value = {}, collapsed = $bindable(false), persistKey, onSave }: IWidgetAHRSProps = $props()

  const hints = $derived(hintsSetting("WidgetAHRS", persistKey))
  const rootStyle = $derived(accentStyle(accent))

  /* Свёрнутость: выбор пользователя переживает перезагрузку (persistKey) */
  const guiCollapsed = untrack(() => collapsed)
  collapsed = readPersistedCollapsed(
    untrack(() => persistKey),
    guiCollapsed,
  )
  $effect(() => writePersistedCollapsed(persistKey, collapsed, guiCollapsed))

  type Settings = Partial<Record<"Mode" | "MU" | AHRSParam, number>>
  const SETTING_KEYS = ["Mode", "MU", ...(Object.keys(AHRS_PARAM_RANGES) as AHRSParam[])] as const
  /* Параметры - с точностью шага поля: прошивка шлёт float32 */
  const pickSettings = (data: Partial<IWidgetAHRSData>): Settings =>
    Object.fromEntries(
      SETTING_KEYS.filter((key) => data[key] !== undefined).map((key) => {
        const number = Number(data[key])
        const range = AHRS_PARAM_RANGES[key as AHRSParam]
        return [key, range && Number.isFinite(number) ? roundToStep(number, range.step) : number]
      }),
    )

  /* Правки локальные до «Сохранить»; новые значения с устройства подхватываются, только пока правок нет (углы идут потоком и не мешают) */
  const incoming = $derived(pickSettings(value))
  const incomingText = $derived(JSON.stringify(incoming))
  let settings: Settings = $state(untrack(() => ({ ...incoming })))
  let savedSnapshot = $state(untrack(() => JSON.stringify(incoming)))
  const isDirty = $derived(JSON.stringify(settings) !== savedSnapshot)
  $effect(() => {
    const text = incomingText
    if (untrack(() => isDirty)) return
    settings = JSON.parse(text)
    savedSnapshot = text
  })

  const algorithm = $derived(ahrsAlgorithm(settings.Mode))
  const readOnly = $derived(!onSave)

  const num = (v: unknown) => (v === undefined || v === null || v === "" ? undefined : Number(v))
  const roll = $derived(num(value.R))
  const pitch = $derived(num(value.P))
  /* Оценка ошибки есть только у ESKF: у остальных алгоритмов в ряду дефисы (прошивка шлёт нули), ряд не пропадает и блок не прыгает */
  const sigma = (v: unknown) => (algorithm?.sigma ? v : undefined)

  const set = (key: keyof Settings, input: unknown) => {
    const number = Number(input)
    if (Number.isFinite(number)) settings = { ...settings, [key]: number }
  }

  /* В пакет - алгоритм, курс по магнитометру и параметры выбранного алгоритма: чужие параметры не трогаются */
  const save = () => {
    if (!onSave) return
    const keys = ["Mode", "MU", ...(algorithm?.params ?? [])] as (keyof Settings)[]
    onSave(Object.fromEntries(keys.filter((key) => settings[key] !== undefined).map((key) => [key, settings[key]])) as Partial<IWidgetAHRSData>)
    savedSnapshot = JSON.stringify(settings)
  }
</script>

<div
  class={twMerge("@container relative flex w-full flex-col gap-4 rounded-2xl border border-(--hairline-color) bg-(--container-color) p-4", wrapperClass)}
  style={rootStyle}
>
  <WidgetHeader icon={AhrsIcon} label={label?.name || $T("widget.ahrs.title")} bind:collapsed {hints} />

  {#if !collapsed}
    <div class="flex flex-col gap-4" transition:slide={{ duration: 150 }}>
      <!-- Ориентация: горизонт и углы, под ними ноль гироскопа и у ESKF ошибка оценки -->
      <div class="flex flex-col items-center gap-3 @md:flex-row @md:items-stretch" use:hint={{ text: $T("widget.ahrs.hint.attitude"), enabled: $hints }}>
        <Horizon {roll} {pitch} />
        <div class="flex w-full min-w-0 flex-1 flex-col justify-center gap-1.5">
          <div class="grid grid-cols-3 gap-1.5">
            <SensorReadout label={$T("widget.ahrs.roll")} value={value.R} digits={1} unit="°" size="lg" />
            <SensorReadout label={$T("widget.ahrs.pitch")} value={value.P} digits={1} unit="°" size="lg" />
            <SensorReadout label={$T("widget.ahrs.yaw")} value={value.Y} digits={1} unit="°" size="lg" />
          </div>
          <div class="grid grid-cols-3 gap-1.5" use:hint={{ text: $T("widget.ahrs.hint.bias"), enabled: $hints }}>
            <SensorReadout label={$T("widget.ahrs.bias", { axis: "X" })} value={value.BX} digits={3} unit="°/s" size="sm" />
            <SensorReadout label={$T("widget.ahrs.bias", { axis: "Y" })} value={value.BY} digits={3} unit="°/s" size="sm" />
            <SensorReadout label={$T("widget.ahrs.bias", { axis: "Z" })} value={value.BZ} digits={3} unit="°/s" size="sm" />
          </div>
          <div class="grid grid-cols-3 gap-1.5" use:hint={{ text: $T("widget.ahrs.hint.sigma"), enabled: $hints }}>
            <SensorReadout label={$T("widget.ahrs.sigma", { angle: $T("widget.ahrs.roll") })} value={sigma(value.SR)} digits={2} unit="°" size="sm" />
            <SensorReadout label={$T("widget.ahrs.sigma", { angle: $T("widget.ahrs.pitch") })} value={sigma(value.SP)} digits={2} unit="°" size="sm" />
            <SensorReadout label={$T("widget.ahrs.sigma", { angle: $T("widget.ahrs.yaw") })} value={sigma(value.SY)} digits={2} unit="°" size="sm" />
          </div>
        </div>
      </div>

      <!-- Алгоритм и только его параметры -->
      <div class="flex flex-col gap-3 rounded-[10px] border border-(--hairline-color) bg-(--back-color) p-3">
        <div class="flex flex-col items-center gap-3 @lg:flex-row @lg:items-end">
          <div class="w-full min-w-0 flex-1" use:hint={{ text: $T("widget.ahrs.hint.mode"), enabled: $hints }}>
            <UI.Select
              type="buttons"
              label={{ name: $T("widget.ahrs.mode") }}
              options={AHRS_ALGORITHMS.map((a) => ({ id: `ahrs-mode-${a.mode}`, name: $T(`widget.ahrs.algo.${a.name}`), value: a.mode }))}
              value={settings.Mode}
              disabled={readOnly}
              onUpdate={(mode) => set("Mode", mode)}
            />
          </div>
          <div class="shrink-0" use:hint={{ text: $T("widget.ahrs.hint.MU"), enabled: $hints }}>
            <UI.Switch
              type="horizontal"
              label={{ name: $T("widget.ahrs.MU") }}
              value={settings.MU ? 1 : 0}
              disabled={readOnly}
              onUpdate={(state) => set("MU", state)}
            />
          </div>
        </div>

        {#if algorithm}
          <!-- Подпись поля - одна строка целиком (имя и единица мелко справа, пояснение - в подсказке): колонка не уже подписи, лишние поля уходят в следующий ряд, поля в ряду на одной высоте -->
          <div class="grid grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] gap-2">
            {#each algorithm.params as param (param)}
              {@const range = AHRS_PARAM_RANGES[param]}
              <div class="flex min-w-0 flex-col gap-1" use:hint={{ text: $T(`widget.ahrs.hint.${param}`), enabled: $hints }}>
                <span class="flex min-w-0 items-baseline justify-center gap-1 px-1 text-[12px] leading-4 font-semibold">
                  <span class="whitespace-nowrap">{$T(`widget.ahrs.${param}`)}</span>
                  {#if range.unit}<span class="shrink-0 text-[11px] font-normal text-(--muted-color)">{range.unit}</span>{/if}
                </span>
                <UI.Input
                  type="number"
                  value={settings[param] ?? ""}
                  readonly={readOnly}
                  number={{ minNum: range.min, maxNum: range.max, step: range.step }}
                  onUpdate={(input) => set(param, input)}
                />
              </div>
            {/each}
          </div>
        {:else if settings.Mode !== undefined}
          <span class="text-center text-[13px] text-(--muted-color)">{$T("widget.ahrs.unknown_mode", { mode: settings.Mode })}</span>
        {/if}
      </div>

      {#if !readOnly}
        <div class="flex flex-col items-center gap-2">
          <!-- Место под строку есть всегда: без правок она невидима, кнопка не прыгает -->
          <span class="text-[12px] text-(--muted-color) {isDirty ? '' : 'invisible'}">{$T("widget.common.unsaved")}</span>
          <UI.Button wrapperClass="w-40" variant="primary" content={{ name: $T("widget.common.save") }} disabled={!isDirty} onClick={save} />
        </div>
      {/if}
    </div>
  {/if}
</div>
