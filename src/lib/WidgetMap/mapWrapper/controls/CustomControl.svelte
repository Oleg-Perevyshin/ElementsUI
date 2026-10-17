<script lang="ts">
  import type { Snippet } from "svelte"
  import { getMapContext } from "../contexts.svelte.js"

  interface Props {
    position?: any
    children: Snippet
  }

  let { position, children }: Props = $props()

  const mapCtx = getMapContext()
  if (!mapCtx.map) throw new Error("Map instance is not initialized.")

  let el: HTMLDivElement | undefined = $state()

  const control = {
    onAdd: () => {
      return el!
    },
    onRemove: () => {
      el?.parentNode?.removeChild(el)
    },
  }

  $effect(() => {
    if (control && el) {
      mapCtx.map?.addControl(control, position)
    }
    return () => {
      control && mapCtx.map?.removeControl(control)
    }
  })
</script>

<div bind:this={el} class="maplibregl-ctrl maplibregl-ctrl-group">
  {@render children?.()}
</div>
