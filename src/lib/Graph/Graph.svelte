<script module lang="ts">
  import type { IOption } from "../types"

  /* Константы и настройки - экспортируются для переиспользования в GraphProps.svelte (редактор конструктора) */
  export const REFRESH_OPTIONS: IOption<number>[] = [
    { id: "RefreshOption-AUTO", name: "AUTO", value: 0 },
    { id: "RefreshOption-50", name: "50", value: 50 },
    { id: "RefreshOption-100", name: "100", value: 100 },
    { id: "RefreshOption-250", name: "250", value: 250 },
    { id: "RefreshOption-500", name: "500", value: 500 },
    { id: "RefreshOption-1000", name: "1000", value: 1000 },
    { id: "RefreshOption-5000", name: "5000", value: 5000 },
  ]
</script>

<script lang="ts">
  import FieldLabel from "../FieldLabel.svelte"
  import { T } from "../locales/i18n"
  import { onMount, untrack } from "svelte"
  import { watchTheme } from "../themeWatch"
  import Select from "../Select/Select.svelte"
  import { createRing, type Ring } from "../ring"
  import type { IGraphDataObject, IGraphProps } from "../types"

  let {
    wrapperClass = "",
    label = { name: "", class: "" },
    help,
    streamingData = { data: [] },
    isTest = false,
    refreshRate = 0,
    historyData = [],
  }: IGraphProps = $props()

  /* Статический режим: historyData передан целиком с реальными timestamp (Unix-эпоха в мс) */
  const isHistoryMode = $derived(!!historyData && historyData.length > 0)

  type Point = { x: number; y: number }
  type Line = { name: string; points: Point[] }

  /* Цвета линий - метки палитры темы по порядку */
  const COLORS = ["--blue-mark", "--red-mark", "--green-mark", "--orange-mark", "--purple-mark", "--cyan-mark"]
  const MAX_LINES = COLORS.length

  let container: HTMLDivElement
  let canvas: HTMLCanvasElement
  let ctx: CanvasRenderingContext2D
  let width = $state(600)
  let height = $state(125)
  let selectedRefreshRate = $derived(isTest ? 50 : (refreshRate ?? 0))
  const maxDataPoints = $derived(selectedRefreshRate == 0 ? 20 : 100)

  /* Живой режим: точки линий в кольцевых буферах вне реактивности, наружу - только последние значения для легенды */
  let live: { name: string; points: Ring<Point> }[] = []
  let liveValues = $state.raw<IGraphDataObject[]>([])
  $effect(() => {
    const size = maxDataPoints
    untrack(() => live.forEach((line) => line.points.resize(size)))
  })

  /* Статический режим: ряды по времени */
  const history: Line[] = $derived(
    historyData.slice(0, MAX_LINES).map((s, i) => ({
      name: s.name || `Value ${i}`,
      points: [...s.points].sort((a, b) => a.timestamp - b.timestamp).map((p) => ({ x: p.timestamp, y: p.value })),
    })),
  )

  const lines = (): Line[] => (isHistoryMode ? history : live.map((line) => ({ name: line.name, points: line.points.toArray() })))
  let legend = $derived(isHistoryMode ? history.map((line) => ({ name: line.name, value: line.points.at(-1)?.y ?? 0 })) : liveValues)

  /* Добавляет точку живого графика: значения линий в момент time; линия с новым именем начинается заново */
  export const push = (sample: IGraphDataObject[], time = Date.now()) => {
    if (isHistoryMode) return
    const values = sample.slice(0, MAX_LINES)
    live = values.map((d, i) => {
      const name = d.name || `Value ${i}`
      const line = live[i]?.name === name ? live[i] : { name, points: createRing<Point>(maxDataPoints) }
      line.points.push({ x: time, y: d.value })
      return line
    })
    liveValues = values
    updateLiveYRange()
    scheduleDraw()
  }

  /* AUTO: точка на каждый новый массив streamingData.data */
  let lastData: IGraphDataObject[] | null = null
  $effect(() => {
    const data = streamingData?.data
    if (isHistoryMode || isTest || selectedRefreshRate !== 0 || !data?.length || data === lastData) return
    lastData = data
    untrack(() => push(data))
  })

  /* Интервал: последние значения streamingData раз в selectedRefreshRate; имитация - случайные значения, модуль грузится только при isTest */
  $effect(() => {
    if (isHistoryMode || selectedRefreshRate <= 0) return
    const rate = selectedRefreshRate
    let timer: ReturnType<typeof setInterval> | undefined
    let stopped = false
    const start = (sample: () => IGraphDataObject[] | null | undefined) => {
      if (!stopped) timer = setInterval(() => sample()?.length && push(sample()!), rate)
    }
    if (isTest) import("./testSeries").then(({ testSample }) => start(() => testSample((streamingData?.data ?? []).map((d) => d.name))))
    else start(() => streamingData?.data)
    return () => {
      stopped = true
      clearInterval(timer)
    }
  })

  /* Автомасштаб Y живого режима: диапазон плавно подъезжает к фактическому min/max буфера (±10% отступ) */
  let liveYRange: { min: number; max: number } | null = null

  const computeAutoYRange = (values: number[]): { min: number; max: number } => {
    if (values.length === 0) return { min: -1, max: 1 }
    const rawMin = Math.min(...values)
    const rawMax = Math.max(...values)
    const pad = (rawMax - rawMin) * 0.1 || Math.abs(rawMax) * 0.1 || 1
    return { min: rawMin - pad, max: rawMax + pad }
  }

  const updateLiveYRange = () => {
    const target = computeAutoYRange(lines().flatMap((line) => line.points.map((p) => p.y)))
    const smoothing = 0.15
    liveYRange = liveYRange
      ? { min: liveYRange.min + (target.min - liveYRange.min) * smoothing, max: liveYRange.max + (target.max - liveYRange.max) * smoothing }
      : target
  }

  /* Тултип при наведении - время и значения всех линий в ближайшей к курсору точке */
  let tooltip = $state<{ visible: boolean; x: number; y: number; time: number; items: { name: string; value: number; color: string }[] }>({
    visible: false,
    x: 0,
    y: 0,
    time: 0,
    items: [],
  })

  /* Отрисовка не чаще кадра; при смене темы сетка, подписи и линии перерисовываются её цветами */
  let frame = 0
  const scheduleDraw = () => (frame ||= requestAnimationFrame(() => ((frame = 0), drawAllGraphs())))
  onMount(() => {
    const unwatch = watchTheme(scheduleDraw)
    return () => {
      unwatch()
      cancelAnimationFrame(frame)
    }
  })
  $effect(() => {
    void history
    scheduleDraw()
  })

  let resizeObserver: ResizeObserver
  $effect(() => {
    if (!container || !canvas) return
    const dpr = window.devicePixelRatio || 1
    resizeObserver = new ResizeObserver(() => {
      const rect = container.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx = canvas.getContext("2d")!
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      drawAllGraphs()
    })
    resizeObserver.observe(container)
    return () => resizeObserver.disconnect()
  })

  /* Общая геометрия осей - переиспользуется отрисовкой и обработчиком наведения мыши, чтобы не дублировать формулы */
  const computeGeometry = (data: Line[]) => {
    const padding = { top: 10, right: 10, bottom: 20, left: 35 }
    const graphWidth = width - padding.left - padding.right
    const graphHeight = height - padding.top - padding.bottom

    const allPoints = data.flatMap((line) => line.points)
    const minX = allPoints.length ? Math.min(...allPoints.map((p) => p.x)) : 0
    const maxX = allPoints.length ? Math.max(...allPoints.map((p) => p.x)) : 1
    const timeSpan = maxX - minX || 1

    /* Авто-масштаб по данным (±10%): статический - разово по массиву, живой - через сглаженный liveYRange (updateLiveYRange) */
    const { min: yMin, max: yMax } = (!isHistoryMode && liveYRange) || computeAutoYRange(allPoints.map((p) => p.y))
    const ySpan = yMax - yMin || 1

    const getX = (x: number) => padding.left + ((x - minX) / timeSpan) * graphWidth
    const getY = (y: number) => padding.top + graphHeight - ((y - yMin) / ySpan) * graphHeight

    return { padding, graphWidth, minX, timeSpan, yMin, yMax, getX, getY }
  }

  /* Бинарный поиск ближайшей по времени точки - точки линий всегда отсортированы по x (по построению) */
  const findNearestPoint = (points: Point[], t: number): Point | null => {
    if (points.length === 0) return null
    let lo = 0
    let hi = points.length - 1
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (points[mid].x < t) lo = mid + 1
      else hi = mid
    }
    if (lo > 0 && Math.abs(points[lo - 1].x - t) < Math.abs(points[lo].x - t)) return points[lo - 1]
    return points[lo]
  }

  const pad2 = (n: number) => String(n).padStart(2, "0")

  /* Компактная адаптивная подпись сетки по оси X: относительное время для живого режима, дата/время - для статического */
  const formatAxisLabel = (t: number, spanMs: number): string => {
    if (!isHistoryMode) return `${((t - Date.now()) / 1000).toFixed(0)}s`
    const d = new Date(t)
    const hhmm = `${pad2(d.getHours())}:${pad2(d.getMinutes())}`
    if (spanMs < 24 * 60 * 60 * 1000) return hhmm
    const ddmm = `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}`
    if (spanMs < 365 * 24 * 60 * 60 * 1000) return `${ddmm} ${hhmm}`
    return `${ddmm}.${d.getFullYear()}`
  }

  /* Полная подпись времени в тултипе */
  const formatTooltipTime = (t: number): string => {
    if (!isHistoryMode) return `${((t - Date.now()) / 1000).toFixed(1)}s`
    const d = new Date(t)
    return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`
  }

  const handleMouseMove = (e: MouseEvent) => {
    const data = lines()
    if (!canvas || data.length === 0) return
    const rect = canvas.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const { padding, graphWidth, minX, timeSpan } = computeGeometry(data)

    if (mouseX < padding.left || mouseX > width - padding.right) {
      if (tooltip.visible) {
        tooltip = { ...tooltip, visible: false }
        scheduleDraw()
      }
      return
    }

    const t = minX + ((mouseX - padding.left) / graphWidth) * timeSpan
    const items = data
      .map((line, i) => {
        const nearest = findNearestPoint(line.points, t)
        return nearest ? { name: line.name, value: nearest.y, color: `var(${COLORS[i]})`, time: nearest.x } : null
      })
      .filter((v): v is { name: string; value: number; color: string; time: number } => v !== null)

    if (items.length === 0) {
      tooltip = { ...tooltip, visible: false }
      return
    }

    tooltip = { visible: true, x: mouseX, y: mouseY, time: items[0].time, items }
    scheduleDraw()
  }

  const handleMouseLeave = () => {
    if (!tooltip.visible) return
    tooltip = { ...tooltip, visible: false }
    scheduleDraw()
  }

  /* Прозрачность линий сетки - общая с PeriodChart (border-(--faint-color)/40) */
  const GRID_ALPHA = 0.4

  const drawAllGraphs = () => {
    if (!ctx) return
    ctx.clearRect(0, 0, width, height)

    const data = lines()
    const { padding, graphWidth, minX, timeSpan, yMin, yMax, getX, getY } = computeGeometry(data)
    const style = getComputedStyle(canvas)

    /* Сетка в стиле PeriodChart: пунктир цветом --faint-color темы, подписи тем же цветом без прозрачности */
    const gridColor = style.getPropertyValue("--faint-color").trim()
    ctx.strokeStyle = gridColor
    ctx.fillStyle = gridColor
    ctx.lineWidth = 1
    ctx.setLineDash([3, 3])
    ctx.font = "10px monospace"

    /* Сетка X */
    ctx.textAlign = "center"

    /* Подпись на каждой линии сетки, если влезает; на узком холсте - через одну или реже, чтобы не слипались */
    const labelWidth = Math.max(ctx.measureText(formatAxisLabel(minX, timeSpan)).width, ctx.measureText(formatAxisLabel(minX + timeSpan, timeSpan)).width)
    const labelStep = [1, 2, 5, 10].find((step) => (graphWidth / 10) * step >= labelWidth + 6) ?? 10
    for (let i = 0; i <= 10; i++) {
      const t = minX + (i / 10) * timeSpan
      const x = getX(t)
      ctx.globalAlpha = GRID_ALPHA
      ctx.beginPath()
      ctx.moveTo(x, padding.top)
      ctx.lineTo(x, height - padding.bottom)
      ctx.stroke()
      ctx.globalAlpha = 1
      ctx.textBaseline = "top"
      if (i % labelStep === 0) ctx.fillText(formatAxisLabel(t, timeSpan), x, height - padding.bottom + 2)
    }

    /* Сетка Y */
    ctx.textAlign = "right"
    ctx.textBaseline = "middle"
    const ySteps = 8
    for (let i = 0; i <= ySteps; i++) {
      const yVal = yMax - (i * (yMax - yMin)) / ySteps
      const y = getY(yVal)
      ctx.globalAlpha = GRID_ALPHA
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(width - padding.right, y)
      ctx.stroke()
      ctx.globalAlpha = 1
      ctx.fillText(yVal.toFixed(1), padding.left - 5, y)
    }
    ctx.setLineDash([])

    /* Отрисовка графиков */
    ctx.lineWidth = 2
    data.forEach(({ points }, i) => {
      if (points.length < 2) return
      ctx.strokeStyle = style.getPropertyValue(COLORS[i]).trim()
      ctx.beginPath()
      ctx.moveTo(getX(points[0].x), getY(points[0].y))
      for (let i = 1; i < points.length - 1; i++) {
        const p1 = points[i]
        const p2 = points[i + 1]
        const xc2 = (p1.x + p2.x) / 2
        const yc2 = (p1.y + p2.y) / 2
        ctx.quadraticCurveTo(getX(p1.x), getY(p1.y), getX(xc2), getY(yc2))
      }
      const last = points[points.length - 1]
      ctx.lineTo(getX(last.x), getY(last.y))
      ctx.stroke()
    })

    /* Вертикальная линия-указатель под тултипом */
    if (tooltip.visible) {
      const x = getX(tooltip.time)
      ctx.strokeStyle = style.getPropertyValue("--muted-color").trim()
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x, padding.top)
      ctx.lineTo(x, height - padding.bottom)
      ctx.stroke()
    }
  }
</script>

<!-- @container: раскладка по ширине самого графика - уже 28rem панель уходит под холст -->
<div class={`@container relative flex w-full flex-col items-center justify-center ${wrapperClass}`}>
  <FieldLabel {label} info={help?.info} class="w-full justify-center px-4 text-center" />

  <div class="flex w-full min-w-0 flex-col gap-3 @md:flex-row @md:gap-4">
    <!-- График: холст абсолютно поверх контейнера - его пиксельная ширина не распирает контейнер, иначе в сетке/flex с 1fr ширина растёт по кругу (ResizeObserver) -->
    <!-- design-handoff, раздел 9: рамка --hairline-color без тени, тултип в оформлении общего Tooltip.svelte -->
    <div bind:this={container} class="relative h-64 min-w-0 grow overflow-hidden rounded-[14px] border border-(--hairline-color)">
      <canvas class="absolute inset-0 h-full w-full bg-(--back-color)" bind:this={canvas} onmousemove={handleMouseMove} onmouseleave={handleMouseLeave}
      ></canvas>

      {#if tooltip.visible}
        <div
          class="pointer-events-none absolute z-10 rounded-lg border border-(--hairline-color) bg-(--back-color) px-2.5 py-1.5 text-[12px] whitespace-nowrap shadow-(--elevation-2)"
          style="left: {Math.min(tooltip.x + 12, width - 150)}px; top: {Math.min(tooltip.y + 12, height - 16 - tooltip.items.length * 16)}px;"
        >
          <div class="mb-1 font-semibold">{formatTooltipTime(tooltip.time)}</div>
          {#each tooltip.items as item}
            <div class="flex items-center gap-1.5">
              <span class="h-2 w-2 shrink-0 rounded-full" style="background-color: {item.color}"></span>
              <span>{item.name}:</span>
              <span class="font-semibold">{item.value.toFixed(2)}</span>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Панель настроек: справа от холста, на узком - под ним, развёртка и значения рядом -->
    <div class="grid w-full grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-x-3 gap-y-2 @md:flex @md:w-48 @md:flex-col @md:gap-2">
      {#if !isHistoryMode}
        <!-- Развертка по горизонтали -->
        <Select
          label={{ name: $T("ui.graph.refresh"), class: "" }}
          options={REFRESH_OPTIONS}
          value={selectedRefreshRate}
          onUpdate={(value) => (selectedRefreshRate = value)}
        />
      {/if}

      <!-- Переменные и их значение: сетка, а не таблица - имя обрезается «…», значение не переносится -->
      <div class="flex flex-col gap-1 first:col-span-full">
        <h5 class="text-[12px] font-semibold text-(--muted-color)">{$T("ui.graph.values")}</h5>
        <div class="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2 gap-y-1 text-[13px]">
          {#each legend as item, i}
            <span class="size-2.5 rounded-full" style="background-color: var({COLORS[i]})"></span>
            <span class="truncate font-semibold" title={item.name}>{item.name}</span>
            <span class="text-right whitespace-nowrap tabular-nums">{item.value?.toFixed(2)}</span>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>
