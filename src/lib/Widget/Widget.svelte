<script lang="ts">
  import type { IWidgetProps } from "../types"
  import { twMerge } from "tailwind-merge"

  let {
    id = crypto.randomUUID(),
    label = { name: "", class: "" },
    settings = { label: "", number: { minNum: 0, maxNum: 1000, step: 1 }, toggle: { captionLeft: "Off", captionRight: "On" } },
    value = 8,
    iconArray,
    onUpdate = () => {},
  }: IWidgetProps = $props()

  // let transformClass = $derived(`transform rotate-${rotation}`)
  let currentIndex = $state(0)
  let intervalId: number | null = null

  $effect(() => {
    if (intervalId !== null) {
      clearInterval(intervalId)
      intervalId = null
    }

    const mappedValue = mapToStep(value)
    const periodInMs = mappedValue === 0 ? 0 : 700 / mappedValue

    if (iconArray && periodInMs > 0) {
      intervalId = window.setInterval(() => {
        currentIndex = (currentIndex + 1) % iconArray.length
      }, periodInMs)
    }

    return () => {
      if (intervalId !== null) {
        clearInterval(intervalId)
      }
    }
  })

  const mapToStep = (inputValue: number): number => {
    const minNumber = settings.number?.minNum ?? 0
    const maxNumber = settings.number?.maxNum ?? 10
    if (value > maxNumber) inputValue = maxNumber
    const clampedValue = Math.min(Math.max(inputValue, minNumber), maxNumber)

    const inputRange = maxNumber - minNumber
    const outputRange = 10

    if (inputRange === 0) {
      return 0
    }

    const intervalWidth = inputRange / outputRange

    let stepIndex = Math.ceil((clampedValue - minNumber) / intervalWidth)

    stepIndex = Math.min(Math.max(stepIndex, 0), outputRange)

    const result = 0 + stepIndex
    console.log(result)

    return result
  }

  // $effect(() => {
  //   if (settings.number?.maxNum && value > settings.number?.maxNum) {
  //     value = settings.number?.maxNum
  //   }
  // })

  // $effect(() => {
  //   if (settings.number?.minNum && value < settings.number?.minNum) {
  //     value = settings.number?.minNum
  //   }
  // })

  const currentImage = $derived(iconArray ? iconArray[currentIndex] : "")

  const handleCaptionClick = (newValue: number) => {
    if (value === newValue) return
    value = newValue
    onUpdate(newValue)
  }

  const handleToggle = () => {
    value = (value ?? 0) ^ (1 << (value ?? 0))
    onUpdate(value)
  }

  const maxCaptionWidth = $derived(
    Math.max(settings.toggle?.captionLeft?.length ?? 0, settings.toggle?.captionRight?.length ?? 0) > 0
      ? `${Math.max(settings.toggle?.captionLeft?.length ?? 0, settings.toggle?.captionRight?.length ?? 0)}ch`
      : "auto",
  )
</script>

<div
  id={`${id}-${crypto.randomUUID().slice(0, 6)}`}
  class="w-full h-full mt-1 rounded-xl bg-(--container-color)
     transition-shadow duration-250
     shadow-[0_0_3px_rgb(0_0_0_/0.25)] hover:shadow-[0_0_6px_rgb(0_0_0_/0.25)]"
