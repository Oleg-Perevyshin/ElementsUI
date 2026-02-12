<script lang="ts">
  import type { IWidgetProps } from "../types"
  import { twMerge } from "tailwind-merge"

  let {
    id = crypto.randomUUID(),
    label = { name: "", class: "" },
    settings = { label: "", number: { minNum: 0, maxNum: 1000, step: 1 } },
    value = $bindable(8),
    icons = { array: [], mode: "cycling" },
    onUpdate = () => {},
  }: IWidgetProps = $props()

  let currentIndex = $state(0)
  let intervalId: number | null = null

  $effect(() => {
    if (icons?.mode == "cycling") {
      if (intervalId !== null) {
        clearInterval(intervalId)
        intervalId = null
      }

      const mappedValue = mapToStep(value)
      const periodInMs = mappedValue === 0 ? 0 : 700 / mappedValue

      if (icons && periodInMs > 0) {
        intervalId = window.setInterval(() => {
          currentIndex = (currentIndex + 1) % icons.array.length
        }, periodInMs)
      }

      return () => {
        if (intervalId !== null) {
          clearInterval(intervalId)
        }
      }
    }
  })

  $effect(() => {
    if (icons?.mode == "switch") {
      currentIndex = value == 0 ? 0 : icons.array.length - 1
    }
  })

  const mapToStep = (inputValue: number): number => {
    const minNumber = settings.number?.minNum ?? 0
    const maxNumber = settings.number?.maxNum ?? 10
    if (value > maxNumber) inputValue = maxNumber
    if (value < minNumber) inputValue = minNumber
    const clampedValue = Math.min(Math.max(inputValue, minNumber), maxNumber)

    const inputRange = maxNumber - minNumber

    if (inputRange === 0) {
      return 0
    }

    let stepIndex = Math.ceil((clampedValue - minNumber) / (inputRange / 10))
    stepIndex = Math.min(Math.max(stepIndex, 0), 10)

    const result = 0 + stepIndex
    console.log(result)

    return result
  }

  const currentImage = $derived(icons ? icons.array[currentIndex] : "")

  const handleCaptionClick = (newValue: number) => {
    if (value === newValue) return
    value = newValue
    onUpdate(newValue)
  }

  const maxCaptionWidth = $derived(
    Math.max(settings.toggle?.captionLeft?.length ?? 0, settings.toggle?.captionRight?.length ?? 0) > 0
      ? `${Math.max(settings.toggle?.captionLeft?.length ?? 0, settings.toggle?.captionRight?.length ?? 0)}ch`
      : "auto",
  )

  const roundToClean = (num: number): number => {
    if (Number.isInteger(num)) return num

    const rounded1 = Number(num.toFixed(1))
    if (Math.abs(rounded1 - num) < 1e-10) return rounded1

    const rounded2 = Number(num.toFixed(2))
    if (Math.abs(rounded2 - num) < 1e-10) return rounded2

    return rounded2
  }
</script>

<div
  id={`${id}-${crypto.randomUUID().slice(0, 6)}`}
  class={`w-full h-full mt-1 rounded-xl bg-(--container-color)
     transition-shadow duration-250
     shadow-[0_0_3px_rgb(0_0_0_/0.25)] hover:shadow-[0_0_6px_rgb(0_0_0_/0.25)]`}
>
  <div class="flex flex-col w-full h-[70%] inset-shadow-[0_-10px_10px_-15px_rgb(0_0_0_/0.5)] p-2">
    <div class="grid gap-2 overflow-hidden items-center" style="grid-template-columns: 3.5rem 1fr;">
      <div class="size-14 p-0.5 [&_svg]:h-full [&_svg]:max-h-full [&_svg]:w-full [&_svg]:max-w-full">
        {@html currentImage}
      </div>
      <h1 class="text-left break-all {label.class}">{label.name}</h1>
    </div>

    <div class="text-5xl flex-1 flex items-center justify-center">
      {#if settings.type == "input" || settings.type == "slider"}
        {value} {settings.number?.units}
      {:else}
        {value === 0 ? (settings.toggle?.captionLeft ?? "Off") : (settings.toggle?.captionRight ?? "On")}
      {/if}
    </div>
  </div>
  {#if settings.label}
    <h5>{settings.label}</h5>
  {/if}
  {#if settings.type == "input"}
    <!-- Input -->
    <div class={twMerge(`flex p-2 gap-2`, settings.class)}>
      <button
        class="flex size-8 items-center justify-center shadow-sm hover:shadow-md rounded-full transition duration-200 bg-(--bg-color) active:scale-97 text-2xl"
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
              outline-none focus:shadow-[0_0_6px_var(--bg-color)] focus:border-(--bg-color) [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden
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
        class="flex size-8 items-center justify-center rounded-full shadow-sm hover:shadow-md transition duration-200 bg-(--bg-color) active:scale-97 text-2xl"
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
  {:else if settings.type == "toggle"}
    <!-- Switch -->
    <div class={twMerge(`flex bg-blue p-2 w-full flex-wrap items-end justify-center gap-1`, settings.class)}>
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
          onchange={() => {
            value = value === 0 ? 1 : 0
            onUpdate(value)
          }}
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
  {:else if settings.type == "slider"}
    {@const userAgent = navigator.userAgent}
    <!-- Cлайдер -->
    <div class={twMerge(`flex flex-col items-center w-full bg-blue px-2 gap-1`, settings.class)}>
      <input
        type="range"
        min={settings.number?.minNum}
        max={settings.number?.maxNum}
        step={settings.number?.step}
        bind:value
        oninput={() => onUpdate(value)}
        class={twMerge(
          `h-8 w-full appearance-none overflow-hidden rounded-full accent-(--back-color) 
              [&::-webkit-slider-runnable-track]:rounded-full
              [&::-webkit-slider-runnable-track]:bg-(--gray-color)
              [&::-webkit-slider-runnable-track]:shadow-sm
              [&::-webkit-slider-thumb]:relative 

              [&::-webkit-slider-thumb]:ml-[-0.4rem] 
              [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:shadow-[var(--focus-shadow),]
            ${
              userAgent.includes("iOS") || userAgent.includes("iPhone") || userAgent.includes("iPad")
                ? "pl-3.5 [&::-webkit-slider-thumb]:ring-[6.5px]"
                : "pl-3 [&::-webkit-slider-thumb]:ring-[5px]"
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
        style="color: var(--bg-color);"
      />
      <div
        class="flex w-20 items-center justify-center gap-2 rounded-full px-2 transition duration-250 shadow-sm hover:shadow-md"
        style="background-color: var(--bg-color) "
      >
        <button
          class="h-full w-4 cursor-pointer"
          onclick={() => {
            value = roundToClean(Math.max(settings.number?.minNum ?? 0, Math.min(value - (settings.number?.step ?? 1), settings.number?.maxNum ?? 10)))
            onUpdate(value)
          }}
          disabled={value <= (settings.number?.minNum ?? 0)}>−</button
        >
        <span class="inline-block text-center tabular-nums" style={`width: ${String(settings.number?.maxNum ?? 10).length + 1}ch`}>
          {value}
        </span>
        <button
          class="h-full w-4 cursor-pointer"
          onclick={() => {
            value = roundToClean(Math.max(settings.number?.minNum ?? 0, Math.min(value + (settings.number?.step ?? 1), settings.number?.maxNum ?? 10)))
            onUpdate(value)
          }}
          disabled={value >= (settings.number?.maxNum ?? 10)}>+</button
        >
      </div>
    </div>
  {/if}
</div>
