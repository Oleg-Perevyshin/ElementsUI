<!-- $lib/Widget/Widget.svelte - карточка значения: шапка фиксированной высоты и гибкое тело, кнопки +/- 32px, дорожка слайдера 6px. onUpdate - принятое значение, onInput - слайдер во время перетаскивания -->
<script lang="ts">
  import { roundToClean } from "../number"
  import { sanitizeHtml } from "../html"
  import { T } from "../locales/i18n"
  import type { IWidgetProps } from "../types"
  import { twMerge } from "tailwind-merge"
  import { accentStyle } from "../accent"

  let {
    wrapperClass,
    accent,
    label = { name: "", class: "" },
    readonly = false,
    settings = { label: "", number: { minNum: 0, maxNum: 1000, step: 1 } },
    value = $bindable(),
    icons = { array: [], cycling: true },
    onUpdate,
    onInput,
  }: IWidgetProps = $props()

  const minNumber = $derived(settings.number?.minNum ?? 0)
  const maxNumber = $derived(settings.number?.maxNum ?? 0)
  const step = $derived(settings.number?.step ?? 1)

  /* Текущее значение: от пропа, после действия пользователя - локальное до следующего значения снаружи */
  let current = $derived(value ?? minNumber)
  const clamp = (v: number) => roundToClean(Math.min(Math.max(v, minNumber), maxNumber))
  const commit = (next: number) => {
    current = next
    value = next
    onUpdate?.(next)
  }
  const handleCaptionClick = (next: number) => {
    if (!readonly && current !== next) commit(next)
  }

  /* Номер картинки по значению: 0..10 для анимации, иначе по числу картинок */
  const mapToStep = (input: number): number => {
    const range = maxNumber - minNumber
    if (range === 0) return 0
    const clamped = Math.min(Math.max(input, minNumber), maxNumber)
    if (!icons.cycling && clamped === maxNumber) return icons.array.length - 1
    const index = Math.ceil((clamped - minNumber) / (range / (icons.cycling ? 10 : icons.array.length - 2)))
    return Math.min(Math.max(index, 0), 10)
  }

  /* Анимация: смена картинок с периодом от значения; без анимации картинка выбирается по значению */
  let frame = $state(0)
  $effect(() => {
    if (!icons.cycling || !icons.array?.length) return
    const speed = mapToStep(settings.type == "switch" && current ? (maxNumber - minNumber) / 2 : current)
    if (!speed) return
    const timer = window.setInterval(() => (frame = (frame + 1) % icons.array.length), 700 / speed)
    return () => clearInterval(timer)
  })
  const iconIndex = $derived(icons.cycling ? frame : settings.type == "switch" ? (current ? icons.array.length - 1 : 0) : mapToStep(current))

  const captionChars = $derived(Math.max(settings.switch?.captionLeft?.length ?? 0, settings.switch?.captionRight?.length ?? 0))
  const maxCaptionWidth = $derived(captionChars ? `${captionChars}ch` : "auto")
  const pct = $derived(Math.max(0, Math.min(100, ((current - minNumber) / (Math.abs(maxNumber - minNumber) || 1)) * 100)))

  const stepBtn = `flex size-8 shrink-0 items-center justify-center rounded-lg border border-(--border-color)
    bg-(--back-color) text-[16px] leading-none text-(--muted-color) transition-colors duration-150
    hover:bg-(--container-color) hover:text-(--font-color) active:scale-[0.97]
    disabled:cursor-not-allowed disabled:opacity-40`

  /* mt-[7px] у webkit-thumb: без него Chrome/Safari прижимают thumb к верху трека после appearance:none */
  const THUMB = `w-full appearance-none bg-transparent h-8
    [&::-webkit-slider-runnable-track]:h-8 [&::-webkit-slider-runnable-track]:bg-transparent
    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-[18px] [&::-webkit-slider-thumb]:mt-[7px]
    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
    [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-(--accent-color)
    [&::-webkit-slider-thumb]:shadow-[0_1px_4px_rgb(16_24_40/0.35)]
    [&::-moz-range-track]:h-8 [&::-moz-range-track]:bg-transparent [&::-moz-range-track]:border-0
    [&::-moz-range-thumb]:size-[18px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white
    [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-(--accent-color)
    [&::-moz-range-thumb]:shadow-[0_1px_4px_rgb(16_24_40/0.35)]
    focus-visible:outline-none`
</script>

