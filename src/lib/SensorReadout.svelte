<!-- $lib/SensorReadout.svelte - показание датчика надписью: подпись мелко, число крупно моноширинными цифрами, единица рядом. Нет числа - дефис. Общее для WidgetAHRS, WidgetIMU, WidgetMag -->
<script lang="ts">
  let {
    label,
    value,
    digits = 2,
    unit = "",
    size = "md",
    color,
  }: {
    label: string
    value: unknown
    /* Знаков после запятой */
    digits?: number
    unit?: string
    /* lg - главные величины (углы), md - обычные, sm - второстепенные */
    size?: "sm" | "md" | "lg"
    /* Цвет числа, например var(--red-text) */
    color?: string
  } = $props()

  const number = $derived(value === undefined || value === null || value === "" ? NaN : Number(value))
  const text = $derived(Number.isFinite(number) ? number.toFixed(digits) : "-")
  const valueClass = $derived(size === "lg" ? "text-[22px]" : size === "sm" ? "text-[13px]" : "text-[16px]")
</script>

<div class="flex flex-col items-center gap-0.5 rounded-[10px] border border-(--hairline-color) bg-(--back-color) px-2 py-1.5">
  <span class="w-full text-center text-[11px] whitespace-nowrap text-(--muted-color)">{label}</span>
  <span class="flex items-baseline gap-1 leading-tight">
    <span class="font-semibold tabular-nums {valueClass}" style={color ? `color: ${color}` : undefined}>{text}</span>
    {#if unit}<span class="text-[11px] text-(--muted-color)">{unit}</span>{/if}
  </span>
</div>
