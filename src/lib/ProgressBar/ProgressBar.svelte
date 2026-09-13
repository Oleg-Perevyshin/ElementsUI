<!-- $lib/ProgressBar/ProgressBar.svelte — полоса 6px, подпись и значение над ней.
     Логика вычислений не тронута, изменены только классы и разметка подписей. -->
<script lang="ts">
  import { twMerge } from "tailwind-merge"
  import type { IProgressBarProps, IReceivingDataObject } from "../types"

  let {
    id = crypto.randomUUID(),
    wrapperClass = "",
    items = [{ name: "Label", class: "" }],
    value,
    type = "horizontal",
    number = {
      minNum: 0,
      maxNum: 100,
      units: "%",
    },
  }: IProgressBarProps = $props()

  const min = $derived(number.minNum ?? 0)
  const max = $derived(number.maxNum ?? 100)

  const numericValue = (value: number) => {
    if (typeof value === "number" && !isNaN(value)) {
      return Math.max(min, Math.min(max, value))
    } else if (typeof value === "string") {
      const parsedValue = parseFloat(value)
      if (!isNaN(parsedValue)) {
        return Math.max(min, Math.min(max, parsedValue))
      }
    } else {
      return min
    }
  }

  const getItemValue = (index: number): number => {
    const valueData = (value as IReceivingDataObject[] | undefined)?.[index]
    if (valueData?.Value !== undefined && valueData?.Value !== null) {
      return valueData.Value as number
    }
    return 0
  }

  const getItemName = (index: number): string => {
    const valueData = (value as IReceivingDataObject[] | undefined)?.[index]
    if (valueData?.Name) return valueData.Name
    return items[index]?.name ?? ""
  }

  const getItemInfo = (index: number): string | undefined => {
    return (value as IReceivingDataObject[] | undefined)?.[index]?.Info
  }

  const progressPercent = (value: number) => {
    if (value) return (((Math.min(Math.max(value, min), max) - min) / (max - min)) * 100) as number
    return 0
  }

  const roundToClean = (num: number): number => {
    if (Number.isInteger(num)) return num
    const rounded1 = Number(num.toFixed(1))
    if (Math.abs(rounded1 - num) < 1e-10) return rounded1
    return Number(num.toFixed(2))
  }
</script>

<div
  id={`${id}-${crypto.randomUUID().slice(0, 6)}`}
  class={twMerge(`relative flex w-full ${type == "vertical" ? "h-full flex-wrap justify-center gap-6" : "flex-col gap-3"}`, wrapperClass)}
>
  {#each items as progress, index}
    {#if type === "vertical"}
      <div class="flex h-full flex-col items-center gap-2">
        <span class="text-[12px] font-semibold text-(--muted-color)">{getItemName(index)}</span>
        <!-- Дорожка 6px, заливка снизу вверх -->
        <div class="{twMerge('relative w-1.5 flex-1 overflow-hidden rounded-full bg-(--container-color)', progress.class)}">
          <div class="absolute bottom-0 left-0 w-full bg-(--bg-color)" style="height: {progressPercent(getItemValue(index))}%;"></div>
        </div>
        <span class="text-[13px] font-semibold tabular-nums">{roundToClean(Number(numericValue(getItemValue(index))))}{number.units}</span>
        {#if getItemInfo(index)}
          <span class="text-[12px] text-(--faint-color)">{getItemInfo(index)}</span>
        {/if}
      </div>
    {:else}
      <div class="flex w-full flex-col gap-1.5">
        <div class="flex items-baseline justify-between gap-3">
          <span class="truncate text-[12px] font-semibold text-(--muted-color)">{getItemName(index)}</span>
          <span class="shrink-0 text-[12px] font-semibold tabular-nums">{roundToClean(Number(numericValue(getItemValue(index))))}{number.units}</span>
        </div>
        <div class="{twMerge('relative h-1.5 w-full overflow-hidden rounded-full bg-(--container-color)', progress.class)}">
          <div class="absolute top-0 left-0 h-full bg-(--bg-color)" style="width: {progressPercent(getItemValue(index))}%;"></div>
        </div>
        {#if getItemInfo(index)}
          <span class="text-[12px] text-(--faint-color)">{getItemInfo(index)}</span>
        {/if}
      </div>
    {/if}
  {/each}
</div>
