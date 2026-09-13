<!-- $lib/Widget/Widget.svelte — шапка фиксированной высоты + гибкое тело
     вместо жёсткой сетки grid-rows-[4fr_9fr_5fr]. Кнопки ± квадратные 32px,
     дорожка слайдера 4px. Вся логика (mapToStep, циклирование иконок,
     $effect, onUpdate) не тронута. -->
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
        if (intervalId !== null) clearInterval(intervalId)
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
    if (!icons?.cycling && inputValue === maxNumber) return icons.array.length - 1

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
    return Number(num.toFixed(2))
  }

  const pct = $derived(() => {
    const lo = settings.number?.minNum ?? 0
    const hi = settings.number?.maxNum ?? 10
    const span = Math.abs(hi - lo) || 1
    return Math.max(0, Math.min(100, ((Number(currentValue) - lo) / span) * 100))
  })

  const stepBtn = `flex size-8 shrink-0 items-center justify-center rounded-lg border border-(--border-color)
    bg-(--back-color) text-[16px] leading-none text-(--muted-color) transition-colors duration-150
    hover:bg-(--container-color) hover:text-(--font-color) active:scale-[0.97]
    disabled:cursor-not-allowed disabled:opacity-40`

  /* mt-[7px] у webkit-thumb: без него Chrome/Safari прижимают thumb к верху трека
     после appearance:none — см. подробный комментарий в Slider.svelte */
  const THUMB = `w-full appearance-none bg-transparent h-8
    [&::-webkit-slider-runnable-track]:h-8 [&::-webkit-slider-runnable-track]:bg-transparent
    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-[18px] [&::-webkit-slider-thumb]:mt-[7px]
    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
    [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-(--bg-color,var(--accent-color))
    [&::-webkit-slider-thumb]:shadow-[0_1px_4px_rgb(16_24_40/0.35)]
    [&::-moz-range-track]:h-8 [&::-moz-range-track]:bg-transparent [&::-moz-range-track]:border-0
    [&::-moz-range-thumb]:size-[18px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white
    [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-(--bg-color,var(--accent-color))
    [&::-moz-range-thumb]:shadow-[0_1px_4px_rgb(16_24_40/0.35)]
    focus-visible:outline-none`
</script>

