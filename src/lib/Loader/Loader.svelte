<!-- $lib/Loader/Loader.svelte - крутилка ожидания: бледное кольцо и дуга цветом текста (currentColor). Крутится CSS-анимацией, поэтому не замирает, пока страница считает. С label - role="status" для экранного диктора, без него - только картинка -->
<script lang="ts">
  import { twMerge } from "tailwind-merge"

  let { size = "1em", label = "", class: className = "" }: { size?: string; label?: string; class?: string } = $props()
</script>

<span
  class={twMerge("inline-flex shrink-0 items-center justify-center", className)}
  style="width: {size}; height: {size};"
  role={label ? "status" : undefined}
  aria-label={label || undefined}
  aria-hidden={label ? undefined : "true"}
>
  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" class="animate-spin [animation-duration:0.8s]"
    ><path fill="currentColor" d="M12 2A10 10 0 1 0 22 12A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8A8 8 0 0 1 12 20Z" opacity=".35" /><path
      fill="currentColor"
      d="M20 12h2A10 10 0 0 0 12 2V4A8 8 0 0 1 20 12Z"
    /></svg
  >
</span>
