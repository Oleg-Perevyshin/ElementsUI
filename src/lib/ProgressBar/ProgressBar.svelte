<!-- $lib/ElementsUI/ProgressBar.svelte -->
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
    if (valueData?.Name) {
      return valueData.Name
    }
    return items[index]?.name ?? ""
  }

  const getItemInfo = (index: number): string | undefined => {
    return (value as IReceivingDataObject[] | undefined)?.[index]?.Info
  }

  const progressPercent = (value: number) => {
    if (value) return (((Math.min(Math.max(value, min), max) - min) / (max - min)) * 100) as number
  }

  const roundToClean = (num: number): number => {
    if (Number.isInteger(num)) return num

    const rounded1 = Number(num.toFixed(1))
    if (Math.abs(rounded1 - num) < 1e-10) return rounded1

    const rounded2 = Number(num.toFixed(2))
    if (Math.abs(rounded2 - num) < 1e-10) return rounded2

    return rounded2
  }
</script>

<div
  id={`${id}-${crypto.randomUUID().slice(0, 6)}`}
  class={twMerge(`relative flex ${type == "vertical" ? "h-full flex-wrap justify-center gap-8" : "flex-col items-center "} w-full`, wrapperClass)}
>
  {#each items as progress, index}
    <div class="flex flex-col {type == 'vertical' ? 'items-center' : `w-full`}">
      <h5 class={type == "vertical" ? "" : "px-4 mt-2"}>{getItemName(index)}</h5>
      <div
        class="{twMerge(
          `flex ${type == 'vertical' ? 'h-full w-fit min-w-16 flex-col p-2' : 'h-7 w-full px-2'} items-center gap-2 rounded-full  shadow-sm`,
          progress.class,
        )} bg-(--bg-color)"
      >
        {#if type == "vertical"}
          <div class="relative my-auto h-[80%] w-[70%] rounded-full bg-(--back-color)/40">
            <div class="absolute bottom-0 left-0 flex w-full rounded-full bg-(--field-color)" style="height: {progressPercent(getItemValue(index))}%;"></div>
          </div>
          <span class="m-auto font-semibold">{roundToClean(Number(numericValue(getItemValue(index))))}{number.units}</span>
        {:else}
          <span class="m-auto w-20 font-semibold">{roundToClean(Number(numericValue(getItemValue(index))))}{number.units}</span>
          <div class="relative my-auto h-3.5 flex-1 rounded-full bg-(--back-color)/40">
            <div class="absolute top-0 left-0 flex h-full rounded-full bg-(--field-color)" style="width: {progressPercent(getItemValue(index))}%;"></div>
          </div>
        {/if}
      </div>
      {#if getItemInfo(index)}
        <span>{getItemInfo(index)}</span>
      {/if}
    </div>
  {/each}
</div>
