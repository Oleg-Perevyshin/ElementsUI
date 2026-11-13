<!-- $lib/WidgetWiFi/WidgetWiFi.svelte - смарт-виджет настройки WiFi (STA/AP) для конструктора. В отличие от примитивов не привязывается к одной произвольной переменной устройства - работает с фиксированным набором полей (см. IWidgetWiFiConfig в types.ts), которые соответствуют реальной прошивочной конвенции (main_config.c, группа "CFG", ProdFactory-ESP): WiFiMode / StaSSID/StaPSK/StaticIP/StaIP/StaMS/StaGW / ApSSID/ApPSK/ApIP/ApMS/ApGW. Ничего не знает про DeviceStore/WebSocket - value/onSave, вся отправка на стороне вызывающего. -->
<script lang="ts">
  import { T } from "../locales/i18n"
  import { untrack } from "svelte"
  import { slide, fade, scale } from "svelte/transition"
  import { twMerge } from "tailwind-merge"
  import * as UI from ".."
  import type { IWidgetWiFiConfig, IWidgetWiFiProps, IOption } from "../types"
  import WifiIcon from "./WifiIcon.svelte"
  import SearchIcon from "./SearchIcon.svelte"
  import WarningIcon from "./WarningIcon.svelte"
  import WidgetHeader from "../WidgetHeader.svelte"
  import { hint, hintsSetting } from "../hints"
  import { accentStyle } from "../accent"
  import { readPersistedCollapsed, writePersistedCollapsed } from "../widgetCollapse"

  let {
    wrapperClass = "",
    accent,
    label = { name: "WiFi" },
    value = $bindable(),
    allowedModes = [1, 2, 3],
    confirmOnAP = true,
    collapsed = $bindable(false),
    persistKey,
    onScan,
    onSave,
  }: IWidgetWiFiProps = $props()

  /* Подсказки - кнопка «?» в шапке, выбор общий для всех WidgetWiFi */
  const hints = $derived(hintsSetting("WidgetWiFi", persistKey))

  /* "Мастер-цвет" виджета - переопределяет --accent-color/--accent-soft на корне, дальше это штатный каскад переменных, на котором и так построены компоненты библиотеки: значок, режимы STA/AP, фокус-кольцо у полей и кнопка "Сохранить" (маркер bg-accent) перекрашиваются вместе, одним источником истины; красной остаётся только кнопка подтверждения режима AP. */
  const rootStyle = $derived(accentStyle(accent))

  /* Поля, которых нет в value, - пустые */
  const EMPTY: IWidgetWiFiConfig = {
    WiFiMode: 1,
    StaSSID: "",
    StaPSK: "",
    StaticIP: 0,
    StaIP: "",
    StaMS: "",
    StaGW: "",
    ApSSID: "",
    ApPSK: "",
    ApIP: "192.168.108.1",
    ApMS: "255.255.255.0",
    ApGW: "192.168.108.1",
  }
  let cfg: IWidgetWiFiConfig = $state({ ...EMPTY, ...value })

  const ALL_MODE_OPTIONS: IOption<number>[] = [
    { id: "sta", name: "STA", value: 1 },
    { id: "ap", name: "AP", value: 2 },
    { id: "apsta", name: "STA + AP", value: 3 },
  ]
  let MODE_OPTIONS = $derived(ALL_MODE_OPTIONS.filter((o) => (allowedModes ?? [1, 2, 3]).includes(o.value as number)))

  /* Режим переключается сразу и только локально - иначе нельзя спокойно открыть секцию AP и заполнить SSID/пароль до реальной отправки. Предупреждение о разрыве связи с облаком показывается не здесь, а перед save() - в момент, когда конфиг действительно уходит на устройство и режим на нём меняется. STA+AP не предупреждаем: STA остаётся активным. */
  let showAPWarning = $state(false)

  let IP_MODE_OPTIONS: IOption<number>[] = $derived([
    { id: "dhcp", name: "DHCP", value: 0 },
    { id: "static", name: $T("widget.wifi.static"), value: 1 },
  ])

  const IP_REGEXP = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  /* WPA2: пусто (открытая сеть) либо 8-63 символа - так же ограничивает сам чип */
  const PSK_REGEXP = /^$|^.{8,63}$/

  /* Сканирование сетей - на стороне вызывающего (в проде вызывает Header: GET, Argument: APsList) */
  let scanning = $state(false)
  let foundNetworks: IOption<string>[] = $state([])
  const scanNetworks = async () => {
    if (!onScan) return
    scanning = true
    try {
      foundNetworks = await onScan()
    } finally {
      scanning = false
    }
  }

  /* Сворачивание тела виджета по клику на значок/заголовок (как аккордеон) - переключатель режима в шапке кликом не триггерит, только сама кнопка значок+заголовок (см. WidgetHeader.svelte). collapsed - bindable: в конструкторе родитель биндит его на component.properties.collapsed, клик по шапке сразу сохраняется в GUI (как isOpen у Accordion). В GUIRenderer проп передаётся однонаправленно - локальные изменения не утекают наверх, поверх дефолта только переживают перезагрузку через localStorage (persistKey). */
  /* Выбор пользователя в этом браузере применяется до первой отрисовки, без мигания; значение из GUI запоминается, чтобы его смена отменяла старый выбор */
  const guiCollapsed = untrack(() => collapsed)
  collapsed = readPersistedCollapsed(
    untrack(() => persistKey),
    guiCollapsed,
  )
  $effect(() => writePersistedCollapsed(persistKey, collapsed, guiCollapsed))

  /* Поля редактируются локально (как Argument: NoSend в реальной GUI) - отправка одним пакетом по кнопке */
  let savedSnapshot = $state(untrack(() => JSON.stringify(cfg)))
  let isDirty = $derived(JSON.stringify(cfg) !== savedSnapshot)

  /* value - не однократный дефолт, а живой поток данных с устройства (GUIRenderer пересчитывает его на каждое обновление значений). Подхватываем свежие данные, только если у пользователя нет несохранённых правок - иначе входящее значение затирало бы то, что он ещё не успел сохранить. untrack(isDirty) - чтобы этот эффект не перезапускался на каждое изменение cfg от самого пользователя, только на смену value. */
  $effect(() => {
    if (value !== undefined && !untrack(() => isDirty)) {
      /* Снимок с нового объекта, а не с cfg: чтение cfg подписало бы эффект на собственную запись - бесконечный цикл */
      const incoming = { ...EMPTY, ...value }
      cfg = incoming
      savedSnapshot = JSON.stringify(incoming)
    }
  })

  /* Без onSave (наблюдатель, управление закрыто) - только просмотр: поля только для чтения, режимы и поиск неактивны, пароли маской без глазика */
  const readOnly = $derived(!onSave)
  const mask = (secret: string | undefined) => (secret ? "••••••••" : "")

  /* Без onSave отправлять некуда: правки остаются несохранёнными, а не помечаются сохранёнными */
  const commitSave = () => {
    if (!onSave) return
    onSave($state.snapshot(cfg))
    savedSnapshot = JSON.stringify(cfg)
  }
  const save = () => {
    if (cfg.WiFiMode === 2 && confirmOnAP) showAPWarning = true
    else commitSave()
  }
  const confirmAndSave = () => {
    showAPWarning = false
    commitSave()
  }
