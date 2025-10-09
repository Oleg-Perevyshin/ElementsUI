<!-- $lib/ElementsUI/Graph.svelte -->
<script lang="ts">
  import { onMount } from 'svelte'
  import Select from '../Select/Select.svelte'
  import type { IGraphDataObject, IGraphProps, ISelectOption } from '../types'

  /* Инициализация пропсов с дефолтными значениями */
  let {
    id = crypto.randomUUID(),
    wrapperClass = '',
    label = { name: '', class: '' },
    streamingData = { data: [], timestamp: Date.now() },
    isTest = false,
  }: IGraphProps = $props()

  /* Состояние компонента */
  let graphData = $state<{ id: string; points: { x: number; y: number }[]; color: string; name: string }[]>([])
  let currentValues = $state<number[]>([])
  let container: HTMLDivElement
  let canvas: HTMLCanvasElement
  let ctx: CanvasRenderingContext2D
  let width = $state(600)
  let height = $state(125)

  /* Константы и настройки */
  const REFRESH_OPTIONS: ISelectOption[] = [
    { id: 'RefreshOption-AUTO', name: 'AUTO', value: 0, class: '' },
    { id: 'RefreshOption-10', name: '10', value: 10, class: '' },
    { id: 'RefreshOption-25', name: '25', value: 25, class: '' },
    { id: 'RefreshOption-50', name: '50', value: 50, class: '' },
    { id: 'RefreshOption-100', name: '100', value: 100, class: '' },
    { id: 'RefreshOption-250', name: '250', value: 250, class: '' },
    { id: 'RefreshOption-500', name: '500', value: 500, class: '' },
    { id: 'RefreshOption-1000', name: '1000', value: 1000, class: '' },
    { id: 'RefreshOption-5000', name: '5000', value: 5000, class: '' },
  ]
  const SCALE_OPTIONS: ISelectOption[] = [
    { id: 'ScaleOption-50', name: '50', value: 50, class: '' },
    { id: 'ScaleOption-100', name: '100', value: 100, class: '' },
    { id: 'ScaleOption-500', name: '500', value: 500, class: '' },
    { id: 'ScaleOption-1000', name: '1000', value: 1000, class: '' },
    { id: 'ScaleOption-2000', name: '2000', value: 2000, class: '' },
  ]
  let selectedRefreshRate = $state(0)
  let selectedScale = $state(100)
  const maxDataPoints = $derived(selectedRefreshRate == 0 ? 20 : 100)
  const defaultColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']

  let previousDataTimestamp: number = $state(0)

  /* Инициализация данных графиков */
  const initializeGraphData = () => {
    if (typeof streamingData === 'string') {
      streamingData = JSON.parse(streamingData)
    }
    if (!streamingData.data || streamingData.data.length === 0) {
      graphData = []
      currentValues = []
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

  /* Обработка входящих данных */
  let intervalId: ReturnType<typeof setInterval>
  $effect(() => {
    clearInterval(intervalId)
    if (selectedRefreshRate > 0 && streamingData.data && streamingData.data.length > 0) {
      intervalId = setInterval(() => {
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
        drawAllGraphs()
      }, selectedRefreshRate)
    } else if (selectedRefreshRate == 0 && streamingData.data && streamingData.data.length > 0 && !isTest) {
      intervalId = setInterval(() => {
        if (previousDataTimestamp < (streamingData.timestamp ?? Date.now())) {
          let newValues = (streamingData.data as IGraphDataObject[]).map((dataset) => dataset.value)

          newValues.forEach((value, i) => {
            if (!graphData[i]) return
            graphData[i].points.push({ x: streamingData.timestamp ?? Date.now(), y: value })
            if (graphData[i].points.length > maxDataPoints) {
              graphData[i].points.shift()
            }
            currentValues[i] = value
          })
          drawAllGraphs()
          previousDataTimestamp = streamingData.timestamp ?? Date.now()
        }
      }, 10)
    }
    console.log(streamingData.data)
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
      ctx = canvas.getContext('2d')!
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      drawAllGraphs()
    })
    resizeObserver.observe(container)
    return () => resizeObserver.disconnect()
  })

  const drawAllGraphs = () => {
    if (!ctx) return
    ctx.clearRect(0, 0, width, height)

    const padding = {
      top: 10,
      right: 10,
      bottom: 20,
      left: 35,
    }

    const graphWidth = width - padding.left - padding.right
    const graphHeight = height - padding.top - padding.bottom

    const allPoints = graphData.flatMap((g) => g.points)
    const minX = Math.min(...allPoints.map((p) => p.x))
    const maxX = Math.max(...allPoints.map((p) => p.x))
    const timeSpan = maxX - minX || 1

    // Функции преобразования координат с учетом отступов
    const getX = (x: number) => padding.left + ((x - minX) / timeSpan) * graphWidth
    const getY = (y: number) => padding.top + graphHeight - (((y / selectedScale) * graphHeight) / 2 + graphHeight / 2)

    /* Сетка X */
    ctx.strokeStyle = '#777'
    ctx.fillStyle = '#777'
    ctx.lineWidth = 0.5
    ctx.font = '10px monospace'
    ctx.textAlign = 'center'

    const now = Date.now()
    for (let i = 0; i <= 10; i++) {
      const t = minX + (i / 10) * timeSpan
      const x = getX(t)
      const secondsAgo = ((t - now) / 1000).toFixed(0)
      ctx.beginPath()
      ctx.moveTo(x, padding.top)
      ctx.lineTo(x, height - padding.bottom)
      ctx.stroke()
      ctx.textBaseline = 'top'
      ctx.fillText(`${secondsAgo}s`, x, height - padding.bottom + 2)
    }

    /* Сетка Y */
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    const ySteps = 8
    for (let i = 0; i <= ySteps; i++) {
      const yVal = selectedScale - (i * 2 * selectedScale) / ySteps
      const y = getY(yVal)
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(width - padding.right, y)
      ctx.stroke()
      ctx.fillText(`${yVal.toFixed(0)}`, padding.left - 5, y)
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
  }
</script>

<div {id} class={`relative flex w-full flex-col items-center justify-center ${wrapperClass}`}>
  {#if label.name}
    <h5 class={`w-full px-4 text-center ${label.class}`}>{label.name}</h5>
  {/if}

  <div class="flex w-full flex-row gap-4">
    <!-- График -->
    <div bind:this={container} class="h-64 flex-grow overflow-hidden rounded-md border border-gray-200">
      <canvas class="h-full w-full bg-[var(--back-color)]" bind:this={canvas}></canvas>
    </div>

    <!-- Панель настроек -->
    <div class="flex w-48 flex-col gap-2">
      <!-- Развертка по горизонтали -->
      <Select
        label={{ name: 'Refresh rate', class: '' }}
        options={REFRESH_OPTIONS}
        value={REFRESH_OPTIONS.find((o) => o.value == selectedRefreshRate)}
        onUpdate={(value) => (selectedRefreshRate = value.value as number)}
      />

      <!-- Масштаб по вертикали -->
      <Select
        label={{ name: 'Scale' }}
        options={SCALE_OPTIONS}
        value={SCALE_OPTIONS.find((o) => o.value == selectedScale)}
        onUpdate={(value) => (selectedScale = value.value as number)}
      />

      <!-- Переменные и их значение -->
      <div>
        <h5 class="px-4">Values</h5>
        <table class="w-full font-mono text-sm">
          <tbody>
            {#each graphData as data, i (i)}
              <tr>
                <td><div class="mr-2 h-4 w-4 rounded-full" style="background-color: {data.color}"></div></td>
                <td class="w-24 truncate text-left font-semibold">{(streamingData.data as IGraphDataObject[])?.[i]?.name}</td>
                <td class="w-16 text-right">{currentValues[i].toFixed(2)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
