<script lang="ts">
  import { onDestroy } from "svelte"
  import { getMapContext } from "../contexts.svelte.js"

  const mapCtx = getMapContext()
  if (!window.maplibregl || !mapCtx.map) throw new Error("Map instance is not initialized.")

  const control = new window.maplibregl.ScaleControl()
  mapCtx.map.addControl(control)

  onDestroy(() => {
    mapCtx.map?.removeControl(control)
  })
</script>
