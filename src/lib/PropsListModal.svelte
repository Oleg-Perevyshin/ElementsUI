<!-- $lib/PropsListModal.svelte — вынос "тяжёлых" списковых секций панелей свойств (столбцы
     Table, опции ProgressBar/Select/Switch/Tabs) в модалку вместо попытки втиснуть их в узкий
     сайдбар конструктора (ConstructorUI.svelte). Кнопка-триггер показывает счётчик элементов. -->
<script lang="ts">
  import type { Snippet } from "svelte"
  import * as UI from "$lib"

  let {
    label,
    count,
    wrapperClass = "w-300 h-[85%]",
    main,
  }: {
    label: string
    count: number
    wrapperClass?: string
    main: Snippet
  } = $props()

  let isOpen = $state(false)
</script>

<button
  type="button"
  class="flex w-full cursor-pointer items-center justify-between rounded-[10px] border border-(--hairline-color) bg-(--back-color) p-2 text-left hover:bg-(--container-color)"
  onclick={() => (isOpen = true)}
>
  <span class="text-[11px] font-semibold text-(--muted-color)">{label} ({count})</span>
  <span class="text-[12px] text-(--accent-color)">Настроить →</span>
</button>

{#if isOpen}
  <UI.Modal title={label} bind:isOpen {wrapperClass} {main} />
{/if}
