<script lang="ts">
  import { onDestroy, type Snippet } from "svelte"
  import maplibregl from "maplibre-gl"
  import { prepareMapContext } from "./contexts.svelte.js"

  interface Props {
    class?: string
    style?: maplibregl.StyleSpecification | string
    zoom?: number
    center?: maplibregl.LngLatLike
    children?: Snippet<[maplibregl.Map]>
  }

  let {
    class: className = "",
    style = { version: 8, sources: {}, layers: [] },
    zoom = $bindable(undefined),
    center = $bindable(undefined),
    children,
  }: Props = $props()

  // Автозагрузка CSS
  if (globalThis.window && !document.querySelector('link[href$="/maplibre-gl.css"]')) {
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = `https://unpkg.com/maplibre-gl@${maplibregl.getVersion()}/dist/maplibre-gl.css`
    document.head.appendChild(link)
  }

  let container: HTMLElement | undefined = $state()
  let map: maplibregl.Map | undefined = $state()

  const mapCtx = prepareMapContext()

  // Инициализация карты
  $effect(() => {
    if (map || !container) return

    map = new maplibregl.Map({
      container,
      style,
      zoom,
      center,
    })
    mapCtx.map = map
  })

  $effect(() => {
    if (map && style) {
      mapCtx.setStyle(style)
    }
  })

  onDestroy(() => {
    mapCtx.map = null
    map?.remove()
    map = undefined
  })
</script>

<div class={className} bind:this={container}>
  {#if map}
    {@render children?.(map)}
  {/if}
</div>
