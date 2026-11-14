<!-- $lib/WidgetLoRa/WidgetLoRaProps.svelte - панель пропсов конструктора для WidgetLoRa: заголовок, мастер-цвет, префикс группы; шаблон драйвера заполняет params разом; каждый параметр - сворачиваемый блок: в шапке название, сводка и вкл/выкл, внутри ключ группы, биты слова, масштаб и смещение числа или таблица кодов списка -->
<script lang="ts">
  import TextsEditor from "../TextsEditor.svelte"
  import { T } from "../locales/i18n"
  import * as UI from ".."
  import type { UIComponent, IWidgetLoRaProps } from "../types"
  import { createPropsEditor, type PropertyChange } from "../propsEditor"
  import PropsGroup from "../PropsGroup.svelte"
  import CommonSnippets from "../CommonSnippets.svelte"
  import { LORA_PARAMS, LORA_PRESETS, LORA_SWITCHES, type ILoRaOption, type ILoRaParamConfig, type LoRaParam } from "./lora"
  import SectionHead from "../SectionHead.svelte"
  import { slide } from "svelte/transition"
  import { SvelteSet } from "svelte/reactivity"

  const {
    component,
    onPropertyChange,
  }: {
    component: UIComponent<"WidgetLoRa">
    onPropertyChange: (change: PropertyChange<IWidgetLoRaProps>) => void
  } = $props()

  const edit = $derived(createPropsEditor(component, onPropertyChange))
  const params = $derived(component.properties.params ?? {})

  const PRESET_OPTIONS = Object.entries(LORA_PRESETS).map(([value, preset]) => ({ id: value, name: preset.name, value }))

  const applyPreset = (preset: string) => {
    const found = LORA_PRESETS[preset]
    if (!found) return
    edit.set("preset", preset)
    edit.set("params", structuredClone(found.params))
  }

  /* Параметр целиком заменяется копией: params - один объект свойства */
  const setParam = (name: LoRaParam, patch: Partial<ILoRaParamConfig> | null) => {
    const next = { ...params }
    if (patch === null) delete next[name]
    else next[name] = { key: "Cfg", ...next[name], ...patch }
    edit.set("params", next)
  }

  /* Раскрытые параметры - только в этой панели; по умолчанию все свёрнуты */
  const opened = new SvelteSet<LoRaParam>()
  const toggle = (name: LoRaParam) => (opened.has(name) ? opened.delete(name) : opened.add(name))

  /* Сводка в шапке: ключ и биты, у списка - число вариантов */
  const summary = (p: ILoRaParamConfig) =>
    [
      p.key,
      p.bits
        ? p.bits.start === p.bits.end
          ? `${$T("widget.lora.props.bit")} ${p.bits.start}`
          : `${$T("widget.lora.props.bit_range")} ${p.bits.start}-${p.bits.end}`
        : "",
      p.options?.length ? `${$T("widget.lora.props.variants")}: ${p.options.length}` : "",
    ]
      .filter(Boolean)
      .join(" · ")

  const num = (input: unknown): number | undefined => (input === "" || input === undefined || !Number.isFinite(Number(input)) ? undefined : Number(input))

  /* Таблица кодов строкой: "125=4 250=5 500=6" */
  const optionsText = (options?: ILoRaOption[]) => (options ?? []).map((o) => `${o.name}=${o.value}`).join(" ")
  const parseOptions = (text: string): ILoRaOption[] | undefined => {
    const options = text
      .trim()
      .split(/\s+/)
      .flatMap((pair) => {
        const [name, code] = pair.split("=")
        return name && Number.isFinite(Number(code)) && code !== "" ? [{ name, value: Number(code) }] : []
      })
    return options.length ? options : undefined
  }
</script>

