<!-- $lib/WidgetRGBStrip/WidgetRGBStrip.svelte — смарт-виджет адресной светодиодной ленты.
     Поля группы LST (RGB_Strip, ProdFactory-ESP): Color/Effect/Speed отправляются сразу (onChange),
     Count/Model/Order — одним пакетом по «Сохранить» (onSave): прошивка пересоздаёт драйвер ленты.
     Ничего не знает про DeviceStore/WebSocket — только value и колбэки. -->
<script lang="ts">
  import { untrack } from "svelte"
  import { slide } from "svelte/transition"
  import { twMerge } from "tailwind-merge"
  import * as UI from "$lib"
  import type { IOption, IWidgetRGBStripConfig, IWidgetRGBStripProps } from "../types"
  import LightIcon from "./LightIcon.svelte"
  import WidgetHeader from "../WidgetHeader.svelte"
  import ArrowIcon from "../libIcons/ArrowIcon.svelte"
  import { widgetAccentStyle } from "../widgetAccent"
  import { readPersistedCollapsed, writePersistedCollapsed } from "../widgetCollapse"

  let {
    wrapperClass = "",
    componentClass = "",
    label = { name: "Светодиодная лента" },
    value,
    collapsed = $bindable(false),
    persistKey,
    onChange,
    onSave,
  }: IWidgetRGBStripProps = $props()

  let accentStyle = $derived(widgetAccentStyle(componentClass ?? ""))

  /* Сворачивание тела по клику на шапку — как у остальных смарт-виджетов (см. WidgetWiFi.svelte) */
  let hasMergedPersisted = false
  $effect(() => {
    if (hasMergedPersisted) return
    hasMergedPersisted = true
    const persisted = readPersistedCollapsed(persistKey, collapsed)
    if (persisted !== collapsed) collapsed = persisted
  })
  $effect(() => writePersistedCollapsed(persistKey, collapsed))

  const EFFECTS: IOption<number>[] = [
    { id: "static", value: 0, name: "Статичный" },
    { id: "rainbow", value: 1, name: "Радуга" },
    { id: "breath", value: 2, name: "Дыхание" },
    { id: "palette", value: 3, name: "Палитра" },
    { id: "chase", value: 4, name: "Комета" },
    { id: "twinkle", value: 5, name: "Мерцание" },
    { id: "fire", value: 6, name: "Огонь" },
    { id: "theater", value: 7, name: "Бегущие огни" },
  ]
  const MODELS: IOption<number>[] = [
    { id: "ws2812", value: 0, name: "WS2812" },
    { id: "sk6812", value: 1, name: "SK6812" },
    { id: "ws2811", value: 2, name: "WS2811" },
  ]
  const ORDERS: IOption<number>[] = ["GRB", "RGB", "BRG", "RBG", "GBR", "BGR"].map((name, index) => ({ id: name, value: index, name }))

  /* Живые значения с устройства */
  let color = $derived([0, 1, 2, 3].map((i) => Number(value?.Color?.[i] ?? 0)))
  let effectIndex = $derived(Number(value?.Effect ?? 0))
  let speed = $derived(Number(value?.Speed ?? 0))
  let maxCount = $derived(Number(value?.MaxCount ?? 0) || 1024)

  /* Оборудование редактируется локально и уходит одним пакетом; свежие значения с устройства подхватываются, пока нет правок */
  type Hardware = Pick<IWidgetRGBStripConfig, "Count" | "Model" | "Order">
  const fromValue = (): Hardware => ({ Count: Number(value?.Count ?? 1), Model: Number(value?.Model ?? 0), Order: Number(value?.Order ?? 0) })
  let hardware: Hardware = $state(untrack(fromValue))
  let savedSnapshot = $state(untrack(() => JSON.stringify(fromValue())))
  let isDirty = $derived(JSON.stringify(hardware) !== savedSnapshot)
  $effect(() => {
    const incoming = fromValue()
    if (!untrack(() => isDirty)) {
      hardware = incoming
      savedSnapshot = JSON.stringify(incoming)
    }
  })
  /* Оборудование — редкие настройки, свёрнуты по умолчанию; несохранённые правки держат блок раскрытым */
  let hardwareOpen = $state(false)
  let countValid = $derived(Number.isInteger(hardware.Count) && hardware.Count >= 1 && hardware.Count <= maxCount)
  let hasWhite = $derived(hardware.Model === 1)

  const save = () => {
    if (!countValid) return
    onSave?.($state.snapshot(hardware))
    savedSnapshot = JSON.stringify(hardware)
  }
  const sendColor = (rgbw: number[]) => onChange?.("Color", rgbw)
</script>

