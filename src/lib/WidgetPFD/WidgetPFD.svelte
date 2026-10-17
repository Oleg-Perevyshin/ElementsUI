<!-- $lib/WidgetPFD/WidgetPFD.svelte — смарт-виджет «Пилотажный дисплей» (Primary Flight Display).
     Поля группы (по умолчанию MAV) — телеметрия автопилота MAVLink (см. IWidgetPFDData): авиагоризонт,
     ленты скорости/высоты/курса, строка состояния, цветовые зоны по границам (limits). Только отображение:
     ничего не отправляет и не знает про DeviceStore/WebSocket. Между пакетами ориентация сглаживается (Tween),
     устаревшие данные закрываются флагом «нет данных». В узкой ячейке ленты заменяются числами. -->
<script lang="ts">
  import { slide } from "svelte/transition"
  import { Tween } from "svelte/motion"
  import { cubicOut } from "svelte/easing"
  import { twMerge } from "tailwind-merge"
  import type { IWidgetPFDProps } from "../types"
  import PlaneIcon from "./PlaneIcon.svelte"
  import WidgetHeader from "../WidgetHeader.svelte"
  import { widgetAccentStyle } from "../widgetAccent"
  import { readPersistedCollapsed, writePersistedCollapsed } from "../widgetCollapse"

  let {
    wrapperClass = "",
    componentClass = "",
    label = { name: "Пилотажный дисплей" },
    value,
    limits,
    collapsed = $bindable(false),
    persistKey,
  }: IWidgetPFDProps = $props()

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
  const FIX = ["нет", "нет", "2D", "3D", "DGPS", "RTK float", "RTK fix"]
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

  /* Всплывающая подсказка: элементы прибора и строк помечены data-tip, одна подсказка следует за курсором */
  let tip: { text: string; x: number; y: number } | null = $state(null)
  const onTip = (e: PointerEvent) => {
    const host = e.currentTarget as HTMLElement
    const el = (e.target as Element | null)?.closest("[data-tip]")
    if (!el) return (tip = null)
    const r = host.getBoundingClientRect()
    tip = { text: el.getAttribute("data-tip") ?? "", x: Math.min(Math.max(e.clientX - r.left, 90), r.width - 90), y: e.clientY - r.top }
  }
  const fmtDistance = (m: number) => (m >= 1000 ? `${(m / 1000).toFixed(2)} км` : `${Math.round(m)} м`)
  const fmtAge = (s: number) => (Number.isFinite(s) ? `${s.toFixed(1)} с` : "нет связи")
</script>

<div
  class={twMerge("relative flex w-full flex-col gap-4 rounded-2xl border border-(--hairline-color) bg-(--container-color) p-4", wrapperClass)}
  style={accentStyle}
