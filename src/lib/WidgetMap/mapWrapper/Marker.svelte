<script lang="ts">
  import { onDestroy, type Snippet } from "svelte"
  import { getMapContext, prepareMarkerContext } from "./contexts.svelte.js"

  interface Props {
    lnglat: any
    content?: Snippet
    children?: Snippet
  }

  let container = $state<HTMLElement | null>(null)

  let { lnglat = $bindable(), content, children }: Props = $props()

  const mapCtx = getMapContext()
  if (!mapCtx.map) throw new Error("Map instance is not initialized.")

  let marker: any | null = $state.raw(null)

  const markerCtx = prepareMarkerContext()

  $effect(() => {
    if (!window.maplibregl || marker || !mapCtx.map) return

    const options: any = {}

    if (content) {
      if (!container) throw new Error("Marker container is not initialized")
      options.element = container
    }

    marker = new window.maplibregl.Marker(options)
    markerCtx.marker = marker

    marker.setLngLat($state.snapshot(lnglat) as any).addTo(mapCtx.map)
  })

  $effect(() => {
    if (marker && lnglat) {
      marker.setLngLat(lnglat)
    }
  })

  onDestroy(() => {
    marker?.remove()
  })
</script>

{#if content}
  <div bind:this={container}>
    {@render content()}
  </div>
{/if}

{@render children?.()}
