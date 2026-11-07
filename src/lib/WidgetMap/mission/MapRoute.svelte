<!-- $lib/WidgetMap/mission/MapRoute.svelte - режим «Маршрут» карты, обычный планировщик миссии: оператор ставит точки на карте, задаёт каждой высоту и скорость, виджет считает путь и время и выгружает миссию -->
<script lang="ts">
  import { onMount, untrack, type Snippet } from "svelte"
  import { slide } from "svelte/transition"
  import { twMerge } from "tailwind-merge"
  import { T } from "../../locales/i18n"
  import WidgetHeader from "../../WidgetHeader.svelte"
  import { hint, hintsSetting } from "../../hints"
  import { readMapColors, widgetAccentStyle, type IMapColors } from "../../widgetAccent"
  import { readPersistedCollapsed, writePersistedCollapsed } from "../../widgetCollapse"
  import * as UI from "../.."
  import { MapLibre, NavigationControl, ScaleControl, FullScreenControl, CustomControl } from "../mapWrapper"
  import MissionLayers from "./MissionLayers.svelte"
  import MissionSim from "./MissionSim.svelte"
  import { missionProgress } from "./progress"
  import MapIcon from "../MapIcon.svelte"
  import ArrowIcon from "../../libIcons/ArrowIcon.svelte"
  import type { LngLat } from "./coverage"
  import { DEFAULT_ROUTE_PLAN, ROUTE_FIRST_ALT, ROUTE_FIRST_SPEED, routeLegs, routeStats, routeMission, type IRoutePlan, type IRouteWaypoint } from "./route"

  /* Режим «Маршрут» карты: часть пропсов WidgetMap */
  interface Props {
    wrapperClass?: string
    componentClass?: string
    label?: { name?: string }
    height?: number
    route?: IRoutePlan
    collapsed?: boolean
    persistKey?: string
    overlay?: Snippet /* Аппараты карты поверх миссии */
    simulate?: boolean /* Имитация полёта по маршруту */
    vehicle?: { point: LngLat; wpNum?: number } /* Аппарат из первой группы карты: положение и номер текущей команды миссии */
    onRouteChange?: (route: IRoutePlan) => void
    onSend?: (mission: string, route: IRoutePlan) => void | Promise<void>
  }

  let {
    wrapperClass = "",
    componentClass = "",
    label = {},
    height = 520,
    route = $bindable(structuredClone(DEFAULT_ROUTE_PLAN)),
    collapsed = $bindable(false),
    persistKey,
    overlay,
    simulate = false,
    vehicle,
    onRouteChange,
    onSend,
  }: Props = $props()

  const hints = $derived(hintsSetting("WidgetMap", persistKey))
  let accentStyle = $derived(widgetAccentStyle(componentClass ?? ""))

  let hasMergedPersisted = false
  $effect(() => {
    if (hasMergedPersisted) return
    hasMergedPersisted = true
    const persisted = readPersistedCollapsed(persistKey, collapsed)
    if (persisted !== collapsed) collapsed = persisted
  })
  $effect(() => writePersistedCollapsed(persistKey, collapsed))

  /* Пока тянут точку, маршрут наружу не отдаётся: владелец получает его один раз, когда точку отпустили */
  let dragging = false
  const update = (patch: Partial<IRoutePlan>) => {
    route = { ...route, ...patch }
    if (!dragging) onRouteChange?.(route)
  }

  /* ********************************************************** */
  /* Точки: добавление кликом, перетаскивание, вставка за середину отрезка, удаление правым кликом */

  let adding = $state(false)
  let selected: number | null = $state(null)
  let mapInstance: any = $state()

  const onMapClick = (ll: LngLat) => {
    if (!adding) return
    const prev = route.points[route.points.length - 1]
    update({ points: [...route.points, { point: ll, alt: prev?.alt ?? ROUTE_FIRST_ALT, speed: prev?.speed ?? ROUTE_FIRST_SPEED }] })
    selected = route.points.length - 1
  }

  /* Ручки: w:i - точка, x:i - середина отрезка от точки i к следующей, s - точка взлёта */
  let inserted: { id: string; index: number } | null = null
  const onDrag = (id: string, ll: LngLat) => {
    dragging = true
    const [kind, i] = id.split(":")
    if (kind === "s") return update({ start: ll })
    const idx = Number(i)
    const pts = [...route.points]
    if (kind === "w") {
      pts[idx] = { ...pts[idx], point: ll }
      selected = idx
      return update({ points: pts })
    }
    if (inserted?.id !== id) {
      const alt = Math.round((pts[idx].alt + pts[idx + 1].alt) / 2)
      pts.splice(idx + 1, 0, { point: ll, alt, speed: pts[idx + 1].speed })
      inserted = { id, index: idx + 1 }
    } else pts[inserted.index] = { ...pts[inserted.index], point: ll }
    selected = inserted.index
    update({ points: pts })
  }
  const onDragEnd = () => {
    inserted = null
    dragging = false
    onRouteChange?.(route)
  }

  const removePoint = (i: number) => {
    update({ points: route.points.filter((_, k) => k !== i) })
    selected = null
  }
  const onHandleRightClick = (id: string) => {
    const [kind, i] = id.split(":")
    if (kind === "w") removePoint(Number(i))
  }
  const setPoint = (i: number, patch: Partial<IRouteWaypoint>) => update({ points: route.points.map((p, k) => (k === i ? { ...p, ...patch } : p)) })
  const clearAll = () => {
    update({ points: [] })
    selected = null
  }

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") adding = false
  }

  /* ********************************************************** */
  /* Расчёт и GeoJSON */

  let stats = $derived(routeStats(route))
  let simProgress = $state(0)
  let legs = $derived(routeLegs(route))

  let pathGeo = $derived({
    type: "FeatureCollection",
    features:
      legs.nodes.length >= 2
        ? [{ type: "Feature", properties: { kind: "route" }, geometry: { type: "LineString", coordinates: legs.nodes.map((n) => n.point) } }]
        : [],
  })
  let handlesGeo = $derived.by(() => {
    const features: any[] = []
    const point = (ll: LngLat, props: object) => features.push({ type: "Feature", properties: props, geometry: { type: "Point", coordinates: ll } })
    /* В режиме правки точки перетаскиваются и есть середины отрезков, иначе только номера */
    if (adding)
      route.points.forEach((p, i) => {
        const next = route.points[i + 1]
        if (next) point([(p.point[0] + next.point[0]) / 2, (p.point[1] + next.point[1]) / 2], { id: `x:${i}`, role: "mid", kind: "route" })
      })
    route.points.forEach((p, i) => point(p.point, { id: `${adding ? "w" : "n"}:${i}`, role: "wp", kind: "route", label: String(i + 1) }))
    if (route.start) point(route.start, { id: "s", role: "start", kind: "start", label: "H" })
    return { type: "FeatureCollection", features }
  })
  const empty = { type: "FeatureCollection", features: [] }

  /* ********************************************************** */
  /* Вид карты и выгрузка */

  const fitRoute = () => {
    const pts = [...route.points.map((p) => p.point), ...(route.start ? [route.start] : [])]
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
      untrack(fitRoute)
    }
  })

  /* Миссия и номера её точек: выгрузка и прогресс реального полёта по WPNum */
  let mission = $derived(routeMission(route))
  const missionText = () => mission.text
  let live = $derived(simulate ? null : missionProgress(mission.nav, vehicle?.wpNum, vehicle?.point))
  let headerProgress = $derived(simulate ? simProgress : (live?.fraction ?? null))
  const download = () => {
    const text = missionText()
    if (!text) return
    const a = document.createElement("a")
    a.href = URL.createObjectURL(new Blob([text], { type: "text/plain" }))
    a.download = `route_${new Date().toISOString().slice(0, 16).replace(/[-:T]/g, "")}.waypoints`
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
      await onSend(text, $state.snapshot(route))
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
  /* Цвета слоёв карты перечитываются при смене мастер-цвета и темы */
  let mapColors = $state<IMapColors>(readMapColors(undefined))
  $effect(() => {
    void accentStyle
    void isDarkMode
    mapColors = readMapColors(rootEl)
  })

  const fmt = (v: number, d = 1) => v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d })
  /* Кнопки панели на карте: стили кнопок MapLibre (размер 29px, прозрачный фон, без рамки) перебиваются */
  const mapBtn =
    "flex! h-auto! w-auto! cursor-pointer items-center gap-2 rounded-md! border! border-solid! px-2.5! py-1! text-[12px] font-semibold whitespace-nowrap text-(--font-color) transition disabled:cursor-not-allowed disabled:opacity-50"
  const mapBtnIdle = "border-(--hairline-color)! bg-(--back-color)! hover:border-(--accent-color)!"
  const mapBtnOn = "border-(--accent-color)! bg-[color-mix(in_srgb,var(--accent-color)_15%,var(--back-color))]!"
  const mapBtnMain = "border-(--accent-color)! bg-(--accent-color)! text-(--on-accent)!"
  type Section = "summary"
  let open = $state<Record<Section, boolean>>({ summary: false })
  /* Сетка строки точки: ручка, номер, высота, скорость, расстояние от прошлой, удаление */
  const ROW_GRID = "grid-cols-[1.25rem_1.5rem_8rem_8rem_minmax(6rem,1fr)_1rem]"
  let listEl: HTMLDivElement | undefined = $state()
  const listId = Math.floor(Math.random() * 1e6)
  const card = "flex flex-col gap-3 rounded-[10px] border border-(--hairline-color) bg-(--back-color) p-3"
  const km = (m: number) => `${fmt(m / 1000, 2)} ${$T("widget.mission.km")}`
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
  <WidgetHeader icon={MapIcon} label={label?.name || $T("widget.route.title")} bind:collapsed {hints}>
    {#snippet right()}
      <span class="flex items-center gap-3 text-[12px] font-semibold text-(--muted-color) tabular-nums">
        {#if headerProgress !== null}
          <span class="flex items-center gap-1.5" title={simulate ? $T("widget.sim.title") : $T("widget.mission.progressHint")}>
            <span class="h-1.5 w-14 overflow-hidden rounded-full bg-(--hairline-color)"
              ><span class="block h-full rounded-full bg-(--accent-color)" style="width: {Math.round(headerProgress * 100)}%"></span></span
            >
            {Math.round(headerProgress * 100)}%{#if live}
              · {live.finished
                ? $T("widget.route.finished")
                : live.target > route.points.length
                  ? $T("widget.route.returning")
                  : `${$T("widget.route.toPoint")} ${live.target}/${route.points.length}`}{/if}
          </span>
        {/if}
        <span>{stats.points} {$T("widget.route.pts")} · {km(stats.length)}</span>
      </span>
    {/snippet}
  </WidgetHeader>

  {#if !collapsed}
    <div transition:slide={{ duration: 150 }} class="flex flex-col gap-4">
      <div style="height: {height}px">
        <MapLibre
          bind:map={mapInstance}
          class="h-full w-full overflow-hidden rounded-[14px] border border-(--hairline-color)"
          style={isDarkMode
            ? "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
            : "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"}
          zoom={15}
          center={route.start ? { lng: route.start[0], lat: route.start[1] } : { lng: 27.559, lat: 53.9006 }}
          maxPitch={0}
        >
          <NavigationControl />
          <ScaleControl />
          <FullScreenControl />
          <!-- Редактор точек прямо на карте -->
          <CustomControl position="top-left">
            <div class="flex flex-wrap items-center gap-1.5 rounded-[4px] bg-(--back-color) p-1.5">
              <button
                class="{mapBtn} {adding ? mapBtnOn : mapBtnIdle}"
                onclick={() => (adding = !adding)}
                use:hint={{ text: $T("widget.route.hint.add"), enabled: $hints }}
              >
                <span class="size-3 shrink-0 rounded-full border-2 border-white bg-(--accent-color) outline outline-(--accent-color)"></span>
                {$T("widget.route.add")}
              </button>
              {#if adding}
                <button class="{mapBtn} {mapBtnMain}" onclick={() => (adding = false)}>{$T("widget.mission.finish")}</button>
              {/if}
            </div>
          </CustomControl>
          <MissionLayers
            zones={empty}
            path={pathGeo}
            draft={empty}
            handles={handlesGeo}
            drawing={adding}
            {onMapClick}
            onMapDblClick={() => (adding = false)}
            {onDrag}
            {onDragEnd}
            {onHandleRightClick}
            colors={mapColors}
            onCursor={() => {}}
          />
          {@render overlay?.()}
          {#if simulate}
            <MissionSim path={legs.nodes} colors={mapColors} bind:progress={simProgress} />
          {/if}
        </MapLibre>
      </div>

      <!-- Итог: расчёт и точки с высотой и скоростью; свёрнут по умолчанию, в заголовке краткая сводка -->
      <div class={card}>
        {@render head(
          "summary",
          $T("widget.mission.summary"),
          [
            `${$T("widget.route.s.points")} ${stats.points}`,
            `${$T("widget.route.s.maxAlt")} ${stats.maxAlt} ${$T("widget.mission.m")}`,
            `${$T("widget.mission.s.path")} ${km(stats.length)}`,
            `${$T("widget.mission.s.time")} ${fmt(stats.timeMin, 0)} ${$T("widget.mission.min")}`,
          ].join(" · "),
        )}
        {#if open.summary}
          <!-- Сверху расчёт, ниже точки на всю ширину: у каждой высота и скорость -->
          <div class="flex flex-col gap-3" transition:slide={{ duration: 150 }}>
            <!-- Расчёт в два столбца через вертикальный разделитель: слева точки и высота, справа путь и время -->
            <div class="grid grid-cols-2 divide-x divide-(--border-color) rounded-lg bg-(--container-color) py-3 text-[13px] tabular-nums">
              <div class="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1.5 px-3">
                <span class="text-(--muted-color)">{$T("widget.route.points")}</span><span class="text-right font-semibold">{stats.points}</span>
                <span class="text-(--muted-color)">{$T("widget.route.maxAlt")}</span><span class="text-right font-semibold"
                  >{stats.maxAlt} {$T("widget.mission.m")}</span
                >
              </div>
              <div class="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1.5 px-3">
                <span class="text-(--muted-color)">{$T("widget.mission.totalLen")}</span><span class="text-right font-semibold">{km(stats.length)}</span>
                <span class="text-(--muted-color)" use:hint={{ text: $T("widget.route.hint.time"), enabled: $hints }}>{$T("widget.mission.time")}</span>
                <span class="text-right font-semibold">{fmt(stats.timeMin, 0)} {$T("widget.mission.min")}</span>
              </div>
            </div>
            <span class="text-[11px] font-semibold tracking-wide text-(--faint-color) uppercase">{$T("widget.route.points")}</span>
            {#if route.points.length}
              <!-- Строки переставляются ручкой, как списки в панелях свойств (Dragging) -->
              <div class="grid {ROW_GRID} items-end gap-x-3 border border-transparent px-2 text-[11px] leading-tight text-(--faint-color)">
                <span></span>
                <span>№</span>
                <span use:hint={{ text: $T("widget.route.hint.alt"), enabled: $hints }}>{$T("widget.route.alt")}</span>
                <span use:hint={{ text: $T("widget.route.hint.speed"), enabled: $hints }}>{$T("widget.mission.speed")}</span>
                <span class="text-right whitespace-nowrap">{$T("widget.route.leg")}</span>
                <span></span>
              </div>
              <!-- Строки списком с разделителями; выше семи строк список прокручивается -->
              <div
                bind:this={listEl}
                class="flex max-h-[17.5rem] flex-col divide-y divide-(--hairline-color) overflow-y-auto rounded-lg border border-(--hairline-color) bg-(--container-color)/60 text-[13px] tabular-nums"
              >
                {#each route.points as p, i}
                  {@const leg = legs.legs[route.start ? i : i - 1]}
                  <div id="item-{i}-{listId}" class="grid {ROW_GRID} items-center gap-x-3 px-2 py-1">
                    <UI.Dragging
                      wrapperClass="size-5"
                      container={listEl!}
                      array={[...route.points]}
                      elementIndex={i}
                      containerIndex={listId}
                      onUpdate={(arr) => update({ points: [...arr] })}
                    />
                    <button
                      class="flex size-6 cursor-pointer items-center justify-center rounded-full border-none bg-(--accent-color) text-[11px] font-semibold text-(--on-accent) {selected ===
                      i
                        ? 'ring-2 ring-(--font-color) ring-offset-1 ring-offset-(--back-color)'
                        : ''}"
                      onclick={() => {
                        selected = i
                        mapInstance?.easeTo({ center: p.point, duration: 300 })
                      }}>{i + 1}</button
                    >
                    <UI.Input
                      type="number"
                      value={p.alt}
                      number={{ minNum: 1, maxNum: 500, step: 1 }}
                      onUpdate={(v) => Number.isFinite(Number(v)) && setPoint(i, { alt: Math.min(500, Math.max(1, Number(v))) })}
                    />
                    <UI.Input
                      type="number"
                      value={p.speed}
                      number={{ minNum: 0.5, maxNum: 40, step: 0.5 }}
                      onUpdate={(v) => Number.isFinite(Number(v)) && setPoint(i, { speed: Math.min(40, Math.max(0.5, Number(v))) })}
                    />
                    <span class="text-right text-(--muted-color)">{leg ? `${fmt(leg.length, 0)} ${$T("widget.mission.m")}` : "-"}</span>
                    <button class="cursor-pointer border-none bg-transparent p-0 text-(--red-text)" onclick={() => removePoint(i)} aria-label="Delete">✕</button
                    >
                  </div>
                {/each}
              </div>
            {:else}
              <p class="m-0 text-[13px] text-(--muted-color)">{$T("widget.route.helpEmpty")}</p>
            {/if}
            <label class="flex items-center gap-2 text-[13px]" use:hint={{ text: $T("widget.route.hint.rtl"), enabled: $hints }}>
              <input type="checkbox" checked={route.returnHome} onchange={(e) => update({ returnHome: e.currentTarget.checked })} />
              {$T("widget.route.returnHome")}
            </label>
            {#if route.points.length}
              <button class="w-max cursor-pointer border-none bg-transparent p-0 text-[12px] text-(--red-text) underline" onclick={clearAll}
                >{$T("widget.mission.clear")}</button
              >
            {/if}
          </div>
        {/if}
      </div>

      <!-- Выгрузка миссии -->
      <div class="grid grid-cols-3 gap-3">
        <div class="min-w-0" use:hint={{ text: $T("widget.mission.hint.download"), enabled: $hints }}>
          <UI.Button componentClass="bg-accent" content={{ name: $T("widget.mission.download") }} disabled={!route.points.length} onClick={download} />
        </div>
        <div class="min-w-0" use:hint={{ text: $T("widget.mission.hint.copy"), enabled: $hints }}>
          <UI.Button
            componentClass="bg-accent"
            content={{ name: copied ? $T("widget.mission.copied") : $T("widget.mission.copy") }}
            disabled={!route.points.length}
            onClick={copy}
          />
        </div>
        <div class="min-w-0" use:hint={{ text: $T("widget.mission.hint.send"), enabled: $hints }}>
          <UI.Button
            componentClass={sendState === "error" ? "bg-red" : "bg-accent"}
            content={{ name: $T(`widget.mission.send.${sendState}`) }}
            disabled={!route.points.length || !onSend || sendState === "busy"}
            onClick={send}
          />
        </div>
      </div>
    </div>
  {/if}
</div>
