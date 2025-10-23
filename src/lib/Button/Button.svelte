<!-- $lib/ElementsUI/Button.svelte -->
<script lang="ts">
  import { onMount } from 'svelte'
  import type { IButtonProps } from '../types'
  import { fly } from 'svelte/transition'
  import { twMerge } from 'tailwind-merge'

  let {
    id = crypto.randomUUID(),
    wrapperClass = '',
    componentClass = '',
    disabled = false,
    content = {
      name: '',
      info: { text: '', side: 'top' },
      icon: null,
    },
    keyBind,
    onClick,
  }: IButtonProps = $props()

  let showInfo = $state(false)

  const svgSize = $derived(() => {
    const widthClass = twMerge(
      wrapperClass.split(' ').find((cls: string) => cls.startsWith('w-')),
      componentClass.split(' ').find((cls: string) => cls.startsWith('w-')),
    )
    const heightClass = twMerge(
      wrapperClass.split(' ').find((cls: string) => cls.startsWith('h-')),
      componentClass.split(' ').find((cls: string) => cls.startsWith('h-')),
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
    if (keyBind) window.addEventListener('keydown', handleKeyDown)
    return () => {
      if (keyBind) window.removeEventListener('keydown', handleKeyDown)
    }
  })
</script>

<div class={twMerge(`relative flex w-full flex-col items-center `, wrapperClass)}>
  <div class="relative flex w-full grow items-center">
    <button
      {id}
      class="{twMerge(
        `relative m-0 inline-block w-full items-center rounded-2xl 
        px-2 py-1 font-semibold  transition duration-200 select-none
        ${content.icon && !content.name ? 'bg-transparent p-0' : 'bg-blue border border-(--bg-color) '}
        ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer  active:scale-97'} `,
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
      <span class=" flex flex-row items-center justify-center gap-2">
        {#if content?.icon}
          <span
            class={`flex items-center justify-center overflow-visible 
            ${content.name ? 'h-8 w-8' : `${svgSize()}`} [&_svg]:h-full [&_svg]:max-h-full [&_svg]:w-full [&_svg]:max-w-full`}
          >
            {#if typeof content?.icon === 'string'}
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
                ({keyBind.ctrlKey ? 'Ctrl+' : ''}{keyBind.shiftKey ? 'Shift+' : ''}{keyBind.altKey ? 'Alt+' : ''}{keyBind.key})
              </div>
            {/if}
          </div>
        {/if}
      </span>
    </button>

    {#if showInfo && content.info?.side === 'top'}
      <div
        transition:fly={{ y: -15, duration: 300 }}
        class="absolute bottom-full left-1/2 z-50 mb-2 max-w-min min-w-fit rounded-md bg-(--container-color) px-3 py-1 text-sm shadow-lg"
        style="transform: translateX(-50%);"
      >
        {content.info?.text}
        <div class="absolute top-full left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 transform bg-(--container-color)"></div>
      </div>
    {:else if showInfo && content.info?.side === 'bottom'}
      <div
        transition:fly={{ y: 15, duration: 300 }}
        class="absolute top-full left-1/2 z-50 mt-2 max-w-min min-w-fit rounded-md bg-(--container-color) px-3 py-1 text-sm shadow-lg"
        style="transform: translateX(-50%);"
      >
        {content.info?.text}
        <div class="absolute bottom-full left-1/2 h-2 w-2 -translate-x-1/2 translate-y-1/2 rotate-45 transform bg-(--container-color)"></div>
      </div>
    {:else if showInfo && content.info?.side === 'left'}
      <div
        transition:fly={{ x: 15, duration: 300 }}
        class="absolute top-1/2 right-full z-50 mr-2 max-w-min min-w-fit rounded-md bg-(--container-color) px-3 py-1 text-sm shadow-lg"
        style="transform: translateY(-50%);"
      >
        {content.info?.text}
        <div class="absolute top-1/2 -right-2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 transform bg-(--container-color)"></div>
      </div>
    {:else if showInfo && content.info?.side === 'right'}
      <div
        transition:fly={{ x: -15, duration: 300 }}
        class="absolute top-1/2 left-full z-50 ml-2 max-w-min min-w-fit rounded-md bg-(--container-color) px-3 py-1 text-sm shadow-lg"
        style="transform: translateY(-50%);"
      >
        {content.info?.text}
        <div class="absolute top-1/2 -left-2 h-2 w-2 translate-x-1/2 -translate-y-1/2 -rotate-45 transform bg-(--container-color)"></div>
      </div>
    {/if}
  </div>
</div>
