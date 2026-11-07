<!-- $lib/WidgetMap/mission/MissionLayers.svelte - слои карты генератора миссии: поле и зоны, траектория, черновик контура и ручки вершин; клики и перетаскивание ручек отдаёт наверх -->
<script lang="ts">
  import { onDestroy, untrack } from "svelte"
  import { getMapContext } from "../mapWrapper"
  import type { LngLat } from "./coverage"
  import type { IMapColors } from "../../widgetAccent"

  interface Props {
    zones: any /* GeoJSON FeatureCollection: поле и запретные зоны */
    path: any /* Траектория: линии с kind spray/turn/transit */
    draft: any /* Незамкнутый контур при рисовании */
    handles: any /* Точки: вершины, середины рёбер, точка взлёта */
    drawing: boolean
    onMapClick: (ll: LngLat, px: { x: number; y: number }) => void
    onMapDblClick: () => void
    onDrag: (id: string, ll: LngLat) => void
    onDragEnd: (id: string) => void
    onHandleRightClick: (id: string) => void
    onCursor: (ll: LngLat | null) => void
    colors: IMapColors /* Маршрут и точки - мастер-цвет, поле, зоны и развороты - цвета по смыслу */
  }

  let { zones, path, draft, handles, drawing, onMapClick, onMapDblClick, onDrag, onDragEnd, onHandleRightClick, onCursor, colors }: Props = $props()

  /* Краски слоёв от цветов виджета: одна таблица и для создания слоёв, и для перекраски */
  const paints = (c: IMapColors): Record<string, Record<string, any>> => {
    const byKind = ["match", ["get", "kind"], "hole", c.red, c.green]
    return {
      "msn-zones-fill": { "fill-color": byKind },
      "msn-zones-line": { "line-color": byKind },
      "msn-path-transit": { "line-color": c.accent },
      "msn-path-turn": { "line-color": c.orange },
      "msn-path-spray": { "line-color": c.green },
      "msn-path-route": { "line-color": c.accent },
      "msn-draft-line": { "line-color": byKind },
      "msn-handles": {
        "circle-color": ["match", ["get", "role"], "mid", "#ffffff", "start", c.accent, "wp", c.accent, byKind],
        "circle-stroke-color": ["match", ["get", "role"], "mid", ["match", ["get", "kind"], "hole", c.red, "route", c.accent, c.green], "#ffffff"],
      },
      "msn-labels": { "text-color": c.onAccent },
    }
  }
  const initial = paints(untrack(() => colors))

  const mapCtx = getMapContext()
  const map = mapCtx.map!

  const SOURCES = ["msn-zones", "msn-path", "msn-draft", "msn-handles"]
  const empty = { type: "FeatureCollection", features: [] }

  for (const id of SOURCES) mapCtx.addSource(id, { type: "geojson", data: empty as any })
  mapCtx.addLayer({
    id: "msn-zones-fill",
    type: "fill",
    source: "msn-zones",
    paint: {
      ...initial["msn-zones-fill"],
      "fill-opacity": ["match", ["get", "kind"], "hole", 0.28, 0.1],
    },
  })
  mapCtx.addLayer({
    id: "msn-zones-line",
    type: "line",
    source: "msn-zones",
    paint: { ...initial["msn-zones-line"], "line-width": 2 },
  })
  mapCtx.addLayer({
    id: "msn-path-transit",
    type: "line",
    source: "msn-path",
    filter: ["==", ["get", "kind"], "transit"],
    layout: { "line-join": "round", "line-cap": "round" },
    paint: { ...initial["msn-path-transit"], "line-width": 2, "line-dasharray": [2, 1.5] },
  })
  mapCtx.addLayer({
    id: "msn-path-turn",
    type: "line",
    source: "msn-path",
    filter: ["==", ["get", "kind"], "turn"],
    layout: { "line-join": "round", "line-cap": "round" },
    paint: { ...initial["msn-path-turn"], "line-width": 1.5 },
  })
  mapCtx.addLayer({
    id: "msn-path-spray",
    type: "line",
    source: "msn-path",
    filter: ["==", ["get", "kind"], "spray"],
    layout: { "line-join": "round", "line-cap": "round" },
    paint: { ...initial["msn-path-spray"], "line-width": 2.5 },
  })
  /* Маршрут из точек: сплошная линия режима «Маршрут» */
  mapCtx.addLayer({
    id: "msn-path-route",
    type: "line",
    source: "msn-path",
    filter: ["==", ["get", "kind"], "route"],
    layout: { "line-join": "round", "line-cap": "round" },
    paint: { ...initial["msn-path-route"], "line-width": 3 },
  })
  mapCtx.addLayer({
    id: "msn-draft-line",
    type: "line",
    source: "msn-draft",
    paint: { ...initial["msn-draft-line"], "line-width": 2, "line-dasharray": [1, 1] },
  })
  mapCtx.addLayer({
    id: "msn-handles",
    type: "circle",
    source: "msn-handles",
    paint: {
      "circle-radius": ["match", ["get", "role"], "mid", 4, "start", 8, "wp", 9, 6],
      ...initial["msn-handles"],
      "circle-opacity": ["match", ["get", "role"], "mid", 0.75, 1],
      "circle-stroke-width": 2,
    },
  })
  /* Номера точек маршрута поверх ручек */
  mapCtx.addLayer({
    id: "msn-labels",
    type: "symbol",
    source: "msn-handles",
    filter: ["has", "label"],
    layout: { "text-field": ["get", "label"], "text-size": 11, "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"], "text-allow-overlap": true },
    paint: { ...initial["msn-labels"] },
  })

  /* Смена мастер-цвета или темы перекрашивает слои */
  $effect(() => {
    const next = paints(colors)
    mapCtx.waitForStyleLoaded((m) => {
      for (const [layer, props] of Object.entries(next)) {
        if (!m.getLayer(layer)) continue
        for (const [prop, value] of Object.entries(props)) m.setPaintProperty(layer, prop as any, value)
      }
    })
  })

  /* Данные читаются до проверок, чтобы эффекты подписались на них */
  const setData = (id: string, data: any) => mapCtx.waitForStyleLoaded((m) => (m.getSource(id) as any)?.setData(data))
  $effect(() => setData("msn-zones", $state.snapshot(zones)))
  $effect(() => setData("msn-path", $state.snapshot(path)))
  $effect(() => setData("msn-draft", $state.snapshot(draft)))
  $effect(() => setData("msn-handles", $state.snapshot(handles)))

  /* Рисование: двойной клик закрывает контур, а не приближает карту */
  $effect(() => {
    const d = drawing
    untrack(() => (d ? map.doubleClickZoom.disable() : map.doubleClickZoom.enable()))
  })

  let dragId: string | null = null
  let moved = false
  /* Перетаскивание сообщается не чаще раза за кадр экрана: мышь шлёт движения чаще, чем карта успевает перерисоваться */
  let pendingLL: LngLat | null = null
  let frame = 0
  const flushDrag = () => {
    frame = 0
    if (dragId && pendingLL) onDrag(dragId, pendingLL)
    pendingLL = null
  }

  const handleAt = (point: any) => {
    if (!map.getLayer("msn-handles")) return null
    const f = map.queryRenderedFeatures(point, { layers: ["msn-handles"] })[0]
    return (f?.properties?.id as string) ?? null
  }

  /* d: - точки начатого контура, n: - точки только для показа; их не перетаскивают */
  const draggable = (id: string) => !id.startsWith("d:") && !id.startsWith("n:")
  /* Перетаскиваются вершины, середины сторон и точка взлёта; точки начатого контура - нет */
  const onDown = (e: any) => {
    /* Только левая кнопка: правую карта ждёт до отпускания, чтобы выдать contextmenu */
    if (e.originalEvent?.button !== 0) return
    const id = handleAt(e.point)
    if (!id || !draggable(id)) return
    e.preventDefault()
    dragId = id
    moved = false
    map.dragPan.disable()
    map.getCanvas().style.cursor = "grabbing"
    /* Кнопку могут отпустить и за пределами карты */
    window.addEventListener("mouseup", onUp, { once: true })
  }
  const onMove = (e: any) => {
    const ll: LngLat = [e.lngLat.lng, e.lngLat.lat]
    onCursor(ll)
    if (dragId) {
      moved = true
      pendingLL = ll
      if (!frame) frame = requestAnimationFrame(flushDrag)
      return
    }
    const id = handleAt(e.point)
    map.getCanvas().style.cursor = id && draggable(id) ? "grab" : drawing ? "crosshair" : ""
  }
  const onUp = () => {
    if (!dragId) return
    if (frame) cancelAnimationFrame(frame)
    flushDrag()
    window.removeEventListener("mouseup", onUp)
    const id = dragId
    dragId = null
    map.dragPan.enable()
    map.getCanvas().style.cursor = ""
    if (moved) onDragEnd(id)
  }
  const onClick = (e: any) => {
    if (moved) {
      moved = false
      return
    }
    onMapClick([e.lngLat.lng, e.lngLat.lat], { x: e.point.x, y: e.point.y })
  }
  const onDbl = (e: any) => {
    if (!drawing) return
    e.preventDefault()
    onMapDblClick()
  }
  const onContext = (e: any) => {
    const id = handleAt(e.point)
    if (id) onHandleRightClick(id)
  }
  const onLeave = () => onCursor(null)

  map.on("mousedown", onDown)
  map.on("mousemove", onMove)
  map.on("mouseup", onUp)
  map.on("click", onClick)
  map.on("dblclick", onDbl)
  map.on("contextmenu", onContext)
  map.on("mouseout", onLeave)

  onDestroy(() => {
    if (frame) cancelAnimationFrame(frame)
    window.removeEventListener("mouseup", onUp)
    map.off("mousedown", onDown)
    map.off("mousemove", onMove)
    map.off("mouseup", onUp)
    map.off("click", onClick)
    map.off("dblclick", onDbl)
    map.off("contextmenu", onContext)
    map.off("mouseout", onLeave)
    if (!mapCtx.map) return
    for (const id of [
      "msn-labels",
      "msn-handles",
      "msn-draft-line",
      "msn-path-route",
      "msn-path-spray",
      "msn-path-turn",
      "msn-path-transit",
      "msn-zones-line",
      "msn-zones-fill",
    ])
      mapCtx.removeLayer(id)
    for (const id of SOURCES) mapCtx.removeSource(id)
  })
</script>
