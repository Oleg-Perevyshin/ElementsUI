<script lang="ts">
  import type { IWidgetProps } from "../types"
  import { twMerge } from "tailwind-merge"

  let {
    id = crypto.randomUUID(),
    wrapperClass,
    label = { name: "", class: "" },
    readonly = false,
    settings = { label: "", number: { minNum: 0, maxNum: 1000, step: 1 } },
    value = 0,
    icons = { array: [], cycling: true },
    onUpdate = () => {},
  }: IWidgetProps = $props()

  let currentIndex = $state(0)
  let intervalId: number | null = null

  let currentValue = $derived(value)

  const minNumber = $derived(settings.number?.minNum ?? 0 + 1)
  const maxNumber = $derived(settings.number?.maxNum ?? 0)

  $effect(() => {
    if (value === undefined || value === null) value = settings.number?.minNum ?? 0
  })

  $effect(() => {
    if (icons.array && icons?.cycling) {
      if (intervalId !== null) {
        clearInterval(intervalId)
        intervalId = null
      }

      const mappedValue = mapToStep(settings.type == "switch" && currentValue ? (maxNumber - minNumber) / 2 : currentValue)
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
    if (icons.array && !icons?.cycling && settings.type !== "switch") currentIndex = mapToStep(currentValue)
  })

  $effect(() => {
    if (icons.array && !icons?.cycling && settings.type == "switch") currentIndex = currentValue == 0 ? 0 : icons.array.length - 1
  })

  const mapToStep = (inputValue: number): number => {
    if (currentValue > maxNumber) inputValue = maxNumber
    if (currentValue < minNumber) inputValue = minNumber
    const clampedValue = Math.min(Math.max(inputValue, minNumber), maxNumber)

    const inputRange = maxNumber - minNumber

    if (inputRange === 0) return 0
    if (inputValue === maxNumber) return icons.array.length - 1

    let stepIndex = icons?.cycling
      ? Math.ceil((clampedValue - minNumber) / (inputRange / 10))
      : Math.ceil((clampedValue - minNumber) / (inputRange / (icons.array.length - 2)))
    stepIndex = Math.min(Math.max(stepIndex, 0), 10)

    return stepIndex
  }

  const currentImage = $derived(icons ? icons.array[currentIndex] : "")

  const handleCaptionClick = (newValue: number) => {
    if (currentValue === newValue) return
    currentValue = newValue
    onUpdate(newValue)
  }

  const maxCaptionWidth = $derived(
    Math.max(settings.switch?.captionLeft?.length ?? 0, settings.switch?.captionRight?.length ?? 0) > 0
      ? `${Math.max(settings.switch?.captionLeft?.length ?? 0, settings.switch?.captionRight?.length ?? 0)}ch`
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

<div id={`${id}-${crypto.randomUUID().slice(0, 6)}`} class={twMerge("w-full h-full p-1", wrapperClass)}>
  <div
    class={`h-full grid grid-rows-[4fr_9fr_5fr] rounded-xl bg-(--container-color)
     transition-shadow duration-250 p-1
     shadow-[0_0_3px_rgb(0_0_0_/0.25)] hover:shadow-[0_0_6px_rgb(0_0_0_/0.25)]`}
  >
    <div class="grid gap-2 overflow-hidden items-center" style="grid-template-columns:{icons.array && icons.array.length !== 0 ? '3.5rem' : ''} 1fr;">
      {#if icons.array && icons.array.length !== 0}
        <div class="size-14 p-0.5 [&_svg]:h-full [&_svg]:max-h-full [&_svg]:w-full [&_svg]:max-w-full {icons.class}">
          {@html currentImage}
        </div>
      {/if}

      <span class="text-left text-3xl overflow-hidden font-semibold {label.class}">{label.name}</span>
    </div>

    <div class="flex mx-3 gap-1 items-center justify-center inset-shadow-[0_-10px_10px_-15px_rgb(0_0_0_/0.5)]">
      {#if settings.type == "input" || settings.type == "slider"}
        <div>
          <span class="text-7xl">{currentValue}</span>
          <span class="text-5xl">{settings.number?.units}</span>
        </div>
      {:else}
        <span class="text-5xl">{currentValue === 0 ? (settings.switch?.captionLeft ?? "Off") : (settings.switch?.captionRight ?? "On")}</span>
      {/if}
    </div>
    <div class="flex flex-col items-center justify-center px-2">
      {#if settings.label}
        <h5>{settings.label}</h5>
      {/if}
      {#if settings.type == "input"}
        <!-- Input -->
        <div class={twMerge(`flex p-2 gap-2 bg-blue`, settings.class)}>
          {#if !readonly}
            <button
              class="flex size-8 items-center justify-center shadow-sm hover:shadow-md rounded-full transition duration-200 bg-(--bg-color) active:scale-97 text-2xl"
              onclick={() => {
                if ((settings.number?.minNum !== 0 && !settings.number?.minNum) || !settings.number?.step || (currentValue !== 0 && !currentValue)) return
                if (Number(currentValue) - settings.number?.step <= settings.number?.minNum) {
                  currentValue = settings.number?.minNum
                  onUpdate(currentValue as number)
                  return
                } else if (settings.number?.maxNum && Number(currentValue) > settings.number?.maxNum) {
                  currentValue = settings.number?.maxNum
                  return
                }
                currentValue = Number(currentValue) - (settings.number?.step ?? 1)
                onUpdate(currentValue as number)
              }}
              aria-label="Уменьшить">−</button
            >
          {/if}
          <input
            bind:value={currentValue}
            class={twMerge(`flex-1 w-full rounded-2xl border px-8 py-1 text-center shadow-[0_0_3px_rgb(0_0_0_/0.25)] transition duration-200
              outline-none focus:shadow-[0_0_6px_var(--bg-color)] focus:border-(--bg-color) [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden
              border-(--back-color)
             hover:shadow-[0_0_6px_rgb(0_0_0_/0.25)]`)}
            style="background: color-mix(in srgb, var(--back-color), var(--back-color) 70%);"
            id={`${id}-${crypto.randomUUID().slice(0, 6)}`}
            type="number"
            {readonly}
            min={settings.number?.minNum}
            max={settings.number?.maxNum}
            step={settings.number?.step}
          />
          {#if !readonly}
            <button
              class="flex size-8 items-center justify-center rounded-full shadow-sm hover:shadow-md transition duration-200 bg-(--bg-color) active:scale-97 text-2xl"
              onclick={() => {
                if ((settings.number?.maxNum !== 0 && !settings.number?.maxNum) || !settings.number?.step || (currentValue !== 0 && !currentValue)) return
                if (Number(currentValue) + settings.number?.step >= settings.number?.maxNum) {
                  currentValue = settings.number?.maxNum
                  onUpdate(currentValue as number)
                  return
                } else if (settings.number?.minNum && Number(currentValue) < settings.number?.minNum) {
                  currentValue = settings.number?.minNum
                  return
                }
                currentValue = Number(currentValue) + (settings.number?.step ?? 1)
                onUpdate(currentValue as number)
              }}
              aria-label="Увеличить">+</button
            >
          {/if}
        </div>
      {:else if settings.type == "switch"}
        <!-- Switch -->
        <div class={twMerge(`flex bg-blue p-2 w-full flex-wrap items-end justify-center gap-1`, settings.class)}>
          {#if settings.switch?.captionLeft}
            <button class="mr-2 cursor-pointer" style="width: {maxCaptionWidth}; text-align: end;" onclick={() => handleCaptionClick(0)}
              >{settings.switch?.captionLeft}</button
            >
          {/if}

          <label class="relative flex items-center justify-between rounded-full shadow-sm transition duration-200 border-(--bg-color) hover:shadow-md">
            <input
              id={`${id}-${crypto.randomUUID().slice(0, 6)}`}
              type="checkbox"
              class="absolute left-1/2 h-full w-full -translate-x-1/2 cursor-pointer appearance-none rounded-md"
              disabled={readonly}
              checked={currentValue !== 0}
              onchange={() => {
                currentValue = currentValue === 0 ? 1 : 0
                onUpdate(currentValue)
              }}
            />
            <span
              class="relative flex items-center rounded-full border-(--bg-color) transition-all duration-250
        {currentValue ? 'bg-(--bg-color)' : 'bg-(--back-color)'}
       cursor-pointer"
              style="width: {`calc(2rem * 2)`}; height: 2rem;"
            >
              <span
                class="absolute rounded-full transition-all duration-250
                  {currentValue ? 'bg-(--back-color)' : 'bg-(--bg-color)'}
          cursor-pointer'}"
                style="width: {`calc(2rem * 0.8)`}; height: {`calc(2rem * 0.8)`}; margin: 0 {`calc(2rem * 0.1)`}; transform: {currentValue
                  ? `translateX(calc(2rem))`
                  : 'translateX(0)'}"
              ></span>
            </span>
          </label>

          {#if settings.switch?.captionRight}
            <button class="ml-2 cursor-pointer" style="width: {maxCaptionWidth}; text-align: start;" onclick={() => handleCaptionClick(1)}
              >{settings.switch?.captionRight}</button
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
            disabled={readonly}
            bind:value={currentValue}
            oninput={() => onUpdate(currentValue)}
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
                currentValue = roundToClean(
                  Math.max(settings.number?.minNum ?? 0, Math.min(currentValue - (settings.number?.step ?? 1), settings.number?.maxNum ?? 10)),
                )
                onUpdate(currentValue)
              }}
              disabled={currentValue <= (settings.number?.minNum ?? 0)}>−</button
            >
            <span class="inline-block text-center tabular-nums" style={`width: ${String(settings.number?.maxNum ?? 10).length + 1}ch`}>
              {currentValue}
            </span>
            <button
              class="h-full w-4 cursor-pointer"
              onclick={() => {
                currentValue = roundToClean(
                  Math.max(settings.number?.minNum ?? 0, Math.min(currentValue + (settings.number?.step ?? 1), settings.number?.maxNum ?? 10)),
                )
                onUpdate(currentValue)
              }}
              disabled={currentValue >= (settings.number?.maxNum ?? 10)}>+</button
            >
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>
