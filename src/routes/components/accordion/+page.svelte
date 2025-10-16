<script lang="ts">
  import { Accordion } from '$lib'
  import AccordionProps from '$lib/Accordion/AccordionProps.svelte'
  import Button from '$lib/Button/Button.svelte'
  import CopyButton from '$lib/libIcons/CopyButton.svelte'
  import type { IAccordionProps, Position, UIComponent } from '$lib/types'
  import { formatObjectToString } from '../../common'

  let accordionComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: 'Accordion',
    component: null,
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

  const updateComponent = (updates: Partial<{ position: Partial<Position>; parentId: string; properties: Partial<UIComponent['properties']> }>) => {
    accordionComponent = {
      ...accordionComponent,
      properties: updates.properties ? { ...accordionComponent.properties, ...updates.properties } : accordionComponent.properties,
    }
  }
</script>

<div class="flex h-[calc(100vh-10rem)] flex-col">
  <div class="flex-1 overflow-y-auto py-6">
    <Accordion {...accordionComponent.properties as IAccordionProps}>
      <div class="flex flex-col">
        <h1>Содержимое компонента</h1>
        <h1>Содержимое компонента</h1>
        <h1>Содержимое компонента</h1>
        <h1>Содержимое компонента</h1>
        <h1>Содержимое компонента</h1>
        <h1>Содержимое компонента</h1>
        <h1>Содержимое компонента</h1>
        <h1>Содержимое компонента</h1>
        <h1>Содержимое компонента</h1>
        <h1>Содержимое компонента</h1>
        <h1>Содержимое компонента</h1>
        <h1>Содержимое компонента</h1>
        <h1>Содержимое компонента</h1>
        <h1>Содержимое компонента</h1>
      </div>
    </Accordion>
  </div>
  <hr class="text-gray-600" />
  <div>
    <AccordionProps
      component={accordionComponent as UIComponent & { properties: Partial<IAccordionProps> }}
      onPropertyChange={(value) => updateComponent({ properties: value } as object)}
      forConstructor={false}
    />
  </div>
  <div class="relative">
    <Button wrapperClass="absolute top-3 right-5 w-6" content={{ icon: CopyButton }} onClick={() => navigator.clipboard.writeText(codeText)} />
    <pre class="overflow-x-auto">{codeText}
  </pre>
  </div>
</div>
