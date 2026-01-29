<script lang="ts">
  import { onDestroy, onMount, type Snippet } from "svelte"
  import { prepareMapContext } from "./contexts.svelte.js"
  import { loadMapLibre } from "./utils.js"

  interface Props {
    class?: string
    style?: any | string
    zoom?: number
    center?: any
    children?: Snippet<[any]>
  }

  let {
    class: className = "",
    style = { version: 8, sources: {}, layers: [] },
    zoom = $bindable(undefined),
    center = $bindable(undefined),
    children,
  }: Props = $props()

  let container: HTMLElement | undefined = $state()
  let map: any | undefined = $state()
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
    })
    mapCtx.map = map
  })

  // Реактивное обновление style
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
    await loadMapLibre()
    isLoading = false
  })
</script>

<div class={className} bind:this={container}>
  {#if isLoading}
    <p>Загрузка карты...</p>
  {/if}

  {#if !hasConnection}
    <p>Нет подключения к интернету.</p>
  {/if}

  {#if map}
    {@render children?.(map)}
  {/if}
</div>
