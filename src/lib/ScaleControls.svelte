<!-- $lib/ScaleControls.svelte - кнопки на графике (Graph, PeriodChart): настройки открывают окно (развёртка Graph через settings, пределы шкалы «Мин» и «Макс»), замок появляется, когда заданы оба предела, - фиксирует шкалу или отпускает её подстраиваться под данные -->
<script lang="ts">
  import { T } from "./locales/i18n"
  import Input from "./Input/Input.svelte"
  import Modal from "./Modal.svelte"
  import Button from "./Button/Button.svelte"
  import ScaleLock from "./ScaleLock.svelte"
  import ButtonDelete from "./libIcons/ButtonDelete.svelte"

  import type { Snippet } from "svelte"

  type Limits = { min?: number; max?: number }
  let {
    limits,
    locked,
    hasBounds,
    onChange,
    onToggle,
    settings,
    class: className = "",
  }: {
    limits: Limits
    locked: boolean
    hasBounds: boolean
    onChange: (limits: Limits) => void
    onToggle: () => void
    /* Другие настройки графика в том же окне, над пределами шкалы (развёртка Graph) */
    settings?: Snippet
    class?: string
  } = $props()

  let isOpen = $state(false)
  /* Пустое поле - предел не задан, шкала подстраивается под данные */
  const toBound = (value: unknown) => (value === "" || value == null || !Number.isFinite(Number(value)) ? undefined : Number(value))
</script>

<div class="flex items-center gap-1 {className}">
  <button
    type="button"
    class="flex size-8 cursor-pointer items-center justify-center rounded-lg border border-(--hairline-color) bg-(--back-color) text-(--muted-color) transition-colors duration-150 hover:text-(--font-color)"
    title={$T("ui.chart.settings")}
    aria-label={$T("ui.chart.settings")}
    onclick={() => (isOpen = true)}
  >
    <!-- Значок: ползунки - настройки графика -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="size-(--icon-size)"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" />
      <circle cx="16" cy="6" r="2" />
      <circle cx="10" cy="12" r="2" />
      <circle cx="18" cy="18" r="2" />
    </svg>
  </button>
  {#if hasBounds}<ScaleLock {locked} {onToggle} />{/if}
</div>

<Modal bind:isOpen title={$T("ui.chart.settings")} wrapperClass="w-80">
  {#snippet main()}
    <div class="flex flex-col gap-3">
      {@render settings?.()}
      <!-- Пределы и красная корзина сброса в одной строке; пояснение - короткое, под значком ⓘ у «Мин» -->
      <div class="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_2rem] items-end gap-2">
        <Input
          label={{ name: $T("ui.scale.min") }}
          help={{ info: $T("ui.scale.limits_hint") }}
          type="number"
          value={limits.min ?? ""}
          onUpdate={(value) => onChange({ ...limits, min: toBound(value) })}
          onInput={(text) => !text.trim() && limits.min !== undefined && onChange({ ...limits, min: undefined })}
        />
        <!-- Числовое поле не сообщает пустое значение через onUpdate: очистку ловит onInput и сразу снимает предел -->
        <Input
          label={{ name: $T("ui.scale.max") }}
          type="number"
          value={limits.max ?? ""}
          onUpdate={(value) => onChange({ ...limits, max: toBound(value) })}
          onInput={(text) => !text.trim() && limits.max !== undefined && onChange({ ...limits, max: undefined })}
        />
        <Button
          wrapperClass="w-8"
          variant="primary"
          accent="red"
          content={{ icon: ButtonDelete, info: { text: $T("ui.scale.reset"), side: "top" } }}
          onClick={() => onChange({})}
        />
      </div>
    </div>
  {/snippet}
  {#snippet footer()}
    <Button wrapperClass="w-fit" variant="primary" accent="green" content={{ name: $T("ui.scale.done") }} onClick={() => (isOpen = false)} />
  {/snippet}
</Modal>
