<!-- $lib/ElementsUI/ColorPicker.svelte -->
<script lang="ts">
  import { twMerge } from 'tailwind-merge'
  import type { IColorPickerProps } from '../types'

  let {
    id = crypto.randomUUID(),
    wrapperClass = '',
    label = { name: '', class: '' },
    value = [0, 0, 0],
    onChange = () => {},
  }: IColorPickerProps = $props()

  const hsv = $state({ h: 0, s: 100, v: 100 })
  let huePointer = $state(0)
  let brightnessPointer = $state(100)
  let mode = $state<'hsv' | 'white'>('hsv')
  let whiteValue = $state(100)

  $effect(() => {
    if (value.length !== 3) return

    const [r, g, b] = value
    const isWhite = r === g && g === b
    mode = isWhite ? 'white' : 'hsv'
    if (isWhite) {
      whiteValue = Math.round((r / 255) * 100)
      return
    }

    const normalized = value.map((v) => v / 255)
    const max = Math.max(...normalized)
    const min = Math.min(...normalized)
    const delta = max - min
    let h = 0
    if (delta !== 0) {
      const [rN, gN, bN] = normalized
      if (max === rN) h = ((gN - bN) / delta) % 6
      else if (max === gN) h = (bN - rN) / delta + 2
      else h = (rN - gN) / delta + 4
      h *= 60
      if (h < 0) h += 360
    }
    const s = max ? (delta / max) * 100 : 0
    const v = max * 100
    hsv.h = Math.round(h)
    hsv.s = Math.round(s)
    hsv.v = Math.round(v)
    huePointer = (h / 360) * 100
    brightnessPointer = v
  })

  const hsvToRgb = (h: number, s: number, v: number): [number, number, number] => {
    s /= 100
    v /= 100
    const c = v * s
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
    const m = v - c
    let r = 0,
      g = 0,
      b = 0
    if (h < 60) [r, g, b] = [c, x, 0]
    else if (h < 120) [r, g, b] = [x, c, 0]
    else if (h < 180) [r, g, b] = [0, c, x]
    else if (h < 240) [r, g, b] = [0, x, c]
    else if (h < 300) [r, g, b] = [x, 0, c]
    else [r, g, b] = [c, 0, x]
    return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)]
  }

  const handleDrag = (e: MouseEvent, target: 'hue' | 'brightness' | 'white') => {
    const slider = document.querySelector(`.${target}-slider`) as HTMLElement
    const rect = slider.getBoundingClientRect()
    let currentHSV = { ...hsv }
    let currentWhite = whiteValue
    if (target === 'hue' || target === 'brightness') {
      if (mode === 'white') hsv.s = 100
      mode = 'hsv'
    } else mode = 'white'
    const onMove = (event: MouseEvent) => {
      const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width))
      const percent = (x / rect.width) * 100
      if (target === 'hue') {
        huePointer = percent
        currentHSV.h = (x / rect.width) * 360
        hsv.h = currentHSV.h
      } else if (target === 'brightness') {
        brightnessPointer = percent
        currentHSV.v = percent
        hsv.v = currentHSV.v
      } else if (target === 'white') {
        currentWhite = percent
        whiteValue = currentWhite
      }
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)

      if (mode === 'hsv') {
        onChange(hsvToRgb(currentHSV.h, hsv.s, currentHSV.v))
      } else {
        const val = Math.round((currentWhite / 100) * 255)
        onChange([val, val, val])
      }
    }
    onMove(e)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const rgb = $derived(() =>
    mode === 'white' ? [whiteValue, whiteValue, whiteValue].map((v) => Math.round((v / 100) * 255)) : hsvToRgb(hsv.h, hsv.s, hsv.v),
  )
  const hex = $derived(() =>
    rgb()
      .map((v) => v.toString(16).padStart(2, '0'))
      .join(' ')
      .toUpperCase(),
  )
  const previewBaseColor = $derived(() =>
    mode === 'white' ? [255, 255, 255].map((c) => Math.round((whiteValue / 100) * c)) : hsvToRgb(hsv.h, hsv.s, 100),
  )

  const textColor = $derived(() => {
    const [r, g, b] = rgb()
    const luminance = (r * 299 + g * 587 + b * 114) / 1000
    return luminance > 128 ? 'text-black' : 'text-white'
  })
</script>

<div {id} class={twMerge(`relative flex w-full flex-col items-center`, wrapperClass)}>
  {#if label.name}
    <h5 class={twMerge(`w-full px-4 text-center`, label.class)}>{label.name}</h5>
  {/if}

  <div class="flex w-full flex-row items-center gap-2">
    <!-- Слайдеры цвета -->
    <div class="flex w-full flex-col gap-2">
      <!-- Выбор цвета -->
      <div
        class="hue-slider relative h-7 w-full cursor-pointer overflow-hidden rounded-full shadow-md"
        role="slider"
        aria-valuenow={null}
        tabindex={null}
        onmousedown={(e) => handleDrag(e, 'hue')}
      >
        <div
          class="absolute inset-0"
          style={`background: linear-gradient(to right, ${Array.from({ length: 7 }, (_, i) => {
            const [r, g, b] = hsvToRgb(i * 60, 100, 100)
            return `rgb(${r},${g},${b})`
          }).join(', ')})`}
        ></div>
        {#if mode === 'hsv'}
          <div
            class="pointer-events-none absolute top-1/2 h-7 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"
            style={`left: ${huePointer}%; background: rgb(${hsvToRgb(hsv.h, 100, 100).join(',')})`}
          ></div>
        {/if}
      </div>

      <!-- Яркость цвета -->
      <div
        class="brightness-slider relative h-4 w-full cursor-pointer overflow-hidden rounded-full {mode === 'hsv' ? 'shadow-md' : ''}"
        role="slider"
        aria-valuenow={null}
        tabindex={null}
        onmousedown={(e) => handleDrag(e, 'brightness')}
      >
        {#if mode === 'hsv'}
          <div
            class="absolute inset-0"
            style={`background: linear-gradient(to right, rgb(0,0,0), rgb(${hsvToRgb(hsv.h, hsv.s, 100).join(',')}))`}
          ></div>

          <div
            class="pointer-events-none absolute top-1/2 h-7 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"
            style={`left: ${brightnessPointer}%; background: rgb(${hsvToRgb(hsv.h, hsv.s, hsv.v).join(',')})`}
          ></div>
        {/if}
      </div>

      <!-- Яркость белого цвета -->
      <div
        class="white-slider relative mt-4 h-4 w-full cursor-pointer overflow-hidden rounded-full shadow-sm"
        role="slider"
        aria-valuenow={null}
        tabindex={null}
        onmousedown={(e) => handleDrag(e, 'white')}
      >
        <div class="absolute inset-0 bg-gradient-to-r from-black to-white"></div>
        {#if mode === 'white'}
          <div
            class="pointer-events-none absolute top-1/2 h-7 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"
            style={`left: ${whiteValue}%; background: rgb(${[255, 255, 255].map((c) => Math.round((whiteValue / 100) * c)).join(',')})`}
          ></div>
        {/if}
      </div>
    </div>

    <!-- Превью цвета -->

    <div class="flex w-25 flex-col items-center">
      <div
        class={`flex size-15 flex-col justify-center gap-1 rounded-full px-2 font-mono text-sm shadow-md select-none ${textColor()}`}
        style={`background: rgb(${previewBaseColor().join(',')})`}
      ></div>
      <div class="w-full text-center font-semibold">{hex()}</div>
    </div>
  </div>
</div>
