<!-- $lib/ElementsUI/Switch.svelte -->
<script lang="ts">
  import { twMerge } from 'tailwind-merge'
  import type { ISwitchProps } from '../types'

  let {
    id = crypto.randomUUID(),
    wrapperClass = '',
    label = { name: '', class: '', captionLeft: '', captionRight: '' },
    height = '2rem',
    type = 'horizontal',
    options = [],
    bitMode = false,
    value = $bindable(),
    onChange = () => {},
  }: ISwitchProps = $props()

  let localOptions = $derived(bitMode ? options : options.slice(0, 1))

  let checkedOptions: boolean[] = $derived(
    (() => {
      if (bitMode) {
        return localOptions.map((option) => ((value ?? 0) & (1 << (option?.value ?? 0))) == Math.pow(2, option.value ?? 0))
      } else {
        return [value == 1]
      }
    })(),
  )
  let ID = $derived(`${id}-${crypto.randomUUID().slice(0, 6)}`)

  $effect(() => {
    if (value === undefined || value === null) value = 0
  })

  const handleToggle = (index: number) => {
    if (localOptions[index].disabled) return
    value = (value ?? 0) ^ (1 << (localOptions[index].value ?? 0))

    onChange(value)
  }

  const handleCaptionClick = (newValue: number) => {
    if (localOptions[0].disabled || value === newValue) return
    value = newValue
    onChange(newValue)
  }

  const maxCaptionWidth = $derived(
    Math.max(label.captionLeft?.length ?? 0, label.captionRight?.length ?? 0) > 0
      ? `${Math.max(label.captionLeft?.length ?? 0, label.captionRight?.length ?? 0)}ch`
      : 'auto',
  )
</script>

{#if type !== 'checkbox'}
  <div class={twMerge(`relative flex w-full flex-col items-center justify-center`, wrapperClass)}>
    {#if label.name}
      <h5 class={twMerge(`w-full px-4 text-center`, label.class)}>{label.name}</h5>
    {/if}
    <div class="flex w-full flex-wrap items-end justify-around gap-5">
      {#each localOptions as option, index}
        <div class={twMerge(`bg-blue flex flex-col`, option.class)}>
          {#if option.name && bitMode}
            <span>{option.name}</span>
          {/if}

          <div class="relative flex w-full grow items-center justify-center bg-transparent">
            {#if type === 'horizontal' && label.captionLeft}
              <button
                class="mr-2 {option.disabled ? 'opacity-60' : 'cursor-pointer'}"
                style="width: {maxCaptionWidth}; text-align: end;"
                onclick={() => handleCaptionClick(0)}>{label.captionLeft}</button
              >
            {/if}

            <label
              class="relative flex items-center justify-between rounded-full shadow-md
      {checkedOptions[index] ? 'border-(--bg-color)' : 'border-(--bg-color)'}
      {option.disabled ? 'opacity-60' : ''}"
            >
              <input
                id={`${id}-${crypto.randomUUID().slice(0, 6)}`}
                type="checkbox"
                class="absolute left-1/2 h-full w-full -translate-x-1/2 cursor-pointer appearance-none rounded-md"
                checked={checkedOptions[index]}
                disabled={option.disabled}
                onchange={() => handleToggle(index)}
              />
              <span
                class="relative flex items-center rounded-full border-(--bg-color) transition-all duration-250
        {checkedOptions[index] ? 'bg-(--bg-color)' : 'bg-(--back-color)'}
        {option.disabled ? '' : 'cursor-pointer'}"
                style="{type === 'horizontal' ? 'width' : 'height'}: {`calc(${height} * 2)`}; {type === 'horizontal' ? 'height' : 'width'}: {height};"
              >
                <span
                  class="absolute rounded-full transition-all duration-250
                  {checkedOptions[index] ? 'bg-(--back-color)' : 'bg-(--bg-color)'}
          {option.disabled ? 'opacity-60' : 'cursor-pointer'}"
                  style="width: {`calc(${height} * 0.8)`}; height: {`calc(${height} * 0.8)`}; margin: 0 {`calc(${height} * 0.1)`}; transform: {checkedOptions[
                    index
                  ]
                    ? `${type === 'horizontal' ? `translateX(calc(${height}))` : `translateY(calc(-${height}/2))`}`
                    : `${type === 'horizontal' ? 'translateX(0)' : `translateY(calc(${height}/2))`}`};"
                ></span>
              </span>
            </label>

            {#if type === 'horizontal' && label.captionRight}
              <button
                class="ml-2 {option.disabled ? 'opacity-60' : 'cursor-pointer'}"
                style="width: {maxCaptionWidth}; text-align: start;"
                onclick={() => handleCaptionClick(1)}>{label.captionRight}</button
              >
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </div>
{:else}
  <div class={twMerge('bg-blue m-1 flex items-center justify-center gap-2', wrapperClass)}>
    <input
      id={ID}
      type="checkbox"
      checked={checkedOptions[0]}
      disabled={localOptions[0].disabled}
      class="
      relative size-8 cursor-pointer appearance-none rounded-2xl border border-(--bg-color)
      bg-white transition duration-300 after:origin-bottom-left after:opacity-0
      checked:border-(--bg-color)
      checked:bg-(--bg-color) checked:after:absolute checked:after:-top-px checked:after:left-[5px]
      checked:after:h-[13.5px] checked:after:w-[7.5px] checked:after:rotate-43
      checked:after:border-2 checked:after:border-t-0
      checked:after:border-l-0 checked:after:border-solid
      checked:after:border-white checked:after:opacity-100
      checked:after:content-[''] hover:shadow-md
      disabled:cursor-not-allowed disabled:opacity-70
    "
      onchange={() => handleToggle(0)}
    />
    <label for={ID} class={twMerge("{disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'} ml-1 select-none", label.class)}>
      {label.name}
    </label>
  </div>
{/if}
