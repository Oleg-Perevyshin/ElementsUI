<!-- $lib/WidgetMap/WidgetMap.svelte - смарт-виджет «Карта», режим «Объекты» (по умолчанию), «Маршрут» (планировщик миссии, mission/MapRoute.svelte) или «Агро» (генератор миссии, mission/MapAgro.svelte); аппараты из групп полей рисуются во всех режимах. Режим «Объекты»: объекты из групп полей устройства (по умолчанию MAV) с полями Lat/Lon/Alt/Heading/Sat/DevName/DevSN (см. IWidgetMapData), каждая группа - свой маркер и своя траектория. Только отображение: ничего не отправляет и не знает про DeviceStore/WebSocket. Траекторию, длину трека и таймаут маркеров оператор переключает прямо поверх карты, «Показать все» - кнопка в шапке; вид карта сама не меняет - объектов может быть много. -->
<script lang="ts">
  import { sanitizeHtml } from "../html"
  import { isDarkTheme, watchTheme } from "../themeWatch"
  import { onMount, untrack } from "svelte"
  import { slide } from "svelte/transition"
  import { twMerge } from "tailwind-merge"
  import { T } from "../locales/i18n"
  import type { IWidgetMapProps, IWidgetMapData } from "../types"
  import CopiedChip from "../CopiedChip.svelte"
  import WidgetHeader from "../WidgetHeader.svelte"
  import { hint, hintsSetting } from "../hints"
  import { widgetAccentStyle } from "../widgetAccent"
  import { readPersistedCollapsed, writePersistedCollapsed } from "../widgetCollapse"
  import MapIcon from "./MapIcon.svelte"
  import { createFlightSim, HOME } from "../flightSim"
  import FitIcon from "./FitIcon.svelte"
  import MapAgro from "./mission/MapAgro.svelte"
  import MapRoute from "./mission/MapRoute.svelte"
  import { DEFAULT_MISSION_PLAN } from "./mission/plan"
  import { DEFAULT_ROUTE_PLAN } from "./mission/route"
  import * as UI from ".."
  import { MapLibre, NavigationControl, ScaleControl, GeolocateControl, FullScreenControl, Marker, Popup, Line, CustomControl } from "./mapWrapper"

  let {
    wrapperClass = "",
    componentClass = "",
    label = {},
    groups = ["MAV"],
    value: deviceValue,
    height = 400,
    markerIcon,
    trackEnabled = $bindable(false),
    trackLength = $bindable(1000),
    markerTimeout = $bindable(30_000),
    isTest = false,
    collapsed = $bindable(false),
    persistKey,
    mode = "objects",
    /* Значения по умолчанию обязательны: режимы получают их через bind:, а bind к undefined при запасном значении Svelte запрещает */
    plan = $bindable(structuredClone(DEFAULT_MISSION_PLAN)),
    onPlanChange,
    route = $bindable(structuredClone(DEFAULT_ROUTE_PLAN)),
    onRouteChange,
    onSend,
  }: IWidgetMapProps = $props()

  /* Подсказки - кнопка «?» в шапке, выбор общий для всех WidgetMap */
  const hints = $derived(hintsSetting("WidgetMap", persistKey))

  let accentStyle = $derived(widgetAccentStyle(componentClass ?? ""))

  /* Сворачивание тела по клику на шапку - как у остальных смарт-виджетов (см. WidgetWiFi.svelte) */
  /* Выбор пользователя в этом браузере применяется до первой отрисовки, без мигания; значение из GUI запоминается, чтобы его смена отменяла старый выбор */
  const guiCollapsed = untrack(() => collapsed)
  collapsed = readPersistedCollapsed(
    untrack(() => persistKey),
    guiCollapsed,
  )
  $effect(() => writePersistedCollapsed(persistKey, collapsed, guiCollapsed))

  interface Board {
    group: string
    lat: number
    lon: number
    alt: number
    heading: number
    sat: number
    name: string
    sn: string
    track: [number, number][]
    lastChange: number
    hiddenAt: number
  }

  const num = (v: unknown, fallback = 0) => (typeof v === "number" && Number.isFinite(v) ? v : fallback)
  /* (0, 0) и нечисловые координаты - признак отсутствия фикса */
  const hasFix = (lat: unknown, lon: unknown) => Number.isFinite(lat) && Number.isFinite(lon) && (lat !== 0 || lon !== 0)

  /* Режим имитации: шесть аппаратов над одним районом сами выходят на связь и пропадают, данные и группы устройства не учитываются */
  const SIM_COUNT = 6
  const SIM_ONLINE = 3
  const SIM_GROUPS = Array.from({ length: SIM_COUNT }, (_, i) => `SIM-${i + 1}`)
  const SIM_SN = [
    "10.10.001-01_0000804500006B3600004000:F76F",
    "10.10.001-01_0000441B0000F68C0000561C:36B1",
    "20.00.000-01_000068B60000B33B0000A520:5180",
    "00.00.000-00_0000AC670000B22B00007428:DBC5",
    "25.00.000-02_0000A0850000E31300004C5C:8D50",
    "50.00.000-00_0000DCDA00000C1800003194:2BC6",
  ]
  /* Сдвиг маршрута каждого аппарата, м: север, восток - чтобы не летали друг за другом */
  const SIM_SHIFT: [number, number][] = [
    [0, 0],
    [-400, 700],
    [700, -900],
    [-800, 600],
    [1100, 900],
    [-600, -1200],
  ]
  const randomSec = (min: number, max: number) => (min + Math.random() * (max - min)) * 1000
  let simValue: Record<string, Partial<IWidgetMapData>> | undefined = $state()
  $effect(() => {
    /* В «Маршруте» и «Агро» имитация - полёт по своей траектории, аппараты SIM не нужны */
    if (!isTest || mode !== "objects") return
    /* На связи всегда три аппарата: когда один пропадает, его сменяет тот, кто молчит дольше всех; молчащий маркер успевает покраснеть и скрыться */
    const fleet = SIM_GROUPS.map((group, i) => ({
      group,
      sim: createFlightSim(i % 7),
      online: i < SIM_ONLINE,
      switchAt: i < SIM_ONLINE ? Date.now() + randomSec(20 + i * 25, 40 + i * 25) : 0,
      offlineSince: i,
    }))
    const kmLat = 111320
    const kmLon = 111320 * Math.cos((HOME.lat * Math.PI) / 180)
    const frames: Record<string, Partial<IWidgetMapData>> = {}
    /* Модель летит всегда; пока аппарат без связи, его последний кадр не меняется - маркер краснеет, затем скрывается */
    const tick = (dt: number) => {
      const t = Date.now()
      fleet.forEach((f, i) => {
        const data = f.sim(dt)
        if (f.online && t >= f.switchAt) {
          const next = fleet.filter((x) => !x.online).sort((a, b) => a.offlineSince - b.offlineSince)[0]
          f.online = false
          f.offlineSince = t
          next.online = true
          next.switchAt = t + randomSec(40, 100)
        }
        if (!f.online) return
        frames[f.group] = {
          Lat: data.Lat + SIM_SHIFT[i][0] / kmLat,
          Lon: data.Lon + SIM_SHIFT[i][1] / kmLon,
          Alt: data.Alt + i * 15,
          Heading: data.Heading,
          Sat: data.Sat - (i % 3),
          DevName: f.group,
          DevSN: SIM_SN[i],
        }
      })
      simValue = { ...frames }
    }
    tick(0)
    const timer = setInterval(() => tick(0.5), 500)
    return () => {
      clearInterval(timer)
      simValue = undefined
    }
  })
  let value = $derived(isTest ? simValue : deviceValue)
  let groupList = $derived(isTest ? SIM_GROUPS : groups.map((g) => g.trim()).filter(Boolean))
  /* Аппарат для прогресса миссии в «Маршруте» и «Агро»: первая группа, положение и номер текущей команды */
  let missionVehicle = $derived.by(() => {
    const d = deviceValue?.[groupList[0]]
    if (isTest || !d || !d.Lat || !d.Lon) return undefined
    return { point: [d.Lon, d.Lat] as [number, number], wpNum: d.WPNum }
  })
  let boards: Board[] = $state([])
  let now = $state(Date.now())
  let mapInstance: any = $state()
  /* Вид карты (центр, масштаб, поворот) переживает сворачивание: тело виджета пересоздаёт карту, и она открывается там, где её оставили */
  let view = $state.raw({ center: { lat: 30, lng: 0 }, zoom: 1.5, bearing: 0 })
  $effect(() => {
    const map = mapInstance
    if (!map) return
    const save = () => (view = { center: map.getCenter(), zoom: map.getZoom(), bearing: map.getBearing() })
    map.on("moveend", save)
    return () => map.off("moveend", save)
  })
  /* При включении имитации карта переходит к району полёта */
  $effect(() => {
    if (isTest && mapInstance) untrack(() => mapInstance.jumpTo({ center: [HOME.lon, HOME.lat], zoom: 13.5 }))
  })
  let isCopied = $state(false)
  let isDarkMode = $state(false)

  /* Объект обновляется только при реальной смене значений - свежесть считается от последнего изменения, а не от перерисовки */
  $effect(() => {
    for (const group of groupList) {
      const v = value?.[group]
      if (!v || !hasFix(v.Lat, v.Lon)) continue
      const lat = v.Lat as number
      const lon = v.Lon as number
      const alt = num(v.Alt)
      const heading = num(v.Heading)
      const sat = num(v.Sat)
      const name = typeof v.DevName === "string" && v.DevName ? v.DevName : group
      const sn = typeof v.DevSN === "string" ? v.DevSN : ""
      untrack(() => {
        const idx = boards.findIndex((b) => b.group === group)
        const prev = idx === -1 ? null : boards[idx]
        if (
          prev &&
          prev.lat === lat &&
          prev.lon === lon &&
          prev.alt === alt &&
          prev.heading === heading &&
          prev.sat === sat &&
          prev.name === name &&
          prev.sn === sn
        )
          return
        const moved = !prev || prev.lat !== lat || prev.lon !== lon
        const track = moved ? [...(prev?.track ?? []), [lon, lat] as [number, number]].slice(-trackLength) : prev!.track
        const next: Board = { group, lat, lon, alt, heading, sat, name, sn, track, lastChange: Date.now(), hiddenAt: prev?.hiddenAt ?? 0 }
        if (idx === -1) boards.push(next)
        else boards[idx] = next
      })
    }
  })

  /* Подрезает накопленные траектории при уменьшении trackLength */
  $effect(() => {
    const limit = trackLength
    untrack(() => boards.forEach((b) => b.track.length > limit && (b.track = b.track.slice(-limit))))
  })

  $effect(() => {
    const timer = setInterval(() => (now = Date.now()), 1000)
    return () => clearInterval(timer)
  })

  /* Свежий - менялся за markerTimeout; устаревший (красный) - ещё markerTimeout; дальше скрыт до новых данных */
  let visibleBoards = $derived(boards.filter((b) => groupList.includes(b.group) && b.lastChange > b.hiddenAt && now - b.lastChange < markerTimeout * 2))
  const isFresh = (b: Board) => now - b.lastChange < markerTimeout
  let freshCount = $derived(visibleBoards.filter(isFresh).length)

  /* Вписывает в экран все видимые объекты, один объект - приближение к нему */
  const fitAllBoards = () => {
    if (!mapInstance || visibleBoards.length === 0) return
    if (visibleBoards.length === 1) return mapInstance.flyTo({ center: [visibleBoards[0].lon, visibleBoards[0].lat], zoom: 16 })
    const lons = visibleBoards.map((b) => b.lon)
    const lats = visibleBoards.map((b) => b.lat)
    mapInstance.fitBounds(
      [
        [Math.min(...lons), Math.min(...lats)],
        [Math.max(...lons), Math.max(...lats)],
      ],
      { padding: 60, maxZoom: 16 },
    )
  }

  const hideBoard = (group: string) => {
    const b = boards.find((x) => x.group === group)
    if (b) b.hiddenAt = b.lastChange
    followed = followed.filter((g) => g !== group)
  }

  /* Слежение: один объект держится в центре карты, несколько - вписываются в карту при включении и дальше только центрируются; масштаб остаётся за оператором, карта отдаляется сама, лишь когда объект уходит за край */
  let followed: string[] = $state([])
  const toggleFollow = (group: string) => (followed = followed.includes(group) ? followed.filter((g) => g !== group) : [...followed, group])
  const FOLLOW_PADDING = 60
  let lastFollowKey = ""
  $effect(() => {
    const map = mapInstance
    const targets = visibleBoards.filter((b) => followed.includes(b.group))
    if (!map || targets.length === 0) return
    untrack(() => {
      if (targets.length === 1) return map.easeTo({ center: [targets[0].lon, targets[0].lat], duration: 300 })
      const lons = targets.map((b) => b.lon)
      const lats = targets.map((b) => b.lat)
      const bounds: [[number, number], [number, number]] = [
        [Math.min(...lons), Math.min(...lats)],
        [Math.max(...lons), Math.max(...lats)],
      ]
      const key = targets.map((b) => b.group).join(" ")
      if (key !== lastFollowKey) {
        lastFollowKey = key
        return map.fitBounds(bounds, { padding: FOLLOW_PADDING, maxZoom: 16, duration: 300 })
      }
      const center: [number, number] = [(bounds[0][0] + bounds[1][0]) / 2, (bounds[0][1] + bounds[1][1]) / 2]
      /* Помещаются ли все объекты, если поставить их середину в центр */
      const { width, height } = map.getContainer().getBoundingClientRect()
      const mid = map.project(center)
      const fits = targets.every((b) => {
        const p = map.project([b.lon, b.lat])
        return Math.abs(p.x - mid.x) <= width / 2 - FOLLOW_PADDING && Math.abs(p.y - mid.y) <= height / 2 - FOLLOW_PADDING
      })
      if (fits) map.easeTo({ center, duration: 300 })
      else map.fitBounds(bounds, { padding: FOLLOW_PADDING, maxZoom: map.getZoom(), duration: 300 })
    })
  })

  const copyBoard = (b: Board) => {
    navigator.clipboard.writeText(
      `DevName: ${b.name}\nDevSN: ${b.sn}\nGroup: ${b.group}\nLat: ${b.lat.toFixed(6)} | Lon: ${b.lon.toFixed(6)} | Alt: ${b.alt.toFixed(1)}\nHeading: ${b.heading.toFixed(1)} | Satellites: ${b.sat}`,
    )
    isCopied = true
    setTimeout(() => (isCopied = false), 1000)
  }

  /* Тема карты - по ближайшему предку .dark/.light (как у токенов theme.css): работает и внутри блока с другой темой, смена темы отслеживается */
  let rootEl: HTMLDivElement | undefined = $state()
  const detectTheme = () => (isDarkMode = isDarkTheme(rootEl))
  onMount(() => {
    detectTheme()
    return watchTheme(detectTheme)
  })

  const trackLengthOptions = [100, 500, 1000, 5000, 10000, 50000]
  const timeoutOptions: { label: string; value: number }[] = [
    { label: "30 sec", value: 30_000 },
    { label: "1 min", value: 60_000 },
    { label: "3 min", value: 180_000 },
    { label: "5 min", value: 300_000 },
    { label: "10 min", value: 600_000 },
    { label: "30 min", value: 1_800_000 },
    { label: "1 h", value: 3_600_000 },
  ]
