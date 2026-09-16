<!-- $lib/Input/Input.svelte — радиус 10, высота 36, выравнивание по левому краю,
     кольцо фокуса вместо размытой тени. Вся логика (regExp, roundToClean,
     handleInputChange, счётчик, копирование) не тронута. -->
<script lang="ts">
  import type { IInputProps } from "../types"
  import { twMerge } from "tailwind-merge"
  import InfoIcon from "$lib/libIcons/InfoIcon.svelte"
  import Tooltip from "../Tooltip.svelte"
  import CopiedChip from "../CopiedChip.svelte"

  let {
    id = crypto.randomUUID(),
    wrapperClass = "",
    label = { name: "", class: "" },
    disabled = false,
    readonly = false,
    value = $bindable(),
    type = "text",
    placeholder = "",
    componentClass = "",
    maxlength = 100,
    textareaRows = 3,
    isValid = $bindable(true),
    number = { minNum: -1000000, maxNum: 1000000, step: 1 },
    help = { info: "", autocomplete: "off", copyButton: false },
    onUpdate = () => {},
  }: IInputProps = $props()

  let showPassword = $state(false)
  let showInfo = $state(false)
  let isCopied = $state(false)

  const parseRegExp = (pattern: string | RegExp): RegExp => {
    if (pattern instanceof RegExp) return pattern
    const match = pattern.match(/^\/(.*)\/([gimsuy]*)$/)
    return match ? new RegExp(match[1], match[2]) : new RegExp(pattern)
  }
  let RegExpObj = $derived(() => parseRegExp(help.regExp ?? ""))

  $effect(() => {
    if (help.regExp && type !== "number") isValid = RegExpObj().test(typeof value === "string" ? value : String(value))
  })

  const handleInputChange = (value: string | number) => {
    if (type === "number") {
      const numValue = typeof value === "string" ? parseFloat(value.replace(",", ".")) : Number(value)
      if (!isNaN(numValue)) onUpdate?.(numValue)
      else onUpdate?.(value as string)
    } else {
      onUpdate?.(value as string)
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (type === "number" && Number.isInteger(number?.step ?? 1) && e.key === ".") e.preventDefault()
  }

  $effect(() => {
    if (type === "number" && typeof value == "number") value = roundToClean(value)
  })

  const roundToClean = (num: number): number => {
    if (Number.isInteger(num)) return num
    for (const digits of [1, 2, 3, 4, 5]) {
      const rounded = Number(num.toFixed(digits))
      if (Math.abs(rounded - num) < 1e-10) return rounded
    }
    return Number(num.toFixed(5))
  }

  /* Единая база поля: высота 36, радиус 10, текст по левому краю.
     Правый отступ учитывает кнопки (глаз / копировать / счётчик). */
  const fieldBase = $derived(
    `w-full rounded-[10px] border bg-(--field-color) px-3 text-[14px] text-left leading-none
     transition-[border-color,box-shadow,background-color] duration-150 outline-none
     placeholder:text-(--faint-color)
     [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden
     ${isValid ? "border-(--border-color) focus:border-(--accent-color) focus:shadow-(--focus-shadow-color)" : "border-(--red-color) focus:border-(--red-color) focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--red-color),transparent_80%)]"}
     ${disabled ? "cursor-not-allowed border-(--hairline-color) bg-(--container-color) text-(--faint-color)" : ""}
     ${readonly && !disabled ? "bg-(--container-color) text-(--muted-color)" : ""}
     ${help?.info ? "pl-9" : ""}`,
  )
</script>

<div class={twMerge(`relative flex w-full flex-col gap-1 ${type === "text-area" ? "h-full" : ""}`, wrapperClass)}>
  {#if label.name}
    <!-- Метка слева, 12/600 — вместо центрированного h5 -->
    <span class={twMerge(`text-[12px] font-semibold text-(--muted-color)`, label.class)}>{label.name}</span>
  {/if}

  <div class="relative flex w-full items-center {type === 'text-area' ? 'h-full' : ''}">
    {#if type === "number"}
      <input
        bind:value
        class={twMerge(fieldBase, "h-8 pr-9", componentClass)}
        id={`${id}-${crypto.randomUUID().slice(0, 6)}`}
        {placeholder}
        {disabled}
        autocomplete={help?.autocomplete}
        oninput={(e) => handleInputChange((e.currentTarget as HTMLInputElement).value)}
        onkeydown={handleKeyDown}
        type="number"
        {maxlength}
        min={number?.minNum}
        max={number?.maxNum}
        step={number?.step}
        {readonly}
      />
    {:else if type !== "text-area"}
      <input
        bind:value
        class={twMerge(fieldBase, `h-8 ${help.copyButton || type === "password" ? "pr-9" : ""}`, componentClass)}
        id={`${id}-${crypto.randomUUID().slice(0, 6)}`}
        {placeholder}
        {disabled}
        autocomplete={help?.autocomplete}
        oninput={(e) => handleInputChange((e.currentTarget as HTMLInputElement).value)}
        onkeydown={handleKeyDown}
        type={type === "password" ? (showPassword ? "text" : "password") : "text"}
        {maxlength}
        {readonly}
      />
    {:else}
      <textarea
        bind:value
        class={twMerge(fieldBase, `h-full min-h-20 resize-y py-2 leading-[1.5] ${help.copyButton ? "pr-9" : ""}`, componentClass)}
        id={`${id}-${crypto.randomUUID().slice(0, 6)}`}
        {disabled}
        {maxlength}
        rows={textareaRows}
        {placeholder}
        {readonly}
        oninput={(e) => handleInputChange((e.currentTarget as HTMLTextAreaElement).value)}></textarea>
    {/if}

    {#if type === "password" && !disabled}
      <button
        type="button"
        class="absolute right-1.5 flex size-7 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-(--faint-color) transition-colors duration-150 hover:bg-(--container-color) hover:text-(--font-color)"
        onclick={() => (showPassword = !showPassword)}
        aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
      >
        {#if showPassword}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
            ><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              ><path d="M15 12a3 3 0 1 1-6 0a3 3 0 0 1 6 0" /><path
                d="M2 12c1.6-4.097 5.336-7 10-7s8.4 2.903 10 7c-1.6 4.097-5.336 7-10 7s-8.4-2.903-10-7"
              /></g
            ></svg
          >
        {:else}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
            ><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              ><path
                stroke-linejoin="round"
                d="M10.73 5.073A11 11 0 0 1 12 5c4.664 0 8.4 2.903 10 7a11.6 11.6 0 0 1-1.555 2.788M6.52 6.519C4.48 7.764 2.9 9.693 2 12c1.6 4.097 5.336 7 10 7a10.44 10.44 0 0 0 5.48-1.52m-7.6-7.6a3 3 0 1 0 4.243 4.243"
              /><path d="m4 4l16 16" /></g
            ></svg
          >
        {/if}
      </button>
    {/if}

    {#if help.copyButton && type !== "password" && !disabled}
      <button
        class="absolute {type == 'number' ? 'right-10' : 'right-1.5'} {type === 'text-area'
          ? 'top-1.5'
          : ''} flex size-7 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-(--faint-color) transition-colors duration-150 hover:bg-(--container-color) hover:text-(--font-color)"
        onclick={(e) => {
          e.preventDefault()
          navigator.clipboard.writeText(value as string)
          isCopied = true
          setTimeout(() => (isCopied = false), 1000)
        }}
        aria-label="Копировать текст"
      >
        {#if !isCopied}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
            <g fill="none" stroke="currentColor" stroke-width="1.5">
              <path
                d="M6 11c0-2.828 0-4.243.879-5.121C7.757 5 9.172 5 12 5h3c2.828 0 4.243 0 5.121.879C21 6.757 21 8.172 21 11v5c0 2.828 0 4.243-.879 5.121C19.243 22 17.828 22 15 22h-3c-2.828 0-4.243 0-5.121-.879C6 20.243 6 18.828 6 16z"
              />
              <path d="M6 19a3 3 0 0 1-3-3v-6c0-3.771 0-5.657 1.172-6.828S7.229 2 11 2h4a3 3 0 0 1 3 3" />
            </g>
          </svg>
        {/if}
        <CopiedChip show={isCopied} class="right-0" />
      </button>
    {/if}

    {#if (type === "number" || type === "bitMode") && !readonly && !disabled}
      <!-- Счётчик: узкая колонка со стрелками, отделена волосяной линией -->
      <div class="absolute right-0 flex h-8 w-8 flex-col overflow-hidden rounded-r-[10px] border-l border-(--hairline-color)">
        <button
          class="flex h-1/2 w-full items-center justify-center border-b border-(--hairline-color) text-[11px] leading-none text-(--muted-color) transition-colors duration-150 hover:bg-(--container-color) hover:text-(--font-color)"
          onclick={() => {
            if (value == undefined) value = number.minNum
            if ((number.maxNum !== 0 && !number.maxNum) || !number.step || (value !== 0 && !value)) return
            if (Number(value) + number.step >= number.maxNum) {
              value = number.maxNum
              onUpdate(value as number)
              return
            }
            value = roundToClean(Number(value) + (number.step ?? 1))
            onUpdate(value as number)
          }}
          aria-label="Увеличить">▲</button
        >
        <button
          class="flex h-1/2 w-full items-center justify-center text-[11px] leading-none text-(--muted-color) transition-colors duration-150 hover:bg-(--container-color) hover:text-(--font-color)"
          onclick={() => {
            if (value == undefined) value = number.minNum
            if ((number.minNum !== 0 && !number.minNum) || !number.step || (value !== 0 && !value)) return
            if (Number(value) - number.step <= number.minNum) {
              value = number.minNum
              onUpdate(value as number)
              return
            }
            value = roundToClean(Number(value) - (number.step ?? 1))
            onUpdate(value as number)
          }}
          aria-label="Уменьшить">▼</button
        >
      </div>
    {/if}

    {#if help.info}
      <button
        type="button"
        class="button-info absolute left-2 flex size-5 items-center justify-center border-none bg-transparent text-(--faint-color) {type === 'text-area'
          ? 'top-2'
          : ''} {disabled ? 'opacity-50' : 'cursor-pointer hover:text-(--accent-color)'}"
        onmouseenter={() => (showInfo = true)}
        onmouseleave={() => (showInfo = false)}
        aria-label={showInfo ? "Скрыть инфо" : "Показать инфо"}
      >
        <InfoIcon />
      </button>

      <Tooltip show={showInfo} text={help?.info ?? ""} side="top" align="start" />
    {/if}
  </div>

  {#if help.regExp && !isValid}
    <!-- Стандартный паттерн (Material/Ant/Chakra) — текст ошибки в потоке под полем,
       рендерится только когда поле реально невалидно. Не зарезервирован заранее (не даёт
       лишнего зазора, когда ошибки нет) и не абсолютным позиционированием (не наезжает на
       соседний контент при плотной вертикальной раскладке) — просто раздвигает то, что ниже,
       как везде в вебе. -->
    <span class="block text-[12px] font-semibold text-(--red-color)">Неверный формат</span>
  {/if}
</div>
