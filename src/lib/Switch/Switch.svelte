<!-- $lib/ElementsUI/Switch.svelte -->
<script lang="ts">
  import type { ISwitchProps } from '../types'

  let {
    id = { name: '', value: crypto.randomUUID() },
    wrapperClass = '',
    disabled = false,
    label = { name: '', captionLeft: '', captionRight: '', class: '' },
    height = '2rem',
    value = $bindable(),
    onChange = () => {},
  }: ISwitchProps = $props()

  const options = [1, 2]
  let checked = $derived(value === options[1])

  let knobTransform = $derived(checked ? `translateX(calc(${height} * 0.9))` : 'translateX(0)')

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

<div class="relative flex w-full flex-col items-center justify-center {wrapperClass}">
  {#if label.name}
    <h5 class={`w-full px-4 text-center ${label.class}`}>{label.name}</h5>
  {/if}

  <div class="relative flex w-full grow items-center justify-center !bg-transparent">
    <button class="mr-2 {disabled ? 'opacity-60' : 'cursor-pointer'}" style="width: {maxCaptionWidth}; text-align: end;" onclick={() => handleCaptionClick(1)}
      >{label.captionLeft}</button
    >
    <label
      class="relative flex items-center justify-between rounded-full border-1
      {checked ? '!border-[var(--bg-color)]' : '!border-[var(--gray-color)]'}
      {disabled ? 'opacity-60' : ''}"
    >
      <input
        id={id.value}
        type="checkbox"
        class="absolute left-1/2 h-full w-full -translate-x-1/2 cursor-pointer appearance-none rounded-md"
        bind:checked
        {disabled}
        onchange={handleToggle}
      />
      <span
        class="relative flex items-center rounded-full transition-all duration-250 {checked ? '!bg-[var(--bg-color)]' : '!bg-[var(--gray-color)]'} {disabled
          ? ''
          : 'cursor-pointer'}"
        style="width: {`calc(${height} * 2)`}; height: {height};"
      >
        <span
          class="absolute rounded-full bg-[var(--back-color)] transition-all duration-250 {disabled ? 'opacity-60' : 'cursor-pointer'}"
          style="width: {`calc(${height} * 0.8)`}; height: {`calc(${height} * 0.8)`}; margin: 0 {`calc(${height} * 0.1)`}; transform: {knobTransform};"
        ></span>
      </span>
    </label>
    <button class="ml-2 {disabled ? 'opacity-60' : 'cursor-pointer'}" style="width: {maxCaptionWidth}; text-align: start;" onclick={() => handleCaptionClick(2)}
      >{label.captionRight}</button
    >
  </div>
</div>
