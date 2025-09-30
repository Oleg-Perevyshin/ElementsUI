<!-- $lib/ElementsUI/ProgressBar.svelte -->
<script lang="ts">
  import type { IProgressBarProps } from '../types'

  let {
    id = { name: '', value: crypto.randomUUID() },
    label = { name: '', class: '' },
    value = $bindable(0),
    range = {
      min: 0,
      max: 100,
      units: '%',
    },
    wrapperClass = '',
  }: IProgressBarProps = $props()

  let numericValue = $state(0)
  const min = $derived(range.min ?? 0)
  const max = $derived(range.max ?? 100)

  $effect(() => {
    if (typeof value === 'number' && !isNaN(value)) {
      numericValue = Math.max(min, Math.min(max, value))
    } else if (typeof value === 'string') {
      const parsedValue = parseFloat(value)
      if (!isNaN(parsedValue)) {
        numericValue = Math.max(min, Math.min(max, parsedValue))
      }
    } else {
      numericValue = min
    }
  })

  let progressPercent = $derived((((value as number) - min) / (max - min)) * 100)
</script>

<div id={id.value} class={`relative flex w-full flex-col items-center ${wrapperClass}`}>
  {#if label.name}
    <h5 class={`mb-1 w-full px-4 text-center ${label.class}`}>{label.name}</h5>
  {/if}

  <div class="flex w-full flex-col items-center">
    <div class="relative h-2 w-full rounded bg-gray-400">
      <div class="absolute top-0 left-0 h-full rounded bg-[var(--bg-color)]" style="width: {progressPercent}%;"></div>
    </div>
    <span class="ml-2 font-semibold">{numericValue.toFixed(2)}{range.units}</span>
  </div>
</div>
