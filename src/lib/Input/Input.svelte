<!-- $lib/Input/Input.svelte - радиус 10, высота 32 (h-8), кольцо фокуса. onInput - каждый ввод, onUpdate - принятое значение (Enter, уход из поля, счётчик). error - ошибка от приложения, fill - text-area с подписью на всю высоту родителя, focus() - фокус извне через bind:this -->
<script lang="ts">
  import { roundToClean } from "../number"
  import { T } from "../locales/i18n"
  import type { IInputProps } from "../types"
  import { twMerge } from "tailwind-merge"
  import { accentStyle } from "../accent"
  import { copyText } from "../clipboard"
  import InfoIcon from "../libIcons/InfoIcon.svelte"
  import CopyIcon from "../libIcons/CopyIcon.svelte"
  import Tooltip from "../Tooltip.svelte"
  import { isHoverPointer, isKeyboardFocus } from "../popup"
  import CopiedChip from "../CopiedChip.svelte"
  import FieldLabel from "../FieldLabel.svelte"

  let {
    wrapperClass = "",
    label,
    disabled = false,
    readonly = false,
    value = $bindable(),
    type = "text",
    placeholder = "",
    componentClass = "",
    accent,
    maxlength = 100,
    textareaRows = 3,
    number = { minNum: -1000000, maxNum: 1000000, step: 1 },
    help = { info: "", autocomplete: "off", copyButton: false },
    error = "",
    autofocus = false,
    fill = false,
    ref = $bindable(null),
    onUpdate,
    onInput,
  }: IInputProps = $props()

  const uid = $props.id()
  let showPassword = $state(false)
  let showInfo = $state(false)
  /* Последнее нажатие на ⓘ - пальцем: тогда пояснение открывает и закрывает касание */
  let infoTouch = false
  let infoButton: HTMLButtonElement | null = $state(null)
  let isCopied = $state(false)

  const isNumeric = $derived(type === "number" || type === "bitMode")
  const pattern = $derived.by(() => {
    const source = help.regExp
    if (!source) return undefined
    /* Флаги g и y убираются: с ними test() помнит lastIndex и одно и то же значение то проходит, то нет */
    const stable = (flags: string) => flags.replace(/[gy]/g, "")
    if (source instanceof RegExp) return source.global || source.sticky ? new RegExp(source.source, stable(source.flags)) : source
    const match = source.match(/^\/(.*)\/([gimsuy]*)$/)
    return match ? new RegExp(match[1], stable(match[2])) : new RegExp(source)
  })
  const isValid = $derived(!pattern || isNumeric || pattern.test(String(value ?? "")))
  /* Ошибка приложения важнее ошибки формата */
  const errorText = $derived(error || (isValid ? "" : $T("ui.invalid_format")))
  const errorId = `${uid}-error`

  /* Фокус извне: bind:this={input}, затем input.focus() */
  export const focus = () => ref?.focus()

  /* autofocus атрибутом браузер ставит только при загрузке страницы, поэтому фокус - после монтирования */
  $effect(() => {
    if (autofocus) ref?.focus()
  })

  /* Число зажимается в пределы и округляется; не число - null */
  const toNumber = (raw: unknown): number | null => {
    let num = typeof raw === "string" ? parseFloat(raw.replace(",", ".")) : Number(raw)
    if (!Number.isFinite(num)) return null
    if (type === "bitMode") num = Math.trunc(num)
    if (typeof number.minNum === "number") num = Math.max(num, number.minNum)
    if (typeof number.maxNum === "number") num = Math.min(num, number.maxNum)
    return roundToClean(num, 5)
  }

  /* Неверный ввод наружу не уходит: в приложении остаётся последнее верное значение, поле подсвечивает ошибку */
  const commit = (raw: string | number) => {
    if (isNumeric) {
      const num = toNumber(raw)
      if (num === null) return
      value = num
      onUpdate?.(num)
    } else if (isValid) onUpdate?.(String(raw))
  }

  const DIRECTIONS = [1, -1] as const
  const stepBy = (direction: 1 | -1) => commit(Number(value ?? number.minNum ?? 0) + direction * (number.step || 1))

  const onkeydown = (event: KeyboardEvent) => {
    if (type === "number" && Number.isInteger(number.step ?? 1) && event.key === ".") event.preventDefault()
  }

  /* Мастер-цвет поля: рамка и лёгкий фон цветом роли */
  const fieldBase = $derived(
    `w-full rounded-[10px] border bg-(--field-color) px-3 text-[14px] text-left leading-none
     transition-[border-color,box-shadow,background-color] duration-150 outline-none
     placeholder:text-(--faint-color)
     [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden
     ${accent && !disabled && !readonly ? "bg-[color-mix(in_srgb,var(--accent-color)_7%,var(--field-color))]" : ""}
     ${!errorText ? `${accent ? "border-[color-mix(in_srgb,var(--accent-color)_55%,var(--border-color))]" : "border-(--border-color)"} focus:border-(--accent-text) focus:shadow-(--focus-shadow-color)` : "border-(--red-text) focus:border-(--red-text) focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--red-color),transparent_80%)]"}
     ${disabled ? "cursor-not-allowed border-(--hairline-color) bg-(--container-color) text-(--faint-color)" : ""}
     ${readonly && !disabled ? "bg-(--container-color) text-(--muted-color)" : ""}
     ${help.info ? "pl-9" : ""}`,
  )
  /* Кнопка-значок внутри поля: у глазика пароля фон при наведении не появляется, меняется только цвет значка */
  const iconButton = `flex size-7 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-(--faint-color) transition-colors duration-150 hover:text-(--font-color)`
