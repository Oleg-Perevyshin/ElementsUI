<script lang="ts">
  import { Button, Input, Select, TabsProps, type ITabsProps, type UIComponent } from '$lib'
  import ComponentExample from '$lib/ComponentExample.svelte'
  import Tabs from '$lib/Tabs/Tabs.svelte'
  import { updateComponent } from '$lib/types'
  import { formatObjectToString } from '../../common'

  let tabsComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: 'Tabs',
    access: 'full',
    properties: {
      id: crypto.randomUUID(),
      wrapperClass: 'justify-start bg-blue ',
      size: {
        height: 100,
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
    <Tabs {...tabsComponent.properties as ITabsProps} children={Tab} />
    {#snippet Tab(item: { name: string })}
      <Input
        label={{ name: 'TargetID', class: '!px-0' }}
        wrapperClass="w-20"
        type="text"
        maxlength={3}
        help={{ regExp: /^(?:[1-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/ }}
      />
      <Input
        label={{ name: 'ReturnID', class: '!px-0' }}
        wrapperClass="w-20"
        type="text"
        maxlength={3}
        help={{ regExp: /^(?:[1-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/ }}
      />
      <Input label={{ name: 'Data', class: '!px-0' }} type="text" />
      <Input
        label={{ name: 'TargetID', class: '!px-0' }}
        wrapperClass="w-20"
        type="text"
        maxlength={3}
        help={{ regExp: /^(?:[1-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/ }}
      />
      <Input
        label={{ name: 'ReturnID', class: '!px-0' }}
        wrapperClass="w-20"
        type="text"
        maxlength={3}
        help={{ regExp: /^(?:[1-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/ }}
      />
      <Input label={{ name: 'Data', class: '!px-0' }} type="text" />
      <Input
        label={{ name: 'TargetID', class: '!px-0' }}
        wrapperClass="w-20"
        type="text"
        maxlength={3}
        help={{ regExp: /^(?:[1-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/ }}
      />
      <Input
        label={{ name: 'ReturnID', class: '!px-0' }}
        wrapperClass="w-20"
        type="text"
        maxlength={3}
        help={{ regExp: /^(?:[1-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/ }}
      />
      <Input label={{ name: 'Data', class: '!px-0' }} type="text" />
      <Input
        label={{ name: 'TargetID', class: '!px-0' }}
        wrapperClass="w-20"
        type="text"
        maxlength={3}
        help={{ regExp: /^(?:[1-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/ }}
      />
      <Input
        label={{ name: 'ReturnID', class: '!px-0' }}
        wrapperClass="w-20"
        type="text"
        maxlength={3}
        help={{ regExp: /^(?:[1-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/ }}
      />
      <Input label={{ name: 'Data', class: '!px-0' }} type="text" />
      <Input
        label={{ name: 'TargetID', class: '!px-0' }}
        wrapperClass="w-20"
        type="text"
        maxlength={3}
        help={{ regExp: /^(?:[1-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/ }}
      />
      <Input
        label={{ name: 'ReturnID', class: '!px-0' }}
        wrapperClass="w-20"
        type="text"
        maxlength={3}
        help={{ regExp: /^(?:[1-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/ }}
      />
      <Input label={{ name: 'Data', class: '!px-0' }} type="text" />
    {/snippet}
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
