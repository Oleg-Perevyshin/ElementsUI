<script lang="ts">
  import { onDestroy, onMount, type Snippet } from "svelte"
  import type * as maplibregl from "maplibre-gl"
  import { prepareMapContext } from "./contexts.svelte.js"
  import { loadMapLibre } from "./utils.js"
  import { T } from "../../locales/i18n"

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

  /* Подпись источников карты (CARTO, OpenStreetMap) обязательна по их условиям - оставляем её компактной кнопкой «i», свёрнутой при открытии */
  /* Подпись появляется, когда загрузятся стиль и источники, - сворачиваем один раз, дальше её открывает и закрывает оператор */
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

  /* Стиль, с которым создана или на который переключена карта - setStyle только при его реальной смене */
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

  /* Инициализация карты */
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
      <h2>{isLoading ? $T("widget.map.loading") : $T("widget.map.noconnection")}</h2>
    </div>{/if}

  {#if map}
    {@render children?.(map)}
  {/if}
</div>

<style>
  /* Кнопки, шкала и атрибуция MapLibre цветами темы: стили библиотеки грузятся с CDN позже, поэтому селекторы с удвоенным классом сильнее их */
  :global(.maplibregl-ctrl.maplibregl-ctrl-group) {
    background: var(--back-color);
    color: var(--font-color);
    box-shadow: 0 0 0 1px var(--hairline-color);
  }
  :global(.maplibregl-ctrl-group.maplibregl-ctrl-group button + button) {
    border-top-color: var(--hairline-color);
  }
  :global(.maplibregl-ctrl-group.maplibregl-ctrl-group button:not(:disabled):hover) {
    background-color: var(--container-color);
  }
  /* Значки кнопок - тёмные картинки библиотеки: в тёмной теме инвертируются */
  :global(.dark .maplibregl-ctrl-group .maplibregl-ctrl-icon) {
    filter: invert(1) hue-rotate(180deg);
  }
  :global(.maplibregl-ctrl.maplibregl-ctrl-scale) {
    background: color-mix(in srgb, var(--back-color) 80%, transparent);
    color: var(--font-color);
    border-color: var(--muted-color);
  }
  :global(.maplibregl-ctrl.maplibregl-ctrl-attrib) {
    background: color-mix(in srgb, var(--back-color) 80%, transparent);
    color: var(--muted-color);
  }
  :global(.maplibregl-ctrl.maplibregl-ctrl-attrib a) {
    color: var(--muted-color);
  }
  :global(.dark .maplibregl-ctrl-attrib-button) {
    filter: invert(1) hue-rotate(180deg);
  }
</style>
