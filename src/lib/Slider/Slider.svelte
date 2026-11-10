<!-- $lib/Slider/Slider.svelte - дорожка 6px, ползунок 18px; onInput - во время перетаскивания, onUpdate - бегунок отпущен или нажата кнопка +/-. В диапазонном режиме оба <input> на всю ширину с одинаковыми min/max наложены друг на друга, события ловит только ::thumb -->
<script lang="ts">
  import { roundToClean } from "../number"
  import { T } from "../locales/i18n"
  import type { ISliderProps } from "../types"
  import { twMerge } from "tailwind-merge"
  import { accentStyle } from "../accent"
  import FieldLabel from "../FieldLabel.svelte"

  let {
    wrapperClass = "",
    accent,
    label,
    type = "single",
    value = $bindable(),
    number = { minNum: 0, maxNum: 10, step: 1 },
    disabled = false,
    onUpdate,
    onInput,
  }: ISliderProps = $props()

  const uid = $props.id()
  const isRange = $derived(type === "range" || (Array.isArray(value) && value.length === 2))
  const valueWidth = $derived(`${String(number.maxNum ?? 10).length + 1}ch`)

  /* Значение на сетке шага: браузер ставит бегунок только на min + k * step, заливка должна стоять там же */
  const snap = (v: number) => {
    const k = Math.round((v - number.minNum) / (number.step || 1))
    return roundToClean(Math.max(number.minNum, Math.min(number.maxNum, number.minNum + k * (number.step || 1))))
  }

  /* Текущие значения: от пропа, во время перетаскивания - локальные до следующего значения снаружи */
  let lower = $derived(isRange ? snap(Array.isArray(value) ? value[0] : number.minNum) : snap(typeof value === "number" ? value : number.minNum))
  let upper = $derived(isRange && Array.isArray(value) ? snap(value[1]) : number.maxNum)
  const current = (): number | [number, number] => (isRange ? [lower, upper] : lower)
  const DIRECTIONS = [-1, 1] as const
  const targets = $derived(isRange ? (["lower", "upper"] as const) : (["lower"] as const))

  const live = () => onInput?.(current())
  const commit = () => {
    value = current()
    onUpdate?.(value)
  }

  /* Нижний бегунок не заходит за верхний и наоборот: между ними минимум шаг */
  const setLower = (v: number) => (lower = isRange ? roundToClean(Math.max(number.minNum, Math.min(v, upper - number.step))) : snap(v))
  const setUpper = (v: number) => (upper = roundToClean(Math.min(number.maxNum, Math.max(v, lower + number.step))))
  const adjust = (target: "lower" | "upper", direction: 1 | -1) => {
    if (target === "lower") setLower(lower + direction * number.step)
    else setUpper(upper + direction * number.step)
    commit()
  }

  /* Позиция значения в процентах; центр бегунка ходит от 9px до ширины минус 9px (половина размера 18px), заливка считается так же */
  const pct = (v: number) => Math.max(0, Math.min(100, ((v - number.minNum) / (Math.abs(number.maxNum - number.minNum) || 1)) * 100))
  const thumbX = (v: number) => `calc(9px + (100% - 18px) * ${pct(v) / 100})`

  /* Единые классы для нативного ползунка: высота input РАВНА высоте thumb (18px) - тогда центрирование по вертикали отдаётся обычному flexbox родителя (items-center), без ручного margin-top на ::-webkit-slider-thumb. Такой margin-top пришлось бы подбирать под конкретную высоту трека, и он даёт разный результат в Chromium и Safari/WebKit - при равных высотах input и thumb смещения нет по определению, это работает одинаково везде. */
  /* Бегунок: рамка 2px цветом заливки, чтобы белый кружок не сливался с дорожкой на светлом фоне */
  const THUMB = `w-full appearance-none bg-transparent h-[18px]
    [&::-webkit-slider-runnable-track]:h-[18px] [&::-webkit-slider-runnable-track]:bg-transparent
    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-[18px]
    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
    [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-(--accent-color)
    [&::-webkit-slider-thumb]:shadow-[0_1px_4px_rgb(16_24_40/0.35)]
    [&::-moz-range-track]:h-[18px] [&::-moz-range-track]:bg-transparent [&::-moz-range-track]:border-0
    [&::-moz-range-thumb]:size-[18px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white
    [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-(--accent-color)
    [&::-moz-range-thumb]:shadow-[0_1px_4px_rgb(16_24_40/0.35)]
    focus-visible:outline-none`

  /* Двойной слайдер: оба input на всю ширину трека с ОДИНАКОВЫМ min/max, наложены друг на друга. pointer-events выключен на самом input и включён только на ::thumb (класс .range-overlay ниже) - тянуть можно исключительно за конкретный бегунок. Tailwind не генерирует CSS для сочетания произвольного варианта псевдоэлемента с pointer-events-*, поэтому это обычный style-блок ниже, а не класс. */