>
  <WidgetHeader icon={PlaneIcon} label={label?.name ?? "Пилотажный дисплей"} bind:collapsed>
    {#snippet right()}
      <span class="text-[12px] font-semibold tabular-nums {stale ? 'text-(--red-color)' : 'text-(--muted-color)'}">{fmtAge(age)}</span>
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
      <!-- Строка состояния -->
      <div
        class="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-[10px] border border-(--hairline-color) bg-(--back-color) px-3 py-2 text-[12px] font-semibold tabular-nums"
      >
        <span
          class="rounded-md px-1.5 py-0.5 {armed ? 'bg-(--red-color) text-white' : 'bg-(--container-color) text-(--muted-color)'}"
          data-tip={armed ? "Двигатели взведены — аппарат готов к полёту" : "Двигатели не взведены"}>{armed ? "ARMED" : "DISARMED"}</span
        >
        <span data-tip="Режим полёта автопилота">{modeName}</span>
        <span class={fix < 3 ? "text-(--orange-color)" : ""} data-tip="Тип фиксации GPS · число спутников; меньше 3D — позиция неточная"
          >GPS {FIX[fix] ?? fix} · {num(value?.Sat)}</span
        >
        <span class={battLow ? "text-(--red-color)" : ""} data-tip="Батарея: напряжение · ток · остаток заряда">
          {fmt(num(value?.BV))} В{battCurrent >= 0 ? ` · ${fmt(battCurrent)} А` : ""}{battRem >= 0 ? ` · ${battRem}%` : ""}
        </span>
        {#if home}
          <span data-tip="Точка взлёта: расстояние · направление на неё">Дом {fmtDistance(home.distance)} · {Math.round(home.bearing)}°</span>
        {/if}
      </div>

      <!-- Прибор -->
      <svg viewBox="0 0 {VW} 320" class="w-full rounded-[10px] bg-(--back-color)" role="img" aria-label="Пилотажный дисплей">
        <defs>
          <clipPath id="pfd-horizon-{uid}"><rect x={HX} y="0" width={HW} height={HH} rx="8" /></clipPath>
          <clipPath id="pfd-speed-{uid}"><rect x="0" y="0" width="70" height={HH} rx="8" /></clipPath>
          <clipPath id="pfd-alt-{uid}"><rect x={VW - 70} y="0" width="70" height={HH} rx="8" /></clipPath>
          <clipPath id="pfd-hdg-{uid}"><rect x={HX} y={HH + 6} width={HW} height="44" rx="8" /></clipPath>
        </defs>

        <!-- Авиагоризонт -->
        <g clip-path="url(#pfd-horizon-{uid})" data-tip="Авиагоризонт: крен {fmt(roll.current)}°, тангаж {fmt(pitch.current)}°">
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
          <g
            transform="rotate({-roll.current} {CX} {CY})"
            data-tip="Указатель крена: {fmt(roll.current)}°{limits?.bankMax !== undefined ? `, предел ±${limits.bankMax}°` : ''}"
          >
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
              <rect x="8" y={CY - 16} width="76" height="32" rx="6" fill="#000" fill-opacity="0.55" />
              <text x="46" y={CY + 6} text-anchor="middle">{fmt(gs)}</text>
              <rect x={VW - 84} y={CY - 16} width="76" height="32" rx="6" fill="#000" fill-opacity="0.55" />
              <text x={VW - 46} y={CY + 6} text-anchor="middle">{Math.round(alt)}</text>
              <text x="46" y={CY + 32} text-anchor="middle" font-size="11">м/с</text>
              <text x={VW - 46} y={CY + 32} text-anchor="middle" font-size="11">м · {climb >= 0 ? "+" : ""}{fmt(climb)}</text>
            </g>
          {/if}
        </g>

        {#if !compact}
          <!-- Лента скорости (путевая), красные зоны вне speedMin/speedMax -->
          <g
            clip-path="url(#pfd-speed-{uid})"
            data-tip="Путевая скорость (над землёй, по GPS): {fmt(gs)} м/с{limits?.speedMin !== undefined || limits?.speedMax !== undefined
              ? ' — красное: вне допустимого диапазона'
              : ''}"
          >
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
          <rect x="4" y={CY - 14} width="58" height="28" rx="4" fill="#000" stroke="var(--accent-color)" stroke-width="1.5" />
          <text x="33" y={CY + 6} fill="#fff" font-size="15" font-weight="600" text-anchor="middle">{fmt(gs)}</text>
          <rect x="0" y="0" width="70" height="20" rx="8" fill="#000" />
          <text x="35" y="14" fill="#fff" font-size="10" text-anchor="middle" fill-opacity="0.7">СКОР м/с</text>

          <!-- Лента высоты над точкой взлёта, красная зона выше altMax; вариометр справа -->
          <g
            clip-path="url(#pfd-alt-{uid})"
            data-tip="Высота над точкой взлёта: {Math.round(alt)} м; полоса у края — вертикальная скорость{limits?.altMax !== undefined
              ? ', красное — выше предела'
              : ''}"
          >
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
          <rect x={VW - 66} y={CY - 14} width="58" height="28" rx="4" fill="#000" stroke="var(--accent-color)" stroke-width="1.5" />
          <text x={VW - 37} y={CY + 6} fill="#fff" font-size="15" font-weight="600" text-anchor="middle">{Math.round(alt)}</text>
          <rect x={VW - 70} y="0" width="70" height="20" rx="8" fill="#000" />
          <text x={VW - 35} y="14" fill="#fff" font-size="10" text-anchor="middle" fill-opacity="0.7">ВЫС м</text>

          <!-- Углы под лентами: воздушная и вертикальная скорость -->
          <g data-tip="Воздушная скорость — относительно воздуха; отличается от путевой на ветер">
            <rect x="0" y={HH + 6} width={HX - 6} height="44" rx="8" fill="#000" fill-opacity="0.72" />
            <text x={(HX - 6) / 2} y={HH + 21} fill="#fff" fill-opacity="0.7" font-size="9" text-anchor="middle">ВОЗД. СКОР</text>
            <text x={(HX - 6) / 2} y={HH + 41} fill="#fff" font-size="14" font-weight="600" text-anchor="middle">{fmt(as)}</text>
          </g>
          <g data-tip="Вертикальная скорость: + набор высоты, − снижение, м/с">
            <rect x={HX + HW + 6} y={HH + 6} width={VW - HX - HW - 6} height="44" rx="8" fill="#000" fill-opacity="0.72" />
            <text x={(HX + HW + 6 + VW) / 2} y={HH + 21} fill="#fff" fill-opacity="0.7" font-size="9" text-anchor="middle">ВЕРТ. СКОР</text>
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
        <g clip-path="url(#pfd-hdg-{uid})" data-tip="Курс — куда направлен нос аппарата: {Math.round(wrap360(heading.current))}°">
          <rect x={HX} y={HH + 6} width={HW} height="44" fill="#000" fill-opacity="0.72" />
          {#each hdgTicks as d (d)}
            {@const x = CX + hdgOffset(d)}
            <line x1={x} y1={HH + 6} x2={x} y2={HH + (d % 10 === 0 ? 18 : 12)} stroke="#fff" stroke-width="1" />
            {#if d % 10 === 0}<text {x} y={HH + 34} fill="#fff" font-size="11" text-anchor="middle">{hdgLabel(d)}</text>{/if}
          {/each}
          {#if track !== null}
            {@const x = CX + hdgOffset(track)}
            <polygon
              points="{x},{HH + 8} {x - 6},{HH + 18} {x + 6},{HH + 18}"
              fill="#ec4899"
              data-tip="Трек — куда аппарат реально движется над землёй (по скоростям на север и восток): {Math.round(track)}°"
            />
          {/if}
          {#if home}
            {@const x = CX + hdgOffset(home.bearing)}
            <circle
              cx={x}
              cy={HH + 44}
              r="4"
              fill="#22c55e"
              data-tip="Направление на точку взлёта: {Math.round(home.bearing)}°, {fmtDistance(home.distance)}"
            />
          {/if}
        </g>
        <rect x={CX - 26} y={HH + 20} width="52" height="24" rx="4" fill="#000" stroke="var(--accent-color)" stroke-width="1.5" />
        <text x={CX} y={HH + 37} fill="#fff" font-size="14" font-weight="600" text-anchor="middle"
          >{String(Math.round(wrap360(heading.current)) % 360).padStart(3, "0")}</text
        >

        <!-- Нет данных: флаг поверх прибора -->
        {#if stale}
          <g>
            <rect x="0" y="0" width={VW} height="320" rx="10" fill="#000" fill-opacity="0.45" />
            <line x1={HX + 20} y1="20" x2={HX + HW - 20} y2={HH - 20} stroke="#ef4444" stroke-width="3" />
            <line x1={HX + HW - 20} y1="20" x2={HX + 20} y2={HH - 20} stroke="#ef4444" stroke-width="3" />
            <rect x={CX - 70} y={CY - 16} width="140" height="32" rx="6" fill="#ef4444" />
            <text x={CX} y={CY + 6} fill="#fff" font-size="15" font-weight="600" text-anchor="middle">НЕТ ДАННЫХ</text>
          </g>
        {/if}
      </svg>

      {#if tip}
        <div
          class="pointer-events-none absolute z-10 max-w-64 -translate-x-1/2 -translate-y-full rounded-lg border border-(--hairline-color) bg-(--back-color) px-2.5 py-1.5 text-[12px] text-(--font-color) shadow-(--elevation-2)"
          style="left: {tip.x}px; top: {tip.y - 10}px"
        >
          {tip.text}
        </div>
      {/if}

      <!-- Значения под прибором -->
      <div
        class="flex flex-wrap gap-x-5 gap-y-1 rounded-[10px] border border-(--hairline-color) bg-(--back-color) px-3 py-2 text-[12px] whitespace-nowrap tabular-nums"
      >
        {#if track !== null}<span data-tip="Направление движения над землёй"
            ><span style="color:#ec4899">▲</span> <span class="text-(--muted-color)">Трек</span> {Math.round(track)}°</span
          >{/if}
        {#if home}<span data-tip="Направление на точку взлёта"
            ><span style="color:#22c55e">●</span> <span class="text-(--muted-color)">Дом</span> {Math.round(home.bearing)}°</span
          >{/if}
        <span><span class="text-(--muted-color)">Координаты</span> {lat ? `${lat.toFixed(6)}, ${lon.toFixed(6)}` : "—"}</span>
        <span data-tip="Высота над уровнем моря"><span class="text-(--muted-color)">Высота MSL</span> {Math.round(altMsl)} м</span>
        <span><span class="text-(--muted-color)">Давление</span> {fmt(num(value?.Press))} гПа</span>
        <span><span class="text-(--muted-color)">Температура</span> {fmt(num(value?.Temp))} °C</span>
      </div>
    </div>
  {/if}
</div>
