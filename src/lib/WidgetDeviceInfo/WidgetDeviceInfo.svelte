<!-- $lib/WidgetDeviceInfo/WidgetDeviceInfo.svelte - смарт-виджет информации об устройстве. Фиксированный набор полей (см. IWidgetDeviceInfoConfig в types.ts), соответствует реальной прошивочной конвенции (main_config.c, группа "CFG", ProdFactory-ESP): DevSN/DevID/DevFW/RunCnt - только чтение; DevName/HostName/WebUser/WebPsw - сохраняются одним пакетом; «Сброс настроек» - с подтверждением, все настройки к заводским. Ничего не знает про DeviceStore/WebSocket - value/onSave/onRestart/onFactoryReset. -->
<script lang="ts">
  import { T } from "../locales/i18n"
  import { untrack } from "svelte"
  import { fade, scale, slide } from "svelte/transition"
  import { twMerge } from "tailwind-merge"
  import * as UI from ".."
  import type { IWidgetDeviceInfoConfig, IWidgetDeviceInfoProps } from "../types"
  import CpuIcon from "./CpuIcon.svelte"
  import RestartIcon from "./RestartIcon.svelte"
  import WidgetHeader from "../WidgetHeader.svelte"
  import { hint, hintsSetting } from "../hints"
  import { accentStyle } from "../accent"
  import { readPersistedCollapsed, writePersistedCollapsed } from "../widgetCollapse"

  let {
    wrapperClass = "",
    accent,
    label = {},
    value = $bindable(),
    collapsed = $bindable(false),
    persistKey,
    onSave,
    onRestart,
    onFactoryReset,
  }: IWidgetDeviceInfoProps = $props()

  /* Подсказки - кнопка «?» в шапке, выбор общий для всех WidgetDeviceInfo */
  const hints = $derived(hintsSetting("WidgetDeviceInfo", persistKey))

  let confirmReset = $state(false)
  const factoryReset = () => {
    confirmReset = false
    onFactoryReset?.()
  }

  const rootStyle = $derived(accentStyle(accent))

  /* Поля, которых нет в value, - пустые */
  const EMPTY: IWidgetDeviceInfoConfig = {
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
  }
  let info: IWidgetDeviceInfoConfig = $state({ ...EMPTY, ...value })

  /* Сворачивание тела виджета по клику на значок/заголовок (как аккордеон). collapsed - bindable: в конструкторе родитель биндит его на component.properties.collapsed, клик по шапке сразу сохраняется в GUI (как isOpen у Accordion). В GUIRenderer проп передаётся однонаправленно - поверх дефолта только переживает перезагрузку через localStorage (persistKey). */
  /* Выбор пользователя в этом браузере применяется до первой отрисовки, без мигания; значение из GUI запоминается, чтобы его смена отменяла старый выбор */
  const guiCollapsed = untrack(() => collapsed)
  collapsed = readPersistedCollapsed(
    untrack(() => persistKey),
    guiCollapsed,
  )
  $effect(() => writePersistedCollapsed(persistKey, collapsed, guiCollapsed))

  /* Поля редактируются локально (как Argument: NoSend в реальной GUI) - отправка одним пакетом по кнопке */
  let savedSnapshot = $state(untrack(() => JSON.stringify(info)))
  let isDirty = $derived(JSON.stringify(info) !== savedSnapshot)

  /* value - живой поток данных с устройства (readonly-поля StaIP/DevFW/RunCnt и т.п. должны обновляться постоянно), а не однократный дефолт. Подхватываем свежие данные, только если у пользователя нет несохранённых правок редактируемых полей (DevName/HostName/...) - иначе входящее значение затёрло бы то, что он ещё не успел сохранить. */
  $effect(() => {
    if (value !== undefined && !untrack(() => isDirty)) {
      /* Снимок с нового объекта, а не с info: чтение info подписало бы эффект на собственную запись - бесконечный цикл */
      const incoming = { ...EMPTY, ...value }
      info = incoming
      savedSnapshot = JSON.stringify(incoming)
    }
  })

  /* Хост и пользователь веб - только латиница, цифры, "_" и "-", имени устройства можно ещё "." (STM по умолчанию - код изделия 00.00.491-01), паролю - любые печатаемые ASCII без пробела (прошивка декодирует %XX формы входа); имя устройства обязательно - с пустым облако не принимает подключение; лишнее вырезается при вводе, значение с устройства вне правила подсвечивается. Длины - буферы main_config.h без \0 */
  const NAME_REGEXP = /^[A-Za-z0-9_-]*$/
  const DEV_NAME_REGEXP = /^[A-Za-z0-9_.-]+$/
  const PSW_REGEXP = /^[!-~]*$/
  const onlyNameChars = (input: string | number) => String(input).replace(/[^A-Za-z0-9_-]/g, "")
  const onlyDevNameChars = (input: string | number) => String(input).replace(/[^A-Za-z0-9_.-]/g, "")
  const onlyPswChars = (input: string | number) => String(input).replace(/[^!-~]/g, "")

  const nameMissing = $derived(!String(info.DevName ?? "").trim())

  /* Без onSave (наблюдатель, управление закрыто) - только просмотр: поля только для чтения, пароль маской без глазика */
  const readOnly = $derived(!onSave)

  /* Без onSave отправлять некуда: правки остаются несохранёнными, а не помечаются сохранёнными */
  const save = () => {
    if (!onSave || nameMissing) return
    onSave($state.snapshot(info))
    savedSnapshot = JSON.stringify(info)
  }
