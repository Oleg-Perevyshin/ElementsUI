<!-- src/routes/IconsShowcase.svelte - вкладка «Иконки» на главной витрины: весь каталог по категориям с поиском по имени, клик копирует SVG -->
<script lang="ts">
  import { Input, T, ICONS, ICON_NAMES, ICONS_ARRAY } from "#lib"
  import CopiedChip from "#lib/CopiedChip.svelte"

  let query = $state("")
  let copied: string | null = $state(null)
  let copiedTimer: ReturnType<typeof setTimeout> | undefined

  const search = $derived(query.trim().toLowerCase())
  /* Категории с иконками, подходящими под поиск: совпадение по имени иконки или названию категории */
  const sections = $derived(
    ICONS.map(([category, svgs]) => {
      const title = $T(`constructor.props.icon.${category}`)
      const titleMatch = !!search && title.toLowerCase().includes(search)
      const items = svgs.map((svg, i) => ({ svg, name: ICON_NAMES[category]?.[i] ?? "" })).filter((item) => !search || titleMatch || item.name.includes(search))
      return { category, title, items }
    }).filter((section) => section.items.length > 0),
  )
  const total = $derived(sections.reduce((sum, section) => sum + section.items.length, 0))

  const copy = async (key: string, svg: string) => {
    try {
      await navigator.clipboard.writeText(svg)
      copied = key
      clearTimeout(copiedTimer)
      copiedTimer = setTimeout(() => (copied = null), 1200)
    } catch {
      copied = null
    }
  }
</script>

<div class="mx-auto flex w-full max-w-6xl flex-col gap-4">
  <div class="flex flex-wrap items-end gap-3">
    <Input wrapperClass="w-80" bind:value={query} placeholder={$T("library.icons_search")} maxlength={40} />
    <span class="pb-2 text-sm text-(--muted-color)">{$T("library.icons_count", { n: total })} · {$T("library.icons_hint")}</span>
  </div>

  {#each sections as section (section.category)}
    <section class="ui-panel rounded-2xl p-4">
      <h4 class="mb-3 text-left">
        {section.title} <span class="text-sm font-normal text-(--muted-color)">· {section.items.length}</span>
      </h4>
      <div class="grid grid-cols-[repeat(auto-fill,minmax(6.5rem,1fr))] gap-2">
        {#each section.items as item (item.name)}
          {@const key = `${section.category}.${item.name}`}
          <button
            class="relative flex cursor-pointer flex-col items-center gap-1.5 rounded-xl px-1 py-2 text-(--font-color) transition-colors duration-150 hover:bg-(--container-color)"
            title={item.name}
            onclick={() => copy(key, item.svg)}
          >
            <span class="size-7 [&_svg]:h-full [&_svg]:w-full">{@html item.svg}</span>
            <span class="w-full truncate text-[11px] text-(--muted-color)">{item.name}</span>
            <CopiedChip show={copied === key} class="-top-2" />
          </button>
        {/each}
      </div>
    </section>
  {:else}
    <p class="py-8 text-center text-(--muted-color)">{$T("library.icons_none")}</p>
  {/each}

  {#if !search}
    <section class="ui-panel rounded-2xl p-4">
      <h4 class="mb-3 text-left">{$T("library.icons_states")}</h4>
      <div class="flex flex-col gap-3">
        {#each ICONS_ARRAY as [name, svgs] (name)}
          <div class="flex items-center gap-4">
            <span class="w-32 text-left text-sm text-(--muted-color)">{$T(`constructor.props.icon.${name}`)}</span>
            {#each svgs as svg, i (i)}
              <span class="size-8 text-(--font-color) [&_svg]:h-full [&_svg]:w-full">{@html svg}</span>
            {/each}
          </div>
        {/each}
      </div>
    </section>
  {/if}
</div>
