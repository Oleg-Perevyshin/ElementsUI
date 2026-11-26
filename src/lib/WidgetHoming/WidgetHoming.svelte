<!-- $lib/WidgetHoming/WidgetHoming.svelte - смарт-виджет базы оси любого привода: способ поиска, состояние, края и положение вала на полосе, кнопки «Найти базу» и «Домой», настройки способа. Договор с прошивкой - ключи группы (HOME): Type, St, Err, Found, Lo, Hi, Pos, Off, Speed, Marg и ключи способа (Force, Lag). Ничего не знает про транспорт - value/onSearch/onHome/onSave/onRefresh -->
<script lang="ts">
  import { onDestroy, untrack } from "svelte"
  import { slide } from "svelte/transition"
  import { twMerge } from "tailwind-merge"
  import * as UI from ".."
  import { T, Language } from "../locales/i18n"
  import type { IWidgetHomingProps } from "../types"
  import WidgetHeader from "../WidgetHeader.svelte"
  import SensorReadout from "../SensorReadout.svelte"
  import SectionHead from "../SectionHead.svelte"
  import HomingIcon from "./HomingIcon.svelte"
  import { hint, hintsSetting } from "../hints"
  import { accentStyle } from "../accent"
  import { readPersistedCollapsed, writePersistedCollapsed } from "../widgetCollapse"
  import { formatDeviceMessage } from "../protocols/messages"
  import type { LanguageCode } from "../locales/languages"

  let {
    wrapperClass = "",
    accent,
    label = {},
    value = {},
    searchMs = 120000,
    collapsed = $bindable(false),
    persistKey,
    onSearch,
    onHome,
    onSave,
    onRefresh,
  }: IWidgetHomingProps = $props()

  const hints = $derived(hintsSetting("WidgetHoming", persistKey))
  const rootStyle = $derived(accentStyle(accent))

  /* Свёрнутость: выбор пользователя переживает перезагрузку (persistKey) */
  const guiCollapsed = untrack(() => collapsed)
  collapsed = readPersistedCollapsed(
    untrack(() => persistKey),
    guiCollapsed,
  )
  $effect(() => writePersistedCollapsed(persistKey, collapsed, guiCollapsed))

  const finite = (v: unknown) => (v === undefined || v === null || v === "" || !Number.isFinite(Number(v)) ? undefined : Number(v))
  const norm360 = (a: number) => ((a % 360) + 360) % 360

  /* Способ поиска (Type) и его свои ключи; неизвестный способ - только общие ключи */
  const TYPES: Record<number, { key: string; fields: { key: "Force" | "Lag"; unit: string; min: number; max: number; step: number }[] }> = {
    0: { key: "none", fields: [] },
    1: {
      key: "stall",
      fields: [
        { key: "Force", unit: "pct", min: 5, max: 100, step: 5 },
        { key: "Lag", unit: "deg", min: 0.5, max: 10, step: 0.1 },
      ],
    },
  }
  const type = $derived(finite(value.Type))
  const method = $derived(type === undefined ? undefined : (TYPES[type] ?? { key: "other", fields: [] }))
  const hasBase = $derived(type !== undefined && type !== 0)

  /* Состояние поиска: 0 не искали, 1 идёт, 2 найдена, 3 отказ (код - Err) */
  const STATES = [
    { key: "idle", color: "var(--faint-color)" },
    { key: "search", color: "var(--purple-text)" },
    { key: "done", color: "var(--green-text)" },
    { key: "failed", color: "var(--red-text)" },
  ]
  const st = $derived(finite(value.St))
  const found = $derived(finite(value.Found) === 1)
  const stInfo = $derived(st === undefined ? undefined : STATES[st])
  /* Причина отказа: известные коды поиска - короткий текст без чисел (параметров у Err нет), прочие - текст словаря сообщений */
  const ERR_KEYS: Record<number, string> = { 2070: "noStop", 2071: "range", 2072: "aborted", 9: "state" }
  const errCode = $derived(finite(value.Err))
  const errText = $derived(
    st !== 3 || !errCode
      ? undefined
      : ERR_KEYS[errCode]
        ? $T(`widget.home.err.${ERR_KEYS[errCode]}`)
        : formatDeviceMessage(errCode, [], $Language as LanguageCode)?.text,
  )

  /* Края и положение: углы датчика, разрешённый ход - от Lo в плюс до Hi */
  const lo = $derived(finite(value.Lo))
  const hi = $derived(finite(value.Hi))
  const pos = $derived(finite(value.Pos))
  const width = $derived(found && lo !== undefined && hi !== undefined ? norm360(hi - lo) : undefined)
  /* Доля хода 0..1 для угла датчика; за краем - ближний край, outside = true */
  const along = (a: number | undefined) => {
    if (a === undefined || width === undefined || lo === undefined || width <= 0) return undefined
    let p = norm360(a - lo)
    if (p > width + (360 - width) / 2) p -= 360
    return { at: Math.min(1, Math.max(0, p / width)), outside: p < 0 || p > width }
  }
  const posAt = $derived(along(pos))
  const homeAt = $derived(width === undefined ? undefined : Math.min(1, Math.max(0, 0.5 + (finite(value.Off) ?? 0) / width)))
  const margAt = $derived(width === undefined || !width ? 0 : Math.min(0.5, (finite(value.Marg) ?? 0) / width))

  /* Поиск: виджет раз в секунду перечитывает группу, пока прошивка не выйдет из состояния «идёт», не дольше searchMs */
  let searching = $state(false)
  let poll: ReturnType<typeof setInterval> | undefined
  let started = 0
  const stopPoll = () => {
    clearInterval(poll)
    poll = undefined
    searching = false
  }
  onDestroy(stopPoll)
  $effect(() => {
    if (searching && st !== undefined && st !== 1 && Date.now() - started > 1500) stopPoll()
  })
  const search = () => {
    if (!onSearch) return
    onSearch()
    searching = true
    started = Date.now()
    clearInterval(poll)
    poll = setInterval(() => {
      if (Date.now() - started > searchMs) stopPoll()
      onRefresh?.()
    }, 1000)
  }
  const busy = $derived(searching || st === 1)

  /* Настройки: общие и способа; правка локальная до «Сохранить» */
  const COMMON = [
    { key: "Off", unit: "deg", min: -360, max: 360, step: 0.5 },
    { key: "Speed", unit: "dps", min: 2, max: 180, step: 1 },
    { key: "Marg", unit: "deg", min: 0, max: 30, step: 0.5 },
  ] as const
  const settingFields = $derived([...COMMON, ...(method?.fields ?? [])])
  let edits = $state<Record<string, number>>({})
  let settingsOpen = $state(false)
  const shown = (key: string) => edits[key] ?? finite(value[key as keyof typeof value])
  const dirty = $derived(Object.keys(edits).some((key) => edits[key] !== finite(value[key as keyof typeof value])))
  const save = () => {
    if (!onSave || !dirty) return
    onSave(Object.fromEntries(settingFields.map((f) => [f.key, shown(f.key)]).filter(([, v]) => v !== undefined)))
    edits = {}
  }
  const summary = $derived(
    settingFields.map((f) => `${$T(`widget.home.field.${f.key}`)} ${shown(f.key) ?? "-"} ${$T(`widget.home.unit.${f.unit}`)}`).join(" · "),
  )
