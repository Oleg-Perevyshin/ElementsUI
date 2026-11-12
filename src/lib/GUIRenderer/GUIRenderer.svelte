<!-- $lib/GUIRenderer/GUIRenderer.svelte - GUI устройства из конструктора: сетка, вложенность Accordion/Tabs, значения переменных, битовые поля, пакеты команд, смарт-виджеты и файлы. Транспорт и маршрутизация к модулю - у приложения (link) -->
<script lang="ts">
  import type { Snippet } from "svelte"
  import { Language, T } from "../locales/i18n"
  import { localizeDeep } from "../locales/localize"
  import type { ITableButton, ITableContent, IOption, UIComponent, UIType } from "../types"
  import { argumentCode, createFsTransfer, FsTransferError, sendCommand } from "../fsTransfer"
  import {
    GUI_GRID,
    WIDGET_FIELDS,
    WIDGET_SAVE_FIELDS,
    commandPacket,
    isWidgetType,
    readBits,
    readWidgetFields,
    spanRows,
    tablePacket,
    widgetKey,
    widgetPacket,
    widgetPrefixes,
    writeBits,
    layoutFlow,
    layoutColumns,
    flowMinWidth,
    type FlowNode,
    type DeviceLink,
    type DevicePacket,
  } from "../gui"
  import { COMPONENTS } from "../registry"
  import Accordion from "../Accordion/Accordion.svelte"
  import Tabs from "../Tabs/Tabs.svelte"
  import Button from "../Button/Button.svelte"
  import Input from "../Input/Input.svelte"
  import Select from "../Select/Select.svelte"
  import Switch from "../Switch/Switch.svelte"
  import Slider from "../Slider/Slider.svelte"
  import Joystick from "../Joystick/Joystick.svelte"
  import Widget from "../Widget/Widget.svelte"
  import TextField from "../TextField/TextField.svelte"
  import Divider from "../Divider/Divider.svelte"
  import ProgressBar from "../ProgressBar/ProgressBar.svelte"
  import Graph from "../Graph/Graph.svelte"
  import PeriodChart from "../PeriodChart/PeriodChart.svelte"
  import FileAttach from "../FileAttach/FileAttach.svelte"
  import VideoViewer from "../VideoViewer/VideoViewer.svelte"
  import WidgetWiFi from "../WidgetWiFi/WidgetWiFi.svelte"
  import WidgetDeviceInfo from "../WidgetDeviceInfo/WidgetDeviceInfo.svelte"
  import WidgetFileSystem from "../WidgetFileSystem/WidgetFileSystem.svelte"
  import WidgetStackInfo from "../WidgetStackInfo/WidgetStackInfo.svelte"
  import WidgetRGBStrip from "../WidgetRGBStrip/WidgetRGBStrip.svelte"
  import WidgetPFD from "../WidgetPFD/WidgetPFD.svelte"
  import WidgetMap from "../WidgetMap/WidgetMap.svelte"
  import DeviceTable from "./DeviceTable.svelte"

  interface Props {
    components: UIComponent[]
    link: DeviceLink
    /* Язык текстов GUI; по умолчанию - язык библиотеки */
    language?: string
    /* Наблюдатель: видны только компоненты с access full и viewOnly, управление отключено */
    viewer?: boolean
    /* Ключ хранения в браузере (обычно ModSN): свёрнутость виджетов, планы карты */
    persistKey?: string
    /* Своя отрисовка типа (например VideoViewer с потоком приложения) */
    render?: Partial<Record<UIType, Snippet<[UIComponent]>>>
    /* Ошибка команды или передачи файла, для уведомления */
    onError?: (message: string) => void
  }

  let { components, link, language, viewer = false, persistKey, render, onError }: Props = $props()

  /* Кэш по ссылке и языку: localizeDeep создаёт новые объекты, без кэша обновление значений сбрасывало бы раскрытые аккордеоны и вкладки */
  let localized: { src?: UIComponent[]; lang?: string; out: UIComponent[] } = { out: [] }
  const blocks = $derived.by(() => {
    const lang = language ?? $Language
    if (components !== localized.src || lang !== localized.lang) localized = { src: components, lang, out: localizeDeep(components, lang) }
    return localized.out
  })
  /* Дети контейнеров одним проходом: ключ - parentId ребёнка (parentId + id родителя), корень - "" */
  const tree = $derived.by(() => {
    const map = new Map<string, UIComponent[]>()
    for (const c of blocks) {
      const key = c.parentId ?? ""
      const list = map.get(key)
      if (list) list.push(c)
      else map.set(key, [c])
    }
    return map
  })
  const childrenOf = (parent: UIComponent) => tree.get((parent.parentId ?? "") + parent.id) ?? []
  const visible = (c: UIComponent) => !viewer || c.access === "full" || c.access === "viewOnly"

  /* Текст для уведомления: коды FsTransferError переводятся словарём библиотеки, текст устройства (ER!) остаётся как есть */
  const report = (error: unknown) =>
    onError?.(error instanceof FsTransferError ? $T(error.key, error.params) : error instanceof Error ? error.message : String(error))
  /* Ошибка для виджета: уведомление и отказ промиса - виджет показывает её у поля */
  const fail = (error: unknown): never => {
    report(error)
    throw error
  }

  const get = (key: string) => link.get(key)

  /* Команда по именам из eventHandler и свойств виджета: в провод уходит HAR по словарю связи; имя не из словаря - уведомление, пакет не уходит */
  const send = (header: string, argument: string, payload: Record<string, unknown>) => {
    try {
      sendCommand(link, header, argument, payload)
    } catch (error) {
      report(error)
    }
  }

  const dispatch = (packet: DevicePacket | null) => {
    if (!packet) return onError?.($T("gui.error.event_handler"))
    for (const [key, value] of packet.writes) link.set?.(key, value)
    if (packet.send) send(packet.header, packet.argument, packet.payload)
  }

  /* Изменение значения компонента: битовое поле собирается в слово, пакет - по eventHandler */
  const change = (component: UIComponent, value: unknown) => {
    const id = component.properties.id ?? ""
    dispatch(commandPacket(component.eventHandler, get, [id, writeBits(component, get(id), value)]))
  }

  /* Прежний объект, если ни одно поле не изменилось: иначе виджет видит новые данные на любую перерисовку (у PFD сбрасывался таймер свежести) */
  const cache = new Map<string, Record<string, unknown>>()
  const stable = <T extends object>(key: string, next: T): T => {
    const prev = cache.get(key)
    const fresh = next as Record<string, unknown>
    if (prev && Object.keys(prev).length === Object.keys(fresh).length && Object.keys(fresh).every((k) => Object.is(prev[k], fresh[k]))) return prev as T
    cache.set(key, fresh)
    return next
  }
  const fields = <F extends object>(component: UIComponent, prefix: string, all: F) =>
    stable(`${component.id}|${prefix}`, readWidgetFields(get, prefix, all, (component.properties as { keys?: Partial<Record<keyof F, string>> }).keys))

  const saveFields = <K extends string>(prefix: string, save: readonly K[], values: Partial<Record<K, unknown>>, keys?: Partial<Record<K, string>>) => {
    const payload = widgetPacket(prefix, save, values, keys)
    for (const [key, value] of Object.entries(payload)) link.set?.(key, value)
    send("SET", "ModCfg", payload)
  }

  /* Поиск сетей WiFi: устройство отвечает списком { id, name, value } в поле "{префикс}.{StaSSID}-S" */
  const scanWiFi = async (prefix: string, keys: Partial<Record<string, string>> | undefined, command?: { header?: string; argument?: string }) => {
    const listKey = `${widgetKey(prefix, "StaSSID", keys)}-S`
    const argument = command?.argument || "APsList"
    let pending: ReturnType<typeof link.waitFor>
    try {
      pending = link.waitFor(argumentCode(link, argument), (reply) => !reply.ok || Array.isArray(reply.payload[listKey]), 3000)
      sendCommand(link, command?.header || "GET", argument, {})
    } catch (error) {
      report(error)
      return []
    }
    const reply = await pending
    if (reply?.ok) return reply.payload[listKey] as { id: string; name: string; value: string }[]
    /* ER! или таймаут - уведомление, список пустой */
    report(reply ? $T("widget.wifi.scan_failed", { message: reply.message || "ER!" }) : $T("widget.wifi.scan_timeout"))
    return []
  }

  /* Файлы: очередь на аргумент команд, своя у каждой связи (модуля) */
  const transfers = $derived(link && new Map<string, ReturnType<typeof createFsTransfer>>())
  /* Передача на аргумент и предел имени (maxNameLength из свойств WidgetFileSystem); проверка имени только в createFsTransfer */
  const fs = (argument = "FS", maxNameLength = 31) => {
    const key = `${argument}:${maxNameLength}`
    return transfers.get(key) ?? transfers.set(key, createFsTransfer(link, { argument, maxNameLength })).get(key)!
  }
  const saveFile = (name: string, bytes: Uint8Array) => {
    const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: "application/octet-stream" }))
    Object.assign(document.createElement("a"), { href: url, download: name.split("/").pop() || "file" }).click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  /* План миссии карты - в браузере оператора, свой для модуля и компонента */
  const missionKey = (id: string, kind: "plan" | "route") => `WidgetMap.${kind}|${persistKey}|${id}`
  const loadMission = <T,>(id: string, kind: "plan" | "route"): T | undefined => {
    if (!persistKey) return undefined
    try {
      return JSON.parse(localStorage.getItem(missionKey(id, kind)) ?? "null") ?? undefined
    } catch {
      return undefined
    }
  }
  const saveMission = (id: string, kind: "plan" | "route", value: unknown) => {
    if (!persistKey) return
    try {
      localStorage.setItem(missionKey(id, kind), JSON.stringify(value))
    } catch {
      /* хранилище недоступно - план живёт до перезагрузки */
    }
  }

  /* Строки таблицы: колонки-списки берут выбранное значение из переменной модуля строки (keyCol) */
  type Row = Record<string, unknown>
  const tableRows = (component: UIComponent<"Table">): unknown => {
    const value = link.get(component.properties.id ?? "")
    const selects = (component.properties.header ?? []).flatMap((column) =>
      Array.isArray(column.content) ? column.content.filter((c): c is Extract<ITableContent<Row>, { type: "select" }> => c.type === "select") : [],
    )
    if (!selects.length || !Array.isArray(value)) return value
    return (value as Row[]).map((row) => ({
      ...row,
      ...Object.fromEntries(selects.map(({ data }) => [data.key, link.get(String(data.key), data.keyCol ? String(row[data.keyCol]) : undefined)])),
    }))
  }

  const selectOptions = (component: UIComponent<"Select">) => {
    const external = link.get(`${component.properties.id}-S`)
    return (Array.isArray(external) ? external : (component.properties.options ?? [])) as IOption[]
  }

  /* ********************************************************** */
  /* Уже NARROW_MAX_PX (телефон, узкая панель) - раскладка по группам автора (layoutFlow в gui.ts), иначе его сетка */
  const NARROW_MAX_PX = 640
  let width = $state(0)
  const narrow = $derived(width > 0 && width < NARROW_MAX_PX)

  /* Группа из мелких блоков (канал, мотор) - в рамке; виджеты и графики - уже карточки */
  const framed = (node: FlowNode) => node.kind !== "leaf" && Number.isFinite(flowMinWidth(node))

  const cellStyle = (component: UIComponent, fixedHeight: boolean) => {
    /* Телефон: место задаёт раскладка, высота по содержимому; графику и видео - высота из конструктора, не больше 20rem */
    if (narrow) {
      const fixed = component.type === "Graph" || component.type === "PeriodChart" || component.type === "VideoViewer"
      return fixed ? `height: min(${component.position.height * GUI_GRID.cellHeight}rem, 20rem);` : ""
    }
    const area = `grid-area: ${component.position.row} / ${component.position.col} / span ${spanRows(component)} / span ${component.position.width};`
    const auto = component.type === "Accordion" || isWidgetType(component.type)
    const height = `${component.position.height * GUI_GRID.cellHeight}rem`
    if (fixedHeight) return `${area} height: ${auto ? "auto" : height} !important; min-height: ${GUI_GRID.cellHeight}rem;`
    return component.type === "VideoViewer" || component.type === "Divider" ? `${area} height: ${height};` : area
  }

  const persist = (component: UIComponent) => (persistKey ? `${persistKey}|${component.id}` : undefined)
  const writable = (component: UIComponent) => !viewer && COMPONENTS[component.type].io !== "none"