<div id={`${id}-${crypto.randomUUID().slice(0, 6)}`} class={twMerge("h-full w-full", wrapperClass)}>
  <div class="flex h-full flex-col overflow-hidden rounded-[14px] border border-(--hairline-color) bg-(--back-color)">
    <!-- Шапка: иконка + название, фиксированная высота -->
    <div class="flex h-11 shrink-0 items-center gap-2.5 border-b border-(--hairline-color) px-3.5">
      {#if icons.array && icons.array.length !== 0}
        <div class="size-5 shrink-0 text-(--muted-color) [&_svg]:h-full [&_svg]:w-full {icons.class}">
          {@html currentImage}
        </div>
      {/if}
      <span class="min-w-0 flex-1 truncate text-left text-[13px] font-semibold {label.class}">{label.name}</span>
      {#if settings.number?.units}
        <span class="shrink-0 text-[11px] font-semibold text-(--faint-color)">{settings.number?.units}</span>
      {/if}
    </div>

    <!-- Значение: занимает всё свободное место -->
    <div class="flex flex-1 items-center justify-center px-3.5 py-4">
      {#if settings.type == "input" || settings.type == "slider"}
        <span class="text-[34px] leading-none font-[650] tracking-[-0.02em] tabular-nums">{currentValue}</span>
      {:else}
        <span class="text-[28px] leading-none font-[650] tracking-[-0.015em]">
          {currentValue === 0 ? (settings.switch?.captionLeft ?? "Off") : (settings.switch?.captionRight ?? "On")}
        </span>
      {/if}
    </div>

    <!-- Управление -->
    <div class="flex shrink-0 flex-col items-stretch gap-2 border-t border-(--hairline-color) bg-(--container-color) px-3.5 py-3">
      {#if settings.label}
        <span class="text-[11px] font-bold tracking-[0.06em] text-(--faint-color) uppercase">{settings.label}</span>
      {/if}

      {#if settings.type == "input"}
        <div class={twMerge(`flex items-center gap-2`, settings.class)}>
          {#if !readonly}
            <button
              class={stepBtn}
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
            class="h-8 w-full min-w-0 flex-1 rounded-[10px] border border-(--border-color) bg-(--field-color) px-3 text-center text-[14px] tabular-nums
              transition-[border-color,box-shadow] duration-150 outline-none
              focus:border-(--accent-color) focus:shadow-(--focus-shadow-color)
              [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden"
            id={`${id}-${crypto.randomUUID().slice(0, 6)}`}
            type="number"
            {readonly}
            min={settings.number?.minNum}
            max={settings.number?.maxNum}
            step={settings.number?.step}
          />
          {#if !readonly}
            <button
              class={stepBtn}
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
        <div class={twMerge(`flex w-full items-center justify-center gap-2.5 ${readonly ? "opacity-45" : ""}`, settings.class)}>
          {#if settings.switch?.captionLeft}
            <button
              class="text-[13px] font-medium {readonly ? 'cursor-not-allowed' : 'cursor-pointer'} {currentValue
                ? 'text-(--muted-color)'
                : 'text-(--font-color)'}"
              style="width: {maxCaptionWidth}; text-align: end;"
              onclick={() => handleCaptionClick(0)}>{settings.switch?.captionLeft}</button
            >
          {/if}

          <label class="relative flex items-center {readonly ? 'cursor-not-allowed' : ''}">
            <input
              id={`${id}-${crypto.randomUUID().slice(0, 6)}`}
              type="checkbox"
              class="absolute left-1/2 h-full w-full -translate-x-1/2 appearance-none rounded-full {readonly ? 'cursor-not-allowed' : 'cursor-pointer'}"
              disabled={readonly}
              checked={currentValue !== 0}
              onchange={() => {
                currentValue = currentValue === 0 ? 1 : 0
                onUpdate(currentValue)
              }}
            />
            <span
              class="relative flex h-[26px] w-[44px] items-center rounded-full transition-colors duration-200
                {currentValue ? 'bg-(--bg-color,var(--accent-color))' : 'bg-(--border-color)'}
                {readonly ? 'cursor-not-allowed' : 'cursor-pointer'}"
            >
              <span
                class="absolute size-[22px] rounded-full bg-white shadow-[0_1px_3px_rgb(16_24_40/0.28)] transition-transform duration-200"
                style="margin: 0 2px; transform: translateX({currentValue ? '18px' : '0'});"
              ></span>
            </span>
          </label>

          {#if settings.switch?.captionRight}
            <button
              class="text-[13px] font-medium {readonly ? 'cursor-not-allowed' : 'cursor-pointer'} {currentValue
                ? 'text-(--font-color)'
                : 'text-(--muted-color)'}"
              style="width: {maxCaptionWidth}; text-align: start;"
              onclick={() => handleCaptionClick(1)}>{settings.switch?.captionRight}</button
            >
          {/if}
        </div>
      {:else if settings.type == "slider"}
        <div class={twMerge(`flex w-full items-center gap-2 ${readonly ? "opacity-45" : ""}`, settings.class)}>
          <button
            class={stepBtn}
            onclick={() => {
              currentValue = roundToClean(
                Math.max(settings.number?.minNum ?? 0, Math.min(currentValue - (settings.number?.step ?? 1), settings.number?.maxNum ?? 10)),
              )
              onUpdate(currentValue)
            }}
            disabled={readonly || currentValue <= (settings.number?.minNum ?? 0)}
            aria-label="Уменьшить">−</button
          >

          <div class="relative flex h-8 min-w-0 flex-1 items-center">
            <div class="pointer-events-none absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-(--back-color)"></div>
            <div
              class="pointer-events-none absolute top-1/2 left-0 h-1.5 -translate-y-1/2 rounded-full bg-(--bg-color,var(--accent-color))"
              style="width: {pct()}%;"
            ></div>
            <input
              type="range"
              min={settings.number?.minNum}
              max={settings.number?.maxNum}
              step={settings.number?.step}
              disabled={readonly}
              bind:value={currentValue}
              oninput={() => onUpdate(currentValue)}
              class={twMerge(THUMB, "relative", readonly ? "[&::-webkit-slider-thumb]:cursor-not-allowed" : "[&::-webkit-slider-thumb]:cursor-pointer")}
            />
          </div>

          <button
            class={stepBtn}
            onclick={() => {
              currentValue = roundToClean(
                Math.max(settings.number?.minNum ?? 0, Math.min(currentValue + (settings.number?.step ?? 1), settings.number?.maxNum ?? 10)),
              )
              onUpdate(currentValue)
            }}
            disabled={readonly || currentValue >= (settings.number?.maxNum ?? 10)}
            aria-label="Увеличить">+</button
          >
        </div>
      {/if}
    </div>
  </div>
</div>
