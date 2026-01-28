<script lang="ts">
  import { onDestroy } from "svelte"
  import maplibregl from "maplibre-gl"
  import { getMapContext } from "../contexts.svelte.js"

  const mapCtx = getMapContext()
  if (!mapCtx.map) throw new Error("Map instance is not initialized.")

  let control: maplibregl.FullscreenControl | null = null

  $effect(() => {
    control && mapCtx.map?.removeControl(control)
    control = new maplibregl.FullscreenControl()
    mapCtx.map?.addControl(control)
  })

  onDestroy(() => {
    if (control) {
      mapCtx.map?.removeControl(control)
    }
  })
</script>
