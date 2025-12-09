<script lang="ts">
  import { Button, Input, Select, TabsProps, type ITabsProps, type UIComponent } from '$lib'
  import ComponentExample from '$lib/ComponentExample.svelte'
  import Modal from '$lib/Modal.svelte'
  import Tabs from '$lib/Tabs/Tabs.svelte'
  import { updateComponent } from '$lib/types'
  import { formatObjectToString } from '../../common'

  let tabsComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: 'Tabs',
    access: 'full',
    properties: {
      id: crypto.randomUUID(),
      wrapperClass: ' bg-blue ',
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
</script>

<ComponentExample {codeText}>
  {#snippet component()}
    <div class="h-60">
      <Tabs {...tabsComponent.properties as ITabsProps} />
    </div>
  {/snippet}
  {#snippet componentProps()}
    <TabsProps
      component={tabsComponent as UIComponent & { properties: Partial<ITabsProps> }}
      onPropertyChange={(updates) => (tabsComponent = updateComponent(tabsComponent, updates as object))}
      forConstructor={false}
    />
    <!-- <hr />
    <TabsProps
      component={tabsComponent as UIComponent & { properties: Partial<ITabsProps> }}
      onPropertyChange={(updates) => (tabsComponent = updateComponent(tabsComponent, updates as object))}
      
    /> -->
  {/snippet}
</ComponentExample>