</script>

<!-- На телефоне пояснение ⓘ закрывается касанием в любом другом месте -->
<svelte:window onpointerdown={(event) => showInfo && !infoButton?.contains(event.target as Node) && (showInfo = false)} />

<!-- fill: подпись, поле и ошибка - колонка на всю высоту родителя, поле занимает всё, что осталось -->
<div
  class={twMerge(`relative flex w-full flex-col gap-1 ${type === "text-area" ? "h-full" : ""} ${fill ? "min-h-0 flex-1" : ""}`, wrapperClass)}
  style={accentStyle(accent)}
>
  <FieldLabel {label} for={uid} class={fill ? "shrink-0" : ""} />

  <div class="relative flex w-full {fill ? 'min-h-0 flex-1 flex-col' : type === 'text-area' ? 'h-full items-center' : 'items-center'}">
    {#if type === "text-area"}
      <textarea
        id={uid}
        bind:this={ref}
        bind:value
        class={twMerge(
          fieldBase,
          `${fill ? "min-h-0 flex-1 resize-none" : "h-full min-h-20 resize-y"} py-2 leading-[1.5] ${help.copyButton ? "pr-9" : ""}`,
          componentClass,
        )}
        {disabled}
        {maxlength}
        rows={textareaRows}
        {placeholder}
        {readonly}
        aria-invalid={!!errorText}
        aria-describedby={errorText ? errorId : undefined}
        oninput={(event) => onInput?.(event.currentTarget.value)}
        onchange={(event) => commit(event.currentTarget.value)}></textarea>
    {:else}
      <input
        id={uid}
        bind:this={ref}
        bind:value
        class={twMerge(fieldBase, `h-8 ${isNumeric || help.copyButton || type === "password" ? "pr-9" : ""}`, componentClass)}
        type={type === "number" ? "number" : type === "password" && !showPassword ? "password" : "text"}
        {placeholder}
        {disabled}
        {maxlength}
        {readonly}
        min={type === "number" ? number.minNum : undefined}
        max={type === "number" ? number.maxNum : undefined}
        step={type === "number" ? number.step : undefined}
        autocomplete={help.autocomplete}
        aria-invalid={!!errorText}
        aria-describedby={errorText ? errorId : undefined}
        oninput={(event) => onInput?.(event.currentTarget.value)}
        onchange={(event) => commit(event.currentTarget.value)}
        {onkeydown}
      />
    {/if}

    {#if type === "password" && !disabled}
      <button
        type="button"
        class="absolute right-1.5 {iconButton}"
        onclick={() => (showPassword = !showPassword)}
        aria-label={showPassword ? $T("ui.password.hide") : $T("ui.password.show")}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
          ><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5">
            {#if showPassword}
              <path d="M15 12a3 3 0 1 1-6 0a3 3 0 0 1 6 0" /><path d="M2 12c1.6-4.097 5.336-7 10-7s8.4 2.903 10 7c-1.6 4.097-5.336 7-10 7s-8.4-2.903-10-7" />
            {:else}
              <path
                d="M10.73 5.073A11 11 0 0 1 12 5c4.664 0 8.4 2.903 10 7a11.6 11.6 0 0 1-1.555 2.788M6.52 6.519C4.48 7.764 2.9 9.693 2 12c1.6 4.097 5.336 7 10 7a10.44 10.44 0 0 0 5.48-1.52m-7.6-7.6a3 3 0 1 0 4.243 4.243"
              /><path d="m4 4l16 16" />
            {/if}
          </g></svg
        >
      </button>
    {/if}

    {#if help.copyButton && type !== "password" && !disabled}
      <button
        type="button"
        class="absolute {type == 'number' ? 'right-10' : 'right-1.5'} {type === 'text-area'
          ? 'top-1.5'
          : ''} {iconButton} hover:bg-(--container-color) [&_svg]:size-(--icon-size)"
        onclick={async () => {
          isCopied = await copyText(String(value ?? ""))
          setTimeout(() => (isCopied = false), 1000)
        }}
        aria-label={$T("ui.copy_text")}
      >
        {#if !isCopied}<CopyIcon />{/if}
        <CopiedChip show={isCopied} class="right-0" />
      </button>
    {/if}

    {#if isNumeric && !readonly && !disabled}
      <!-- Счётчик: узкая колонка со стрелками, отделена волосяной линией -->
      <div class="absolute right-0 flex h-8 w-8 flex-col overflow-hidden rounded-r-[10px] border-l border-(--hairline-color)">
        {#each DIRECTIONS as direction (direction)}
          <button
            type="button"
            class="flex h-1/2 w-full items-center justify-center text-[11px] leading-none text-(--muted-color) transition-colors duration-150 hover:bg-(--container-color) hover:text-(--font-color) {direction ===
            1
              ? 'border-b border-(--hairline-color)'
              : ''}"
            onclick={() => stepBy(direction)}
            aria-label={direction === 1 ? $T("ui.increase") : $T("ui.decrease")}>{direction === 1 ? "▲" : "▼"}</button
          >
        {/each}
      </div>
    {/if}

    {#if help.info}
      <button
        bind:this={infoButton}
        type="button"
        class="absolute left-2 flex size-(--icon-size) items-center justify-center border-none bg-transparent text-(--faint-color) [&_svg]:size-full {type ===
        'text-area'
          ? 'top-2'
          : ''} {disabled ? 'opacity-50' : 'cursor-pointer hover:text-(--accent-text)'}"
        onpointerdown={(event) => (infoTouch = !isHoverPointer(event))}
        onclick={() => infoTouch && (showInfo = !showInfo)}
        onpointerenter={(event) => isHoverPointer(event) && (showInfo = true)}
        onpointerleave={(event) => isHoverPointer(event) && (showInfo = false)}
        onfocus={(event) => (showInfo = isKeyboardFocus(event))}
        onblur={() => (showInfo = false)}
        aria-label={help.info}
      >
        <InfoIcon />
      </button>
      <Tooltip show={showInfo} text={help.info} side="top" align="start" />
    {/if}
  </div>

  {#if errorText}
    <!-- Текст ошибки в потоке под полем и только когда она есть: место заранее не резервируется -->
    <span id={errorId} class="block shrink-0 text-[12px] font-semibold text-(--red-text)" role="alert">{errorText}</span>
  {/if}
</div>
