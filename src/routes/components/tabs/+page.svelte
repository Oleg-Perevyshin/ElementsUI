<script lang="ts">
  import { Table, TabsProps, type ITabsProps, type UIComponent } from "$lib"
  import ComponentExample from "$lib/ComponentExample.svelte"
  import IconGripVerticalLeft from "$lib/libIcons/IconGripVerticalLeft.svelte"
  import IconGripVerticalRight from "$lib/libIcons/IconGripVerticalRight.svelte"
  import Tabs from "$lib/Tabs/Tabs.svelte"
  import { updateComponent } from "$lib/types"
  import IconGripHorizontalDown from "../../../appIcons/IconGripHorizontalDown.svelte"
  import IconGripHorizontalUp from "../../../appIcons/IconGripHorizontalUp.svelte"
  import { formatObjectToString, TableColumns } from "../../common"

  let tabsComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: "Tabs",
    access: "full",
    properties: {
      id: crypto.randomUUID(),
      wrapperClass: "bg-blue",
      size: {
        height: 1,
        width: 1,
      },
      items: [
        { name: "Tab 1", class: "flex-row" },
        { name: "Tab 2", class: "flex-row", disabled: true },
        { name: "Tab 3", class: "flex-row" },
      ],
    },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: "",
  })

  let forConstructor = $state(false)

  let codeText = $derived(`
<UI.Tabs
${formatObjectToString(tabsComponent.properties as ITabsProps)} 
  onClick={() => {}}
/>`)

  const rows = [
    {
      name: "id",
      type: "string",
      default: "crypto.randomUUID()",
      description: "Уникальный идентификатор компонента",
    },
    {
      name: "wrapperClass",
      type: "string",
      default: '"bg-blue"',
      description:
        "Дополнительные CSS-классы для контейнера вкладок: влияет на фон и стилизацию активной вкладки (автоматически подбирается контрастный цвет текста)",
    },
    {
      name: "size",
      type: "{ width?: number; height?: number }",
      default: "{ width: 12, height: 6 }",
      description:
        "Размеры сетки контента: `width` — количество колонок, `height` — количество строк для автоматического размещения элементов внутри активной вкладки",
    },
    {
      name: "activeTab",
      type: "number",
      default: "0",
      description: "Индекс активной вкладки: управляет отображаемым контентом; изменение значения переключает вкладку программно",
    },
    {
      name: "items",
      type: "{ name?: string; icon?: ConstructorOfATypedSvelteComponent | string; class?: string; disabled?: boolean; onClick?: () => void; children?: () => void }[]",
      default: '[{ name: "tab 1", icon: "", class: "" }, { name: "tab 2", icon: "", class: "" }]',
      description:
        "Массив вкладок: `name` — текст заголовка, `icon` — иконка (SVG-строка или Svelte-компонент), `class` — доп. стили (поддерживает `flex-col` для вертикальной компоновки), `disabled` — блокировка вкладки, `onClick` — callback при клике, `children` — слот контента конкретной вкладки",
    },
    {
      name: "children",
      type: "Snippet<(item: { name?: string; icon?: string; class?: string }) => void>",
      default: "undefined",
      description: "Слот для динамического рендеринга контента: передаёт объект текущей активной вкладки (`items[currentTabIndex]`) для условного отображения",
    },
    {
      name: "apiArray",
      type: "{ id: string; [key: string]: any }[]",
      default: "[]",
      description:
        'Массив конфигураций для API-рендеринга: каждый элемент содержит `id` (оканчивающийся на индекс вкладки, например `"comp-0"`) и параметры для передачи в `Components`',
    },
    {
      name: "Components",
      type: "(config: any, isActive: boolean) => void",
      default: "undefined",
      description:
        "Функция-рендерер для динамических компонентов: принимает конфигурацию из `apiArray` и флаг активности, возвращает Svelte-компонент для вставки в контентную область",
    },
  ]
</script>

<ComponentExample {codeText} bind:forConstructor>
  {#snippet component()}
    <div class="h-60">
      <Tabs {...tabsComponent.properties as ITabsProps} />
    </div>
  {/snippet}
  {#snippet componentProps()}
    <TabsProps
      component={tabsComponent as UIComponent & { properties: Partial<ITabsProps> }}
      onPropertyChange={(updates) => (tabsComponent = updateComponent(tabsComponent, updates as object))}
      {forConstructor}
    />
  {/snippet}
  {#snippet examples()}
    <div class="flex flex-col gap-5">
      <Tabs items={[{ name: "Tab1" }, { name: "Tab2" }, { name: "Tab3" }, { name: "Tab4" }]} children={Tab} size={{ height: 1, width: 1 }} />
      <Tabs
        items={[
          { name: "Tab1", class: "w-1/4" },
          { name: "Tab2", class: "w-1/4" },
          { name: "Tab3", class: "w-1/4" },
          { name: "Tab4", class: "w-1/4" },
        ]}
        children={Tab}
        size={{ height: 1, width: 1 }}
      />

      <Tabs
        items={[
          { name: "Tab1", icon: IconGripHorizontalUp, class: "flex-col" },
          { name: "Tab2", icon: IconGripVerticalRight, class: "flex-row-reverse" },
          { name: "Tab3", icon: IconGripHorizontalDown, class: "flex-col-reverse" },
          { name: "Tab4", icon: IconGripVerticalLeft, class: "" },
        ]}
        children={Tab}
        size={{ height: 1, width: 1 }}
      />
    </div>
  {/snippet}
  {#snippet props()}
    <Table header={TableColumns} body={rows} outline />
  {/snippet}
</ComponentExample>

{#snippet Tab(item: { name: string })}
  <div>
    <h5>Content of {item.name}</h5>
  </div>
{/snippet}
