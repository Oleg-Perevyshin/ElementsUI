<script lang="ts">
  import { onDestroy } from "svelte"
  import { getMapContext } from "../contexts.svelte.js"

  const mapCtx = getMapContext()
  if (!mapCtx.map) throw new Error("Map instance is not initialized.")

  let control: any | null = null

  $effect(() => {
    if (!window.maplibregl) return
    control && mapCtx.map?.removeControl(control)
    control = new window.maplibregl.FullscreenControl()
    mapCtx.map?.addControl(control)
  })

  onDestroy(() => {
    if (control) {
      mapCtx.map?.removeControl(control)
    }
  })
</script>
