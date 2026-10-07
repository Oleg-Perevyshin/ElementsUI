<!-- $lib/WidgetStackInfo/WidgetStackInfo.svelte — отладочный смарт-виджет памяти и задач FreeRTOS.
     Данные — один объект StackInfo в том виде, в каком его отдают ProdFactory-ESP и ProdFactory-STM
     (API_GetStackInfo): Heap[{Name, Total, Free, MinFree}] и Tasks[{Name, FreeMin, Prio, Core?, State}].
     Ничего не знает про DeviceStore/WebSocket — value/onRefresh, автоопрос лишь периодически зовёт onRefresh. -->
<script lang="ts">
  import { slide } from "svelte/transition"
  import { twMerge } from "tailwind-merge"
  import * as UI from "$lib"
  import type { IOption, ITableHeader, IWidgetStackInfoProps, IWidgetStackInfoTask } from "../types"
  import MemoryIcon from "./MemoryIcon.svelte"
  import RefreshIcon from "./RefreshIcon.svelte"
  import WidgetHeader from "../WidgetHeader.svelte"
  import { widgetAccentStyle } from "../widgetAccent"
  import { readPersistedCollapsed, writePersistedCollapsed } from "../widgetCollapse"

  let {
    wrapperClass = "",
    componentClass = "",
    label = { name: "Память и задачи" },
    value,
    warnBytes = 512,
    period = $bindable(0),
    collapsed = $bindable(false),
    persistKey,
    onRefresh,
  }: IWidgetStackInfoProps = $props()

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

  /* Автоопрос: сразу при включении и далее раз в period; свёрнутый виджет не опрашивает */
  const periods: IOption<number>[] = [
    { id: "off", value: 0, name: "Выкл" },
    { id: "1s", value: 1000, name: "1 с" },
    { id: "5s", value: 5000, name: "5 с" },
    { id: "10s", value: 10000, name: "10 с" },
  ]
  $effect(() => {
    if (!period || period <= 0 || collapsed || !onRefresh) return
    onRefresh()
    const timer = setInterval(() => onRefresh?.(), period)
    return () => clearInterval(timer)
  })

  /* Размер в человекочитаемом виде: Б / КБ / МБ, одна цифра после запятой начиная с КБ */
  const formatBytes = (bytes: number) => {
    if (!Number.isFinite(bytes) || bytes < 0) return "—"
    if (bytes < 1024) return `${bytes} Б`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`
    return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`
  }
  const percent = (part: number, total: number) => (total > 0 ? Math.min(100, Math.max(0, Math.round((part / total) * 100))) : 0)

  /* Текущая занятость — мастер-цвет, пик занятости с момента старта (Total − MinFree) — его светлая подложка */
  let heaps = $derived(
    (value?.Heap ?? []).map((h) => {
      const used = Math.max(h.Total - h.Free, 0)
      const peak = Math.max(h.Total - h.MinFree, used)
      return { ...h, used, usedPercent: percent(used, h.Total), peakPercent: percent(peak, h.Total) }
    }),
  )
  const percentColor = (p: number) => (p >= 90 ? "var(--red-color)" : p >= 75 ? "var(--orange-color)" : "var(--muted-color)")

  /* Имена задач приходят с устройства, а Table выводит ячейки через {@html} — экранируем */
  const escapeHtml = (text: string) => text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)
  const STATES = ["Работает", "Готова", "Ожидает", "Приостановлена", "Удалена"]
  const stackColor = (bytes: number) => (bytes < warnBytes ? "var(--red-color)" : bytes < warnBytes * 2 ? "var(--orange-color)" : "")

  type TaskRow = { Name: string; StateText: string; Prio: number; CoreText: string; FreeMinText: string }
  let tasks = $derived([...(value?.Tasks ?? [])].sort((a, b) => a.FreeMin - b.FreeMin))
  let hasCore = $derived(tasks.some((t) => t.Core !== undefined))
  let lowCount = $derived(tasks.filter((t) => t.FreeMin < warnBytes).length)

  /* Порядок фиксированный — по возрастанию запаса стека: при автоопросе сортировка кликом сбрасывалась бы каждый ответ */
  let rows: TaskRow[] = $derived(
    tasks.map((t: IWidgetStackInfoTask) => {
      const color = stackColor(t.FreeMin)
      return {
        Name: escapeHtml(t.Name),
        StateText: STATES[t.State] ?? "—",
        Prio: t.Prio,
        CoreText: t.Core === undefined ? "" : t.Core < 0 ? "любое" : String(t.Core),
        FreeMinText: color ? `<span style="color: ${color}; font-weight: 600">${t.FreeMin}</span>` : String(t.FreeMin),
      }
    }),
  )
  let header: ITableHeader<TaskRow>[] = $derived([
    { label: { name: "Задача" }, content: [{ type: "text", data: { key: "Name", truncated: true } }], width: "1fr", align: "left" },
    { label: { name: "Состояние" }, content: [{ type: "text", data: { key: "StateText", truncated: true } }], width: "9.5rem", align: "left" },
    { label: { name: "Приор." }, content: [{ type: "text", data: { key: "Prio" } }], width: "5.5rem", align: "center" },
    ...(hasCore
      ? [{ label: { name: "Ядро" }, content: [{ type: "text", data: { key: "CoreText" } }], width: "5.5rem", align: "center" } as ITableHeader<TaskRow>]
      : []),
    { label: { name: "Запас, Б" }, content: [{ type: "text", data: { key: "FreeMinText" } }], width: "6rem", align: "right" },
  ])
