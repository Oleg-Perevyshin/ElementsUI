<script lang="ts">
  import { onDestroy } from "svelte"
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

  $effect(() => {
    if (!mapCtx.map || added) return

    mapCtx.addSource(id, { type: "geojson", data: toGeoJSON() })
    mapCtx.addLayer({
      id,
      type: "line",
      source: id,
      layout: { "line-join": "round", "line-cap": "round" },
      paint: { "line-color": color, "line-width": width, "line-opacity": opacity },
    })
    added = true
  })

  $effect(() => {
    if (!added || !mapCtx.map) return
    const source = mapCtx.map.getSource(id) as any
    source?.setData(toGeoJSON())
  })

  $effect(() => {
    if (!added || !mapCtx.map || !mapCtx.map.getLayer(id)) return
    mapCtx.map.setPaintProperty(id, "line-color", color)
    mapCtx.map.setPaintProperty(id, "line-width", width)
    mapCtx.map.setPaintProperty(id, "line-opacity", opacity)
  })

  onDestroy(() => {
    if (added) {
      mapCtx.removeLayer(id)
      mapCtx.removeSource(id)
    }
  })
</script>
