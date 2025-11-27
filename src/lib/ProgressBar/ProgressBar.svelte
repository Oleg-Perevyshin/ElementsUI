<!-- $lib/ElementsUI/ProgressBar.svelte -->
<script lang="ts">
  import { twMerge } from 'tailwind-merge'
  import type { IProgressBarProps } from '../types'

  let {
    id = crypto.randomUUID(),
    wrapperClass = '',
    label = { name: '', class: '' },
    value = $bindable([0]),
    type = 'horizontal',
    number = {
      minNum: 0,
      maxNum: 100,
      units: '%',
    },
  }: IProgressBarProps = $props()

  let innerValue: number[] | null = $derived(
    (() => {
      if (typeof value == 'number') {
        return [value]
      } else return value
    })(),
  )

  const min = $derived(number.minNum ?? 0)
  const max = $derived(number.maxNum ?? 100)

  const numericValue = (value: number) => {
    if (typeof value === 'number' && !isNaN(value)) {
      return Math.max(min, Math.min(max, value))
    } else if (typeof value === 'string') {
      const parsedValue = parseFloat(value)
      if (!isNaN(parsedValue)) {
        return Math.max(min, Math.min(max, parsedValue))
      }
    } else {
      return min
    }
  }

  const progressPercent = (value: number) => {
    if (value) {
      return (((Math.min(Math.max(value, min), max) - min) / (max - min)) * 100) as number
    }
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
  class={twMerge(`relative flex ${type == 'vertical' ? 'h-full' : ''} w-full flex-col items-center`, wrapperClass)}
>
  {#if label.name}
    <h5 class={twMerge(` w-full px-4 text-center`, label.class)}>{label.name}</h5>
  {/if}
  {#if type == 'vertical'}
    <div class="flex h-full flex-wrap gap-3">
      {#each innerValue as val}
        <div class="flex h-full w-fit min-w-16 flex-col items-center gap-2 rounded-full bg-(--bg-color) p-2 shadow-sm">
          <div class="relative my-auto h-[80%] w-[70%] rounded-full bg-(--back-color)/40">
            <div class="absolute bottom-0 left-0 flex w-full rounded-full bg-(--field-color)" style="height: {progressPercent(val)}%;"></div>
          </div>
          <span class="m-auto font-semibold">{roundToClean(Number(numericValue(val)))}{number.units}</span>
        </div>
      {/each}
    </div>
  {:else}
    <div class="flex w-full flex-col gap-2">
      {#each innerValue as val}
        <div class="flex h-7 w-full items-center gap-2 rounded-full bg-(--bg-color) px-2 shadow-sm">
          <span class="m-auto font-semibold">{roundToClean(Number(numericValue(val)))}{number.units}</span>
          <div class="relative my-auto h-3.5 w-[85%] rounded-full bg-(--back-color)/40">
            <div class="absolute top-0 left-0 flex h-full rounded-full bg-(--field-color)" style="width: {progressPercent(val)}%;"></div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
