<!-- $lib/ElementsUI/Switch.svelte -->
<script lang="ts">
  import { twMerge } from 'tailwind-merge'
  import type { ISwitchProps } from '../types'

  let {
    id = crypto.randomUUID(),
    disabled = false,
    wrapperClass = '',
    label = { name: '', class: '', captionLeft: '', captionRight: '' },
    height = '2rem',
    type = 'horizontal',
    value = $bindable(),
    onChange = () => {},
  }: ISwitchProps = $props()

  const options = [1, 2]
  let checked = $derived(value === options[1])

  let knobTransform = $derived(
    checked
      ? `${type === 'horizontal' ? `translateX(calc(${height}))` : `translateY(calc(-${height}/2))`}`
      : `${type === 'horizontal' ? 'translateX(0)' : `translateY(calc(${height}/2))`}`,
  )

  $effect(() => {
    if (value === undefined || value === null) value = options[0]
  })

  const handleToggle = () => {
    if (disabled) return
    const newValue = checked ? options[1] : options[0]

    value = newValue

    onChange(newValue)
  }

  const handleCaptionClick = (newValue: number) => {
    if (disabled || value === newValue) return
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
  <div class={twMerge(`bg-blue relative flex w-full flex-col items-center justify-center`, wrapperClass)}>
    {#if label.name}
      <h5 class={twMerge(`w-full px-4 text-center`, label.class)}>{label.name}</h5>
    {/if}

    <div class="relative flex w-full grow items-center justify-center bg-transparent">
      {#if type === 'horizontal'}
        <button
          class="mr-2 {disabled ? 'opacity-60' : 'cursor-pointer'}"
          style="width: {maxCaptionWidth}; text-align: end;"
          onclick={() => handleCaptionClick(1)}>{label.captionLeft}</button
        >
      {/if}

      <label
        class="relative flex items-center justify-between rounded-full border
      {checked ? 'border-(--bg-color)' : 'border-(--gray-color)'}
      {disabled ? 'opacity-60' : ''}"
      >
        <input
          {id}
          type="checkbox"
          class="absolute left-1/2 h-full w-full -translate-x-1/2 cursor-pointer appearance-none rounded-md"
          bind:checked
          {disabled}
          onchange={handleToggle}
        />
        <span
          class="relative flex items-center rounded-full transition-all duration-250
        {checked ? 'bg-(--bg-color)' : 'bg-(--gray-color)'}
        {disabled ? '' : 'cursor-pointer'}"
          style="{type === 'horizontal' ? 'width' : 'height'}: {`calc(${height} * 2)`}; {type === 'horizontal' ? 'height' : 'width'}: {height};"
        >
          <span
            class="absolute rounded-full bg-(--back-color) transition-all duration-250
          {disabled ? 'opacity-60' : 'cursor-pointer'}"
            style="width: {`calc(${height} * 0.8)`}; height: {`calc(${height} * 0.8)`}; margin: 0 {`calc(${height} * 0.1)`}; transform: {knobTransform};"
          ></span>
        </span>
      </label>
      {#if type === 'horizontal'}
        <button
          class="ml-2 {disabled ? 'opacity-60' : 'cursor-pointer'}"
          style="width: {maxCaptionWidth}; text-align: start;"
          onclick={() => handleCaptionClick(2)}>{label.captionRight}</button
        >
      {/if}
    </div>
  </div>
{:else}
  <div class={twMerge('bg-blue m-1 flex items-center justify-center gap-2', wrapperClass)}>
    <input
      {id}
      type="checkbox"
      bind:checked
      {disabled}
      class="
      relative size-8 cursor-pointer appearance-none rounded-2xl border border-(--bg-color)
      bg-white transition duration-300 after:origin-bottom-left after:opacity-0
      checked:border-(--bg-color)
      checked:bg-(--bg-color) checked:after:absolute checked:after:left-[5.5px]
      checked:after:h-[13.5px] checked:after:w-[7.5px] checked:after:rotate-43
      checked:after:border-2 checked:after:border-t-0
      checked:after:border-l-0 checked:after:border-solid
      checked:after:border-white checked:after:opacity-100
      checked:after:content-[''] hover:shadow-md
      disabled:cursor-not-allowed disabled:opacity-70
    "
      onchange={handleToggle}
    />
    <label for={id} class={twMerge("{disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'} ml-1 select-none", label.class)}>
      {label.name}
    </label>
  </div>
{/if}
