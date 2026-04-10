<script lang="ts">
  import { TabsProps, type ITabsProps, type UIComponent } from "$lib"
  import ComponentExample from "$lib/ComponentExample.svelte"
  import IconGripVerticalLeft from "$lib/libIcons/IconGripVerticalLeft.svelte"
  import IconGripVerticalRight from "$lib/libIcons/IconGripVerticalRight.svelte"
  import Tabs from "$lib/Tabs/Tabs.svelte"
  import { updateComponent } from "$lib/types"
  import IconGripHorizontalDown from "../../../appIcons/IconGripHorizontalDown.svelte"
  import IconGripHorizontalUp from "../../../appIcons/IconGripHorizontalUp.svelte"
  import { formatObjectToString } from "../../common"

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
</ComponentExample>

{#snippet Tab(item: { name: string })}
  <div>
    <h5>Content of {item.name}</h5>
  </div>
{/snippet}
