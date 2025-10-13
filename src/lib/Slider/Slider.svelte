<!-- $lib/ElementsUI/Slider.svelte -->
<script lang="ts">
  import type { ISliderProps } from '../types'
  import IconGripVerticalLeft from '../libIcons/IconGripVerticalLeft.svelte'
  import IconGripVerticalRight from '../libIcons/IconGripVerticalRight.svelte'
  import IconGripVerticalDual from '../libIcons/IconGripVerticalDual.svelte'
  import { twMerge } from 'tailwind-merge'

  let {
    id = crypto.randomUUID(),
    wrapperClass = '',
    label = { name: '', class: '' },
    type = 'single',
    value = 0,
    number = { minNum: 0, maxNum: 10, step: 1 },
    disabled = false,
    onUpdate = () => {},
  }: ISliderProps = $props()

  const isRange = $derived(type === 'range' || (Array.isArray(value) && value.length === 2))

  const maxDigits = String(number.maxNum ?? 100).length
  const valueWidth = `${maxDigits + 1}ch` /* +1 на запас */

  /* Инициализация значений с проверкой типа */
  let singleValue = $derived(!isRange && typeof value === 'number' ? value : number.minNum)
  let lowerValue = $derived(isRange && Array.isArray(value) ? value[0] : number.minNum)
  let upperValue = $derived(isRange && Array.isArray(value) ? value[1] : number.maxNum)

  /* Расчет позиций */
  const singlePosition = $derived(((singleValue - number.minNum) / (number.maxNum - number.minNum)) * 100)
  const lowerPosition = $derived(((lowerValue - number.minNum) / (number.maxNum - number.minNum)) * 100)
  const upperPosition = $derived(((upperValue - number.minNum) / (number.maxNum - number.minNum)) * 100)

  $effect(() => {
    if (value === undefined || value === null) {
      if (type === 'single' && !value) value = number.minNum
      if (type === 'range' && !value) value = [number.minNum, number.maxNum]
    }
  })

  const adjustValue = (target: 'lower' | 'upper' | 'single', direction: 'increment' | 'decrement') => {
    const stepValue = direction === 'increment' ? number.step : -number.step
    if (isRange && target !== 'single') {
      if (target === 'lower') {
        lowerValue = Math.max(number.minNum, Math.min(lowerValue + stepValue, upperValue))
      } else {
        upperValue = Math.min(number.maxNum, Math.max(upperValue + stepValue, lowerValue))
      }
      onUpdate([lowerValue, upperValue])
    } else {
      singleValue = Math.max(number.minNum, Math.min(singleValue + stepValue, number.maxNum))
      onUpdate(singleValue)
    }
  }

  $effect(() => {
    if (Array.isArray(value)) {
      lowerValue = value[0]
      upperValue = value[1]
    } else if (typeof value === 'number') {
      singleValue = value
    }
  })

  let activeThumb = $state<'lower' | 'upper'>('lower')
  const handleTrackClick = (e: MouseEvent) => {
    e.stopPropagation()
    const track = e.currentTarget as HTMLElement
    const rect = track.getBoundingClientRect()
    const clickPercent = ((e.clientX - rect.left) / rect.width) * 100
    const rawValue = number.minNum + (clickPercent / 100) * (number.maxNum - number.minNum)
    const clickValue = Math.round((rawValue - number.minNum) / number.step) * number.step + number.minNum

    if (isRange) {
      const lowerDiff = Math.abs(clickValue - lowerValue)
      const upperDiff = Math.abs(clickValue - upperValue)

      activeThumb = lowerDiff < upperDiff ? 'lower' : 'upper'

      if (activeThumb === 'lower') {
        lowerValue = Math.max(number.minNum, Math.min(clickValue, upperValue))
      } else {
        upperValue = Math.min(number.maxNum, Math.max(clickValue, lowerValue))
      }

      onUpdate([lowerValue, upperValue])
    } else {
      singleValue = Math.max(number.minNum, Math.min(clickValue, number.maxNum))
      onUpdate(singleValue)
    }
  }
</script>

