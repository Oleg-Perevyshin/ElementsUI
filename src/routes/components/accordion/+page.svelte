<script lang="ts">
  import { Accordion } from '$lib'
  import AccordionProps from '$lib/Accordion/AccordionProps.svelte'
  import type { IAccordionProps, Position, UIComponent } from '$lib/types'
  import { formatObjectToString } from '../../common'
  import ComponentExample from '$lib/ComponentExample.svelte'

  let accordionComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: 'Accordion',
    access: 'full',
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

  $effect(() => console.log(accordionComponent))

  let codeText = $derived(`
<UI.Accordion
${formatObjectToString(accordionComponent.properties as IAccordionProps)} 
>
  <h1>Содержимое компонента</h1>
  <h1>Содержимое компонента</h1>
</UI.Accordion>`)

  let isPropsCollapsed = $state(false)

  const updateComponent = (
    updates: Partial<{
      name: string
      access: 'full' | 'viewOnly' | 'hidden'
      properties: Partial<UIComponent['properties']>
    }>,
  ) => {
    accordionComponent = {
      ...accordionComponent,
      access: updates.access ?? accordionComponent.access,
      name: updates.name ?? accordionComponent.name,
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
      onPropertyChange={(value, name, access) => updateComponent({ access, name, properties: value } as object)}
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
