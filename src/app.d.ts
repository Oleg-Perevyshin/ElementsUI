// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { Map, Marker, NavigationControl } from "maplibre-gl"

declare global {
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
