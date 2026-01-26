<script lang="ts">
  import { Accordion } from "$lib"
  import AccordionProps from "$lib/Accordion/AccordionProps.svelte"
  import { updateComponent, type IAccordionProps, type Position, type UIComponent } from "$lib/types"
  import { formatObjectToString } from "../../common"
  import ComponentExample from "$lib/ComponentExample.svelte"

  let accordionComponent: UIComponent = $state({
    id: crypto.randomUUID(),
    type: "Accordion",
    access: "full",
    properties: {
      id: crypto.randomUUID(),
      isOpen: true,
      outline: false,
      size: {
        height: 1,
        width: 1,
      },
      label: {
        name: "Accordion",
        class: "justify-start",
      },
    },
    position: { row: 0, col: 0, width: 0, height: 0 },
    parentId: "",
  })

  let codeText = $derived(`
<UI.Accordion
${formatObjectToString(accordionComponent.properties as IAccordionProps)} 
>
  <h1>Содержимое компонента</h1>
  <h1>Содержимое компонента</h1>
  <h1>Содержимое компонента</h1>
</UI.Accordion>`)
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
      onPropertyChange={(updates) => (accordionComponent = updateComponent(accordionComponent, updates as object))}
      forConstructor={false}
    />
    <!-- <hr />
    <AccordionProps
      component={accordionComponent as UIComponent & { properties: Partial<IAccordionProps> }}
      onPropertyChange={(updates) => (accordionComponent = updateComponent(accordionComponent, updates as object))}
    /> -->
  {/snippet}
</ComponentExample>