<div
  class={twMerge("relative flex w-full flex-col gap-4 rounded-2xl border border-(--hairline-color) bg-(--container-color) p-4", wrapperClass)}
  style={accentStyle}
>
  <!-- Заголовок: образец текущего цвета -->
  <WidgetHeader icon={LightIcon} label={label?.name ?? "Светодиодная лента"} bind:collapsed>
    {#snippet right()}
      <span class="size-6 rounded-md border border-(--hairline-color)" style="background: rgb({color[0]}, {color[1]}, {color[2]})" title="Текущий цвет"></span>
    {/snippet}
  </WidgetHeader>

  {#if !collapsed}
    <div class="flex flex-col gap-4" transition:slide={{ duration: 150 }}>
      <!-- Свечение: применяется сразу -->
      <div class="flex flex-col gap-3 rounded-[10px] border border-(--hairline-color) bg-(--back-color) p-3">
        <UI.ColorPicker value={color.slice(0, 3)} readonly={!onChange} onChange={(rgb) => sendColor([...rgb, color[3]])} />
        {#if hasWhite}
          <UI.Slider
            label={{ name: "Белый канал" }}
            value={color[3]}
            number={{ minNum: 0, maxNum: 255, step: 1 }}
            disabled={!onChange}
            onUpdate={(w) => sendColor([color[0], color[1], color[2], w as number])}
          />
        {/if}
        <UI.Select
          label={{ name: "Эффект" }}
          options={EFFECTS}
          value={EFFECTS.find((o) => o.value === effectIndex) ?? EFFECTS[0]}
          disabled={!onChange}
          onUpdate={(option) => !Array.isArray(option) && onChange?.("Effect", option.value ?? 0)}
        />
        <UI.Slider
          label={{ name: "Скорость эффекта (0 — пауза)" }}
          value={speed}
          number={{ minNum: 0, maxNum: 10, step: 1 }}
          disabled={!onChange || effectIndex === 0}
          onUpdate={(v) => onChange?.("Speed", v as number)}
        />
      </div>

      <!-- Оборудование: свёрнуто по умолчанию, сохраняется одним пакетом, лента перезапускается -->
      <div class="flex flex-col gap-3 rounded-[10px] border border-(--hairline-color) bg-(--back-color) p-3">
        <button
          type="button"
          class="flex w-full cursor-pointer items-center justify-between gap-2 border-none bg-transparent p-0 text-left"
          aria-expanded={hardwareOpen || isDirty}
          onclick={() => (hardwareOpen = !hardwareOpen)}
        >
          <span class="text-[12px] font-semibold text-(--muted-color)">
            Оборудование
            <span class="font-normal text-(--faint-color)">
              · {hardware.Count} LED · {MODELS[hardware.Model]?.name ?? "—"} · {ORDERS[hardware.Order]?.name ?? "—"}
            </span>
          </span>
          <span
            class="flex size-3.5 shrink-0 text-(--faint-color) transition-transform duration-150 [&_svg]:h-full [&_svg]:w-full"
            style="transform: rotate({hardwareOpen || isDirty ? 90 : 0}deg)"
          >
            <ArrowIcon />
          </span>
        </button>
        {#if hardwareOpen || isDirty}
          <div class="flex flex-col gap-3" transition:slide={{ duration: 150 }}>
            <UI.Input
              label={{ name: `Количество светодиодов (1–${maxCount})` }}
              type="number"
              number={{ minNum: 1, maxNum: maxCount, step: 1 }}
              value={hardware.Count}
              onUpdate={(v) => (hardware.Count = Number(v))}
            />
            <UI.Select
              label={{ name: "Модель чипа" }}
              type="buttons"
              options={MODELS}
              value={MODELS.find((o) => o.value === hardware.Model) ?? MODELS[0]}
              onUpdate={(option) => !Array.isArray(option) && (hardware.Model = option.value ?? 0)}
            />
            <UI.Select
              label={{ name: "Порядок цветов" }}
              type="buttons"
              options={ORDERS}
              value={ORDERS.find((o) => o.value === hardware.Order) ?? ORDERS[0]}
              onUpdate={(option) => !Array.isArray(option) && (hardware.Order = option.value ?? 0)}
            />
            {#if isDirty}
              <span class="text-[12px] text-(--muted-color)" transition:slide={{ duration: 100 }}>
                {countValid ? "При сохранении лента перезапустится с новыми настройками" : `Количество — целое от 1 до ${maxCount}`}
              </span>
            {/if}
            <UI.Button componentClass="bg-accent" content={{ name: "Сохранить" }} disabled={!onSave || !isDirty || !countValid} onClick={save} />
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>
