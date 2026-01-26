<!-- $lib/ElementsUI/Button.svelte -->
<script lang="ts">
  import { onMount } from "svelte"
  import type { IButtonProps } from "../types"
  import { fly } from "svelte/transition"
  import { twMerge } from "tailwind-merge"

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
    keyBind,
    onClick,
  }: IButtonProps = $props()

  let showInfo = $state(false)

  let tooltipConfig = $derived({
    top: {
      pos: "bottom-full left-1/2 mb-2",
      tr: "translateX(-50%)",
      arr: "top-full left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45",
      off: "y:-15",
    },
    bottom: {
      pos: "top-full left-1/2 mt-2",
      tr: "translateX(-50%)",
      arr: "bottom-full left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45",
      off: "y:15",
    },
    left: {
      pos: "top-1/2 right-full mr-2",
      tr: "translateY(-50%)",
      arr: "top-1/2 -right-2 -translate-x-1/2 -translate-y-1/2 rotate-45",
      off: "x:15",
    },
    right: {
      pos: "top-1/2 left-full ml-2",
      tr: "translateY(-50%)",
      arr: "top-1/2 -left-2 translate-x-1/2 -translate-y-1/2 rotate-45 ",
      off: "x:-15",
    },
  })

  const svgSize = $derived(() => {
    const widthClass = twMerge(
      wrapperClass.split(" ").find((cls: string) => cls.startsWith("w-")),
      componentClass.split(" ").find((cls: string) => cls.startsWith("w-")),
    )
    const heightClass = twMerge(
      wrapperClass.split(" ").find((cls: string) => cls.startsWith("h-")),
      componentClass.split(" ").find((cls: string) => cls.startsWith("h-")),
    )
    return `${widthClass} ${heightClass}`
  })

  /* Обработчик клика */
  const handleClick = () => {
    if (disabled || !onClick) return
    onClick()
  }

  /* Обработчик горячих клавиш */
  const handleKeyDown = (event: KeyboardEvent) => {
    if (disabled || !keyBind || !onClick) return

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

  /* Подписка на события клавиатуры */
  onMount(() => {
    if (keyBind) window.addEventListener("keydown", handleKeyDown)

    return () => {
      if (keyBind) window.removeEventListener("keydown", handleKeyDown)
    }
  })
</script>

<div class={twMerge(`relative flex w-full flex-col items-center `, wrapperClass)}>
  <button
    id={`${id}-${crypto.randomUUID().slice(0, 6)}`}
    class="{twMerge(
      `relative m-0 inline-block w-full items-center rounded-2xl px-2
        py-1 font-semibold  transition duration-200 select-none 
        ${content.icon && !content.name ? 'bg-transparent p-0' : 'bg-blue border border-(--bg-color) shadow-sm hover:shadow-md'}
        ${disabled ? 'cursor-not-allowed opacity-50 hover:shadow-none' : 'cursor-pointer   active:scale-97'} `,
      componentClass,
    )} bg-(--bg-color)"
    onclick={handleClick}
    {disabled}
    aria-label={content.name}
    onmouseenter={() => {
      if (content.info?.text) showInfo = true
    }}
    onmouseleave={() => {
      if (content.info?.text) showInfo = false
    }}
  >
    <div class=" flex flex-row items-center justify-center gap-2">
      {#if content?.icon}
        <span
          class={` ${content.name ? "absolute left-3" : ""} ${typeof content?.icon == "string" ? "p-0.5" : ""}  flex items-center justify-center overflow-visible 
            ${content.name ? "h-8 w-8" : `${svgSize()}`} [&_svg]:h-full [&_svg]:max-h-full [&_svg]:w-full [&_svg]:max-w-full`}
        >
          {#if typeof content?.icon === "string"}
            {@html content.icon}
          {:else}
            {@const IconComponent = content?.icon}
            <IconComponent />
          {/if}
        </span>
      {/if}

      {#if content.name}
        <div class="flex-1">
          {content.name}
          {#if keyBind}
            <div class="text-xs opacity-70">
              ({keyBind.ctrlKey ? "Ctrl+" : ""}{keyBind.shiftKey ? "Shift+" : ""}{keyBind.altKey ? "Alt+" : ""}{keyBind.key})
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </button>

  {#if showInfo && content.info?.side && tooltipConfig[content.info?.side]}
    {@const config = tooltipConfig[content.info?.side]}
    <div
      transition:fly={{ [config.off.split(":")[0]]: parseInt(config.off.split(":")[1]), duration: 300 }}
      class={`absolute z-50 w-max max-w-xs rounded-md bg-(--container-color) px-3 py-1 text-sm shadow-lg ${config.pos}`}
      style={`transform: ${config.tr};`}
    >
      {content.info?.text}
      <div class={`absolute ${config.arr} h-2 w-2 transform bg-(--container-color)`}></div>
    </div>
  {/if}
</div>
