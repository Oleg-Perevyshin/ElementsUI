<!-- $lib/Slider/Slider.svelte — дорожка 4px и ползунок 18px.
     Логика adjustValue/roundToClean/$effect не тронута.

     Диапазонный режим переписан: было два <input> на раздельных долях трека
     (flex-basis), разделённых общей подвижной точкой centerNum. Такая схема
     ломается, как только centerNum пересчитывается на каждое движение любого
     из двух input — браузер может принудительно поджать value соседнего input,
     если его новый min/max обгоняет текущее значение (внешне выглядит как
     "второй ползунок дёрнулся сам"), а pct() для заливки и внутренний расчёт
     позиции thumb в двух РАЗНЫХ диапазонах могли давать на пиксель разное —
     отсюда неровная заливка. Стандартная надёжная схема для двойного слайдера:
     оба <input> на всю ширину трека с ОДИНАКОВЫМ min/max, наложены друг на
     друга; pointer-events выключены на самом input и включены только на его
     ::thumb, поэтому перетаскивать можно только за конкретный бегунок, а не
     проваливаться в другой. Клик по пустой дорожке (не по бегунку) больше не
     телепортирует ближайший ползунок — сознательный компромисс ради надёжности. -->
<script lang="ts">
  import type { ISliderProps } from "../types"
  import { twMerge } from "tailwind-merge"

  let {
    id = crypto.randomUUID(),
    /* Было "bg-blue" — декоративная заливка. Цвет заливки дорожки берётся из --bg-color,
       который задаётся классом bg-* в вызове; без него используется акцент. */
    wrapperClass = "",
    label = { name: "", class: "" },
    type = "single",
    value = 0,
    number = { minNum: 0, maxNum: 10, step: 1 },
    disabled = false,
    onUpdate = () => {},
  }: ISliderProps = $props()

  const isRange = $derived(type === "range" || (Array.isArray(value) && value.length === 2))

  const maxDigits = $derived(String(number.maxNum ?? 10).length)
  const valueWidth = $derived(`${maxDigits + 1}ch`)

  let singleValue = $derived(!isRange && typeof value === "number" ? value : number.minNum)
  let lowerValue = $derived(isRange && Array.isArray(value) ? value[0] : number.minNum)
  let upperValue = $derived(isRange && Array.isArray(value) ? value[1] : number.maxNum)

  /* Позиция значения в процентах — для отрисовки заливки */
  const pct = (v: number) => {
    const span = Math.abs((number.maxNum ?? 10) - (number.minNum ?? 0)) || 1
    return Math.max(0, Math.min(100, ((v - (number.minNum ?? 0)) / span) * 100))
  }

  $effect(() => {
    if (value === undefined || value === null) {
      if (type === "single" && !value) value = number.minNum
      if (type === "range" && !value) value = [number.minNum, number.maxNum]
    }
  })

  const adjustValue = (target: "lower" | "upper" | "single", direction: "increment" | "decrement") => {
    const stepValue = direction === "increment" ? number.step : -number.step
    if (isRange && target !== "single") {
      if (target === "lower") {
        lowerValue = roundToClean(Math.max(number.minNum, Math.min(lowerValue + stepValue, upperValue)))
        lowerValue = roundToClean(lowerValue == upperValue ? upperValue - number.step : lowerValue)
      } else {
        upperValue = roundToClean(Math.min(number.maxNum, Math.max(upperValue + stepValue, lowerValue)))
        upperValue = roundToClean(upperValue == lowerValue ? upperValue + number.step : upperValue)
      }
      onUpdate([lowerValue, upperValue])
    } else {
      singleValue = roundToClean(Math.max(number.minNum, Math.min(singleValue + stepValue, number.maxNum)))
      onUpdate(singleValue)
    }
  }

  $effect(() => {
    if (Array.isArray(value)) {
      lowerValue = roundToClean(value[0])
      upperValue = roundToClean(value[1])
    } else if (typeof value === "number") {
      singleValue = roundToClean(value)
    }
  })

  const roundToClean = (num: number): number => {
    if (Number.isInteger(num)) return num
    const rounded1 = Number(num.toFixed(1))
    if (Math.abs(rounded1 - num) < 1e-10) return rounded1
    return Number(num.toFixed(2))
  }

  /* Единые классы для нативного ползунка: высота input РАВНА высоте thumb (18px) —
     тогда центрирование по вертикали отдаётся обычному flexbox родителя (items-center),
     без ручного margin-top на ::-webkit-slider-thumb. Такой margin-top пришлось бы
     подбирать под конкретную высоту трека, и он даёт разный результат в Chromium и
     Safari/WebKit — при равных высотах input и thumb смещения нет по определению,
     это работает одинаково везде. */
  /* Бегунок: было border-(--hairline-color) (почти прозрачная линия) + мягкая тень —
     на светлом фоне белый кружок буквально сливался с дорожкой. Рамка в 2px цветом
     заливки даёт чёткий, "премиальный" контур вместо почти невидимой линии. */
  const THUMB = `w-full appearance-none bg-transparent h-[18px]
    [&::-webkit-slider-runnable-track]:h-[18px] [&::-webkit-slider-runnable-track]:bg-transparent
    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-[18px]
    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
    [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-(--bg-color,var(--accent-color))
    [&::-webkit-slider-thumb]:shadow-[0_1px_4px_rgb(16_24_40/0.35)]
    [&::-moz-range-track]:h-[18px] [&::-moz-range-track]:bg-transparent [&::-moz-range-track]:border-0
    [&::-moz-range-thumb]:size-[18px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white
    [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-(--bg-color,var(--accent-color))
    [&::-moz-range-thumb]:shadow-[0_1px_4px_rgb(16_24_40/0.35)]
    focus-visible:outline-none`

  /* Двойной слайдер: оба input на всю ширину трека с ОДИНАКОВЫМ min/max,
     наложены друг на друга. pointer-events выключен на самом input и включён
     только на ::thumb (класс .range-overlay ниже) — тянуть можно исключительно
     за конкретный бегунок. Tailwind не генерирует CSS для сочетания
     произвольного варианта псевдоэлемента с pointer-events-*, поэтому это
     обычный style-блок ниже, а не класс. */
