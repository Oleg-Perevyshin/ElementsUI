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

  let lowerValue1 = $state(Array.isArray(value) ? value[0] : number.minNum)
  let upperValue1 = $state(Array.isArray(value) ? value[1] : number.maxNum)

  let activeRound: 'floor' | 'ceil' = $state('floor')

  let centerNum = $derived(lowerValue1 + Math[activeRound]((upperValue1 - lowerValue1) / 2 / number.step) * number.step)

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
        type="range"
        min={number.minNum}
        max={number.maxNum}
        step={number.step}
        bind:value={lowerValue}
        oninput={disabled
          ? undefined
          : (e) => {
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

    <div class="mt-50 w-full">
      <div class="flex w-full">
        {#if isRange}
          {@const userAgent = navigator.userAgent}
          <input
            bind:this={rangeRefLower}
            type="range"
            min={number.minNum}
            max={centerNum}
            step={number.step}
            bind:value={lowerValue1}
            onmousedown={() => (activeRound = 'ceil')}
            {disabled}
            class={twMerge(
              `slider-bg basis-[calc(${(centerNum / number.maxNum) * 100}%+32px)] h-8 w-full appearance-none overflow-hidden 
              accent-(--back-color) 
              [&::-webkit-slider-runnable-track]:rounded-l-full
              [&::-webkit-slider-runnable-track]:bg-(--gray-color)
              [&::-webkit-slider-runnable-track]:px-2
              [&::-webkit-slider-thumb]:relative
              [&::-webkit-slider-thumb]:z-100
              [&::-webkit-slider-thumb]:size-4
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:shadow-red-500
            ${
              userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')
                ? '[&::-webkit-slider-thumb]:ring-[6.5px]'
                : '[&::-webkit-slider-thumb]:ring-[5px] '
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
              `[&::-moz-range-thumb]:shadow-[calc(100rem+0.5rem)_0_0_100rem] 
              [&::-webkit-slider-thumb]:shadow-[calc(100rem+0.5rem)_0_0_100rem]`,
            )}
          />

          <!-- <div class="absolute size-8 cursor-pointer rounded-full border"></div>
          <div class="absolute right-0 size-8 cursor-pointer rounded-full border"></div> -->
          <div></div>
          <input
            bind:this={rangeRefUpper}
            type="range"
            min={centerNum}
            max={number.maxNum}
            step={number.step}
            bind:value={upperValue1}
            onmousedown={() => (activeRound = 'floor')}
            {disabled}
            class={twMerge(
              `slider-bg basis-[calc(${100 - (centerNum / number.maxNum) * 100}%+32px)] h-8 w-full  appearance-none overflow-hidden  
              accent-(--back-color) 
              [&::-webkit-slider-runnable-track]:rounded-r-full
              [&::-webkit-slider-runnable-track]:bg-(--gray-color)
              [&::-webkit-slider-runnable-track]:px-2
              [&::-webkit-slider-thumb]:relative
              [&::-webkit-slider-thumb]:z-100
              [&::-webkit-slider-thumb]:size-4
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:shadow-red-500
            ${
              userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')
                ? '[&::-webkit-slider-thumb]:ring-[6.5px]'
                : '[&::-webkit-slider-thumb]:ring-[5px] '
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
          />
        {/if}
      </div>
      <div class=" flex justify-between">
        <span>{lowerValue1}</span>
        <span>{centerNum}</span>
        <span>{upperValue1}</span>
      </div>
    </div>

    <!-- <div class="mt-80 flex flex-col">
      <div class=" flex">
        <input
          type="range"
          min={number.minNum}
          max={centerNum}
          step={number.step}
          bind:value={lowerValue1}
          class="basis-[calc({(centerNum / number.maxNum) * 100}% +0.5rem)]"
        />
        <input
          type="range"
          min={centerNum}
          max={number.maxNum}
          step={number.step}
          bind:value={upperValue1}
          class="accent-red-500 basis-[calc({(1 - centerNum / number.maxNum) * 100}% +0.5rem)]"
        />
      </div>
      <div class="flex gap-50">
        <span>{lowerValue1}</span>
        <span>{upperValue1}</span>
      </div>

      <div class="demo demo--thick no-gradient">
        <div class="dual-range-input">
          <input
            type="range"
            min={number.minNum}
            max={centerNum}
            step={number.step}
            bind:value={lowerValue1}
            data-ready="true"
            class="basis-[calc({(centerNum / number.maxNum) * 100}% +32px)]"
            style="--dri-gradient-position: calc({minFillPercentage}% + ({minFillThumb} * 32px));"
          /><input
            type="range"
            min={centerNum}
            max={number.maxNum}
            step={number.step}
            bind:value={upperValue1}
            data-ready="true"
            class="basis-[calc({(100 - centerNum / number.maxNum) * 100}% +32px]"
            style="flex-basis: calc({(100 - centerNum / number.maxNum) * 100}% +32px); 
            --dri-gradient-position: calc({maxFillPercentage}% + ({maxFillThumb} * 32px));"
          />
        </div>
        <div class="values">
          <span>0</span>
          <span>{lowerValue1} - {upperValue1}</span>
          <span>100</span>
        </div>
      </div>

      <div class="demo demo--purple">
        <div class="dual-range-input">
          <input
            type="range"
            min={number.minNum}
            max={centerNum}
            step={number.step}
            bind:value={lowerValue1}
            data-ready="true"
            class="basis-[calc({(100 - centerNum / number.maxNum) * 100}% +32px]"
            style="flex-basis: calc({(100 - centerNum / number.maxNum) * 100}% +32px); 
            --dri-gradient-position: calc({maxFillPercentage}% + ({maxFillThumb} * 32px));"
          /><input
            type="range"
            min={centerNum}
            max={number.maxNum}
            step={number.step}
            bind:value={upperValue1}
            data-ready="true"
            class="basis-[calc({(100 - centerNum / number.maxNum) * 100}% +32px]"
            style="flex-basis: calc({(100 - centerNum / number.maxNum) * 100}% +32px); 
            --dri-gradient-position: calc({maxFillPercentage}% + ({maxFillThumb} * 32px));"
          />
        </div>
        <div class="values">
          <span>0</span>
          <span>9 - 19</span>
          <span>20</span>
        </div>
      </div>
    </div> -->
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

<!-- <style>
  .values {
    display: flex;
    justify-content: space-between;
    margin: 0;
    font-family: 'Menlo', 'DejaVu Sans', 'Courier New', monospace;
    font-size: 0.875rem;
    min-height: 1lh;
  }

  .dual-range-input input {
    outline-offset: -1px;
  }

  input:first-child {
    outline: 1px solid rgba(255, 165, 0, 0.5);
    --dri-track-filled-color: rgb(254, 195, 85);
    --dri-thumb-color: orange;
    --dri-thumb-hover-color: rgb(236, 154, 0);
    --dri-thumb-active-color: rgb(207, 134, 0);
  }

  input:last-child {
    outline: 1px solid var(--dri-thumb-hover-color);
  }

  input::-moz-range-thumb {
    opacity: 0.6;
  }

  input::-webkit-slider-thumb {
    opacity: 0.6;
  }

  .demo + .demo {
    margin-top: 4rem;
  }

  .demo--purple .dual-range-input {
    --dri-thumb-width: 2rem;
    --dri-thumb-height: 2rem;

    --dri-thumb-color: #ddd;
    --dri-thumb-active-color: #682af8;
    --dri-thumb-hover-color: #b697ff;

    --dri-track-filled-color: #682af8;
    --dri-track-filled-gradient-mid-color: #ec5caf;
    --dri-track-filled-gradient-end-color: #b697ff;

    --dri-height: 2rem;
  }

  .demo--pink .dual-range-input {
    --dri-thumb-width: 2.5rem;
    --dri-thumb-height: 1.5rem;

    --dri-thumb-color: #ddd;
    --dri-thumb-active-color: rgb(255, 78, 178);
    --dri-thumb-hover-color: rgb(255, 168, 209);
    --dri-thumb-border-color: rgba(0, 0, 0, 0.1);

    --dri-track-height: 0.5rem;
    --dri-track-color: rgba(255, 168, 209, 0.1);
    --dri-track-filled-color: rgb(255, 78, 178);

    --dri-thumb-border-radius: 0.25rem;
    --dri-height: 1.5rem;
  }

  .demo--thick .dual-range-input {
    --dri-height: 2rem;

    --dri-track-height: 2rem;
    --dri-track-color: #f1f3f1;
    --dri-track-filled-color: #6ee7b7;

    --dri-thumb-color: #34d399;
    --dri-thumb-hover-color: #10b981;
    --dri-thumb-active-color: #059669;
    --dri-thumb-border-color: rgba(0, 0, 0, 0.1);
    --dri-thumb-height: 2rem;
    --dri-thumb-width: 2rem;
  }

  .demo--outline .dual-range-input {
    --main-color: rgb(174, 95, 203);
    --active-color: rgb(111, 0, 152);

    --dri-height: 2rem;

    --dri-track-height: 0.25rem;
    --dri-track-border-radius: 1rem;
    --dri-track-color: var(--main-color);
    --dri-track-filled-color: var(--main-color);

    --dri-thumb-color: #fff;
    --dri-thumb-hover-color: #fff;
    --dri-thumb-active-color: var(--active-color);
    --dri-thumb-border-color: var(--main-color);
    --dri-thumb-height: 2rem;
    --dri-thumb-width: 2rem;
    --dri-thumb-border-width: 0.25rem;
    --dri-thumb-border-hover-color: var(--active-color);
    --dri-thumb-border-active-color: var(--active-color);

    &:has(input:focus-visible) {
      outline-color: rgb(111, 0, 152, 0.5);
    }
  }

  @mixin dri-track {
    background-color: var(--dri-track-color);
    background-repeat: no-repeat;
    box-sizing: border-box;
    height: var(--dri-track-height);
  }

  @mixin dri-track-min() {
    border-start-start-radius: var(--dri-track-border-radius);
    border-end-start-radius: var(--dri-track-border-radius);

    background-image: linear-gradient(
      to right,
      var(--dri-track-color) var(--dri-gradient-position),
      var(--dri-track-filled-color) var(--dri-gradient-position),
      var(--dri-track-filled-gradient-mid-color)
    );

    /* [dir='rtl'] & {
      background-image: linear-gradient(
        to left,
        var(--dri-track-color) var(--dri-gradient-position),
        var(--dri-track-filled-color) var(--dri-gradient-position),
        var(--dri-track-filled-gradient-mid-color)
      );
    } */
  }

  @mixin dri-track-max() {
    border-start-end-radius: var(--dri-track-border-radius);
    border-end-end-radius: var(--dri-track-border-radius);

    background-image: linear-gradient(
      to right,
      var(--dri-track-filled-gradient-mid-color),
      var(--dri-track-filled-gradient-end-color) var(--dri-gradient-position),
      var(--dri-track-color) var(--dri-gradient-position)
    );

    /* [dir='rtl'] & {
      background-image: linear-gradient(
        to left,
        var(--dri-track-filled-gradient-mid-color),
        var(--dri-track-filled-gradient-end-color) var(--dri-gradient-position),
        var(--dri-track-color) var(--dri-gradient-position)
      );
    } */
  }

  @mixin dri-thumb {
    -webkit-appearance: none;
    appearance: none;
    background-color: var(--dri-thumb-color);
    border-radius: var(--dri-thumb-border-radius);
    border: var(--dri-thumb-border-width) solid var(--dri-thumb-border-color);
    box-shadow: none;
    box-sizing: border-box;
    height: var(--dri-thumb-height);
    width: var(--dri-thumb-width);
  }

  .dual-range-input {
    --dri-height: 1.5rem;

    --dri-thumb-width: 1.25rem;
    --dri-thumb-height: 1.25rem;

    --dri-thumb-color: #ddd;
    --dri-thumb-hover-color: #a8d5ff;
    --dri-thumb-active-color: #4eaaff;

    --dri-thumb-border-color: rgba(0, 0, 0, 0.1);
    --dri-thumb-border-hover-color: var(--dri-thumb-border-color);
    --dri-thumb-border-active-color: var(--dri-thumb-border-color);
    --dri-thumb-border-radius: 1rem;
    --dri-thumb-border-width: 1px;

    --dri-track-height: 0.25rem;
    --dri-track-border-radius: 1rem;

    --dri-track-color: #ccc;
    --dri-track-filled-color: #0084ff;
    --dri-track-filled-gradient-mid-color: var(--dri-track-filled-color);
    --dri-track-filled-gradient-end-color: var(--dri-track-filled-color);

    display: flex;
    height: var(--dri-height);
    max-width: 100%;
    width: 100%;
    box-sizing: border-box;
    padding-inline-end: calc(var(--dri-thumb-width) * 2);

    &:has(input:focus-visible) {
      outline: 2px solid var(--dri-thumb-active-color);
      outline-offset: 4px;
      border-radius: 2px;
    }

    input {
      -webkit-tap-highlight-color: transparent;
      -webkit-appearance: none;
      appearance: none;
      background: none;
      border-radius: 0;
      flex-basis: calc(50% + var(--dri-thumb-width));
      flex-shrink: 0;
      font-size: inherit;
      height: 100%;
      margin: 0;
      min-width: var(--dri-thumb-width);
      outline: none;
    }

    input::-moz-range-track {
      @include dri-track;
    }

    input:first-child::-moz-range-track {
      @include dri-track-min;
    }

    input:last-child::-moz-range-track {
      @include dri-track-max;
    }

    input::-moz-range-thumb {
      @include dri-thumb;
      max-width: 99.99%;
    }

    input:not([data-ready='true'])::-moz-range-thumb {
      opacity: 0;
    }

    input:hover::-moz-range-thumb {
      background-color: var(--dri-thumb-hover-color);
      border-color: var(--dri-thumb-border-hover-color);
    }

    input:active::-moz-range-thumb {
      background-color: var(--dri-thumb-active-color);
      border-color: var(--dri-thumb-border-active-color);
    }

    input:focus-visible::-moz-range-thumb {
      background-color: var(--dri-thumb-active-color);
      border-color: var(--dri-thumb-border-active-color);
    }

    input::-webkit-slider-runnable-track {
      @include dri-track;
    }

    input:first-child::-webkit-slider-runnable-track {
      @include dri-track-min;
    }

    input:last-child::-webkit-slider-runnable-track {
      @include dri-track-max;
    }

    input::-webkit-slider-thumb {
      @include dri-thumb;
      margin-top: calc(var(--dri-track-height) / 2);
      transform: translateY(-50%);
    }

    input:not([data-ready='true'])::-webkit-slider-thumb {
      opacity: 0;
    }

    input:hover::-webkit-slider-thumb {
      background-color: var(--dri-thumb-hover-color);
      border-color: var(--dri-thumb-border-hover-color);
    }

    input:active::-webkit-slider-thumb {
      background-color: var(--dri-thumb-active-color);
      border-color: var(--dri-thumb-border-active-color);
    }

    input:focus-visible::-webkit-slider-thumb {
      background-color: var(--dri-thumb-active-color);
      border-color: var(--dri-thumb-border-active-color);
    }
  }
</style> -->
