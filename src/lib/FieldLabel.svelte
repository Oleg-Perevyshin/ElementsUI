<!-- $lib/FieldLabel.svelte - подпись поля 12/600: с for связана с полем, без него - подпись группы (id для aria-labelledby); info - значок ⓘ с пояснением после подписи -->
<script lang="ts">
  import { twMerge } from "tailwind-merge"
  import InfoHint from "./InfoHint.svelte"

  let {
    label,
    for: htmlFor,
    id,
    info = "",
    class: className = "",
  }: { label?: { name?: string; class?: string }; for?: string; id?: string; info?: string; class?: string } = $props()

  /* С пояснением подпись - строка из текста и значка; выравнивание по label.class (justify-center и т.п.) */
  const base = $derived(twMerge("text-[12px] font-semibold text-(--muted-color)", info ? "flex items-center gap-1" : "", className, label?.class))
</script>

{#if label?.name}
  {#if htmlFor}
    <label for={htmlFor} {id} class={base}
      >{label.name}{#if info}<InfoHint text={info} />{/if}</label
    >
  {:else}
    <span {id} class={base}
      >{label.name}{#if info}<InfoHint text={info} />{/if}</span
    >
  {/if}
{/if}
