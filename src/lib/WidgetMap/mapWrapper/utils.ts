/* Версия должна совпадать с установленной devDependency maplibre-gl (по ней проверяются типы): после обновления зависимостей поднять и здесь, сверку делает tests/maplibre.test.mjs; пакет 6.x - только ES-модуль, без UMD-скрипта и глобала */
const MAPLIBRE_VERSION = "6.18.0"
const CDN = `https://cdn.jsdelivr.net/npm/maplibre-gl@${MAPLIBRE_VERSION}/dist`

type MapLibreModule = typeof import("maplibre-gl")

/* Откуда грузится карта: по умолчанию модуль и стили с CDN, подложки CARTO; для работы без интернета (точка доступа устройства) - свой адрес модуля или функция, отдающая модуль, свой CSS и стили подложки */
export interface MapLibreSource {
  module?: string | (() => Promise<MapLibreModule>)
  css?: string
  styles?: { light: string | object; dark: string | object }
}

let source: Required<Pick<MapLibreSource, "module" | "css">> & { local: boolean } = {
  module: `${CDN}/maplibre-gl.mjs`,
  css: `${CDN}/maplibre-gl.css`,
  local: false,
}
export const mapStyles: { light: string | object; dark: string | object } = {
  light: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
}

/* Задаёт источник карты до первой отрисовки WidgetMap */
export const configureMapLibre = ({ module, css, styles }: MapLibreSource) => {
  if (module) source = { ...source, module, local: true }
  if (css) source.css = css
  if (styles) Object.assign(mapStyles, styles)
}

/* Одна загрузка на страницу: несколько карт ждут один и тот же промис */
let loading: Promise<boolean> | null = null

/* Без интернета у точки доступа устройства адрес CDN может не ответить вовсе: через LOAD_TIMEOUT_MS карта показывает «нет подключения» вместо вечной загрузки */
const LOAD_TIMEOUT_MS = 10000
const withTimeout = <T>(promise: Promise<T>): Promise<T> =>
  Promise.race([promise, new Promise<never>((_, reject) => setTimeout(() => reject(new Error("MapLibre: timeout")), LOAD_TIMEOUT_MS))])

export const loadMapLibre = (): Promise<boolean> => {
  if (typeof window === "undefined") return Promise.resolve(false)
  if (window.maplibregl) return Promise.resolve(true)
  if (!source.local && !navigator.onLine) return Promise.resolve(false)

  /* Модуль кладётся в window.maplibregl - через него к карте обращаются компоненты обёртки; не из бандла, чтобы не тянуть карту в приложения */
  const { module, css } = source
  loading ??= withTimeout(Promise.all([typeof module === "string" ? (import(/* @vite-ignore */ module) as Promise<MapLibreModule>) : module(), loadCSS(css)]))
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

const loadCSS = (href: string): Promise<void> =>
  new Promise((resolve, reject) => {
    if (document.querySelector(`link[href="${href}"]`)) return resolve()
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = href
    link.onload = () => resolve()
    link.onerror = () => reject(new Error(`Не удалось загрузить стиль ${href}`))
    document.head.appendChild(link)
  })
