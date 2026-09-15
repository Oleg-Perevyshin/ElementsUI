<!-- $lib/WidgetDeviceInfo/WidgetDeviceInfo.svelte — смарт-виджет информации об устройстве.
     Фиксированный набор полей (см. IWidgetDeviceInfoConfig в types.ts), соответствует реальной
     прошивочной конвенции (main_config.c, группа "CFG", ProdFactory-ESP):
     DevSN/DevID/DevFW/RunCnt — только чтение; DevName/HostName/WebUser/WebPsw — сохраняются
     одним пакетом. Ничего не знает про DeviceStore/WebSocket — value/onSave/onRestart. -->
<script lang="ts">
  import { slide } from "svelte/transition"
  import { twMerge } from "tailwind-merge"
  import * as UI from "$lib"
  import type { IWidgetDeviceInfoConfig, IWidgetDeviceInfoProps } from "../types"
  import CpuIcon from "./CpuIcon.svelte"
  import RestartIcon from "./RestartIcon.svelte"
  import WidgetHeader from "../WidgetHeader.svelte"
  import { widgetAccentStyle } from "../widgetAccent"

  let {
    wrapperClass = "",
    componentClass = "",
    label = { name: "Информация об устройстве" },
    value = $bindable(),
    onSave = () => {},
    onRestart = () => {},
  }: IWidgetDeviceInfoProps = $props()

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
    },
  )

  /* Сворачивание тела виджета по клику на значок/заголовок (как аккордеон) */
  let collapsed = $state(false)

  /* Поля редактируются локально (как Argument: NoSend в реальной GUI) — отправка одним пакетом по кнопке */
  let savedSnapshot = $state(JSON.stringify(info))
  let isDirty = $derived(JSON.stringify(info) !== savedSnapshot)
  const save = () => {
    onSave?.($state.snapshot(info))
    savedSnapshot = JSON.stringify(info)
  }
</script>

<div
  class={twMerge("flex w-full max-w-3xl flex-col gap-4 rounded-2xl border border-(--hairline-color) bg-(--container-color) p-4", wrapperClass)}
  style={accentStyle}
>
  <!-- Заголовок -->
  <WidgetHeader icon={CpuIcon} label={label?.name ?? "Информация об устройстве"} bind:collapsed>
    {#snippet right()}
      <UI.Button wrapperClass="w-auto" componentClass="bg-transparent px-3" content={{ icon: RestartIcon, name: "Перезагрузить" }} onClick={onRestart} />
    {/snippet}
  </WidgetHeader>

  {#if !collapsed}
    <div class="flex flex-col gap-4" transition:slide={{ duration: 150 }}>
      <!-- Только чтение -->
      <div class="flex flex-col gap-2 rounded-[10px] border border-(--hairline-color) bg-(--back-color) p-3">
        <!-- Серийник бывает длинным (напр. 00.00.000-00_0000AC670000B22B00007428:DBC5) — своя строка, чтобы не резался -->
        <UI.Input label={{ name: "Серийный номер" }} value={info.DevSN} readonly help={{ copyButton: true }} />
        <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <UI.Input label={{ name: "ID устройства" }} value={info.DevID} readonly />
          <UI.Input label={{ name: "Версия ПО" }} value={info.DevFW} readonly />
          <UI.Input label={{ name: "Запусков" }} value={info.RunCnt} readonly />
        </div>
      </div>

      <!-- Редактируемые настройки -->
      <div class="flex flex-col gap-3 rounded-[10px] border border-(--hairline-color) bg-(--back-color) p-3">
        <span class="text-[12px] font-semibold text-(--muted-color)">Настройки</span>
        <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <UI.Input label={{ name: "Имя устройства" }} bind:value={info.DevName} maxlength={26} />
          <UI.Input label={{ name: "Имя хоста" }} bind:value={info.HostName} maxlength={32} />
          <UI.Input label={{ name: "Пользователь Web" }} bind:value={info.WebUser} maxlength={16} />
          <UI.Input type="password" label={{ name: "Пароль Web" }} bind:value={info.WebPsw} maxlength={16} help={{ autocomplete: "off" }} />
        </div>
      </div>

      <!-- Сохранение -->
      <div class="flex flex-col items-center gap-2">
        {#if isDirty}
          <span class="text-[12px] text-(--muted-color)" transition:slide={{ duration: 100 }}>Есть несохранённые изменения</span>
        {/if}
        <UI.Button wrapperClass="w-40" componentClass="bg-green" content={{ name: "Сохранить" }} disabled={!isDirty} onClick={save} />
      </div>
    </div>
  {/if}
</div>
