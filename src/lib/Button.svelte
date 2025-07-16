<!-- $lib/ElementsUI/Button.svelte -->
<script lang="ts">
  import { onMount } from 'svelte'
 
  /* Интерфейс обработчика для UI компонента */
  export interface IUIComponentHandler {
    Action: string // Действие (имя функции, как правило отправка в WebSocket)
    Header?: string // Заголовок пакета
    Argument?: string // Аргумент
    Variables?: string[] // Массив переменных
  }

  /* Интерфейс кнопки */
  export interface IButtonProps {
    id?: { value?: string; name?: string }
    wrapperClass?: string
    label?: { name?: string; class?: string }
    componentClass?: string
    name?: string
    icon?: {
      component?: ConstructorOfATypedSvelteComponent | null
      properties?: Record<string, unknown>
    }
    keyBind?: {
      key?: string
      ctrlKey?: boolean
      shiftKey?: boolean
      altKey?: boolean
      metaKey?: boolean /* Поддержка Meta (Cmd на Mac) */
    }
    disabled?: boolean
    eventHandler?: IUIComponentHandler
    onClick?: (id: string, eventHandler: IUIComponentHandler) => void
    onKeyBind?: (id: string, eventHandler: IUIComponentHandler) => void
  }

  let {
    id = { value: crypto.randomUUID(), name: '' },
    wrapperClass = '',
    label = { name: '', class: '' },
    name = '',
    componentClass = '',
    icon = { component: null, properties: {} },
    disabled = false,
    keyBind,
    eventHandler = { Action: 'none' },
    onClick,
    onKeyBind,
  }: IButtonProps = $props()

  /* Обработчик клика */
  const handleClick = () => {
    if (disabled || !onClick) return
    onClick(id.value ?? '', eventHandler)
  }

  /* Обработчик горячих клавиш */
  const handleKeyDown = (event: KeyboardEvent) => {
    if (disabled || !keyBind || !onKeyBind) return

    const isKeyMatch = event.key === keyBind.key
    const isCtrlMatch = keyBind.ctrlKey === undefined || event.ctrlKey === keyBind.ctrlKey
    const isShiftMatch = keyBind.shiftKey === undefined || event.shiftKey === keyBind.shiftKey
    const isAltMatch = keyBind.altKey === undefined || event.altKey === keyBind.altKey
    const isMetaMatch = keyBind.metaKey === undefined || event.metaKey === keyBind.metaKey

    if (isKeyMatch && isCtrlMatch && isShiftMatch && isAltMatch && isMetaMatch) {
      event.preventDefault()
      onKeyBind(id.value ?? '', eventHandler)
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
        relative m-0 inline-block w-full items-center rounded-2xl border border-[var(--border-color)] bg-[var(--bg-color)]
        px-2 py-1 font-semibold transition duration-200 select-none
        ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:shadow-md active:scale-95'}
        ${componentClass}
      `}
      onclick={handleClick}
      {disabled}
      aria-label={name || label.name}
    >
      <span class="flex flex-row items-center justify-center gap-4">
        {#if icon?.component}
          {@const IconComponent = icon?.component}
          <IconComponent {...icon?.properties} />
        {/if}
        {#if name}
          <div class="flex-1">
            {name}
            {#if keyBind}
              <div class="text-xs opacity-70">
                ({keyBind.ctrlKey ? 'Ctrl+' : ''}
                {keyBind.shiftKey ? 'Shift+' : ''}
                {keyBind.altKey ? 'Alt+' : ''}
                {keyBind.key})
              </div>
            {/if}
          </div>
        {/if}
      </span>
    </button>
  </div>
</div>
