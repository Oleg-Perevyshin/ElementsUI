<script lang="ts" module>
  let dragState = $state({
    isDragging: false,
    element: null as any,
    startX: 0,
    startY: 0,
    offsetY: 0,
    ghostElement: null as HTMLElement | null,
    placeholderElement: null as HTMLElement | null,
    dropIndex: null as number | null,
    containerIndex: null as number | null,
    array: null as any[] | null,
  })

  let commandItems: Element[] = $state([])
</script>

<script lang="ts">
  import { tick } from "svelte"
  import MoveVerticalIcon from "./libIcons/MoveVerticalIcon.svelte"
  import { twMerge } from "tailwind-merge"

  let {
    wrapperClass,
    container,
    array,
    elementsId = "item",
    elementIndex,
    containerIndex,
    onUpdate,
  }: {
    wrapperClass?: string
    container: HTMLDivElement
    array: any[]
    elementsId?: string
    elementIndex: number
    onUpdate?: (arr: any[], index?: number | null) => void
    containerIndex?: number
  } = $props()

  /* Перетаскивание с MouseEvent */
  const startDrag = async (e: MouseEvent) => {
    const movedElement = document.querySelector(
      containerIndex == null ? `#${elementsId}-${elementIndex}` : `#${elementsId}-${elementIndex}-${dragState.containerIndex || containerIndex}`,
    ) as HTMLElement

    if (!movedElement) return

    const element = movedElement.cloneNode(true) as HTMLElement
    const rect = movedElement.getBoundingClientRect()

    /* Создаем визуальный эффект перетаскивания */
    element.id = "drag-element"
    element.style.position = "fixed"
    element.style.zIndex = "9999"
    element.style.minHeight = `${rect.height}px`
    element.style.pointerEvents = "none"
    element.style.width = `${rect.width}px`
    element.style.background = "var(--field-color)"
    element.style.padding = "0.25rem"
    element.style.borderRadius = "1rem"
    element.style.top = `${rect.top}px`
    movedElement.parentNode?.appendChild(element)

    const placeholder = document.createElement("div")
    placeholder.style.minHeight = `${rect.height}px`
    placeholder.style.width = "100%"
    placeholder.style.border = "2px dashed var(--blue-color)"
    placeholder.style.borderRadius = "1rem"
    element.parentNode?.insertBefore(placeholder, movedElement)

    const [movedItem] = array.splice(elementIndex, 1)
    if (onUpdate) onUpdate(array, dragState.containerIndex)

    await tick()

    dragState = {
      isDragging: true,
      element: movedItem,
      startX: e.clientX,
      startY: e.clientY,
      offsetY: e.clientY - rect.top,
      ghostElement: element,
      placeholderElement: placeholder,
      dropIndex: elementIndex,
      containerIndex: containerIndex ?? null,
      array,
    }

    // commandItems = Array.from(container[containerIndex ?? 0]?.querySelectorAll('[id^="item-"]') || [])
    commandItems = Array.from(container.querySelectorAll(`[id^="${elementsId}-"]`) || [])

    e.preventDefault()
    e.stopPropagation()
  }

  const processDrag = (e: MouseEvent) => {
    if (!dragState.isDragging || !dragState.ghostElement || !dragState.placeholderElement) return
    const ghost = dragState.ghostElement
    ghost.style.top = `${e.clientY - dragState.offsetY}px`

    const allElements = document.elementsFromPoint(dragState.startX, e.clientY)
    const cell = allElements.find((el) => el.id.startsWith(`${elementsId}-`)) as HTMLElement
    const newIndex =
      cell && (dragState.containerIndex !== null ? Number(cell.id.split("-")[2]) === dragState.containerIndex : true) ? Number(cell.id.split("-")[1]) : null

    /* Находим целевой элемент перед которым нужно вставить placeholder */
    if (newIndex === null) return
    dragState.dropIndex = newIndex

    const placeholder = dragState.placeholderElement
    const targetElement = commandItems[dragState.dropIndex]

    if (targetElement && targetElement.parentNode) {
      const nextSibling = placeholder.nextSibling
      if (nextSibling !== targetElement) targetElement.parentNode.insertBefore(placeholder, targetElement)
    }
  }

  const endDrag = () => {
    if (!dragState.isDragging || !dragState.ghostElement || !dragState.array) return

    /* Определение целевой ячейки под курсором */
    if (dragState.element !== null && dragState.dropIndex !== null) {
      const newArray = dragState.array
      newArray.splice(dragState.dropIndex, 0, dragState.element)
      if (onUpdate) onUpdate(newArray, dragState.containerIndex)
    }

    if (dragState.placeholderElement) dragState.placeholderElement.remove()
    if (dragState.ghostElement) dragState.ghostElement.remove()

    dragState = {
      isDragging: false,
      element: null,
      startX: 0,
      startY: 0,
      offsetY: 0,
      ghostElement: null,
      placeholderElement: null,
      dropIndex: null,
      containerIndex: null,
      array: null,
    }
  }

  /* Глобальные обработчики для mouse events */
  $effect(() => {
    if (dragState.isDragging) {
      window.addEventListener("mousemove", processDrag)
      window.addEventListener("mouseup", endDrag)

      return () => {
        window.removeEventListener("mousemove", processDrag)
        window.removeEventListener("mouseup", endDrag)
      }
    }
  })
</script>

<div
  id={crypto.randomUUID()}
  class={twMerge("cursor-move size-8 [&_svg]:h-full [&_svg]:max-h-full [&_svg]:w-full [&_svg]:max-w-full", wrapperClass)}
  role="button"
  tabindex={0}
  onkeydown={null}
  onmousedown={(e) => startDrag(e)}
>
  <MoveVerticalIcon />
</div>
