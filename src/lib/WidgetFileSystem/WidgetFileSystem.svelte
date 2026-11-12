<!-- $lib/WidgetFileSystem/WidgetFileSystem.svelte - смарт-виджет файловой системы устройства. Данные - один объект CFG.FS в том виде, в каком его отдаёт прошивка (FS_WriteState, ProdFactory-ESP): Total/Used/Free/List[{Name, Size}] и Upload{Name, Size, Progress} - только пока идёт закачка. Ничего не знает про DeviceStore/WebSocket - value/onRefresh/onDelete/onUpload/onDownload, протоколы закачки и скачивания (SET FS с Op UploadStart/UploadChunk/UploadDone и DownloadStart/DownloadChunk/DownloadDone) и отправка команд на стороне вызывающего. -->
<script lang="ts">
  import { untrack } from "svelte"
  import { T } from "../locales/i18n"
  import { slide, fade, scale } from "svelte/transition"
  import { twMerge } from "tailwind-merge"
  import * as UI from ".."
  import type { IWidgetFileSystemFile, IWidgetFileSystemProps, ITableHeader, ITableContent } from "../types"
  import StorageIcon from "./StorageIcon.svelte"
  import RefreshIcon from "./RefreshIcon.svelte"
  import ButtonDownload from "../libIcons/ButtonDownload.svelte"
  import ButtonDelete from "../libIcons/ButtonDelete.svelte"
  import WidgetHeader from "../WidgetHeader.svelte"
  import { hint, hintsSetting } from "../hints"
  import { accentStyle } from "../accent"
  import { readPersistedCollapsed, writePersistedCollapsed } from "../widgetCollapse"
  import { FsNameError, FsTransferError } from "../fsTransfer"

  let {
    wrapperClass = "",
    accent,
    label = {},
    value,
    accept = "*/*",
    collapsed = $bindable(false),
    persistKey,
    onRefresh,
    onDelete,
    onUpload,
    onDownload,
  }: IWidgetFileSystemProps = $props()

  /* Подсказки - кнопка «?» в шапке, выбор общий для всех WidgetFileSystem */
  const hints = $derived(hintsSetting("WidgetFileSystem", persistKey))

  const rootStyle = $derived(accentStyle(accent))

  /* Сворачивание тела по клику на шапку - как у остальных смарт-виджетов (см. WidgetWiFi.svelte) */
  /* Выбор пользователя в этом браузере применяется до первой отрисовки, без мигания; значение из GUI запоминается, чтобы его смена отменяла старый выбор */
  const guiCollapsed = untrack(() => collapsed)
  collapsed = readPersistedCollapsed(
    untrack(() => persistKey),
    guiCollapsed,
  )
  $effect(() => writePersistedCollapsed(persistKey, collapsed, guiCollapsed))

  /* Размер в человекочитаемом виде: Б / КБ / МБ, одна цифра после запятой начиная с КБ */
  const formatBytes = (bytes: number) => {
    if (!Number.isFinite(bytes) || bytes < 0) return "-"
    if (bytes < 1024) return $T("widget.common.bytes", { n: bytes })
    if (bytes < 1024 * 1024) return $T("widget.common.kbytes", { n: (bytes / 1024).toFixed(1) })
    return $T("widget.common.mbytes", { n: (bytes / (1024 * 1024)).toFixed(1) })
  }

  let total = $derived(value?.Total ?? 0)
  let used = $derived(value?.Used ?? 0)
  let free = $derived(value?.Free ?? Math.max(total - used, 0))
  let files = $derived(value?.List ?? [])
  let usedPercent = $derived(total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0)
  /* Полоса - мастер-цвет виджета; почти заполненную ФС (закачка скоро начнёт падать) выдаёт только процент */
  let percentColor = $derived(usedPercent >= 90 ? "var(--red-text)" : usedPercent >= 75 ? "var(--orange-text)" : "var(--muted-color)")

  /* Таблица файлов: путь обрезается «…», размер - уже отформатирован; действия - значки без текста: скачать и удалить (с подтверждением) */
  type FileRow = IWidgetFileSystemFile & { SizeText: string }
  let rows: FileRow[] = $derived(files.map((f) => ({ ...f, SizeText: formatBytes(f.Size) })))
  let actions = $derived(
    [
      onDownload && {
        type: "button",
        data: { icon: ButtonDownload, title: $T("widget.fs.download"), class: "bg-transparent px-0", onClick: (row: FileRow) => handleDownload(row.Name) },
      },
      onDelete && {
        type: "button",
        data: {
          icon: ButtonDelete,
          title: $T("widget.common.delete"),
          class: "bg-transparent px-0 text-(--red-text) hover:bg-(--red-color)/10",
          onClick: (row: FileRow) => (pendingDelete = row.Name),
        },
      },
    ].filter(Boolean) as ITableContent<FileRow>[],
  )
  let header: ITableHeader<FileRow>[] = $derived([
    { label: { name: $T("widget.fs.path") }, content: [{ type: "text", data: { key: "Name", truncated: true, sortable: true } }], width: "1fr", align: "left" },
    { label: { name: $T("widget.fs.size") }, content: [{ type: "text", data: { key: "SizeText" } }], width: "6rem", align: "right" },
    ...(actions.length ? [{ label: { name: "" }, content: actions, width: `${actions.length * 2.5 + 1}rem`, align: "center" } as ITableHeader<FileRow>] : []),
  ])

  /* Закачка видна, пока её ведёт этот клиент или пока устройство сообщает Upload (закачка с другого клиента); прогресс 0..100, нечисло - 0, а не «NaN%» */
  let upload = $derived(value?.Upload)
  let progress = $derived(Number.isFinite(Number(upload?.Progress)) ? Math.min(100, Math.max(0, Number(upload?.Progress))) : 0)

  let pendingDelete: string | null = $state(null)
  const confirmDelete = () => {
    if (pendingDelete) onDelete?.(pendingDelete)
    pendingDelete = null
  }

  /* Текст ошибки: код FsTransferError переводится словарём, чужая ошибка - её message */
  const errorText = (error: unknown) =>
    error instanceof FsTransferError ? $T(error.key, error.params) : error instanceof Error ? error.message : String(error)

  /* Скачивание: одно за раз, ошибка вызывающего показывается под таблицей */
  let downloading: string | null = $state(null)
  let downloadError = $state("")
  const handleDownload = async (name: string) => {
    if (!onDownload || downloading) return
    downloadError = ""
    downloading = name
    try {
      await onDownload(name)
    } catch (error) {
      downloadError = $T("widget.fs.download_failed", { error: errorText(error) })
    } finally {
      downloading = null
    }
  }

  /* Закачка: длину имени проверяет createFsTransfer (FsNameError) до UploadStart, виджет только переводит сообщение */
  let uploading = $state(false)
  let uploadError = $state("")
  const handleFile = async (file: File | null) => {
    uploadError = ""
    if (!file || !onUpload || uploading) return
    uploading = true
    try {
      await onUpload(file)
    } catch (error) {
      uploadError = error instanceof FsNameError ? errorText(error) : $T("widget.fs.upload_failed", { error: errorText(error) })
    } finally {
      uploading = false
    }
  }
