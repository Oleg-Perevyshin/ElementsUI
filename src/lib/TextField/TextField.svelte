<!-- $lib/TextField/TextField.svelte - текст по шкале типографики темы, выравнивание наследуется от контейнера -->
<script lang="ts">
  import { twMerge } from "tailwind-merge"
  import type { ITextFieldProps } from "../types"
  import { accentStyle } from "../accent"

  let { wrapperClass = "", accent, background = false, underline = false, content = { name: "", class: "", size: "base" } }: ITextFieldProps = $props()

  /* Размеры по шкале темы: 13 / 15 / 24 / 34 / 44 с весом и трекингом по роли; на телефоне крупные меньше: 20 / 26 / 32 */
  const textSize = {
    small: "text-[13px] leading-[1.45] text-(--muted-color)",
    base: "text-[15px] leading-[1.5]",
    large: "text-[24px] leading-[1.2] max-sm:text-[20px] font-[650] tracking-[-0.015em]",
    huge: "text-[34px] leading-[1.15] max-sm:text-[26px] font-[650] tracking-[-0.02em]",
    massive: "text-[44px] leading-[1.08] max-sm:text-[32px] font-bold tracking-[-0.025em]",
  } as const
</script>

<div
  style={accentStyle(accent)}
  class={twMerge(
    `relative flex w-full flex-col ${background ? "rounded-[14px] border border-(--hairline-color) bg-(--back-color) px-5 py-3" : ""} ${underline ? "underline" : ""}`,
    wrapperClass,
  )}
>
  <p class={twMerge(`w-full text-pretty wrap-break-word ${textSize[content.size ?? "base"]}`, accent ? "text-(--accent-text)" : "", content.class)}>
    {content.name}
  </p>
</div>