</script>

<div
  class={twMerge("relative flex w-full flex-col gap-4 rounded-2xl border border-(--hairline-color) bg-(--container-color) p-4", wrapperClass)}
  style={accentStyle}
>
  <!-- Заголовок -->
  <WidgetHeader icon={MemoryIcon} label={label?.name ?? "Память и задачи"} bind:collapsed>
    {#snippet right()}
      <div class="flex items-center gap-2">
        <UI.Select
          wrapperClass="w-64"
          type="buttons"
          options={periods}
          value={periods.find((p) => p.value === period) ?? periods[0]}
          disabled={!onRefresh}
          onUpdate={(option) => !Array.isArray(option) && (period = option.value ?? 0)}
        />
        <UI.Button
          wrapperClass="w-auto"
          componentClass="bg-transparent px-3"
          content={{ icon: RefreshIcon, name: "Обновить" }}
          disabled={!onRefresh}
          onClick={() => onRefresh?.()}
        />
      </div>
    {/snippet}
  </WidgetHeader>

  {#if !collapsed}
    <div class="flex flex-col gap-4" transition:slide={{ duration: 150 }}>
      {#if !value}
        <div class="rounded-[10px] border border-(--hairline-color) bg-(--back-color) p-3 text-center text-[13px] text-(--faint-color)">
          Нет данных — нажмите «Обновить»
        </div>
      {:else}
        <!-- Кучи -->
        <div class="grid gap-3 {heaps.length > 1 ? 'sm:grid-cols-2' : ''}">
          {#each heaps as heap (heap.Name)}
            <div class="flex flex-col gap-2 rounded-[10px] border border-(--hairline-color) bg-(--back-color) p-3">
              <div class="flex items-baseline justify-between gap-2 text-[13px]">
                <span class="truncate font-semibold">{heap.Name}: {formatBytes(heap.used)} из {formatBytes(heap.Total)}</span>
                <span class="font-semibold tabular-nums" style="color: {percentColor(heap.usedPercent)}">{heap.usedPercent}%</span>
              </div>
              <div class="relative h-2 w-full overflow-hidden rounded-full bg-(--container-color)">
                <div class="absolute inset-y-0 left-0 rounded-full bg-(--accent-soft) transition-[width] duration-300" style="width: {heap.peakPercent}%"></div>
                <div
                  class="absolute inset-y-0 left-0 rounded-full bg-(--accent-color) transition-[width] duration-300"
                  style="width: {heap.usedPercent}%"
                ></div>
              </div>
              <div class="flex justify-between gap-2 text-[12px] text-(--muted-color)">
                <span>Свободно {formatBytes(heap.Free)}</span>
                <span>Минимум {formatBytes(heap.MinFree)}</span>
              </div>
            </div>
          {/each}
        </div>

        <!-- Задачи -->
        <div class="flex flex-col gap-2">
          <div class="flex items-baseline justify-between gap-2 text-[12px] text-(--muted-color)">
            <span>Задач: {tasks.length}</span>
            {#if lowCount}
              <span class="font-semibold text-(--red-color)">Запас стека меньше {warnBytes} Б: {lowCount}</span>
            {/if}
          </div>
          <div class="flex max-h-80 min-h-0 flex-col">
            <UI.Table {header} body={rows} outline />
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>
