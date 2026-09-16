<!-- $lib/Button/Button.svelte — шаг 3 плана.
     API не изменён: id, wrapperClass, componentClass, disabled, content, keyBind, onClick.
     Что изменилось внутри:
       • роль определяется значением bg-* (намерение), а не фактом его наличия;
       • убрано автоподчёркивание текста — кнопка больше не выглядит ссылкой;
       • единый радиус 10px (иконка без подписи — круг), высота 32px (стандарт полей h-8), кегль 14/600;
       • кольцо фокуса вместо размытой тени;
       • disabled через токены, а не opacity: 0.5;
       • иконка встала в поток (flex + gap) вместо absolute left-3. -->
<script lang="ts">
  import { onMount } from "svelte"
  import type { IButtonProps } from "../types"
  import { twMerge } from "tailwind-merge"
  import Tooltip from "../Tooltip.svelte"

  let {
    id = crypto.randomUUID(),
    wrapperClass = "",
    componentClass = "",
    disabled = false,
    content = {
      name: "",
      info: { text: "", side: "top" },
      icon: null,
    },
    keyBind = { showHint: true },
    onClick,
  }: IButtonProps = $props()

  let showInfo = $state(false)

  /* ─── Роль кнопки по последнему классу bg-* ─────────────────────────
     bg-blue / bg-green / bg-cyan / bg-purple / bg-orange / bg-yellow → primary     (заливка + белый текст)
     bg-red / bg-pink                                                → destructive
     bg-max / bg-gray / bg-*-soft                                    → secondary   (поверхность + контур)
     bg-transparent / без bg-*                                       → plain       (текст акцентом) */
  const SURFACE_BG = ["bg-max", "bg-gray"]
  const DANGER_BG = ["bg-red", "bg-pink"]

  const role = $derived.by(() => {
    const bg =
      componentClass
        .split(/\s+/)
        .filter((c) => c.startsWith("bg-"))
        .at(-1) ?? ""
    if (!bg || bg === "bg-transparent") return "plain"
    if (SURFACE_BG.includes(bg) || bg.endsWith("-soft")) return "secondary"
    if (DANGER_BG.includes(bg)) return "destructive"
    return "primary"
  })

  const isIconOnly = $derived(!!content?.icon && !content.name?.trim())

  /* bg-(--bg-color) намеренно не входит в roleClass: он приклеивается к готовому
     className вне twMerge (см. разметку ниже) — иначе twMerge видит его и явный
     bg-* из componentClass (bg-red, bg-max…) как конфликтующие утилиты одной
     группы и вырезает один из них, из-за чего заливка кнопки пропадает. */
  const roleBg = $derived.by(() => {
    if (disabled) return "bg-(--gray-color)"
    if (role === "plain") return "bg-transparent"
    return "bg-(--bg-color)"
  })

  const roleClass = $derived.by(() => {
    if (disabled) return "text-(--faint-color) border border-transparent cursor-not-allowed"
    switch (role) {
      case "primary":
      case "destructive":
        return "text-(--on-accent) border border-transparent shadow-(--elevation-1) hover:brightness-90 dark:hover:brightness-115"
      case "secondary":
        return "text-(--font-color) border border-(--border-color) hover:bg-(--container-color)"
      default:
        return "text-(--accent-color) border border-transparent hover:bg-(--accent-soft)"
    }
  })

  const handleClick = (event: Event) => {
    if (disabled || !onClick) return
    event?.stopPropagation()
    onClick()
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (disabled || !keyBind.key || !onClick) return
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

  onMount(() => {
    if (keyBind) window.addEventListener("keydown", handleKeyDown)
    return () => {
      if (keyBind) window.removeEventListener("keydown", handleKeyDown)
    }
  })
</script>

<div class={twMerge(`relative flex w-full flex-col items-center`, wrapperClass)}>
  <button
    {id}
    class={`${twMerge(
      `relative inline-flex w-full items-center justify-center gap-2 leading-none font-semibold text-[14px] select-none
       transition-[background-color,filter,box-shadow] duration-150
       focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-color)
       ${isIconOnly ? "aspect-square rounded-full p-0" : "h-8 rounded-[10px] px-4 py-2"}
       ${disabled ? "" : "cursor-pointer active:scale-[0.97]"}`,
      roleClass,
      componentClass,
    )} ${roleBg}`}
    onclick={(event) => handleClick(event)}
    {disabled}
    aria-label={content.name || undefined}
    onmouseenter={() => {
      if (content.info?.text) showInfo = true
    }}
    onmouseleave={() => {
      if (content.info?.text) showInfo = false
    }}
  >
    {#if content?.icon}
      <span
        class={`flex shrink-0 items-center justify-center overflow-visible
          ${content.name?.trim() ? "h-[18px] w-[18px]" : "h-full w-full"}
          [&_svg]:h-full [&_svg]:max-h-full [&_svg]:w-full [&_svg]:max-w-full`}
      >
        {#if typeof content?.icon === "string"}
          {@html content.icon}
        {:else}
          {@const IconComponent = content?.icon}
          <IconComponent />
        {/if}
      </span>
    {/if}

    {#if content.name?.trim()}
      <span class="truncate">{content.name}</span>
      {#if keyBind.key && keyBind.showHint}
        <span class="ml-1 text-[11px] font-medium tabular-nums opacity-60">
          {keyBind.ctrlKey ? "Ctrl+" : ""}{keyBind.shiftKey ? "Shift+" : ""}{keyBind.altKey ? "Alt+" : ""}{keyBind.key}
        </span>
      {/if}
    {/if}
  </button>

  <Tooltip show={showInfo} text={content.info?.text ?? ""} side={content.info?.side ?? "top"} />
</div>
