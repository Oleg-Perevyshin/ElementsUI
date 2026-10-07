<!-- $lib/WidgetFileSystem/WidgetFileSystem.svelte — смарт-виджет файловой системы устройства.
     Данные — один объект CFG.FS в том виде, в каком его отдаёт прошивка (FS_WriteState, ProdFactory-ESP):
     Total/Used/Free/List[{Name, Size}] и Upload{Name, Size, Progress} — только пока идёт закачка.
     Ничего не знает про DeviceStore/WebSocket — value/onRefresh/onDelete/onUpload, протокол
     закачки (SET FS с Op UploadStart/UploadChunk/UploadDone) и отправка команд на стороне вызывающего. -->
<script lang="ts">
  import { slide, fade, scale } from "svelte/transition"
  import { twMerge } from "tailwind-merge"
  import * as UI from "$lib"
  import type { IWidgetFileSystemFile, IWidgetFileSystemProps, ITableHeader } from "../types"
  import StorageIcon from "./StorageIcon.svelte"
  import RefreshIcon from "./RefreshIcon.svelte"
  import WidgetHeader from "../WidgetHeader.svelte"
  import { widgetAccentStyle } from "../widgetAccent"
  import { readPersistedCollapsed, writePersistedCollapsed } from "../widgetCollapse"

  let {
    wrapperClass = "",
    componentClass = "",
    label = { name: "Файловая система" },
    value,
    accept = "*/*",
    maxNameLength = 31,
    collapsed = $bindable(false),
    persistKey,
    onRefresh,
    onDelete,
    onUpload,
  }: IWidgetFileSystemProps = $props()

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

  /* Размер в человекочитаемом виде: Б / КБ / МБ, одна цифра после запятой начиная с КБ */
  const formatBytes = (bytes: number) => {
    if (!Number.isFinite(bytes) || bytes < 0) return "—"
    if (bytes < 1024) return `${bytes} Б`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`
    return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`
  }

  let total = $derived(value?.Total ?? 0)
  let used = $derived(value?.Used ?? 0)
  let free = $derived(value?.Free ?? Math.max(total - used, 0))
  let files = $derived(value?.List ?? [])
  let usedPercent = $derived(total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0)
  /* Полоса — мастер-цвет виджета; почти заполненную ФС (закачка скоро начнёт падать) выдаёт только процент */
  let percentColor = $derived(usedPercent >= 90 ? "var(--red-color)" : usedPercent >= 75 ? "var(--orange-color)" : "var(--muted-color)")

  /* Таблица файлов: путь обрезается «…», размер — уже отформатирован, удаление — с подтверждением */
  type FileRow = IWidgetFileSystemFile & { SizeText: string }
  let rows: FileRow[] = $derived(files.map((f) => ({ ...f, SizeText: formatBytes(f.Size) })))
  let header: ITableHeader<FileRow>[] = $derived([
    { label: { name: "Путь" }, content: [{ type: "text", data: { key: "Name", truncated: true, sortable: true } }], width: "1fr", align: "left" },
    { label: { name: "Размер" }, content: [{ type: "text", data: { key: "SizeText" } }], width: "6rem", align: "right" },
    ...(onDelete
      ? [
          {
            label: { name: "" },
            content: [{ type: "button", data: { name: "Удалить", class: "bg-accent", onClick: (row: FileRow) => (pendingDelete = row.Name) } }],
            width: "6.5rem",
            align: "center",
          } as ITableHeader<FileRow>,
        ]
      : []),
  ])

  /* Закачка видна, пока её ведёт этот клиент или пока устройство сообщает Upload (закачка с другого клиента);
     прогресс 0..100, нечисло — 0, а не «NaN%» */
  let upload = $derived(value?.Upload)
  let progress = $derived(Number.isFinite(Number(upload?.Progress)) ? Math.min(100, Math.max(0, Number(upload?.Progress))) : 0)

  let pendingDelete: string | null = $state(null)
  const confirmDelete = () => {
    if (pendingDelete) onDelete?.(pendingDelete)
    pendingDelete = null
  }

  /* Закачка: имя проверяется до отправки (прошивка отвергнет длинное имя уже после UploadStart) */
  let uploading = $state(false)
  let uploadError = $state("")
  const handleFile = async (_event: Event, file: File | null) => {
    uploadError = ""
    if (!file || !onUpload || uploading) return
    if (file.name.length > maxNameLength) {
      uploadError = `Имя файла длиннее ${maxNameLength} символов`
      return
    }
    uploading = true
    try {
      await onUpload(file)
    } catch (error) {
      uploadError = `Закачка прервана: ${error instanceof Error ? error.message : error}`
    } finally {
      uploading = false
    }
  }
