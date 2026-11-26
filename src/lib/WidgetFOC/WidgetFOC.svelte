<!-- $lib/WidgetFOC/WidgetFOC.svelte - смарт-виджет векторного управления мотором (foc_control любого привода): состояние оси, включение, калибровка нуля, автонастройка, настройки мотора, пределов, режимов, регуляторов и датчика тока. Договор с прошивкой - ключи группы (FOC); всё в градусах. Ничего не знает про транспорт - value/onEnable/onZero/onTune/onSave/onDefaults/onRefresh -->
<script lang="ts">
  import { onDestroy, untrack } from "svelte"
  import { slide } from "svelte/transition"
  import { twMerge } from "tailwind-merge"
  import * as UI from ".."
  import { T } from "../locales/i18n"
  import type { IWidgetFOCProps } from "../types"
  import WidgetHeader from "../WidgetHeader.svelte"
  import SensorReadout from "../SensorReadout.svelte"
  import SectionHead from "../SectionHead.svelte"
  import FOCIcon from "./FOCIcon.svelte"
  import { hint, hintsSetting } from "../hints"
  import { accentStyle } from "../accent"
  import { readPersistedCollapsed, writePersistedCollapsed } from "../widgetCollapse"

  let {
    wrapperClass = "",
    accent,
    label = {},
    value = {},
    refreshMs = 1000,
    collapsed = $bindable(false),
    persistKey,
    onEnable,
    onZero,
    onTune,
    onSave,
    onDefaults,
    onRefresh,
  }: IWidgetFOCProps = $props()

  const hints = $derived(hintsSetting("WidgetFOC", persistKey))
  const rootStyle = $derived(accentStyle(accent))

  /* Свёрнутость: выбор пользователя переживает перезагрузку (persistKey) */
  const guiCollapsed = untrack(() => collapsed)
  collapsed = readPersistedCollapsed(
    untrack(() => persistKey),
    guiCollapsed,
  )
  $effect(() => writePersistedCollapsed(persistKey, collapsed, guiCollapsed))

  /* Живое состояние: пока виджет раскрыт, раз в refreshMs он просит перечитать группу */
  $effect(() => {
    if (collapsed || !refreshMs || !onRefresh) return
    const timer = setInterval(() => onRefresh?.(), refreshMs)
    return () => clearInterval(timer)
  })

  const finite = (v: unknown) => (v === undefined || v === null || v === "" || !Number.isFinite(Number(v)) ? undefined : Number(v))

  /* Флаги оси (Flg): 0x01 включён, 0x02 выход в угол, 0x04 калибровка нуля, 0x08 поток уставок прервался, 0x10 ноль известен, 0x20 занят процедурой */
  const flags = $derived(finite(value.Flg))
  const flag = (bit: number) => flags !== undefined && (flags & bit) !== 0
  const enabled = $derived(flag(0x01))
  const busy = $derived(flag(0x04) || flag(0x20))
  const chips = $derived(
    flags === undefined
      ? []
      : [
          flag(0x10) ? { key: "zero", color: "var(--green-text)" } : { key: "noZero", color: "var(--red-text)" },
          ...(flag(0x02) ? [{ key: "moving", color: "var(--blue-text)" }] : []),
          ...(flag(0x04) ? [{ key: "calibrating", color: "var(--purple-text)" }] : []),
          ...(flag(0x20) ? [{ key: "busy", color: "var(--purple-text)" }] : []),
          ...(flag(0x08) ? [{ key: "timeout", color: "var(--red-text)" }] : []),
        ],
  )

  /* Настройки по разделам: ключ, единица (ключ перевода widget.foc.unit.*), выбор - варианты 0..n-1, только чтение */
  type Field = { key: string; unit?: string; options?: string[]; readonly?: boolean; step?: number }
  const SECTIONS: { key: string; fields: Field[] }[] = [
    {
      key: "motor",
      fields: [
        { key: "M_Type", options: ["bldc", "stepper"] },
        { key: "M_PP", step: 1 },
        { key: "M_R", unit: "ohm", step: 0.01 },
        { key: "M_L", unit: "h", step: 0.0001 },
        { key: "M_KV", unit: "kv", step: 1 },
        { key: "M_Dir", readonly: true },
        { key: "ZEA", unit: "edeg", readonly: true },
      ],
    },
    {
      key: "limits",
      fields: [
        { key: "M_VL", unit: "volt", step: 0.1 },
        { key: "M_CL", unit: "amp", step: 0.01 },
        { key: "M_VLL", unit: "dps", step: 1 },
        { key: "M_CTO", unit: "ms", step: 10 },
        { key: "M_Torq", options: ["voltage", "estCurrent", "dcCurrent", "focCurrent"] },
        { key: "M_Mod", options: ["spwm", "svm", "trap120", "trap150"] },
      ],
    },
    { key: "current", fields: ["C_Kp", "C_Ki", "C_Kd", "C_Lim", "C_Ramp"].map((key) => ({ key, step: 0.001 })) },
    { key: "velocity", fields: ["V_Kp", "V_Ki", "V_Kd", "V_Lim", "V_Ramp"].map((key) => ({ key, step: 0.0001 })) },
    {
      key: "angle",
      fields: [
        { key: "A_Kp", step: 0.1 },
        { key: "A_Lim", unit: "dps", step: 1 },
        { key: "A_Ramp", unit: "dps2", step: 1 },
      ],
    },
    {
      key: "sensor",
      fields: [
        { key: "S_Gain", unit: "vpa", step: 0.001 },
        { key: "S_OffA", unit: "volt", readonly: true },
        { key: "S_OffB", unit: "volt", readonly: true },
        { key: "S_OffC", unit: "volt", readonly: true },
        { key: "S_VTf", unit: "sec", step: 0.001 },
        { key: "S_CTf", unit: "sec", step: 0.0001 },
      ],
    },
  ]
  let open = $state<Record<string, boolean>>({})
  let edits = $state<Record<string, number>>({})
  const read = (key: string) => finite(value[key as keyof typeof value])
  const shown = (key: string) => edits[key] ?? read(key)
  const dirty = $derived(Object.keys(edits).some((key) => edits[key] !== read(key)))
  const save = () => {
    if (!onSave || !dirty) return
    onSave(Object.fromEntries(Object.entries(edits).filter(([key, v]) => v !== read(key))))
    edits = {}
  }
  const fieldName = (f: Field) => `${$T(`widget.foc.field.${f.key}`)}${f.unit ? `, ${$T(`widget.foc.unit.${f.unit}`)}` : ""}`
  const optionText = (f: Field, v: number | undefined) => (v === undefined ? "-" : f.options ? $T(`widget.foc.opt.${f.options[v] ?? v}`) : String(v))
  const sectionSummary = (s: { fields: Field[] }) =>
    s.fields
      .slice(0, 4)
      .map((f) => `${f.key} ${optionText(f, shown(f.key))}`)
      .join(" · ")

  /* Автонастройка: полоса TuneHz правится рядом с кнопкой */
  let tuneHz = $state<number | undefined>(undefined)
  const tuneShown = $derived(tuneHz ?? read("TuneHz") ?? 40)
  let tuneWait = $state(false)
  let tuneTimer: ReturnType<typeof setTimeout> | undefined
  onDestroy(() => clearTimeout(tuneTimer))
  const tune = () => {
    if (!onTune) return
    onTune(tuneShown)
    tuneWait = true
    clearTimeout(tuneTimer)
    tuneTimer = setTimeout(() => {
      tuneWait = false
      onRefresh?.()
    }, 2500)
  }
