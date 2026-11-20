<!-- $lib/SensorSettings.svelte - настройки микросхемы датчика в WidgetIMU и WidgetMag: поля слова Cfg по описанию из sensorChips.ts (списки, число, переключатели), сворачиваемый раздел. Правки локальные до «Сохранить»; биты, которых нет в описании, и режим (биты 0-1) не меняются. «По умолчанию» - заводское слово микросхемы с текущим режимом -->
<script lang="ts">
  import { untrack } from "svelte"
  import * as UI from "."
  import { T } from "./locales/i18n"
  import SectionHead from "./SectionHead.svelte"
  import { bitFieldGet, bitFieldSet } from "./bitField"
  import type { SensorChipField, SensorChipPart } from "./sensorChips"

  let {
    part,
    cfg,
    onSave,
  }: {
    part: SensorChipPart
    cfg: unknown
    /* Новое слово Cfg; без колбэка - только просмотр */
    onSave?: (cfg: number) => void
  } = $props()

  let open = $state(false)
  const incoming = $derived(cfg === undefined || cfg === null || cfg === "" ? undefined : Number(cfg) >>> 0)
  /* Правки локальные: новое слово с устройства подхватывается, только пока правок нет */
  let word = $state(untrack(() => incoming))
  let saved = $state(untrack(() => incoming))
  const isDirty = $derived(word !== saved)
  $effect(() => {
    const next = incoming
    if (untrack(() => isDirty)) return
    word = next
    saved = next
  })

  const readOnly = $derived(!onSave || word === undefined)
  const get = (field: SensorChipField) => (word === undefined ? undefined : bitFieldGet(word, field.start, field.end))
  const set = (field: SensorChipField, value: unknown) => {
    const number = Number(value)
    if (word === undefined || !Number.isFinite(number)) return
    word = bitFieldSet(word, field.start, field.end, field.type === "number" ? Math.min(field.max, Math.max(field.min, Math.round(number))) : number)
  }
  /* Подпись варианта: @имя - перевод sensor.opt.<имя>, иначе как есть (числа с единицами) */
  const optionName = (name: string) => (name.startsWith("@") ? $T(`sensor.opt.${name.slice(1)}`) : name)
  /* Сводка свёрнутого раздела: выбранные варианты списков */
  const summary = $derived(
    part.sections
      .flatMap((section) => section.fields)
      .flatMap((field) => (field.type === "select" ? [field.options.find((o) => o.value === get(field))?.name] : []))
      .filter((name): name is string => !!name)
      .map(optionName)
      .join(" · "),
  )

  const save = () => {
    if (!onSave || word === undefined) return
    onSave(word)
    saved = word
  }
  /* Заводское слово с текущим режимом: «По умолчанию» не останавливает и не запускает измерение */
  const reset = () => {
    if (word !== undefined) word = bitFieldSet(part.factory, 0, 1, bitFieldGet(word, 0, 1))
  }
</script>

<div class="flex flex-col rounded-[10px] border border-(--hairline-color) bg-(--back-color)">
  <div class="px-3 py-2"><SectionHead title={$T("sensor.settings")} {summary} bind:open /></div>
  {#if open}
    <div class="flex flex-col gap-3 border-t border-(--hairline-color) p-3">
      {#each part.sections as section (section.name)}
        <div class="flex flex-col gap-2">
          <span class="text-[12px] font-semibold text-(--muted-color)">{$T(`sensor.section.${section.name}`)}</span>
          <!-- Колонка не уже подписи: подпись целиком в одну строку, лишние поля уходят в следующий ряд -->
          <div class="grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] items-end gap-2">
            {#each section.fields as field (field.key)}
              {#if field.type === "switch"}
                <UI.Switch
                  type="horizontal"
                  label={{ name: $T(`sensor.field.${field.key}`) }}
                  value={get(field) ?? 0}
                  disabled={readOnly}
                  onUpdate={(value) => set(field, value ? 1 : 0)}
                />
              {:else if field.type === "select"}
                <UI.Select
                  label={{ name: $T(`sensor.field.${field.key}`) }}
                  options={field.options.map((o) => ({ id: `${section.name}-${field.key}-${o.value}`, name: optionName(o.name), value: o.value }))}
                  value={get(field)}
                  disabled={readOnly}
                  onUpdate={(value) => set(field, value)}
                />
              {:else}
                <UI.Input
                  type="number"
                  label={{ name: $T(`sensor.field.${field.key}`) }}
                  value={get(field) ?? ""}
                  readonly={readOnly}
                  number={{ minNum: field.min, maxNum: field.max, step: 1 }}
                  onUpdate={(value) => set(field, value)}
                />
              {/if}
            {/each}
          </div>
        </div>
      {/each}

      {#if onSave}
        <div class="flex flex-col items-center gap-2">
          <span class="text-[12px] text-(--muted-color) {isDirty ? '' : 'invisible'}">{$T("widget.common.unsaved")}</span>
          <div class="flex flex-wrap justify-center gap-2">
            <UI.Button wrapperClass="w-40" content={{ name: $T("sensor.default") }} disabled={word === undefined} onClick={reset} />
            <UI.Button wrapperClass="w-40" variant="primary" content={{ name: $T("widget.common.save") }} disabled={!isDirty} onClick={save} />
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>
