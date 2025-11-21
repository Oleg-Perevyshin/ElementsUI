<!-- $lib/ElementsUI/Slider.svelte -->
<script lang="ts">
  import type { ISliderProps } from '../types'
  import { twMerge } from 'tailwind-merge'
  import { onDestroy, onMount } from 'svelte'

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
        lowerValue = roundToClean(Math.max(number.minNum, Math.min(lowerValue + stepValue, upperValue)))
        lowerValue = roundToClean(lowerValue == upperValue ? upperValue - number.step : lowerValue)
      } else {
        upperValue = roundToClean(Math.min(number.maxNum, Math.max(upperValue + stepValue, lowerValue)))
        upperValue = roundToClean(upperValue == lowerValue ? upperValue + number.step : upperValue)
      }
      onUpdate([lowerValue, upperValue])
    } else {
      singleValue = roundToClean(Math.max(number.minNum, Math.min(singleValue + stepValue, number.maxNum)))
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
        lowerValue = roundToClean(Math.max(number.minNum, Math.min(clickValue, upperValue)))
        lowerValue = roundToClean(lowerValue == upperValue ? upperValue - number.step : lowerValue)
      } else {
        upperValue = roundToClean(Math.min(number.maxNum, Math.max(clickValue, lowerValue)))
        upperValue = roundToClean(upperValue == lowerValue ? upperValue + number.step : upperValue)
      }
      onUpdate([lowerValue, upperValue])
    } else {
      singleValue = roundToClean(Math.max(number.minNum, Math.min(clickValue, number.maxNum)))
      onUpdate(singleValue)
    }
  }

  let rangeRefLower: HTMLElement | null = $state(null)
  let rangeRefUpper: HTMLElement | null = $state(null)
  let rangeWidth: number = $state(0)
  let rangePadding = $state(0)

  const updaterangeWidth = () => {
    const percent = (upperValue - lowerValue) / (number.maxNum - number.minNum)
    let rect
    if (rangeRefLower) {
      rect = rangeRefLower.getBoundingClientRect()
      rangeWidth = rect.width * percent
      rangePadding = rect.width * ((lowerValue - number.minNum) / (number.maxNum - number.minNum))
    }

    //  else if (thumbCenterUpper && thumbCenterLower && percent < 0.1) {
    //   rangeWidth = (thumbCenterUpper - thumbCenterLower) / 10
    //   shadowHeight = (thumbCenterUpper - thumbCenterLower) / 2
    // } else if (thumbCenterUpper && thumbCenterLower && thumbCenterUpper - thumbCenterLower < 65) {
    //   rangeWidth = (thumbCenterUpper - thumbCenterLower) / 1000
    //   shadowHeight = (thumbCenterUpper - thumbCenterLower) / 3
    // }

    console.log(rangeWidth, percent)
  }

  const roundToClean = (num: number): number => {
    if (Number.isInteger(num)) return num

    const rounded1 = Number(num.toFixed(1))
    if (Math.abs(rounded1 - num) < 1e-10) return rounded1

    const rounded2 = Number(num.toFixed(2))
    if (Math.abs(rounded2 - num) < 1e-10) return rounded2

    return rounded2
  }

  $effect(() => {
    lowerValue
    upperValue
    updaterangeWidth()
  })

  onMount(() => {
    if (window.visualViewport) {
      const handleResize = () => {
        updaterangeWidth()
      }
      window.visualViewport.addEventListener('resize', handleResize)
      onDestroy(() => {
        if (window.visualViewport) window.visualViewport.removeEventListener('resize', handleResize)
      })
    }
  })
</script>