</script>

<div
  class={twMerge("@container relative flex w-full flex-col gap-4 rounded-2xl border border-(--hairline-color) bg-(--container-color) p-4", wrapperClass)}
  style={rootStyle}
>
  <WidgetHeader icon={FOCIcon} label={label?.name || $T("widget.foc.title")} bind:collapsed {hints} />

  {#if !collapsed}
    <div class="flex flex-col gap-4" transition:slide={{ duration: 150 }}>
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div class="flex flex-wrap items-center gap-1.5 text-[12px]" use:hint={{ text: $T("widget.foc.hint.state"), enabled: $hints }}>
          <span class="flex items-center gap-2 text-[13px]">
            <span class="size-2 rounded-full {busy ? 'animate-pulse' : ''}" style="background: {enabled ? 'var(--green-text)' : 'var(--faint-color)'}"></span>
            <span class="font-semibold">{flags === undefined ? "-" : $T(enabled ? "widget.foc.on" : "widget.foc.off")}</span>
          </span>
          {#each chips as chip (chip.key)}
            <span class="rounded-full border border-(--hairline-color) px-2 py-0.5 whitespace-nowrap" style="color: {chip.color}">
              {$T(`widget.foc.flag.${chip.key}`)}
            </span>
          {/each}
        </div>
        {#if onEnable}
          <div use:hint={{ text: $T("widget.foc.hint.enable"), enabled: $hints }}>
            <UI.Button
              wrapperClass="w-32"
              variant="primary"
              content={{ name: $T(enabled ? "widget.foc.disable" : "widget.foc.enable") }}
              disabled={flags === undefined || (busy && !enabled)}
              onClick={() => onEnable(!enabled)}
            />
          </div>
        {/if}
      </div>

      <div class="grid grid-cols-4 gap-1.5" use:hint={{ text: $T("widget.foc.hint.readout"), enabled: $hints }}>
        <SensorReadout label={$T("widget.foc.angle")} value={value.Ang} digits={1} unit="°" />
        <SensorReadout label={$T("widget.foc.speed")} value={value.Vel} digits={0} unit={$T("widget.foc.unit.dps")} />
        <SensorReadout label="Iq" value={value.Iq} digits={3} unit={$T("widget.foc.unit.amp")} />
        <SensorReadout label="Uq" value={value.Uq} digits={2} unit={$T("widget.foc.unit.volt")} />
      </div>

      {#if onZero || onTune}
        <div class="flex flex-wrap items-end justify-end gap-2">
          {#if onZero}
            <div use:hint={{ text: $T("widget.foc.hint.zero"), enabled: $hints }}>
              <UI.Button
                wrapperClass="w-44"
                variant="primary"
                content={{ name: $T("widget.foc.zero") }}
                disabled={!enabled || busy}
                confirm={$T("widget.foc.zero.confirm")}
                onClick={onZero}
              />
            </div>
          {/if}
          {#if onTune}
            <div class="flex items-end gap-2" use:hint={{ text: $T("widget.foc.hint.tune"), enabled: $hints }}>
              <div class="w-28">
                <UI.Input
                  type="number"
                  label={{ name: `${$T("widget.foc.field.TuneHz")}, ${$T("widget.foc.unit.hz")}` }}
                  value={tuneShown}
                  number={{ minNum: 5, maxNum: 60, step: 1 }}
                  disabled={busy || tuneWait}
                  onUpdate={(v) => (tuneHz = Number(v))}
                />
              </div>
              <UI.Button
                wrapperClass="w-44"
                variant="primary"
                content={{ name: $T("widget.foc.tune") }}
                disabled={!enabled || busy || tuneWait}
                confirm={$T("widget.foc.tune.confirm")}
                onClick={tune}
              />
            </div>
          {/if}
        </div>
      {/if}

      {#each SECTIONS as section (section.key)}
        <div class="flex flex-col rounded-[10px] border border-(--hairline-color) bg-(--back-color)">
          <div class="px-3 py-2" use:hint={{ text: $T(`widget.foc.hint.${section.key}`), enabled: $hints }}>
            <SectionHead
              title={$T(`widget.foc.section.${section.key}`)}
              summary={sectionSummary(section)}
              open={!!open[section.key]}
              onToggle={() => (open = { ...open, [section.key]: !open[section.key] })}
            />
          </div>
          {#if open[section.key]}
            <div class="flex flex-wrap items-end gap-x-3 gap-y-2 border-t border-(--hairline-color) p-3">
              {#each section.fields as f (f.key)}
                {#if f.options}
                  <div class="w-full">
                    <UI.Select
                      type="buttons"
                      label={{ name: fieldName(f) }}
                      options={f.options.map((o, i) => ({ id: `${f.key}-${o}`, name: $T(`widget.foc.opt.${o}`), value: i }))}
                      value={shown(f.key)}
                      disabled={!onSave || busy}
                      onUpdate={(v) => (edits = { ...edits, [f.key]: Number(v) })}
                    />
                  </div>
                {:else}
                  <div class="w-36">
                    <UI.Input
                      type="number"
                      label={{ name: fieldName(f) }}
                      value={shown(f.key)}
                      number={{ step: f.step ?? 0.01 }}
                      readonly={f.readonly}
                      disabled={!onSave || busy}
                      onUpdate={(v) => (edits = { ...edits, [f.key]: Number(v) })}
                    />
                  </div>
                {/if}
              {/each}
            </div>
          {/if}
        </div>
      {/each}

      {#if onSave}
        <div class="flex flex-col items-center gap-2">
          <span class="text-[12px] text-(--muted-color) {dirty ? '' : 'invisible'}">{$T("widget.common.unsaved")}</span>
          <div class="flex w-full max-w-96 flex-wrap gap-2">
            {#if onDefaults}
              <UI.Button
                wrapperClass="min-w-fit flex-1"
                componentClass="px-2 whitespace-nowrap"
                variant="primary"
                accent="red"
                content={{ name: $T("widget.foc.defaults") }}
                disabled={busy}
                confirm={$T("widget.foc.defaults.confirm")}
                onClick={() => {
                  edits = {}
                  onDefaults()
                }}
              />
            {/if}
            <UI.Button
              wrapperClass="min-w-fit flex-1"
              componentClass="px-2 whitespace-nowrap"
              content={{ name: $T("widget.common.cancel") }}
              disabled={!dirty}
              onClick={() => (edits = {})}
            />
            <UI.Button
              wrapperClass="min-w-fit flex-1"
              componentClass="px-2 whitespace-nowrap"
              variant="primary"
              content={{ name: $T("widget.common.save") }}
              disabled={!dirty || busy}
              onClick={save}
            />
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>
