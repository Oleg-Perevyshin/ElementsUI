<script lang="ts">
  import { onDestroy } from "svelte"
  import maplibregl from "maplibre-gl"
  import { getMapContext } from "../contexts.svelte.js"

  const mapCtx = getMapContext()
  if (!mapCtx.map) throw new Error("Map instance is not initialized.")

  const control = new maplibregl.GeolocateControl({})
  mapCtx.map.addControl(control)

  onDestroy(() => {
    mapCtx.map?.removeControl(control)
  })
</script>