<div class={twMerge(`relative flex w-full flex-col items-center `, wrapperClass)}>
  {#if label.name}
    <h5 class={twMerge(`w-full px-4 text-center`, label.class)}>{label.name}</h5>
  {/if}

  <!-- Слайдер -->
  <div {id} class="relative flex h-7 w-full justify-center rounded-full {disabled ? 'cursor-not-allowed opacity-50' : ''}">
    {#if isRange}
      <!-- Трек и активная зона -->
      <div
        class={`absolute h-full w-full rounded-full bg-[var(--gray-color)] ${disabled ? '' : 'cursor-pointer'}`}
        role="button"
        tabindex={null}
        onkeydown={null}
        onclick={disabled ? undefined : handleTrackClick}
      >
        <div class="absolute h-full rounded-full bg-[var(--bg-color)]" style={`left: ${lowerPosition}%; right: ${100 - upperPosition}%;`}></div>
      </div>

      <!-- Ползунки -->
      <input
        type="range"
        min={number.minNum}
        max={number.maxNum}
        step={number.step}
        bind:value={lowerValue}
        oninput={disabled
          ? undefined
          : (e) => {
              const newValue = Math.min(Number((e.target as HTMLInputElement).value), upperValue)
              lowerValue = newValue
              activeThumb = 'lower'
            }}
        onmouseup={disabled ? undefined : () => onUpdate([lowerValue, upperValue])}
        {disabled}
        class={`absolute h-full w-full appearance-none bg-transparent ${activeThumb === 'lower' ? 'z-30' : 'z-20'}`}
      />
      <div
        class="pointer-events-none absolute z-40 rounded-full bg-[var(--field-color)]"
        style={`left: calc(${lowerPosition}% + 0rem); top: 50%; transform: translateY(-50%)`}
      >
        <IconGripVerticalLeft />
      </div>

      <input
        type="range"
        min={number.minNum}
        max={number.maxNum}
        step={number.step}
        bind:value={upperValue}
        oninput={disabled
          ? undefined
          : (e) => {
              const newValue = Math.max(Number((e.target as HTMLInputElement).value), lowerValue)
              upperValue = newValue
              activeThumb = 'upper'
            }}
        onmouseup={disabled ? undefined : () => onUpdate([lowerValue, upperValue])}
        {disabled}
        class={`absolute h-full w-full appearance-none bg-transparent ${activeThumb === 'upper' ? 'z-30' : 'z-20'}`}
      />
      <div
        class="pointer-events-none absolute z-40 rounded-full bg-[var(--field-color)]"
        style={`left: calc(${upperPosition}% - 2rem); top: 50%; transform: translateY(-50%)`}
      >
        <IconGripVerticalRight />
      </div>
    {:else}
      <!-- Одиночный слайдер -->
      <div
        class={`absolute h-full w-full rounded-full bg-[var(--gray-color)] ${disabled ? '' : 'cursor-pointer'}`}
        role="button"
        tabindex={null}
        onkeydown={null}
        onclick={disabled ? undefined : handleTrackClick}
      >
        <div
          class="absolute z-10 h-full {singlePosition === 100 ? ' rounded-full' : 'rounded-l-full'}"
          style={`width: ${singlePosition}%; background-color: var(--bg-color)`}
        ></div>
      </div>

      <input
        type="range"
        min={number.minNum}
        max={number.maxNum}
        step={number.step}
        bind:value={singleValue}
        oninput={disabled
          ? undefined
          : (e) => {
              singleValue = Number((e.target as HTMLInputElement).value)
            }}
        onmouseup={disabled ? undefined : () => onUpdate(singleValue)}
        {disabled}
        class="absolute z-20 h-full w-full appearance-none"
      />
      <div
        class="pointer-events-none absolute z-30 rounded-full bg-[var(--field-color)]"
        style={`left: clamp(1rem, ${singlePosition}%, calc(100% - 1rem)); top: 50%; transform: translate(-50%, -50%)`}
      >
        <IconGripVerticalDual />
      </div>
    {/if}
  </div>

  <!-- Кнопки управления -->
  <div class={`mt-2 flex w-full ${isRange ? 'justify-between' : 'justify-center'} gap-2`}>
    {#if isRange}
      {#each ['lower', 'upper'] as type (type)}
        <div
          class={`flex items-center justify-center gap-2 rounded-full px-2 ${disabled ? 'opacity-70' : ''}`}
          style="background-color: var(--bg-color)"
        >
          <button
            class="h-full w-4 {disabled ? '' : 'cursor-pointer'}"
            onclick={disabled ? undefined : () => adjustValue(type as 'lower' | 'upper', 'decrement')}
            disabled={disabled || (type === 'lower' ? lowerValue <= number.minNum : upperValue <= lowerValue)}>−</button
          >
          <span class="inline-block text-center tabular-nums" style={`width: ${valueWidth}`}>
            {type === 'lower' ? lowerValue : upperValue}
          </span>
          <button
            class="h-full w-4 {disabled ? '' : 'cursor-pointer'}"
            onclick={disabled ? undefined : () => adjustValue(type as 'lower' | 'upper', 'increment')}
            disabled={disabled || (type === 'lower' ? lowerValue >= upperValue : upperValue >= number.maxNum)}>+</button
          >
        </div>
      {/each}
    {:else}
      <div
        class={`flex items-center justify-center gap-2 rounded-full px-2 ${disabled ? 'opacity-70' : ''}`}
        style="background-color: var(--bg-color)"
      >
        <button
          class="h-full w-4 {disabled ? '' : 'cursor-pointer'}"
          onclick={disabled ? undefined : () => adjustValue('single', 'decrement')}
          disabled={disabled || singleValue <= number.minNum}>−</button
        >
        <span class="inline-block text-center tabular-nums" style={`width: ${valueWidth}`}>
          {singleValue}
        </span>
        <button
          class="h-full w-4 {disabled ? '' : 'cursor-pointer'}"
          onclick={disabled ? undefined : () => adjustValue('single', 'increment')}
          disabled={disabled || singleValue >= number.maxNum}>+</button
        >
      </div>
    {/if}
  </div>
</div>

<style>
  input[type='range'] {
    -webkit-appearance: none;
    appearance: none;
    margin: 0;
    padding: 0;
    pointer-events: none;
    outline: none;
  }

  /* Webkit thumb */
  input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background: transparent;
    cursor: pointer;
    pointer-events: auto;
    border: none;
  }

  /* Firefox thumb */
  input[type='range']::-moz-range-thumb {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background: transparent;
    cursor: pointer;
    pointer-events: auto;
    border: none;
  }

  /* Webkit track */
  input[type='range']::-webkit-slider-runnable-track {
    width: 100%;
    height: 100%;
    background: transparent;
    border-radius: 0;
    border: none;
  }

  /* Firefox track */
  input[type='range']::-moz-range-track {
    width: 100%;
    height: 100%;
    background: transparent;
    border-radius: 0;
    border: none;
  }

  input[type='range']:disabled::-webkit-slider-thumb {
    cursor: not-allowed;
  }

  input[type='range']:disabled::-moz-range-thumb {
    cursor: not-allowed;
  }
</style>