</script>

<div class={twMerge(`relative flex w-full flex-col gap-1.5`, wrapperClass)}>
  {#if label.name}
    <h5 class={twMerge(`w-full text-[12px] font-semibold text-(--muted-color)`, label.class)}>{label.name}</h5>
  {/if}

  <div class="flex w-full items-center gap-3">
    <!-- Дорожка -->
    <div
      id={`${id}-${crypto.randomUUID().slice(0, 6)}`}
      class="relative flex h-8 flex-1 items-center {disabled ? 'cursor-not-allowed opacity-45' : ''}"
    >
      <!-- Фон дорожки 6px — --container-color здесь давал слишком слабый контраст
           с фоном страницы (#f0f2f5 на белом), дорожка визуально пропадала;
           --border-color заметно контрастнее и совпадает с рамкой счётчика ниже. -->
      <div class="pointer-events-none absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-(--border-color)"></div>
      <!-- Заливка -->
      {#if isRange}
        <div
          class="pointer-events-none absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-(--bg-color,var(--accent-color))"
          style="left: {pct(lowerValue)}%; width: {Math.max(0, pct(upperValue) - pct(lowerValue))}%;"
        ></div>
      {:else}
        <div
          class="pointer-events-none absolute top-1/2 left-0 h-1.5 -translate-y-1/2 rounded-full bg-(--bg-color,var(--accent-color))"
          style="width: {pct(singleValue)}%;"
        ></div>
      {/if}

      {#if isRange}
        <input
          type="range"
          min={number.minNum}
          max={number.maxNum}
          step={number.step}
          bind:value={lowerValue}
          oninput={disabled
            ? undefined
            : (e) => {
                const newValue = Math.min(Number((e.target as HTMLInputElement).value), upperValue - number.step)
                lowerValue = roundToClean(Math.max(number.minNum, newValue))
                onUpdate([lowerValue, upperValue])
              }}
          {disabled}
          class="{twMerge(
            THUMB,
            'absolute inset-x-0 top-1/2 -translate-y-1/2',
            disabled ? '[&::-webkit-slider-thumb]:cursor-not-allowed' : '[&::-webkit-slider-thumb]:cursor-pointer',
          )} range-overlay"
        />
        <input
          type="range"
          min={number.minNum}
          max={number.maxNum}
          step={number.step}
          bind:value={upperValue}
          oninput={disabled
            ? undefined
            : (e) => {
                const newValue = Math.max(Number((e.target as HTMLInputElement).value), lowerValue + number.step)
                upperValue = roundToClean(Math.min(number.maxNum, newValue))
                onUpdate([lowerValue, upperValue])
              }}
          {disabled}
          class="{twMerge(
            THUMB,
            'absolute inset-x-0 top-1/2 -translate-y-1/2',
            disabled ? '[&::-webkit-slider-thumb]:cursor-not-allowed' : '[&::-webkit-slider-thumb]:cursor-pointer',
          )} range-overlay"
        />
      {:else}
        <input
          type="range"
          min={number.minNum}
          max={number.maxNum}
          step={number.step}
          bind:value={singleValue}
          {disabled}
          oninput={() => onUpdate(singleValue)}
          class={twMerge(THUMB, "relative", disabled ? "[&::-webkit-slider-thumb]:cursor-not-allowed" : "[&::-webkit-slider-thumb]:cursor-pointer")}
        />
      {/if}
    </div>

    <!-- Значения со счётчиком -->
    {#if isRange}
      {#each ["lower", "upper"] as t (t)}
        <div
          class="flex h-7 shrink-0 items-center gap-1 rounded-lg border border-(--border-color) bg-(--field-color) px-1 {disabled ? 'opacity-45' : ''}"
        >
          <button
            class="flex size-5 items-center justify-center rounded text-(--muted-color) transition-colors duration-150 hover:bg-(--container-color) disabled:cursor-not-allowed disabled:opacity-40 {disabled
              ? 'cursor-not-allowed'
              : 'cursor-pointer'}"
            onclick={disabled ? undefined : () => adjustValue(t as "lower" | "upper", "decrement")}
            disabled={disabled || (t === "lower" ? lowerValue <= number.minNum : upperValue <= lowerValue)}
            aria-label="Уменьшить">−</button
          >
          <span class="inline-block text-center text-[13px] font-semibold tabular-nums" style={`width: ${valueWidth}`}>
            {t === "lower" ? lowerValue : upperValue}
          </span>
          <button
            class="flex size-5 items-center justify-center rounded text-(--muted-color) transition-colors duration-150 hover:bg-(--container-color) disabled:cursor-not-allowed disabled:opacity-40 {disabled
              ? 'cursor-not-allowed'
              : 'cursor-pointer'}"
            onclick={disabled ? undefined : () => adjustValue(t as "lower" | "upper", "increment")}
            disabled={disabled || (t === "lower" ? lowerValue >= upperValue : upperValue >= number.maxNum)}
            aria-label="Увеличить">+</button
          >
        </div>
      {/each}
    {:else}
      <div class="flex h-7 shrink-0 items-center gap-1 rounded-lg border border-(--border-color) bg-(--field-color) px-1 {disabled ? 'opacity-45' : ''}">
        <button
          class="flex size-5 items-center justify-center rounded text-(--muted-color) transition-colors duration-150 hover:bg-(--container-color) disabled:cursor-not-allowed disabled:opacity-40 {disabled
            ? 'cursor-not-allowed'
            : 'cursor-pointer'}"
          onclick={disabled ? undefined : () => adjustValue("single", "decrement")}
          disabled={disabled || singleValue <= number.minNum}
          aria-label="Уменьшить">−</button
        >
        <span class="inline-block text-center text-[13px] font-semibold tabular-nums" style={`width: ${valueWidth}`}>
          {singleValue}
        </span>
        <button
          class="flex size-5 items-center justify-center rounded text-(--muted-color) transition-colors duration-150 hover:bg-(--container-color) disabled:cursor-not-allowed disabled:opacity-40 {disabled
            ? 'cursor-not-allowed'
            : 'cursor-pointer'}"
          onclick={disabled ? undefined : () => adjustValue("single", "increment")}
          disabled={disabled || singleValue >= number.maxNum}
          aria-label="Увеличить">+</button
        >
      </div>
    {/if}
  </div>
</div>

<style>
  /* Двойной слайдер: оба input наложены на всю ширину трека, дорожка каждого
     не должна перехватывать клик — только его собственный thumb. */
  .range-overlay {
    pointer-events: none;
  }
  .range-overlay::-webkit-slider-thumb {
    pointer-events: auto;
  }
  .range-overlay::-moz-range-thumb {
    pointer-events: auto;
  }
</style>
