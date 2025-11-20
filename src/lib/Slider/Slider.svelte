<!-- $lib/ElementsUI/Slider.svelte -->
<script lang="ts">
  import type { ISliderProps } from '../types'
  import IconGripVerticalDual from '../libIcons/IconGripVerticalDual.svelte'
  import { twMerge } from 'tailwind-merge'
  import IconGripVerticalRight from '$lib/libIcons/IconGripVerticalRight.svelte'
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

  /* Расчет позиций */
  const singlePosition = $derived(((singleValue - number.minNum) / (number.maxNum - number.minNum)) * 100)
  const lowerPosition = $derived(((lowerValue - number.minNum) / (number.maxNum - number.minNum)) * 100)
  const upperPosition = $derived(((upperValue - number.minNum) / (number.maxNum - number.minNum)) * 100)

  let rangeRef: HTMLElement | null = $state(null)
  let steps = $derived(number.maxNum / number.step)

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

  let rangeRefLower: HTMLElement | null = $state(null)
  let rangeRefUpper: HTMLElement | null = $state(null)
  let shadowWidth = $state()

  $effect(() => {
    let thumbCenterLower
    let thumbCenterUpper
    if (rangeRefLower) {
      const rect = rangeRefLower.getBoundingClientRect()
      const percent = (lowerValue - number.minNum) / (number.maxNum - number.minNum)
      const thumbX = rect.left + rect.width * percent
      const thumbOffset = 0
      thumbCenterLower = thumbX - thumbOffset
    }
    if (rangeRefUpper) {
      const rect = rangeRefUpper.getBoundingClientRect()
      const percent = (upperValue - number.minNum) / (number.maxNum - number.minNum)
      const thumbX = rect.left + rect.width * percent
      const thumbOffset = 0
      thumbCenterUpper = thumbX - thumbOffset
    }
    if (thumbCenterUpper && thumbCenterLower) shadowWidth = (thumbCenterUpper - thumbCenterLower) / 3
  })
</script>

