<!-- $lib/SensorSettings.svelte - настройки микросхемы датчика в WidgetIMU и WidgetMag: поля слова Cfg по описанию из sensorChips.ts (списки и переключатели), сворачиваемый раздел со сводкой в шапке. Раздел common идёт без заголовка, режим узла (gate) - первым полем строки узла, выключен - остальные поля скрыты; раздел из одних переключателей (оси) - одна группа кнопок рядом с полями предыдущего раздела. Правки локальные до «Сохранить»; биты, которых нет в описании, не меняются. Режим работы (биты 0-1) - поле run: калибровку оно не запускает, а пока драйвер калибрует (busyModes) или виджет занят калибровкой (locked), всё недоступно. «По умолчанию» - заводское слово микросхемы с текущим режимом -->
<script lang="ts">
  import { untrack } from "svelte"
  import * as UI from "."
  import { T } from "./locales/i18n"
  import SectionHead from "./SectionHead.svelte"
  import { hint } from "./hints"
  import { bitFieldGet, bitFieldSet } from "./bitField"
  import type { SensorChipField, SensorChipPart, SensorChipRead, SensorChipSection } from "./sensorChips"

  type Switch = Extract<SensorChipField, { type: "switch" }>
  /* Элемент сетки: одно поле (id - ключ в списке, label - ключ перевода подписи) или группа переключателей кнопками */
  type Item =
    { kind: "field"; id: string; label: string; field: SensorChipField; section: SensorChipSection } | { kind: "flags"; name: string; fields: Switch[] }

  let {
    part,
    cfg,
    onSave,
    hints = false,
    locked = false,
  }: {
    part: SensorChipPart
    cfg: unknown
    /* Новое слово Cfg; без колбэка - только просмотр */
    onSave?: (cfg: number) => void
    /* Подсказки виджета включены кнопкой «?» */
    hints?: boolean
    /* Виджет занят калибровкой или записью положения: настройки только для просмотра */
    locked?: boolean
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

  /* Драйвер сейчас в режиме калибровки (по слову с устройства) */
  const deviceBusy = $derived(incoming !== undefined && part.busyModes.includes(bitFieldGet(incoming, 0, 1)))
  const busy = $derived(locked || deviceBusy)
  const readOnly = $derived(!onSave || word === undefined || busy)
  const get = (field: SensorChipField) => (word === undefined ? undefined : bitFieldGet(word, field.start, field.end))
  const set = (field: SensorChipField, value: unknown) => {
    const number = Number(value)
    if (word === undefined || !Number.isFinite(number)) return
    word = normalize(bitFieldSet(word, field.start, field.end, number))
  }
  /* Чтение другого поля из слова: сначала свой раздел, потом остальные */
  const readerOf =
    (section: SensorChipSection, from: () => number | undefined = () => word): SensorChipRead =>
    (key) => {
      const source = from()
      const other = section.fields.find((f) => f.key === key) ?? part.sections.flatMap((s) => s.fields).find((f) => f.key === key)
      return other && source !== undefined ? bitFieldGet(source, other.start, other.end) : undefined
    }
  /* Недопустимый по даташиту выбор (available) заменяется ближайшим допустимым вариантом списка; два прохода - поля зависят друг от друга */
  const normalize = (value: number) => {
    let next = value
    for (let pass = 0; pass < 2; pass++)
      for (const section of part.sections)
        for (const field of section.fields) {
          if (field.type !== "select" || !field.available) continue
          const read = readerOf(section, () => next)
          const current = bitFieldGet(next, field.start, field.end)
          if (field.available(current, read)) continue
          const index = Math.max(
            0,
            field.options.findIndex((o) => o.value === current),
          )
          const nearest = field.options
            .map((o, i) => ({ o, d: Math.abs(i - index) }))
            .filter(({ o }) => field.available!(o.value, read))
            .sort((a, b) => a.d - b.d)[0]
          if (nearest) next = bitFieldSet(next, field.start, field.end, nearest.o.value)
        }
    return next
  }
  /* Поле показывается, если visible не запрещает */
  const shown = (item: Item) => item.kind === "flags" || !item.field.visible || item.field.visible(readerOf(item.section))
  /* Варианты списка, допустимые при текущих значениях других полей */
  const choices = (field: Extract<SensorChipField, { type: "select" }>, section: SensorChipSection) =>
    field.available ? field.options.filter((o) => field.available!(o.value, readerOf(section))) : field.options
  /* Подпись варианта: @имя - перевод sensor.opt.<имя>, иначе как есть (числа с единицами) */
  const optionName = (name: string) => (name.startsWith("@") ? $T(`sensor.opt.${name.slice(1)}`) : name)
  type Select = Extract<SensorChipField, { type: "select" }>
  const field = (section: SensorChipSection, field: SensorChipField): Item => ({
    kind: "field",
    id: `${section.name}-${field.key}`,
    label: `sensor.field.${field.key}`,
    field,
    section,
  })
  /* Подпись варианта списка: format по другим полям или имя варианта; @имя - перевод */
  const choiceName = (field: Select, section: SensorChipSection, value: number) =>
    optionName(field.format ? field.format(value, readerOf(section)) : (field.options.find((o) => o.value === value)?.name ?? String(value)))
  /* Группы сетки: заголовок - имя раздела (у common нет); gate - режим узла (gate: true), выключен - видно только его; раздел из одних переключателей - кнопки в группе предыдущего раздела */
  const groups = $derived.by(() => {
    const out: { title?: string; gate?: Select; items: Item[] }[] = []
    for (const section of part.sections) {
      const switches = section.fields.filter((field): field is Switch => field.type === "switch")
      if (section.fields.length > 1 && switches.length === section.fields.length) {
        const item: Item = { kind: "flags", name: section.name, fields: switches }
        if (out.length) out[out.length - 1].items.push(item)
        else out.push({ items: [item] })
        continue
      }
      const title = section.name === "common" ? undefined : section.name
      const gate = section.fields.find((f): f is Select => f.type === "select" && !!f.gate)
      const items = section.fields.map((item) => field(section, item))
      /* Раздел без заголовка после группы без заголовка (оси, потом общие) - в ту же группу */
      const last = out[out.length - 1]
      if (!title && !gate && last && !last.title && !last.gate) last.items.push(...items)
      else out.push({ title, gate, items })
    }
    return out
  })
  /* Узел выключен: режим (gate) равен 0 */
  const isOff = (group: { gate?: Select }) => !!group.gate && get(group.gate) === 0
  /* Поля группы на экране: у выключенного узла - только режим */
  const visibleItems = (group: { gate?: Select; items: Item[] }) =>
    group.items.filter((item) => shown(item) && (!isOff(group) || (item.kind === "field" && item.field === group.gate)))
  /* Подсказка поля: группа кнопок - по имени раздела, остальное - по ключу поля */
  const hintText = (item: Item) => $T(item.kind === "flags" ? `sensor.hint.${item.name}` : `sensor.hint.${item.field.key}`)
  /* Ширина ячейки поля: списки постоянной ширины, кнопки - шире, но не шире виджета (на узком месте сжимаются или становятся списком), переключатель по подписи */
  const cellClass = (item: Item) =>
    item.kind === "flags"
      ? "w-28 shrink-0"
      : item.field.type === "switch"
        ? "shrink-0"
        : item.field.type === "select" && item.field.buttons
          ? "w-72 max-w-full shrink-0"
          : item.field.type === "select" && item.field.wide
            ? "w-40 shrink-0"
            : "w-28 shrink-0"
  const flagsOn = (fields: Switch[]) => fields.filter((field) => get(field) === 1).map((field) => field.key)
  const flagsSet = (fields: Switch[], keys: string[]) => fields.forEach((field) => set(field, keys.includes(field.key) ? 1 : 0))
  /* Сводка в шапке: поля brief (нет ни одного - все списки и числа с единицей) и группы кнопок; раздел с заголовком - короткое имя и значения, выключенный - «выкл.» */
  const anyBrief = $derived(part.sections.some((section) => section.fields.some((field) => field.type !== "switch" && field.brief)))
  const itemText = (item: Item) => {
    if (item.kind === "flags") {
      const on = item.fields.filter((field) => get(field) === 1).map((field) => field.short ?? field.key)
      return `${$T(`sensor.section.${item.name}`)} ${on.length ? on.join(" ") : "-"}`
    }
    const { field } = item
    const value = get(field)
    if (value === undefined || field.type === "switch" || field.noSummary || (anyBrief && !field.brief)) return undefined
    return field.unit ? `${value} ${$T(`sensor.unit.${field.key}`)}` : choiceName(field, item.section, value)
  }
  const summary = $derived(
    groups
      .flatMap((group) => {
        const short = group.title ? $T(`sensor.short.${group.title}`) : ""
        if (isOff(group)) return [`${short} ${$T("sensor.off")}`]
        const texts = visibleItems(group)
          .map(itemText)
          .filter((text): text is string => !!text)
        return group.title && texts.length ? [`${short} ${texts.join(", ")}`] : texts
      })
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
  <div class="px-3 py-2" use:hint={{ text: $T("sensor.hint.settings"), enabled: hints }}><SectionHead title={$T("sensor.settings")} {summary} bind:open /></div>
  {#if open}
    <div class="flex flex-col gap-3 border-t border-(--hairline-color) p-3">
      {#each groups as group, index (index)}
        <div class="flex flex-col gap-2">
          <!-- Поля плотно слева постоянной ширины (подпись целиком в одну строку), лишние уходят в следующий ряд; у выключенного узла - только режим -->
          {#if group.title}<span class="text-[12px] font-semibold text-(--muted-color)">{$T(`sensor.section.${group.title}`)}</span>{/if}
          <div class="flex flex-wrap items-end gap-x-3 gap-y-2">
            {#each visibleItems(group) as item (item.kind === "flags" ? `flags-${item.name}` : item.id)}
              <div class={cellClass(item)} use:hint={{ text: hintText(item), enabled: hints }}>
                {#if item.kind === "flags"}
                  <UI.Select
                    type="buttons"
                    multiSelect
                    label={{ name: $T(`sensor.section.${item.name}`) }}
                    options={item.fields.map((field) => ({ id: `${item.name}-${field.key}`, name: field.short ?? field.key, value: field.key }))}
                    value={flagsOn(item.fields)}
                    disabled={readOnly}
                    onUpdate={(value) => flagsSet(item.fields, value as string[])}
                  />
                {:else if item.field.type === "switch"}
                  {@const field = item.field}
                  <UI.Switch
                    type="horizontal"
                    label={{ name: $T(item.label) }}
                    value={get(field) ?? 0}
                    disabled={readOnly}
                    onUpdate={(value) => set(field, value ? 1 : 0)}
                  />
                {:else if item.field.type === "select"}
                  {@const field = item.field}
                  <UI.Select
                    type={field.buttons ? "buttons" : "select"}
                    label={{ name: $T(item.label) }}
                    options={choices(field, item.section).map((o) => ({
                      id: `${field.key}-${o.value}`,
                      name: choiceName(field, item.section, o.value),
                      value: o.value,
                    }))}
                    value={get(field)}
                    disabled={readOnly || !!field.locked?.(readerOf(item.section))}
                    onUpdate={(value) => set(field, value)}
                  />
                {/if}
              </div>
            {/each}
          </div>
        </div>
      {/each}

      {#if onSave}
        <div class="flex flex-col items-center gap-2">
          <span class="text-[12px] text-(--muted-color) {busy || isDirty ? '' : 'invisible'}">{$T(busy ? "sensor.busy" : "widget.common.unsaved")}</span>
          <div class="flex w-full max-w-80 flex-wrap gap-2">
            <UI.Button
              wrapperClass="min-w-fit flex-1"
              componentClass="px-2 whitespace-nowrap"
              content={{ name: $T("sensor.default") }}
              disabled={readOnly}
              onClick={reset}
            />
            <UI.Button
              wrapperClass="min-w-fit flex-1"
              componentClass="px-2 whitespace-nowrap"
              variant="primary"
              content={{ name: $T("widget.common.save") }}
              disabled={readOnly || !isDirty}
              onClick={save}
            />
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>