>
  <div class="flex flex-col w-full h-[70%] inset-shadow-[0_-10px_10px_-15px_rgb(0_0_0_/0.5)] p-2">
    <div class="flex gap-2 overflow-hidden">
      <div class="size-14 p-0.5 [&_svg]:h-full [&_svg]:max-h-full [&_svg]:w-full [&_svg]:max-w-full">
        {@html currentImage}
      </div>
      <h1 class={label.class}>{label.name}</h1>
    </div>
    <div class="text-5xl flex-1 flex items-center justify-center">{value} {settings.number?.units}</div>
  </div>
  {#if settings.label}
    <h5>{settings.label}</h5>
  {/if}
  <!-- Input -->
  <div class="flex p-2 gap-2">
    <button
      class="flex size-8 items-center justify-center rounded-full transition-colors duration-150 hover:bg-(--gray-color)/30 active:bg-(--gray-color)/10 text-2xl"
      onclick={() => {
        if ((settings.number?.minNum !== 0 && !settings.number?.minNum) || !settings.number?.step || (value !== 0 && !value)) return
        if (Number(value) - settings.number?.step <= settings.number?.minNum) {
          value = settings.number?.minNum
          onUpdate(value as number)
          return
        } else if (settings.number?.maxNum && Number(value) > settings.number?.maxNum) {
          value = settings.number?.maxNum
          return
        }
        value = Number(value) - (settings.number?.step ?? 1)
        onUpdate(value as number)
      }}
      aria-label="Уменьшить">−</button
    >
    <input
      bind:value
      class={twMerge(`flex-1 w-full rounded-2xl border px-8 py-1 text-center shadow-[0_0_3px_rgb(0_0_0_/0.25)] transition duration-200
              outline-none focus:shadow-[0_0_6px_var(--blue-color)] focus:border-(--blue-color) [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden
              border-(--back-color)
             hover:shadow-[0_0_6px_rgb(0_0_0_/0.25)]`)}
      style="background: color-mix(in srgb, var(--back-color), var(--back-color) 70%);"
      id={`${id}-${crypto.randomUUID().slice(0, 6)}`}
      type="number"
      min={settings.number?.minNum}
      max={settings.number?.maxNum}
      step={settings.number?.step}
    />
    <button
      class="flex size-8 items-center justify-center rounded-full transition-colors duration-150 hover:bg-(--gray-color)/30 active:bg-(--gray-color)/10 text-2xl"
      onclick={() => {
        if ((settings.number?.maxNum !== 0 && !settings.number?.maxNum) || !settings.number?.step || (value !== 0 && !value)) return
        if (Number(value) + settings.number?.step >= settings.number?.maxNum) {
          value = settings.number?.maxNum
          onUpdate(value as number)
          return
        } else if (settings.number?.minNum && Number(value) < settings.number?.minNum) {
          value = settings.number?.minNum
          return
        }
        value = Number(value) + (settings.number?.step ?? 1)
        onUpdate(value as number)
      }}
      aria-label="Увеличить">+</button
    >
  </div>

  <!-- Switch -->
  <div class="flex w-full flex-wrap items-end justify-around gap-5">
    <div class="bg-blue flex flex-col">
      <div class="relative flex w-full grow items-center justify-center bg-transparent">
        {#if settings.toggle?.captionLeft}
          <button class="mr-2 cursor-pointer" style="width: {maxCaptionWidth}; text-align: end;" onclick={() => handleCaptionClick(0)}
            >{settings.toggle?.captionLeft}</button
          >
        {/if}

        <label class="relative flex items-center justify-between rounded-full shadow-sm transition duration-200 border-(--bg-color) hover:shadow-md">
          <input
            id={`${id}-${crypto.randomUUID().slice(0, 6)}`}
            type="checkbox"
            class="absolute left-1/2 h-full w-full -translate-x-1/2 cursor-pointer appearance-none rounded-md"
            checked={value !== 0}
            onchange={() => handleToggle()}
          />
          <span
            class="relative flex items-center rounded-full border-(--bg-color) transition-all duration-250
        {value ? 'bg-(--bg-color)' : 'bg-(--back-color)'}
       cursor-pointer"
            style="width: {`calc(2rem * 2)`}; height: 2rem;"
          >
            <span
              class="absolute rounded-full transition-all duration-250
                  {value ? 'bg-(--back-color)' : 'bg-(--bg-color)'}
          cursor-pointer'}"
              style="width: {`calc(2rem * 0.8)`}; height: {`calc(2rem * 0.8)`}; margin: 0 {`calc(2rem * 0.1)`}; transform: {value
                ? `translateX(calc(2rem))`
                : 'translateX(0)'}"
            ></span>
          </span>
        </label>

        {#if settings.toggle?.captionRight}
          <button class="ml-2 cursor-pointer" style="width: {maxCaptionWidth}; text-align: start;" onclick={() => handleCaptionClick(1)}
            >{settings.toggle?.captionRight}</button
          >
        {/if}
      </div>
    </div>
  </div>
</div>
