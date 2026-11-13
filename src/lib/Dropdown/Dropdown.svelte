<!-- $lib/Dropdown/Dropdown.svelte - выпадающее меню или поповер: кнопка-триггер и панель, вынесенная в body и позиционированная от окна (fixed, как список Select). Закрывается кликом вне, Escape, выбором пункта; стрелки, Home/End, Enter -->
<script lang="ts">
  import { tick } from "svelte"
  import { fly } from "svelte/transition"
  import { twMerge } from "tailwind-merge"
  import type { IDropdownItem, IDropdownProps, IDropdownTriggerProps } from "../types"
  import { accentStyle } from "../accent"
  import Button from "../Button/Button.svelte"
  import Icon from "../Icon.svelte"
  import { nextEnabled, popupPlace } from "../popup"

  let {
    wrapperClass = "",
    componentClass = "",
    isOpen = $bindable(false),
    disabled = false,
    button,
    trigger,
    items,
    children,
    align = "start",
    maxHeight = "20rem",
    onSelect,
    onOpenChange,
  }: IDropdownProps = $props()

  const uid = $props.id()
  const triggerId = `${uid}-trigger`
  const panelId = `${uid}-panel`
  const isMenu = $derived(!!items?.length)

  let anchorElement: HTMLDivElement | undefined = $state()
  let panelElement: HTMLDivElement | undefined = $state()
  let anchorRect: DOMRect | null = $state(null)
  /* Ширина открытой панели: панель шире места до края окна сдвигается внутрь */
  let panelWidth = $state(0)

  /* Панель выносится в body, чтобы её не обрезал overflow предка; data-ui-portal - Modal не считает клик по ней кликом снаружи */
  const portal = (node: HTMLElement) => {
    document.body.appendChild(node)
    return { destroy: () => node.remove() }
  }

  /* Панель открывается вниз, а если снизу места мало и сверху больше - вверх; по краю триггера, но не за край окна */
  const placement = $derived.by(() => {
    if (!anchorRect) return ""
    const place = popupPlace(anchorRect, { width: window.innerWidth, height: window.innerHeight }, align, { minWidth: Math.max(panelWidth, 160) })
    const sides = (["top", "bottom", "left", "right"] as const).filter((side) => place[side] !== undefined).map((side) => `${side}: ${place[side]}px;`)
    return `${sides.join(" ")} min-width: max(${anchorRect.width}px, 10rem); max-width: calc(100vw - 16px); --dropdown-space: ${place.space}px;`
  })

  const setOpen = (next: boolean) => {
    if (next === isOpen) return
    isOpen = next
    onOpenChange?.(next)
  }

  const focusTrigger = () => anchorElement?.querySelector<HTMLElement>("button, [tabindex]")?.focus()

  const close = (returnFocus = false) => {
    setOpen(false)
    if (returnFocus) focusTrigger()
  }

  /* Доступные пункты меню в порядке показа */
  const menuButtons = () => [...(panelElement?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not([aria-disabled="true"])') ?? [])]

  const focusItem = (which: "first" | "last" | 1 | -1) => {
    const list = menuButtons()
    if (!list.length) return
    const current = list.indexOf(document.activeElement as HTMLButtonElement)
    const index = which === "first" ? 0 : which === "last" ? list.length - 1 : nextEnabled(list.length, current, which)
    list[index]?.focus()
  }

  const open = async (focus: "first" | "last" | null = null) => {
    if (disabled) return
    setOpen(true)
    if (!focus || !isMenu) return
    await tick()
    focusItem(focus)
  }

  /* Пока панель открыта: позиция следует за триггером, клик вне триггера и панели закрывает */
  $effect(() => {
    if (!isOpen) return
    const place = () => (anchorRect = anchorElement?.getBoundingClientRect() ?? null)
    const outside = (event: PointerEvent) => {
      const target = event.target as Node
      /* Клик по вынесенному в body списку вложенного компонента (Select внутри панели) - не клик снаружи */
      const inPortal = target instanceof Element && !!target.closest("[data-ui-portal]")
      if (!anchorElement?.contains(target) && !panelElement?.contains(target) && !inPortal) close()
    }
    place()
    window.addEventListener("scroll", place, true)
    window.addEventListener("resize", place)
    document.addEventListener("pointerdown", outside)
    return () => {
      window.removeEventListener("scroll", place, true)
      window.removeEventListener("resize", place)
      document.removeEventListener("pointerdown", outside)
    }
  })

  const onTriggerKeydown = (event: KeyboardEvent) => {
    if (disabled) return
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault()
      if (isOpen) focusItem(event.key === "ArrowDown" ? "first" : "last")
      else open(event.key === "ArrowDown" ? "first" : "last")
    } else if (event.key === "Escape" && isOpen) {
      /* Escape закрывает только панель, не модальное окно вокруг */
      event.preventDefault()
      event.stopPropagation()
      close()
    }
  }

  const onPanelKeydown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault()
      event.stopPropagation()
      close(true)
    } else if (event.key === "Tab") close()
    else if (isMenu && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      event.preventDefault()
      focusItem(event.key === "ArrowDown" ? 1 : -1)
    } else if (isMenu && (event.key === "Home" || event.key === "End")) {
      event.preventDefault()
      focusItem(event.key === "Home" ? "first" : "last")
    }
  }

  const choose = (item: IDropdownItem, index: number) => {
    if (item.disabled) return
    item.onClick?.()
    onSelect?.(item, index)
    close(true)
  }

  const toggle = () => (isOpen ? close() : open(null))

  const triggerProps: IDropdownTriggerProps = $derived({
    id: triggerId,
    "aria-haspopup": items?.length ? "menu" : "dialog",
    "aria-expanded": isOpen,
    "aria-controls": panelId,
    disabled,
    onclick: (event: MouseEvent) => {
      event.stopPropagation()
      toggle()
    },
    onkeydown: onTriggerKeydown,
  })
