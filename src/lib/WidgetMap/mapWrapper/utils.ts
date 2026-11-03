/* Версия совпадает с devDependency maplibre-gl (типы); с 6.x пакет — только ES-модуль, UMD-скрипта и глобала больше нет */
const MAPLIBRE_VERSION = "6.16.0"
const MODULE_URL = `https://cdn.jsdelivr.net/npm/maplibre-gl@${MAPLIBRE_VERSION}/dist/maplibre-gl.mjs`
const CSS_URL = `https://cdn.jsdelivr.net/npm/maplibre-gl@${MAPLIBRE_VERSION}/dist/maplibre-gl.css`

/* Одна загрузка на страницу: несколько карт ждут один и тот же промис */
let loading: Promise<boolean> | null = null

export const loadMapLibre = (): Promise<boolean> => {
  if (typeof window === "undefined") return Promise.resolve(false)
  if (window.maplibregl) return Promise.resolve(true)
  if (!navigator.onLine) return Promise.resolve(false)

  /* Модуль кладётся в window.maplibregl — компоненты обёртки обращаются к нему как раньше; с CDN, чтобы не тянуть карту в бандл приложений */
  loading ??= Promise.all([import(/* @vite-ignore */ MODULE_URL) as Promise<typeof import("maplibre-gl")>, loadCSS(CSS_URL)])
    .then(([maplibregl]) => {
      window.maplibregl = maplibregl
      return true
    })
    .catch((err) => {
      console.error("Ошибка загрузки MapLibre GL:", err)
      loading = null
      return false
    })
  return loading
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