{#snippet caption(text: string | undefined, next: number, align: "end" | "start")}
  {#if text}
    <button
      class="text-[13px] font-medium {readonly ? 'cursor-not-allowed' : 'cursor-pointer'} {(current !== 0) === (next === 1)
        ? 'text-(--font-color)'
        : 'text-(--muted-color)'}"
      style="width: {maxCaptionWidth}; text-align: {align};"
      disabled={readonly}
      onclick={() => handleCaptionClick(next)}>{text}</button
    >
  {/if}
{/snippet}

{#snippet stepButton(direction: 1 | -1)}
  <button
    class={stepBtn}
    onclick={() => commit(clamp(current + direction * step))}
    disabled={readonly || (direction === 1 ? current >= maxNumber : current <= minNumber)}
    aria-label={direction === 1 ? $T("ui.increase") : $T("ui.decrease")}>{direction === 1 ? "+" : "−"}</button
  >
{/snippet}

<div class={twMerge("h-full w-full", wrapperClass)} style={accentStyle(accent)}>
  <div class="flex h-full flex-col overflow-hidden rounded-[14px] border border-(--hairline-color) bg-(--back-color)">
    <!-- Шапка: иконка + название, фиксированная высота -->
    <div class="flex h-11 shrink-0 items-center gap-2.5 border-b border-(--hairline-color) px-3.5">
      {#if icons.array?.length}
        <div class="size-5 shrink-0 {accent ? 'text-(--accent-text)' : 'text-(--muted-color)'} [&_svg]:h-full [&_svg]:w-full">
          {@html sanitizeHtml(icons.array[iconIndex] ?? "")}
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
        <span class="text-[34px] leading-none font-[650] tracking-[-0.02em] tabular-nums">{current}</span>
      {:else}
        <span class="text-[28px] leading-none font-[650] tracking-[-0.015em]">
          {current === 0 ? (settings.switch?.captionLeft ?? "Off") : (settings.switch?.captionRight ?? "On")}
        </span>
      {/if}
    </div>

    <!-- Управление -->
    <div class="flex shrink-0 flex-col items-stretch gap-2 border-t border-(--hairline-color) bg-(--container-color) px-3.5 py-3">
      {#if settings.label}
        <span class="text-[11px] font-bold tracking-[0.06em] text-(--faint-color) uppercase">{settings.label}</span>
      {/if}

      {#if settings.type == "input"}
        <div class="flex items-center gap-2">
          {#if !readonly}{@render stepButton(-1)}{/if}
          <input
            value={current}
            class="h-8 w-full min-w-0 flex-1 rounded-[10px] border border-(--border-color) bg-(--field-color) px-3 text-center text-[14px] tabular-nums
              transition-[border-color,box-shadow] duration-150 outline-none
              focus:border-(--accent-text) focus:shadow-(--focus-shadow-color)
              [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden"
            type="number"
            aria-label={label.name}
            {readonly}
            min={minNumber}
            max={maxNumber}
            {step}
            onchange={(event) => {
              /* Ручной ввод по Enter или уходу из поля: число зажимается в пределы, не число - возвращается прежнее значение */
              const raw = event.currentTarget.value
              if (raw.trim() === "" || !Number.isFinite(Number(raw))) event.currentTarget.value = String(current)
              else commit(clamp(Number(raw)))
            }}
          />
          {#if !readonly}{@render stepButton(1)}{/if}
        </div>
      {:else if settings.type == "switch"}
        <div class="flex w-full items-center justify-center gap-2.5 {readonly ? 'opacity-45' : ''}">
          {@render caption(settings.switch?.captionLeft, 0, "end")}
          <label class="relative flex items-center {readonly ? 'cursor-not-allowed' : ''}">
            <input
              type="checkbox"
              class="absolute left-1/2 h-full w-full -translate-x-1/2 appearance-none rounded-full {readonly ? 'cursor-not-allowed' : 'cursor-pointer'}"
              aria-label={label.name}
              disabled={readonly}
              checked={current !== 0}
              onchange={() => commit(current === 0 ? 1 : 0)}
            />
            <span
              class="relative flex h-[26px] w-[44px] items-center rounded-full transition-colors duration-200
                {current ? 'bg-(--accent-color)' : 'bg-(--border-color)'} {readonly ? 'cursor-not-allowed' : 'cursor-pointer'}"
            >
              <span
                class="absolute size-[22px] rounded-full bg-white shadow-[0_1px_3px_rgb(16_24_40/0.28)] transition-transform duration-200"
                style="margin: 0 2px; transform: translateX({current ? '18px' : '0'});"
              ></span>
            </span>
          </label>
          {@render caption(settings.switch?.captionRight, 1, "start")}
        </div>
      {:else if settings.type == "slider"}
        <div class="flex w-full items-center gap-2 {readonly ? 'opacity-45' : ''}">
          {@render stepButton(-1)}
          <div class="relative flex h-8 min-w-0 flex-1 items-center">
            <div class="pointer-events-none absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-(--back-color)"></div>
            <div class="pointer-events-none absolute top-1/2 left-0 h-1.5 -translate-y-1/2 rounded-full bg-(--accent-color)" style="width: {pct}%;"></div>
            <input
              type="range"
              min={minNumber}
              max={maxNumber}
              {step}
              disabled={readonly}
              value={current}
              aria-label={label.name}
              oninput={(event) => {
                current = Number(event.currentTarget.value)
                onInput?.(current)
              }}
              onchange={() => commit(current)}
              class={twMerge(THUMB, "relative", readonly ? "[&::-webkit-slider-thumb]:cursor-not-allowed" : "[&::-webkit-slider-thumb]:cursor-pointer")}
            />
          </div>
          {@render stepButton(1)}
        </div>
      {/if}
    </div>
  </div>
</div>
