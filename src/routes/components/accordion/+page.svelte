<script lang="ts">
  import { Accordion } from '$lib'
  import AccordionProps from '$lib/Accordion/AccordionProps.svelte'
  import Button from '$lib/Button/Button.svelte'
  import CopyButton from '$lib/libIcons/CopyButton.svelte'
  import type { IAccordionProps, Position, UIComponent } from '$lib/types'
  import { fade, fly, slide } from 'svelte/transition'
  import { formatObjectToString } from '../../common'
  import ComponentExample from '$lib/ComponentExample.svelte'

  let accordionComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: 'Accordion',
    properties: {
      id: crypto.randomUUID(),
      isOpen: true,
      outline: false,
      size: {
        height: 1,
        width: 1,
      },
      label: {
        name: 'Accordion',
      },
    },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: '',
  })

  let codeText = $derived(`
<UI.Accordion
${formatObjectToString(accordionComponent.properties as IAccordionProps)} 
>
  <h1>Содержимое компонента</h1>
  <h1>Содержимое компонента</h1>
</UI.Accordion>`)

  let isPropsCollapsed = $state(false)

  const updateComponent = (updates: Partial<{ position: Partial<Position>; parentId: string; properties: Partial<UIComponent['properties']> }>) => {
    accordionComponent = {
      ...accordionComponent,
      properties: updates.properties ? { ...accordionComponent.properties, ...updates.properties } : accordionComponent.properties,
    }
  }
</script>

<ComponentExample {codeText}>
  {#snippet component()}
    <Accordion {...accordionComponent.properties as IAccordionProps}>
      <div class="flex flex-col">
        <h1>Содержимое компонента</h1>
        <h1>Содержимое компонента</h1>
        <h1>Содержимое компонента</h1>
      </div>
    </Accordion>
  {/snippet}
  {#snippet componentProps()}
    <AccordionProps
      component={accordionComponent as UIComponent & { properties: Partial<IAccordionProps> }}
      onPropertyChange={(value) => updateComponent({ properties: value } as object)}
      forConstructor={true}
    />
    <hr />
    <AccordionProps
      component={accordionComponent as UIComponent & { properties: Partial<IAccordionProps> }}
      onPropertyChange={(value) => updateComponent({ properties: value } as object)}
      forConstructor={false}
    />
  {/snippet}
</ComponentExample>