</script>

<div
  class={twMerge("@container relative flex w-full flex-col gap-4 rounded-2xl border border-(--hairline-color) bg-(--container-color) p-4", wrapperClass)}
  style={rootStyle}
>
  <!-- Заголовок -->
  <WidgetHeader icon={StorageIcon} label={label?.name || $T("widget.fs.title")} bind:collapsed {hints}>
    {#snippet right(narrow: boolean)}
      <UI.Button
        wrapperClass="w-auto"
        componentClass="px-3"
        content={narrow
          ? { icon: RefreshIcon, info: { text: $T("widget.common.refresh"), side: "left" } }
          : { icon: RefreshIcon, name: $T("widget.common.refresh") }}
        disabled={!onRefresh}
        onClick={() => onRefresh?.()}
      />
    {/snippet}
  </WidgetHeader>

  {#if !collapsed}
    <div class="flex flex-col gap-4" transition:slide={{ duration: 150 }}>
      <!-- Занятость памяти -->
      <div
        class="flex flex-col gap-2 rounded-[10px] border border-(--hairline-color) bg-(--back-color) p-3"
        use:hint={{ text: $T("widget.fs.hint.usage"), enabled: $hints }}
      >
        <div class="flex items-baseline justify-between gap-2 text-[13px]">
          <span class="font-semibold">{$T("widget.fs.used", { used: formatBytes(used), total: formatBytes(total) })}</span>
          <span class="font-semibold tabular-nums" style="color: {percentColor}">{usedPercent}%</span>
        </div>
        <div class="h-2 w-full overflow-hidden rounded-full bg-(--container-color)">
          <div class="h-full rounded-full transition-[width] duration-300" style="width: {usedPercent}%; background: var(--accent-color)"></div>
        </div>
        <div class="flex justify-between gap-2 text-[12px] text-(--muted-color)">
          <span>{$T("widget.common.free", { size: formatBytes(free) })}</span>
          <span>{$T("widget.fs.files", { n: files.length })}</span>
        </div>
      </div>

      <!-- Файлы -->
      <div class="flex max-h-72 min-h-0 flex-col" use:hint={{ text: $T("widget.fs.hint.files"), enabled: $hints }}>
        {#if rows.length}
          <UI.Table {header} body={rows} outline />
        {:else}
          <div class="rounded-[10px] border border-(--hairline-color) bg-(--back-color) p-3 text-center text-[13px] text-(--faint-color)">
            {$T("widget.fs.empty")}
          </div>
        {/if}
        {#if downloading}
          <span class="mt-2 truncate text-[12px] text-(--muted-color)" transition:slide={{ duration: 100 }}
            >{$T("widget.fs.downloading", { name: downloading })}</span
          >
        {/if}
        {#if downloadError}
          <span class="mt-2 text-[12px] text-(--red-text)" transition:slide={{ duration: 100 }}>{downloadError}</span>
        {/if}
      </div>

      <!-- Закачка -->
      {#if onUpload}
        <div class="flex flex-col gap-2 rounded-[10px] border border-(--hairline-color) bg-(--back-color) p-3">
          <div use:hint={{ text: $T("widget.fs.hint.upload"), enabled: $hints }}>
            <UI.FileAttach label={{ name: $T("widget.fs.upload") }} {accept} disabled={uploading || !!upload} onUpdate={handleFile} />
          </div>
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
            <span class="text-[12px] text-(--red-text)" transition:slide={{ duration: 100 }}>{uploadError}</span>
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
        <h4 class="text-[15px] font-semibold">{$T("widget.fs.delete_confirm")}</h4>
        <p class="text-[13px] break-all text-(--muted-color)">{pendingDelete}</p>
        <div class="flex gap-2">
          <UI.Button wrapperClass="flex-1" content={{ name: $T("widget.common.cancel") }} onClick={() => (pendingDelete = null)} />
          <UI.Button wrapperClass="flex-1" variant="primary" accent="red" content={{ name: $T("widget.common.delete") }} onClick={confirmDelete} />
        </div>
      </div>
    </div>
  {/if}
</div>
