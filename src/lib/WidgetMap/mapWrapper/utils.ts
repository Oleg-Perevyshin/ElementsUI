const CDN_URL = "https://cdn.jsdelivr.net/npm/maplibre-gl@5.17.0/dist/maplibre-gl.min.js"
const CSS_URL = "https://cdn.jsdelivr.net/npm/maplibre-gl@5.17.0/dist/maplibre-gl.min.css"

/* Одна загрузка на страницу: несколько карт ждут один и тот же промис, иначе вторая видит уже вставленный <script> до его загрузки */
let loading: Promise<boolean> | null = null

export const loadMapLibre = (): Promise<boolean> => {
  if (typeof window === "undefined") return Promise.resolve(false)
  if (window.maplibregl) return Promise.resolve(true)
  if (!navigator.onLine) return Promise.resolve(false)

  loading ??= Promise.all([loadScript(CDN_URL), loadCSS(CSS_URL)])
    .then(() => {
      if (!window.maplibregl) throw new Error("MapLibre GL не был загружен корректно.")
      return true
    })
    .catch((err) => {
      console.error("Ошибка загрузки MapLibre GL:", err)
      loading = null
      return false
    })
  return loading
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
    script.onerror = () => {
      script.remove() /* иначе повторная попытка увидит тег и не станет грузить заново */
      reject(new Error(`Не удалось загрузить скрипт ${src}`))
    }
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
