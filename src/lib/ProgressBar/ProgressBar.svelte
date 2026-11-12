<!-- $lib/ProgressBar/ProgressBar.svelte - полоса 6px, подпись и значение над ней -->
<script lang="ts">
  import FieldLabel from "../FieldLabel.svelte"
  import { roundToClean } from "../number"
  import { twMerge } from "tailwind-merge"
  import { accentStyle } from "../accent"
  import type { IProgressBarProps, IReceivingDataObject } from "../types"

  let {
    wrapperClass = "",
    accent,
    label = { name: "", class: "" },
    help,
    items = [{ name: "Label" }],
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
</script>

<div
  class={twMerge(`relative flex w-full ${type == "vertical" ? "h-full flex-wrap justify-center gap-6" : "flex-col gap-3"}`, wrapperClass)}
  style={accentStyle(accent)}
>
  <FieldLabel {label} info={help?.info} class="w-full" />
  {#each items as progress, index}
    {#if type === "vertical"}
      <div class="flex h-full flex-col items-center gap-2">
        <span class="text-[12px] font-semibold text-(--muted-color)">{getItemName(index)}</span>
        <!-- Дорожка 6px, заливка снизу вверх -->
        <div class="relative w-1.5 flex-1 overflow-hidden rounded-full bg-(--container-color)" style={accentStyle(progress.accent)}>
          <div class="absolute bottom-0 left-0 w-full bg-(--accent-color)" style="height: {progressPercent(getItemValue(index))}%;"></div>
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
        <div class="relative h-1.5 w-full overflow-hidden rounded-full bg-(--container-color)" style={accentStyle(progress.accent)}>
          <div class="absolute top-0 left-0 h-full bg-(--accent-color)" style="width: {progressPercent(getItemValue(index))}%;"></div>
        </div>
        {#if getItemInfo(index)}
          <span class="text-[12px] text-(--faint-color)">{getItemInfo(index)}</span>
        {/if}
      </div>
    {/if}
  {/each}
</div>
