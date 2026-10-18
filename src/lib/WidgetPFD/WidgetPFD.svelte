<!-- $lib/WidgetPFD/WidgetPFD.svelte — смарт-виджет «Пилотажный дисплей» (Primary Flight Display).
     Поля группы (по умолчанию MAV) — телеметрия автопилота MAVLink (см. IWidgetPFDData): авиагоризонт,
     ленты скорости/высоты/курса, строка состояния, цветовые зоны по границам (limits). Только отображение:
     ничего не отправляет и не знает про DeviceStore/WebSocket. Между пакетами ориентация сглаживается (Tween),
     устаревшие данные закрываются флагом «нет данных». В узкой ячейке ленты заменяются числами. -->
<script lang="ts">
  import { T } from "$lib/locales/i18n"
  import { untrack } from "svelte"
  import { slide } from "svelte/transition"
  import { Tween } from "svelte/motion"
  import { cubicOut } from "svelte/easing"
  import { twMerge } from "tailwind-merge"
  import type { IWidgetPFDProps } from "../types"
  import PlaneIcon from "./PlaneIcon.svelte"
  import WidgetHeader from "../WidgetHeader.svelte"
  import { hintsSetting } from "../hints"
  import { widgetAccentStyle } from "../widgetAccent"
  import { readPersistedCollapsed, writePersistedCollapsed } from "../widgetCollapse"

  let { wrapperClass = "", componentClass = "", label = {}, value, limits, collapsed = $bindable(false), persistKey }: IWidgetPFDProps = $props()

  let accentStyle = $derived(widgetAccentStyle(componentClass ?? ""))

  /* Сворачивание тела по клику на шапку — как у остальных смарт-виджетов (см. WidgetWiFi.svelte) */
  let hasMergedPersisted = false
  $effect(() => {
    if (hasMergedPersisted) return
    hasMergedPersisted = true
    const persisted = readPersistedCollapsed(persistKey, collapsed)
    if (persisted !== collapsed) collapsed = persisted
  })
  $effect(() => writePersistedCollapsed(persistKey, collapsed))

  const num = (v: unknown, fallback = 0) => (typeof v === "number" && Number.isFinite(v) ? v : fallback)
  const wrap360 = (deg: number) => ((deg % 360) + 360) % 360
  const toRad = (deg: number) => (deg * Math.PI) / 180

  /* Плавность: ориентация и курс приходят ~20 Гц, между пакетами — короткая интерполяция */
  const roll = new Tween(0, { duration: 120, easing: cubicOut })
  const pitch = new Tween(0, { duration: 120, easing: cubicOut })
  const heading = new Tween(0, { duration: 120, easing: cubicOut })
  let lastUpdate = $state(0)
  let now = $state(Date.now())
  $effect(() => {
    const r = value?.Roll
    const p = value?.Pitch
    const h = value?.Heading
    if (r === undefined && p === undefined && h === undefined) return
    roll.target = num(r)
    pitch.target = num(p)
    /* Курс без скачка через 0/360: цель — ближайшая к текущему значению */
    const current = heading.target
    const delta = ((wrap360(num(h)) - wrap360(current) + 540) % 360) - 180
    heading.target = current + delta
    lastUpdate = Date.now()
  })
  $effect(() => {
    const timer = setInterval(() => (now = Date.now()), 250)
    return () => clearInterval(timer)
  })
  let staleMs = $derived(limits?.staleMs ?? 2000)
  let age = $derived(lastUpdate ? Math.max(0, now - lastUpdate) / 1000 : Infinity)
  let stale = $derived(age * 1000 > staleMs)

  /* Значения с устройства */
  let gs = $derived(num(value?.GSpeed))
  let as = $derived(num(value?.ASpeed))
  let climb = $derived(num(value?.Climb))
  let alt = $derived(num(value?.Alt))
  let altMsl = $derived(num(value?.AltMSL))
  let lat = $derived(num(value?.Lat))
  let lon = $derived(num(value?.Lon))
  let track = $derived(Math.hypot(num(value?.Vx), num(value?.Vy)) > 0.5 ? wrap360((Math.atan2(num(value?.Vy), num(value?.Vx)) * 180) / Math.PI) : null)

  /* Точка взлёта: расстояние (гаверсинус) и пеленг */
  let home = $derived.by(() => {
    const hl = num(value?.HomeLat)
    const ho = num(value?.HomeLon)
    if (!hl || !ho || !lat || !lon) return null
    const dLat = toRad(hl - lat)
    const dLon = toRad(ho - lon)
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat)) * Math.cos(toRad(hl)) * Math.sin(dLon / 2) ** 2
    const distance = 2 * 6371000 * Math.asin(Math.sqrt(a))
    const y = Math.sin(dLon) * Math.cos(toRad(hl))
    const x = Math.cos(toRad(lat)) * Math.sin(toRad(hl)) - Math.sin(toRad(lat)) * Math.cos(toRad(hl)) * Math.cos(dLon)
    return { distance, bearing: wrap360((Math.atan2(y, x) * 180) / Math.PI) }
  })

  /* Строка состояния */
  let FIX = $derived([$T("pfd.fix.none"), $T("pfd.fix.none"), "2D", "3D", "DGPS", "RTK float", "RTK fix"])
  const COPTER_MODES: Record<number, string> = {
    0: "STABILIZE",
    1: "ACRO",
    2: "ALT HOLD",
    3: "AUTO",
    4: "GUIDED",
    5: "LOITER",
    6: "RTL",
    7: "CIRCLE",
    9: "LAND",
    11: "DRIFT",
    13: "SPORT",
    15: "AUTOTUNE",
    16: "POSHOLD",
    17: "BRAKE",
    18: "THROW",
    20: "GUIDED NOGPS",
    21: "SMART RTL",
    23: "FOLLOW",
    24: "ZIGZAG",
    27: "AUTO RTL",
  }
  const PLANE_MODES: Record<number, string> = {
    0: "MANUAL",
    1: "CIRCLE",
    2: "STABILIZE",
    3: "TRAINING",
    4: "ACRO",
    5: "FBWA",
    6: "FBWB",
    7: "CRUISE",
    8: "AUTOTUNE",
    10: "AUTO",
    11: "RTL",
    12: "LOITER",
    13: "TAKEOFF",
    15: "GUIDED",
    17: "QSTABILIZE",
    18: "QHOVER",
    19: "QLOITER",
    20: "QLAND",
    21: "QRTL",
    22: "QAUTOTUNE",
    23: "QACRO",
    24: "THERMAL",
  }
  const ROVER_MODES: Record<number, string> = {
    0: "MANUAL",
    1: "ACRO",
    3: "STEERING",
    4: "HOLD",
    5: "LOITER",
    6: "FOLLOW",
    7: "SIMPLE",
    10: "AUTO",
    11: "RTL",
    12: "SMART RTL",
    15: "GUIDED",
  }
  let modeName = $derived.by(() => {
    if (value?.Mode === undefined) return "—"
    const vtype = num(value?.VType)
    const mode = num(value?.Mode)
    const table = vtype === 1 || (vtype >= 19 && vtype <= 25) ? PLANE_MODES : vtype === 10 || vtype === 11 ? ROVER_MODES : COPTER_MODES
    return table[mode] ?? `MODE ${mode}`
  })
  let armed = $derived(num(value?.Armed) === 1)
  let fix = $derived(num(value?.Fix))
  let battRem = $derived(num(value?.BRem, -1))
  let battLow = $derived(limits?.battLow !== undefined && battRem >= 0 && battRem <= limits.battLow)
  let battCurrent = $derived(num(value?.BC, -1))

  /* Навигация к точке маршрута: метки целей на лентах (flight director); нет маршрута — меток нет */
  let wpNum = $derived(num(value?.WPNum))
  let wp = $derived(
    wpNum > 0
      ? {
          num: wpNum,
          dist: num(value?.WPDist),
          bearing: wrap360(num(value?.WPBrg)),
          altTarget: alt + num(value?.AltErr),
          spdErr: num(value?.SpdErr),
          xte: num(value?.XTE),
        }
      : null,
  )

  /* Связь, точность GPS, исправность навигации */
  let rssi = $derived(num(value?.RSSI, -1))
  let remRssi = $derived(num(value?.RemRSSI, -1))
  let drop = $derived(num(value?.Drop, -1))
  let hdop = $derived(num(value?.HDOP, -1))
  let sensErr = $derived(num(value?.SensErr))
  let ekf = $derived(num(value?.EKF, -1))
  /* Пороги дисперсии EKF — как в Mission Planner: от 0.5 внимание, от 0.8 тревога; неисправный датчик — тревога */
  let navState: "ok" | "warn" | "bad" | "none" = $derived(sensErr > 0 || ekf >= 0.8 ? "bad" : ekf >= 0.5 ? "warn" : ekf >= 0 ? "ok" : "none")
  const NAV_COLOR = { ok: "var(--green-color)", warn: "var(--orange-color)", bad: "var(--red-color)", none: "var(--faint-color)" }

  /* Сообщения автопилота (STATUSTEXT): новое — по смене MsgSeq, последнее висит 10 с, история из 5 — в подсказке */
  let SEVERITY = $derived(Array.from({ length: 8 }, (_, i) => $T(`pfd.sev.${i}`)))
  let messages: { text: string; sev: number; at: number }[] = $state([])
  let lastSeq = -1
  $effect(() => {
    const seq = value?.MsgSeq
    const text = value?.Msg
    if (seq === undefined || seq === lastSeq || !text) return
    lastSeq = seq
    untrack(() => (messages = [{ text, sev: num(value?.MsgSev, 6), at: Date.now() }, ...messages].slice(0, 5)))
  })
  let banner = $derived(messages[0] && now - messages[0].at < 10_000 ? messages[0] : null)
  const sevClass = (sev: number) => (sev <= 3 ? "bg-(--red-color) text-white" : sev === 4 ? "bg-(--orange-color) text-white" : "bg-black/70 text-white")
  const clampTape = (y: number) => Math.min(Math.max(y, 22), HH - 8)

  /* Компактный режим — ленты заменяются числами поверх горизонта */
  let width = $state(600)
  let compact = $derived(width < 440)

  /* Геометрия прибора (viewBox 600×320) */
  const VW = 600
  const HH = 270
  let HX = $derived(compact ? 0 : 80)
  let HW = $derived(compact ? VW : 440)
  let CX = $derived(HX + HW / 2)
  const CY = HH / 2
  const PPD = 4 /* пикселей на градус тангажа */
  const SPEED_PPU = 6 /* пикселей на 1 м/с */
  const ALT_PPU = 3 /* пикселей на 1 м */
  const HDG_PPD = 4 /* пикселей на градус курса */

  const pitchLadder = Array.from({ length: 37 }, (_, i) => (i - 18) * 5).filter((d) => d !== 0)
  const ROLL_TICKS = [-60, -45, -30, -20, -10, 0, 10, 20, 30, 45, 60]
  const ROLL_R = 110

  const arcPoint = (deg: number, r: number) => ({ x: CX + r * Math.sin(toRad(deg)), y: CY - r * Math.cos(toRad(deg)) })
  const arcPath = (from: number, to: number, r: number) => {
    const a = arcPoint(from, r)
    const b = arcPoint(to, r)
    return `M ${a.x} ${a.y} A ${r} ${r} 0 0 1 ${b.x} ${b.y}`
  }

  const speedTicks = $derived(Array.from({ length: 41 }, (_, i) => Math.floor(gs) - 20 + i).filter((v) => v >= 0))
  const altTicks = $derived(Array.from({ length: 19 }, (_, i) => Math.floor(alt / 5) * 5 - 45 + i * 5))
  const hdgTicks = $derived(Array.from({ length: 29 }, (_, i) => Math.floor(heading.current / 5) * 5 - 70 + i * 5))
  const hdgLabel = (deg: number) => ({ 0: "N", 90: "E", 180: "S", 270: "W" })[wrap360(deg)] ?? String(wrap360(deg)).padStart(3, "0")
  const hdgOffset = (deg: number) => (((deg - heading.current + 540) % 360) - 180) * HDG_PPD

  /* Вариометр: ±5 м/с на всю полувысоту полосы */
  let vsi = $derived(Math.max(-5, Math.min(5, climb)) * 20)
  /* Уникальные id для clipPath — несколько виджетов на одной странице не должны делить отсечения */
  const uid = crypto.randomUUID().slice(0, 8)

  const fmt = (v: number, digits = 1) => (Number.isFinite(v) ? v.toFixed(digits) : "—")
  const signed = (v: number) => `${v >= 0 ? "+" : ""}${fmt(v)}`

  /* Подсказка: элементы прибора и строк помечены data-tip, текст всегда в одном месте — информационная строка внизу горизонта */
  /* Ключ подсказки элемента под курсором; текст берётся из tips — обновляется вместе с данными */
  let tip: string | null = $state(null)
  /* Подсказки включаются кнопкой «?» в шапке — выбор общий для всех PFD в браузере (hints.ts) */
  const hints = hintsSetting("WidgetPFD")
  $effect(() => {
    if (!$hints) tip = null
  })
  const onTip = (e: PointerEvent) => {
    if (!$hints) return
    const el = (e.target as Element | null)?.closest("[data-tip]")
    tip = el ? (el.getAttribute("data-tip") ?? null) : null
  }
  const fmtDistance = (m: number) => (m >= 1000 ? $T("pfd.u.km", { n: (m / 1000).toFixed(2) }) : $T("pfd.u.m", { n: Math.round(m) }))
  const fmtAge = (s: number) => (Number.isFinite(s) ? $T("pfd.u.s", { n: s.toFixed(1) }) : $T("pfd.no_link"))

  /* Тексты подсказок: первая строка — величина, единица и значение, дальше — что означают знаки, цвета и пороги */
  let battText = $derived(
    [$T("pfd.batt.v", { v: fmt(num(value?.BV)) }), battCurrent >= 0 && $T("pfd.batt.a", { v: fmt(battCurrent) }), battRem >= 0 && `${battRem} %`]
      .filter(Boolean)
      .join(" · "),
  )
  let latLonText = $derived(lat ? `${lat.toFixed(6)}, ${lon.toFixed(6)}` : "—")
  const lines = (...rows: (string | false | null | undefined)[]) => rows.filter(Boolean).join("\n")
  let tips = $derived.by(() => {
    const hdg = Math.round(wrap360(heading.current))
    const homeLine = home ? $T("pfd.distance", { d: fmtDistance(home.distance) }) : null
    return {
      system: lines($T("pfd.system"), $T("pfd.tip.system.armed"), $T("pfd.tip.system.mode"), $T("pfd.tip.system.nav")),
      armed: armed ? lines($T("pfd.tip.armed"), $T("pfd.tip.armed.note")) : lines($T("pfd.tip.disarmed"), $T("pfd.tip.disarmed.note")),
      mode: lines($T("pfd.tip.mode", { mode: modeName }), $T("pfd.tip.mode.note")),
      nav: lines(
        $T("pfd.tip.nav", { state: $T(`pfd.nav.${navState}`) }),
        ekf >= 0 && $T("pfd.tip.nav.ekf", { v: fmt(ekf, 2) }),
        $T("pfd.tip.nav.ok"),
        $T("pfd.tip.nav.warn"),
        $T("pfd.tip.nav.bad"),
        sensErr > 0 && $T("pfd.tip.nav.sensors", { n: sensErr }),
      ),
      gps: lines(
        $T("pfd.tip.gps", { fix: FIX[fix] ?? fix, n: num(value?.Sat) }),
        $T("pfd.tip.gps.fix"),
        hdop >= 0 && $T("pfd.tip.gps.hdop", { v: fmt(hdop, 2) }),
        $T("pfd.tip.gps.hdop1"),
        $T("pfd.tip.gps.hdop2"),
        $T("pfd.tip.gps.hdop3"),
      ),
      link: lines(
        $T("pfd.tip.link", { local: rssi >= 0 ? Math.round(rssi) : "—", remote: remRssi >= 0 ? Math.round(remRssi) : "—" }),
        $T("pfd.tip.link.sides"),
        $T("pfd.tip.link.low"),
        drop >= 0 && $T("pfd.tip.link.drop", { v: fmt(drop) }),
      ),
      battery: lines(
        $T("pfd.tip.battery", { value: battText }),
        $T("pfd.tip.battery.v"),
        battCurrent >= 0 && $T("pfd.tip.battery.a"),
        battRem >= 0 && $T("pfd.tip.battery.rem"),
        limits?.battLow !== undefined && $T("pfd.tip.battery.low", { n: limits.battLow }),
      ),
      horizon: lines(
        $T("pfd.tip.horizon"),
        $T("pfd.tip.horizon.roll", { v: signed(roll.current) }),
        $T("pfd.tip.horizon.pitch", { v: signed(pitch.current) }),
        $T("pfd.tip.horizon.colors"),
      ),
      rollPtr: lines(
        $T("pfd.tip.roll", { v: signed(roll.current) }),
        $T("pfd.tip.roll.right"),
        $T("pfd.tip.roll.left"),
        limits?.bankMax !== undefined && $T("pfd.tip.roll.limit", { n: limits.bankMax }),
      ),
      speedTape: lines(
        $T("pfd.tip.gs", { v: fmt(gs) }),
        $T("pfd.tip.gs.note"),
        (limits?.speedMin !== undefined || limits?.speedMax !== undefined) &&
          $T("pfd.tip.speed.range", { min: limits?.speedMin ?? "…", max: limits?.speedMax ?? "…" }),
        wp && $T("pfd.tip.speed.wp"),
      ),
      speedBox: lines($T("pfd.tip.gs", { v: fmt(gs) }), $T("pfd.tip.gs.note")),
      speedLabel: lines($T("pfd.tip.speed.label"), $T("pfd.tip.speed.label.note")),
      speedBug: wp
        ? lines($T("pfd.tip.speed.bug", { n: wp.num, v: fmt(as + wp.spdErr) }), $T("pfd.tip.speed.bug.as", { v: fmt(as) }), $T("pfd.tip.bug.edge"))
        : "",
      altTape: lines(
        $T("pfd.tip.alt", { v: Math.round(alt) }),
        $T("pfd.tip.alt.vs"),
        $T("pfd.tip.alt.up"),
        $T("pfd.tip.alt.down"),
        limits?.altMax !== undefined && $T("pfd.tip.alt.max", { n: limits.altMax }),
        wp && $T("pfd.tip.alt.wp"),
      ),
      altBox: lines($T("pfd.tip.alt", { v: Math.round(alt) }), $T("pfd.tip.alt.msl", { v: Math.round(altMsl) })),
      altLabel: lines($T("pfd.tip.alt.label"), $T("pfd.tip.alt.label.note")),
      altBug: wp
        ? lines(
            $T("pfd.tip.alt.bug", { n: wp.num, v: Math.round(wp.altTarget) }),
            $T("pfd.tip.alt.bug.left", { v: signed(wp.altTarget - alt) }),
            $T("pfd.tip.alt.bug.up"),
            $T("pfd.tip.alt.bug.down"),
          )
        : "",
      compactSpeed: lines($T("pfd.tip.gs", { v: fmt(gs) }), $T("pfd.tip.as", { v: fmt(as) })),
      compactAlt: lines($T("pfd.tip.alt", { v: Math.round(alt) }), $T("pfd.tip.vs", { v: signed(climb) }), $T("pfd.tip.vs.up"), $T("pfd.tip.vs.down")),
      airspeed: lines($T("pfd.tip.as", { v: fmt(as) }), $T("pfd.tip.as.note"), $T("pfd.tip.as.wind"), $T("pfd.tip.as.head"), $T("pfd.tip.as.tail")),
      vs: lines($T("pfd.tip.vs", { v: signed(climb) }), $T("pfd.tip.vs.up"), $T("pfd.tip.vs.down")),
      heading: lines($T("pfd.tip.heading", { v: String(hdg % 360).padStart(3, "0") }), $T("pfd.tip.heading.note"), $T("pfd.tip.heading.dirs")),
      track: track !== null ? lines($T("pfd.tip.track", { v: Math.round(track) }), $T("pfd.tip.track.note"), $T("pfd.tip.track.drift")) : "",
      wpBug: wp ? lines($T("pfd.tip.wp.bearing", { n: wp.num, v: Math.round(wp.bearing) }), $T("pfd.distance", { d: fmtDistance(wp.dist) })) : "",
      homeMark: home ? lines($T("pfd.tip.home.bearing", { v: Math.round(home.bearing) }), homeLine) : "",
      messages: lines($T("pfd.tip.messages", { n: messages.length }), ...messages.map((m) => `${SEVERITY[m.sev] ?? m.sev} — ${m.text}`)),
      route: wp
        ? lines(
            $T("pfd.tip.route", { n: wp.num }),
            $T("pfd.tip.route.dist", { d: fmtDistance(wp.dist) }),
            $T("pfd.tip.route.xte", { d: fmtDistance(Math.abs(wp.xte)) }),
          )
        : "",
      home: home ? lines($T("pfd.tip.home"), homeLine, $T("pfd.tip.home.dir", { v: Math.round(home.bearing) })) : "",
      position: lines($T("pfd.position"), $T("pfd.tip.position.latlon", { v: latLonText }), $T("pfd.tip.position.msl", { v: Math.round(altMsl) })),
      air: lines($T("pfd.air"), $T("pfd.tip.air.press", { v: fmt(num(value?.Press)) }), $T("pfd.tip.air.temp", { v: fmt(num(value?.Temp)) })),
    }
  })
  let tipText = $derived(tip ? (tips as Record<string, string>)[tip] || null : null)
  let infoText = $derived(tipText ?? (banner ? `${SEVERITY[banner.sev] ?? ""} · ${banner.text}` : null))