<div class={twMerge(`bg-blue relative flex w-full flex-col items-center `, wrapperClass)}>
  {#if label.name}
    <h5 class={twMerge(`w-full px-4 text-center`, label.class)}>{label.name}</h5>
  {/if}

  <!-- Слайдер -->
  <div
    id={`${id}-${crypto.randomUUID().slice(0, 6)}`}
    class="relative flex h-8 w-full items-center justify-center rounded-full {disabled ? 'cursor-not-allowed opacity-50' : ''}"
  >
    {#if isRange}
      {@const userAgent = navigator.userAgent}
      <!-- Трек и активная зона -->
      <div
        class={`absolute z-40 h-full w-full rounded-full bg-transparent ${disabled ? '' : 'cursor-pointer'}`}
        role="button"
        tabindex={null}
        onkeydown={null}
        onclick={(e) => {
          disabled ? undefined : handleTrackClick(e)
        }}
      ></div>

      <div
        class={`absolute z-5 h-[70%] w-full rounded-full bg-stone-500/50 ${disabled ? '' : 'cursor-pointer'}`}
        role="button"
        tabindex={null}
        onkeydown={null}
      ></div>
      <div
        class={`absolute left-[calc(${rangePadding}px)] z-10 h-full w-[${rangeWidth}px] rounded-full bg-blue-500/50 ${disabled ? '' : 'cursor-pointer'}`}
        role="button"
        tabindex={null}
        onkeydown={null}
      ></div>

      <!-- Ползунки -->
      <input
        bind:this={rangeRefLower}
        type="range"
        min={number.minNum}
        max={number.maxNum}
        step={number.step}
        bind:value={lowerValue}
        oninput={disabled
          ? undefined
          : (e) => {
              console.log('jfnhlzsdkfldk')

              const newValue = Math.min(Number((e.target as HTMLInputElement).value), upperValue)
              lowerValue = roundToClean(newValue == upperValue ? upperValue - number.step : newValue)
            }}
        onmouseup={(e) => {
          handleTrackClick(e)
          disabled ? undefined : () => onUpdate([lowerValue, upperValue])
        }}
        {disabled}
        class={twMerge(
          `slider-bg pointer-events-none absolute z-50 h-8 w-full appearance-none rounded-full accent-(--back-color) 
              [&::-webkit-slider-runnable-track]:rounded-full 
              [&::-webkit-slider-runnable-track]:bg-transparent
              [&::-webkit-slider-thumb]:z-100
              [&::-webkit-slider-thumb]:ml-[-0.4rem] 
              [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:shadow-red-500
            ${
              userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')
                ? 'pl-3.5 [&::-webkit-slider-thumb]:ring-[6.5px]'
                : 'pl-3 [&::-webkit-slider-thumb]:ring-[5px]'
            }
            [&::-moz-range-thumb]:relative 
            [&::-moz-range-thumb]:ml-[-0.4rem]
            [&::-moz-range-thumb]:size-4 
            [&::-moz-range-thumb]:cursor-pointer 
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:shadow-[var(--focus-shadow),] 
            [&::-moz-range-thumb]:ring-[6px] 
            [&::-moz-range-track]:rounded-full
            [&::-moz-range-track]:bg-(--gray-color)
             `,
        )}
      />

      <input
        bind:this={rangeRefUpper}
        type="range"
        min={number.minNum}
        max={number.maxNum}
        step={number.step}
        bind:value={upperValue}
        oninput={disabled
          ? undefined
          : (e) => {
              const newValue = Math.max(Number((e.target as HTMLInputElement).value), lowerValue)
              upperValue = roundToClean(newValue == lowerValue ? newValue + number.step : upperValue)
            }}
        onmouseup={(e) => {
          handleTrackClick(e)
          disabled ? undefined : () => onUpdate([lowerValue, upperValue])
        }}
        {disabled}
        class={twMerge(
          `slider-bg pointer-events-none absolute z-50 h-8 w-full appearance-none rounded-full accent-(--back-color) 
              [&::-webkit-slider-runnable-track]:rounded-full 
              [&::-webkit-slider-runnable-track]:bg-transparent
              [&::-webkit-slider-thumb]:z-100
              [&::-webkit-slider-thumb]:ml-[-0.4rem] 
              [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:shadow-red-500
            ${
              userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')
                ? 'pl-3.5 [&::-webkit-slider-thumb]:ring-[6.5px]'
                : 'pl-3 [&::-webkit-slider-thumb]:ring-[5px]'
            }
            [&::-moz-range-thumb]:relative 
            [&::-moz-range-thumb]:ml-[-0.4rem]
            [&::-moz-range-thumb]:size-4 
            [&::-moz-range-thumb]:cursor-pointer 
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:shadow-[var(--focus-shadow),] 
            [&::-moz-range-thumb]:ring-[6px] 
            [&::-moz-range-track]:rounded-full
            [&::-moz-range-track]:bg-(--gray-color)
             `,
        )}
      />
    {:else}
      {@const userAgent = navigator.userAgent}
      <!-- Одиночный слайдер -->
      <div class="absolute h-full w-full">
        <input
          type="range"
          class={twMerge(
            `slider-bg  h-8 w-full appearance-none overflow-hidden rounded-full accent-(--back-color) 
              [&::-webkit-slider-runnable-track]:rounded-full
              [&::-webkit-slider-runnable-track]:bg-(--gray-color)
              [&::-webkit-slider-thumb]:relative 

              [&::-webkit-slider-thumb]:ml-[-0.4rem] 
              [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:shadow-[var(--focus-shadow),]
            ${
              userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')
                ? 'pl-3.5 [&::-webkit-slider-thumb]:ring-[6.5px]'
                : 'pl-3 [&::-webkit-slider-thumb]:ring-[5px]'
            }
            [&::-moz-range-thumb]:relative 
            [&::-moz-range-thumb]:ml-[-0.4rem]
            [&::-moz-range-thumb]:size-4 
            [&::-moz-range-thumb]:cursor-pointer 
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:shadow-[var(--focus-shadow),] 
            [&::-moz-range-thumb]:ring-[6px] 
            [&::-moz-range-track]:rounded-full
            [&::-moz-range-track]:bg-(--gray-color)
             `,
            `[&::-moz-range-thumb]:shadow-[calc(100rem*-1-0.5rem)_0_0_100rem] 
              [&::-webkit-slider-thumb]:shadow-[calc(100rem*-1-0.5rem)_0_0_100rem]`,
          )}
          min={number.minNum}
          max={number.maxNum}
          step={number.step}
          bind:value={singleValue}
        />
      </div>
    {/if}
  </div>

  <!-- Кнопки управления -->
  <div class={`mt-3 flex w-full ${isRange ? 'justify-between' : 'justify-center'} gap-2`}>
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
