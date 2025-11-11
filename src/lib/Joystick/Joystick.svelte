<!-- $lib/ElementsUI/ProgressBar.svelte -->
<script lang="ts">
  import { twMerge } from 'tailwind-merge'
  import type { IProgressBarProps } from '../types'

  let {
    id = crypto.randomUUID(),
    wrapperClass = '',
    label = { name: '', class: '' },
    value = $bindable(0),
    number = {
      minNum: 0,
      maxNum: 100,
      units: '%',
    },
  }: IProgressBarProps = $props()

  const directions = [
    { id: 'right', angle: 30.5, content: true },
    { id: 'bottom-right', angle: 58, content: false },
    { id: 'bottom', angle: 122, content: true },
    { id: 'bottom-left', angle: 149.5, content: false },
    { id: 'left', angle: 212, content: true },
    { id: 'top-left', angle: 239, content: false },
    { id: 'top', angle: 301, content: true },
    {
      id: 'top-right',
      angle: 328,
      content: false,
    },
  ]

  let sectorHeight = 2 * 5 * Math.sin(Math.PI / directions.length)
  let clipPos = Math.cos(Math.PI / directions.length) * 100
  let angle = 360 / directions.length
</script>

<div {id} class={twMerge(`bg-red relative flex w-full flex-col items-center`, wrapperClass)}>
  {#if label.name}
    <h5 class={twMerge(` w-full px-4 text-center`, label.class)}>{label.name}</h5>
  {/if}

  <div class="relative flex size-40 items-center justify-center rounded-full bg-(--bg-color) shadow-[0_0_20px_rgb(0_0_0_/0.25)]">
    <div class="absolute h-full w-full overflow-hidden rounded-full">
      {#each directions as direction, index}
        <button class="pointer-events-none absolute top-1/2 left-1/2 block w-1/2 -translate-y-1/2 cursor-pointer" title="">
          <span
            class="relative flex w-full origin-left items-center justify-center pl-[60%] h-[{direction.content
              ? 2 * 5 * Math.sin((Math.PI * 65) / 360)
              : 2 * 5 * Math.sin((Math.PI * 25) / 360)}rem] pointer-events-auto
            {direction.content ? 'bg-(--bg-color)' : ''}
            "
            style="transform: rotate({angle * index}deg); clip-path: polygon(100% 0, {clipPos}% 0, 0 50%, {clipPos}% 100%, 100% 100%)"
            role="application"
            onmouseenter={(e) => (e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--bg-color), var(--shadow-color) 20%)')}
            onmouseleave={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-color)')}
          >
            {#if direction.content}
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"
                ><path
                  fill="currentColor"
                  d="M12.6 12L8.7 8.1q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l4.6 4.6q.15.15.213.325t.062.375t-.062.375t-.213.325l-4.6 4.6q-.275.275-.7.275t-.7-.275t-.275-.7t.275-.7z"
                /></svg
              >
            {/if}
          </span>
        </button>
      {/each}
    </div>
    <div class=" pointer-events-none absolute h-full w-full overflow-hidden rounded-full">
      {#each directions as direction, index}
        <span
          class=" absolute top-1/2 left-1/2 h-0 w-[52%] origin-left border-b border-(--bg-color) {index % 2 == 0
            ? 'shadow-[0_3px_5px_rgb(0_0_0_/0.5)] '
            : 'shadow-[0_-3px_5px_rgb(0_0_0_/0.5)]'}"
          style="transform: rotate({direction.angle}deg);"
        >
        </span>
      {/each}
    </div>
    <div class="z-10 flex size-20 items-center justify-center rounded-full bg-(--bg-color) shadow-[0_0_15px_rgb(0_0_0_/0.25)]">
      <button class="flex size-18 cursor-pointer items-center justify-center rounded-full bg-(--bg-color)" title=""
        ><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"
          ><path
            fill="currentColor"
            d="M6 19h3v-5q0-.425.288-.712T10 13h4q.425 0 .713.288T15 14v5h3v-9l-6-4.5L6 10zm-2 0v-9q0-.475.213-.9t.587-.7l6-4.5q.525-.4 1.2-.4t1.2.4l6 4.5q.375.275.588.7T20 10v9q0 .825-.588 1.413T18 21h-4q-.425 0-.712-.288T13 20v-5h-2v5q0 .425-.288.713T10 21H6q-.825 0-1.412-.587T4 19m8-6.75"
          /></svg
        ></button
      >
    </div>
  </div>

  <!-- {direction.content ? 2 * 6.25 * Math.sin((Math.PI * 65) / 360) : 2 * 6.25 * Math.sin((Math.PI * 25) / 360)} -->
  <!-- angle / 2 + angle * index -->
  <!--             ? 'shadow-[0_-2px_5px_rgb(254_202_202)] '
            : 'shadow-[0_2px_5px_rgb(254_202_202)]'}" -->
</div>
