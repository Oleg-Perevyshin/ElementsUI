<!-- $lib/WidgetDeviceInfo/WidgetDeviceInfo.svelte — смарт-виджет информации об устройстве.
     Фиксированный набор полей (см. IWidgetDeviceInfoConfig в types.ts), соответствует реальной
     прошивочной конвенции (main_config.c, группа "CFG", ProdFactory-ESP):
     DevSN/DevID/DevFW/RunCnt — только чтение; DevName/HostName/WebUser/WebPsw — сохраняются
     одним пакетом; «Сброс настроек» — с подтверждением, все настройки к заводским. Ничего не знает про DeviceStore/WebSocket —
     value/onSave/onRestart/onFactoryReset. -->
<script lang="ts">
  import { T } from "$lib/locales/i18n"
  import { untrack } from "svelte"
  import { fade, scale, slide } from "svelte/transition"
  import { twMerge } from "tailwind-merge"
  import * as UI from "$lib"
  import type { IWidgetDeviceInfoConfig, IWidgetDeviceInfoProps } from "../types"
  import CpuIcon from "./CpuIcon.svelte"
  import RestartIcon from "./RestartIcon.svelte"
  import WidgetHeader from "../WidgetHeader.svelte"
  import { widgetAccentStyle } from "../widgetAccent"
  import { readPersistedCollapsed, writePersistedCollapsed } from "../widgetCollapse"

  let {
    wrapperClass = "",
    componentClass = "",
    label = {},
    value = $bindable(),
    collapsed = $bindable(false),
    persistKey,
    onSave = () => {},
    onRestart = () => {},
    onFactoryReset,
  }: IWidgetDeviceInfoProps = $props()

  let confirmReset = $state(false)
  const factoryReset = () => {
    confirmReset = false
    onFactoryReset?.()
  }

  let accentStyle = $derived(widgetAccentStyle(componentClass ?? ""))

  let info: IWidgetDeviceInfoConfig = $state(
    value ?? {
      DevSN: "",
      DevID: "",
      DevFW: 0,
      RunCnt: 0,
      DevName: "",
      HostName: "",
      WebUser: "",
      WebPsw: "",
      StaIP: "",
      ApIP: "",
    },
  )

  /* Сворачивание тела виджета по клику на значок/заголовок (как аккордеон). collapsed — bindable:
     в конструкторе родитель биндит его на component.properties.collapsed, клик по шапке сразу
     сохраняется в GUI (как isOpen у Accordion в ConstructorUI.svelte). На реальном устройстве
     (GUIPreview) проп передаётся однонаправленно — поверх дефолта только переживает перезагрузку
     через localStorage (persistKey). */
  let hasMergedPersisted = false
  $effect(() => {
    if (hasMergedPersisted) return
    hasMergedPersisted = true
    const persisted = readPersistedCollapsed(persistKey, collapsed)
    if (persisted !== collapsed) collapsed = persisted
  })
  $effect(() => writePersistedCollapsed(persistKey, collapsed))

  /* Поля редактируются локально (как Argument: NoSend в реальной GUI) — отправка одним пакетом по кнопке */
  let savedSnapshot = $state(untrack(() => JSON.stringify(info)))
  let isDirty = $derived(JSON.stringify(info) !== savedSnapshot)

  /* value — живой поток данных с устройства (readonly-поля StaIP/DevFW/RunCnt и т.п. должны
     обновляться постоянно), а не однократный дефолт. Подхватываем свежие данные, только если
     у пользователя нет несохранённых правок редактируемых полей (DevName/HostName/...) —
     иначе входящее значение затёрло бы то, что он ещё не успел сохранить. */
  $effect(() => {
    if (value !== undefined && !untrack(() => isDirty)) {
      const snapshot = JSON.stringify(value)
      info = value
      savedSnapshot = snapshot
    }
  })

  const save = () => {
    onSave?.($state.snapshot(info))
    savedSnapshot = JSON.stringify(info)
  }
</script>

<div
  class={twMerge("relative flex w-full flex-col gap-4 rounded-2xl border border-(--hairline-color) bg-(--container-color) p-4", wrapperClass)}
  style={accentStyle}
