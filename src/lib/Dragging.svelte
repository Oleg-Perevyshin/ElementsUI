<script lang="ts">
  import { tick } from "svelte"
  import MoveVerticalIcon from "./libIcons/MoveVerticalIcon.svelte"
  import { twMerge } from "tailwind-merge"
  import { animateReorder, applyDragGhost, clearDragGhost, createDropPlaceholder } from "./dragStyle"

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
    /* Строка ищется только внутри своего списка — id вида item-N есть и у других списков на странице */
    const movedElement = container.querySelector(
      containerIndex == null ? `#${elementsId}-${elementIndex}` : `#${elementsId}-${elementIndex}-${containerIndex}`,
    ) as HTMLElement

    if (!movedElement) return

    const element = movedElement.cloneNode(true) as HTMLElement
    const rect = movedElement.getBoundingClientRect()

    /* Визуальный эффект перетаскивания — общий для библиотеки и приложений (dragStyle.ts) */
    element.id = "drag-element"
    element.style.position = "fixed"
    element.style.zIndex = "9999"
    element.style.minHeight = `${rect.height}px`
    element.style.pointerEvents = "none"
    element.style.width = `${rect.width}px`
    element.style.left = `${rect.left}px`
    element.style.top = `${rect.top}px`
    applyDragGhost(element)
    movedElement.parentNode?.appendChild(element)

    const placeholder = createDropPlaceholder(rect.height)
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

    commandItems = Array.from(container.querySelectorAll(`[id^="${elementsId}-"]`) || [])

    e.preventDefault()
    e.stopPropagation()
  }

  const processDrag = (e: MouseEvent) => {
    if (!dragState.isDragging || !dragState.ghostElement || !dragState.placeholderElement) return
    const ghost = dragState.ghostElement
    ghost.style.top = `${e.clientY - dragState.offsetY}px`

    /*
      Место вставки — перед первой строкой, середина которой ниже курсора (иначе — в конец): меняется только при пересечении середины
      строки, без дрожания на границах. Соседние строки сдвигаются плавно (animateReorder)
    */
    const items = commandItems.filter((item) =>
      dragState.containerIndex === null ? true : Number(item.id.split("-")[2]) === dragState.containerIndex,
    ) as HTMLElement[]
    if (!items.length) return
    let target = items[items.length - 1]
    for (const item of items) {
      const rect = item.getBoundingClientRect()
      /* Положение в раскладке, без сдвига идущей анимации — иначе движущаяся строка снова «пересекала» бы курсор */
      const transform = getComputedStyle(item).transform
      const shift = transform && transform !== "none" ? new DOMMatrixReadOnly(transform).m42 : 0
      if (e.clientY < rect.top - shift + rect.height / 2) {
        target = item
        break
      }
    }
    const newIndex = Number(target.id.split("-")[1])
    if (newIndex === dragState.dropIndex && dragState.placeholderElement.nextSibling === target) return
    dragState.dropIndex = newIndex

    const placeholder = dragState.placeholderElement
    if (target.parentNode && placeholder.nextSibling !== target) {
      animateReorder(items, () => target.parentNode?.insertBefore(placeholder, target))
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
    clearDragGhost()

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
  class={twMerge(
    `size-8 [&_svg]:h-full [&_svg]:max-h-full [&_svg]:w-full [&_svg]:max-w-full ${array.length == 1 ? "opacity-50 cursor-not-allowed" : "cursor-move"} `,
    wrapperClass,
  )}
  role="button"
  tabindex={0}
  onkeydown={null}
  onmousedown={(e) => {
    if (array.length !== 1) {
      startDrag(e)
    }
  }}
>
  <MoveVerticalIcon />
</div>
