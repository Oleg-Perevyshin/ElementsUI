<script lang="ts">
  import { onMount } from "svelte"

  let mapContainer: HTMLElement | null = null
  let isLoading = $state(false)
  let hasConnection = $state(true)

  const CDN_URL = "https://cdn.jsdelivr.net/npm/maplibre-gl@5.17.0/dist/maplibre-gl.min.js"
  const CSS_URL = "https://cdn.jsdelivr.net/npm/maplibre-gl@5.17.0/dist/maplibre-gl.min.css"

  async function loadMapLibre() {
    if (typeof window === "undefined") return

    // Проверяем наличие интернета
    if (!navigator.onLine) {
      hasConnection = false
      return
    }

    isLoading = true

    try {
      // Проверяем, не загружена ли уже библиотека
      if (!window.maplibregl) {
        await loadScript(CDN_URL)
        await loadCSS(CSS_URL)

        // После загрузки скрипта проверим, что window.maplibregl существует
        if (!window.maplibregl) {
          throw new Error("MapLibre GL не был загружен корректно.")
        }
      }

      initMap()
    } catch (err) {
      console.error("Ошибка загрузки MapLibre GL:", err)
      hasConnection = false
    } finally {
      isLoading = false
    }
  }

  function loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve()
        return
      }
      const script = document.createElement("script")
      script.src = src
      script.async = true
      script.onload = () => resolve() // Обернули resolve в стрелочную функцию
      script.onerror = () => reject(new Error(`Не удалось загрузить скрипт ${src}`))
      document.head.appendChild(script)
    })
  }

  function loadCSS(href: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`link[href="${href}"]`)) {
        resolve()
        return
      }
      const link = document.createElement("link")
      link.rel = "stylesheet"
      link.href = href
      link.onload = () => resolve() // Обернули resolve в стрелочную функцию
      link.onerror = () => reject(new Error(`Не удалось загрузить стиль ${href}`))
      document.head.appendChild(link)
    })
  }

  function initMap() {
    if (!mapContainer || !window.maplibregl) return

    const map = new window.maplibregl.Map({
      container: mapContainer,
      style: "https://demotiles.maplibre.org/style.json",
      center: [0, 0],
      zoom: 1,
    })

    new window.maplibregl.Marker().setLngLat([0, 0]).addTo(map)
  }

  onMount(() => {
    loadMapLibre()
  })
</script>

<div class="map-container h-150 w-full" bind:this={mapContainer}></div>

{#if isLoading}
  <p>Загрузка карты...</p>
{/if}

{#if !hasConnection}
  <p>Нет подключения к интернету.</p>
{/if}
