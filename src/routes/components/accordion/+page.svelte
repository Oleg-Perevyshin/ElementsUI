<script lang="ts">
  import { Accordion } from '$lib'
  import AccordionProps from '$lib/Accordion/AccordionProps.svelte'
  import Button from '$lib/Button/Button.svelte'
  import CopyButton from '$lib/libIcons/CopyButton.svelte'
  import type { IAccordionProps, Position, UIComponent } from '$lib/types'
  import { fade, fly, slide } from 'svelte/transition'
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

  let isPropsCollapsed = $state(false)

  const updateComponent = (updates: Partial<{ position: Partial<Position>; parentId: string; properties: Partial<UIComponent['properties']> }>) => {
    accordionComponent = {
      ...accordionComponent,
      properties: updates.properties ? { ...accordionComponent.properties, ...updates.properties } : accordionComponent.properties,
    }
  }
</script>

<div class="flex h-[calc(100vh-9rem)] flex-col">
  <div class="flex-1 overflow-y-auto">
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
  <Button
    wrapperClass="h-7 border-t border-gray-500"
    content={{
      icon: isPropsCollapsed
        ? '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" transform="rotate(270,0,0)"><path fill="currentColor" d="M12.6 12L8.7 8.1q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l4.6 4.6q.15.15.213.325t.062.375t-.062.375t-.213.325l-4.6 4.6q-.275.275-.7.275t-.7-.275t-.275-.7t.275-.7z"/></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" transform="rotate(90,0,0)"><path fill="currentColor" d="M12.6 12L8.7 8.1q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l4.6 4.6q.15.15.213.325t.062.375t-.062.375t-.213.325l-4.6 4.6q-.275.275-.7.275t-.7-.275t-.275-.7t.275-.7z"/></svg>',
    }}
    onClick={() => {
      isPropsCollapsed = !isPropsCollapsed
    }}
  />
  {#if !isPropsCollapsed}
    <div transition:slide={{ duration: 300 }}>
      <div>
        <AccordionProps
          component={accordionComponent as UIComponent & { properties: Partial<IAccordionProps> }}
          onPropertyChange={(value) => updateComponent({ properties: value } as object)}
          forConstructor={false}
        />
      </div>
      <div class="relative mt-3">
        <Button wrapperClass="absolute top-3 right-5 w-6" content={{ icon: CopyButton }} onClick={() => navigator.clipboard.writeText(codeText)} />
        <pre class="overflow-x-auto">{codeText}
  </pre>
      </div>
    </div>
  {/if}
</div>