</script>

<div bind:this={anchorElement} class={twMerge("relative inline-flex", wrapperClass)}>
  {#if trigger}
    {@render trigger(triggerProps, isOpen)}
  {:else}
    <!-- Клавиатуру у Button ловит обёртка: стрелки и Escape всплывают с кнопки -->
    <div class="contents" role="presentation" onkeydown={onTriggerKeydown}>
      <Button {...button} id={triggerId} {disabled} aria={{ haspopup: isMenu ? "menu" : "dialog", expanded: isOpen, controls: panelId }} onClick={toggle} />
    </div>
  {/if}
</div>

{#if isOpen}
  <div
    use:portal
    bind:this={panelElement}
    bind:offsetWidth={panelWidth}
    id={panelId}
    data-ui-portal
    class={twMerge(
      "fixed z-[9999] overflow-y-auto rounded-[10px] border border-(--hairline-color) bg-(--back-color) p-1 text-[14px] text-(--font-color) shadow-(--elevation-2)",
      componentClass,
    )}
    style="{placement} max-height: min({maxHeight}, var(--dropdown-space, {maxHeight}));"
    role={isMenu ? "menu" : "dialog"}
    aria-labelledby={triggerId}
    tabindex="-1"
    transition:fly={{ y: -4, duration: 120 }}
    onkeydown={onPanelKeydown}
  >
    {#if isMenu}
      {#each items ?? [] as item, index (item.id ?? index)}
        {#if item.divider}
          <div class="mx-1 my-1 h-px bg-(--hairline-color)" role="separator"></div>
        {:else}
          <button
            type="button"
            class="flex h-8 w-full items-center gap-2 rounded-md border-none bg-transparent px-2.5 text-left whitespace-nowrap transition-colors duration-150 outline-none
              {item.disabled
              ? 'cursor-not-allowed text-(--faint-color)'
              : `cursor-pointer hover:bg-(--container-color) focus-visible:bg-(--container-color) ${item.accent ? 'text-(--accent-text)' : ''}`}"
            style={accentStyle(item.accent)}
            role="menuitem"
            tabindex="-1"
            aria-disabled={item.disabled || undefined}
            onclick={() => choose(item, index)}
            onpointermove={(event) => {
              if (!item.disabled) event.currentTarget.focus()
            }}
          >
            <Icon icon={item.icon} class="flex size-[18px] shrink-0 items-center justify-center [&_svg]:h-full [&_svg]:w-full" />
            <span class="min-w-0 flex-1 truncate">{item.name}</span>
          </button>
        {/if}
      {/each}
    {:else}
      {@render children?.(() => close(true))}
    {/if}
  </div>
{/if}
