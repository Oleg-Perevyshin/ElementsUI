<!-- $lib/WidgetWiFi/WidgetWiFi.svelte — смарт-виджет настройки WiFi (STA/AP) для конструктора.
     В отличие от примитивов не привязывается к одной произвольной переменной устройства —
     работает с фиксированным набором полей (см. IWidgetWiFiConfig в types.ts), которые
     соответствуют реальной прошивочной конвенции (main_config.c, группа "CFG", ProdFactory-ESP):
     WiFiMode / StaSSID/StaPSK/StaticIP/StaIP/StaMS/StaGW / ApSSID/ApPSK/ApIP/ApMS/ApGW.
     Ничего не знает про DeviceStore/WebSocket — value/onSave, вся отправка на стороне вызывающего. -->
<script lang="ts">
  import { slide, fade, scale } from "svelte/transition"
  import { twMerge } from "tailwind-merge"
  import * as UI from "$lib"
  import type { IWidgetWiFiConfig, IWidgetWiFiProps, IOption } from "../types"
  import WifiIcon from "./WifiIcon.svelte"
  import SearchIcon from "./SearchIcon.svelte"
  import LoaderIcon from "./LoaderIcon.svelte"
  import WarningIcon from "./WarningIcon.svelte"
  import WidgetHeader from "../WidgetHeader.svelte"
  import { widgetAccentStyle } from "../widgetAccent"
  import { readPersistedCollapsed, writePersistedCollapsed } from "../widgetCollapse"

  let {
    wrapperClass = "",
    componentClass = "",
    label = { name: "WiFi" },
    value = $bindable(),
    allowedModes = [1, 2, 3],
    confirmOnAP = true,
    collapsed: initialCollapsed = false,
    persistKey,
    onScan,
    onSave = () => {},
  }: IWidgetWiFiProps = $props()

  /* "Мастер-цвет" виджета — переопределяет --accent-color/--accent-soft на корне, дальше это
     штатный каскад переменных, на котором и так построены компоненты библиотеки: значок, режимы
     STA/AP, фокус-кольцо у полей перекрашиваются вместе, одним источником истины. Кнопка
     "Сохранить" остаётся зелёной осознанно (componentClass="bg-green" сама выставляет --bg-color). */
  let accentStyle = $derived(widgetAccentStyle(componentClass ?? ""))

  let cfg: IWidgetWiFiConfig = $state(
    value ?? {
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
    },
  )

  const ALL_MODE_OPTIONS: IOption<number>[] = [
    { id: "sta", name: "STA", value: 1 },
    { id: "ap", name: "AP", value: 2 },
    { id: "apsta", name: "STA + AP", value: 3 },
  ]
  let MODE_OPTIONS = $derived(ALL_MODE_OPTIONS.filter((o) => (allowedModes ?? [1, 2, 3]).includes(o.value as number)))
  let selectedMode = $derived(MODE_OPTIONS.find((o) => o.value === cfg.WiFiMode) ?? MODE_OPTIONS[0])

  /* Режим переключается сразу и только локально — иначе нельзя спокойно открыть секцию AP и
     заполнить SSID/пароль до реальной отправки. Предупреждение о разрыве связи с облаком
     показывается не здесь, а перед save() — в момент, когда конфиг действительно уходит на
     устройство и режим на нём меняется. STA+AP не предупреждаем: STA остаётся активным. */
  let showAPWarning = $state(false)

  const IP_MODE_OPTIONS: IOption<number>[] = [
    { id: "dhcp", name: "DHCP", value: 0 },
    { id: "static", name: "Static", value: 1 },
  ]
  let selectedIPMode = $derived(IP_MODE_OPTIONS.find((o) => o.value === cfg.StaticIP) ?? IP_MODE_OPTIONS[0])

  const IP_REGEXP = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  /* WPA2: пусто (открытая сеть) либо 8-63 символа — так же ограничивает сам чип */
  const PSK_REGEXP = /^$|^.{8,63}$/

  /* Сканирование сетей — на стороне вызывающего (в проде вызывает Header: GET, Argument: APsList) */
  let scanning = $state(false)
  let foundNetworks: IOption<string>[] = $state([])
  const scanNetworks = async () => {
    if (!onScan) return
    scanning = true
    foundNetworks = await onScan()
    scanning = false
  }

  /* Сворачивание тела виджета по клику на значок/заголовок (как аккордеон) — переключатель режима
     в шапке кликом не триггерит, только сама кнопка значок+заголовок (см. WidgetHeader.svelte).
     В отличие от Accordion (только начальное значение из GUI) — переживает перезагрузку страницы
     через localStorage, если передан persistKey. */
  let collapsed = $state(readPersistedCollapsed(persistKey, initialCollapsed))
  $effect(() => writePersistedCollapsed(persistKey, collapsed))

  /* Поля редактируются локально (как Argument: NoSend в реальной GUI) — отправка одним пакетом по кнопке */
  let savedSnapshot = $state(JSON.stringify(cfg))
  let isDirty = $derived(JSON.stringify(cfg) !== savedSnapshot)
  const commitSave = () => {
    onSave?.($state.snapshot(cfg))
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
  class={twMerge("relative flex w-full max-w-3xl flex-col gap-4 rounded-2xl border border-(--hairline-color) bg-(--container-color) p-4", wrapperClass)}
  style={accentStyle}
>
  <!-- Заголовок и переключатель режима -->
  <WidgetHeader icon={WifiIcon} label={label?.name ?? "WiFi"} bind:collapsed>
    {#snippet right()}
      <UI.Select
        wrapperClass="w-full sm:w-72"
        type="buttons"
        value={selectedMode}
        options={MODE_OPTIONS}
        onUpdate={(option) => (cfg.WiFiMode = (option as IOption<number>).value as number)}
      />
    {/snippet}
  </WidgetHeader>

  {#if !collapsed}
    <div class="flex flex-col gap-4" transition:slide={{ duration: 150 }}>
      {#if cfg.WiFiMode === 1 || cfg.WiFiMode === 3}
        <!-- Клиентский режим (STA) -->
        <div class="flex flex-col gap-3 rounded-[10px] border border-(--hairline-color) bg-(--back-color) p-3" transition:slide={{ duration: 150 }}>
          <span class="text-[12px] font-semibold text-(--muted-color)">Режим клиента (STA)</span>

          <div class="flex items-end gap-2">
            <UI.Select
              wrapperClass="flex-1"
              type="input"
              label={{ name: "SSID сети" }}
              value={{ id: "current", name: cfg.StaSSID, value: cfg.StaSSID }}
              options={foundNetworks}
              onUpdate={(option) => (cfg.StaSSID = (option as IOption<string>).name ?? "")}
            />
            <UI.Button
              wrapperClass="w-9"
              componentClass="p-1"
              content={{ icon: scanning ? LoaderIcon : SearchIcon, info: { text: "Сканировать сети", side: "top" } }}
              disabled={scanning || !onScan}
              onClick={scanNetworks}
            />
          </div>

          <UI.Input type="password" label={{ name: "Пароль" }} bind:value={cfg.StaPSK} maxlength={64} help={{ autocomplete: "off", regExp: PSK_REGEXP }} />

          <UI.Select
            wrapperClass="w-48"
            type="buttons"
            label={{ name: "Получение IP" }}
            value={selectedIPMode}
            options={IP_MODE_OPTIONS}
            onUpdate={(option) => (cfg.StaticIP = (option as IOption<number>).value as number)}
          />

          {#if cfg.StaticIP === 1}
            <div class="grid grid-cols-1 gap-2 sm:grid-cols-3" transition:slide={{ duration: 150 }}>
              <UI.Input label={{ name: "IP адрес" }} bind:value={cfg.StaIP} maxlength={15} placeholder="192.168.1.100" help={{ regExp: IP_REGEXP }} />
              <UI.Input label={{ name: "Маска подсети" }} bind:value={cfg.StaMS} maxlength={15} placeholder="255.255.255.0" help={{ regExp: IP_REGEXP }} />
              <UI.Input label={{ name: "Шлюз" }} bind:value={cfg.StaGW} maxlength={15} placeholder="192.168.1.1" help={{ regExp: IP_REGEXP }} />
            </div>
          {/if}
        </div>
      {/if}

      {#if cfg.WiFiMode === 2 || cfg.WiFiMode === 3}
        <!-- Точка доступа (AP) -->
        <div class="flex flex-col gap-3 rounded-[10px] border border-(--hairline-color) bg-(--back-color) p-3" transition:slide={{ duration: 150 }}>
          <span class="text-[12px] font-semibold text-(--muted-color)">Точка доступа (AP)</span>

          <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <UI.Input label={{ name: "SSID" }} bind:value={cfg.ApSSID} maxlength={32} />
            <UI.Input type="password" label={{ name: "Пароль" }} bind:value={cfg.ApPSK} maxlength={64} help={{ autocomplete: "off", regExp: PSK_REGEXP }} />
          </div>

          <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <UI.Input label={{ name: "IP адрес" }} bind:value={cfg.ApIP} maxlength={15} help={{ regExp: IP_REGEXP }} />
            <UI.Input label={{ name: "Маска подсети" }} bind:value={cfg.ApMS} maxlength={15} help={{ regExp: IP_REGEXP }} />
            <UI.Input label={{ name: "Шлюз" }} bind:value={cfg.ApGW} maxlength={15} help={{ regExp: IP_REGEXP }} />
          </div>
        </div>
      {/if}

      <!-- Сохранение -->
      <div class="flex flex-col items-center gap-2">
        {#if isDirty}
          <span class="text-[12px] text-(--muted-color)" transition:slide={{ duration: 100 }}>Есть несохранённые изменения</span>
        {/if}
        <UI.Button wrapperClass="w-40" componentClass="bg-green" content={{ name: "Сохранить" }} disabled={!isDirty} onClick={save} />
      </div>
    </div>
  {/if}

  {#if showAPWarning}
    <!-- Подтверждение локально к виджету (не на весь экран) — предупреждение относится
       именно к этой карточке, а не к странице целиком -->
    <div class="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-black/40 backdrop-blur-[2px]" transition:fade={{ duration: 150 }}>
      <div
        class="flex w-full max-w-80 flex-col gap-3 rounded-[16px] border border-(--hairline-color) bg-(--back-color) p-4 shadow-(--elevation-3)"
        transition:scale={{ duration: 150, start: 0.96 }}
      >
        <div class="flex items-center gap-2 text-(--orange-color)">
          <WarningIcon />
          <h4 class="text-[15px] font-semibold text-(--font-color)">Сохранить режим AP?</h4>
        </div>
        <p class="text-[13px] text-(--muted-color)">
          Wi-Fi клиент (STA) будет выключен, устройство отключится от облака и станет доступно только по своей точке доступа. Продолжить?
        </p>
        <div class="flex gap-2">
          <UI.Button wrapperClass="flex-1" componentClass="bg-transparent" content={{ name: "Отмена" }} onClick={() => (showAPWarning = false)} />
          <UI.Button wrapperClass="flex-1" componentClass="bg-red" content={{ name: "Сохранить" }} onClick={confirmAndSave} />
        </div>
      </div>
    </div>
  {/if}
</div>
