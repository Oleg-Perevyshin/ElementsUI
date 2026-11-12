<!-- $lib/Tabs/Tabs.svelte - вкладки: выбранная отмечается линией 2px акцентом; wrapperClass по умолчанию пустой, bg-* в нём красит панель. orientation="vertical" - вкладки столбцом слева (линия справа), на месте уже 448 px (@md) - обычной строкой сверху -->
<script lang="ts">
  import type { ITabsProps } from "../types"
  import { twMerge } from "tailwind-merge"
  import { accentStyle } from "../accent"
  import Icon from "../Icon.svelte"

  let {
    wrapperClass = "",
    accent,
    orientation = "horizontal",
    size = { width: 12, height: 6 },
    activeTab = $bindable(0),
    items = [
      { name: "tab 1", icon: "", class: "" },
      { name: "tab 2", icon: "", class: "" },
    ],
    children,
    apiArray = [],
    Components,
    Content,
  }: ITabsProps = $props()

  const vertical = $derived(orientation === "vertical")
  const isCol = $derived(!!items.find((item) => item.class?.startsWith("flex-col")))

  /* Номер вкладки дочернего компонента. Конструктор даёт id = UUID без первого символа (35 знаков) + номер вкладки: берём всё после 35-го знака, иначе цифра в конце UUID приклеилась бы к номеру. Прочие id - число в конце */
  const tabOfComponent = (componentId: string) => (/^[0-9a-f-]{35}\d+$/i.test(componentId) ? componentId.slice(35) : componentId.match(/(\d+)$/)?.[1])
</script>

<div class="@container h-full w-full" style={accentStyle(accent)}>
  <div class="flex h-full w-full flex-col overflow-hidden rounded-[14px] border border-(--hairline-color) bg-(--back-color) {vertical ? '@md:flex-row' : ''}">
    <!-- Полоса вкладок - outer оставлен «чистым» скролл-контейнером без justify-*: justify-content на самом overflow-x-auto блоке при контенте чуть шире контейнера даёт паразитный горизонтальный скролл на пару px даже когда прокручивать нечего (классический баг центрирования flex-контейнера с overflow). Поэтому justify-* из wrapperClass уходит на внутреннюю обёртку, а не на сам скролл-контейнер. -->
    <div
      class="sticky top-0 z-40 flex h-fit shrink-0 items-center overflow-x-auto border-b border-(--hairline-color) px-4 {vertical
        ? '@md:h-auto @md:max-w-[40%] @md:items-start @md:overflow-x-hidden @md:overflow-y-auto @md:border-r @md:border-b-0 @md:px-0 @md:py-2'
        : ''}"
    >
      <div
        class={twMerge(`flex w-full items-center gap-6 ${vertical ? "@md:flex-col @md:items-stretch @md:gap-0" : ""}`, wrapperClass)}
        role="tablist"
        aria-orientation={vertical ? "vertical" : "horizontal"}
      >
        {#each items as item, index}
          <button
            class={twMerge(
              `tab relative flex min-w-fit shrink-0 items-center justify-center gap-2 border-0 bg-transparent py-3 text-[14px]
               transition-colors duration-150 ${vertical ? "@md:justify-start @md:px-4 @md:py-2.5" : ""} ${isCol && items.find((item) => item.icon) ? "h-20 flex-col" : ""}
               ${
                 index === activeTab
                   ? `cursor-pointer font-semibold shadow-[inset_0_-2px_0_var(--accent-text)] ${vertical ? "@md:shadow-[inset_-2px_0_0_var(--accent-text)]" : ""} ${accent ? "text-(--accent-text)" : "text-(--font-color)"}`
                   : item.disabled
                     ? "cursor-not-allowed font-medium text-(--faint-color)"
                     : "cursor-pointer font-medium text-(--muted-color) hover:text-(--font-color)"
               }`,
              item.class,
            )}
            disabled={item.disabled}
            onclick={() => {
              activeTab = index
              if (item.onClick) item.onClick()
            }}
            aria-selected={index === activeTab}
            role="tab"
          >
            <Icon icon={item?.icon} class="flex size-[18px] items-center justify-center overflow-visible [&_svg]:h-full [&_svg]:w-full" />
            {#if item?.name}
              <span class="whitespace-nowrap">{item.name}</span>
            {/if}
          </button>
        {/each}
      </div>
    </div>

    <!-- Контент вкладки - overflow-x-hidden явно рядом с overflow-y-auto: у некоторых потребителей (например, кнопка отправки формы логина в DevCloud) есть элемент с col-start-2 при единственной явной колонке - он намеренно живёт в неявно создаваемой второй колонке грида. Без overflow-x-hidden спека CSS трактует это как реальное горизонтальное переполнение (раз overflow-y уже не visible, ось X тоже становится auto) и рисует паразитный горизонтальный скролл на пару px. -->
    <div
      class="grid w-full min-w-0 min-h-0 flex-1 gap-3 overflow-x-hidden overflow-y-auto bg-(--back-color) p-4"
      style="grid-template-columns: repeat({size.width || 1}, minmax(0, 1fr)); grid-template-rows: repeat({size.height || 1}, auto);"
    >
      {#if Content}
        <!-- Содержимое вкладки целиком (GUIRenderer: своя раскладка, на телефоне - по группам): во всю ширину сетки вкладки -->
        <div class="min-w-0" style="grid-column: 1 / -1; grid-row: 1 / -1">
          {@render Content((apiArray ?? []).filter((c) => tabOfComponent(c.id) === `${activeTab}`))}
        </div>
      {:else if Components}
        {#each (apiArray ?? []).filter((c) => tabOfComponent(c.id) === `${activeTab}`) as comp}
          {@render Components(comp, false)}
        {/each}
      {:else if children}
        {@render children(items[activeTab])}
      {:else}
        {@render items[activeTab]?.children?.()}
      {/if}
    </div>
  </div>
</div>
