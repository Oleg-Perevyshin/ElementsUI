<script lang="ts">
  import { onDestroy, onMount, type Snippet } from "svelte"
  import { prepareMapContext } from "./contexts.svelte.js"
  import { loadMapLibre } from "./utils.js"
  import { T } from "$lib/locales/i18n"

  interface Props {
    class?: string
    style?: any | string
    zoom?: number
    center?: any
    maxPitch?: number
    map?: any
    children?: Snippet<[any]>
  }

  let {
    class: className = "",
    style = { version: 8, sources: {}, layers: [] },
    zoom = $bindable(undefined),
    center = $bindable(undefined),
    maxPitch = 60,
    map = $bindable(undefined),
    children,
  }: Props = $props()

  let container: HTMLElement | undefined = $state()
  let isLoading = $state(false)
  let hasConnection = $state(true)

  const mapCtx = prepareMapContext()

  // Инициализация карты
  $effect(() => {
    if (!window.maplibregl || map || !container) return

    map = new window.maplibregl.Map({
      container,
      style,
      zoom,
      center,
      maxPitch,
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

  onMount(async () => {
    isLoading = true
    hasConnection = await loadMapLibre(hasConnection)
    isLoading = false

    if (!window.maplibregl || map || !container) return

    map = new window.maplibregl.Map({
      container,
      style,
      zoom,
      center,
      maxPitch,
    })
    mapCtx.map = map
  })
</script>

<div class="{className} {!hasConnection ? 'bg-(--border-color)/50' : ''}" bind:this={container}>
  {#if isLoading || !hasConnection}
    <div class="h-full w-full flex items-center justify-center">
      <h2>{isLoading ? $T("constructor.props.map.loading") : $T("constructor.props.map.noconnection")}</h2>
    </div>{/if}

  {#if map}
    {@render children?.(map)}
  {/if}
</div>
