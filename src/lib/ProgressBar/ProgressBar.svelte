<!-- $lib/ElementsUI/ProgressBar.svelte -->
<script lang="ts">
  import { twMerge } from 'tailwind-merge'
  import type { IProgressBarProps } from '../types'

  let {
    id = crypto.randomUUID(),
    wrapperClass = '',
    label = { name: '', class: '' },
    value = $bindable(0),
    number = {
      minNum: 0,
      maxNum: 100,
      units: '%',
    },
  }: IProgressBarProps = $props()

  const min = $derived(number.minNum ?? 0)
  const max = $derived(number.maxNum ?? 100)

  let numericValue = $derived(
    (() => {
      if (typeof value === 'number' && !isNaN(value)) {
        return Math.max(min, Math.min(max, value))
      } else if (typeof value === 'string') {
        const parsedValue = parseFloat(value)
        console.log(value)
        if (!isNaN(parsedValue)) {
          return Math.max(min, Math.min(max, parsedValue))
        }
      } else {
        return min
      }
    })(),
  )

  const progressPercent = $derived(() => {
    if (value) {
      return (((Math.min(Math.max(value, min), max) - min) / (max - min)) * 100) as number
    }
  })
</script>

<div {id} class={twMerge(`relative flex w-full flex-col items-center`, wrapperClass)}>
  {#if label.name}
    <h5 class={twMerge(` w-full px-4 text-center`, label.class)}>{label.name}</h5>
  {/if}

  <div class="flex w-full flex-col items-center">
    <div class="relative h-2 w-full rounded bg-gray-400">
      <div class="absolute top-0 left-0 h-full rounded bg-(--bg-color)" style="width: {progressPercent()}%;"></div>
    </div>
    <span class="ml-2 font-semibold">{numericValue?.toFixed(2)}{number.units}</span>
  </div>
</div>
