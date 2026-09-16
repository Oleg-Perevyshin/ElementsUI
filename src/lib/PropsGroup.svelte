<!-- $lib/PropsGroup.svelte — карточка-группа полей для панелей свойств конструктора (*Props.svelte).
     Визуальный язык взят из уже принятого вложенного оформления смарт-виджетов
     (WidgetWiFi.svelte/WidgetDeviceInfo.svelte: rounded-[10px] border bg-(--back-color) p-3 +
     подпись text-[12px] font-semibold text-(--muted-color)) — общий premium-вид панелей вместо
     голых flex-колонок без оформления. -->
<script lang="ts">
  import { twMerge } from "tailwind-merge"
  import type { Snippet } from "svelte"

  let {
    label,
    wrapperClass = "",
    contentClass = "",
    headerActions,
    children,
  }: {
    label?: string
    wrapperClass?: string
    contentClass?: string
    headerActions?: Snippet
    children: Snippet
  } = $props()
</script>

<div class={twMerge("flex flex-col gap-1.5 rounded-[10px] border border-(--hairline-color) bg-(--back-color) p-2", wrapperClass)}>
  {#if label || headerActions}
    <div class="flex items-center gap-2">
      {#if label}
        <span class="text-[11px] font-semibold text-(--muted-color)">{label}</span>
      {/if}
      {#if headerActions}
        <span class="ml-auto flex items-center gap-2">
          {@render headerActions()}
        </span>
      {/if}
    </div>
  {/if}
  <div class={twMerge("flex flex-col gap-1.5", contentClass)}>
    {@render children()}
  </div>
</div>
