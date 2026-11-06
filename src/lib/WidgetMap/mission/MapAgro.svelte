<!-- $lib/WidgetMap/mission/MapAgro.svelte — режим «Агро» карты, генератор миссии для агродрона: оператор рисует на карте поле и запретные зоны, задаёт угол проходов и ширину захвата, виджет строит траекторию покрытия с обходом зон и выгружает миссию -->
<script lang="ts">
  import { onMount, untrack, type Snippet } from "svelte"
  import { slide } from "svelte/transition"
  import { twMerge } from "tailwind-merge"
  import { T } from "../../locales/i18n"
  import WidgetHeader from "../../WidgetHeader.svelte"
  import { hint, hintsSetting } from "../../hints"
  import { widgetAccentStyle } from "../../widgetAccent"
  import { readPersistedCollapsed, writePersistedCollapsed } from "../../widgetCollapse"
  import * as UI from "../.."
  import { MapLibre, NavigationControl, ScaleControl, FullScreenControl } from "../mapWrapper"
  import MissionLayers from "./MissionLayers.svelte"
  import MissionIcon from "./MissionIcon.svelte"
  import ArrowIcon from "../../libIcons/ArrowIcon.svelte"
  import { planFields, bestFieldAngle, toWaypointsFile, fieldArea, fieldsArea, type LngLat, type SprayControl } from "./coverage"
  import { DEFAULT_MISSION_PLAN, type IMissionPlan } from "./plan"

  /* Режим «Агро» карты: часть пропсов WidgetMap */
  interface Props {
    wrapperClass?: string
    componentClass?: string
    label?: { name?: string }
    height?: number
    plan?: IMissionPlan
    collapsed?: boolean
    persistKey?: string
    overlay?: Snippet /* Аппараты карты поверх миссии */
    onPlanChange?: (plan: IMissionPlan) => void
    onSend?: (mission: string, plan: IMissionPlan) => void | Promise<void>
  }

  let {
    wrapperClass = "",
    componentClass = "",
    label = {},
    height = 520,
    plan = $bindable({ ...DEFAULT_MISSION_PLAN }),
    collapsed = $bindable(false),
    persistKey,
    overlay,
    onPlanChange,
    onSend,
  }: Props = $props()

  const hints = hintsSetting("WidgetMap")
  let accentStyle = $derived(widgetAccentStyle(componentClass ?? ""))

  let hasMergedPersisted = false
  $effect(() => {
    if (hasMergedPersisted) return
    hasMergedPersisted = true
    const persisted = readPersistedCollapsed(persistKey, collapsed)
    if (persisted !== collapsed) collapsed = persisted
  })
  $effect(() => writePersistedCollapsed(persistKey, collapsed))

  const update = (patch: Partial<IMissionPlan>) => {
    plan = { ...plan, ...patch }
    onPlanChange?.(plan)
  }

  /* ********************************************************** */
  /* Рисование и правка контуров */

  /* field — правка полей и обвод новых, hole — правка зон и обвод новых */
  type Mode = "idle" | "field" | "hole"
  let mode = $state<Mode>("idle")
  let draft: LngLat[] = $state([])
  let cursor: LngLat | null = $state(null)
  let mapInstance: any = $state()

  /* fieldList — поля с углами, fields — их контуры */
  let fieldList = $derived(plan.fields ?? [])
  let fields = $derived(fieldList.map((f) => f.contour))
  let hasField = $derived(fields.some((f) => f.length >= 3))

  /* Клики по карте ставят точки нового контура */
  let drawing = $derived(mode !== "idle")

  const toggleMode = (m: Mode) => {
    mode = mode === m ? "idle" : m
    draft = []
  }
  /* Esc: сначала сбрасывает начатый контур, затем выходит из режима */
  const cancelDraw = () => {
    if (draft.length) draft = []
    else mode = "idle"
  }
  const finishDraw = () => {
    if (draft.length >= 3) {
      if (mode === "field")
        update({
          fields: [...fieldList, { contour: draft, angle: bestFieldAngle(draft, plan.holes, plan.spacing, plan.margin) }],
          start: plan.start ?? draft[0],
        })
      if (mode === "hole") update({ holes: [...plan.holes, draft] })
    }
    draft = []
  }

  const onMapClick = (ll: LngLat, px: { x: number; y: number }) => {
    if (!drawing) return
    /* Клик рядом с первой точкой замыкает контур */
    if (draft.length >= 3 && mapInstance) {
      const p0 = mapInstance.project(draft[0])
      if (Math.hypot(p0.x - px.x, p0.y - px.y) < 12) return finishDraw()
    }
    draft = [...draft, ll]
  }

  /* Ручки: v:кольцо:вершина, m:кольцо:ребро, s — точка взлёта; кольца сначала поля, затем зоны */
  const ringOf = (r: number) => (r < fields.length ? fields[r] : plan.holes[r - fields.length])
  const setRing = (r: number, ring: LngLat[]) => {
    if (r < fields.length) update({ fields: fieldList.map((f, i) => (i === r ? { ...f, contour: ring } : f)) })
    else update({ holes: plan.holes.map((h, i) => (i === r - fields.length ? ring : h)) })
  }
  let inserted: { id: string; ring: number; index: number } | null = null

  const onDrag = (id: string, ll: LngLat) => {
    const [kind, r, i] = id.split(":")
    if (kind === "s") return update({ start: ll })
    const ring = Number(r)
    const idx = Number(i)
    const pts = [...ringOf(ring)]
    if (kind === "v") {
      pts[idx] = ll
      return setRing(ring, pts)
    }
    if (inserted?.id !== id) {
      pts.splice(idx + 1, 0, ll)
      inserted = { id, ring, index: idx + 1 }
    } else pts[inserted.index] = ll
    setRing(ring, pts)
  }
  const onDragEnd = () => (inserted = null)

  const onHandleRightClick = (id: string) => {
    const [kind, r, i] = id.split(":")
    if (kind !== "v") return
    const ring = Number(r)
    const pts = ringOf(ring)
    if (pts.length <= 3) return
    setRing(
      ring,
      pts.filter((_, k) => k !== Number(i)),
    )
  }

  const removeHole = (i: number) => update({ holes: plan.holes.filter((_, k) => k !== i) })
  const removeField = (i: number) => update({ fields: fieldList.filter((_, k) => k !== i) })
  const setFieldAngle = (i: number, angle: number) => update({ fields: fieldList.map((f, k) => (k === i ? { ...f, angle } : f)) })
  /* Ползунок задаёт один угол сразу всем полям */
  const setAllAngles = (angle: number) => update({ fields: fieldList.map((f) => ({ ...f, angle })) })
  let allAngle = $derived(fieldList[0]?.angle ?? 0)
  const clearAll = () => {
    update({ fields: [], holes: [] })
    draft = []
    mode = "idle"
  }

  const onKey = (e: KeyboardEvent) => {
    if (mode === "idle") return
    if (e.key === "Escape") cancelDraw()
    if (e.key === "Enter" && draft.length) finishDraw()
    if (e.key === "Backspace" && draft.length) {
      e.preventDefault()
      draft = draft.slice(0, -1)
    }
  }

  /* ********************************************************** */
  /* Расчёт */

  let result = $derived.by(() =>
    planFields({
      fields: fieldList,
      holes: plan.holes,
      spacing: plan.spacing,
      margin: plan.margin,
      start: plan.start,
      returnHome: plan.returnHome,
    }),
  )

  const autoAngle = () => {
    update({ fields: fieldList.map((f) => ({ ...f, angle: bestFieldAngle(f.contour, plan.holes, plan.spacing, plan.margin) })) })
  }

  let stats = $derived.by(() => {
    const area = fieldsArea(fields, plan.holes)
    if (!result) return null
    const total = result.sprayLength + result.turnLength + result.transitLength
    const timeMin = plan.speed > 0 ? (total / plan.speed + result.turns * 4) / 60 : 0
    const liquid = (area / 10000) * plan.rate
    const coverage = area > 0 ? Math.min(100, ((result.sprayLength * plan.spacing) / area) * 100) : 0
    return {
      ha: area / 10000,
      passes: result.passes,
      cells: result.cells,
      turns: result.turns,
      spray: result.sprayLength / 1000,
      total: total / 1000,
      timeMin,
      liquid,
      refills: plan.tank > 0 ? Math.max(0, Math.ceil(liquid / plan.tank) - 1) : 0,
      coverage,
      unreachable: result.unreachable,
      waypoints: result.waypoints.length,
    }
  })

  /* ********************************************************** */
  /* GeoJSON для слоёв */

  const closed = (r: LngLat[]) => [...r, r[0]]
  let zonesGeo = $derived({
    type: "FeatureCollection",
    features: [
      ...fields
        .filter((f) => f.length >= 3)
        .map((f) => ({ type: "Feature", properties: { kind: "field" }, geometry: { type: "Polygon", coordinates: [closed(f)] } })),
      ...plan.holes.map((h) => ({ type: "Feature", properties: { kind: "hole" }, geometry: { type: "Polygon", coordinates: [closed(h)] } })),
    ],
  })
  let pathGeo = $derived({
    type: "FeatureCollection",
    features: (result?.segments ?? []).map((s) => ({ type: "Feature", properties: { kind: s.kind }, geometry: { type: "LineString", coordinates: s.points } })),
  })
  let draftGeo = $derived({
    type: "FeatureCollection",
    features: drawing
      ? [
          {
            type: "Feature",
            properties: { kind: mode },
            geometry: { type: "LineString", coordinates: cursor && draft.length ? [...draft, cursor] : draft.length >= 2 ? draft : [] },
          },
        ]
      : [],
  })
  let handlesGeo = $derived.by(() => {
    const features: any[] = []
    const point = (ll: LngLat, props: object) => features.push({ type: "Feature", properties: props, geometry: { type: "Point", coordinates: ll } })
    const ringHandles = (ring: LngLat[], r: number) => {
      if (ring.length < 3) return
      const kind = r < fields.length ? "field" : "hole"
      ring.forEach((ll, i) => {
        const next = ring[(i + 1) % ring.length]
        point([(ll[0] + next[0]) / 2, (ll[1] + next[1]) / 2], { id: `m:${r}:${i}`, role: "mid", kind })
      })
      ring.forEach((ll, i) => point(ll, { id: `v:${r}:${i}`, role: "vertex", kind }))
    }
    /* Точки контуров видны только в режиме их кнопки */
    if (mode === "field") fields.forEach((f, i) => ringHandles(f, i))
    if (mode === "hole") plan.holes.forEach((h, i) => ringHandles(h, fields.length + i))
    draft.forEach((ll, i) => point(ll, { id: `d:${i}`, role: "vertex", kind: mode }))
    if (plan.start) point(plan.start, { id: "s", role: "start", kind: "start" })
    return { type: "FeatureCollection", features }
  })

  /* ********************************************************** */
  /* Вид карты и выгрузка */

  const fitField = () => {
    const pts = [...fields.flat(), ...(plan.start ? [plan.start] : [])]
    if (!mapInstance || pts.length === 0) return
    const lons = pts.map((p) => p[0])
    const lats = pts.map((p) => p[1])
    mapInstance.fitBounds(
      [
        [Math.min(...lons), Math.min(...lats)],
        [Math.max(...lons), Math.max(...lats)],
      ],
      { padding: 60, maxZoom: 18, duration: 0 },
    )
  }
  let fitted = false
  $effect(() => {
    if (mapInstance && !fitted) {
      fitted = true
      untrack(fitField)
    }
  })

  const missionText = () => (result && hasField ? toWaypointsFile(result, plan.start ?? fields[0][0], missionOptions()) : "")
  const missionOptions = () => ({
    alt: plan.alt,
    speed: plan.speed,
    spray: plan.sprayControl,
    servo: { channel: plan.servoChannel, on: plan.servoOn, off: plan.servoOff },
  })
  const download = () => {
    const text = missionText()
    if (!text) return
    const a = document.createElement("a")
    a.href = URL.createObjectURL(new Blob([text], { type: "text/plain" }))
    a.download = `mission_${new Date().toISOString().slice(0, 16).replace(/[-:T]/g, "")}.waypoints`
    a.click()
    URL.revokeObjectURL(a.href)
  }
  let copied = $state(false)
  const copy = async () => {
    const text = missionText()
    if (!text) return
    await navigator.clipboard.writeText(text)
    copied = true
    setTimeout(() => (copied = false), 1000)
  }
  let sendState: "idle" | "busy" | "done" | "error" = $state("idle")
  const send = async () => {
    const text = missionText()
    if (!text || !onSend || sendState === "busy") return
    sendState = "busy"
    try {
      await onSend(text, $state.snapshot(plan))
      sendState = "done"
    } catch {
      sendState = "error"
    }
    setTimeout(() => (sendState = "idle"), 1500)
  }

  let rootEl: HTMLDivElement | undefined = $state()
  let isDarkMode = $state(false)
  const detectTheme = () => {
    const scope = rootEl?.closest(".dark, .light")
    isDarkMode = scope ? scope.classList.contains("dark") : localStorage.getItem("AppTheme") !== "light"
  }
  onMount(() => {
    detectTheme()
    window.addEventListener("ThemeChange", detectTheme)
    return () => window.removeEventListener("ThemeChange", detectTheme)
  })

  /* Мелкие зоны в м², остальное в га */
  const areaText = (m2: number) => (m2 < 1000 ? `${fmt(m2, 0)} ${$T("widget.mission.m2")}` : `${fmt(m2 / 10000, 2)} ${$T("widget.mission.ha")}`)
  const sprayModes: SprayControl[] = ["sprayer", "servo", "none"]
  const fmt = (v: number, d = 1) => v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d })
  const numField = (key: keyof IMissionPlan, min: number, max: number, step: number) => ({
    value: plan[key] as number,
    number: { minNum: min, maxNum: max, step },
    onUpdate: (v: string | number) => {
      const n = Number(v)
      if (Number.isFinite(n)) update({ [key]: Math.min(max, Math.max(min, n)) } as Partial<IMissionPlan>)
    },
  })
  const modeBtn =
    "flex cursor-pointer items-center gap-2 rounded-lg border border-solid px-3 py-1.5 text-[13px] font-semibold whitespace-nowrap text-(--font-color) transition disabled:cursor-not-allowed disabled:opacity-50"
  /* Два сворачиваемых блока: «Маршрут и внесение» и «Итог» (контуры и расчёт) */
  type Section = "settings" | "summary"
  let open = $state<Record<Section, boolean>>({ settings: false, summary: false })
  const card = "flex flex-col gap-3 rounded-[10px] border border-(--hairline-color) bg-(--back-color) p-3"
  /* Метка у кнопки повторяет цвет объекта на карте */
  let tools = $derived([
    {
      mode: "field" as Mode,
      label: hasField ? "widget.mission.editField" : "widget.mission.drawField",
      dot: "rounded-sm border-[#16a34a] bg-[#22c55e]/30",
      disabled: false,
    },
    { mode: "hole" as Mode, label: "widget.mission.editHoles", dot: "rounded-sm border-[#dc2626] bg-[#ef4444]/40", disabled: !hasField },
  ])