</script>

<div
  class={twMerge("relative flex w-full flex-col gap-4 rounded-2xl border border-(--hairline-color) bg-(--container-color) p-4", wrapperClass)}
  style={accentStyle}
>
  <WidgetHeader icon={PlaneIcon} label={label?.name || $T("pfd.title")} bind:collapsed {hints}>
    {#snippet right()}
      <div class="flex items-center gap-4">
        <span class="text-[12px] font-semibold tabular-nums {stale ? 'text-(--red-color)' : 'text-(--muted-color)'}">{fmtAge(age)}</span>
      </div>
    {/snippet}
  </WidgetHeader>

  {#if !collapsed}
    <div
      class="relative flex flex-col gap-2"
      transition:slide={{ duration: 150 }}
      bind:clientWidth={width}
      onpointermove={onTip}
      onpointerleave={() => (tip = null)}
      role="presentation"
    >
      <!-- Строка состояния: состояние систем аппарата, группами -->
      <div
        class="flex flex-wrap items-center justify-between gap-x-5 gap-y-1.5 rounded-[10px] border border-(--hairline-color) bg-(--back-color) px-3 py-2 text-[12px] font-semibold tabular-nums"
      >
        <div class="flex min-w-0 items-center gap-2" data-tip="system">
          <span class="shrink-0 text-[10px] tracking-wide whitespace-nowrap text-(--faint-color) uppercase">{$T("pfd.system")}</span>
          <span class="rounded-md px-1.5 py-0.5 {armed ? 'bg-(--red-color) text-white' : 'bg-(--container-color) text-(--muted-color)'}" data-tip="armed"
            >{armed ? "ARMED" : "DISARMED"}</span
          >
          <span data-tip="mode">{modeName}</span>
          <span class="flex items-center gap-1" style="color: {NAV_COLOR[navState]}" data-tip="nav">
            <span class="size-2 rounded-full" style="background: {NAV_COLOR[navState]}"></span>{$T("pfd.nav")}{sensErr > 0
              ? ` · ${$T("pfd.nav.sensors", { n: sensErr })}`
              : ""}
          </span>
        </div>
        <div class="flex min-w-0 items-center gap-2" data-tip="gps">
          <span class="shrink-0 text-[10px] tracking-wide whitespace-nowrap text-(--faint-color) uppercase">GPS</span>
          <span class={fix < 3 ? "text-(--orange-color)" : ""}>{FIX[fix] ?? fix} · {$T("pfd.sat", { n: num(value?.Sat) })}</span>
          {#if hdop >= 0}<span class={hdop > 2 ? "text-(--orange-color)" : ""}>HDOP {fmt(hdop, 2)}</span>{/if}
        </div>
        {#if rssi >= 0 || remRssi >= 0 || drop >= 0}
          <div class="flex min-w-0 items-center gap-2" data-tip="link">
            <span class="shrink-0 text-[10px] tracking-wide whitespace-nowrap text-(--faint-color) uppercase">{$T("pfd.link")}</span>
            <span class={Math.min(rssi, remRssi) >= 0 && Math.min(rssi, remRssi) < 30 ? "text-(--red-color)" : ""}
              >{rssi >= 0 ? Math.round(rssi) : "—"} / {remRssi >= 0 ? Math.round(remRssi) : "—"} %</span
            >
            {#if drop >= 0}<span class={drop > 5 ? "text-(--orange-color)" : ""}>{$T("pfd.link.drop", { v: fmt(drop) })}</span>{/if}
          </div>
        {/if}
        <div class="flex items-center gap-2 {battLow ? 'text-(--red-color)' : ''}" data-tip="battery">
          <span class="shrink-0 text-[10px] tracking-wide whitespace-nowrap text-(--faint-color) uppercase">{$T("pfd.battery")}</span>
          <span>{battText}</span>
        </div>
      </div>

      <!-- Прибор -->
      <div class="relative">
        <svg viewBox="0 0 {VW} 320" class="w-full rounded-[10px] bg-(--back-color)" role="img" aria-label={$T("pfd.title")}>
          <defs>
            <clipPath id="pfd-horizon-{uid}"><rect x={HX} y="0" width={HW} height={HH} rx="8" /></clipPath>
            <clipPath id="pfd-speed-{uid}"><rect x="0" y="0" width="70" height={HH} rx="8" /></clipPath>
            <clipPath id="pfd-alt-{uid}"><rect x={VW - 70} y="0" width="70" height={HH} rx="8" /></clipPath>
            <clipPath id="pfd-hdg-{uid}"><rect x={HX} y={HH + 6} width={HW} height="44" rx="8" /></clipPath>
          </defs>

          <!-- Авиагоризонт -->
          <g clip-path="url(#pfd-horizon-{uid})" data-tip="horizon">
            <g transform="rotate({-roll.current} {CX} {CY}) translate(0 {pitch.current * PPD})">
              <rect x={CX - 600} y={CY - 1000} width="1200" height="1000" fill="#3a86c8" />
              <rect x={CX - 600} y={CY} width="1200" height="1000" fill="#8a5a2b" />
              <line x1={CX - 600} y1={CY} x2={CX + 600} y2={CY} stroke="#fff" stroke-width="2" />
              {#each pitchLadder as d (d)}
                {@const y = CY - d * PPD}
                {@const half = d % 10 === 0 ? 40 : 18}
                <line x1={CX - half} y1={y} x2={CX + half} y2={y} stroke="#fff" stroke-width="1.5" />
                {#if d % 10 === 0}
                  <text x={CX - half - 6} y={y + 4} fill="#fff" font-size="11" text-anchor="end">{Math.abs(d)}</text>
                  <text x={CX + half + 6} y={y + 4} fill="#fff" font-size="11">{Math.abs(d)}</text>
                {/if}
              {/each}
            </g>

            <!-- Шкала крена: зона за пределом bankMax — красная -->
            <path d={arcPath(-60, 60, ROLL_R)} fill="none" stroke="#fff" stroke-width="1.5" />
            {#if limits?.bankMax !== undefined && limits.bankMax < 60}
              <path d={arcPath(-60, -limits.bankMax, ROLL_R)} fill="none" stroke="#ef4444" stroke-width="4" />
              <path d={arcPath(limits.bankMax, 60, ROLL_R)} fill="none" stroke="#ef4444" stroke-width="4" />
            {/if}
            {#each ROLL_TICKS as t (t)}
              {@const a = arcPoint(t, ROLL_R)}
              {@const b = arcPoint(t, ROLL_R + (t % 30 === 0 ? 12 : 7))}
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#fff" stroke-width="1.5" />
            {/each}
            <g transform="rotate({-roll.current} {CX} {CY})" data-tip="rollPtr">
              <polygon
                points="{CX},{CY - ROLL_R + 2} {CX - 7},{CY - ROLL_R + 14} {CX + 7},{CY - ROLL_R + 14}"
                fill={limits?.bankMax !== undefined && Math.abs(roll.current) > limits.bankMax ? "#ef4444" : "#facc15"}
              />
            </g>

            <!-- Символ самолёта -->
            <g stroke="#facc15" stroke-width="4" fill="none" stroke-linecap="round">
              <polyline points="{CX - 70},{CY} {CX - 25},{CY} {CX - 15},{CY + 10}" />
              <polyline points="{CX + 70},{CY} {CX + 25},{CY} {CX + 15},{CY + 10}" />
            </g>
            <circle cx={CX} cy={CY} r="3" fill="#facc15" />

            <!-- Компактный режим: числа вместо лент -->
            {#if compact}
              <g font-size="15" font-weight="600" fill="#fff">
                <g data-tip="compactSpeed">
                  <rect x="8" y={CY - 16} width="76" height="32" rx="6" fill="#000" fill-opacity="0.55" />
                  <text x="46" y={CY + 6} text-anchor="middle">{fmt(gs)}</text>
                  <text x="46" y={CY + 32} text-anchor="middle" font-size="11">m/s</text>
                </g>
                <g data-tip="compactAlt">
                  <rect x={VW - 84} y={CY - 16} width="76" height="32" rx="6" fill="#000" fill-opacity="0.55" />
                  <text x={VW - 46} y={CY + 6} text-anchor="middle">{Math.round(alt)}</text>
                  <text x={VW - 46} y={CY + 32} text-anchor="middle" font-size="11">m · {climb >= 0 ? "+" : ""}{fmt(climb)}</text>
                </g>
              </g>
            {/if}
          </g>

          {#if !compact}
            <!-- Лента скорости (путевая), красные зоны вне speedMin/speedMax -->
            <g clip-path="url(#pfd-speed-{uid})" data-tip="speedTape">
              <rect x="0" y="0" width="70" height={HH} fill="#000" fill-opacity="0.72" />
              {#if limits?.speedMin !== undefined}
                {@const y = CY - (limits.speedMin - gs) * SPEED_PPU}
                <rect x="62" {y} width="8" height={Math.max(0, HH - y)} fill="#ef4444" />
              {/if}
              {#if limits?.speedMax !== undefined}
                {@const y = CY - (limits.speedMax - gs) * SPEED_PPU}
                <rect x="62" y="0" width="8" height={Math.max(0, y)} fill="#ef4444" />
              {/if}
              {#each speedTicks as v (v)}
                {@const y = CY - (v - gs) * SPEED_PPU}
                <line x1={v % 5 === 0 ? 48 : 56} y1={y} x2="62" y2={y} stroke="#fff" stroke-width="1" />
                {#if v % 5 === 0}<text x="42" y={y + 4} fill="#fff" font-size="11" text-anchor="end">{v}</text>{/if}
              {/each}
            </g>
            <g data-tip="speedBox">
              <rect x="4" y={CY - 14} width="58" height="28" rx="4" fill="#000" stroke="var(--accent-color)" stroke-width="1.5" />
              <text x="33" y={CY + 6} fill="#fff" font-size="15" font-weight="600" text-anchor="middle">{fmt(gs)}</text>
            </g>
            <g data-tip="speedLabel">
              <rect x="0" y="0" width="70" height="20" rx="8" fill="#000" />
              <text x="35" y="14" fill="#fff" font-size="10" text-anchor="middle" fill-opacity="0.7">SPD m/s</text>
            </g>
            {#if wp}
              {@const y = clampTape(CY - wp.spdErr * SPEED_PPU)}
              <polygon points="70,{y - 7} 60,{y} 70,{y + 7}" fill="#22d3ee" data-tip="speedBug" />
            {/if}

            <!-- Лента высоты над точкой взлёта, красная зона выше altMax; вариометр справа -->
            <g clip-path="url(#pfd-alt-{uid})" data-tip="altTape">
              <rect x={VW - 70} y="0" width="70" height={HH} fill="#000" fill-opacity="0.72" />
              {#if limits?.altMax !== undefined}
                {@const y = CY - (limits.altMax - alt) * ALT_PPU}
                <rect x={VW - 70} y="0" width="8" height={Math.max(0, y)} fill="#ef4444" />
              {/if}
              {#each altTicks as v (v)}
                {@const y = CY - (v - alt) * ALT_PPU}
                <line x1={VW - 62} y1={y} x2={VW - (v % 10 === 0 ? 48 : 54)} y2={y} stroke="#fff" stroke-width="1" />
                {#if v % 10 === 0}<text x={VW - 44} y={y + 4} fill="#fff" font-size="11">{v}</text>{/if}
              {/each}
              <rect x={VW - 6} y={Math.min(CY, CY - vsi)} width="4" height={Math.abs(vsi)} fill={climb >= 0 ? "#22c55e" : "#f97316"} />
            </g>
            <g data-tip="altBox">
              <rect x={VW - 66} y={CY - 14} width="58" height="28" rx="4" fill="#000" stroke="var(--accent-color)" stroke-width="1.5" />
              <text x={VW - 37} y={CY + 6} fill="#fff" font-size="15" font-weight="600" text-anchor="middle">{Math.round(alt)}</text>
            </g>
            <g data-tip="altLabel">
              <rect x={VW - 70} y="0" width="70" height="20" rx="8" fill="#000" />
              <text x={VW - 35} y="14" fill="#fff" font-size="10" text-anchor="middle" fill-opacity="0.7">ALT m</text>
            </g>
            {#if wp}
              {@const y = clampTape(CY - (wp.altTarget - alt) * ALT_PPU)}
              <polygon points="{VW - 70},{y - 7} {VW - 60},{y} {VW - 70},{y + 7}" fill="#22d3ee" data-tip="altBug" />
            {/if}

            <!-- Углы под лентами: воздушная и вертикальная скорость -->
            <g data-tip="airspeed">
              <rect x="0" y={HH + 6} width={HX - 6} height="44" rx="8" fill="#000" fill-opacity="0.72" />
              <text x={(HX - 6) / 2} y={HH + 21} fill="#fff" fill-opacity="0.7" font-size="9" text-anchor="middle">AS</text>
              <text x={(HX - 6) / 2} y={HH + 41} fill="#fff" font-size="14" font-weight="600" text-anchor="middle">{fmt(as)}</text>
            </g>
            <g data-tip="vs">
              <rect x={HX + HW + 6} y={HH + 6} width={VW - HX - HW - 6} height="44" rx="8" fill="#000" fill-opacity="0.72" />
              <text x={(HX + HW + 6 + VW) / 2} y={HH + 21} fill="#fff" fill-opacity="0.7" font-size="9" text-anchor="middle">VS</text>
              <text
                x={(HX + HW + 6 + VW) / 2}
                y={HH + 41}
                fill={climb > 0.2 ? "#22c55e" : climb < -0.2 ? "#f97316" : "#fff"}
                font-size="14"
                font-weight="600"
                text-anchor="middle">{signed(climb)}</text
              >
            </g>
          {/if}

          <!-- Лента курса: трек (розовый), направление на дом (зелёный) -->
          <g clip-path="url(#pfd-hdg-{uid})" data-tip="heading">
            <rect x={HX} y={HH + 6} width={HW} height="44" fill="#000" fill-opacity="0.72" />
            {#each hdgTicks as d (d)}
              {@const x = CX + hdgOffset(d)}
              <line x1={x} y1={HH + 6} x2={x} y2={HH + (d % 10 === 0 ? 18 : 12)} stroke="#fff" stroke-width="1" />
              {#if d % 10 === 0}<text {x} y={HH + 34} fill="#fff" font-size="11" text-anchor="middle">{hdgLabel(d)}</text>{/if}
            {/each}
            {#if track !== null}
              {@const x = CX + hdgOffset(track)}
              <polygon points="{x},{HH + 8} {x - 6},{HH + 18} {x + 6},{HH + 18}" fill="#ec4899" data-tip="track" />
            {/if}
            {#if wp}
              {@const x = CX + hdgOffset(wp.bearing)}
              <polygon points="{x},{HH + 7} {x + 6},{HH + 13} {x},{HH + 19} {x - 6},{HH + 13}" fill="none" stroke="#22d3ee" stroke-width="2" data-tip="wpBug" />
            {/if}
            {#if home}
              {@const x = CX + hdgOffset(home.bearing)}
              <circle cx={x} cy={HH + 44} r="4" fill="#22c55e" data-tip="homeMark" />
            {/if}
          </g>
          <g data-tip="heading">
            <rect x={CX - 26} y={HH + 20} width="52" height="24" rx="4" fill="#000" stroke="var(--accent-color)" stroke-width="1.5" />
            <text x={CX} y={HH + 37} fill="#fff" font-size="14" font-weight="600" text-anchor="middle"
              >{String(Math.round(wrap360(heading.current)) % 360).padStart(3, "0")}</text
            >
          </g>

          <!-- Нет данных: флаг поверх прибора -->
          {#if stale}
            <g>
              <rect x="0" y="0" width={VW} height="320" rx="10" fill="#000" fill-opacity="0.45" />
              <line x1={HX + 20} y1="20" x2={HX + HW - 20} y2={HH - 20} stroke="#ef4444" stroke-width="3" />
              <line x1={HX + HW - 20} y1="20" x2={HX + 20} y2={HH - 20} stroke="#ef4444" stroke-width="3" />
              <rect x={CX - 70} y={CY - 16} width="140" height="32" rx="6" fill="#ef4444" />
              <text x={CX} y={CY + 6} fill="#fff" font-size="15" font-weight="600" text-anchor="middle">NO DATA</text>
            </g>
          {/if}
        </svg>
        <!-- Информационная строка внизу горизонта: подсказка к элементу под курсором, иначе последнее сообщение автопилота -->
        {#if infoText}
          {@const [head, ...rest] = infoText.split("\n")}
          <div
            data-tip={messages.length ? "messages" : null}
            class="absolute -translate-x-1/2 -translate-y-full rounded-md px-3 py-1.5 text-left text-[12px] leading-snug {tipText
              ? 'bg-black/75 text-white'
              : sevClass(banner?.sev ?? 6)}"
            style="left: {(CX / VW) * 100}%; top: {((HH - 8) / 320) * 100}%; width: {((HW * 0.9) / VW) * 100}%"
          >
            <div class="font-semibold">{head}</div>
            {#each rest as row, i (i)}
              <div class="opacity-90">{row}</div>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Значения под прибором: куда движемся и где находимся, группами -->
      <div
        class="flex flex-wrap items-center justify-between gap-x-5 gap-y-1.5 rounded-[10px] border border-(--hairline-color) bg-(--back-color) px-3 py-2 text-[12px] tabular-nums"
      >
        {#if wp}
          <div class="flex min-w-0 items-center gap-2" data-tip="route">
            <span class="shrink-0 text-[10px] font-semibold tracking-wide whitespace-nowrap text-(--faint-color) uppercase">{$T("pfd.route")}</span>
            <span><span style="color:#22d3ee">◆</span> {$T("pfd.route.line", { n: wp.num, d: fmtDistance(wp.dist), x: fmtDistance(Math.abs(wp.xte)) })}</span>
          </div>
        {/if}
        {#if home}
          <div class="flex min-w-0 items-center gap-2" data-tip="home">
            <span class="shrink-0 text-[10px] font-semibold tracking-wide whitespace-nowrap text-(--faint-color) uppercase">{$T("pfd.home")}</span>
            <span><span style="color:#22c55e">●</span> {fmtDistance(home.distance)} · {Math.round(home.bearing)}°</span>
          </div>
        {/if}
        {#if track !== null}
          <div class="flex items-center gap-2" data-tip="track">
            <span class="shrink-0 text-[10px] font-semibold tracking-wide whitespace-nowrap text-(--faint-color) uppercase">{$T("pfd.track")}</span>
            <span><span style="color:#ec4899">▲</span> {Math.round(track)}°</span>
          </div>
        {/if}
        <div class="flex min-w-0 items-center gap-2" data-tip="position">
          <span class="shrink-0 text-[10px] font-semibold tracking-wide whitespace-nowrap text-(--faint-color) uppercase">{$T("pfd.position")}</span>
          <span>{latLonText} · MSL {$T("pfd.u.m", { n: Math.round(altMsl) })}</span>
        </div>
        <div class="flex min-w-0 items-center gap-2" data-tip="air">
          <span class="shrink-0 text-[10px] font-semibold tracking-wide whitespace-nowrap text-(--faint-color) uppercase">{$T("pfd.air")}</span>
          <span>{fmt(num(value?.Press))} {$T("pfd.u.hpa")} · {fmt(num(value?.Temp))} °C</span>
        </div>
      </div>
    </div>
  {/if}
</div>
