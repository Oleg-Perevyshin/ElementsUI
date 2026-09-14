<!-- $lib/Switch/Switch.svelte — нормализованы цвета, тени и состояние «выключен».
     Геометрия тумблера по-прежнему считается от пропа height, чтобы не сломать
     вызовы, которые его задают. Чекбокс: 20px с радиусом 6 вместо size-8 rounded-2xl. -->
<script lang="ts">
  import { twMerge } from "tailwind-merge"
  import type { ISwitchProps } from "../types"
  import Tooltip from "../Tooltip.svelte"

  let {
    id = crypto.randomUUID(),
    wrapperClass = "",
    label = { name: "", class: "", captionLeft: "", captionRight: "" },
    hiddenInfo = "",
    height = "1.625rem",
    type = "horizontal",
    options = [],
    bitMode = false,
    value = $bindable(),
    onChange = () => {},
  }: ISwitchProps = $props()

  let showInfo = $state(false)

  let localOptions = $derived(bitMode ? options : options.slice(0, 1))

  let checkedOptions: boolean[] = $derived(
    (() => {
      if (bitMode) {
        return localOptions.map((option) => ((value ?? 0) & (1 << (option?.value ?? 0))) >>> 0 === Math.pow(2, option.value ?? 0))
      } else {
        return [value == 1]
      }
    })(),
  )
  let ID = $derived(`${id}-${crypto.randomUUID().slice(0, 6)}`)

  $effect(() => {
    if (value === undefined || value === null) value = 0
  })

  const handleToggle = (index: number) => {
    if (localOptions[index].disabled) return
    value = ((value ?? 0) ^ (1 << (bitMode ? (localOptions[index].value ?? 0) : 0))) >>> 0
    onChange(value)
  }

  const handleCaptionClick = (newValue: number) => {
    if (localOptions[0].disabled || value === newValue) return
    value = newValue
    onChange(newValue)
  }

  const maxCaptionWidth = $derived(
    Math.max(label.captionLeft?.length ?? 0, label.captionRight?.length ?? 0) > 0
      ? `${Math.max(label.captionLeft?.length ?? 0, label.captionRight?.length ?? 0)}ch`
      : "auto",
  )
</script>

{#if type !== "checkbox"}
  <div class={twMerge(`relative flex w-full flex-col items-center justify-center gap-1.5`, wrapperClass)}>
    {#if label.name}
      <h5 class={twMerge(`w-full text-[12px] font-semibold text-(--muted-color)`, label.class)}>{label.name}</h5>
    {/if}
    <div class="flex w-full {type == 'vertical' ? 'flex-wrap' : ''} items-center justify-around gap-4">
      {#each localOptions as option, index}
        <div class={twMerge(`flex flex-col gap-1`, option.class)}>
          {#if option.name && bitMode}
            <span class="text-[12px] font-medium text-(--muted-color)">{option.name}</span>
          {/if}

          <div class="relative flex w-full grow items-center justify-center bg-transparent">
            {#if type === "horizontal" && !bitMode && label.captionLeft}
              <button
                class="mr-2.5 text-[13px] font-medium transition-colors duration-150 {option.disabled
                  ? 'cursor-not-allowed text-(--faint-color)'
                  : checkedOptions[index]
                    ? 'cursor-pointer text-(--muted-color)'
                    : 'cursor-pointer text-(--font-color)'}"
                style="width: {maxCaptionWidth}; text-align: end;"
                onclick={() => handleCaptionClick(0)}>{label.captionLeft}</button
              >
            {/if}

            <label class="relative flex items-center justify-between {option.disabled ? 'cursor-not-allowed' : ''}">
              <input
                id={`${id}-${crypto.randomUUID().slice(0, 6)}`}
                type="checkbox"
                class="absolute left-1/2 h-full w-full -translate-x-1/2 cursor-pointer appearance-none rounded-full"
                checked={checkedOptions[index]}
                disabled={option.disabled}
                onchange={() => handleToggle(index)}
              />
              <!-- Дорожка: акцент во включённом состоянии, нейтральная серая в выключенном.
                   Фолбэк var(--accent-color) — большинство вызовов Switch не передают
                   wrapperClass с ролью цвета (bg-blue и т.п.), без фолбэка --bg-color
                   остаётся не задан и дорожка становится невидимой при включении. -->
              <span
                class="relative flex items-center rounded-full transition-colors duration-200
                  {checkedOptions[index] ? 'bg-(--bg-color,var(--accent-color))' : 'bg-(--border-color)'}
                  {option.disabled ? 'cursor-not-allowed opacity-45' : 'cursor-pointer'}"
                style="{type === 'horizontal' ? 'width' : 'height'}: {`calc(${height} * 1.7)`}; {type === 'horizontal'
                  ? 'height'
                  : 'width'}: {height};"
              >
                <span
                  class="absolute rounded-full bg-white shadow-[0_1px_3px_rgb(16_24_40/0.28)] transition-transform duration-200
                    {option.disabled ? 'cursor-not-allowed' : 'cursor-pointer'}"
                  style="width: {`calc(${height} * 0.8)`}; height: {`calc(${height} * 0.8)`}; margin: 0 {`calc(${height} * 0.1)`}; transform: {checkedOptions[
                    index
                  ]
                    ? `${type === 'horizontal' ? `translateX(calc(${height} * 0.7))` : `translateY(calc(-${height} * 0.35))`}`
                    : `${type === 'horizontal' ? 'translateX(0)' : `translateY(calc(${height} * 0.35))`}`};"
                ></span>
              </span>
            </label>

            {#if type === "horizontal" && !bitMode && label.captionRight}
              <button
                class="ml-2.5 text-[13px] font-medium transition-colors duration-150 {option.disabled
                  ? 'cursor-not-allowed text-(--faint-color)'
                  : checkedOptions[index]
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
  <div
    class={twMerge(
      "relative flex items-center justify-center gap-2",
      wrapperClass,
      options[0].class?.split(" ").find((cl) => cl.startsWith("bg-")),
    )}
  >
    <input
      id={ID}
      type="checkbox"
      checked={checkedOptions[0]}
      disabled={localOptions[0].disabled ?? false}
      class="
        relative size-5 shrink-0 cursor-pointer appearance-none rounded-[6px] border border-(--border-color)
        bg-(--field-color) transition-colors duration-150 after:origin-center after:opacity-0
        checked:border-(--bg-color,var(--accent-color)) checked:bg-(--bg-color,var(--accent-color))
        checked:after:absolute checked:after:top-[1px] checked:after:left-[6px]
        checked:after:h-[10px] checked:after:w-[5px] checked:after:rotate-45
        checked:after:border-2 checked:after:border-t-0 checked:after:border-l-0
        checked:after:border-solid checked:after:border-white checked:after:opacity-100
        checked:after:content-['']
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-color)
        disabled:cursor-not-allowed disabled:border-(--hairline-color) disabled:bg-(--container-color)
      "
      onchange={() => handleToggle(0)}
      onmouseenter={() => {
        if (hiddenInfo) showInfo = true
      }}
      onmouseleave={() => {
        if (hiddenInfo) showInfo = false
      }}
    />
    <Tooltip show={showInfo} text={hiddenInfo} side="top" />
    {#if label.name}
      <label for={ID} class={twMerge(`text-[13px] select-none ${options[0].disabled ? "text-(--faint-color)" : "cursor-pointer"}`, label.class)}>
        {label.name}
      </label>
    {/if}
  </div>
{/if}
