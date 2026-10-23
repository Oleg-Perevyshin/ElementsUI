<script lang="ts">
  import { onDestroy, untrack } from "svelte"
  import { getMapContext } from "./contexts.svelte.js"

  interface Props {
    id: string
    coordinates: [number, number][]
    color?: string
    width?: number
    opacity?: number
  }

  let { id, coordinates, color = "#3b82f6", width = 3, opacity = 0.85 }: Props = $props()

  const mapCtx = getMapContext()
  if (!mapCtx.map) throw new Error("Map instance is not initialized.")

  let added = false

  const toGeoJSON = () => ({
    type: "Feature" as const,
    geometry: { type: "LineString" as const, coordinates: $state.snapshot(coordinates) },
    properties: {},
  })

  /* Источник и слой — один раз; пока стиль карты грузится, добавление ждёт в очереди waitForStyleLoaded */
  $effect(() => {
    if (!mapCtx.map || added) return
    untrack(() => {
      mapCtx.addSource(id, { type: "geojson", data: toGeoJSON() })
      mapCtx.addLayer({
        id,
        type: "line",
        source: id,
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": color, "line-width": width, "line-opacity": opacity },
      })
    })
    added = true
  })

  /* Координаты и оформление читаются до любых проверок — иначе эффект не подписывается на них и, запущенный до загрузки стиля, больше не срабатывает */
  $effect(() => {
    const data = toGeoJSON()
    if (!added) return
    mapCtx.waitForStyleLoaded((map) => (map.getSource(id) as any)?.setData(data))
  })

  $effect(() => {
    const paint = { "line-color": color, "line-width": width, "line-opacity": opacity }
    if (!added) return
    mapCtx.waitForStyleLoaded((map) => {
      if (!map.getLayer(id)) return
      for (const [name, value] of Object.entries(paint)) map.setPaintProperty(id, name, value)
    })
  })

  onDestroy(() => {
    if (added) {
      mapCtx.removeLayer(id)
      mapCtx.removeSource(id)
    }
  })
</script>
