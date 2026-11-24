<!-- $lib/MountAxesIcon.svelte - объёмная схема осей датчика после выбранного поворота -->
<script lang="ts">
  let { roll = 0, pitch = 0, yaw = 0 }: { roll?: number; pitch?: number; yaw?: number } = $props()

  const project = (axis: number[]) => {
    const r = (roll * Math.PI) / 180
    const p = (pitch * Math.PI) / 180
    const y = (yaw * Math.PI) / 180
    const cr = Math.cos(r),
      sr = Math.sin(r)
    const cp = Math.cos(p),
      sp = Math.sin(p)
    const cy = Math.cos(y),
      sy = Math.sin(y)
    const x = axis[0],
      yy = axis[1],
      z = axis[2]
    const rx = x
    const ry = cr * yy - sr * z
    const rz = sr * yy + cr * z
    const px = cp * rx + sp * rz
    const py = ry
    const pz = -sp * rx + cp * rz
    const vx = cy * px - sy * py
    const vy = sy * px + cy * py
    const vz = pz
    return { x: 32 + (vx - vy) * 15, y: 37 + (vx + vy) * 7 - vz * 19 }
  }

  const arrow = (point: { x: number; y: number }) => {
    const dx = point.x - 32,
      dy = point.y - 37
    const length = Math.max(1, Math.hypot(dx, dy))
    const ux = dx / length,
      uy = dy / length
    const bx = point.x - ux * 6,
      by = point.y - uy * 6
    return `${point.x},${point.y} ${bx - uy * 3},${by + ux * 3} ${bx + uy * 3},${by - ux * 3}`
  }

  const xAxis = $derived(project([1, 0, 0]))
  const yAxis = $derived(project([0, 1, 0]))
  const zAxis = $derived(project([0, 0, 1]))
</script>

<svg viewBox="0 0 64 54" class="h-14 w-16" aria-hidden="true">
  <circle cx="32" cy="37" r="2.5" fill="var(--font-color)" />
  <line x1="32" y1="37" x2={xAxis.x} y2={xAxis.y} stroke="var(--red-mark)" stroke-width="3" stroke-linecap="round" />
  <polygon points={arrow(xAxis)} fill="var(--red-mark)" />
  <text
    x={xAxis.x}
    y={xAxis.y}
    dx="3"
    dy="4"
    fill="var(--red-text)"
    font-size="10"
    font-weight="800"
    paint-order="stroke"
    stroke="var(--container-color)"
    stroke-width="2"
  >
    X
  </text>
  <line x1="32" y1="37" x2={yAxis.x} y2={yAxis.y} stroke="var(--green-mark)" stroke-width="3" stroke-linecap="round" />
  <polygon points={arrow(yAxis)} fill="var(--green-mark)" />
  <text
    x={yAxis.x}
    y={yAxis.y}
    dx="3"
    dy="4"
    fill="var(--green-text)"
    font-size="10"
    font-weight="800"
    paint-order="stroke"
    stroke="var(--container-color)"
    stroke-width="2"
  >
    Y
  </text>
  <line x1="32" y1="37" x2={zAxis.x} y2={zAxis.y} stroke="var(--blue-mark)" stroke-width="3" stroke-linecap="round" />
  <polygon points={arrow(zAxis)} fill="var(--blue-mark)" />
  <text
    x={zAxis.x}
    y={zAxis.y}
    dx="3"
    dy="4"
    fill="var(--blue-text)"
    font-size="10"
    font-weight="800"
    paint-order="stroke"
    stroke="var(--container-color)"
    stroke-width="2"
  >
    Z
  </text>
</svg>
