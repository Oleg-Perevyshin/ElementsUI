<!-- $lib/Switch/Switch.svelte - тумблер, геометрия считается от пропа height; чекбокс 20px с радиусом 6 -->
<script lang="ts">
  import { twMerge } from "tailwind-merge"
  import { accentStyle } from "../accent"
  import type { ISwitchProps } from "../types"
  import Tooltip from "../Tooltip.svelte"

  let {
    wrapperClass = "",
    label = { name: "", class: "", captionLeft: "", captionRight: "" },
    hiddenInfo = "",
    height = "1.625rem",
    type = "horizontal",
    accent,
    options = [],
    bitMode = false,
    value = $bindable(),
    disabled = false,
    onUpdate,
  }: ISwitchProps = $props()

  const uid = $props.id()
  let showInfo = $state(false)
  const current = $derived(value ?? 0)

  /* Обычный тумблер - один бит 0; в bitMode - по варианту на бит. Общий disabled выключает все */
  const bits = $derived(
    (bitMode ? options : [{ value: 0, name: "", accent, disabled: false }]).map((option) => ({ ...option, disabled: disabled || option.disabled })),
  )
  const isOn = (bit: number) => ((current >>> bit) & 1) === 1

  const set = (next: number) => {
    if (next === current) return
    value = next
    onUpdate?.(next)
  }
  const toggle = (index: number) => {
    if (!bits[index]?.disabled) set((current ^ (1 << bits[index].value)) >>> 0)
  }
  const handleCaptionClick = (next: number) => {
    if (!bits[0]?.disabled) set(next)
  }

  const maxCaptionWidth = $derived(
    Math.max(label.captionLeft?.length ?? 0, label.captionRight?.length ?? 0) > 0
      ? `${Math.max(label.captionLeft?.length ?? 0, label.captionRight?.length ?? 0)}ch`
      : "auto",
  )
</script>

{#if type !== "checkbox"}
  <div class={twMerge(`relative flex w-full flex-col items-center justify-center gap-1.5`, wrapperClass)} style={accentStyle(accent)}>
    {#if label.name}
      <!-- Подпись по умолчанию по центру - над переключателем, который тоже по центру; выравнивание из label.class важнее -->
      <h5 class={twMerge(`w-full text-center text-[12px] font-semibold text-(--muted-color)`, label.class)}>{label.name}</h5>
    {/if}
    <div class="flex w-full {type == 'vertical' ? 'flex-wrap' : ''} items-center justify-around gap-4">
      {#each bits as option, index (index)}
        <div class="flex flex-col gap-1" style={accentStyle(option.accent)}>
          {#if option.name && bitMode}
            <span class="text-center text-[12px] font-medium text-(--muted-color)">{option.name}</span>
          {/if}

          <div class="relative flex w-full grow items-center justify-center bg-transparent">
            {#if type === "horizontal" && !bitMode && label.captionLeft}
              <button
                class="mr-2.5 text-[13px] font-medium transition-colors duration-150 {option.disabled
                  ? 'cursor-not-allowed text-(--faint-color)'
                  : isOn(option.value)
                    ? 'cursor-pointer text-(--muted-color)'
                    : 'cursor-pointer text-(--font-color)'}"
                style="width: {maxCaptionWidth}; text-align: end;"
                onclick={() => handleCaptionClick(0)}>{label.captionLeft}</button
              >
            {/if}

            <label class="relative flex items-center justify-between {option.disabled ? 'cursor-not-allowed' : ''}">
              <input
                id={index === 0 ? uid : undefined}
                type="checkbox"
                aria-label={option.name || label.name || undefined}
                class="absolute left-1/2 h-full w-full -translate-x-1/2 cursor-pointer appearance-none rounded-full"
                checked={isOn(option.value)}
                disabled={option.disabled}
                onchange={() => toggle(index)}
              />
              <!-- Дорожка: акцент во включённом состоянии, нейтральная серая в выключенном -->
              <span
                class="relative flex items-center rounded-full transition-colors duration-200
                  {isOn(option.value) ? 'bg-(--accent-color)' : 'bg-(--border-color)'}
                  {option.disabled ? 'cursor-not-allowed opacity-45' : 'cursor-pointer'}"
                style="{type === 'horizontal' ? 'width' : 'height'}: {`calc(${height} * 1.7)`}; {type === 'horizontal' ? 'height' : 'width'}: {height};"
              >
                <span
                  class="absolute rounded-full bg-white shadow-[0_1px_3px_rgb(16_24_40/0.28)] transition-transform duration-200
                    {option.disabled ? 'cursor-not-allowed' : 'cursor-pointer'}"
                  style="width: {`calc(${height} * 0.8)`}; height: {`calc(${height} * 0.8)`}; margin: 0 {`calc(${height} * 0.1)`}; transform: {isOn(
                    option.value,
                  )
                    ? `${type === 'horizontal' ? `translateX(calc(${height} * 0.7))` : `translateY(calc(-${height} * 0.35))`}`
                    : `${type === 'horizontal' ? 'translateX(0)' : `translateY(calc(${height} * 0.35))`}`};"
                ></span>
              </span>
            </label>

            {#if type === "horizontal" && !bitMode && label.captionRight}
              <button
                class="ml-2.5 text-[13px] font-medium transition-colors duration-150 {option.disabled
                  ? 'cursor-not-allowed text-(--faint-color)'
                  : isOn(option.value)
                    ? 'cursor-pointer text-(--font-color)'
                    : 'cursor-pointer text-(--muted-color)'}"
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
  <div class={twMerge("relative flex items-center justify-center gap-2", wrapperClass)} style={accentStyle(accent)}>
    <input
      id={uid}
      type="checkbox"
      checked={isOn(0)}
      disabled={bits[0].disabled}
      class="
        relative size-5 shrink-0 cursor-pointer appearance-none rounded-[6px] border border-(--border-color)
        bg-(--field-color) transition-colors duration-150 after:origin-center after:opacity-0
        checked:border-(--accent-color) checked:bg-(--accent-color)
        checked:after:absolute checked:after:top-[1px] checked:after:left-[6px]
        checked:after:h-[10px] checked:after:w-[5px] checked:after:rotate-45
        checked:after:border-2 checked:after:border-t-0 checked:after:border-l-0
        checked:after:border-solid checked:after:border-(--on-accent) checked:after:opacity-100
        checked:after:content-['']
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-text)
        disabled:cursor-not-allowed disabled:border-(--hairline-color) disabled:bg-(--container-color)
      "
      onchange={() => toggle(0)}
      onmouseenter={() => {
        if (hiddenInfo) showInfo = true
      }}
      onmouseleave={() => {
        if (hiddenInfo) showInfo = false
      }}
    />
    <Tooltip show={showInfo} text={hiddenInfo} side="top" />
    {#if label.name}
      <label for={uid} class={twMerge(`text-[13px] select-none ${bits[0].disabled ? "text-(--faint-color)" : "cursor-pointer"}`, label.class)}>
        {label.name}
      </label>
    {/if}
  </div>
{/if}
