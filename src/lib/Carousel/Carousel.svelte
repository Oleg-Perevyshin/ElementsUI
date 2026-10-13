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
  <!-- По design-handoff (раздел 9): сплошной фон, стрелки 32 px на поверхности с линией и тенью уровня 2 -->
  <div class="relative w-full overflow-hidden rounded-2xl bg-(--container-color)">
    <!-- Кнопки навигации -->
    {#if !isAtStart}
      <button
        transition:slide={{ axis: "x" }}
        class="absolute z-10 size-[32px] -translate-y-1/2 cursor-pointer top-1/2 left-1 p-1.5 rounded-full border border-(--hairline-color) bg-(--back-color) text-(--muted-color) transition-colors duration-150 hover:text-(--font-color) [&_svg]:h-full [&_svg]:max-h-full [&_svg]:w-full shadow-(--elevation-2) rotate-180"
        onclick={() => scrollCarousel(-scrollValue)}
      >
        <ArrowIcon />
      </button>
    {/if}
    {#if !isAtEnd}
      <button
        transition:slide={{ axis: "x" }}
        class="absolute z-10 size-[32px] -translate-y-1/2 cursor-pointer top-1/2 right-1 p-1.5 rounded-full border border-(--hairline-color) bg-(--back-color) text-(--muted-color) transition-colors duration-150 hover:text-(--font-color) [&_svg]:h-full [&_svg]:max-h-full [&_svg]:w-full shadow-(--elevation-2)"
        onclick={() => scrollCarousel(scrollValue)}
      >
        <ArrowIcon />
      </button>
    {/if}

    <div {id} bind:this={carouselRef} class="flex overflow-hidden gap-2 p-2">
      {@render children?.()}
    </div>
  </div>
</div>
