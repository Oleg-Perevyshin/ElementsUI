<script lang="ts">
  import { T } from "$lib/locales/i18n"
  import type { IDeviceGNSS, IMapProps } from "$lib/types"
  import { onDestroy, onMount } from "svelte"
  import { fade } from "svelte/transition"
  import { twMerge } from "tailwind-merge"
  import { MapLibre, NavigationControl, ScaleControl, GeolocateControl, FullScreenControl, Marker, Popup, Line, CustomControl } from "./mapWrapper"

  let {
    id = crypto.randomUUID(),
    label = { name: "", class: "" },
    data = $bindable(),
    markerIcon,
    trackEnabled = $bindable(false),
    trackLength = $bindable(1000),
  }: IMapProps = $props()

  interface MapDevice extends IDeviceGNSS {
    isFresh: boolean
    staleTimeoutId: number | null
    removeTimeoutId: number | null
    track: [number, number][]
  }

  let devices: MapDevice[] = $state([])
  let isCopied = $state(false)
  let isDarkMode = $state(false)
  let markerTimeout = $state(30_000)

  const clearDeviceTimers = (device: MapDevice) => {
    if (device.staleTimeoutId !== null) clearTimeout(device.staleTimeoutId)
    if (device.removeTimeoutId !== null) clearTimeout(device.removeTimeoutId)
  }

  // Перезапускает цикл "устройство свежее" -> (без обновлений markerTimeout) "устарело" -> (без обновлений ещё markerTimeout) "удалено"
  const restartFreshTimer = (devSN: string) => {
    const idx = devices.findIndex((d) => d.DevSN === devSN)
    if (idx === -1) return

    clearDeviceTimers(devices[idx])
    devices[idx].isFresh = true

    devices[idx].staleTimeoutId = setTimeout(() => {
      const staleIdx = devices.findIndex((d) => d.DevSN === devSN)
      if (staleIdx === -1) return

      devices[staleIdx].isFresh = false
      devices[staleIdx].staleTimeoutId = null
      devices[staleIdx].removeTimeoutId = setTimeout(() => {
        devices = devices.filter((d) => d.DevSN !== devSN)
      }, markerTimeout) as unknown as number
    }, markerTimeout) as unknown as number
  }

  // Обработка входящих данных
  $effect(() => {
    if (data) {
      /* (0, 0) — признак отсутствия реального GPS-фикса, в траекторию такие точки не добавляем */
      const hasFix = data.NavLat !== 0 || data.NavLon !== 0
      const idx = devices.findIndex((d) => d.DevSN === data?.DevSN)
      if (idx !== -1) {
        /* Обновление существующего */
        const track = hasFix ? [...devices[idx].track, [data.NavLon, data.NavLat] as [number, number]].slice(-trackLength) : devices[idx].track
        devices[idx] = { ...devices[idx], ...data, track }
      } else {
        /* Новое устройство */
        const newDevice: MapDevice = {
          ...data,
          isFresh: true,
          staleTimeoutId: null,
          removeTimeoutId: null,
          track: hasFix ? [[data.NavLon, data.NavLat]] : [],
        }
        devices.push(newDevice)
      }
      restartFreshTimer(data.DevSN)
      data = null
    }
  })

  // Подрезает уже накопленные траектории при уменьшении trackLength
  $effect(() => {
    if (trackLength > 0) {
      devices.forEach((device) => {
        if (device.track.length > trackLength) device.track = device.track.slice(-trackLength)
      })
    }
  })

  const handleThemeChange = (event: CustomEvent) => {
    isDarkMode = !event.detail.currentTheme
  }

  onMount(() => {
    if (typeof window !== "undefined") {
      isDarkMode = localStorage.getItem("AppTheme") !== "light"
      window.addEventListener("ThemeChange", handleThemeChange as EventListener)
    }
  })

  onDestroy(() => {
    if (typeof window !== "undefined") window.removeEventListener("ThemeChange", handleThemeChange as EventListener)

    for (const device of devices) {
      clearDeviceTimers(device)
    }
  })

  const trackLengthOptions: { label: string; value: number }[] = [
    { label: "100", value: 100 },
    { label: "500", value: 500 },
    { label: "1000", value: 1000 },
    { label: "5000", value: 5000 },
    { label: "10000", value: 10000 },
    { label: "50000", value: 50000 },
  ]

  const timeoutOptions: { label: string; value: number }[] = [
    { label: "30 sec", value: 30_000 },
    { label: "1 min", value: 60_000 },
    { label: "3 min", value: 180_000 },
    { label: "5 min", value: 300_000 },
    { label: "10 min", value: 600_000 },
    { label: "30 min", value: 1_800_000 },
    { label: "1 h", value: 3_600_000 },
  ]

  const changeTimeout = (val: number) => {
    markerTimeout = val
    devices.forEach((device) => restartFreshTimer(device.DevSN))
  }
