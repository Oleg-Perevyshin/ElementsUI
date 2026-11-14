<!-- $lib/WidgetLoRa/WidgetLoRa.svelte - смарт-виджет настроек радио LoRa: частота, мощность, полоса, SF, CR, преамбула, CRC, InvIQ. Где каждый параметр в прошивке (ключ, биты, масштаб, коды) - в params (lora.ts), поэтому виджет подходит любой микросхеме и драйверу. Сохраняет одним пакетом; ничего не знает про DeviceStore/WebSocket - value/onSave. -->
<script lang="ts">
  import { T } from "../locales/i18n"
  import { untrack } from "svelte"
  import { slide } from "svelte/transition"
  import { twMerge } from "tailwind-merge"
  import * as UI from ".."
  import type { IWidgetLoRaProps } from "../types"
  import { LORA_PARAMS, LORA_SWITCHES, loraDecode, loraEncode, type LoRaParam, type LoRaValues } from "./lora"
  import RadioIcon from "./RadioIcon.svelte"
  import WidgetHeader from "../WidgetHeader.svelte"
  import { hint, hintsSetting } from "../hints"
  import { accentStyle } from "../accent"
  import { readPersistedCollapsed, writePersistedCollapsed } from "../widgetCollapse"

  let { wrapperClass = "", accent, label = {}, value, params = {}, collapsed = $bindable(false), persistKey, onSave }: IWidgetLoRaProps = $props()

  const hints = $derived(hintsSetting("WidgetLoRa", persistKey))
  const rootStyle = $derived(accentStyle(accent))

  /* Свёрнутость: как у WidgetDeviceInfo - выбор пользователя переживает перезагрузку (persistKey) */
  const guiCollapsed = untrack(() => collapsed)
  collapsed = readPersistedCollapsed(
    untrack(() => persistKey),
    guiCollapsed,
  )
  $effect(() => writePersistedCollapsed(persistKey, collapsed, guiCollapsed))

  /* Правки локальные до «Сохранить»; новые значения с устройства подхватываются, только пока правок нет */
  const decoded = $derived(loraDecode(params, value ?? {}))
  let values: LoRaValues = $state(untrack(() => ({ ...decoded })))
  let savedSnapshot = $state(untrack(() => JSON.stringify(decoded)))
  const isDirty = $derived(JSON.stringify(values) !== savedSnapshot)
  $effect(() => {
    const incoming = decoded
    if (untrack(() => isDirty)) return
    values = { ...incoming }
    savedSnapshot = JSON.stringify(incoming)
  })

  const shown = $derived(LORA_PARAMS.filter((name) => params[name]?.key))
  const fields = $derived(shown.filter((name) => !LORA_SWITCHES.includes(name)))
  const switches = $derived(shown.filter((name) => LORA_SWITCHES.includes(name)))
  const readOnly = $derived(!onSave)

  const set = (name: LoRaParam, input: unknown) => {
    const number = Number(input)
    if (Number.isFinite(number)) values = { ...values, [name]: number }
  }

  const save = () => {
    if (!onSave) return
    onSave(loraEncode(params, value ?? {}, values))
    savedSnapshot = JSON.stringify(values)
  }
</script>

<div
  class={twMerge("@container relative flex w-full flex-col gap-4 rounded-2xl border border-(--hairline-color) bg-(--container-color) p-4", wrapperClass)}
  style={rootStyle}
>
  <WidgetHeader icon={RadioIcon} label={label?.name || $T("widget.lora.title")} bind:collapsed {hints} />

  {#if !collapsed}
    <div class="flex flex-col gap-4" transition:slide={{ duration: 150 }}>
      {#if !shown.length}
        <span class="text-center text-[13px] text-(--muted-color)">{$T("widget.lora.empty")}</span>
      {:else}
        <div class="flex flex-col gap-3 rounded-[10px] border border-(--hairline-color) bg-(--back-color) p-3">
          <div class="grid grid-cols-1 gap-2 @sm:grid-cols-2 @lg:grid-cols-3">
            {#each fields as name (name)}
              {@const p = params[name]!}
              <div use:hint={{ text: $T(`widget.lora.hint.${name}`), enabled: $hints }}>
                {#if p.options?.length}
                  <UI.Select
                    label={{ name: $T(`widget.lora.${name}`) }}
                    options={p.options.map((option) => ({ id: `${name}-${option.value}`, name: option.name, value: option.value }))}
                    value={values[name]}
                    disabled={readOnly}
                    onUpdate={(code) => set(name, code)}
                  />
                {:else}
                  <UI.Input
                    type="number"
                    label={{ name: $T(`widget.lora.${name}`) }}
                    value={values[name] ?? ""}
                    readonly={readOnly}
                    number={{ minNum: p.min, maxNum: p.max, step: p.step ?? 1 }}
                    onUpdate={(input) => set(name, input)}
                  />
                {/if}
              </div>
            {/each}
          </div>
          {#if switches.length}
            <div class="flex flex-wrap items-center justify-center gap-6">
              {#each switches as name (name)}
                <div use:hint={{ text: $T(`widget.lora.hint.${name}`), enabled: $hints }}>
                  <UI.Switch
                    type="horizontal"
                    label={{ name: $T(`widget.lora.${name}`) }}
                    value={values[name] ? 1 : 0}
                    disabled={readOnly}
                    onUpdate={(state) => set(name, state)}
                  />
                </div>
              {/each}
            </div>
          {/if}
        </div>

        {#if !readOnly}
          <div class="flex flex-col items-center gap-2">
            {#if isDirty}
              <span class="text-[12px] text-(--muted-color)" transition:slide={{ duration: 100 }}>{$T("widget.lora.unsaved")}</span>
            {/if}
            <UI.Button wrapperClass="w-40" variant="primary" content={{ name: $T("widget.common.save") }} disabled={!isDirty} onClick={save} />
          </div>
        {/if}
      {/if}
    </div>
  {/if}
</div>
