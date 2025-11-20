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
  <div
    id={`${id}-${crypto.randomUUID().slice(0, 6)}`}
    class="relative flex h-6 w-full justify-center rounded-full {disabled ? 'cursor-not-allowed opacity-50' : ''}"
  >
    {#if isRange}
      <!-- Трек и активная зона -->
      <div
        class={`absolute h-full w-full rounded-full bg-(--gray-color) ${disabled ? '' : 'cursor-pointer'}`}
        role="button"
        tabindex={null}
        onkeydown={null}
        onclick={disabled ? undefined : handleTrackClick}
      >
        <div class=" absolute h-full rounded-full bg-(--bg-color)" style={`left: ${lowerPosition}%; right: ${100 - upperPosition}%;`}></div>
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
        class={`absolute -z-10 h-full w-full ${activeThumb === 'lower' ? 'z-30' : 'z-20'}`}
      />
      <div
        class="pointer-events-none absolute z-40 size-8 rounded-full border bg-(--field-color)"
        style={`left: calc(${lowerPosition}% + 0rem); top: 50%; transform: translateY(-50%)`}
      >
        <!-- <IconGripVerticalLeft /> -->
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
        class="pointer-events-none absolute z-40 size-8 rounded-full border bg-(--field-color)"
        style={`left: calc(${upperPosition}% - 2rem); top: 50%; transform: translateY(-50%)`}
      >
        <!-- <IconGripVerticalRight /> -->
      </div>
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

      <div class="slider-wrapper absolute h-full w-full">
        <input
          type="range"
          min={number.minNum}
          max={number.maxNum}
          step={number.step}
          bind:value={singleValue}
          onmouseup={disabled ? undefined : () => onUpdate(singleValue)}
          {disabled}
          class="slider w-[calc(100%-1rem)]"
        />

        <div class="relative mt-10 w-full">
          <input
            type="range"
            class={twMerge(
              ` slider-bg [&::-webkit-slider-thumb]:bg-[url(<svg xmlns="http://www.w3.org/2000/svg" width="1.75rem" height="1.75rem"  viewBox="0  0
            24 
            24"> 
            <g 
            stroke="currentColor" 
            stroke-linecap="round" 
            stroke-width="1.5" 
            fill="none"> 
            <line 
            x1="4" y1="11" x2="4" y2="13" /> <line x1="8" y1="9"
  x2="8" y2="15" /> <line x1="12"
    y1="6" x2="12" y2="18" /> <line x1="16"
    y1="9" x2="16" y2="15" /> <line x1="20"
    y1="11" x2="20" y2="13" /> </g> </svg>
    )] h-8 w-full appearance-none overflow-hidden rounded-full
    accent-(--back-color) [&::-webkit-slider-runnable-track]:rounded-lg [&::-webkit-slider-runnable-track]:bg-(--gray-color) [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:ml-[-0.4rem] [&::-webkit-slider-thumb]:h-4
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
            [&::-moz-range-thumb]:w-4
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
          <!-- [&::-webkit-slider-thumb]:bg-(--bg-color)  -->
        </div>
      </div>

      <div
        class="pointer-events-none absolute z-30 size-8 origin-top rounded-full border bg-(--field-color)/20"
        style={`left: ${singlePosition}%; top: 50%; transform: translate(-50%, -50%)`}
      >
        <IconGripVerticalDual />
      </div>
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
    -webkit-appearance: none;
    appearance: none;
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
    cursor: pointer;
    position: relative;
    margin-left: -0.4rem;

    color: var(--bg-color);
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
