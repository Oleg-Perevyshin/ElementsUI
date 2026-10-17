<!-- $lib/WidgetMap/WidgetMap.svelte — смарт-виджет «Карта»: объекты из групп полей устройства (по умолчанию MAV) с полями
     Lat/Lon/Alt/Heading/Sat/DevName/DevSN (см. IWidgetMapData), каждая группа — свой маркер и своя траектория. Только отображение:
     ничего не отправляет и не знает про DeviceStore/WebSocket. Траекторию, длину трека и таймаут маркеров оператор
     переключает прямо поверх карты, «Показать все» — кнопка в шапке; вид карта сама не меняет — объектов может быть много. -->
<script lang="ts">
  import { onMount, untrack } from "svelte"
  import { slide } from "svelte/transition"
  import { twMerge } from "tailwind-merge"
  import { T } from "$lib/locales/i18n"
  import type { IWidgetMapProps } from "../types"
  import CopiedChip from "../CopiedChip.svelte"
  import WidgetHeader from "../WidgetHeader.svelte"
  import { widgetAccentStyle } from "../widgetAccent"
  import { readPersistedCollapsed, writePersistedCollapsed } from "../widgetCollapse"
  import MapIcon from "./MapIcon.svelte"
  import FitIcon from "./FitIcon.svelte"
  import * as UI from "$lib"
  import { MapLibre, NavigationControl, ScaleControl, GeolocateControl, FullScreenControl, Marker, Popup, Line, CustomControl } from "./mapWrapper"

  let {
    wrapperClass = "",
    componentClass = "",
    label = { name: "Карта" },
    groups = ["MAV"],
    value,
    height = 400,
    markerIcon,
    trackEnabled = $bindable(false),
    trackLength = $bindable(1000),
    markerTimeout = $bindable(30_000),
    collapsed = $bindable(false),
    persistKey,
  }: IWidgetMapProps = $props()

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
  /* (0, 0) и нечисловые координаты — признак отсутствия фикса */
  const hasFix = (lat: unknown, lon: unknown) => Number.isFinite(lat) && Number.isFinite(lon) && (lat !== 0 || lon !== 0)

  let groupList = $derived(groups.map((g) => g.trim()).filter(Boolean))
  let boards: Board[] = $state([])
  let now = $state(Date.now())
  let mapInstance: any = $state()
  let isCopied = $state(false)
  let isDarkMode = $state(false)

  /* Объект обновляется только при реальной смене значений — свежесть считается от последнего изменения, а не от перерисовки */
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

  /* Свежий — менялся за markerTimeout; устаревший (красный) — ещё markerTimeout; дальше скрыт до новых данных */
  let visibleBoards = $derived(boards.filter((b) => groupList.includes(b.group) && b.lastChange > b.hiddenAt && now - b.lastChange < markerTimeout * 2))
  const isFresh = (b: Board) => now - b.lastChange < markerTimeout
  let freshCount = $derived(visibleBoards.filter(isFresh).length)

  /* Вписывает в экран все видимые объекты, один объект — приближение к нему */
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
  }

  const copyBoard = (b: Board) => {
    navigator.clipboard.writeText(
      `DevName: ${b.name}\nDevSN: ${b.sn}\nGroup: ${b.group}\nLat: ${b.lat.toFixed(6)} | Lon: ${b.lon.toFixed(6)} | Alt: ${b.alt.toFixed(1)}\nHeading: ${b.heading.toFixed(1)} | Satellites: ${b.sat}`,
    )
    isCopied = true
    setTimeout(() => (isCopied = false), 1000)
  }

  /* Тема карты — по ближайшему предку .dark/.light (как у токенов theme.css), а не по localStorage: работает и внутри блока с другой темой */
  let rootEl: HTMLDivElement | undefined = $state()
  const detectTheme = () => {
    const scope = rootEl?.closest(".dark, .light")
    isDarkMode = scope ? scope.classList.contains("dark") : localStorage.getItem("AppTheme") !== "light"
  }
  onMount(() => {
    detectTheme()
    window.addEventListener("ThemeChange", detectTheme)
    return () => window.removeEventListener("ThemeChange", detectTheme)
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

<div
  bind:this={rootEl}
  class={twMerge("relative flex w-full flex-col gap-4 rounded-2xl border border-(--hairline-color) bg-(--container-color) p-4", wrapperClass)}
  style={accentStyle}
>
  <WidgetHeader icon={MapIcon} label={label?.name ?? "Карта"} bind:collapsed>
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
            ? 'text-(--red-color)'
            : freshCount < groupList.length
              ? 'text-(--muted-color)'
              : 'text-(--green-color)'}"
          title={$T("constructor.props.map.boards")}
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
        style={isDarkMode ? "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json" : "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"}
        zoom={1.5}
        center={{ lat: 30, lng: 0 }}
        maxPitch={0}
      >
        <NavigationControl />
        <ScaleControl />
        <GeolocateControl />
        <FullScreenControl />

        <!-- Панель оператора поверх карты -->
        <CustomControl position="top-left">
          <div class="flex flex-wrap items-center gap-3 rounded-lg px-2 py-1 text-black">
            <label class="flex items-center gap-1.5 text-sm font-medium">
              <input type="checkbox" bind:checked={trackEnabled} />
              {$T("constructor.props.map.track")}
            </label>
            {#if trackEnabled}
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium">{$T("constructor.props.map.trackLength")}</span>
                <select class="rounded px-2 py-1 text-sm" bind:value={trackLength}>
                  {#each trackLengthOptions as opt}
                    <option value={opt}>{opt}</option>
                  {/each}
                </select>
              </div>
            {/if}
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium">{$T("constructor.props.map.timeout")}</span>
              <select class="rounded px-2 py-1 text-sm" bind:value={markerTimeout}>
                {#each timeoutOptions as opt}
                  <option value={opt.value}>{opt.label}</option>
                {/each}
              </select>
            </div>
          </div>
        </CustomControl>

        {#if trackEnabled}
          {#each visibleBoards as board (board.group)}
            {#if board.track.length >= 2}
              <Line id={`track-${board.group}`} coordinates={board.track} color={isFresh(board) ? "#22c55e" : "#ef4444"} />
            {/if}
          {/each}
        {/if}

        {#each visibleBoards as board (board.group)}
          <Marker lnglat={{ lng: board.lon, lat: board.lat }}>
            {#snippet content()}
              <div class="flex flex-col items-center justify-center leading-none">
                <div
                  class="flex size-8 shrink-0 items-center justify-center [&_svg]:h-full [&_svg]:max-h-full [&_svg]:w-full [&_svg]:max-w-full
                  {isFresh(board) ? 'text-(--green-color)' : 'text-(--red-color)'}"
                  style="rotate: {board.heading}deg;"
                >
                  {#if markerIcon}
                    {#if typeof markerIcon === "string"}
                      {@html markerIcon}
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
              </div>
            {/snippet}

            <Popup closeButton={false} class="map-popup text-left">
              <div class="flex flex-col gap-1.5">
                <div class="flex items-center gap-1.5">
                  <span class="size-2 shrink-0 rounded-full {isFresh(board) ? 'bg-(--green-color)' : 'bg-(--red-color)'}"></span>
                  <h6 class="text-sm leading-none font-bold">{board.name}</h6>
                  {#if board.name !== board.group}<span class="text-[0.6rem] font-semibold uppercase opacity-60">{board.group}</span>{/if}
                </div>

                <div class="grid grid-cols-2 gap-x-3 gap-y-1 rounded-lg bg-(--container-color) p-2 text-xs">
                  <div>
                    <p class="text-[0.6rem] font-semibold tracking-wide uppercase opacity-60">Lat / Lon</p>
                    <p class="font-medium">{board.lat.toFixed(6)}, {board.lon.toFixed(6)}</p>
                  </div>
                  <div>
                    <p class="text-[0.6rem] font-semibold tracking-wide uppercase opacity-60">Alt</p>
                    <p class="font-medium">{board.alt.toFixed(1)} m</p>
                  </div>
                  <div>
                    <p class="text-[0.6rem] font-semibold tracking-wide uppercase opacity-60">Heading</p>
                    <p class="font-medium">{board.heading.toFixed(1)}°</p>
                  </div>
                  <div>
                    <p class="text-[0.6rem] font-semibold tracking-wide uppercase opacity-60">Satellites</p>
                    <p class="font-medium">{board.sat}</p>
                  </div>
                </div>

                {#if board.sn}<p class="text-center font-mono text-[0.6rem] tracking-wide uppercase">{board.sn}</p>{/if}

                <div class="flex items-center justify-between border-t border-(--hairline-color) pt-1">
                  <div class="relative flex items-center">
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
                    class="cursor-pointer rounded-lg border-none bg-transparent p-0.5 text-(--red-color) transition hover:opacity-80"
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
      </MapLibre>
    </div>
  {/if}
</div>

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