</script>

<div
  class={twMerge("@container relative flex w-full flex-col gap-4 rounded-2xl border border-(--hairline-color) bg-(--container-color) p-4", wrapperClass)}
  style={rootStyle}
>
  <!-- Заголовок -->
  <WidgetHeader icon={CpuIcon} label={label?.name || $T("widget.info.title")} bind:collapsed {hints}>
    {#snippet right(narrow: boolean)}
      <div use:hint={{ text: $T("widget.info.hint.restart"), enabled: $hints }}>
        <UI.Button
          wrapperClass="w-auto"
          componentClass={narrow ? "p-1.5" : "px-3"}
          content={narrow
            ? { icon: RestartIcon, info: { text: $T("widget.info.restart"), side: "left" } }
            : { icon: RestartIcon, name: $T("widget.info.restart") }}
          disabled={!onRestart}
          onClick={() => onRestart?.()}
        />
      </div>
    {/snippet}
  </WidgetHeader>

  {#if !collapsed}
    <div class="flex flex-col gap-4" transition:slide={{ duration: 150 }}>
      <!-- Только чтение -->
      <div class="flex flex-col gap-2 rounded-[10px] border border-(--hairline-color) bg-(--back-color) p-3">
        <!-- Серийник бывает длинным (напр. 00.00.000-00_0000AC670000B22B00007428:DBC5) - своя строка, чтобы не резался -->
        <div use:hint={{ text: $T("widget.info.hint.sn"), enabled: $hints }}>
          <UI.Input label={{ name: $T("widget.info.sn") }} value={info.DevSN} readonly help={{ copyButton: true }} />
        </div>
        <div class="grid grid-cols-1 gap-2 @md:grid-cols-3">
          <div use:hint={{ text: $T("widget.info.hint.id"), enabled: $hints }}>
            <UI.Input label={{ name: $T("widget.info.id") }} value={info.DevID} readonly />
          </div>
          <div use:hint={{ text: $T("widget.info.hint.fw"), enabled: $hints }}>
            <UI.Input label={{ name: $T("widget.info.fw") }} value={info.DevFW} readonly />
          </div>
          <div use:hint={{ text: $T("widget.info.hint.runs"), enabled: $hints }}>
            <UI.Input label={{ name: $T("widget.info.runs") }} value={info.RunCnt} readonly />
          </div>
        </div>
        <div class="grid grid-cols-1 gap-2 @sm:grid-cols-2">
          <div use:hint={{ text: $T("widget.info.hint.sta_ip"), enabled: $hints }}>
            <UI.Input label={{ name: $T("widget.info.sta_ip") }} value={info.StaIP} readonly />
          </div>
          <div use:hint={{ text: $T("widget.info.hint.ap_ip"), enabled: $hints }}>
            <UI.Input label={{ name: $T("widget.info.ap_ip") }} value={info.ApIP} readonly />
          </div>
        </div>
      </div>

      <!-- Редактируемые настройки -->
      <div class="flex flex-col gap-3 rounded-[10px] border border-(--hairline-color) bg-(--back-color) p-3">
        <div class="grid grid-cols-1 gap-2 @sm:grid-cols-2">
          <div use:hint={{ text: $T("widget.info.hint.name"), enabled: $hints }}>
            <UI.Input
              label={{ name: $T("widget.info.name") }}
              bind:value={info.DevName}
              readonly={readOnly}
              maxlength={15}
              help={{ regExp: DEV_NAME_REGEXP }}
              onUpdate={(input) => (info.DevName = onlyDevNameChars(input))}
            />
          </div>
          <!-- Прошивка хранит имя без домена, ".local" добавляет mDNS - показываем его как неизменяемую часть адреса -->
          <div class="flex min-w-0 items-end gap-1.5" use:hint={{ text: $T("widget.info.hint.host"), enabled: $hints }}>
            <UI.Input
              wrapperClass="min-w-0 flex-1"
              label={{ name: $T("widget.info.host") }}
              bind:value={info.HostName}
              readonly={readOnly}
              maxlength={18}
              help={{ regExp: NAME_REGEXP }}
              onUpdate={(input) => (info.HostName = onlyNameChars(input))}
            />
            <span class="flex h-8 shrink-0 items-center text-[14px] text-(--muted-color) select-none">.local</span>
          </div>
          <div use:hint={{ text: $T("widget.info.hint.web_user"), enabled: $hints }}>
            <UI.Input
              label={{ name: $T("widget.info.web_user") }}
              bind:value={info.WebUser}
              readonly={readOnly}
              maxlength={15}
              help={{ regExp: NAME_REGEXP }}
              onUpdate={(input) => (info.WebUser = onlyNameChars(input))}
            />
          </div>
          <div use:hint={{ text: $T("widget.info.hint.web_psw"), enabled: $hints }}>
            {#if readOnly}
              <UI.Input label={{ name: $T("widget.info.web_psw") }} value={info.WebPsw ? "••••••••" : ""} readonly />
            {:else}
              <UI.Input
                type="password"
                label={{ name: $T("widget.info.web_psw") }}
                bind:value={info.WebPsw}
                maxlength={15}
                help={{ autocomplete: "one-time-code", regExp: PSW_REGEXP }}
                onUpdate={(input) => (info.WebPsw = onlyPswChars(input))}
              />
            {/if}
          </div>
        </div>
      </div>

      <!-- Сохранение -->
      <div class="flex flex-col items-center gap-2">
        {#if isDirty && nameMissing}
          <span class="text-[12px] text-(--red-color)" transition:slide={{ duration: 100 }}>{$T("widget.info.name_required")}</span>
        {:else if isDirty}
          <span class="text-[12px] text-(--muted-color)" transition:slide={{ duration: 100 }}>{$T("widget.common.unsaved")}</span>
        {/if}
        <UI.Button
          wrapperClass="w-40"
          variant="primary"
          content={{ name: $T("widget.common.save") }}
          disabled={!isDirty || !onSave || nameMissing}
          onClick={save}
        />
      </div>

      <!-- Сброс всех настроек к заводским - отдельно от сохранения, только с подтверждением -->
      {#if onFactoryReset}
        <div class="flex items-center justify-between gap-3 border-t border-(--hairline-color) pt-3">
          <span class="text-[12px] text-(--muted-color)">{$T("widget.info.factory_reset_hint")}</span>
          <UI.Button
            wrapperClass="w-auto shrink-0"
            variant="primary"
            accent="red"
            componentClass="px-3"
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
          <UI.Button wrapperClass="flex-1" content={{ name: $T("widget.common.cancel") }} onClick={() => (confirmReset = false)} />
          <UI.Button wrapperClass="flex-1" variant="primary" accent="red" content={{ name: $T("widget.info.factory_reset") }} onClick={factoryReset} />
        </div>
      </div>
    </div>
  {/if}
</div>
