<script lang="ts">
  import { TabsProps, type ITabsProps, type UIComponent } from '$lib'
  import ComponentExample from '$lib/ComponentExample.svelte'
  import Tabs from '$lib/Tabs/Tabs.svelte'
  import { formatObjectToString } from '../../common'

  let tabsComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: 'Tabs',
    properties: {
      id: crypto.randomUUID(),
      wrapperClass: 'justify-start bg-blue ',
      size: {
        height: 1,
        width: 1,
      },
      items: [
        { name: 'Tab 1', class: ' flex-row' },
        { name: 'Tab 2', class: ' flex-row' },
        { name: 'Tab 3', class: ' flex-row' },
      ],
    },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: '',
  })

  let codeText = $derived(`
<UI.Tabs
${formatObjectToString(tabsComponent.properties as ITabsProps)} 
  onClick={() => {}}
/>`)

  const updateComponent = (updates: Partial<{ properties: Partial<UIComponent['properties']> }>) => {
    tabsComponent = {
      ...tabsComponent,
      properties: updates.properties ? { ...tabsComponent.properties, ...updates.properties } : tabsComponent.properties,
    }
  }
</script>

<ComponentExample {codeText}>
  {#snippet component()}
    <Tabs {...tabsComponent.properties as ITabsProps} />
  {/snippet}
  {#snippet componentProps()}
    <TabsProps
      component={tabsComponent as UIComponent & { properties: Partial<ITabsProps> }}
      onPropertyChange={(value) => updateComponent({ properties: value } as object)}
      forConstructor={false}
    />
  {/snippet}
</ComponentExample>
