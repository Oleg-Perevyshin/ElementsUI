<!-- $lib/FieldLabel.svelte - подпись поля 12/600: с for связана с полем, без него - подпись группы (id для aria-labelledby) -->
<script lang="ts">
  import { twMerge } from "tailwind-merge"

  let { label, for: htmlFor, id, class: className = "" }: { label?: { name?: string; class?: string }; for?: string; id?: string; class?: string } = $props()
</script>

{#if label?.name}
  {#if htmlFor}
    <label for={htmlFor} {id} class={twMerge("text-[12px] font-semibold text-(--muted-color)", className, label.class)}>{label.name}</label>
  {:else}
    <span {id} class={twMerge("text-[12px] font-semibold text-(--muted-color)", className, label.class)}>{label.name}</span>
  {/if}
{/if}
