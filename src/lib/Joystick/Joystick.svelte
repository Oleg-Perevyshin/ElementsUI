<script lang="ts">
  import { twMerge } from 'tailwind-merge'
  import type { IJoystickProps } from '../types'

  let {
    id = crypto.randomUUID(),
    wrapperClass = '',
    label = { name: '', class: '' },
    value = $bindable([0, 0, 0]),
    limits = [
      { minNum: -100, maxNum: 100 },
      { minNum: -100, maxNum: 100 },
      { minNum: -100, maxNum: 100 },
    ],
    onUpdate = () => {},
  }: IJoystickProps = $props()

  const directions = [
    {
      id: 'right',
      angle: 30.5,
      content: true,
      onClick: () => {
        if (value[2] + sensitivity >= limits[2].maxNum) {
          value[2] = limits[2].maxNum
          onUpdate(value)
          return
        }

        value[2] = roundToClean(value[2] + sensitivity)
        onUpdate(value)
      },
    },
    {
      id: 'bottom-right',
      angle: 58,
      content: false,
      onClick: () => {
        if (value[2] + sensitivity >= limits[2].maxNum) {
          value[2] = limits[2].maxNum
          onUpdate(value)
        } else {
          value[2] = roundToClean(value[2] + sensitivity)
          onUpdate(value)
        }
        if (value[1] - sensitivity <= limits[1].minNum) {
          value[1] = limits[1].minNum
          onUpdate(value)
        } else {
          value[1] = roundToClean(value[1] - sensitivity)
          onUpdate(value)
        }
      },
    },
    {
      id: 'bottom',
      angle: 122,
      content: true,
      onClick: () => {
        if (value[1] - sensitivity <= limits[1].minNum) {
          value[1] = limits[1].minNum
          onUpdate(value)
          return
        }
        value[1] = roundToClean(value[1] - sensitivity)
        onUpdate(value)
      },
    },
    {
      id: 'bottom-left',
      angle: 149.5,
      content: false,
      onClick: () => {
        if (value[2] - sensitivity <= limits[2].minNum) {
          value[2] = limits[2].minNum
          onUpdate(value)
        } else {
          value[2] = roundToClean(value[2] - sensitivity)
          onUpdate(value)
        }
        if (value[1] - sensitivity <= limits[1].minNum) {
          value[1] = limits[1].minNum
          onUpdate(value)
        } else {
          value[1] = roundToClean(value[1] - sensitivity)
          onUpdate(value)
        }
      },
    },
    {
      id: 'left',
      angle: 212,
      content: true,
      onClick: () => {
        if (value[2] - sensitivity <= limits[2].minNum) {
          value[2] = limits[2].minNum
          onUpdate(value)
          return
        }
        value[2] = roundToClean(value[2] - sensitivity)
        onUpdate(value)
      },
    },
    {
      id: 'top-left',
      angle: 239,
      content: false,
      onClick: () => {
        if (value[1] + sensitivity >= limits[1].maxNum) {
          value[1] = limits[1].maxNum
          onUpdate(value)
        } else {
          value[1] = roundToClean(value[1] + sensitivity)
          onUpdate(value)
        }
        if (value[2] - sensitivity <= limits[2].minNum) {
          value[2] = limits[2].minNum
          onUpdate(value)
        } else {
          value[2] = roundToClean(value[2] - sensitivity)
          onUpdate(value)
        }
      },
    },
    {
      id: 'top',
      angle: 301,
      content: true,
      onClick: () => {
        if (value[1] + sensitivity >= limits[1].maxNum) {
          value[1] = limits[1].maxNum
          onUpdate(value)
          return
        }
        value[1] = roundToClean(value[1] + sensitivity)
        onUpdate(value)
      },
    },
    {
      id: 'top-right',
      angle: 328,
      content: false,
      onClick: () => {
        if (value[1] + sensitivity >= limits[1].maxNum) {
          value[1] = limits[1].maxNum
          onUpdate(value)
        } else {
          value[1] = roundToClean(value[1] + sensitivity)
          onUpdate(value)
        }
        if (value[2] + sensitivity >= limits[2].maxNum) {
          value[2] = limits[2].maxNum
          onUpdate(value)
        } else {
          value[2] = roundToClean(value[2] + sensitivity)
          onUpdate(value)
        }
      },
    },
  ]

  const sensitivityOptions = [0.01, 0.1, 1.0, 10, 100]
  let sensitivity = $state(1.0)

  let clipPos = Math.cos(Math.PI / directions.length) * 100
  let angle = 360 / directions.length

  const roundToClean = (num: number): number => {
    if (Number.isInteger(num)) return num

    const rounded1 = Number(num.toFixed(1))
    if (Math.abs(rounded1 - num) < 1e-10) return rounded1

    const rounded2 = Number(num.toFixed(2))
    if (Math.abs(rounded2 - num) < 1e-10) return rounded2

    return rounded2
  }
