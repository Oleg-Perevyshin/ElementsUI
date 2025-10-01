<!-- $lib/ElementsUI/Loader.svelte -->
<script lang="ts">
  import LoaderRotate from './libIcons/LoaderRotate.svelte'

  let { show = false } = $props()
</script>

{#if show}
  <div class="absolute inset-0 z-50 flex items-center justify-center">
    <LoaderRotate />
  </div>
{/if}
