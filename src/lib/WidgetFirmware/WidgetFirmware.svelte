<!-- $lib/WidgetFirmware/WidgetFirmware.svelte - смарт-виджет обновления прошивки модуля: текущая версия (CFG.DevFW), выбор версии из каталога (VerFW-S) или файла, полоса хода и строка этапа. Как обновлять (через хаб или напрямую через загрузчик), решает приложение: виджет только зовёт onUpdate и показывает ход, который тот сообщает -->
<script lang="ts">
  import { untrack } from "svelte"
  import { T } from "../locales/i18n"
  import { slide } from "svelte/transition"
  import { twMerge } from "tailwind-merge"
  import * as UI from ".."
  import type { IWidgetFirmwareProps, WidgetFirmwareSource, WidgetFirmwareStage } from "../types"
  import FirmwareIcon from "./FirmwareIcon.svelte"
  import WidgetHeader from "../WidgetHeader.svelte"
  import { hint, hintsSetting } from "../hints"
  import { accentStyle } from "../accent"
  import { readPersistedCollapsed, writePersistedCollapsed } from "../widgetCollapse"
  import { FirmwareUpdateError } from "../firmwareUpdate"

  let {
    wrapperClass = "",
    accent,
    label = {},
    value,
    versions = [],
    accept = ".bin",
    sources = {},
    collapsed = $bindable(false),
    persistKey,
    onUpdate,
  }: IWidgetFirmwareProps = $props()

  /* Подсказки - кнопка «?» в шапке, выбор общий для всех WidgetFirmware */
  const hints = $derived(hintsSetting("WidgetFirmware", persistKey))

  const rootStyle = $derived(accentStyle(accent))

  /* Сворачивание тела по клику на шапку - как у остальных смарт-виджетов (см. WidgetWiFi.svelte) */
  /* Выбор пользователя в этом браузере применяется до первой отрисовки, без мигания; значение из GUI запоминается, чтобы его смена отменяла старый выбор */
  const guiCollapsed = untrack(() => collapsed)
  collapsed = readPersistedCollapsed(
    untrack(() => persistKey),
    guiCollapsed,
  )
  $effect(() => writePersistedCollapsed(persistKey, collapsed, guiCollapsed))

  /* Текущая версия: подпись из списка каталога, если там есть такой номер, иначе число как есть */
  const current = $derived.by(() => {
    const fw = value?.DevFW
    if (fw === undefined || fw === null || (fw as unknown) === "") return ""
    return versions.find((option) => Number(option.value) === Number(fw))?.name ?? String(fw)
  })

  /* Виджет активен, только когда приложение дало onUpdate (облако, терминал); в конструкторе - подсказка */
  const enabled = $derived(!!onUpdate && (!!sources.version || !!sources.file))

  let selected: number | null = $state(null)
  let running = $state(false)
  let stage: WidgetFirmwareStage | "done" | "error" | null = $state(null)
  let percent = $state(0)
  let errorText = $state("")

  const canUpdate = $derived(enabled && !!sources.version && selected !== null && !running)

  /* Строка состояния по этапу */
  const statusText = $derived.by(() => {
    if (stage === "done") return $T("widget.firmware.done")
    if (stage === "error") return $T("widget.firmware.failed", { error: errorText })
    if (stage === "write" || stage === "hub") return $T(`widget.firmware.stage.${stage}`, { n: Math.round(percent) })
    return stage ? $T(`widget.firmware.stage.${stage}`) : ""
  })

  /* Текст ошибки: код FirmwareUpdateError переводится словарём, чужая ошибка - её message */
  const describe = (error: unknown) =>
    error instanceof FirmwareUpdateError ? $T(error.key, error.params) : error instanceof Error ? error.message : String(error)

  /* Одно обновление за раз: ход приходит от приложения через onProgress */
  const start = async (source: WidgetFirmwareSource) => {
    if (!onUpdate || running) return
    running = true
    errorText = ""
    percent = 0
    stage = "start"
    try {
      await onUpdate(source, (next, value) => {
        stage = next
        percent = Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0))
      })
      percent = 100
      stage = "done"
    } catch (error) {
      errorText = describe(error)
      stage = "error"
    } finally {
      running = false
    }
  }

  const handleFile = (file: File | null) => {
    if (file && sources.file) start({ file })
  }
</script>

<div
  class={twMerge("@container relative flex w-full flex-col gap-4 rounded-2xl border border-(--hairline-color) bg-(--container-color) p-4", wrapperClass)}
  style={rootStyle}
>
  <!-- Заголовок: текущая версия справа -->
  <WidgetHeader icon={FirmwareIcon} label={label?.name || $T("widget.firmware.title")} bind:collapsed {hints}>
    {#snippet right()}
      {#if current}
        <span class="truncate text-[13px] text-(--muted-color) tabular-nums">{$T("widget.firmware.current", { version: current })}</span>
      {/if}
    {/snippet}
  </WidgetHeader>

  {#if !collapsed}
    <div class="flex flex-col gap-3" transition:slide={{ duration: 150 }}>
      {#if !enabled}
        <div class="rounded-[10px] border border-(--hairline-color) bg-(--back-color) p-3 text-center text-[13px] text-(--faint-color)">
          {$T("widget.firmware.unavailable")}
        </div>
      {/if}

      <!-- Версия из каталога -->
      <div class="flex items-end gap-2" use:hint={{ text: $T("widget.firmware.hint.version"), enabled: $hints }}>
        <UI.Select
          wrapperClass="min-w-0 flex-1"
          label={{ name: $T("widget.firmware.version") }}
          options={versions}
          value={selected}
          disabled={!enabled || !sources.version || running || !versions.length}
          onUpdate={(value) => (selected = Number(value))}
        />
        <UI.Button
          wrapperClass="w-auto"
          componentClass="px-3"
          content={{ name: $T("widget.firmware.update") }}
          disabled={!canUpdate}
          onClick={() => selected !== null && start({ VerFW: selected })}
        />
      </div>
      {#if enabled && sources.version && !versions.length}
        <span class="text-[12px] text-(--faint-color)">{$T("widget.firmware.no_versions")}</span>
      {/if}

      <!-- Файл: только когда приложение умеет обновлять файлом -->
      {#if enabled && sources.file}
        <div use:hint={{ text: $T("widget.firmware.hint.file"), enabled: $hints }}>
          <UI.FileAttach label={{ name: $T("widget.firmware.file") }} {accept} disabled={running} onUpdate={handleFile} />
        </div>
      {/if}

      <!-- Ход и этап -->
      {#if stage}
        <div class="flex flex-col gap-1.5" transition:slide={{ duration: 100 }}>
          <UI.ProgressBar
            items={[{ name: "", accent: stage === "error" ? "red" : stage === "done" ? "green" : undefined }]}
            value={[{ Name: "", Value: percent }]}
            number={{ minNum: 0, maxNum: 100, units: "%" }}
          />
          <span class="text-[12px] {stage === 'error' ? 'text-(--red-text)' : 'text-(--muted-color)'}">{statusText}</span>
        </div>
      {/if}
    </div>
  {/if}
</div>
