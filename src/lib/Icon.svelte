<!-- $lib/Icon.svelte - иконка из SVG-строки (очищается) или компонента -->
<script lang="ts">
  import { sanitizeHtml } from "./html"
  import type { IconSource } from "./types"

  let { icon, class: className = "" }: { icon?: IconSource | null; class?: string } = $props()
</script>

{#if icon}
  <span class={className} aria-hidden="true">
    {#if typeof icon === "string"}
      {@html sanitizeHtml(icon)}
    {:else}
      {@const IconComponent = icon}
      <IconComponent />
    {/if}
  </span>
{/if}