</script>

<svelte:window onkeydown={onKey} />

{#snippet head(key: Section, title: string, summary: string)}
  <button
    type="button"
    class="flex w-full cursor-pointer items-center justify-between gap-2 border-none bg-transparent p-0 text-left"
    aria-expanded={open[key]}
    onclick={() => (open[key] = !open[key])}
  >
    <span class="text-[12px] font-semibold text-(--muted-color)">
      {title}
      <span class="font-normal text-(--faint-color) tabular-nums">· {summary}</span>
    </span>
    <span
      class="flex size-3.5 shrink-0 text-(--faint-color) transition-transform duration-150 [&_svg]:h-full [&_svg]:w-full"
      style="transform: rotate({open[key] ? 90 : 0}deg)"
    >
      <ArrowIcon />
    </span>
  </button>
{/snippet}

<div
  bind:this={rootEl}
  class={twMerge("relative flex w-full flex-col gap-4 rounded-2xl border border-(--hairline-color) bg-(--container-color) p-4", wrapperClass)}
  style={accentStyle}
>
  <WidgetHeader icon={MissionIcon} label={label?.name || $T("widget.mission.title")} bind:collapsed {hints}>
    {#snippet right()}
      {#if stats}
        <span class="text-[12px] font-semibold text-(--muted-color) tabular-nums"
          >{fmt(stats.ha, 2)} {$T("widget.mission.ha")} · {fmt(stats.total, 2)} {$T("widget.mission.km")}</span
        >
      {/if}
    {/snippet}
  </WidgetHeader>

  {#if !collapsed}
    <div transition:slide={{ duration: 150 }} class="flex flex-col gap-4">
      <!-- Инструменты рисования и подсказка к текущему шагу -->
      <div class="flex flex-col gap-2">
        <div class="flex flex-wrap items-center gap-2">
          {#each tools as tool}
            <button
              class="{modeBtn} {mode === tool.mode
                ? 'border-(--accent-color) bg-(--accent-color)/15'
                : 'border-(--hairline-color) bg-(--back-color) hover:border-(--accent-color)'}"
              disabled={tool.disabled}
              onclick={() => toggleMode(tool.mode)}
              use:hint={{ text: $T(`widget.mission.hint.${tool.mode}`), enabled: $hints }}
            >
              <span class="size-3 shrink-0 border-2 {tool.dot}"></span>
              {$T(tool.label)}
            </button>
          {/each}
          {#if draft.length}
            <div class="ml-auto flex gap-2">
              <button class="{modeBtn} border-(--green-color) bg-(--green-color) text-white" disabled={draft.length < 3} onclick={finishDraw}>
                {$T("widget.mission.close")} ({draft.length})
              </button>
              <button class="{modeBtn} border-(--hairline-color) bg-(--back-color)" onclick={() => (draft = [])}>{$T("widget.mission.cancel")}</button>
            </div>
          {:else if mode !== "idle"}
            <button class="{modeBtn} ml-auto border-(--green-color) bg-(--green-color) text-white" onclick={() => (mode = "idle")}
              >{$T("widget.mission.finish")}</button
            >
          {/if}
        </div>
        <p class="m-0 text-[12px] leading-snug text-(--muted-color)">
          {#if draft.length}
            {$T("widget.mission.helpDraw")}
          {:else if mode === "field" && drawing}
            {$T("widget.mission.helpField")} {$T("widget.mission.helpDraw")}
          {:else if mode === "field"}
            {$T("widget.mission.helpEditField")}
          {:else if mode === "hole"}
            {$T("widget.mission.helpHole")}
          {:else if !hasField}
            {$T("widget.mission.helpEmpty")}
          {:else}
            {$T("widget.mission.helpIdle")}
          {/if}
        </p>
      </div>

      <div style="height: {height}px">
        <MapLibre
          bind:map={mapInstance}
          class="h-full w-full overflow-hidden rounded-[14px] border border-(--hairline-color)"
          style={isDarkMode
            ? "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
            : "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"}
          zoom={15}
          center={fields[0]?.[0] ? { lng: fields[0][0][0], lat: fields[0][0][1] } : { lng: 27.559, lat: 53.9006 }}
          maxPitch={0}
        >
          <NavigationControl />
          <ScaleControl />
          <FullScreenControl />

          <MissionLayers
            zones={zonesGeo}
            path={pathGeo}
            draft={draftGeo}
            handles={handlesGeo}
            {drawing}
            {onMapClick}
            onMapDblClick={finishDraw}
            {onDrag}
            {onDragEnd}
            {onHandleRightClick}
            onCursor={(ll) => (cursor = ll)}
          />
          {@render overlay?.()}
        </MapLibre>
      </div>

      <!-- Маршрут и внесение, итог: свёрнуты по умолчанию, в заголовке краткая сводка -->
      <div class="flex flex-col gap-3">
        <div class={card}>
          {@render head(
            "settings",
            $T("widget.mission.settings"),
            [
              `${$T(fieldList.length > 1 ? "widget.mission.s.angles" : "widget.mission.s.angle")} ${fieldList.map((f) => `${fmt(f.angle, 0)}°`).join(" / ") || "—"}`,
              `${$T("widget.mission.s.swath")} ${plan.spacing} ${$T("widget.mission.m")}`,
              `${$T("widget.mission.s.alt")} ${plan.alt} ${$T("widget.mission.m")}`,
              `${$T("widget.mission.s.speed")} ${plan.speed} ${$T("widget.mission.ms")}`,
              `${$T("widget.mission.s.rate")} ${plan.rate} ${$T("widget.mission.lha")}`,
              `${$T("widget.mission.s.tank")} ${plan.tank} ${$T("widget.mission.l")}`,
            ].join(" · "),
          )}
          {#if open.settings}
            <!-- Слева маршрут, справа внесение; на узком экране друг под другом -->
            <div class="grid grid-cols-1 divide-y divide-(--hairline-color) md:grid-cols-2 md:divide-x md:divide-y-0" transition:slide={{ duration: 150 }}>
              <div class="flex flex-col gap-3 pb-3 md:pr-4 md:pb-0">
                <span class="text-[11px] font-semibold tracking-wide text-(--faint-color) uppercase">{$T("widget.mission.passes")}</span>
                <div class="flex items-end gap-2">
                  <UI.Slider
                    wrapperClass="flex-1"
                    label={{ name: `${$T(fieldList.length > 1 ? "widget.mission.angleAll" : "widget.mission.angle")}: ${fmt(allAngle, 1)}°` }}
                    value={allAngle}
                    number={{ minNum: 0, maxNum: 179, step: 1 }}
                    onUpdate={(v) => setAllAngles(v as number)}
                  />
                  <UI.Button
                    wrapperClass="w-auto"
                    componentClass="bg-blue"
                    content={{ name: $T("widget.mission.auto"), info: { text: $T("widget.mission.autoHint"), side: "top" } }}
                    disabled={!hasField}
                    onClick={autoAngle}
                  />
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <div use:hint={{ text: $T("widget.mission.hint.spacing"), enabled: $hints }}>
                    <UI.Input type="number" label={{ name: $T("widget.mission.spacing") }} {...numField("spacing", 0.5, 100, 0.5)} />
                  </div>
                  <div use:hint={{ text: $T("widget.mission.hint.margin"), enabled: $hints }}>
                    <UI.Input type="number" label={{ name: $T("widget.mission.margin") }} {...numField("margin", 0, 50, 0.5)} />
                  </div>
                  <UI.Input type="number" label={{ name: $T("widget.mission.alt") }} {...numField("alt", 1, 200, 0.5)} />
                  <UI.Input type="number" label={{ name: $T("widget.mission.speed") }} {...numField("speed", 0.5, 30, 0.5)} />
                </div>
                <label class="flex items-center gap-2 text-[13px]">
                  <input type="checkbox" checked={plan.returnHome} onchange={(e) => update({ returnHome: e.currentTarget.checked })} />
                  {$T("widget.mission.returnHome")}
                </label>
              </div>
              <div class="flex flex-col gap-3 pt-3 md:pt-0 md:pl-4">
                <span class="text-[11px] font-semibold tracking-wide text-(--faint-color) uppercase">{$T("widget.mission.spraying")}</span>
                <div class="grid grid-cols-2 gap-2">
                  <UI.Input type="number" label={{ name: $T("widget.mission.rate") }} {...numField("rate", 0, 500, 0.5)} />
                  <UI.Input type="number" label={{ name: $T("widget.mission.tank") }} {...numField("tank", 1, 1000, 1)} />
                </div>
                <div class="flex flex-col gap-1.5 text-[13px]">
                  <span class="w-max text-(--muted-color)" use:hint={{ text: $T("widget.mission.hint.sprayControl"), enabled: $hints }}
                    >{$T("widget.mission.sprayControl")}</span
                  >
                  {#each sprayModes as m}
                    <label class="flex cursor-pointer items-start gap-2">
                      <input type="radio" class="mt-0.5" name="sprayControl" checked={plan.sprayControl === m} onchange={() => update({ sprayControl: m })} />
                      <span>{$T(`widget.mission.spray.${m}`)}</span>
                    </label>
                  {/each}
                  {#if plan.sprayControl === "none"}
                    <p class="m-0 text-[12px] text-(--red-color)">{$T("widget.mission.spray.noneWarn")}</p>
                  {/if}
                </div>
                {#if plan.sprayControl === "servo"}
                  <div class="grid grid-cols-3 gap-2">
                    <UI.Input type="number" label={{ name: $T("widget.mission.servoChannel") }} {...numField("servoChannel", 1, 16, 1)} />
                    <UI.Input type="number" label={{ name: $T("widget.mission.servoOn") }} {...numField("servoOn", 800, 2200, 10)} />
                    <UI.Input type="number" label={{ name: $T("widget.mission.servoOff") }} {...numField("servoOff", 800, 2200, 10)} />
                  </div>
                {/if}
              </div>
            </div>
          {/if}
        </div>

        <div class={card}>
          {@render head(
            "summary",
            $T("widget.mission.summary"),
            [
              hasField ? `${$T("widget.mission.s.fields")}: ${fields.length}` : $T("widget.mission.noField"),
              `${$T("widget.mission.s.holes")}: ${plan.holes.length}`,
              ...(stats
                ? [
                    `${$T("widget.mission.s.area")} ${fmt(stats.ha, 2)} ${$T("widget.mission.ha")}`,
                    `${$T("widget.mission.s.path")} ${fmt(stats.total, 2)} ${$T("widget.mission.km")}`,
                    `${$T("widget.mission.s.time")} ${fmt(stats.timeMin, 0)} ${$T("widget.mission.min")}`,
                    `${$T("widget.mission.s.liquid")} ${fmt(stats.liquid, 0)} ${$T("widget.mission.l")}`,
                  ]
                : []),
            ].join(" · "),
          )}
          {#if open.summary}
            <!-- Слева контуры, справа расчёт; на узком экране друг под другом -->
            <div class="grid grid-cols-1 divide-y divide-(--hairline-color) md:grid-cols-2 md:divide-x md:divide-y-0" transition:slide={{ duration: 150 }}>
              <div class="flex flex-col gap-3 pb-3 md:pr-4 md:pb-0">
                <span class="text-[11px] font-semibold tracking-wide text-(--faint-color) uppercase">{$T("widget.mission.zones")}</span>
                <div class="flex flex-col gap-1.5 rounded-lg bg-(--container-color) p-3 text-[13px] tabular-nums">
                  {#each fields as field, i}
                    <div class="flex items-center justify-between gap-2">
                      <span class="flex items-center gap-2"><span class="size-2.5 rounded-sm bg-[#16a34a]"></span>{$T("widget.mission.field")} {i + 1}</span>
                      <span class="flex items-center gap-3">
                        <span class="flex items-center gap-1" use:hint={{ text: $T("widget.mission.hint.fieldAngle"), enabled: $hints }}>
                          <UI.Input
                            wrapperClass="w-20"
                            type="number"
                            value={fieldList[i].angle}
                            number={{ minNum: 0, maxNum: 179.5, step: 0.5 }}
                            onUpdate={(v) => Number.isFinite(Number(v)) && setFieldAngle(i, Math.min(179.5, Math.max(0, Number(v))))}
                          />°
                        </span>
                        <span class="w-16 text-right font-semibold">{areaText(fieldArea(field, []))}</span>
                        <button class="cursor-pointer border-none bg-transparent p-0 text-(--red-color)" onclick={() => removeField(i)} aria-label="Delete"
                          >✕</button
                        >
                      </span>
                    </div>
                  {:else}
                    <span class="text-(--muted-color)">{$T("widget.mission.noField")}</span>
                  {/each}
                  {#each plan.holes as hole, i}
                    <div class="flex items-center justify-between gap-2">
                      <span class="flex items-center gap-2"><span class="size-2.5 rounded-sm bg-[#dc2626]"></span>{$T("widget.mission.hole")} {i + 1}</span>
                      <span class="flex items-center gap-2">
                        <span class="font-semibold">{areaText(fieldArea(hole, []))}</span>
                        <button class="cursor-pointer border-none bg-transparent p-0 text-(--red-color)" onclick={() => removeHole(i)} aria-label="Delete"
                          >✕</button
                        >
                      </span>
                    </div>
                  {/each}
                  {#if plan.start}
                    <div class="flex items-center gap-2">
                      <span class="size-2.5 rounded-full bg-[#3b82f6]"></span>{$T("widget.mission.start")}
                    </div>
                  {/if}
                </div>
                {#if stats}
                  <!-- Что из контуров получается к обработке -->
                  <div class="grid grid-cols-2 gap-x-4 gap-y-1.5 rounded-lg bg-(--container-color) p-3 text-[13px] tabular-nums">
                    <span class="text-(--muted-color)">{$T("widget.mission.area")}</span><span class="text-right font-semibold"
                      >{fmt(stats.ha, 2)} {$T("widget.mission.ha")}</span
                    >
                    <span class="text-(--muted-color)" use:hint={{ text: $T("widget.mission.hint.coverage"), enabled: $hints }}
                      >{$T("widget.mission.coverage")}</span
                    ><span class="text-right font-semibold">{fmt(stats.coverage, 0)} %</span>
                  </div>
                {/if}
                {#if fields.length || plan.holes.length}
                  <button class="w-max cursor-pointer border-none bg-transparent p-0 text-[12px] text-(--red-color) underline" onclick={clearAll}>
                    {$T("widget.mission.clear")}
                  </button>
                {/if}
              </div>

              <div class="flex flex-col gap-3 pt-3 md:pt-0 md:pl-4">
                <span class="text-[11px] font-semibold tracking-wide text-(--faint-color) uppercase">{$T("widget.mission.calc")}</span>
                {#if stats}
                  <div class="grid grid-cols-2 gap-x-4 gap-y-1.5 rounded-lg bg-(--container-color) p-3 text-[13px] tabular-nums">
                    <span class="text-(--muted-color)" use:hint={{ text: $T("widget.mission.hint.passes"), enabled: $hints }}
                      >{$T("widget.mission.passesCount")}</span
                    ><span class="text-right font-semibold">{stats.passes} / {stats.cells}</span>
                    <span class="text-(--muted-color)">{$T("widget.mission.turns")}</span><span class="text-right font-semibold">{stats.turns}</span>
                    <span class="text-(--muted-color)">{$T("widget.mission.sprayLen")}</span><span class="text-right font-semibold"
                      >{fmt(stats.spray, 2)} {$T("widget.mission.km")}</span
                    >
                    <span class="text-(--muted-color)">{$T("widget.mission.totalLen")}</span><span class="text-right font-semibold"
                      >{fmt(stats.total, 2)} {$T("widget.mission.km")}</span
                    >
                    <span class="text-(--muted-color)" use:hint={{ text: $T("widget.mission.hint.time"), enabled: $hints }}>{$T("widget.mission.time")}</span
                    ><span class="text-right font-semibold">{fmt(stats.timeMin, 0)} {$T("widget.mission.min")}</span>
                    <span class="text-(--muted-color)">{$T("widget.mission.liquid")}</span><span class="text-right font-semibold"
                      >{fmt(stats.liquid, 0)} {$T("widget.mission.l")}</span
                    >
                    <span class="text-(--muted-color)" use:hint={{ text: $T("widget.mission.hint.refills"), enabled: $hints }}
                      >{$T("widget.mission.refills")}</span
                    ><span class="text-right font-semibold">{stats.refills}</span>
                    <span class="text-(--muted-color)">{$T("widget.mission.waypoints")}</span><span class="text-right font-semibold">{stats.waypoints}</span>
                  </div>
                  <div class="flex flex-wrap gap-3 text-[11px] text-(--muted-color)">
                    <span class="flex items-center gap-1"><span class="h-0.5 w-4 bg-[#15803d]"></span>{$T("widget.mission.legendSpray")}</span>
                    <span class="flex items-center gap-1"><span class="h-0.5 w-4 bg-[#f59e0b]"></span>{$T("widget.mission.legendTurn")}</span>
                    <span class="flex items-center gap-1"
                      ><span class="h-0.5 w-4 border-t-2 border-dashed border-[#3b82f6]"></span>{$T("widget.mission.legendTransit")}</span
                    >
                  </div>
                {:else}
                  <p class="m-0 text-[13px] text-(--muted-color)">{$T("widget.mission.empty")}</p>
                {/if}
              </div>
            </div>
          {/if}
          {#if stats?.unreachable}
            <p class="m-0 text-[12px] text-(--red-color)">{$T("widget.mission.unreachable")}: {stats.unreachable}</p>
          {/if}
        </div>
      </div>

      <!-- Выгрузка миссии -->
      <div class="grid grid-cols-3 gap-3">
        <div class="min-w-0" use:hint={{ text: $T("widget.mission.hint.download"), enabled: $hints }}>
          <UI.Button componentClass="bg-blue" content={{ name: $T("widget.mission.download") }} disabled={!stats} onClick={download} />
        </div>
        <div class="min-w-0" use:hint={{ text: $T("widget.mission.hint.copy"), enabled: $hints }}>
          <UI.Button
            componentClass="bg-blue"
            content={{ name: copied ? $T("widget.mission.copied") : $T("widget.mission.copy") }}
            disabled={!stats}
            onClick={copy}
          />
        </div>
        <div class="min-w-0" use:hint={{ text: $T("widget.mission.hint.send"), enabled: $hints }}>
          <UI.Button
            componentClass={sendState === "error" ? "bg-red" : "bg-blue"}
            content={{ name: $T(`widget.mission.send.${sendState}`) }}
            disabled={!stats || !onSend || sendState === "busy"}
            onClick={send}
          />
        </div>
      </div>
    </div>
  {/if}
</div>