</script>

<div bind:clientWidth={width}>
  {@render Layout((tree.get("") ?? []).filter(visible), GUI_GRID.columns, false)}
</div>

<!-- Блоки одного контейнера: на телефоне раскладка по группам, на компьютере сетка автора -->
{#snippet Layout(list: UIComponent[], total: number, fixedHeight: boolean)}
  {#if narrow}
    {@render Flow(layoutFlow(list))}
  {:else}
    <div class="grid gap-2" style="grid-template-columns: {layoutColumns(list, total)}">
      {#each list as component (component.id)}
        {@render Cell(component, fixedHeight)}
      {/each}
    </div>
  {/if}
{/snippet}

{#snippet Flow(node: FlowNode)}
  {#if node.kind === "leaf"}
    {@render Cell(node.component, false)}
  {:else if node.kind === "stack"}
    <div class="flex min-w-0 flex-col gap-2">
      {#each node.items as item, index (index)}
        {@render Flow(item)}
      {/each}
    </div>
  {:else}
    {@const widths = node.items.map(flowMinWidth)}
    {@const same = node.kind === "groups" && widths.every((w) => w === widths[0] && Number.isFinite(w))}
    {#if same}
      <!-- Одинаковые группы (каналы) - сеткой, сколько поместится -->
      <div class="grid gap-2" style="grid-template-columns: repeat(auto-fill, minmax(min({widths[0] + 18}px, 100%), 1fr))">
        {#each node.items as item, index (index)}
          <div class="min-w-0 {framed(item) ? 'rounded-xl border border-(--hairline-color) p-2' : ''}">{@render Flow(item)}</div>
        {/each}
      </div>
    {:else}
      <div class="flex flex-wrap gap-2">
        {#each node.items as item, index (index)}
          {@const framedGroup = node.kind === "groups" && framed(item)}
          <div
            class="min-w-0 {framedGroup ? 'rounded-xl border border-(--hairline-color) p-2' : ''}"
            style="flex: 1 1 {Number.isFinite(widths[index]) ? `${widths[index] + (framedGroup ? 18 : 0)}px` : '100%'}"
          >
            {@render Flow(item)}
          </div>
        {/each}
      </div>
    {/if}
  {/if}
{/snippet}

{#snippet Cell(component: UIComponent, fixedHeight: boolean)}
  {#if visible(component)}
    {@const id = component.properties.id ?? ""}
    {@const locked = !writable(component)}
    <div class={component.type === "Accordion" ? "" : "flex flex-col justify-start"} style={cellStyle(component, fixedHeight)}>
      {#if render?.[component.type]}
        {@render render[component.type]?.(component)}
      {:else if component.type === "Accordion"}
        <Accordion {...component.properties}>
          <!-- Своя сетка содержимого во всю ширину аккордеона: колонок не меньше, чем у самого дальнего блока -->
          <div class="min-w-0" style="grid-column: 1 / -1; grid-row: 1 / -1">
            {@render Layout(childrenOf(component).filter(visible), component.properties.size?.width ?? 1, !!component.properties.image)}
          </div>
        </Accordion>
      {:else if component.type === "Tabs"}
        <!-- Содержимое вкладки - через Layout, как у Accordion: на телефоне раскладка по группам, а не одна колонка сетки size.width -->
        <Tabs {...component.properties} apiArray={childrenOf(component)}>
          {#snippet Content(list: UIComponent[])}
            {@render Layout(list.filter(visible), component.properties.size?.width ?? 1, false)}
          {/snippet}
        </Tabs>
      {:else if component.type === "Button"}
        <Button
          {...component.properties}
          disabled={locked || component.properties.disabled}
          onClick={() => dispatch(commandPacket(component.eventHandler, get))}
        />
      {:else if component.type === "Input"}
        <Input
          {...component.properties}
          readonly={locked || component.properties.readonly}
          value={(readBits(component, link.get(id)) as string | number | undefined) ?? component.properties.value}
          onUpdate={(value) => change(component, value)}
        />
      {:else if component.type === "Select"}
        <Select
          {...component.properties}
          disabled={locked || component.properties.disabled}
          value={readBits(component, link.get(id)) ?? null}
          options={selectOptions(component)}
          onUpdate={(value) => change(component, value)}
        />
      {:else if component.type === "Switch"}
        <Switch
          {...component.properties}
          disabled={locked || component.properties.disabled}
          value={link.get(id) as number}
          onUpdate={(value) => change(component, value)}
        />
      {:else if component.type === "Slider"}
        <Slider
          {...component.properties}
          disabled={locked || component.properties.disabled}
          value={link.get(id) as number | [number, number]}
          onUpdate={(value) => change(component, value)}
        />
      {:else if component.type === "Joystick"}
        <Joystick
          {...component.properties}
          readonly={locked || component.properties.readonly}
          value={link.get(id) as number[]}
          onUpdate={(value) => change(component, value)}
        />
      {:else if component.type === "Widget"}
        <Widget
          {...component.properties}
          readonly={locked || component.properties.readonly}
          value={link.get(id) as number}
          onUpdate={(value) => change(component, value)}
        />
      {:else if component.type === "TextField"}
        <TextField {...component.properties} />
      {:else if component.type === "Divider"}
        <Divider {...component.properties} />
      {:else if component.type === "ProgressBar"}
        <ProgressBar {...component.properties} value={link.get(id) as never} />
      {:else if component.type === "Graph"}
        <Graph
          {...component.properties}
          streamingData={{ data: component.properties.isTest ? (component.properties.streamingData?.data ?? null) : (link.get(id) as never) }}
        />
      {:else if component.type === "PeriodChart"}
        <PeriodChart
          {...component.properties}
          levels={(component.properties.levels ?? []).map((level) => ({
            ...level,
            data: ((level.variable && link.get(level.variable)) as number[] | undefined) ?? level.data ?? [],
          }))}
        />
      {:else if component.type === "Table"}
        <DeviceTable
          properties={component.properties}
          value={tableRows(component)}
          onClick={locked ? undefined : (row: Row, button: ITableButton<Row>) => dispatch(tablePacket(button.eventHandler, row))}
        />
      {:else if component.type === "FileAttach"}
        <FileAttach
          {...component.properties}
          disabled={locked || component.properties.disabled}
          onUpdate={(file) => file && fs().upload(file.name, file).catch(report)}
        />
      {:else if component.type === "VideoViewer"}
        <VideoViewer {...component.properties} />
      {:else if component.type === "WidgetWiFi"}
        {@const props = component.properties}
        {@const prefix = widgetPrefixes(component.type, props)[0]}
        <WidgetWiFi
          {...props}
          value={fields(component, prefix, WIDGET_FIELDS.WidgetWiFi)}
          persistKey={persist(component)}
          onScan={locked ? undefined : () => scanWiFi(prefix, props.keys, props.scanCommand)}
          onSave={locked ? undefined : (config) => saveFields(prefix, WIDGET_SAVE_FIELDS.WidgetWiFi, config, props.keys)}
        />
      {:else if component.type === "WidgetDeviceInfo"}
        {@const props = component.properties}
        {@const prefix = widgetPrefixes(component.type, props)[0]}
        <WidgetDeviceInfo
          {...props}
          value={fields(component, prefix, WIDGET_FIELDS.WidgetDeviceInfo)}
          persistKey={persist(component)}
          onSave={locked ? undefined : (info) => saveFields(prefix, WIDGET_SAVE_FIELDS.WidgetDeviceInfo, info, props.keys)}
          onRestart={locked ? undefined : () => send(props.restartCommand?.header || "SET", props.restartCommand?.argument || "Restart", {})}
          onFactoryReset={locked ? undefined : () => send(props.resetCommand?.header || "SET", props.resetCommand?.argument || "RstNVS", {})}
        />
      {:else if component.type === "WidgetFileSystem"}
        {@const props = component.properties}
        {@const argument = props.argument || "FS"}
        {@const transfer = () => fs(argument, props.maxNameLength)}
        <WidgetFileSystem
          {...props}
          value={fields(component, widgetPrefixes(component.type, props)[0], WIDGET_FIELDS.WidgetFileSystem).FS}
          persistKey={persist(component)}
          onRefresh={() => send("GET", argument, {})}
          onDelete={locked ? undefined : (name) => transfer().remove(name).catch(fail)}
          onUpload={locked ? undefined : (file) => transfer().upload(file.name, file).catch(fail)}
          onDownload={locked
            ? undefined
            : (name) =>
                transfer()
                  .download(name)
                  .then((bytes) => saveFile(name, bytes), fail)}
        />
      {:else if component.type === "WidgetStackInfo"}
        {@const props = component.properties}
        <WidgetStackInfo
          {...props}
          value={fields(component, "", WIDGET_FIELDS.WidgetStackInfo).StackInfo}
          persistKey={persist(component)}
          onRefresh={() => send("GET", props.argument || "StackInfo", {})}
        />
      {:else if component.type === "WidgetRGBStrip"}
        {@const props = component.properties}
        {@const prefix = widgetPrefixes(component.type, props)[0]}
        <WidgetRGBStrip
          {...props}
          value={fields(component, prefix, WIDGET_FIELDS.WidgetRGBStrip)}
          persistKey={persist(component)}
          onUpdate={locked ? undefined : (value, field) => saveFields(prefix, [field], { [field]: value }, props.keys)}
          onSave={locked ? undefined : (hardware) => saveFields(prefix, WIDGET_SAVE_FIELDS.WidgetRGBStrip, hardware, props.keys)}
        />
      {:else if component.type === "WidgetPFD"}
        <WidgetPFD
          {...component.properties}
          value={fields(component, widgetPrefixes(component.type, component.properties)[0], WIDGET_FIELDS.WidgetPFD)}
          persistKey={persist(component)}
        />
      {:else if component.type === "WidgetMap"}
        <WidgetMap
          {...component.properties}
          value={stable(
            component.id,
            Object.fromEntries(widgetPrefixes(component.type, component.properties).map((group) => [group, fields(component, group, WIDGET_FIELDS.WidgetMap)])),
          )}
          persistKey={persist(component)}
          plan={loadMission(component.id, "plan")}
          onPlanChange={(plan) => saveMission(component.id, "plan", plan)}
          route={loadMission(component.id, "route")}
          onRouteChange={(route) => saveMission(component.id, "route", route)}
        />
      {/if}
    </div>
  {/if}
{/snippet}