</script>

{#snippet counter(target: "lower" | "upper")}
  {@const v = target === "lower" ? lower : upper}
  <div class="flex h-7 shrink-0 items-center gap-1 rounded-lg border border-(--border-color) bg-(--field-color) px-1 {disabled ? 'opacity-45' : ''}">
    {#each DIRECTIONS as direction (direction)}
      <button
        class="flex size-5 items-center justify-center rounded text-(--muted-color) transition-colors duration-150 hover:bg-(--container-color) disabled:cursor-not-allowed disabled:opacity-40 {direction ===
        1
          ? 'order-last'
          : ''} {disabled ? 'cursor-not-allowed' : 'cursor-pointer'}"
        onclick={() => adjust(target, direction)}
        disabled={disabled ||
          (direction === -1
            ? target === "lower"
              ? v <= number.minNum
              : v <= lower + number.step
            : target === "upper" || !isRange
              ? v >= number.maxNum
              : v >= upper - number.step)}
        aria-label={direction === 1 ? $T("ui.increase") : $T("ui.decrease")}>{direction === 1 ? "+" : "−"}</button
      >
    {/each}
    <span class="inline-block text-center text-[13px] font-semibold tabular-nums" style="width: {valueWidth}">{v}</span>
  </div>
{/snippet}

<div class={twMerge(`relative flex w-full flex-col gap-1.5`, wrapperClass)} style={accentStyle(accent)}>
  <FieldLabel {label} for={uid} class="w-full" />

  <div class="flex w-full items-center gap-3">
    {#if isRange}{@render counter("lower")}{/if}
    <!-- Дорожка: фон --border-color заметен на светлом фоне, заливка - акцент -->
    <div class="relative flex h-8 flex-1 items-center {disabled ? 'cursor-not-allowed opacity-45' : ''}">
      <div class="pointer-events-none absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-(--border-color)"></div>
      <div
        class="pointer-events-none absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-(--accent-color)"
        style={isRange ? `left: ${thumbX(lower)}; width: calc(${thumbX(upper)} - ${thumbX(lower)});` : `left: 0; width: ${thumbX(lower)};`}
      ></div>

      {#each targets as target (target)}
        <input
          id={target === "lower" ? uid : undefined}
          type="range"
          min={number.minNum}
          max={number.maxNum}
          step={number.step}
          value={target === "lower" ? lower : upper}
          {disabled}
          aria-label={isRange ? `${label?.name ?? ""} ${target === "lower" ? "min" : "max"}`.trim() : undefined}
          oninput={(event) => {
            const v = Number(event.currentTarget.value)
            if (target === "lower") setLower(v)
            else setUpper(v)
            event.currentTarget.value = String(target === "lower" ? lower : upper)
            live()
          }}
          onchange={commit}
          class="{twMerge(
            THUMB,
            isRange ? 'absolute inset-x-0 top-1/2 -translate-y-1/2' : 'relative',
            disabled ? '[&::-webkit-slider-thumb]:cursor-not-allowed' : '[&::-webkit-slider-thumb]:cursor-pointer',
          )} {isRange ? 'range-overlay' : ''}"
        />
      {/each}
    </div>

    <!-- Значение со счётчиком: у диапазона нижнее слева от дорожки, верхнее справа -->
    {@render counter(isRange ? "upper" : "lower")}
  </div>
</div>

<style>
  /* Двойной слайдер: оба input наложены на всю ширину трека, дорожка каждого не должна перехватывать клик - только его собственный thumb. */
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