>
  <!-- Заголовок -->
  <WidgetHeader icon={CpuIcon} label={label?.name || $T("widget.info.title")} bind:collapsed>
    {#snippet right()}
      <UI.Button
        wrapperClass="w-auto"
        componentClass="bg-transparent px-3"
        content={{ icon: RestartIcon, name: $T("widget.info.restart") }}
        onClick={onRestart}
      />
    {/snippet}
  </WidgetHeader>

  {#if !collapsed}
    <div class="flex flex-col gap-4" transition:slide={{ duration: 150 }}>
      <!-- Только чтение -->
      <div class="flex flex-col gap-2 rounded-[10px] border border-(--hairline-color) bg-(--back-color) p-3">
        <!-- Серийник бывает длинным (напр. 00.00.000-00_0000AC670000B22B00007428:DBC5) — своя строка, чтобы не резался -->
        <UI.Input label={{ name: $T("widget.info.sn") }} value={info.DevSN} readonly help={{ copyButton: true }} />
        <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <UI.Input label={{ name: $T("widget.info.id") }} value={info.DevID} readonly />
          <UI.Input label={{ name: $T("widget.info.fw") }} value={info.DevFW} readonly />
          <UI.Input label={{ name: $T("widget.info.runs") }} value={info.RunCnt} readonly />
        </div>
        <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <UI.Input label={{ name: $T("widget.info.sta_ip") }} value={info.StaIP} readonly />
          <UI.Input label={{ name: $T("widget.info.ap_ip") }} value={info.ApIP} readonly />
        </div>
      </div>

      <!-- Редактируемые настройки -->
      <div class="flex flex-col gap-3 rounded-[10px] border border-(--hairline-color) bg-(--back-color) p-3">
        <span class="text-[12px] font-semibold text-(--muted-color)">{$T("widget.info.settings")}</span>
        <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <UI.Input label={{ name: $T("widget.info.name") }} bind:value={info.DevName} maxlength={26} />
          <UI.Input label={{ name: $T("widget.info.host") }} bind:value={info.HostName} maxlength={32} />
          <UI.Input label={{ name: $T("widget.info.web_user") }} bind:value={info.WebUser} maxlength={16} />
          <UI.Input type="password" label={{ name: $T("widget.info.web_psw") }} bind:value={info.WebPsw} maxlength={16} help={{ autocomplete: "off" }} />
        </div>
      </div>

      <!-- Сохранение -->
      <div class="flex flex-col items-center gap-2">
        {#if isDirty}
          <span class="text-[12px] text-(--muted-color)" transition:slide={{ duration: 100 }}>{$T("widget.common.unsaved")}</span>
        {/if}
        <UI.Button wrapperClass="w-40" componentClass="bg-accent" content={{ name: $T("widget.common.save") }} disabled={!isDirty} onClick={save} />
      </div>

      <!-- Сброс всех настроек к заводским — отдельно от сохранения, только с подтверждением -->
      {#if onFactoryReset}
        <div class="flex items-center justify-between gap-3 border-t border-(--hairline-color) pt-3">
          <span class="text-[12px] text-(--muted-color)">{$T("widget.info.factory_reset_hint")}</span>
          <UI.Button
            wrapperClass="w-auto shrink-0"
            componentClass="bg-red px-3"
            content={{ name: $T("widget.info.factory_reset") }}
            onClick={() => (confirmReset = true)}
          />
        </div>
      {/if}
    </div>
  {/if}

  {#if confirmReset}
    <!-- Подтверждение локально к виджету, как удаление файла у WidgetFileSystem -->
    <div class="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-black/40 backdrop-blur-[2px]" transition:fade={{ duration: 150 }}>
      <div
        class="flex w-full max-w-96 flex-col gap-3 rounded-[16px] border border-(--hairline-color) bg-(--back-color) p-4 shadow-(--elevation-3)"
        transition:scale={{ duration: 150, start: 0.96 }}
      >
        <h4 class="text-[15px] font-semibold">{$T("widget.info.factory_reset_title")}</h4>
        <p class="text-[13px] text-(--muted-color)">{$T("widget.info.factory_reset_text")}</p>
        <div class="flex gap-2">
          <UI.Button
            wrapperClass="flex-1"
            componentClass="bg-transparent"
            content={{ name: $T("widget.common.cancel") }}
            onClick={() => (confirmReset = false)}
          />
          <UI.Button wrapperClass="flex-1" componentClass="bg-red" content={{ name: $T("widget.info.factory_reset") }} onClick={factoryReset} />
        </div>
      </div>
    </div>
  {/if}
</div>
