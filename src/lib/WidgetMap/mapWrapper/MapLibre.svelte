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
    bearing?: number
    maxPitch?: number
    map?: any
    children?: Snippet<[any]>
  }

  let {
    class: className = "",
    style = { version: 8, sources: {}, layers: [] },
    zoom = $bindable(undefined),
    center = $bindable(undefined),
    bearing = 0,
    maxPitch = 60,
    map = $bindable(undefined),
    children,
  }: Props = $props()

  let container: HTMLElement | undefined = $state()
  let isLoading = $state(false)
  let hasConnection = $state(true)

  const mapCtx = prepareMapContext()

  /* Подпись источников карты (CARTO, OpenStreetMap) обязательна по их условиям — оставляем её компактной кнопкой «i», свёрнутой при открытии */
  /* Подпись появляется, когда загрузятся стиль и источники, — сворачиваем один раз, дальше её открывает и закрывает оператор */
  const collapseAttribution = (target: maplibregl.Map) => {
    const tryCollapse = () => {
      const attrib = container?.querySelector(".maplibregl-ctrl-attrib.maplibregl-compact")
      if (!attrib) return
      attrib.classList.remove("maplibregl-compact-show")
      attrib.removeAttribute("open")
      target.off("styledata", tryCollapse)
      target.off("sourcedata", tryCollapse)
    }
    target.on("styledata", tryCollapse)
    target.on("sourcedata", tryCollapse)
  }

  /* Стиль, с которым создана или на который переключена карта — setStyle только при его реальной смене */
  let appliedStyle: any = undefined

  const createMap = () => {
    if (!window.maplibregl || map || !container) return
    appliedStyle = style
    map = new window.maplibregl.Map({
      container,
      style,
      zoom,
      center,
      bearing,
      maxPitch,
      attributionControl: { compact: true },
    })
    collapseAttribution(map)
    mapCtx.map = map
  }

  // Инициализация карты
  $effect(createMap)

  $effect(() => {
    if (map && style && style !== appliedStyle) {
      appliedStyle = style
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
    hasConnection = await loadMapLibre()
    isLoading = false

    createMap()
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
