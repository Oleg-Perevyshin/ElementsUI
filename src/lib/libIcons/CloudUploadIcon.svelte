<script lang="ts">
  import type { SVGAttributes } from "svelte/elements"

  let props: SVGAttributes<SVGSVGElement> = $props()
</script>

<!-- $lib/libIcons/CloudUploadIcon.svelte - облачная отправка, общий знак для DevCloud и других приложений -->
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="1em"
  height="1em"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.75"
  stroke-linecap="round"
  stroke-linejoin="round"
  {...props}
>
  <path d="M4.4 15.5A4.5 4.5 0 0 1 6.5 7.03a6 6 0 0 1 11.5.97h.5a4 4 0 0 1 1 7.87" />
  <path d="M12 12v9" />
  <path d="m8.5 15.5 3.5-3.5 3.5 3.5" />
</svg>
