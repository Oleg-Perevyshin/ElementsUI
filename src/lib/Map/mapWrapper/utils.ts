let isLoadingState = false
let hasConnectionState = true

const CDN_URL = "https://cdn.jsdelivr.net/npm/maplibre-gl@5.17.0/dist/maplibre-gl.min.js"
const CSS_URL = "https://cdn.jsdelivr.net/npm/maplibre-gl@5.17.0/dist/maplibre-gl.min.css"

export const loadMapLibre = async (): Promise<void> => {
  if (typeof window === "undefined") return

  if (!navigator.onLine) {
    hasConnectionState = false
    return
  }

  isLoadingState = true

  try {
    if (!window.maplibregl) {
      await loadScript(CDN_URL)
      await loadCSS(CSS_URL)

      if (!window.maplibregl) {
        throw new Error("MapLibre GL не был загружен корректно.")
      }
    }
  } catch (err) {
    console.error("Ошибка загрузки MapLibre GL:", err)
    hasConnectionState = false
  } finally {
    isLoadingState = false
  }
}

const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve()
      return
    }
    const script = document.createElement("script")
    script.src = src
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Не удалось загрузить скрипт ${src}`))
    document.head.appendChild(script)
  })
}

const loadCSS = (href: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`link[href="${href}"]`)) {
      resolve()
      return
    }
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = href
    link.onload = () => resolve()
    link.onerror = () => reject(new Error(`Не удалось загрузить стиль ${href}`))
    document.head.appendChild(link)
  })
}