</script>

<div
  class={twMerge("relative flex w-full flex-col gap-4 rounded-2xl border border-(--hairline-color) bg-(--container-color) p-4", wrapperClass)}
  style={accentStyle}
>
  <!-- Заголовок -->
  <WidgetHeader icon={StorageIcon} label={label?.name ?? "Файловая система"} bind:collapsed>
    {#snippet right()}
      <UI.Button
        wrapperClass="w-auto"
        componentClass="bg-transparent px-3"
        content={{ icon: RefreshIcon, name: "Обновить" }}
        disabled={!onRefresh}
        onClick={() => onRefresh?.()}
      />
    {/snippet}
  </WidgetHeader>

  {#if !collapsed}
    <div class="flex flex-col gap-4" transition:slide={{ duration: 150 }}>
      <!-- Занятость памяти -->
      <div class="flex flex-col gap-2 rounded-[10px] border border-(--hairline-color) bg-(--back-color) p-3">
        <div class="flex items-baseline justify-between gap-2 text-[13px]">
          <span class="font-semibold">Занято {formatBytes(used)} из {formatBytes(total)}</span>
          <span class="font-semibold tabular-nums" style="color: {percentColor}">{usedPercent}%</span>
        </div>
        <div class="h-2 w-full overflow-hidden rounded-full bg-(--container-color)">
          <div class="h-full rounded-full transition-[width] duration-300" style="width: {usedPercent}%; background: var(--accent-color)"></div>
        </div>
        <div class="flex justify-between gap-2 text-[12px] text-(--muted-color)">
          <span>Свободно {formatBytes(free)}</span>
          <span>Файлов: {files.length}</span>
        </div>
      </div>

      <!-- Файлы -->
      <div class="flex max-h-72 min-h-0 flex-col">
        {#if rows.length}
          <UI.Table {header} body={rows} outline />
        {:else}
          <div class="rounded-[10px] border border-(--hairline-color) bg-(--back-color) p-3 text-center text-[13px] text-(--faint-color)">Файлов нет</div>
        {/if}
      </div>

      <!-- Закачка -->
      {#if onUpload}
        <div class="flex flex-col gap-2 rounded-[10px] border border-(--hairline-color) bg-(--back-color) p-3">
          <UI.FileAttach label={{ name: "Закачать файл" }} {accept} disabled={uploading || !!upload} onChange={handleFile} />
          {#if uploading || upload}
            <div class="flex items-center gap-2 text-[12px]" transition:slide={{ duration: 100 }}>
              {#if upload?.Name}
                <span class="max-w-40 truncate text-(--muted-color)">{upload.Name}</span>
              {/if}
              <div class="h-2 flex-1 overflow-hidden rounded-full bg-(--container-color)">
                <div class="h-full rounded-full bg-(--accent-color) transition-[width] duration-300" style="width: {progress}%"></div>
              </div>
              <span class="w-10 text-right tabular-nums">{Math.round(progress)}%</span>
            </div>
          {/if}
          {#if uploadError}
            <span class="text-[12px] text-(--red-color)" transition:slide={{ duration: 100 }}>{uploadError}</span>
          {/if}
        </div>
      {/if}
    </div>
  {/if}

  {#if pendingDelete}
    <!-- Подтверждение локально к виджету, как предупреждение AP у WidgetWiFi -->
    <div class="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-black/40 backdrop-blur-[2px]" transition:fade={{ duration: 150 }}>
      <div
        class="flex w-full max-w-80 flex-col gap-3 rounded-[16px] border border-(--hairline-color) bg-(--back-color) p-4 shadow-(--elevation-3)"
        transition:scale={{ duration: 150, start: 0.96 }}
      >
        <h4 class="text-[15px] font-semibold">Удалить файл?</h4>
        <p class="text-[13px] break-all text-(--muted-color)">{pendingDelete}</p>
        <div class="flex gap-2">
          <UI.Button wrapperClass="flex-1" componentClass="bg-transparent" content={{ name: "Отмена" }} onClick={() => (pendingDelete = null)} />
          <UI.Button wrapperClass="flex-1" componentClass="bg-red" content={{ name: "Удалить" }} onClick={confirmDelete} />
        </div>
      </div>
    </div>
  {/if}
</div>
