<script lang="ts">
  import { twMerge } from "tailwind-merge"
  import ArrowIcon from "../libIcons/ArrowIcon.svelte"
  import { slide } from "svelte/transition"
  import type { ICarouselProps } from "$lib/types"

  let { id = crypto.randomUUID(), wrapperClass = "", label = { name: "", class: "text-left" }, scrollValue = 200, children }: ICarouselProps = $props()

  let carouselRef: HTMLDivElement | null = $state(null)
  let isAtStart = $state(true)
  let isAtEnd = $state(true)

  function scrollCarousel(delta: number) {
    if (carouselRef) carouselRef.scrollBy({ left: delta, behavior: "smooth" })
  }

  function updateScrollState() {
    if (!carouselRef) return
    isAtStart = carouselRef.scrollLeft === 0
    isAtEnd = carouselRef.scrollLeft + carouselRef.clientWidth >= carouselRef.scrollWidth - 1
  }

  $effect(() => {
    if (!carouselRef) return
    updateScrollState()

    const onScroll = () => updateScrollState()
    carouselRef.addEventListener("scroll", onScroll)

    const resizeObserver = new ResizeObserver(() => updateScrollState())
    resizeObserver.observe(carouselRef)

    return () => {
      carouselRef?.removeEventListener("scroll", onScroll)
      resizeObserver.disconnect()
    }
  })
</script>

<div class={twMerge(`flex flex-col items-center`, wrapperClass)}>
  {#if label.name}
    <h5 class={`${label.class}`}>{label.name}</h5>
  {/if}
  <!-- Карусель -->
  <div class="relative w-full overflow-hidden rounded-2xl bg-(--back-color)/50">
    <!-- Кнопки навигации -->
    {#if !isAtStart}
      <button
        transition:slide={{ axis: "x" }}
        class="absolute z-10 size-10 -translate-y-1/2 cursor-pointer top-1/2 left-1 p-2 rounded-full bg-(--field-color) [&_svg]:h-full [&_svg]:max-h-full [&_svg]:w-full shadow-[0_0_6px_var(--shadow-color)] rotate-180"
        onclick={() => scrollCarousel(-scrollValue)}>
        <ArrowIcon />
      </button>
    {/if}
    {#if !isAtEnd}
      <button
        transition:slide={{ axis: "x" }}
        class="absolute z-10 size-10 -translate-y-1/2 cursor-pointer top-1/2 right-1 p-2 rounded-full bg-(--field-color) [&_svg]:h-full [&_svg]:max-h-full [&_svg]:w-full shadow-[0_0_6px_var(--shadow-color)]"
        onclick={() => scrollCarousel(scrollValue)}>
        <ArrowIcon />
      </button>
    {/if}

    <div {id} bind:this={carouselRef} class="flex overflow-hidden gap-2 p-2">
      {@render children?.()}
    </div>
  </div>
</div>
