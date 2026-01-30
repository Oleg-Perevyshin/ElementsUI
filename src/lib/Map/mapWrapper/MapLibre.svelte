<script lang="ts">
  import { onDestroy, onMount, type Snippet } from "svelte"
  import { prepareMapContext } from "./contexts.svelte.js"
  import { loadMapLibre } from "./utils.js"
  import { t } from "$lib/locales/i18n"

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

    if (!window.maplibregl || map || !container) return

    map = new window.maplibregl.Map({
      container,
      style,
      zoom,
      center,
    })
    mapCtx.map = map
  })
</script>

<div class="{className} {!hasConnection ? 'bg-(--border-color)/50' : ''}" bind:this={container}>
  {#if isLoading || !hasConnection}
    <div class="h-full w-full flex items-center justify-center">
      <h2>{isLoading ? $t("constructor.props.map.loading") : $t("constructor.props.map.noconnection")}</h2>
    </div>{/if}

  {#if map}
    {@render children?.(map)}
  {/if}
</div>
