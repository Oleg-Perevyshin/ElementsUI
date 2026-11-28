<!-- $lib/WidgetFOC/WidgetFOC.svelte - смарт-виджет векторного управления мотором (foc_control любого привода): состояние оси, включение, калибровка нуля, автонастройка, настройки мотора, пределов, режимов, регуляторов и датчика тока. Договор с прошивкой - ключи группы (FOC); всё в градусах. Ничего не знает про транспорт - value/onEnable/onZero/onTune/onSave/onDefaults/onRefresh -->
<script lang="ts">
  import { onDestroy, untrack, type Snippet } from "svelte"
  import { slide } from "svelte/transition"
  import { twMerge } from "tailwind-merge"
  import * as UI from ".."
  import { Language, T } from "../locales/i18n"
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

  const guiCollapsed = untrack(() => collapsed)
  collapsed = readPersistedCollapsed(
    untrack(() => persistKey),
    guiCollapsed,
  )
  $effect(() => writePersistedCollapsed(persistKey, collapsed, guiCollapsed))

  $effect(() => {
    if (collapsed || !refreshMs || !onRefresh) return
    const timer = setInterval(() => onRefresh?.(), refreshMs)
    return () => clearInterval(timer)
  })

  const finite = (v: unknown) => (v === undefined || v === null || v === "" || !Number.isFinite(Number(v)) ? undefined : Number(v))

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

  type Field = { key: string; unit?: string; options?: string[]; readonly?: boolean; step?: number; torqueModes?: number[] }

  const motorFields: Field[] = [
    { key: "M_Type", options: ["bldc", "stepper"] },
    { key: "M_PP", step: 1 },
    { key: "M_R", unit: "ohm", step: 0.01 },
    { key: "M_L", unit: "h", step: 0.0001 },
    { key: "M_KV", unit: "kv", step: 1 },
    { key: "M_Dir", readonly: true },
  ]

  const limitsFields: Field[] = [
    { key: "M_VL", unit: "volt", step: 0.1 },
    { key: "M_CL", unit: "amp", step: 0.01, torqueModes: [1, 2, 3] },
    { key: "M_VLL", unit: "dps", step: 1 },
    { key: "M_CTO", unit: "ms", step: 10 },
    { key: "M_Torq", options: ["voltage", "estCurrent", "dcCurrent", "focCurrent"] },
    { key: "M_Mod", options: ["spwm", "svm", "trap120", "trap150"] },
  ]

  const currentFields: Field[] = [
    { key: "C_Kp", step: 0.001, torqueModes: [2, 3] },
    { key: "C_Ki", step: 0.001, torqueModes: [2, 3] },
    { key: "C_Kd", step: 0.001, torqueModes: [2, 3] },
    { key: "C_Lim", unit: "volt", step: 0.1, torqueModes: [2, 3] },
    { key: "C_Ramp", unit: "vps", step: 0.001, torqueModes: [2, 3] },
  ]

  const velocityFields: Field[] = [
    { key: "V_Kp", step: 0.0001 },
    { key: "V_Ki", step: 0.0001 },
    { key: "V_Kd", step: 0.0001 },
    { key: "V_Lim", readonly: true },
    { key: "V_Ramp", step: 0.0001 },
  ]

  const angleFields: Field[] = [
    { key: "A_Kp", step: 0.1 },
    { key: "A_Lim", unit: "dps", step: 1 },
    { key: "A_Ramp", unit: "dps2", step: 1 },
  ]

  const sensorFields: Field[] = [
    { key: "S_Gain", unit: "vpa", step: 0.001 },
    { key: "S_OffA", unit: "volt", readonly: true },
    { key: "S_OffB", unit: "volt", readonly: true },
    { key: "S_OffC", unit: "volt", readonly: true },
    { key: "S_VTf", unit: "sec", step: 0.001 },
    { key: "S_CTf", unit: "sec", step: 0.0001 },
  ]

  const allFields = [...motorFields, ...limitsFields, ...currentFields, ...velocityFields, ...angleFields, ...sensorFields]

  let open = $state<Record<string, boolean>>({})
  let edits = $state<Record<string, number>>({})
  const read = (key: string) => finite(value[key as keyof typeof value])

  const polePairs = $derived(read("M_PP") ?? 0)
  const zeroTravel = $derived(
    Number.isInteger(polePairs) && polePairs > 0
      ? $T("widget.foc.zero.travel", { degrees: (270 / polePairs).toLocaleString($Language, { maximumFractionDigits: 1 }) })
      : $T("widget.foc.zero.travel.unknown"),
  )

  const torqueMode = $derived(edits.M_Torq ?? read("M_Torq"))
  const motorType = $derived(edits.M_Type ?? read("M_Type"))
  const usesCurrentLoop = $derived(torqueMode === undefined || torqueMode === 2 || torqueMode === 3)

  const available = (f: Field) => (f.key === "M_Mod" ? motorType !== 1 : !f.torqueModes || torqueMode === undefined || f.torqueModes.includes(torqueMode))
  const shown = (f: Field) => (available(f) ? edits[f.key] : undefined) ?? read(f.key)

  const fieldName = (f: Field) => {
    const reportedMode = read("M_Torq")
    const unit =
      f.key === "V_Lim" && reportedMode !== undefined
        ? reportedMode === 0
          ? "volt"
          : "amp"
        : f.key === "V_Ramp" && torqueMode !== undefined
          ? torqueMode === 0
            ? "vps"
            : "aps"
          : f.unit
    return `${$T(`widget.foc.field.${f.key}`)}${unit ? `, ${$T(`widget.foc.unit.${unit}`)}` : ""}`
  }
  const optionText = (f: Field, v: number | undefined) => (v === undefined ? "-" : f.options ? $T(`widget.foc.opt.${f.options[v] ?? v}`) : String(v))

  const summaryOf = (fields: Field[]) =>
    fields
      .filter(available)
      .slice(0, 4)
      .map((f) => `${f.key} ${optionText(f, shown(f))}`)
      .join(" · ")

  const dirty = $derived(Object.keys(edits).some((key) => edits[key] !== read(key)))
  const changedEntries = $derived(
    Object.entries(edits)
      .filter(([k, v]) => v !== read(k))
      .filter(([k]) => {
        const f = allFields.find((x) => x.key === k)
        return !!f && !f.readonly && available(f)
      }),
  )
  const save = () => {
    if (!onSave || busy || !changedEntries.length) return
    onSave(Object.fromEntries(changedEntries))
    edits = {}
  }

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

  const hasCurrentSensor = $derived(value.IA !== undefined && value.IB !== undefined && value.IC !== undefined)
