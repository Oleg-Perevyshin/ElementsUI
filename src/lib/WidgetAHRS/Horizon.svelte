<!-- $lib/WidgetAHRS/Horizon.svelte - круглый авиагоризонт: небо и земля поворачиваются на крен и сдвигаются на тангаж, неподвижный силуэт в центре; шкала тангажа через 10°. Нет углов - серый круг -->
<script lang="ts">
  let { roll, pitch, size = 112 }: { roll: number | undefined; pitch: number | undefined; size?: number } = $props()

  /* Сдвиг горизонта: 45° тангажа - радиус круга */
  const PX_PER_DEG = 50 / 45
  const ok = $derived(roll !== undefined && pitch !== undefined && Number.isFinite(roll) && Number.isFinite(pitch))
  const r = $derived(ok ? roll! : 0)
  const p = $derived(ok ? Math.max(-90, Math.min(90, pitch!)) : 0)
  const id = `hz-${Math.random().toString(36).slice(2, 8)}`
</script>

<svg width={size} height={size} viewBox="-50 -50 100 100" class="shrink-0" role="img" aria-label="horizon">
  <defs>
    <clipPath {id}><circle r="48" /></clipPath>
  </defs>
  <g clip-path="url(#{id})">
    {#if ok}
      <g transform="rotate({-r}) translate(0 {p * PX_PER_DEG})" style="transition: transform 120ms linear">
        <rect x="-150" y="-150" width="300" height="150" fill="var(--blue-color)" opacity="0.55" />
        <rect x="-150" y="0" width="300" height="150" fill="var(--orange-color)" opacity="0.55" />
        <line x1="-150" x2="150" y1="0" y2="0" stroke="var(--font-color)" stroke-width="0.8" />
        {#each [-30, -20, -10, 10, 20, 30] as deg (deg)}
          <line
            x1={deg % 20 === 0 ? -12 : -7}
            x2={deg % 20 === 0 ? 12 : 7}
            y1={-deg * PX_PER_DEG}
            y2={-deg * PX_PER_DEG}
            stroke="var(--font-color)"
            stroke-width="0.6"
            opacity="0.8"
          />
        {/each}
      </g>
    {:else}
      <circle r="48" fill="var(--back-color)" />
    {/if}
  </g>
  <circle r="48" fill="none" stroke="var(--hairline-color)" stroke-width="1.5" />
  <path d="M-26 0H-9l3 4M26 0H9l-3 4" fill="none" stroke="var(--accent-text)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
  <circle r="1.8" fill="var(--accent-text)" />
</svg>
