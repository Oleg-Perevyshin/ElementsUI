<!-- $lib/IconsMatrix.svelte - каталог иконок матрицей 4×3: рамка на категорию, внутри её 16 иконок сеткой 4×4, сверху поиск по имени иконки или названию категории. Общий для пикера конструктора и витрины -->
<script lang="ts">
  import { sanitizeHtml } from "./html"
  import { T } from "./locales/i18n"
  import { ICONS, ICON_NAMES } from "./icons"
  import Input from "./Input/Input.svelte"
  import Tooltip from "./Tooltip.svelte"
  import { isHoverPointer } from "./popup"

  let {
    onPick,
    selected = "",
    placeholder,
  }: {
    /* Клик по иконке: SVG и имя */
    onPick: (svg: string, name: string) => void
    /* Выбранная сейчас иконка - подсвечивается */
    selected?: string
    placeholder?: string
  } = $props()

  let query = $state("")
  /* Иконка под курсором: «категория.имя», её имя показывает подсказка */
  let hovered: string | null = $state(null)
  const search = $derived(query.trim().toLowerCase())
  const sections = $derived(
    ICONS.map(([category, svgs]) => {
      const title = $T(`constructor.props.icon.${category}`)
      const titleMatch = !!search && title.toLowerCase().includes(search)
      const items = svgs.map((svg, i) => ({ svg, name: ICON_NAMES[category]?.[i] ?? "" })).filter((item) => !search || titleMatch || item.name.includes(search))
      return { category, title, items }
    }).filter((section) => section.items.length > 0),
  )
</script>

<div class="flex min-h-0 flex-1 flex-col gap-3">
  <Input bind:value={query} placeholder={placeholder ?? $T("constructor.props.icon.search")} maxlength={40} />
  <div class="min-h-0 flex-1 overflow-y-auto pt-2.5">
    <!-- Клетка шириной под самое длинное название категории, 4 кнопки по 40 px по центру колонок: окно по ширине матрицы, а не растянуто -->
    <div class="grid w-max grid-cols-[repeat(4,12.5rem)] gap-x-3 gap-y-5">
      {#each sections as section, sectionIndex (section.category)}
        {@const lastRow = sectionIndex >= Math.floor((sections.length - 1) / 4) * 4}
        <div class="relative rounded-xl border border-(--border-color) px-2 pt-4 pb-2">
          <span class="absolute -top-2.5 left-2 max-w-[calc(100%-1rem)] truncate bg-(--back-color) px-1 text-[12px] font-semibold text-(--muted-color)">
            {section.title} · {section.items.length}
          </span>
          <div class="grid grid-cols-4 justify-items-center gap-1">
            {#each section.items as item (item.name)}
              {@const key = `${section.category}.${item.name}`}
              <button
                class="relative flex size-10 cursor-pointer items-center justify-center rounded-lg text-(--font-color) transition-colors duration-150 hover:bg-(--container-color) [&_svg]:size-6
                  {selected === item.svg ? 'bg-(--accent-soft) text-(--accent-text)' : ''}"
                aria-label={item.name}
                onpointerenter={(event) => (hovered = isHoverPointer(event) ? key : null)}
                onpointerleave={() => (hovered = null)}
                onclick={() => onPick(item.svg, item.name)}
              >
                {@html sanitizeHtml(item.svg)}
                <!-- В нижнем ряду матрицы подсказка вверх, иначе её срежет край прокрутки -->
                <Tooltip show={hovered === key} text={item.name} side={lastRow ? "top" : "bottom"} />
              </button>
            {/each}
          </div>
        </div>
      {:else}
        <p class="col-span-4 py-6 text-center text-(--muted-color)">{$T("constructor.props.icon.none")}</p>
      {/each}
    </div>
  </div>
</div>