</script>

<div id={`${id}-${crypto.randomUUID().slice(0, 6)}`} class="h-full min-h-50">
  {#if label.name}
    <h5 class={twMerge(` w-full px-4 text-center`, label.class)}>{label.name}</h5>
  {/if}
  <MapLibre
    class="h-[calc(100%-2rem)] min-h-50 overflow-hidden rounded-xl shadow-sm transition duration-200 hover:shadow-md"
    style={isDarkMode ? "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json" : "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"}
    zoom={1.5}
    center={{ lat: 30, lng: 0 }}
  >
    <NavigationControl />
    <ScaleControl />
    <GeolocateControl />
    <FullScreenControl />

    <CustomControl position="top-left">
      <div class="flex flex-wrap items-center gap-3 px-2 py-1 text-black">
        <label class="flex items-center gap-1.5 text-sm font-medium">
          <input type="checkbox" bind:checked={trackEnabled} />
          {$T("constructor.props.map.track")}
        </label>

        {#if trackEnabled}
          <div class="flex items-center gap-2">
            <label for="trackLength" class="text-sm font-medium">{$T("constructor.props.map.trackLength")}</label>
            <select id="trackLength" class="rounded px-2 py-1 text-sm" bind:value={trackLength}>
              {#each trackLengthOptions as opt}
                <option value={opt.value}>{opt.label}</option>
              {/each}
            </select>
          </div>
        {/if}

        <div class="flex items-center gap-2">
          <label for="timeout" class="text-sm font-medium">{$T("constructor.props.map.timeout")}</label>
          <select
            id="timeout"
            class="rounded px-2 py-1 text-sm"
            bind:value={markerTimeout}
            onchange={(e) => changeTimeout(parseInt((e.target as HTMLSelectElement).value))}
          >
            {#each timeoutOptions as opt}
              <option value={opt.value}>{opt.label}</option>
            {/each}
          </select>
        </div>
      </div>
    </CustomControl>

    {#if trackEnabled}
      {#each devices as device (device.DevSN)}
        {#if device.track.length >= 2}
          <Line id={`track-${device.DevSN}`} coordinates={device.track} color={device.isFresh ? "#22c55e" : "#ef4444"} />
        {/if}
      {/each}
    {/if}

    {#each devices as device}
      <Marker lnglat={{ lng: device.NavLon, lat: device.NavLat }}>
        {#snippet content()}
          <div class="flex flex-col items-center justify-center leading-none">
            <div
              class="flex size-8 shrink-0 items-center justify-center [&_svg]:h-full [&_svg]:max-h-full [&_svg]:w-full [&_svg]:max-w-full
            {device.isFresh ? 'text-green-500' : 'text-red-500'}"
              style="rotate: {device.NavHeading}deg;"
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
            <p class="font-bold">{device.DevName}</p>
          </div>
        {/snippet}

        <Popup closeButton={false} class="map-popup rounded-2xl text-left">
          <div class="flex flex-col gap-1.5">
            <div class="flex items-center gap-1.5">
              <span class="size-2 shrink-0 rounded-full {device.isFresh ? 'bg-green-500' : 'bg-red-500'}"></span>
              <h6 class="text-sm leading-none font-bold">{device.DevName}</h6>
            </div>

            <div class="grid grid-cols-2 gap-x-3 gap-y-1 rounded-lg bg-(--container-color) p-2 text-xs">
              <div>
                <p class="text-[0.6rem] font-semibold tracking-wide uppercase opacity-60">Lat / Lon</p>
                <p class="font-medium">{device.NavLat.toFixed(5)}, {device.NavLon.toFixed(5)}</p>
              </div>
              <div>
                <p class="text-[0.6rem] font-semibold tracking-wide uppercase opacity-60">Alt</p>
                <p class="font-medium">{device.NavAlt.toFixed(1)} m</p>
              </div>
              <div>
                <p class="text-[0.6rem] font-semibold tracking-wide uppercase opacity-60">Heading</p>
                <p class="font-medium">{device.NavHeading.toFixed(1)}°</p>
              </div>
              <div>
                <p class="text-[0.6rem] font-semibold tracking-wide uppercase opacity-60">Satellites</p>
                <p class="font-medium">{device.NavSatUse}</p>
              </div>
            </div>

            <p class="text-[0.6rem] font-mono text-center tracking-wide uppercase">{device.DevSN}</p>

            <div class="flex items-center justify-between border-t border-(--border-color) pt-1">
              <div class="relative flex items-center">
                <button
                  class="flex cursor-pointer items-center gap-1 rounded-lg border-none bg-transparent px-1 py-0.5 opacity-70 transition hover:opacity-100"
                  onclick={(e) => {
                    e.preventDefault()
                    navigator.clipboard.writeText(
                      `DevName: ${device.DevName}\nDevSN: ${device.DevSN}\nLat: ${device.NavLat.toFixed(3)} | Lon: ${device.NavLon.toFixed(3)} | Alt: ${device.NavAlt}\nHeading: ${device.NavHeading} | Satellites: ${device.NavSatUse}`,
                    )
                    isCopied = true
                    setTimeout(() => (isCopied = false), 1000)
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
                {#if isCopied}
                  <div
                    class="absolute -top-1 right-0 -translate-y-full rounded-md bg-(--green-color) px-1.5 py-1 text-sm shadow-lg"
                    transition:fade={{ duration: 200 }}
                  >
                    ✓
                  </div>
                {/if}
              </div>

              <button
                class="cursor-pointer rounded-lg border-none bg-transparent p-0.5 text-red-500 transition hover:text-red-600"
                aria-label="Delete"
                title="Delete"
                onclick={() => (devices = devices.filter((dev) => dev.DevSN !== device.DevSN))}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="1.25rem" height="1.25rem" viewBox="0 0 24 24"
                  ><path
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="m19.5 5.5l-.62 10.025c-.158 2.561-.237 3.842-.88 4.763a4 4 0 0 1-1.2 1.128c-.957.584-2.24.584-4.806.584c-2.57 0-3.855 0-4.814-.585a4 4 0 0 1-1.2-1.13c-.642-.922-.72-2.205-.874-4.77L4.5 5.5M3 5.5h18m-4.944 0l-.683-1.408c-.453-.936-.68-1.403-1.071-1.695a2 2 0 0 0-.275-.172C13.594 2 13.074 2 12.035 2c-1.066 0-1.599 0-2.04.234a2 2 0 0 0-.278.18c-.395.303-.616.788-1.058 1.757L8.053 5.5m1.447 11v-6m5 6v-6"
                    color="currentColor"
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

<style>
  :global(.map-popup .maplibregl-popup-content) {
    background-color: var(--back-color);
    color: inherit;
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
