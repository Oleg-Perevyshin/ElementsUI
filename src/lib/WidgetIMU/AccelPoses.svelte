<!-- $lib/WidgetIMU/AccelPoses.svelte - калибровка акселерометра по 6 положениям в WidgetIMU: какие положения записаны (биты ACP: +X, -X, +Y, -Y, +Z, -Z), кнопка «Записать положение» - слово Cfg с режимом 3; ось вверх или вниз прошивка определяет сама, после шестого положения сохраняет смещения и масштаб и сбрасывает ACP. Сворачиваемый раздел -->
<script lang="ts">
  import * as UI from ".."
  import { T } from "../locales/i18n"
  import SectionHead from "../SectionHead.svelte"
  import { hint } from "../hints"
  import { bitFieldSet } from "../bitField"

  let {
    poses,
    cfg,
    onRecord,
    onRefresh,
    hints = false,
  }: {
    /* Биты записанных положений из прошивки (ACP) */
    poses: unknown
    cfg: unknown
    /* Слово Cfg с режимом «записать положение»; без колбэка - только просмотр */
    onRecord?: (cfg: number) => void
    /* Перечитать настройки: прошивка присылает ACP только по запросу */
    onRefresh?: () => void
    hints?: boolean
  } = $props()

  /* Режим задачи драйвера «записать положение» (биты 0-1 Cfg) */
  const POSE_MODE = 3
  /* Запись: 0.5 с успокоения и 1 с отсчётов, перечитываем с запасом */
  const RECORD_MS = 2500
  const NAMES = ["+X", "-X", "+Y", "-Y", "+Z", "-Z"]

  let open = $state(false)
  let busy = $state(false)
  const bits = $derived(Number(poses) || 0)
  const done = $derived(NAMES.filter((_, i) => (bits >> i) & 1).length)

  const record = () => {
    if (!onRecord || busy || cfg === undefined || cfg === null || cfg === "") return
    onRecord(bitFieldSet(Number(cfg) >>> 0, 0, 1, POSE_MODE))
    busy = true
    setTimeout(() => {
      busy = false
      onRefresh?.()
    }, RECORD_MS)
  }
</script>

<div class="flex flex-col rounded-[10px] border border-(--hairline-color) bg-(--back-color)">
  <div class="px-3 py-2" use:hint={{ text: $T("widget.imu.hint.pose"), enabled: hints }}>
    <SectionHead title={$T("widget.imu.pose.title")} summary={`${done} / 6`} bind:open />
  </div>
  {#if open}
    <div class="flex flex-col gap-3 border-t border-(--hairline-color) p-3">
      <span class="text-[12px] text-(--muted-color)">{$T("widget.imu.pose.howto")}</span>
      <!-- Записанные положения залиты цветом виджета -->
      <div class="grid grid-cols-6 gap-1.5">
        {#each NAMES as name, index (name)}
          {@const on = ((bits >> index) & 1) === 1}
          <span
            class="flex h-7 min-w-0 items-center justify-center rounded-[8px] border text-[13px] font-semibold tabular-nums {on
              ? 'border-transparent bg-(--accent-color) text-(--on-accent)'
              : 'border-(--border-color) text-(--muted-color)'}"
          >
            {name}
          </span>
        {/each}
      </div>
      {#if onRecord}
        <UI.Button
          wrapperClass="w-full max-w-80 self-center"
          componentClass="whitespace-nowrap"
          variant="primary"
          content={{ name: $T(busy ? "widget.imu.pose.recording" : "widget.imu.pose.record") }}
          disabled={busy}
          onClick={record}
        />
      {/if}
    </div>
  {/if}
</div>