</script>

<div
  class={twMerge("@container relative flex w-full flex-col gap-4 rounded-2xl border border-(--hairline-color) bg-(--container-color) p-4", wrapperClass)}
  style={rootStyle}
>
  <!-- Заголовок и переключатель режима -->
  <WidgetHeader icon={WifiIcon} label={label?.name || $T("widget.wifi.title")} bind:collapsed {hints}>
    {#snippet right(narrow: boolean)}
      <div class={narrow ? "w-36" : "w-72"} use:hint={{ text: $T("widget.wifi.hint.mode"), enabled: $hints }}>
        <UI.Select
          wrapperClass="w-full"
          type="buttons"
          value={MODE_OPTIONS.some((o) => o.value === cfg.WiFiMode) ? cfg.WiFiMode : MODE_OPTIONS[0]?.value}
          options={MODE_OPTIONS}
          disabled={readOnly}
          onUpdate={(option) => (cfg.WiFiMode = option)}
        />
      </div>
    {/snippet}
  </WidgetHeader>

  {#if !collapsed}
    <div class="flex flex-col gap-4" transition:slide={{ duration: 150 }}>
      {#if cfg.WiFiMode === 1 || cfg.WiFiMode === 3}
        <!-- Клиентский режим (STA) -->
        <div class="flex flex-col gap-3 rounded-[10px] border border-(--hairline-color) bg-(--back-color) p-3" transition:slide={{ duration: 150 }}>
          <!-- SSID с поиском и пароль - одной строкой по 50%, на узком экране друг под другом -->
          <div class="grid grid-cols-1 gap-x-4 gap-y-3 @sm:grid-cols-2">
            <div class="flex min-w-0 items-end gap-2">
              <div class="min-w-0 flex-1" use:hint={{ text: $T("widget.wifi.hint.ssid"), enabled: $hints }}>
                <UI.Select
                  wrapperClass="w-full"
                  type="input"
                  label={{ name: $T("widget.wifi.ssid") }}
                  value={cfg.StaSSID}
                  options={foundNetworks}
                  disabled={readOnly}
                  onUpdate={(ssid) => (cfg.StaSSID = String(ssid))}
                />
              </div>
              <UI.Button
                wrapperClass="w-8"
                content={{ icon: SearchIcon, info: { text: $T("widget.wifi.scan"), side: "top" } }}
                loading={scanning}
                disabled={!onScan || readOnly}
                onClick={scanNetworks}
              />
            </div>

            <!-- one-time-code: менеджер паролей браузера не считает поле паролем входа и не накрывает список сетей у SSID своими сохранёнными логинами (autocomplete="off" для паролей Chrome игнорирует) -->
            {#if readOnly}
              <UI.Input label={{ name: $T("widget.wifi.sta_psk") }} value={mask(cfg.StaPSK)} readonly />
            {:else}
              <UI.Input
                type="password"
                label={{ name: $T("widget.wifi.sta_psk") }}
                bind:value={cfg.StaPSK}
                maxlength={64}
                help={{ autocomplete: "one-time-code", regExp: PSK_REGEXP }}
              />
            {/if}
          </div>

          <div class="w-full @sm:w-72" use:hint={{ text: $T("widget.wifi.hint.ip_mode"), enabled: $hints }}>
            <UI.Select
              wrapperClass="w-full"
              type="buttons"
              label={{ name: $T("widget.wifi.ip_mode") }}
              value={cfg.StaticIP}
              options={IP_MODE_OPTIONS}
              disabled={readOnly}
              onUpdate={(option) => (cfg.StaticIP = option)}
            />
          </div>

          {#if cfg.StaticIP === 1}
            <div class="grid grid-cols-1 gap-2 @md:grid-cols-3" transition:slide={{ duration: 150 }}>
              <div use:hint={{ text: $T("widget.wifi.hint.ip"), enabled: $hints }}>
                <UI.Input
                  label={{ name: $T("widget.common.ip") }}
                  bind:value={cfg.StaIP}
                  readonly={readOnly}
                  maxlength={15}
                  placeholder="192.168.1.100"
                  help={{ regExp: IP_REGEXP }}
                />
              </div>
              <div use:hint={{ text: $T("widget.wifi.hint.mask"), enabled: $hints }}>
                <UI.Input
                  label={{ name: $T("widget.common.mask") }}
                  bind:value={cfg.StaMS}
                  readonly={readOnly}
                  maxlength={15}
                  placeholder="255.255.255.0"
                  help={{ regExp: IP_REGEXP }}
                />
              </div>
              <div use:hint={{ text: $T("widget.wifi.hint.gateway"), enabled: $hints }}>
                <UI.Input
                  label={{ name: $T("widget.common.gateway") }}
                  bind:value={cfg.StaGW}
                  readonly={readOnly}
                  maxlength={15}
                  placeholder="192.168.1.1"
                  help={{ regExp: IP_REGEXP }}
                />
              </div>
            </div>
          {/if}
        </div>
      {/if}

      {#if cfg.WiFiMode === 2 || cfg.WiFiMode === 3}
        <!-- Точка доступа (AP) -->
        <div class="flex flex-col gap-3 rounded-[10px] border border-(--hairline-color) bg-(--back-color) p-3" transition:slide={{ duration: 150 }}>
          <!-- Те же колонки, что у STA: в режиме STA + AP пароли стоят друг под другом -->
          <div class="grid grid-cols-1 gap-x-4 gap-y-3 @sm:grid-cols-2">
            <div use:hint={{ text: $T("widget.wifi.hint.ap"), enabled: $hints }}>
              <UI.Input label={{ name: $T("widget.wifi.ap_ssid") }} bind:value={cfg.ApSSID} readonly={readOnly} maxlength={32} />
            </div>
            {#if readOnly}
              <UI.Input label={{ name: $T("widget.wifi.ap_psk") }} value={mask(cfg.ApPSK)} readonly />
            {:else}
              <UI.Input
                type="password"
                label={{ name: $T("widget.wifi.ap_psk") }}
                bind:value={cfg.ApPSK}
                maxlength={64}
                help={{ autocomplete: "one-time-code", regExp: PSK_REGEXP }}
              />
            {/if}
          </div>

          <div class="grid grid-cols-1 gap-2 @md:grid-cols-3">
            <div use:hint={{ text: $T("widget.wifi.hint.ap_ip"), enabled: $hints }}>
              <UI.Input label={{ name: $T("widget.common.ip") }} bind:value={cfg.ApIP} readonly={readOnly} maxlength={15} help={{ regExp: IP_REGEXP }} />
            </div>
            <UI.Input label={{ name: $T("widget.common.mask") }} bind:value={cfg.ApMS} readonly={readOnly} maxlength={15} help={{ regExp: IP_REGEXP }} />
            <UI.Input label={{ name: $T("widget.common.gateway") }} bind:value={cfg.ApGW} readonly={readOnly} maxlength={15} help={{ regExp: IP_REGEXP }} />
          </div>
        </div>
      {/if}

      <!-- Сохранение -->
      <div class="flex flex-col items-center gap-2">
        {#if isDirty}
          <span class="text-[12px] text-(--muted-color)" transition:slide={{ duration: 100 }}>{$T("widget.common.unsaved")}</span>
        {/if}
        <UI.Button wrapperClass="w-40" variant="primary" content={{ name: $T("widget.common.save") }} disabled={!isDirty || !onSave} onClick={save} />
      </div>
    </div>
  {/if}

  {#if showAPWarning}
    <!-- Подтверждение локально к виджету (не на весь экран) - предупреждение относится именно к этой карточке, а не к странице целиком -->
    <div class="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-black/40 backdrop-blur-[2px]" transition:fade={{ duration: 150 }}>
      <div
        class="flex w-full max-w-80 flex-col gap-3 rounded-[16px] border border-(--hairline-color) bg-(--back-color) p-4 shadow-(--elevation-3)"
        transition:scale={{ duration: 150, start: 0.96 }}
      >
        <div class="flex items-center gap-2 text-(--orange-text)">
          <WarningIcon />
          <h4 class="text-[15px] font-semibold text-(--font-color)">{$T("widget.wifi.ap_confirm_title")}</h4>
        </div>
        <p class="text-[13px] text-(--muted-color)">
          {$T("widget.wifi.ap_confirm_text")}
        </p>
        <div class="flex gap-2">
          <UI.Button wrapperClass="flex-1" content={{ name: $T("widget.common.cancel") }} onClick={() => (showAPWarning = false)} />
          <UI.Button wrapperClass="flex-1" variant="primary" accent="red" content={{ name: $T("widget.common.save") }} onClick={confirmAndSave} />
        </div>
      </div>
    </div>
  {/if}
</div>