</script>

<div
  class={twMerge("@container relative flex w-full flex-col gap-4 rounded-2xl border border-(--hairline-color) bg-(--container-color) p-4", wrapperClass)}
  style={rootStyle}
>
  <WidgetHeader icon={HomingIcon} label={label?.name || $T("widget.home.title")} bind:collapsed {hints} />

  {#if !collapsed}
    <div class="flex flex-col gap-4" transition:slide={{ duration: 150 }}>
      <div class="flex flex-wrap items-center justify-between gap-2" use:hint={{ text: $T("widget.home.hint.state"), enabled: $hints }}>
        <span class="flex items-center gap-2 text-[13px]">
          <span
            class="size-2 rounded-full {busy ? 'animate-pulse' : ''}"
            style="background: {busy ? 'var(--purple-text)' : (stInfo?.color ?? 'var(--faint-color)')}"
          ></span>
          <span class="text-(--muted-color)">{method ? $T(`widget.home.type.${method.key}`) : "-"}:</span>
          <span class="font-semibold">{busy ? $T("widget.home.st.search") : stInfo ? $T(`widget.home.st.${stInfo.key}`) : "-"}</span>
        </span>
        <div class="flex flex-wrap gap-2">
          {#if onHome}
            <div use:hint={{ text: $T("widget.home.hint.home"), enabled: $hints }}>
              <UI.Button wrapperClass="w-32" variant="secondary" content={{ name: $T("widget.home.goHome") }} disabled={busy} onClick={onHome} />
            </div>
          {/if}
          {#if onSearch && hasBase}
            <div use:hint={{ text: $T("widget.home.hint.search"), enabled: $hints }}>
              <UI.Button
                wrapperClass="w-40"
                variant="primary"
                content={{ name: $T("widget.home.search") }}
                disabled={busy}
                confirm={$T(`widget.home.search.confirm.${method?.key === "stall" ? "stall" : "other"}`)}
                onClick={search}
              />
            </div>
          {/if}
        </div>
      </div>
      {#if errText}
        <span class="text-[12px] text-(--red-text)">{errText}</span>
      {/if}

      {#if hasBase}
        <div class="flex flex-col gap-1.5" use:hint={{ text: $T("widget.home.hint.range"), enabled: $hints }}>
          {#if width !== undefined}
            <div class="relative h-3 w-full rounded-full bg-(--back-color)">
              <div class="absolute inset-y-0 rounded-full bg-(--green-text) opacity-25" style="left: {margAt * 100}%; right: {margAt * 100}%"></div>
              {#if homeAt !== undefined}
                <div
                  class="absolute -inset-y-1 w-0.5 -translate-x-1/2 bg-(--blue-text)"
                  style="left: {homeAt * 100}%"
                  title={$T("widget.home.homePoint")}
                ></div>
              {/if}
              {#if posAt}
                <div
                  class="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-(--container-color)"
                  style="left: {posAt.at * 100}%; background: {posAt.outside ? 'var(--red-text)' : 'var(--font-color)'}"
                ></div>
              {/if}
            </div>
          {/if}
          <div class="grid grid-cols-4 gap-1.5">
            <SensorReadout label={$T("widget.home.lo")} value={found ? lo : undefined} digits={1} unit="°" />
            <SensorReadout label={$T("widget.home.hi")} value={found ? hi : undefined} digits={1} unit="°" />
            <SensorReadout label={$T("widget.home.range")} value={width} digits={1} unit="°" />
            <SensorReadout label={$T("widget.home.pos")} value={pos} digits={1} unit="°" />
          </div>
        </div>
      {/if}

      <div class="flex flex-col rounded-[10px] border border-(--hairline-color) bg-(--back-color)">
        <div class="px-3 py-2" use:hint={{ text: $T("widget.home.hint.settings"), enabled: $hints }}>
          <SectionHead title={$T("widget.home.settings")} {summary} bind:open={settingsOpen} />
        </div>
        {#if settingsOpen}
          <div class="flex flex-col gap-3 border-t border-(--hairline-color) p-3">
            <div class="flex flex-wrap items-end gap-x-3 gap-y-2">
              {#each settingFields as f (f.key)}
                <div class="min-w-24 flex-1">
                  <UI.Input
                    type="number"
                    label={{ name: `${$T(`widget.home.field.${f.key}`)}, ${$T(`widget.home.unit.${f.unit}`)}` }}
                    value={shown(f.key)}
                    number={{ minNum: f.min, maxNum: f.max, step: f.step }}
                    disabled={!onSave || busy}
                    onUpdate={(v) => (edits = { ...edits, [f.key]: Number(v) })}
                  />
                </div>
              {/each}
            </div>
            {#if onSave}
              <div class="flex flex-col items-center gap-2">
                <span class="text-[12px] text-(--muted-color) {dirty ? '' : 'invisible'}">{$T("widget.common.unsaved")}</span>
                <div class="flex w-full max-w-80 flex-wrap gap-2">
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
    </div>
  {/if}
</div>
