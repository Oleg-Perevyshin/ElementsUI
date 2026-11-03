// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
/// <reference types="@sveltejs/kit" />
import type { Map, Marker, NavigationControl } from "maplibre-gl"

declare global {
  /* Версия poe-svelte-ui-lib из package.json, подставляется Vite (define в vite.config.ts) */
  const __LIB_VERSION__: string
  interface Window {
    maplibregl?: typeof import("maplibre-gl")
  }
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}
