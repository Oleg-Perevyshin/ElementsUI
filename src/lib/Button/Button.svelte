<!-- $lib/Button/Button.svelte - кнопка: вид variant, цвет accent, радиус 10px (иконка без подписи - круг 32px или во всю ширину wrapperClass), высота 32px, кольцо фокуса. pressed - кнопка-переключатель (вид выбранной кнопки, aria-pressed), loading - крутилка вместо значка, кнопка не нажимается -->
<script lang="ts">
  import type { IButtonProps } from "../types"
  import { twMerge } from "tailwind-merge"
  import { accentStyle } from "../accent"
  import Tooltip from "../Tooltip.svelte"
  import Icon from "../Icon.svelte"
  import Loader from "../Loader/Loader.svelte"
  import { isKeyboardFocus } from "../popup"

  let {
    id,
    wrapperClass = "",
    componentClass = "",
    variant = "plain",
    accent,
    disabled = false,
    pressed,
    loading = false,
    aria,
    content = { name: "", info: { text: "", side: "top" }, icon: null },
    keyBind = { showHint: true },
    onClick,
  }: IButtonProps = $props()

  let showInfo = $state(false)
  const isIconOnly = $derived(!!content?.icon && !content.name?.trim())
  /* Ширина в wrapperClass (w-8, size-10...) - кнопка-значок заполняет обёртку кругом, иначе она размером с поле (32px); w-auto/w-fit/w-max/w-min/w-full ширины не задают */
  const wrapperSized = $derived(/(^|\s)(?:[^\s:]+:)*(?:w|size)-(?!(?:auto|fit|max|min|full)(?:\s|$))\S+/.test(wrapperClass))
  /* Во время загрузки кнопка не нажимается, но вид не серый: видно, какое действие выполняется */
  const blocked = $derived(disabled || loading)

  /* primary - заливка цветом роли, secondary - поверхность с контуром, plain - текст цветом роли; нажатая (pressed) - как выбранный вариант группы Select */
  const variantClass = $derived.by(() => {
    if (disabled) return "bg-(--gray-color) text-(--muted-color) border border-transparent cursor-not-allowed"
    if (pressed)
      return `bg-(--accent-color) text-(--on-accent) border border-transparent hover:brightness-90 dark:hover:brightness-115 ${variant === "primary" ? "ring-2 ring-(--font-color) ring-inset" : ""}`
    if (variant === "primary")
      return "bg-(--accent-color) text-(--on-accent) border border-transparent shadow-(--elevation-1) hover:brightness-90 dark:hover:brightness-115"
    if (variant === "secondary") return "bg-(--back-color) text-(--font-color) border border-(--border-color) hover:bg-(--container-color)"
    return "bg-transparent text-(--accent-text) border border-transparent hover:bg-(--accent-soft)"
  })

  const handleClick = (event: Event) => {
    if (blocked || !onClick) return
    event.stopPropagation()
    onClick()
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (blocked || !keyBind.key || !onClick) return
    const isKeyMatch = event.key === keyBind.key
    const isCtrlMatch = keyBind.ctrlKey === undefined || event.ctrlKey === keyBind.ctrlKey
    const isShiftMatch = keyBind.shiftKey === undefined || event.shiftKey === keyBind.shiftKey
    const isAltMatch = keyBind.altKey === undefined || event.altKey === keyBind.altKey
    const isMetaMatch = keyBind.metaKey === undefined || event.metaKey === keyBind.metaKey
    if (isKeyMatch && isCtrlMatch && isShiftMatch && isAltMatch && isMetaMatch) {
      event.preventDefault()
      onClick()
    }
  }
</script>

<svelte:window onkeydown={handleKeyDown} />

<div class={twMerge(`relative flex w-full flex-col items-center`, wrapperClass)} style={accentStyle(accent)}>
  <button
    {id}
    class={twMerge(
      `relative inline-flex w-full items-center justify-center gap-2 leading-none font-semibold text-[14px] select-none
       transition-[background-color,filter,box-shadow] duration-150
       focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-text)
       ${isIconOnly ? `${wrapperSized ? "w-full" : "size-8"} aspect-square rounded-full p-0` : "h-8 rounded-[10px] px-4 py-2"}
       ${disabled ? "" : loading ? "cursor-progress" : "cursor-pointer active:scale-[0.97]"}`,
      variantClass,
      componentClass,
    )}
    onclick={handleClick}
    disabled={blocked}
    aria-pressed={pressed}
    aria-busy={loading || undefined}
    aria-haspopup={aria?.haspopup}
    aria-expanded={aria?.expanded}
    aria-controls={aria?.controls}
    aria-label={content.name || content.info?.text || undefined}
    onmouseenter={() => (showInfo = !!content.info?.text)}
    onmouseleave={() => (showInfo = false)}
    onfocus={(event) => (showInfo = !!content.info?.text && isKeyboardFocus(event))}
    onblur={() => (showInfo = false)}
  >
    {#if loading}
      <!-- Крутилка на месте значка: у кнопки-значка размер кнопки не меняется -->
      <Loader size={content.name?.trim() ? "18px" : "100%"} />
    {:else}
      <Icon
        icon={content?.icon}
        class="flex shrink-0 items-center justify-center overflow-visible {content.name?.trim()
          ? 'h-[18px] w-[18px]'
          : 'h-full w-full'} [&_svg]:h-full [&_svg]:max-h-full [&_svg]:w-full [&_svg]:max-w-full"
      />
    {/if}

    {#if content.name?.trim()}
      <!-- Длинная подпись на узкой кнопке - в две строки, а не обрезка; строка обрезана по высоте заглавных (текст точно по центру), запас py/-my - чтобы overflow line-clamp не срезал выносные элементы букв -->
      <span class="line-clamp-2 text-center leading-[1.05] [text-box:trim-both_cap_alphabetic] -my-[0.3em] py-[0.3em]">{content.name}</span>
      {#if keyBind.key && keyBind.showHint}
        <span class="ml-1 text-[11px] font-medium tabular-nums opacity-80">
          {keyBind.ctrlKey ? "Ctrl+" : ""}{keyBind.shiftKey ? "Shift+" : ""}{keyBind.altKey ? "Alt+" : ""}{keyBind.key}
        </span>
      {/if}
    {/if}
  </button>

  <Tooltip show={showInfo} text={content.info?.text ?? ""} side={content.info?.side ?? "top"} />
</div>
