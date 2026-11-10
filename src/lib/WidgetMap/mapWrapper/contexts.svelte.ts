import type { Map as MapLibre, Marker, AddLayerObject, SourceSpecification, CanvasSourceSpecification, StyleSpecification } from "maplibre-gl"
import type * as maplibregl from "maplibre-gl"
import { setContext, getContext } from "svelte"

const MAP_CONTEXT_KEY = Symbol("MapLibre map context")
const MARKER_CONTEXT_KEY = Symbol("MapLibre marker context")

/* Карта и её пользовательские источники и слои: переживают смену базового стиля, до загрузки стиля добавление ждёт в очереди */
class MapContext {
  _map: MapLibre | null = $state.raw(null)
  private _listener?: (ev: maplibregl.MapStyleDataEvent) => void = undefined
  private _pending: ((map: maplibregl.Map) => void)[] = []
  userLayers: Set<string> = new Set()
  userSources: Set<string> = new Set()

  get map() {
    return this._map
  }

  set map(value: maplibregl.Map | null) {
    if (this._listener) {
      this._map?.off("styledata", this._listener)
      this._listener = undefined
    }
    this._map = value
    if (this._map) {
      this._listener = this._onstyledata.bind(this)
      this._map.on("styledata", this._listener)
    }
  }

  addLayer(addLayerObject: AddLayerObject, beforeId?: string) {
    if (!this.map) throw new Error("Map is not initialized")
    this.userLayers.add(addLayerObject.id)
    this.waitForStyleLoaded((map) => map.addLayer(addLayerObject, beforeId))
  }

  removeLayer(id: string) {
    if (!this.map) throw new Error("Map is not initialized")
    this.userLayers.delete(id)
    this.waitForStyleLoaded((map) => map.removeLayer(id))
  }

  addSource(id: string, source: SourceSpecification | CanvasSourceSpecification) {
    this.userSources.add(id)
    this.waitForStyleLoaded((map) => map.addSource(id, source))
  }

  removeSource(id: string) {
    this.userSources.delete(id)
    this.waitForStyleLoaded((map) => map.removeSource(id))
  }

  /* Вызов сразу, если стиль загружен, иначе после загрузки */
  waitForStyleLoaded(func: (map: maplibregl.Map) => void) {
    if (!this.map) return
    if (this.map.style._loaded) func(this.map)
    else this._pending.push(func)
  }

  private _onstyledata(ev: maplibregl.MapStyleDataEvent) {
    const map = ev.target
    if (!map?.style._loaded) return
    for (const func of this._pending) func(map)
    this._pending = []
  }

  /* Смена базового стиля с переносом пользовательских источников и слоёв */
  setStyle(style: string | StyleSpecification | null) {
    const { userSources, userLayers } = this
    if (!style) {
      this.map?.setStyle(null)
      return
    }
    this.map?.setStyle($state.snapshot(style) as string | StyleSpecification, {
      transformStyle: (previous, next) => {
        if (!previous) return next
        const sources = next.sources
        for (const [key, value] of Object.entries(previous.sources!)) if (userSources.has(key)) sources[key] = value
        return { ...next, sources, layers: [...next.layers!, ...previous.layers!.filter((layer) => userLayers.has(layer.id))] }
      },
    })
  }
}

export function prepareMapContext(): MapContext {
  const mapCtx = new MapContext()
  setContext(MAP_CONTEXT_KEY, mapCtx)
  return mapCtx
}

export function getMapContext(): MapContext {
  const mapCtx = getContext<MapContext>(MAP_CONTEXT_KEY)
  if (!mapCtx) throw new Error("Map context not found")
  return mapCtx
}

class MarkerContext {
  marker: Marker | null = $state.raw(null)
}

export function prepareMarkerContext(): MarkerContext {
  const markerCtx = new MarkerContext()
  setContext(MARKER_CONTEXT_KEY, markerCtx)
  return markerCtx
}

export function getMarkerContext(): MarkerContext | null {
  return getContext<MarkerContext>(MARKER_CONTEXT_KEY) ?? null
}
