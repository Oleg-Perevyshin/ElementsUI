<!-- $lib/ElementsUI/Button.svelte -->
<script lang="ts">
  import { onMount } from 'svelte'
  // import { type IButtonProps } from '../types'
  import { fly } from 'svelte/transition'

  interface IUIComponentHandler {
    Header?: string
    Argument?: string
    Value?: string
    Variables?: string[]
  }

  interface IButtonProps {
    id?: { value?: string; name?: string }
    wrapperClass?: string
    label?: { name?: string; class?: string }
    componentClass?: string
    name?: string
    icon?: {
      component?: ConstructorOfATypedSvelteComponent | null
      properties?: Record<string, unknown>
    }
    info?: string
    keyBind?: {
      key?: string
      ctrlKey?: boolean
      shiftKey?: boolean
      altKey?: boolean
      metaKey?: boolean /* Поддержка Meta (Cmd на Mac) */
    }
    disabled?: boolean
    eventHandler?: IUIComponentHandler
    onClick?: () => void
  }

  let {
    id = { value: crypto.randomUUID(), name: '' },
    wrapperClass = 'bg-blue',
    label = { name: '', class: '' },
    name = '',
    componentClass = '',
    icon = { component: null, properties: {} },
    info = '',
    disabled = false,
    keyBind,
    onClick,
  }: IButtonProps = $props()

  let showInfo = $state(false)

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
    if (keyBind) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      if (keyBind) {
        window.removeEventListener('keydown', handleKeyDown)
      }
    }
  })
</script>

<div class={`relative flex w-full flex-col items-center ${wrapperClass}`}>
  {#if label.name}
    <h5 class={`w-full px-4 text-center ${label.class}`}>{label.name}</h5>
  {/if}

  <div class="relative flex w-full grow items-center">
    <button
      id={id.value}
      class={`
        relative m-0 inline-block w-full items-center rounded-2xl border border-[var(--bg-color)] bg-[var(--bg-color)]
        px-2 py-1 font-semibold transition duration-200 select-none
        ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:shadow-md active:scale-97'}
        ${componentClass}
      `}
      onclick={handleClick}
      {disabled}
      aria-label={name || label.name}
      onmouseenter={() => {
        if (info) showInfo = true
      }}
      onmouseleave={() => {
        if (info) showInfo = false
      }}
    >
      <span class="flex flex-row items-center justify-center gap-2">
        {#if icon?.component}
          {@const IconComponent = icon?.component}
          <IconComponent {...icon?.properties} />
        {/if}
        {#if name}
          <div class="flex-1">
            {name}
            {#if keyBind}
              <div class="text-xs opacity-70">
                ({keyBind.ctrlKey ? 'Ctrl+' : ''}{keyBind.shiftKey ? 'Shift+' : ''}{keyBind.altKey ? 'Alt+' : ''}{keyBind.key})
              </div>
            {/if}
          </div>
        {/if}
      </span>
    </button>

    {#if showInfo}
      <div
        transition:fly={{ y: -15, duration: 300 }}
        class="absolute bottom-full left-1/2 z-50 mb-2 w-max max-w-xs rounded-md px-3 py-1 text-sm shadow-lg"
        style="background: color-mix(in srgb, var(--yellow-color) 30%, var(--back-color)); transform: translateX(-50%);"
      >
        {info}
        <!-- Треугольная стрелка -->
        <div
          class="absolute top-full left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 transform"
          style="background: color-mix(in srgb, var(--yellow-color) 30%, var(--back-color));"
        ></div>
      </div>
    {/if}
  </div>
</div>
