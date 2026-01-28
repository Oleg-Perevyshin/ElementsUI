<script lang="ts">
  import { onDestroy, type Snippet } from "svelte"
  import maplibregl from "maplibre-gl"
  import { getMapContext, getMarkerContext } from "./contexts.svelte.js"

  interface Props {
    closeButton?: boolean
    class?: string
    children?: Snippet
  }

  let { closeButton = true, class: className = undefined, children }: Props = $props()

  let container = $state<HTMLElement | null>(null)

  const mapCtx = getMapContext()
  if (!mapCtx.map) throw new Error("Map instance is not initialized.")

  let popup: maplibregl.Popup | null = $state.raw(null)

  const markerContext = getMarkerContext()

  $effect(() => {
    if (popup || !mapCtx.map || !container) return

    const options: maplibregl.PopupOptions = {
      closeButton,
    }

    if (className) {
      options.className = className
    }

    popup = new maplibregl.Popup(options)
    popup.setDOMContent(container)

    // Привязываем к маркеру
    if (markerContext?.marker) {
      markerContext.marker.setPopup(popup)
    }
  })

  onDestroy(() => {
    popup?.remove()
    markerContext?.marker?.setPopup(null)
  })
</script>

<div bind:this={container}>
  {@render children?.()}
</div>