</script>

<!-- Аппараты из групп полей: маркеры, карточки и траектории; рисуются во всех режимах -->
{#snippet vehicles()}
  {#if trackEnabled}
    {#each visibleBoards as board (board.group)}
      {#if board.track.length >= 2}
        <Line id={`track-${board.group}`} coordinates={board.track} color={isFresh(board) ? "#22c55e" : "#ef4444"} />
      {/if}
    {/each}
  {/if}

  {#each visibleBoards as board (board.group)}
    {@const isFollowed = followed.includes(board.group)}
    <Marker lnglat={{ lng: board.lon, lat: board.lat }}>
      {#snippet content()}
        <div class="flex flex-col items-center justify-center leading-none">
          <div
            class="flex size-8 shrink-0 items-center justify-center [&_svg]:h-full [&_svg]:max-h-full [&_svg]:w-full [&_svg]:max-w-full
          {isFresh(board) ? 'text-(--green-text)' : 'text-(--red-text)'}"
            style="rotate: {board.heading}deg;"
          >
            {#if markerIcon}
              {#if typeof markerIcon === "string"}
                {@html sanitizeHtml(markerIcon)}
              {:else}
                {@const IconComponent = markerIcon}
                <IconComponent />
              {/if}
            {:else}
              <div class="rotate-270">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                  <path
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M14.76 12H6.832m0 0c0-.275-.057-.55-.17-.808L4.285 5.814c-.76-1.72 1.058-3.442 2.734-2.591L20.8 10.217c1.46.74 1.46 2.826 0 3.566L7.02 20.777c-1.677.851-3.495-.872-2.735-2.591l2.375-5.378A2 2 0 0 0 6.83 12"
                  /></svg
                >
              </div>
            {/if}
          </div>
          <p class="font-bold">{board.name}</p>
          <!-- Метка слежения видна и при закрытом окне деталей -->
          {#if isFollowed}
            <span class="mt-0.5 size-2 rounded-full bg-(--accent-color) ring-2 ring-white" title={$T("widget.map.follow")}></span>
          {/if}
        </div>
      {/snippet}

      <Popup closeButton={false} class="map-popup text-left">
        <div class="flex flex-col gap-1.5">
          <div class="flex items-center gap-1.5">
            <span class="size-2 shrink-0 rounded-full {isFresh(board) ? 'bg-(--green-color)' : 'bg-(--red-color)'}"></span>
            <h6 class="text-sm leading-none font-bold">{board.name}</h6>
            {#if board.name !== board.group}<span class="text-[11px] font-semibold uppercase text-(--muted-color)">{board.group}</span>{/if}
          </div>

          <div class="grid grid-cols-2 gap-x-3 gap-y-1 rounded-lg bg-(--container-color) p-2 text-xs">
            <div>
              <p class="text-[11px] font-semibold tracking-wide uppercase text-(--muted-color)">Lat / Lon</p>
              <p class="font-medium">{board.lat.toFixed(6)}, {board.lon.toFixed(6)}</p>
            </div>
            <div>
              <p class="text-[11px] font-semibold tracking-wide uppercase text-(--muted-color)">Alt</p>
              <p class="font-medium">{board.alt.toFixed(1)} m</p>
            </div>
            <div>
              <p class="text-[11px] font-semibold tracking-wide uppercase text-(--muted-color)">Heading</p>
              <p class="font-medium">{board.heading.toFixed(1)}°</p>
            </div>
            <div>
              <p class="text-[11px] font-semibold tracking-wide uppercase text-(--muted-color)">Satellites</p>
              <p class="font-medium">{board.sat}</p>
            </div>
          </div>

          {#if board.sn}<p class="text-center font-mono text-[11px] tracking-wide uppercase">{board.sn}</p>{/if}

          <div class="grid grid-cols-[1fr_auto_1fr] items-center border-t border-(--hairline-color) pt-1">
            <div class="relative flex items-center justify-self-start">
              <button
                class="flex cursor-pointer items-center gap-1 rounded-lg border-none bg-transparent px-1 py-0.5 opacity-70 transition hover:opacity-100"
                onclick={(e) => {
                  e.preventDefault()
                  copyBoard(board)
                }}
                aria-label="Copy"
                title="Copy"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="1.25rem" height="1.25rem" viewBox="0 0 24 24">
                  <g fill="none" stroke="currentColor" stroke-width="1.5">
                    <path
                      d="M6 11c0-2.828 0-4.243.879-5.121C7.757 5 9.172 5 12 5h3c2.828 0 4.243 0 5.121.879C21 6.757 21 8.172 21 11v5c0 2.828 0 4.243-.879 5.121C19.243 22 17.828 22 15 22h-3c-2.828 0-4.243 0-5.121-.879C6 20.243 6 18.828 6 16z"
                    />
                    <path d="M6 19a3 3 0 0 1-3-3v-6c0-3.771 0-5.657 1.172-6.828S7.229 2 11 2h4a3 3 0 0 1 3 3" />
                  </g>
                </svg>
              </button>
              <CopiedChip show={isCopied} class="-top-1 right-0 -translate-y-full" />
            </div>

            <button
              class="flex cursor-pointer items-center gap-1 rounded-lg border px-2 py-0.5 text-xs font-semibold transition {isFollowed
                ? 'border-(--accent-color) bg-(--accent-color) text-(--on-accent)'
                : 'border-(--hairline-color) bg-transparent opacity-80 hover:opacity-100'}"
              aria-pressed={isFollowed}
              onclick={() => toggleFollow(board.group)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24">
                <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5">
                  <circle cx="12" cy="12" r="7" />
                  <circle cx="12" cy="12" r="2.5" fill={isFollowed ? "currentColor" : "none"} />
                  <path d="M12 2v3m0 14v3M2 12h3m14 0h3" />
                </g>
              </svg>
              {$T("widget.map.follow")}
            </button>

            <button
              class="cursor-pointer justify-self-end rounded-lg border-none bg-transparent p-0.5 text-(--red-text) transition hover:opacity-80"
              aria-label="Hide"
              title="Hide"
              onclick={() => hideBoard(board.group)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="1.25rem" height="1.25rem" viewBox="0 0 24 24"
                ><path
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="m19.5 5.5l-.62 10.025c-.158 2.561-.237 3.842-.88 4.763a4 4 0 0 1-1.2 1.128c-.957.584-2.24.584-4.806.584c-2.57 0-3.855 0-4.814-.585a4 4 0 0 1-1.2-1.13c-.642-.922-.72-2.205-.874-4.77L4.5 5.5M3 5.5h18m-4.944 0l-.683-1.408c-.453-.936-.68-1.403-1.071-1.695a2 2 0 0 0-.275-.172C13.594 2 13.074 2 12.035 2c-1.066 0-1.599 0-2.04.234a2 2 0 0 0-.278.18c-.395.303-.616.788-1.058 1.757L8.053 5.5m1.447 11v-6m5 6v-6"
                /></svg
              >
            </button>
          </div>
        </div>
      </Popup>
    </Marker>
  {/each}
{/snippet}

<!-- Режим «Агро» - генератор миссии для агродрона, «Маршрут» - обычный планировщик миссии, остальное - карта объектов -->
{#if mode === "agro"}
  <MapAgro
    {wrapperClass}
    {componentClass}
    {label}
    height={height ?? 520}
    bind:plan
    bind:collapsed
    {persistKey}
    {onPlanChange}
    {onSend}
    overlay={isTest ? undefined : vehicles}
    simulate={isTest}
    vehicle={missionVehicle}
  />
{:else if mode === "route"}
  <MapRoute
    {wrapperClass}
    {componentClass}
    {label}
    height={height ?? 520}
    bind:route
    bind:collapsed
    {persistKey}
    {onRouteChange}
    {onSend}
    overlay={isTest ? undefined : vehicles}
    simulate={isTest}
    vehicle={missionVehicle}
  />
{:else}
  <div
    bind:this={rootEl}
    class={twMerge("relative flex w-full flex-col gap-4 rounded-2xl border border-(--hairline-color) bg-(--container-color) p-4", wrapperClass)}
    style={accentStyle}
  >
    <WidgetHeader icon={MapIcon} label={label?.name || $T("widget.map.title")} bind:collapsed {hints}>
      {#snippet right()}
        <div class="flex items-center gap-3">
          <UI.Button
            wrapperClass="w-auto"
            componentClass="bg-transparent px-3"
            content={{ icon: FitIcon, name: $T("constructor.props.map.fitAll"), info: { text: $T("constructor.props.map.fitAllHint"), side: "bottom" } }}
            disabled={collapsed || visibleBoards.length === 0}
            onClick={fitAllBoards}
          />
          <span
            class="text-[12px] font-semibold tabular-nums {freshCount === 0
              ? 'text-(--red-text)'
              : freshCount < groupList.length
                ? 'text-(--muted-color)'
                : 'text-(--green-text)'}"
            use:hint={{ text: $T("widget.map.hint.boards"), enabled: $hints }}
          >
            {freshCount} / {groupList.length}
          </span>
        </div>
      {/snippet}
    </WidgetHeader>

    {#if !collapsed}
      <div transition:slide={{ duration: 150 }} style="height: {height}px">
        <MapLibre
          bind:map={mapInstance}
          class="h-full w-full overflow-hidden rounded-[14px] border border-(--hairline-color)"
          style={isDarkMode
            ? "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
            : "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"}
          zoom={view.zoom}
          center={view.center}
          bearing={view.bearing}
          maxPitch={0}
        >
          <NavigationControl />
          <ScaleControl />
          <GeolocateControl />
          <FullScreenControl />

          <!-- Панель оператора поверх карты -->
          <CustomControl position="top-left">
            <div class="flex flex-wrap items-center gap-3 rounded-lg px-2 py-1 text-(--font-color)">
              <label class="flex items-center gap-1.5 text-sm font-medium" use:hint={{ text: $T("widget.map.hint.track"), enabled: $hints }}>
                <input type="checkbox" bind:checked={trackEnabled} />
                {$T("constructor.props.map.track")}
              </label>
              {#if trackEnabled}
                <div class="flex items-center gap-2">
                  <span class="text-sm font-medium">{$T("constructor.props.map.trackLength")}</span>
                  <select class="rounded border border-(--border-color) bg-(--field-color) px-2 py-1 text-sm text-(--font-color)" bind:value={trackLength}>
                    {#each trackLengthOptions as opt}
                      <option value={opt}>{opt}</option>
                    {/each}
                  </select>
                </div>
              {/if}
              <div class="flex items-center gap-2" use:hint={{ text: $T("widget.map.hint.timeout"), enabled: $hints }}>
                <span class="text-sm font-medium">{$T("constructor.props.map.timeout")}</span>
                <select class="rounded border border-(--border-color) bg-(--field-color) px-2 py-1 text-sm text-(--font-color)" bind:value={markerTimeout}>
                  {#each timeoutOptions as opt}
                    <option value={opt.value}>{opt.label}</option>
                  {/each}
                </select>
              </div>
            </div>
          </CustomControl>

          {@render vehicles()}
        </MapLibre>
      </div>
    {/if}
  </div>
{/if}

<style>
  /* Попап по правилам карточки (design-handoff, раздел 9): радиус 14, линия, тень уровня 2 */
  :global(.map-popup .maplibregl-popup-content) {
    background-color: var(--back-color);
    color: inherit;
    border: 1px solid var(--hairline-color);
    border-radius: 14px;
    box-shadow: var(--elevation-2);
    padding: 12px;
  }
  :global(.map-popup.maplibregl-popup-anchor-bottom .maplibregl-popup-tip) {
    border-top-color: var(--back-color);
  }
  :global(.map-popup.maplibregl-popup-anchor-top .maplibregl-popup-tip) {
    border-bottom-color: var(--back-color);
  }
  :global(.map-popup.maplibregl-popup-anchor-left .maplibregl-popup-tip) {
    border-right-color: var(--back-color);
  }
  :global(.map-popup.maplibregl-popup-anchor-right .maplibregl-popup-tip) {
    border-left-color: var(--back-color);
  }
</style>