<div class={twMerge(`relative flex w-full flex-col items-center `, wrapperClass)}>
  {#if label.name}
    <h5 class={twMerge(`w-full px-4 text-center`, label.class)}>{label.name}</h5>
  {/if}

  <!-- Слайдер -->
  <div
    id={`${id}-${crypto.randomUUID().slice(0, 6)}`}
    class="relative flex h-9 w-full justify-center rounded-full {disabled ? 'cursor-not-allowed opacity-50' : ''}"
  >
    {#if isRange}
      {@const userAgent = navigator.userAgent}
      <!-- Трек и активная зона -->
      <div
        class={`absolute z-10 h-full w-full rounded-full bg-transparent ${disabled ? '' : 'cursor-pointer'}`}
        role="button"
        tabindex={null}
        onkeydown={null}
        onclick={(e) => {
          disabled ? undefined : handleTrackClick(e)
        }}
      >
        <!-- <div class="absolute h-full rounded-full bg-(--bg-color)" style={`left: ${lowerPosition}%; right: ${100 - upperPosition}%;`}></div> -->
      </div>

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
              const newValue = Math.min(Number((e.target as HTMLInputElement).value), upperValue)
              lowerValue = newValue
              // activeThumb = 'upper'
              // console.log('lower')
            }}
        onmouseup={(e) => {
          handleTrackClick(e)
          disabled ? undefined : () => onUpdate([lowerValue, upperValue])
        }}
        {disabled}
        class={twMerge(
          `slider-bg absolute h-8 w-full appearance-none overflow-hidden rounded-full accent-(--back-color) 
              [&::-webkit-slider-runnable-track]:rounded-lg 
              [&::-webkit-slider-runnable-track]:bg-(--gray-color)
              [&::-webkit-slider-thumb]:relative 
              [&::-webkit-slider-thumb]:z-100 
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
            [&::-moz-range-track]:rounded-lg 
            [&::-moz-range-track]:bg-(--gray-color)
             `,
          `[&::-moz-range-thumb]:shadow-[calc(100rem*-1-0.5rem)_0_0_100rem] 
              [&::-webkit-slider-thumb]:shadow-[calc(${shadowWidth}px+0.5rem)_0_0_${shadowWidth}px]`,
        )}
      />

      <!-- ${activeThumb === 'lower' ? 'z-30' : 'z-20'} -->

      <!-- <div
        class="pointer-events-none absolute z-40 size-8 rounded-full border bg-(--field-color)"
        style={`left: calc(${lowerPosition}% + 0rem); top: 50%; transform: translateY(-50%)`}
      >
        <IconGripVerticalLeft />
      </div> -->

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
              upperValue = newValue
              // activeThumb = 'lower'
              // console.log('upper')
            }}
        onmouseup={(e) => {
          handleTrackClick(e)
          disabled ? undefined : () => onUpdate([lowerValue, upperValue])
        }}
        {disabled}
        class={twMerge(
          `slider-bg absolute h-8 w-full appearance-none overflow-hidden rounded-full accent-(--back-color) 
              [&::-webkit-slider-runnable-track]:rounded-lg 
              [&::-webkit-slider-thumb]:relative 
              [&::-webkit-slider-thumb]:z-100
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
            [&::-moz-range-track]:rounded-lg 
            [&::-moz-range-track]:bg-(--gray-color)
             `,
          `[&::-moz-range-thumb]:shadow-[calc(100rem*-1-0.5rem)_0_0_100rem] 
              [&::-webkit-slider-thumb]:shadow-[calc(${shadowWidth}px*-1-0.5rem)_0_0_${shadowWidth}px]`,
        )}
      />

      <!-- <div
        class="pointer-events-none absolute z-40 size-8 rounded-full border bg-(--field-color)"
        style={`left: calc(${upperPosition}% - 2rem); top: 50%; transform: translateY(-50%)`}
      >
        <IconGripVerticalRight />
      </div> -->
    {:else}
      {@const userAgent = navigator.userAgent}
      <!-- Одиночный слайдер -->
      <!-- <div
        class={`absolute h-full w-full rounded-full bg-(--gray-color) ${disabled ? '' : 'cursor-pointer'}`}
        role="button"
        tabindex={null}
        onkeydown={null}
        onclick={disabled ? undefined : handleTrackClick}
      >
        <div
          class="absolute h-full {singlePosition === 100 ? ' rounded-full' : 'rounded-l-full'}"
          style={`width: ${singlePosition}%; background-color: `}
        ></div>
      </div> -->

      <div class="absolute h-full w-full">
        <input
          type="range"
          class={twMerge(
            `slider-bg  h-8 w-full appearance-none overflow-hidden rounded-full accent-(--back-color) 
              [&::-webkit-slider-runnable-track]:rounded-lg 
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
            [&::-moz-range-track]:rounded-lg 
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

        <div class="relative mt-10 w-full"></div>
      </div>
      <!-- 
      <div
        class="pointer-events-none absolute z-30 size-8 origin-top rounded-full border bg-(--field-color)/20"
        style={`left:${thumbCenterX}px; top: 50%; transform: translate(-50%, -50%)`}
      >
        <IconGripVerticalDual />
      </div> -->
    {/if}
  </div>

  <!-- Кнопки управления -->
  <div class={`mt-4 flex w-full ${isRange ? 'justify-between' : 'justify-center'} gap-2`}>
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
  .slider {
    /* -webkit-appearance: none;
    appearance: none; */
    height: 2rem;
    border-radius: 999px;
    padding-left: 10px;
    overflow: hidden;
    accent-color: var(--back-color);
  }

  /* Для WebKit (Chrome, Safari) */
  .slider::-webkit-slider-thumb {
    height: 1rem;
    width: 1rem;
    border-radius: 50%;
    border: none;
    z-index: 1000;
    cursor: pointer;
    position: relative;
    margin-left: -0.4rem;
    color: transparent;
    /* color: var(--bg-color); */
    box-shadow:
      inset var(--focus-shadow, 0 1px 2px rgba(0, 0, 0, 0.1)),
      0 0,
      calc(100rem * -1 - 0.5rem) 0 0 100rem,
      0 0 0 5px var(--bg-color);
  }

  .slider::-webkit-slider-runnable-track {
    border-radius: 0.5rem;
    background: var(--gray-color);
  }

  /* Для Firefox */
  .slider::-moz-range-thumb {
    height: 1rem;
    width: 1rem;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    position: relative;
    margin-left: -0.4rem;
    color: var(--bg-color);
    box-shadow:
      inset var(--focus-shadow, 0 1px 2px rgba(0, 0, 0, 0.1)),
      0 0,
      calc(100rem * -1 - 0.5rem) 0 0 100rem,
      0 0 0 5px var(--bg-color);
    background: var(--bg-color);
  }

  .slider::-moz-range-track {
    border-radius: 0.5rem;
    background: var(--gray-color);
  }

  /* input[type='range'] {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 2rem;
    background: transparent;
    border-radius: 9999px;
    overflow: hidden;
    accent-color: var(--red-color);
  }

  input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    height: 1rem;
    width: 1rem;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    position: relative;

    scale: 1.5;
    translate: var(--tw-translate-x) 10%;
    margin-left: 0.25rem;
    box-shadow: 0 0 0 4px #dc2626;
    color: bisque;
    box-shadow:
      inset var(--shadow-inset-info, 0 1px 2px rgba(0, 0, 0, 0.1)),
      0 0,
      calc(100rem * -1 - 0.5rem) 0 0 100rem;
  }

  input[type='range']::-moz-range-thumb {
    height: 1rem;
    width: 1rem;
    border-radius: 50%;
    border: none;
    background: #fff;
    cursor: pointer;
    position: relative;
    transform: translateY(-50%);
    margin-left: 0.25rem;
    box-shadow: 0 0 0 4px #dc2626;
  }

  input[type='range']::-webkit-slider-runnable-track {
    height: 1.5rem;
    width: 100%;
    border-radius: 0.5rem;
    margin-right: 0.5rem;
    background: transparent;
  }

  input[type='range']::-moz-range-track {
    height: 1.5rem;
    width: 100%;
    border-radius: 0.5rem;
    margin-right: 0.5rem;
    background: #e4e6eb;
  } */
  /* 
  .slider-wrapper {
    position: relative;
    width: 100%;
    background: transparent;
    border-radius: 9999px;
    overflow: hidden;
  }

  .slider-wrapper::before {
    content: '';
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 100%;
    height: 0.5rem;
    background: #000000;
    border-radius: 0.5rem;
  } */

  /* input[type='range'] {
    -webkit-appearance: none;
    appearance: none; 
    margin: 0;
    padding: 0;
    pointer-events: none;
    outline: none;
    accent-color: var(--back-color);
  }

  input[type='range']::before {
    width: 100%;
    height: 2rem;
    scale: 160% 160%;
    translate: var(--tw-translate-x) 32%;
    background: red;
    z-index: 50;
  }

  Webkit thumb
  input[type='range']::-webkit-slider-thumb {
        -webkit-appearance: none;
    appearance: none;
    background: var(--back-color);
    cursor: pointer;
    pointer-events: auto;
    border: none;
    scale: 160% 160%;
    translate: var(--tw-translate-x) 32%;
  }

  Firefox thumb
  input[type='range']::-moz-range-thumb {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background: transparent;
    cursor: pointer;
    pointer-events: auto;
    border: none;
  }

  Webkit track
  input[type='range']::-webkit-slider-runnable-track {
    width: 100%;
    height: 100%;
    background: transparent;
    border-radius: 0;
    border: none;
  }

  Firefox track
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

  input[type='range']:focus::-webkit-slider-thumb {
    accent-color: var(--back-color);
  }

  input[type='range']:focus::-moz-range-thumb {
    accent-color: var(--back-color);
  } */
</style>
