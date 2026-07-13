<!-- $lib/ElementsUI/Graph.svelte -->
<script module lang="ts">
  import type { IOption } from "../types"

  /* Константы и настройки — экспортируются для переиспользования в GraphProps.svelte (редактор конструктора) */
  export const REFRESH_OPTIONS: IOption[] = [
    { id: "RefreshOption-AUTO", name: "AUTO", value: 0, class: "" },
    { id: "RefreshOption-50", name: "50", value: 50, class: "" },
    { id: "RefreshOption-100", name: "100", value: 100, class: "" },
    { id: "RefreshOption-250", name: "250", value: 250, class: "" },
    { id: "RefreshOption-500", name: "500", value: 500, class: "" },
    { id: "RefreshOption-1000", name: "1000", value: 1000, class: "" },
    { id: "RefreshOption-5000", name: "5000", value: 5000, class: "" },
  ]
</script>

<script lang="ts">
  import { onMount } from "svelte"
  import Select from "../Select/Select.svelte"
  import type { IGraphDataObject, IGraphProps } from "../types"

  /* Инициализация пропсов с дефолтными значениями */
  let {
    id = crypto.randomUUID(),
    wrapperClass = "",
    label = { name: "", class: "" },
    streamingData = { data: [] },
    isTest = false,
    refreshRate = 0,
    historyData = [],
  }: IGraphProps = $props()

  /* Статический режим: historyData передан целиком с реальными timestamp (Unix-эпоха в мс) —
     компонент рисует весь массив разом, без интервалов/AUTO; streamingData/refreshRate игнорируются */
  const isHistoryMode = $derived(!!historyData && historyData.length > 0)

  /* Состояние компонента */
  let graphData = $state<{ id: string; points: { x: number; y: number }[]; color: string; name: string }[]>([])
  let currentValues = $state<number[]>([])
  let container: HTMLDivElement
  let canvas: HTMLCanvasElement
  let ctx: CanvasRenderingContext2D
  let width = $state(600)
  let height = $state(125)

  /* selectedRefreshRate изначально берётся из пропа (сохраняется вместе с компонентом в конструкторе),
     но остаётся локально переключаемым через Select ниже — присвоение этому $derived временно
     переопределяет значение, пока не изменится refreshRate/isTest (проп) */
  let selectedRefreshRate = $derived(isTest ? 50 : (refreshRate ?? 0))
  const maxDataPoints = $derived(selectedRefreshRate == 0 ? 20 : 100)
  const defaultColors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"]

  let previousValues: number[] = $state([])

  /* Автомасштаб Y для живого режима: диапазон плавно "подъезжает" к фактическому min/max буфера
     (±10% отступ), пересчитывается один раз за тик (не за кадр/mousemove) и сглаживается —
     иначе ось дёргалась бы на каждый новый семпл */
  let liveYRange = $state<{ min: number; max: number } | null>(null)

  const computeAutoYRange = (values: number[]): { min: number; max: number } => {
    if (values.length === 0) return { min: -1, max: 1 }
    const rawMin = Math.min(...values)
    const rawMax = Math.max(...values)
    const pad = (rawMax - rawMin) * 0.1 || Math.abs(rawMax) * 0.1 || 1
    return { min: rawMin - pad, max: rawMax + pad }
  }

  const updateLiveYRange = () => {
    const target = computeAutoYRange(graphData.flatMap((g) => g.points.map((p) => p.y)))
    if (!liveYRange) {
      liveYRange = target
      return
    }
    const smoothing = 0.15
    liveYRange = {
      min: liveYRange.min + (target.min - liveYRange.min) * smoothing,
      max: liveYRange.max + (target.max - liveYRange.max) * smoothing,
    }
  }

  /* Тултип при наведении — время и значения всех серий в ближайшей к курсору точке */
  let tooltip = $state<{ visible: boolean; x: number; y: number; time: number; items: { name: string; value: number; color: string }[] }>({
    visible: false,
    x: 0,
    y: 0,
    time: 0,
    items: [],
  })

  /* Инициализация данных графиков (потоковый режим) */
  const initializeGraphData = () => {
    if (isHistoryMode) return
    if (typeof streamingData === "string") {
      streamingData = JSON.parse(streamingData)
    }
    if (!streamingData.data || streamingData.data.length === 0) {
      graphData = []
      currentValues = []
      previousValues = []
      return
    }
    const newGraphData = (streamingData.data as IGraphDataObject[]).slice(0, 6).map((d, i) => {
      const existingData = graphData.find((g) => g.name === d.name) || graphData[i]
      return {
        id: existingData?.id || crypto.randomUUID(),
        points: existingData?.points || [],
        color: defaultColors[i % defaultColors.length],
        name: d.name || `Value ${i}`,
      }
    })
    if (JSON.stringify(graphData) !== JSON.stringify(newGraphData)) {
      graphData = newGraphData
      currentValues = (streamingData.data as IGraphDataObject[]).map((d) => d.value || 0)
    }
  }

  /* Вызываем инициализацию при монтировании и при изменении streamingData */
  onMount(initializeGraphData)
  $effect(() => {
    initializeGraphData()
  })

  /* Статический режим: строим graphData один раз (и заново при каждой смене historyData) —
     x = реальный timestamp точки, "текущее" значение в панели Values — последняя (по времени) точка серии */
  $effect(() => {
    if (!isHistoryMode) return
    const series = historyData.slice(0, 6).map((s, i) => {
      const sortedPoints = [...s.points].sort((a, b) => a.timestamp - b.timestamp).map((p) => ({ x: p.timestamp, y: p.value }))
      return {
        id: crypto.randomUUID(),
        points: sortedPoints,
        color: defaultColors[i % defaultColors.length],
        name: s.name || `Value ${i}`,
      }
    })
    graphData = series
    currentValues = series.map((s) => (s.points.length ? s.points[s.points.length - 1].y : 0))
    drawAllGraphs()
  })

  /* Обработка входящих потоковых данных.
     ВАЖНО: streamingData читается только внутри колбэков setInterval (асинхронный контекст),
     а не в теле $effect — иначе каждое новое сообщение (у нас до 10 Гц с устройства) делает
     streamingData зависимостью эффекта, и он пересоздаёт таймер на каждый пакет: если Refresh
     rate медленнее, чем частота входящих данных, setInterval убивается раньше, чем успевает
     сработать хотя бы раз — график зависает. */
  let intervalId: ReturnType<typeof setInterval>
  $effect(() => {
    clearInterval(intervalId)
    if (isHistoryMode) return
    if (selectedRefreshRate > 0) {
      intervalId = setInterval(() => {
        if (!isTest && (!streamingData.data || streamingData.data.length === 0)) return
        let newValues
        if (isTest) newValues = graphData.map(() => Math.random() * 100 - 50)
        else newValues = (streamingData.data as IGraphDataObject[]).map((dataset) => dataset.value)
        const now = Date.now()
        newValues.forEach((value, i) => {
          if (!graphData[i]) return
          graphData[i].points.push({ x: now, y: value })
          if (graphData[i].points.length > maxDataPoints) {
            graphData[i].points.shift()
          }
          currentValues[i] = value
        })
        updateLiveYRange()
        drawAllGraphs()
      }, selectedRefreshRate)
    } else if (selectedRefreshRate == 0 && !isTest) {
      /* AUTO: streamingData не несёт признак "это новый пакет" (метки времени тут нет —
         DeviceStore хранит только последнее значение), поэтому опрашиваем каждые 10мс и рисуем
         точку только когда сами значения реально изменились, а не на каждый тик поллинга. */
      intervalId = setInterval(() => {
        if (!streamingData.data || streamingData.data.length === 0) return
        const newValues = (streamingData.data as IGraphDataObject[]).map((dataset) => dataset.value)
        if (JSON.stringify(newValues) === JSON.stringify(previousValues)) return
        previousValues = newValues

        const now = Date.now()
        newValues.forEach((value, i) => {
          if (!graphData[i]) return
          graphData[i].points.push({ x: now, y: value })
          if (graphData[i].points.length > maxDataPoints) {
            graphData[i].points.shift()
          }
          currentValues[i] = value
        })
        updateLiveYRange()
        drawAllGraphs()
      }, 10)
    }
    return () => clearInterval(intervalId)
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

  /* Общая геометрия осей — переиспользуется отрисовкой и обработчиком наведения мыши, чтобы не дублировать формулы */
  const computeGeometry = () => {
    const padding = { top: 10, right: 10, bottom: 20, left: 35 }
    const graphWidth = width - padding.left - padding.right
    const graphHeight = height - padding.top - padding.bottom

    const allPoints = graphData.flatMap((g) => g.points)
    const minX = allPoints.length ? Math.min(...allPoints.map((p) => p.x)) : 0
    const maxX = allPoints.length ? Math.max(...allPoints.map((p) => p.x)) : 1
    const timeSpan = maxX - minX || 1

    /* Оба режима — авто-масштаб по фактическим данным (±10% отступ, не обязательно симметрично относительно нуля):
       в статическом считается разово по всему массиву, в живом — используется сглаженный liveYRange
       (обновляется отдельно, в updateLiveYRange, чтобы не дёргаться на каждый кадр/mousemove) */
    let yMin: number
    let yMax: number
    if (isHistoryMode) {
      const values = allPoints.map((p) => p.y)
      const range = computeAutoYRange(values)
      yMin = range.min
      yMax = range.max
    } else {
      const range = liveYRange ?? computeAutoYRange(allPoints.map((p) => p.y))
      yMin = range.min
      yMax = range.max
    }
    const ySpan = yMax - yMin || 1

    const getX = (x: number) => padding.left + ((x - minX) / timeSpan) * graphWidth
    const getY = (y: number) => padding.top + graphHeight - ((y - yMin) / ySpan) * graphHeight

    return { padding, graphWidth, graphHeight, minX, maxX, timeSpan, yMin, yMax, ySpan, getX, getY }
  }

  /* Бинарный поиск ближайшей по времени точки — точки в graphData всегда отсортированы по x (по построению) */
  const findNearestPoint = (points: { x: number; y: number }[], t: number): { x: number; y: number } | null => {
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

  /* Компактная адаптивная подпись сетки по оси X: относительное время для живого режима, дата/время — для статического */
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
    if (!canvas || graphData.length === 0) return
    const rect = canvas.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const { padding, graphWidth, minX, timeSpan } = computeGeometry()

    if (mouseX < padding.left || mouseX > width - padding.right) {
      if (tooltip.visible) {
        tooltip = { ...tooltip, visible: false }
        drawAllGraphs()
      }
      return
    }

    const t = minX + ((mouseX - padding.left) / graphWidth) * timeSpan
    const items = graphData
      .map((g) => {
        const nearest = findNearestPoint(g.points, t)
        return nearest ? { name: g.name, value: nearest.y, color: g.color, time: nearest.x } : null
      })
      .filter((v): v is { name: string; value: number; color: string; time: number } => v !== null)

    if (items.length === 0) {
      tooltip = { ...tooltip, visible: false }
      return
    }

    tooltip = { visible: true, x: mouseX, y: mouseY, time: items[0].time, items }
    drawAllGraphs()
  }

  const handleMouseLeave = () => {
    if (!tooltip.visible) return
    tooltip = { ...tooltip, visible: false }
    drawAllGraphs()
  }

  const drawAllGraphs = () => {
    if (!ctx) return
    ctx.clearRect(0, 0, width, height)

    const { padding, graphWidth, graphHeight, minX, timeSpan, yMin, yMax, getX, getY } = computeGeometry()

    /* Сетка X */
    ctx.strokeStyle = "#777"
    ctx.fillStyle = "#777"
    ctx.lineWidth = 0.5
    ctx.font = "10px monospace"
    ctx.textAlign = "center"

    for (let i = 0; i <= 10; i++) {
      const t = minX + (i / 10) * timeSpan
      const x = getX(t)
      ctx.beginPath()
      ctx.moveTo(x, padding.top)
      ctx.lineTo(x, height - padding.bottom)
      ctx.stroke()
      ctx.textBaseline = "top"
      ctx.fillText(formatAxisLabel(t, timeSpan), x, height - padding.bottom + 2)
    }

    /* Сетка Y */
    ctx.textAlign = "right"
    ctx.textBaseline = "middle"
    const ySteps = 8
    for (let i = 0; i <= ySteps; i++) {
      const yVal = yMax - (i * (yMax - yMin)) / ySteps
      const y = getY(yVal)
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(width - padding.right, y)
      ctx.stroke()
      ctx.fillText(yVal.toFixed(1), padding.left - 5, y)
    }

    /* Отрисовка графиков */
    ctx.lineWidth = 2
    graphData.forEach(({ points, color }) => {
      if (points.length < 2) return
      ctx.strokeStyle = color
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
      ctx.strokeStyle = "rgba(120, 120, 120, 0.6)"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x, padding.top)
      ctx.lineTo(x, height - padding.bottom)
      ctx.stroke()
    }
  }
</script>

<div id={`${id}-${crypto.randomUUID().slice(0, 6)}`} class={`relative flex w-full flex-col items-center justify-center ${wrapperClass}`}>
  {#if label.name}
    <h5 class={`w-full px-4 text-center ${label.class}`}>{label.name}</h5>
  {/if}

  <div class="flex w-full flex-row gap-4">
    <!-- График -->
    <div bind:this={container} class="relative h-64 grow overflow-hidden rounded-xl border border-gray-200 shadow-sm">
      <canvas
        class="h-full w-full bg-(--back-color)"
        bind:this={canvas}
        onmousemove={handleMouseMove}
        onmouseleave={handleMouseLeave}
      ></canvas>

      {#if tooltip.visible}
        <div
          class="pointer-events-none absolute z-10 rounded-lg border border-(--border-color) bg-(--back-color) px-2 py-1 text-xs whitespace-nowrap shadow-lg"
          style="left: {Math.min(tooltip.x + 12, width - 150)}px; top: {Math.min(tooltip.y + 12, height - 16 - tooltip.items.length * 16)}px;"
        >
          <div class="mb-1 font-semibold">{formatTooltipTime(tooltip.time)}</div>
          {#each tooltip.items as item (item.name)}
            <div class="flex items-center gap-1.5">
              <span class="h-2 w-2 shrink-0 rounded-full" style="background-color: {item.color}"></span>
              <span>{item.name}:</span>
              <span class="font-semibold">{item.value.toFixed(2)}</span>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Панель настроек -->
    <div class="flex w-48 flex-col gap-2">
      {#if !isHistoryMode}
        <!-- Развертка по горизонтали -->
        <Select
          label={{ name: "Refresh Rate", class: "" }}
          options={REFRESH_OPTIONS}
          value={REFRESH_OPTIONS.find((o) => o.value == selectedRefreshRate)}
          onUpdate={(value) => (selectedRefreshRate = (value as IOption).value as number)}
        />
      {/if}

      <!-- Переменные и их значение -->
      <div>
        <h5 class="px-4">Values</h5>
        <table class="w-full font-mono text-sm">
          <tbody>
            {#each graphData as data, i (data.id)}
              <tr>
                <td><div class="mr-2 h-4 w-4 rounded-full" style="background-color: {data.color}"></div></td>
                <td class="w-24 truncate text-left font-semibold">{data.name}</td>
                <td class="w-16 text-right">{currentValues[i]?.toFixed(2)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