</script>

<div id={`${id}-${crypto.randomUUID().slice(0, 6)}`} class={twMerge(`bg-red relative flex w-full flex-col items-center`, wrapperClass)}>
  {#if label.name}
    <h5 class={twMerge(` w-full px-4 text-center`, label.class)}>{label.name}</h5>
  {/if}

  <div class=" flex w-1/2 items-center justify-center">
    <div class="relative z-10 flex size-40 items-center justify-center rounded-full bg-(--bg-color) shadow-[0_0_20px_rgb(0_0_0_/0.25)]">
      <!-- Основные кнопки (оси pitch и yaw) -->
      <div class="absolute h-full w-full overflow-hidden rounded-full">
        {#each directions as direction, index}
          <button
            class="pointer-events-none absolute top-1/2 left-1/2 block w-1/2 -translate-y-1/2 cursor-pointer"
            onclick={direction.onClick}
            title=""
          >
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
              {:else}
                •
              {/if}
            </span>
          </button>
        {/each}
      </div>
      <!-- Линии для разделения на сектора -->
      <div class="pointer-events-none absolute h-full w-full overflow-hidden rounded-full">
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
      <!-- Кнопка домой -->
      <div
        class="z-20 flex size-20 items-center justify-center rounded-full bg-(--bg-color) shadow-[0_0_15px_rgb(0_0_0_/0.25)] transition hover:scale-103"
      >
        <button
          class="flex size-18 cursor-pointer items-center justify-center rounded-full bg-(--bg-color)"
          title=""
          onclick={() => {
            value = [0, 0, 0]
            onUpdate(value)
          }}
          ><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"
            ><path
              fill="currentColor"
              d="M6 19h3v-5q0-.425.288-.712T10 13h4q.425 0 .713.288T15 14v5h3v-9l-6-4.5L6 10zm-2 0v-9q0-.475.213-.9t.587-.7l6-4.5q.525-.4 1.2-.4t1.2.4l6 4.5q.375.275.588.7T20 10v9q0 .825-.588 1.413T18 21h-4q-.425 0-.712-.288T13 20v-5h-2v5q0 .425-.288.713T10 21H6q-.825 0-1.412-.587T4 19m8-6.75"
            /></svg
          ></button
        >
      </div>
    </div>
    <!-- Боковые кнопки (ось roll) -->
    <div
      class="absolute flex h-15 w-65 items-center justify-between rounded-full shadow-[0_0_15px_rgb(0_0_0_/0.25)]"
      style="background: color-mix(in srgb, var(--bg-color), var(--shadow-color) 10%)"
    >
      <button
        class="h-full cursor-pointer rounded-l-full px-3.5"
        title=""
        onclick={() => {
          if (value[0] - sensitivity <= limits[0].minNum) {
            value[0] = limits[0].minNum
            onUpdate(value)
            return
          }
          value[0] -= sensitivity
          onUpdate(value)
        }}
        onmouseenter={(e) => (e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--bg-color), var(--shadow-color) 30%)')}
        onmouseleave={(e) => (e.currentTarget.style.backgroundColor = 'background: color-mix(in srgb, var(--bg-color), var(--shadow-color) 10%)')}
        ><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
          ><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"
            ><path
              stroke-miterlimit="10"
              d="M6.395 7.705A7.9 7.9 0 0 1 12 5.382a7.93 7.93 0 0 1 7.929 7.929A7.94 7.94 0 0 1 12 21.25a7.94 7.94 0 0 1-7.929-7.94"
            /><path stroke-linejoin="round" d="m7.12 2.75l-.95 3.858a1.33 1.33 0 0 0 .97 1.609l3.869.948" /></g
          ></svg
        ></button
      >
      <button
        class="h-full cursor-pointer rounded-r-full px-3.5"
        title=""
        onclick={() => {
          if (value[0] + sensitivity >= limits[0].maxNum) {
            value[0] = limits[0].maxNum
            onUpdate(value)
            return
          }
          value[0] += sensitivity
          onUpdate(value)
        }}
        onmouseenter={(e) => (e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--bg-color), var(--shadow-color) 30%)')}
        onmouseleave={(e) => (e.currentTarget.style.backgroundColor = 'vabackground: color-mix(in srgb, var(--bg-color), var(--shadow-color) 10%)')}
        ><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
          ><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"
            ><path
              stroke-miterlimit="10"
              d="M17.605 7.705A7.9 7.9 0 0 0 12 5.382a7.93 7.93 0 0 0-7.929 7.929A7.94 7.94 0 0 0 12 21.25a7.94 7.94 0 0 0 7.929-7.94"
            /><path stroke-linejoin="round" d="m16.88 2.75l.95 3.858a1.33 1.33 0 0 1-.97 1.609l-3.869.948" /></g
          ></svg
        ></button
      >
    </div>
  </div>

  <div class="right-10 flex items-center md:absolute">
    <div id={`${id}-${crypto.randomUUID().slice(0, 6)}`} class="flex h-full flex-col justify-center rounded-full p-10">
      {#each sensitivityOptions as option, index}
        <button
          id={crypto.randomUUID()}
          class={twMerge(`m-0 inline-block min-w-0 flex-1 cursor-pointer items-center px-2 py-1 font-semibold shadow-sm transition-all duration-300
            select-none hover:shadow-md
            ${
              option === sensitivity && sensitivity !== null
                ? 'z-10 py-1 shadow-[0_0_10px_var(--shadow-color)] hover:shadow-[0_0_15px_var(--shadow-color)]'
                : ''
            }  
            ${sensitivityOptions.length > 0 && index === 0 ? 'rounded-t-2xl' : ''} ${
              index === sensitivityOptions.length - 1 ? 'rounded-b-2xl' : ''
            } bg-(--back-color)`)}
          onclick={() => {
            sensitivity = option
          }}
        >
          <span class="flex flex-row items-center justify-center gap-4">
            {#if option}
              <div class="flex-1">
                {option}
              </div>
            {/if}
          </span>
        </button>
      {/each}
    </div>

    <div>
      {#each [0, 1, 2] as num}
        <h5 class={twMerge(` w-full px-4 text-center`, label.class)}>{num == 0 ? 'Roll' : num == 1 ? 'Pitch' : 'Yaw'}</h5>
        <input
          class={`w-20 rounded-2xl border border-(--border-color) px-4 py-1 text-center transition-all duration-300 outline-none
              hover:shadow-md 
              [&::-webkit-inner-spin-button]:hidden
              [&::-webkit-outer-spin-button]:hidden`}
          style="background: color-mix(in srgb, var(--bg-color), var(--back-color) 70%);"
          value={value[num]}
          id={`${id}-${crypto.randomUUID().slice(0, 6)}`}
          readonly
        />
      {/each}
    </div>
  </div>
</div>
<!-- sensitivity == 0.01 ? value[num].toFixed(2) : sensitivity == 0.1 ? value[num].toFixed(1) : value[num].toFixed(0) -->
