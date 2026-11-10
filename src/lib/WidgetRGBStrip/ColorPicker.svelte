<!-- $lib/WidgetRGBStrip/ColorPicker.svelte - внутренняя палитра виджета «RGB лента» (HSV + белый): мышь, касание, стрелки клавиатуры; onUpdate - когда палец или кнопка отпущены -->
<script lang="ts">
  import { twMerge } from "tailwind-merge"
  import { T } from "../locales/i18n"

  interface IColorPickerProps {
    wrapperClass?: string
    value?: number[]
    readonly?: boolean
    onUpdate?: (value: number[]) => void
  }

  let { readonly = false, wrapperClass = "", value = [0, 0, 0], onUpdate }: IColorPickerProps = $props()

  const hsv = $state({ h: 0, s: 100, v: 100 })
  let huePointer = $state(0)
  let brightnessPointer = $state(100)
  let mode = $state<"hsv" | "white">("hsv")
  let whiteValue = $state(100)

  $effect(() => {
    if (value.length !== 3) return

    const [r, g, b] = value
    const isWhite = r === g && g === b
    mode = isWhite ? "white" : "hsv"
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

  type Target = "hue" | "brightness" | "white"

  /* Положение ползунка в процентах; белый включает режим белого, цветные - режим HSV */
  const setPercent = (target: Target, percent: number) => {
    percent = Math.max(0, Math.min(100, percent))
    if (target === "white") {
      mode = "white"
      whiteValue = percent
      return
    }
    if (mode === "white") hsv.s = 100
    mode = "hsv"
    if (target === "hue") {
      huePointer = percent
      hsv.h = (percent / 100) * 360
    } else {
      brightnessPointer = percent
      hsv.v = percent
    }
  }

  const commit = () => {
    const white = Math.round((whiteValue / 100) * 255)
    onUpdate?.(mode === "hsv" ? hsvToRgb(hsv.h, hsv.s, hsv.v) : [white, white, white])
  }

  /* Перетаскивание указателем (мышь, палец, перо): захват указателя за полосой, отправка при отпускании */
  const handleDrag = (event: PointerEvent, target: Target) => {
    const slider = event.currentTarget as HTMLElement
    const rect = slider.getBoundingClientRect()
    const onMove = (e: PointerEvent) => setPercent(target, ((e.clientX - rect.left) / rect.width) * 100)
    const onUp = () => {
      slider.removeEventListener("pointermove", onMove)
      slider.removeEventListener("pointerup", onUp)
      slider.removeEventListener("pointercancel", onUp)
      commit()
    }
    slider.setPointerCapture(event.pointerId)
    onMove(event)
    slider.addEventListener("pointermove", onMove)
    slider.addEventListener("pointerup", onUp)
    slider.addEventListener("pointercancel", onUp)
  }

  const handleKey = (event: KeyboardEvent, target: Target, percent: number) => {
    const step = { ArrowRight: 2, ArrowUp: 2, ArrowLeft: -2, ArrowDown: -2 }[event.key]
    if (!step) return
    event.preventDefault()
    setPercent(target, percent + step)
    commit()
  }

  const rgb = $derived(() => (mode === "white" ? [whiteValue, whiteValue, whiteValue].map((v) => Math.round((v / 100) * 255)) : hsvToRgb(hsv.h, hsv.s, hsv.v)))
  const hex = $derived(() =>
    rgb()
      .map((v) => v.toString(16).padStart(2, "0"))
      .join(" ")
      .toUpperCase(),
  )
  const previewBaseColor = $derived(() => (mode === "white" ? [255, 255, 255].map((c) => Math.round((whiteValue / 100) * c)) : hsvToRgb(hsv.h, hsv.s, 100)))

  const textColor = $derived(() => {
    const [r, g, b] = rgb()
    const luminance = (r * 299 + g * 587 + b * 114) / 1000
    return luminance > 128 ? "text-black" : "text-white"
  })
</script>

{#snippet slider(target: Target, percent: number, name: string, className: string, track: string, showPointer: boolean)}
  <div
    class="relative w-full cursor-pointer touch-none overflow-hidden rounded-[10px] border border-(--hairline-color) {className}"
    role="slider"
    tabindex="0"
    aria-label={name}
    aria-valuemin={0}
    aria-valuemax={100}
    aria-valuenow={Math.round(percent)}
    onpointerdown={(e) => handleDrag(e, target)}
    onkeydown={(e) => handleKey(e, target, percent)}
  >
    <div class="absolute inset-0" style="background: {track}"></div>
    {#if showPointer}
      <div
        class="pointer-events-none absolute inset-y-0 w-[2px] -translate-x-1/2 bg-white shadow-[0_0_0_1px_rgb(0_0_0/0.25),0_1px_3px_rgb(0_0_0/0.4)]"
        style="left: {percent}%"
      ></div>
    {/if}
  </div>
{/snippet}

<div class={twMerge(`relative flex w-full flex-col items-center`, wrapperClass)}>
  <div class="flex w-full flex-row items-center gap-2">
    <!-- Слайдеры цвета -->
    {#if !readonly}
      <div class="flex w-full flex-col gap-2">
        {@render slider(
          "hue",
          huePointer,
          $T("widget.rgb.hue"),
          "h-7",
          `linear-gradient(to right, ${Array.from({ length: 7 }, (_, i) => `rgb(${hsvToRgb(i * 60, 100, 100).join(",")})`).join(", ")})`,
          mode === "hsv",
        )}
        {@render slider(
          "brightness",
          brightnessPointer,
          $T("widget.rgb.brightness"),
          "h-4",
          mode === "hsv" ? `linear-gradient(to right, rgb(0,0,0), rgb(${hsvToRgb(hsv.h, hsv.s, 100).join(",")}))` : "transparent",
          mode === "hsv",
        )}
        {@render slider("white", whiteValue, $T("widget.rgb.white"), "mt-4 h-4", "linear-gradient(to right, #000, #fff)", mode === "white")}
      </div>
    {/if}

    <!-- Превью цвета: квадрат 48 с радиусом 10 (design-handoff, раздел 9) -->
    <div class="flex flex-col items-center m-auto" style="width: 7rem;">
      <div
        class={`size-[48px] rounded-[10px] border border-(--hairline-color) transition-colors duration-200 select-none ${textColor()}`}
        style={`background: rgb(${previewBaseColor().join(",")})`}
      ></div>
      <div class="mt-1 w-full text-center font-mono text-[12px] font-semibold text-(--muted-color)">{hex()}</div>
    </div>
  </div>
</div>
