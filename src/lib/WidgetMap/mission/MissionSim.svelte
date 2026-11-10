<!-- $lib/WidgetMap/mission/MissionSim.svelte - имитация полёта по рассчитанной траектории режимов «Маршрут» и «Агро»: аппарат летит по пути с его скоростями, оставляет след, распыление видно цветом; пауза, ускорение и перезапуск на панели внизу карты -->
<script lang="ts">
  import { T } from "../../locales/i18n"
  import { Marker, Line } from "../mapWrapper"
  import type { LngLat } from "./coverage"
  import type { IMapColors } from "../../accent"
  import { SIM_RATES, type SimClock } from "./simClock.svelte"

  /* icon: arrow - стрелка, quad - квадрокоптер сверху; часы имитации (clock) живут в режиме карты, слой только рисует */
  let {
    clock,
    showSpray = false,
    icon = "arrow",
    colors,
  }: {
    clock: SimClock
    showSpray?: boolean
    icon?: "arrow" | "quad"
    colors: IMapColors /* Аппарат и след - мастер-цвет виджета, распыление - зелёный */
  } = $props()

  const toRad = Math.PI / 180
  const bearing = (a: LngLat, b: LngLat) => {
    const y = Math.sin((b[0] - a[0]) * toRad) * Math.cos(b[1] * toRad)
    const x = Math.cos(a[1] * toRad) * Math.sin(b[1] * toRad) - Math.sin(a[1] * toRad) * Math.cos(b[1] * toRad) * Math.cos((b[0] - a[0]) * toRad)
    return (Math.atan2(y, x) / toRad + 360) % 360
  }

  /* Положение на пути в момент clock.t */
  let pos = $derived.by(() => {
    const { path, times, t } = clock
    if (path.length < 2) return null
    let i = 1
    while (i < times.length - 1 && times[i] < t) i++
    const a = path[i - 1]
    const b = path[i]
    const span = times[i] - times[i - 1]
    const k = span > 0 ? Math.min(1, Math.max(0, (t - times[i - 1]) / span)) : 1
    const point: LngLat = [a.point[0] + (b.point[0] - a.point[0]) * k, a.point[1] + (b.point[1] - a.point[1]) * k]
    return {
      point,
      alt: a.alt + (b.alt - a.alt) * k,
      speed: b.speed,
      spray: !!b.spray,
      heading: bearing(a.point, b.point),
      trail: [...path.slice(0, i).map((v) => v.point), point],
      index: i,
    }
  })

  let fill = $derived(showSpray && pos?.spray ? colors.green : colors.accent)
  /* Кнопки-иконки без рамки: стили группы кнопок MapLibre перебиваются */
  const iconBtn =
    "flex h-7! w-7! cursor-pointer items-center justify-center rounded-md border-0! bg-transparent p-0 text-(--muted-color) hover:bg-(--container-color) hover:text-(--font-color)"
  const clockText = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`
</script>

{#if pos}
  <Line id="msn-sim-trail" coordinates={pos.trail} color={colors.line} width={4} opacity={0.6} />
  <Marker lnglat={{ lng: pos.point[0], lat: pos.point[1] }}>
    {#snippet content()}
      <div class="flex size-9 items-center justify-center" style="rotate: {pos.heading}deg">
        {#if icon === "quad"}
          <svg viewBox="0 0 32 32" width="34" height="34">
            <g stroke="#ffffff" stroke-width="1.2">
              <path d="M9 9 L23 23 M23 9 L9 23" stroke={fill} stroke-width="2.5" stroke-linecap="round" />
              {#each [[8, 8], [24, 8], [8, 24], [24, 24]] as [cx, cy]}
                <circle {cx} {cy} r="5.5" {fill} fill-opacity="0.35" stroke={fill} stroke-width="1.5" />
              {/each}
              <rect x="12" y="12" width="8" height="8" rx="2" {fill} />
              <path d="M16 4.5 L18.5 9 L13.5 9 Z" {fill} />
            </g>
          </svg>
        {:else}
          <svg viewBox="0 0 24 24" width="28" height="28">
            <path d="M12 2 L19 20 L12 16 L5 20 Z" {fill} stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round" />
          </svg>
        {/if}
      </div>
    {/snippet}
  </Marker>

  <!-- Панель имитации внизу карты по центру, оформлена как кнопки MapLibre -->
  <div
    class="absolute bottom-2.5 left-1/2 z-10 w-max max-w-[calc(100%-8rem)] -translate-x-1/2 rounded-[4px] bg-(--back-color) shadow-[0_0_0_1px_var(--hairline-color)]"
  >
    <div class="flex flex-col gap-1 px-3 py-1.5 text-[12px] whitespace-nowrap text-(--font-color) tabular-nums">
      <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span class="font-semibold">{$T("widget.sim.title")}</span>
        <button
          class={iconBtn}
          onclick={() => clock.toggle()}
          title={clock.playing ? $T("widget.sim.pause") : $T("widget.sim.play")}
          aria-label={clock.playing ? $T("widget.sim.pause") : $T("widget.sim.play")}
        >
          {#if clock.playing}
            <svg viewBox="0 0 24 24" width="18" height="18"
              ><rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" /><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" /></svg
            >
          {:else}
            <svg viewBox="0 0 24 24" width="18" height="18"
              ><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" fill="currentColor" /></svg
            >
          {/if}
        </button>
        <select class="rounded px-1 py-0.5" bind:value={clock.rate}>
          {#each SIM_RATES as r}
            <option value={r}>×{r}</option>
          {/each}
        </select>
        <span>{clockText(clock.t)} / {clockText(clock.duration)} · {Math.round((clock.t / Math.max(1, clock.duration)) * 100)}%</span>
        <span>{pos.alt.toFixed(0)} {$T("widget.mission.m")} · {pos.speed.toFixed(1)} {$T("widget.mission.ms")}</span>
        {#if showSpray}
          <span class="min-w-[7.5rem] font-semibold {pos.spray ? 'text-(--green-text)' : 'text-(--muted-color)'}"
            >{pos.spray ? $T("widget.sim.sprayOn") : $T("widget.sim.sprayOff")}</span
          >
        {/if}
      </div>
      <!-- Прокрутка пути: перетаскивание ставит полёт на паузу, чтобы рассмотреть любое место траектории -->
      <input
        type="range"
        class="w-full cursor-pointer"
        style="accent-color: {colors.accent}"
        min="0"
        max={clock.duration}
        step={Math.max(0.1, clock.duration / 2000)}
        value={clock.t}
        aria-label={$T("widget.sim.scrub")}
        oninput={(e) => clock.seek(Number(e.currentTarget.value))}
      />
    </div>
  </div>
{/if}
