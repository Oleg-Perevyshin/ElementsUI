<!-- $lib/TextField/TextField.svelte — шкала приведена к типографике app.css,
     принудительное центрирование убрано (наследуется от контейнера). -->
<script lang="ts">
  import { twMerge } from "tailwind-merge"
  import type { ITextFieldProps } from "../types"

  let {
    id = crypto.randomUUID(),
    wrapperClass = "",
    background = false,
    underline = false,
    content = { name: "", class: "", size: "base" },
  }: ITextFieldProps = $props()

  /* Было: text-sm / text-base / text-2xl / text-4xl / text-5xl — вне шкалы.
     Стало: 13 / 15 / 24 / 34 / 44 с весом и трекингом по роли. */
  const textSize = {
    small: "text-[13px] leading-[1.45] text-(--muted-color)",
    base: "text-[15px] leading-[1.5]",
    large: "text-[24px] leading-[1.2] font-[650] tracking-[-0.015em]",
    huge: "text-[34px] leading-[1.15] font-[650] tracking-[-0.02em]",
    massive: "text-[44px] leading-[1.08] font-bold tracking-[-0.025em]",
  } as const
</script>

<div
  id={`${id}-${crypto.randomUUID().slice(0, 6)}`}
  class={twMerge(
    `relative flex w-full flex-col ${background ? "rounded-[14px] border border-(--hairline-color) bg-(--back-color) px-5 py-3" : ""} ${underline ? "underline" : ""}`,
    wrapperClass,
  )}
>
  <p class={twMerge(`w-full text-pretty ${textSize[content.size ?? "base"]}`, content.class)}>
    {content.name}
  </p>
</div>