{#snippet ParamRow(name: LoRaParam)}
  {@const p = params[name]}
  {@const open = !!p && opened.has(name)}
  <!-- Шапка: параметр, сводка и вкл/выкл; настройки места в прошивке - внутри, по раскрытию -->
  <div class="flex flex-col gap-2 rounded-lg border border-(--hairline-color) px-2.5 py-2">
    <div class="flex items-center gap-2">
      <div class="min-w-0 flex-1">
        {#if p}
          <SectionHead title={$T(`widget.lora.${name}`)} summary={summary(p)} {open} onToggle={() => toggle(name)} />
        {:else}
          <span class="text-[13px] font-semibold text-(--muted-color)">{$T(`widget.lora.${name}`)}</span>
        {/if}
      </div>
      <UI.Switch
        wrapperClass="w-auto shrink-0"
        value={p ? 1 : 0}
        onUpdate={(on) => {
          setParam(name, on === 1 ? {} : null)
          if (on !== 1) opened.delete(name)
        }}
      />
    </div>
    {#if open && p}
      <div class="flex flex-col gap-2" transition:slide={{ duration: 150 }}>
        <div class="flex flex-wrap items-end gap-2">
          <UI.Input
            wrapperClass="w-24"
            label={{ name: $T("widget.lora.props.key") }}
            value={p.key}
            help={{ info: $T("widget.lora.props.key.info"), regExp: /^[A-Za-z0-9_]{1,12}$/ }}
            onUpdate={(value) => setParam(name, { key: String(value) })}
          />
          <UI.Switch
            type="checkbox"
            wrapperClass="h-8 w-auto shrink-0 justify-start"
            label={{ name: $T("widget.lora.props.bits") }}
            help={{ info: $T("widget.lora.props.bits.info") }}
            value={p.bits ? 1 : 0}
            onUpdate={(on) => setParam(name, { bits: on === 1 ? { start: 0, end: LORA_SWITCHES.includes(name) ? 0 : 7 } : undefined })}
          />
        </div>
        {#if p.bits && LORA_SWITCHES.includes(name)}
          <!-- Переключатель - один бит -->
          <UI.Slider
            label={{ name: `${$T("widget.lora.props.bit")}: ${p.bits.start}` }}
            number={{ minNum: 0, maxNum: 31, step: 1 }}
            value={p.bits.start}
            onUpdate={(value) => typeof value === "number" && setParam(name, { bits: { start: value, end: value } })}
          />
        {:else if p.bits}
          <UI.Slider
            label={{ name: `${$T("widget.lora.props.bit_range")}: ${p.bits.start}-${p.bits.end}` }}
            type="range"
            number={{ minNum: 0, maxNum: 31, step: 1 }}
            value={[p.bits.start, p.bits.end]}
            onUpdate={(value) => Array.isArray(value) && setParam(name, { bits: { start: value[0], end: value[1] } })}
          />
        {/if}
        {#if !LORA_SWITCHES.includes(name)}
          <UI.Input
            label={{ name: $T("widget.lora.props.options") }}
            value={optionsText(p.options)}
            help={{ info: $T("widget.lora.props.options.info") }}
            onUpdate={(value) => setParam(name, { options: parseOptions(String(value)) })}
          />
          {#if !p.options?.length}
            <!-- Пересчёт в прошивку - один ряд, пределы ввода в GUI - другой -->
            {#each [[["scale", 1], ["offset", 0]], [["min", ""], ["max", ""], ["step", 1]]] as row, rowIndex (rowIndex)}
              <div class="grid gap-2 {row.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}">
                {#each row as [field, fallback] (field)}
                  <UI.Input
                    wrapperClass="min-w-0"
                    type="number"
                    label={{ name: $T(`widget.lora.props.${field}`) }}
                    help={{ info: $T(`widget.lora.props.${field}.info`) }}
                    value={p[field as "scale"] ?? fallback}
                    onUpdate={(value) => setParam(name, { [field as string]: num(value) })}
                  />
                {/each}
              </div>
            {/each}
          {/if}
        {/if}
      </div>
    {/if}
  </div>
{/snippet}

<div class="flex flex-col gap-2">
  <PropsGroup label={$T("constructor.props.group.general")}>
    <TextsEditor {component} {onPropertyChange} />
    <UI.Input
      label={{ name: $T("widget.common.group_prefix") }}
      help={{ info: $T("widget.common.group_prefix.info") }}
      value={component.properties.id}
      onUpdate={(value) => edit.set("id", value as string)}
    />
    <CommonSnippets snippet="Accent" {component} {onPropertyChange} />
  </PropsGroup>
  <PropsGroup label={$T("widget.lora.props.params")}>
    <UI.Select
      label={{ name: $T("widget.lora.props.preset") }}
      help={{ info: $T("widget.lora.props.preset.info") }}
      type="buttons"
      options={PRESET_OPTIONS}
      value={component.properties.preset}
      onUpdate={(preset) => applyPreset(String(preset))}
    />
    <UI.FieldLabel label={{ name: $T("widget.lora.props.list") }} info={$T("widget.lora.props.list.info")} />
    {#each LORA_PARAMS as name (name)}
      {@render ParamRow(name)}
    {/each}
  </PropsGroup>
</div>