</script>

{#snippet fieldCell(title: string, samples: string[], inset: string, content: Snippet)}
  <div class="max-w-full min-w-0 flex-[1_1_max-content]">
    <div class="pointer-events-none invisible h-0 overflow-hidden whitespace-nowrap" aria-hidden="true">
      <div class="text-[12px] font-semibold">{title}</div>
      {#each samples as sample (sample)}
        <div class="text-[14px]" style:padding-inline={inset}>{sample}</div>
      {/each}
    </div>
    <div class="contain-[inline-size]">
      {@render content()}
    </div>
  </div>
{/snippet}

{#snippet numberField(f: Field)}
  {@render fieldCell(fieldName(f), [String(shown(f) ?? "0")], "1.5rem", input)}
  {#snippet input()}
    <UI.Input
      type="number"
      label={{ name: fieldName(f) }}
      value={shown(f)}
      number={{ step: f.step ?? 0.01 }}
      readonly={f.readonly}
      disabled={!onSave || busy}
      onUpdate={(v) => (edits = { ...edits, [f.key]: Number(v) })}
    />
  {/snippet}
{/snippet}

{#snippet selectField(f: Field)}
  {@const options = f.options!.map((o, i) => ({ id: `${f.key}-${o}`, name: $T(`widget.foc.opt.${o}`), value: i }))}
  {@render fieldCell(
    fieldName(f),
    options.map(({ name }) => name),
    "1.5rem",
    select,
  )}
  {#snippet select()}
    <UI.Select
      type="buttons"
      label={{ name: fieldName(f) }}
      {options}
      value={shown(f)}
      disabled={!onSave || busy}
      onUpdate={(v) => (edits = { ...edits, [f.key]: Number(v) })}
    />
  {/snippet}
{/snippet}

{#snippet field(f: Field)}
  {#if available(f)}
    {#if f.options}
      {@render selectField(f)}
    {:else}
      {@render numberField(f)}
    {/if}
  {/if}
{/snippet}

{#snippet section(key: string, fields: Field[], children?: Snippet)}
  <div class="flex flex-col rounded-[10px] border border-(--hairline-color) bg-(--back-color)">
    <div class="px-3 py-2" use:hint={{ text: $T(`widget.foc.hint.${key}`), enabled: $hints }}>
      <SectionHead
        title={$T(`widget.foc.section.${key}`)}
        summary={summaryOf(fields)}
        open={!!open[key]}
        onToggle={() => (open = { ...open, [key]: !open[key] })}
      />
    </div>
    {#if open[key]}
      <div class="flex flex-wrap items-end gap-x-3 gap-y-2 border-t border-(--hairline-color) p-3">
        {#each fields as f (f.key)}
          {@render field(f)}
        {/each}
        {#if children}
          {@render children()}
        {/if}
      </div>
    {/if}
  </div>
{/snippet}

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
        {#if onTune}
          {@const tuneLabel = `${$T("widget.foc.field.TuneHz")}, ${$T("widget.foc.unit.hz")}`}
          <div class="flex flex-wrap items-center gap-2" use:hint={{ text: $T("widget.foc.hint.tune"), enabled: $hints }}>
            <div class="flex-shrink-0">
              {@render fieldCell(tuneLabel, [String(tuneShown)], "1.5rem", bandwidth)}
            </div>
            {#snippet bandwidth()}
              <UI.Input
                wrapperClass="w-24"
                type="number"
                label={{ name: tuneLabel }}
                value={tuneShown}
                number={{ minNum: 5, maxNum: 60, step: 1 }}
                disabled={busy || tuneWait}
                onUpdate={(v) => (tuneHz = Number(v))}
              />
            {/snippet}
            <UI.Button
              wrapperClass="w-40"
              variant="primary"
              content={{ name: $T("widget.foc.tune") }}
              disabled={!enabled || busy || tuneWait}
              confirm={$T("widget.foc.tune.confirm")}
              onClick={tune}
            />
          </div>
        {/if}
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

      <div class="grid grid-cols-2 gap-1.5 @[340px]:grid-cols-4" use:hint={{ text: $T("widget.foc.hint.readout"), enabled: $hints }}>
        <SensorReadout label={$T("widget.foc.angle")} value={value.Ang} digits={1} unit="°" />
        <SensorReadout label={$T("widget.foc.speed")} value={value.Vel} digits={0} unit={$T("widget.foc.unit.dps")} />
        <SensorReadout label="Iq" value={value.Iq} digits={3} unit={$T("widget.foc.unit.amp")} />
        <SensorReadout label="Uq" value={value.Uq} digits={2} unit={$T("widget.foc.unit.volt")} />
      </div>

      {#if hasCurrentSensor}
        <div class="grid grid-cols-3 gap-1.5" use:hint={{ text: $T("widget.foc.hint.phaseCurrents"), enabled: $hints }}>
          <SensorReadout label="IA" value={value.IA} digits={3} unit={$T("widget.foc.unit.amp")} />
          <SensorReadout label="IB" value={value.IB} digits={3} unit={$T("widget.foc.unit.amp")} />
          <SensorReadout label="IC" value={value.IC} digits={3} unit={$T("widget.foc.unit.amp")} />
        </div>
      {/if}

      {#snippet motorExtra()}
        <div class="flex max-w-full min-w-0 flex-[0_1_max-content] flex-wrap items-end gap-x-3 gap-y-2">
          {@render numberField({ key: "ZEA", unit: "edeg", readonly: true })}
          {#if onZero}
            <div use:hint={{ text: $T("widget.foc.hint.zero"), enabled: $hints }}>
              <UI.Button
                wrapperClass="w-auto"
                componentClass="px-3 whitespace-nowrap"
                variant="primary"
                content={{ name: $T("widget.foc.zero") }}
                disabled={!enabled || busy}
                confirm={`${$T("widget.foc.zero.confirm")}\n\n${zeroTravel}`}
                onClick={onZero}
              />
            </div>
          {/if}
        </div>
      {/snippet}

      {@render section("motor", motorFields, motorExtra)}
      {@render section("limits", limitsFields)}
      {#if usesCurrentLoop}
        {@render section("current", currentFields)}
      {/if}
      {@render section("velocity", velocityFields)}
      {@render section("angle", angleFields)}
      {@render section("sensor", sensorFields)}

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
              disabled={!changedEntries.length || busy}
              onClick={save}
            />
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>
